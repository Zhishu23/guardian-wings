<template>
  <view class="page">
    <view class="top-nav">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </view>
      <text class="nav-title">通知中心</text>
      <text class="nav-action" @click="markAllRead">全部已读</text>
    </view>

    <!-- 加密提示 -->
    <view class="security-bar">
      <svg viewBox="0 0 24 24" fill="none" style="width:28rpx;height:28rpx;flex-shrink:0;">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="#10B981"/>
      </svg>
      <text class="security-text">通知内容由平台加密下发 · 仅本人可见</text>
    </view>

    <!-- 类型筛选 -->
    <view class="filter-tabs">
      <view
        class="filter-tab"
        v-for="tab in filterTabs"
        :key="tab.key"
        :class="{active: activeFilter === tab.key}"
        @click="activeFilter = tab.key"
      >
        <text>{{ tab.label }}</text>
        <view class="filter-dot" v-if="tab.unread > 0"><text>{{ tab.unread }}</text></view>
      </view>
    </view>

    <!-- 通知列表 -->
    <scroll-view scroll-y class="notif-scroll" :show-scrollbar="false">
      <view
        class="notif-item"
        v-for="item in filteredList"
        :key="item.id"
        :class="{'unread': !item.read}"
        @click="readNotif(item)"
      >
        <view class="notif-icon-wrap" :class="'icon-' + item.type">
          <svg :viewBox="item.viewBox" fill="none" style="width:36rpx;height:36rpx;">
            <path :d="item.iconPath" fill="currentColor"/>
          </svg>
        </view>

        <view class="notif-body">
          <view class="notif-top">
            <text class="notif-title">{{ item.title }}</text>
            <text class="notif-time">{{ item.time }}</text>
          </view>
          <text class="notif-content">{{ item.content }}</text>
          <view class="notif-tags">
            <view class="notif-type-tag" :class="'tag-' + item.type">
              <text>{{ item.typeLabel }}</text>
            </view>
            <view class="notif-priority" v-if="item.priority === 'high'">
              <text>🔴 紧急</text>
            </view>
          </view>
        </view>

        <view class="unread-dot" v-if="!item.read"></view>
      </view>

      <view class="list-end" v-if="filteredList.length > 0">
        <text>— 已显示全部通知 —</text>
      </view>

      <view class="empty-wrap" v-if="filteredList.length === 0">
        <svg viewBox="0 0 24 24" fill="none" style="width:100rpx;height:100rpx;">
          <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM20 18V10C20 6.13 16.87 3 13 3H11C7.13 3 4 6.13 4 10V18L2 20V21H22V20L20 18Z" fill="#DCDFE6"/>
        </svg>
        <text class="empty-text">暂无通知</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeFilter: 'all',
      filterTabs: [
        { key: 'all',    label: '全部',   unread: 3 },
        { key: 'alert',  label: '预警',   unread: 1 },
        { key: 'task',   label: '任务',   unread: 2 },
        { key: 'system', label: '系统',   unread: 0 }
      ],
      notifList: [
        {
          id: 'N001', type: 'alert', typeLabel: '风险预警',
          title: '高风险线索预警',
          content: '平台检测到辖区内存在疑似非法捕猎活动，风险等级：红色，请及时核查处置。',
          time: '10:32', read: false, priority: 'high',
          viewBox: '0 0 24 24',
          iconPath: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'
        },
        {
          id: 'N002', type: 'task', typeLabel: '任务通知',
          title: '新任务已下发',
          content: '指挥中心已向您下发新任务：湿地保护区巡逻（3月15日上午），请查看任务详情并确认接收。',
          time: '09:15', read: false, priority: 'normal',
          viewBox: '0 0 24 24',
          iconPath: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z'
        },
        {
          id: 'N003', type: 'task', typeLabel: '任务通知',
          title: '任务状态更新',
          content: '您提交的《候鸟迁徙监测报告》已通过审核，任务状态已更新为"已完成"。',
          time: '昨天 16:40', read: false, priority: 'normal',
          viewBox: '0 0 24 24',
          iconPath: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'
        },
        {
          id: 'N004', type: 'system', typeLabel: '系统通知',
          title: '平台维护公告',
          content: '翼路平安平台将于本周六凌晨2:00-4:00进行系统维护升级，届时部分功能暂时不可用，请提前做好安排。',
          time: '昨天 09:00', read: true, priority: 'normal',
          viewBox: '0 0 24 24',
          iconPath: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z'
        },
        {
          id: 'N005', type: 'alert', typeLabel: '风险预警',
          title: '候鸟迁徙高峰预警',
          content: '气象部门预报：本周辖区将迎候鸟迁徙高峰，请加强沿线湿地巡护力度，重点防范非法捕猎活动。',
          time: '2月19日', read: true, priority: 'normal',
          viewBox: '0 0 24 24',
          iconPath: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'
        }
      ]
    }
  },

  computed: {
    filteredList() {
      if (this.activeFilter === 'all') return this.notifList
      return this.notifList.filter(n => n.type === this.activeFilter)
    }
  },

  methods: {
    goBack() { uni.navigateBack() },

    readNotif(item) {
      if (!item.read) {
        item.read = true
        this.updateFilterCounts()
      }
      // 任务类通知可跳转到任务中心
      if (item.type === 'task') {
        uni.showModal({
          title: item.title,
          content: item.content,
          confirmText: '前往任务',
          cancelText: '关闭',
          success: res => {
            if (res.confirm) uni.redirectTo({ url: '/pages/police/task-center/index' })
          }
        })
      } else {
        uni.showModal({
          title: item.title,
          content: item.content,
          showCancel: false,
          confirmText: '知道了'
        })
      }
    },

    markAllRead() {
      this.notifList.forEach(n => n.read = true)
      this.updateFilterCounts()
      uni.showToast({ title: '已全部标为已读', icon: 'success' })
    },

    updateFilterCounts() {
      const counts = { all: 0, alert: 0, task: 0, system: 0 }
      this.notifList.forEach(n => {
        if (!n.read) { counts.all++; counts[n.type]++ }
      })
      this.filterTabs.forEach(t => t.unread = counts[t.key] || 0)
    }
  }
}
</script>

<style scoped lang="scss">
.page { background: #F2F6FC;
        min-height: 100vh; 
		width: 100%;           /* 加这行 */
		overflow-x: hidden;    /* 加这行 */
	  }

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
.nav-action { font-size: 24rpx; color: rgba(255,255,255,0.8); }

.security-bar {
  display: flex; align-items: center; gap: 12rpx;
  background: rgba(16,185,129,0.06); border-bottom: 1rpx solid rgba(16,185,129,0.15);
  padding: 16rpx 28rpx;
}
.security-text { font-size: 22rpx; color: #059669; }

.filter-tabs {
  display: flex; background: #FFFFFF;
  padding: 0 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}
.filter-tab {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8rpx;
  padding: 28rpx 0; font-size: 26rpx; color: #909399;
  position: relative;
}
.filter-tab.active {
  color: #1B4B8C; font-weight: 600;
}
.filter-tab.active::after {
  content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 48rpx; height: 5rpx; background: #1B4B8C; border-radius: 3rpx;
}
.filter-dot {
  min-width: 32rpx; height: 32rpx; border-radius: 16rpx;
  background: #EF4444; padding: 0 8rpx;
  display: flex; align-items: center; justify-content: center;
  text { font-size: 16rpx; color: #FFFFFF; font-weight: bold; }
}

.notif-scroll { height: calc(100vh - 280rpx); 
                padding: 16rpx 24rpx;
				width: 100%;           /* 加这行 */
			    box-sizing: border-box; /* 加这行 */
			  }

.notif-item {
  display: flex; align-items: flex-start; gap: 20rpx;
  background: #FFFFFF; border-radius: 16rpx;
  padding: 28rpx; margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
  position: relative;
}
.notif-item.unread { border-left: 4rpx solid #1B4B8C; }
.notif-item:active { opacity: 0.85; }

.notif-icon-wrap {
  width: 72rpx; height: 72rpx; border-radius: 18rpx;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.icon-alert  { background: rgba(239,68,68,0.1);  color: #EF4444; }
.icon-task   { background: rgba(37,99,235,0.1);  color: #2563EB; }
.icon-system { background: rgba(107,114,128,0.1); color: #6B7280; }

.notif-body { flex: 1; }
.notif-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10rpx; }
.notif-title { font-size: 28rpx; font-weight: 600; color: #1A202C; flex: 1; margin-right: 16rpx; }
.notif-time { font-size: 20rpx; color: #C0C4CC; white-space: nowrap; }
.notif-content { display: block; font-size: 24rpx; color: #606266; line-height: 1.7; margin-bottom: 14rpx; }
.notif-tags { display: flex; align-items: center; gap: 12rpx; }
.notif-type-tag {
  font-size: 19rpx; padding: 4rpx 14rpx; border-radius: 8rpx;
}
.tag-alert  { background: rgba(239,68,68,0.08);  color: #EF4444; }
.tag-task   { background: rgba(37,99,235,0.08);  color: #2563EB; }
.tag-system { background: rgba(107,114,128,0.08); color: #6B7280; }
.notif-priority { font-size: 19rpx; }

.unread-dot {
  position: absolute; top: 20rpx; right: 20rpx;
  width: 16rpx; height: 16rpx; border-radius: 50%;
  background: #EF4444;
}

.list-end { text-align: center; padding: 32rpx; font-size: 22rpx; color: #C0C4CC; }

.empty-wrap {
  display: flex; flex-direction: column; align-items: center;
  padding: 120rpx 0; gap: 24rpx;
}
.empty-text { font-size: 28rpx; color: #C0C4CC; }
</style>