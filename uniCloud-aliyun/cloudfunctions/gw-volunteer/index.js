'use strict'

const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
  const { action, params = {} } = event

  switch (action) {
    case 'getActivityList':   return await getActivityList(params)
    case 'getActivityDetail': return await getActivityDetail(params)
    case 'joinActivity':      return await joinActivity(params)
    case 'quitActivity':      return await quitActivity(params)
    case 'getMyActivities':   return await getMyActivities(params)
    default:
      return { code: 404, msg: `未知 action: ${action}` }
  }
}

// ─────────────────────────────────────────────
// 1. 获取活动列表（分页 + 状态筛选）
// ─────────────────────────────────────────────
async function getActivityList(params) {
  const { page = 1, pageSize = 10, status: statusFilter } = params
  // statusFilter: 'upcoming'=未开始 'ongoing'=进行中 'ended'=已结束 不传=全部

  try {
    const now = Date.now()
    let whereClause = {}

    if (statusFilter === 'upcoming') {
      whereClause.startTime = dbCmd.gt(now)
    } else if (statusFilter === 'ongoing') {
      whereClause.startTime = dbCmd.lte(now)
      whereClause.endTime   = dbCmd.gte(now)
    } else if (statusFilter === 'ended') {
      whereClause.endTime = dbCmd.lt(now)
    }

    const countRes = await db.collection('volunteer_activities')
      .where(whereClause).count()
    const total = countRes.total

    const listRes = await db.collection('volunteer_activities')
      .where(whereClause)
      .orderBy('startTime', 'asc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      
      .get()

    // 给每条活动附加状态标签
    const list = listRes.data.map(item => ({
      ...item,
      activityStatus: getActivityStatus(item.startTime, item.endTime),
      isFull: item.currentParticipants >= item.maxParticipants
    }))

    return {
      code: 0,
      data: {
        list,
        total,
        page,
        pageSize,
        hasMore: page * pageSize < total
      }
    }
  } catch (e) {
    console.error('getActivityList error:', e)
    return { code: 500, msg: '获取活动列表失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 2. 获取活动详情
// ─────────────────────────────────────────────
async function getActivityDetail(params) {
  const { activityId, userId } = params

  if (!activityId) return { code: 400, msg: '缺少 activityId' }

  try {
    const res = await db.collection('volunteer_activities').doc(activityId).get()

    if (!res.data || res.data.length === 0) {
      return { code: 404, msg: '活动不存在' }
    }

    const activity = res.data[0]
    let isJoined = false

    // 若传入 userId，查询当前用户是否已报名
    if (userId) {
      const joinRes = await db.collection('user_activities')
        .where({ user_id: userId, activity_id: activityId, status: dbCmd.neq('quit') })
        .limit(1).get()
      isJoined = joinRes.data && joinRes.data.length > 0
    }

    return {
      code: 0,
      data: {
        ...activity,
        activityStatus: getActivityStatus(activity.startTime, activity.endTime),
        isFull:   activity.currentParticipants >= activity.maxParticipants,
        isJoined
      }
    }
  } catch (e) {
    console.error('getActivityDetail error:', e)
    return { code: 500, msg: '获取详情失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 3. 报名参加活动
// ─────────────────────────────────────────────
async function joinActivity(params) {
  const { userId, activityId } = params

  if (!userId)     return { code: 400, msg: '用户未登录' }
  if (!activityId) return { code: 400, msg: '缺少 activityId' }

  try {
    // 查活动是否存在
    const actRes = await db.collection('volunteer_activities').doc(activityId).get()
    if (!actRes.data || actRes.data.length === 0) {
      return { code: 404, msg: '活动不存在' }
    }

    const activity = actRes.data[0]
    const now = Date.now()

    // 活动已结束
    if (activity.endTime < now) {
      return { code: 400, msg: '活动已结束，无法报名' }
    }

    // 名额已满
    if (activity.currentParticipants >= activity.maxParticipants) {
      return { code: 400, msg: '活动名额已满' }
    }

    // 防止重复报名（排除已退出状态）
    const existRes = await db.collection('user_activities')
      .where({ user_id: userId, activity_id: activityId, status: dbCmd.neq('quit') })
      .limit(1).get()
    if (existRes.data && existRes.data.length > 0) {
      return { code: 400, msg: '您已报名此活动' }
    }

    // 写入报名记录
    await db.collection('user_activities').add({
      user_id:     userId,
      activity_id: activityId,
      status:      'joined',
      join_time:   Date.now()
    })

    // 活动人数 +1
    await db.collection('volunteer_activities').doc(activityId).update({
      currentParticipants: dbCmd.inc(1)
    })

    // 参与活动积分 +20
    await db.collection('uni-id-users').doc(userId).update({
      points: dbCmd.inc(20)
    })

    return { code: 0, msg: '报名成功' }
  } catch (e) {
    console.error('joinActivity error:', e)
    return { code: 500, msg: '报名失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 4. 退出活动
// ─────────────────────────────────────────────
async function quitActivity(params) {
  const { userId, activityId } = params

  if (!userId)     return { code: 400, msg: '用户未登录' }
  if (!activityId) return { code: 400, msg: '缺少 activityId' }

  try {
    // 查找报名记录
    const joinRes = await db.collection('user_activities')
      .where({ user_id: userId, activity_id: activityId, status: 'joined' })
      .limit(1).get()

    if (!joinRes.data || joinRes.data.length === 0) {
      return { code: 400, msg: '您未报名此活动' }
    }

    const record = joinRes.data[0]

    // 活动开始后不允许退出
    const actRes = await db.collection('volunteer_activities').doc(activityId).get()
    if (actRes.data && actRes.data[0] && actRes.data[0].startTime <= Date.now()) {
      return { code: 400, msg: '活动已开始，无法退出' }
    }

    // 更新报名状态为已退出
    await db.collection('user_activities').doc(record._id).update({
      status:    'quit',
      quit_time: Date.now()
    })

    // 活动人数 -1（不低于0）
    await db.collection('volunteer_activities').doc(activityId).update({
      currentParticipants: dbCmd.inc(-1)
    })

    // 扣除报名积分
    await db.collection('uni-id-users').doc(userId).update({
      points: dbCmd.inc(-20)
    })

    return { code: 0, msg: '已退出活动' }
  } catch (e) {
    console.error('quitActivity error:', e)
    return { code: 500, msg: '退出失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 5. 我的活动记录
// ─────────────────────────────────────────────
async function getMyActivities(params) {
  const { userId, statusFilter, page = 1, pageSize = 10 } = params
  // statusFilter: 'joined' | 'quit' | 不传=全部

  if (!userId) return { code: 400, msg: '用户未登录' }

  try {
    let whereClause = { user_id: userId }
    if (statusFilter) {
      whereClause.status = statusFilter
    }

    const countRes = await db.collection('user_activities').where(whereClause).count()
    const total = countRes.total

    const myRes = await db.collection('user_activities')
      .where(whereClause)
      .orderBy('join_time', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      
      .get()

    if (!myRes.data || myRes.data.length === 0) {
      return { code: 0, data: { list: [], total: 0, hasMore: false } }
    }

    // 批量查询活动详情
    const activityIds = myRes.data.map(item => item.activity_id)
    const actRes = await db.collection('volunteer_activities')
      .where({ _id: dbCmd.in(activityIds) })
      
      .get()

    const actMap = {}
    actRes.data.forEach(act => { actMap[act._id] = act })

    const list = myRes.data.map(record => ({
      recordId:   record._id,
      joinStatus: record.status,
      joinTime:   record.join_time,
      quitTime:   record.quit_time,
      ...( actMap[record.activity_id] || { _id: record.activity_id, title: '活动已删除' } ),
      activityStatus: actMap[record.activity_id]
        ? getActivityStatus(actMap[record.activity_id].startTime, actMap[record.activity_id].endTime)
        : 'unknown'
    }))

    return {
      code: 0,
      data: {
        list,
        total,
        page,
        pageSize,
        hasMore: page * pageSize < total
      }
    }
  } catch (e) {
    console.error('getMyActivities error:', e)
    return { code: 500, msg: '获取记录失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 工具函数：计算活动状态
// ─────────────────────────────────────────────
function getActivityStatus(startTime, endTime) {
  const now = Date.now()
  if (now < startTime)  return 'upcoming'   // 未开始
  if (now <= endTime)   return 'ongoing'    // 进行中
  return 'ended'                            // 已结束
}