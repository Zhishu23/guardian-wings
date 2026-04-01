<template>
  <view class="page">
    <view class="top-nav">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </view>
      <text class="nav-title">我的档案</text>
      <view style="width:72rpx;"></view>
    </view>

    <!-- 警员信息条 -->
    <view class="officer-card">
      <view class="officer-avatar">
        <text class="avatar-text">{{ officerName.charAt(0) || '警' }}</text>
      </view>
      <view class="officer-info">
        <text class="officer-name">{{ officerName || '警务人员' }}</text>
        <text class="officer-dept">{{ officerDept || '执勤部门' }}</text>
        <text class="officer-badge">警号：{{ badgeNo || '——' }}</text>
      </view>
      <view class="officer-stats">
        <view class="os-item">
          <text class="os-val">{{ taskList.length }}</text>
          <text class="os-label">任务</text>
        </view>
        <view class="os-divider"></view>
        <view class="os-item">
          <text class="os-val">{{ reportList.length }}</text>
          <text class="os-label">报告</text>
        </view>
      </view>
    </view>

    <!-- Tab切换 -->
    <view class="tabs-wrap">
      <view class="tab-bg">
        <view class="tab-item" :class="{active: activeTab === 'tasks'}" @click="activeTab = 'tasks'">
          <text>我的任务</text>
          <view class="tab-count" v-if="taskList.length">{{ taskList.length }}</view>
        </view>
        <view class="tab-item" :class="{active: activeTab === 'reports'}" @click="activeTab = 'reports'">
          <text>我的报告</text>
          <view class="tab-count" v-if="reportList.length">{{ reportList.length }}</view>
        </view>
      </view>
    </view>

    <!-- 任务列表 -->
    <scroll-view scroll-y class="list-scroll" :show-scrollbar="false">
      <view v-if="activeTab === 'tasks'">
        <view v-if="taskList.length === 0" class="empty-wrap">
          <svg viewBox="0 0 24 24" fill="none" style="width:100rpx;height:100rpx;">
            <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2 6H6v-2h12v2z" fill="#DCDFE6"/>
          </svg>
          <text class="empty-text">暂无任务记录</text>
        </view>

        <view class="task-card" v-for="task in taskList" :key="task.id" @click="viewTask(task)">
          <view class="card-left">
            <view class="status-strip" :class="'strip-' + task.status"></view>
          </view>
          <view class="card-body">
            <view class="card-top">
              <text class="card-title">{{ task.title }}</text>
              <view class="status-pill" :class="'pill-' + task.status">
                <text>{{ task.statusText }}</text>
              </view>
            </view>
            <view class="card-meta-row">
              <view class="meta-chip">
                <svg viewBox="0 0 24 24" fill="none" style="width:24rpx;height:24rpx;">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#909399"/>
                </svg>
                <text>{{ task.location }}</text>
              </view>
              <view class="meta-chip">
                <svg viewBox="0 0 24 24" fill="none" style="width:24rpx;height:24rpx;">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="#909399"/>
                </svg>
                <text>{{ task.date }}</text>
              </view>
            </view>
            <view class="tag-row">
              <view class="task-tag" v-for="tag in task.tags" :key="tag">
                <text>{{ tag }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 报告列表 -->
      <view v-if="activeTab === 'reports'">
        <view v-if="reportList.length === 0" class="empty-wrap">
          <svg viewBox="0 0 24 24" fill="none" style="width:100rpx;height:100rpx;">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" fill="#DCDFE6"/>
          </svg>
          <text class="empty-text">暂无报告记录</text>
        </view>

        <view class="report-card" v-for="report in reportList" :key="report.id" @click="viewReport(report)">
          <view class="report-icon-wrap" :class="'ri-' + report.status">
            <svg viewBox="0 0 24 24" fill="none" style="width:40rpx;height:40rpx;">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM16 18H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/>
            </svg>
          </view>
          <view class="report-body">
            <view class="report-top">
              <text class="report-title">{{ report.title }}</text>
              <view class="status-pill" :class="'pill-' + report.status">
                <text>{{ report.statusText }}</text>
              </view>
            </view>
            <view class="report-meta">
              <text class="report-type-text">{{ report.type }}</text>
              <text class="report-divider">·</text>
              <text class="report-word">{{ report.wordCount }}</text>
              <text class="report-divider">·</text>
              <text class="report-date">{{ report.date }}</text>
            </view>
          </view>
        </view>
      </view>

      <view style="height: 60rpx;"></view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'tasks',
      officerName: '',
      officerDept: '',
      badgeNo: '',
      taskList: [
        {
          id: 'T001', title: '东城区野生动物保护巡逻',
          status: 'completed', statusText: '已完成',
          date: '2025/12/20', location: '东城区森林公园',
          tags: ['巡逻', '野生动物']
        },
        {
          id: 'T002', title: '候鸟迁徙路线监测任务',
          status: 'ongoing', statusText: '进行中',
          date: '2025/12/18', location: '湿地保护区',
          tags: ['监测', '候鸟']
        },
        {
          id: 'T003', title: '非法捕猎举报调查',
          status: 'pending', statusText: '待处理',
          date: '2025/12/15', location: '山区林场',
          tags: ['调查', '举报']
        }
      ],
      reportList: [
        {
          id: 'R001', title: '12月野生动物保护工作总结',
          status: 'submitted', statusText: '已提交',
          date: '2025/12/21', type: '月度总结', wordCount: '3200字'
        },
        {
          id: 'R002', title: '候鸟迁徙监测报告',
          status: 'draft', statusText: '草稿',
          date: '2025/12/19', type: '监测报告', wordCount: '1800字'
        }
      ]
    }
  },

  onLoad() {
    try {
      const raw = uni.getStorageSync('gw_police_info')
      const info = raw ? JSON.parse(raw) : {}
      this.officerName = info.name || ''
      this.officerDept = info.department || ''
      this.badgeNo     = info.badge_no || ''
    } catch (e) {}
  },

  methods: {
    goBack() { uni.navigateBack() },

    viewTask(task) {
      uni.showToast({ title: task.title, icon: 'none' })
    },

    viewReport(report) {
      uni.navigateTo({ url: `/pages/police/workplace/report-generate?id=${report.id}` })
    }
  }
}
</script>

<style scoped lang="scss">
.page { background: #F2F6FC; min-height: 100vh; }

.top-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24rpx 28rpx;
  background: linear-gradient(135deg, #0F2A5C, #1B4B8C);
  position: sticky; top: 0; z-index: 100;
}
.back-btn {
  width: 72rpx; height: 72rpx; border-radius: 50%;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
}
.back-btn svg { width: 40rpx; height: 40rpx; }
.nav-title { font-size: 32rpx; font-weight: bold; color: #FFFFFF; }

/* 警员信息卡 */
.officer-card {
  background: linear-gradient(135deg, #1B4B8C, #2563EB);
  padding: 28rpx 28rpx 40rpx;
  display: flex; align-items: center; gap: 20rpx;
}
.officer-avatar {
  width: 100rpx; height: 100rpx; border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: 3rpx solid rgba(255,255,255,0.4);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.avatar-text { font-size: 40rpx; font-weight: bold; color: #FFFFFF; }
.officer-info { flex: 1; display: flex; flex-direction: column; gap: 6rpx; }
.officer-name { font-size: 30rpx; font-weight: bold; color: #FFFFFF; }
.officer-dept { font-size: 22rpx; color: rgba(255,255,255,0.8); }
.officer-badge { font-size: 20rpx; color: rgba(255,255,255,0.6); }
.officer-stats { display: flex; align-items: center; gap: 0; }
.os-item { display: flex; flex-direction: column; align-items: center; padding: 0 20rpx; }
.os-val { font-size: 36rpx; font-weight: bold; color: #FFFFFF; }
.os-label { font-size: 19rpx; color: rgba(255,255,255,0.7); }
.os-divider { width: 1rpx; height: 48rpx; background: rgba(255,255,255,0.3); }

/* Tab */
.tabs-wrap {
  background: #F2F6FC; padding: 20rpx 24rpx 0; margin-top: -16rpx;
}
.tab-bg {
  display: flex; background: #FFFFFF; border-radius: 14rpx;
  padding: 6rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.tab-item {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 10rpx;
  padding: 18rpx; border-radius: 10rpx;
  font-size: 26rpx; color: #909399;
  transition: all 0.2s;
}
.tab-item.active { background: #1B4B8C; color: #FFFFFF; font-weight: 600; }
.tab-count {
  min-width: 36rpx; height: 36rpx; border-radius: 18rpx;
  background: rgba(255,255,255,0.25);
  display: flex; align-items: center; justify-content: center; padding: 0 8rpx;
  font-size: 19rpx; color: inherit;
}
.tab-item:not(.active) .tab-count { background: #F2F6FC; color: #909399; }

/* 列表滚动区 */
.list-scroll { height: calc(100vh - 420rpx); padding: 16rpx 24rpx; }

/* 任务卡片 */
.task-card {
  display: flex; background: #FFFFFF; border-radius: 16rpx;
  margin-bottom: 16rpx; overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}
.task-card:active { opacity: 0.85; }
.card-left { width: 8rpx; flex-shrink: 0; }
.strip-completed { background: #10B981; }
.strip-ongoing   { background: #F59E0B; }
.strip-pending   { background: #EF4444; }

.card-body { flex: 1; padding: 24rpx 24rpx 24rpx 20rpx; }
.card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14rpx; gap: 12rpx; }
.card-title { font-size: 28rpx; font-weight: 600; color: #1A202C; flex: 1; line-height: 1.4; }

.status-pill { font-size: 20rpx; padding: 6rpx 18rpx; border-radius: 20rpx; flex-shrink: 0; }
.pill-completed { background: rgba(16,185,129,0.1);  color: #10B981; }
.pill-ongoing   { background: rgba(245,158,11,0.1);  color: #D97706; }
.pill-pending   { background: rgba(239,68,68,0.1);   color: #EF4444; }
.pill-submitted { background: rgba(37,99,235,0.1);   color: #2563EB; }
.pill-draft     { background: rgba(156,163,175,0.1); color: #6B7280; }
.pill-approved  { background: rgba(16,185,129,0.1);  color: #10B981; }

.card-meta-row { display: flex; align-items: center; gap: 20rpx; margin-bottom: 14rpx; }
.meta-chip { display: flex; align-items: center; gap: 6rpx; }
.meta-chip text { font-size: 22rpx; color: #909399; }

.tag-row { display: flex; flex-wrap: wrap; gap: 10rpx; }
.task-tag {
  background: #F2F6FC; border-radius: 8rpx; padding: 5rpx 16rpx;
  text { font-size: 20rpx; color: #606266; }
}

/* 报告卡片 */
.report-card {
  display: flex; align-items: center; gap: 20rpx;
  background: #FFFFFF; border-radius: 16rpx;
  padding: 24rpx; margin-bottom: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}
.report-card:active { opacity: 0.85; }
.report-icon-wrap {
  width: 80rpx; height: 80rpx; border-radius: 18rpx;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ri-draft     { background: rgba(156,163,175,0.12); color: #9CA3AF; }
.ri-submitted { background: rgba(37,99,235,0.1);   color: #2563EB; }
.ri-approved  { background: rgba(16,185,129,0.1);  color: #10B981; }

.report-body { flex: 1; }
.report-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12rpx; margin-bottom: 10rpx; }
.report-title { font-size: 27rpx; font-weight: 600; color: #1A202C; flex: 1; line-height: 1.4; }
.report-meta { display: flex; align-items: center; gap: 8rpx; }
.report-type-text, .report-word, .report-date { font-size: 22rpx; color: #909399; }
.report-divider { font-size: 20rpx; color: #DCDFE6; }

/* 空状态 */
.empty-wrap {
  display: flex; flex-direction: column; align-items: center;
  padding: 100rpx 0; gap: 20rpx;
}
.empty-text { font-size: 26rpx; color: #C0C4CC; }
</style>