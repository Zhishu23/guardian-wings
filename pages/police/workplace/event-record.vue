<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />

    <!-- 顶导航 -->
    <view class="navbar">
      <view class="nav-back" @click="goBack">
        <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>
      </view>
      <view class="nav-center">
        <text class="nav-title">事件记录</text>
      </view>
      <view class="nav-right">
        <view class="nav-btn" v-if="allRecords.length > 0" @click="onClear">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>
        </view>
      </view>
    </view>

    <!-- 今日概览 -->
    <view class="overview">
      <view class="overview-card ov-video">
        <view class="ov-icon">
          <svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" fill="currentColor"/></svg>
        </view>
        <view class="ov-body">
          <text class="ov-num">{{ todayVideoCount }}</text>
          <text class="ov-label">今日视频</text>
        </view>
      </view>
      <view class="overview-card ov-transcript">
        <view class="ov-icon">
          <svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" fill="currentColor"/></svg>
        </view>
        <view class="ov-body">
          <text class="ov-num">{{ todayTranscriptCount }}</text>
          <text class="ov-label">今日笔录</text>
        </view>
      </view>
      <view class="overview-card ov-total">
        <view class="ov-icon">
          <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" fill="currentColor"/></svg>
        </view>
        <view class="ov-body">
          <text class="ov-num">{{ allRecords.length }}</text>
          <text class="ov-label">总记录</text>
        </view>
      </view>
    </view>

    <!-- 入口卡片组 -->
    <view class="entries">
      <view class="entry-card entry-video" @click="goVideo">
        <view class="entry-left">
          <view class="entry-icon">
            <svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" fill="currentColor"/></svg>
          </view>
          <view class="entry-text">
            <text class="entry-title">视频采集</text>
            <text class="entry-desc">录制现场视频，自动标注时间与位置信息</text>
          </view>
        </view>
        <view class="entry-meta">
          <view class="entry-badge" v-if="videoCount > 0"><text>{{ videoCount }}</text></view>
          <svg viewBox="0 0 24 24" class="entry-arrow"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/></svg>
        </view>
      </view>

      <view class="entry-card entry-transcript" @click="goTranscript">
        <view class="entry-left">
          <view class="entry-icon">
            <svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm2-6h8v2H8v-2zm0-3h8v2H8v-2zm0-3h5v2H8V8z" fill="currentColor"/></svg>
          </view>
          <view class="entry-text">
            <text class="entry-title">笔录记录</text>
            <text class="entry-desc">结构化笔录，支持模板与图片标注</text>
          </view>
        </view>
        <view class="entry-meta">
          <view class="entry-badge entry-badge-green" v-if="transcriptCount > 0"><text>{{ transcriptCount }}</text></view>
          <svg viewBox="0 0 24 24" class="entry-arrow"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/></svg>
        </view>
      </view>
    </view>

    <!-- 历史记录列表 -->
    <view class="history" v-if="allRecords.length > 0">
      <text class="history-head">最近记录</text>
      <view class="history-list">
        <view v-for="rec in allRecords" :key="rec.id" class="history-row" @click="openRecord(rec)">
          <view class="hr-type" :class="rec.type === 'video' ? 'hr-type-v' : 'hr-type-t'">
            <svg viewBox="0 0 24 24" v-if="rec.type === 'video'"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" fill="currentColor"/></svg>
            <svg viewBox="0 0 24 24" v-else><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" fill="currentColor"/></svg>
          </view>
          <view class="hr-content">
            <view class="hr-top">
              <text class="hr-id">{{ rec.id }}</text>
              <view class="hr-status" :class="'s-' + rec.status"><text>{{ statusLabel(rec.status) }}</text></view>
            </view>
            <text class="hr-desc">{{ rec.description || '无描述' }}</text>
            <text class="hr-time">{{ rec.createdAt }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空态 -->
    <view class="empty" v-else>
      <svg viewBox="0 0 96 96" class="empty-svg">
        <circle cx="48" cy="48" r="44" fill="#1E293B" stroke="#334155" stroke-width="2"/>
        <rect x="28" y="30" width="40" height="28" rx="4" fill="none" stroke="#475569" stroke-width="2"/>
        <path d="M42 40l10 5-10 5v-10z" fill="#475569"/>
        <rect x="33" y="65" width="30" height="3" rx="1.5" fill="#334155"/>
        <rect x="38" y="71" width="20" height="3" rx="1.5" fill="#2D3748"/>
      </svg>
      <text class="empty-title">暂无事件记录</text>
      <text class="empty-desc">选择上方入口开始录制视频或创建笔录</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'EventRecord',
  data() {
    return { statusBarHeight: 0, allRecords: [] }
  },
  computed: {
    videoCount() { return this.allRecords.filter(r => r.type === 'video').length },
    transcriptCount() { return this.allRecords.filter(r => r.type === 'transcript').length },
    todayVideoCount() {
      const today = new Date().toISOString().slice(0, 10)
      return this.allRecords.filter(r => r.type === 'video' && r.createdAt && r.createdAt.startsWith(today)).length
    },
    todayTranscriptCount() {
      const today = new Date().toISOString().slice(0, 10)
      return this.allRecords.filter(r => r.type === 'transcript' && r.createdAt && r.createdAt.startsWith(today)).length
    }
  },
  onLoad() {
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight
    this.load()
  },
  onShow() { this.load() },
  methods: {
    load() {
      try {
        const v = uni.getStorageSync('gw_video_records')
        const t = uni.getStorageSync('gw_transcript_records')
        const videos = v ? JSON.parse(v) : []
        const transcripts = t ? JSON.parse(t) : []
        this.allRecords = [...videos, ...transcripts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      } catch (e) { this.allRecords = [] }
    },
    statusLabel(s) { return { draft:'草稿', complete:'已完成', syncing:'同步中' }[s] || '未知' },
    goVideo() { uni.navigateTo({ url: '/pages/police/workplace/video-record' }) },
    goTranscript() { uni.navigateTo({ url: '/pages/police/workplace/transcript' }) },
    openRecord(rec) {
      const page = rec.type === 'video' ? 'video-record' : 'transcript'
      uni.navigateTo({ url: `/pages/police/workplace/${page}?editId=${rec.id}` })
    },
    onClear() {
      uni.showModal({
        title: '确认清空',
        content: `将删除全部 ${this.allRecords.length} 条记录，此操作不可恢复。`,
        success: r => {
          if (r.confirm) {
            uni.removeStorageSync('gw_video_records')
            uni.removeStorageSync('gw_transcript_records')
            this.allRecords = []
            uni.showToast({ title: '已清空', icon: 'success' })
          }
        }
      })
    },
    goBack() { uni.navigateBack({ delta: 1 }) }
  }
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; background: #0F172A; padding-bottom: 60rpx; }
.status-bar { background: #0F172A; }

.navbar { display: flex; align-items: center; padding: 14rpx 24rpx; background: #0F172A; }
.nav-back { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.7); }
.nav-center { flex: 1; text-align: center; }
.nav-title { font-size: 30rpx; font-weight: 600; color: #fff; }
.nav-right { width: 56rpx; display: flex; align-items: center; justify-content: flex-end; }
.nav-btn { color: rgba(255,255,255,0.5); }
.nav-btn svg { width: 28rpx; height: 28rpx; }

.overview { display: flex; gap: 12rpx; padding: 20rpx 24rpx 0; }
.overview-card {
  flex: 1; border-radius: 16rpx; padding: 20rpx 16rpx; display: flex; flex-direction: column; align-items: center; gap: 12rpx;
  border: 1rpx solid rgba(255,255,255,0.07);
}
.ov-video { background: rgba(37,99,235,0.1); border-color: rgba(37,99,235,0.2); }
.ov-transcript { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.2); }
.ov-total { background: rgba(139,92,246,0.1); border-color: rgba(139,92,246,0.2); }

.ov-icon { width: 52rpx; height: 52rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.ov-video .ov-icon { background: rgba(37,99,235,0.2); color: #60A5FA; }
.ov-transcript .ov-icon { background: rgba(16,185,129,0.2); color: #34D399; }
.ov-total .ov-icon { background: rgba(139,92,246,0.2); color: #A78BFA; }
.ov-icon svg { width: 26rpx; height: 26rpx; }

.ov-body { display: flex; flex-direction: column; align-items: center; gap: 2rpx; }
.ov-num { font-size: 32rpx; font-weight: 700; color: #fff; }
.ov-label { font-size: 18rpx; color: rgba(255,255,255,0.4); }

.entries { padding: 24rpx 24rpx 0; display: flex; flex-direction: column; gap: 14rpx; }
.entry-card {
  display: flex; align-items: center; justify-content: space-between; padding: 22rpx 20rpx;
  border-radius: 18rpx; border: 1rpx solid rgba(255,255,255,0.08); transition: transform 0.15s;
}
.entry-card:active { transform: scale(0.975); }
.entry-video { background: linear-gradient(135deg, rgba(37,99,235,0.17) 0%, rgba(37,99,235,0.05) 100%); border-color: rgba(37,99,235,0.22); }
.entry-transcript { background: linear-gradient(135deg, rgba(16,185,129,0.17) 0%, rgba(16,185,129,0.05) 100%); border-color: rgba(16,185,129,0.22); }

.entry-left { display: flex; align-items: center; gap: 18rpx; }
.entry-icon { width: 76rpx; height: 76rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.entry-video .entry-icon { background: rgba(37,99,235,0.22); color: #60A5FA; }
.entry-transcript .entry-icon { background: rgba(16,185,129,0.22); color: #34D399; }
.entry-icon svg { width: 36rpx; height: 36rpx; }

.entry-title { font-size: 28rpx; font-weight: 600; color: #fff; display: block; margin-bottom: 5rpx; }
.entry-desc { font-size: 22rpx; color: rgba(255,255,255,0.4); display: block; }

.entry-meta { display: flex; align-items: center; gap: 10rpx; }
.entry-badge { background: rgba(37,99,235,0.22); border-radius: 18rpx; padding: 5rpx 14rpx; }
.entry-badge text { font-size: 22rpx; font-weight: 600; color: #60A5FA; }
.entry-badge-green { background: rgba(16,185,129,0.22) !important; }
.entry-badge-green text { color: #34D399 !important; }
.entry-arrow { width: 24rpx; height: 24rpx; color: rgba(255,255,255,0.3); }

.history { padding: 30rpx 24rpx 0; }
.history-head { font-size: 24rpx; font-weight: 600; color: rgba(255,255,255,0.4); display: block; margin-bottom: 14rpx; }
.history-list { display: flex; flex-direction: column; gap: 10rpx; }

.history-row {
  display: flex; gap: 16rpx; align-items: flex-start; padding: 18rpx;
  background: rgba(255,255,255,0.04); border: 1rpx solid rgba(255,255,255,0.06); border-radius: 14rpx; transition: background 0.15s;
}
.history-row:active { background: rgba(255,255,255,0.08); }

.hr-type { width: 52rpx; height: 52rpx; border-radius: 12rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.hr-type-v { background: rgba(37,99,235,0.14); color: #60A5FA; }
.hr-type-t { background: rgba(16,185,129,0.14); color: #34D399; }
.hr-type svg { width: 26rpx; height: 26rpx; }

.hr-content { flex: 1; min-width: 0; }
.hr-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5rpx; }
.hr-id { font-size: 21rpx; font-weight: 600; color: rgba(255,255,255,0.6); font-family: 'SF Mono', monospace; }
.hr-status { padding: 4rpx 12rpx; border-radius: 10rpx; font-size: 18rpx; font-weight: 500; }
.s-draft { background: rgba(245,158,11,0.14); color: #FBBF24; }
.s-complete { background: rgba(16,185,129,0.14); color: #34D399; }
.s-syncing { background: rgba(37,99,235,0.14); color: #60A5FA; }
.hr-desc { font-size: 22rpx; color: rgba(255,255,255,0.5); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 5rpx; }
.hr-time { font-size: 19rpx; color: rgba(255,255,255,0.28); display: block; }

.empty { display: flex; flex-direction: column; align-items: center; padding: 90rpx 48rpx; text-align: center; }
.empty-svg { width: 150rpx; height: 150rpx; margin-bottom: 30rpx; }
.empty-title { font-size: 28rpx; font-weight: 600; color: rgba(255,255,255,0.55); display: block; margin-bottom: 10rpx; }
.empty-desc { font-size: 22rpx; color: rgba(255,255,255,0.3); line-height: 1.6; display: block; }
</style>
