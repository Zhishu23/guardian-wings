<template>
  <view class="settings-page">
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <svg viewBox="0 0 24 24" style="width:44rpx;height:44rpx;">
          <path d="M15 18l-6-6 6-6" stroke="#1C1C1E" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </view>
      <text class="nav-title">设置</text>
      <view style="width:64rpx;" />
    </view>

    <scroll-view scroll-y class="scroll-wrap">

      <!-- 账号 -->
      <view class="group-header"><text>账号</text></view>
      <view class="cell-group">
        <view class="cell cell-tap" @click="goProfile">
          <text class="cell-label">个人资料</text>
          <svg viewBox="0 0 24 24" style="width:28rpx;height:28rpx;">
            <path d="M9 6l6 6-6 6" stroke="#C7C7CC" stroke-width="2" fill="none" stroke-linecap="round"/>
          </svg>
        </view>
        <view class="cell-line" />
        <view class="cell cell-tap" @click="goChangePwd">
          <text class="cell-label">修改密码</text>
          <svg viewBox="0 0 24 24" style="width:28rpx;height:28rpx;">
            <path d="M9 6l6 6-6 6" stroke="#C7C7CC" stroke-width="2" fill="none" stroke-linecap="round"/>
          </svg>
        </view>
        <view class="cell-line" />
        <view class="cell cell-tap" @click="showBindTip">
          <text class="cell-label">手机号绑定</text>
          <view style="display:flex;align-items:center;gap:12rpx;">
            <text class="cell-hint green">已绑定</text>
            <svg viewBox="0 0 24 24" style="width:28rpx;height:28rpx;">
              <path d="M9 6l6 6-6 6" stroke="#C7C7CC" stroke-width="2" fill="none" stroke-linecap="round"/>
            </svg>
          </view>
        </view>
      </view>

      <!-- 通用 -->
      <view class="group-header"><text>通用</text></view>
      <view class="cell-group">
        <view class="cell">
          <text class="cell-label">举报进度通知</text>
          <switch :checked="notify.report" color="#07C160" @change="e => notify.report = e.detail.value" style="transform:scale(0.85);" />
        </view>
        <view class="cell-line" />
        <view class="cell">
          <text class="cell-label">活动报名提醒</text>
          <switch :checked="notify.activity" color="#07C160" @change="e => notify.activity = e.detail.value" style="transform:scale(0.85);" />
        </view>
        <view class="cell-line" />
        <view class="cell">
          <text class="cell-label">系统公告</text>
          <switch :checked="notify.system" color="#07C160" @change="e => notify.system = e.detail.value" style="transform:scale(0.85);" />
        </view>
        <view class="cell-line" />
        <view class="cell cell-tap" @click="clearCache">
          <text class="cell-label">清除缓存</text>
          <view style="display:flex;align-items:center;gap:12rpx;">
            <text class="cell-hint">{{ cacheSize }}</text>
            <svg viewBox="0 0 24 24" style="width:28rpx;height:28rpx;">
              <path d="M9 6l6 6-6 6" stroke="#C7C7CC" stroke-width="2" fill="none" stroke-linecap="round"/>
            </svg>
          </view>
        </view>
      </view>

      <!-- 其他 -->
      <view class="group-header"><text>其他</text></view>
      <view class="cell-group">
        <view class="cell cell-tap" @click="goPrivacy">
          <text class="cell-label">隐私政策</text>
          <svg viewBox="0 0 24 24" style="width:28rpx;height:28rpx;">
            <path d="M9 6l6 6-6 6" stroke="#C7C7CC" stroke-width="2" fill="none" stroke-linecap="round"/>
          </svg>
        </view>
        <view class="cell-line" />
        <view class="cell cell-tap" @click="goAgreement">
          <text class="cell-label">用户协议</text>
          <svg viewBox="0 0 24 24" style="width:28rpx;height:28rpx;">
            <path d="M9 6l6 6-6 6" stroke="#C7C7CC" stroke-width="2" fill="none" stroke-linecap="round"/>
          </svg>
        </view>
        <view class="cell-line" />
        <view class="cell cell-tap" @click="goAbout">
          <text class="cell-label">关于翼路平安</text>
          <svg viewBox="0 0 24 24" style="width:28rpx;height:28rpx;">
            <path d="M9 6l6 6-6 6" stroke="#C7C7CC" stroke-width="2" fill="none" stroke-linecap="round"/>
          </svg>
        </view>
        <view class="cell-line" />
        <view class="cell">
          <text class="cell-label">当前版本</text>
          <text class="cell-hint">v1.0.0</text>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="group-gap" />
      <view class="cell-group">
        <view class="cell cell-tap logout-cell" @click="handleLogout">
          <text class="logout-text">退出登录</text>
        </view>
      </view>
      <view class="group-gap" />

    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      notify: { report: true, activity: true, system: true },
      cacheSize: '计算中...'
    }
  },
  onLoad() {
    const size = (Math.random() * 4 + 0.5).toFixed(1)
    this.cacheSize = `${size} MB`
  },
  methods: {
    goBack() { uni.navigateBack() },

    
    goProfile() { uni.navigateTo({ url: '/pages/public/mine/edit-profile' }) },

    goChangePwd() { uni.navigateTo({ url: '/pages/public/mine/change-password' }) },
    showBindTip() { uni.showToast({ title: '手机号已绑定', icon: 'none' }) },
    goPrivacy()   { uni.navigateTo({ url: '/pages/public/mine/privacy-policy' }) },
    goAgreement() { uni.navigateTo({ url: '/pages/public/mine/user-agreement' }) },
    goAbout()     { uni.navigateTo({ url: '/pages/public/mine/about' }) },

    clearCache() {
      uni.showModal({
        title: '清除缓存', content: `确定清除 ${this.cacheSize} 缓存吗？`,
        success: res => {
          if (res.confirm) {
            uni.showLoading({ title: '清除中...' })
            setTimeout(() => {
              uni.hideLoading()
              this.cacheSize = '0 MB'
              uni.showToast({ title: '清除成功', icon: 'success' })
            }, 800)
          }
        }
      })
    },

    handleLogout() {
      uni.showModal({
        title: '退出登录', content: '确定要退出登录吗？',
        success: res => {
          if (res.confirm) {
            this.$store.dispatch('user/logout')
            uni.reLaunch({ url: '/pages/login/login' })
          }
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
page { background: #EFEFF4; }
.settings-page { min-height: 100vh; background: #EFEFF4; }
.nav-bar { display:flex; align-items:center; justify-content:space-between; padding:88rpx 32rpx 20rpx; background:#FFFFFF; border-bottom:1rpx solid #E5E5EA; }
.nav-back { width:64rpx; height:64rpx; display:flex; align-items:center; justify-content:center; }
.nav-title { font-size:34rpx; font-weight:600; color:#1C1C1E; }
.scroll-wrap { height:calc(100vh - 160rpx); }
.group-gap { height:24rpx; }
.group-header { padding: 32rpx 32rpx 12rpx; background: #EFEFF4; }
.group-header text { font-size:26rpx; color:#8E8E93; font-weight:400; }
.cell-group { background:#FFFFFF; }
.cell { display:flex; align-items:center; justify-content:space-between; padding:0 32rpx; min-height:104rpx; }
.cell-tap { transition:background 0.15s; }
.cell-tap:active { background:#F7F7F7; }
.cell-label { font-size:34rpx; color:#1C1C1E; font-weight:400; }
.cell-hint { font-size:30rpx; color:#8E8E93; }
.cell-hint.green { color:#07C160; }
.cell-line { height:1rpx; background:#E5E5EA; margin-left:32rpx; }
.logout-cell { justify-content:center; }
.logout-text { font-size:34rpx; color:#E53935; font-weight:400; }
</style>