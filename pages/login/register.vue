<template>
  <view class="register-page">

    <view class="top-bg">
      <view class="top-circle c1"></view>
      <view class="top-circle c2"></view>
    </view>

    <view class="back-btn" @click="goBack">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M15 18L9 12L15 6" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </view>

    <scroll-view scroll-y class="scroll-wrap" :show-scrollbar="false">
      <view class="content">

        <view class="brand-area">
          <view class="brand-logo">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 4L8 10V20C8 30 24 40 24 40C24 40 40 30 40 20V10L24 4Z"
                fill="rgba(255,255,255,0.2)" stroke="#FFFFFF" stroke-width="2"/>
              <path d="M18 24L22 28L30 20" stroke="#FFFFFF" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
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
              <svg v-if="step > 1" viewBox="0 0 24 24" fill="none" style="width:28rpx;height:28rpx;">
                <path d="M5 13L9 17L19 7" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
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
              <svg class="input-icon" viewBox="0 0 24 24" fill="none">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#C0C4CC"/>
              </svg>
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
              <svg viewBox="0 0 24 24" fill="none" style="width:28rpx;height:28rpx;flex-shrink:0;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#2563EB"/>
              </svg>
              <text class="tip-text">验证码将发送至您的手机，有效期5分钟</text>
            </view>

            <button class="submit-btn" @click="verifyCode">
              <text class="submit-text">下一步</text>
              <svg viewBox="0 0 24 24" fill="none" style="width:32rpx;height:32rpx;">
                <path d="M5 12H19M13 6L19 12L13 18" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </button>
          </view>

          <!-- 第二步 -->
          <view v-if="step === 2">
            <view class="verified-mobile">
              <svg viewBox="0 0 24 24" fill="none" style="width:32rpx;height:32rpx;">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="#10B981" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <text class="verified-text">{{ maskMobile(form.mobile) }} 已验证</text>
            </view>

            <view class="field-label">用户昵称</view>
            <view class="input-row" :class="{ focused: focusField === 'nickname' }">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#C0C4CC"/>
              </svg>
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
              <svg class="input-icon" viewBox="0 0 24 24" fill="none">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="#C0C4CC"/>
              </svg>
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
                <svg viewBox="0 0 24 24" fill="none" style="width:36rpx;height:36rpx;">
                  <path v-if="showPwd" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#909399"/>
                  <path v-else d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z" fill="#909399"/>
                </svg>
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
              <svg class="input-icon" viewBox="0 0 24 24" fill="none">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="#C0C4CC"/>
              </svg>
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
                <svg viewBox="0 0 24 24" fill="none" style="width:36rpx;height:36rpx;">
                  <path v-if="showConfirmPwd" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#909399"/>
                  <path v-else d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z" fill="#909399"/>
                </svg>
              </view>
            </view>

            <view class="match-tip" v-if="form.confirmPassword.length > 0">
              <svg viewBox="0 0 24 24" fill="none" style="width:28rpx;height:28rpx;flex-shrink:0;">
                <path v-if="form.password === form.confirmPassword"
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="#10B981" stroke-width="2" stroke-linecap="round"/>
                <path v-else
                  d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
              </svg>
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
          name: 'gw-user',
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
          name: 'gw-user',
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
          name: 'gw-user',
          data: { action: 'registerByMobile', params: { mobile: this.form.mobile, password, nickname: nickname || '候鸟守护者' } }
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
.back-btn svg { width: 40rpx; height: 40rpx; }

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
.brand-logo svg { width: 44rpx; height: 44rpx; }
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