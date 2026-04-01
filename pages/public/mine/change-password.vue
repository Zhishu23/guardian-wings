<template>
  <view class="page">
    <view class="nav-bar">
      <view @click="goBack"><text class="back">‹ 返回</text></view>
      <text class="title">修改密码</text>
      <view style="width:80rpx"/>
    </view>
    <view class="form-card">
      <view class="form-item">
        <text class="label">原密码</text>
        <input class="input" v-model="oldPwd" password placeholder="请输入原密码"/>
      </view>
      <view class="form-item">
        <text class="label">新密码</text>
        <input class="input" v-model="newPwd" password placeholder="6-20位字母或数字"/>
      </view>
      <view class="form-item">
        <text class="label">确认密码</text>
        <input class="input" v-model="confirmPwd" password placeholder="再次输入新密码"/>
      </view>
    </view>
    <view class="submit-btn" @click="submit"><text>确认修改</text></view>
  </view>
</template>

<script>
export default {
  data() { return { oldPwd: '', newPwd: '', confirmPwd: '' } },
  methods: {
    async submit() {
      if (!this.oldPwd) return uni.showToast({ title: '请输入原密码', icon: 'none' })
      if (this.newPwd.length < 6) return uni.showToast({ title: '新密码至少6位', icon: 'none' })
      if (this.newPwd !== this.confirmPwd) return uni.showToast({ title: '两次密码不一致', icon: 'none' })
      
      uni.showLoading({ title: '提交中...' })
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-user',
          data: {
            action: 'changePassword',
            params: {
              uid:         this.$store.state.user.uid,
              oldPassword: this.oldPwd,
              newPassword: this.newPwd
            }
          }
        })
        uni.hideLoading()
        if (res.result.code === 0) {
          uni.showToast({ title: '修改成功，请重新登录', icon: 'success' })
          setTimeout(() => {
            this.$store.dispatch('user/logout')
            uni.reLaunch({ url: '/pages/login/login' })
          }, 1500)
        } else {
          uni.showToast({ title: res.result.msg || '修改失败', icon: 'none' })
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '网络异常', icon: 'none' })
      }
    },
    goBack() { uni.navigateBack() }
  }
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
.submit-btn { margin: 48rpx 32rpx; height: 96rpx; background: linear-gradient(135deg, #1B4B8C, #2563EB); border-radius: 16rpx; display: flex; align-items: center; justify-content: center; text { font-size: 32rpx; color: #FFFFFF; font-weight: 600; } }
</style>