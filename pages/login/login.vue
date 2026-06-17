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
          <view class="logo-icon">
            <image 
              src="/static/icons/logo-sticker2.png" 
              mode="aspectFit"
              class="logo-image"
			  style="width:100%; height:100%; display:block;"
            ></image>
          </view>
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
          <text style="font-size:64rpx;line-height:1;">🌐</text>
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
          <uni-icons type="right" size="20" color="rgba(255,255,255,0.6)" />
        </view>
      </view>

      <!-- 公务段卡片 -->
      <view 
        class="role-card police-card"
        :class="{ 'selected': selectedRole === 'police' }"
        @click="selectRole('police')"
      >
        <view class="card-decoration police-deco" />
        <view class="card-icon">
          <text style="font-size:64rpx;line-height:1;">👮</text>
        </view>
        <view class="card-content">
          <text class="card-title">公务段</text>
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
          <uni-icons type="right" size="20" color="rgba(255,255,255,0.6)" />
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="action-section">
      <button class="action-btn primary-btn" @click="handleContinue">
        <text>继续</text>
        <uni-icons type="right" size="20" color="#FFFFFF" />
      </button>
    </view>

    <!-- 底部信息 -->
    <view class="footer-info">
      <view class="info-row">
        <uni-icons type="locked-filled" size="14" color="#9CA3AF" />
        <text class="info-text">数据传输加密</text>
      </view>
      <view class="info-row">
        <uni-icons type="auth-filled" size="14" color="#9CA3AF" />
        <text class="info-text">公安部备案</text>
      </view>
      <view class="info-row">
        <uni-icons type="info-filled" size="14" color="#9CA3AF" />
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
        // 公务段：跳转到公务段登录页
        uni.navigateTo({
          url: '/pages/login/police-login'
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
	page, .login-page {
	  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", Helvetica, Arial, "Noto Sans CJK SC", sans-serif;
	  font-smoothing: antialiased;
	}
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #334155 100%);
  position: relative;
  overflow: hidden;
  padding: 40rpx 32rpx 48rpx;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
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
  margin-bottom: 100rpx;
  margin-top: 64rpx;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 32rpx;
  filter: drop-shadow(0 12rpx 28rpx rgba(59,130,246,0.4));
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 12rpx 28rpx rgba(59,130,246,0.4)); }
  50% { transform: translateY(-8rpx) scale(1.02); filter: drop-shadow(0 18rpx 36rpx rgba(59,130,246,0.6)); }
}

.logo-icon svg {
  width: 100%;
  height: 100%;
}

.app-name {
  font-size: 48rpx;         
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 12rpx;
  letter-spacing: 3rpx;    
  font-family: 'Times New Roman', Georgia, serif;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
}

.app-name-cn {
  font-size: 36rpx;
  font-weight: 600;
  color: rgba(255,255,255,0.95);
  margin-bottom: 16rpx;
  letter-spacing: 6rpx;     
  font-family: "PingFang SC", "Noto Sans CJK SC", system-ui;
}

.app-slogan {
  font-size: 26rpx;
  color: rgba(255,255,255,0.65);
  letter-spacing: 2rpx;    
  font-weight: 400;
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
  font-size: 30rpx;
  color: rgba(255,255,255,0.85);
  text-align: center;
  margin-bottom: 40rpx;
  font-weight: 500;
  letter-spacing: 2rpx;
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
  font-size: 34rpx;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 2rpx;
  line-height: 1.3;
}

.card-desc {
  font-size: 24rpx;
  color: rgba(255,255,255,0.75);
  line-height: 1.5;
  letter-spacing: 1rpx;
}

.card-features {
  display: flex;
  gap: 12rpx;
  margin-top: 8rpx;
}

.feature-tag {
  padding: 6rpx 20rpx;
  background: rgba(59,130,246,0.2);
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #93C5FD;
  border: 1rpx solid rgba(59,130,246,0.3);
  letter-spacing: 1rpx;
  font-weight: 500;
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
  font-size: 22rpx;
  color: rgba(255,255,255,0.5);
  letter-spacing: 1.5rpx;
  font-weight: 400;
}
</style>
