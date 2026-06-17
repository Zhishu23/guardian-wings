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
        <text class="nav-title">邀请成员</text>
        <text class="nav-sub">{{ roomName || '群聊协作' }}</text>
      </view>
      <view class="send-top" :class="{ active: selectedList.length > 0 }" @click="sendInvitations">
        <text>发送</text>
      </view>
    </view>

    <view class="search-box">
      <uni-icons type="search" size="18" color="#94A3B8" />
      <input
        class="search-input"
        v-model="keyword"
        placeholder="搜索姓名、警号或部门"
        confirm-type="search"
        @confirm="loadCandidates"
      />
      <view class="clear-btn" v-if="keyword" @click="clearKeyword">
        <uni-icons type="clear" size="18" color="#94A3B8" />
      </view>
    </view>

    <view class="filter-row">
      <view class="filter-chip" :class="{ active: !departmentFilter }" @click="setDepartment('')">
        <text>全部警员</text>
      </view>
      <view class="filter-chip" :class="{ active: departmentFilter === currentDepartment }" @click="setDepartment(currentDepartment)">
        <text>本部门</text>
      </view>
    </view>

    <view class="selected-bar" v-if="selectedList.length">
      <text>已选择 {{ selectedList.length }} 人</text>
      <scroll-view scroll-x class="selected-scroll" :show-scrollbar="false">
        <view class="selected-row">
          <view class="selected-chip" v-for="item in selectedList" :key="item.officer_id" @click="toggleCandidate(item)">
            <text>{{ item.officer_name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <textarea
      class="reason-input"
      v-model="inviteReason"
      placeholder="邀请说明，可说明本次协作原因"
      maxlength="300"
    />

    <scroll-view scroll-y class="candidate-scroll" :show-scrollbar="false">
      <view v-if="loading" class="loading-wrap">
        <view class="loading-dot"></view>
        <text>正在加载警员...</text>
      </view>

      <view
        v-for="item in candidates"
        :key="item.officer_id"
        class="candidate-row"
        :class="{ disabled: !item.selectable, selected: selectedMap[item.officer_id] }"
        @click="toggleCandidate(item)"
      >
        <view class="candidate-avatar">
          <text>{{ getNameInitial(item.officer_name) }}</text>
        </view>
        <view class="candidate-main">
          <view class="candidate-top">
            <text class="candidate-name">{{ item.officer_name }}</text>
            <text class="candidate-badge" v-if="item.badge_no">#{{ item.badge_no }}</text>
          </view>
          <text class="candidate-dept">{{ item.department || '未填写部门' }}</text>
        </view>
        <view class="candidate-status" :class="'status-' + item.status">
          <text>{{ selectedMap[item.officer_id] ? '已选' : item.status_text }}</text>
        </view>
      </view>

      <view v-if="!loading && candidates.length === 0" class="empty-wrap">
        <uni-icons type="person" size="46" color="#CBD5E1" />
        <text>没有找到可展示的警员</text>
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
      keyword: '',
      departmentFilter: '',
      currentDepartment: '',
      candidates: [],
      selectedMap: {},
      inviteReason: '请协助本次群聊处置，加入后可参与实时沟通。',
      loading: false,
      submitting: false,
      lastErrorToastAt: 0
    }
  },

  computed: {
    selectedList() {
      return this.candidates.filter(item => this.selectedMap[item.officer_id])
    }
  },

  onLoad(options) {
    const sys = uni.getSystemInfoSync()
    this.statusBarHeight = sys.statusBarHeight || 0
    this.roomId = options.roomId || ''
    this.roomName = decodeURIComponent(options.roomName || '')
    const police = this.readPoliceInfo()
    this.currentDepartment = police.department || ''
    this.loadCandidates()
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

    async loadCandidates() {
      const police = this.ensurePolice()
      if (!police || !this.roomId) return
      this.loading = true
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-chat',
          data: {
            action: 'searchInviteCandidates',
            params: {
              room_id: this.roomId,
              operator_id: police.officer_id,
              keyword: this.keyword,
              department: this.departmentFilter,
              pageSize: 120
            }
          }
        })
        if (res.result && res.result.code === 0) {
          this.candidates = res.result.data.list || []
          this.pruneSelected()
        } else {
          this.showServiceNotice((res.result && res.result.msg) || '警员加载失败')
        }
      } catch (e) {
        this.showServiceNotice('警员加载失败，请检查网络')
        console.error('loadCandidates error:', e)
      } finally {
        this.loading = false
      }
    },

    setDepartment(dept) {
      this.departmentFilter = dept || ''
      this.loadCandidates()
    },

    clearKeyword() {
      this.keyword = ''
      this.loadCandidates()
    },

    toggleCandidate(item) {
      if (!item.selectable && !this.selectedMap[item.officer_id]) {
        uni.showToast({ title: item.status_text || '不可邀请', icon: 'none' })
        return
      }
      if (this.selectedMap[item.officer_id]) {
        this.$delete(this.selectedMap, item.officer_id)
      } else {
        if (this.selectedList.length >= 20) {
          uni.showToast({ title: '一次最多邀请 20 人', icon: 'none' })
          return
        }
        this.$set(this.selectedMap, item.officer_id, true)
      }
    },

    pruneSelected() {
      const selectableMap = {}
      this.candidates.forEach(item => {
        if (item.selectable) selectableMap[item.officer_id] = true
      })
      Object.keys(this.selectedMap).forEach(id => {
        if (!selectableMap[id]) this.$delete(this.selectedMap, id)
      })
    },

    async sendInvitations() {
      if (this.submitting) return
      const police = this.ensurePolice()
      if (!police) return
      if (!this.selectedList.length) {
        uni.showToast({ title: '请选择要邀请的成员', icon: 'none' })
        return
      }
      this.submitting = true
      uni.showLoading({ title: '发送邀请...' })
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-chat',
          data: {
            action: 'createInvitations',
            params: {
              room_id: this.roomId,
              operator_id: police.officer_id,
              operator_name: police.name,
              operator_badge_no: police.badge_no,
              members: this.selectedList,
              invite_reason: this.inviteReason
            }
          }
        })
        uni.hideLoading()
        if (res.result && res.result.code === 0) {
          const created = (res.result.data && res.result.data.created) || []
          const skipped = (res.result.data && res.result.data.skipped) || []
          uni.showToast({
            title: created.length ? `已发送 ${created.length} 条邀请` : '没有新的邀请',
            icon: created.length ? 'success' : 'none'
          })
          if (skipped.length) console.log('invite skipped:', skipped)
          setTimeout(() => uni.navigateBack(), 800)
        } else {
          this.showServiceNotice((res.result && res.result.msg) || '邀请发送失败', true)
        }
      } catch (e) {
        uni.hideLoading()
        this.showServiceNotice('邀请发送失败，请检查网络', true)
        console.error('sendInvitations error:', e)
      } finally {
        this.submitting = false
      }
    },

    showServiceNotice(message, force = false) {
      const now = Date.now()
      if (!force && now - this.lastErrorToastAt < 20000) return
      this.lastErrorToastAt = now
      uni.showToast({ title: message, icon: 'none', duration: 2200 })
    },

    getNameInitial(name) {
      return String(name || '警').charAt(0)
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

.back-btn {
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

.send-top {
  height: 62rpx;
  min-width: 86rpx;
  padding: 0 18rpx;
  border-radius: 31rpx;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-top.active {
  background: #FFFFFF;
}

.send-top text {
  color: rgba(255, 255, 255, 0.88);
  font-size: 24rpx;
  font-weight: 650;
}

.send-top.active text {
  color: #1B4B8C;
}

.search-box {
  margin: 22rpx 24rpx 14rpx;
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

.filter-row {
  display: flex;
  gap: 14rpx;
  padding: 0 24rpx 16rpx;
}

.filter-chip {
  height: 58rpx;
  padding: 0 24rpx;
  border-radius: 29rpx;
  background: #FFFFFF;
  border: 1rpx solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-chip.active {
  background: #1B4B8C;
  border-color: #1B4B8C;
}

.filter-chip text {
  font-size: 23rpx;
  color: #64748B;
}

.filter-chip.active text {
  color: #FFFFFF;
  font-weight: 650;
}

.selected-bar {
  padding: 16rpx 24rpx;
  background: #FFFFFF;
  border-top: 1rpx solid #E2E8F0;
  border-bottom: 1rpx solid #E2E8F0;
}

.selected-bar > text {
  display: block;
  font-size: 23rpx;
  color: #334155;
  font-weight: 650;
  margin-bottom: 12rpx;
}

.selected-scroll {
  white-space: nowrap;
}

.selected-row {
  display: inline-flex;
  gap: 12rpx;
}

.selected-chip {
  height: 50rpx;
  padding: 0 18rpx;
  border-radius: 25rpx;
  background: #EFF6FF;
  border: 1rpx solid #BFDBFE;
  display: flex;
  align-items: center;
}

.selected-chip text {
  font-size: 22rpx;
  color: #1D4ED8;
}

.reason-input {
  width: auto;
  min-height: 120rpx;
  margin: 16rpx 24rpx;
  padding: 18rpx 22rpx;
  background: #FFFFFF;
  border: 1rpx solid #E2E8F0;
  border-radius: 16rpx;
  font-size: 25rpx;
  color: #0F172A;
  line-height: 1.5;
  box-sizing: border-box;
}

.candidate-scroll {
  height: calc(100vh - 430rpx);
  padding: 0 24rpx;
  box-sizing: border-box;
}

.candidate-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 22rpx;
  margin-bottom: 16rpx;
  background: #FFFFFF;
  border: 1rpx solid #E2E8F0;
  border-radius: 18rpx;
}

.candidate-row.selected {
  border-color: #2563EB;
  background: #F8FBFF;
}

.candidate-row.disabled {
  opacity: 0.66;
}

.candidate-avatar {
  width: 76rpx;
  height: 76rpx;
  border-radius: 20rpx;
  background: #2563EB;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.candidate-avatar text {
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: 700;
}

.candidate-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.candidate-top {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.candidate-name {
  font-size: 28rpx;
  font-weight: 650;
  color: #0F172A;
}

.candidate-badge {
  font-size: 21rpx;
  color: #94A3B8;
}

.candidate-dept {
  font-size: 22rpx;
  color: #64748B;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.candidate-status {
  height: 52rpx;
  min-width: 92rpx;
  padding: 0 14rpx;
  border-radius: 26rpx;
  background: #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.candidate-status text {
  font-size: 21rpx;
  color: #64748B;
  font-weight: 600;
}

.status-available {
  background: #EFF6FF;
}

.status-available text {
  color: #2563EB;
}

.candidate-row.selected .candidate-status {
  background: #2563EB;
}

.candidate-row.selected .candidate-status text {
  color: #FFFFFF;
}

.status-in_room,
.status-pending,
.status-disabled {
  background: #F1F5F9;
}

.loading-wrap,
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  gap: 18rpx;
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
