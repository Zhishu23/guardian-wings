'use strict'

const db = uniCloud.database()
const dbCmd = db.command

function maskMobile(mobile = '') {
  return String(mobile).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

function roleList(role) {
  if (Array.isArray(role)) return role
  if (!role) return []
  return [role]
}

function isStaffUser(user = {}) {
  const roles = roleList(user.role)
  return roles.includes('police') || roles.includes('admin')
}

function isPublicUser(user = {}) {
  return !isStaffUser(user)
}

function isDisabled(user = {}) {
  return user.status === 1 || user.status === 'disabled'
}

async function findPublicUserByMobile(mobile) {
  const res = await db.collection('uni-id-users').where({ mobile }).limit(20).get()
  const list = res.data || []
  const publicUsers = list.filter(isPublicUser)
  if (!publicUsers.length) return null
  return publicUsers.find(user => roleList(user.role).includes('public')) || publicUsers[0]
}

async function hasStaffUserByMobile(mobile) {
  const res = await db.collection('uni-id-users').where({ mobile }).limit(20).get()
  return (res.data || []).some(isStaffUser)
}

async function getPublicUserById(uid) {
  const res = await db.collection('uni-id-users').doc(uid).get()
  const user = res.data && res.data[0]
  if (!user || !isPublicUser(user)) return null
  return user
}

function createToken(uid) {
  return `gw_${uid}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function normalizeUserInfo(user, extra = {}) {
  return {
    uid: user._id || extra.uid || '',
    mobile: maskMobile(user.mobile || extra.mobile || ''),
    role: 'public',
    nickname: user.nickname || '候鸟守护者',
    avatar: user.avatar || '',
    points: user.points || 0,
    gender: user.gender || 0,
    province: user.province || '',
    city: user.city || '',
    bio: user.bio || '',
    register_date: user.register_date || null,
    status: user.status || 0
  }
}

async function sendSmsCode(params = {}) {
  const { mobile, scene = 'login' } = params
  if (!mobile) return { code: 1001, msg: '手机号不能为空' }
  if (!/^1[3-9]\d{9}$/.test(mobile)) return { code: 1002, msg: '手机号格式不正确' }

  const mockCode = '123456'
  const expireTime = Date.now() + 5 * 60 * 1000

  await db.collection('opendb-verify-codes').where({ mobile, type: scene }).remove()
  await db.collection('opendb-verify-codes').add({
    mobile,
    type: scene,
    code: mockCode,
    expireTime,
    createTime: Date.now()
  })

  return { code: 0, msg: '验证码已发送', devCode: mockCode }
}

async function verifySmsCode(params = {}, options = {}) {
  const { mobile, code, scene = 'login' } = params
  const { removeOnSuccess = false } = options
  if (!mobile || !code) return { code: 1020, msg: '参数不完整' }

  const verifyRes = await db.collection('opendb-verify-codes')
    .where({ mobile, type: scene, code })
    .orderBy('createTime', 'desc')
    .limit(1)
    .get()

  if (!verifyRes.data || verifyRes.data.length === 0) {
    return { code: 1021, msg: '验证码错误' }
  }

  const record = verifyRes.data[0]
  if (Date.now() > record.expireTime) {
    await db.collection('opendb-verify-codes').doc(record._id).remove()
    return { code: 1022, msg: '验证码已过期，请重新获取' }
  }

  if (removeOnSuccess) {
    await db.collection('opendb-verify-codes').doc(record._id).remove()
  }

  return { code: 0, msg: '验证通过' }
}

async function finishLogin(user, isNewUser = false) {
  const uid = user._id
  const token = createToken(uid)
  const tokenExpired = Date.now() + 7 * 24 * 60 * 60 * 1000

  await db.collection('uni-id-users').doc(uid).update({
    role: 'public',
    last_login_date: Date.now(),
    token,
    token_expired: tokenExpired
  })

  return {
    code: 0,
    msg: isNewUser ? '注册并登录成功' : '登录成功',
    isNewUser,
    uid,
    token,
    tokenExpired,
    userInfo: normalizeUserInfo({ ...user, role: 'public' })
  }
}

exports.main = async (event, context) => {
  const { action, params = {} } = event || {}

  try {
    switch (action) {
      case 'ping':
        return { code: 0, msg: 'pong', time: Date.now() }

      case 'sendSmsCode':
        return await sendSmsCode(params)

      case 'verifyCode':
        return await verifySmsCode({
          mobile: params.mobile,
          code: params.code,
          scene: params.scene || 'login'
        })

      case 'loginByMobileCode': {
        const verify = await verifySmsCode({
          mobile: params.mobile,
          code: params.code,
          scene: 'login'
        }, { removeOnSuccess: true })
        if (verify.code !== 0) return verify

        let user = await findPublicUserByMobile(params.mobile)
        let isNewUser = false

        if (!user) {
          if (await hasStaffUserByMobile(params.mobile)) {
            return { code: 1016, msg: '该手机号不能用于公众端登录' }
          }

          const addRes = await db.collection('uni-id-users').add({
            mobile: params.mobile,
            mobile_confirmed: 1,
            role: 'public',
            nickname: '候鸟守护者',
            avatar: '',
            points: 0,
            status: 0,
            gender: 0,
            province: '',
            city: '',
            bio: '',
            register_date: Date.now()
          })
          user = await getPublicUserById(addRes.id)
          isNewUser = true
        }

        if (isDisabled(user)) return { code: 1011, msg: '账号已被禁用' }
        return await finishLogin(user, isNewUser)
      }

      case 'loginByPassword': {
        const { mobile, password } = params
        if (!mobile || !password) return { code: 1007, msg: '手机号和密码不能为空' }

        const user = await findPublicUserByMobile(mobile)
        if (!user) return { code: 1010, msg: '该手机号未注册公众端账号' }
        if (isDisabled(user)) return { code: 1011, msg: '账号已被禁用' }
        if (user.password !== password && user.dev_password !== password) {
          return { code: 1012, msg: '密码错误' }
        }

        return await finishLogin(user)
      }

      case 'getUserInfo': {
        const { uid } = params
        if (!uid) return { code: 3001, msg: 'uid不能为空' }
        const user = await getPublicUserById(uid)
        if (!user) return { code: 3002, msg: '用户不存在' }
        return { code: 0, msg: 'ok', data: normalizeUserInfo(user) }
      }

      case 'updateProfile': {
        const { uid, nickname, avatar, gender, province, city, bio } = params
        if (!uid) return { code: 3003, msg: 'uid不能为空' }
        const user = await getPublicUserById(uid)
        if (!user) return { code: 3002, msg: '用户不存在' }

        const updateData = { update_date: Date.now(), role: 'public' }
        if (nickname !== undefined) updateData.nickname = nickname
        if (avatar !== undefined) updateData.avatar = avatar
        if (gender !== undefined) updateData.gender = Number(gender) || 0
        if (province !== undefined) updateData.province = province
        if (city !== undefined) updateData.city = city
        if (bio !== undefined) updateData.bio = bio

        await db.collection('uni-id-users').doc(uid).update(updateData)
        return { code: 0, msg: '更新成功' }
      }

      case 'getUserStats': {
        const { uid } = params
        if (!uid) return { code: 1040, msg: '缺少uid' }
        const userWhere = dbCmd.or([{ user_id: uid }, { userId: uid }])
        const [reportRes, pendingRes, activityRes] = await Promise.all([
          db.collection('reports').where(userWhere).count(),
          db.collection('reports').where(dbCmd.and([userWhere, { status: dbCmd.in([0, 'pending', 'processing']) }])).count(),
          db.collection('user_activities').where({ user_id: uid }).count()
        ])
        return {
          code: 0,
          data: {
            reports: reportRes.total || 0,
            pendingReports: pendingRes.total || 0,
            activities: activityRes.total || 0
          }
        }
      }

      case 'registerByMobile': {
        const { mobile, password, nickname, code } = params
        if (!mobile || !password) return { code: 1013, msg: '参数不完整' }
        if (!/^1[3-9]\d{9}$/.test(mobile)) return { code: 1002, msg: '手机号格式不正确' }

        const pwdReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,16}$/
        if (!pwdReg.test(password)) {
          return { code: 1014, msg: '密码需包含大小写字母和数字，长度8-16位' }
        }

        const existingPublicUser = await findPublicUserByMobile(mobile)
        if (existingPublicUser) return { code: 1015, msg: '该手机号已注册，请直接登录' }
        if (await hasStaffUserByMobile(mobile)) {
          return { code: 1016, msg: '该手机号不能用于公众端注册' }
        }

        if (code) {
          const verify = await verifySmsCode({ mobile, code, scene: 'register' }, { removeOnSuccess: true })
          if (verify.code !== 0) return verify
        }

        const addRes = await db.collection('uni-id-users').add({
          mobile,
          mobile_confirmed: 1,
          role: 'public',
          nickname: nickname || '候鸟守护者',
          avatar: '',
          points: 0,
          status: 0,
          gender: 0,
          province: '',
          city: '',
          bio: '',
          dev_password: password,
          password,
          register_date: Date.now(),
          update_date: Date.now()
        })

        if (!code) await db.collection('opendb-verify-codes').where({ mobile, type: 'register' }).remove()
        return { code: 0, msg: '注册成功', uid: addRes.id }
      }

      case 'changePassword': {
        const { uid, oldPassword, newPassword } = params
        if (!uid || !oldPassword || !newPassword) return { code: 1040, msg: '参数不完整' }
        const user = await getPublicUserById(uid)
        if (!user) return { code: 1042, msg: '用户不存在' }
        if (user.password !== oldPassword && user.dev_password !== oldPassword) {
          return { code: 1043, msg: '原密码错误' }
        }

        await db.collection('uni-id-users').doc(uid).update({
          password: newPassword,
          dev_password: newPassword,
          update_date: Date.now()
        })
        return { code: 0, msg: '密码修改成功' }
      }

      case 'resetPassword': {
        const { mobile, code, newPassword } = params
        if (!mobile || !code || !newPassword) return { code: 1030, msg: '参数不完整' }

        const pwdReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,16}$/
        if (!pwdReg.test(newPassword)) {
          return { code: 1031, msg: '密码需包含大小写字母和数字，长度8-16位' }
        }

        const verify = await verifySmsCode({ mobile, code, scene: 'reset' }, { removeOnSuccess: true })
        if (verify.code !== 0) return verify

        const user = await findPublicUserByMobile(mobile)
        if (!user) return { code: 1034, msg: '该手机号未注册' }

        await db.collection('uni-id-users').doc(user._id).update({
          password: newPassword,
          dev_password: newPassword,
          update_date: Date.now()
        })

        return { code: 0, msg: '密码重置成功' }
      }

      default:
        return { code: 9999, msg: `未知操作: ${action}` }
    }
  } catch (e) {
    console.error('[gw-public-user error]', e)
    return { code: 5000, msg: '服务器错误: ' + e.message }
  }
}
