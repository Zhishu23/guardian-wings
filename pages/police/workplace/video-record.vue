<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />

    <!-- 顶导航 -->
    <view class="navbar">
      <view class="nav-back" @click="goBack">
        <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>
      </view>
      <view class="nav-center">
        <text class="nav-title">视频采集</text>
        <text class="nav-sub">最大录制时长 10 分钟</text>
      </view>
      <view class="nav-right" />
    </view>

    <!-- 位置状态栏 -->
    <view class="loc-bar" :class="locStatus">
      <svg viewBox="0 0 24 24" class="loc-pin"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/></svg>
      <text class="loc-text">{{ locationText }}</text>
      <view class="loc-retry" v-if="locStatus === 'failed'" @click="fetchLocation">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08C16.95 15.3 14.76 17 12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5c1.38 0 2.64.56 3.54 1.46L13 10h7V3l-2.35 3.35z" fill="currentColor"/></svg>
      </view>
    </view>

    <scroll-view scroll-y class="scroll">

      <!-- 录制入口 -->
      <view class="record-btn-card" @click="startRecord">
        <view class="rb-icon">
          <svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" fill="currentColor"/></svg>
        </view>
        <view class="rb-text">
          <text class="rb-title">开始录制</text>
          <text class="rb-desc">调用摄像头录制现场视频</text>
        </view>
        <svg viewBox="0 0 24 24" class="rb-arrow"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/></svg>
      </view>

      <!-- 水印说明 -->
      <view class="watermark-notice">
        <svg viewBox="0 0 24 24" class="wn-icon"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/></svg>
        <text class="wn-text">视频录制后，时间与位置水印信息将以元数据形式随视频存储，上传时由后端服务器合成水印。</text>
      </view>

      <!-- 视频列表 -->
      <view class="section" v-if="videoList.length > 0">
        <view class="section-head">
          <text class="section-title">已录制视频</text>
          <text class="section-count">{{ videoList.length }} 条</text>
        </view>

        <view v-for="(video, idx) in videoList" :key="video.id" class="video-card">
          <!-- 缩略图行 -->
          <view class="vc-thumb-row">
            <view class="vc-thumb" @click="previewVideo(video)">
              <view class="vc-thumb-bg">
                <svg viewBox="0 0 48 48" class="vc-play"><circle cx="24" cy="24" r="20" fill="rgba(0,0,0,0.55)"/><path d="M20 16l12 8-12 8v-16z" fill="#fff"/></svg>
              </view>
              <view class="vc-duration"><text>{{ video.durationStr }}</text></view>
            </view>

            <!-- 水印元数据 -->
            <view class="vc-meta">
              <view class="vc-meta-row">
                <svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 4v4l3 1.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                <text>{{ video.createdAt }}</text>
              </view>
              <view class="vc-meta-row">
                <svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 1C5.24 1 3 3.24 3 6c0 3.5 5 8.5 5 8.5s5-5 5-8.5c0-2.76-2.24-5-5-5zm0 6.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="currentColor"/></svg>
                <text>{{ video.location }}</text>
              </view>
              <view class="vc-meta-row">
                <svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="5" r="2.2" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M3 14c0-2.76 2.24-5 5-5s5 2.24 5 5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>
                <text>{{ video.officerId }}</text>
              </view>
            </view>
          </view>

          <!-- 标注区 -->
          <view class="vc-annotate">
            <!-- 描述 -->
            <view class="ann-row">
              <text class="ann-label">描述</text>
              <input type="text" class="ann-input" :value="video.description" placeholder="添加简要描述…" @input="setField(idx, 'description', $event.detail.value)" />
            </view>

            <!-- 事件类型 -->
            <view class="ann-row">
              <text class="ann-label">事件类型</text>
              <view class="chips">
                <view v-for="t in eventTypes" :key="t.value" class="chip" :class="video.eventType === t.value ? 'chip-on' : ''" @click="setField(idx, 'eventType', t.value)">
                  <text>{{ t.label }}</text>
                </view>
              </view>
            </view>

            <!-- 关键时间节点 -->
            <view class="ann-row">
              <text class="ann-label">关键节点</text>
              <view class="keypoints">
                <view v-for="(kp, ki) in video.keypoints" :key="ki" class="kp-item">
                  <view class="kp-dot" />
                  <text class="kp-text">{{ kp }}</text>
                  <view class="kp-del" @click="removeKeypoint(idx, ki)">
                    <svg viewBox="0 0 16 16" width="14" height="14"><path d="M12 4.7L11.3 4 8 7.3 4.7 4 4 4.7 7.3 8 4 11.3l.7.7L8 8.7l3.3 3.3.7-.7L8.7 8z" fill="currentColor"/></svg>
                  </view>
                </view>
                <view class="kp-add" @click="addKeypoint(idx)">
                  <svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                  <text>添加节点</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 底部动作 -->
          <view class="vc-footer">
            <view class="vc-btn vc-btn-play" @click="previewVideo(video)">
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
              <text>预览</text>
            </view>
            <view class="vc-btn vc-btn-del" @click="deleteVideo(idx)">
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/></svg>
              <text>删除</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空态 -->
      <view class="empty" v-else>
        <svg viewBox="0 0 96 96" class="empty-svg">
          <circle cx="48" cy="48" r="44" fill="#1E293B" stroke="#334155" stroke-width="2"/>
          <path d="M32 30h32v24H32z" fill="none" stroke="#475569" stroke-width="2" stroke-linejoin="round"/>
          <path d="M64 37l8-4v22l-8-4" fill="none" stroke="#475569" stroke-width="2" stroke-linejoin="round"/>
          <circle cx="48" cy="64" r="3" fill="#475569"/>
          <circle cx="48" cy="64" r="1.2" fill="#334155"/>
        </svg>
        <text class="empty-title">未录制视频</text>
        <text class="empty-desc">点击上方开始录制，录制完成后可在此管理和标注视频</text>
      </view>

      <view class="safe-bottom" />
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'VideoRecord',
  data() {
    return {
      statusBarHeight: 0,
      videoList: [],
      locationText: '定位中…',
      locStatus: 'loading',
      currentAddress: '',
      lat: null,
      lng: null,
      officerId: 'GW-2025-0312',
      eventTypes: [
        { value: 'suspicious', label: '可疑活动' },
        { value: 'poaching',   label: '捕猎行为' },
        { value: 'patrol',     label: '巡逻记录' },
        { value: 'incident',   label: '突发事件' },
        { value: 'other',      label: '其他' }
      ]
    }
  },
  onLoad(query) {
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight
    this.loadList()
    this.fetchLocation()
    if (query && query.editId) {
      uni.showToast({ title: '已加载记录列表', icon: 'none' })
    }
  },
  methods: {
    /* 位置 */
    fetchLocation() {
      this.locStatus = 'loading'
      this.locationText = '定位中…'
      uni.getLocation({
        type: 'wgs84',
        success: res => {
          this.lat = res.latitude
          this.lng = res.longitude
          this.currentAddress = `纬度 ${res.latitude.toFixed(5)}, 经度 ${res.longitude.toFixed(5)}`
          this.locationText = this.currentAddress
          this.locStatus = 'success'
        },
        fail: () => { this.locStatus = 'failed'; this.locationText = '定位失败，点击重试' }
      })
    },

    /* 编号生成 */
    genId() {
      const d = new Date()
      const p = n => String(n).padStart(2, '0')
      return `GW-V-${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${Math.floor(Math.random()*9000+1000)}`
    },

    /* 时长格式 */
    fmtDuration(s) {
      const m = Math.floor(s / 60), sec = Math.round(s % 60)
      return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    },

    /* 录制 */
    startRecord() {
      uni.chooseVideo({
        sourceType: ['camera'],
        maxDuration: 600,
        camera: 'back',
        success: res => {
          const d = new Date()
          const p = n => String(n).padStart(2, '0')
          this.videoList.unshift({
            id: this.genId(),
            type: 'video',
            tempFilePath: res.tempFilePath,
            duration: res.duration || 0,
            durationStr: this.fmtDuration(res.duration || 0),
            createdAt: `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`,
            location: this.currentAddress || '位置未知',
            latitude: this.lat,
            longitude: this.lng,
            officerId: this.officerId,
            description: '',
            eventType: '',
            keypoints: [],
            status: 'draft',
            synced: false
          })
          this.saveList()
          uni.showToast({ title: '录制完成，请添加标注', icon: 'success' })
        },
        fail: () => { uni.showToast({ title: '录制失败或已取消', icon: 'none' }) }
      })
    },

    /* 预览 */
    previewVideo(v) {
      uni.previewVideo({ src: v.tempFilePath, fail: () => { uni.showToast({ title: '视频文件丢失', icon: 'none' }) } })
    },

    /* 字段更新 */
    setField(idx, field, val) {
      this.videoList[idx][field] = val
      if (this.videoList[idx].description || this.videoList[idx].eventType) this.videoList[idx].status = 'complete'
      this.saveList()
    },

    /* 关键节点 */
    addKeypoint(idx) {
      uni.showModal({
        title: '添加关键节点',
        content: '请输入节点描述（如 00:30 发现可疑人员）',
        editable: true,
        placeholderText: '如：00:30 发现可疑人员',
        success: res => {
          if (res.confirm && res.content) {
            if (!this.videoList[idx].keypoints) this.$set(this.videoList[idx], 'keypoints', [])
            this.videoList[idx].keypoints.push(res.content)
            this.saveList()
          }
        }
      })
    },
    removeKeypoint(idx, ki) { this.videoList[idx].keypoints.splice(ki, 1); this.saveList() },

    /* 删除 */
    deleteVideo(idx) {
      uni.showModal({
        title: '确认删除', content: '删除后无法恢复，确定要删除此视频记录吗？',
        success: r => { if (r.confirm) { this.videoList.splice(idx, 1); this.saveList(); uni.showToast({ title: '已删除', icon: 'success' }) } }
      })
    },

    /* 存储 */
    saveList() { try { uni.setStorageSync('gw_video_records', JSON.stringify(this.videoList)) } catch(e) { uni.showToast({ title: '存储失败', icon: 'none' }) } },
    loadList() { try { const r = uni.getStorageSync('gw_video_records'); this.videoList = r ? JSON.parse(r) : [] } catch(e) { this.videoList = [] } },

    goBack() { uni.navigateBack({ delta: 1 }) }
  }
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; max-height: 100vh; background: #0F172A; display: flex; flex-direction: column; overflow: hidden; }
.status-bar { background: #0F172A; flex-shrink: 0; }

/* 导航 */
.navbar { display: flex; align-items: center; padding: 14rpx 24rpx; background: #0F172A; flex-shrink: 0; }
.nav-back { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.7); }
.nav-center { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2rpx; }
.nav-title { font-size: 30rpx; font-weight: 600; color: #fff; }
.nav-sub { font-size: 20rpx; color: rgba(255,255,255,0.38); }
.nav-right { width: 56rpx; }

/* 位置栏 */
.loc-bar { flex-shrink: 0; margin: 0 20rpx; border-radius: 12rpx; display: flex; align-items: center; gap: 10rpx; padding: 12rpx 18rpx; }
.loc-pin { width: 24rpx; height: 24rpx; flex-shrink: 0; }
.loc-text { flex: 1; font-size: 22rpx; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.loc-retry { flex-shrink: 0; }
.loc-bar.loading { background: rgba(37,99,235,0.12); border: 1rpx solid rgba(37,99,235,0.2); .loc-pin,.loc-text { color: #60A5FA; } }
.loc-bar.success { background: rgba(16,185,129,0.12); border: 1rpx solid rgba(16,185,129,0.2); .loc-pin,.loc-text { color: #34D399; } }
.loc-bar.failed { background: rgba(239,68,68,0.12); border: 1rpx solid rgba(239,68,68,0.2); .loc-pin,.loc-text,.loc-retry { color: #F87171; } }

/* 滚动 */
.scroll { flex: 1; overflow-y: auto; padding: 16rpx 20rpx; }

/* 录制入口 */
.record-btn-card { display: flex; align-items: center; gap: 18rpx; padding: 22rpx; background: linear-gradient(135deg,rgba(37,99,235,0.2) 0%,rgba(37,99,235,0.07) 100%); border: 1rpx solid rgba(37,99,235,0.3); border-radius: 18rpx; margin-bottom: 14rpx; transition: transform 0.15s; }
.record-btn-card:active { transform: scale(0.975); }
.rb-icon { width: 80rpx; height: 80rpx; border-radius: 50%; background: rgba(37,99,235,0.25); display: flex; align-items: center; justify-content: center; color: #60A5FA; flex-shrink: 0; }
.rb-icon svg { width: 38rpx; height: 38rpx; }
.rb-text { flex: 1; }
.rb-title { font-size: 28rpx; font-weight: 600; color: #fff; display: block; margin-bottom: 4rpx; }
.rb-desc { font-size: 22rpx; color: rgba(255,255,255,0.42); display: block; }
.rb-arrow { width: 26rpx; height: 26rpx; color: rgba(255,255,255,0.3); }

/* 水印说明 */
.watermark-notice { display: flex; gap: 10rpx; align-items: flex-start; padding: 16rpx 18rpx; background: rgba(245,158,11,0.08); border: 1rpx solid rgba(245,158,11,0.18); border-radius: 12rpx; margin-bottom: 22rpx; }
.wn-icon { width: 28rpx; height: 28rpx; color: #FBBF24; flex-shrink: 0; margin-top: 2rpx; }
.wn-text { font-size: 21rpx; color: rgba(255,255,255,0.5); line-height: 1.5; flex: 1; }

/* 分段头 */
.section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14rpx; }
.section-title { font-size: 24rpx; font-weight: 600; color: rgba(255,255,255,0.45); }
.section-count { font-size: 22rpx; color: rgba(255,255,255,0.28); }

/* 视频卡 */
.video-card { background: rgba(255,255,255,0.04); border: 1rpx solid rgba(255,255,255,0.08); border-radius: 18rpx; padding: 20rpx; margin-bottom: 16rpx; }

.vc-thumb-row { display: flex; gap: 18rpx; margin-bottom: 20rpx; }
.vc-thumb { width: 150rpx; height: 108rpx; flex-shrink: 0; border-radius: 12rpx; overflow: hidden; position: relative; border: 1rpx solid rgba(255,255,255,0.1); }
.vc-thumb-bg { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg,#1E293B,#334155); }
.vc-play { width: 72rpx; height: 72rpx; }
.vc-duration { position: absolute; bottom: 6rpx; right: 6rpx; background: rgba(0,0,0,0.6); border-radius: 8rpx; padding: 4rpx 10rpx; }
.vc-duration text { font-size: 20rpx; color: #fff; font-weight: 600; font-family: 'SF Mono', monospace; }

.vc-meta { flex: 1; display: flex; flex-direction: column; gap: 8rpx; justify-content: center; }
.vc-meta-row { display: flex; align-items: center; gap: 8rpx; color: rgba(255,255,255,0.42); font-size: 22rpx; }

/* 标注 */
.vc-annotate { border-top: 1rpx solid rgba(255,255,255,0.08); padding-top: 18rpx; display: flex; flex-direction: column; gap: 18rpx; }
.ann-row { display: flex; flex-direction: column; gap: 10rpx; }
.ann-label { font-size: 22rpx; font-weight: 600; color: rgba(255,255,255,0.45); }
.ann-input { width: 100%; height: 72rpx; padding: 0 16rpx; background: rgba(255,255,255,0.06); border: 1rpx solid rgba(255,255,255,0.1); border-radius: 12rpx; color: rgba(255,255,255,0.85); font-size: 24rpx; box-sizing: border-box; }

.chips { display: flex; flex-wrap: wrap; gap: 10rpx; }
.chip { padding: 10rpx 20rpx; background: rgba(255,255,255,0.06); border: 1rpx solid rgba(255,255,255,0.1); border-radius: 30rpx; font-size: 22rpx; color: rgba(255,255,255,0.5); transition: all 0.15s; }
.chip:active { transform: scale(0.95); }
.chip.chip-on { background: rgba(37,99,235,0.22); border-color: rgba(37,99,235,0.45); color: #60A5FA; }

.keypoints { display: flex; flex-direction: column; gap: 10rpx; }
.kp-item { display: flex; align-items: center; gap: 12rpx; padding: 12rpx 16rpx; background: rgba(255,255,255,0.04); border: 1rpx solid rgba(255,255,255,0.08); border-radius: 10rpx; }
.kp-dot { width: 12rpx; height: 12rpx; border-radius: 50%; background: #60A5FA; flex-shrink: 0; }
.kp-text { flex: 1; font-size: 22rpx; color: rgba(255,255,255,0.65); }
.kp-del { color: rgba(255,255,255,0.28); }
.kp-add { display: flex; align-items: center; gap: 8rpx; justify-content: center; padding: 10rpx; border: 1rpx dashed rgba(37,99,235,0.35); border-radius: 10rpx; color: #60A5FA; font-size: 22rpx; }

/* 底部动作 */
.vc-footer { display: flex; gap: 12rpx; margin-top: 18rpx; padding-top: 16rpx; border-top: 1rpx solid rgba(255,255,255,0.06); }
.vc-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8rpx; padding: 18rpx; border-radius: 12rpx; font-size: 24rpx; font-weight: 500; transition: transform 0.15s; }
.vc-btn:active { transform: scale(0.96); }
.vc-btn-play { background: rgba(37,99,235,0.18); border: 1rpx solid rgba(37,99,235,0.3); color: #60A5FA; }
.vc-btn-del { background: rgba(239,68,68,0.12); border: 1rpx solid rgba(239,68,68,0.25); color: #F87171; }

/* 空态 */
.empty { display: flex; flex-direction: column; align-items: center; padding: 80rpx 48rpx; text-align: center; }
.empty-svg { width: 150rpx; height: 150rpx; margin-bottom: 28rpx; }
.empty-title { font-size: 28rpx; font-weight: 600; color: rgba(255,255,255,0.55); display: block; margin-bottom: 10rpx; }
.empty-desc { font-size: 22rpx; color: rgba(255,255,255,0.3); line-height: 1.6; display: block; }

.safe-bottom { height: 60rpx; }
</style>
