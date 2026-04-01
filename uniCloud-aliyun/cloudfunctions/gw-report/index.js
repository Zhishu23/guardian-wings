// uniCloud/cloudfunctions/gw-report/index.js
'use strict'

const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
  const { action, params = {} } = event

  switch (action) {
    case 'submitReport':
      return await submitReport(params)
    case 'getMyReports':
      return await getMyReports(params)
    case 'getReportDetail':
      return await getReportDetail(params)
    case 'updateReportStatus':
      return await updateReportStatus(params)
    case 'getReportStats':
      return await getReportStats(params)
    default:
      return { code: 404, msg: `未知 action: ${action}` }
  }
}

// ─────────────────────────────────────────────
// 1. 提交举报
// ─────────────────────────────────────────────
async function submitReport(params) {
  const { user_id, type, location, time, description, images = [] } = params

  // 参数校验
  if (!user_id)      return { code: 400, msg: '用户未登录' }
  if (!type)         return { code: 400, msg: '请选择举报类型' }
  if (!location)     return { code: 400, msg: '请提供位置信息' }
  if (!description)  return { code: 400, msg: '请填写描述信息' }
  if (description.length < 10) return { code: 400, msg: '描述信息不能少于10个字' }

  const validTypes = ['illegal_hunting', 'habitat_destruction', 'illegal_trade', 'other']
  if (!validTypes.includes(type)) return { code: 400, msg: '举报类型无效' }

  try {
    const reportData = {
      user_id,
      type,
      location: {
        address:   location.address   || '',
        latitude:  location.latitude  || 0,
        longitude: location.longitude || 0,
        name:      location.name      || ''
      },
      time:        time || Date.now(),
      description,
      images,
      status:      0,      // 0=待审核 1=已处理 2=已驳回
      remark:      '',
      handler_id:  '',
      create_time: Date.now(),
      update_time: Date.now()
    }

    const res = await db.collection('reports').add(reportData)

    // 给用户加积分（举报一次 +10 分）
    await db.collection('uni-id-users')
      .doc(user_id)
      .update({ points: dbCmd.inc(10) })

    return { code: 0, msg: '举报提交成功', data: { reportId: res.id } }
  } catch (e) {
    console.error('submitReport error:', e)
    return { code: 500, msg: '提交失败，请重试', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 2. 获取我的举报列表（分页）
// ─────────────────────────────────────────────
async function getMyReports(params) {
  const { user_id, status, page = 1, pageSize = 10 } = params

  if (!user_id) return { code: 400, msg: '用户未登录' }

  try {
    let query = db.collection('reports').where({ user_id })

    // status 筛选：-1 或 undefined 表示全部
    if (status !== undefined && status !== -1) {
      query = db.collection('reports').where({ user_id, status })
    }

    const countRes = await query.count()
    const total = countRes.total

    const listRes = await query
      .orderBy('create_time', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    return {
      code: 0,
      data: {
        list:     listRes.data,
        total,
        page,
        pageSize,
        hasMore:  page * pageSize < total
      }
    }
  } catch (e) {
    console.error('getMyReports error:', e)
    return { code: 500, msg: '获取列表失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 3. 获取举报详情
// ─────────────────────────────────────────────
async function getReportDetail(params) {
  const { reportId, user_id } = params

  if (!reportId) return { code: 400, msg: '缺少 reportId' }

  try {
    const res = await db.collection('reports').doc(reportId).get()

    if (!res.data || res.data.length === 0) {
      return { code: 404, msg: '举报记录不存在' }
    }

    const report = res.data[0]

    // 权限校验：只能查看自己的举报（警务端调用时可不传 user_id 跳过校验）
    if (user_id && report.user_id !== user_id) {
      return { code: 403, msg: '无权查看此举报' }
    }

    return { code: 0, data: report }
  } catch (e) {
    console.error('getReportDetail error:', e)
    return { code: 500, msg: '获取详情失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 4. 更新举报状态（警务端使用）
// ─────────────────────────────────────────────
async function updateReportStatus(params) {
  const { reportId, status, remark = '', handler_id } = params

  if (!reportId)             return { code: 400, msg: '缺少 reportId' }
  if (status === undefined)  return { code: 400, msg: '缺少 status' }
  if (![1, 2].includes(status)) return { code: 400, msg: 'status 只能为 1(已处理) 或 2(已驳回)' }

  try {
    await db.collection('reports').doc(reportId).update({
      status,
      remark,
      handler_id:  handler_id || '',
      update_time: Date.now()
    })

    return { code: 0, msg: status === 1 ? '已标记为已处理' : '已驳回举报' }
  } catch (e) {
    console.error('updateReportStatus error:', e)
    return { code: 500, msg: '更新状态失败', error: e.message }
  }
}

// ─────────────────────────────────────────────
// 5. 获取用户举报统计（我的页面用）
// ─────────────────────────────────────────────
async function getReportStats(params) {
  const { user_id } = params

  if (!user_id) return { code: 400, msg: '用户未登录' }

  try {
    const [totalRes, pendingRes, doneRes, rejectedRes] = await Promise.all([
      db.collection('reports').where({ user_id }).count(),
      db.collection('reports').where({ user_id, status: 0 }).count(),
      db.collection('reports').where({ user_id, status: 1 }).count(),
      db.collection('reports').where({ user_id, status: 2 }).count()
    ])

    return {
      code: 0,
      data: {
        total:    totalRes.total,
        pending:  pendingRes.total,
        done:     doneRes.total,
        rejected: rejectedRes.total
      }
    }
  } catch (e) {
    console.error('getReportStats error:', e)
    return { code: 500, msg: '获取统计失败', error: e.message }
  }
}