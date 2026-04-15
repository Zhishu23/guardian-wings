<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
    <view class="navbar">
      <view class="nav-btn" @click="goBack">返回</view>
      <view class="nav-center">
        <text class="nav-title">报告详情</text>
        <text class="nav-sub">{{ report.id || '未找到报告' }}</text>
      </view>
      <view class="nav-btn right" @click="editReport" v-if="report.id">编辑</view>
    </view>

    <scroll-view scroll-y class="scroll">
      <view v-if="report.id">
        <view class="card">
          <view class="row"><text class="label">标题</text><text class="value strong">{{ report.title || '未命名报告' }}</text></view>
          <view class="row"><text class="label">模板</text><text class="value">{{ templateLabel(report.template) }}</text></view>
          <view class="row"><text class="label">状态</text><text class="badge" :class="'s-' + report.status">{{ statusLabel(report.status) }}</text></view>
          <view class="row"><text class="label">创建时间</text><text class="value">{{ report.createdAt || '未知' }}</text></view>
          <view class="row"><text class="label">更新时间</text><text class="value">{{ report.updatedAt || report.createdAt || '未知' }}</text></view>
        </view>

        <view class="card event" v-if="currentEvent">
          <text class="section-title">关联事件包</text>
          <text class="event-title">{{ currentEvent.title || '未命名事件' }}</text>
          <text class="event-meta">{{ eventTypeLabel(currentEvent.type) }} · {{ eventStatusLabel(currentEvent.status) }}</text>
          <text class="event-meta">{{ currentEvent.locationText || '地点未填写' }}</text>
          <text class="event-meta" v-if="currentEvent.happenTime">{{ currentEvent.happenTime }}</text>
        </view>

        <view class="card">
          <text class="section-title">素材统计</text>
          <view class="stats">
            <view class="stat"><text class="stat-num">{{ materialCounts.photos }}</text><text class="stat-label">照片</text></view>
            <view class="stat"><text class="stat-num">{{ materialCounts.videos }}</text><text class="stat-label">视频</text></view>
            <view class="stat"><text class="stat-num">{{ materialCounts.transcripts }}</text><text class="stat-label">笔录</text></view>
          </view>
        </view>

        <view class="card" v-if="report.summary">
          <text class="section-title">内容摘要</text>
          <text class="paragraph">{{ report.summary }}</text>
        </view>

        <view class="card" v-if="report.content">
          <text class="section-title">报告正文</text>
          <text class="paragraph preserve">{{ report.content }}</text>
        </view>

        <view class="card" v-if="report.conclusion">
          <text class="section-title">报告结论</text>
          <text class="paragraph">{{ report.conclusion }}</text>
        </view>
      </view>

      <view v-else class="empty">
        <text class="empty-title">未找到报告</text>
        <text class="empty-desc">当前记录可能已删除，或传入的报告编号无效。</text>
      </view>

      <view class="safe-bottom" />
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'ReportDetail',
  data() {
    return {
      statusBarHeight: 0,
      reportId: '',
      report: {},
      allEvents: []
    }
  },
  computed: {
    currentEvent() {
      if (!this.report.eventId) return null
      return this.allEvents.find((item) => item.id === this.report.eventId) || null
    },
    materialCounts() {
      return {
        photos: Array.isArray(this.report.relatedPhotos) ? this.report.relatedPhotos.length : 0,
        videos: Array.isArray(this.report.relatedVideos) ? this.report.relatedVideos.length : 0,
        transcripts: Array.isArray(this.report.relatedTranscripts) ? this.report.relatedTranscripts.length : 0
      }
    }
  },
  onLoad(options) {
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight
    this.reportId = options && options.id ? options.id : ''
    this.loadEvents()
    this.loadReport()
  },
  onShow() {
    this.loadEvents()
    this.loadReport()
  },
  methods: {
    normalizeReport(item) {
      const base = Object.assign({
        id: '',
        template: '',
        title: '',
        summary: '',
        content: '',
        conclusion: '',
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
    loadReport() {
      try {
        const raw = uni.getStorageSync('gw_report_records')
        const list = raw ? JSON.parse(raw) : []
        const found = Array.isArray(list) ? list.find((item) => item.id === this.reportId) : null
        this.report = found ? this.normalizeReport(found) : {}
      } catch (e) {
        this.report = {}
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
    eventTypeLabel(type) {
      return {
        patrol: '巡查处置',
        clue: '线索核查',
        poaching: '非法捕猎',
        rescue: '救助放归',
        other: '其他'
      }[type] || '现场事件'
    },
    eventStatusLabel(status) {
      return {
        collecting: '采集中',
        pending_sort: '待整理',
        pending_report: '待成文',
        archived: '已归档'
      }[status] || '采集中'
    },
    editReport() {
      if (!this.report.id) return
      uni.navigateTo({ url: '/pages/police/workplace/report-generate?id=' + this.report.id })
    },
    goBack() {
      uni.navigateBack({ delta: 1 })
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #0f172a; color: #fff; display: flex; flex-direction: column; }
.status-bar, .navbar { background: #0f172a; }
.navbar { height: 88rpx; padding: 0 20rpx; display: flex; align-items: center; }
.nav-btn { width: 88rpx; font-size: 26rpx; color: rgba(255,255,255,0.72); }
.nav-btn.right { text-align: right; }
.nav-center { flex: 1; display: flex; flex-direction: column; align-items: center; }
.nav-title { font-size: 30rpx; font-weight: 600; }
.nav-sub { font-size: 20rpx; color: rgba(255,255,255,0.35); }
.scroll { flex: 1; padding: 18rpx 20rpx; box-sizing: border-box; }
.card { margin-bottom: 18rpx; padding: 20rpx; border-radius: 16rpx; background: rgba(255,255,255,0.04); border: 1rpx solid rgba(255,255,255,0.08); }
.event { background: rgba(15,118,110,0.14); border-color: rgba(45,212,191,0.22); }
.row { display: flex; justify-content: space-between; align-items: center; gap: 16rpx; padding: 10rpx 0; }
.label { font-size: 22rpx; color: rgba(255,255,255,0.45); }
.value { max-width: 68%; text-align: right; font-size: 22rpx; color: rgba(255,255,255,0.74); }
.value.strong { font-size: 24rpx; font-weight: 600; color: rgba(255,255,255,0.9); }
.badge { padding: 6rpx 14rpx; border-radius: 999rpx; font-size: 20rpx; }
.s-draft { background: rgba(245,158,11,0.16); color: #fbbf24; }
.s-submitted { background: rgba(37,99,235,0.16); color: #60a5fa; }
.s-approved { background: rgba(16,185,129,0.16); color: #34d399; }
.section-title { display: block; margin-bottom: 12rpx; font-size: 24rpx; font-weight: 600; color: rgba(255,255,255,0.6); }
.event-title { display: block; font-size: 28rpx; font-weight: 600; color: #ccfbf1; }
.event-meta { display: block; margin-top: 8rpx; font-size: 22rpx; color: rgba(255,255,255,0.68); }
.stats { display: flex; gap: 14rpx; }
.stat { flex: 1; padding: 18rpx 12rpx; border-radius: 12rpx; background: rgba(255,255,255,0.04); text-align: center; }
.stat-num { display: block; font-size: 34rpx; font-weight: 700; color: #93c5fd; }
.stat-label { display: block; margin-top: 8rpx; font-size: 22rpx; color: rgba(255,255,255,0.46); }
.paragraph { display: block; font-size: 24rpx; color: rgba(255,255,255,0.82); line-height: 1.8; }
.paragraph.preserve { white-space: pre-wrap; }
.empty { padding: 120rpx 40rpx; text-align: center; }
.empty-title { display: block; font-size: 30rpx; font-weight: 600; color: rgba(255,255,255,0.62); }
.empty-desc { display: block; margin-top: 12rpx; font-size: 22rpx; color: rgba(255,255,255,0.36); line-height: 1.7; }
.safe-bottom { height: 70rpx; }
</style>
