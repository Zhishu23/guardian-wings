<template>
  <view class="police-login-page">
    <!-- 背景 -->
    <view class="bg-gradient" />
    <view class="bg-pattern" />

    <!-- 返回按钮 -->
    <view class="back-btn" @click="goBack">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18l-6-6 6-6" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
    </view>

    <!-- 内容区域 -->
    <view class="content-wrapper">
      <!-- 标题区域 -->
      <view class="header-area">
        <view class="badge-icon">
          <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#DC2626;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#EF4444;stop-opacity:1" />
              </linearGradient>
            </defs>
            <path d="M32 8l-16 8v14c0 10 16 18 16 18s16-8 16-18V16l-16-8z" fill="url(#badgeGradient)" stroke="white" stroke-width="2"/>
            <path d="M24 30l6 6 10-12" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
          </svg>
        </view>
        <text class="page-title">警务工作版</text>
        <text class="page-subtitle">Guardian Wings · 执法协作平台</text>
        <view class="security-badge">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="rgba(255,255,255,0.8)"/>
          </svg>
          <text>公安专网安全认证</text>
        </view>
      </view>

      <!-- 表单区域 -->
      <view class="form-container">
        <view class="form-header">
          <text class="form-title">登录验证</text>
          <text class="form-subtitle">请使用警务账号登录</text>
        </view>

        <view class="form-content">
          <!-- 警号输入 -->
          <view class="input-group">
            <view class="input-label">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z" fill="#DC2626"/>
              </svg>
              <text>警号</text>
            </view>
            <input 
              class="input-field" 
              v-model="form.policeId"
              placeholder="请输入您的警号"
            />
          </view>

          <!-- 密码输入 -->
          <view class="input-group">
            <view class="input-label">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="#DC2626"/>
              </svg>
              <text>密码</text>
            </view>
            <input 
              class="input-field" 
              v-model="form.password"
              :password="!showPassword"
              placeholder="请输入登录密码"
            />
            <view class="eye-btn" @click="showPassword = !showPassword">
              <svg v-if="showPassword" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#9CA3AF"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="#9CA3AF"/>
              </svg>
            </view>
          </view>

          <!-- 部门选择 -->
          <view class="input-group">
            <view class="input-label">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l-5.5 9h11z M12 22l5.5-9h-11z" fill="#DC2626"/>
              </svg>
              <text>所属部门</text>
            </view>
            <picker 
              mode="selector"
              :range="departments"
              :value="deptIndex"
              @change="onDeptChange"
              class="dept-picker"
            >
              <view class="picker-display">
                <text :class="{ 'placeholder': deptIndex === -1 }">
                  {{ deptIndex === -1 ? '请选择所属部门' : departments[deptIndex] }}
                </text>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10l5 5 5-5z" fill="#9CA3AF"/>
                </svg>
              </view>
            </picker>
          </view>

          <!-- 记住密码 -->
          <view class="remember-row">
            <checkbox-group @change="onRememberChange">
              <label class="remember-label">
                <checkbox :checked="remember" color="#DC2626" />
                <text>记住密码（7天内免登录）</text>
              </label>
            </checkbox-group>
          </view>
        </view>

        <!-- 登录按钮 -->
        <button class="login-btn" @click="handleLogin">
          <svg class="btn-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z" fill="white"/>
          </svg>
          <text>安全登录</text>
        </button>

        <!-- 帮助信息 -->
        <view class="help-section">
          <text class="help-text">忘记密码？请联系系统管理员</text>
          <view class="contact-row">
            <view class="contact-item" @click="callAdmin">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#DC2626"/>
              </svg>
              <text>技术支持</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 安全提示 -->
      <view class="security-tips">
        <view class="tip-item">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#FEE2E2"/>
            <path d="M12 8v4M12 16h.01" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <text>请勿在公共场所或非公务终端登录</text>
        </view>
        <view class="tip-item">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#FEE2E2"/>
            <path d="M12 8v4M12 16h.01" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <text>登录即代表您已阅读并遵守相关保密规定</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        policeId: '',
        password: '',
        department: ''
      },
      showPassword: false,
      remember: false,
      loading: false,
   
      departments: [
        '晋中食药环侦支队',
        '森林公安局',
        '生态环境执法大队',
        '自然保护区管理处',
        '渔政执法大队',
        '其他'
      ],
      deptIndex: -1
    }
  },

  onLoad() {
    // 恢复记住的警号和部门
    try {
      const saved = uni.getStorageSync('gw_police_remember')
      if (saved) {
        const info = JSON.parse(saved)
        this.form.policeId   = info.policeId   || ''
        this.form.department = info.department || ''
        const idx = this.departments.indexOf(info.department)
        this.deptIndex = idx >= 0 ? idx : -1
        this.remember  = true
      }
    } catch (e) {}
  },

  methods: {
    goBack() {
      uni.navigateBack()
    },

    onDeptChange(e) {
      this.deptIndex       = e.detail.value
      this.form.department = this.departments[e.detail.value]
    },

    onRememberChange(e) {
      this.remember = e.detail.value.length > 0
    },

    // ── 警务端登录 ──────────────────────────
    async handleLogin() {
      const { policeId, password, department } = this.form

      if (!policeId) {
        uni.showToast({ title: '请输入警号', icon: 'none' })
        return
      }
      if (!password) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return
      }
      if (this.deptIndex === -1) {
        uni.showToast({ title: '请选择所属部门', icon: 'none' })
        return
      }
      if (this.loading) return

      this.loading = true
      uni.showLoading({ title: '身份验证中...' })

      try {
        const res = await uniCloud.callFunction({
          name: 'gw-user',
          data: {
            action: 'policeLogin',
            params: { policeId, password, department }
          }
        })
        uni.hideLoading()
        this.loading = false

        if (res.result.code === 0) {
          // 保存警务信息
          this.$store.dispatch('police/policeLogin', res.result.policeInfo)
          // 保存通用 token
          this.$store.dispatch('user/login', {
            uid:          res.result.uid,
            token:        res.result.token,
            tokenExpired: res.result.tokenExpired,
            role:         'police',
            nickname:     res.result.policeInfo.realName,
            avatar:       '',
            points:       0
          })
          // 处理记住密码
          if (this.remember) {
            uni.setStorageSync('gw_police_remember', JSON.stringify({
              policeId,
              department
            }))
          } else {
            uni.removeStorageSync('gw_police_remember')
          }

          uni.showToast({ title: '登录成功', icon: 'success' })
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/police/task-center/index' })
          }, 800)

        } else {
          uni.showToast({ title: res.result.msg, icon: 'none', duration: 2500 })
        }

      } catch (e) {
        uni.hideLoading()
        this.loading = false
        // 冷启动超时时自动重试一次
        if (e.message && e.message.includes('ECONNRESET')) {
          uni.showToast({ title: '连接超时，正在重试...', icon: 'none' })
          setTimeout(() => { this.handleLogin() }, 1500)
        } else {
          uni.showToast({ title: '网络错误，请重试', icon: 'none' })
        }
        console.error('policeLogin error:', e)
      }
    },

    callAdmin() {
      uni.showModal({
        title: '技术支持',
        content: '请拨打：12345\n工作时间：9:00-18:00',
        showCancel: false
      })
    }
  }
}
</script>

<style scoped lang="scss">
.police-login-page {
  min-height: 100vh;
  background: #1F2937;
  position: relative;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 500rpx;
  background: linear-gradient(180deg, #DC2626 0%, #991B1B 100%);
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 500rpx;
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 20rpx, rgba(255,255,255,0.03) 20rpx, rgba(255,255,255,0.03) 40rpx);
}

.back-btn {
  position: absolute;
  top: 48rpx;
  left: 32rpx;
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  z-index: 10;
}

.back-btn svg {
  width: 40rpx;
  height: 40rpx;
}

.content-wrapper {
  position: relative;
  padding: 120rpx 32rpx 48rpx;
}

.header-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
}

.badge-icon {
  width: 128rpx;
  height: 128rpx;
  margin-bottom: 24rpx;
  filter: drop-shadow(0 8rpx 24rpx rgba(220,38,38,0.5));
}

.badge-icon svg {
  width: 100%;
  height: 100%;
}

.page-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.page-subtitle {
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
  margin-bottom: 24rpx;
}

.security-badge {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 24rpx;
  background: rgba(255,255,255,0.15);
  border-radius: 40rpx;
  backdrop-filter: blur(8rpx);
}

.security-badge svg {
  width: 32rpx;
  height: 32rpx;
}

.security-badge text {
  font-size: 22rpx;
  color: rgba(255,255,255,0.9);
}

.form-container {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  box-shadow: 0 12rpx 48rpx rgba(0,0,0,0.2);
}

.form-header {
  margin-bottom: 32rpx;
  padding-bottom: 24rpx;
  border-bottom: 2rpx solid #F3F4F6;
}

.form-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 8rpx;
}

.form-subtitle {
  display: block;
  font-size: 24rpx;
  color: #9CA3AF;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.input-label svg {
  width: 32rpx;
  height: 32rpx;
}

.input-label text {
  font-size: 26rpx;
  font-weight: 500;
  color: #374151;
}

.input-field {
  padding: 28rpx 24rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
  border: 2rpx solid #E5E7EB;
  font-size: 28rpx;
  color: #1F2937;
  transition: all 0.3s;
}

.input-field:focus {
  background: #FFFFFF;
  border-color: #DC2626;
  box-shadow: 0 0 0 6rpx rgba(220,38,38,0.1);
}

.eye-btn {
  position: absolute;
  right: 24rpx;
  bottom: 28rpx;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eye-btn svg {
  width: 100%;
  height: 100%;
}

.dept-picker {
  width: 100%;
}

.picker-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
  border: 2rpx solid #E5E7EB;
}

.picker-display text {
  font-size: 28rpx;
  color: #1F2937;
}

.picker-display .placeholder {
  color: #9CA3AF;
}

.picker-display svg {
  width: 32rpx;
  height: 32rpx;
}

.remember-row {
  margin-top: 8rpx;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.remember-label text {
  font-size: 24rpx;
  color: #6B7280;
}

.login-btn {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
  color: #FFFFFF;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  margin-top: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(220,38,38,0.4);
}

.login-btn::after {
  border: none;
}

.btn-icon {
  width: 36rpx;
  height: 36rpx;
}

.help-section {
  margin-top: 32rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #F3F4F6;
  text-align: center;
}

.help-text {
  display: block;
  font-size: 24rpx;
  color: #9CA3AF;
  margin-bottom: 16rpx;
}

.contact-row {
  display: flex;
  justify-content: center;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: #FEE2E2;
  border-radius: 8rpx;
}

.contact-item svg {
  width: 28rpx;
  height: 28rpx;
}

.contact-item text {
  font-size: 24rpx;
  color: #DC2626;
  font-weight: 500;
}

.security-tips {
  margin-top: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  padding: 20rpx;
  background: rgba(255,255,255,0.05);
  border-radius: 12rpx;
  border: 1rpx solid rgba(255,255,255,0.1);
}

.tip-item svg {
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
  margin-top: 4rpx;
}

.tip-item text {
  flex: 1;
  font-size: 22rpx;
  color: rgba(255,255,255,0.8);
  line-height: 1.6;
}
</style>