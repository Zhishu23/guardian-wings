<template>
  <view class="login-page">

    <!-- 顶部渐变装饰 -->
    <view class="top-bg">
      <view class="top-circle c1"></view>
      <view class="top-circle c2"></view>
    </view>

    <!-- 品牌区 -->
    <view class="brand-area">
      <view class="brand-logo">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4L8 10V22C8 32 24 44 24 44C24 44 40 32 40 22V10L24 4Z"
            fill="rgba(255,255,255,0.25)" stroke="#FFFFFF" stroke-width="2.5"
            stroke-linejoin="round"/>
          <path d="M17 23L21 27L31 18"
            stroke="#FFFFFF" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </view>
      <view class="brand-text">
        <text class="brand-name">翼路平安</text>
        <text class="brand-en">Guardian Wings</text>
      </view>
    </view>

    <!-- 标题区 -->
    <view class="title-area">
      <text class="title">欢迎回来</text>
      <text class="subtitle">登录以使用翼路平安全部功能</text>
    </view>

    <!-- 表单卡片 -->
    <view class="form-card">

      <!-- 手机号 -->
      <view class="input-wrap" :class="{ focused: focusField === 'mobile' }">
        <view class="input-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" style="width:36rpx;height:36rpx;">
            <path d="M17 2H7C5.9 2 5 2.9 5 4V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V4C19 2.9 18.1 2 17 2ZM12 21C11.45 21 11 20.55 11 20S11.45 19 12 19 13 19.45 13 20 12.55 21 12 21ZM17 18H7V5H17V18Z" fill="#1B4B8C"/>
          </svg>
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

      <!-- 密码 -->
      <view class="input-wrap" :class="{ focused: focusField === 'password' }">
        <view class="input-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" style="width:36rpx;height:36rpx;">
            <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="#1B4B8C"/>
          </svg>
        </view>
        <input
          class="input-field"
          v-model="form.password"
          :password="!showPwd"
          placeholder="请输入密码"
          placeholder-style="color:#C0C4CC;font-size:28rpx;"
          @focus="focusField = 'password'"
          @blur="focusField = ''"
        />
        <view class="eye-btn" @click="showPwd = !showPwd">
          <svg viewBox="0 0 24 24" fill="none" style="width:36rpx;height:36rpx;">
            <path v-if="showPwd"
              d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
              fill="#909399"/>
            <path v-else
              d="M12 7C14.76 7 17 9.24 17 12C17 12.65 16.87 13.26 16.64 13.83L19.56 16.75C21.07 15.49 22.26 13.86 23 12C21.27 7.61 17 4.5 12 4.5C10.6 4.5 9.26 4.75 8.02 5.2L10.17 7.35C10.74 7.13 11.35 7 12 7ZM2 4.27L4.28 6.55L4.74 7.01C3.08 8.3 1.78 10.02 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.8 19.08L19.73 22L21 20.73L3.27 3L2 4.27ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.78 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM11.84 9.02L14.99 12.17L15.01 12.01C15.01 10.35 13.67 9.01 12.01 9.01L11.84 9.02Z"
              fill="#909399"/>
          </svg>
        </view>
      </view>

      <!-- 记住我 + 忘记密码 -->
      <view class="options-row">
        <view class="remember-row" @click="remember = !remember">
          <view class="checkbox-wrap" :class="{ checked: remember }">
            <svg v-if="remember" viewBox="0 0 24 24" fill="none" style="width:26rpx;height:26rpx;">
              <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#FFFFFF"/>
            </svg>
          </view>
          <text class="remember-text">记住我</text>
        </view>
        <text class="forgot-text" @click="goForgot">忘记密码</text>
      </view>

      <!-- 协议 -->
      <view class="agreement-row" @click="agreed = !agreed">
        <view class="checkbox-wrap sm" :class="{ checked: agreed }">
          <svg v-if="agreed" viewBox="0 0 24 24" fill="none" style="width:20rpx;height:20rpx;">
            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#FFFFFF"/>
          </svg>
        </view>
        <text class="agree-normal">我已阅读并同意</text>
        <text class="agree-link" @click.stop="openAgreement('user')">《用户协议》</text>
        <text class="agree-normal">和</text>
        <text class="agree-link" @click.stop="openAgreement('privacy')">《隐私授权》</text>
      </view>

      <!-- 登录按钮 -->
      <view class="login-btn" :class="{ loading: loading }" @click="handleLogin">
        <text class="btn-text">{{ loading ? '登录中...' : '登录' }}</text>
      </view>
    </view>

    <!-- 第三方登录 -->
    <view class="third-area">
      <view class="divider-row">
        <view class="divider-line"></view>
        <text class="divider-text">其他登录方式</text>
        <view class="divider-line"></view>
      </view>
      <view class="social-row">
        <view class="social-item" @click="wechatLogin">
          <!-- 真实微信图标 -->
          <view class="social-icon wechat-bg">
            <svg viewBox="0 0 24 24" fill="none" style="width:44rpx;height:44rpx;">
              <path d="M8.69 11.52C9.35 11.52 9.89 10.98 9.89 10.32C9.89 9.66 9.35 9.12 8.69 9.12C8.03 9.12 7.49 9.66 7.49 10.32C7.49 10.98 8.03 11.52 8.69 11.52Z" fill="white"/>
              <path d="M13.31 11.52C13.97 11.52 14.51 10.98 14.51 10.32C14.51 9.66 13.97 9.12 13.31 9.12C12.65 9.12 12.11 9.66 12.11 10.32C12.11 10.98 12.65 11.52 13.31 11.52Z" fill="white"/>
              <path d="M16.5 14.1C16.5 14.1 16.04 14.37 15.5 14.37C14.96 14.37 14.5 14.1 14.5 14.1L13.5 14.6L13.88 13.47C13.04 13.03 12.5 12.33 12.5 11.55C12.5 10.14 13.97 9 15.76 9C17.55 9 19.02 10.14 19.02 11.55C19.02 12.52 18.38 13.37 17.38 13.83L17.68 14.72L16.5 14.1Z" fill="white"/>
              <path d="M15.76 8C13.43 8 11.5 9.59 11.5 11.55C11.5 12.24 11.73 12.89 12.14 13.44L11.5 15.5L13.56 14.5C14.21 14.81 14.96 15 15.76 15C18.09 15 20.02 13.41 20.02 11.45C20.02 9.49 18.09 8 15.76 8Z" stroke="white" stroke-width="0.5" fill="none"/>
              <path d="M11 6C7.69 6 5 8.24 5 11C5 12.38 5.62 13.63 6.63 14.55L6 16.97L8.42 15.71C9.22 15.9 10.09 16 11 16C11.34 16 11.67 15.98 12 15.95C11.73 15.39 11.5 14.78 11.5 14.13C11.5 11.57 13.93 9.5 17 9.5C17.01 9.5 17.01 9.5 17.01 9.5C16.32 7.49 13.9 6 11 6Z" fill="white"/>
            </svg>
          </view>
          <text class="social-label">微信登录</text>
        </view>
      </view>
    </view>

    <!-- 注册引导 -->
    <view class="register-hint">
      <text class="hint-normal">还没有账号？</text>
      <text class="hint-link" @click="goRegister">立即注册</text>
    </view>

  </view>
</template>

<script>
export default {
  data() {
    return {
      form:       { mobile: '', password: '' },
      showPwd:    false,
      remember:   false,
      agreed:     false,
      loading:    false,
      focusField: ''
    }
  },

  onLoad(options) {
    if (options && options.mobile) {
      this.form.mobile = options.mobile
    }
    try {
      const saved = uni.getStorageSync('gw_remember_mobile')
      if (saved && !this.form.mobile) {
        this.form.mobile = saved
        this.remember    = true
      }
    } catch (e) {}
  },

  methods: {
    goRegister() {
      uni.navigateTo({ url: '/pages/login/register' })
    },
    goForgot() {
      uni.navigateTo({ url: '/pages/login/forgot-password' })
    },
    openAgreement(type) {
      uni.navigateTo({ url: '/pages/public/law/index' })
    },
    wechatLogin() {
      uni.showToast({ title: '微信登录功能开发中', icon: 'none' })
    },

    async handleLogin() {
      if (!this.form.mobile) {
        uni.showToast({ title: '请输入手机号', icon: 'none' }); return
      }
      if (!/^1[3-9]\d{9}$/.test(this.form.mobile)) {
        uni.showToast({ title: '手机号格式不正确', icon: 'none' }); return
      }
      if (!this.form.password) {
        uni.showToast({ title: '请输入密码', icon: 'none' }); return
      }
      if (!this.agreed) {
        uni.showToast({ title: '请先同意用户协议', icon: 'none' }); return
      }
      if (this.loading) return

      this.loading = true
      uni.showLoading({ title: '登录中...' })

      try {
        const res = await uniCloud.callFunction({
          name: 'gw-user',
          data: {
            action: 'loginByPassword',
            params: { mobile: this.form.mobile, password: this.form.password }
          }
        })
        uni.hideLoading()
        this.loading = false

        if (res.result.code === 0) {
          if (this.remember) {
            uni.setStorageSync('gw_remember_mobile', this.form.mobile)
          } else {
            uni.removeStorageSync('gw_remember_mobile')
          }
          this.$store.dispatch('user/login', {
            uid:          res.result.uid,
            token:        res.result.token,
            tokenExpired: res.result.tokenExpired,
            nickname:     res.result.userInfo.nickname,
            avatar:       res.result.userInfo.avatar,
            points:       res.result.userInfo.points,
            role:         'public'
          })
          uni.setStorageSync('gw_user_info', JSON.stringify(res.result.userInfo))
          uni.setStorageSync('gw_token', res.result.token)
          uni.showToast({ title: '登录成功', icon: 'success' })
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/public/home/home' })
          }, 800)
        } else {
          uni.showToast({ title: res.result.msg, icon: 'none', duration: 2500 })
        }
      } catch (e) {
        uni.hideLoading()
        this.loading = false
        if (e.message && e.message.includes('ECONNRESET')) {
          uni.showToast({ title: '连接超时，正在重试...', icon: 'none' })
          setTimeout(() => this.handleLogin(), 1500)
        } else {
          uni.showToast({ title: '网络错误，请重试', icon: 'none' })
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
page { background: #FFFFFF; }

.login-page {
  min-height: 100vh;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  padding: 0 48rpx;
  position: relative;
  overflow: hidden;
}

/* 顶部蓝色→白色渐变，无边框 */
.top-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 480rpx;
  background: linear-gradient(
    180deg,
    #1B4B8C 0%,
    #2563EB 35%,
    #60A5FA 65%,
    rgba(255,255,255,0) 100%
  );
  overflow: hidden;
  z-index: 0;
}
.top-circle {
  position: absolute; border-radius: 50%;
  background: rgba(255,255,255,0.07);
}
.c1 { width: 360rpx; height: 360rpx; top: -100rpx; right: -80rpx; }
.c2 { width: 200rpx; height: 200rpx; top: 180rpx; left: -60rpx; }

/* 品牌区 */
.brand-area {
  display: flex; align-items: center; gap: 20rpx;
  padding-top: 96rpx; margin-bottom: 32rpx;
  position: relative; z-index: 1;
}
.brand-logo {
  width: 72rpx; height: 72rpx;
  background: rgba(255,255,255,0.2);
  border-radius: 18rpx;
  display: flex; align-items: center; justify-content: center;
  border: 1rpx solid rgba(255,255,255,0.3);
}
.brand-logo svg { width: 48rpx; height: 48rpx; }
.brand-text { display: flex; flex-direction: column; gap: 4rpx; }
.brand-name { font-size: 30rpx; font-weight: 700; color: #FFFFFF; }
.brand-en   { font-size: 20rpx; color: rgba(255,255,255,0.75); }

/* 标题区 */
.title-area {
  margin-bottom: 36rpx;
  position: relative; z-index: 1;
}
.title {
  display: block; font-size: 52rpx; font-weight: 700;
  color: #FFFFFF; margin-bottom: 10rpx;
}
.subtitle { display: block; font-size: 26rpx; color: rgba(255,255,255,0.85); }

/* 表单卡片 */
.form-card {
  background: #FFFFFF; border-radius: 28rpx;
  padding: 44rpx 36rpx 36rpx;
  box-shadow: 0 8rpx 40rpx rgba(27,75,140,0.12);
  position: relative; z-index: 1;
  margin-bottom: 36rpx;
}

.input-wrap {
  display: flex; align-items: center;
  height: 96rpx; background: #F5F7FA;
  border-radius: 14rpx; margin-bottom: 20rpx;
  border: 2rpx solid transparent; transition: all 0.25s;
  overflow: hidden;
}
.input-wrap.focused {
  background: #EFF6FF; border-color: #2563EB;
  box-shadow: 0 0 0 4rpx rgba(37,99,235,0.08);
}
.input-icon-wrap {
  width: 72rpx; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.input-field {
  flex: 1; font-size: 28rpx; color: #303133; padding-right: 16rpx;
}
.eye-btn {
  width: 72rpx; height: 72rpx; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}

/* 选项行 */
.options-row {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 20rpx;
}
.remember-row { display: flex; align-items: center; gap: 12rpx; }
.checkbox-wrap {
  width: 36rpx; height: 36rpx; border-radius: 6rpx;
  border: 2rpx solid #DCDFE6; background: #FFFFFF;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all 0.2s;
}
.checkbox-wrap.checked { background: #2563EB; border-color: #2563EB; }
.checkbox-wrap.sm { width: 32rpx; height: 32rpx; border-radius: 4rpx; }
.remember-text { font-size: 26rpx; color: #606266; }
.forgot-text   { font-size: 26rpx; color: #2563EB; font-weight: 500; }

/* 协议 */
.agreement-row {
  display: flex; align-items: center;
  flex-wrap: wrap; gap: 4rpx; margin-bottom: 36rpx;
}
.agree-normal { font-size: 24rpx; color: #909399; }
.agree-link   { font-size: 24rpx; color: #2563EB; }

/* 登录按钮 */
.login-btn {
  width: 100%; height: 96rpx;
  background: linear-gradient(135deg, #1B4B8C, #2563EB);
  border-radius: 16rpx;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 10rpx 28rpx rgba(27,75,140,0.3);
  transition: opacity 0.2s;
}
.login-btn.loading { opacity: 0.75; }
.btn-text { font-size: 32rpx; color: #FFFFFF; font-weight: 600; letter-spacing: 4rpx; }

/* 第三方登录 */
.third-area { position: relative; z-index: 1; margin-bottom: 32rpx; }
.divider-row { display: flex; align-items: center; gap: 20rpx; margin-bottom: 32rpx; }
.divider-line { flex: 1; height: 1rpx; background: #EBEEF5; }
.divider-text { font-size: 24rpx; color: #C0C4CC; white-space: nowrap; }
.social-row { display: flex; justify-content: center; }
.social-item { display: flex; flex-direction: column; align-items: center; gap: 12rpx; }
.social-icon {
  width: 96rpx; height: 96rpx; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.wechat-bg { background: #07C160; }
.social-label { font-size: 22rpx; color: #909399; }

/* 注册引导 */
.register-hint {
  display: flex; justify-content: center; align-items: center;
  gap: 6rpx; position: relative; z-index: 1;
}
.hint-normal { font-size: 28rpx; color: #909399; }
.hint-link   { font-size: 28rpx; color: #2563EB; font-weight: 600; }
</style>