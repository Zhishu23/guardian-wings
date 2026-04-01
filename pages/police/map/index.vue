<template>
  <view class="map-page">
    <view class="coming-soon">
      <svg class="icon-large" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#2563EB"/>
      </svg>
      <text class="coming-title">任务地图功能</text>
      <text class="coming-desc">此功能需要集成地图SDK（高德/百度地图）</text>
      <text class="coming-desc">开发中，敬请期待...</text>
      <button class="back-btn" @click="goBack">返回工作台</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TaskMap',
  
  methods: {
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped lang="scss">
.map-page {
  min-height: 100vh;
  background: #F9FAFB;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  padding: 80rpx;
}

.icon-large {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 32rpx;
}

.coming-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1F2937;
}

.coming-desc {
  font-size: 28rpx;
  color: #6B7280;
  text-align: center;
}

.back-btn {
  margin-top: 48rpx;
  padding: 24rpx 64rpx;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  color: #FFFFFF;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
}

.back-btn::after {
  border: none;
}
</style>