<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />

    <!-- 顶导航 -->
    <view class="navbar">
      <view class="nav-back" @click="goBack">
        <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>
      </view>
      <view class="nav-center">
        <text class="nav-title">报告列表</text>
        <text class="nav-sub">{{ filteredReports.length }} 条记录</text>
      </view>
      <view class="nav-right">
        <view class="nav-action" @click="createNew">
          <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/></svg>
        </view>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view
        v-for="st in statusFilters"
        :key="st.value"
        class="filter-chip"
        :class="currentStatus === st.value ? 'filter-active' : ''"
        @click="setStatusFilter(st.value)"
      >
        <text>{{ st.label }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll">
      <!-- 报告列表 -->
      <view class="report-list" v-if="filteredReports.length > 0">
        <view
          v-for="report in filteredReports"
          :key="report.id"
          class="report-card"
          @click="openReport(report)"
        >
          <view class="rc-header">
            <view class="rc-left">
              <view class="rc-icon" :class="'icon-' + report.template">
                <svg viewBox="0 0 24 24" v-html="getTemplateIcon(report.template)"></svg>
              </view>
              <view class="rc-meta">
                <text class="rc-id">{{ report.id }}</text>
                <text class="rc-time">{{ report.createdAt }}</text>
              </view>
            </view>
            <view class="rc-status" :class="'status-' + report.status">
              <text>{{ statusLabel(report.status) }}</text>
            </view>
          </view>

          <text class="rc-title">{{ report.title || '无标题' }}</text>

          <view class="rc-summary" v-if="report.summary">
            <text>{{ report.summary }}</text>
          </view>

          <!-- 关联素材统计 -->
          <view class="rc-materials" v-if="report.relatedPhotos.length > 0 || report.relatedVideos.length > 0 || report.relatedTranscripts.length > 0">
            <view class="mat-tag" v-if="report.relatedPhotos.length > 0">
              <svg viewBox="0 0 24 24" width="14" height="14"><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="currentColor"/></svg>
              <text>{{ report.relatedPhotos.length }}</text>
            </view>
            <view class="mat-tag" v-if="report.relatedVideos.length > 0">
              <svg viewBox="0 0 24 24" width="14" height="14"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" fill="currentColor"/></svg>
              <text>{{ report.relatedVideos.length }}</text>
            </view>
            <view class="mat-tag" v-if="report.relatedTranscripts.length > 0">
              <svg viewBox="0 0 24 24" width="14" height="14"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" fill="currentColor"/></svg>
              <text>{{ report.relatedTranscripts.length }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空态 -->
      <view class="empty" v-else>
        <svg viewBox="0 0 96 96" class="empty-svg">
          <circle cx="48" cy="48" r="44" fill="#1E293B" stroke="#334155" stroke-width="2"/>
          <rect x="28" y="28" width="40" height="40" rx="4" fill="none" stroke="#475569" stroke-width="2"/>
          <path d="M36 38h24M36 44h18M36 50h12" stroke="#475569" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <text class="empty-title">暂无报告</text>
        <text class="empty-desc">点击右上角 + 创建新报告</text>
      </view>

      <view class="safe-bottom" />
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'ReportList',

  data() {
    return {
      statusBarHeight: 0,
      allReports: [],
      currentStatus: 'all',

      statusFilters: [
        { value: 'all', label: '全部' },
        { value: 'draft', label: '草稿' },
        { value: 'submitted', label: '已提交' },
        { value: 'approved', label: '已审批' }
      ]
    }
  },

  computed: {
    filteredReports() {
      if (this.currentStatus === 'all') {
        return this.allReports.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      }
      return this.allReports.filter(r => r.status === this.currentStatus).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    }
  },

  onLoad() {
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight
    this.loadReports()
  },

  onShow() {
    this.loadReports()
  },

  methods: {
    loadReports() {
      try {
        const raw = uni.getStorageSync('gw_report_records')
        this.allReports = raw ? JSON.parse(raw) : []
      } catch (e) {
        this.allReports = []
      }
    },

    statusLabel(s) {
      return { draft: '草稿', submitted: '已提交', approved: '已审批' }[s] || '未知'
    },

    setStatusFilter(val) {
      this.currentStatus = val
    },

    getTemplateIcon(tmpl) {
      const icons = {
        incident: '<path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z" fill="#EF4444"/>',
        patrol: '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#2563EB"/>',
        investigation: '<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#10B981"/>',
        summary: '<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="#F59E0B"/>',
        custom: '<path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" fill="#8B5CF6"/>'
      }
      return icons[tmpl] || icons.custom
    },

    openReport(report) {
      uni.navigateTo({ url: `/pages/police/workplace/report-generate?id=${report.id}` })
    },

    createNew() {
      uni.navigateTo({ url: '/pages/police/workplace/report-generate' })
    },

    goBack() {
      uni.navigateBack({ delta: 1 })
    }
  }
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; max-height: 100vh; background: #0F172A; display: flex; flex-direction: column; overflow: hidden; }
.status-bar { background: #0F172A; flex-shrink: 0; }

/* 导航 */
.navbar { display: flex; align-items: center; padding: 14rpx 20rpx; background: #0F172A; flex-shrink: 0; }
.nav-back { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.7); }
.nav-center { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2rpx; }
.nav-title { font-size: 30rpx; font-weight: 600; color: #fff; }
.nav-sub { font-size: 20rpx; color: rgba(255,255,255,0.35); }
.nav-right { display: flex; gap: 8rpx; }
.nav-action { width: 52rpx; height: 52rpx; border-radius: 50%; background: rgba(37,99,235,0.15); border: 1rpx solid rgba(37,99,235,0.3); display: flex; align-items: center; justify-content: center; color: #60A5FA; }

/* 筛选栏 */
.filter-bar { display: flex; gap: 12rpx; padding: 12rpx 20rpx; background: #0F172A; flex-shrink: 0; overflow-x: auto; white-space: nowrap; }
.filter-chip { display: inline-flex; padding: 10rpx 24rpx; background: rgba(255,255,255,0.04); border: 1rpx solid rgba(255,255,255,0.08); border-radius: 24rpx; font-size: 24rpx; color: rgba(255,255,255,0.5); transition: all 0.15s; flex-shrink: 0; }
.filter-chip:active { transform: scale(0.95); }
.filter-active { background: rgba(37,99,235,0.2); border-color: rgba(37,99,235,0.4); color: #60A5FA; font-weight: 600; }

/* 滚动 */
.scroll { flex: 1; overflow-y: auto; padding: 16rpx 20rpx; }

/* 报告卡片 */
.report-list { display: flex; flex-direction: column; gap: 14rpx; }

.report-card { background: rgba(255,255,255,0.04); border: 1rpx solid rgba(255,255,255,0.08); border-radius: 18rpx; padding: 20rpx; transition: all 0.15s; }
.report-card:active { background: rgba(255,255,255,0.08); transform: scale(0.98); }

.rc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14rpx; }
.rc-left { display: flex; align-items: center; gap: 14rpx; }
.rc-icon { width: 52rpx; height: 52rpx; border-radius: 12rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.icon-incident { background: rgba(239,68,68,0.15); }
.icon-patrol { background: rgba(37,99,235,0.15); }
.icon-investigation { background: rgba(16,185,129,0.15); }
.icon-summary { background: rgba(245,158,11,0.15); }
.icon-custom { background: rgba(139,92,246,0.15); }
.rc-icon svg { width: 26rpx; height: 26rpx; }
.rc-meta { display: flex; flex-direction: column; gap: 3rpx; }
.rc-id { font-size: 20rpx; font-weight: 600; color: rgba(255,255,255,0.6); font-family: 'SF Mono', monospace; }
.rc-time { font-size: 18rpx; color: rgba(255,255,255,0.3); }
.rc-status { padding: 6rpx 16rpx; border-radius: 12rpx; font-size: 20rpx; font-weight: 500; flex-shrink: 0; }
.status-draft { background: rgba(245,158,11,0.15); color: #FBBF24; }
.status-submitted { background: rgba(37,99,235,0.15); color: #60A5FA; }
.status-approved { background: rgba(16,185,129,0.15); color: #34D399; }

.rc-title { font-size: 26rpx; font-weight: 600; color: rgba(255,255,255,0.85); display: block; margin-bottom: 8rpx; }
.rc-summary { margin-bottom: 10rpx; }
.rc-summary text { font-size: 22rpx; color: rgba(255,255,255,0.45); line-height: 1.5; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }

.rc-materials { display: flex; gap: 10rpx; }
.mat-tag { display: flex; align-items: center; gap: 6rpx; padding: 6rpx 14rpx; background: rgba(255,255,255,0.06); border: 1rpx solid rgba(255,255,255,0.08); border-radius: 16rpx; color: rgba(255,255,255,0.45); }
.mat-tag text { font-size: 20rpx; font-weight: 600; }

/* 空态 */
.empty { display: flex; flex-direction: column; align-items: center; padding: 100rpx 48rpx; text-align: center; }
.empty-svg { width: 160rpx; height: 160rpx; margin-bottom: 32rpx; }
.empty-title { font-size: 28rpx; font-weight: 600; color: rgba(255,255,255,0.55); display: block; margin-bottom: 10rpx; }
.empty-desc { font-size: 22rpx; color: rgba(255,255,255,0.3); line-height: 1.6; display: block; }

.safe-bottom { height: 60rpx; }
</style>