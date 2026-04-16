<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
    <view class="navbar">
      <view class="nav-btn" @click="goBack">返回</view>
      <view class="nav-center">
        <text class="nav-title">笔录记录</text>
        <text class="nav-sub">{{ currentTemplateText }}</text>
      </view>
      <view class="nav-actions">
        <text class="nav-btn light" @click="startNew">新建</text>
        <text class="nav-btn submit" @click="onSubmit">完成</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll">
      <view class="header-card">
        <view class="header-main">
          <view class="hc-title-row">
            <text class="hc-title">{{ current.title || '新建笔录' }}</text>
            <text class="title-switch-btn" @click="openTranscriptPicker">切换</text>
          </view>
          <text class="hc-id">模板：{{ currentTemplateText }}</text>
          <text class="hc-time">更新时间：{{ current.updatedAt || current.createdAt }}</text>
        </view>
        <view class="header-right">
          <view class="hc-status" :class="'hs-' + current.status">
            <text>{{ statusLabel(current.status) }}</text>
          </view>
          <view class="header-actions">
            <text class="link" @click="startNew">新建笔录</text>
            <text class="link" @click="onSaveDraft">保存草稿</text>
            <text class="danger-link" v-if="isExistingTranscript" @click="deleteCurrent">删除</text>
          </view>
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
      isExistingTranscript: false,
      baselineSnapshot: '',
      eventOptions: [],
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
    currentTemplateText() {
      const found = this.templates.find((item) => item.value === this.current.template)
      return found ? found.label : '未选择模板'
    }
  },
  onLoad(query) {
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight
    this.loadOfficerInfo()
    this.loadRelatedData()
    if (query && query.mode === 'new') {
      this.current = this.createNew()
      this.isExistingTranscript = false
      this.baselineSnapshot = this.serializeCurrent(this.current)
      return
    }
    if (query && query.editId) {
      const found = this.allTranscripts.find((item) => item.id === query.editId)
      if (found) {
        this.current = this.normalizeTranscript(found)
        this.isExistingTranscript = true
        this.baselineSnapshot = this.serializeCurrent(this.current)
        return
      }
    }
    const preferred = this.pickPreferredTranscript()
    if (preferred) {
      this.current = this.normalizeTranscript(preferred)
      this.isExistingTranscript = true
      this.baselineSnapshot = this.serializeCurrent(this.current)
      return
    }
    this.current = this.createNew()
    this.isExistingTranscript = false
    this.baselineSnapshot = this.serializeCurrent(this.current)
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
    pickPreferredTranscript() {
      if (!Array.isArray(this.allTranscripts) || this.allTranscripts.length === 0) return null
      const sorted = this.allTranscripts
        .slice()
        .sort((a, b) => this.timeValue(b.updatedAt || b.createdAt) - this.timeValue(a.updatedAt || a.createdAt))
      const draft = sorted.find((item) => (item.status || 'draft') === 'draft')
      return draft || sorted[0]
    },
    timeValue(value) {
      if (!value) return 0
      const t = new Date(String(value).replace(/-/g, '/')).getTime()
      return Number.isNaN(t) ? 0 : t
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
    openTranscriptPicker() {
      if (!Array.isArray(this.allTranscripts) || this.allTranscripts.length === 0) {
        uni.showToast({ title: '暂无可切换笔录', icon: 'none' })
        return
      }
      const records = this.allTranscripts.slice().sort((a, b) => this.timeValue(b.updatedAt || b.createdAt) - this.timeValue(a.updatedAt || a.createdAt))
      const list = records.slice(0, 10).map((item) => item.title || item.summary || item.createdAt || '未命名笔录')
      uni.showActionSheet({
        itemList: list,
        success: (res) => {
          const target = records[res.tapIndex]
          if (!target || target.id === this.current.id) return
          if (this.isDirty()) {
            uni.showModal({
              title: '当前内容未保存',
              content: '是否先保存当前笔录，再切换？',
              success: (modalRes) => {
                if (modalRes.confirm) this.onSaveDraft()
                this.switchTo(target)
              }
            })
            return
          }
          this.switchTo(target)
        }
      })
    },
    switchTo(item) {
      this.current = this.normalizeTranscript(item)
      this.isExistingTranscript = true
      this.baselineSnapshot = this.serializeCurrent(this.current)
    },
    startNew() {
      if (this.isDirty()) {
        uni.showModal({
          title: '当前内容未保存',
          content: '是否先保存草稿，再新建笔录？',
          success: (res) => {
            if (res.confirm) this.onSaveDraft()
            this.current = this.createNew()
            this.isExistingTranscript = false
            this.baselineSnapshot = this.serializeCurrent(this.current)
          }
        })
        return
      }
      this.current = this.createNew()
      this.isExistingTranscript = false
      this.baselineSnapshot = this.serializeCurrent(this.current)
    },
    onSubmit() {
      if (!this.current.content && !this.current.summary) {
        uni.showToast({ title: '请先填写内容', icon: 'none' })
        return
      }
      this.current.status = 'complete'
      this.persistCurrent()
      uni.showToast({ title: '笔录已完成', icon: 'success' })
    },
    onSaveDraft() {
      this.current.status = 'draft'
      this.persistCurrent()
      uni.showToast({ title: '草稿已保存', icon: 'success' })
    },
    autoSave() {
      this.current.updatedAt = this.formatDateTime(new Date())
    },
    persistCurrent() {
      this.current.updatedAt = this.formatDateTime(new Date())
      const next = this.normalizeTranscript(this.current)
      const idx = this.allTranscripts.findIndex((item) => item.id === next.id)
      if (idx === -1) this.allTranscripts.unshift(next)
      else this.allTranscripts.splice(idx, 1, next)
      this.current = next
      this.saveAll()
      this.isExistingTranscript = true
      this.baselineSnapshot = this.serializeCurrent(this.current)
    },
    serializeCurrent(item) {
      const base = this.normalizeTranscript(item || this.current)
      return JSON.stringify({
        template: base.template,
        title: base.title,
        targetName: base.targetName,
        eventId: base.eventId,
        recordTime: base.recordTime,
        locationText: base.locationText,
        participants: base.participants.slice().sort(),
        summary: base.summary,
        content: base.content,
        suggestion: base.suggestion,
        linkedPhotoIds: base.linkedPhotoIds.slice().sort(),
        linkedVideoIds: base.linkedVideoIds.slice().sort(),
        linkedReportIds: base.linkedReportIds.slice().sort(),
        status: base.status
      })
    },
    isDirty() {
      return this.serializeCurrent(this.current) !== this.baselineSnapshot
    },
    deleteCurrent() {
      if (!this.isExistingTranscript) return
      uni.showModal({
        title: '删除笔录',
        content: '删除后不可恢复，是否继续？',
        success: (res) => {
          if (!res.confirm) return
          this.allTranscripts = this.allTranscripts.filter((item) => item.id !== this.current.id)
          this.saveAll()
          uni.showToast({ title: '已删除', icon: 'success' })
          uni.navigateBack({ delta: 1 })
        }
      })
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
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
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
      if (!this.isDirty()) {
        uni.navigateBack({ delta: 1 })
        return
      }
      uni.showActionSheet({
        itemList: this.isExistingTranscript ? ['保存并返回', '不保存并返回', '删除草稿'] : ['保存并返回', '不保存并返回'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.onSaveDraft()
            uni.navigateBack({ delta: 1 })
          } else if (res.tapIndex === 1) {
            uni.navigateBack({ delta: 1 })
          } else if (res.tapIndex === 2) {
            this.deleteCurrent()
          }
        },
        fail: () => {
          uni.navigateBack({ delta: 1 })
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; background: #eef3fb; display: flex; flex-direction: column; color: #0f172a; }
.status-bar { background: linear-gradient(135deg, #0f2f6b, #1d4ed8); flex-shrink: 0; }
.navbar, .field-picker, .sec-head, .other-item, .sheet-line { display: flex; align-items: center; }
.navbar { padding: 14rpx 24rpx; background: linear-gradient(135deg, #0f2f6b, #1d4ed8); }
.nav-actions { width: 192rpx; display: flex; justify-content: flex-end; gap: 12rpx; }
.nav-btn { min-width: 88rpx; color: rgba(255,255,255,0.86); font-size: 24rpx; text-align: right; line-height: 1.35; }
.nav-btn.light { color: #bfdbfe; }
.nav-btn.submit { color: #86efac; text-align: right; font-weight: 600; }
.nav-center { flex: 1; text-align: center; min-width: 0; }
.nav-title { display: block; font-size: 34rpx; font-weight: 700; color: #fff; line-height: 1.35; white-space: nowrap; }
.nav-sub { display: block; font-size: 22rpx; color: rgba(255,255,255,0.74); line-height: 1.35; }
.scroll { flex: 1; min-height: 0; padding: 16rpx 20rpx; box-sizing: border-box; }
.header-card, .field-card, .other-item { background: #fff; border: 1rpx solid #e6edf6; border-radius: 18rpx; box-shadow: 0 10rpx 24rpx rgba(15,23,42,0.05); }
.header-card { display: flex; justify-content: space-between; align-items: center; padding: 18rpx 20rpx; margin-bottom: 20rpx; }
.header-main { flex: 1; min-width: 0; }
.hc-title-row { display: flex; align-items: center; gap: 12rpx; min-width: 0; }
.header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8rpx; }
.header-actions { display: flex; gap: 16rpx; font-size: 20rpx; }
.hc-title { display: block; flex: 1; min-width: 0; font-size: 28rpx; font-weight: 700; color: #0f172a; line-height: 1.4; }
.title-switch-btn { flex-shrink: 0; padding: 6rpx 16rpx; border-radius: 999rpx; background: rgba(37,99,235,0.1); color: #1d4ed8; font-size: 20rpx; }
.hc-id { display: block; font-size: 22rpx; font-weight: 600; color: #334155; margin-top: 4rpx; }
.hc-time { display: block; font-size: 20rpx; color: #64748b; margin-top: 4rpx; }
.hc-status { padding: 6rpx 16rpx; border-radius: 12rpx; font-size: 20rpx; }
.hs-draft { background: rgba(245,158,11,0.14); color: #b45309; }
.hs-complete, .hs-linked { background: rgba(16,185,129,0.14); color: #047857; }
.section { margin-bottom: 24rpx; }
.sec-label { display: block; font-size: 22rpx; font-weight: 600; color: #475569; margin-bottom: 12rpx; }
.sec-head { justify-content: space-between; margin-bottom: 12rpx; }
.sec-meta { font-size: 20rpx; color: #64748b; }
.row, .grid { display: flex; gap: 12rpx; flex-wrap: wrap; }
.grid { flex-direction: row; }
.grid .field-card { flex: 1; min-width: 0; }
.pill, .phrase-pill { display: inline-flex; align-items: center; justify-content: center; min-height: 50rpx; padding: 0 18rpx; border-radius: 24rpx; background: #f8fafc; border: 1rpx solid #e2e8f0; color: #475569; font-size: 22rpx; }
.pill.active, .phrase-pill { background: rgba(37,99,235,0.12); border-color: rgba(37,99,235,0.3); color: #1d4ed8; }
.field-card { padding: 16rpx; margin-bottom: 12rpx; }
.field-label { display: block; font-size: 24rpx; color: #334155; margin-bottom: 10rpx; line-height: 1.4; }
.field-input, .field-textarea { width: 100%; background: #f8fafc; border: 1rpx solid #e2e8f0; border-radius: 12rpx; color: #0f172a; padding: 18rpx 18rpx; box-sizing: border-box; font-size: 26rpx; line-height: 1.45; min-height: 84rpx; }
.field-picker { justify-content: space-between; gap: 12rpx; color: #0f172a; }
.field-input.flex-1 { flex: 1; }
.field-textarea { min-height: 220rpx; }
.field-textarea.small { min-height: 140rpx; }
.link, .mini-link { color: #1d4ed8; font-size: 22rpx; }
.danger-link { color: #dc2626; font-size: 20rpx; }
.empty-line text { font-size: 22rpx; color: #94a3b8; }
.other-list { display: flex; flex-direction: column; gap: 10rpx; }
.other-item { justify-content: space-between; padding: 14rpx 16rpx; }
.other-main { flex: 1; min-width: 0; }
.other-id { display: block; font-size: 21rpx; color: #334155; }
.other-desc { display: block; font-size: 20rpx; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4rpx; }
.safe-bottom { height: 60rpx; }
</style>
