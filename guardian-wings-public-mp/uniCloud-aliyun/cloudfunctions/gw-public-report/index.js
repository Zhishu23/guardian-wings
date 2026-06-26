'use strict'

const db = uniCloud.database()
const dbCmd = db.command

const STATUS_NUMBER_TO_TEXT = {
  0: 'pending',
  1: 'resolved',
  2: 'rejected'
}

const STATUS_TEXT_TO_NUMBER = {
  pending: 0,
  processing: 0,
  resolved: 1,
  done: 1,
  rejected: 2
}

function toStatusNumber(status) {
  if (typeof status === 'number') return status
  if (typeof status === 'string' && /^\d+$/.test(status)) return Number(status)
  return STATUS_TEXT_TO_NUMBER[status] !== undefined ? STATUS_TEXT_TO_NUMBER[status] : 0
}

function statusFilterValues(status) {
  const n = toStatusNumber(status)
  const values = [n]
  if (STATUS_NUMBER_TO_TEXT[n]) values.push(STATUS_NUMBER_TO_TEXT[n])
  if (n === 0) values.push('processing')
  if (n === 1) values.push('done')
  return values
}

function buildUserWhere(userId) {
  return dbCmd.or([
    { user_id: userId },
    { userId }
  ])
}

function normalizeReport(report = {}) {
  const status = toStatusNumber(report.status)
  const location = report.location || {}
  return {
    ...report,
    user_id: report.user_id || report.userId || '',
    userId: report.userId || report.user_id || '',
    status,
    status_text: report.status_text || STATUS_NUMBER_TO_TEXT[status] || 'pending',
    create_time: report.create_time || report.createTime || 0,
    update_time: report.update_time || report.updateTime || 0,
    createTime: report.createTime || report.create_time || 0,
    updateTime: report.updateTime || report.update_time || 0,
    is_anonymous: report.is_anonymous !== undefined ? report.is_anonymous : !!report.isAnonymous,
    location: {
      address: location.address || location.name || '',
      name: location.name || location.address || '',
      latitude: location.latitude !== undefined ? location.latitude : (location.lat || 0),
      longitude: location.longitude !== undefined ? location.longitude : (location.lng || 0),
      lat: location.lat !== undefined ? location.lat : (location.latitude || 0),
      lng: location.lng !== undefined ? location.lng : (location.longitude || 0)
    }
  }
}

exports.main = async (event, context) => {
  const { action, params = {} } = event || {}

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

async function submitReport(params) {
  const {
    user_id,
    userId,
    type,
    location = {},
    time,
    description,
    images = [],
    is_anonymous,
    isAnonymous,
    anonymous
  } = params

  const rawUserId = user_id || userId || ''
  const isAnonymousReport = !!(is_anonymous || isAnonymous || anonymous || rawUserId === 'anonymous')
  const ownerId = isAnonymousReport ? '' : rawUserId

  if (!ownerId && !isAnonymousReport) return { code: 400, msg: '用户未登录' }
  if (!type) return { code: 400, msg: '请选择举报类型' }
  if (!location.address && !location.latitude && !location.lat) return { code: 400, msg: '请提供位置信息' }
  if (!description) return { code: 400, msg: '请填写描述信息' }
  if (description.length < 10) return { code: 400, msg: '描述信息不能少于10个字' }

  const validTypes = ['illegal_hunting', 'habitat_destruction', 'illegal_trade', 'other']
  if (!validTypes.includes(type)) return { code: 400, msg: '举报类型无效' }

  try {
    const now = Date.now()
    const eventTime = time || now
    const normalizedLocation = {
      address: location.address || location.name || '',
      name: location.name || location.address || '',
      latitude: location.latitude !== undefined ? location.latitude : (location.lat || 0),
      longitude: location.longitude !== undefined ? location.longitude : (location.lng || 0),
      lat: location.lat !== undefined ? location.lat : (location.latitude || 0),
      lng: location.lng !== undefined ? location.lng : (location.longitude || 0)
    }

    const reportData = {
      user_id: ownerId,
      userId: ownerId,
      type,
      location: normalizedLocation,
      time: eventTime,
      description,
      images,
      is_anonymous: isAnonymousReport,
      isAnonymous: isAnonymousReport,
      status: 0,
      status_text: 'pending',
      remark: '',
      handler_id: '',
      create_time: now,
      update_time: now,
      createTime: now,
      updateTime: now
    }

    const res = await db.collection('reports').add(reportData)

    if (!isAnonymousReport && ownerId) {
      await db.collection('uni-id-users')
        .doc(ownerId)
        .update({ points: dbCmd.inc(10), update_date: now })
        .catch(error => console.warn('update user points failed:', error))
    }

    return { code: 0, msg: '举报提交成功', data: { reportId: res.id } }
  } catch (e) {
    console.error('submitReport error:', e)
    return { code: 500, msg: '提交失败，请重试', error: e.message }
  }
}

async function getMyReports(params) {
  const { user_id, userId, status, page = 1, pageSize = 10 } = params
  const uid = user_id || userId
  if (!uid) return { code: 400, msg: '用户未登录' }

  try {
    const whereParts = [buildUserWhere(uid)]
    if (status !== undefined && status !== -1) {
      whereParts.push({ status: dbCmd.in(statusFilterValues(status)) })
    }
    const where = whereParts.length > 1 ? dbCmd.and(whereParts) : whereParts[0]
    const query = db.collection('reports').where(where)

    const countRes = await query.count()
    const total = countRes.total || 0
    const listRes = await query
      .orderBy('create_time', 'desc')
      .skip((Number(page) - 1) * Number(pageSize))
      .limit(Number(pageSize))
      .get()

    return {
      code: 0,
      data: {
        list: (listRes.data || []).map(normalizeReport),
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        hasMore: Number(page) * Number(pageSize) < total
      }
    }
  } catch (e) {
    console.error('getMyReports error:', e)
    return { code: 500, msg: '获取列表失败', error: e.message }
  }
}

async function getReportDetail(params) {
  const { reportId, user_id, userId } = params
  const uid = user_id || userId
  if (!reportId) return { code: 400, msg: '缺少 reportId' }

  try {
    const res = await db.collection('reports').doc(reportId).get()
    if (!res.data || res.data.length === 0) return { code: 404, msg: '举报记录不存在' }

    const report = normalizeReport(res.data[0])
    if (uid && report.user_id && report.user_id !== uid) {
      return { code: 403, msg: '无权查看此举报' }
    }

    return { code: 0, data: report }
  } catch (e) {
    console.error('getReportDetail error:', e)
    return { code: 500, msg: '获取详情失败', error: e.message }
  }
}

async function updateReportStatus(params) {
  const { reportId, status, remark = '', handler_id } = params
  if (!reportId) return { code: 400, msg: '缺少 reportId' }
  if (status === undefined) return { code: 400, msg: '缺少 status' }

  const statusNumber = toStatusNumber(status)
  if (![1, 2].includes(statusNumber)) return { code: 400, msg: 'status 只能为 1 或 2' }

  try {
    const now = Date.now()
    await db.collection('reports').doc(reportId).update({
      status: statusNumber,
      status_text: STATUS_NUMBER_TO_TEXT[statusNumber],
      remark,
      handler_id: handler_id || '',
      update_time: now,
      updateTime: now
    })

    return { code: 0, msg: statusNumber === 1 ? '已标记为已处理' : '已驳回举报' }
  } catch (e) {
    console.error('updateReportStatus error:', e)
    return { code: 500, msg: '更新状态失败', error: e.message }
  }
}

async function getReportStats(params) {
  const { user_id, userId } = params
  const uid = user_id || userId
  if (!uid) return { code: 400, msg: '用户未登录' }

  try {
    const userWhere = buildUserWhere(uid)
    const [totalRes, pendingRes, doneRes, rejectedRes] = await Promise.all([
      db.collection('reports').where(userWhere).count(),
      db.collection('reports').where(dbCmd.and([userWhere, { status: dbCmd.in(statusFilterValues(0)) }])).count(),
      db.collection('reports').where(dbCmd.and([userWhere, { status: dbCmd.in(statusFilterValues(1)) }])).count(),
      db.collection('reports').where(dbCmd.and([userWhere, { status: dbCmd.in(statusFilterValues(2)) }])).count()
    ])

    return {
      code: 0,
      data: {
        total: totalRes.total || 0,
        pending: pendingRes.total || 0,
        done: doneRes.total || 0,
        rejected: rejectedRes.total || 0
      }
    }
  } catch (e) {
    console.error('getReportStats error:', e)
    return { code: 500, msg: '获取统计失败', error: e.message }
  }
}
