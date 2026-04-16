<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
    <view class="navbar">
      <view class="nav-btn" @click="goBack">返回</view>
      <view class="nav-center">
        <text class="nav-title">未归档素材</text>
        <text class="nav-sub">{{ totalCount }} 条待整理</text>
      </view>
      <view class="nav-btn right" @click="loadAll">刷新</view>
    </view>

    <scroll-view scroll-y class="scroll">
      <view class="summary-card">
        <view class="summary-item">
          <text class="summary-num">{{ photos.length }}</text>
          <text class="summary-label">照片</text>
        </view>
        <view class="summary-item">
          <text class="summary-num">{{ videos.length }}</text>
          <text class="summary-label">视频</text>
        </view>
        <view class="summary-item">
          <text class="summary-num">{{ transcripts.length }}</text>
          <text class="summary-label">笔录</text>
        </view>
      </view>

      <view class="section">
        <view class="section-head">
          <text class="section-title">照片</text>
          <text class="section-meta">{{ photos.length }} 条</text>
        </view>
        <view v-if="photos.length > 0" class="list">
          <view v-for="item in photos" :key="item.id" class="card">
            <view class="card-main" @click="editPhoto(item)">
              <text class="card-title">{{ item.remark || item.batchTitle || '未命名照片' }}</text>
              <text class="card-meta">{{ formatTime(item.updatedAt || item.createdAt) }}</text>
              <text class="card-desc">{{ item.locationText || item.location || '位置未知' }}</text>
            </view>
            <view class="actions">
              <view class="action-btn primary" @click="editPhoto(item)">编辑</view>
              <view class="action-btn danger" @click="deletePhoto(item)">删除</view>
            </view>
          </view>
        </view>
        <view v-else class="empty-line"><text>暂无未归档照片</text></view>
      </view>

      <view class="section">
        <view class="section-head">
          <text class="section-title">视频</text>
          <text class="section-meta">{{ videos.length }} 条</text>
        </view>
        <view v-if="videos.length > 0" class="list">
          <view v-for="item in videos" :key="item.id" class="card">
            <view class="card-main" @click="editVideo(item)">
              <text class="card-title">{{ item.remark || '未命名视频' }}</text>
              <text class="card-meta">{{ formatTime(item.updatedAt || item.createdAt) }} · {{ item.durationStr || '--:--' }}</text>
              <text class="card-desc">{{ item.locationText || item.location || '位置未知' }}</text>
            </view>
            <view class="actions">
              <view class="action-btn primary" @click="editVideo(item)">编辑</view>
              <view class="action-btn danger" @click="deleteVideo(item)">删除</view>
            </view>
          </view>
        </view>
        <view v-else class="empty-line"><text>暂无未归档视频</text></view>
      </view>

      <view class="section">
        <view class="section-head">
          <text class="section-title">笔录</text>
          <text class="section-meta">{{ transcripts.length }} 条</text>
        </view>
        <view v-if="transcripts.length > 0" class="list">
          <view v-for="item in transcripts" :key="item.id" class="card">
            <view class="card-main" @click="editTranscript(item)">
              <text class="card-title">{{ item.title || item.summary || '未命名笔录' }}</text>
              <text class="card-meta">{{ formatTime(item.updatedAt || item.createdAt) }}</text>
              <text class="card-desc">{{ item.locationText || item.targetName || '待补充信息' }}</text>
            </view>
            <view class="actions">
              <view class="action-btn primary" @click="editTranscript(item)">编辑</view>
              <view class="action-btn danger" @click="deleteTranscript(item)">删除</view>
            </view>
          </view>
        </view>
        <view v-else class="empty-line"><text>暂无未归档笔录</text></view>
      </view>

      <view class="safe-bottom" />
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'UnfiledMaterials',
  data() {
    return {
      statusBarHeight: 0,
      photos: [],
      videos: [],
      transcripts: []
    }
  },
  computed: {
    totalCount() {
      return this.photos.length + this.videos.length + this.transcripts.length
    }
  },
  onLoad() {
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight
    this.loadAll()
  },
  onShow() {
    this.loadAll()
  },
  methods: {
    loadAll() {
      this.photos = this.readArray('gw_photo_records')
        .filter((item) => !item.eventId && item.status !== 'discarded')
        .sort((a, b) => this.getTimeValue(b.updatedAt || b.createdAt) - this.getTimeValue(a.updatedAt || a.createdAt))
      this.videos = this.readArray('gw_video_records')
        .filter((item) => !item.eventId && item.status !== 'discarded')
        .sort((a, b) => this.getTimeValue(b.updatedAt || b.createdAt) - this.getTimeValue(a.updatedAt || a.createdAt))
      this.transcripts = this.readArray('gw_transcript_records')
        .filter((item) => !item.eventId)
        .sort((a, b) => this.getTimeValue(b.updatedAt || b.createdAt) - this.getTimeValue(a.updatedAt || a.createdAt))
    },
    readArray(key) {
      const raw = uni.getStorageSync(key)
      if (!raw) return []
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        return []
      }
    },
    writeArray(key, list) {
      uni.setStorageSync(key, JSON.stringify(list || []))
    },
    getTimeValue(value) {
      if (!value) return 0
      const time = new Date(String(value).replace(/\./g, '-').replace(/-/g, '/')).getTime()
      return Number.isNaN(time) ? 0 : time
    },
    formatTime(value) {
      return value ? String(value).replace('T', ' ').substring(0, 16) : '刚刚'
    },
    editPhoto(item) {
      uni.navigateTo({ url: '/pages/police/workplace/photo-capture?editId=' + item.id })
    },
    editVideo(item) {
      uni.navigateTo({ url: '/pages/police/workplace/video-record?editId=' + item.id })
    },
    editTranscript(item) {
      uni.navigateTo({ url: '/pages/police/workplace/transcript?editId=' + item.id })
    },
    deletePhoto(item) {
      this.deleteMaterial({
        title: '删除照片',
        key: 'gw_photo_records',
        id: item.id,
        reportField: 'relatedPhotos'
      })
    },
    deleteVideo(item) {
      this.deleteMaterial({
        title: '删除视频',
        key: 'gw_video_records',
        id: item.id,
        reportField: 'relatedVideos'
      })
    },
    deleteTranscript(item) {
      this.deleteMaterial({
        title: '删除笔录',
        key: 'gw_transcript_records',
        id: item.id,
        reportField: 'relatedTranscripts'
      })
    },
    deleteMaterial({ title, key, id, reportField }) {
      uni.showModal({
        title,
        content: '删除后不可恢复，是否继续？',
        success: (res) => {
          if (!res.confirm) return
          const next = this.readArray(key).filter((item) => item.id !== id)
          this.writeArray(key, next)

          const reports = this.readArray('gw_report_records').map((item) => {
            const list = Array.isArray(item[reportField]) ? item[reportField].filter((rowId) => rowId !== id) : []
            return Object.assign({}, item, { [reportField]: list })
          })
          this.writeArray('gw_report_records', reports)

          this.loadAll()
          uni.showToast({ title: '已删除', icon: 'success' })
        }
      })
    },
    goBack() {
      uni.navigateBack({ delta: 1 })
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #eef3fb; color: #0f172a; display: flex; flex-direction: column; }
.status-bar, .navbar { background: linear-gradient(135deg, #0f2f6b, #1d4ed8); }
.navbar { height: 88rpx; padding: 0 24rpx; display: flex; align-items: center; color: #fff; }
.nav-btn { width: 88rpx; font-size: 26rpx; color: rgba(255,255,255,0.86); }
.nav-btn.right { text-align: right; }
.nav-center { flex: 1; display: flex; flex-direction: column; align-items: center; }
.nav-title { font-size: 32rpx; font-weight: 700; }
.nav-sub { font-size: 20rpx; color: rgba(255,255,255,0.78); }
.scroll { flex: 1; padding: 20rpx 24rpx; box-sizing: border-box; }
.summary-card { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16rpx; margin-bottom: 18rpx; }
.summary-item { background: #fff; border: 1rpx solid #e6edf6; border-radius: 20rpx; padding: 24rpx; text-align: center; box-shadow: 0 10rpx 22rpx rgba(15,23,42,0.05); }
.summary-num { display: block; font-size: 40rpx; font-weight: 700; color: #1d4ed8; }
.summary-label { display: block; margin-top: 8rpx; font-size: 22rpx; color: #64748b; }
.section { margin-bottom: 20rpx; }
.section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.section-title { font-size: 28rpx; font-weight: 700; color: #0f172a; }
.section-meta { font-size: 21rpx; color: #64748b; }
.list { display: flex; flex-direction: column; gap: 12rpx; }
.card { background: #fff; border: 1rpx solid #e6edf6; border-radius: 18rpx; padding: 18rpx; box-shadow: 0 10rpx 22rpx rgba(15,23,42,0.05); }
.card-main { margin-bottom: 14rpx; }
.card-title { display: block; font-size: 26rpx; font-weight: 600; color: #0f172a; }
.card-meta { display: block; margin-top: 8rpx; font-size: 21rpx; color: #64748b; }
.card-desc { display: block; margin-top: 8rpx; font-size: 22rpx; color: #475569; line-height: 1.6; }
.actions { display: flex; gap: 12rpx; }
.action-btn { flex: 1; text-align: center; padding: 14rpx 0; border-radius: 12rpx; font-size: 24rpx; }
.action-btn.primary { background: rgba(37,99,235,0.12); color: #1d4ed8; }
.action-btn.danger { background: rgba(239,68,68,0.12); color: #dc2626; }
.empty-line { padding: 32rpx 20rpx; text-align: center; background: #fff; border: 1rpx solid #e6edf6; border-radius: 18rpx; color: #94a3b8; font-size: 22rpx; }
.safe-bottom { height: 80rpx; }
</style>
