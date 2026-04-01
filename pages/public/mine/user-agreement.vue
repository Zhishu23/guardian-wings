<!-- pages/public/mine/user-agreement.vue -->
<template>
  <view class="page">
    <view class="nav-bar">
      <view @click="goBack"><text class="back">‹ 返回</text></view>
      <text class="title">用户协议</text>
      <view style="width:80rpx"/>
    </view>
    <scroll-view scroll-y class="content">
      <text class="article">
翼路平安用户协议

更新日期：2026年1月1日

一、服务说明
翼路平安（Guardian Wings）是一款致力于野生鸟类保护的公益APP，为用户提供违法行为举报、鸟类百科查询、志愿活动参与等功能。

二、用户权利与义务
1. 您需如实填写注册信息，并对账号安全负责。
2. 您提交的举报信息须属实，不得恶意虚报。
3. 您在使用本平台时须遵守相关法律法规。

三、隐私保护
我们重视您的隐私，您的个人信息将严格按照《隐私政策》处理。

四、免责声明
本平台仅提供信息传递服务，对举报处理结果不承担法律责任。

五、协议变更
本协议如有变更，将通过APP通知提前告知用户。

如有疑问，请联系：guardianwings@example.com
      </text>
    </scroll-view>
  </view>
</template>

<script>
export default {
  methods: { goBack() { uni.navigateBack() } }
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; background: #FFFFFF; }
.nav-bar { display: flex; align-items: center; justify-content: space-between; padding: 88rpx 32rpx 20rpx; border-bottom: 1rpx solid #F3F4F6; }
.back { font-size: 30rpx; color: #2563EB; }
.title { font-size: 34rpx; color: #1C1C1E; font-weight: 600; }
.content { height: calc(100vh - 160rpx); padding: 32rpx; }
.article { font-size: 28rpx; color: #374151; line-height: 2; white-space: pre-wrap; }
</style>