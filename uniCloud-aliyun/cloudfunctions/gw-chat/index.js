'use strict'

const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
  const { action, params = {} } = event || {}

  try {
    switch (action) {
      case 'getRoomList':    return await getRoomList(params)
      case 'getRoomDetail':  return await getRoomDetail(params)
      case 'getMessageList': return await getMessageList(params)
      case 'sendMessage':    return await sendMessage(params)
      case 'createRoom':     return await createRoom(params)
      case 'getOrCreateTaskRoom': return await getOrCreateTaskRoom(params)
      case 'markRead':       return await markRead(params)
      case 'addMembers':     return await addMembers(params)
      case 'getRoomMembers': return await getRoomMembers(params)
      case 'searchInviteCandidates': return await searchInviteCandidates(params)
      case 'createInvitations': return await createInvitations(params)
      case 'getMyInvitations': return await getMyInvitations(params)
      case 'respondInvitation': return await respondInvitation(params)
      case 'cancelInvitation': return await cancelInvitation(params)
      case 'removeMember': return await removeMember(params)
      case 'leaveRoom': return await leaveRoom(params)
      case 'setMemberRole': return await setMemberRole(params)
      case 'transferOwner': return await transferOwner(params)
      default:
        return { code: 404, msg: `未知 action: ${action}` }
    }
  } catch (e) {
    console.error('[gw-chat error]', e)
    return formatServiceError(e)
  }
}

function formatServiceError(error) {
  const message = error && error.message ? error.message : ''
  const transientNetwork = /ENOTFOUND|ETIMEDOUT|ECONNRESET|EAI_AGAIN|getaddrinfo|network/i.test(message)
  if (transientNetwork) {
    return {
      code: 503,
      msg: 'uniCloud 网络暂时不可用，请检查网络或稍后重试',
      data: { retryable: true }
    }
  }
  return {
    code: 500,
    msg: '群聊服务异常，请稍后重试',
    data: { retryable: false }
  }
}

async function resolvePoliceIdentity(params, fallbackField) {
  const token = params && params.token ? String(params.token) : ''
  if (token) {
    try {
      const res = await db.collection('uni-id-users')
        .where({ token, role: 'police' })
        .field({ _id: true, realName: true, nickname: true, name: true, policeId: true, badge_no: true, department: true, status: true })
        .limit(1)
        .get()
      const user = res.data && res.data[0]
      if (user && user.status !== 1 && user.status !== 'disabled' && user.status !== 'blocked') {
        return {
          officer_id: user._id,
          name: user.realName || user.nickname || user.name || '',
          badge_no: user.policeId || user.badge_no || '',
          department: user.department || '',
          source: 'token'
        }
      }
    } catch (e) {
      console.warn('[gw-chat] resolvePoliceIdentity failed:', e.message)
    }
  }

  const officerId = params && fallbackField ? params[fallbackField] : ''
  return {
    officer_id: officerId || '',
    name: (params && (params.officer_name || params.operator_name || params.creator_name)) || '',
    badge_no: (params && (params.badge_no || params.operator_badge_no || params.creator_badge_no)) || '',
    department: '',
    source: 'params'
  }
}

async function getRoomList(params) {
  const identity = await resolvePoliceIdentity(params, 'officer_id')
  const officer_id = identity.officer_id
  const { page = 1, pageSize = 30 } = params
  if (!officer_id) return { code: 400, msg: '缺少 officer_id' }

  const memberRes = await db.collection('chat_room_members')
    .where({ officer_id, status: 'active' })
    .orderBy('last_active_time', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()

  const memberships = memberRes.data || []
  if (!memberships.length) {
    return { code: 0, data: { list: [], total: 0, page, pageSize, hasMore: false } }
  }

  const roomIds = memberships.map(item => item.room_id).filter(Boolean)
  const roomsRes = await db.collection('chat_rooms')
    .where({ _id: dbCmd.in(roomIds), status: dbCmd.neq('closed') })
    .get()
  const rooms = roomsRes.data || []
  const roomMap = {}
  rooms.forEach(room => { roomMap[room._id] = room })

  const list = []
  for (const member of memberships) {
    const room = roomMap[member.room_id]
    if (!room) continue
    const unread = await countUnread(room._id, officer_id, member.last_read_time || 0)
    list.push(formatRoom(room, member, unread))
  }

  list.sort((a, b) => (b.last_message_time || 0) - (a.last_message_time || 0))

  return {
    code: 0,
    data: {
      list,
      total: list.length,
      page,
      pageSize,
      hasMore: memberships.length === pageSize
    }
  }
}

async function getRoomDetail(params) {
  const { room_id } = params
  const identity = await resolvePoliceIdentity(params, 'officer_id')
  const officer_id = identity.officer_id
  if (!room_id) return { code: 400, msg: '缺少 room_id' }
  if (!officer_id) return { code: 400, msg: '缺少 officer_id' }

  const member = await ensureMember(room_id, officer_id)
  if (!member) return { code: 403, msg: '无权访问该群聊' }

  const roomRes = await db.collection('chat_rooms').doc(room_id).get()
  if (!roomRes.data || !roomRes.data.length) return { code: 404, msg: '群聊不存在' }

  const membersRes = await db.collection('chat_room_members')
    .where({ room_id, status: 'active' })
    .orderBy('joined_at', 'asc')
    .limit(100)
    .get()

  return {
    code: 0,
    data: {
      room: formatRoom(roomRes.data[0], member, 0),
      members: (membersRes.data || []).map(formatMember)
    }
  }
}

async function getMessageList(params) {
  const { room_id, afterTime = 0, page = 1, pageSize = 20 } = params
  const identity = await resolvePoliceIdentity(params, 'officer_id')
  const officer_id = identity.officer_id
  if (!room_id) return { code: 400, msg: '缺少 room_id' }
  if (!officer_id) return { code: 400, msg: '缺少 officer_id' }

  const member = await ensureMember(room_id, officer_id)
  if (!member) return { code: 403, msg: '无权访问该群聊消息' }

  const historyVisibleFrom = Number(member.history_visible_from) || 0
  const effectiveAfterTime = Math.max(Number(afterTime) || 0, historyVisibleFrom)
  const whereClause = {
    room_id,
    status: dbCmd.neq('deleted')
  }
  if (effectiveAfterTime > 0) {
    whereClause.create_time = Number(afterTime) > 0
      ? dbCmd.gt(effectiveAfterTime)
      : dbCmd.gte(effectiveAfterTime)
  }

  const query = db.collection('chat_messages').where(whereClause)

  const listRes = Number(afterTime) > 0
    ? await query.orderBy('create_time', 'asc').limit(pageSize).get()
    : await query.orderBy('create_time', 'desc').skip((page - 1) * pageSize).limit(pageSize).get()

  let list = listRes.data || []
  if (!(Number(afterTime) > 0)) list = list.reverse()

  return {
    code: 0,
    data: {
      list: list.map(formatMessage),
      page,
      pageSize,
      hasMore: list.length === pageSize
    }
  }
}

async function sendMessage(params) {
  const {
    room_id,
    message_type = 'text', content = '', file_url = '',
    location = null, task_id = '', client_msg_id = ''
  } = params
  const identity = await resolvePoliceIdentity(params, 'officer_id')
  const officer_id = identity.officer_id
  const officer_name = identity.name || params.officer_name || ''
  const badge_no = identity.badge_no || params.badge_no || ''

  if (!room_id) return { code: 400, msg: '缺少 room_id' }
  if (!officer_id) return { code: 400, msg: '缺少 officer_id' }
  if (message_type === 'text' && !String(content).trim()) {
    return { code: 400, msg: '消息内容不能为空' }
  }

  const member = await ensureMember(room_id, officer_id)
  if (!member) return { code: 403, msg: '无权在该群聊发送消息' }

  if (client_msg_id) {
    const dupRes = await db.collection('chat_messages')
      .where({ room_id, sender_id: officer_id, client_msg_id })
      .limit(1)
      .get()
    if (dupRes.data && dupRes.data.length) {
      return { code: 0, msg: '消息已发送', data: { message: formatMessage(dupRes.data[0]) } }
    }
  }

  const now = Date.now()
  const messageDoc = {
    room_id,
    sender_id: officer_id,
    sender_name: member.officer_name || officer_name || '警务人员',
    sender_badge_no: member.badge_no || badge_no || '',
    message_type,
    content: String(content || '').trim(),
    file_url: file_url || '',
    location: location || null,
    task_id: task_id || '',
    client_msg_id: client_msg_id || '',
    status: 'normal',
    create_time: now,
    update_time: now
  }

  const addRes = await db.collection('chat_messages').add(messageDoc)
  const messageId = addRes.id

  const lastMessage = buildLastMessage(messageDoc)
  await db.collection('chat_rooms').doc(room_id).update({
    last_message: lastMessage,
    last_message_time: now,
    update_time: now
  })

  await db.collection('chat_room_members')
    .where({ room_id, officer_id })
    .update({ last_active_time: now, last_read_time: now, update_time: now })

  return {
    code: 0,
    msg: '发送成功',
    data: {
      message: formatMessage({ _id: messageId, ...messageDoc })
    }
  }
}

async function createRoom(params) {
  const {
    name, type = 'temp', task_id = '', dept = '',
    creator_id, creator_name, creator_badge_no,
    member_ids = [], members = []
  } = params

  if (!creator_id) return { code: 400, msg: '缺少 creator_id' }

  const now = Date.now()
  const roomName = String(name || '').trim() || defaultRoomName(type, dept)
  let normalizedMembers = normalizeMembers(members, member_ids)

  if (type === 'department' && dept && normalizedMembers.length <= 1) {
    const deptMembers = await loadDepartmentMembers(dept)
    normalizedMembers = normalizedMembers.concat(deptMembers)
  }

  normalizedMembers.push({
    officer_id: creator_id,
    officer_name: creator_name || '我',
    badge_no: creator_badge_no || ''
  })
  normalizedMembers = uniqueMembers(normalizedMembers)

  const roomDoc = {
    name: roomName,
    type,
    task_id: task_id || '',
    dept: dept || '',
    created_by: creator_id,
    created_by_name: creator_name || '',
    member_ids: normalizedMembers.map(item => item.officer_id),
    member_count: normalizedMembers.length,
    last_message: '群聊已创建',
    last_message_time: now,
    status: 'active',
    create_time: now,
    update_time: now
  }

  const addRoomRes = await db.collection('chat_rooms').add(roomDoc)
  const roomId = addRoomRes.id

  await Promise.all(normalizedMembers.map(item => db.collection('chat_room_members').add({
    room_id: roomId,
    officer_id: item.officer_id,
    officer_name: item.officer_name || '',
    badge_no: item.badge_no || '',
    role: item.officer_id === creator_id ? 'owner' : 'member',
    status: 'active',
    last_read_time: item.officer_id === creator_id ? now : 0,
    last_active_time: now,
    joined_at: now,
    invited_by: '',
    invite_id: '',
    history_visible_from: now,
    update_time: now,
    mute: false
  })))

  await db.collection('chat_messages').add({
    room_id: roomId,
    sender_id: 'system',
    sender_name: '系统',
    sender_badge_no: '',
    message_type: 'system',
    content: '群聊已创建',
    file_url: '',
    location: null,
    task_id: task_id || '',
    client_msg_id: '',
    status: 'normal',
    create_time: now,
    update_time: now
  })

  return {
    code: 0,
    msg: '群聊创建成功',
    data: {
      room: formatRoom({ _id: roomId, ...roomDoc }, { last_read_time: now }, 0)
    }
  }
}

async function getOrCreateTaskRoom(params) {
  const {
    task_id, task_title,
    creator_id, creator_name, creator_badge_no,
    assignee_id = '', assignee_name = ''
  } = params

  if (!task_id) return { code: 400, msg: '缺少 task_id' }
  if (!creator_id) return { code: 400, msg: '缺少 creator_id' }

  const existRes = await db.collection('chat_rooms')
    .where({ type: 'task', task_id, status: dbCmd.neq('closed') })
    .limit(1)
    .get()

  if (existRes.data && existRes.data.length) {
    const room = existRes.data[0]
    let member = await ensureMember(room._id, creator_id)
    if (!member) {
      const now = Date.now()
      await db.collection('chat_room_members').add({
        room_id: room._id,
        officer_id: creator_id,
        officer_name: creator_name || '',
        badge_no: creator_badge_no || '',
        role: 'member',
        status: 'active',
        last_read_time: 0,
        last_active_time: now,
        joined_at: now,
        invited_by: '',
        invite_id: '',
        history_visible_from: room.create_time || now,
        update_time: now,
        mute: false
      })
      const nextMemberIds = Array.from(new Set([].concat(room.member_ids || [], [creator_id])))
      await db.collection('chat_rooms').doc(room._id).update({
        member_ids: nextMemberIds,
        member_count: nextMemberIds.length,
        update_time: now
      })
      member = await ensureMember(room._id, creator_id)
      room.member_ids = nextMemberIds
      room.member_count = nextMemberIds.length
    }
    return {
      code: 0,
      msg: '任务群已就绪',
      data: { room: formatRoom(room, member || { role: 'member' }, 0) }
    }
  }

  const members = [{
    officer_id: creator_id,
    officer_name: creator_name || '',
    badge_no: creator_badge_no || ''
  }]
  if (assignee_id && assignee_id !== creator_id) {
    members.push({
      officer_id: assignee_id,
      officer_name: assignee_name || '',
      badge_no: ''
    })
  }

  return await createRoom({
    name: `${task_title || '任务'}群`,
    type: 'task',
    task_id,
    creator_id,
    creator_name,
    creator_badge_no,
    members
  })
}

async function markRead(params) {
  const { room_id, read_time = Date.now() } = params
  const identity = await resolvePoliceIdentity(params, 'officer_id')
  const officer_id = identity.officer_id
  if (!room_id) return { code: 400, msg: '缺少 room_id' }
  if (!officer_id) return { code: 400, msg: '缺少 officer_id' }

  const member = await ensureMember(room_id, officer_id)
  if (!member) return { code: 403, msg: '无权访问该群聊' }

  await db.collection('chat_room_members')
    .where({ room_id, officer_id })
    .update({ last_read_time: Number(read_time), update_time: Date.now() })

  return { code: 0, msg: '已读状态已更新' }
}

async function addMembers(params) {
  const { room_id, operator_id, members = [] } = params
  if (!room_id) return { code: 400, msg: '缺少 room_id' }
  if (!operator_id) return { code: 400, msg: '缺少 operator_id' }

  const operator = await ensureMember(room_id, operator_id)
  if (!operator) return { code: 403, msg: '无权操作该群聊' }

  const normalizedMembers = uniqueMembers(normalizeMembers(members, []))
  if (!normalizedMembers.length) return { code: 400, msg: '请选择要添加的成员' }

  const now = Date.now()
  const added = []
  for (const item of normalizedMembers) {
    const exist = await ensureMember(room_id, item.officer_id)
    if (exist) continue
    await db.collection('chat_room_members').add({
      room_id,
      officer_id: item.officer_id,
      officer_name: item.officer_name || '',
      badge_no: item.badge_no || '',
      role: 'member',
      status: 'active',
      last_read_time: 0,
      last_active_time: now,
      joined_at: now,
      invited_by: operator_id,
      invite_id: '',
      history_visible_from: now,
      update_time: now,
      mute: false
    })
    added.push(item.officer_id)
  }

  if (added.length) {
    const roomRes = await db.collection('chat_rooms').doc(room_id).get()
    const room = roomRes.data && roomRes.data[0]
    const nextMemberIds = Array.from(new Set([].concat(room.member_ids || [], added)))
    await db.collection('chat_rooms').doc(room_id).update({
      member_ids: nextMemberIds,
      member_count: nextMemberIds.length,
      update_time: now
    })
  }

  return { code: 0, msg: '成员已添加', data: { added } }
}

async function getRoomMembers(params) {
  const { room_id, officer_id } = params
  if (!room_id) return { code: 400, msg: '缺少 room_id' }
  if (!officer_id) return { code: 400, msg: '缺少 officer_id' }

  const operator = await ensureMember(room_id, officer_id)
  if (!operator) return { code: 403, msg: '无权访问该群聊成员' }

  const room = await loadRoomById(room_id)
  if (!room) return { code: 404, msg: '群聊不存在' }

  const membersRes = await db.collection('chat_room_members')
    .where({ room_id, status: 'active' })
    .orderBy('joined_at', 'asc')
    .limit(200)
    .get()

  const invitationRes = await db.collection('chat_room_invitations')
    .where({ room_id })
    .orderBy('create_time', 'desc')
    .limit(50)
    .get()

  return {
    code: 0,
    data: {
      room: formatRoom(room, operator, 0),
      members: (membersRes.data || []).map(formatMember),
      invitations: (invitationRes.data || []).map(formatInvitation),
      permissions: {
        can_invite: true,
        can_manage: isRoomManager(operator),
        can_change_role: operator.role === 'owner',
        is_owner: operator.role === 'owner',
        my_role: operator.role || 'member'
      }
    }
  }
}

async function searchInviteCandidates(params) {
  const {
    room_id, operator_id, keyword = '', department = '',
    pageSize = 100
  } = params
  if (!room_id) return { code: 400, msg: '缺少 room_id' }
  if (!operator_id) return { code: 400, msg: '缺少 operator_id' }

  const operator = await ensureMember(room_id, operator_id)
  if (!operator) return { code: 403, msg: '无权邀请成员' }

  const room = await loadRoomById(room_id)
  if (!room) return { code: 404, msg: '群聊不存在' }

  const activeMembersRes = await db.collection('chat_room_members')
    .where({ room_id, status: 'active' })
    .limit(500)
    .get()
  const activeMemberMap = {}
  ;(activeMembersRes.data || []).forEach(item => {
    activeMemberMap[item.officer_id] = true
  })

  const pendingRes = await db.collection('chat_room_invitations')
    .where({ room_id, status: 'pending' })
    .limit(500)
    .get()
  const now = Date.now()
  const pendingMap = {}
  ;(pendingRes.data || []).forEach(item => {
    if (!item.expire_time || item.expire_time > now) pendingMap[item.invitee_id] = true
  })

  const users = await loadPoliceUsers({
    keyword,
    department,
    pageSize: Math.min(Number(pageSize) || 100, 200)
  })

  const list = users.map(user => formatCandidate(user, activeMemberMap, pendingMap))
  return {
    code: 0,
    data: {
      list,
      total: list.length,
      room: formatRoom(room, operator, 0)
    }
  }
}

async function createInvitations(params) {
  const {
    room_id, operator_id, operator_name = '', operator_badge_no = '',
    members = [], invite_reason = '', expire_hours = 24, allow_history
  } = params
  if (!room_id) return { code: 400, msg: '缺少 room_id' }
  if (!operator_id) return { code: 400, msg: '缺少 operator_id' }

  const operator = await ensureMember(room_id, operator_id)
  if (!operator) return { code: 403, msg: '无权邀请成员' }

  const room = await loadRoomById(room_id)
  if (!room || room.status === 'closed') return { code: 404, msg: '群聊不存在或已关闭' }

  const normalizedMembers = uniqueMembers(normalizeMembers(members, []))
  if (!normalizedMembers.length) return { code: 400, msg: '请选择要邀请的成员' }
  if (normalizedMembers.length > 20) return { code: 400, msg: '一次最多邀请 20 人' }

  const now = Date.now()
  const expireTime = now + Math.max(Number(expire_hours) || 24, 1) * 3600000
  const historyPolicy = typeof allow_history === 'boolean'
    ? (allow_history ? 'all' : 'from_join')
    : (room.type === 'task' ? 'all' : 'from_join')
  const created = []
  const skipped = []

  for (const item of normalizedMembers) {
    if (item.officer_id === operator_id) {
      skipped.push({ officer_id: item.officer_id, reason: '不能邀请自己' })
      continue
    }

    const active = await ensureMember(room_id, item.officer_id)
    if (active) {
      skipped.push({ officer_id: item.officer_id, reason: '已在群内' })
      continue
    }

    const pending = await getValidPendingInvitation(room_id, item.officer_id, now)
    if (pending) {
      skipped.push({ officer_id: item.officer_id, reason: '已邀请，等待确认' })
      continue
    }

    const officer = await loadOfficerById(item.officer_id)
    if (!officer) {
      skipped.push({ officer_id: item.officer_id, reason: '警员账号不存在' })
      continue
    }

    const inviteDoc = {
      room_id,
      room_name: room.name || '',
      room_type: room.type || 'temp',
      task_id: room.task_id || '',
      dept: room.dept || '',
      inviter_id: operator_id,
      inviter_name: operator_name || operator.officer_name || '',
      inviter_badge_no: operator_badge_no || operator.badge_no || '',
      invitee_id: officer.officer_id,
      invitee_name: officer.officer_name || item.officer_name || '',
      invitee_badge_no: officer.badge_no || item.badge_no || '',
      invite_reason: String(invite_reason || '').trim(),
      status: 'pending',
      history_policy: historyPolicy,
      history_visible_from: historyPolicy === 'all' ? (room.create_time || 1) : 0,
      expire_time: expireTime,
      respond_time: 0,
      respond_reason: '',
      cancelled_by: '',
      cancel_reason: '',
      create_time: now,
      update_time: now
    }

    const addRes = await db.collection('chat_room_invitations').add(inviteDoc)
    const invitation = { _id: addRes.id, ...inviteDoc }
    created.push(formatInvitation(invitation))
    await writeMemberEvent({
      room_id,
      operator_id,
      operator_name: inviteDoc.inviter_name,
      target_id: inviteDoc.invitee_id,
      target_name: inviteDoc.invitee_name,
      event_type: 'invite_created',
      event_desc: `${inviteDoc.inviter_name || '成员'}邀请${inviteDoc.invitee_name || '警员'}加入群聊`,
      extra: { invitation_id: addRes.id }
    })
  }

  return {
    code: 0,
    msg: created.length ? '邀请已发送' : '没有新的邀请发送',
    data: { created, skipped }
  }
}

async function getMyInvitations(params) {
  const { officer_id, status = 'pending', page = 1, pageSize = 30 } = params
  if (!officer_id) return { code: 400, msg: '缺少 officer_id' }

  const whereClause = { invitee_id: officer_id }
  if (status && status !== 'all') whereClause.status = status

  const res = await db.collection('chat_room_invitations')
    .where(whereClause)
    .orderBy('create_time', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()

  let list = (res.data || []).map(formatInvitation)
  if (status === 'pending') {
    list = list.filter(item => item.status === 'pending')
  }
  const pendingCount = list.filter(item => item.status === 'pending').length
  return {
    code: 0,
    data: {
      list,
      pending_count: pendingCount,
      total: list.length,
      page,
      pageSize,
      hasMore: list.length === pageSize
    }
  }
}

async function respondInvitation(params) {
  const {
    invitation_id, officer_id, action,
    respond_reason = ''
  } = params
  if (!invitation_id) return { code: 400, msg: '缺少 invitation_id' }
  if (!officer_id) return { code: 400, msg: '缺少 officer_id' }
  if (!['accept', 'decline'].includes(action)) return { code: 400, msg: '无效的处理动作' }

  const invitation = await loadInvitationById(invitation_id)
  if (!invitation) return { code: 404, msg: '邀请不存在' }
  if (invitation.invitee_id !== officer_id) return { code: 403, msg: '无权处理该邀请' }

  const now = Date.now()
  if (invitation.status !== 'pending') {
    if (invitation.status === 'accepted') {
      const member = await ensureMember(invitation.room_id, officer_id)
      const room = await loadRoomById(invitation.room_id)
      return {
        code: 0,
        msg: '已加入该群聊',
        data: { room: room ? formatRoom(room, member || { role: 'member' }, 0) : null }
      }
    }
    return { code: 409, msg: `邀请已${formatInvitationStatus(invitation.status)}` }
  }

  if (invitation.expire_time && invitation.expire_time <= now) {
    await db.collection('chat_room_invitations').doc(invitation._id).update({
      status: 'expired',
      update_time: now
    })
    await writeMemberEvent({
      room_id: invitation.room_id,
      operator_id: 'system',
      operator_name: '系统',
      target_id: invitation.invitee_id,
      target_name: invitation.invitee_name,
      event_type: 'invite_expired',
      event_desc: `${invitation.invitee_name || '警员'}的入群邀请已过期`,
      extra: { invitation_id }
    })
    return { code: 410, msg: '邀请已过期，请联系邀请人重新邀请' }
  }

  const room = await loadRoomById(invitation.room_id)
  if (!room || room.status === 'closed') {
    await db.collection('chat_room_invitations').doc(invitation._id).update({
      status: 'invalid',
      update_time: now
    })
    return { code: 410, msg: '群聊不存在或已关闭，邀请已失效' }
  }

  if (action === 'decline') {
    await db.collection('chat_room_invitations').doc(invitation._id).update({
      status: 'declined',
      respond_time: now,
      respond_reason: String(respond_reason || '').trim(),
      update_time: now
    })
    await writeMemberEvent({
      room_id: invitation.room_id,
      operator_id: officer_id,
      operator_name: invitation.invitee_name,
      target_id: invitation.inviter_id,
      target_name: invitation.inviter_name,
      event_type: 'invite_declined',
      event_desc: `${invitation.invitee_name || '警员'}拒绝加入群聊`,
      extra: { invitation_id, reason: respond_reason || '' }
    })
    return { code: 0, msg: '已拒绝邀请' }
  }

  let member = await ensureMember(invitation.room_id, officer_id)
  if (!member) {
    const historyVisibleFrom = invitation.history_policy === 'all'
      ? (Number(invitation.history_visible_from) || room.create_time || 1)
      : now
    await db.collection('chat_room_members').add({
      room_id: invitation.room_id,
      officer_id,
      officer_name: invitation.invitee_name || '',
      badge_no: invitation.invitee_badge_no || '',
      role: 'member',
      status: 'active',
      last_read_time: now,
      last_active_time: now,
      joined_at: now,
      invited_by: invitation.inviter_id || '',
      invite_id: invitation._id,
      history_visible_from: historyVisibleFrom,
      update_time: now,
      mute: false
    })
    await updateRoomMemberSnapshot(invitation.room_id)
    member = await ensureMember(invitation.room_id, officer_id)
  }

  await db.collection('chat_room_invitations').doc(invitation._id).update({
    status: 'accepted',
    respond_time: now,
    respond_reason: '',
    update_time: now
  })

  await writeMemberEvent({
    room_id: invitation.room_id,
    operator_id: officer_id,
    operator_name: invitation.invitee_name,
    target_id: officer_id,
    target_name: invitation.invitee_name,
    event_type: 'invite_accepted',
    event_desc: `${invitation.invitee_name || '警员'}接受邀请并加入群聊`,
    extra: { invitation_id }
  })

  await appendSystemMessage(room, `${invitation.invitee_name || '警员'}已加入群聊`)
  const updatedRoom = await loadRoomById(invitation.room_id)
  return {
    code: 0,
    msg: '已加入群聊',
    data: {
      room: formatRoom(updatedRoom || room, member || { role: 'member' }, 0)
    }
  }
}

async function cancelInvitation(params) {
  const {
    invitation_id, operator_id,
    operator_name = '', cancel_reason = ''
  } = params
  if (!invitation_id) return { code: 400, msg: '缺少 invitation_id' }
  if (!operator_id) return { code: 400, msg: '缺少 operator_id' }

  const invitation = await loadInvitationById(invitation_id)
  if (!invitation) return { code: 404, msg: '邀请不存在' }
  if (invitation.status !== 'pending') return { code: 409, msg: '只能撤销待处理邀请' }

  const operator = await ensureMember(invitation.room_id, operator_id)
  if (!operator) return { code: 403, msg: '无权操作该群聊' }
  if (invitation.inviter_id !== operator_id && !isRoomManager(operator)) {
    return { code: 403, msg: '只有邀请人、群主或管理员可以撤销邀请' }
  }

  const now = Date.now()
  await db.collection('chat_room_invitations').doc(invitation._id).update({
    status: 'cancelled',
    cancelled_by: operator_id,
    cancel_reason: String(cancel_reason || '').trim(),
    update_time: now
  })
  await writeMemberEvent({
    room_id: invitation.room_id,
    operator_id,
    operator_name: operator_name || operator.officer_name || '',
    target_id: invitation.invitee_id,
    target_name: invitation.invitee_name,
    event_type: 'invite_cancelled',
    event_desc: `${operator_name || operator.officer_name || '成员'}撤销了${invitation.invitee_name || '警员'}的入群邀请`,
    extra: { invitation_id }
  })
  return { code: 0, msg: '邀请已撤销' }
}

async function removeMember(params) {
  const {
    room_id, operator_id, target_id,
    operator_name = '', remove_reason = ''
  } = params
  if (!room_id) return { code: 400, msg: '缺少 room_id' }
  if (!operator_id) return { code: 400, msg: '缺少 operator_id' }
  if (!target_id) return { code: 400, msg: '缺少 target_id' }
  if (operator_id === target_id) return { code: 400, msg: '请使用退出群聊' }

  const operator = await ensureMember(room_id, operator_id)
  const target = await ensureMember(room_id, target_id)
  if (!operator) return { code: 403, msg: '无权操作该群聊' }
  if (!target) return { code: 404, msg: '成员不存在或已离开' }
  if (!isRoomManager(operator)) return { code: 403, msg: '只有群主或管理员可以移除成员' }
  if (target.role === 'owner') return { code: 403, msg: '不能移除群主' }
  if (operator.role === 'admin' && target.role === 'admin') return { code: 403, msg: '管理员不能移除管理员' }

  const now = Date.now()
  await db.collection('chat_room_members').doc(target._id).update({
    status: 'removed',
    removed_by: operator_id,
    removed_reason: String(remove_reason || '').trim(),
    removed_at: now,
    update_time: now
  })
  await updateRoomMemberSnapshot(room_id)
  const room = await loadRoomById(room_id)
  await writeMemberEvent({
    room_id,
    operator_id,
    operator_name: operator_name || operator.officer_name || '',
    target_id,
    target_name: target.officer_name || '',
    event_type: 'member_removed',
    event_desc: `${operator_name || operator.officer_name || '管理员'}将${target.officer_name || '成员'}移出群聊`,
    extra: { reason: remove_reason || '' }
  })
  if (room) await appendSystemMessage(room, `${target.officer_name || '成员'}已被移出群聊`)
  return { code: 0, msg: '成员已移除' }
}

async function leaveRoom(params) {
  const { room_id, officer_id, officer_name = '' } = params
  if (!room_id) return { code: 400, msg: '缺少 room_id' }
  if (!officer_id) return { code: 400, msg: '缺少 officer_id' }

  const member = await ensureMember(room_id, officer_id)
  if (!member) return { code: 403, msg: '你不在该群聊中' }

  const activeRes = await db.collection('chat_room_members')
    .where({ room_id, status: 'active' })
    .limit(500)
    .get()
  const activeMembers = activeRes.data || []
  if (member.role === 'owner' && activeMembers.length > 1) {
    return { code: 400, msg: '群主退出前请先转让群主' }
  }

  const now = Date.now()
  await db.collection('chat_room_members').doc(member._id).update({
    status: 'left',
    left_at: now,
    update_time: now
  })
  await updateRoomMemberSnapshot(room_id)
  const room = await loadRoomById(room_id)
  await writeMemberEvent({
    room_id,
    operator_id: officer_id,
    operator_name: officer_name || member.officer_name || '',
    target_id: officer_id,
    target_name: member.officer_name || '',
    event_type: 'member_left',
    event_desc: `${member.officer_name || '成员'}退出群聊`,
    extra: {}
  })
  if (room) await appendSystemMessage(room, `${member.officer_name || '成员'}退出群聊`)
  return { code: 0, msg: '已退出群聊' }
}

async function setMemberRole(params) {
  const { room_id, operator_id, target_id, role } = params
  if (!room_id) return { code: 400, msg: '缺少 room_id' }
  if (!operator_id) return { code: 400, msg: '缺少 operator_id' }
  if (!target_id) return { code: 400, msg: '缺少 target_id' }
  if (!['admin', 'member'].includes(role)) return { code: 400, msg: '角色只能设置为管理员或成员' }

  const operator = await ensureMember(room_id, operator_id)
  const target = await ensureMember(room_id, target_id)
  if (!operator || operator.role !== 'owner') return { code: 403, msg: '只有群主可以设置管理员' }
  if (!target) return { code: 404, msg: '成员不存在或已离开' }
  if (target.role === 'owner') return { code: 400, msg: '不能修改群主角色' }

  const now = Date.now()
  await db.collection('chat_room_members').doc(target._id).update({
    role,
    update_time: now
  })
  await writeMemberEvent({
    room_id,
    operator_id,
    operator_name: operator.officer_name || '',
    target_id,
    target_name: target.officer_name || '',
    event_type: 'role_changed',
    event_desc: `${target.officer_name || '成员'}被设置为${role === 'admin' ? '管理员' : '普通成员'}`,
    extra: { role }
  })
  return { code: 0, msg: '成员角色已更新' }
}

async function transferOwner(params) {
  const { room_id, operator_id, target_id } = params
  if (!room_id) return { code: 400, msg: '缺少 room_id' }
  if (!operator_id) return { code: 400, msg: '缺少 operator_id' }
  if (!target_id) return { code: 400, msg: '缺少 target_id' }
  if (operator_id === target_id) return { code: 400, msg: '对方已经是当前操作人' }

  const operator = await ensureMember(room_id, operator_id)
  const target = await ensureMember(room_id, target_id)
  if (!operator || operator.role !== 'owner') return { code: 403, msg: '只有群主可以转让群主' }
  if (!target) return { code: 404, msg: '目标成员不存在或已离开' }

  const now = Date.now()
  await db.collection('chat_room_members').doc(operator._id).update({
    role: 'admin',
    update_time: now
  })
  await db.collection('chat_room_members').doc(target._id).update({
    role: 'owner',
    update_time: now
  })
  await writeMemberEvent({
    room_id,
    operator_id,
    operator_name: operator.officer_name || '',
    target_id,
    target_name: target.officer_name || '',
    event_type: 'owner_transferred',
    event_desc: `${operator.officer_name || '群主'}将群主转让给${target.officer_name || '成员'}`,
    extra: {}
  })
  return { code: 0, msg: '群主已转让' }
}

async function ensureMember(roomId, officerId) {
  const res = await db.collection('chat_room_members')
    .where({ room_id: roomId, officer_id: officerId, status: 'active' })
    .limit(1)
    .get()
  return res.data && res.data[0]
}

async function countUnread(roomId, officerId, lastReadTime) {
  const countRes = await db.collection('chat_messages')
    .where({
      room_id: roomId,
      sender_id: dbCmd.neq(officerId),
      status: dbCmd.neq('deleted'),
      create_time: dbCmd.gt(Number(lastReadTime) || 0)
    })
    .count()
  return countRes.total || 0
}

async function loadDepartmentMembers(dept) {
  try {
    const res = await db.collection('uni-id-users')
      .where({ role: 'police', department: dept })
      .field({ _id: true, realName: true, nickname: true, policeId: true })
      .limit(100)
      .get()
    return (res.data || []).map(user => ({
      officer_id: user._id,
      officer_name: user.realName || user.nickname || '',
      badge_no: user.policeId || ''
    }))
  } catch (e) {
    console.warn('[gw-chat] loadDepartmentMembers failed:', e.message)
    return []
  }
}

async function loadRoomById(roomId) {
  const res = await db.collection('chat_rooms').doc(roomId).get()
  return res.data && res.data[0]
}

async function loadInvitationById(invitationId) {
  const res = await db.collection('chat_room_invitations').doc(invitationId).get()
  return res.data && res.data[0]
}

async function getValidPendingInvitation(roomId, inviteeId, now = Date.now()) {
  const res = await db.collection('chat_room_invitations')
    .where({ room_id: roomId, invitee_id: inviteeId, status: 'pending' })
    .orderBy('create_time', 'desc')
    .limit(1)
    .get()
  const invitation = res.data && res.data[0]
  if (!invitation) return null
  if (invitation.expire_time && invitation.expire_time <= now) return null
  return invitation
}

async function loadOfficerById(officerId) {
  if (!officerId) return null
  try {
    let res = await db.collection('uni-id-users').doc(officerId).get()
    let user = res.data && res.data[0]
    if (!user) {
      res = await db.collection('uni-id-users')
        .where({ officer_id: officerId })
        .limit(1)
        .get()
      user = res.data && res.data[0]
    }
    if (!user) return null
    if (user.status === 'disabled' || user.status === 'blocked') return null
    return {
      officer_id: user._id || user.officer_id || officerId,
      officer_name: user.realName || user.nickname || user.name || '',
      badge_no: user.policeId || user.badge_no || '',
      department: user.department || '',
      disabled: user.status === 'disabled'
    }
  } catch (e) {
    console.warn('[gw-chat] loadOfficerById failed:', e.message)
    return null
  }
}

async function loadPoliceUsers({ keyword = '', department = '', pageSize = 100 }) {
  try {
    const whereClause = { role: 'police' }
    if (department) whereClause.department = department
    const res = await db.collection('uni-id-users')
      .where(whereClause)
      .field({
        _id: true,
        realName: true,
        nickname: true,
        name: true,
        policeId: true,
        badge_no: true,
        department: true,
        status: true
      })
      .limit(pageSize)
      .get()

    const kw = String(keyword || '').trim().toLowerCase()
    return (res.data || [])
      .map(user => ({
        officer_id: user._id,
        officer_name: user.realName || user.nickname || user.name || '',
        badge_no: user.policeId || user.badge_no || '',
        department: user.department || '',
        disabled: user.status === 'disabled' || user.status === 'blocked'
      }))
      .filter(user => {
        if (!kw) return true
        return String(user.officer_name || '').toLowerCase().includes(kw) ||
          String(user.badge_no || '').toLowerCase().includes(kw) ||
          String(user.department || '').toLowerCase().includes(kw)
      })
  } catch (e) {
    console.warn('[gw-chat] loadPoliceUsers failed:', e.message)
    return []
  }
}

async function updateRoomMemberSnapshot(roomId) {
  const res = await db.collection('chat_room_members')
    .where({ room_id: roomId, status: 'active' })
    .limit(500)
    .get()
  const ids = (res.data || []).map(item => item.officer_id).filter(Boolean)
  const updateData = {
    member_ids: ids,
    member_count: ids.length,
    update_time: Date.now()
  }
  if (!ids.length) updateData.status = 'closed'
  await db.collection('chat_rooms').doc(roomId).update(updateData)
  return ids
}

async function appendSystemMessage(room, content) {
  if (!room || !room._id || !content) return
  const now = Date.now()
  const messageDoc = {
    room_id: room._id,
    sender_id: 'system',
    sender_name: '系统',
    sender_badge_no: '',
    message_type: 'system',
    content,
    file_url: '',
    location: null,
    task_id: room.task_id || '',
    client_msg_id: '',
    status: 'normal',
    create_time: now,
    update_time: now
  }
  await db.collection('chat_messages').add(messageDoc)
  await db.collection('chat_rooms').doc(room._id).update({
    last_message: content,
    last_message_time: now,
    update_time: now
  })
}

async function writeMemberEvent(event) {
  const now = Date.now()
  try {
    await db.collection('chat_room_member_events').add({
      room_id: event.room_id || '',
      operator_id: event.operator_id || '',
      operator_name: event.operator_name || '',
      target_id: event.target_id || '',
      target_name: event.target_name || '',
      event_type: event.event_type || '',
      event_desc: event.event_desc || '',
      extra: event.extra || {},
      create_time: now
    })
  } catch (e) {
    console.warn('[gw-chat] writeMemberEvent failed:', e.message)
  }
}

function isRoomManager(member) {
  return !!member && ['owner', 'admin'].includes(member.role)
}

function formatCandidate(user, activeMemberMap, pendingMap) {
  let status = 'available'
  let status_text = '可邀请'
  if (user.disabled) {
    status = 'disabled'
    status_text = '账号停用'
  } else if (activeMemberMap[user.officer_id]) {
    status = 'in_room'
    status_text = '已在群内'
  } else if (pendingMap[user.officer_id]) {
    status = 'pending'
    status_text = '已邀请'
  }
  return {
    officer_id: user.officer_id,
    officer_name: user.officer_name || '警务人员',
    badge_no: user.badge_no || '',
    department: user.department || '',
    status,
    status_text,
    selectable: status === 'available'
  }
}

function formatInvitation(invitation) {
  const now = Date.now()
  let status = invitation.status || 'pending'
  if (status === 'pending' && invitation.expire_time && invitation.expire_time <= now) {
    status = 'expired'
  }
  return {
    id: invitation._id,
    room_id: invitation.room_id || '',
    room_name: invitation.room_name || '',
    room_type: invitation.room_type || 'temp',
    task_id: invitation.task_id || '',
    dept: invitation.dept || '',
    inviter_id: invitation.inviter_id || '',
    inviter_name: invitation.inviter_name || '',
    inviter_badge_no: invitation.inviter_badge_no || '',
    invitee_id: invitation.invitee_id || '',
    invitee_name: invitation.invitee_name || '',
    invitee_badge_no: invitation.invitee_badge_no || '',
    invite_reason: invitation.invite_reason || '',
    status,
    status_text: formatInvitationStatus(status),
    history_policy: invitation.history_policy || 'from_join',
    history_visible_from: invitation.history_visible_from || 0,
    expire_time: invitation.expire_time || 0,
    expire_time_text: formatTime(invitation.expire_time),
    respond_time: invitation.respond_time || 0,
    respond_reason: invitation.respond_reason || '',
    cancelled_by: invitation.cancelled_by || '',
    cancel_reason: invitation.cancel_reason || '',
    create_time: invitation.create_time || 0,
    create_time_text: formatTime(invitation.create_time),
    update_time: invitation.update_time || 0
  }
}

function formatInvitationStatus(status) {
  const map = {
    pending: '待处理',
    accepted: '已接受',
    declined: '已拒绝',
    expired: '已过期',
    cancelled: '已撤销',
    invalid: '已失效'
  }
  return map[status] || status || ''
}

function normalizeMembers(members, memberIds) {
  const list = []
  ;(members || []).forEach(item => {
    if (!item) return
    const officerId = item.officer_id || item._id || item.id
    if (!officerId) return
    list.push({
      officer_id: officerId,
      officer_name: item.officer_name || item.name || item.realName || item.nickname || '',
      badge_no: item.badge_no || item.policeId || ''
    })
  })
  ;(memberIds || []).forEach(id => {
    if (id) list.push({ officer_id: id, officer_name: '', badge_no: '' })
  })
  return list
}

function uniqueMembers(members) {
  const map = {}
  ;(members || []).forEach(item => {
    if (!item.officer_id) return
    map[item.officer_id] = Object.assign({}, map[item.officer_id] || {}, item)
  })
  return Object.keys(map).map(id => map[id])
}

function defaultRoomName(type, dept) {
  if (type === 'department') return `${dept || '警务'}协作群`
  if (type === 'task') return '任务协作群'
  return '临时处置群'
}

function buildLastMessage(message) {
  if (message.message_type === 'image') return '[图片]'
  if (message.message_type === 'location') return '[位置]'
  if (message.message_type === 'task') return '[任务卡片]'
  if (message.message_type === 'system') return message.content || '[系统消息]'
  return message.content || ''
}

function formatRoom(room, member, unread) {
  return {
    id: room._id,
    name: room.name || '',
    type: room.type || 'temp',
    task_id: room.task_id || '',
    dept: room.dept || '',
    created_by: room.created_by || '',
    created_by_name: room.created_by_name || '',
    create_time: room.create_time || 0,
    member_count: room.member_count || (room.member_ids ? room.member_ids.length : 0),
    last_message: room.last_message || '',
    last_message_time: room.last_message_time || room.update_time || room.create_time || 0,
    last_message_time_text: formatTime(room.last_message_time || room.update_time || room.create_time),
    unread_count: unread || 0,
    role: member.role || 'member',
    mute: !!member.mute,
    history_visible_from: member.history_visible_from || 0,
    status: room.status || 'active'
  }
}

function formatMember(member) {
  return {
    id: member._id,
    room_id: member.room_id,
    officer_id: member.officer_id,
    officer_name: member.officer_name || '警务人员',
    badge_no: member.badge_no || '',
    role: member.role || 'member',
    status: member.status || 'active',
    last_read_time: member.last_read_time || 0,
    joined_at: member.joined_at || 0,
    joined_at_text: formatTime(member.joined_at),
    invited_by: member.invited_by || '',
    invite_id: member.invite_id || '',
    history_visible_from: member.history_visible_from || 0
  }
}

function formatMessage(message) {
  return {
    id: message._id,
    room_id: message.room_id,
    sender_id: message.sender_id,
    sender_name: message.sender_name || '',
    sender_badge_no: message.sender_badge_no || '',
    message_type: message.message_type || 'text',
    content: message.content || '',
    file_url: message.file_url || '',
    location: message.location || null,
    task_id: message.task_id || '',
    client_msg_id: message.client_msg_id || '',
    status: message.status || 'normal',
    create_time: message.create_time || 0,
    time_text: formatClock(message.create_time)
  }
}

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const p = n => String(n).padStart(2, '0')
  if (day === today) return `${p(d.getHours())}:${p(d.getMinutes())}`
  if (today - day === 86400000) return `昨天 ${p(d.getHours())}:${p(d.getMinutes())}`
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function formatClock(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const p = n => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}`
}
