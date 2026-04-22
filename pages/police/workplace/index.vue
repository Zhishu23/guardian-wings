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
          <uni-icons type="notification-filled" size="22" color="#FFFFFF" />
          <view class="nav-badge" v-if="notifCount > 0">
            <text>{{ notifCount }}</text>
          </view>
        </view>
        <view class="nav-icon-btn" @click="goSettings">
          <uni-icons type="settings" size="22" color="#FFFFFF" />
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
      <!-- 现场工具 -->
      <view class="section-card">
        <view class="section-head">
          <view class="section-line"></view>
          <text class="section-title">现场工具</text>
          <text class="section-sub">离线可用</text>
        </view>
        <view class="tool-list">
          <view class="tool-item" v-for="tool in fieldTools" :key="tool.key" @click="navigateTo(tool.url)">
            <view class="tool-icon-wrap" :style="{ background: tool.bg }">
              <text class="tool-emoji">{{ tool.emoji }}</text>
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

      <!-- 待处理草稿 -->
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

      <!-- 任务与协作 -->
      <view class="section-card">
        <view class="section-head">
          <view class="section-line"></view>
          <text class="section-title">任务与协作</text>
        </view>
        <view class="quick-grid">
          <view class="quick-item" v-for="(item, i) in quickItems" :key="i" @click="handleQuick(item.key)">
            <view class="quick-icon-wrap" :style="{ background: item.bg }">
              <text class="quick-emoji">{{ item.emoji }}</text>
            </view>
            <text class="quick-label">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <!-- 我的档案入口 -->
      <view class="archive-entry" @click="goArchive">
        <view class="archive-left">
          <view class="archive-icon">
            <text style="font-size:44rpx;line-height:1;">🗂️</text>
          </view>
          <view>
            <text class="archive-title">我的档案</text>
            <text class="archive-sub">任务记录 · 素材归档 · 文书留存</text>
          </view>
        </view>
        <uni-icons type="right" size="18" color="#909399" />
      </view>

      <view style="height: 160rpx;"></view>
    </scroll-view>

    <!-- 底部导航栏 -->
    <view class="police-tabbar">
      <view class="tabbar-item" @click="switchTab('task')">
        <view class="tabbar-icon-wrap">
          <view class="tab-badge" v-if="pendingTaskCount > 0"><text>{{ pendingTaskCount }}</text></view>
          <uni-icons type="compose" size="24" color="rgba(255,255,255,0.45)" />
        </view>
        <text class="tabbar-label">任务</text>
      </view>
      <view class="tabbar-item" @click="switchTab('expert')">
        <view class="tabbar-icon-wrap">
          <uni-icons type="chatbubble" size="24" color="rgba(255,255,255,0.45)" />
        </view>
        <text class="tabbar-label">咨询</text>
      </view>
      <view class="tabbar-item active">
        <view class="tabbar-icon-wrap">
          <uni-icons type="person" size="24" color="#60a5fa" />
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
          emoji: '➕'
        },
        {
          key: 'task-map', label: '任务地图',
          bg: 'rgba(5,150,105,0.1)', color: '#059669',
          emoji: '🗺️'
        },
        {
          key: 'bird-knowledge', label: '识鸟百科',
          bg: 'rgba(217,119,6,0.1)', color: '#D97706',
          emoji: '🦅'
        },
        {
          key: 'law-search', label: '法律速查',
          bg: 'rgba(124,58,237,0.1)', color: '#7C3AED',
          emoji: '⚖️'
        }
      ],
      fieldTools: [
        {
          key: 'event',
          name: '事件包管理', desc: '整理素材、归并事件、继续处理',
          url: '/pages/police/workplace/event-record',
          bg: 'rgba(14,116,144,0.1)', color: '#0E7490',
          emoji: '📁',
          statusText: '事件 0 个',
          secondaryText: '整理现场资料'
        },
        {
          key: 'photo',
          name: '拍照取证', desc: '现场拍摄、加水印、整理照片',
          url: '/pages/police/workplace/photo-capture',
          bg: 'rgba(37,99,235,0.1)', color: '#2563EB',
          emoji: '📷',
          statusText: '今日 0 张',
          secondaryText: '离线可用'
        },
        {
          key: 'video',
          name: '视频记录', desc: '录制现场视频，保留时序证据',
          url: '/pages/police/workplace/video-record',
          bg: 'rgba(5,150,105,0.1)', color: '#059669',
          emoji: '🎥',
          statusText: '今日 0 段',
          secondaryText: '离线可用'
        },
        {
          key: 'transcript',
          name: '笔录记录', desc: '快速记录现场情况与处置经过',
          url: '/pages/police/workplace/transcript',
          bg: 'rgba(217,119,6,0.1)', color: '#D97706',
          emoji: '📝',
          statusText: '草稿 0 份',
          secondaryText: '可继续编辑'
        },
        {
          key: 'report',
          name: '报告生成', desc: '汇总素材，生成标准化文书',
          url: '/pages/police/workplace/report-generate',
          bg: 'rgba(124,58,237,0.1)', color: '#7C3AED',
          emoji: '📋',
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
      const reports     = this.readStorageArray('gw_report_records')
      const transcripts = this.readStorageArray('gw_transcript_records')
      const videos      = this.readStorageArray('gw_video_records')
      const photos      = this.readStorageArray('gw_photo_records')
      const events      = this.readStorageArray('gw_event_records')

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
      const todayPhotos      = photos.filter((item) => this.getDateKey(item.createdAt).startsWith(today)).length
      const todayVideos      = videos.filter((item) => this.getDateKey(item.createdAt).startsWith(today)).length
      const draftTranscripts = transcripts.filter((item) => this.isDraftTranscript(item.status)).length
      const pendingReports   = reports.filter((item) => this.isPendingReport(item.status)).length
      const eventCount       = events.length

      this.fieldTools = this.fieldTools.map((tool) => {
        if (tool.key === 'photo')      return Object.assign({}, tool, { statusText: '今日 ' + todayPhotos + ' 张',      secondaryText: todayPhotos > 0      ? '已采集照片'   : '离线可用'     })
        if (tool.key === 'video')      return Object.assign({}, tool, { statusText: '今日 ' + todayVideos + ' 段',      secondaryText: todayVideos > 0      ? '现场视频记录' : '离线可用'     })
        if (tool.key === 'transcript') return Object.assign({}, tool, { statusText: '草稿 ' + draftTranscripts + ' 份', secondaryText: draftTranscripts > 0  ? '可继续编辑'   : '快速记录现场' })
        if (tool.key === 'event')      return Object.assign({}, tool, { statusText: '事件 ' + eventCount + ' 个',       secondaryText: eventCount > 0        ? '继续整理素材' : '整理现场资料' })
        if (tool.key === 'report')     return Object.assign({}, tool, { statusText: '待完善 ' + pendingReports + ' 份', secondaryText: pendingReports > 0    ? '支持草稿恢复' : '新建标准文书' })
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
        report:     '/pages/police/workplace/report-list',
        transcript: '/pages/police/workplace/transcript',
        material:   '/pages/police/workplace/unfiled-materials'
      }
      this.navigateTo(routes[type] || '/pages/police/workplace/unfiled-materials')
    },

    handleQuick(key) {
      const routes = {
        'create-task':    '/pages/police/new-case/index',
        'task-map':       '/pages/police/map/index',
        'bird-knowledge': '/pages/police/workplace/bird-query',
        'law-search':     '/pages/public/law/index'
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
        task:   '/pages/police/task-center/index',
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

.tool-list { }
.tool-item { display: flex; align-items: center; gap: 20rpx; padding: 22rpx 0; border-bottom: 1rpx solid #edf2f8; }
.tool-item:last-child { border-bottom: none; }
.tool-item:active { opacity: 0.82; }
.tool-icon-wrap { width: 80rpx; height: 80rpx; border-radius: 18rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tool-emoji { font-size: 40rpx; line-height: 1; }
.tool-body { flex: 1; min-width: 0; }
.tool-name { display: block; font-size: 28rpx; font-weight: 600; color: #0f172a; margin-bottom: 6rpx; }
.tool-desc { display: block; font-size: 22rpx; color: #64748b; line-height: 1.5; }
.tool-right { min-width: 144rpx; display: flex; flex-direction: column; align-items: flex-end; gap: 8rpx; }
.tool-count { background: rgba(37,99,235,0.08); color: #1d4ed8; font-size: 19rpx; padding: 6rpx 14rpx; border-radius: 18rpx; }
.tool-secondary { font-size: 20rpx; color: #94a3b8; }

.quick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16rpx; }
.quick-item { display: flex; flex-direction: column; align-items: center; gap: 12rpx; padding: 20rpx 0; border-radius: 16rpx; }
.quick-item:active { background: #f4f8ff; }
.quick-icon-wrap { width: 96rpx; height: 96rpx; border-radius: 24rpx; display: flex; align-items: center; justify-content: center; }
.quick-emoji { font-size: 44rpx; line-height: 1; }
.quick-label { font-size: 22rpx; color: #334155; font-weight: 500; text-align: center; }

.archive-entry { display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1rpx solid #e7edf5; border-radius: 24rpx; margin: 20rpx 24rpx 0; padding: 28rpx; box-shadow: 0 14rpx 32rpx rgba(15, 23, 42, 0.07); }
.archive-entry:active { background: #f8fbff; }
.archive-left { display: flex; align-items: center; gap: 20rpx; }
.archive-icon { width: 80rpx; height: 80rpx; border-radius: 18rpx; background: rgba(37,99,235,0.08); display: flex; align-items: center; justify-content: center; }
.archive-title { display: block; font-size: 28rpx; font-weight: 600; color: #0f172a; margin-bottom: 6rpx; }
.archive-sub { display: block; font-size: 22rpx; color: #64748b; }

.police-tabbar { position: fixed; bottom: 0; left: 0; right: 0; height: 120rpx; background: rgba(15,23,42,0.92); backdrop-filter: blur(24rpx); border-top: 1rpx solid rgba(255,255,255,0.08); display: flex; padding-bottom: env(safe-area-inset-bottom); z-index: 1000; }
.tabbar-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6rpx; }
.tabbar-icon-wrap { position: relative; width: 48rpx; height: 48rpx; display: flex; align-items: center; justify-content: center; }
.tab-badge { position: absolute; top: -8rpx; right: -14rpx; min-width: 30rpx; height: 30rpx; background: #dc2626; border-radius: 15rpx; display: flex; align-items: center; justify-content: center; padding: 0 6rpx; }
.tab-badge text { font-size: 16rpx; color: #fff; font-weight: 700; }
.tabbar-label { font-size: 20rpx; color: rgba(255,255,255,0.45); }
.tabbar-item.active .tabbar-label { color: #60a5fa; font-weight: 600; }
</style>