<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
    <view class="navbar">
      <view class="nav-btn" @click="goBack">返回</view>
      <view class="nav-center">
        <text class="nav-title">笔录记录</text>
        <text class="nav-sub">{{ current.id || '新建笔录' }}</text>
      </view>
      <view class="nav-btn submit" @click="onSubmit">完成</view>
    </view>

    <scroll-view scroll-y class="scroll">
      <view class="header-card">
        <view>
          <text class="hc-id">{{ current.id }}</text>
          <text class="hc-time">更新时间：{{ current.updatedAt || current.createdAt }}</text>
        </view>
        <view class="hc-status" :class="'hs-' + current.status">
          <text>{{ statusLabel(current.status) }}</text>
        </view>
      </view>

      <view class="section">
        <text class="sec-label">模板</text>
        <view class="row">
          <view
            v-for="tmpl in templates"
            :key="tmpl.value"
            class="pill"
            :class="{ active: current.template === tmpl.value }"
            @click="applyTemplate(tmpl)"
          >
            <text>{{ tmpl.label }}</text>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="sec-label">基础信息</text>
        <view class="field-card">
          <text class="field-label">标题</text>
          <input class="field-input" :value="current.title" placeholder="输入笔录标题" @input="setField('title', $event.detail.value)" />
        </view>
        <view class="field-card">
          <text class="field-label">归属事件</text>
          <view class="field-picker" @click="pickEvent">
            <text>{{ selectedEventLabel }}</text>
            <text class="link">选择</text>
          </view>
        </view>
        <view class="grid">
          <view class="field-card">
            <text class="field-label">记录时间</text>
            <input class="field-input" :value="current.recordTime" placeholder="如：2026-04-15 09:30" @input="setField('recordTime', $event.detail.value)" />
          </view>
          <view class="field-card">
            <text class="field-label">记录对象</text>
            <input class="field-input" :value="current.targetName" placeholder="如：巡查对象/问询对象" @input="setField('targetName', $event.detail.value)" />
          </view>
        </view>
        <view class="field-card">
          <text class="field-label">地点</text>
          <view class="field-picker">
            <input class="field-input flex-1" :value="current.locationText" placeholder="输入地点描述" @input="setField('locationText', $event.detail.value)" />
            <text class="link" @click.stop="autoFillLocation">定位</text>
          </view>
        </view>
        <view class="field-card">
          <text class="field-label">参与人员</text>
          <input class="field-input" :value="participantsText" placeholder="多名人员用顿号分隔" @input="updateParticipants($event.detail.value)" />
        </view>
      </view>

      <view class="section">
        <text class="sec-label">结构化内容</text>
        <view class="field-card">
          <text class="field-label">情况摘要</text>
          <textarea class="field-textarea small" :value="current.summary" placeholder="输入摘要" @input="setField('summary', $event.detail.value)" />
        </view>
        <view class="field-card">
          <text class="field-label">详细笔录</text>
          <textarea class="field-textarea" :value="current.content" placeholder="输入详细笔录内容" @input="setField('content', $event.detail.value)" />
        </view>
        <view class="field-card">
          <text class="field-label">后续建议</text>
          <textarea class="field-textarea small" :value="current.suggestion" placeholder="输入后续建议" @input="setField('suggestion', $event.detail.value)" />
        </view>
      </view>

      <view class="section">
        <text class="sec-label">常用短语</text>
        <view class="row">
          <view v-for="phrase in phrases" :key="phrase" class="phrase-pill" @click="insertPhrase(phrase)">
            <text>{{ phrase }}</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="sec-head">
          <text class="sec-label">关联素材</text>
          <text class="sec-meta">照片 {{ linkedPhotos.length }} · 视频 {{ linkedVideos.length }}</text>
        </view>
        <view class="field-card">
          <view class="material-line">
            <text>关联照片</text>
            <text class="link" @click="pickPhotos">选择</text>
          </view>
          <text class="material-desc" v-if="linkedPhotos.length === 0">暂未关联照片</text>
          <view v-else class="material-list">
            <view v-for="photo in linkedPhotos" :key="photo.id" class="material-item">
              <text>{{ photo.remark || photo.batchTitle || '照片' }}</text>
              <text class="mini-link" @click="removeLinkedPhoto(photo.id)">移除</text>
            </view>
          </view>
        </view>
        <view class="field-card">
          <view class="material-line">
            <text>关联视频</text>
            <text class="link" @click="pickVideos">选择</text>
          </view>
          <text class="material-desc" v-if="linkedVideos.length === 0">暂未关联视频</text>
          <view v-else class="material-list">
            <view v-for="video in linkedVideos" :key="video.id" class="material-item">
              <text>{{ video.remark || video.durationStr || '视频' }}</text>
              <text class="mini-link" @click="removeLinkedVideo(video.id)">移除</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="sec-label">其他笔录</text>
        <view class="other-list" v-if="otherTranscripts.length > 0">
          <view v-for="item in otherTranscripts" :key="item.id" class="other-item" @click="switchTo(item)">
            <view class="other-main">
              <text class="other-id">{{ item.id }}</text>
              <text class="other-desc">{{ item.title || item.summary || '未命名笔录' }}</text>
            </view>
            <view class="hc-status" :class="'hs-' + item.status">
              <text>{{ statusLabel(item.status) }}</text>
            </view>
          </view>
        </view>
        <view class="empty-line" v-else>
          <text>暂无其他笔录</text>
        </view>
      </view>

      <view class="safe-bottom" />
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'Transcript',
  data() {
    return {
      statusBarHeight: 0,
      officerId: 'GW-2025-0312',
      allTranscripts: [],
      eventOptions: [],
      photoOptions: [],
      videoOptions: [],
      current: this.createEmpty(),
      templates: [
        { value: 'patrol', label: '现场巡查记录', summary: '记录巡查时间、地点、发现情况与处置情况。' },
        { value: 'clue', label: '线索核查记录', summary: '记录线索来源、核查过程及现场发现。' },
        { value: 'investigation', label: '案件初查记录', summary: '记录初查对象、现场情况和初步处置意见。' },
        { value: 'inquiry', label: '问询笔录简版', summary: '记录被问询对象、问询时间地点和要点。' },
        { value: 'custom', label: '自定义', summary: '' }
      ],
      phrases: [
        '已到达现场开展巡查',
        '现场未发现明显异常',
        '已固定现场影像资料',
        '已对周边人员开展询问',
        '已对重点区域进行查看',
        '建议后续持续巡查'
      ]
    }
  },
  computed: {
    otherTranscripts() {
      return this.allTranscripts.filter((item) => item.id !== this.current.id)
    },
    participantsText() {
      return Array.isArray(this.current.participants) ? this.current.participants.join('、') : ''
    },
    selectedEventLabel() {
      if (!this.current.eventId) return '未归档'
      const found = this.eventOptions.find((item) => item.id === this.current.eventId)
      return found ? found.title : '未归档'
    },
    linkedPhotos() {
      return this.photoOptions.filter((item) => this.current.linkedPhotoIds.includes(item.id))
    },
    linkedVideos() {
      return this.videoOptions.filter((item) => this.current.linkedVideoIds.includes(item.id))
    }
  },
  onLoad(query) {
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight
    this.loadOfficerInfo()
    this.loadRelatedData()
    if (query && query.editId) {
      const found = this.allTranscripts.find((item) => item.id === query.editId)
      if (found) {
        this.current = this.normalizeTranscript(found)
        return
      }
    }
    this.current = this.createNew()
    this.allTranscripts.unshift(this.current)
    this.saveAll()
  },
  onShow() {
    this.loadRelatedData()
  },
  methods: {
    createEmpty() {
      return {
        id: '',
        type: 'transcript',
        template: '',
        title: '',
        targetName: '',
        eventId: '',
        recordTime: '',
        locationText: '',
        participants: [],
        summary: '',
        content: '',
        suggestion: '',
        linkedPhotoIds: [],
        linkedVideoIds: [],
        linkedReportIds: [],
        status: 'draft',
        createdAt: '',
        updatedAt: '',
        officerId: this.officerId,
        synced: false
      }
    },
    createNew() {
      const now = this.formatDateTime(new Date())
      return this.normalizeTranscript({
        id: this.genId(),
        createdAt: now,
        updatedAt: now,
        officerId: this.officerId
      })
    },
    normalizeTranscript(item) {
      const base = Object.assign({}, this.createEmpty(), item || {})
      base.participants = Array.isArray(base.participants) ? base.participants : []
      base.linkedPhotoIds = Array.isArray(base.linkedPhotoIds) ? base.linkedPhotoIds : []
      base.linkedVideoIds = Array.isArray(base.linkedVideoIds) ? base.linkedVideoIds : []
      base.linkedReportIds = Array.isArray(base.linkedReportIds) ? base.linkedReportIds : []
      base.createdAt = base.createdAt || this.formatDateTime(new Date())
      base.updatedAt = base.updatedAt || base.createdAt
      return base
    },
    genId() {
      const d = new Date()
      const p = (n) => String(n).padStart(2, '0')
      return `GW-T-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${Math.floor(Math.random() * 9000 + 1000)}`
    },
    loadOfficerInfo() {
      try {
        const raw = uni.getStorageSync('gw_police_info')
        const info = raw ? JSON.parse(raw) : {}
        if (info.officer_id) this.officerId = info.officer_id
      } catch (e) {}
    },
    loadRelatedData() {
      this.loadAll()
      this.eventOptions = this.readStorageArray('gw_event_records').map((item) => ({ id: item.id, title: item.title || item.description || '未命名事件' }))
      this.photoOptions = this.readStorageArray('gw_photo_records')
      this.videoOptions = this.readStorageArray('gw_video_records')
      this.allTranscripts = this.allTranscripts.map((item) => this.normalizeTranscript(item))
      if (this.current.id) {
        const latest = this.allTranscripts.find((item) => item.id === this.current.id)
        if (latest) this.current = this.normalizeTranscript(latest)
      }
    },
    statusLabel(status) {
      return { draft: '草稿', complete: '已完成', linked: '已入报告' }[status] || '草稿'
    },
    applyTemplate(tmpl) {
      this.current.template = tmpl.value
      if (!this.current.title) this.current.title = tmpl.label
      if (!this.current.summary && tmpl.summary) this.current.summary = tmpl.summary
      this.autoSave()
    },
    setField(field, value) {
      this.current[field] = value
      this.autoSave()
    },
    updateParticipants(value) {
      this.current.participants = value ? value.split(/[、，,]/).map((item) => item.trim()).filter(Boolean) : []
      this.autoSave()
    },
    autoFillLocation() {
      uni.getLocation({
        type: 'wgs84',
        success: (res) => {
          this.current.locationText = '纬度 ' + res.latitude.toFixed(5) + ', 经度 ' + res.longitude.toFixed(5)
          this.autoSave()
        },
        fail: () => uni.showToast({ title: '定位失败', icon: 'none' })
      })
    },
    insertPhrase(phrase) {
      this.current.content = (this.current.content ? this.current.content + '\n' : '') + phrase
      this.autoSave()
    },
    pickEvent() {
      const list = ['不归档'].concat(this.eventOptions.map((item) => item.title))
      uni.showActionSheet({
        itemList: list,
        success: (res) => {
          if (res.tapIndex === 0) {
            this.current.eventId = ''
          } else {
            const target = this.eventOptions[res.tapIndex - 1]
            this.current.eventId = target ? target.id : ''
          }
          this.autoSave()
        }
      })
    },
    pickPhotos() {
      if (this.photoOptions.length === 0) {
        uni.showToast({ title: '暂无可选照片', icon: 'none' })
        return
      }
      const list = this.photoOptions.slice(0, 8).map((item) => item.remark || item.batchTitle || item.id)
      uni.showActionSheet({
        itemList: list,
        success: (res) => {
          const target = this.photoOptions[res.tapIndex]
          if (!target) return
          if (!this.current.linkedPhotoIds.includes(target.id)) {
            this.current.linkedPhotoIds.push(target.id)
            this.autoSave()
          }
        }
      })
    },
    pickVideos() {
      if (this.videoOptions.length === 0) {
        uni.showToast({ title: '暂无可选视频', icon: 'none' })
        return
      }
      const list = this.videoOptions.slice(0, 8).map((item) => item.remark || item.durationStr || item.id)
      uni.showActionSheet({
        itemList: list,
        success: (res) => {
          const target = this.videoOptions[res.tapIndex]
          if (!target) return
          if (!this.current.linkedVideoIds.includes(target.id)) {
            this.current.linkedVideoIds.push(target.id)
            this.autoSave()
          }
        }
      })
    },
    removeLinkedPhoto(id) {
      this.current.linkedPhotoIds = this.current.linkedPhotoIds.filter((item) => item !== id)
      this.autoSave()
    },
    removeLinkedVideo(id) {
      this.current.linkedVideoIds = this.current.linkedVideoIds.filter((item) => item !== id)
      this.autoSave()
    },
    switchTo(item) {
      this.current = this.normalizeTranscript(item)
    },
    onSubmit() {
      if (!this.current.content && !this.current.summary) {
        uni.showToast({ title: '请先填写内容', icon: 'none' })
        return
      }
      this.current.status = 'complete'
      this.autoSave()
      uni.showToast({ title: '笔录已完成', icon: 'success' })
    },
    autoSave() {
      this.current.updatedAt = this.formatDateTime(new Date())
      const idx = this.allTranscripts.findIndex((item) => item.id === this.current.id)
      if (idx === -1) this.allTranscripts.unshift(this.normalizeTranscript(this.current))
      else this.allTranscripts.splice(idx, 1, this.normalizeTranscript(this.current))
      this.saveAll()
    },
    saveAll() {
      try {
        uni.setStorageSync('gw_transcript_records', JSON.stringify(this.allTranscripts))
      } catch (e) {
        uni.showToast({ title: '存储失败', icon: 'none' })
      }
    },
    loadAll() {
      this.allTranscripts = this.readStorageArray('gw_transcript_records')
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
    formatDateTime(date) {
      const d = date instanceof Date ? date : new Date(date)
      const pad = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
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
.navbar, .field-picker, .sec-head, .other-item, .sheet-line { display: flex; align-items: center; }
.navbar { padding: 14rpx 24rpx; }
.nav-btn { width: 88rpx; color: rgba(255,255,255,0.72); font-size: 24rpx; }
.nav-btn.submit { color: #34D399; text-align: right; }
.nav-center { flex: 1; text-align: center; }
.nav-title { display: block; font-size: 30rpx; font-weight: 600; color: #fff; }
.nav-sub { display: block; font-size: 20rpx; color: rgba(255,255,255,0.38); }
.scroll { flex: 1; padding: 16rpx 20rpx; }
.header-card, .field-card, .other-item { background: rgba(255,255,255,0.04); border: 1rpx solid rgba(255,255,255,0.08); border-radius: 16rpx; }
.header-card { display: flex; justify-content: space-between; align-items: center; padding: 18rpx 20rpx; margin-bottom: 20rpx; }
.hc-id { display: block; font-size: 24rpx; font-weight: 700; color: rgba(255,255,255,0.8); }
.hc-time { display: block; font-size: 20rpx; color: rgba(255,255,255,0.32); margin-top: 4rpx; }
.hc-status { padding: 6rpx 16rpx; border-radius: 12rpx; font-size: 20rpx; }
.hs-draft { background: rgba(245,158,11,0.14); color: #FBBF24; }
.hs-complete, .hs-linked { background: rgba(16,185,129,0.14); color: #34D399; }
.section { margin-bottom: 24rpx; }
.sec-label { display: block; font-size: 22rpx; font-weight: 600; color: rgba(255,255,255,0.45); margin-bottom: 12rpx; }
.sec-head { justify-content: space-between; margin-bottom: 12rpx; }
.sec-meta { font-size: 20rpx; color: rgba(255,255,255,0.3); }
.row, .grid, .material-list { display: flex; gap: 12rpx; flex-wrap: wrap; }
.grid { flex-direction: row; }
.grid .field-card { flex: 1; min-width: 0; }
.pill, .phrase-pill { display: inline-flex; align-items: center; justify-content: center; min-height: 46rpx; padding: 0 18rpx; border-radius: 24rpx; background: rgba(255,255,255,0.06); border: 1rpx solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.65); font-size: 22rpx; }
.pill.active, .phrase-pill { background: rgba(37,99,235,0.18); border-color: rgba(37,99,235,0.35); color: #93C5FD; }
.field-card { padding: 16rpx; margin-bottom: 12rpx; }
.field-label { display: block; font-size: 22rpx; color: rgba(255,255,255,0.58); margin-bottom: 10rpx; }
.field-input, .field-textarea { width: 100%; background: rgba(255,255,255,0.05); border-radius: 12rpx; color: rgba(255,255,255,0.86); padding: 14rpx 16rpx; box-sizing: border-box; }
.field-picker { justify-content: space-between; gap: 12rpx; color: rgba(255,255,255,0.86); }
.field-input.flex-1 { flex: 1; }
.field-textarea { min-height: 180rpx; }
.field-textarea.small { min-height: 100rpx; }
.link, .mini-link { color: #93C5FD; font-size: 22rpx; }
.material-line { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10rpx; color: rgba(255,255,255,0.8); }
.material-desc, .empty-line text { font-size: 22rpx; color: rgba(255,255,255,0.32); }
.material-item { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 12rpx 14rpx; background: rgba(255,255,255,0.05); border-radius: 12rpx; color: rgba(255,255,255,0.72); font-size: 22rpx; }
.other-list { display: flex; flex-direction: column; gap: 10rpx; }
.other-item { justify-content: space-between; padding: 14rpx 16rpx; }
.other-main { flex: 1; min-width: 0; }
.other-id { display: block; font-size: 21rpx; color: rgba(255,255,255,0.6); }
.other-desc { display: block; font-size: 20rpx; color: rgba(255,255,255,0.36); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4rpx; }
.safe-bottom { height: 60rpx; }
</style>
