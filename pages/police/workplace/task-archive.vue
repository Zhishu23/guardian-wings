<template>
  <view class="page">
    <view class="top-nav">
      <view class="back-btn" @click="goBack"><text class="back-text">返回</text></view>
      <text class="nav-title">我的档案</text>
      <view style="width:72rpx;"></view>
    </view>

    <view class="officer-card">
      <view class="avatar"><text class="avatar-text">{{ officerName.charAt(0) || '警' }}</text></view>
      <view class="officer-info">
        <text class="officer-name">{{ officerName || '警务人员' }}</text>
        <text class="officer-dept">{{ officerDept || '执勤部门' }}</text>
        <text class="officer-badge">警号：{{ badgeNo || '未填写' }}</text>
      </view>
      <view class="stats">
        <view class="stat"><text class="stat-num">{{ taskList.length }}</text><text class="stat-label">任务</text></view>
        <view class="divider"></view>
        <view class="stat"><text class="stat-num">{{ reportList.length }}</text><text class="stat-label">报告</text></view>
      </view>
    </view>

    <view class="tabs">
      <view class="tab" :class="{ active: activeTab === 'tasks' }" @click="activeTab = 'tasks'"><text>我的任务</text></view>
      <view class="tab" :class="{ active: activeTab === 'reports' }" @click="activeTab = 'reports'"><text>我的报告</text></view>
    </view>

    <scroll-view scroll-y class="scroll">
      <view v-if="activeTab === 'tasks'">
        <view v-if="taskList.length === 0" class="empty">
          <text class="empty-title">暂无任务记录</text>
        </view>
        <view v-for="task in taskList" :key="task.id" class="task-card" @click="viewTask(task)">
          <view class="task-head">
            <text class="task-title">{{ task.title }}</text>
            <text class="pill" :class="'p-' + task.status">{{ task.statusText }}</text>
          </view>
          <text class="task-meta">{{ task.location }} · {{ task.date }}</text>
          <view class="tag-row">
            <view v-for="tag in task.tags" :key="tag" class="tag"><text>{{ tag }}</text></view>
          </view>
        </view>
      </view>

      <view v-if="activeTab === 'reports'">
        <view v-if="reportList.length === 0" class="empty">
          <text class="empty-title">暂无报告记录</text>
        </view>
        <view v-for="report in reportList" :key="report.id" class="report-card" @click="viewReport(report)">
          <view class="task-head">
            <text class="task-title">{{ report.title }}</text>
            <text class="pill" :class="'p-' + report.status">{{ report.statusText }}</text>
          </view>
          <text class="task-meta">{{ report.type }} · {{ report.date }}</text>
          <text class="event-line" v-if="report.eventTitle">事件包：{{ report.eventTitle }}</text>
          <text class="task-meta">{{ report.wordCount }}</text>
        </view>
      </view>

      <view style="height:60rpx;"></view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'TaskArchive',
  data() {
    return {
      activeTab: 'tasks',
      officerName: '',
      officerDept: '',
      badgeNo: '',
      allEvents: [],
      taskList: [
        { id: 'T001', title: '东城区野生动物保护巡查', status: 'completed', statusText: '已完成', date: '2026/04/10', location: '东城区林地巡查段', tags: ['巡查', '保护'] },
        { id: 'T002', title: '候鸟迁徙带监测', status: 'ongoing', statusText: '进行中', date: '2026/04/09', location: '湿地保护区', tags: ['监测', '候鸟'] },
        { id: 'T003', title: '疑似捕猎线索复核', status: 'pending', statusText: '待处理', date: '2026/04/07', location: '山地林场', tags: ['调查', '线索'] }
      ],
      reportList: []
    }
  },
  onLoad() {
    this.loadOfficer()
    this.loadEvents()
    this.loadReports()
  },
  onShow() {
    this.loadEvents()
    this.loadReports()
  },
  methods: {
    loadOfficer() {
      try {
        const raw = uni.getStorageSync('gw_police_info')
        const info = raw ? JSON.parse(raw) : {}
        this.officerName = info.name || ''
        this.officerDept = info.department || ''
        this.badgeNo = info.badge_no || ''
      } catch (e) {}
    },
    loadEvents() {
      try {
        const raw = uni.getStorageSync('gw_event_records')
        this.allEvents = raw ? JSON.parse(raw) : []
      } catch (e) {
        this.allEvents = []
      }
    },
    loadReports() {
      try {
        const raw = uni.getStorageSync('gw_report_records')
        const list = raw ? JSON.parse(raw) : []
        this.reportList = Array.isArray(list)
          ? list.slice().sort((a, b) => this.getTimeValue(b.updatedAt || b.createdAt) - this.getTimeValue(a.updatedAt || a.createdAt)).map((item) => this.normalizeReport(item))
          : []
      } catch (e) {
        this.reportList = []
      }
    },
    normalizeReport(item) {
      const report = Object.assign({
        id: '',
        title: '',
        template: '',
        status: 'draft',
        createdAt: '',
        updatedAt: '',
        summary: '',
        content: '',
        conclusion: '',
        eventId: ''
      }, item || {})
      return {
        id: report.id,
        title: report.title || '未命名报告',
        status: report.status,
        statusText: this.reportStatusText(report.status),
        date: report.updatedAt || report.createdAt || '未知时间',
        type: this.templateText(report.template),
        wordCount: this.wordCountText(report),
        eventTitle: this.getEventTitle(report.eventId)
      }
    },
    getTimeValue(value) {
      if (!value) return 0
      const time = new Date(String(value).replace(/-/g, '/')).getTime()
      return isNaN(time) ? 0 : time
    },
    reportStatusText(status) {
      return { draft: '草稿', submitted: '已提交', approved: '已审批' }[status] || '未知'
    },
    templateText(template) {
      return {
        incident: '事件报告',
        patrol: '巡查日志',
        investigation: '调查报告',
        summary: '工作总结',
        custom: '自定义'
      }[template] || '自定义'
    },
    wordCountText(report) {
      const size = ((report.summary || '') + (report.content || '') + (report.conclusion || '')).length
      return size ? size + '字' : '未成文'
    },
    getEventTitle(eventId) {
      if (!eventId) return ''
      const found = this.allEvents.find((item) => item.id === eventId)
      return found ? (found.title || '未命名事件') : ''
    },
    goBack() {
      uni.navigateBack()
    },
    viewTask(task) {
      uni.showToast({ title: task.title, icon: 'none' })
    },
    viewReport(report) {
      uni.navigateTo({ url: '/pages/police/workplace/report-detail?id=' + report.id })
    }
  }
}
</script>

<style scoped>
.page { background: #f2f6fc; min-height: 100vh; }
.top-nav { display: flex; align-items: center; justify-content: space-between; padding: 24rpx 28rpx; background: linear-gradient(135deg, #0f2a5c, #1b4b8c); }
.back-btn { width: 72rpx; height: 72rpx; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; }
.back-text, .nav-title { color: #fff; }
.nav-title { font-size: 32rpx; font-weight: 700; }
.officer-card { background: linear-gradient(135deg, #1b4b8c, #2563eb); padding: 28rpx 28rpx 40rpx; display: flex; align-items: center; gap: 20rpx; }
.avatar { width: 100rpx; height: 100rpx; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; }
.avatar-text { font-size: 40rpx; font-weight: 700; color: #fff; }
.officer-info { flex: 1; display: flex; flex-direction: column; gap: 6rpx; }
.officer-name { font-size: 30rpx; font-weight: 700; color: #fff; }
.officer-dept { font-size: 22rpx; color: rgba(255,255,255,0.82); }
.officer-badge { font-size: 20rpx; color: rgba(255,255,255,0.65); }
.stats { display: flex; align-items: center; }
.stat { display: flex; flex-direction: column; align-items: center; padding: 0 20rpx; }
.stat-num { font-size: 36rpx; font-weight: 700; color: #fff; }
.stat-label { font-size: 19rpx; color: rgba(255,255,255,0.7); }
.divider { width: 1rpx; height: 48rpx; background: rgba(255,255,255,0.3); }
.tabs { display: flex; gap: 12rpx; padding: 20rpx 24rpx 0; margin-top: -16rpx; }
.tab { flex: 1; text-align: center; padding: 18rpx; border-radius: 12rpx; background: #fff; color: #909399; font-size: 26rpx; }
.tab.active { background: #1b4b8c; color: #fff; font-weight: 600; }
.scroll { height: calc(100vh - 410rpx); padding: 16rpx 24rpx; box-sizing: border-box; }
.task-card, .report-card { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 16rpx; box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05); }
.task-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12rpx; }
.task-title { font-size: 28rpx; font-weight: 600; color: #1a202c; flex: 1; line-height: 1.5; }
.pill { font-size: 20rpx; padding: 6rpx 16rpx; border-radius: 999rpx; }
.p-completed, .p-approved { background: rgba(16,185,129,0.1); color: #10b981; }
.p-ongoing { background: rgba(245,158,11,0.1); color: #d97706; }
.p-pending { background: rgba(239,68,68,0.1); color: #ef4444; }
.p-submitted { background: rgba(37,99,235,0.1); color: #2563eb; }
.p-draft { background: rgba(156,163,175,0.1); color: #6b7280; }
.task-meta { display: block; margin-top: 10rpx; font-size: 22rpx; color: #909399; }
.event-line { display: block; margin-top: 10rpx; font-size: 22rpx; color: #0f766e; }
.tag-row { display: flex; gap: 10rpx; flex-wrap: wrap; margin-top: 12rpx; }
.tag { padding: 6rpx 14rpx; border-radius: 8rpx; background: #f2f6fc; font-size: 20rpx; color: #606266; }
.empty { padding: 100rpx 48rpx; text-align: center; }
.empty-title { font-size: 28rpx; color: #909399; }
</style>
