<template>
  <view class="placeholder-page">
    <view class="placeholder-content">
      <!-- 图标 -->
      <view class="placeholder-icon">
        <uni-icons type="info-filled" size="86" color="#9CA3AF" />
      </view>
      
      <text class="placeholder-title">功能开发中</text>
      <text class="placeholder-desc">该功能正在努力开发中，敬请期待...</text>
      
      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="action-btn secondary" @click="goBack">
          <text>返回上一页</text>
        </button>
        <button class="action-btn primary" @click="goHome">
          <text>回到首页</text>
        </button>
      </view>
      
      <!-- 提示信息 -->
      <view class="tip-card">
        <text class="tip-text">💡 如有疑问，请联系客服</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    goBack() {
      uni.navigateBack({
        fail: () => {
          uni.switchTab({
            url: '/pages/public/home/home'
          })
        }
      })
    },
    goHome() {
      uni.switchTab({
        url: '/pages/public/home/home'
      })
    }
  }
}
</script>

<style scoped lang="scss">
.placeholder-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F0F9FF 0%, #F5F7FA 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
}

.placeholder-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.placeholder-icon {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 48rpx;
  border-radius: 50%;
  background: #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 16rpx;
}

.placeholder-desc {
  font-size: 26rpx;
  color: #6B7280;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 48rpx;
  padding: 0 32rpx;
}

.action-buttons {
  width: 100%;
  display: flex;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
}

.action-btn::after {
  border: none;
}

.primary {
  background: linear-gradient(135deg, #1B4B8C 0%, #3B82F6 100%);
  color: #FFFFFF;
  box-shadow: 0 8rpx 24rpx rgba(27,75,140,0.25);
}

.secondary {
  background: #FFFFFF;
  color: #1B4B8C;
  border: 2rpx solid #1B4B8C;
}

.tip-card {
  width: 100%;
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 24rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

.tip-text {
  font-size: 24rpx;
  color: #6B7280;
}
</style>
