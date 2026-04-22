<template>
  <view class="task-center-page">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />

    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-left">
        <view class="navbar-badge">
          <text style="font-size:36rpx;line-height:1;">🛡️</text>
        </view>
        <view class="navbar-title-group">
          <text class="navbar-title">任务中心</text>
          <text class="navbar-subtitle">实时任务分配和警报管理，确保高效的警务协调和快速响应</text>
        </view>
      </view>
      <view class="navbar-actions">
        <view class="action-icon" @click="showFilter">
          <uni-icons type="bars" size="20" color="#2D3748" />
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content-container">
      <!-- 实时预警轮播 -->
      <view class="warning-board" v-if="warningList.length > 0">
        <view class="board-header">
          <view class="header-icon pulse-animation">
            <text style="font-size:36rpx;line-height:1;">🚨</text>
          </view>
          <text class="header-title">实时警报</text>
          <view class="header-badge">
            <text>{{ warningList.length }}</text>
          </view>
          <view class="header-pagination">
            <text>{{ currentWarningIndex + 1 }} / {{ warningList.length }}</text>
          </view>
        </view>
        
        <swiper 
          class="warning-swiper"
          :vertical="true"
          :circular="true"
          :autoplay="true"
          :interval="4000"
          :duration="500"
          @change="onWarningChange"
        >
          <swiper-item v-for="warning in warningList" :key="warning.id">
            <view 
              class="warning-item"
              :class="'level-' + warning.level"
              @click="viewWarning(warning)"
            >
              <view class="warning-main">
                <view class="warning-icon-wrapper">
                  <text style="font-size:32rpx;line-height:1;">⚠️</text>
                </view>
                <view class="warning-content">
                  <view class="warning-title-row">
                    <text class="warning-title">{{ warning.title }}</text>
                    <text class="warning-time">{{ warning.time }}</text>
                  </view>
                  <text class="warning-desc">{{ warning.content }}</text>
                  <view class="warning-expire">
                    <uni-icons type="clock" size="14" color="#718096" />
                    <text>有效期: {{ warning.expireTime || '2025-12-22 11:58:00' }}</text>
                  </view>
                </view>
              </view>
              <button class="warning-btn" @click.stop="confirmWarning(warning)">
                确认警报
              </button>
            </view>
          </swiper-item>
        </swiper>
      </view>

      <!-- 任务筛选Tab -->
      <view class="task-tabs">
        <view class="tabs-header">
          <text class="tabs-title">任务筛选</text>
          <text class="tabs-total">共{{ taskList.length }}个任务</text>
        </view>
        <scroll-view scroll-x class="tabs-scroll">
          <view class="tabs-wrapper">
            <view 
              v-for="tab in tabs" 
              :key="tab.value"
              class="tab-item"
              :class="{ 'active': activeTab === tab.value }"
              @click="switchTab(tab.value)"
            >
              <view class="tab-inner">
                <text class="tab-text">{{ tab.label }}</text>
                <view class="tab-count" v-if="tab.count > 0">{{ tab.count }}</view>
              </view>
            </view>
          </view>
        </scroll-view>
        <view class="tab-indicator" :style="indicatorStyle" />
      </view>

      <!-- 任务列表 -->
      <view class="task-list-section">
        <!-- 骨架屏 -->
        <view v-if="loading && taskList.length === 0" class="skeleton-list">
          <view v-for="i in 3" :key="i" class="skeleton-item">
            <view class="skeleton-row">
              <view class="skeleton-badge" />
              <view class="skeleton-text skeleton-title" />
            </view>
            <view class="skeleton-text skeleton-desc" />
            <view class="skeleton-row">
              <view class="skeleton-text skeleton-small" />
              <view class="skeleton-text skeleton-small" />
            </view>
          </view>
        </view>

        <!-- 任务卡片 -->
        <view 
          v-for="(task, index) in filteredTasks" 
          :key="task.id"
          class="task-card-wrapper"
          :style="getTaskCardStyle(index)"
        >
          <view 
            class="task-card"
            :class="['priority-' + task.priority, 'status-' + task.status]"
            @click="viewTaskDetail(task)"
          >
            <!-- 优先级角标 -->
            <view class="priority-corner" :class="'priority-' + task.priority">
              <text>{{ getPriorityLabel(task.priority) }}</text>
            </view>
            
            <view class="task-header">
              <view class="task-meta">
                <view class="task-badge" :class="'badge-' + task.status">
                  <text>{{ getStatusLabel(task.status) }}</text>
                </view>
                <view class="task-time">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="14" height="14">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="#718096" stroke-width="2"/>
                    <path d="M12 6v6l4 2" stroke="#718096" stroke-width="2"/>
                  </svg>
                  <text>截止: {{ task.time }}</text>
                </view>
              </view>
              <text class="task-title">{{ task.title }}</text>
            </view>

            <text class="task-desc">{{ task.description }}</text>

            <view class="task-info-grid">
              <view class="info-item">
                <uni-icons type="location" size="16" color="#4A5568" />
                <text class="info-text">{{ task.location }}</text>
              </view>
              <view class="info-item">
                <uni-icons type="person" size="16" color="#4A5568" />
                <text class="info-text">负责人: {{ task.reporter }}</text>
              </view>
            </view>

            <view class="task-footer">
              <button 
                class="action-btn"
                :class="task.status === 'pending' ? 'btn-primary' : 'btn-secondary'"
                @click.stop="handleTaskAction(task)"
              >
                {{ task.status === 'pending' ? '开始任务' : '查看详情' }}
              </button>
              <view class="task-actions">
                <view class="action-icon-small" @click.stop="showTaskOptions(task)">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                    <circle cx="5" cy="12" r="2" fill="#4A5568"/>
                    <circle cx="12" cy="12" r="2" fill="#4A5568"/>
                    <circle cx="19" cy="12" r="2" fill="#4A5568"/>
                  </svg>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="!loading && filteredTasks.length === 0" class="empty-state">
          <svg class="empty-icon" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="50" fill="#EDF2F7"/>
            <path d="M40 50h40M40 65h30M40 80h25" stroke="#A0AEC0" stroke-width="3" stroke-linecap="round"/>
            <path d="M75 35l-30 30" stroke="#E53E3E" stroke-width="2" stroke-linecap="round"/>
            <path d="M45 35l30 30" stroke="#E53E3E" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <text class="empty-text">暂无{{ getActiveTabLabel() }}任务</text>
          <text class="empty-hint">所有任务都已处理完成</text>
          <button class="empty-btn" @click="createNewCase">
            创建新任务
          </button>
        </view>

        <!-- 加载更多 -->
        <view v-if="loading && taskList.length > 0" class="loading-more">
          <view class="loading-spinner" />
          <text>加载中...</text>
        </view>

        <!-- 底部安全距离 -->
        <view class="bottom-safe-area" />
      </view>
    </view>
    <!-- 底部导航栏 -->
    <view class="police-tabbar">
      <view 
        v-for="item in policeTabBar" 
        :key="item.value"
        class="tabbar-item"
        :class="{ 'active': currentTab === item.value }"
        @click="switchMainTab(item.value)"
      >
        <view class="tabbar-icon-wrapper">
          <view class="icon-badge" v-if="item.badge">
            <text>{{ item.badge }}</text>
          </view>
          <view class="tabbar-icon" v-html="item.icon" />
        </view>
        <text class="tabbar-label">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import taskState, { taskActions } from '@/store/taskState.js'

export default {
  name: 'PoliceTaskCenter',
  
  data() {
    return {
      statusBarHeight: 0,
      taskState,
      currentWarningIndex: 0,
      
      tabs: [
        { label: '全部任务', value: 'all', count: 0 },
        { label: '待处理', value: 'pending', count: 0 },
        { label: '进行中', value: 'processing', count: 0 },
        { label: '今日完成', value: 'completed', count: 0 }
      ],
      
      policeTabBar: [
        { 
          label: '任务', 
          value: 'task',
          badge: 3,
          icon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="currentColor"/></svg>`
        },
        { 
          label: '咨询', 
          value: 'expert',
          icon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z" fill="currentColor"/></svg>`
        },
        { 
          label: '工作台', 
          value: 'workplace',
          icon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>`
        }
      ],
      currentTab: 'task'
    }
  },
  
  computed: {
    activeTab() {
      return this.taskState.activeTab
    },
    
    taskList() {
      return this.taskState.taskList
    },
    
    warningList() {
      return this.taskState.warningList
    },
    
    loading() {
      return this.taskState.loading
    },
    
    pullDownRefresh() {
      return this.taskState.pullDownRefresh
    },
    
    statisticsData() {
      const stats = this.taskState.statistics
      return [
        { key: 'pending', label: '待处理任务', value: stats.pending || 1, trend: 12 },
        { key: 'processing', label: '进行中任务', value: stats.processing || 3, trend: -5 },
        { key: 'completed', label: '今日完成', value: stats.completed || 0, trend: 8 },
        { key: 'highPriority', label: '团队绩效', value: 92, trend: 2 }
      ]
    },
    
    filteredTasks() {
      if (this.activeTab === 'all') {
        return this.taskList
      }
      return this.taskList.filter(task => task.status === this.activeTab)
    },
    
    indicatorStyle() {
      const index = this.tabs.findIndex(tab => tab.value === this.activeTab)
      const tabWidth = 100 / this.tabs.length
      return {
        left: `${index * tabWidth}%`,
        width: `${tabWidth}%`
      }
    }
  },
  
  watch: {
    taskList: {
      handler() {
        this.updateTabCounts()
      },
      deep: true,
      immediate: true
    }
  },
  
  onLoad() {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    this.initData()
  },
  
  methods: {
    async initData() {
      await taskActions.initTasks()
    },
    
    async onRefresh() {
      await taskActions.refreshTasks()
	  uni.stopPullDownRefresh(); 
    },
    
    async onLoadMore() {
      await taskActions.loadMoreTasks()
    },
    
    switchTab(tab) {
      taskActions.switchTab(tab)
    },
    
    filterByStatus(status) {
      const map = {
        pending: 'pending',
        processing: 'processing',
        completed: 'completed',
        highPriority: 'all'
      }
      this.switchTab(map[status] || 'all')
    },
    
    updateTabCounts() {
      const stats = this.taskState.statistics
      this.tabs[0].count = stats.total
      this.tabs[1].count = stats.pending
      this.tabs[2].count = stats.processing
      this.tabs[3].count = stats.completed
    },
    
    getCardStyle(index) {
      return {
        animationDelay: `${index * 100}ms`
      }
    },
    
    getTaskCardStyle(index) {
      return {
        animationDelay: `${index * 80}ms`
      }
    },
    
    getPriorityLabel(priority) {
      const map = {
        high: '紧急',
        medium: '重要',
        low: '一般'
      }
      return map[priority] || '一般'
    },
    
    getStatusLabel(status) {
      const map = {
        pending: '待处理',
        processing: '进行中',
        completed: '已完成'
      }
      return map[status] || '未知'
    },
    
    getActiveTabLabel() {
      const tab = this.tabs.find(t => t.value === this.activeTab)
      return tab ? tab.label : ''
    },
    
    onWarningChange(e) {
      this.currentWarningIndex = e.detail.current
    },
    
    viewWarning(warning) {
      uni.showModal({
        title: warning.title,
        content: warning.content,
        confirmText: '确认警报',
        cancelText: '稍后处理',
        success: (res) => {
          if (res.confirm) {
            this.confirmWarning(warning)
          }
        }
      })
    },
    
    confirmWarning(warning) {
      uni.showToast({
        title: '警报已确认',
        icon: 'success'
      })
    },
    
    viewTaskDetail(task) {
    
      uni.showModal({
        title: task.title,
        content: `状态：${this.getStatusLabel(task.status)}\n优先级：${this.getPriorityLabel(task.priority)}\n地点：${task.location}\n负责人：${task.reporter}\n截止：${task.time}\n\n${task.description}`,
        confirmText: task.status === 'pending' ? '开始任务' : '关闭',
        cancelText: '关闭',
        showCancel: task.status === 'pending',
        success: (res) => {
          if (res.confirm && task.status === 'pending') {
            taskActions.updateTaskStatus(task.id, 'processing')
            uni.showToast({ title: '任务已开始', icon: 'success' })
          }
        }
      })
    },
    
    handleTaskAction(task) {
      if (task.status === 'pending') {
        uni.showModal({
          title: '确认开始任务',
          content: `确认接受"${task.title}"任务吗？`,
          success: (res) => {
            if (res.confirm) {
              taskActions.updateTaskStatus(task.id, 'processing')
              uni.showToast({ title: '任务已开始', icon: 'success' })
            }
          }
        })
      } else {
        this.viewTaskDetail(task)
      }
    },
    
    createNewCase() {
      uni.navigateTo({
        url: '/pages/police/new-case/index'
      })
    },
    
    showFilter() {
      uni.showActionSheet({
        itemList: ['按优先级排序', '按时间排序', '按距离排序'],
        success: (res) => {
          console.log('选择了第' + (res.tapIndex + 1) + '个按钮')
        }
      })
    },
    
    showTaskOptions(task) {
      uni.showActionSheet({
        itemList: ['任务详情', '联系负责人', '延期申请', '任务转移'],
        success: (res) => {
          const actions = {
            0: () => this.viewTaskDetail(task),
            1: () => this.contactReporter(task),
            2: () => this.applyDelay(task),
            3: () => this.transferTask(task)
          }
          if (actions[res.tapIndex]) {
            actions[res.tapIndex]()
          }
        }
      })
    },
    
    contactReporter(task) {
      uni.makePhoneCall({
        phoneNumber: '13800138000' // 示例号码
      })
    },
    
    applyDelay(task) {
      uni.showToast({
        title: '延期申请已提交',
        icon: 'success'
      })
    },
    
    transferTask(task) {
      uni.showToast({
        title: '任务转移功能开发中',
        icon: 'none'
      })
    },
    
    switchMainTab(tab) {
      if (tab === this.currentTab) return
      
      this.currentTab = tab
      
      const routes = {
        task: '/pages/police/task-center/index',
        expert: '/pages/police/expert/index',
        workplace: '/pages/police/workplace/index'
      }
      
      if (routes[tab]) {
        uni.redirectTo({
          url: routes[tab]
        })
      }
    }
  },
    // 下拉刷新生命周期
    onPullDownRefresh() {
      this.onRefresh();          // 调用原有的刷新方法
      uni.stopPullDownRefresh(); // 停止下拉刷新动画
    },
  
    // 上拉加载更多生命周期
    onReachBottom() {
      this.onLoadMore(); // 调用原有的加载更多方法
    }
}
</script>

<style scoped>
/* 页面基础样式 */
.task-center-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%);
  padding-bottom: 120rpx;
  overflow-y: auto;               /* 允许页面垂直滚动 */
  -webkit-overflow-scrolling: touch; /* 流畅滚动 */
}

/* 自定义导航栏 */
.custom-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 32rpx;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.navbar-badge {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #EBF8FF;
  border-radius: 16rpx;
  border: 2rpx solid #BEE3F8;
}

.navbar-badge svg {
  width: 32rpx;
  height: 32rpx;
}

.navbar-title-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.navbar-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #2D3748;
  letter-spacing: 0.5rpx;
}

.navbar-subtitle {
  font-size: 24rpx;
  color: #718096;
  line-height: 1.4;
}

.navbar-actions {
  display: flex;
  align-items: center;
}

.action-icon {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F7FAFC;
  border-radius: 50%;
  border: 1px solid #E2E8F0;
  transition: all 0.3s;
}

.action-icon:active {
  background: #EDF2F7;
  transform: scale(0.95);
}

.action-icon svg {
  width: 28rpx;
  height: 28rpx;
}

/* 内容容器 */
.content-container {
  flex: 1;  
}

/* 预警看板 */
.warning-board {
  margin: 16rpx 24rpx 24rpx;
  background: linear-gradient(135deg, #FFF5F5 0%, #FED7D7 100%);
  border-radius: 24rpx;
  overflow: hidden;
  border: 2rpx solid #FEB2B2;
  box-shadow: 0 4rpx 24rpx rgba(254, 178, 178, 0.2);
}

.board-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  background: rgba(255, 255, 255, 0.8);
}

.header-icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon svg {
  width: 100%;
  height: 100%;
}

.pulse-animation {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.header-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #C53030;
  flex: 1;
}

.header-badge {
  padding: 4rpx 12rpx;
  background: #FED7D7;
  border-radius: 20rpx;
  font-size: 20rpx;
  color: #C53030;
  font-weight: 600;
}

.header-pagination {
  font-size: 20rpx;
  color: #A0AEC0;
}

.warning-swiper {
  height: 340rpx;
}

.warning-item {
  padding: 24rpx 32rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.warning-main {
  display: flex;
  gap: 20rpx;
}

.warning-icon-wrapper {
  width: 56rpx;
  height: 56rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFF5F5;
  border-radius: 12rpx;
  border: 1px solid #FED7D7;
}

.warning-icon-wrapper svg {
  width: 32rpx;
  height: 32rpx;
}

.warning-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.warning-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.warning-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #2D3748;
  line-height: 1.4;
}

.warning-time {
  font-size: 22rpx;
  color: #718096;
}

.warning-desc {
  font-size: 26rpx;
  color: #4A5568;
  line-height: 1.5;
}

.warning-expire {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 22rpx;
  color: #718096;
}

.warning-btn {
  width: 100%;
  height: 88rpx;          
  background: #E53E3E;
  border: none;
  border-radius: 20rpx;   
  color: #FFFFFF;
  font-size: 30rpx;        
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  margin-top: 16rpx;      
  box-shadow: 0 4rpx 12rpx rgba(229, 62, 62, 0.3); 
}

.warning-btn::after {
  border: none;
}

.warning-btn:active {
  background: #C53030;
  transform: scale(0.98);
}

/* 统计看板 */
.statistics-board {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 24rpx;
}

.stat-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  border: 1px solid #E2E8F0;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.stat-card:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.stat-icon-wrapper {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
}

.stat-pending .stat-icon-wrapper {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  color: #D97706;
}

.stat-processing .stat-icon-wrapper {
  background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);
  color: #2563EB;
}

.stat-completed .stat-icon-wrapper {
  background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
  color: #059669;
}

.stat-highPriority .stat-icon-wrapper {
  background: linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%);
  color: #7C3AED;
}

.stat-icon-wrapper svg {
  width: 36rpx;
  height: 36rpx;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #718096;
  line-height: 1.3;
}

.stat-bottom {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.stat-value {
  font-size: 52rpx;
  font-weight: 700;
  color: #2D3748;
  line-height: 1;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.trend-up {
  background: #D1FAE5;
  color: #059669;
}

.trend-down {
  background: #FEE2E2;
  color: #DC2626;
}

.stat-trend svg {
  width: 20rpx;
  height: 20rpx;
}

/* Tab切换 */
.task-tabs {
  background: #FFFFFF;
  margin: 0 24rpx 24rpx;
  border-radius: 20rpx;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx 16rpx;
}

.tabs-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2D3748;
}

.tabs-total {
  font-size: 24rpx;
  color: #718096;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-wrapper {
  display: inline-flex;
  padding: 0 16rpx;
}

.tab-item {
  flex: 1;
  display: inline-flex;
}

.tab-inner {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 24rpx 32rpx;
  position: relative;
  z-index: 2;
  transition: all 0.3s;
}

.tab-item.active .tab-text {
  color: #2B6CB0;
  font-weight: 600;
}

.tab-item.active .tab-count {
  background: #2B6CB0;
  color: #FFFFFF;
}

.tab-text {
  font-size: 26rpx;
  color: #718096;
  transition: all 0.3s;
}

.tab-count {
  min-width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E2E8F0;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #718096;
  font-weight: 600;
  transition: all 0.3s;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  height: 4rpx;
  background: #2B6CB0;
  z-index: 1;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 任务列表区域 */
.task-list-section {
  padding: 0 24rpx 24rpx;
}

/* 骨架屏 */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.skeleton-item {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  border: 1px solid #E2E8F0;
}

.skeleton-row {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.skeleton-badge {
  width: 80rpx;
  height: 40rpx;
  background: #E2E8F0;
  border-radius: 8rpx;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-text {
  background: #E2E8F0;
  border-radius: 8rpx;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-title {
  flex: 1;
  height: 40rpx;
}

.skeleton-desc {
  height: 32rpx;
  width: 80%;
}

.skeleton-small {
  height: 28rpx;
  width: 30%;
}

@keyframes skeleton-loading {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 任务卡片 */
.task-card-wrapper {
  margin-bottom: 24rpx;
}

.task-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  position: relative;
  border: 1px solid #E2E8F0;
  transition: all 0.3s;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.task-card:active {
  transform: scale(0.99);
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
}

.priority-corner {
  position: absolute;
  top: 16rpx;         
  right: 16rpx;         
  padding: 6rpx 20rpx;
  border-radius: 20rpx; 
  font-size: 20rpx;
  font-weight: 600;
  z-index: 2;           
}

.priority-high.priority-corner {
  background: #FED7D7;
  color: #C53030;
}

.priority-medium.priority-corner {
  background: #FEF3C7;
  color: #D97706;
}

.priority-low.priority-corner {
  background: #D1FAE5;
  color: #059669;
}

.task-header {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 20rpx;
  padding-right: 100rpx; 
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-badge {
  display: inline-flex;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.badge-pending {
  background: #FEF3C7;
  color: #D97706;
  border: 1rpx solid #FDE68A;
}

.badge-processing {
  background: #DBEAFE;
  color: #2563EB;
  border: 1rpx solid #BFDBFE;
}

.badge-completed {
  background: #D1FAE5;
  color: #059669;
  border: 1rpx solid #A7F3D0;
}

.task-time {
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 22rpx;
  color: #718096;
}

.task-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2D3748;
  line-height: 1.4;
}

.task-desc {
  font-size: 26rpx;
  color: #4A5568;
  line-height: 1.5;
  margin-bottom: 24rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;   
  overflow: hidden;
  word-break: break-word;  
}

.task-info-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;  
}

.info-icon {
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
}

.info-text {
  font-size: 24rpx;
  color: #4A5568;
  flex: 1;
  line-height: 1.4;     
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24rpx;
  border-top: 1px solid #E2E8F0;
}

.action-btn {
  padding: 20rpx 40rpx;
  border-radius: 16rpx;
  font-size: 26rpx;
  font-weight: 600;
  border: none;
  transition: all 0.3s;
}

.action-btn::after {
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #2B6CB0 0%, #3182CE 100%);
  color: #FFFFFF;
  box-shadow: 0 4rpx 12rpx rgba(43, 108, 176, 0.3);
}

.btn-primary:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 8rpx rgba(43, 108, 176, 0.2);
}

.btn-secondary {
  background: #F7FAFC;
  color: #2D3748;
  border: 1px solid #E2E8F0;
}

.btn-secondary:active {
  background: #EDF2F7;
  transform: scale(0.95);
}

.task-actions {
  display: flex;
  align-items: center;
}

.action-icon-small {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.action-icon-small:active {
  background: #EDF2F7;
  transform: scale(0.95);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  background: #FFFFFF;
  border-radius: 24rpx;
  border: 1px dashed #E2E8F0;
  margin-top: 24rpx;
}

.empty-icon {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 32rpx;
  opacity: 0.8;
}

.empty-text {
  font-size: 30rpx;
  color: #2D3748;
  margin-bottom: 12rpx;
  font-weight: 600;
}

.empty-hint {
  font-size: 24rpx;
  color: #A0AEC0;
  margin-bottom: 32rpx;
}

.empty-btn {
  padding: 20rpx 40rpx;
  background: #2B6CB0;
  color: #FFFFFF;
  border-radius: 16rpx;
  font-size: 26rpx;
  font-weight: 600;
  border: none;
}

.empty-btn::after {
  border: none;
}

.empty-btn:active {
  background: #2C5282;
  transform: scale(0.95);
}

/* 加载更多 */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 40rpx 0;
  font-size: 24rpx;
  color: #A0AEC0;
}

.loading-spinner {
  width: 32rpx;
  height: 32rpx;
  border: 3rpx solid #E2E8F0;
  border-top-color: #2B6CB0;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.bottom-safe-area {
  height: 80rpx;
}

/* 底部导航栏 */
.police-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: #FFFFFF;
  border-top: 1px solid #E2E8F0;
  display: flex;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: all 0.3s;
  position: relative;
}

.tabbar-item:active {
  transform: scale(0.95);
}

.tabbar-icon-wrapper {
  position: relative;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-badge {
  position: absolute;
  top: -8rpx;
  right: -12rpx;
  min-width: 32rpx;
  height: 32rpx;
  background: #E53E3E;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
  font-size: 18rpx;
  color: #FFFFFF;
  font-weight: 600;
  box-shadow: 0 2rpx 8rpx rgba(229, 62, 62, 0.5);
  z-index: 1;
}

.tabbar-icon {
  width: 48rpx;
  height: 48rpx;
  color: #A0AEC0;
  transition: all 0.3s;
}

.tabbar-item.active .tabbar-icon {
  color: #2B6CB0;
  transform: scale(1.1);
}

.tabbar-label {
  font-size: 20rpx;
  color: #A0AEC0;
  transition: all 0.3s;
}

.tabbar-item.active .tabbar-label {
  color: #2B6CB0;
  font-weight: 600;
}
</style>