<template>
  <view class="my-reports-page">
    <!-- 统计卡片 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ statsData.total }}</text>
        <text class="stat-label">总举报数</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-value">{{ statsData.pending }}</text>
        <text class="stat-label">待处理</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-value">{{ statsData.done }}</text>
        <text class="stat-label">已处理</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-value">{{ statsData.rejected }}</text>
        <text class="stat-label">已驳回</text>
      </view>
    </view>

    <!-- 状态筛选Tab -->
    <view class="filter-tabs">
      <view
        v-for="tab in statusTabs"
        :key="tab.value"
        class="filter-tab"
        :class="{ active: currentStatus === tab.value }"
        @click="switchStatus(tab.value)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- 下拉刷新区域 -->
    <scroll-view
      scroll-y
      class="reports-scroll"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 列表 -->
      <view class="reports-list" v-if="reports.length > 0">
        <view
          v-for="report in reports"
          :key="report._id"
          class="report-card"
          @click="viewDetail(report)"
        >
          <view class="card-header">
            <view class="report-type">
              <view class="type-badge" :class="report.typeClass">
                <text>{{ getTypeLabel(report.type) }}</text>
              </view>
              <text class="report-id">{{ formatReportId(report._id) }}</text>
            </view>
            <view class="status-badge" :class="'status-' + report.status">
              <text>{{ getStatusLabel(report.status) }}</text>
            </view>
          </view>

          <view class="card-content">
            <view class="info-row">
              <uni-icons type="location-filled" size="18" color="#6B7280" />
              <text class="info-text">{{ report.location && report.location.address || '位置未知' }}</text>
            </view>
            <view class="info-row">
              <uni-icons type="calendar" size="18" color="#6B7280" />
              <text class="info-text">{{ formatTime(report.time) }}</text>
            </view>
            <!-- 描述摘要 -->
            <text class="desc-preview">{{ report.description }}</text>
            <!-- 图片缩略图 -->
            <view class="thumb-row" v-if="report.images && report.images.length > 0">
              <image
                v-for="(img, i) in report.images.slice(0, 3)"
                :key="i"
                :src="img"
                mode="aspectFill"
                class="thumb-img"
              />
              <view class="thumb-more" v-if="report.images.length > 3">
                <text>+{{ report.images.length - 3 }}</text>
              </view>
            </view>
          </view>

          <!-- 处理备注（仅已处理/驳回显示） -->
          <view class="remark-row" v-if="report.remark && report.status !== 0">
            <text class="remark-label">处理意见：</text>
            <text class="remark-text">{{ report.remark }}</text>
          </view>

          <view class="card-footer">
            <text class="submit-time">提交于 {{ formatTime(report.create_time) }}</text>
            <uni-icons type="right" size="18" color="#9CA3AF" />
          </view>
        </view>

        <!-- 加载更多 -->
        <view class="load-more" v-if="hasMore">
          <text>上拉加载更多</text>
        </view>
        <view class="load-more" v-else>
          <text>没有更多了</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!loading" class="empty-state">
        <view class="empty-icon">
          <uni-icons type="compose" size="76" color="#9CA3AF" />
        </view>
        <text class="empty-text">暂无{{ currentStatusLabel }}举报记录</text>
        <button class="empty-btn" @click="goReport">立即举报</button>
      </view>

      <!-- 加载中 -->
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loading:    false,
      refreshing: false,
      reports:    [],
      statsData:  { total: 0, pending: 0, done: 0, rejected: 0 },
      currentStatus: -1,   // -1=全部 0=待处理 1=已处理 2=已驳回
      page:     1,
      pageSize: 10,
      hasMore:  true,
      statusTabs: [
        { label: '全部',   value: -1 },
        { label: '待处理', value: 0  },
        { label: '已处理', value: 1  },
        { label: '已驳回', value: 2  }
      ]
    }
  },

  computed: {
    currentStatusLabel() {
      const tab = this.statusTabs.find(t => t.value === this.currentStatus)
      return tab && tab.value !== -1 ? tab.label : ''
    }
  },

  onLoad() {
    this.loadStats()
    this.loadReports(true)
  },

  methods: {
    async loadStats() {
      const uid = this.$store.state.user.uid
      if (!uid) return
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-public-report',
          data: { action: 'getReportStats', params: { user_id: uid } }
        })
        if (res.result.code === 0) {
          this.statsData = res.result.data
        }
      } catch (e) { console.error(e) }
    },

    async loadReports(reset = false) {
      const uid = this.$store.state.user.uid
      if (!uid) return

      if (reset) {
        this.page    = 1
        this.hasMore = true
        this.reports = []
      }

      if (!this.hasMore && !reset) return
      this.loading = true

      try {
        const res = await uniCloud.callFunction({
          name: 'gw-public-report',
          data: {
            action: 'getMyReports',
            params: {
              user_id:  uid,
              status:   this.currentStatus,
              page:     this.page,
              pageSize: this.pageSize
            }
          }
        })

        if (res.result.code === 0) {
          const { list, hasMore } = res.result.data
          const normalizedList = this.normalizeReports(list || [])
          this.reports  = reset ? normalizedList : [...this.reports, ...normalizedList]
          this.hasMore  = hasMore
          if (hasMore) this.page++
        } else {
          uni.showToast({ title: res.result.msg || '加载失败', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: '网络异常', icon: 'none' })
      } finally {
        this.loading    = false
        this.refreshing = false
      }
    },

    switchStatus(value) {
      if (this.currentStatus === value) return
      this.currentStatus = value
      this.loadReports(true)
    },

    onRefresh() {
      this.refreshing = true
      this.loadStats()
      this.loadReports(true)
    },

    loadMore() {
      if (!this.loading && this.hasMore) {
        this.loadReports(false)
      }
    },

    viewDetail(report) {
      uni.navigateTo({
        url: `/subpackages/report/report-detail?id=${report._id}`,
        fail: () => {
        uni.showModal({
          title: this.getTypeLabel(report.type),
          content: `状态：${this.getStatusLabel(report.status)}\n地点：${report.location && report.location.address || '未知'}\n描述：${report.description}`,
          showCancel: false
        })
        }
      })
    },

    goReport() {
      uni.switchTab({ url: '/pages/public/report/report' })
    },

 
    getTypeLabel(type) {
      const map = {
        illegal_hunting:     '非法捕鸟',
        illegal_trade:       '非法贩卖',
        habitat_destruction: '栖息地破坏',
        other:               '其他违法'
      }
      return map[type] || '未知类型'
    },

    getTypeBadgeClass(type) {
      const styles = {
        illegal_hunting:     'type-illegal_hunting',
        illegal_trade:       'type-illegal_trade',
        habitat_destruction: 'type-habitat_destruction',
        other:               'type-other'
      }
      return styles[type] || styles.other
    },

    normalizeReports(list) {
      return list.map(report => ({
        ...report,
        typeClass: this.getTypeBadgeClass(report.type)
      }))
    },

    getStatusLabel(status) {
      return ['待处理', '已处理', '已驳回'][status] || '未知'
    },

    formatReportId(id) {
      if (!id) return ''
      return 'GW' + id.slice(-8).toUpperCase()
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
.my-reports-page { min-height: 100vh; background: #F5F7FA; display: flex; flex-direction: column; }
.stats-card {
  display: flex;
  background: linear-gradient(135deg, #2D8F47 0%, #2D6A4F 100%);
  border-radius: 16rpx;
  padding: 40rpx 16rpx;
  margin: 24rpx 24rpx 0;
  box-shadow: 0 8rpx 24rpx rgba(45,143,71,0.2);
}
.stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; }
.stat-value { font-size: 44rpx; font-weight: 700; color: #FFFFFF; margin-bottom: 8rpx; }
.stat-label { font-size: 22rpx; color: rgba(255,255,255,0.8); }
.stat-divider { width: 2rpx; background: rgba(255,255,255,0.3); }
.filter-tabs {
  display: flex;
  background: #FFFFFF;
  margin: 20rpx 24rpx 0;
  border-radius: 12rpx;
  padding: 8rpx;
  gap: 4rpx;
}
.filter-tab {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #6B7280;
  transition: all 0.2s;
}
.filter-tab.active { background: #2D6A4F; color: #FFFFFF; font-weight: 600; }
.reports-scroll { flex: 1; height: calc(100vh - 320rpx); }
.reports-list { padding: 20rpx 24rpx 48rpx; display: flex; flex-direction: column; gap: 20rpx; }
.report-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 28rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.report-type { display: flex; align-items: center; gap: 16rpx; }
.type-badge { padding: 8rpx 20rpx; border-radius: 8rpx; font-size: 24rpx; font-weight: 500; background: #F3F4F6; color: #6B7280; }
.type-badge.type-illegal_hunting { background: #FEE2E2; color: #DC2626; }
.type-badge.type-illegal_trade { background: #FEF3C7; color: #F59E0B; }
.type-badge.type-habitat_destruction { background: #EDE9FE; color: #8B5CF6; }
.type-badge.type-other { background: #F3F4F6; color: #6B7280; }
.report-id { font-size: 22rpx; color: #9CA3AF; }
.status-badge { padding: 8rpx 20rpx; border-radius: 8rpx; font-size: 24rpx; font-weight: 500; }
.status-0 { background: #DBEAFE; color: #1D4ED8; }
.status-1 { background: #D1FAE5; color: #065F46; }
.status-2 { background: #FEE2E2; color: #DC2626; }
.card-content { display: flex; flex-direction: column; gap: 16rpx; margin-bottom: 20rpx; }
.info-row { display: flex; align-items: center; gap: 12rpx; }
.info-text { flex: 1; font-size: 26rpx; color: #6B7280; }
.desc-preview {
  font-size: 26rpx;
  color: #374151;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.thumb-row { display: flex; gap: 12rpx; margin-top: 8rpx; }
.thumb-img { width: 120rpx; height: 120rpx; border-radius: 8rpx; }
.thumb-more {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
}
.remark-row {
  display: flex;
  gap: 8rpx;
  padding: 16rpx;
  background: #FEF3C7;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
}
.remark-label { font-size: 24rpx; color: #92400E; font-weight: 500; flex-shrink: 0; }
.remark-text { font-size: 24rpx; color: #92400E; flex: 1; line-height: 1.5; }
.card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 20rpx; border-top: 1rpx solid #E5E7EB; }
.submit-time { font-size: 24rpx; color: #9CA3AF; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 120rpx 48rpx; }
.empty-icon { width: 240rpx; height: 240rpx; margin-bottom: 32rpx; border-radius: 50%; background: #F3F4F6; display: flex; align-items: center; justify-content: center; }
.empty-text { font-size: 28rpx; color: #9CA3AF; margin-bottom: 32rpx; }
.empty-btn {
  width: 240rpx; height: 72rpx;
  background: linear-gradient(135deg, #2D8F47 0%, #2D6A4F 100%);
  color: #FFFFFF; border-radius: 12rpx; font-size: 28rpx; border: none;
}
.empty-btn::after { border: none; }
.loading-state { display: flex; align-items: center; justify-content: center; padding: 48rpx; }
.loading-state text { font-size: 26rpx; color: #9CA3AF; }
.load-more { text-align: center; padding: 32rpx; font-size: 24rpx; color: #9CA3AF; }
</style>
