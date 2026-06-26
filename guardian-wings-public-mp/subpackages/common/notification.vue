<template>
  <view class="page">
    <view class="placeholder">
      <text class="placeholder-text">功能开发中...</text>
      <button class="back-btn" @click="goBack">返回</button>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F7FA;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40rpx;
}

.placeholder-text {
  font-size: 32rpx;
  color: #6B7280;
}

.back-btn {
  width: 240rpx;
  height: 72rpx;
  background: #1B4B8C;
  color: #FFFFFF;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
}

.back-btn::after {
  border: none;
}
</style>