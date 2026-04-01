<template>
  <view class="splash-container" :class="{ loaded, ready }" @click="skip">
    <!-- 顶部状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 主体内容区 -->
    <view class="main-content">
      <!-- Logo 区域 -->
      <view class="logo-section">
        <view class="logo-container">
          <!-- 政务级 Logo 设计 -->
          <view class="logo-box">
            <svg class="logo-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
              <!-- 盾牌主体 -->
              <path d="M60 10C28 10 10 30 10 60c0 22 12 38 30 46l20 8 20-8c18-8 30-24 30-46C110 30 92 10 60 10z" 
                    fill="#FFFFFF" stroke="#1B4B8C" stroke-width="3"/>
              <!-- 盾牌边框 -->
              <path d="M60 15c25 0 45 18 45 45s-20 40-45 48l-2 1-2-1c-25-8-45-23-45-48s20-45 45-45z" 
                    fill="none" stroke="#2D8F47" stroke-width="2"/>
              <!-- 翅膀图案 -->
              <g stroke="#1B4B8C" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <!-- 左翼 -->
                <path d="M35 50L25 60L35 70"/>
                <path d="M25 60L35 65L45 60"/>
                <path d="M35 50L45 55L55 50"/>
                <path d="M35 70L45 65L55 70"/>
                <!-- 右翼 -->
                <path d="M85 50L95 60L85 70"/>
                <path d="M95 60L85 65L75 60"/>
                <path d="M85 50L75 55L65 50"/>
                <path d="M85 70L75 65L65 70"/>
              </g>
              <!-- 中心徽章 -->
              <circle cx="60" cy="60" r="15" fill="#1B4B8C"/>
              <circle cx="60" cy="60" r="12" fill="#FFFFFF"/>
              <text x="60" y="65" font-family="Arial, sans-serif" font-size="10" font-weight="bold" 
                    fill="#1B4B8C" text-anchor="middle">GW</text>
            </svg>
          </view>
        </view>
      </view>
      
      <!-- 标题区域 -->
      <view class="title-section">
        <view class="title-box">
          <text class="title-main">翼路平安</text>
          <text class="title-sub">野生鸟类保护警务协作平台</text>
        </view>
      </view>
      
      <!-- 加载区域 -->
      <view class="loading-section">
        <view class="loading-wrapper">
          <view class="loading-dots">
            <view class="dot" :class="`dot-${n}`" v-for="n in 4" :key="n"></view>
          </view>
          <text class="loading-text">正在加载中...</text>
        </view>
      </view>
    </view>
    
    <!-- 底部信息 -->
    <view class="bottom-info">
      <view class="info-item">
        <text class="info-text">© 2024 Guardian Wings</text>
      </view>
      <view class="info-item">
        <text class="info-badge">公安部备案</text>
        <text class="info-badge">安全认证</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loaded: false,
      ready: false,      
      timer: null
    }
  },

  onLoad() {
    // 第一拍：整体入场
    setTimeout(() => {
      this.loaded = true
    }, 100)

    // 第二拍：loading 准备结束
    setTimeout(() => {
      this.ready = true
    }, 2200)

    // 第三拍：跳转
    this.timer = setTimeout(() => {
      this.goNext()
    }, 3000)
  },

  beforeDestroy() {
    clearTimeout(this.timer)
  },
  beforeUnmount() {
    clearTimeout(this.timer)
  },

  methods: {
    goNext() {
      uni.redirectTo({
        url: '/pages/login/login'
      })
    },
    skip() {
      clearTimeout(this.timer)
      this.goNext()
    }
  }
}

</script>

<style scoped>

.splash-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #1B4B8C 0%, #2D8F47 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}


.splash-container {
  opacity: 0;
  animation: bgFadeIn 1s ease-out forwards;
}

@keyframes bgFadeIn {
  from {
    opacity: 0;
    background-position: 0% 50%;
  }
  to {
    opacity: 1;
    background-position: 100% 50%;
  }
}
@keyframes logoRotate {
  0% {
    transform: rotate(-30deg);
  }
  70% {
    transform: rotate(190deg);
  }
  100% {
    transform: rotate(180deg);
  }
}


.status-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--status-bar-height, 44rpx);
  background: rgba(27, 75, 140, 0.8);
  backdrop-filter: blur(10px);
  z-index: 10;
}


.main-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  box-sizing: border-box;
}


.logo-section {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 30px;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-box {
  width: 180px;
  height: 180px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 4px solid #1B4B8C;
  transform: scale(0.8) translateY(50px);
  opacity: 0;
}

.loaded .logo-box {
  animation: logoSlideUp 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: 0.2s;
}

@keyframes logoSlideUp {
  0% {
    transform: scale(0.8) translateY(50px);
    opacity: 0;
  }
  70% {
    transform: scale(1.05) translateY(-10px);
    opacity: 1;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.logo-svg {
  width: 100px;
  height: 100px;
  transform: rotate(0deg);
}

.loaded .logo-svg {
  animation: logoRotate 1.5s ease-out forwards;
  animation-delay: 0.8s;
}

@keyframes logoRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}


.title-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 20px;
}

.title-box {
  text-align: center;
  opacity: 0;
  transform: translateY(30px);
}

.loaded .title-box {
  animation: titleFadeIn 1s ease-out forwards;
  animation-delay: 0.6s;
}

@keyframes titleFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.title-main {
  display: block;
  font-size: 36px;
  font-weight: bold;
  color: #FFFFFF;
  letter-spacing: 12px;
  margin-bottom: 12px;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-family: "Microsoft YaHei", sans-serif;
}

.title-sub {
  display: block;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 2px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-family: "Microsoft YaHei", sans-serif;
}

.loading-section {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 20px;
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
}

.loaded .loading-wrapper {
  animation: loadingFadeIn 1s ease-out forwards;
  animation-delay: 1s;
}

@keyframes loadingFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.loading-dots {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.dot {
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  transform: scale(0.8);
}

.loaded .dot {
  animation: dotPulse 1.2s ease-in-out infinite;
}

.loaded .dot-1 {
  animation-delay: 0s;
}

.loaded .dot-2 {
  animation-delay: 0.2s;
}

.loaded .dot-3 {
  animation-delay: 0.4s;
}

.loaded .dot-4 {
  animation-delay: 0.6s;
}

@keyframes dotPulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.loading-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 1px;
  font-family: "Microsoft YaHei", sans-serif;
}


.bottom-info {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
}

.loaded .bottom-info {
  animation: bottomInfoFadeIn 1s ease-out forwards;
  animation-delay: 1.4s;
}

@keyframes bottomInfoFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 0.9;
    transform: translateY(0);
  }
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.info-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-family: "Microsoft YaHei", sans-serif;
}

.info-badge {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
  margin: 0 4px;
  font-family: "Microsoft YaHei", sans-serif;
}
</style>
