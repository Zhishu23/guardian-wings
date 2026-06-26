<template>
  <view class="achievement-page">
    <!-- 顶部积分卡 -->
    <view class="points-card">
      <view class="points-main">
        <text class="points-num">{{ userPoints }}</text>
        <text class="points-unit">守护积分</text>
      </view>
      <view class="points-level">
        <text class="level-name">{{ levelName }}</text>
        <view class="level-progress-bar">
          <view class="level-progress-fill" :style="{ width: levelPct + '%' }" />
        </view>
        <text class="level-next">{{ levelNextText }}</text>
      </view>
    </view>

    <!-- 积分说明 -->
    <view class="earn-section">
      <view class="section-title-row">
        <text class="section-title">如何获得积分</text>
      </view>
      <view class="earn-list">
        <view class="earn-item" v-for="item in earnRules" :key="item.action">
          <view class="earn-icon-wrap" :style="{ background: item.bg }">
            <text class="earn-icon">{{ item.icon }}</text>
          </view>
          <view class="earn-info">
            <text class="earn-action">{{ item.action }}</text>
            <text class="earn-desc">{{ item.desc }}</text>
          </view>
          <text class="earn-points">+{{ item.points }}</text>
        </view>
      </view>
    </view>

    <!-- 成就勋章 -->
    <view class="badge-section">
      <view class="section-title-row">
        <text class="section-title">成就勋章</text>
        <text class="section-sub">{{ unlockedCount }}/{{ badges.length }} 已解锁</text>
      </view>
      <view class="badge-grid">
        <view
          v-for="badge in badges"
          :key="badge.id"
          class="badge-item"
          :class="{ unlocked: badge.unlocked, locked: !badge.unlocked }"
          @click="showBadgeDetail(badge)"
        >
          <view class="badge-icon-wrap">
            <text class="badge-icon">{{ badge.icon }}</text>
            <view class="badge-lock" v-if="!badge.unlocked">
              <text>🔒</text>
            </view>
          </view>
          <text class="badge-name">{{ badge.name }}</text>
          <text class="badge-progress" v-if="!badge.unlocked">{{ badge.progressText }}</text>
        </view>
      </view>
    </view>

    <!-- 积分历史 -->
    <view class="history-section">
      <view class="section-title-row">
        <text class="section-title">积分记录</text>
      </view>
      <view class="history-list" v-if="pointsHistory.length > 0">
        <view class="history-item" v-for="item in pointsHistory" :key="item.id">
          <view class="history-left">
            <text class="history-icon">{{ item.icon }}</text>
            <view class="history-info">
              <text class="history-action">{{ item.action }}</text>
              <text class="history-time">{{ item.time }}</text>
            </view>
          </view>
          <text class="history-points" :class="item.points > 0 ? 'positive' : 'negative'">
            {{ item.points > 0 ? '+' : '' }}{{ item.points }}
          </text>
        </view>
      </view>
      <view v-else class="empty-history">
        <text class="empty-text">还没有积分记录</text>
        <text class="empty-hint">去举报违法或参加志愿活动来获得积分吧</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userPoints: 0,
      reportCount: 0,
      activityCount: 0,
      earnRules: [
        { action: '提交举报',   desc: '每次成功举报',       points: 10, icon: '📢', bg: 'rgba(239,68,68,0.1)'   },
        { action: '参加活动',   desc: '每次报名志愿活动',   points: 20, icon: '🌿', bg: 'rgba(16,185,129,0.1)'  },
        { action: '完成活动',   desc: '活动结束后确认参与', points: 30, icon: '✅', bg: 'rgba(59,130,246,0.1)'  },
        { action: '收藏鸟类',   desc: '每收藏一种新鸟类',   points: 5,  icon: '🦅', bg: 'rgba(245,158,11,0.1)'  },
        { action: '首次登录',   desc: '注册后首次登录',     points: 50, icon: '🎉', bg: 'rgba(139,92,246,0.1)'  }
      ],
      badges: [],
      pointsHistory: []
    }
  },

  computed: {
    levelName() {
      const p = this.userPoints
      if (p >= 1000) return '守护大使'
      if (p >= 500)  return '高级守护者'
      if (p >= 100)  return '守护者'
      return '初级守护者'
    },
    levelPct() {
      const p = this.userPoints
      if (p >= 1000) return 100
      if (p >= 500)  return ((p - 500) / 500) * 100
      if (p >= 100)  return ((p - 100) / 400) * 100
      return (p / 100) * 100
    },
    levelNextText() {
      const p = this.userPoints
      if (p >= 1000) return '已达最高等级 🎖️'
      if (p >= 500)  return `距守护大使还需 ${1000 - p} 积分`
      if (p >= 100)  return `距高级守护者还需 ${500 - p} 积分`
      return `距守护者还需 ${100 - p} 积分`
    },
    unlockedCount() {
      return this.badges.filter(b => b.unlocked).length
    }
  },

  onLoad() {
    this.loadData()
  },

  methods: {
    async loadData() {
      const uid = this.$store.state.user.uid
      // 从store获取积分
      this.userPoints = this.$store.state.user.points || 0

      // 获取统计数据（用于计算勋章）
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-public-user',
          data: { action: 'getUserStats', params: { uid } }
        })
        if (res.result.code === 0) {
          this.reportCount   = res.result.data.reports   || 0
          this.activityCount = res.result.data.activities || 0
        }
      } catch (e) {}

      // 同时获取最新积分
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-public-user',
          data: { action: 'getUserInfo', params: { uid } }
        })
        if (res.result.code === 0) {
          this.userPoints = res.result.data.points || 0
        }
      } catch (e) {}

      this.buildBadges()
      this.buildHistory()
    },

    buildBadges() {
      const r = this.reportCount
      const a = this.activityCount
      const p = this.userPoints

      this.badges = [
        {
          id: 'first_report',
          icon: '📢',
          name: '初次举报',
          desc: '提交第一次举报',
          unlocked: r >= 1,
          progressText: `${Math.min(r, 1)}/1`
        },
        {
          id: 'report_5',
          icon: '🔍',
          name: '执法先锋',
          desc: '累计举报5次',
          unlocked: r >= 5,
          progressText: `${Math.min(r, 5)}/5`
        },
        {
          id: 'report_20',
          icon: '🦅',
          name: '守护卫士',
          desc: '累计举报20次',
          unlocked: r >= 20,
          progressText: `${Math.min(r, 20)}/20`
        },
        {
          id: 'first_activity',
          icon: '🌱',
          name: '志愿新人',
          desc: '参加第一次志愿活动',
          unlocked: a >= 1,
          progressText: `${Math.min(a, 1)}/1`
        },
        {
          id: 'activity_5',
          icon: '🌿',
          name: '绿色使者',
          desc: '累计参加5次志愿活动',
          unlocked: a >= 5,
          progressText: `${Math.min(a, 5)}/5`
        },
        {
          id: 'points_100',
          icon: '⭐',
          name: '积分百分',
          desc: '累计获得100积分',
          unlocked: p >= 100,
          progressText: `${Math.min(p, 100)}/100`
        },
        {
          id: 'points_500',
          icon: '🌟',
          name: '积分五百',
          desc: '累计获得500积分',
          unlocked: p >= 500,
          progressText: `${Math.min(p, 500)}/500`
        },
        {
          id: 'points_1000',
          icon: '👑',
          name: '守护大使',
          desc: '累计获得1000积分',
          unlocked: p >= 1000,
          progressText: `${Math.min(p, 1000)}/1000`
        }
      ]
    },

    buildHistory() {
     
      const history = []
      if (this.reportCount > 0) {
        for (let i = 0; i < Math.min(this.reportCount, 5); i++) {
          history.push({
            id:     `r${i}`,
            icon:   '📢',
            action: '提交举报',
            points: 10,
            time:   '近期'
          })
        }
      }
      if (this.activityCount > 0) {
        for (let i = 0; i < Math.min(this.activityCount, 3); i++) {
          history.push({
            id:     `a${i}`,
            icon:   '🌿',
            action: '参加志愿活动',
            points: 20,
            time:   '近期'
          })
        }
      }
      this.pointsHistory = history
    },

    showBadgeDetail(badge) {
      uni.showModal({
        title:      badge.name,
        content:    `${badge.desc}\n状态：${badge.unlocked ? '✅ 已解锁' : `🔒 未解锁（${badge.progressText}）`}`,
        showCancel: false
      })
    }
  }
}
</script>

<style scoped lang="scss">
.achievement-page { min-height: 100vh; background: #F5F7FA; padding-bottom: 60rpx; }

.points-card {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  padding: 60rpx 40rpx 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
}
.points-main { display: flex; align-items: baseline; gap: 12rpx; }
.points-num { font-size: 96rpx; font-weight: 800; color: #FFFFFF; line-height: 1; }
.points-unit { font-size: 32rpx; color: rgba(255,255,255,0.85); }
.points-level { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 16rpx; }
.level-name { font-size: 32rpx; font-weight: 600; color: #FFFFFF; }
.level-progress-bar { width: 80%; height: 16rpx; background: rgba(255,255,255,0.3); border-radius: 8rpx; overflow: hidden; }
.level-progress-fill { height: 100%; background: #FFFFFF; border-radius: 8rpx; transition: width 0.5s; }
.level-next { font-size: 24rpx; color: rgba(255,255,255,0.85); }

.section-title-row { display: flex; justify-content: space-between; align-items: center; padding: 32rpx 24rpx 16rpx; }
.section-title { font-size: 32rpx; font-weight: 700; color: #1F2937; }
.section-sub { font-size: 24rpx; color: #9CA3AF; }

.earn-section { margin: 24rpx 24rpx 0; background: #FFFFFF; border-radius: 16rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05); }
.earn-list { padding: 0 24rpx 24rpx; }
.earn-item { display: flex; align-items: center; gap: 20rpx; padding: 20rpx 0; border-bottom: 1rpx solid #F3F4F6; &:last-child { border-bottom: none; } }
.earn-icon-wrap { width: 80rpx; height: 80rpx; border-radius: 20rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.earn-icon { font-size: 40rpx; }
.earn-info { flex: 1; }
.earn-action { display: block; font-size: 28rpx; font-weight: 500; color: #1F2937; margin-bottom: 6rpx; }
.earn-desc { font-size: 22rpx; color: #9CA3AF; }
.earn-points { font-size: 32rpx; font-weight: 700; color: #F59E0B; }

.badge-section { margin: 24rpx 24rpx 0; background: #FFFFFF; border-radius: 16rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05); }
.badge-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20rpx; padding: 0 24rpx 24rpx; }
.badge-item { display: flex; flex-direction: column; align-items: center; gap: 10rpx; padding: 16rpx 8rpx; border-radius: 12rpx; transition: all 0.2s; &:active { opacity: 0.8; } }
.badge-item.unlocked { background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); }
.badge-item.locked { background: #F9FAFB; opacity: 0.6; }
.badge-icon-wrap { position: relative; width: 96rpx; height: 96rpx; display: flex; align-items: center; justify-content: center; }
.badge-icon { font-size: 60rpx; }
.badge-lock { position: absolute; bottom: -4rpx; right: -4rpx; font-size: 28rpx; }
.badge-name { font-size: 22rpx; color: #374151; font-weight: 500; text-align: center; }
.badge-progress { font-size: 18rpx; color: #9CA3AF; text-align: center; }

.history-section { margin: 24rpx 24rpx 0; background: #FFFFFF; border-radius: 16rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05); }
.history-list { padding: 0 24rpx 24rpx; }
.history-item { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 0; border-bottom: 1rpx solid #F3F4F6; &:last-child { border-bottom: none; } }
.history-left { display: flex; align-items: center; gap: 20rpx; }
.history-icon { font-size: 40rpx; }
.history-info { display: flex; flex-direction: column; }
.history-action { font-size: 28rpx; color: #1F2937; font-weight: 500; margin-bottom: 6rpx; }
.history-time { font-size: 22rpx; color: #9CA3AF; }
.history-points { font-size: 32rpx; font-weight: 700; }
.positive { color: #10B981; }
.negative { color: #EF4444; }

.empty-history { display: flex; flex-direction: column; align-items: center; padding: 60rpx 48rpx; gap: 16rpx; }
.empty-text { font-size: 28rpx; color: #9CA3AF; }
.empty-hint { font-size: 24rpx; color: #C4C4C4; text-align: center; line-height: 1.6; }
</style>