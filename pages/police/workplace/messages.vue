<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />

    <view class="top-nav">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </view>
      <view class="nav-main">
        <text class="nav-title">消息中心</text>
        <text class="nav-sub">任务群聊 · 部门协作</text>
      </view>
      <view class="create-btn" @click="showCreateSheet">
        <text>+</text>
      </view>
    </view>

    <view class="summary-bar">
      <view class="summary-item">
        <text class="summary-value">{{ roomList.length }}</text>
        <text class="summary-label">会话</text>
      </view>
      <view class="summary-divider"></view>
      <view class="summary-item">
        <text class="summary-value">{{ totalUnread }}</text>
        <text class="summary-label">未读</text>
      </view>
      <view class="summary-divider"></view>
      <view class="summary-item">
        <text class="summary-value">{{ onlineLabel }}</text>
        <text class="summary-label">状态</text>
      </view>
    </view>

    <view class="invitation-banner" v-if="pendingInviteCount > 0" @click="openInvitations">
      <view class="invite-icon">
        <text>{{ pendingInviteCount }}</text>
      </view>
      <view class="invite-main">
        <text>你有 {{ pendingInviteCount }} 条入群邀请待处理</text>
        <text>接受后可进入对应群聊参与沟通</text>
      </view>
      <uni-icons type="right" size="18" color="#94A3B8" />
    </view>

    <view class="search-box">
      <uni-icons type="search" size="18" color="#94A3B8" />
      <input
        class="search-input"
        v-model="keyword"
        placeholder="搜索群名、部门或任务"
        confirm-type="search"
      />
      <view class="clear-btn" v-if="keyword" @click="keyword = ''">
        <uni-icons type="clear" size="18" color="#94A3B8" />
      </view>
    </view>

    <scroll-view scroll-x class="filter-scroll" :show-scrollbar="false">
      <view class="filter-row">
        <view
          class="filter-chip"
          v-for="tab in filterTabs"
          :key="tab.key"
          :class="{ active: activeFilter === tab.key }"
          @click="activeFilter = tab.key"
        >
          <text>{{ tab.label }}</text>
          <view class="chip-badge" v-if="tab.key === 'unread' && totalUnread > 0">
            <text>{{ totalUnread }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <scroll-view
      scroll-y
      class="room-scroll"
      :class="{ 'with-invite': pendingInviteCount > 0 }"
      :show-scrollbar="false"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onPullRefresh"
    >
      <view v-if="loading && roomList.length === 0" class="loading-wrap">
        <view class="loading-dot"></view>
        <text>正在加载群聊...</text>
      </view>

      <view
        v-for="room in filteredRooms"
        :key="room.id"
        class="room-card"
        :class="{ unread: room.unread_count > 0 }"
        @click="openRoom(room)"
      >
        <view class="room-avatar" :class="'avatar-' + room.type">
          <text>{{ getRoomInitial(room) }}</text>
        </view>
        <view class="room-body">
          <view class="room-top">
            <view class="room-name-wrap">
              <text class="room-name">{{ room.name }}</text>
              <view class="room-tag" :class="'tag-' + room.type">
                <text>{{ getTypeLabel(room.type) }}</text>
              </view>
            </view>
            <text class="room-time">{{ room.last_message_time_text }}</text>
          </view>
          <view class="room-bottom">
            <text class="room-message">{{ room.last_message || '暂无消息' }}</text>
            <view class="unread-badge" v-if="room.unread_count > 0">
              <text>{{ room.unread_count > 99 ? '99+' : room.unread_count }}</text>
            </view>
          </view>
          <view class="room-meta">
            <text>{{ room.member_count || 1 }} 人</text>
            <text v-if="room.dept"> · {{ room.dept }}</text>
            <text v-if="room.task_id"> · 已关联任务</text>
          </view>
        </view>
      </view>

      <view v-if="!loading && filteredRooms.length === 0" class="empty-wrap">
        <view class="empty-icon">
          <uni-icons type="chatbubble" size="48" color="#CBD5E1" />
        </view>
        <text class="empty-title">{{ keyword ? '没有匹配的群聊' : '暂无群聊会话' }}</text>
        <text class="empty-desc">先创建一个部门协作群，第一期会用云函数轮询刷新消息</text>
        <view class="empty-actions">
          <button class="primary-btn" @click="createDepartmentRoom">创建部门群</button>
          <button class="secondary-btn" @click="createTempRoom">临时处置群</button>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 0,
      loading: false,
      refreshing: false,
      activeFilter: 'all',
      keyword: '',
      roomList: [],
      pendingInviteCount: 0,
      pollTimer: null,
      lastErrorToastAt: 0,
      filterTabs: [
        { key: 'all', label: '全部' },
        { key: 'task', label: '任务群' },
        { key: 'department', label: '部门群' },
        { key: 'temp', label: '临时群' },
        { key: 'unread', label: '未读' }
      ]
    }
  },

  computed: {
    totalUnread() {
      return this.roomList.reduce((sum, room) => sum + (Number(room.unread_count) || 0), 0)
    },

    onlineLabel() {
      return this.pollTimer ? '在线' : '待机'
    },

    filteredRooms() {
      let list = this.roomList
      if (this.activeFilter === 'unread') {
        list = list.filter(room => room.unread_count > 0)
      } else if (this.activeFilter !== 'all') {
        list = list.filter(room => room.type === this.activeFilter)
      }

      const kw = this.keyword.trim().toLowerCase()
      if (kw) {
        list = list.filter(room =>
          String(room.name || '').toLowerCase().includes(kw) ||
          String(room.dept || '').toLowerCase().includes(kw) ||
          String(room.task_id || '').toLowerCase().includes(kw)
        )
      }

      return list
    }
  },

  onLoad() {
    const sys = uni.getSystemInfoSync()
    this.statusBarHeight = sys.statusBarHeight || 0
    this.loadRooms()
    this.loadInvitationSummary(true)
  },

  onShow() {
    this.loadRooms(true)
    this.loadInvitationSummary(true)
    this.startPolling()
  },

  onHide() {
    this.stopPolling()
  },

  onUnload() {
    this.stopPolling()
  },

  methods: {
    goBack() {
      uni.navigateBack()
    },

    readPoliceInfo() {
      let parsed = {}
      try {
        const raw = uni.getStorageSync('gw_police_info')
        parsed = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {}
      } catch (e) {}

      const storePolice = (this.$store && this.$store.state && this.$store.state.police) || {}
      return {
        officer_id: parsed.officer_id || parsed._id || storePolice.officer_id || '',
        name: parsed.name || storePolice.name || '警务人员',
        department: parsed.department || storePolice.department || '',
        badge_no: parsed.badge_no || storePolice.badge_no || ''
      }
    },

    ensurePolice() {
      const police = this.readPoliceInfo()
      if (!police.officer_id) {
        uni.showModal({
          title: '需要登录',
          content: '请先登录警务账号后再使用群聊。',
          confirmText: '去登录',
          success: res => {
            if (res.confirm) uni.redirectTo({ url: '/pages/login/police-login' })
          }
        })
        return null
      }
      return police
    },

    async loadRooms(silent = false) {
      const police = this.ensurePolice()
      if (!police) return
      if (!silent) this.loading = true
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-chat',
          data: {
            action: 'getRoomList',
            params: {
              officer_id: police.officer_id,
              page: 1,
              pageSize: 50
            }
          }
        })
        if (res.result && res.result.code === 0) {
          this.roomList = res.result.data.list || []
        } else if (!silent) {
          this.showServiceNotice((res.result && res.result.msg) || '群聊加载失败')
        }
      } catch (e) {
        if (!silent) this.showServiceNotice('群聊服务暂不可用，请检查网络')
        console.error('loadRooms error:', e)
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },

    async loadInvitationSummary(silent = false) {
      const police = this.ensurePolice()
      if (!police) return
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-chat',
          data: {
            action: 'getMyInvitations',
            params: {
              officer_id: police.officer_id,
              status: 'pending',
              page: 1,
              pageSize: 20
            }
          }
        })
        if (res.result && res.result.code === 0) {
          const list = res.result.data.list || []
          this.pendingInviteCount = list.filter(item => item.status === 'pending').length
        } else if (!silent) {
          this.showServiceNotice((res.result && res.result.msg) || '入群邀请加载失败')
        }
      } catch (e) {
        if (!silent) this.showServiceNotice('入群邀请暂不可用，请检查网络')
        console.error('loadInvitationSummary error:', e)
      }
    },

    startPolling() {
      if (this.pollTimer) return
      this.pollTimer = setInterval(() => {
        this.loadRooms(true)
        this.loadInvitationSummary(true)
      }, 12000)
    },

    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    },

    async onPullRefresh() {
      this.refreshing = true
      await Promise.all([
        this.loadRooms(true),
        this.loadInvitationSummary(true)
      ])
      this.refreshing = false
    },

    showCreateSheet() {
      uni.showActionSheet({
        itemList: ['创建部门协作群', '创建临时处置群'],
        success: res => {
          if (res.tapIndex === 0) this.createDepartmentRoom()
          if (res.tapIndex === 1) this.createTempRoom()
        }
      })
    },

    async createDepartmentRoom() {
      const police = this.ensurePolice()
      if (!police) return
      await this.createRoom({
        type: 'department',
        name: `${police.department || '警务'}协作群`,
        dept: police.department
      })
    },

    async createTempRoom() {
      const police = this.ensurePolice()
      if (!police) return
      const now = new Date()
      const pad = n => String(n).padStart(2, '0')
      await this.createRoom({
        type: 'temp',
        name: `临时处置群 ${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
      })
    },

    async createRoom(extra) {
      const police = this.ensurePolice()
      if (!police) return
      uni.showLoading({ title: '创建中...' })
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-chat',
          data: {
            action: 'createRoom',
            params: {
              ...extra,
              creator_id: police.officer_id,
              creator_name: police.name,
              creator_badge_no: police.badge_no,
              members: [{
                officer_id: police.officer_id,
                officer_name: police.name,
                badge_no: police.badge_no
              }]
            }
          }
        })
        uni.hideLoading()
        if (res.result && res.result.code === 0) {
          const room = res.result.data.room
          uni.showToast({ title: '群聊已创建', icon: 'success' })
          this.loadRooms(true)
          setTimeout(() => this.openRoom(room), 500)
        } else {
          this.showServiceNotice((res.result && res.result.msg) || '创建失败', true)
        }
      } catch (e) {
        uni.hideLoading()
        this.showServiceNotice('创建失败，请检查网络后重试', true)
        console.error('createRoom error:', e)
      }
    },

    showServiceNotice(message, force = false) {
      const now = Date.now()
      if (!force && now - this.lastErrorToastAt < 20000) return
      this.lastErrorToastAt = now
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 2200
      })
    },

    openRoom(room) {
      uni.navigateTo({
        url: `/pages/police/workplace/group-chat?roomId=${room.id}&roomName=${encodeURIComponent(room.name)}`
      })
    },

    openInvitations() {
      uni.navigateTo({ url: '/pages/police/workplace/room-invitations' })
    },

    getTypeLabel(type) {
      const map = {
        task: '任务',
        department: '部门',
        warning: '预警',
        temp: '临时'
      }
      return map[type] || '群聊'
    },

    getRoomInitial(room) {
      if (room.type === 'task') return '任'
      if (room.type === 'department') return '部'
      if (room.type === 'warning') return '警'
      return '群'
    }
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #EEF3F8;
  overflow-x: hidden;
}

.status-bar {
  background: #0F2A5C;
}

.top-nav {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 22rpx 28rpx 28rpx;
  background: linear-gradient(135deg, #0F2A5C 0%, #1B4B8C 64%, #2563EB 100%);
}

.back-btn,
.create-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.back-btn svg {
  width: 40rpx;
  height: 40rpx;
}

.create-btn text {
  font-size: 46rpx;
  line-height: 1;
  color: #FFFFFF;
  font-weight: 300;
}

.nav-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.nav-sub {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.78);
}

.summary-bar {
  display: flex;
  align-items: center;
  margin: -18rpx 24rpx 20rpx;
  padding: 24rpx 16rpx;
  background: #FFFFFF;
  border-radius: 18rpx;
  box-shadow: 0 10rpx 28rpx rgba(15, 42, 92, 0.12);
  position: relative;
  z-index: 2;
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.summary-value {
  font-size: 34rpx;
  font-weight: 700;
  color: #0F2A5C;
}

.summary-label {
  font-size: 21rpx;
  color: #64748B;
}

.summary-divider {
  width: 1rpx;
  height: 44rpx;
  background: #E2E8F0;
}

.invitation-banner {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin: 0 24rpx 18rpx;
  padding: 22rpx 24rpx;
  background: #FFFFFF;
  border: 1rpx solid #BFDBFE;
  border-left: 6rpx solid #2563EB;
  border-radius: 18rpx;
  box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, 0.05);
}

.invite-icon {
  width: 58rpx;
  height: 58rpx;
  border-radius: 50%;
  background: #2563EB;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.invite-icon text {
  color: #FFFFFF;
  font-size: 24rpx;
  font-weight: 700;
}

.invite-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.invite-main text:first-child {
  font-size: 26rpx;
  font-weight: 700;
  color: #0F172A;
}

.invite-main text:last-child {
  font-size: 22rpx;
  color: #64748B;
}

.search-box {
  margin: 0 24rpx 18rpx;
  height: 78rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 0 24rpx;
  background: #FFFFFF;
  border: 1rpx solid #E2E8F0;
  border-radius: 16rpx;
  box-sizing: border-box;
}

.search-input {
  flex: 1;
  font-size: 26rpx;
  color: #0F172A;
}

.clear-btn {
  width: 42rpx;
  height: 42rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-scroll {
  white-space: nowrap;
  margin-bottom: 14rpx;
}

.filter-row {
  display: inline-flex;
  gap: 14rpx;
  padding: 0 24rpx;
}

.filter-chip {
  min-width: 120rpx;
  height: 62rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 0 24rpx;
  background: #FFFFFF;
  color: #64748B;
  border: 1rpx solid #E2E8F0;
  border-radius: 32rpx;
  font-size: 24rpx;
  box-sizing: border-box;
}

.filter-chip.active {
  background: #1B4B8C;
  border-color: #1B4B8C;
  color: #FFFFFF;
  font-weight: 600;
}

.chip-badge {
  min-width: 30rpx;
  height: 30rpx;
  padding: 0 8rpx;
  border-radius: 15rpx;
  background: #EF4444;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip-badge text {
  color: #FFFFFF;
  font-size: 17rpx;
}

.room-scroll {
  height: calc(100vh - 360rpx);
  padding: 0 24rpx;
  box-sizing: border-box;
}

.room-scroll.with-invite {
  height: calc(100vh - 456rpx);
}

.room-card {
  display: flex;
  gap: 20rpx;
  padding: 26rpx;
  margin-bottom: 18rpx;
  background: #FFFFFF;
  border: 1rpx solid #E5EAF2;
  border-radius: 18rpx;
  box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, 0.05);
}

.room-card.unread {
  border-left: 6rpx solid #2563EB;
}

.room-card:active {
  transform: scale(0.99);
  opacity: 0.9;
}

.room-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.room-avatar text {
  font-size: 32rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.avatar-task { background: linear-gradient(135deg, #2563EB, #1D4ED8); }
.avatar-department { background: linear-gradient(135deg, #0EA5A3, #047857); }
.avatar-warning { background: linear-gradient(135deg, #EF4444, #B91C1C); }
.avatar-temp { background: linear-gradient(135deg, #64748B, #334155); }

.room-body {
  flex: 1;
  min-width: 0;
}

.room-top,
.room-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.room-name-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.room-name {
  font-size: 29rpx;
  font-weight: 650;
  color: #0F172A;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-tag {
  height: 32rpx;
  padding: 0 12rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.room-tag text {
  font-size: 18rpx;
  font-weight: 600;
}

.tag-task { background: rgba(37, 99, 235, 0.1); text { color: #2563EB; } }
.tag-department { background: rgba(14, 165, 163, 0.1); text { color: #0F766E; } }
.tag-warning { background: rgba(239, 68, 68, 0.1); text { color: #DC2626; } }
.tag-temp { background: rgba(100, 116, 139, 0.12); text { color: #475569; } }

.room-time {
  font-size: 21rpx;
  color: #94A3B8;
  white-space: nowrap;
}

.room-bottom {
  margin-top: 12rpx;
}

.room-message {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: #64748B;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-badge {
  min-width: 36rpx;
  height: 36rpx;
  padding: 0 10rpx;
  border-radius: 18rpx;
  background: #EF4444;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unread-badge text {
  color: #FFFFFF;
  font-size: 18rpx;
  font-weight: 700;
}

.room-meta {
  margin-top: 12rpx;
  font-size: 21rpx;
  color: #94A3B8;
}

.loading-wrap,
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 24rpx;
}

.loading-wrap text {
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #64748B;
}

.loading-dot {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 5rpx solid #DCE6F2;
  border-top-color: #2563EB;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 30rpx;
  font-weight: 650;
  color: #0F172A;
  margin-bottom: 10rpx;
}

.empty-desc {
  max-width: 560rpx;
  text-align: center;
  font-size: 24rpx;
  color: #64748B;
  line-height: 1.6;
}

.empty-actions {
  display: flex;
  gap: 18rpx;
  margin-top: 30rpx;
}

.primary-btn,
.secondary-btn {
  height: 76rpx;
  padding: 0 28rpx;
  border-radius: 14rpx;
  font-size: 25rpx;
  border: none;
}

.primary-btn {
  background: #1B4B8C;
  color: #FFFFFF;
}

.secondary-btn {
  background: #FFFFFF;
  color: #1B4B8C;
  border: 1rpx solid #C8D6E8;
}

.primary-btn::after,
.secondary-btn::after {
  border: none;
}

.bottom-space {
  height: 80rpx;
}
</style>
