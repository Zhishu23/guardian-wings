<template>
  <view class="volunteer-page">
    <view class="tab-header">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        <text class="tab-text">{{ tab.label }}</text>
      </view>
      <view class="tab-indicator" :style="getIndicatorStyle()" />
    </view>

    <scroll-view
      class="tab-content"
      scroll-y
      :show-scrollbar="false"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 可用机会Tab -->
      <view v-if="currentTab === 'available'" class="available-content">
        <!-- 志愿者等级展示 -->
        <view class="level-card">
          <view class="level-left">
            <view class="level-badge">
              <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="20" :fill="levelColor"/>
                <text x="24" y="30" font-size="14" fill="white" text-anchor="middle" font-weight="bold">{{ levelChar }}</text>
              </svg>
            </view>
            <view class="level-info">
              <text class="level-title">{{ levelName }}</text>
              <text class="level-points">当前积分：{{ userPoints }}</text>
            </view>
          </view>
          <view class="level-next-tag">
            <text>{{ nextLevelName }}</text>
          </view>
          <view class="level-progress">
            <text class="progress-text">{{ levelProgressText }}</text>
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: levelProgressPct + '%' }" />
            </view>
          </view>
        </view>

        <!-- 状态筛选 -->
        <view class="filter-row">
          <view
            v-for="f in statusFilters"
            :key="f.value"
            class="filter-chip"
            :class="{ active: statusFilter === f.value }"
            @click="switchFilter(f.value)"
          >
            <text>{{ f.label }}</text>
          </view>
        </view>

        <!-- 加载中 -->
        <view v-if="loading" class="loading-box"><text>加载中...</text></view>

        <!-- 活动列表 -->
        <view v-else class="activities-list">
          <view
            v-for="activity in activities"
            :key="activity._id"
            class="activity-card"
            @click="goActivityDetail(activity._id)"
          >
            <view class="activity-cover-wrap">
              <image
                :src="activity.cover || activity.coverImage || '/static/icons/volunteer-placeholder.png'"
                mode="aspectFill"
                class="activity-cover"
              />
              <view class="status-tag" :class="'s-' + (activity.status || activity.activityStatus)">
                <text>{{ getActivityStatusLabel(activity.status || activity.activityStatus) }}</text>
              </view>
              <view class="full-tag" v-if="activity.currentParticipants >= activity.maxParticipants">
                <text>已满员</text>
              </view>
            </view>

            <view class="activity-info">
              <text class="activity-title">{{ activity.title }}</text>
              <text class="activity-desc">{{ stripHtml(activity.description) }}</text>

              <view class="activity-details">
                <view class="detail-item">
                  <text class="detail-icon">📍</text>
                  <text class="detail-text">{{ activity.location }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-icon">🕐</text>
                  <text class="detail-text">{{ formatTime(activity.startTime) }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-icon">👥</text>
                  <text class="detail-text">已报名 {{ activity.currentParticipants }}/{{ activity.maxParticipants }}</text>
                </view>
                <view class="detail-item" v-if="activity.pointsReward">
                  <text class="detail-icon">⭐</text>
                  <text class="detail-text">参与奖励 {{ activity.pointsReward }} 积分</text>
                </view>
              </view>

              <view class="organizer-row" v-if="activity.organizer">
                <text class="organizer-text">{{ activity.organizer }}</text>
              </view>

              <view class="action-row">
                <button
                  class="enroll-btn"
                  :class="{ disabled: activity.currentParticipants >= activity.maxParticipants || (activity.status || activity.activityStatus) === 'ended' }"
                  :disabled="activity.currentParticipants >= activity.maxParticipants || (activity.status || activity.activityStatus) === 'ended'"
                  @click.stop="enrollActivity(activity)"
                >
                  <text>{{
                    activity.currentParticipants >= activity.maxParticipants ? '已满员' :
                    (activity.status || activity.activityStatus) === 'ended' ? '已结束' : '立即报名'
                  }}</text>
                </button>
              </view>
            </view>
          </view>

          <!-- 空状态 -->
          <view v-if="activities.length === 0 && !loading" class="empty-box">
            <text class="empty-icon">📋</text>
            <text class="empty-text">暂无活动</text>
          </view>

          <!-- 加载更多 -->
          <view class="load-more" v-if="hasMore"><text>上拉加载更多</text></view>
          <view class="load-more" v-else-if="activities.length > 0"><text>没有更多了</text></view>
        </view>
      </view>

      <!-- 我的活动Tab -->
      <view v-if="currentTab === 'my'" class="my-content">
        <view class="my-stats">
          <view class="my-stat-item">
            <text class="my-stat-value">{{ myStats.ongoing }}</text>
            <text class="my-stat-label">进行中</text>
          </view>
          <view class="my-stat-item">
            <text class="my-stat-value">{{ myStats.completed }}</text>
            <text class="my-stat-label">已完成</text>
          </view>
          <view class="my-stat-item">
            <text class="my-stat-value">{{ userPoints }}</text>
            <text class="my-stat-label">总积分</text>
          </view>
        </view>

        <view v-if="myLoading" class="loading-box"><text>加载中...</text></view>

        <view v-else-if="myActivities.length === 0" class="empty-box">
          <text class="empty-icon">🌱</text>
          <text class="empty-text">还没有参加过活动</text>
          <view class="go-join-btn" @click="switchTab('available')">
            <text>去报名活动</text>
          </view>
        </view>

        <view v-else class="my-activities-list">
          <view
            v-for="record in myActivities"
            :key="record.recordId || record._id"
            class="my-activity-card"
            @click="goActivityDetail(record.activityId || record._id)"
          >
            <image
              :src="record.cover || record.coverImage || '/static/icons/volunteer-placeholder.png'"
              mode="aspectFill"
              class="my-activity-cover"
            />
            <view class="my-activity-info">
              <text class="my-activity-title">{{ record.title }}</text>
              <text class="my-activity-date">{{ formatTime(record.startTime) }}</text>
              <view class="my-activity-meta">
                <view class="join-status" :class="'js-' + record.joinStatus">
                  <text>{{ record.joinStatus === 'joined' ? '已报名' : '已退出' }}</text>
                </view>
                <view class="activity-status" :class="'as-' + (record.status || record.activityStatus)">
                  <text>{{ getActivityStatusLabel(record.status || record.activityStatus) }}</text>
                </view>
              </view>
              <view
                class="quit-btn"
                v-if="record.joinStatus === 'joined' && (record.status || record.activityStatus) === 'upcoming'"
                @click.stop="quitActivity(record)"
              >
                <text>退出活动</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <tab-bar active="volunteer" />
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
      currentTab: 'available',
      tabs: [
        { label: '可用机会', value: 'available' },
        { label: '我的活动', value: 'my' }
      ],
      // 可用活动
      loading:      false,
      refreshing:   false,
      activities:   [],
      page:         1,
      pageSize:     10,
      hasMore:      true,
      statusFilter: '',
      statusFilters: [
        { label: '全部',    value: ''         },
        { label: '即将开始', value: 'upcoming' },
        { label: '进行中',  value: 'ongoing'  },
        { label: '已结束',  value: 'ended'    }
      ],
      // 我的活动
      myLoading:    false,
      myActivities: [],
      myStats:      { ongoing: 0, completed: 0 }
    }
  },

  computed: {
    userPoints() {
      return this.$store.state.user.points || 0
    },
    levelName() {
      const p = this.userPoints
      if (p >= 1000) return '守护大使'
      if (p >= 500)  return '高级志愿者'
      if (p >= 200)  return '中级志愿者'
      return '初级志愿者'
    },
    nextLevelName() {
      const p = this.userPoints
      if (p >= 1000) return '最高等级'
      if (p >= 500)  return '守护大使'
      if (p >= 200)  return '高级'
      return '中级'
    },
    levelChar() {
      const map = { '守护大使': '使', '高级志愿者': '高', '中级志愿者': '中', '初级志愿者': '初' }
      return map[this.levelName] || '初'
    },
    levelColor() {
      const map = { '守护大使': '#DC2626', '高级志愿者': '#F59E0B', '中级志愿者': '#3B82F6', '初级志愿者': '#2D8F47' }
      return map[this.levelName] || '#2D8F47'
    },
    levelProgressPct() {
      const p = this.userPoints
      if (p >= 1000) return 100
      if (p >= 500)  return Math.min(100, ((p - 500) / 500) * 100)
      if (p >= 200)  return Math.min(100, ((p - 200) / 300) * 100)
      return Math.min(100, (p / 200) * 100)
    },
    levelProgressText() {
      const p = this.userPoints
      if (p >= 1000) return '已达最高等级'
      if (p >= 500)  return `距守护大使还需 ${1000 - p} 积分`
      if (p >= 200)  return `距高级志愿者还需 ${500 - p} 积分`
      return `距中级还需 ${200 - p} 积分`
    }
  },

  onLoad(options) {
    if (options && options.tab === 'my') {
      this.currentTab = 'my'
      this.loadMyActivities()
    } else {
      this.loadActivities(true)
    }
  },

  onShow() {
    const tab = uni.getStorageSync('volunteer_tab')
    if (tab === 'my') {
      uni.removeStorageSync('volunteer_tab')
      this.currentTab = 'my'
      this.loadMyActivities()
    }
  },

  methods: {
    switchTab(value) {
      this.currentTab = value
      if (value === 'my' && this.myActivities.length === 0) {
        this.loadMyActivities()
      }
    },

    getIndicatorStyle() {
      const index = this.tabs.findIndex(t => t.value === this.currentTab)
      const width = 100 / this.tabs.length
      return { left: `${index * width}%`, width: `${width}%` }
    },

    switchFilter(value) {
      if (this.statusFilter === value) return
      this.statusFilter = value
      this.loadActivities(true)
    },

    async loadActivities(reset = false) {
      if (reset) { this.page = 1; this.hasMore = true; this.activities = [] }
      if (!this.hasMore && !reset) return
      this.loading = true

      try {
        const res = await uniCloud.callFunction({
          name: 'gw-volunteer',
          data: {
            action: 'getActivityList',
            params: {
              page:     this.page,
              pageSize: this.pageSize,
              status:   this.statusFilter || undefined
            }
          }
        })
        if (res.result.code === 0) {
          const { list, hasMore } = res.result.data
          this.activities = reset ? list : [...this.activities, ...list]
          this.hasMore    = hasMore
          if (hasMore) this.page++
        }
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading    = false
        this.refreshing = false
      }
    },

    async loadMyActivities() {
      const uid = this.$store.state.user.uid
      if (!uid) return
      this.myLoading = true

      try {
        const res = await uniCloud.callFunction({
          name: 'gw-volunteer',
          data: { action: 'getMyActivities', params: { userId: uid, page: 1, pageSize: 50 } }
        })
        if (res.result.code === 0) {
          this.myActivities = res.result.data.list || []
          this.myStats.ongoing   = this.myActivities.filter(a => (a.status || a.activityStatus) === 'ongoing'  && a.joinStatus === 'joined').length
          this.myStats.completed = this.myActivities.filter(a => (a.status || a.activityStatus) === 'ended'    && a.joinStatus === 'joined').length
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.myLoading = false
      }
    },

    async enrollActivity(activity) {
      const uid = this.$store.state.user.uid
      if (!uid) {
        return uni.showModal({
          title: '未登录', content: '请先登录后再报名',
          confirmText: '去登录',
          success: res => { if (res.confirm) uni.navigateTo({ url: '/pages/login/public-login' }) }
        })
      }

      uni.showModal({
        title: '确认报名',
        content: `确定报名参加《${activity.title}》吗？\n报名成功可获得 20 积分`,
        success: async res => {
          if (!res.confirm) return
          uni.showLoading({ title: '报名中...' })
          try {
            const r = await uniCloud.callFunction({
              name: 'gw-volunteer',
              data: { action: 'joinActivity', params: { userId: uid, activityId: activity._id } }
            })
            uni.hideLoading()
            if (r.result.code === 0) {
              uni.showToast({ title: '报名成功 +20积分', icon: 'success' })
              this.loadActivities(true)
              const points = (this.$store.state.user.points || 0) + 20
              this.$store.commit('user/UPDATE_POINTS', points)
            } else {
              uni.showToast({ title: r.result.msg || '报名失败', icon: 'none' })
            }
          } catch (e) {
            uni.hideLoading()
            uni.showToast({ title: '网络异常', icon: 'none' })
          }
        }
      })
    },

    async quitActivity(record) {
      const uid = this.$store.state.user.uid
      if (!uid) return

      uni.showModal({
        title: '确认退出',
        content: `确定退出《${record.title}》吗？\n退出后将扣除 20 积分`,
        success: async res => {
          if (!res.confirm) return
          uni.showLoading({ title: '处理中...' })
          try {
            const r = await uniCloud.callFunction({
              name: 'gw-volunteer',
              data: { action: 'quitActivity', params: { userId: uid, activityId: record.activityId || record._id } }
            })
            uni.hideLoading()
            if (r.result.code === 0) {
              uni.showToast({ title: '已退出活动', icon: 'none' })
              this.loadMyActivities()
              const points = Math.max(0, (this.$store.state.user.points || 0) - 20)
              this.$store.commit('user/UPDATE_POINTS', points)
            } else {
              uni.showToast({ title: r.result.msg || '退出失败', icon: 'none' })
            }
          } catch (e) {
            uni.hideLoading()
            uni.showToast({ title: '网络异常', icon: 'none' })
          }
        }
      })
    },

    loadMore() {
      if (!this.loading && this.hasMore && this.currentTab === 'available') {
        this.loadActivities(false)
      }
    },

    onRefresh() {
      this.refreshing = true
      if (this.currentTab === 'available') this.loadActivities(true)
      else this.loadMyActivities()
    },

    goActivityDetail(id) {
      uni.navigateTo({ url: `/pages/public/volunteer/activity-detail?id=${id}` })
    },

    getActivityStatusLabel(status) {
      const map = { upcoming: '未开始', ongoing: '进行中', ended: '已结束' }
      return map[status] || '未知'
    },

    stripHtml(html) {
      if (!html) return ''
      return html.replace(/<[^>]+>/g, '').trim()
    },

    formatTime(ts) {
      if (!ts) return ''
      const d = new Date(ts)
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    }
  }
}
</script>

<style scoped lang="scss">
.volunteer-page { min-height: 100vh; background: #F5F7FA; padding-bottom: 120rpx; padding-top: var(--status-bar-height); }
.tab-header { position: sticky; top: 0; z-index: 10; display: flex; background: #FFFFFF; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); }
.tab-item { flex: 1; padding: 32rpx 0; text-align: center; position: relative; }
.tab-text { font-size: 30rpx; color: #6B7280; font-weight: 500; }
.tab-item.active .tab-text { color: #1B4B8C; font-weight: 600; }
.tab-indicator { position: absolute; bottom: 0; height: 6rpx; background: #1B4B8C; border-radius: 3rpx 3rpx 0 0; transition: all 0.3s; }
.tab-content { height: calc(100vh - 180rpx); }
.available-content, .my-content { padding: 24rpx; }

/* 等级卡片 */
.level-card { background: linear-gradient(135deg, #1B4B8C 0%, #3B82F6 100%); border-radius: 16rpx; padding: 32rpx; margin-bottom: 24rpx; box-shadow: 0 8rpx 24rpx rgba(27,75,140,0.2); }
.level-left { display: flex; align-items: center; gap: 24rpx; margin-bottom: 20rpx; }
.level-badge svg { width: 80rpx; height: 80rpx; }
.level-info { flex: 1; display: flex; flex-direction: column; }
.level-title { font-size: 32rpx; font-weight: 600; color: #FFFFFF; margin-bottom: 8rpx; }
.level-points { font-size: 24rpx; color: rgba(255,255,255,0.8); }
.level-next-tag { padding: 6rpx 18rpx; background: rgba(255,255,255,0.2); border-radius: 20rpx; align-self: flex-start; margin-bottom: 20rpx; text { font-size: 22rpx; color: rgba(255,255,255,0.9); } }
.level-progress { display: flex; flex-direction: column; gap: 12rpx; }
.progress-text { font-size: 24rpx; color: rgba(255,255,255,0.9); }
.progress-bar { height: 12rpx; background: rgba(255,255,255,0.3); border-radius: 6rpx; overflow: hidden; }
.progress-fill { height: 100%; background: #FFFFFF; border-radius: 6rpx; transition: width 0.5s; }

/* 筛选 */
.filter-row { display: flex; gap: 16rpx; margin-bottom: 24rpx; flex-wrap: wrap; }
.filter-chip { padding: 12rpx 28rpx; border-radius: 24rpx; background: #FFFFFF; border: 2rpx solid #E5E7EB; font-size: 26rpx; color: #6B7280; &.active { background: #1B4B8C; border-color: #1B4B8C; color: #FFFFFF; } }

/* 活动卡片 */
.activities-list { display: flex; flex-direction: column; gap: 24rpx; }
.activity-card { background: #FFFFFF; border-radius: 16rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); }
.activity-cover-wrap { position: relative; }
.activity-cover { width: 100%; height: 380rpx; }
.status-tag { position: absolute; top: 24rpx; left: 24rpx; padding: 8rpx 20rpx; border-radius: 8rpx; font-size: 22rpx; font-weight: 500; }
.s-upcoming { background: rgba(59,130,246,0.9); color: #fff; }
.s-ongoing  { background: rgba(16,185,129,0.9); color: #fff; }
.s-ended    { background: rgba(107,114,128,0.7); color: #fff; }
.full-tag { position: absolute; top: 24rpx; right: 24rpx; padding: 8rpx 20rpx; border-radius: 8rpx; background: rgba(220,38,38,0.9); font-size: 22rpx; color: #fff; }
.activity-info { padding: 28rpx; }
.activity-title { font-size: 32rpx; font-weight: 600; color: #1F2937; margin-bottom: 12rpx; display: block; }
.activity-desc { font-size: 26rpx; color: #6B7280; line-height: 1.6; margin-bottom: 20rpx; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.activity-details { display: flex; flex-direction: column; gap: 12rpx; margin-bottom: 20rpx; }
.detail-item { display: flex; align-items: center; gap: 12rpx; }
.detail-icon { font-size: 28rpx; }
.detail-text { font-size: 24rpx; color: #6B7280; }
.organizer-row { padding: 16rpx 0; border-top: 1rpx solid #F3F4F6; margin-bottom: 16rpx; }
.organizer-text { font-size: 24rpx; color: #9CA3AF; }
.action-row { display: flex; justify-content: space-between; align-items: center; gap: 16rpx; }
.enroll-btn { flex: 1; height: 76rpx; background: linear-gradient(135deg, #2D8F47 0%, #2D6A4F 100%); color: #FFFFFF; border-radius: 12rpx; font-size: 28rpx; font-weight: 500; border: none; &.disabled { background: #9CA3AF; } &::after { border: none; } }

/* 我的活动 */
.my-stats { display: flex; background: #FFFFFF; border-radius: 16rpx; padding: 32rpx 0; margin-bottom: 24rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.my-stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; }
.my-stat-value { font-size: 48rpx; font-weight: 700; color: #1B4B8C; margin-bottom: 8rpx; }
.my-stat-label { font-size: 24rpx; color: #6B7280; }
.my-activities-list { display: flex; flex-direction: column; gap: 20rpx; }
.my-activity-card { display: flex; background: #FFFFFF; border-radius: 16rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.my-activity-cover { width: 200rpx; height: 200rpx; flex-shrink: 0; }
.my-activity-info { flex: 1; padding: 24rpx; display: flex; flex-direction: column; justify-content: space-between; }
.my-activity-title { font-size: 28rpx; font-weight: 600; color: #1F2937; margin-bottom: 8rpx; }
.my-activity-date { font-size: 22rpx; color: #9CA3AF; margin-bottom: 12rpx; }
.my-activity-meta { display: flex; gap: 12rpx; margin-bottom: 12rpx; flex-wrap: wrap; }
.join-status, .activity-status { padding: 4rpx 14rpx; border-radius: 6rpx; font-size: 20rpx; }
.js-joined { background: #D1FAE5; color: #065F46; }
.js-quit   { background: #FEE2E2; color: #DC2626; }
.as-upcoming { background: #DBEAFE; color: #1E40AF; }
.as-ongoing  { background: #D1FAE5; color: #065F46; }
.as-ended    { background: #F3F4F6; color: #6B7280; }
.quit-btn { padding: 10rpx 20rpx; background: #FEE2E2; border-radius: 8rpx; align-self: flex-start; }
.quit-btn text { font-size: 22rpx; color: #DC2626; }

/* 通用 */
.loading-box { display: flex; align-items: center; justify-content: center; padding: 80rpx; text { font-size: 26rpx; color: #999; } }
.empty-box { display: flex; flex-direction: column; align-items: center; padding: 80rpx; gap: 20rpx; }
.empty-icon { font-size: 100rpx; }
.empty-text { font-size: 28rpx; color: #9CA3AF; }
.go-join-btn { padding: 16rpx 48rpx; background: #1B4B8C; border-radius: 12rpx; text { font-size: 28rpx; color: #fff; } }
.load-more { text-align: center; padding: 32rpx; font-size: 24rpx; color: #9CA3AF; }
</style>