<template>
  <view class="mine-page">
    <view class="header-bg">
      <view class="bg-circle bg-circle-1" />
      <view class="bg-circle bg-circle-2" />
    </view>
    <view class="status-bar" />

    <!-- 用户信息区 -->
    <view class="user-section">
      <view class="user-row">
        <view class="avatar-wrap" @click="goEditProfile">
          <image :src="userInfo.avatar || '/static/icons/avatar.png'" mode="aspectFill" class="avatar-img" />
          <view class="avatar-edit-dot">
            <uni-icons type="checkmark-circle-filled" size="12" color="#4CD964" />
          </view>
        </view>
        <view class="user-text" @click="goEditProfile">
          <text class="user-name">{{ userInfo.nickname || '候鸟守护者' }}</text>
          <view class="user-meta">
            <view class="level-tag"><text>{{ levelName }}</text></view>
            <text class="user-id">ID: {{ shortUid }}</text>
          </view>
        </view>
        <!-- 右上角齿轮 → 跳设置 -->
        <view class="settings-btn" @click="nav('/pages/public/mine/edit-profile')">
          <uni-icons type="settings" size="22" color="rgba(255,255,255,0.8)" />
        </view>
      </view>

      <!-- 数据统计 -->
      <view class="stats-row">
        <view class="stat-item" @click="nav('/pages/public/report/my-reports')">
          <view class="stat-num-row">
            <text class="stat-num">{{ stats.reports }}</text>
            <text class="stat-unit">条</text>
          </view>
          <text class="stat-label">举报记录</text>
        </view>
        <view class="stat-item" @click="goMyActivities">
          <view class="stat-num-row">
            <text class="stat-num">{{ stats.activities }}</text>
            <text class="stat-unit">次</text>
          </view>
          <text class="stat-label">志愿活动</text>
        </view>
        <view class="stat-item" @click="nav('/pages/public/mine/achievement')">
          <view class="stat-num-row">
            <text class="stat-num">{{ userInfo.points || 0 }}</text>
            <text class="stat-unit">分</text>
          </view>
          <text class="stat-label">守护积分</text>
        </view>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="card-section">
      <!-- 我的服务 -->
      <view class="section-card">
        <view class="section-header"><text class="section-title">我的服务</text></view>
        <view class="menu-list">
          <view class="menu-item" @click="nav('/pages/public/report/my-reports')">
            <view class="menu-icon-wrap" style="background:linear-gradient(135deg,#FF6B6B,#EE0979);">
              <svg viewBox="0 0 24 24" style="width:40rpx;height:40rpx;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="white"/></svg>
            </view>
            <text class="menu-label">我的举报</text>
            <view class="menu-right">
              <view class="badge" v-if="stats.pendingReports > 0"><text>{{ stats.pendingReports }}</text></view>
              <uni-icons type="right" size="16" color="#C7C7CC" />
            </view>
          </view>

          <view class="menu-item" @click="goMyActivities">
            <view class="menu-icon-wrap" style="background:linear-gradient(135deg,#4776E6,#8E54E9);">
              <svg viewBox="0 0 24 24" style="width:40rpx;height:40rpx;"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="white"/></svg>
            </view>
            <text class="menu-label">我的活动</text>
            <view class="menu-right">
              <uni-icons type="right" size="16" color="#C7C7CC" />
            </view>
          </view>

          <view class="menu-item" @click="nav('/pages/public/mine/achievement')">
            <view class="menu-icon-wrap" style="background:linear-gradient(135deg,#F7971E,#FFD200);">
              <svg viewBox="0 0 24 24" style="width:40rpx;height:40rpx;"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" fill="white"/></svg>
            </view>
            <text class="menu-label">我的成就</text>
            <view class="menu-right">
              <text class="menu-value">{{ userInfo.points || 0 }} 积分</text>
              <uni-icons type="right" size="16" color="#C7C7CC" />
            </view>
          </view>

          <view class="menu-item" @click="nav('/pages/public/mine/bookmarks')">
            <view class="menu-icon-wrap" style="background:linear-gradient(135deg,#11998e,#38ef7d);">
              <svg viewBox="0 0 24 24" style="width:40rpx;height:40rpx;"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="white"/></svg>
            </view>
            <text class="menu-label">我的收藏</text>
            <view class="menu-right">
              <uni-icons type="right" size="16" color="#C7C7CC" />
            </view>
          </view>
        </view>
      </view>

      <!-- 常用功能 -->
      <view class="section-card">
        <view class="section-header"><text class="section-title">常用功能</text></view>
        <view class="menu-list">
          <view class="menu-item" @click="nav('/pages/public/emergency/index')">
            <view class="menu-icon-wrap" style="background:linear-gradient(135deg,#FF416C,#FF4B2B);">
              <svg viewBox="0 0 24 24" style="width:40rpx;height:40rpx;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" fill="white"/></svg>
            </view>
            <text class="menu-label">紧急救助</text>
            <view class="menu-right">
              <uni-icons type="right" size="16" color="#C7C7CC" />
            </view>
          </view>

          <view class="menu-item" @click="nav('/pages/public/law/index')">
            <view class="menu-icon-wrap" style="background:linear-gradient(135deg,#536976,#292E49);">
              <svg viewBox="0 0 24 24" style="width:40rpx;height:40rpx;"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="white"/></svg>
            </view>
            <text class="menu-label">法律法规</text>
            <view class="menu-right">
              <uni-icons type="right" size="16" color="#C7C7CC" />
            </view>
          </view>

          <view class="menu-item" @click="showFeedback">
            <view class="menu-icon-wrap" style="background:linear-gradient(135deg,#1FA2FF,#12D8FA);">
              <svg viewBox="0 0 24 24" style="width:40rpx;height:40rpx;"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z" fill="white"/></svg>
            </view>
            <text class="menu-label">意见反馈</text>
            <view class="menu-right">
              <uni-icons type="right" size="16" color="#C7C7CC" />
            </view>
          </view>

          <view class="menu-item" @click="nav('/pages/public/mine/settings')">
            <view class="menu-icon-wrap" style="background:linear-gradient(135deg,#5C6BC0,#3949AB);">
              <svg viewBox="0 0 24 24" style="width:40rpx;height:40rpx;">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" fill="white"/>
              </svg>
            </view>
            <text class="menu-label">设置</text>
            <view class="menu-right">
              <uni-icons type="right" size="16" color="#C7C7CC" />
            </view>
          </view>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="logout-btn" @click="handleLogout">
        <text class="logout-text">退出登录</text>
      </view>
    </view>

    <tab-bar active="mine" />
  </view>
</template>

<script>
import TabBar from '@/components/common/tab-bar.vue'

export default {
  components: {
    TabBar
  },

  onShow() {
    uni.hideTabBar({ animation: false })
  },
  
  data() {
    return {
      userInfo: {},
      stats: { reports: 0, activities: 0, pendingReports: 0 }
    }
  },

  computed: {
    shortUid() {
      const uid = this.userInfo.uid || this.$store.state.user.uid || ''
      if (!uid) return 'GW000000'
      return 'GW' + uid.slice(-6).toUpperCase()
    },
    levelName() {
      const p = this.userInfo.points || 0
      if (p >= 1000) return '守护大使'
      if (p >= 500)  return '高级守护者'
      if (p >= 100)  return '守护者'
      return '初级'
    }
  },

  onShow() {
    this.loadUserInfo()
    this.loadStats()
  },

  methods: {
    async loadUserInfo() {
      const s = this.$store.state.user
      if (!s.uid) return

      // 先用store里的数据立即渲染，避免白屏
      this.userInfo = {
        uid:      s.uid,
        nickname: s.nickname || '',
        avatar:   s.avatar   || '',
        points:   s.points   || 0,
        role:     s.role     || 'public',
        gender:   s.gender   || 0,
        province: s.province || '',
        city:     s.city     || '',
        bio:      s.bio      || ''
      }

      // 再从云端刷新最新数据
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-user',
          data: { action: 'getUserInfo', params: { uid: s.uid } }
        })
        if (res.result.code === 0) {
          const u = res.result.data
          this.userInfo = {
            uid:      s.uid,
            nickname: u.nickname || s.nickname || '',
            avatar:   u.avatar   || s.avatar   || '',
            points:   u.points   !== undefined ? u.points : (s.points || 0),
            role:     u.role     || s.role     || 'public',
            gender:   u.gender   || 0,
            province: u.province || '',
            city:     u.city     || '',
            bio:      u.bio      || '',
            mobile:   u.mobile   || ''
          }
          // 同步更新store和本地存储
          this.$store.commit('user/SET_USER', { ...s, ...this.userInfo })
          uni.setStorageSync('gw_user_info', JSON.stringify({ ...s, ...this.userInfo }))
        }
      } catch (e) {}
    },

    async loadStats() {
      const uid = this.$store.state.user.uid
      if (!uid) return
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-user',
          data: { action: 'getUserStats', params: { uid } }
        })
        if (res.result.code === 0) this.stats = res.result.data
      } catch (e) {}
    },

    nav(url) {
      uni.navigateTo({ url }).catch(() => {
        uni.showToast({ title: '页面开发中', icon: 'none' })
      })
    },

    goEditProfile() {
      uni.navigateTo({ url: '/pages/public/mine/edit-profile' })
    },

    goSettings() {
      uni.navigateTo({ url: '/pages/public/mine/settings' })
    },

    goMyActivities() {
      // 存标记，志愿页面onShow里读取后切到"我的活动"tab
      uni.setStorageSync('volunteer_tab', 'my')
      uni.switchTab({ url: '/pages/public/volunteer/index' })
    },

    showFeedback() {
      uni.showModal({
        title: '意见反馈',
        content: '感谢您的反馈！\n请通过邮箱联系我们：\nfeedback@guardianwings.org',
        showCancel: false
      })
    },

    handleLogout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
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
.mine-page { min-height: 100vh; background: #F2F2F7; padding-bottom: 140rpx; }
.header-bg { position: absolute; top: 0; left: 0; right: 0; height: 480rpx; background: linear-gradient(160deg, #1B4B8C 0%, #2563EB 60%, #3B82F6 100%); overflow: hidden; z-index: 0; }
.bg-circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.06); }
.bg-circle-1 { width: 480rpx; height: 480rpx; top: -160rpx; right: -120rpx; }
.bg-circle-2 { width: 320rpx; height: 320rpx; top: 200rpx; left: -80rpx; }
.status-bar { height: var(--status-bar-height); position: relative; z-index: 1; }
.user-section { position: relative; z-index: 1; padding: 24rpx 32rpx 48rpx; }
.user-row { display: flex; align-items: center; gap: 24rpx; margin-bottom: 48rpx; }
.avatar-wrap { position: relative; flex-shrink: 0; }
.avatar-img { width: 136rpx; height: 136rpx; border-radius: 50%; border: 4rpx solid rgba(255,255,255,0.5); background: #ddd; }
.avatar-edit-dot { position: absolute; right: 0; bottom: 0; width: 44rpx; height: 44rpx; background: #2563EB; border-radius: 50%; border: 3rpx solid white; display: flex; align-items: center; justify-content: center; }
.user-text { flex: 1; }
.user-name { display: block; font-size: 44rpx; font-weight: 700; color: #FFFFFF; margin-bottom: 12rpx; letter-spacing: 1rpx; }
.user-meta { display: flex; align-items: center; gap: 16rpx; }
.level-tag { padding: 4rpx 18rpx; background: rgba(255,255,255,0.2); border-radius: 24rpx; border: 1rpx solid rgba(255,255,255,0.3); }
.level-tag text { font-size: 22rpx; color: rgba(255,255,255,0.9); font-weight: 500; }
.user-id { font-size: 24rpx; color: rgba(255,255,255,0.6); }
.settings-btn { width: 72rpx; height: 72rpx; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.15); border-radius: 50%; border: 1rpx solid rgba(255,255,255,0.2); flex-shrink: 0; }
.stats-row { display: flex; background: rgba(255,255,255,0.12); border-radius: 24rpx; padding: 32rpx 0; backdrop-filter: blur(12rpx); border: 1rpx solid rgba(255,255,255,0.2); }
.stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; }
.stat-item + .stat-item::before { content: ''; position: absolute; left: 0; top: 20%; height: 60%; width: 1rpx; background: rgba(255,255,255,0.25); }
.stat-num-row { display: flex; align-items: baseline; gap: 4rpx; margin-bottom: 8rpx; }
.stat-num { font-size: 52rpx; font-weight: 700; color: #FFFFFF; line-height: 1; }
.stat-unit { font-size: 24rpx; color: rgba(255,255,255,0.7); }
.stat-label { font-size: 24rpx; color: rgba(255,255,255,0.65); }
.card-section { padding: 0 24rpx; position: relative; z-index: 1; margin-top: -24rpx; }
.section-card { background: #FFFFFF; border-radius: 24rpx; margin-bottom: 20rpx; overflow: hidden; box-shadow: 0 2rpx 20rpx rgba(0,0,0,0.06); }
.section-header { padding: 32rpx 32rpx 16rpx; border-bottom: 1rpx solid #F2F2F7; }
.section-title { font-size: 28rpx; font-weight: 600; color: #8E8E93; letter-spacing: 1rpx; }
.menu-list { padding: 0; }
.menu-item { display: flex; align-items: center; padding: 28rpx 32rpx; gap: 24rpx; border-bottom: 1rpx solid #F2F2F7; transition: background 0.15s; &:last-child { border-bottom: none; } &:active { background: #F9F9F9; } }
.menu-icon-wrap { width: 80rpx; height: 80rpx; border-radius: 22rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.15); }
.menu-label { flex: 1; font-size: 32rpx; color: #1C1C1E; font-weight: 500; }
.menu-right { display: flex; align-items: center; gap: 8rpx; }
.menu-value { font-size: 26rpx; color: #8E8E93; }
.badge { min-width: 36rpx; height: 36rpx; padding: 0 10rpx; background: #FF3B30; border-radius: 18rpx; display: flex; align-items: center; justify-content: center; }
.badge text { font-size: 20rpx; color: #fff; font-weight: 600; }
.logout-btn { background: #FFFFFF; border-radius: 24rpx; height: 96rpx; display: flex; align-items: center; justify-content: center; margin-bottom: 32rpx; box-shadow: 0 2rpx 20rpx rgba(0,0,0,0.06); &:active { opacity: 0.8; } }
.logout-text { font-size: 32rpx; color: #FF3B30; font-weight: 500; }
</style>