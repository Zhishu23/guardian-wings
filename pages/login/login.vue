<template>
  <view class="login-page">
    <!-- 背景装饰 -->
    <view class="bg-decorations">
      <view class="deco-circle circle-1" />
      <view class="deco-circle circle-2" />
      <view class="deco-circle circle-3" />
    </view>

    <!-- 顶部Logo区域 -->
    <view class="header-section">
      <view class="logo-container">
        <view class="logo-icon">
          <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#1B4B8C;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
              </linearGradient>
            </defs>
            <!-- 盾牌底座 -->
            <path d="M60 10 L25 25 L25 50 C25 75 60 100 60 100 C60 100 95 75 95 50 L95 25 Z" 
                  fill="url(#logoGradient)" stroke="#FFFFFF" stroke-width="2"/>
            <!-- 翅膀左侧 -->
            <path d="M40 45 Q30 40 25 35 Q30 42 40 50" fill="#FFFFFF" opacity="0.9"/>
            <!-- 翅膀右侧 -->
            <path d="M80 45 Q90 40 95 35 Q90 42 80 50" fill="#FFFFFF" opacity="0.9"/>
            <!-- 中央鸟形 -->
            <circle cx="60" cy="50" r="8" fill="#FFFFFF"/>
            <path d="M60 42 L60 35 M55 47 L50 47 M65 47 L70 47" stroke="#1B4B8C" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </view>
        <text class="app-name">Guardian Wings</text>
        <text class="app-name-cn">翼路平安</text>
        <text class="app-slogan">野生鸟类保护警务协作平台</text>
      </view>
    </view>

    <!-- 角色选择区域 -->
    <view class="role-section">
      <text class="section-title">请选择登录身份</text>
      
      <!-- 公众版卡片 -->
      <view 
        class="role-card public-card"
        :class="{ 'selected': selectedRole === 'public' }"
        @click="selectRole('public')"
      >
        <view class="card-decoration" />
        <view class="card-icon">
          <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="#3B82F6" opacity="0.1"/>
            <path d="M32 20c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7zm0 20c-5 0-15 2-15 7v3h30v-3c0-5-10-7-15-7z" fill="#3B82F6"/>
          </svg>
        </view>
        <view class="card-content">
          <text class="card-title">公众版</text>
          <text class="card-desc">识鸟百科 • 线索举报 • 志愿参与</text>
          <view class="card-features">
            <view class="feature-tag">
              <text>✓ 快速注册</text>
            </view>
            <view class="feature-tag">
              <text>✓ 简单易用</text>
            </view>
          </view>
        </view>
        <view class="card-arrow">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
          </svg>
        </view>
      </view>

      <!-- 警务版卡片 -->
      <view 
        class="role-card police-card"
        :class="{ 'selected': selectedRole === 'police' }"
        @click="selectRole('police')"
      >
        <view class="card-decoration police-deco" />
        <view class="card-icon">
          <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="#FF7A00" opacity="0.1"/>
            <path d="M32 12l-12 6v10c0 8 12 14 12 14s12-6 12-14V18l-12-6z" fill="none" stroke="#FF7A00" stroke-width="3"/>
            <path d="M26 28l4 4 8-8" stroke="#FF7A00" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          </svg>
        </view>
        <view class="card-content">
          <text class="card-title">警务工作版</text>
          <text class="card-desc">任务处理 • 预警接收 • 协同办案</text>
          <view class="card-features">
            <view class="feature-tag police-tag">
              <text>🔒 需要授权</text>
            </view>
            <view class="feature-tag police-tag">
              <text>⚡ 专业工具</text>
            </view>
          </view>
        </view>
        <view class="card-arrow">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
          </svg>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="action-section">
      <button class="action-btn primary-btn" @click="handleContinue">
        <text>继续</text>
        <svg class="btn-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 6l6 6-6 6" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        </svg>
      </button>
    </view>

    <!-- 底部信息 -->
    <view class="footer-info">
      <view class="info-row">
        <svg class="info-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z" fill="#9CA3AF"/>
        </svg>
        <text class="info-text">数据传输加密</text>
      </view>
      <view class="info-row">
        <svg class="info-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#9CA3AF"/>
          <path d="M12 6v6l4 2" stroke="white" stroke-width="1.5"/>
        </svg>
        <text class="info-text">公安部备案</text>
      </view>
      <view class="info-row">
        <svg class="info-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="18" rx="2" fill="#9CA3AF"/>
          <path d="M8 2v4M16 2v4M3 10h18" stroke="white" stroke-width="1.5"/>
        </svg>
        <text class="info-text">隐私保护承诺</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      selectedRole: ''
    }
  },
  methods: {
    selectRole(role) {
      this.selectedRole = role
    },
    
    handleContinue() {
      if (!this.selectedRole) {
        uni.showToast({
          title: '请先选择登录身份',
          icon: 'none'
        })
        return
      }
      
      if (this.selectedRole === 'public') {
        // 公众版：跳转到公众登录页
        uni.navigateTo({
          url: '/pages/login/public-login'
        })
      } else if (this.selectedRole === 'police') {
        // 警务版：跳转到警务登录页
        uni.navigateTo({
          url: '/pages/login/police-login'
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #334155 100%);
  position: relative;
  overflow: hidden;
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
}

/* 背景装饰 */
.bg-decorations {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%);
  animation: float 8s ease-in-out infinite;
}

.circle-1 {
  width: 400rpx;
  height: 400rpx;
  top: -100rpx;
  right: -100rpx;
  animation-delay: 0s;
}

.circle-2 {
  width: 300rpx;
  height: 300rpx;
  bottom: 100rpx;
  left: -80rpx;
  animation-delay: 2s;
}

.circle-3 {
  width: 200rpx;
  height: 200rpx;
  top: 50%;
  left: 50%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20rpx, -20rpx) scale(1.1); }
}

/* 头部Logo区域 */
.header-section {
  position: relative;
  z-index: 1;
  margin-bottom: 64rpx;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-icon {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 24rpx;
  filter: drop-shadow(0 8rpx 24rpx rgba(59,130,246,0.3));
  animation: logoGlow 3s ease-in-out infinite;
}

@keyframes logoGlow {
  0%, 100% { filter: drop-shadow(0 8rpx 24rpx rgba(59,130,246,0.3)); }
  50% { filter: drop-shadow(0 12rpx 32rpx rgba(59,130,246,0.5)); }
}

.logo-icon svg {
  width: 100%;
  height: 100%;
}

.app-name {
  font-size: 44rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 8rpx;
  letter-spacing: 2rpx;
}

.app-name-cn {
  font-size: 32rpx;
  font-weight: 300;
  color: rgba(255,255,255,0.9);
  margin-bottom: 16rpx;
  letter-spacing: 4rpx;
}

.app-slogan {
  font-size: 24rpx;
  color: rgba(255,255,255,0.6);
  letter-spacing: 1rpx;
}

/* 角色选择区域 */
.role-section {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 28rpx;
  color: rgba(255,255,255,0.8);
  text-align: center;
  margin-bottom: 32rpx;
  font-weight: 500;
}

.role-card {
  position: relative;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(20rpx);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  border: 2rpx solid rgba(255,255,255,0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.role-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59,130,246,0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.4s;
}

.role-card.selected {
  background: rgba(255,255,255,0.15);
  border-color: #3B82F6;
  box-shadow: 0 12rpx 40rpx rgba(59,130,246,0.3), inset 0 0 0 2rpx rgba(59,130,246,0.5);
  transform: translateY(-4rpx);
}

.role-card.selected::before {
  opacity: 1;
}

.police-card.selected {
  border-color: #FF7A00;
  box-shadow: 0 12rpx 40rpx rgba(255,122,0,0.3), inset 0 0 0 2rpx rgba(255,122,0,0.5);
}

.card-decoration {
  position: absolute;
  top: -50rpx;
  right: -50rpx;
  width: 200rpx;
  height: 200rpx;
  background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.police-deco {
  background: radial-gradient(circle, rgba(255,122,0,0.15) 0%, transparent 70%);
}

.card-icon {
  width: 96rpx;
  height: 96rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon svg {
  width: 100%;
  height: 100%;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.card-desc {
  font-size: 24rpx;
  color: rgba(255,255,255,0.7);
  line-height: 1.5;
}

.card-features {
  display: flex;
  gap: 12rpx;
  margin-top: 8rpx;
}

.feature-tag {
  padding: 6rpx 16rpx;
  background: rgba(59,130,246,0.2);
  border-radius: 8rpx;
  font-size: 20rpx;
  color: #93C5FD;
  border: 1rpx solid rgba(59,130,246,0.3);
}

.police-tag {
  background: rgba(255,122,0,0.2);
  color: #FDBA74;
  border-color: rgba(255,122,0,0.3);
}

.card-arrow {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.5);
  transition: all 0.3s;
}

.role-card.selected .card-arrow {
  color: #FFFFFF;
  transform: translateX(8rpx);
}

/* 操作按钮 */
.action-section {
  position: relative;
  z-index: 1;
  margin-top: 48rpx;
}

.action-btn {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border-radius: 20rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  transition: all 0.3s;
}

.action-btn::after {
  border: none;
}

.primary-btn {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  color: #FFFFFF;
  box-shadow: 0 12rpx 32rpx rgba(59,130,246,0.4);
}

.primary-btn:active {
  transform: scale(0.98);
  box-shadow: 0 8rpx 24rpx rgba(59,130,246,0.3);
}

.btn-icon {
  width: 36rpx;
  height: 36rpx;
}

/* 底部信息 */
.footer-info {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-around;
  margin-top: 48rpx;
  padding-top: 32rpx;
  border-top: 1rpx solid rgba(255,255,255,0.1);
}

.info-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.info-icon {
  width: 32rpx;
  height: 32rpx;
}

.info-text {
  font-size: 20rpx;
  color: rgba(255,255,255,0.5);
}
</style>