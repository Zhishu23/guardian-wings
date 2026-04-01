'use strict'

const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
  const { action, params = {} } = event

  switch (action) {
    case 'getReportList':    return await getReportList(params)
    case 'handleReport':     return await handleReport(params)
    case 'createTask':       return await createTask(params)
    case 'getTaskList':      return await getTaskList(params)
    case 'getTaskDetail':    return await getTaskDetail(params)
    case 'updateTaskStatus': return await updateTaskStatus(params)
    case 'recordEvent':      return await recordEvent(params)
    case 'getEventList':     return await getEventList(params)
    case 'getDashboard':     return await getDashboard(params)
    default:
      return { code: 404, msg: `未知 action: ${action}` }
  }
}

// ─────────────────────────────────────────────
// 1. 获取举报列表
// ─────────────────────────────────────────────
async function getReportList(params) {
  const { status, type, page = 1, pageSize = 15 } = params

  try {
    let whereClause = {}
    if (status !== undefined && status !== -1) whereClause.status = status
    if (type && type !== 'all') whereClause.type = type

    const countRes = await db.collection('reports').where(whereClause).count()
    const total = countRes.total

    // 注意：不使用 .field()，避免本地调试环境 bug
    const listRes = await db.collection('reports')
      .where(whereClause)
      .orderBy('create_time', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    // 在 JS 里手动过滤需要的字段，避免敏感信息泄露
    const list = listRes.data.map(item => ({
      _id:         item._id,
      user_id:     item.user_id,
      type:        item.type,
      location:    item.location,
      time:        item.time,
      description: item.description,
      images:      item.images,
      status:      item.status,
      remark:      item.remark,
      handler_id:  item.handler_id,
      create_time: item.create_time,
      update_time: item.update_time
    }))

    return {
      code: 0,
      data: { list, total, page, pageSize, hasMore: page * pageSize < total }
    }
  } catch (e) {
    console.error('getReportList error:', e)
    return { code: 500, msg: '获取举报列表失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 2. 处理举报
// ─────────────────────────────────────────────
async function handleReport(params) {
  const { reportId, status, remark = '', handler_id } = params

  if (!reportId)               return { code: 400, msg: '缺少 reportId' }
  if (status === undefined)    return { code: 400, msg: '缺少 status' }
  if (![1, 2].includes(status)) return { code: 400, msg: 'status 只能为 1(已处理) 或 2(已驳回)' }
  if (!remark.trim())          return { code: 400, msg: '请填写处理意见' }

  try {
    const reportRes = await db.collection('reports').doc(reportId).get()
    if (!reportRes.data || reportRes.data.length === 0) {
      return { code: 404, msg: '举报记录不存在' }
    }
    if (reportRes.data[0].status !== 0) {
      return { code: 400, msg: '该举报已被处理' }
    }

    await db.collection('reports').doc(reportId).update({
      status,
      remark,
      handler_id:  handler_id || '',
      update_time: Date.now()
    })

    return { code: 0, msg: status === 1 ? '已标记为已处理' : '已驳回举报' }
  } catch (e) {
    console.error('handleReport error:', e)
    return { code: 500, msg: '处理失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 3. 创建任务
// ─────────────────────────────────────────────
async function createTask(params) {
  const {
    title, description, assignee_id, assignee_name,
    priority = 'normal', due_date, report_id = '',
    creator_id, creator_name
  } = params

  if (!title)       return { code: 400, msg: '请填写任务标题' }
  if (!assignee_id) return { code: 400, msg: '请选择被分配人' }
  if (!creator_id)  return { code: 400, msg: '缺少创建者信息' }

  try {
    const taskData = {
      title,
      description:   description  || '',
      assignee_id,
      assignee_name: assignee_name || '',
      creator_id,
      creator_name:  creator_name  || '',
      priority,
      status:        0,
      due_date:      due_date || null,
      report_id,
      create_time:   Date.now(),
      update_time:   Date.now()
    }

    const res = await db.collection('tasks').add(taskData)
    return { code: 0, msg: '任务创建成功', data: { taskId: res.id } }
  } catch (e) {
    console.error('createTask error:', e)
    return { code: 500, msg: '创建任务失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 4. 获取任务列表（已删除 .field()）
// ─────────────────────────────────────────────
async function getTaskList(params) {
  const { assignee_id, creator_id, status, priority, page = 1, pageSize = 15 } = params

  try {
    let whereClause = {}
    if (assignee_id) whereClause.assignee_id = assignee_id
    if (creator_id)  whereClause.creator_id  = creator_id
    if (status !== undefined && status !== -1) whereClause.status = status
    if (priority && priority !== 'all')        whereClause.priority = priority

    const countRes = await db.collection('tasks').where(whereClause).count()
    const total = countRes.total

    // 删除 .field() 调用，改为 JS 过滤
    const listRes = await db.collection('tasks')
      .where(whereClause)
      .orderBy('create_time', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    const list = listRes.data.map(item => ({
      _id:           item._id,
      title:         item.title,
      description:   item.description,
      assignee_id:   item.assignee_id,
      assignee_name: item.assignee_name,
      creator_name:  item.creator_name,
      priority:      item.priority,
      status:        item.status,
      due_date:      item.due_date,
      report_id:     item.report_id,
      create_time:   item.create_time,
      update_time:   item.update_time
    }))

    return {
      code: 0,
      data: { list, total, page, pageSize, hasMore: page * pageSize < total }
    }
  } catch (e) {
    console.error('getTaskList error:', e)
    return { code: 500, msg: '获取任务列表失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 5. 获取任务详情
// ─────────────────────────────────────────────
async function getTaskDetail(params) {
  const { taskId } = params
  if (!taskId) return { code: 400, msg: '缺少 taskId' }

  try {
    const res = await db.collection('tasks').doc(taskId).get()
    if (!res.data || res.data.length === 0) {
      return { code: 404, msg: '任务不存在' }
    }
    return { code: 0, data: res.data[0] }
  } catch (e) {
    console.error('getTaskDetail error:', e)
    return { code: 500, msg: '获取详情失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 6. 更新任务状态
// ─────────────────────────────────────────────
async function updateTaskStatus(params) {
  const { taskId, status, note = '' } = params

  if (!taskId)              return { code: 400, msg: '缺少 taskId' }
  if (status === undefined) return { code: 400, msg: '缺少 status' }
  if (![0, 1, 2, 3].includes(status)) return { code: 400, msg: 'status 无效' }

  try {
    await db.collection('tasks').doc(taskId).update({
      status,
      note,
      update_time: Date.now()
    })
    const labels = ['待处理', '进行中', '已完成', '已关闭']
    return { code: 0, msg: `任务已更新为：${labels[status]}` }
  } catch (e) {
    console.error('updateTaskStatus error:', e)
    return { code: 500, msg: '更新失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 7. 记录事件
// ─────────────────────────────────────────────
async function recordEvent(params) {
  const {
    officer_id, officer_name, type, title,
    description, location, images = [],
    report_id = '', task_id = ''
  } = params

  if (!officer_id)  return { code: 400, msg: '缺少警员信息' }
  if (!type)        return { code: 400, msg: '请选择事件类型' }
  if (!title)       return { code: 400, msg: '请填写事件标题' }
  if (!description) return { code: 400, msg: '请填写事件描述' }

  try {
    const eventData = {
      officer_id,
      officer_name:  officer_name || '',
      type,
      title,
      description,
      location:      location || {},
      images,
      report_id,
      task_id,
      create_time:   Date.now()
    }

    const res = await db.collection('events').add(eventData)
    return { code: 0, msg: '事件记录成功', data: { eventId: res.id } }
  } catch (e) {
    console.error('recordEvent error:', e)
    return { code: 500, msg: '记录失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 8. 获取事件列表（已删除 .field()）
// ─────────────────────────────────────────────
async function getEventList(params) {
  const { officer_id, type, page = 1, pageSize = 15 } = params

  try {
    let whereClause = {}
    if (officer_id) whereClause.officer_id = officer_id
    if (type && type !== 'all') whereClause.type = type

    const countRes = await db.collection('events').where(whereClause).count()
    const total = countRes.total

    // 删除 .field() 调用，改为 JS 过滤
    const listRes = await db.collection('events')
      .where(whereClause)
      .orderBy('create_time', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    const list = listRes.data.map(item => ({
      _id:          item._id,
      officer_name: item.officer_name,
      type:         item.type,
      title:        item.title,
      description:  item.description,
      location:     item.location,
      images:       item.images,
      report_id:    item.report_id,
      task_id:      item.task_id,
      create_time:  item.create_time
    }))

    return {
      code: 0,
      data: { list, total, page, pageSize, hasMore: page * pageSize < total }
    }
  } catch (e) {
    console.error('getEventList error:', e)
    return { code: 500, msg: '获取事件列表失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 9. 工作台数据汇总（Dashboard）
// 修复：officer_id 取自 params，与登录存储字段对齐
// ─────────────────────────────────────────────
async function getDashboard(params) {
  // 兼容两种传参方式：officer_id（旧）或 uid（新）
  const officer_id = params.officer_id || params.uid
  if (!officer_id) return { code: 400, msg: '缺少警员信息' }

  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [
      pendingReports,
      myPendingTasks,
      myOngoingTasks,
      myCompletedTasks,
      todayEvents
    ] = await Promise.all([
      db.collection('reports').where({ status: 0 }).count(),
      db.collection('tasks').where({ assignee_id: officer_id, status: 0 }).count(),
      db.collection('tasks').where({ assignee_id: officer_id, status: 1 }).count(),
      db.collection('tasks').where({ assignee_id: officer_id, status: 2 }).count(),
      db.collection('events').where({
        officer_id,
        create_time: dbCmd.gte(todayStart.getTime())
      }).count()
    ])

    return {
      code: 0,
      data: {
        pendingReports:   pendingReports.total,
        myPendingTasks:   myPendingTasks.total,
        myOngoingTasks:   myOngoingTasks.total,
        completedTasks:   myCompletedTasks.total,
        todayEvents:      todayEvents.total
      }
    }
  } catch (e) {
    console.error('getDashboard error:', e)
    return { code: 500, msg: '获取汇总数据失败', error: e.message }
  }
}