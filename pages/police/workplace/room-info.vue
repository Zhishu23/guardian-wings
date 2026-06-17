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
        <text class="nav-title">群信息</text>
        <text class="nav-sub">{{ room.name || roomName || '群聊协作' }}</text>
      </view>
      <view class="refresh-btn" @click="loadRoomMembers">
        <uni-icons type="refreshempty" size="22" color="#FFFFFF" />
      </view>
    </view>

    <scroll-view scroll-y class="content" :show-scrollbar="false">
      <view class="room-head">
        <view class="room-avatar" :class="'avatar-' + (room.type || 'temp')">
          <text>{{ getRoomInitial(room) }}</text>
        </view>
        <view class="room-main">
          <text class="room-name">{{ room.name || roomName || '群聊' }}</text>
          <view class="room-meta">
            <text>{{ getTypeLabel(room.type) }}</text>
            <text> · {{ members.length || room.member_count || 1 }} 人</text>
            <text v-if="room.dept"> · {{ room.dept }}</text>
          </view>
        </view>
      </view>

      <view class="task-strip" v-if="room.task_id" @click="openTask">
        <uni-icons type="compose" size="18" color="#2563EB" />
        <text>已关联任务，点击查看任务详情</text>
        <uni-icons type="right" size="16" color="#94A3B8" />
      </view>

      <view class="section-head">
        <text>成员</text>
        <view class="add-btn" @click="openAddMembers">
          <text>添加</text>
        </view>
      </view>

      <view class="member-grid">
        <view
          class="member-cell"
          v-for="member in members"
          :key="member.officer_id"
          @click="showMemberActions(member)"
        >
          <view class="member-avatar" :class="{ owner: member.role === 'owner', admin: member.role === 'admin' }">
            <text>{{ getNameInitial(member.officer_name) }}</text>
          </view>
          <text class="member-name">{{ member.officer_name }}</text>
          <text class="member-role">{{ getRoleLabel(member.role) }}</text>
        </view>
        <view class="member-cell add-member" @click="openAddMembers">
          <view class="member-avatar add-avatar">
            <text>+</text>
          </view>
          <text class="member-name">邀请成员</text>
          <text class="member-role">邀请制入群</text>
        </view>
      </view>

      <view class="section-head">
        <text>待确认邀请</text>
        <text class="section-count">{{ pendingInvitations.length }} 条</text>
      </view>

      <view v-if="pendingInvitations.length" class="invite-list">
        <view class="invite-row" v-for="item in pendingInvitations" :key="item.id">
          <view class="invite-main">
            <text class="invite-name">{{ item.invitee_name || '警务人员' }}</text>
            <text class="invite-desc">邀请人：{{ item.inviter_name || '群成员' }} · {{ item.expire_time_text || '待处理' }}</text>
          </view>
          <view class="cancel-btn" @click="cancelInvitation(item)">
            <text>撤销</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-box">
        <text>暂无待确认邀请</text>
      </view>

      <view class="section-head">
        <text>邀请记录</text>
        <text class="section-count">{{ recentInvitations.length }} 条</text>
      </view>

      <view v-if="recentInvitations.length" class="history-list">
        <view class="history-row" v-for="item in recentInvitations" :key="item.id">
          <view class="history-dot" :class="'status-' + item.status"></view>
          <view class="history-main">
            <text>{{ item.invitee_name || '警务人员' }}</text>
            <text>{{ item.status_text }} · {{ item.create_time_text }}</text>
          </view>
        </view>
      </view>

      <view class="action-list">
        <view class="action-row" @click="openAddMembers">
          <text>邀请成员加入</text>
          <uni-icons type="right" size="16" color="#94A3B8" />
        </view>
        <view class="action-row danger" @click="leaveRoom">
          <text>退出群聊</text>
          <uni-icons type="right" size="16" color="#F43F5E" />
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
      roomId: '',
      roomName: '',
      room: {},
      members: [],
      invitations: [],
      permissions: {},
      loading: false,
      lastErrorToastAt: 0
    }
  },

  computed: {
    pendingInvitations() {
      return this.invitations.filter(item => item.status === 'pending')
    },

    recentInvitations() {
      return this.invitations.filter(item => item.status !== 'pending').slice(0, 8)
    }
  },

  onLoad(options) {
    const sys = uni.getSystemInfoSync()
    this.statusBarHeight = sys.statusBarHeight || 0
    this.roomId = options.roomId || ''
    this.roomName = decodeURIComponent(options.roomName || '')
    this.loadRoomMembers()
  },

  onShow() {
    if (this.roomId) this.loadRoomMembers(true)
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

    async loadRoomMembers(silent = false) {
      const police = this.ensurePolice()
      if (!police || !this.roomId) return
      if (!silent) this.loading = true
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-chat',
          data: {
            action: 'getRoomMembers',
            params: {
              room_id: this.roomId,
              officer_id: police.officer_id
            }
          }
        })
        if (res.result && res.result.code === 0) {
          this.room = res.result.data.room || {}
          this.members = res.result.data.members || []
          this.invitations = res.result.data.invitations || []
          this.permissions = res.result.data.permissions || {}
        } else {
          this.showServiceNotice((res.result && res.result.msg) || '群信息加载失败')
        }
      } catch (e) {
        this.showServiceNotice('群信息服务暂不可用，请检查网络')
        console.error('loadRoomMembers error:', e)
      } finally {
        this.loading = false
      }
    },

    openAddMembers() {
      uni.navigateTo({
        url: `/pages/police/workplace/invite-members?roomId=${this.roomId}&roomName=${encodeURIComponent(this.room.name || this.roomName || '')}`
      })
    },

    showMemberActions(member) {
      const police = this.readPoliceInfo()
      if (member.officer_id === police.officer_id) return
      if (!this.permissions.can_manage && !this.permissions.can_change_role) return

      const actions = []
      if (this.permissions.can_change_role && member.role !== 'owner') {
        actions.push({
          label: member.role === 'admin' ? '取消管理员' : '设为管理员',
          type: 'role',
          role: member.role === 'admin' ? 'member' : 'admin'
        })
        actions.push({ label: '转让群主', type: 'transfer' })
      }
      if (this.permissions.can_manage && member.role !== 'owner') {
        actions.push({ label: '移出群聊', type: 'remove' })
      }
      if (!actions.length) return

      uni.showActionSheet({
        itemList: actions.map(item => item.label),
        success: res => {
          const action = actions[res.tapIndex]
          if (!action) return
          if (action.type === 'role') this.setMemberRole(member, action.role)
          if (action.type === 'transfer') this.transferOwner(member)
          if (action.type === 'remove') this.removeMember(member)
        }
      })
    },

    async setMemberRole(member, role) {
      const police = this.ensurePolice()
      if (!police) return
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-chat',
          data: {
            action: 'setMemberRole',
            params: {
              room_id: this.roomId,
              operator_id: police.officer_id,
              target_id: member.officer_id,
              role
            }
          }
        })
        if (res.result && res.result.code === 0) {
          uni.showToast({ title: '角色已更新', icon: 'success' })
          this.loadRoomMembers(true)
        } else {
          this.showServiceNotice((res.result && res.result.msg) || '操作失败', true)
        }
      } catch (e) {
        this.showServiceNotice('操作失败，请检查网络', true)
      }
    },

    transferOwner(member) {
      const police = this.ensurePolice()
      if (!police) return
      uni.showModal({
        title: '转让群主',
        content: `确认将群主转让给 ${member.officer_name || '该成员'}？`,
        confirmText: '转让',
        success: async res => {
          if (!res.confirm) return
          const ret = await uniCloud.callFunction({
            name: 'gw-chat',
            data: {
              action: 'transferOwner',
              params: {
                room_id: this.roomId,
                operator_id: police.officer_id,
                target_id: member.officer_id
              }
            }
          })
          if (ret.result && ret.result.code === 0) {
            uni.showToast({ title: '已转让群主', icon: 'success' })
            this.loadRoomMembers(true)
          } else {
            this.showServiceNotice((ret.result && ret.result.msg) || '转让失败', true)
          }
        }
      })
    },

    removeMember(member) {
      const police = this.ensurePolice()
      if (!police) return
      uni.showModal({
        title: '移出群聊',
        content: `确认将 ${member.officer_name || '该成员'} 移出群聊？`,
        confirmText: '移出',
        confirmColor: '#F43F5E',
        success: async res => {
          if (!res.confirm) return
          const ret = await uniCloud.callFunction({
            name: 'gw-chat',
            data: {
              action: 'removeMember',
              params: {
                room_id: this.roomId,
                operator_id: police.officer_id,
                operator_name: police.name,
                target_id: member.officer_id
              }
            }
          })
          if (ret.result && ret.result.code === 0) {
            uni.showToast({ title: '成员已移除', icon: 'success' })
            this.loadRoomMembers(true)
          } else {
            this.showServiceNotice((ret.result && ret.result.msg) || '移除失败', true)
          }
        }
      })
    },

    cancelInvitation(item) {
      const police = this.ensurePolice()
      if (!police) return
      uni.showModal({
        title: '撤销邀请',
        content: `确认撤销 ${item.invitee_name || '该警员'} 的入群邀请？`,
        confirmText: '撤销',
        success: async res => {
          if (!res.confirm) return
          const ret = await uniCloud.callFunction({
            name: 'gw-chat',
            data: {
              action: 'cancelInvitation',
              params: {
                invitation_id: item.id,
                operator_id: police.officer_id,
                operator_name: police.name
              }
            }
          })
          if (ret.result && ret.result.code === 0) {
            uni.showToast({ title: '邀请已撤销', icon: 'success' })
            this.loadRoomMembers(true)
          } else {
            this.showServiceNotice((ret.result && ret.result.msg) || '撤销失败', true)
          }
        }
      })
    },

    leaveRoom() {
      const police = this.ensurePolice()
      if (!police) return
      uni.showModal({
        title: '退出群聊',
        content: '退出后将不能继续查看或发送该群消息。',
        confirmText: '退出',
        confirmColor: '#F43F5E',
        success: async res => {
          if (!res.confirm) return
          const ret = await uniCloud.callFunction({
            name: 'gw-chat',
            data: {
              action: 'leaveRoom',
              params: {
                room_id: this.roomId,
                officer_id: police.officer_id,
                officer_name: police.name
              }
            }
          })
          if (ret.result && ret.result.code === 0) {
            uni.showToast({ title: '已退出群聊', icon: 'success' })
            setTimeout(() => {
              uni.redirectTo({ url: '/pages/police/workplace/messages' })
            }, 600)
          } else {
            this.showServiceNotice((ret.result && ret.result.msg) || '退出失败', true)
          }
        }
      })
    },

    openTask() {
      if (!this.room.task_id) return
      uni.navigateTo({ url: `/pages/police/task-center/task-detail?id=${this.room.task_id}` })
    },

    showServiceNotice(message, force = false) {
      const now = Date.now()
      if (!force && now - this.lastErrorToastAt < 20000) return
      this.lastErrorToastAt = now
      uni.showToast({ title: message, icon: 'none', duration: 2200 })
    },

    getNameInitial(name) {
      return String(name || '警').charAt(0)
    },

    getRoleLabel(role) {
      const map = { owner: '群主', admin: '管理员', member: '成员' }
      return map[role] || '成员'
    },

    getTypeLabel(type) {
      const map = { task: '任务群', department: '部门群', warning: '预警群', temp: '临时群' }
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content {
  height: calc(100vh - 120rpx);
  padding: 24rpx;
  box-sizing: border-box;
}

.room-head,
.task-strip,
.member-grid,
.invite-list,
.history-list,
.empty-box,
.action-list {
  background: #FFFFFF;
  border: 1rpx solid #E2E8F0;
  border-radius: 18rpx;
}

.room-head {
  display: flex;
  gap: 22rpx;
  align-items: center;
  padding: 28rpx;
}

.room-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.room-avatar text {
  color: #FFFFFF;
  font-size: 36rpx;
  font-weight: 700;
}

.avatar-task { background: linear-gradient(135deg, #2563EB, #1D4ED8); }
.avatar-department { background: linear-gradient(135deg, #0EA5A3, #047857); }
.avatar-warning { background: linear-gradient(135deg, #EF4444, #B91C1C); }
.avatar-temp { background: linear-gradient(135deg, #64748B, #334155); }

.room-main {
  flex: 1;
  min-width: 0;
}

.room-name {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #0F172A;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-meta {
  margin-top: 10rpx;
  font-size: 23rpx;
  color: #64748B;
}

.task-strip {
  margin-top: 18rpx;
  height: 76rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 0 24rpx;
}

.task-strip text {
  flex: 1;
  font-size: 24rpx;
  color: #334155;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 28rpx 4rpx 14rpx;
}

.section-head text:first-child {
  font-size: 28rpx;
  font-weight: 700;
  color: #0F172A;
}

.section-count {
  font-size: 22rpx;
  color: #64748B;
}

.add-btn {
  height: 52rpx;
  padding: 0 22rpx;
  border-radius: 26rpx;
  background: #1B4B8C;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn text {
  color: #FFFFFF !important;
  font-size: 23rpx !important;
  font-weight: 600 !important;
}

.member-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18rpx;
  padding: 24rpx 18rpx;
}

.member-cell {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.member-avatar {
  width: 78rpx;
  height: 78rpx;
  border-radius: 22rpx;
  background: #2563EB;
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-avatar.owner { background: #F59E0B; }
.member-avatar.admin { background: #0EA5A3; }
.member-avatar text {
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: 700;
}

.add-avatar {
  background: #E2E8F0;
}

.add-avatar text {
  color: #475569;
  font-size: 36rpx;
  font-weight: 500;
}

.member-name,
.member-role {
  max-width: 130rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-name {
  font-size: 23rpx;
  color: #0F172A;
  font-weight: 600;
}

.member-role {
  font-size: 19rpx;
  color: #94A3B8;
}

.invite-row,
.history-row,
.action-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  min-height: 88rpx;
  padding: 18rpx 24rpx;
  border-bottom: 1rpx solid #EEF2F7;
}

.invite-row:last-child,
.history-row:last-child,
.action-row:last-child {
  border-bottom: none;
}

.invite-main,
.history-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.invite-name,
.history-main text:first-child {
  font-size: 26rpx;
  font-weight: 650;
  color: #0F172A;
}

.invite-desc,
.history-main text:last-child {
  font-size: 22rpx;
  color: #64748B;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cancel-btn {
  height: 54rpx;
  padding: 0 20rpx;
  border-radius: 27rpx;
  background: #FFF1F2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn text {
  color: #E11D48;
  font-size: 22rpx;
  font-weight: 600;
}

.empty-box {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-box text {
  font-size: 24rpx;
  color: #94A3B8;
}

.history-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #94A3B8;
  flex-shrink: 0;
}

.status-accepted { background: #10B981; }
.status-declined { background: #F59E0B; }
.status-expired,
.status-cancelled,
.status-invalid { background: #94A3B8; }

.action-list {
  margin-top: 28rpx;
}

.action-row {
  justify-content: space-between;
}

.action-row text {
  font-size: 27rpx;
  color: #0F172A;
  font-weight: 600;
}

.action-row.danger text {
  color: #F43F5E;
}

.bottom-space {
  height: 90rpx;
}
</style>
