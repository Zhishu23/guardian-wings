<template>
  <view class="success-page">
    <view class="content">
      <!-- 成功动画区 -->
      <view class="success-icon-wrap">
        <view class="success-circle">
          <text class="success-check">✓</text>
        </view>
        <view class="ripple ripple-1" />
        <view class="ripple ripple-2" />
      </view>

      <text class="success-title">举报提交成功</text>
      <text class="success-sub">感谢您为保护野生动物做出的贡献</text>

      <!-- 积分奖励 -->
      <view class="points-reward">
        <text class="points-icon">⭐</text>
        <text class="points-text">获得 <text class="points-num">+10</text> 守护积分</text>
      </view>

      <!-- 信息卡片 -->
      <view class="info-card">
        <view class="info-row">
          <text class="info-label">案件编号</text>
          <text class="info-value">GW{{ caseNo }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">提交时间</text>
          <text class="info-value">{{ submitTime }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">当前状态</text>
          <view class="status-tag"><text>待处理</text></view>
        </view>
        <view class="info-row">
          <text class="info-label">处理时限</text>
          <text class="info-value">7个工作日内</text>
        </view>
      </view>

      <!-- 温馨提示 -->
      <view class="tip-card">
        <text class="tip-title">📋 后续流程</text>
        <view class="tip-list">
          <text class="tip-item">1. 工作人员将在7个工作日内审核您的举报</text>
          <text class="tip-item">2. 审核结果将通过通知中心告知您</text>
          <text class="tip-item">3. 如需补充材料，工作人员会联系您</text>
          <text class="tip-item">4. 您可在「我的举报」中查看处理进度</text>
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-actions">
      <view class="action-btn secondary" @click="viewMyReports">
        <text>查看我的举报</text>
      </view>
      <view class="action-btn primary" @click="goHome">
        <text>返回首页</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      caseNo:     '',
      submitTime: ''
    }
  },

  onLoad(options) {
    this.caseNo     = Date.now().toString().slice(-8)
    const now       = new Date()
    const pad       = n => String(n).padStart(2, '0')
    this.submitTime = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  },

  methods: {
    viewMyReports() {
      uni.navigateTo({ url: '/pages/public/report/my-reports' })
    },
    goHome() {
      uni.switchTab({ url: '/pages/public/home/home' })
    }
  }
}
</script>

<style scoped lang="scss">
.success-page { min-height: 100vh; background: linear-gradient(180deg, #F0FDF4 0%, #F5F7FA 40%); display: flex; flex-direction: column; }
.content { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 80rpx 40rpx 40rpx; }
.success-icon-wrap { position: relative; width: 240rpx; height: 240rpx; display: flex; align-items: center; justify-content: center; margin-bottom: 48rpx; }
.success-circle { width: 160rpx; height: 160rpx; background: linear-gradient(135deg, #2D8F47 0%, #2D6A4F 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 12rpx 40rpx rgba(45,143,71,0.3); z-index: 1; }
.success-check { font-size: 80rpx; color: #FFFFFF; font-weight: 300; }
.ripple { position: absolute; border-radius: 50%; border: 4rpx solid rgba(45,143,71,0.3); animation: ripple 2s infinite; }
.ripple-1 { width: 200rpx; height: 200rpx; animation-delay: 0s; }
.ripple-2 { width: 240rpx; height: 240rpx; animation-delay: 0.5s; }
@keyframes ripple { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1.2); opacity: 0; } }
.success-title { font-size: 48rpx; font-weight: 700; color: #1F2937; margin-bottom: 16rpx; }
.success-sub { font-size: 28rpx; color: #6B7280; margin-bottom: 40rpx; }
.points-reward { display: flex; align-items: center; gap: 12rpx; background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); padding: 20rpx 40rpx; border-radius: 40rpx; margin-bottom: 40rpx; border: 2rpx solid #FDE68A; }
.points-icon { font-size: 36rpx; }
.points-text { font-size: 28rpx; color: #92400E; }
.points-num { font-size: 36rpx; font-weight: 700; color: #D97706; }
.info-card { width: 100%; background: #FFFFFF; border-radius: 16rpx; padding: 32rpx; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.06); margin-bottom: 24rpx; }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid #F3F4F6; &:last-child { border-bottom: none; } }
.info-label { font-size: 26rpx; color: #6B7280; }
.info-value { font-size: 26rpx; color: #1F2937; font-weight: 500; }
.status-tag { padding: 6rpx 20rpx; background: #DBEAFE; border-radius: 8rpx; text { font-size: 22rpx; color: #1D4ED8; font-weight: 500; } }
.tip-card { width: 100%; background: #F0FDF4; border-radius: 16rpx; padding: 28rpx; border: 2rpx solid #BBF7D0; }
.tip-title { display: block; font-size: 28rpx; font-weight: 600; color: #065F46; margin-bottom: 20rpx; }
.tip-list { display: flex; flex-direction: column; gap: 14rpx; }
.tip-item { font-size: 24rpx; color: #047857; line-height: 1.6; }
.bottom-actions { padding: 24rpx 40rpx 60rpx; display: flex; gap: 20rpx; }
.action-btn { flex: 1; height: 96rpx; display: flex; align-items: center; justify-content: center; border-radius: 16rpx; text { font-size: 30rpx; font-weight: 600; } }
.secondary { background: #FFFFFF; border: 2rpx solid #E5E7EB; text { color: #374151; } }
.primary { background: linear-gradient(135deg, #2D8F47 0%, #2D6A4F 100%); box-shadow: 0 8rpx 24rpx rgba(45,106,79,0.3); text { color: #FFFFFF; } }
</style>