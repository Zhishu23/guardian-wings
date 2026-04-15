<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
    <view class="navbar">
      <view class="nav-btn" @click="goBack">返回</view>
      <view class="nav-center">
        <text class="nav-title">视频记录</text>
        <text class="nav-sub">{{ filteredVideoList.length }} / {{ activeVideoCount }} 段</text>
      </view>
      <view class="nav-btn" @click="showSettings" v-if="videoList.length > 0">更多</view>
      <view class="nav-btn placeholder" v-else></view>
    </view>

    <view class="loc-bar" :class="locStatus">
      <text class="loc-text">{{ locationText }}</text>
      <text class="loc-link" v-if="locStatus === 'failed'" @click="fetchLocation">重试</text>
    </view>

    <view class="toolbar">
      <view v-for="tab in filterTabs" :key="tab.key" class="pill" :class="{ active: activeFilter === tab.key }" @click="activeFilter = tab.key">
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll">
      <view class="record-card" @click="startRecord">
        <text class="record-title">开始录制</text>
        <text class="record-desc">录制后可补充说明、事件归属、关键片段和证据状态</text>
      </view>

      <view class="tip-card">
        <text>视频录制完成后会保存到本地记录，可标记关键证据，并挂接到事件与报告。</text>
      </view>

      <view v-if="filteredVideoList.length > 0">
        <view v-for="video in filteredVideoList" :key="video.id" class="video-card" :class="{ discarded: video.status === 'discarded' }">
          <view class="card-top">
            <view class="thumb" @click="previewVideo(video)">
              <text class="play-text">播放</text>
              <text class="duration">{{ video.durationStr }}</text>
              <text class="evidence" v-if="video.isKeyEvidence">关键</text>
            </view>
            <view class="meta">
              <text class="title">{{ video.remark || '未命名视频' }}</text>
              <text class="line">{{ formatDateTime(video.createdAt) }}</text>
              <text class="line">{{ video.locationText || video.location || '位置未知' }}</text>
              <text class="line">{{ getVideoRelationText(video) }}</text>
              <text class="status" :class="'status-' + normalizeStatus(video.status)">{{ getStatusText(video.status) }}</text>
            </view>
          </view>

          <view class="tag-row">
            <view v-for="tag in getTypeTags(video)" :key="tag" class="tag"><text>{{ tag }}</text></view>
          </view>

          <view class="clip-list" v-if="video.clipMarks && video.clipMarks.length > 0">
            <view v-for="(clip, idx) in video.clipMarks" :key="idx" class="clip-item">
              <text class="clip-time">{{ clip.start }} - {{ clip.end }}</text>
              <text class="clip-text">{{ clip.remark }}</text>
            </view>
          </view>

          <view class="btn-row">
            <view class="btn blue" @click="previewVideo(video)">预览</view>
            <view class="btn green" @click="openEditor(video)">编辑</view>
            <view class="btn red" @click="markDiscarded(video.id)">作废</view>
          </view>
        </view>
      </view>

      <view v-else class="empty">
        <text class="empty-title">还没有视频记录</text>
        <text class="empty-desc">点击上方开始录制，录制完成后可继续整理。</text>
      </view>

      <view class="safe-bottom" />
    </scroll-view>

    <view class="mask" v-if="editorVisible" @click="closeEditor">
      <view class="sheet" @click.stop="">
        <view class="sheet-head">
          <text class="sheet-title">视频信息</text>
          <text class="sheet-close" @click="closeEditor">关闭</text>
        </view>
        <scroll-view scroll-y class="sheet-scroll">
          <view class="preview-box" @click="previewEditorVideo">
            <text>点击预览视频</text>
            <text class="preview-duration">{{ editorForm ? editorForm.durationStr : '' }}</text>
          </view>

          <view class="field">
            <text class="label">视频说明</text>
            <textarea class="textarea" v-model="editorForm.remark" maxlength="120" placeholder="输入视频内容或现场说明" />
          </view>

          <view class="field">
            <text class="label">归属事件</text>
            <view class="picker" @click="pickEvent">
              <text>{{ selectedEventLabel }}</text>
              <text class="link">选择</text>
            </view>
          </view>

          <view class="field">
            <text class="label">事件类型</text>
            <view class="row">
              <view v-for="item in eventTypes" :key="item.value" class="pill small" :class="{ active: editorForm.eventType === item.value }" @click="editorForm.eventType = item.value">
                <text>{{ item.label }}</text>
              </view>
            </view>
          </view>

          <view class="field">
            <text class="label">视频状态</text>
            <view class="row">
              <view v-for="item in statusOptions" :key="item.value" class="pill small" :class="{ active: editorForm.status === item.value }" @click="editorForm.status = item.value">
                <text>{{ item.label }}</text>
              </view>
            </view>
          </view>

          <view class="field">
            <view class="picker" @click="editorForm.isKeyEvidence = !editorForm.isKeyEvidence">
              <text class="label inline">关键证据</text>
              <text class="link">{{ editorForm.isKeyEvidence ? '是' : '否' }}</text>
            </view>
          </view>

          <view class="field">
            <view class="picker">
              <text class="label inline">关键片段</text>
              <text class="link" @click.stop="addClipMark">新增片段</text>
            </view>
            <view v-if="editorForm.clipMarks && editorForm.clipMarks.length > 0">
              <view v-for="(clip, idx) in editorForm.clipMarks" :key="idx" class="clip-edit">
                <input class="input time" v-model="clip.start" placeholder="00:00" />
                <input class="input time" v-model="clip.end" placeholder="00:30" />
                <input class="input remark" v-model="clip.remark" placeholder="片段说明" />
                <view class="clip-del" @click="removeClipMark(idx)">删</view>
              </view>
            </view>
            <text class="meta" v-else>暂无关键片段。</text>
          </view>
        </scroll-view>
        <view class="sheet-foot">
          <button class="action light" @click="previewEditorVideo">预览</button>
          <button class="action primary" @click="saveEditor">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'VideoRecord',
  data() {
    return {
      statusBarHeight: 0,
      videoList: [],
      eventOptions: [],
      activeFilter: 'all',
      filterTabs: [
        { key: 'all', label: '全部' },
        { key: 'today', label: '今日' },
        { key: 'unfiled', label: '未归档' },
        { key: 'unlinked', label: '未引用' },
        { key: 'key', label: '关键' },
        { key: 'discarded', label: '作废' }
      ],
      locationText: '定位中...',
      locStatus: 'loading',
      currentAddress: '',
      lat: null,
      lng: null,
      officerId: 'GW-2025-0312',
      editorVisible: false,
      editorForm: null,
      eventTypes: [
        { value: 'suspicious', label: '可疑活动' },
        { value: 'poaching', label: '捕猎行为' },
        { value: 'patrol', label: '巡查记录' },
        { value: 'incident', label: '突发事件' },
        { value: 'other', label: '其他' }
      ],
      statusOptions: [
        { value: 'draft', label: '待整理' },
        { value: 'complete', label: '已完成' },
        { value: 'discarded', label: '作废' }
      ]
    }
  },
  computed: {
    activeVideoCount() {
      return this.videoList.filter((item) => item.status !== 'discarded').length
    },
    filteredVideoList() {
      const today = this.getTodayKey()
      return this.videoList.filter((item) => {
        const status = this.normalizeStatus(item.status)
        if (this.activeFilter === 'today') return this.getDateKey(item.createdAt) === today && status !== 'discarded'
        if (this.activeFilter === 'unfiled') return !item.eventId && status !== 'discarded'
        if (this.activeFilter === 'unlinked') return (!item.linkedReportIds || item.linkedReportIds.length === 0) && status !== 'discarded'
        if (this.activeFilter === 'key') return !!item.isKeyEvidence && status !== 'discarded'
        if (this.activeFilter === 'discarded') return status === 'discarded'
        return status !== 'discarded'
      })
    },
    selectedEventLabel() {
      if (!this.editorForm) return '未选择'
      if (!this.editorForm.eventId) return '未归档'
      const found = this.eventOptions.find((item) => item.id === this.editorForm.eventId)
      return found ? found.title : '未归档'
    }
  },
  onLoad() {
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight
    this.loadOfficerInfo()
    this.loadList()
    this.loadEventOptions()
    this.fetchLocation()
  },
  onShow() {
    this.loadList()
    this.loadEventOptions()
  },
  methods: {
    loadOfficerInfo() {
      try {
        const raw = uni.getStorageSync('gw_police_info')
        const info = raw ? JSON.parse(raw) : {}
        if (info.officer_id) this.officerId = info.officer_id
      } catch (e) {}
    },
    loadEventOptions() {
      this.eventOptions = this.readStorageArray('gw_event_records').slice().sort((a, b) => this.getTimeValue(b.updatedAt || b.createdAt) - this.getTimeValue(a.updatedAt || a.createdAt)).map((item) => ({
        id: item.id,
        title: item.title || item.description || '未命名事件'
      }))
    },
    fetchLocation() {
      this.locStatus = 'loading'
      this.locationText = '定位中...'
      uni.getLocation({
        type: 'wgs84',
        success: (res) => {
          this.lat = res.latitude
          this.lng = res.longitude
          this.currentAddress = '纬度 ' + res.latitude.toFixed(5) + ', 经度 ' + res.longitude.toFixed(5)
          this.locationText = this.currentAddress
          this.locStatus = 'success'
        },
        fail: () => {
          this.locStatus = 'failed'
          this.locationText = '定位失败，点击重试'
        }
      })
    },
    genId() {
      const d = new Date()
      const p = (n) => String(n).padStart(2, '0')
      return `GW-V-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${Math.floor(Math.random() * 9000 + 1000)}`
    },
    fmtDuration(s) {
      const m = Math.floor(s / 60)
      const sec = Math.round(s % 60)
      return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    },
    startRecord() {
      uni.chooseVideo({
        sourceType: ['camera'],
        maxDuration: 600,
        camera: 'back',
        success: (res) => {
          const finalPath = res.tempFilePath || ''
          const video = this.normalizeVideo({
            id: this.genId(),
            type: 'video',
            tempFilePath: finalPath,
            localPath: finalPath,
            duration: res.duration || 0,
            durationStr: this.fmtDuration(res.duration || 0),
            createdAt: this.formatFullDateTime(new Date()),
            updatedAt: this.formatFullDateTime(new Date()),
            locationText: this.currentAddress || '位置未知',
            location: this.currentAddress || '位置未知',
            latitude: this.lat,
            longitude: this.lng,
            officerId: this.officerId,
            remark: '',
            eventId: '',
            eventType: '',
            clipMarks: [],
            status: 'draft',
            isKeyEvidence: false,
            linkedReportIds: []
          })
          this.videoList.unshift(video)
          this.saveList()
          this.openEditor(video)
          this.persistVideoPathInBackground(video.id, finalPath)
          uni.showToast({ title: '录制完成', icon: 'success' })
        },
        fail: () => uni.showToast({ title: '录制失败或已取消', icon: 'none' })
      })
    },
    previewVideo(video) {
      const path = video && video.tempFilePath ? video.tempFilePath : ''
      if (!path) {
        uni.showToast({ title: '视频文件丢失', icon: 'none' })
        return
      }
      uni.navigateTo({
        url: '/pages/police/workplace/media-preview?type=video&path=' + encodeURIComponent(path)
      })
    },
    previewEditorVideo() {
      if (!this.editorForm) return
      this.previewVideo(this.editorForm)
    },
    openEditor(video) {
      this.editorForm = JSON.parse(JSON.stringify(this.normalizeVideo(video)))
      this.editorVisible = true
    },
    closeEditor() {
      this.editorVisible = false
      this.editorForm = null
    },
    saveEditor() {
      if (!this.editorForm) return
      const idx = this.videoList.findIndex((item) => item.id === this.editorForm.id)
      if (idx === -1) return
      const next = this.normalizeVideo(Object.assign({}, this.editorForm, { updatedAt: this.formatFullDateTime(new Date()) }))
      this.videoList.splice(idx, 1, next)
      this.saveList()
      this.closeEditor()
      uni.showToast({ title: '已保存', icon: 'success' })
    },
    pickEvent() {
      const list = ['不归档'].concat(this.eventOptions.map((item) => item.title))
      uni.showActionSheet({
        itemList: list,
        success: (res) => {
          if (!this.editorForm) return
          if (res.tapIndex === 0) {
            this.editorForm.eventId = ''
            return
          }
          const target = this.eventOptions[res.tapIndex - 1]
          this.editorForm.eventId = target ? target.id : ''
        }
      })
    },
    addClipMark() {
      if (!this.editorForm) return
      if (!Array.isArray(this.editorForm.clipMarks)) this.editorForm.clipMarks = []
      this.editorForm.clipMarks.push({ start: '', end: '', remark: '' })
    },
    removeClipMark(index) {
      if (!this.editorForm || !Array.isArray(this.editorForm.clipMarks)) return
      this.editorForm.clipMarks.splice(index, 1)
    },
    markDiscarded(id) {
      const idx = this.videoList.findIndex((item) => item.id === id)
      if (idx === -1) return
      const next = this.normalizeVideo(Object.assign({}, this.videoList[idx], { status: 'discarded', updatedAt: this.formatFullDateTime(new Date()) }))
      this.videoList.splice(idx, 1, next)
      this.saveList()
      uni.showToast({ title: '已标记作废', icon: 'success' })
    },
    showSettings() {
      uni.showActionSheet({
        itemList: ['查看作废视频', '清空全部视频'],
        success: (res) => {
          if (res.tapIndex === 0) this.activeFilter = 'discarded'
          if (res.tapIndex === 1) this.clearAllVideos()
        }
      })
    },
    clearAllVideos() {
      uni.showModal({
        title: '确认清空',
        content: '将清空全部视频记录，此操作无法恢复，是否继续？',
        success: (res) => {
          if (!res.confirm) return
          this.videoList = []
          this.saveList()
          uni.showToast({ title: '已清空', icon: 'success' })
        }
      })
    },
    getVideoRelationText(video) {
      const eventText = video.eventId ? '已归入事件' : '未归档'
      const reportCount = Array.isArray(video.linkedReportIds) ? video.linkedReportIds.length : 0
      return eventText + ' · 已引用 ' + reportCount + ' 次'
    },
    getTypeTags(video) {
      const tags = []
      const found = this.eventTypes.find((item) => item.value === video.eventType)
      if (found) tags.push(found.label)
      if (video.clipMarks && video.clipMarks.length > 0) tags.push('片段 ' + video.clipMarks.length)
      return tags
    },
    saveList() {
      try {
        uni.setStorageSync('gw_video_records', JSON.stringify(this.videoList))
      } catch (e) {
        uni.showToast({ title: '存储失败', icon: 'none' })
      }
    },
    loadList() {
      this.videoList = this.readStorageArray('gw_video_records').map((item) => this.normalizeVideo(item))
    },
    normalizeVideo(video) {
      return {
        id: video.id || this.genId(),
        type: 'video',
        tempFilePath: video.tempFilePath || video.localPath || '',
        localPath: video.localPath || video.tempFilePath || '',
        duration: video.duration || 0,
        durationStr: video.durationStr || this.fmtDuration(video.duration || 0),
        createdAt: video.createdAt || this.formatFullDateTime(new Date()),
        updatedAt: video.updatedAt || video.createdAt || this.formatFullDateTime(new Date()),
        locationText: video.locationText || video.location || '位置未知',
        location: video.location || video.locationText || '位置未知',
        latitude: video.latitude || null,
        longitude: video.longitude || null,
        officerId: video.officerId || this.officerId,
        remark: video.remark || video.description || '',
        eventId: video.eventId || '',
        eventType: video.eventType || '',
        clipMarks: Array.isArray(video.clipMarks) ? video.clipMarks : Array.isArray(video.keypoints) ? video.keypoints.map((text) => ({ start: '', end: '', remark: text })) : [],
        status: this.normalizeStatus(video.status),
        isKeyEvidence: !!video.isKeyEvidence,
        linkedReportIds: Array.isArray(video.linkedReportIds) ? video.linkedReportIds : []
      }
    },
    normalizeStatus(status) {
      if (status === 'discarded') return 'discarded'
      if (status === 'complete' || status === 'completed') return 'complete'
      return 'draft'
    },
    getStatusText(status) {
      const map = { draft: '待整理', complete: '已完成', discarded: '作废' }
      return map[this.normalizeStatus(status)] || '待整理'
    },
    formatDateTime(value) {
      return String(value || '').replace('T', ' ').substring(0, 16)
    },
    formatFullDateTime(date) {
      const d = date instanceof Date ? date : new Date(date)
      const pad = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    },
    getDateKey(value) {
      return String(value || '').replace('T', ' ').substring(0, 10)
    },
    getTodayKey() {
      return this.formatFullDateTime(new Date()).substring(0, 10)
    },
    getTimeValue(value) {
      const time = new Date(String(value || '').replace(/\./g, '-')).getTime()
      return Number.isNaN(time) ? 0 : time
    },
    readStorageArray(key) {
      const raw = uni.getStorageSync(key)
      if (!raw) return []
      try {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        return []
      }
    },
    persistLocalFile(tempPath) {
      return new Promise((resolve) => {
        if (!tempPath) {
          resolve('')
          return
        }
        if (typeof uni.saveFile !== 'function') {
          resolve(tempPath)
          return
        }
        uni.saveFile({
          tempFilePath: tempPath,
          success: (res) => resolve((res && res.savedFilePath) || tempPath),
          fail: () => resolve(tempPath)
        })
      })
    },
    async persistVideoPathInBackground(videoId, tempPath) {
      if (!videoId || !tempPath) return
      const stablePath = await this.persistLocalFile(tempPath)
      const finalPath = stablePath || tempPath
      if (finalPath === tempPath) return
      const idx = this.videoList.findIndex((item) => item.id === videoId)
      if (idx === -1) return
      const next = this.normalizeVideo(Object.assign({}, this.videoList[idx], {
        tempFilePath: finalPath,
        localPath: finalPath,
        updatedAt: this.formatFullDateTime(new Date())
      }))
      this.videoList.splice(idx, 1, next)
      if (this.editorForm && this.editorForm.id === videoId) {
        this.editorForm.tempFilePath = finalPath
        this.editorForm.localPath = finalPath
      }
      this.saveList()
    },
    goBack() {
      uni.navigateBack({ delta: 1 })
    }
  }
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; max-height: 100vh; background: #0F172A; display: flex; flex-direction: column; overflow: hidden; }
.status-bar { background: #0F172A; flex-shrink: 0; }
.navbar, .picker, .card-top, .btn-row, .sheet-head, .sheet-foot { display: flex; align-items: center; }
.navbar { padding: 14rpx 24rpx; }
.nav-btn { width: 80rpx; color: rgba(255,255,255,0.7); font-size: 24rpx; }
.nav-btn.placeholder { opacity: 0; }
.nav-center { flex: 1; text-align: center; }
.nav-title { font-size: 30rpx; font-weight: 600; color: #fff; display: block; }
.nav-sub { font-size: 20rpx; color: rgba(255,255,255,0.38); }
.loc-bar { margin: 0 20rpx; padding: 12rpx 18rpx; border-radius: 12rpx; display: flex; gap: 10rpx; }
.loc-text { flex: 1; font-size: 22rpx; }
.loc-link { color: #93C5FD; font-size: 22rpx; }
.loc-bar.loading { background: rgba(37,99,235,0.12); color: #60A5FA; }
.loc-bar.success { background: rgba(16,185,129,0.12); color: #34D399; }
.loc-bar.failed { background: rgba(239,68,68,0.12); color: #F87171; }
.info-strip, .toolbar, .tag-row, .row { display: flex; gap: 12rpx; padding: 12rpx 20rpx 0; flex-wrap: wrap; }
.info-chip, .pill, .tag { padding: 8rpx 16rpx; border-radius: 24rpx; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.68); font-size: 20rpx; }
.info-chip-accent, .pill.active, .tag { background: rgba(37,99,235,0.18); color: #BFDBFE; }
.pill.small { min-height: 44rpx; }
.scroll { flex: 1; padding: 16rpx 20rpx; }
.record-card, .tip-card, .video-card, .sheet { background: rgba(255,255,255,0.05); border-radius: 18rpx; }
.record-card { padding: 22rpx; margin-bottom: 14rpx; border: 1rpx solid rgba(37,99,235,0.3); }
.record-title { display: block; font-size: 28rpx; font-weight: 600; color: #fff; margin-bottom: 6rpx; }
.record-desc, .tip-card text, .line, .clip-text, .meta { font-size: 22rpx; color: rgba(255,255,255,0.48); line-height: 1.5; }
.tip-card { padding: 16rpx 18rpx; margin-bottom: 18rpx; }
.section-title, .section-count { font-size: 24rpx; color: rgba(255,255,255,0.45); }
.section-head { display: flex; justify-content: space-between; margin-bottom: 12rpx; }
.video-card { padding: 20rpx; margin-bottom: 16rpx; border: 1rpx solid rgba(255,255,255,0.08); }
.video-card.discarded { opacity: 0.6; }
.card-top { gap: 16rpx; align-items: flex-start; }
.thumb { width: 150rpx; height: 108rpx; border-radius: 12rpx; background: linear-gradient(135deg,#1E293B,#334155); position: relative; display: flex; align-items: center; justify-content: center; color: #fff; }
.play-text { font-size: 24rpx; font-weight: 600; }
.duration, .evidence { position: absolute; padding: 4rpx 10rpx; border-radius: 12rpx; font-size: 18rpx; color: #fff; }
.duration { right: 8rpx; bottom: 8rpx; background: rgba(0,0,0,0.45); }
.evidence { left: 8rpx; top: 8rpx; background: rgba(220,38,38,0.9); }
.meta { flex: 1; min-width: 0; padding-top: 4rpx; }
.title { display: block; font-size: 24rpx; color: rgba(255,255,255,0.92); font-weight: 600; margin-bottom: 8rpx; }
.status { display: inline-block; margin-top: 8rpx; font-size: 20rpx; }
.status-draft { color: #FBBF24; }
.status-complete { color: #34D399; }
.status-discarded { color: #F87171; }
.clip-list { margin-top: 12rpx; display: flex; flex-direction: column; gap: 10rpx; }
.clip-item { padding: 12rpx 14rpx; background: rgba(255,255,255,0.04); border-radius: 12rpx; }
.clip-time { display: block; font-size: 20rpx; color: #93C5FD; margin-bottom: 4rpx; }
.btn-row { gap: 12rpx; margin-top: 16rpx; }
.btn { flex: 1; text-align: center; padding: 16rpx 0; border-radius: 12rpx; font-size: 24rpx; }
.btn.blue { background: rgba(37,99,235,0.18); color: #60A5FA; }
.btn.green { background: rgba(16,185,129,0.16); color: #34D399; }
.btn.red { background: rgba(239,68,68,0.14); color: #F87171; }
.empty { text-align: center; padding: 80rpx 40rpx; }
.empty-title { display: block; font-size: 28rpx; color: rgba(255,255,255,0.65); margin-bottom: 10rpx; }
.empty-desc { display: block; font-size: 22rpx; color: rgba(255,255,255,0.35); line-height: 1.6; }
.safe-bottom { height: 60rpx; }
.mask { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: flex-end; }
.sheet { width: 100%; max-height: 82vh; background: #111827; border-radius: 24rpx 24rpx 0 0; overflow: hidden; }
.sheet-head, .sheet-foot { justify-content: space-between; padding: 24rpx; }
.sheet-title { font-size: 30rpx; color: #fff; font-weight: 600; }
.sheet-close, .link { font-size: 22rpx; color: #93C5FD; }
.sheet-scroll { max-height: 58vh; padding: 0 24rpx 24rpx; }
.preview-box, .picker, .clip-edit { background: rgba(255,255,255,0.05); border-radius: 16rpx; }
.preview-box { height: 220rpx; margin: 24rpx 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: rgba(255,255,255,0.78); }
.preview-duration { margin-top: 8rpx; font-size: 20rpx; color: rgba(255,255,255,0.45); }
.field { margin-bottom: 22rpx; }
.label { display: block; font-size: 24rpx; color: rgba(255,255,255,0.82); margin-bottom: 12rpx; }
.label.inline { margin-bottom: 0; }
.textarea, .input { width: 100%; background: rgba(255,255,255,0.05); border-radius: 16rpx; color: #fff; padding: 18rpx; box-sizing: border-box; }
.textarea { min-height: 120rpx; }
.picker { justify-content: space-between; padding: 18rpx 20rpx; color: rgba(255,255,255,0.8); }
.section-topline { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.clip-edit { display: flex; gap: 8rpx; padding: 12rpx; margin-bottom: 10rpx; align-items: center; }
.input.time { width: 120rpx; }
.input.remark { flex: 1; }
.clip-del { width: 52rpx; text-align: center; color: #FCA5A5; }
.action { flex: 1; height: 84rpx; line-height: 84rpx; border-radius: 16rpx; font-size: 28rpx; }
.action::after { border: none; }
.action.light { background: rgba(255,255,255,0.08); color: #E5E7EB; }
.action.primary { background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%); color: #fff; }
</style>
