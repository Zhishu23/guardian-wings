<template>
  <view class="expert-page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />

    <!-- 导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-left">
        <view class="navbar-badge">
          <svg viewBox="0 0 24 24" fill="none" style="width:40rpx;height:40rpx;">
            <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z" fill="#FFFFFF"/>
          </svg>
        </view>
        <view class="navbar-title-group">
          <text class="navbar-title">专家咨询</text>
          <text class="navbar-subtitle">选择合适的专家获取专业指导和支持</text>
        </view>
      </view>
    </view>

    <!-- 专家列表 -->
    <scroll-view
      scroll-y
      class="expert-list-section"
      :style="{ height: scrollHeight + 'px' }"
      :show-scrollbar="false"
    >
      <!-- 板块说明 -->
      <view class="list-header">
        <view class="header-left">
          <text class="list-title">选择专家顾问</text>
          <view class="encrypt-tag">
            <svg viewBox="0 0 24 24" fill="none" style="width:24rpx;height:24rpx;">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="#10B981"/>
            </svg>
            <text>端到端加密通信</text>
          </view>
        </view>
      </view>

      <!-- 分类标签 -->
      <view class="type-tabs">
        <view
          class="type-tab"
          v-for="t in expertTypes"
          :key="t.key"
          :class="{active: activeType === t.key}"
          @click="activeType = t.key"
        >
          <text>{{ t.label }}</text>
        </view>
      </view>

      <!-- 专家卡片列表 -->
      <view
        v-for="expert in filteredExperts"
        :key="expert.id"
        class="expert-card"
        @click="selectExpert(expert)"
      >
        <!-- 左侧头像 -->
        <view class="expert-avatar">
          <view class="avatar-bg" :class="'avatar-' + expert.type">
            <text class="avatar-text">{{ expert.name.charAt(0) }}</text>
          </view>
          <view class="status-dot" :class="expert.online ? 'online' : 'offline'" />
        </view>

        <!-- 右侧信息 -->
        <view class="expert-info">
          <view class="info-top">
            <view class="name-row">
              <text class="expert-name">{{ expert.name }}</text>
              <view class="type-badge" :class="'badge-' + expert.type">
                <text>{{ expert.typeLabel }}</text>
              </view>
            </view>
            <view class="rating-wrap">
              <text class="star">★</text>
              <text class="rating-val">{{ expert.rating }}</text>
            </view>
          </view>

          <text class="expert-title">{{ expert.title }}</text>

          <view class="status-row">
            <view class="online-indicator" :class="expert.online ? 'is-online' : 'is-offline'">
              <view class="indicator-dot"></view>
              <text>{{ expert.statusText }}</text>
            </view>
            <text class="expert-specialty">{{ expert.specialty }}</text>
          </view>

          <view class="expert-stats">
            <view class="stat-item">
              <text class="stat-val">{{ expert.consultations }}</text>
              <text class="stat-lab">次咨询</text>
            </view>
            <view class="stat-split"></view>
            <view class="stat-item">
              <text class="stat-val">{{ expert.avgTime }}</text>
              <text class="stat-lab">平均响应</text>
            </view>
          </view>
        </view>
      </view>

      <view style="height: 40rpx;"></view>
    </scroll-view>

    <!-- 底部导航 -->
    <view class="police-tabbar">
      <view class="tabbar-item" :class="{active: 'task' === 'task'}" @click="switchTab('task')">
        <view class="tabbar-icon-wrap">
          <view class="tab-badge" v-if="pendingCount > 0"><text>{{ pendingCount }}</text></view>
          <svg viewBox="0 0 24 24" fill="none" style="width:48rpx;height:48rpx;">
            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="currentColor"/>
          </svg>
        </view>
        <text class="tabbar-label">任务</text>
      </view>
      <view class="tabbar-item active">
        <view class="tabbar-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" style="width:48rpx;height:48rpx;">
            <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z" fill="currentColor"/>
          </svg>
        </view>
        <text class="tabbar-label">咨询</text>
      </view>
      <view class="tabbar-item" @click="switchTab('workplace')">
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
  name: 'ExpertConsultation',
  data() {
    return {
      statusBarHeight: 0,
      scrollHeight: 0,
      activeType: 'all',
      pendingCount: 0,
      expertTypes: [
        { key: 'all',    label: '全部' },
        { key: 'agent',  label: 'AI智能体' },
        { key: 'human',  label: '真实专家' }
      ],
      expertList: [
        {
          id: 'A003', type: 'agent', typeLabel: 'AI',
          name: '案情推理助手',
          title: '案情推理智能体',
          specialty: '时间线梳理 · 证据链推理',
          statusText: '随时可用',
          rating: '4.9', consultations: '∞', avgTime: '<1秒',
          online: true
        },
        {
          id: 'A001', type: 'agent', typeLabel: 'AI',
          name: '法律助手',
          title: '法律智能体',
          specialty: '野生动物保护法 · 刑事程序',
          statusText: '随时可用',
          rating: '4.9', consultations: '∞', avgTime: '<1秒',
          online: true
        },
        {
          id: 'A002', type: 'agent', typeLabel: 'AI',
          name: '生态助手',
          title: '生态智能体',
          specialty: '鸟类鉴别 · 生态分析',
          statusText: '随时可用',
          rating: '4.8', consultations: '∞', avgTime: '<1秒',
          online: true
        },
        {
          id: 'E001', type: 'human', typeLabel: '专家',
          name: '张伟',
          title: '高级刑侦顾问',
          specialty: '刑事案件分析',
          statusText: '在线',
          rating: '4.9', consultations: '1247', avgTime: '2分钟',
          online: true
        },
        {
          id: 'E002', type: 'human', typeLabel: '专家',
          name: '李娜',
          title: '法律事务专家',
          specialty: '法律程序指导',
          statusText: '在线',
          rating: '4.8', consultations: '892', avgTime: '3分钟',
          online: true
        },
        {
          id: 'E003', type: 'human', typeLabel: '专家',
          name: '王强',
          title: '技术侦查专家',
          specialty: '电子取证',
          statusText: '忙碌',
          rating: '4.7', consultations: '654', avgTime: '5分钟',
          online: false
        },
        {
          id: 'E004', type: 'human', typeLabel: '专家',
          name: '刘芳',
          title: '心理咨询专家',
          specialty: '受害者支持',
          statusText: '离线',
          rating: '4.9', consultations: '1103', avgTime: '10分钟',
          online: false
        }
      ]
    }
  },

  computed: {
    filteredExperts() {
      if (this.activeType === 'all') return this.expertList
      return this.expertList.filter(e => e.type === this.activeType)
    }
  },

  onLoad() {
    const sys = uni.getSystemInfoSync()
    this.statusBarHeight = sys.statusBarHeight
    this.scrollHeight = sys.windowHeight - sys.statusBarHeight - uni.upx2px(88) - uni.upx2px(120)
    this.loadPendingCount()
  },

  methods: {
    loadPendingCount() {
      try {
        const raw = uni.getStorageSync('gw_police_info')
        this.pendingCount = 3 
      } catch (e) {}
    },

    selectExpert(expert) {
      if (expert.type === 'agent') {
        uni.navigateTo({
          url: `/pages/police/expert/chat?expertId=${expert.id}&expertName=${encodeURIComponent(expert.name)}&isAgent=true`
        })
        return
      }
      if (!expert.online) {
        uni.showToast({ title: '该专家当前不在线', icon: 'none' })
        return
      }
      uni.navigateTo({
        url: `/pages/police/expert/chat?expertId=${expert.id}&expertName=${encodeURIComponent(expert.name)}&isAgent=false`
      })
    },

    switchTab(tab) {
      const routes = {
        task: '/pages/police/task-center/index',
        workplace: '/pages/police/workplace/index'
      }
      if (routes[tab]) uni.redirectTo({ url: routes[tab] })
    }
  }
}
</script>

<style scoped lang="scss">
.expert-page {
  min-height: 100vh;
  background: #0F172A;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.custom-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 28rpx 24rpx;
  background: linear-gradient(135deg, #0F2A5C 0%, #1B4B8C 60%, #2563EB 100%);
}
.navbar-left { display: flex; align-items: center; gap: 20rpx; }
.navbar-badge {
  width: 72rpx; height: 72rpx; border-radius: 16rpx;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
}
.navbar-title-group { display: flex; flex-direction: column; gap: 4rpx; }
.navbar-title { font-size: 34rpx; font-weight: bold; color: #FFFFFF; }
.navbar-subtitle { font-size: 21rpx; color: rgba(255,255,255,0.7); }

/* 列表区域 */
.expert-list-section {
  padding: 24rpx 24rpx 0;
  width: 100%;
  box-sizing: border-box;
}

.list-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20rpx; }
.list-title { font-size: 30rpx; font-weight: bold; color: #FFFFFF; display: block; margin-bottom: 10rpx; }
.encrypt-tag {
  display: flex; align-items: center; gap: 8rpx;
  background: rgba(16,185,129,0.12); border: 1rpx solid rgba(16,185,129,0.25);
  border-radius: 20rpx; padding: 6rpx 16rpx;
  text { font-size: 20rpx; color: #10B981; }
}

/* 类型筛选 */
.type-tabs { display: flex; gap: 12rpx; margin-bottom: 24rpx; }
.type-tab {
  padding: 12rpx 28rpx; border-radius: 30rpx;
  border: 1rpx solid rgba(255,255,255,0.15);
  font-size: 24rpx; color: rgba(255,255,255,0.5);
}
.type-tab.active {
  background: #2563EB; border-color: #2563EB;
  color: #FFFFFF; font-weight: 600;
}

/* 专家卡片 */
.expert-card {
  display: flex; gap: 20rpx;
  background: rgba(255,255,255,0.07);
  border: 1rpx solid rgba(255,255,255,0.1);
  border-radius: 20rpx; padding: 28rpx;
  margin-bottom: 18rpx;
}
.expert-card:active { background: rgba(255,255,255,0.11); transform: scale(0.99); }

.expert-avatar { position: relative; flex-shrink: 0; width: 100rpx; height: 100rpx; }
.avatar-bg {
  width: 100%; height: 100%; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 3rpx solid rgba(255,255,255,0.15);
}
.avatar-agent { background: linear-gradient(135deg, #7C3AED, #5B21B6); }
.avatar-human  { background: linear-gradient(135deg, #2563EB, #1D4ED8); }
.avatar-text { font-size: 38rpx; font-weight: bold; color: #FFFFFF; }

.status-dot {
  position: absolute; bottom: 2rpx; right: 2rpx;
  width: 22rpx; height: 22rpx; border-radius: 50%;
  border: 3rpx solid #0F172A;
}
.online  { background: #10B981; }
.offline { background: #6B7280; }

.expert-info { flex: 1; display: flex; flex-direction: column; gap: 10rpx; }
.info-top { display: flex; justify-content: space-between; align-items: center; }
.name-row { display: flex; align-items: center; gap: 12rpx; }
.expert-name { font-size: 28rpx; font-weight: 600; color: #FFFFFF; }

.type-badge { padding: 4rpx 14rpx; border-radius: 8rpx; font-size: 18rpx; }
.badge-agent { background: rgba(124,58,237,0.2); color: #A78BFA; }
.badge-human { background: rgba(37,99,235,0.2);  color: #93C5FD; }

.rating-wrap { display: flex; align-items: center; gap: 4rpx; }
.star { font-size: 22rpx; color: #F59E0B; }
.rating-val { font-size: 22rpx; color: #F59E0B; font-weight: 600; }

.expert-title { font-size: 24rpx; color: rgba(255,255,255,0.75); }

.status-row { display: flex; align-items: center; gap: 16rpx; }
.online-indicator {
  display: flex; align-items: center; gap: 8rpx;
  font-size: 21rpx;
}
.indicator-dot { width: 12rpx; height: 12rpx; border-radius: 50%; }
.is-online  { color: #10B981; .indicator-dot { background: #10B981; } }
.is-offline { color: #6B7280; .indicator-dot { background: #6B7280; } }
.expert-specialty { font-size: 21rpx; color: rgba(255,255,255,0.45); }

.expert-stats {
  display: flex; align-items: center; gap: 20rpx;
  padding-top: 14rpx; border-top: 1rpx solid rgba(255,255,255,0.08);
}
.stat-item { display: flex; flex-direction: column; gap: 2rpx; }
.stat-val { font-size: 24rpx; font-weight: 600; color: #3B82F6; }
.stat-lab { font-size: 19rpx; color: rgba(255,255,255,0.45); }
.stat-split { width: 1rpx; height: 36rpx; background: rgba(255,255,255,0.1); }

/* 底部导航 */
.police-tabbar {
  position: fixed; bottom: 0; left: 0; right: 0;
  height: 120rpx;
  background: rgba(15,23,42,0.97);
  backdrop-filter: blur(20rpx);
  border-top: 1rpx solid rgba(255,255,255,0.08);
  display: flex;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
}
.tabbar-item {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 6rpx;
}
.tabbar-icon-wrap {
  position: relative; width: 48rpx; height: 48rpx;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.4);
}
.tab-badge {
  position: absolute; top: -8rpx; right: -14rpx;
  min-width: 30rpx; height: 30rpx; background: #DC2626;
  border-radius: 15rpx; display: flex; align-items: center; justify-content: center;
  padding: 0 6rpx;
  text { font-size: 16rpx; color: #FFFFFF; font-weight: bold; }
}
.tabbar-label { font-size: 20rpx; color: rgba(255,255,255,0.4); }
.tabbar-item.active .tabbar-icon-wrap { color: #3B82F6; }
.tabbar-item.active .tabbar-label { color: #3B82F6; font-weight: 600; }
</style>
