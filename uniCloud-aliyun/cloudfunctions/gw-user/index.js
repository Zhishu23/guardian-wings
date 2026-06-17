'use strict'

exports.main = async (event, context) => {
  const { action, params = {} } = event
  const db = uniCloud.database()

  try {
    switch (action) {

      // ── 测试连通性 ──────────────────────────
      case 'ping': {
        return { code: 0, msg: 'pong', time: Date.now() }
      }

      // ── 发送验证码（模拟） ──────────────────
      case 'sendSmsCode': {
        const { mobile, scene = 'login' } = params
        if (!mobile) return { code: 1001, msg: '手机号不能为空' }
        if (!/^1[3-9]\d{9}$/.test(mobile)) {
          return { code: 1002, msg: '手机号格式不正确' }
        }
        const mockCode = '123456'
        const expireTime = Date.now() + 5 * 60 * 1000
        try {
          await db.collection('opendb-verify-codes')
            .where({ mobile, type: scene }).remove()
          await db.collection('opendb-verify-codes').add({
            mobile, type: scene, code: mockCode,
            expireTime, createTime: Date.now()
          })
        } catch (dbErr) {
          return { code: 5001, msg: '验证码存储失败: ' + dbErr.message }
        }
        return { code: 0, msg: '验证码已发送', devCode: mockCode }
      }

      // ── 验证码登录 ──────────────────────────
      case 'loginByMobileCode': {
        const { mobile, code } = params
        if (!mobile || !code) {
          return { code: 1003, msg: '手机号和验证码不能为空' }
        }

        let verifyRecord
        try {
          const verifyRes = await db.collection('opendb-verify-codes')
            .where({ mobile, type: 'login', code })
            .limit(1).get()
          if (!verifyRes.data || verifyRes.data.length === 0) {
            return { code: 1005, msg: '验证码错误' }
          }
          verifyRecord = verifyRes.data[0]
        } catch (dbErr) {
          return { code: 5002, msg: '验证码查询失败: ' + dbErr.message }
        }

        if (Date.now() > verifyRecord.expireTime) {
          await db.collection('opendb-verify-codes').doc(verifyRecord._id).remove()
          return { code: 1006, msg: '验证码已过期' }
        }
        await db.collection('opendb-verify-codes').doc(verifyRecord._id).remove()

        let uid, isNewUser = false
        try {
          const userRes = await db.collection('uni-id-users')
            .where({ mobile, role: 'public' }).limit(1).get()

          if (userRes.data && userRes.data.length > 0) {
            uid = userRes.data[0]._id
          } else {
            isNewUser = true
            const newUser = await db.collection('uni-id-users').add({
              mobile,
              mobile_confirmed: 1,
              role: 'public',
              nickname: '候鸟守护者',
              avatar: '',
              points: 0,
              status: 0,
              register_date: Date.now()
            })
            uid = newUser.id
          }
        } catch (dbErr) {
          return { code: 5003, msg: '用户查询失败: ' + dbErr.message }
        }

        const token = `gw_${uid}_${Date.now()}`
        try {
          await db.collection('uni-id-users').doc(uid).update({
            last_login_date: Date.now(),
            token
          })
        } catch (e) {}

        return {
          code: 0,
          msg: isNewUser ? '注册并登录成功' : '登录成功',
          isNewUser,
          uid,
          token,
          tokenExpired: Date.now() + 7 * 24 * 60 * 60 * 1000,
          userInfo: {
            uid,
            mobile: mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
            role: 'public',
            nickname: '候鸟守护者',
            avatar: '',
            points: 0
          }
        }
      }

      // ── 密码登录 ────────────────────────────
      case 'loginByPassword': {
        const { mobile, password } = params
        if (!mobile || !password) {
          return { code: 1007, msg: '手机号和密码不能为空' }
        }

        let user
        try {
          const userRes = await db.collection('uni-id-users')
            .where({ mobile, role: 'public' }).limit(1).get()
          if (!userRes.data || userRes.data.length === 0) {
            return { code: 1010, msg: '该手机号未注册' }
          }
          user = userRes.data[0]
        } catch (dbErr) {
          return { code: 5004, msg: '用户查询失败: ' + dbErr.message }
        }

        if (user.status === 1) {
          return { code: 1011, msg: '账号已被禁用' }
        }
        if (user.password !== password && user.dev_password !== password) {
          return { code: 1012, msg: '密码错误' }
        }

        const token = `gw_${user._id}_${Date.now()}`
        try {
          await db.collection('uni-id-users').doc(user._id).update({
            last_login_date: Date.now(),
            token
          })
        } catch (e) {}

        return {
          code: 0,
          msg: '登录成功',
          uid: user._id,
          token,
          tokenExpired: Date.now() + 7 * 24 * 60 * 60 * 1000,
          userInfo: {
            uid:      user._id,
            mobile:   mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
            role:     'public',
            nickname: user.nickname || '候鸟守护者',
            avatar:   user.avatar   || '',
            points:   user.points   || 0,
            gender:   user.gender   || 0,
            province: user.province || '',
            city:     user.city     || '',
            bio:      user.bio      || ''
          }
        }
      }

      // ── 公务段登录（修复：返回完整字段）──────
      case 'policeLogin': {
        const { policeId, password, department } = params
        if (!policeId || !password || !department) {
          return { code: 2001, msg: '警号、密码、部门均不能为空' }
        }

        let policeUser
        try {
          const userRes = await db.collection('uni-id-users')
            .where({ policeId, role: 'police' }).limit(1).get()
          if (!userRes.data || userRes.data.length === 0) {
            return { code: 2003, msg: '警号不存在，请联系管理员' }
          }
          policeUser = userRes.data[0]
        } catch (dbErr) {
          return { code: 5005, msg: '用户查询失败: ' + dbErr.message }
        }

        if (policeUser.department !== department) {
          return { code: 2004, msg: '部门与警号不匹配' }
        }
        if (policeUser.status === 1) {
          return { code: 2005, msg: '账号已被禁用' }
        }
        if (policeUser.dev_password !== password && policeUser.password !== password) {
          return { code: 2006, msg: '密码错误' }
        }

        const token = `gw_police_${policeUser._id}_${Date.now()}`
        try {
          await db.collection('uni-id-users').doc(policeUser._id).update({
            last_login_date: Date.now(),
            token
          })
        } catch (e) {}

        // ✅ 修复：返回 officer_id 和 badge_no，与 store/SET_POLICE 字段完全对齐
        return {
          code: 0,
          msg: '登录成功',
          uid:   policeUser._id,
          token,
          tokenExpired: Date.now() + 7 * 24 * 60 * 60 * 1000,
          policeInfo: {
            officer_id: policeUser._id,        // ✅ 对齐 store 的 officer_id
            badge_no:   policeUser.policeId,    // ✅ 对齐 store 的 badge_no（警号）
            name:       policeUser.realName || policeUser.nickname || '',  // ✅ 对齐 store 的 name
            department: policeUser.department,  // ✅ 对齐 store 的 department
            role:       'police'
          }
        }
      }

      // ── 获取部门列表 ────────────────────────
      case 'getDepartments': {
        return {
          code: 0,
          msg: 'ok',
          data: [
            '野生动物保护科',
            '森林公安局',
            '生态环境执法大队',
            '自然保护区管理处',
            '渔政执法大队',
            '其他'
          ]
        }
      }

      // ── 获取用户信息 ────────────────────────
      case 'getUserInfo': {
        const { uid } = params
        if (!uid) return { code: 3001, msg: 'uid不能为空' }
        try {
          const res = await db.collection('uni-id-users').doc(uid).get()
          if (!res.data || res.data.length === 0) {
            return { code: 3002, msg: '用户不存在' }
          }
          const user = res.data[0]
          const rawMobile = user.mobile || ''
          return {
            code: 0,
            msg: 'ok',
            data: {
              uid:           user._id,
              nickname:      user.nickname      || '',
              avatar:        user.avatar        || '',
              points:        user.points        || 0,
              role:          user.role          || 'public',
              mobile:        rawMobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
              gender:        user.gender        || 0,
              province:      user.province      || '',
              city:          user.city          || '',
              bio:           user.bio           || '',
              register_date: user.register_date || null,
              status:        user.status        || 0
            }
          }
        } catch (dbErr) {
          return { code: 5006, msg: '查询失败: ' + dbErr.message }
        }
      }

      // ── 更新用户资料 ────────────────────────
      case 'updateProfile': {
        const { uid, nickname, avatar, gender, province, city, bio } = params
        if (!uid) return { code: 3003, msg: 'uid不能为空' }
        const updateData = { update_date: Date.now() }
        if (nickname !== undefined) updateData.nickname = nickname
        if (avatar   !== undefined) updateData.avatar   = avatar
        if (gender   !== undefined) updateData.gender   = gender
        if (province !== undefined) updateData.province = province
        if (city     !== undefined) updateData.city     = city
        if (bio      !== undefined) updateData.bio      = bio
        if (Object.keys(updateData).length === 1) {
          return { code: 3005, msg: '没有需要更新的内容' }
        }
        try {
          await db.collection('uni-id-users').doc(uid).update(updateData)
          return { code: 0, msg: '更新成功' }
        } catch (e) {
          return { code: 5020, msg: '更新失败: ' + e.message }
        }
      }

      // ── 获取用户统计数据 ────────────────────
      case 'getUserStats': {
        const { uid } = params
        if (!uid) return { code: 1040, msg: '缺少uid' }
        try {
          const [reportRes, pendingRes, activityRes] = await Promise.all([
            db.collection('reports').where({ user_id: uid }).count(),
            db.collection('reports').where({ user_id: uid, status: 0 }).count(),
            db.collection('user_activities').where({ user_id: uid }).count()
          ])
          return {
            code: 0,
            data: {
              reports:        reportRes.total   || 0,
              pendingReports: pendingRes.total   || 0,
              activities:     activityRes.total  || 0
            }
          }
        } catch (e) {
          return { code: 0, data: { reports: 0, pendingReports: 0, activities: 0 } }
        }
      }

      // ── 仅验证验证码 ────────────────────────
      case 'verifyCode': {
        const { mobile, code, scene } = params
        if (!mobile || !code) {
          return { code: 1020, msg: '参数不完整' }
        }
        try {
          const verifyRes = await db.collection('opendb-verify-codes')
            .where({ mobile, type: scene || 'login', code })
            .limit(1).get()
          if (!verifyRes.data || verifyRes.data.length === 0) {
            return { code: 1021, msg: '验证码错误' }
          }
          const record = verifyRes.data[0]
          if (Date.now() > record.expireTime) {
            await db.collection('opendb-verify-codes').doc(record._id).remove()
            return { code: 1022, msg: '验证码已过期，请重新获取' }
          }
          return { code: 0, msg: '验证通过' }
        } catch (e) {
          return { code: 5010, msg: '验证失败: ' + e.message }
        }
      }

      // ── 注册 ────────────────────────────────
      case 'registerByMobile': {
        const { mobile, password, nickname } = params
        if (!mobile || !password) {
          return { code: 1013, msg: '参数不完整' }
        }
        const pwdReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,16}$/
        if (!pwdReg.test(password)) {
          return { code: 1014, msg: '密码须含大小写字母和数字，8~16位' }
        }
        try {
          const existRes = await db.collection('uni-id-users')
            .where({ mobile }).limit(1).get()
          if (existRes.data && existRes.data.length > 0) {
            return { code: 1015, msg: '该手机号已注册，请直接登录' }
          }
        } catch (e) {
          return { code: 5011, msg: '查询失败: ' + e.message }
        }
        try {
          const newUser = await db.collection('uni-id-users').add({
            mobile,
            mobile_confirmed: 1,
            role:          'public',
            nickname:      nickname || '候鸟守护者',
            avatar:        '',
            points:        0,
            status:        0,
            gender:        0,
            province:      '',
            city:          '',
            bio:           '',
            dev_password:  password,
            password:      password,
            register_date: Date.now()
          })
          await db.collection('opendb-verify-codes')
            .where({ mobile, type: 'register' }).remove()
          return { code: 0, msg: '注册成功', uid: newUser.id }
        } catch (e) {
          return { code: 5012, msg: '注册失败: ' + e.message }
        }
      }

      // ── 修改密码 ────────────────────────────
      case 'changePassword': {
        const { uid, oldPassword, newPassword } = params
        if (!uid || !oldPassword || !newPassword) {
          return { code: 1040, msg: '参数不完整' }
        }
        if (newPassword.length < 6) {
          return { code: 1041, msg: '新密码至少6位' }
        }
        try {
          const userRes = await db.collection('uni-id-users').doc(uid).get()
          if (!userRes.data || userRes.data.length === 0) {
            return { code: 1042, msg: '用户不存在' }
          }
          const user = userRes.data[0]
          if (user.password !== oldPassword && user.dev_password !== oldPassword) {
            return { code: 1043, msg: '原密码错误' }
          }
          await db.collection('uni-id-users').doc(uid).update({
            password:     newPassword,
            dev_password: newPassword,
            update_date:  Date.now()
          })
          return { code: 0, msg: '密码修改成功' }
        } catch (e) {
          return { code: 5015, msg: '修改失败: ' + e.message }
        }
      }

      // ── 重置密码 ────────────────────────────
      case 'resetPassword': {
        const { mobile, code, newPassword } = params
        if (!mobile || !code || !newPassword) {
          return { code: 1030, msg: '参数不完整' }
        }
        const pwdReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,16}$/
        if (!pwdReg.test(newPassword)) {
          return { code: 1031, msg: '密码须含大小写字母和数字，8~16位' }
        }
        try {
          const verifyRes = await db.collection('opendb-verify-codes')
            .where({ mobile, type: 'reset', code })
            .limit(1).get()
          if (!verifyRes.data || verifyRes.data.length === 0) {
            return { code: 1032, msg: '验证码错误' }
          }
          const record = verifyRes.data[0]
          if (Date.now() > record.expireTime) {
            await db.collection('opendb-verify-codes').doc(record._id).remove()
            return { code: 1033, msg: '验证码已过期' }
          }
          await db.collection('opendb-verify-codes').doc(record._id).remove()
        } catch (e) {
          return { code: 5013, msg: '验证失败: ' + e.message }
        }
        try {
          const userRes = await db.collection('uni-id-users')
            .where({ mobile, role: 'public' }).limit(1).get()
          if (!userRes.data || userRes.data.length === 0) {
            return { code: 1034, msg: '该手机号未注册' }
          }
          const uid = userRes.data[0]._id
          await db.collection('uni-id-users').doc(uid).update({
            password:     newPassword,
            dev_password: newPassword,
            update_date:  Date.now()
          })
          return { code: 0, msg: '密码重置成功' }
        } catch (e) {
          return { code: 5014, msg: '重置失败: ' + e.message }
        }
      }

      default:
        return { code: 9999, msg: `未知操作: ${action}` }
    }

  } catch (e) {
    console.error('[gw-user error]', e)
    return { code: 5000, msg: '服务器错误: ' + e.message }
  }
}
