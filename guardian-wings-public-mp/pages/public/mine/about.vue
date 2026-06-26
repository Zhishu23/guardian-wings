<template>
  <view class="page">
    <view class="nav-bar">
      <view @click="goBack"><text class="back">‹ 返回</text></view>
      <text class="title">关于我们</text>
      <view style="width:80rpx"/>
    </view>
    <view class="hero">
      <text class="hero-icon">🦅</text>
      <text class="hero-name">翼路平安</text>
      <text class="hero-version">Guardian Wings v1.0.0</text>
    </view>
    <view class="section">
      <view class="cell"><text class="cell-label">版本号</text><text class="cell-value">1.0.0</text></view>
      <view class="cell"><text class="cell-label">开发团队</text><text class="cell-value">翼路平安团队</text></view>
      <view class="cell"><text class="cell-label">联系邮箱</text><text class="cell-value">guardianwings@example.com</text></view>
    </view>
    <view class="desc">
      <text>翼路平安是一款致力于野生鸟类保护的公益APP，旨在通过公众力量守护珍稀鸟类及其栖息地，让每一片翅膀都能安然飞翔。</text>
    </view>
  </view>
</template>

<script>
export default {
  methods: { goBack() { uni.navigateBack() } }
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; background: #EFEFF4; }
.nav-bar { display: flex; align-items: center; justify-content: space-between; padding: 88rpx 32rpx 20rpx; background: #FFFFFF; margin-bottom: 20rpx; }
.back { font-size: 30rpx; color: #2563EB; }
.title { font-size: 34rpx; color: #1C1C1E; font-weight: 600; }
.hero { display: flex; flex-direction: column; align-items: center; padding: 60rpx 0; background: #FFFFFF; margin-bottom: 20rpx; }
.hero-icon { font-size: 120rpx; }
.hero-name { font-size: 48rpx; font-weight: 700; color: #1B4B8C; margin-top: 16rpx; }
.hero-version { font-size: 24rpx; color: #9CA3AF; margin-top: 8rpx; }
.section { background: #FFFFFF; }
.cell { display: flex; justify-content: space-between; padding: 28rpx 32rpx; border-bottom: 1rpx solid #F3F4F6; &:last-child { border-bottom: none; } }
.cell-label { font-size: 28rpx; color: #1C1C1E; }
.cell-value  { font-size: 28rpx; color: #8E8E93; }
.desc { margin: 20rpx 32rpx; padding: 28rpx; background: #FFFFFF; border-radius: 16rpx; text { font-size: 26rpx; color: #6B7280; line-height: 1.8; } }
</style>