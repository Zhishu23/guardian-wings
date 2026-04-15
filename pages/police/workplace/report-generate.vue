<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
    <view class="navbar">
      <view class="nav-btn" @click="goBack">返回</view>
      <view class="nav-center">
        <text class="nav-title">报告生成</text>
        <text class="nav-sub">{{ current.id || '新建报告' }}</text>
      </view>
      <view class="nav-btn right" @click="onSubmit">提交</view>
    </view>

    <scroll-view scroll-y class="scroll">
      <view class="card">
        <view class="row"><text class="label">报告编号</text><text class="mono">{{ current.id }}</text></view>
        <view class="row"><text class="label">创建时间</text><text class="val">{{ current.createdAt }}</text></view>
        <view class="row"><text class="label">状态</text><text class="badge" :class="'s-' + current.status">{{ statusLabel(current.status) }}</text></view>
      </view>

      <view class="card event" v-if="currentEvent">
        <text class="event-title">{{ currentEvent.title || '未命名事件' }}</text>
        <text class="event-meta">{{ eventTypeText }} · {{ eventStatusText }}</text>
        <text class="event-meta">{{ currentEvent.locationText || '地点未填写' }}</text>
        <text class="event-meta">{{ currentEvent.happenTime || currentEvent.updatedAt || currentEvent.createdAt }}</text>
      </view>

      <view class="section">
        <view class="row">
          <text class="title no-gap">报告模板</text>
          <text class="link" @click="applyTemplateDraft(true)">套用模板</text>
        </view>
        <view class="chips">
          <view v-for="tmpl in templates" :key="tmpl.value" class="chip" :class="{ active: current.template === tmpl.value }" @click="selectTemplate(tmpl.value)">
            <text>{{ tmpl.label }}</text>
          </view>
        </view>
        <text class="hint" v-if="currentTemplateTip">{{ currentTemplateTip }}</text>
      </view>

      <view class="section">
        <text class="title">报告标题</text>
        <textarea class="textarea compact" :value="current.title" maxlength="80" placeholder="请输入报告标题" @input="setField('title', $event.detail.value)" />
      </view>

      <view class="section">
        <text class="title">内容摘要</text>
        <textarea class="textarea compact" :value="current.summary" maxlength="240" placeholder="请输入摘要" @input="setField('summary', $event.detail.value)" />
      </view>

      <view class="section">
        <text class="title">报告正文</text>
        <textarea class="textarea large" :value="current.content" placeholder="请输入正文" @input="setField('content', $event.detail.value)" />
      </view>

      <view class="section">
        <text class="title">报告结论</text>
        <textarea class="textarea compact" :value="current.conclusion" maxlength="200" placeholder="请输入结论" @input="setField('conclusion', $event.detail.value)" />
      </view>

      <view class="section">
        <view class="row">
          <text class="title no-gap">关联素材</text>
          <text class="link" @click="showPicker = true">添加</text>
        </view>
        <view class="material-chip"><text>照片 {{ current.relatedPhotos.length }}</text></view>
        <view class="material-chip"><text>视频 {{ current.relatedVideos.length }}</text></view>
        <view class="material-chip"><text>笔录 {{ current.relatedTranscripts.length }}</text></view>
      </view>

      <view class="safe-bottom" />
    </scroll-view>

    <view class="mask" v-if="showPicker" @click="showPicker = false">
      <view class="panel" @click.stop>
        <view class="panel-head">
          <text class="panel-title">选择素材</text>
          <text class="link" @click="showPicker = false">完成</text>
        </view>
        <scroll-view scroll-y class="panel-scroll">
          <view class="pick-section" v-if="availablePhotos.length > 0">
            <text class="pick-title">照片</text>
            <view v-for="item in availablePhotos" :key="item.id" class="pick-item" :class="{ selected: current.relatedPhotos.includes(item.id) }" @click="toggleId('relatedPhotos', item.id)">
              <text>{{ item.remark || item.batchTitle || item.id }}</text>
            </view>
          </view>
          <view class="pick-section" v-if="availableVideos.length > 0">
            <text class="pick-title">视频</text>
            <view v-for="item in availableVideos" :key="item.id" class="pick-item" :class="{ selected: current.relatedVideos.includes(item.id) }" @click="toggleId('relatedVideos', item.id)">
              <text>{{ item.remark || item.durationStr || item.id }}</text>
            </view>
          </view>
          <view class="pick-section" v-if="availableTranscripts.length > 0">
            <text class="pick-title">笔录</text>
            <view v-for="item in availableTranscripts" :key="item.id" class="pick-item" :class="{ selected: current.relatedTranscripts.includes(item.id) }" @click="toggleId('relatedTranscripts', item.id)">
              <text>{{ item.title || item.summary || item.id }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ReportGenerate',
  data() {
    return {
      statusBarHeight: 0,
      officerId: 'GW-2025-0312',
      showPicker: false,
      allReports: [],
      allEvents: [],
      allPhotos: [],
      allVideos: [],
      allTranscripts: [],
      isExistingReport: false,
      baselineSnapshot: '',
      templates: [
        { value: 'incident', label: '事件报告', tip: '用于现场事件处置和结果留痕' },
        { value: 'patrol', label: '巡查日志', tip: '用于巡查任务过程和当日发现' },
        { value: 'investigation', label: '调查报告', tip: '用于线索核查和证据整理' },
        { value: 'summary', label: '工作总结', tip: '用于阶段工作归纳和计划安排' },
        { value: 'custom', label: '自定义', tip: '用于个性化文书结构' }
      ],
      current: {
        id: '',
        type: 'report',
        template: 'custom',
        title: '',
        summary: '',
        content: '',
        conclusion: '',
        eventId: '',
        relatedPhotos: [],
        relatedVideos: [],
        relatedTranscripts: [],
        status: 'draft',
        createdAt: '',
        updatedAt: '',
        officerId: '',
        synced: false
      }
    }
  },
  computed: {
    currentEvent() {
      if (!this.current.eventId) return null
      return this.allEvents.find((item) => item.id === this.current.eventId) || null
    },
    currentTemplateTip() {
      const found = this.templates.find((item) => item.value === this.current.template)
      return found ? found.tip : ''
    },
    eventTypeText() {
      const map = { patrol: '巡查处置', clue: '线索核查', poaching: '非法捕猎', rescue: '救助放归', other: '其他' }
      const t = this.currentEvent ? this.currentEvent.type : ''
      return map[t] || '现场事件'
    },
    eventStatusText() {
      const map = { collecting: '采集中', pending_sort: '待整理', pending_report: '待成文', archived: '已归档' }
      const s = this.currentEvent ? this.currentEvent.status : ''
      return map[s] || '采集中'
    },
    availablePhotos() {
      return this.filterByEvent(this.allPhotos, this.current.relatedPhotos)
    },
    availableVideos() {
      return this.filterByEvent(this.allVideos, this.current.relatedVideos)
    },
    availableTranscripts() {
      return this.filterByEvent(this.allTranscripts, this.current.relatedTranscripts)
    }
  },
  onLoad(query) {
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight
    this.loadAllMaterials()
    this.loadEvents()
    this.loadReports()

    if (query && query.id) {
      const found = this.allReports.find((item) => item.id === query.id)
      if (found) {
        this.current = this.normalizeReport(found)
        this.isExistingReport = true
        this.baselineSnapshot = this.serializeCurrent(this.current)
        return
      }
    }

    this.current = this.createNew()
    if (query && query.eventId) this.applyEventContext(query.eventId)
    this.isExistingReport = false
    this.baselineSnapshot = this.serializeCurrent(this.current)
  },
  methods: {
    nowText() {
      const d = new Date()
      const p = (n) => String(n).padStart(2, '0')
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds())
    },
    genId() {
      const d = new Date()
      const p = (n) => String(n).padStart(2, '0')
      return 'GW-R-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + Math.floor(Math.random() * 9000 + 1000)
    },
    createNew() {
      const now = this.nowText()
      return this.normalizeReport({ id: this.genId(), createdAt: now, updatedAt: now, officerId: this.officerId })
    },
    normalizeReport(item) {
      const base = Object.assign({
        id: '',
        type: 'report',
        template: 'custom',
        title: '',
        summary: '',
        content: '',
        conclusion: '',
        eventId: '',
        relatedPhotos: [],
        relatedVideos: [],
        relatedTranscripts: [],
        status: 'draft',
        createdAt: '',
        updatedAt: '',
        officerId: this.officerId,
        synced: false
      }, item || {})
      base.relatedPhotos = Array.isArray(base.relatedPhotos) ? base.relatedPhotos : []
      base.relatedVideos = Array.isArray(base.relatedVideos) ? base.relatedVideos : []
      base.relatedTranscripts = Array.isArray(base.relatedTranscripts) ? base.relatedTranscripts : []
      return base
    },
    statusLabel(status) {
      return { draft: '草稿', submitted: '已提交', approved: '已审批' }[status] || '未知'
    },
    setField(field, value) {
      this.current[field] = value
      this.touch()
    },
    touch() {
      this.current.updatedAt = this.nowText()
    },
    selectTemplate(value) {
      if (this.current.template === value) return
      const hasText = !!(this.current.title || this.current.summary || this.current.content || this.current.conclusion)
      const applySwitch = () => {
        this.current.template = value
        this.touch()
        this.applyTemplateDraft(true)
      }
      if (!hasText) {
        applySwitch()
        return
      }
      uni.showModal({
        title: '切换模板',
        content: '切换后将按新模板重写标题、摘要、正文和结论，是否继续？',
        success: (res) => {
          if (res.confirm) applySwitch()
        }
      })
    },
    applyTemplateDraft(forceReplace) {
      const hasText = !!(this.current.summary || this.current.content || this.current.conclusion)
      if (hasText && !forceReplace) {
        return
      }

      const template = this.current.template || 'custom'
      const event = this.currentEvent || {}
      const title = event.title || '现场事件'
      const place = event.locationText || '待核实'
      const time = event.happenTime || '待核实'
      const desc = event.description || '待补充'
      const photoCount = this.current.relatedPhotos.length
      const videoCount = this.current.relatedVideos.length
      const transcriptCount = this.current.relatedTranscripts.length

      const titleSuffix = {
        incident: '事件报告',
        patrol: '巡查日志',
        investigation: '调查报告',
        summary: '工作总结',
        custom: '报告'
      }

      const summaryMap = {
        incident: title + '已形成事件报告草稿，当前归集照片' + photoCount + '份、视频' + videoCount + '份、笔录' + transcriptCount + '份。',
        patrol: title + '巡查日志草稿已生成，包含巡查区域、过程和现场发现。',
        investigation: title + '调查报告草稿已生成，包含线索核查过程和证据整理。',
        summary: title + '阶段工作总结草稿已生成，包含工作成效与后续计划。',
        custom: this.current.summary || ''
      }

      const contentMap = {
        incident: [
          '一、事件概况',
          '事件名称：' + title + '。',
          '发生时间：' + time + '，地点：' + place + '。',
          '二、现场情况',
          desc,
          '三、固定素材',
          '照片' + photoCount + '份，视频' + videoCount + '份，笔录' + transcriptCount + '份。',
          '四、处置情况',
          '请补充处置动作与执行结果。'
        ].join('\n'),
        patrol: [
          '一、巡查基本信息',
          '巡查主题：' + title + '。',
          '巡查时间：' + time + '，巡查区域：' + place + '。',
          '二、巡查过程',
          '请补充巡查路线、人员分工和关键节点。',
          '三、发现情况',
          desc,
          '四、后续安排',
          '请补充后续复查计划。'
        ].join('\n'),
        investigation: [
          '一、线索信息',
          '线索主题：' + title + '。',
          '核查时间：' + time + '，涉及区域：' + place + '。',
          '二、核查过程',
          '请补充核查路径、对象和方法。',
          '三、证据整理',
          '照片证据' + photoCount + '份，视频证据' + videoCount + '份，笔录材料' + transcriptCount + '份。',
          '四、初步判断',
          '请补充核查结论与风险评估。'
        ].join('\n'),
        summary: [
          '一、阶段概况',
          '阶段主题：' + title + '。',
          '时间范围：' + time + '，区域范围：' + place + '。',
          '二、工作数据',
          '归集素材：照片' + photoCount + '份，视频' + videoCount + '份，笔录' + transcriptCount + '份。',
          '三、主要成效',
          '请补充阶段成果与问题。',
          '四、下一步计划',
          '请补充后续目标、节点和责任分工。'
        ].join('\n'),
        custom: this.current.content || [
          '一、背景',
          '二、现场情况',
          '三、证据材料',
          '四、处置建议'
        ].join('\n')
      }

      const conclusionMap = {
        incident: '建议依据处置流程推进后续办理，并完善闭环留痕。',
        patrol: '建议保持常态化巡查频次，对重点区域开展复核。',
        investigation: '建议继续深入核查，必要时启动专项调查程序。',
        summary: '建议围绕阶段目标持续推进，并同步优化协同机制。',
        custom: this.current.conclusion || ''
      }

      this.current.title = event.title ? event.title + titleSuffix[template] : (this.current.title || ('未命名' + titleSuffix[template]))
      this.current.summary = summaryMap[template]
      this.current.content = contentMap[template]
      this.current.conclusion = conclusionMap[template]
      this.touch()
    },
    applyEventContext(eventId) {
      const event = this.allEvents.find((item) => item.id === eventId)
      if (!event) return
      const photoIds = Array.isArray(event.photoIds) && event.photoIds.length ? event.photoIds.slice() : this.allPhotos.filter((item) => item.eventId === event.id).map((item) => item.id)
      const videoIds = Array.isArray(event.videoIds) && event.videoIds.length ? event.videoIds.slice() : this.allVideos.filter((item) => item.eventId === event.id).map((item) => item.id)
      const transcriptIds = Array.isArray(event.transcriptIds) && event.transcriptIds.length ? event.transcriptIds.slice() : this.allTranscripts.filter((item) => item.eventId === event.id).map((item) => item.id)
      this.current.eventId = event.id
      this.current.relatedPhotos = photoIds
      this.current.relatedVideos = videoIds
      this.current.relatedTranscripts = transcriptIds
      this.current.template = this.current.template || this.guessTemplate(event.type)
      this.applyTemplateDraft(false)
      this.baselineSnapshot = this.serializeCurrent(this.current)
    },
    guessTemplate(type) {
      const map = { patrol: 'patrol', clue: 'investigation', poaching: 'incident', rescue: 'summary', other: 'custom' }
      return map[type] || 'custom'
    },
    filterByEvent(list, selectedIds) {
      if (!this.current.eventId) return list
      return list.filter((item) => item.eventId === this.current.eventId || selectedIds.includes(item.id))
    },
    toggleId(field, id) {
      const idx = this.current[field].indexOf(id)
      if (idx > -1) this.current[field].splice(idx, 1)
      else this.current[field].push(id)
      this.touch()
    },
    onSubmit() {
      if (!this.current.title) {
        uni.showToast({ title: '请输入报告标题', icon: 'none' })
        return
      }
      if (!this.current.content) {
        uni.showToast({ title: '请输入报告正文', icon: 'none' })
        return
      }
      this.current.status = 'submitted'
      this.touch()
      this.persistCurrent(true)
      uni.showToast({ title: '报告已提交', icon: 'success' })
    },
    persistCurrent(syncEvent) {
      const next = this.normalizeReport(this.current)
      const idx = this.allReports.findIndex((item) => item.id === next.id)
      if (idx > -1) this.allReports.splice(idx, 1, next)
      else this.allReports.push(next)
      this.current = next
      uni.setStorageSync('gw_report_records', JSON.stringify(this.allReports))
      if (syncEvent) this.syncEventLinks()
      this.isExistingReport = true
      this.baselineSnapshot = this.serializeCurrent(this.current)
    },
    loadReports() {
      try {
        const raw = uni.getStorageSync('gw_report_records')
        const list = raw ? JSON.parse(raw) : []
        this.allReports = Array.isArray(list) ? list.map((item) => this.normalizeReport(item)) : []
      } catch (e) {
        this.allReports = []
      }
    },
    loadEvents() {
      try {
        const raw = uni.getStorageSync('gw_event_records')
        this.allEvents = raw ? JSON.parse(raw) : []
      } catch (e) {
        this.allEvents = []
      }
    },
    loadAllMaterials() {
      try {
        const p = uni.getStorageSync('gw_photo_records') || uni.getStorageSync('guardian_wings_photos')
        const v = uni.getStorageSync('gw_video_records')
        const t = uni.getStorageSync('gw_transcript_records')
        this.allPhotos = p ? JSON.parse(p) : []
        this.allVideos = v ? JSON.parse(v) : []
        this.allTranscripts = t ? JSON.parse(t) : []
      } catch (e) {
        this.allPhotos = []
        this.allVideos = []
        this.allTranscripts = []
      }
    },
    syncEventLinks() {
      if (!this.current.eventId) return
      const idx = this.allEvents.findIndex((item) => item.id === this.current.eventId)
      if (idx === -1) return
      const event = Object.assign({}, this.allEvents[idx])
      const reportIds = Array.isArray(event.reportIds) ? event.reportIds.slice() : []
      if (!reportIds.includes(this.current.id)) reportIds.push(this.current.id)
      event.reportIds = reportIds
      if (!event.status || event.status === 'collecting' || event.status === 'pending_sort') event.status = 'pending_report'
      event.updatedAt = this.current.updatedAt || this.nowText()
      this.allEvents.splice(idx, 1, event)
      uni.setStorageSync('gw_event_records', JSON.stringify(this.allEvents))
    },
    serializeCurrent(report) {
      const base = this.normalizeReport(report || this.current)
      return JSON.stringify({
        template: base.template,
        title: base.title,
        summary: base.summary,
        content: base.content,
        conclusion: base.conclusion,
        eventId: base.eventId,
        relatedPhotos: base.relatedPhotos.slice().sort(),
        relatedVideos: base.relatedVideos.slice().sort(),
        relatedTranscripts: base.relatedTranscripts.slice().sort(),
        status: base.status
      })
    },
    isDirty() {
      return this.serializeCurrent(this.current) !== this.baselineSnapshot
    },
    goBack() {
      if (!this.isDirty()) {
        uni.navigateBack({ delta: 1 })
        return
      }
      uni.showActionSheet({
        itemList: ['保存并返回', '不保存并返回'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.persistCurrent(true)
            uni.navigateBack({ delta: 1 })
          } else if (res.tapIndex === 1) {
            uni.navigateBack({ delta: 1 })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #0f172a; color: #fff; display: flex; flex-direction: column; }
.status-bar, .navbar { background: #0f172a; }
.navbar { height: 88rpx; padding: 0 20rpx; display: flex; align-items: center; }
.nav-btn { width: 88rpx; font-size: 26rpx; color: rgba(255,255,255,0.72); }
.nav-btn.right { text-align: right; }
.nav-center { flex: 1; display: flex; flex-direction: column; align-items: center; }
.nav-title { font-size: 30rpx; font-weight: 600; }
.nav-sub { font-size: 20rpx; color: rgba(255,255,255,0.35); }
.scroll { flex: 1; padding: 16rpx 20rpx; box-sizing: border-box; }
.card, .section { margin-bottom: 18rpx; padding: 20rpx; border-radius: 16rpx; background: rgba(255,255,255,0.04); border: 1rpx solid rgba(255,255,255,0.08); }
.event { background: rgba(15,118,110,0.14); border-color: rgba(45,212,191,0.22); }
.row { display: flex; justify-content: space-between; align-items: center; gap: 16rpx; }
.label, .hint { color: rgba(255,255,255,0.45); font-size: 22rpx; }
.hint { display: block; margin-top: 10rpx; }
.mono, .val { font-size: 22rpx; color: rgba(255,255,255,0.74); }
.mono { font-family: monospace; }
.badge { padding: 6rpx 14rpx; border-radius: 999rpx; font-size: 20rpx; }
.s-draft { background: rgba(245,158,11,0.16); color: #fbbf24; }
.s-submitted { background: rgba(37,99,235,0.16); color: #60a5fa; }
.s-approved { background: rgba(16,185,129,0.16); color: #34d399; }
.event-title { display: block; font-size: 28rpx; font-weight: 600; color: #ccfbf1; }
.event-meta { display: block; margin-top: 8rpx; font-size: 22rpx; color: rgba(255,255,255,0.66); }
.title { display: block; margin-bottom: 12rpx; font-size: 24rpx; font-weight: 600; color: rgba(255,255,255,0.6); }
.title.no-gap { margin-bottom: 0; }
.chips { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 12rpx; }
.chip { padding: 12rpx 18rpx; border-radius: 999rpx; background: rgba(255,255,255,0.06); font-size: 22rpx; color: rgba(255,255,255,0.64); }
.chip.active { background: rgba(37,99,235,0.24); color: #93c5fd; }
.textarea { width: 100%; min-height: 140rpx; border-radius: 14rpx; padding: 16rpx; box-sizing: border-box; background: rgba(255,255,255,0.05); border: 1rpx solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.86); font-size: 24rpx; line-height: 1.6; }
.textarea.compact { min-height: 92rpx; }
.textarea.large { min-height: 280rpx; }
.link { color: #60a5fa; font-size: 22rpx; }
.material-chip { margin-top: 10rpx; padding: 12rpx 16rpx; border-radius: 12rpx; background: rgba(255,255,255,0.04); font-size: 22rpx; color: rgba(255,255,255,0.72); }
.safe-bottom { height: 80rpx; }
.mask { position: fixed; inset: 0; background: rgba(0,0,0,0.72); display: flex; align-items: flex-end; z-index: 99; }
.panel { width: 100%; max-height: 80vh; background: #1e293b; border-radius: 28rpx 28rpx 0 0; overflow: hidden; }
.panel-head { height: 88rpx; padding: 0 22rpx; display: flex; align-items: center; justify-content: space-between; border-bottom: 1rpx solid rgba(255,255,255,0.08); }
.panel-title { font-size: 28rpx; color: #fff; }
.panel-scroll { max-height: calc(80vh - 88rpx); padding: 18rpx 20rpx; box-sizing: border-box; }
.pick-section { margin-bottom: 20rpx; }
.pick-title { display: block; margin-bottom: 12rpx; font-size: 24rpx; color: rgba(255,255,255,0.52); }
.pick-item { margin-bottom: 10rpx; padding: 16rpx; border-radius: 12rpx; background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.74); font-size: 23rpx; }
.pick-item.selected { background: rgba(37,99,235,0.2); color: #bfdbfe; }
</style>
