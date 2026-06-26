<template>
  <view class="page">
    <view class="nav-bar">
      <view @click="goBack"><text class="back">‹ 返回</text></view>
      <text class="title">更换手机号</text>
      <view style="width:80rpx"/>
    </view>
    <view class="form-card">
      <view class="form-item">
        <text class="label">新手机号</text>
        <input class="input" v-model="mobile" type="number" maxlength="11" placeholder="请输入新手机号"/>
      </view>
      <view class="form-item">
        <text class="label">验证码</text>
        <input class="input" v-model="code" type="number" maxlength="6" placeholder="请输入验证码"/>
        <view class="send-btn" :class="{ disabled: countdown > 0 }" @click="sendCode">
          <text>{{ countdown > 0 ? `${countdown}s` : '获取验证码' }}</text>
        </view>
      </view>
    </view>
    <view class="submit-btn" @click="submit"><text>确认更换</text></view>
  </view>
</template>

<script>
export default {
  data() { return { mobile: '', code: '', countdown: 0, timer: null } },
  methods: {
    async sendCode() {
      if (this.countdown > 0) return
      if (!/^1[3-9]\d{9}$/.test(this.mobile)) return uni.showToast({ title: '手机号格式不正确', icon: 'none' })
      try {
        await uniCloud.callFunction({ name: 'gw-public-user', data: { action: 'sendSmsCode', params: { mobile: this.mobile } } })
        uni.showToast({ title: '验证码已发送', icon: 'success' })
        this.countdown = 60
        this.timer = setInterval(() => { if (--this.countdown <= 0) clearInterval(this.timer) }, 1000)
      } catch (e) {
        uni.showToast({ title: '发送失败', icon: 'none' })
      }
    },
    async submit() {
      if (!/^1[3-9]\d{9}$/.test(this.mobile)) return uni.showToast({ title: '手机号格式不正确', icon: 'none' })
      if (!this.code) return uni.showToast({ title: '请输入验证码', icon: 'none' })
      uni.showToast({ title: '功能开发中', icon: 'none' })
    },
    goBack() { uni.navigateBack() }
  },
  onUnload() { clearInterval(this.timer) }
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; background: #EFEFF4; }
.nav-bar { display: flex; align-items: center; justify-content: space-between; padding: 88rpx 32rpx 20rpx; background: #FFFFFF; margin-bottom: 20rpx; }
.back { font-size: 30rpx; color: #2563EB; }
.title { font-size: 34rpx; color: #1C1C1E; font-weight: 600; }
.form-card { background: #FFFFFF; }
.form-item { display: flex; align-items: center; padding: 28rpx 32rpx; border-bottom: 1rpx solid #F3F4F6; }
.label { width: 140rpx; font-size: 28rpx; color: #1C1C1E; flex-shrink: 0; }
.input { flex: 1; font-size: 28rpx; color: #3C3C3E; }
.send-btn { padding: 12rpx 24rpx; background: #EFF6FF; border-radius: 8rpx; &.disabled { opacity: 0.5; } text { font-size: 24rpx; color: #2563EB; } }
.submit-btn { margin: 48rpx 32rpx; height: 96rpx; background: linear-gradient(135deg, #1B4B8C, #2563EB); border-radius: 16rpx; display: flex; align-items: center; justify-content: center; text { font-size: 32rpx; color: #FFFFFF; font-weight: 600; } }
</style>