<template>
  <view class="detail-page">
    <view v-if="loading" class="loading-box">
      <text>加载中...</text>
    </view>

    <view v-else-if="activity._id" class="content">
      <!-- 封面图 -->
      <view class="cover-wrap">
        <image
          :src="activity.coverImage || '/static/icons/volunteer-placeholder.png'"
          mode="aspectFill"
          class="cover-img"
        />
        <view class="cover-mask">
          <view class="status-tag" :class="'s-' + activity.activityStatus">
            <text>{{ getStatusLabel(activity.activityStatus) }}</text>
          </view>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="info-card">
        <text class="activity-title">{{ activity.title }}</text>
        <text class="activity-desc">{{ activity.description }}</text>

        <view class="meta-list">
          <view class="meta-item">
            <text class="meta-icon">📍</text>
            <text class="meta-text">{{ activity.location }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-icon">🕐</text>
            <text class="meta-text">开始：{{ formatTime(activity.startTime) }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-icon">🕕</text>
            <text class="meta-text">结束：{{ formatTime(activity.endTime) }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-icon">👥</text>
            <view class="meta-right">
              <text class="meta-text">已报名 {{ activity.currentParticipants }}/{{ activity.maxParticipants }}</text>
              <view class="capacity-bar">
                <view
                  class="capacity-fill"
                  :style="{
                    width: (activity.currentParticipants / activity.maxParticipants * 100) + '%',
                    background: activity.isFull ? '#EF4444' : '#10B981'
                  }"
                />
              </view>
            </view>
          </view>
          <view class="meta-item" v-if="activity.organizer">
            <text class="meta-icon">🏢</text>
            <text class="meta-text">主办方：{{ activity.organizer }}</text>
          </view>
        </view>
      </view>

      <!-- 活动要求（如有） -->
      <view class="req-card" v-if="activity.requirements">
        <text class="card-title">参与要求</text>
        <text class="card-content">{{ activity.requirements }}</text>
      </view>

      <!-- 注意事项 -->
      <view class="notice-card">
        <text class="card-title">参与须知</text>
        <view class="notice-list">
          <view class="notice-item" v-for="(n, i) in notices" :key="i">
            <text class="notice-dot">{{ i+1 }}.</text>
            <text class="notice-text">{{ n }}</text>
          </view>
        </view>
      </view>

      <!-- 底部报名/退出按钮 -->
      <view class="bottom-bar">
        <view class="bar-info">
          <text class="bar-points">报名可获得 +20 积分</text>
          <text class="bar-capacity" :class="{ full: activity.isFull }">
            {{ activity.isFull ? '名额已满' : `剩余 ${activity.maxParticipants - activity.currentParticipants} 个名额` }}
          </text>
        </view>

        <!-- 未报名 -->
        <button
          v-if="!activity.isJoined && activity.activityStatus !== 'ended'"
          class="action-btn enroll"
          :class="{ disabled: activity.isFull }"
          :disabled="activity.isFull"
          @click="enroll"
        >
          <text>{{ activity.isFull ? '名额已满' : '立即报名' }}</text>
        </button>

        <!-- 已报名 -->
        <view v-else-if="activity.isJoined" class="joined-actions">
          <view class="joined-badge">
            <text>✅ 已报名</text>
          </view>
          <button
            v-if="activity.activityStatus === 'upcoming'"
            class="action-btn quit"
            @click="quit"
          >
            <text>退出活动</text>
          </button>
        </view>

        <!-- 已结束 -->
        <view v-else class="ended-badge">
          <text>活动已结束</text>
        </view>
      </view>
    </view>

    <view v-else class="error-box">
      <text class="error-text">活动不存在</text>
      <view class="back-btn" @click="goBack"><text>返回</text></view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loading:    true,
      activityId: '',
      activity:   {},
      notices: [
        '请准时参加，迟到超过30分钟视为缺席',
        '请穿着适合户外活动的服装和鞋子',
        '活动期间请遵守组织方的安排和指导',
        '请勿携带宠物参加活动',
        '如需取消报名，请提前24小时退出，保证他人机会'
      ]
    }
  },

  onLoad(options) {
    this.activityId = options.id
    this.loadDetail()
  },

  methods: {
    async loadDetail() {
      this.loading = true
      const uid = this.$store.state.user.uid
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-volunteer',
          data: {
            action: 'getActivityDetail',
            params: { activityId: this.activityId, userId: uid || '' }
          }
        })
        if (res.result.code === 0) {
          this.activity = res.result.data
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async enroll() {
      const uid = this.$store.state.user.uid
      if (!uid) {
        return uni.showModal({
          title: '未登录', content: '请先登录后再报名',
          confirmText: '去登录',
          success: res => { if (res.confirm) uni.navigateTo({ url: '/pages/login/public-login' }) }
        })
      }
      uni.showModal({
        title:   '确认报名',
        content: `确定报名《${this.activity.title}》吗？\n报名成功获得 +20 积分`,
        success: async res => {
          if (!res.confirm) return
          uni.showLoading({ title: '报名中...' })
          try {
            const r = await uniCloud.callFunction({
              name: 'gw-volunteer',
              data: { action: 'joinActivity', params: { userId: uid, activityId: this.activityId } }
            })
            uni.hideLoading()
            if (r.result.code === 0) {
              uni.showToast({ title: '报名成功 +20积分', icon: 'success' })
             
              const points = (this.$store.state.user.points || 0) + 20
              this.$store.dispatch('user/login', { ...this.$store.state.user, points })
           
              this.loadDetail()
            } else {
              uni.showToast({ title: r.result.msg || '报名失败', icon: 'none' })
            }
          } catch (e) {
            uni.hideLoading()
            uni.showToast({ title: '网络异常', icon: 'none' })
          }
        }
      })
    },

    async quit() {
      const uid = this.$store.state.user.uid
      uni.showModal({
        title:   '确认退出',
        content: '退出活动将扣除 20 积分，确定退出吗？',
        success: async res => {
          if (!res.confirm) return
          uni.showLoading({ title: '处理中...' })
          try {
            const r = await uniCloud.callFunction({
              name: 'gw-volunteer',
              data: { action: 'quitActivity', params: { userId: uid, activityId: this.activityId } }
            })
            uni.hideLoading()
            if (r.result.code === 0) {
              uni.showToast({ title: '已退出活动', icon: 'none' })
              const points = Math.max(0, (this.$store.state.user.points || 0) - 20)
              this.$store.dispatch('user/login', { ...this.$store.state.user, points })
              this.loadDetail()
            } else {
              uni.showToast({ title: r.result.msg || '退出失败', icon: 'none' })
            }
          } catch (e) {
            uni.hideLoading()
            uni.showToast({ title: '网络异常', icon: 'none' })
          }
        }
      })
    },

    getStatusLabel(status) {
      const map = { upcoming: '未开始', ongoing: '进行中', ended: '已结束' }
      return map[status] || '未知'
    },

    formatTime(ts) {
      if (!ts) return '未知'
      const d = new Date(ts)
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },

    goBack() { uni.navigateBack() }
  }
}
</script>

<style scoped lang="scss">
.detail-page { min-height: 100vh; background: #F5F7FA; padding-bottom: 160rpx; }
.loading-box { display: flex; align-items: center; justify-content: center; height: 100vh; text { font-size: 28rpx; color: #999; } }
.error-box { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; gap: 32rpx; }
.error-text { font-size: 28rpx; color: #9CA3AF; }
.back-btn { padding: 16rpx 48rpx; background: #1B4B8C; border-radius: 12rpx; text { font-size: 28rpx; color: #fff; } }
.cover-wrap { position: relative; height: 480rpx; }
.cover-img { width: 100%; height: 480rpx; }
.cover-mask { position: absolute; top: 24rpx; left: 24rpx; }
.status-tag { display: inline-block; padding: 8rpx 24rpx; border-radius: 8rpx; font-size: 26rpx; font-weight: 600; }
.s-upcoming { background: rgba(59,130,246,0.9); color: #fff; }
.s-ongoing  { background: rgba(16,185,129,0.9); color: #fff; }
.s-ended    { background: rgba(107,114,128,0.7); color: #fff; }
.info-card { background: #FFFFFF; margin: 24rpx 24rpx 0; border-radius: 16rpx; padding: 32rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); }
.activity-title { display: block; font-size: 36rpx; font-weight: 700; color: #1F2937; margin-bottom: 16rpx; }
.activity-desc { display: block; font-size: 28rpx; color: #6B7280; line-height: 1.7; margin-bottom: 28rpx; }
.meta-list { display: flex; flex-direction: column; gap: 20rpx; }
.meta-item { display: flex; align-items: flex-start; gap: 16rpx; }
.meta-icon { font-size: 32rpx; flex-shrink: 0; margin-top: 2rpx; }
.meta-text { flex: 1; font-size: 26rpx; color: #374151; line-height: 1.5; }
.meta-right { flex: 1; }
.capacity-bar { height: 12rpx; background: #E5E7EB; border-radius: 6rpx; overflow: hidden; margin-top: 10rpx; }
.capacity-fill { height: 100%; border-radius: 6rpx; transition: width 0.3s; }
.req-card, .notice-card { background: #FFFFFF; margin: 20rpx 24rpx 0; border-radius: 16rpx; padding: 28rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.card-title { display: block; font-size: 30rpx; font-weight: 600; color: #1F2937; margin-bottom: 20rpx; }
.card-content { font-size: 26rpx; color: #4B5563; line-height: 1.7; }
.notice-list { display: flex; flex-direction: column; gap: 16rpx; }
.notice-item { display: flex; gap: 12rpx; }
.notice-dot { font-size: 26rpx; color: #8B5CF6; flex-shrink: 0; font-weight: 600; }
.notice-text { flex: 1; font-size: 26rpx; color: #4B5563; line-height: 1.6; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #FFFFFF; padding: 24rpx 32rpx; box-shadow: 0 -2rpx 16rpx rgba(0,0,0,0.08); display: flex; align-items: center; gap: 24rpx; }
.bar-info { flex: 1; }
.bar-points { display: block; font-size: 22rpx; color: #F59E0B; font-weight: 500; margin-bottom: 4rpx; }
.bar-capacity { font-size: 22rpx; color: #6B7280; &.full { color: #EF4444; } }
.action-btn { padding: 24rpx 48rpx; border-radius: 16rpx; font-size: 30rpx; font-weight: 600; border: none; flex-shrink: 0; &::after { border: none; } }
.enroll { background: linear-gradient(135deg, #2D8F47 0%, #2D6A4F 100%); color: #FFFFFF; &.disabled { background: #9CA3AF; } }
.quit { background: #FEE2E2; color: #DC2626; }
.joined-actions { display: flex; align-items: center; gap: 16rpx; }
.joined-badge { padding: 20rpx 24rpx; background: #D1FAE5; border-radius: 12rpx; text { font-size: 26rpx; color: #065F46; font-weight: 500; } }
.ended-badge { padding: 24rpx 48rpx; background: #F3F4F6; border-radius: 16rpx; text { font-size: 28rpx; color: #9CA3AF; } }
</style>