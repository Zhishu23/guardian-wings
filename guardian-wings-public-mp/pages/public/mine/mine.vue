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
              <uni-icons type="info-filled" size="24" color="#FFFFFF" />
            </view>
            <text class="menu-label">我的举报</text>
            <view class="menu-right">
              <view class="badge" v-if="stats.pendingReports > 0"><text>{{ stats.pendingReports }}</text></view>
              <uni-icons type="right" size="16" color="#C7C7CC" />
            </view>
          </view>

          <view class="menu-item" @click="goMyActivities">
            <view class="menu-icon-wrap" style="background:linear-gradient(135deg,#4776E6,#8E54E9);">
              <uni-icons type="personadd-filled" size="24" color="#FFFFFF" />
            </view>
            <text class="menu-label">我的活动</text>
            <view class="menu-right">
              <uni-icons type="right" size="16" color="#C7C7CC" />
            </view>
          </view>

          <view class="menu-item" @click="nav('/pages/public/mine/achievement')">
            <view class="menu-icon-wrap" style="background:linear-gradient(135deg,#F7971E,#FFD200);">
              <uni-icons type="medal-filled" size="24" color="#FFFFFF" />
            </view>
            <text class="menu-label">我的成就</text>
            <view class="menu-right">
              <text class="menu-value">{{ userInfo.points || 0 }} 积分</text>
              <uni-icons type="right" size="16" color="#C7C7CC" />
            </view>
          </view>

          <view class="menu-item" @click="nav('/pages/public/mine/bookmarks')">
            <view class="menu-icon-wrap" style="background:linear-gradient(135deg,#11998e,#38ef7d);">
              <uni-icons type="star-filled" size="24" color="#FFFFFF" />
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
              <uni-icons type="plus-filled" size="24" color="#FFFFFF" />
            </view>
            <text class="menu-label">紧急救助</text>
            <view class="menu-right">
              <uni-icons type="right" size="16" color="#C7C7CC" />
            </view>
          </view>

          <view class="menu-item" @click="nav('/pages/public/law/index')">
            <view class="menu-icon-wrap" style="background:linear-gradient(135deg,#536976,#292E49);">
              <uni-icons type="paperclip" size="24" color="#FFFFFF" />
            </view>
            <text class="menu-label">法律法规</text>
            <view class="menu-right">
              <uni-icons type="right" size="16" color="#C7C7CC" />
            </view>
          </view>

          <view class="menu-item" @click="showFeedback">
            <view class="menu-icon-wrap" style="background:linear-gradient(135deg,#1FA2FF,#12D8FA);">
              <uni-icons type="chat-filled" size="24" color="#FFFFFF" />
            </view>
            <text class="menu-label">意见反馈</text>
            <view class="menu-right">
              <uni-icons type="right" size="16" color="#C7C7CC" />
            </view>
          </view>

          <view class="menu-item" @click="nav('/pages/public/mine/settings')">
            <view class="menu-icon-wrap" style="background:linear-gradient(135deg,#5C6BC0,#3949AB);">
              <uni-icons type="settings-filled" size="24" color="#FFFFFF" />
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
          name: 'gw-public-user',
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
          name: 'gw-public-user',
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
            uni.reLaunch({ url: '/pages/login/public-login' })
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
