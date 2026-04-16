<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
    <view class="navbar">
      <view class="nav-btn" @click="goBack">返回</view>
      <view class="nav-center">
        <text class="nav-title">报告列表</text>
        <text class="nav-sub">{{ filteredReports.length }} 条记录</text>
      </view>
      <view class="nav-btn right" @click="createNew">新建</view>
    </view>

    <view class="filter-bar">
      <view v-for="item in statusFilters" :key="item.value" class="filter-chip" :class="{ active: currentStatus === item.value }" @click="setStatusFilter(item.value)">
        <text>{{ item.label }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll">
      <view v-if="filteredReports.length > 0" class="list">
        <view v-for="report in filteredReports" :key="report.id" class="card" @click="openDetail(report)">
          <view class="head">
            <view class="head-main">
              <text class="report-title">{{ report.title || '未命名报告' }}</text>
              <text class="report-meta">{{ templateLabel(report.template) }} · {{ report.updatedAt || report.createdAt || '未知时间' }}</text>
            </view>
            <text class="badge" :class="'s-' + report.status">{{ statusLabel(report.status) }}</text>
          </view>

          <text class="event-line" v-if="getEventTitle(report.eventId)">事件包：{{ getEventTitle(report.eventId) }}</text>
          <text class="summary" v-if="report.summary">{{ report.summary }}</text>

          <view class="materials">
            <view class="mat"><text>照片 {{ getCount(report.relatedPhotos) }}</text></view>
            <view class="mat"><text>视频 {{ getCount(report.relatedVideos) }}</text></view>
            <view class="mat"><text>笔录 {{ getCount(report.relatedTranscripts) }}</text></view>
          </view>

          <view class="actions" @click.stop="">
            <view class="btn ghost" @click="openDetail(report)">查看</view>
            <view class="btn primary" @click="editReport(report)">继续编辑</view>
            <view class="btn danger" @click="deleteReport(report)">删除</view>
          </view>
        </view>
      </view>

      <view v-else class="empty">
        <text class="empty-title">暂无报告</text>
        <text class="empty-desc">点击右上角“新建”开始生成第一份报告。</text>
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
      allEvents: [],
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
      const list = this.allReports.slice().sort((a, b) => this.getTimeValue(b.updatedAt || b.createdAt) - this.getTimeValue(a.updatedAt || a.createdAt))
      if (this.currentStatus === 'all') return list
      return list.filter((item) => item.status === this.currentStatus)
    }
  },
  onLoad() {
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight
    this.loadAll()
  },
  onShow() {
    this.loadAll()
  },
  methods: {
    loadAll() {
      this.loadReports()
      this.loadEvents()
    },
    normalizeReport(item) {
      const base = Object.assign({
        id: '',
        template: '',
        title: '',
        summary: '',
        eventId: '',
        relatedPhotos: [],
        relatedVideos: [],
        relatedTranscripts: [],
        status: 'draft',
        createdAt: '',
        updatedAt: ''
      }, item || {})
      base.relatedPhotos = Array.isArray(base.relatedPhotos) ? base.relatedPhotos : []
      base.relatedVideos = Array.isArray(base.relatedVideos) ? base.relatedVideos : []
      base.relatedTranscripts = Array.isArray(base.relatedTranscripts) ? base.relatedTranscripts : []
      return base
    },
    loadReports() {
      try {
        const raw = uni.getStorageSync('gw_report_records')
        const list = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : []
        this.allReports = Array.isArray(list) ? list.map((item) => this.normalizeReport(item)) : []
      } catch (e) {
        this.allReports = []
      }
    },
    loadEvents() {
      try {
        const raw = uni.getStorageSync('gw_event_records')
        this.allEvents = raw ? JSON.parse(raw) : []
      } catch (e) {
        this.allEvents = []
      }
    },
    getTimeValue(value) {
      if (!value) return 0
      const time = new Date(String(value).replace(/-/g, '/')).getTime()
      return isNaN(time) ? 0 : time
    },
    getCount(list) {
      return Array.isArray(list) ? list.length : 0
    },
    getEventTitle(eventId) {
      if (!eventId) return ''
      const found = this.allEvents.find((item) => item.id === eventId)
      return found ? (found.title || '未命名事件') : ''
    },
    statusLabel(status) {
      return { draft: '草稿', submitted: '已提交', approved: '已审批' }[status] || '未知'
    },
    templateLabel(template) {
      return {
        incident: '事件报告',
        patrol: '巡查日志',
        investigation: '调查报告',
        summary: '工作总结',
        custom: '自定义'
      }[template] || '自定义'
    },
    setStatusFilter(value) {
      this.currentStatus = value
    },
    openDetail(report) {
      uni.navigateTo({ url: '/pages/police/workplace/report-detail?id=' + report.id })
    },
    editReport(report) {
      uni.navigateTo({ url: '/pages/police/workplace/report-generate?id=' + report.id })
    },
    deleteReport(report) {
      uni.showModal({
        title: '删除报告',
        content: '删除后不可恢复，是否继续？',
        success: (res) => {
          if (!res.confirm) return
          this.allReports = this.allReports.filter((item) => item.id !== report.id)
          uni.setStorageSync('gw_report_records', JSON.stringify(this.allReports))
          if (report.eventId) {
            const nextEvents = this.allEvents.map((item) => {
              if (item.id !== report.eventId) return item
              const reportIds = Array.isArray(item.reportIds) ? item.reportIds.filter((id) => id !== report.id) : []
              return Object.assign({}, item, { reportIds, updatedAt: report.updatedAt || report.createdAt || item.updatedAt })
            })
            this.allEvents = nextEvents
            uni.setStorageSync('gw_event_records', JSON.stringify(nextEvents))
          }
          uni.showToast({ title: '已删除', icon: 'success' })
        }
      })
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

<style scoped>
.page { min-height: 100vh; background: #0f172a; color: #fff; display: flex; flex-direction: column; }
.status-bar, .navbar, .filter-bar { background: #0f172a; }
.navbar { height: 88rpx; padding: 0 20rpx; display: flex; align-items: center; }
.nav-btn { width: 88rpx; font-size: 26rpx; color: rgba(255,255,255,0.72); }
.nav-btn.right { text-align: right; }
.nav-center { flex: 1; display: flex; flex-direction: column; align-items: center; }
.nav-title { font-size: 30rpx; font-weight: 600; }
.nav-sub { font-size: 20rpx; color: rgba(255,255,255,0.35); }
.filter-bar { display: flex; gap: 12rpx; padding: 12rpx 20rpx; overflow-x: auto; white-space: nowrap; }
.filter-chip { display: inline-flex; padding: 10rpx 22rpx; border-radius: 999rpx; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.48); font-size: 23rpx; }
.filter-chip.active { background: rgba(37,99,235,0.22); color: #93c5fd; }
.scroll { flex: 1; padding: 16rpx 20rpx; box-sizing: border-box; }
.list { display: flex; flex-direction: column; gap: 16rpx; }
.card { padding: 20rpx; border-radius: 16rpx; background: rgba(255,255,255,0.04); border: 1rpx solid rgba(255,255,255,0.08); }
.head { display: flex; justify-content: space-between; gap: 16rpx; }
.head-main { flex: 1; }
.report-title { display: block; font-size: 28rpx; font-weight: 600; color: rgba(255,255,255,0.9); }
.report-meta { display: block; margin-top: 8rpx; font-size: 22rpx; color: rgba(255,255,255,0.42); }
.badge { padding: 6rpx 14rpx; border-radius: 999rpx; font-size: 20rpx; white-space: nowrap; }
.s-draft { background: rgba(245,158,11,0.16); color: #fbbf24; }
.s-submitted { background: rgba(37,99,235,0.16); color: #60a5fa; }
.s-approved { background: rgba(16,185,129,0.16); color: #34d399; }
.event-line { display: block; margin-top: 12rpx; font-size: 22rpx; color: #99f6e4; }
.summary { display: block; margin-top: 10rpx; font-size: 23rpx; color: rgba(255,255,255,0.7); line-height: 1.7; }
.materials { display: flex; gap: 10rpx; margin-top: 14rpx; flex-wrap: wrap; }
.mat { padding: 8rpx 14rpx; border-radius: 999rpx; background: rgba(255,255,255,0.05); font-size: 21rpx; color: rgba(255,255,255,0.5); }
.actions { display: flex; gap: 14rpx; margin-top: 16rpx; }
.btn { flex: 1; text-align: center; padding: 14rpx 0; border-radius: 12rpx; font-size: 24rpx; }
.btn.ghost { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.74); }
.btn.primary { background: rgba(37,99,235,0.24); color: #bfdbfe; }
.btn.danger { background: rgba(239,68,68,0.18); color: #fca5a5; }
.empty { padding: 120rpx 40rpx; text-align: center; }
.empty-title { display: block; font-size: 30rpx; font-weight: 600; color: rgba(255,255,255,0.62); }
.empty-desc { display: block; margin-top: 12rpx; font-size: 22rpx; color: rgba(255,255,255,0.36); line-height: 1.7; }
.safe-bottom { height: 70rpx; }
</style>
