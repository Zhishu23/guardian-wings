<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />

    <!-- 顶导航 -->
    <view class="navbar">
      <view class="nav-back" @click="goBack">
        <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>
      </view>
      <view class="nav-center">
        <text class="nav-title">笔录记录</text>
        <text class="nav-sub">{{ current.id || '新建笔录' }}</text>
      </view>
      <view class="nav-right">
        <view class="nav-btn" @click="onSubmit">
          <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/></svg>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll">

      <!-- 笔录编号 + 状态 -->
      <view class="header-card">
        <view class="hc-left">
          <text class="hc-id">{{ current.id }}</text>
          <text class="hc-time">创建时间：{{ current.createdAt }}</text>
        </view>
        <view class="hc-status" :class="'hs-' + current.status">
          <text>{{ statusLabel(current.status) }}</text>
        </view>
      </view>

      <!-- 模板选择 -->
      <view class="section">
        <text class="sec-label">选择模板</text>
        <scroll-view scroll-x class="template-scroll">
          <view class="template-list">
            <view
              v-for="tmpl in templates"
              :key="tmpl.value"
              class="tmpl-chip"
              :class="current.template === tmpl.value ? 'tmpl-on' : ''"
              @click="applyTemplate(tmpl)"
            >
              <text>{{ tmpl.label }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 四要素结构化区 -->
      <view class="section">
        <text class="sec-label">基本要素</text>
        <view class="elements">
          <!-- 时间 -->
          <view class="elem-card">
            <view class="elem-head">
              <view class="elem-icon elem-icon-time">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 6v6l4 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </view>
              <text class="elem-title">发生时间</text>
            </view>
            <input type="text" class="elem-input" :value="current.elements.time" placeholder="如：2025-01-31 09:30" @input="setElement('time', $event.detail.value)" />
          </view>

          <!-- 地点 -->
          <view class="elem-card">
            <view class="elem-head">
              <view class="elem-icon elem-icon-loc">
                <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/></svg>
              </view>
              <text class="elem-title">事发地点</text>
            </view>
            <view class="elem-loc-row">
              <input type="text" class="elem-input elem-input-loc" :value="current.elements.location" placeholder="输入地点描述…" @input="setElement('location', $event.detail.value)" />
              <view class="elem-loc-btn" @click="autoFillLocation">
                <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/></svg>
              </view>
            </view>
          </view>

          <!-- 人物 -->
          <view class="elem-card">
            <view class="elem-head">
              <view class="elem-icon elem-icon-person">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 21c0-4.42 3.58-8 8-8s8 3.58 8 8" fill="none" stroke="currentColor" stroke-width="2"/></svg>
              </view>
              <text class="elem-title">涉及人物</text>
            </view>
            <input type="text" class="elem-input" :value="current.elements.persons" placeholder="如：嫌疑人1名，证人2名" @input="setElement('persons', $event.detail.value)" />
          </view>

          <!-- 事件 -->
          <view class="elem-card">
            <view class="elem-head">
              <view class="elem-icon elem-icon-event">
                <svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="currentColor"/></svg>
              </view>
              <text class="elem-title">事件经过</text>
            </view>
            <input type="text" class="elem-input" :value="current.elements.event" placeholder="简述事件经过…" @input="setElement('event', $event.detail.value)" />
          </view>
        </view>
      </view>

      <!-- 快速短语 -->
      <view class="section">
        <text class="sec-label">常用短语</text>
        <scroll-view scroll-x class="phrase-scroll">
          <view class="phrase-list">
            <view v-for="(p, pi) in phrases" :key="pi" class="phrase-tag" @click="insertPhrase(p)">
              <text>{{ p }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 主文本区 -->
      <view class="section">
        <view class="sec-head-row">
          <text class="sec-label">详细笔录</text>
          <text class="sec-chars">{{ current.content.length }} 字</text>
        </view>
        <textarea
          class="main-textarea"
          :value="current.content"
          placeholder="在此输入详细笔录内容…"
          @input="onContentInput"
          auto-height
        />
      </view>

      <!-- 图片标注区 -->
      <view class="section">
        <view class="sec-head-row">
          <text class="sec-label">图片标注</text>
          <view class="add-photo-btn" @click="addPhoto">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/></svg>
            <text>添加</text>
          </view>
        </view>

        <!-- 已添加图片 -->
        <view class="photo-grid" v-if="current.photos.length > 0">
          <view v-for="(photo, pi) in current.photos" :key="pi" class="photo-item">
            <image :src="photo.path" class="photo-thumb" mode="aspectFill" @click="previewPhoto(pi)" />
            <view class="photo-caption">
              <input type="text" class="photo-caption-input" :value="photo.caption" placeholder="添加位置标注…" @input="setPhotoCaption(pi, $event.detail.value)" />
            </view>
            <view class="photo-del" @click="removePhoto(pi)">
              <svg viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="7" fill="rgba(239,68,68,0.8)"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/></svg>
            </view>
          </view>
        </view>

        <view class="photo-empty" v-else>
          <text>点击"添加"插入现场图片并标注位置信息</text>
        </view>
      </view>

      <!-- 历史笔录列表 -->
      <view class="section" v-if="allTranscripts.length > 1">
        <text class="sec-label">其他笔录</text>
        <view class="other-list">
          <view
            v-for="t in otherTranscripts"
            :key="t.id"
            class="other-item"
            @click="switchTo(t)"
          >
            <view class="oi-left">
              <text class="oi-id">{{ t.id }}</text>
              <text class="oi-desc">{{ t.description || t.content.substring(0, 30) || '无内容' }}</text>
            </view>
            <view class="oi-status" :class="'hs-' + t.status"><text>{{ statusLabel(t.status) }}</text></view>
          </view>
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

      current: {
        id: '',
        type: 'transcript',
        template: '',
        status: 'draft',
        createdAt: '',
        officerId: 'GW-2025-0312',
        description: '',
        elements: { time: '', location: '', persons: '', event: '' },
        content: '',
        photos: [],
        synced: false
      },

      templates: [
        { value: 'inquiry',    label: '询问笔录',     elements: { time: '', location: '', persons: '被询问人：', event: '询问事由：' } },
        { value: 'scene',      label: '现场勘查笔录', elements: { time: '', location: '', persons: '勘查人员：', event: '勘查内容：' } },
        { value: 'report',     label: '报告笔录',     elements: { time: '', location: '', persons: '报告人：',   event: '报告内容：' } },
        { value: 'patrol',     label: '巡逻记录',     elements: { time: '', location: '', persons: '巡逻人员：', event: '巡逻情况：' } },
        { value: 'custom',     label: '自由撰写',     elements: { time: '', location: '', persons: '', event: '' } }
      ],

      phrases: [
        '发现可疑人员',
        '现场无异常',
        '已通知相关部门',
        '嫌疑人已在场',
        '现场已取证',
        '目击者在场',
        '涉及保护物种',
        '需进一步调查',
        '已封锁现场',
        '待后续跟进'
      ]
    }
  },

  computed: {
    otherTranscripts() {
      return this.allTranscripts.filter(t => t.id !== this.current.id)
    }
  },

  onLoad(query) {
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight
    this.loadAll()

    if (query && query.editId) {
      // 编辑已有记录
      const found = this.allTranscripts.find(t => t.id === query.editId)
      if (found) { this.current = found; return }
    }
    // 新建
    this.current = this.createNew()
    this.allTranscripts.push(this.current)
    this.saveAll()
  },

  methods: {
    /* 编号 */
    genId() {
      const d = new Date()
      const p = n => String(n).padStart(2, '0')
      return `GW-T-${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${Math.floor(Math.random()*9000+1000)}`
    },

    /* 创建新记录 */
    createNew() {
      const d = new Date()
      const p = n => String(n).padStart(2, '0')
      return {
        id: this.genId(),
        type: 'transcript',
        template: '',
        status: 'draft',
        createdAt: `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`,
        officerId: this.officerId,
        description: '',
        elements: { time: '', location: '', persons: '', event: '' },
        content: '',
        photos: [],
        synced: false
      }
    },

    statusLabel(s) { return { draft:'草稿', complete:'已完成', syncing:'同步中' }[s] || '未知' },

    /* 模板应用 */
    applyTemplate(tmpl) {
      this.current.template = tmpl.value
      // 仅填充空字段，不覆盖已有内容
      Object.keys(tmpl.elements).forEach(k => {
        if (!this.current.elements[k] && tmpl.elements[k]) {
          this.$set(this.current.elements, k, tmpl.elements[k])
        }
      })
      this.autoSave()
    },

    /* 四要素更新 */
    setElement(key, val) {
      this.$set(this.current.elements, key, val)
      this.current.description = val || this.current.description
      this.autoSave()
    },

    /* 自动填充位置 */
    autoFillLocation() {
      uni.getLocation({
        type: 'wgs84',
        success: res => {
          const loc = `纬度 ${res.latitude.toFixed(5)}, 经度 ${res.longitude.toFixed(5)}`
          this.$set(this.current.elements, 'location', loc)
          this.autoSave()
        },
        fail: () => { uni.showToast({ title: '定位失败', icon: 'none' }) }
      })
    },

    /* 主文本输入 */
    onContentInput(e) {
      this.current.content = e.detail.value
      this.autoSave()
    },

    /* 插入短语 */
    insertPhrase(phrase) {
      this.current.content = this.current.content + (this.current.content ? ' ' : '') + phrase
      this.autoSave()
    },

    /* 图片 */
    addPhoto() {
      uni.chooseImage({
        count: 1,
        sourceType: ['camera', 'album'],
        success: res => {
          if (res.tempFilePaths && res.tempFilePaths[0]) {
            this.current.photos.push({ path: res.tempFilePaths[0], caption: '' })
            this.autoSave()
          }
        },
        fail: () => { uni.showToast({ title: '选图失败', icon: 'none' }) }
      })
    },

    previewPhoto(idx) {
      uni.previewImage({
        current: idx,
        urls: this.current.photos.map(p => p.path)
      })
    },

    setPhotoCaption(idx, val) {
      this.current.photos[idx].caption = val
      this.autoSave()
    },

    removePhoto(idx) {
      this.current.photos.splice(idx, 1)
      this.autoSave()
    },

    /* 切换到其他笔录 */
    switchTo(t) {
      this.current = t
    },

    /* 提交（标记完成） */
    onSubmit() {
      if (!this.current.content && !this.current.elements.event) {
        uni.showToast({ title: '请先填写内容', icon: 'none' })
        return
      }
      this.current.status = 'complete'
      this.saveAll()
      uni.showToast({ title: '笔录已完成', icon: 'success' })
    },

    /* 自动保存草稿 */
    autoSave() {
      // 更新列表中的对应项（引用对象直接修改已同步）
      this.saveAll()
    },

    saveAll() {
      try { uni.setStorageSync('gw_transcript_records', JSON.stringify(this.allTranscripts)) }
      catch(e) { uni.showToast({ title: '存储失败', icon: 'none' }) }
    },

    loadAll() {
      try {
        const raw = uni.getStorageSync('gw_transcript_records')
        this.allTranscripts = raw ? JSON.parse(raw) : []
      } catch(e) { this.allTranscripts = [] }
    },

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
.nav-sub { font-size: 20rpx; color: rgba(255,255,255,0.38); font-family: 'SF Mono', monospace; }
.nav-right { width: 56rpx; display: flex; align-items: center; justify-content: flex-end; }
.nav-btn { width: 48rpx; height: 48rpx; border-radius: 50%; background: rgba(16,185,129,0.18); border: 1rpx solid rgba(16,185,129,0.35); display: flex; align-items: center; justify-content: center; color: #34D399; }

/* 滚动 */
.scroll { flex: 1; overflow-y: auto; padding: 16rpx 20rpx; }

/* 编号头 */
.header-card { display: flex; justify-content: space-between; align-items: center; padding: 18rpx 20rpx; background: rgba(255,255,255,0.04); border: 1rpx solid rgba(255,255,255,0.08); border-radius: 16rpx; margin-bottom: 20rpx; }
.hc-left { display: flex; flex-direction: column; gap: 4rpx; }
.hc-id { font-size: 24rpx; font-weight: 700; color: rgba(255,255,255,0.8); font-family: 'SF Mono', monospace; }
.hc-time { font-size: 20rpx; color: rgba(255,255,255,0.3); }
.hc-status { padding: 6rpx 16rpx; border-radius: 12rpx; font-size: 20rpx; font-weight: 500; }
.hs-draft { background: rgba(245,158,11,0.14); color: #FBBF24; }
.hs-complete { background: rgba(16,185,129,0.14); color: #34D399; }

/* 通用section */
.section { margin-bottom: 24rpx; }
.sec-label { font-size: 22rpx; font-weight: 600; color: rgba(255,255,255,0.42); display: block; margin-bottom: 12rpx; }
.sec-head-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.sec-chars { font-size: 20rpx; color: rgba(255,255,255,0.28); }

/* 模板滚动 */
.template-scroll { white-space: nowrap; }
.template-list { display: flex; gap: 10rpx; padding-bottom: 4rpx; }
.tmpl-chip { display: inline-flex; padding: 12rpx 24rpx; background: rgba(255,255,255,0.06); border: 1rpx solid rgba(255,255,255,0.1); border-radius: 30rpx; white-space: nowrap; transition: all 0.15s; }
.tmpl-chip:active { transform: scale(0.95); }
.tmpl-chip text { font-size: 24rpx; color: rgba(255,255,255,0.55); }
.tmpl-chip.tmpl-on { background: rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.4); }
.tmpl-chip.tmpl-on text { color: #34D399; font-weight: 600; }

/* 四要素 */
.elements { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12rpx; }
.elem-card { background: rgba(255,255,255,0.04); border: 1rpx solid rgba(255,255,255,0.08); border-radius: 14rpx; padding: 16rpx; display: flex; flex-direction: column; gap: 10rpx; }
.elem-head { display: flex; align-items: center; gap: 10rpx; }
.elem-icon { width: 40rpx; height: 40rpx; border-radius: 10rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.elem-icon svg { width: 22rpx; height: 22rpx; }
.elem-icon-time { background: rgba(37,99,235,0.18); color: #60A5FA; }
.elem-icon-loc { background: rgba(16,185,129,0.18); color: #34D399; }
.elem-icon-person { background: rgba(139,92,246,0.18); color: #A78BFA; }
.elem-icon-event { background: rgba(245,158,11,0.18); color: #FBBF24; }
.elem-title { font-size: 22rpx; font-weight: 600; color: rgba(255,255,255,0.6); }
.elem-input { width: 100%; height: 64rpx; padding: 0 12rpx; background: rgba(255,255,255,0.06); border: 1rpx solid rgba(255,255,255,0.1); border-radius: 10rpx; color: rgba(255,255,255,0.85); font-size: 22rpx; box-sizing: border-box; }
.elem-loc-row { display: flex; gap: 8rpx; align-items: center; }
.elem-input-loc { flex: 1; }
.elem-loc-btn { width: 60rpx; height: 60rpx; border-radius: 10rpx; background: rgba(16,185,129,0.15); border: 1rpx solid rgba(16,185,129,0.25); display: flex; align-items: center; justify-content: center; color: #34D399; flex-shrink: 0; }

/* 常用短语 */
.phrase-scroll { white-space: nowrap; }
.phrase-list { display: flex; gap: 10rpx; padding-bottom: 4rpx; }
.phrase-tag { display: inline-flex; padding: 10rpx 20rpx; background: rgba(37,99,235,0.1); border: 1rpx solid rgba(37,99,235,0.22); border-radius: 24rpx; white-space: nowrap; transition: background 0.15s; }
.phrase-tag:active { background: rgba(37,99,235,0.22); }
.phrase-tag text { font-size: 22rpx; color: #60A5FA; }

/* 主文本 */
.main-textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 16rpx;
  background: rgba(255,255,255,0.05);
  border: 1rpx solid rgba(255,255,255,0.1);
  border-radius: 14rpx;
  color: rgba(255,255,255,0.85);
  font-size: 24rpx;
  line-height: 1.6;
  box-sizing: border-box;
  resize: none;
}

/* 图片标注 */
.add-photo-btn { display: flex; align-items: center; gap: 6rpx; padding: 6rpx 16rpx; background: rgba(37,99,235,0.15); border: 1rpx solid rgba(37,99,235,0.3); border-radius: 18rpx; color: #60A5FA; font-size: 22rpx; }
.add-photo-btn:active { background: rgba(37,99,235,0.25); }

.photo-grid { display: flex; flex-direction: column; gap: 12rpx; }
.photo-item { position: relative; background: rgba(255,255,255,0.04); border: 1rpx solid rgba(255,255,255,0.08); border-radius: 14rpx; overflow: hidden; }
.photo-thumb { width: 100%; height: 200rpx; display: block; }
.photo-caption { padding: 12rpx 14rpx 0; }
.photo-caption-input { width: 100%; height: 60rpx; padding: 0 12rpx; background: rgba(255,255,255,0.06); border: 1rpx solid rgba(255,255,255,0.08); border-radius: 8rpx; color: rgba(255,255,255,0.7); font-size: 22rpx; box-sizing: border-box; }
.photo-del { position: absolute; top: 8rpx; right: 8rpx; }

.photo-empty { padding: 24rpx; border: 1rpx dashed rgba(255,255,255,0.15); border-radius: 14rpx; text-align: center; }
.photo-empty text { font-size: 22rpx; color: rgba(255,255,255,0.3); }

/* 其他笔录 */
.other-list { display: flex; flex-direction: column; gap: 8rpx; }
.other-item { display: flex; justify-content: space-between; align-items: center; padding: 14rpx 16rpx; background: rgba(255,255,255,0.03); border: 1rpx solid rgba(255,255,255,0.06); border-radius: 10rpx; }
.other-item:active { background: rgba(255,255,255,0.07); }
.oi-left { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3rpx; }
.oi-id { font-size: 21rpx; font-weight: 600; color: rgba(255,255,255,0.6); font-family: 'SF Mono', monospace; }
.oi-desc { font-size: 20rpx; color: rgba(255,255,255,0.35); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.oi-status { padding: 4rpx 12rpx; border-radius: 10rpx; font-size: 18rpx; font-weight: 500; flex-shrink: 0; }

.safe-bottom { height: 60rpx; }
</style>
