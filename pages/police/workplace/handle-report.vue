<template>
  <view class="page">
    <view class="nav-bar">
      <view @click="goBack"><text class="back">‹ 返回</text></view>
      <text class="title">处理举报</text>
      <view style="width:80rpx"/>
    </view>
    <view class="tip"><text>请前往举报详情页进行处理操作</text></view>
  </view>
</template>
<script>
export default { methods: { goBack() { uni.navigateBack() } } }
</script>
<style scoped>
.page { min-height: 100vh; background: #0F172A; }
.nav-bar { display: flex; align-items: center; justify-content: space-between; padding: 88rpx 32rpx 20rpx; }
.back { font-size: 30rpx; color: #60A5FA; }
.title { font-size: 34rpx; color: #F1F5F9; font-weight: 600; }
.tip { padding: 60rpx 40rpx; text { font-size: 28rpx; color: #64748B; } }
</style>