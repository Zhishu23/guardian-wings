<template>
  <view class="chat-page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />

    <view class="chat-nav">
      <view class="nav-back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </view>
      <view class="nav-room">
        <text class="room-title">{{ room.name || roomName || '群聊' }}</text>
        <text class="room-sub">{{ members.length || room.member_count || 1 }}人 · {{ connectionText }}</text>
      </view>
      <view class="nav-more" @click="showRoomInfo">
        <text>···</text>
      </view>
    </view>

    <view class="task-strip" v-if="room.task_id" @click="openTask">
      <uni-icons type="compose" size="18" color="#2563EB" />
      <text>已关联任务，点击查看任务详情</text>
      <uni-icons type="right" size="16" color="#94A3B8" />
    </view>

    <scroll-view
      class="message-scroll"
      scroll-y
      :scroll-into-view="scrollToView"
      :show-scrollbar="false"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="loadHistory"
    >
      <view v-if="loading" class="loading-wrap">
        <view class="loading-dot"></view>
        <text>正在加载消息...</text>
      </view>

      <view
        v-for="(msg, index) in messageList"
        :key="msg.local_id || msg.id || index"
        :id="'msg-' + index"
        class="message-row"
        :class="{ mine: isMine(msg), system: isSystem(msg) }"
      >
        <view v-if="isSystem(msg)" class="system-message">
          <text>{{ msg.content }}</text>
        </view>

        <block v-else>
          <view class="avatar" v-if="!isMine(msg)">
            <text>{{ getNameInitial(msg.sender_name) }}</text>
          </view>

          <view class="bubble-wrap">
            <view class="sender-line" v-if="!isMine(msg)">
              <text class="sender-name">{{ msg.sender_name || '警务人员' }}</text>
              <text class="sender-badge" v-if="msg.sender_badge_no">#{{ msg.sender_badge_no }}</text>
            </view>
            <view class="bubble" :class="{ failed: msg.send_status === 'failed' }" @longpress="showMessageActions(msg)">
              <text v-if="msg.message_type === 'text'" class="bubble-text">{{ msg.content }}</text>

              <view v-else-if="msg.message_type === 'location'" class="location-card">
                <uni-icons type="location-filled" size="22" :color="isMine(msg) ? '#FFFFFF' : '#2563EB'" />
                <view class="location-body">
                  <text class="location-title">位置共享</text>
                  <text class="location-address">{{ getLocationText(msg) }}</text>
                </view>
              </view>

              <text v-else class="bubble-text">{{ msg.content || '[暂不支持的消息]' }}</text>
            </view>

            <view class="meta-line">
              <text>{{ msg.time_text || formatClock(msg.create_time) }}</text>
              <text v-if="msg.send_status === 'sending'"> · 发送中</text>
              <text v-if="msg.send_status === 'failed'" class="failed-text" @click="retryMessage(msg)"> · 发送失败，点此重试</text>
            </view>
          </view>

          <view class="avatar mine-avatar" v-if="isMine(msg)">
            <text>我</text>
          </view>
        </block>
      </view>

      <view v-if="!loading && messageList.length === 0" class="empty-wrap">
        <uni-icons type="chatbubble" size="46" color="#CBD5E1" />
        <text>还没有消息，发送第一条协作信息吧</text>
      </view>

      <view id="msg-bottom" class="message-bottom"></view>
    </scroll-view>

    <view class="quick-panel" v-if="showQuickPanel">
      <view class="quick-head">
        <text>常用语</text>
        <text class="quick-close" @click="showQuickPanel = false">收起</text>
      </view>
      <view class="quick-list">
        <view
          class="quick-chip"
          v-for="item in quickPhrases"
          :key="item"
          @click="sendQuickPhrase(item)"
        >
          <text>{{ item }}</text>
        </view>
      </view>
    </view>

    <view class="input-bar">
      <view class="tool-btn" @click="toggleTools">
        <text>{{ showQuickPanel ? '×' : '+' }}</text>
      </view>
      <input
        class="message-input"
        v-model="inputText"
        placeholder="输入协作消息..."
        confirm-type="send"
        @confirm="sendText"
      />
      <view class="location-btn" @click="sendLocation">
        <uni-icons type="location" size="22" color="#64748B" />
      </view>
      <view class="send-btn" :class="{ active: inputText.trim().length > 0 }" @click="sendText">
        <uni-icons type="paperplane" size="22" color="#FFFFFF" />
      </view>
    </view>
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
      currentPolice: null,
      currentToken: '',
      messageList: [],
      inputText: '',
      loading: false,
      refreshing: false,
      pollTimer: null,
      lastErrorToastAt: 0,
      lastMessageTime: 0,
      scrollToView: '',
      showQuickPanel: false,
      quickPhrases: [
        '已到达现场',
        '正在核查',
        '请求支援',
        '已控制现场',
        '需补充取证',
        '任务完成，等待复核'
      ]
    }
  },

  computed: {
    connectionText() {
      return this.pollTimer ? '轮询同步中' : '已暂停同步'
    }
  },

  onLoad(options) {
    const sys = uni.getSystemInfoSync()
    this.statusBarHeight = sys.statusBarHeight || 0
    this.currentPolice = this.loadPoliceInfoFromStorage()
    this.currentToken = uni.getStorageSync('gw_token') || ''
    this.roomId = options.roomId || ''
    this.roomName = decodeURIComponent(options.roomName || '')
    this.initRoom()
  },

  onShow() {
    if (this.roomId) this.loadRoomDetail()
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

    loadPoliceInfoFromStorage() {
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

    readPoliceInfo() {
      if (this.currentPolice && this.currentPolice.officer_id) {
        return this.currentPolice
      }
      const police = this.loadPoliceInfoFromStorage()
      if (police.officer_id) this.currentPolice = police
      return police
    },

    ensurePolice() {
      const police = this.readPoliceInfo()
      if (!police.officer_id) {
        uni.showToast({ title: '请先登录警务账号', icon: 'none' })
        return null
      }
      return police
    },

    async initRoom() {
      if (!this.roomId) {
        uni.showToast({ title: '缺少群聊ID', icon: 'none' })
        setTimeout(() => uni.navigateBack(), 800)
        return
      }
      this.loading = true
      await Promise.all([
        this.loadRoomDetail(),
        this.loadMessages()
      ])
      this.loading = false
      this.$nextTick(() => this.scrollToBottom())
    },

    async loadRoomDetail() {
      const police = this.ensurePolice()
      if (!police) return
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-chat',
          data: {
            action: 'getRoomDetail',
            params: {
              room_id: this.roomId,
              officer_id: police.officer_id,
              token: this.currentToken
            }
          }
        })
        if (res.result && res.result.code === 0) {
          this.room = res.result.data.room || {}
          this.members = res.result.data.members || []
        } else {
          this.showServiceNotice((res.result && res.result.msg) || '群聊加载失败')
        }
      } catch (e) {
        this.showServiceNotice('群聊服务暂不可用，请检查网络')
        console.error('loadRoomDetail error:', e)
      }
    },

    async loadMessages() {
      const police = this.ensurePolice()
      if (!police) return
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-chat',
          data: {
            action: 'getMessageList',
            params: {
              room_id: this.roomId,
              officer_id: police.officer_id,
              token: this.currentToken,
              page: 1,
              pageSize: 30
            }
          }
        })
        if (res.result && res.result.code === 0) {
          this.messageList = res.result.data.list || []
          this.updateLastMessageTime()
          this.markRead()
        } else {
          this.showServiceNotice((res.result && res.result.msg) || '消息加载失败')
        }
      } catch (e) {
        this.showServiceNotice('消息加载失败，请检查网络')
        console.error('loadMessages error:', e)
      } finally {
        this.refreshing = false
      }
    },

    async loadHistory() {
      this.refreshing = true
      await this.loadMessages()
      this.$nextTick(() => this.scrollToBottom())
    },

    startPolling() {
      if (this.pollTimer) return
      this.pollTimer = setInterval(() => {
        this.pollMessages()
      }, 3000)
    },

    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    },

    async pollMessages() {
      const police = this.ensurePolice()
      if (!police || !this.roomId || !this.lastMessageTime) return
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-chat',
          data: {
            action: 'getMessageList',
            params: {
              room_id: this.roomId,
              officer_id: police.officer_id,
              token: this.currentToken,
              afterTime: this.lastMessageTime,
              pageSize: 50
            }
          }
        })
        if (res.result && res.result.code === 0) {
          const incoming = res.result.data.list || []
          if (incoming.length) {
            this.mergeMessages(incoming)
            this.updateLastMessageTime()
            this.markRead()
            this.$nextTick(() => this.scrollToBottom())
          }
        }
      } catch (e) {
        console.warn('pollMessages failed:', e.message)
      }
    },

    mergeMessages(incoming) {
      const exist = {}
      this.messageList.forEach(msg => {
        if (msg.id) exist[msg.id] = true
        if (msg.client_msg_id) exist[msg.client_msg_id] = true
      })
      incoming.forEach(msg => {
        if ((msg.id && exist[msg.id]) || (msg.client_msg_id && exist[msg.client_msg_id])) return
        this.messageList.push(msg)
      })
    },

    updateLastMessageTime() {
      this.lastMessageTime = this.messageList.reduce((max, msg) => {
        return Math.max(max, Number(msg.create_time) || 0)
      }, this.lastMessageTime || 0)
    },

    async markRead() {
      const police = this.ensurePolice()
      if (!police || !this.roomId || !this.lastMessageTime) return
      try {
        await uniCloud.callFunction({
          name: 'gw-chat',
          data: {
            action: 'markRead',
            params: {
              room_id: this.roomId,
              officer_id: police.officer_id,
              token: this.currentToken,
              read_time: this.lastMessageTime
            }
          }
        })
      } catch (e) {}
    },

    sendQuickPhrase(text) {
      this.inputText = text
      this.sendText()
      this.showQuickPanel = false
    },

    async sendText() {
      const text = this.inputText.trim()
      if (!text) return
      this.inputText = ''
      await this.sendMessage({ message_type: 'text', content: text })
    },

    async sendLocation() {
      const police = this.ensurePolice()
      if (!police) return
      uni.showLoading({ title: '定位中...' })
      uni.getLocation({
        type: 'gcj02',
        success: async res => {
          uni.hideLoading()
          const address = `${Number(res.latitude).toFixed(5)}, ${Number(res.longitude).toFixed(5)}`
          await this.sendMessage({
            message_type: 'location',
            content: address,
            location: {
              address,
              latitude: res.latitude,
              longitude: res.longitude
            }
          })
        },
        fail: () => {
          uni.hideLoading()
          uni.showToast({ title: '定位失败', icon: 'none' })
        }
      })
    },

    async sendMessage(payload) {
      const police = this.ensurePolice()
      if (!police) return

      const clientMsgId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const now = Date.now()
      const localMessage = {
        local_id: clientMsgId,
        room_id: this.roomId,
        sender_id: police.officer_id,
        sender_name: police.name,
        sender_badge_no: police.badge_no,
        message_type: payload.message_type,
        content: payload.content || '',
        location: payload.location || null,
        client_msg_id: clientMsgId,
        create_time: now,
        time_text: this.formatClock(now),
        send_status: 'sending'
      }

      this.messageList.push(localMessage)
      this.updateLastMessageTime()
      this.$nextTick(() => this.scrollToBottom())

      try {
        const res = await uniCloud.callFunction({
          name: 'gw-chat',
          data: {
            action: 'sendMessage',
            params: {
              room_id: this.roomId,
              officer_id: police.officer_id,
              token: this.currentToken,
              officer_name: police.name,
              badge_no: police.badge_no,
              message_type: payload.message_type,
              content: payload.content || '',
              location: payload.location || null,
              client_msg_id: clientMsgId,
              task_id: this.room.task_id || ''
            }
          }
        })

        if (res.result && res.result.code === 0) {
          const cloudMessage = res.result.data.message
          const idx = this.messageList.findIndex(item => item.local_id === clientMsgId)
          if (idx >= 0) this.$set(this.messageList, idx, cloudMessage)
          this.updateLastMessageTime()
          this.markRead()
        } else {
          this.markSendFailed(clientMsgId)
          this.showServiceNotice((res.result && res.result.msg) || '发送失败', true)
        }
      } catch (e) {
        this.markSendFailed(clientMsgId)
        this.showServiceNotice('发送失败，请检查网络', true)
        console.error('sendMessage error:', e)
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

    markSendFailed(clientMsgId) {
      const idx = this.messageList.findIndex(item => item.local_id === clientMsgId)
      if (idx >= 0) {
        this.$set(this.messageList, idx, {
          ...this.messageList[idx],
          send_status: 'failed'
        })
      }
    },

    retryMessage(msg) {
      const idx = this.messageList.findIndex(item => item.local_id === msg.local_id)
      if (idx >= 0) this.messageList.splice(idx, 1)
      this.sendMessage({
        message_type: msg.message_type || 'text',
        content: msg.content || '',
        location: msg.location || null
      })
    },

    toggleTools() {
      this.showQuickPanel = !this.showQuickPanel
    },

    scrollToBottom() {
      this.scrollToView = 'msg-bottom'
      setTimeout(() => {
        this.scrollToView = ''
      }, 120)
    },

    isMine(msg) {
      const police = this.readPoliceInfo()
      return msg.sender_id === police.officer_id
    },

    isSystem(msg) {
      return msg.message_type === 'system' || msg.sender_id === 'system'
    },

    getNameInitial(name) {
      return String(name || '警').charAt(0)
    },

    getLocationText(msg) {
      if (msg.location && msg.location.address) return msg.location.address
      return msg.content || '位置消息'
    },

    formatClock(ts) {
      if (!ts) return ''
      const d = new Date(ts)
      const p = n => String(n).padStart(2, '0')
      return `${p(d.getHours())}:${p(d.getMinutes())}`
    },

    showMessageActions(msg) {
      if (this.isSystem(msg)) return
      uni.showActionSheet({
        itemList: ['复制消息'],
        success: res => {
          if (res.tapIndex === 0) {
            uni.setClipboardData({ data: msg.content || this.getLocationText(msg) })
          }
        }
      })
    },

    showRoomInfo() {
      uni.navigateTo({
        url: `/pages/police/workplace/room-info?roomId=${this.roomId}&roomName=${encodeURIComponent(this.room.name || this.roomName || '')}`
      })
    },

    openTask() {
      if (!this.room.task_id) return
      uni.navigateTo({ url: `/pages/police/task-center/task-detail?id=${this.room.task_id}` })
    }
  }
}
</script>

<style scoped lang="scss">
.chat-page {
  min-height: 100vh;
  background: #EAF0F7;
  display: flex;
  flex-direction: column;
}

.status-bar {
  background: #0F2A5C;
}

.chat-nav {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 18rpx 24rpx;
  background: linear-gradient(135deg, #0F2A5C 0%, #1B4B8C 100%);
  box-shadow: 0 6rpx 18rpx rgba(15, 42, 92, 0.18);
}

.nav-back,
.nav-more {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-back svg {
  width: 40rpx;
  height: 40rpx;
}

.nav-more text {
  color: #FFFFFF;
  font-size: 34rpx;
  letter-spacing: 2rpx;
  transform: translateY(-6rpx);
}

.nav-room {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5rpx;
}

.room-title {
  font-size: 31rpx;
  font-weight: 700;
  color: #FFFFFF;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-sub {
  font-size: 21rpx;
  color: rgba(255, 255, 255, 0.76);
}

.task-strip {
  height: 72rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 0 26rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #E2E8F0;
}

.task-strip text {
  flex: 1;
  font-size: 24rpx;
  color: #334155;
}

.message-scroll {
  flex: 1;
  height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}

.message-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.message-row.mine {
  justify-content: flex-end;
}

.message-row.system {
  justify-content: center;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #2563EB, #1D4ED8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar text {
  font-size: 26rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.mine-avatar {
  background: linear-gradient(135deg, #0EA5A3, #047857);
}

.bubble-wrap {
  max-width: 560rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.message-row.mine .bubble-wrap {
  align-items: flex-end;
}

.sender-line {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding-left: 4rpx;
}

.sender-name {
  font-size: 22rpx;
  color: #475569;
  font-weight: 600;
}

.sender-badge {
  font-size: 20rpx;
  color: #94A3B8;
}

.bubble {
  padding: 20rpx 24rpx;
  border-radius: 18rpx;
  background: #FFFFFF;
  border-top-left-radius: 6rpx;
  box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, 0.06);
}

.message-row.mine .bubble {
  background: linear-gradient(135deg, #2563EB, #1D4ED8);
  border-top-left-radius: 18rpx;
  border-top-right-radius: 6rpx;
}

.bubble.failed {
  opacity: 0.72;
}

.bubble-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: #0F172A;
  word-break: break-word;
}

.message-row.mine .bubble-text {
  color: #FFFFFF;
}

.location-card {
  min-width: 320rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.location-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.location-title {
  font-size: 26rpx;
  font-weight: 650;
  color: #0F172A;
}

.location-address {
  font-size: 22rpx;
  color: #64748B;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-row.mine .location-title,
.message-row.mine .location-address {
  color: #FFFFFF;
}

.meta-line {
  font-size: 20rpx;
  color: #94A3B8;
  padding: 0 4rpx;
}

.failed-text {
  color: #EF4444;
}

.system-message {
  max-width: 620rpx;
  padding: 10rpx 20rpx;
  border-radius: 22rpx;
  background: rgba(15, 23, 42, 0.08);
}

.system-message text {
  font-size: 22rpx;
  color: #64748B;
}

.message-bottom {
  height: 24rpx;
}

.loading-wrap,
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
  padding: 120rpx 0;
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

.quick-panel {
  background: #FFFFFF;
  border-top: 1rpx solid #E2E8F0;
  padding: 20rpx 24rpx 18rpx;
}

.quick-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.quick-head text {
  font-size: 24rpx;
  color: #334155;
  font-weight: 650;
}

.quick-close {
  color: #2563EB !important;
  font-weight: 500 !important;
}

.quick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.quick-chip {
  padding: 14rpx 20rpx;
  border-radius: 28rpx;
  background: #EFF6FF;
  border: 1rpx solid #BFDBFE;
}

.quick-chip text {
  font-size: 23rpx;
  color: #1D4ED8;
}

.input-bar {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 18rpx 22rpx;
  padding-bottom: calc(18rpx + env(safe-area-inset-bottom));
  background: #FFFFFF;
  border-top: 1rpx solid #E2E8F0;
}

.tool-btn,
.location-btn,
.send-btn {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tool-btn,
.location-btn {
  background: #F1F5F9;
}

.tool-btn text {
  font-size: 40rpx;
  line-height: 1;
  color: #475569;
  transform: translateY(-2rpx);
}

.message-input {
  flex: 1;
  height: 70rpx;
  padding: 0 24rpx;
  border-radius: 35rpx;
  background: #F1F5F9;
  font-size: 27rpx;
  color: #0F172A;
  box-sizing: border-box;
}

.send-btn {
  background: #94A3B8;
}

.send-btn.active {
  background: #2563EB;
  box-shadow: 0 6rpx 16rpx rgba(37, 99, 235, 0.24);
}
</style>
