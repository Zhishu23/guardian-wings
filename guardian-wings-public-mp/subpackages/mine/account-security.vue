<template>
  <view class="page">
    <view class="nav-bar">
      <view @click="goBack"><text class="back">‹ 返回</text></view>
      <text class="title">账号安全</text>
      <view style="width:80rpx"/>
    </view>
    <view class="section">
      <view class="cell">
        <text class="cell-label">手机号</text>
        <text class="cell-value">{{ maskedMobile }}</text>
      </view>
      <view class="cell" @click="go('change-password')">
        <text class="cell-label">登录密码</text>
        <view class="cell-right"><text class="cell-hint">已设置</text><text class="cell-arrow">›</text></view>
      </view>
      <view class="cell" @click="go('change-mobile')">
        <text class="cell-label">更换手机号</text>
        <text class="cell-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  computed: {
    maskedMobile() {
      const m = this.$store.state.user.mobile || ''
      return m ? m.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未绑定'
    }
  },
  methods: {
    go(name) { uni.navigateTo({ url: `/subpackages/mine/${name}` }) },
    goBack() { uni.navigateBack() }
  }
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; background: #EFEFF4; }
.nav-bar { display: flex; align-items: center; justify-content: space-between; padding: 88rpx 32rpx 20rpx; background: #FFFFFF; margin-bottom: 20rpx; }
.back { font-size: 30rpx; color: #2563EB; }
.title { font-size: 34rpx; color: #1C1C1E; font-weight: 600; }
.section { background: #FFFFFF; }
.cell { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 32rpx; border-bottom: 1rpx solid #F3F4F6; &:last-child { border-bottom: none; } }
.cell-label { font-size: 28rpx; color: #1C1C1E; }
.cell-value { font-size: 28rpx; color: #8E8E93; }
.cell-hint  { font-size: 26rpx; color: #8E8E93; margin-right: 8rpx; }
.cell-arrow { font-size: 36rpx; color: #C4C4C6; }
.cell-right { display: flex; align-items: center; }
</style>