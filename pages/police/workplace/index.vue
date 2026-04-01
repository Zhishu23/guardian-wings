<template>
  <view class="workplace-page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />

    <!-- 顶部导航 -->
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

    <!-- 数据概览条 -->
    <view class="stats-banner">
      <view class="stat-item" v-for="(s, i) in statItems" :key="i">
        <text class="stat-val">{{ s.val }}</text>
        <text class="stat-label">{{ s.label }}</text>
      </view>
    </view>

    <!-- 内容滚动区 -->
    <scroll-view
      scroll-y
      class="content-scroll"
      :style="{ height: scrollHeight + 'px' }"
      :show-scrollbar="false"
    >
      <!-- 快捷入口 -->
      <view class="section-card">
        <view class="section-head">
          <view class="section-line"></view>
          <text class="section-title">任务与协作</text>
        </view>
        <view class="quick-grid">
          <view class="quick-item" v-for="(item, i) in quickItems" :key="i" @click="handleQuick(item.key)">
            <view class="quick-icon-wrap" :style="{background: item.bg}">
              <svg :viewBox="item.viewBox" fill="none" style="width:44rpx;height:44rpx;">
                <path :d="item.path" :fill="item.color"/>
              </svg>
            </view>
            <text class="quick-label">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <!-- 现场工具 -->
      <view class="section-card">
        <view class="section-head">
          <view class="section-line"></view>
          <text class="section-title">现场工具</text>
          <text class="section-sub">离线可用</text>
        </view>
        <view class="tool-list">
          <view class="tool-item" v-for="(tool, i) in fieldTools" :key="i" @click="navigateTo(tool.url)">
            <view class="tool-icon-wrap" :style="{background: tool.bg}">
              <svg :viewBox="tool.viewBox" fill="none" style="width:40rpx;height:40rpx;">
                <path :d="tool.path" :fill="tool.color"/>
              </svg>
            </view>
            <view class="tool-body">
              <text class="tool-name">{{ tool.name }}</text>
              <text class="tool-desc">{{ tool.desc }}</text>
            </view>
            <view class="tool-right">
              <view class="tool-tag">离线</view>
              <svg viewBox="0 0 24 24" fill="none" style="width:28rpx;height:28rpx;margin-top:8rpx;">
                <path d="M9 6L15 12L9 18" stroke="#C0C4CC" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </view>
          </view>
        </view>
      </view>

      <!-- 最近报告 -->
      <view class="section-card">
        <view class="section-head">
          <view class="section-line"></view>
          <text class="section-title">最近报告</text>
          <text class="section-link" @click="viewAllReports">查看全部 ›</text>
        </view>
        <view v-if="recentReports.length > 0">
          <view class="report-item" v-for="r in recentReports" :key="r.id" @click="viewReport(r)">
            <view class="report-left">
              <view class="report-status-dot" :class="'dot-' + r.status"></view>
              <view class="report-info">
                <text class="report-title-text">{{ r.title }}</text>
                <text class="report-meta">{{ r.type }} · {{ r.time }}</text>
              </view>
            </view>
            <view class="report-badge" :class="'badge-' + r.status">
              <text>{{ getStatusText(r.status) }}</text>
            </view>
          </view>
        </view>
        <view class="empty-tip" v-else>
          <text class="empty-tip-text">暂无报告，点击"报告生成"新建</text>
        </view>
      </view>

      <!-- 我的档案入口 -->
      <view class="archive-entry" @click="goArchive">
        <view class="archive-left">
          <view class="archive-icon">
            <svg viewBox="0 0 24 24" fill="none" style="width:44rpx;height:44rpx;">
              <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2 6H6v-2h12v2z" fill="#2563EB"/>
            </svg>
          </view>
          <view>
            <text class="archive-title">我的档案</text>
            <text class="archive-sub">任务记录 · 报告存档</text>
          </view>
        </view>
        <svg viewBox="0 0 24 24" fill="none" style="width:32rpx;height:32rpx;">
          <path d="M9 6L15 12L9 18" stroke="#909399" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </view>

      <view style="height: 160rpx;"></view>
    </scroll-view>

    <!-- 底部导航 -->
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
      recentReports: [],
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
          name: '照片采集', desc: '拍摄现场照片，自动叠加水印',
          url: '/pages/police/workplace/photo-capture',
          bg: 'rgba(37,99,235,0.1)', color: '#2563EB',
          viewBox: '0 0 24 24',
          path: 'M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z'
        },
        {
          name: '事件记录', desc: '快速记录现场事件，支持视频和笔录',
          url: '/pages/police/workplace/event-record',
          bg: 'rgba(5,150,105,0.1)', color: '#059669',
          viewBox: '0 0 24 24',
          path: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z'
        },
        {
          name: '报告生成', desc: '创建标准化执法报告，多模板支持',
          url: '/pages/police/workplace/report-generate',
          bg: 'rgba(217,119,6,0.1)', color: '#D97706',
          viewBox: '0 0 24 24',
          path: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z'
        }
      ]
    }
  },

  onLoad() {
    const sys = uni.getSystemInfoSync()
    this.statusBarHeight = sys.statusBarHeight
    // 精确计算：窗口高度 - 状态栏 - 导航栏 - 数据条 - tabbar
    // 导航栏约88px，数据条约72px，tabbar约60px（upx2px换算）
    this.scrollHeight = sys.windowHeight
      - sys.statusBarHeight
      - uni.upx2px(88)
      - uni.upx2px(96)
      - uni.upx2px(120)
      + uni.upx2px(40)   
    this.loadPoliceInfo()
    this.loadDashboard()
    this.loadRecentReports()
  },

  onShow() {
    this.loadDashboard()
    this.loadRecentReports()
  },

  methods: {
    loadPoliceInfo() {
      try {
        const raw = uni.getStorageSync('gw_police_info')
        const info = raw ? JSON.parse(raw) : {}
        this.officerName = info.name || ''
        this.officerDept = info.department || ''
      } catch (e) {}
    },

    async loadDashboard() {
      try {
        const raw = uni.getStorageSync('gw_police_info')
        const police = raw ? JSON.parse(raw) : {}
        const res = await uniCloud.callFunction({
          name: 'gw-police',
          data: { action: 'getDashboard', params: { officer_id: police.officer_id || '' } }
        })
        if (res.result && res.result.code === 0) {
          const d = res.result.data
          this.statItems[0].val = String(d.myPendingTasks  || 0)
          this.statItems[1].val = String(d.myOngoingTasks  || 0)
          this.statItems[2].val = String(d.todayEvents     || 0)
          this.statItems[3].val = String(d.completedTasks  || 0)
          this.pendingTaskCount = d.myPendingTasks || 0
        }
      } catch (e) {}
    },

    loadRecentReports() {
      try {
        const raw = uni.getStorageSync('gw_report_records')
        const all = raw ? JSON.parse(raw) : []
        this.recentReports = all
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 3)
          .map(r => ({
            id: r.id,
            title: r.title || '无标题',
            type: this.getTypeLabel(r.template),
            status: r.status,
            time: r.updatedAt
          }))
      } catch (e) { this.recentReports = [] }
    },

    getTypeLabel(t) {
      return { incident: '事故报告', patrol: '巡逻日志', investigation: '调查报告', summary: '工作总结' }[t] || '报告'
    },
    getStatusText(s) {
      return { draft: '草稿', submitted: '已提交', approved: '已审批' }[s] || '未知'
    },

    handleQuick(key) {
      const routes = {
        'create-task':    '/pages/police/new-case/index',
        'task-map':       '/pages/police/map/index',
        'bird-knowledge': '/pages/police/workplace/bird-query',
        'law-search':     '/pages/public/law/index'
      }
      if (routes[key]) uni.navigateTo({ url: routes[key] })
      else uni.showToast({ title: '功能开发中', icon: 'none' })
    },

    navigateTo(url) { uni.navigateTo({ url }) },

    goNotification() { uni.navigateTo({ url: '/pages/police/workplace/messages' }) },
    goSettings()     { uni.navigateTo({ url: '/pages/police/workplace/police-settings' }) },
    goArchive()      { uni.navigateTo({ url: '/pages/police/workplace/task-archive' }) },
    viewAllReports() { uni.navigateTo({ url: '/pages/police/workplace/report-list' }) },
    viewReport(r)    { uni.navigateTo({ url: `/pages/police/workplace/report-generate?id=${r.id}` }) },

    switchTab(tab) {
      const routes = {
        task:   '/pages/police/task-center/index',
        expert: '/pages/police/expert/index'
      }
      if (routes[tab]) uni.redirectTo({ url: routes[tab] })
    }
  }
}
</script>

<style scoped lang="scss">
.workplace-page { min-height: 100vh; background: #F2F6FC; }

.custom-navbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20rpx 28rpx 20rpx;
  background: linear-gradient(135deg, #0F2A5C 0%, #1B4B8C 60%, #2563EB 100%);
}
.navbar-left { display: flex; align-items: center; gap: 20rpx; }
.officer-avatar {
  width: 80rpx; height: 80rpx; border-radius: 50%;
  background: rgba(255,255,255,0.2); border: 2rpx solid rgba(255,255,255,0.35);
  display: flex; align-items: center; justify-content: center;
}
.avatar-text { font-size: 32rpx; font-weight: bold; color: #FFFFFF; }
.officer-info { display: flex; flex-direction: column; gap: 6rpx; }
.officer-name { font-size: 30rpx; font-weight: bold; color: #FFFFFF; }
.officer-dept { display: flex; align-items: center; gap: 8rpx; }
.dept-dot { width: 12rpx; height: 12rpx; border-radius: 50%; background: #10B981; }
.dept-text { font-size: 22rpx; color: rgba(255,255,255,0.8); }

.navbar-right { display: flex; gap: 12rpx; }
.nav-icon-btn {
  width: 72rpx; height: 72rpx; background: rgba(255,255,255,0.15);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  position: relative;
}
.nav-badge {
  position: absolute; top: 8rpx; right: 8rpx;
  min-width: 28rpx; height: 28rpx; background: #EF4444;
  border-radius: 14rpx; display: flex; align-items: center; justify-content: center;
  padding: 0 6rpx; border: 2rpx solid #1B4B8C;
  text { font-size: 16rpx; color: #FFFFFF; font-weight: bold; }
}

/* 数据概览条 */
.stats-banner {
  display: flex;
  background: linear-gradient(135deg, #1B4B8C, #2563EB);
  padding: 20rpx 28rpx 28rpx;
}
.stat-item {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6rpx;
  border-right: 1rpx solid rgba(255,255,255,0.2);
}
.stat-item:last-child { border-right: none; }
.stat-val { font-size: 34rpx; font-weight: bold; color: #FFFFFF; }
.stat-label { font-size: 18rpx; color: rgba(255,255,255,0.7); }

/* 滚动区 */
.content-scroll {
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* 卡片 */
.section-card {
  background: #FFFFFF; border-radius: 20rpx;
  margin: 20rpx 24rpx 0; padding: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}
.section-head { display: flex; align-items: center; gap: 14rpx; margin-bottom: 24rpx; }
.section-line { width: 8rpx; height: 30rpx; background: linear-gradient(180deg, #1B4B8C, #2563EB); border-radius: 4rpx; }
.section-title { font-size: 30rpx; font-weight: bold; color: #1A202C; flex: 1; }
.section-sub { font-size: 22rpx; color: #10B981; }
.section-link { font-size: 24rpx; color: #2563EB; }

/* 快捷入口 */
.quick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16rpx; }
.quick-item { display: flex; flex-direction: column; align-items: center; gap: 12rpx; padding: 20rpx 0; }
.quick-item:active { opacity: 0.7; }
.quick-icon-wrap { width: 96rpx; height: 96rpx; border-radius: 24rpx; display: flex; align-items: center; justify-content: center; }
.quick-label { font-size: 22rpx; color: #4A5568; font-weight: 500; text-align: center; }

/* 现场工具 */
.tool-list { }
.tool-item {
  display: flex; align-items: center; gap: 20rpx;
  padding: 24rpx 0; border-bottom: 1rpx solid #F2F6FC;
}
.tool-item:last-child { border-bottom: none; }
.tool-item:active { opacity: 0.8; }
.tool-icon-wrap { width: 80rpx; height: 80rpx; border-radius: 18rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tool-body { flex: 1; }
.tool-name { display: block; font-size: 28rpx; font-weight: 600; color: #1A202C; margin-bottom: 6rpx; }
.tool-desc { display: block; font-size: 22rpx; color: #909399; line-height: 1.5; }
.tool-right { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; }
.tool-tag { background: rgba(16,185,129,0.1); color: #059669; font-size: 19rpx; padding: 4rpx 14rpx; border-radius: 8rpx; }

/* 最近报告 */
.report-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20rpx 0; border-bottom: 1rpx solid #F2F6FC;
}
.report-item:last-child { border-bottom: none; }
.report-item:active { opacity: 0.7; }
.report-left { display: flex; align-items: center; gap: 16rpx; flex: 1; }
.report-status-dot { width: 16rpx; height: 16rpx; border-radius: 50%; flex-shrink: 0; }
.dot-draft { background: #9CA3AF; }
.dot-submitted { background: #2563EB; }
.dot-approved { background: #10B981; }
.report-info { flex: 1; }
.report-title-text { display: block; font-size: 27rpx; font-weight: 500; color: #1A202C; margin-bottom: 6rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 420rpx; }
.report-meta { display: block; font-size: 22rpx; color: #909399; }
.report-badge { font-size: 20rpx; padding: 6rpx 18rpx; border-radius: 20rpx; flex-shrink: 0; }
.badge-draft     { background: rgba(156,163,175,0.12); color: #6B7280; }
.badge-submitted { background: rgba(37,99,235,0.1);   color: #2563EB; }
.badge-approved  { background: rgba(16,185,129,0.1);  color: #10B981; }
.empty-tip { padding: 32rpx 0; text-align: center; }
.empty-tip-text { font-size: 25rpx; color: #C0C4CC; }

/* 我的档案入口 */
.archive-entry {
  display: flex; align-items: center; justify-content: space-between;
  background: #FFFFFF; border-radius: 20rpx;
  margin: 20rpx 24rpx 0; padding: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}
.archive-entry:active { background: #F8FAFF; }
.archive-left { display: flex; align-items: center; gap: 20rpx; }
.archive-icon { width: 80rpx; height: 80rpx; border-radius: 18rpx; background: rgba(37,99,235,0.08); display: flex; align-items: center; justify-content: center; }
.archive-title { display: block; font-size: 28rpx; font-weight: 600; color: #1A202C; margin-bottom: 6rpx; }
.archive-sub { display: block; font-size: 22rpx; color: #909399; }

/* 底部导航 */
.police-tabbar {
  position: fixed; bottom: 0; left: 0; right: 0;
  height: 120rpx; background: rgba(15,23,42,0.97);
  backdrop-filter: blur(20rpx); border-top: 1rpx solid rgba(255,255,255,0.08);
  display: flex; padding-bottom: env(safe-area-inset-bottom); z-index: 1000;
}
.tabbar-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6rpx; }
.tabbar-icon-wrap { position: relative; width: 48rpx; height: 48rpx; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.4); }
.tab-badge { position: absolute; top: -8rpx; right: -14rpx; min-width: 30rpx; height: 30rpx; background: #DC2626; border-radius: 15rpx; display: flex; align-items: center; justify-content: center; padding: 0 6rpx; text { font-size: 16rpx; color: #FFFFFF; font-weight: bold; } }
.tabbar-label { font-size: 20rpx; color: rgba(255,255,255,0.4); }
.tabbar-item.active .tabbar-icon-wrap { color: #3B82F6; }
.tabbar-item.active .tabbar-label { color: #3B82F6; font-weight: 600; }
</style>