<template>
  <view class="register-page">

    <view class="top-bg">
      <view class="top-circle c1"></view>
      <view class="top-circle c2"></view>
    </view>

    <view class="back-btn" @click="goBack">
      <uni-icons type="back" size="24" color="#FFFFFF" />
    </view>

    <scroll-view scroll-y class="scroll-wrap" :show-scrollbar="false">
      <view class="content">

        <view class="brand-area">
          <view class="brand-logo">
            <uni-icons type="auth-filled" size="28" color="#FFFFFF" />
          </view>
          <view class="brand-text">
            <text class="brand-name">翼路平安</text>
            <text class="brand-sub">Guardian Wings</text>
          </view>
        </view>

        <view class="header">
          <text class="title">创建账号</text>
          <text class="subtitle">加入翼路平安，共同守护候鸟</text>
        </view>

        <view class="steps">
          <view class="step" :class="{ active: step >= 1, done: step > 1 }">
            <view class="step-dot">
              <uni-icons v-if="step > 1" type="checkmarkempty" size="16" color="#2563EB" />
              <text v-else class="dot-num">1</text>
            </view>
            <text class="step-label">验证手机</text>
          </view>
          <view class="step-line" :class="{ active: step > 1 }"></view>
          <view class="step" :class="{ active: step >= 2 }">
            <view class="step-dot">
              <text class="dot-num">2</text>
            </view>
            <text class="step-label">设置密码</text>
          </view>
        </view>

        <view class="form-card">

          <!-- 第一步 -->
          <view v-if="step === 1">
            <view class="field-label">手机号码</view>
            <view class="input-row" :class="{ focused: focusField === 'mobile' }">
              <view class="input-prefix">
                <text class="prefix-text">+86</text>
                <view class="prefix-divider"></view>
              </view>
              <input
                class="input-field"
                v-model="form.mobile"
                type="number"
                maxlength="11"
                placeholder="请输入手机号"
                placeholder-style="color:#C0C4CC;font-size:28rpx;"
                @focus="focusField = 'mobile'"
                @blur="focusField = ''"
              />
            </view>

            <view class="field-label">验证码</view>
            <view class="input-row code-row" :class="{ focused: focusField === 'code' }">
              <uni-icons class="input-icon" type="email-filled" size="21" color="#C0C4CC" />
              <input
                class="input-field"
                v-model="form.code"
                type="number"
                maxlength="6"
                placeholder="6位验证码"
                placeholder-style="color:#C0C4CC;font-size:28rpx;"
                @focus="focusField = 'code'"
                @blur="focusField = ''"
              />
              <button class="code-btn" :disabled="counting" @click="sendCode">
                <text>{{ counting ? countdown + 's' : '获取验证码' }}</text>
              </button>
            </view>

            <view class="tip-bar">
              <uni-icons type="info-filled" size="16" color="#2563EB" />
              <text class="tip-text">验证码将发送至您的手机，有效期5分钟</text>
            </view>

            <button class="submit-btn" @click="verifyCode">
              <text class="submit-text">下一步</text>
              <uni-icons type="right" size="18" color="#FFFFFF" />
            </button>
          </view>

          <!-- 第二步 -->
          <view v-if="step === 2">
            <view class="verified-mobile">
              <uni-icons type="checkbox-filled" size="18" color="#10B981" />
              <text class="verified-text">{{ maskMobile(form.mobile) }} 已验证</text>
            </view>

            <view class="field-label">用户昵称</view>
            <view class="input-row" :class="{ focused: focusField === 'nickname' }">
              <uni-icons class="input-icon" type="person-filled" size="21" color="#C0C4CC" />
              <input
                class="input-field"
                v-model="form.nickname"
                maxlength="15"
                placeholder="请输入昵称（选填）"
                placeholder-style="color:#C0C4CC;font-size:28rpx;"
                @focus="focusField = 'nickname'"
                @blur="focusField = ''"
              />
            </view>

            <view class="field-label">设置密码</view>
            <view class="input-row" :class="{ focused: focusField === 'password' }">
              <uni-icons class="input-icon" type="locked-filled" size="21" color="#C0C4CC" />
              <input
                class="input-field"
                v-model="form.password"
                :password="!showPwd"
                placeholder="请设置密码"
                placeholder-style="color:#C0C4CC;font-size:28rpx;"
                @focus="focusField = 'password'"
                @blur="focusField = ''"
              />
              <view class="eye-btn" @click="showPwd = !showPwd">
                <uni-icons :type="showPwd ? 'eye-filled' : 'eye-slash-filled'" size="20" color="#909399" />
              </view>
            </view>

            <view class="pwd-strength" v-if="form.password.length > 0">
              <view class="strength-bars">
                <view class="strength-bar" :class="pwdStrength >= 1 ? 'bar-' + pwdStrengthColor : 'bar-empty'"></view>
                <view class="strength-bar" :class="pwdStrength >= 2 ? 'bar-' + pwdStrengthColor : 'bar-empty'"></view>
                <view class="strength-bar" :class="pwdStrength >= 3 ? 'bar-' + pwdStrengthColor : 'bar-empty'"></view>
              </view>
              <text class="strength-label" :style="{color: strengthColors[pwdStrengthColor]}">{{ pwdStrengthLabel }}</text>
            </view>

            <view class="field-label">确认密码</view>
            <view class="input-row" :class="{ focused: focusField === 'confirm' }">
              <uni-icons class="input-icon" type="locked-filled" size="21" color="#C0C4CC" />
              <input
                class="input-field"
                v-model="form.confirmPassword"
                :password="!showConfirmPwd"
                placeholder="请再次输入密码"
                placeholder-style="color:#C0C4CC;font-size:28rpx;"
                @focus="focusField = 'confirm'"
                @blur="focusField = ''"
              />
              <view class="eye-btn" @click="showConfirmPwd = !showConfirmPwd">
                <uni-icons :type="showConfirmPwd ? 'eye-filled' : 'eye-slash-filled'" size="20" color="#909399" />
              </view>
            </view>

            <view class="match-tip" v-if="form.confirmPassword.length > 0">
              <uni-icons
                :type="form.password === form.confirmPassword ? 'checkbox-filled' : 'info-filled'"
                size="16"
                :color="form.password === form.confirmPassword ? '#10B981' : '#EF4444'"
              />
              <text :style="{color: form.password === form.confirmPassword ? '#10B981' : '#EF4444', fontSize: '22rpx'}">
                {{ form.password === form.confirmPassword ? '密码匹配' : '两次密码不一致' }}
              </text>
            </view>

            <view class="pwd-rule">
              <text class="pwd-rule-text">密码须包含大小写字母和数字，长度8~16位</text>
            </view>

            <button class="submit-btn" :class="{'btn-loading': loading}" @click="handleRegister">
              <text class="submit-text">{{ loading ? '注册中...' : '完成注册' }}</text>
            </button>
          </view>

        </view>

        <view class="login-row">
          <text class="login-tip">已有账号？</text>
          <text class="login-link" @click="goLogin">立即登录</text>
        </view>

      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      step: 1,
      form: {
        mobile: '', code: '', nickname: '',
        password: '', confirmPassword: ''
      },
      showPwd: false, showConfirmPwd: false,
      loading: false, counting: false,
      countdown: 60, countTimer: null,
      focusField: '',
      strengthColors: { weak: '#EF4444', medium: '#F59E0B', strong: '#10B981' }
    }
  },

  computed: {
    pwdStrength() {
      const p = this.form.password
      if (!p) return 0
      let s = 0
      if (p.length >= 8) s++
      if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++
      if (/\d/.test(p)) s++
      return s
    },
    pwdStrengthColor() {
      return ['', 'weak', 'medium', 'strong'][this.pwdStrength] || 'weak'
    },
    pwdStrengthLabel() {
      return ['', '弱', '中', '强'][this.pwdStrength] || ''
    }
  },

  onUnload() {
    if (this.countTimer) clearInterval(this.countTimer)
  },

  methods: {
    maskMobile(m) {
      if (!m) return ''
      return m.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    },
    goBack() {
      if (this.step === 2) { this.step = 1 } else { uni.navigateBack() }
    },
    goLogin() { uni.navigateBack() },

    async sendCode() {
      if (!/^1[3-9]\d{9}$/.test(this.form.mobile)) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' }); return
      }
      if (this.counting) return
      try {
        uni.showLoading({ title: '发送中...' })
        const res = await uniCloud.callFunction({
          name: 'gw-public-user',
          data: { action: 'sendSmsCode', params: { mobile: this.form.mobile, scene: 'register' } }
        })
        uni.hideLoading()
        if (res.result.code === 0) {
          uni.showModal({
            title: '开发模式',
            content: '验证码：' + res.result.devCode + '\n（正式上线后通过短信发送）',
            showCancel: false
          })
          this.counting = true; this.countdown = 60
          this.countTimer = setInterval(() => {
            this.countdown--
            if (this.countdown <= 0) {
              clearInterval(this.countTimer)
              this.counting = false; this.countdown = 60
            }
          }, 1000)
        } else {
          uni.showToast({ title: res.result.msg, icon: 'none' })
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '发送失败，请重试', icon: 'none' })
      }
    },

    async verifyCode() {
      if (!this.form.mobile) { uni.showToast({ title: '请输入手机号', icon: 'none' }); return }
      if (!/^1[3-9]\d{9}$/.test(this.form.mobile)) { uni.showToast({ title: '手机号格式不正确', icon: 'none' }); return }
      if (!this.form.code || this.form.code.length !== 6) { uni.showToast({ title: '请输入6位验证码', icon: 'none' }); return }
      uni.showLoading({ title: '验证中...' })
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-public-user',
          data: { action: 'verifyCode', params: { mobile: this.form.mobile, code: this.form.code, scene: 'register' } }
        })
        uni.hideLoading()
        if (res.result.code === 0) { this.step = 2 }
        else { uni.showToast({ title: res.result.msg, icon: 'none' }) }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '验证失败，请重试', icon: 'none' })
      }
    },

    async handleRegister() {
      const { password, confirmPassword, nickname } = this.form
      const pwdReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,16}$/
      if (!password) { uni.showToast({ title: '请设置密码', icon: 'none' }); return }
      if (!pwdReg.test(password)) { uni.showToast({ title: '密码须含大小写字母和数字，8~16位', icon: 'none', duration: 3000 }); return }
      if (password !== confirmPassword) { uni.showToast({ title: '两次密码不一致', icon: 'none' }); return }
      if (this.loading) return
      this.loading = true
      uni.showLoading({ title: '注册中...' })
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-public-user',
          data: {
            action: 'registerByMobile',
            params: {
              mobile: this.form.mobile,
              code: this.form.code,
              password,
              nickname: nickname || '候鸟守护者'
            }
          }
        })
        uni.hideLoading(); this.loading = false
        if (res.result.code === 0) {
          uni.showToast({ title: '注册成功', icon: 'success' })
          setTimeout(() => {
            uni.redirectTo({ url: '/pages/login/public-login?mobile=' + this.form.mobile })
          }, 800)
        } else {
          uni.showToast({ title: res.result.msg, icon: 'none', duration: 2500 })
        }
      } catch (e) {
        uni.hideLoading(); this.loading = false
        uni.showToast({ title: '网络错误，请重试', icon: 'none' })
      }
    }
  }
}
</script>

<style scoped lang="scss">
page { background: #FFFFFF; }

.register-page {
  min-height: 100vh;
  background: #FFFFFF;
  position: relative;
}

/* 顶部：蓝色渐变到完全透明白色，无生硬边框 */
.top-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 620rpx;
  background: linear-gradient(
    180deg,
    #1B4B8C 0%,
    #2563EB 30%,
    #60A5FA 60%,
    rgba(255,255,255,0) 100%
  );
  overflow: hidden;
}
.top-circle {
  position: absolute; border-radius: 50%;
  background: rgba(255,255,255,0.07);
}
.c1 { width: 380rpx; height: 380rpx; top: -100rpx; right: -80rpx; }
.c2 { width: 240rpx; height: 240rpx; top: 220rpx; left: -70rpx; }

/* 返回按钮 */
.back-btn {
  position: absolute; top: 80rpx; left: 32rpx;
  width: 72rpx; height: 72rpx;
  background: rgba(255,255,255,0.2);
  border: 1rpx solid rgba(255,255,255,0.35);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  z-index: 10;
}

.scroll-wrap { height: 100vh; }
.content { padding: 100rpx 40rpx 80rpx; position: relative; z-index: 1; }

/* 品牌区 */
.brand-area {
  display: flex; align-items: center; gap: 20rpx;
  margin-bottom: 24rpx; padding-top: 16rpx;
}
.brand-logo {
  width: 68rpx; height: 68rpx;
  background: rgba(255,255,255,0.2); border-radius: 16rpx;
  display: flex; align-items: center; justify-content: center;
}
.brand-text { display: flex; flex-direction: column; gap: 4rpx; }
.brand-name { font-size: 28rpx; font-weight: bold; color: #FFFFFF; }
.brand-sub  { font-size: 20rpx; color: rgba(255,255,255,0.75); }

/* 标题 */
.header { margin-bottom: 28rpx; }
.title {
  display: block; font-size: 48rpx; font-weight: 700;
  color: #FFFFFF; letter-spacing: 2rpx; margin-bottom: 10rpx;
}
.subtitle { display: block; font-size: 26rpx; color: rgba(255,255,255,0.88); }

/* 步骤条 */
.steps {
  display: flex; align-items: center; margin-bottom: 36rpx;
}
.step { display: flex; flex-direction: column; align-items: center; gap: 10rpx; }
.step-dot {
  width: 52rpx; height: 52rpx; border-radius: 50%;
  background: rgba(255,255,255,0.22);
  border: 2rpx solid rgba(255,255,255,0.45);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s;
}
.dot-num { font-size: 24rpx; color: rgba(255,255,255,0.75); font-weight: 700; }
.step.active .step-dot {
  background: #FFFFFF; border-color: #FFFFFF;
  box-shadow: 0 4rpx 16rpx rgba(255,255,255,0.35);
}
.step.active .dot-num { color: #2563EB; }
.step.done .step-dot { background: #FFFFFF; border-color: #FFFFFF; }
.step-label { font-size: 23rpx; color: rgba(255,255,255,0.65); font-weight: 500; }
.step.active .step-label { color: #FFFFFF; font-weight: 700; }
.step-line {
  flex: 1; height: 3rpx; margin: 0 16rpx; margin-bottom: 32rpx;
  background: rgba(255,255,255,0.3); border-radius: 2rpx; transition: all 0.3s;
}
.step-line.active { background: #FFFFFF; }

/* 表单卡片 */
.form-card {
  background: #FFFFFF; border-radius: 28rpx;
  padding: 44rpx 36rpx;
  box-shadow: 0 8rpx 40rpx rgba(27,75,140,0.10);
}

.field-label {
  font-size: 24rpx; font-weight: 600; color: #606266;
  margin-bottom: 12rpx; padding-left: 4rpx;
}

.input-row {
  display: flex; align-items: center; height: 100rpx;
  background: #F5F7FA; border-radius: 14rpx; margin-bottom: 24rpx;
  border: 2rpx solid transparent; transition: all 0.25s; overflow: hidden;
}
.input-row.focused {
  background: #EFF6FF; border-color: #2563EB;
  box-shadow: 0 0 0 4rpx rgba(37,99,235,0.08);
}
.input-prefix {
  display: flex; align-items: center;
  padding: 0 16rpx 0 24rpx; flex-shrink: 0;
}
.prefix-text { font-size: 28rpx; color: #303133; font-weight: 600; }
.prefix-divider { width: 2rpx; height: 30rpx; background: #DCDFE6; margin-left: 16rpx; }
.input-icon { width: 38rpx; height: 38rpx; flex-shrink: 0; margin: 0 14rpx 0 22rpx; }
.code-row { padding-right: 0; }
.input-field { flex: 1; font-size: 28rpx; color: #303133; padding: 0 16rpx; }
.eye-btn {
  width: 72rpx; height: 72rpx; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}

.code-btn {
  height: 100rpx; padding: 0 28rpx;
  background: linear-gradient(135deg, #1B4B8C, #2563EB);
  color: #FFFFFF; font-size: 24rpx; font-weight: 500;
  border: none; border-radius: 0 14rpx 14rpx 0;
  white-space: nowrap;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.code-btn::after { border: none; }
.code-btn[disabled] { background: #DCDFE6; color: #909399; }

.tip-bar {
  display: flex; align-items: center; gap: 10rpx;
  background: rgba(37,99,235,0.05); border-radius: 10rpx;
  padding: 14rpx 16rpx; margin-bottom: 32rpx;
}
.tip-text { font-size: 22rpx; color: #2563EB; line-height: 1.5; flex: 1; }

.verified-mobile {
  display: flex; align-items: center; gap: 12rpx;
  background: rgba(16,185,129,0.06); border: 1rpx solid rgba(16,185,129,0.2);
  border-radius: 12rpx; padding: 16rpx 20rpx; margin-bottom: 28rpx;
}
.verified-text { font-size: 24rpx; color: #059669; font-weight: 500; }

.pwd-strength {
  display: flex; align-items: center; gap: 12rpx;
  margin: -12rpx 0 20rpx; padding-left: 4rpx;
}
.strength-bars { display: flex; gap: 8rpx; }
.strength-bar { width: 56rpx; height: 8rpx; border-radius: 4rpx; transition: all 0.3s; }
.bar-empty  { background: #E5E7EB; }
.bar-weak   { background: #EF4444; }
.bar-medium { background: #F59E0B; }
.bar-strong { background: #10B981; }
.strength-label { font-size: 22rpx; font-weight: 600; }

.match-tip {
  display: flex; align-items: center; gap: 8rpx;
  margin: -12rpx 0 16rpx; padding-left: 4rpx;
}

.pwd-rule { margin-bottom: 32rpx; padding-left: 4rpx; }
.pwd-rule-text { font-size: 21rpx; color: #909399; line-height: 1.6; }

.submit-btn {
  width: 100%; height: 104rpx;
  background: linear-gradient(135deg, #1B4B8C 0%, #2563EB 100%);
  border-radius: 20rpx; border: none;
  display: flex; align-items: center; justify-content: center; gap: 12rpx;
  box-shadow: 0 10rpx 28rpx rgba(27,75,140,0.3); transition: opacity 0.2s;
}
.submit-btn::after { border: none; }
.submit-btn.btn-loading { opacity: 0.75; }
.submit-text { font-size: 32rpx; font-weight: 600; color: #FFFFFF; letter-spacing: 4rpx; }

.login-row {
  display: flex; justify-content: center; align-items: center;
  margin-top: 48rpx; gap: 8rpx;
}
.login-tip  { font-size: 28rpx; color: #909399; }
.login-link { font-size: 28rpx; color: #2563EB; font-weight: 600; }
</style>
