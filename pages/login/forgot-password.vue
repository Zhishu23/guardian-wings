<template>
  <view class="forgot-page">
    <view class="top-decoration" />

    <view class="back-btn" @click="goBack">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18l-6-6 6-6" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </view>

    <scroll-view scroll-y class="scroll-wrap">
      <view class="content">
        <view class="header">
          <text class="title">忘记登录密码</text>
          <text class="subtitle">通过手机验证码重置密码</text>
        </view>

        <view class="form-card">
          <!-- 手机号 -->
          <view class="field-label">请输入手机号</view>
          <view class="input-row" :class="{ focused: focusField === 'mobile' }">
            <svg class="input-icon" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#9CA3AF"/>
            </svg>
            <input
              class="input-field"
              v-model="form.mobile"
              type="number"
              maxlength="11"
              placeholder="请输入手机号"
              placeholder-class="ph"
              @focus="focusField = 'mobile'"
              @blur="focusField = ''"
            />
          </view>

          <!-- 验证码 -->
          <view class="field-label">请输入验证码</view>
          <view class="input-row code-row" :class="{ focused: focusField === 'code' }">
            <svg class="input-icon" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#9CA3AF"/>
            </svg>
            <input
              class="input-field"
              v-model="form.code"
              type="number"
              maxlength="6"
              placeholder="请输入验证码"
              placeholder-class="ph"
              @focus="focusField = 'code'"
              @blur="focusField = ''"
            />
            <button class="code-btn" :disabled="counting" @click="sendCode">
              {{ counting ? `${countdown}s` : '获取验证码' }}
            </button>
          </view>

          <!-- 新密码 -->
          <view class="field-label">请设置新的登录密码</view>
          <view class="input-row" :class="{ focused: focusField === 'password' }">
            <svg class="input-icon" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="#9CA3AF"/>
            </svg>
            <input
              class="input-field"
              v-model="form.password"
              :password="!showPwd"
              placeholder="请设置新的登录密码"
              placeholder-class="ph"
              @focus="focusField = 'password'"
              @blur="focusField = ''"
            />
            <view class="eye-btn" @click="showPwd = !showPwd">
              <svg viewBox="0 0 24 24">
                <path v-if="showPwd" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#9CA3AF"/>
                <path v-else d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="#9CA3AF"/>
              </svg>
            </view>
          </view>

          <!-- 确认密码 -->
          <view class="field-label">请再次输入密码</view>
          <view class="input-row" :class="{ focused: focusField === 'confirm' }">
            <svg class="input-icon" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="#9CA3AF"/>
            </svg>
            <input
              class="input-field"
              v-model="form.confirmPassword"
              :password="!showConfirmPwd"
              placeholder="请再次输入密码"
              placeholder-class="ph"
              @focus="focusField = 'confirm'"
              @blur="focusField = ''"
            />
            <view class="eye-btn" @click="showConfirmPwd = !showConfirmPwd">
              <svg viewBox="0 0 24 24">
                <path v-if="showConfirmPwd" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#9CA3AF"/>
                <path v-else d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="#9CA3AF"/>
              </svg>
            </view>
          </view>

          <text class="pwd-hint">必须包含大小写字母和数字的组合，长度8~16位</text>

          <button class="submit-btn" :loading="loading" @click="handleReset">
            <text v-if="!loading">确认重置</text>
          </button>
        </view>

        <view class="back-login-row">
          <text class="back-login-link" @click="goBack">返回登录</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: { mobile: '', code: '', password: '', confirmPassword: '' },
      showPwd: false,
      showConfirmPwd: false,
      loading: false,
      counting: false,
      countdown: 60,
      countTimer: null,
      focusField: ''
    }
  },

  onUnload() {
    if (this.countTimer) clearInterval(this.countTimer)
  },

  methods: {
    goBack() {
      uni.navigateBack()
    },

    async sendCode() {
      if (!/^1[3-9]\d{9}$/.test(this.form.mobile)) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
        return
      }
      if (this.counting) return

      try {
        uni.showLoading({ title: '发送中...' })
        const res = await uniCloud.callFunction({
          name: 'gw-user',
          data: { action: 'sendSmsCode', params: { mobile: this.form.mobile, scene: 'reset' } }
        })
        uni.hideLoading()
        if (res.result.code === 0) {
          uni.showModal({
            title: '开发模式',
            content: `验证码：${res.result.devCode}`,
            showCancel: false
          })
          this.counting = true
          this.countdown = 60
          this.countTimer = setInterval(() => {
            this.countdown--
            if (this.countdown <= 0) {
              clearInterval(this.countTimer)
              this.counting = false
              this.countdown = 60
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

    async handleReset() {
      const { mobile, code, password, confirmPassword } = this.form
      const pwdReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,16}$/

      if (!mobile || !code) {
        uni.showToast({ title: '请填写手机号和验证码', icon: 'none' })
        return
      }
      if (!password) {
        uni.showToast({ title: '请设置新密码', icon: 'none' })
        return
      }
      if (!pwdReg.test(password)) {
        uni.showToast({ title: '密码须含大小写字母和数字，8~16位', icon: 'none', duration: 3000 })
        return
      }
      if (password !== confirmPassword) {
        uni.showToast({ title: '两次密码不一致', icon: 'none' })
        return
      }
      if (this.loading) return

      this.loading = true
      uni.showLoading({ title: '重置中...' })

      try {
        const res = await uniCloud.callFunction({
          name: 'gw-user',
          data: {
            action: 'resetPassword',
            params: { mobile, code, newPassword: password }
          }
        })
        uni.hideLoading()
        this.loading = false

        if (res.result.code === 0) {
          uni.showModal({
            title: '重置成功',
            content: '密码已重置，请使用新密码登录',
            showCancel: false,
            success: () => {
              uni.navigateBack()
            }
          })
        } else {
          uni.showToast({ title: res.result.msg, icon: 'none', duration: 2500 })
        }
      } catch (e) {
        uni.hideLoading()
        this.loading = false
        uni.showToast({ title: '网络错误，请重试', icon: 'none' })
      }
    }
  }
}
</script>

<style scoped lang="scss">
page { background: #F5F6FA; }

.forgot-page {
  min-height: 100vh;
  background: #F5F6FA;
  position: relative;
}

.top-decoration {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 260rpx;
  background: linear-gradient(135deg, #6C63FF 0%, #4F46E5 100%);
  border-radius: 0 0 60rpx 60rpx;
}

.back-btn {
  position: absolute;
  top: 88rpx; left: 32rpx;
  width: 64rpx; height: 64rpx;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  z-index: 10;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
}
.back-btn svg { width: 36rpx; height: 36rpx; }

.scroll-wrap { height: 100vh; }

.content { padding: 180rpx 40rpx 80rpx; }

.header { margin-bottom: 40rpx; }
.title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #1A1A2E;
}
.subtitle {
  display: block;
  font-size: 26rpx;
  color: #6B7280;
  margin-top: 10rpx;
}

.form-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 8rpx 40rpx rgba(108,99,255,0.10);
}

.field-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16rpx;
  padding-left: 4rpx;
}

.input-row {
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  height: 100rpx;
  background: #F5F6FA;
  border-radius: 16rpx;
  margin-bottom: 32rpx;
  border: 2rpx solid transparent;
  transition: all 0.25s;
}
.input-row.focused {
  background: #fff;
  border-color: #6C63FF;
  box-shadow: 0 0 0 6rpx rgba(108,99,255,0.10);
}
.code-row { padding-right: 0; }
.input-icon { width: 40rpx; height: 40rpx; flex-shrink: 0; margin-right: 20rpx; }
.input-icon svg { width: 100%; height: 100%; }
.input-field { flex: 1; font-size: 30rpx; color: #1A1A2E; }
.ph { color: #C0C0C8; }
.eye-btn { width: 44rpx; height: 44rpx; display: flex; align-items: center; justify-content: center; }
.eye-btn svg { width: 40rpx; height: 40rpx; }

.code-btn {
  height: 100rpx;
  padding: 0 28rpx;
  background: #6C63FF;
  color: #fff;
  font-size: 24rpx;
  border: none;
  border-radius: 0 16rpx 16rpx 0;
  white-space: nowrap;
  display: flex;
  align-items: center;
}
.code-btn::after { border: none; }
.code-btn[disabled] { background: #E5E7EB; color: #9CA3AF; }

.pwd-hint {
  display: block;
  font-size: 22rpx;
  color: #9CA3AF;
  margin-bottom: 32rpx;
  padding-left: 4rpx;
  line-height: 1.6;
}

.submit-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #6C63FF 0%, #4F46E5 100%);
  color: #fff;
  border-radius: 20rpx;
  font-size: 34rpx;
  font-weight: 600;
  letter-spacing: 4rpx;
  border: none;
  box-shadow: 0 8rpx 28rpx rgba(108,99,255,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
.submit-btn::after { border: none; }

.back-login-row {
  display: flex;
  justify-content: center;
  margin-top: 40rpx;
}
.back-login-link {
  font-size: 28rpx;
  color: #6C63FF;
  font-weight: 500;
}
</style>