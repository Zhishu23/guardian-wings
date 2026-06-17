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
        <text class="nav-title">入群邀请</text>
        <text class="nav-sub">处理别人发给你的群聊邀请</text>
      </view>
      <view class="refresh-btn" @click="loadInvitations">
        <uni-icons type="refreshempty" size="22" color="#FFFFFF" />
      </view>
    </view>

    <scroll-view scroll-x class="filter-scroll" :show-scrollbar="false">
      <view class="filter-row">
        <view
          class="filter-chip"
          v-for="tab in tabs"
          :key="tab.key"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          <text>{{ tab.label }}</text>
        </view>
      </view>
    </scroll-view>

    <scroll-view
      scroll-y
      class="invite-scroll"
      :show-scrollbar="false"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onPullRefresh"
    >
      <view v-if="loading && invitationList.length === 0" class="loading-wrap">
        <view class="loading-dot"></view>
        <text>正在加载邀请...</text>
      </view>

      <view
        v-for="item in invitationList"
        :key="item.id"
        class="invite-card"
        :class="'status-' + item.status"
      >
        <view class="invite-top">
          <view class="room-avatar" :class="'avatar-' + item.room_type">
            <text>{{ getRoomInitial(item.room_type) }}</text>
          </view>
          <view class="invite-main">
            <view class="title-row">
              <text class="room-name">{{ item.room_name || '群聊邀请' }}</text>
              <view class="status-pill" :class="'pill-' + item.status">
                <text>{{ item.status_text }}</text>
              </view>
            </view>
            <text class="invite-meta">邀请人：{{ item.inviter_name || '群成员' }} {{ item.inviter_badge_no ? '#' + item.inviter_badge_no : '' }}</text>
            <text class="invite-meta">{{ getTypeLabel(item.room_type) }}{{ item.task_id ? ' · 任务 ' + item.task_id : '' }}</text>
          </view>
        </view>

        <view class="reason-box" v-if="item.invite_reason">
          <text>{{ item.invite_reason }}</text>
        </view>

        <view class="policy-row">
          <text>历史消息：{{ item.history_policy === 'all' ? '可查看群历史' : '入群后可见' }}</text>
          <text>有效期：{{ item.expire_time_text || '未设置' }}</text>
        </view>

        <view class="invite-actions" v-if="item.status === 'pending'">
          <button class="decline-btn" @click="declineInvitation(item)">拒绝</button>
          <button class="accept-btn" @click="acceptInvitation(item)">接受并进入</button>
        </view>
      </view>

      <view v-if="!loading && invitationList.length === 0" class="empty-wrap">
        <uni-icons type="chatbubble" size="48" color="#CBD5E1" />
        <text>{{ activeTab === 'pending' ? '暂无待处理入群邀请' : '暂无邀请记录' }}</text>
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
      activeTab: 'pending',
      tabs: [
        { key: 'pending', label: '待处理' },
        { key: 'all', label: '全部记录' }
      ],
      invitationList: [],
      loading: false,
      refreshing: false,
      lastErrorToastAt: 0
    }
  },

  onLoad() {
    const sys = uni.getSystemInfoSync()
    this.statusBarHeight = sys.statusBarHeight || 0
    this.loadInvitations()
  },

  onShow() {
    this.loadInvitations(true)
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
        uni.showToast({ title: '请先登录警务账号', icon: 'none' })
        return null
      }
      return police
    },

    switchTab(key) {
      this.activeTab = key
      this.loadInvitations()
    },

    async loadInvitations(silent = false) {
      const police = this.ensurePolice()
      if (!police) return
      if (!silent) this.loading = true
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-chat',
          data: {
            action: 'getMyInvitations',
            params: {
              officer_id: police.officer_id,
              status: this.activeTab,
              page: 1,
              pageSize: 50
            }
          }
        })
        if (res.result && res.result.code === 0) {
          this.invitationList = res.result.data.list || []
        } else {
          this.showServiceNotice((res.result && res.result.msg) || '邀请加载失败')
        }
      } catch (e) {
        this.showServiceNotice('邀请服务暂不可用，请检查网络')
        console.error('loadInvitations error:', e)
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },

    onPullRefresh() {
      this.refreshing = true
      this.loadInvitations(true)
    },

    acceptInvitation(item) {
      const police = this.ensurePolice()
      if (!police) return
      uni.showModal({
        title: '接受邀请',
        content: `确认加入 ${item.room_name || '该群聊'}？`,
        confirmText: '加入',
        success: async res => {
          if (!res.confirm) return
          uni.showLoading({ title: '正在加入...' })
          try {
            const ret = await uniCloud.callFunction({
              name: 'gw-chat',
              data: {
                action: 'respondInvitation',
                params: {
                  invitation_id: item.id,
                  officer_id: police.officer_id,
                  action: 'accept'
                }
              }
            })
            uni.hideLoading()
            if (ret.result && ret.result.code === 0) {
              const room = ret.result.data && ret.result.data.room
              uni.showToast({ title: '已加入群聊', icon: 'success' })
              setTimeout(() => {
                if (room && room.id) {
                  uni.redirectTo({
                    url: `/pages/police/workplace/group-chat?roomId=${room.id}&roomName=${encodeURIComponent(room.name || '')}`
                  })
                } else {
                  this.loadInvitations(true)
                }
              }, 500)
            } else {
              this.showServiceNotice((ret.result && ret.result.msg) || '处理失败', true)
              this.loadInvitations(true)
            }
          } catch (e) {
            uni.hideLoading()
            this.showServiceNotice('处理失败，请检查网络', true)
          }
        }
      })
    },

    declineInvitation(item) {
      const police = this.ensurePolice()
      if (!police) return
      uni.showModal({
        title: '拒绝邀请',
        content: `确认拒绝加入 ${item.room_name || '该群聊'}？`,
        confirmText: '拒绝',
        confirmColor: '#F43F5E',
        success: async res => {
          if (!res.confirm) return
          const ret = await uniCloud.callFunction({
            name: 'gw-chat',
            data: {
              action: 'respondInvitation',
              params: {
                invitation_id: item.id,
                officer_id: police.officer_id,
                action: 'decline'
              }
            }
          })
          if (ret.result && ret.result.code === 0) {
            uni.showToast({ title: '已拒绝邀请', icon: 'success' })
            this.loadInvitations(true)
          } else {
            this.showServiceNotice((ret.result && ret.result.msg) || '处理失败', true)
          }
        }
      })
    },

    showServiceNotice(message, force = false) {
      const now = Date.now()
      if (!force && now - this.lastErrorToastAt < 20000) return
      this.lastErrorToastAt = now
      uni.showToast({ title: message, icon: 'none', duration: 2200 })
    },

    getTypeLabel(type) {
      const map = { task: '任务群', department: '部门群', warning: '预警群', temp: '临时群' }
      return map[type] || '群聊'
    },

    getRoomInitial(type) {
      if (type === 'task') return '任'
      if (type === 'department') return '部'
      if (type === 'warning') return '警'
      return '群'
    }
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #EEF3F8;
}

.status-bar {
  background: #0F2A5C;
}

.top-nav {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 20rpx 26rpx 28rpx;
  background: linear-gradient(135deg, #0F2A5C 0%, #1B4B8C 100%);
}

.back-btn,
.refresh-btn {
  width: 70rpx;
  height: 70rpx;
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

.filter-scroll {
  white-space: nowrap;
  padding: 18rpx 0;
  background: #FFFFFF;
  border-bottom: 1rpx solid #E2E8F0;
}

.filter-row {
  display: inline-flex;
  gap: 14rpx;
  padding: 0 24rpx;
}

.filter-chip {
  height: 58rpx;
  padding: 0 26rpx;
  border-radius: 29rpx;
  background: #F8FAFC;
  border: 1rpx solid #E2E8F0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.filter-chip.active {
  background: #1B4B8C;
  border-color: #1B4B8C;
}

.filter-chip text {
  font-size: 24rpx;
  color: #64748B;
}

.filter-chip.active text {
  color: #FFFFFF;
  font-weight: 650;
}

.invite-scroll {
  height: calc(100vh - 230rpx);
  padding: 24rpx;
  box-sizing: border-box;
}

.invite-card {
  padding: 24rpx;
  margin-bottom: 18rpx;
  background: #FFFFFF;
  border: 1rpx solid #E2E8F0;
  border-radius: 18rpx;
}

.invite-card.status-pending {
  border-left: 6rpx solid #2563EB;
}

.invite-top {
  display: flex;
  gap: 18rpx;
}

.room-avatar {
  width: 82rpx;
  height: 82rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.room-avatar text {
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 700;
}

.avatar-task { background: linear-gradient(135deg, #2563EB, #1D4ED8); }
.avatar-department { background: linear-gradient(135deg, #0EA5A3, #047857); }
.avatar-warning { background: linear-gradient(135deg, #EF4444, #B91C1C); }
.avatar-temp { background: linear-gradient(135deg, #64748B, #334155); }

.invite-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.room-name {
  flex: 1;
  min-width: 0;
  font-size: 29rpx;
  font-weight: 700;
  color: #0F172A;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-pill {
  height: 38rpx;
  padding: 0 14rpx;
  border-radius: 19rpx;
  background: #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-pill text {
  font-size: 19rpx;
  color: #64748B;
  font-weight: 650;
}

.pill-pending {
  background: #EFF6FF;
}

.pill-pending text {
  color: #2563EB;
}

.pill-accepted {
  background: #ECFDF5;
}

.pill-accepted text {
  color: #059669;
}

.pill-declined,
.pill-expired,
.pill-cancelled,
.pill-invalid {
  background: #F1F5F9;
}

.invite-meta {
  font-size: 22rpx;
  color: #64748B;
}

.reason-box {
  margin-top: 20rpx;
  padding: 18rpx;
  border-radius: 14rpx;
  background: #F8FAFC;
}

.reason-box text {
  font-size: 24rpx;
  color: #334155;
  line-height: 1.6;
}

.policy-row {
  margin-top: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.policy-row text {
  font-size: 22rpx;
  color: #64748B;
}

.invite-actions {
  display: flex;
  gap: 18rpx;
  margin-top: 22rpx;
}

.decline-btn,
.accept-btn {
  flex: 1;
  height: 76rpx;
  border-radius: 14rpx;
  font-size: 26rpx;
  border: none;
}

.decline-btn {
  background: #F8FAFC;
  color: #475569;
  border: 1rpx solid #E2E8F0;
}

.accept-btn {
  background: #1B4B8C;
  color: #FFFFFF;
}

.decline-btn::after,
.accept-btn::after {
  border: none;
}

.loading-wrap,
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
  padding: 150rpx 0;
}

.loading-wrap text,
.empty-wrap text {
  font-size: 24rpx;
  color: #64748B;
}

.loading-dot {
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  border: 5rpx solid #DCE6F2;
  border-top-color: #2563EB;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.bottom-space {
  height: 90rpx;
}
</style>
