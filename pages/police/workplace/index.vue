<template>
  <view class="workplace-page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />

    <view class="custom-navbar">
      <view class="navbar-left">
        <view class="officer-avatar">
          <text class="avatar-text">{{ officerName.charAt(0) || '警' }}</text>
        </view>
        <view class="officer-info">
          <text class="officer-name">{{ officerName || '警务人员' }}</text>
          <view class="officer-dept">
            <view class="dept-dot"></view>
            <text class="dept-text">{{ officerDept || '执勤中' }}</text>
          </view>
        </view>
      </view>
      <view class="navbar-right">
        <view class="nav-icon-btn" @click="goNotification">
          <svg viewBox="0 0 24 24" fill="none" style="width:44rpx;height:44rpx;">
            <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM20 18V10C20 6.13 16.87 3 13 3H11C7.13 3 4 6.13 4 10V18L2 20V21H22V20L20 18Z" fill="#FFFFFF"/>
          </svg>
          <view class="nav-badge" v-if="notifCount > 0">
            <text>{{ notifCount }}</text>
          </view>
        </view>
        <view class="nav-icon-btn" @click="goSettings">
          <svg viewBox="0 0 24 24" fill="none" style="width:44rpx;height:44rpx;">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="#FFFFFF"/>
          </svg>
        </view>
      </view>
    </view>

    <view class="stats-banner">
      <view class="stat-item" v-for="(s, i) in statItems" :key="i">
        <text class="stat-val">{{ s.val }}</text>
        <text class="stat-label">{{ s.label }}</text>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="content-scroll"
      :style="{ height: scrollHeight + 'px' }"
      :show-scrollbar="false"
    >
      <view class="section-card">
        <view class="section-head">
          <view class="section-line"></view>
          <text class="section-title">现场工具</text>
          <text class="section-sub">离线可用</text>
        </view>
        <view class="tool-list">
          <view class="tool-item" v-for="tool in fieldTools" :key="tool.key" @click="navigateTo(tool.url)">
            <view class="tool-icon-wrap" :style="{ background: tool.bg }">
              <svg :viewBox="tool.viewBox" fill="none" style="width:40rpx;height:40rpx;">
                <path :d="tool.path" :fill="tool.color"/>
              </svg>
            </view>
            <view class="tool-body">
              <text class="tool-name">{{ tool.name }}</text>
              <text class="tool-desc">{{ tool.desc }}</text>
            </view>
            <view class="tool-right">
              <view class="tool-count">
                <text>{{ tool.statusText }}</text>
              </view>
              <text class="tool-secondary">{{ tool.secondaryText }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-head">
          <view class="section-line"></view>
          <text class="section-title">待处理草稿</text>
        </view>
        <view class="draft-grid">
          <view class="draft-card" @click="openDraftCategory('report')">
            <text class="draft-value">{{ draftSummary.report }}</text>
            <text class="draft-label">报告待完善</text>
          </view>
          <view class="draft-card" @click="openDraftCategory('transcript')">
            <text class="draft-value">{{ draftSummary.transcript }}</text>
            <text class="draft-label">笔录草稿</text>
          </view>
          <view class="draft-card" @click="openDraftCategory('material')">
            <text class="draft-value">{{ draftSummary.material }}</text>
            <text class="draft-label">未归档素材</text>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-head">
          <view class="section-line"></view>
          <text class="section-title">任务与协作</text>
        </view>
        <view class="quick-grid">
          <view class="quick-item" v-for="(item, i) in quickItems" :key="i" @click="handleQuick(item.key)">
            <view class="quick-icon-wrap" :style="{ background: item.bg }">
              <svg :viewBox="item.viewBox" fill="none" style="width:44rpx;height:44rpx;">
                <path :d="item.path" :fill="item.color"/>
              </svg>
            </view>
            <text class="quick-label">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <view class="archive-entry" @click="goArchive">
        <view class="archive-left">
          <view class="archive-icon">
            <svg viewBox="0 0 24 24" fill="none" style="width:44rpx;height:44rpx;">
              <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2 6H6v-2h12v2z" fill="#2563EB"/>
            </svg>
          </view>
          <view>
            <text class="archive-title">我的档案</text>
            <text class="archive-sub">任务记录 · 素材归档 · 文书留存</text>
          </view>
        </view>
        <svg viewBox="0 0 24 24" fill="none" style="width:32rpx;height:32rpx;">
          <path d="M9 6L15 12L9 18" stroke="#909399" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </view>

      <view style="height: 160rpx;"></view>
    </scroll-view>

    <view class="police-tabbar">
      <view class="tabbar-item" @click="switchTab('task')">
        <view class="tabbar-icon-wrap">
          <view class="tab-badge" v-if="pendingTaskCount > 0"><text>{{ pendingTaskCount }}</text></view>
          <svg viewBox="0 0 24 24" fill="none" style="width:48rpx;height:48rpx;">
            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="currentColor"/>
          </svg>
        </view>
        <text class="tabbar-label">任务</text>
      </view>
      <view class="tabbar-item" @click="switchTab('expert')">
        <view class="tabbar-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" style="width:48rpx;height:48rpx;">
            <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z" fill="currentColor"/>
          </svg>
        </view>
        <text class="tabbar-label">咨询</text>
      </view>
      <view class="tabbar-item active">
        <view class="tabbar-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" style="width:48rpx;height:48rpx;">
            <path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z" fill="currentColor"/>
          </svg>
        </view>
        <text class="tabbar-label">工作台</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PoliceWorkplace',
  data() {
    return {
      statusBarHeight: 0,
      scrollHeight: 0,
      notifCount: 3,
      pendingTaskCount: 0,
      officerName: '',
      officerDept: '',
      draftSummary: {
        report: 0,
        transcript: 0,
        material: 0
      },
      statItems: [
        { val: '0', label: '待处理任务' },
        { val: '0', label: '进行中' },
        { val: '0', label: '今日事件' },
        { val: '0', label: '已完成' }
      ],
      quickItems: [
        {
          key: 'create-task', label: '创建任务',
          bg: 'rgba(37,99,235,0.1)', color: '#2563EB',
          viewBox: '0 0 24 24',
          path: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'
        },
        {
          key: 'task-map', label: '任务地图',
          bg: 'rgba(5,150,105,0.1)', color: '#059669',
          viewBox: '0 0 24 24',
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'
        },
        {
          key: 'bird-knowledge', label: '识鸟百科',
          bg: 'rgba(217,119,6,0.1)', color: '#D97706',
          viewBox: '0 0 24 24',
          path: 'M17 8C8 10 5.9 16.17 3.82 19.9c-.08.15.06.32.22.27 4.83-1.65 7.78-5.47 9.35-8.34 1.17 1.04 2.27 2.47 2.75 4.17.06.2.31.24.43.07C18.5 13.33 19 11 17 8z'
        },
        {
          key: 'law-search', label: '法律速查',
          bg: 'rgba(124,58,237,0.1)', color: '#7C3AED',
          viewBox: '0 0 24 24',
          path: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'
        }
      ],
      fieldTools: [
        {
          key: 'event',
          name: '事件包管理', desc: '整理素材、归并事件、继续处理',
          url: '/pages/police/workplace/event-record',
          bg: 'rgba(14,116,144,0.1)', color: '#0E7490',
          viewBox: '0 0 24 24',
          path: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z',
          statusText: '事件 0 个',
          secondaryText: '整理现场资料'
        },
        {
          key: 'photo',
          name: '拍照取证', desc: '现场拍摄、加水印、整理照片',
          url: '/pages/police/workplace/photo-capture',
          bg: 'rgba(37,99,235,0.1)', color: '#2563EB',
          viewBox: '0 0 24 24',
          path: 'M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z',
          statusText: '今日 0 张',
          secondaryText: '离线可用'
        },
        {
          key: 'video',
          name: '视频记录', desc: '录制现场视频，保留时序证据',
          url: '/pages/police/workplace/video-record',
          bg: 'rgba(5,150,105,0.1)', color: '#059669',
          viewBox: '0 0 24 24',
          path: 'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z',
          statusText: '今日 0 段',
          secondaryText: '离线可用'
        },
        {
          key: 'transcript',
          name: '笔录记录', desc: '快速记录现场情况与处置经过',
          url: '/pages/police/workplace/transcript',
          bg: 'rgba(217,119,6,0.1)', color: '#D97706',
          viewBox: '0 0 24 24',
          path: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm2-6h8v2H8v-2zm0-3h8v2H8v-2zm0-3h5v2H8V8z',
          statusText: '草稿 0 份',
          secondaryText: '可继续编辑'
        },
        {
          key: 'report',
          name: '报告生成', desc: '汇总素材，生成标准化文书',
          url: '/pages/police/workplace/report-generate',
          bg: 'rgba(124,58,237,0.1)', color: '#7C3AED',
          viewBox: '0 0 24 24',
          path: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z',
          statusText: '草稿 0 份',
          secondaryText: '新建标准文书'
        }
      ]
    }
  },

  onLoad() {
    const sys = uni.getSystemInfoSync()
    this.statusBarHeight = sys.statusBarHeight
    this.scrollHeight = sys.windowHeight
      - sys.statusBarHeight
      - uni.upx2px(88)
      - uni.upx2px(96)
      - uni.upx2px(120)
      + uni.upx2px(40)
    this.loadPoliceInfo()
    this.loadDashboard()
    this.loadWorkspaceLocalData()
  },

  onShow() {
    this.loadDashboard()
    this.loadWorkspaceLocalData()
  },

  methods: {
    loadPoliceInfo() {
      const info = this.readStorageObject('gw_police_info', {})
      this.officerName = info.name || ''
      this.officerDept = info.department || ''
    },

    async loadDashboard() {
      try {
        const police = this.readStorageObject('gw_police_info', {})
        const res = await uniCloud.callFunction({
          name: 'gw-police',
          data: { action: 'getDashboard', params: { officer_id: police.officer_id || '' } }
        })
        if (res.result && res.result.code === 0) {
          const d = res.result.data || {}
          this.statItems[0].val = String(d.myPendingTasks || 0)
          this.statItems[1].val = String(d.myOngoingTasks || 0)
          this.statItems[2].val = String(d.todayEvents || 0)
          this.statItems[3].val = String(d.completedTasks || 0)
          this.pendingTaskCount = d.myPendingTasks || 0
        }
      } catch (e) {}
    },

    loadWorkspaceLocalData() {
      const reports = this.readStorageArray('gw_report_records')
      const transcripts = this.readStorageArray('gw_transcript_records')
      const videos = this.readStorageArray('gw_video_records')
      const photos = this.readStorageArray('gw_photo_records')
      const events = this.readStorageArray('gw_event_records')

      this.loadDraftSummary(reports, transcripts, videos, photos, events)
      this.updateToolStatus(reports, transcripts, videos, photos, events)
    },

    loadDraftSummary(reports, transcripts, videos, photos, events) {
      this.draftSummary = {
        report: reports.filter((item) => this.isPendingReport(item.status)).length,
        transcript: transcripts.filter((item) => this.isDraftTranscript(item.status)).length,
        material: videos.filter((item) => !item.eventId && item.status !== 'discarded').length
          + photos.filter((item) => !item.eventId && item.status !== 'discarded').length
          + transcripts.filter((item) => !item.eventId).length
      }
    },

    updateToolStatus(reports, transcripts, videos, photos, events) {
      const today = this.getTodayKey()
      const todayPhotos = photos.filter((item) => this.getDateKey(item.createdAt).startsWith(today)).length
      const todayVideos = videos.filter((item) => this.getDateKey(item.createdAt).startsWith(today)).length
      const draftTranscripts = transcripts.filter((item) => this.isDraftTranscript(item.status)).length
      const pendingReports = reports.filter((item) => this.isPendingReport(item.status)).length
      const eventCount = events.length

      this.fieldTools = this.fieldTools.map((tool) => {
        if (tool.key === 'photo') return Object.assign({}, tool, { statusText: '今日 ' + todayPhotos + ' 张', secondaryText: todayPhotos > 0 ? '已采集照片' : '离线可用' })
        if (tool.key === 'video') return Object.assign({}, tool, { statusText: '今日 ' + todayVideos + ' 段', secondaryText: todayVideos > 0 ? '现场视频记录' : '离线可用' })
        if (tool.key === 'transcript') return Object.assign({}, tool, { statusText: '草稿 ' + draftTranscripts + ' 份', secondaryText: draftTranscripts > 0 ? '可继续编辑' : '快速记录现场' })
        if (tool.key === 'event') return Object.assign({}, tool, { statusText: '事件 ' + eventCount + ' 个', secondaryText: eventCount > 0 ? '继续整理素材' : '整理现场资料' })
        if (tool.key === 'report') return Object.assign({}, tool, { statusText: '待完善 ' + pendingReports + ' 份', secondaryText: pendingReports > 0 ? '支持草稿恢复' : '新建标准文书' })
        return tool
      })
    },

    readStorageArray(key) {
      const raw = uni.getStorageSync(key)
      if (!raw) return []
      try {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        return []
      }
    },

    readStorageObject(key, fallback = {}) {
      const raw = uni.getStorageSync(key)
      if (!raw) return fallback
      try {
        const parsed = JSON.parse(raw)
        return parsed && typeof parsed === 'object' ? parsed : fallback
      } catch (e) {
        return fallback
      }
    },

    getTimeValue(value) {
      if (!value) return 0
      const time = new Date(String(value).replace(/\./g, '-')).getTime()
      return Number.isNaN(time) ? 0 : time
    },

    formatDateTime(value) {
      if (!value) return '刚刚'
      return String(value).replace('T', ' ').replace(/\//g, '-').substring(0, 16)
    },

    getDateKey(value) {
      if (!value) return ''
      return String(value).replace(/\//g, '-').replace('T', ' ').substring(0, 10)
    },

    getTodayKey() {
      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    },

    isPendingReport(status) {
      return !['submitted', 'approved', 'completed', 'exported'].includes(status)
    },

    isDraftTranscript(status) {
      return !status || ['draft', 'editing', 'pending'].includes(status)
    },

    isPendingEvent(status) {
      return !status || ['collecting', 'pending_sort', 'pending_report'].includes(status)
    },

    openDraftCategory(type) {
      const routes = {
        report: '/pages/police/workplace/report-list',
        transcript: '/pages/police/workplace/transcript',
        material: '/pages/police/workplace/unfiled-materials'
      }
      this.navigateTo(routes[type] || '/pages/police/workplace/unfiled-materials')
    },

    handleQuick(key) {
      const routes = {
        'create-task': '/pages/police/new-case/index',
        'task-map': '/pages/police/map/index',
        'bird-knowledge': '/pages/police/workplace/bird-query',
        'law-search': '/pages/public/law/index'
      }
      if (routes[key]) {
        uni.navigateTo({ url: routes[key] })
      } else {
        uni.showToast({ title: '功能开发中', icon: 'none' })
      }
    },

    navigateTo(url) {
      uni.navigateTo({ url })
    },

    goNotification() {
      uni.navigateTo({ url: '/pages/police/workplace/messages' })
    },

    goSettings() {
      uni.navigateTo({ url: '/pages/police/workplace/police-settings' })
    },

    goArchive() {
      uni.navigateTo({ url: '/pages/police/workplace/task-archive' })
    },

    switchTab(tab) {
      const routes = {
        task: '/pages/police/task-center/index',
        expert: '/pages/police/expert/index'
      }
      if (routes[tab]) {
        uni.redirectTo({ url: routes[tab] })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.workplace-page { min-height: 100vh; background: radial-gradient(circle at 10% -20%, #dbeafe 0%, #eef3fb 55%); }
.custom-navbar { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 28rpx 24rpx; background: linear-gradient(135deg, #0f2f6b 0%, #1d4ed8 65%, #2563eb 100%); }
.navbar-left { display: flex; align-items: center; gap: 20rpx; }
.officer-avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: rgba(255,255,255,0.2); border: 2rpx solid rgba(255,255,255,0.42); display: flex; align-items: center; justify-content: center; }
.avatar-text { font-size: 32rpx; font-weight: 700; color: #fff; }
.officer-info { display: flex; flex-direction: column; gap: 6rpx; }
.officer-name { font-size: 30rpx; font-weight: 700; color: #fff; line-height: 1.3; }
.officer-dept { display: flex; align-items: center; gap: 8rpx; }
.dept-dot { width: 12rpx; height: 12rpx; border-radius: 50%; background: #22c55e; }
.dept-text { font-size: 22rpx; color: rgba(255,255,255,0.82); }
.navbar-right { display: flex; gap: 12rpx; }
.nav-icon-btn { width: 72rpx; height: 72rpx; background: rgba(255,255,255,0.16); border: 1rpx solid rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; }
.nav-badge { position: absolute; top: 8rpx; right: 8rpx; min-width: 28rpx; height: 28rpx; background: #ef4444; border-radius: 14rpx; display: flex; align-items: center; justify-content: center; padding: 0 6rpx; border: 2rpx solid #1d4ed8; }
.nav-badge text { font-size: 16rpx; color: #fff; font-weight: 700; }

.stats-banner { display: flex; margin: 0 24rpx; padding: 20rpx 8rpx 28rpx; background: linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.07)); border: 1rpx solid rgba(255,255,255,0.14); border-radius: 0 0 24rpx 24rpx; }
.stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6rpx; border-right: 1rpx solid rgba(255,255,255,0.18); }
.stat-item:last-child { border-right: none; }
.stat-val { font-size: 36rpx; font-weight: 700; color: #0f172a; }
.stat-label { font-size: 19rpx; color: rgba(15,23,42,0.74); }
.content-scroll { width: 100%; box-sizing: border-box; overflow-x: hidden; }

.section-card { background: #fff; border: 1rpx solid #e7edf5; border-radius: 24rpx; margin: 20rpx 24rpx 0; padding: 30rpx 28rpx; box-shadow: 0 14rpx 32rpx rgba(15, 23, 42, 0.07); }
.section-head { display: flex; align-items: center; gap: 14rpx; margin-bottom: 24rpx; }
.section-line { width: 8rpx; height: 32rpx; background: linear-gradient(180deg, #2563eb, #1d4ed8); border-radius: 4rpx; }
.section-title { font-size: 30rpx; font-weight: 700; color: #0f172a; flex: 1; }
.section-sub { font-size: 22rpx; color: #0ea5a3; }
.draft-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16rpx; }
.draft-card { background: linear-gradient(180deg, #f8fbff 0%, #f2f7ff 100%); border: 1rpx solid #e4ecf9; border-radius: 18rpx; padding: 24rpx 12rpx; text-align: center; }
.draft-value { display: block; font-size: 36rpx; font-weight: 700; color: #1e40af; margin-bottom: 8rpx; }
.draft-label { display: block; font-size: 22rpx; line-height: 1.5; color: #475569; }

.tool-item { display: flex; align-items: center; gap: 20rpx; padding: 22rpx 0; border-bottom: 1rpx solid #edf2f8; }
.tool-item:last-child { border-bottom: none; }
.tool-body { flex: 1; min-width: 0; }

.quick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16rpx; }
.quick-item { display: flex; flex-direction: column; align-items: center; gap: 12rpx; padding: 20rpx 0; border-radius: 16rpx; }
.quick-item:active { background: #f4f8ff; }
.quick-icon-wrap { width: 96rpx; height: 96rpx; border-radius: 24rpx; display: flex; align-items: center; justify-content: center; }
.quick-label { font-size: 22rpx; color: #334155; font-weight: 500; text-align: center; }

.tool-item:active { opacity: 0.82; }
.tool-icon-wrap { width: 80rpx; height: 80rpx; border-radius: 18rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tool-name { display: block; font-size: 28rpx; font-weight: 600; color: #0f172a; margin-bottom: 6rpx; }
.tool-desc { display: block; font-size: 22rpx; color: #64748b; line-height: 1.5; }
.tool-right { min-width: 144rpx; display: flex; flex-direction: column; align-items: flex-end; gap: 8rpx; }
.tool-count { background: rgba(37,99,235,0.08); color: #1d4ed8; font-size: 19rpx; padding: 6rpx 14rpx; border-radius: 18rpx; }
.tool-secondary { font-size: 20rpx; color: #94a3b8; }
.archive-entry { display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1rpx solid #e7edf5; border-radius: 24rpx; margin: 20rpx 24rpx 0; padding: 28rpx; box-shadow: 0 14rpx 32rpx rgba(15, 23, 42, 0.07); }
.archive-entry:active { background: #f8fbff; }
.archive-left { display: flex; align-items: center; gap: 20rpx; }
.archive-icon { width: 80rpx; height: 80rpx; border-radius: 18rpx; background: rgba(37,99,235,0.08); display: flex; align-items: center; justify-content: center; }
.archive-title { display: block; font-size: 28rpx; font-weight: 600; color: #0f172a; margin-bottom: 6rpx; }
.archive-sub { display: block; font-size: 22rpx; color: #64748b; }

.police-tabbar { position: fixed; bottom: 0; left: 0; right: 0; height: 120rpx; background: rgba(15,23,42,0.92); backdrop-filter: blur(24rpx); border-top: 1rpx solid rgba(255,255,255,0.08); display: flex; padding-bottom: env(safe-area-inset-bottom); z-index: 1000; }
.tabbar-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6rpx; }
.tabbar-icon-wrap { position: relative; width: 48rpx; height: 48rpx; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.45); }
.tab-badge { position: absolute; top: -8rpx; right: -14rpx; min-width: 30rpx; height: 30rpx; background: #dc2626; border-radius: 15rpx; display: flex; align-items: center; justify-content: center; padding: 0 6rpx; }
.tab-badge text { font-size: 16rpx; color: #fff; font-weight: 700; }
.tabbar-label { font-size: 20rpx; color: rgba(255,255,255,0.45); }
.tabbar-item.active .tabbar-icon-wrap, .tabbar-item.active .tabbar-label { color: #60a5fa; font-weight: 600; }
</style>
