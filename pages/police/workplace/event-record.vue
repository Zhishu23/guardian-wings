<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
    <view class="navbar">
      <view class="nav-btn" @click="goBack">返回</view>
      <view class="nav-center">
        <text class="nav-title">事件包管理</text>
        <text class="nav-sub">事件包创建、编辑与流转</text>
      </view>
      <view class="nav-btn right" @click="createEvent">新建</view>
    </view>

    <scroll-view scroll-y class="scroll">
      <view class="stats-grid">
        <view class="stat-card"><text class="stat-num">{{ eventList.length }}</text><text class="stat-label">事件包总数</text></view>
        <view class="stat-card"><text class="stat-num">{{ pendingCount }}</text><text class="stat-label">待处理</text></view>
        <view class="stat-card"><text class="stat-num">{{ archivedCount }}</text><text class="stat-label">已归档</text></view>
        <view class="stat-card"><text class="stat-num">{{ reportList.length }}</text><text class="stat-label">报告数</text></view>
      </view>

      <view class="filter-row">
        <view v-for="item in filters" :key="item.value" class="filter-pill" :class="{ active: activeFilter === item.value }" @click="activeFilter = item.value">
          <text>{{ item.label }}</text>
        </view>
      </view>

      <view v-if="filteredEvents.length > 0">
        <view v-for="event in filteredEvents" :key="event.id" class="event-card" @click="editEvent(event)">
          <view class="event-head">
            <view class="event-main">
              <text class="event-title">{{ event.title || '未命名事件' }}</text>
              <text class="event-meta">{{ typeLabel(event.type) }} · {{ event.happenTime || event.updatedAt || event.createdAt || '未填写时间' }}</text>
            </view>
            <text class="badge" :class="'s-' + normalizeStatus(event.status)">{{ statusLabel(event.status) }}</text>
          </view>
          <text class="event-line">{{ event.locationText || '地点未填写' }}</text>
          <text class="event-line" v-if="event.description">{{ event.description }}</text>
          <view class="counts">
            <view class="count-chip"><text>照片 {{ eventPhotoCount(event) }}</text></view>
            <view class="count-chip"><text>视频 {{ eventVideoCount(event) }}</text></view>
            <view class="count-chip"><text>笔录 {{ eventTranscriptCount(event) }}</text></view>
            <view class="count-chip"><text>报告 {{ eventReportCount(event) }}</text></view>
          </view>
          <view class="actions" @click.stop="">
            <view class="action-btn" @click="editEvent(event)">编辑</view>
            <view class="action-btn" @click="openReport(event)">去成文</view>
            <view class="action-btn ghost" @click="archiveEvent(event)">归档</view>
            <view class="action-btn danger" @click="deleteEvent(event)">删除</view>
          </view>
        </view>
      </view>

      <view v-else class="empty">
        <text class="empty-title">还没有事件包</text>
        <text class="empty-desc">点击右上角“新建”开始创建事件包。</text>
      </view>

      <view class="safe-bottom" />
    </scroll-view>

    <view class="mask" v-if="editorVisible" @click="closeEditor">
      <view class="sheet" @click.stop>
        <view class="sheet-head">
          <text class="sheet-title">{{ form.id ? '编辑事件包' : '新建事件包' }}</text>
          <text class="sheet-close" @click="closeEditor">关闭</text>
        </view>

        <view class="sheet-scroll">
          <view class="section">
            <text class="label">事件标题</text>
            <textarea class="textarea compact" :value="form.title" maxlength="60" placeholder="如：湿地巡查发现疑似候鸟捕猎线索" @input="setField('title', $event.detail.value)" />
          </view>

          <view class="section">
            <text class="label">事件类型</text>
            <view class="chip-row">
              <view v-for="item in typeOptions" :key="item.value" class="chip" :class="{ active: form.type === item.value }" @click="form.type = item.value">
                <text>{{ item.label }}</text>
              </view>
            </view>
          </view>

          <view class="section">
            <text class="label">事件状态</text>
            <view class="chip-row">
              <view v-for="item in statusOptions" :key="item.value" class="chip" :class="{ active: form.status === item.value }" @click="form.status = item.value">
                <text>{{ item.label }}</text>
              </view>
            </view>
          </view>

          <view class="section">
            <text class="label">发生时间</text>
            <view class="picker-row">
              <picker mode="date" :value="happenDateValue" @change="onDateChange">
                <view class="picker-box"><text>{{ happenDateValue || '选择日期' }}</text></view>
              </picker>
              <picker mode="time" :value="happenClockValue" @change="onTimeChange">
                <view class="picker-box"><text>{{ happenClockValue || '选择时间' }}</text></view>
              </picker>
            </view>
            <text class="helper" v-if="form.happenTime">当前时间：{{ form.happenTime }}</text>
          </view>

          <view class="section">
            <text class="label">事发地点</text>
            <textarea class="textarea compact" :value="form.locationText" maxlength="80" placeholder="输入巡查区域、湿地、卡口或地标" @input="setField('locationText', $event.detail.value)" />
          </view>

          <view class="section">
            <text class="label">情况说明</text>
            <textarea class="textarea" :value="form.description" maxlength="300" placeholder="概述现场情况、目标对象、处置进展等" @input="setField('description', $event.detail.value)" />
          </view>

          <view class="section">
            <view class="line-head">
              <text class="label no-gap">关联照片</text>
              <text class="link" @click="pickMaterial('photo')">添加</text>
            </view>
            <text class="helper" v-if="linkedPhotos.length === 0">暂无关联照片</text>
            <view v-for="item in linkedPhotos" :key="item.id" class="material-item">
              <text class="material-name">{{ item.remark || item.batchTitle || item.id }}</text>
              <text class="remove-link" @click="removeLinked('photoIds', item.id)">移除</text>
            </view>
          </view>

          <view class="section">
            <view class="line-head">
              <text class="label no-gap">关联视频</text>
              <text class="link" @click="pickMaterial('video')">添加</text>
            </view>
            <text class="helper" v-if="linkedVideos.length === 0">暂无关联视频</text>
            <view v-for="item in linkedVideos" :key="item.id" class="material-item">
              <text class="material-name">{{ item.remark || item.durationStr || item.id }}</text>
              <text class="remove-link" @click="removeLinked('videoIds', item.id)">移除</text>
            </view>
          </view>

          <view class="section">
            <view class="line-head">
              <text class="label no-gap">关联笔录</text>
              <text class="link" @click="pickMaterial('transcript')">添加</text>
            </view>
            <text class="helper" v-if="linkedTranscripts.length === 0">暂无关联笔录</text>
            <view v-for="item in linkedTranscripts" :key="item.id" class="material-item">
              <text class="material-name">{{ item.title || item.summary || item.id }}</text>
              <text class="remove-link" @click="removeLinked('transcriptIds', item.id)">移除</text>
            </view>
          </view>
        </view>

        <view class="sheet-foot">
          <button class="foot-btn light" @click="closeEditor">取消</button>
          <button class="foot-btn primary" @click="saveEvent">保存事件包</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'EventRecord',
  data() {
    return {
      statusBarHeight: 0,
      activeFilter: 'all',
      editorVisible: false,
      eventList: [],
      photoList: [],
      videoList: [],
      transcriptList: [],
      reportList: [],
      filters: [
        { value: 'all', label: '全部' },
        { value: 'collecting', label: '采集中' },
        { value: 'pending_sort', label: '待整理' },
        { value: 'pending_report', label: '待成文' },
        { value: 'archived', label: '已归档' }
      ],
      typeOptions: [
        { value: 'patrol', label: '巡查处置' },
        { value: 'clue', label: '线索核查' },
        { value: 'poaching', label: '非法捕猎' },
        { value: 'rescue', label: '救助放归' },
        { value: 'other', label: '其他' }
      ],
      statusOptions: [
        { value: 'collecting', label: '采集中' },
        { value: 'pending_sort', label: '待整理' },
        { value: 'pending_report', label: '待成文' },
        { value: 'archived', label: '已归档' }
      ],
      form: {}
    }
  },
  computed: {
    filteredEvents() {
      const list = this.eventList.slice().sort((a, b) => this.timeValue(b.updatedAt || b.createdAt) - this.timeValue(a.updatedAt || a.createdAt))
      if (this.activeFilter === 'all') return list
      return list.filter((item) => this.normalizeStatus(item.status) === this.activeFilter)
    },
    pendingCount() {
      return this.eventList.filter((item) => ['collecting', 'pending_sort', 'pending_report'].includes(this.normalizeStatus(item.status))).length
    },
    archivedCount() {
      return this.eventList.filter((item) => this.normalizeStatus(item.status) === 'archived').length
    },
    linkedPhotos() {
      return this.photoList.filter((item) => this.form.photoIds.includes(item.id))
    },
    linkedVideos() {
      return this.videoList.filter((item) => this.form.videoIds.includes(item.id))
    },
    linkedTranscripts() {
      return this.transcriptList.filter((item) => this.form.transcriptIds.includes(item.id))
    },
    happenDateValue() {
      if (!this.form.happenTime) return ''
      return this.form.happenTime.split(' ')[0] || ''
    },
    happenClockValue() {
      if (!this.form.happenTime) return ''
      const part = this.form.happenTime.split(' ')[1] || ''
      return part ? part.slice(0, 5) : ''
    }
  },
  onLoad() {
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight
    this.resetForm()
    this.loadAll()
  },
  onShow() {
    this.loadAll()
  },
  methods: {
    emptyEvent() {
      return {
        id: '',
        title: '',
        type: 'patrol',
        locationText: '',
        happenTime: '',
        description: '',
        status: 'collecting',
        createdAt: '',
        updatedAt: '',
        photoIds: [],
        videoIds: [],
        transcriptIds: [],
        reportIds: []
      }
    },
    normalizeEvent(item) {
      const base = Object.assign({}, this.emptyEvent(), item || {})
      base.photoIds = Array.isArray(base.photoIds) ? base.photoIds : []
      base.videoIds = Array.isArray(base.videoIds) ? base.videoIds : []
      base.transcriptIds = Array.isArray(base.transcriptIds) ? base.transcriptIds : []
      base.reportIds = Array.isArray(base.reportIds) ? base.reportIds : []
      base.status = this.normalizeStatus(base.status)
      return base
    },
    resetForm() {
      const now = this.nowText()
      this.form = this.normalizeEvent({ createdAt: now, updatedAt: now })
    },
    loadAll() {
      this.eventList = this.readArray('gw_event_records').map((item) => this.normalizeEvent(item))
      this.photoList = this.readArray('gw_photo_records')
      this.videoList = this.readArray('gw_video_records')
      this.transcriptList = this.readArray('gw_transcript_records')
      this.reportList = this.readArray('gw_report_records')
    },
    readArray(key) {
      try {
        const raw = uni.getStorageSync(key)
        const parsed = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : []
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        return []
      }
    },
    writeArray(key, list) {
      uni.setStorageSync(key, JSON.stringify(list || []))
    },
    nowText() {
      const d = new Date()
      const p = (n) => String(n).padStart(2, '0')
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds())
    },
    genId() {
      const d = new Date()
      const p = (n) => String(n).padStart(2, '0')
      return 'EV' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds())
    },
    timeValue(value) {
      if (!value) return 0
      const t = new Date(String(value).replace(/-/g, '/')).getTime()
      return isNaN(t) ? 0 : t
    },
    setField(field, value) {
      this.$set(this.form, field, value)
    },
    onDateChange(e) {
      const date = e.detail.value
      const clock = this.happenClockValue || '00:00'
      this.setField('happenTime', date + ' ' + clock)
    },
    onTimeChange(e) {
      const clock = e.detail.value
      const date = this.happenDateValue || this.nowText().split(' ')[0]
      this.setField('happenTime', date + ' ' + clock)
    },
    createEvent() {
      this.resetForm()
      this.editorVisible = true
    },
    editEvent(item) {
      this.form = this.normalizeEvent(item)
      this.editorVisible = true
    },
    closeEditor() {
      this.editorVisible = false
    },
    saveEvent() {
      const title = (this.form.title || '').trim()
      if (!title) {
        uni.showToast({ title: '请填写事件标题', icon: 'none' })
        return
      }
      const list = this.eventList.slice()
      const now = this.nowText()
      const target = this.normalizeEvent(Object.assign({}, this.form, {
        id: this.form.id || this.genId(),
        title,
        updatedAt: now,
        createdAt: this.form.createdAt || now
      }))
      const index = list.findIndex((item) => item.id === target.id)
      if (index === -1) list.unshift(target)
      else list.splice(index, 1, target)
      this.eventList = list
      this.writeArray('gw_event_records', this.eventList)
      this.syncMaterials(target)
      this.loadAll()
      this.editorVisible = false
      uni.showToast({ title: '事件已保存', icon: 'success' })
    },
    syncMaterials(event) {
      this.photoList = this.syncOne(this.photoList, 'gw_photo_records', event.id, event.photoIds)
      this.videoList = this.syncOne(this.videoList, 'gw_video_records', event.id, event.videoIds)
      this.transcriptList = this.syncOne(this.transcriptList, 'gw_transcript_records', event.id, event.transcriptIds)
    },
    syncOne(list, key, eventId, selectedIds) {
      const next = list.map((item) => {
        const row = Object.assign({}, item)
        if (selectedIds.includes(item.id)) row.eventId = eventId
        else if (row.eventId === eventId) row.eventId = ''
        return row
      })
      this.writeArray(key, next)
      return next
    },
    pickMaterial(type) {
      const map = {
        photo: { field: 'photoIds', list: this.photoList.filter((item) => item.status !== 'discarded'), text: (item) => item.remark || item.batchTitle || item.id },
        video: { field: 'videoIds', list: this.videoList.filter((item) => item.status !== 'discarded'), text: (item) => item.remark || item.durationStr || item.id },
        transcript: { field: 'transcriptIds', list: this.transcriptList.filter((item) => item.status !== 'discarded'), text: (item) => item.title || item.summary || item.id }
      }
      const current = map[type]
      if (!current || current.list.length === 0) {
        uni.showToast({ title: '暂无可选素材', icon: 'none' })
        return
      }
      uni.showActionSheet({
        itemList: current.list.slice(0, 10).map(current.text),
        success: (res) => {
          const picked = current.list[res.tapIndex]
          if (!picked) return
          const ids = this.form[current.field].slice()
          if (!ids.includes(picked.id)) this.$set(this.form, current.field, ids.concat(picked.id))
        }
      })
    },
    removeLinked(field, id) {
      this.$set(this.form, field, this.form[field].filter((item) => item !== id))
    },
    normalizeStatus(status) {
      if (status === 'draft') return 'pending_sort'
      if (status === 'complete') return 'pending_report'
      return status || 'collecting'
    },
    statusLabel(status) {
      return {
        collecting: '采集中',
        pending_sort: '待整理',
        pending_report: '待成文',
        archived: '已归档'
      }[this.normalizeStatus(status)] || '采集中'
    },
    typeLabel(type) {
      return {
        patrol: '巡查处置',
        clue: '线索核查',
        poaching: '非法捕猎',
        rescue: '救助放归',
        other: '其他'
      }[type] || '其他'
    },
    eventPhotoCount(event) {
      return Array.isArray(event.photoIds) && event.photoIds.length ? event.photoIds.length : this.photoList.filter((item) => item.eventId === event.id).length
    },
    eventVideoCount(event) {
      return Array.isArray(event.videoIds) && event.videoIds.length ? event.videoIds.length : this.videoList.filter((item) => item.eventId === event.id).length
    },
    eventTranscriptCount(event) {
      return Array.isArray(event.transcriptIds) && event.transcriptIds.length ? event.transcriptIds.length : this.transcriptList.filter((item) => item.eventId === event.id).length
    },
    eventReportCount(event) {
      return Array.isArray(event.reportIds) && event.reportIds.length ? event.reportIds.length : this.reportList.filter((item) => item.eventId === event.id).length
    },
    archiveEvent(event) {
      const next = this.normalizeEvent(Object.assign({}, event, { status: 'archived', updatedAt: this.nowText() }))
      const list = this.eventList.slice()
      const idx = list.findIndex((item) => item.id === event.id)
      if (idx > -1) {
        list.splice(idx, 1, next)
        this.eventList = list
        this.writeArray('gw_event_records', this.eventList)
        uni.showToast({ title: '已归档', icon: 'success' })
      }
    },
    deleteEvent(event) {
      uni.showModal({
        title: '删除事件包',
        content: '删除后将解除素材关联且不可恢复，是否继续？',
        success: (res) => {
          if (!res.confirm) return
          this.eventList = this.eventList.filter((item) => item.id !== event.id)
          this.writeArray('gw_event_records', this.eventList)
          this.syncMaterials(this.normalizeEvent(Object.assign({}, event, {
            photoIds: [],
            videoIds: [],
            transcriptIds: [],
            reportIds: []
          })))
          this.loadAll()
          uni.showToast({ title: '已删除', icon: 'success' })
        }
      })
    },
    goBack() {
      uni.navigateBack({ delta: 1 })
    },
    openReport(event) {
      uni.navigateTo({ url: '/pages/police/workplace/report-generate?eventId=' + (event.id || this.form.id) })
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #eef3fb; color: #1f2937; display: flex; flex-direction: column; }
.status-bar, .navbar { background: linear-gradient(135deg, #0f2f6b, #1d4ed8); }
.navbar { height: 88rpx; padding: 0 24rpx; display: flex; align-items: center; color: #fff; }
.nav-btn { width: 88rpx; font-size: 26rpx; }
.nav-btn.right { text-align: right; font-weight: 600; }
.nav-center { flex: 1; display: flex; flex-direction: column; align-items: center; }
.nav-title { font-size: 32rpx; font-weight: 700; }
.nav-sub { font-size: 20rpx; opacity: 0.88; }
.scroll { flex: 1; padding: 20rpx 24rpx; box-sizing: border-box; }
.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16rpx; }
.stat-card { background: #fff; border: 1rpx solid #e6edf6; border-radius: 20rpx; padding: 24rpx; box-shadow: 0 12rpx 26rpx rgba(15,23,42,0.06); }
.stat-num { display: block; font-size: 40rpx; font-weight: 700; color: #1d4ed8; }
.stat-label { display: block; margin-top: 8rpx; font-size: 22rpx; color: #64748b; }
.filter-row, .counts, .actions, .chip-row, .picker-row { display: flex; flex-wrap: wrap; gap: 12rpx; }
.filter-row { margin-top: 18rpx; }
.filter-pill, .count-chip, .chip { padding: 14rpx 20rpx; border-radius: 999rpx; font-size: 22rpx; }
.filter-pill { background: #e2e8f0; color: #475569; }
.filter-pill.active, .chip.active { background: #1d4ed8; color: #fff; }
.event-card { margin-top: 18rpx; padding: 24rpx; background: #fff; border: 1rpx solid #e6edf6; border-radius: 22rpx; box-shadow: 0 10rpx 24rpx rgba(15,23,42,0.06); }
.event-head { display: flex; justify-content: space-between; gap: 16rpx; }
.event-main { flex: 1; }
.event-title { display: block; font-size: 28rpx; font-weight: 700; color: #111827; }
.event-meta, .event-line { display: block; margin-top: 8rpx; font-size: 22rpx; color: #64748b; line-height: 1.7; }
.badge { padding: 6rpx 14rpx; border-radius: 999rpx; font-size: 20rpx; white-space: nowrap; }
.s-collecting { background: rgba(59,130,246,0.12); color: #2563eb; }
.s-pending_sort { background: rgba(245,158,11,0.14); color: #d97706; }
.s-pending_report { background: rgba(16,185,129,0.14); color: #059669; }
.s-archived { background: rgba(100,116,139,0.14); color: #475569; }
.count-chip { background: #f1f5f9; color: #334155; }
.action-btn { flex: 1; text-align: center; padding: 14rpx 0; border-radius: 14rpx; background: #eff6ff; color: #1d4ed8; font-size: 24rpx; }
.action-btn.ghost { background: #f8fafc; color: #64748b; }
.action-btn.danger { background: rgba(239,68,68,0.12); color: #DC2626; }
.empty { margin-top: 20rpx; padding: 60rpx 30rpx; background: #fff; border: 1rpx solid #e6edf6; border-radius: 22rpx; text-align: center; }
.empty-title { display: block; font-size: 30rpx; font-weight: 700; color: #0f172a; }
.empty-desc { display: block; margin-top: 12rpx; font-size: 23rpx; color: #64748b; }
.safe-bottom { height: 120rpx; }
.mask { position: fixed; inset: 0; background: rgba(15,23,42,0.42); display: flex; align-items: flex-end; z-index: 99; }
.sheet { width: 100%; max-height: 88vh; background: #fff; border-radius: 30rpx 30rpx 0 0; overflow: hidden; }
.sheet-head { height: 96rpx; padding: 0 24rpx; display: flex; align-items: center; justify-content: space-between; border-bottom: 2rpx solid #eef2f7; }
.sheet-title { font-size: 30rpx; font-weight: 700; color: #111827; }
.sheet-close { font-size: 24rpx; color: #64748b; }
.sheet-scroll { max-height: calc(88vh - 180rpx); overflow-y: auto; padding: 24rpx; box-sizing: border-box; }
.section { margin-bottom: 22rpx; }
.line-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10rpx; }
.label { display: block; margin-bottom: 10rpx; font-size: 24rpx; color: #334155; font-weight: 600; }
.label.no-gap { margin-bottom: 0; }
.textarea { width: 100%; min-height: 170rpx; padding: 18rpx; box-sizing: border-box; background: #f8fafc; border-radius: 16rpx; font-size: 25rpx; color: #111827; }
.textarea.compact { min-height: 92rpx; }
.picker-box { min-width: 220rpx; padding: 18rpx; background: #f8fafc; border-radius: 16rpx; font-size: 24rpx; color: #111827; text-align: center; }
.helper { display: block; margin-top: 10rpx; font-size: 22rpx; color: #94a3b8; }
.link { font-size: 23rpx; color: #2563eb; }
.material-item { display: flex; align-items: center; justify-content: space-between; gap: 12rpx; margin-top: 10rpx; padding: 16rpx 18rpx; border-radius: 16rpx; background: #f8fafc; }
.material-name { flex: 1; font-size: 23rpx; color: #334155; line-height: 1.6; }
.remove-link { font-size: 22rpx; color: #ef4444; }
.sheet-foot { display: flex; gap: 16rpx; padding: 18rpx 24rpx 28rpx; border-top: 2rpx solid #eef2f7; }
.foot-btn { flex: 1; border-radius: 16rpx; font-size: 26rpx; }
.foot-btn.light { background: #eef2f7; color: #334155; }
.foot-btn.primary { background: #0f766e; color: #fff; }
</style>
