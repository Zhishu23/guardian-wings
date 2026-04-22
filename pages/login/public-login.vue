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
        <text style="font-size:48rpx;line-height:1;">🛡️</text>
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
        <uni-icons type="phone" size="18" color="#1B4B8C" />
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
          <uni-icons type="locked" size="18" color="#1B4B8C" />
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
          <uni-icons v-if="showPwd" type="eye" size="18" color="#909399" />
          <uni-icons v-else type="eye-slash" size="18" color="#909399" />
        </view>
      </view>

      <!-- 记住我 + 忘记密码 -->
      <view class="options-row">
        <view class="remember-row" @click="remember = !remember">
          <view class="checkbox-wrap" :class="{ checked: remember }">
            <text v-if="remember" style="color:#FFFFFF;font-size:22rpx;font-weight:bold;">✓</text>
          </view>
          <text class="remember-text">记住我</text>
        </view>
        <text class="forgot-text" @click="goForgot">忘记密码</text>
      </view>

      <!-- 协议 -->
      <view class="agreement-row" @click="agreed = !agreed">
        <view class="checkbox-wrap sm" :class="{ checked: agreed }">
          <text v-if="agreed" style="color:#FFFFFF;font-size:18rpx;font-weight:bold;">✓</text>
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
          <view class="social-icon wechat-bg" style="overflow:hidden;display:flex;align-items:center;justify-content:center;">
            <image 
              src="/static/icons/wechat.png" 
              mode="aspectFill" 
              style="width:100%;height:100%;display:block;"
            />
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
  padding-top: calc(var(--status-bar-height) + 32rpx);  
  margin-bottom: 32rpx;
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