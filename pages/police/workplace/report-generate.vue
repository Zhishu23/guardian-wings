<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />

    <!-- 顶导航 -->
    <view class="navbar">
      <view class="nav-back" @click="goBack">
        <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>
      </view>
      <view class="nav-center">
        <text class="nav-title">报告生成</text>
        <text class="nav-sub">{{ current.id || '新建报告' }}</text>
      </view>
      <view class="nav-right">
        <view class="nav-action" @click="onSubmit">
          <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/></svg>
        </view>
        <view class="nav-action" @click="showMenu">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll">
      
      <!-- 报告头部信息 -->
      <view class="header-card">
        <view class="hc-row">
          <text class="hc-label">报告编号</text>
          <text class="hc-id">{{ current.id }}</text>
        </view>
        <view class="hc-row">
          <text class="hc-label">创建时间</text>
          <text class="hc-time">{{ current.createdAt }}</text>
        </view>
        <view class="hc-row">
          <text class="hc-label">状态</text>
          <view class="hc-status" :class="'status-' + current.status">
            <text>{{ statusLabel(current.status) }}</text>
          </view>
        </view>
      </view>

      <!-- 模板选择 -->
      <view class="section">
        <text class="sec-title">报告模板</text>
        <view class="template-grid">
          <view
            v-for="tmpl in templates"
            :key="tmpl.value"
            class="tmpl-card"
            :class="current.template === tmpl.value ? 'tmpl-active' : ''"
            @click="selectTemplate(tmpl)"
          >
            <view class="tmpl-icon" :style="{ background: tmpl.color }">
              <svg viewBox="0 0 24 24" v-html="tmpl.icon"></svg>
            </view>
            <text class="tmpl-name">{{ tmpl.label }}</text>
          </view>
        </view>
      </view>

      <!-- 报告标题 -->
      <view class="section">
        <text class="sec-title">报告标题 <text class="required">*</text></text>
        <input
          type="text"
          class="text-input"
          :value="current.title"
          placeholder="请输入报告标题..."
          @input="setField('title', $event.detail.value)"
        />
      </view>

      <!-- 摘要 -->
      <view class="section">
        <text class="sec-title">内容摘要</text>
        <textarea
          class="textarea-input"
          :value="current.summary"
          placeholder="请输入报告摘要（200字以内）..."
          maxlength="200"
          @input="setField('summary', $event.detail.value)"
        />
        <text class="char-count">{{ current.summary.length }}/200</text>
      </view>

      <!-- 正文 -->
      <view class="section">
        <text class="sec-title">报告正文 <text class="required">*</text></text>
        <textarea
          class="textarea-input textarea-large"
          :value="current.content"
          placeholder="请输入报告正文内容..."
          @input="setField('content', $event.detail.value)"
          auto-height
        />
        <text class="char-count">{{ current.content.length }} 字</text>
      </view>

      <!-- 结论 -->
      <view class="section">
        <text class="sec-title">报告结论</text>
        <textarea
          class="textarea-input"
          :value="current.conclusion"
          placeholder="请输入报告结论..."
          @input="setField('conclusion', $event.detail.value)"
        />
      </view>

      <!-- 关联素材 -->
      <view class="section">
        <view class="sec-header">
          <text class="sec-title">关联素材</text>
          <view class="sec-action" @click="showMaterialPicker">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/></svg>
            <text>添加</text>
          </view>
        </view>

        <!-- 已关联的照片 -->
        <view class="material-group" v-if="linkedPhotos.length > 0">
          <view class="mg-header">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="currentColor"/></svg>
            <text class="mg-title">照片 ({{ linkedPhotos.length }})</text>
          </view>
          <view class="photo-list">
            <view v-for="(photo, idx) in linkedPhotos" :key="photo.id" class="photo-thumb">
              <image :src="photo.watermarkedPath || photo.originalPath" mode="aspectFill" class="photo-img" @click="previewPhoto(idx)" />
              <view class="photo-remove" @click="unlinkPhoto(photo.id)">
                <svg viewBox="0 0 16 16" width="14" height="14"><path d="M12 4.7L11.3 4 8 7.3 4.7 4 4 4.7 7.3 8 4 11.3l.7.7L8 8.7l3.3 3.3.7-.7L8.7 8z" fill="currentColor"/></svg>
              </view>
            </view>
          </view>
        </view>

        <!-- 已关联的视频 -->
        <view class="material-group" v-if="linkedVideos.length > 0">
          <view class="mg-header">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" fill="currentColor"/></svg>
            <text class="mg-title">视频 ({{ linkedVideos.length }})</text>
          </view>
          <view class="video-list">
            <view v-for="video in linkedVideos" :key="video.id" class="video-item">
              <view class="vi-icon">
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
              </view>
              <text class="vi-name">{{ video.id }}</text>
              <text class="vi-duration">{{ video.durationStr }}</text>
              <view class="vi-remove" @click="unlinkVideo(video.id)">
                <svg viewBox="0 0 16 16" width="14" height="14"><path d="M12 4.7L11.3 4 8 7.3 4.7 4 4 4.7 7.3 8 4 11.3l.7.7L8 8.7l3.3 3.3.7-.7L8.7 8z" fill="currentColor"/></svg>
              </view>
            </view>
          </view>
        </view>

        <!-- 已关联的笔录 -->
        <view class="material-group" v-if="linkedTranscripts.length > 0">
          <view class="mg-header">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" fill="currentColor"/></svg>
            <text class="mg-title">笔录 ({{ linkedTranscripts.length }})</text>
          </view>
          <view class="transcript-list">
            <view v-for="tr in linkedTranscripts" :key="tr.id" class="tr-item">
              <text class="tr-id">{{ tr.id }}</text>
              <text class="tr-desc">{{ tr.description || tr.content.substring(0, 30) }}</text>
              <view class="tr-remove" @click="unlinkTranscript(tr.id)">
                <svg viewBox="0 0 16 16" width="14" height="14"><path d="M12 4.7L11.3 4 8 7.3 4.7 4 4 4.7 7.3 8 4 11.3l.7.7L8 8.7l3.3 3.3.7-.7L8.7 8z" fill="currentColor"/></svg>
              </view>
            </view>
          </view>
        </view>

        <!-- 无素材提示 -->
        <view class="material-empty" v-if="linkedPhotos.length === 0 && linkedVideos.length === 0 && linkedTranscripts.length === 0">
          <svg viewBox="0 0 48 48" class="me-icon">
            <circle cx="24" cy="24" r="22" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
            <path d="M16 20h16M16 24h12M16 28h8" stroke="#475569" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <text class="me-text">点击"添加"关联照片、视频或笔录</text>
        </view>
      </view>

      <view class="safe-bottom" />
    </scroll-view>

    <!-- 素材选择弹窗 -->
    <view class="picker-mask" v-if="showPicker" @click="closePicker">
      <view class="picker-panel" @click.stop="">
        <view class="picker-header">
          <text class="picker-title">选择素材</text>
          <view class="picker-close" @click="closePicker">
            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/></svg>
          </view>
        </view>

        <scroll-view scroll-y class="picker-scroll">
          <!-- 照片 -->
          <view class="picker-section" v-if="allPhotos.length > 0">
            <text class="picker-sec-title">照片采集</text>
            <view class="picker-photo-grid">
              <view
                v-for="photo in allPhotos"
                :key="photo.id"
                class="picker-photo"
                :class="current.relatedPhotos.includes(photo.id) ? 'picker-photo-selected' : ''"
                @click="togglePhoto(photo.id)"
              >
                <image :src="photo.watermarkedPath || photo.originalPath" mode="aspectFill" class="picker-photo-img" />
                <view class="picker-photo-check" v-if="current.relatedPhotos.includes(photo.id)">
                  <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/></svg>
                </view>
              </view>
            </view>
          </view>

          <!-- 视频 -->
          <view class="picker-section" v-if="allVideos.length > 0">
            <text class="picker-sec-title">视频记录</text>
            <view class="picker-list">
              <view
                v-for="video in allVideos"
                :key="video.id"
                class="picker-list-item"
                :class="current.relatedVideos.includes(video.id) ? 'picker-item-selected' : ''"
                @click="toggleVideo(video.id)"
              >
                <view class="pli-check">
                  <svg viewBox="0 0 24 24" v-if="current.relatedVideos.includes(video.id)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/></svg>
                </view>
                <text class="pli-name">{{ video.id }}</text>
                <text class="pli-meta">{{ video.durationStr }}</text>
              </view>
            </view>
          </view>

          <!-- 笔录 -->
          <view class="picker-section" v-if="allTranscripts.length > 0">
            <text class="picker-sec-title">笔录记录</text>
            <view class="picker-list">
              <view
                v-for="tr in allTranscripts"
                :key="tr.id"
                class="picker-list-item"
                :class="current.relatedTranscripts.includes(tr.id) ? 'picker-item-selected' : ''"
                @click="toggleTranscript(tr.id)"
              >
                <view class="pli-check">
                  <svg viewBox="0 0 24 24" v-if="current.relatedTranscripts.includes(tr.id)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/></svg>
                </view>
                <text class="pli-name">{{ tr.id }}</text>
                <text class="pli-desc">{{ tr.description || tr.content.substring(0, 20) }}</text>
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="picker-footer">
          <button class="picker-btn" @click="closePicker">完成</button>
        </view>
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
      
      allReports: [],
      allPhotos: [],
      allVideos: [],
      allTranscripts: [],

      current: this.createNew(),
      
      showPicker: false,

      templates: [
        { 
          value: 'incident', 
          label: '事故报告', 
          color: 'rgba(239,68,68,0.15)',
          icon: '<path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z" fill="#EF4444"/>'
        },
        { 
          value: 'patrol', 
          label: '巡逻日志', 
          color: 'rgba(37,99,235,0.15)',
          icon: '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#2563EB"/>'
        },
        { 
          value: 'investigation', 
          label: '调查报告', 
          color: 'rgba(16,185,129,0.15)',
          icon: '<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#10B981"/>'
        },
        { 
          value: 'summary', 
          label: '工作总结', 
          color: 'rgba(245,158,11,0.15)',
          icon: '<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="#F59E0B"/>'
        },
        { 
          value: 'custom', 
          label: '自定义', 
          color: 'rgba(139,92,246,0.15)',
          icon: '<path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" fill="#8B5CF6"/>'
        }
      ]
    }
  },

  computed: {
    linkedPhotos() {
      return this.allPhotos.filter(p => this.current.relatedPhotos.includes(p.id))
    },
    linkedVideos() {
      return this.allVideos.filter(v => this.current.relatedVideos.includes(v.id))
    },
    linkedTranscripts() {
      return this.allTranscripts.filter(t => this.current.relatedTranscripts.includes(t.id))
    }
  },

  onLoad(query) {
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight
    this.loadAllMaterials()
    this.loadReports()

    if (query && query.id) {
      const found = this.allReports.find(r => r.id === query.id)
      if (found) {
        this.current = found
        return
      }
    }
    
    // 新建报告
    this.current = this.createNew()
    this.allReports.push(this.current)
    this.saveReports()
  },

  methods: {
    genId() {
      const d = new Date()
      const p = n => String(n).padStart(2, '0')
      return `GW-R-${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${Math.floor(Math.random()*9000+1000)}`
    },

    createNew() {
      const d = new Date()
      const p = n => String(n).padStart(2, '0')
      const now = `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
      return {
        id: this.genId(),
        type: 'report',
        template: '',
        title: '',
        summary: '',
        content: '',
        conclusion: '',
        relatedPhotos: [],
        relatedVideos: [],
        relatedTranscripts: [],
        status: 'draft',
        createdAt: now,
        updatedAt: now,
        officerId: this.officerId,
        synced: false
      }
    },

    statusLabel(s) {
      return { draft: '草稿', submitted: '已提交', approved: '已审批' }[s] || '未知'
    },

    selectTemplate(tmpl) {
      this.current.template = tmpl.value
      this.autoSave()
    },

    setField(field, val) {
      this.current[field] = val
      this.current.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
      this.autoSave()
    },

    /* 素材选择器 */
    showMaterialPicker() {
      this.showPicker = true
    },
    
    closePicker() {
      this.showPicker = false
    },

    togglePhoto(id) {
      const idx = this.current.relatedPhotos.indexOf(id)
      if (idx > -1) {
        this.current.relatedPhotos.splice(idx, 1)
      } else {
        this.current.relatedPhotos.push(id)
      }
      this.autoSave()
    },

    toggleVideo(id) {
      const idx = this.current.relatedVideos.indexOf(id)
      if (idx > -1) {
        this.current.relatedVideos.splice(idx, 1)
      } else {
        this.current.relatedVideos.push(id)
      }
      this.autoSave()
    },

    toggleTranscript(id) {
      const idx = this.current.relatedTranscripts.indexOf(id)
      if (idx > -1) {
        this.current.relatedTranscripts.splice(idx, 1)
      } else {
        this.current.relatedTranscripts.push(id)
      }
      this.autoSave()
    },

    unlinkPhoto(id) {
      const idx = this.current.relatedPhotos.indexOf(id)
      if (idx > -1) this.current.relatedPhotos.splice(idx, 1)
      this.autoSave()
    },

    unlinkVideo(id) {
      const idx = this.current.relatedVideos.indexOf(id)
      if (idx > -1) this.current.relatedVideos.splice(idx, 1)
      this.autoSave()
    },

    unlinkTranscript(id) {
      const idx = this.current.relatedTranscripts.indexOf(id)
      if (idx > -1) this.current.relatedTranscripts.splice(idx, 1)
      this.autoSave()
    },

    previewPhoto(idx) {
      const urls = this.linkedPhotos.map(p => p.watermarkedPath || p.originalPath)
      uni.previewImage({ current: idx, urls })
    },

    /* 提交 */
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
      this.current.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
      this.saveReports()
      uni.showToast({ title: '报告已提交', icon: 'success' })
      
      // 占位：调用后端接口
      // this.syncToServer()
    },

    /* 菜单 */
    showMenu() {
      uni.showActionSheet({
        itemList: ['导出为PDF', '导出为Word', '删除草稿'],
        success: res => {
          if (res.tapIndex === 0) {
            this.exportPDF()
          } else if (res.tapIndex === 1) {
            this.exportWord()
          } else if (res.tapIndex === 2) {
            this.deleteDraft()
          }
        }
      })
    },

    exportPDF() {
      uni.showToast({ title: '导出功能需连接后端服务', icon: 'none' })
      // 占位：POST /api/reports/:id/export?format=pdf
    },

    exportWord() {
      uni.showToast({ title: '导出功能需连接后端服务', icon: 'none' })
      // 占位：POST /api/reports/:id/export?format=docx
    },

    deleteDraft() {
      uni.showModal({
        title: '确认删除',
        content: '删除后无法恢复，确定要删除此草稿吗？',
        success: r => {
          if (r.confirm) {
            const idx = this.allReports.findIndex(rpt => rpt.id === this.current.id)
            if (idx > -1) this.allReports.splice(idx, 1)
            this.saveReports()
            uni.navigateBack({ delta: 1 })
          }
        }
      })
    },

    /* 自动保存 */
    autoSave() {
      this.saveReports()
    },

    /* 存储 */
    saveReports() {
      try {
        uni.setStorageSync('gw_report_records', JSON.stringify(this.allReports))
      } catch (e) {
        uni.showToast({ title: '存储失败', icon: 'none' })
      }
    },

    loadReports() {
      try {
        const raw = uni.getStorageSync('gw_report_records')
        this.allReports = raw ? JSON.parse(raw) : []
      } catch (e) {
        this.allReports = []
      }
    },

    loadAllMaterials() {
      try {
        const p = uni.getStorageSync('guardian_wings_photos')
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

    /* 后端同步占位 */
    syncToServer() {
      // POST /api/reports
      // const payload = { ...this.current }
      // uni.request({ url: API_BASE + '/reports', method: 'POST', data: payload, success: res => {} })
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

/* 导航 */
.navbar { display: flex; align-items: center; padding: 14rpx 20rpx; background: #0F172A; flex-shrink: 0; }
.nav-back { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.7); }
.nav-center { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2rpx; }
.nav-title { font-size: 30rpx; font-weight: 600; color: #fff; }
.nav-sub { font-size: 20rpx; color: rgba(255,255,255,0.35); font-family: 'SF Mono', monospace; }
.nav-right { display: flex; gap: 8rpx; }
.nav-action { width: 48rpx; height: 48rpx; border-radius: 50%; background: rgba(255,255,255,0.06); border: 1rpx solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.6); }

/* 滚动 */
.scroll { flex: 1; overflow-y: auto; padding: 16rpx 20rpx; }

/* 头部卡片 */
.header-card { background: rgba(255,255,255,0.04); border: 1rpx solid rgba(255,255,255,0.08); border-radius: 16rpx; padding: 18rpx 20rpx; margin-bottom: 20rpx; display: flex; flex-direction: column; gap: 10rpx; }
.hc-row { display: flex; justify-content: space-between; align-items: center; }
.hc-label { font-size: 22rpx; color: rgba(255,255,255,0.4); }
.hc-id { font-size: 22rpx; font-weight: 600; color: rgba(255,255,255,0.75); font-family: 'SF Mono', monospace; }
.hc-time { font-size: 22rpx; color: rgba(255,255,255,0.5); }
.hc-status { padding: 6rpx 16rpx; border-radius: 12rpx; font-size: 20rpx; font-weight: 500; }
.status-draft { background: rgba(245,158,11,0.15); color: #FBBF24; }
.status-submitted { background: rgba(37,99,235,0.15); color: #60A5FA; }
.status-approved { background: rgba(16,185,129,0.15); color: #34D399; }

/* 通用section */
.section { margin-bottom: 24rpx; }
.sec-title { font-size: 24rpx; font-weight: 600; color: rgba(255,255,255,0.5); display: block; margin-bottom: 12rpx; }
.required { color: #EF4444; }
.sec-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.sec-action { display: flex; align-items: center; gap: 6rpx; padding: 6rpx 16rpx; background: rgba(37,99,235,0.15); border: 1rpx solid rgba(37,99,235,0.3); border-radius: 18rpx; color: #60A5FA; font-size: 22rpx; }

/* 模板网格 */
.template-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12rpx; }
.tmpl-card { display: flex; flex-direction: column; align-items: center; gap: 10rpx; padding: 20rpx 12rpx; background: rgba(255,255,255,0.04); border: 1rpx solid rgba(255,255,255,0.08); border-radius: 14rpx; transition: all 0.15s; }
.tmpl-card:active { transform: scale(0.96); }
.tmpl-card.tmpl-active { background: rgba(255,255,255,0.08); border-color: rgba(37,99,235,0.4); }
.tmpl-icon { width: 60rpx; height: 60rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.tmpl-icon svg { width: 30rpx; height: 30rpx; }
.tmpl-name { font-size: 22rpx; color: rgba(255,255,255,0.65); font-weight: 500; }

/* 输入框 */
.text-input {
  width: 100%;
  height: 80rpx;
  padding: 0 18rpx;
  background: rgba(255,255,255,0.05);
  border: 1rpx solid rgba(255,255,255,0.1);
  border-radius: 14rpx;
  color: rgba(255,255,255,0.85);
  font-size: 26rpx;
  box-sizing: border-box;
}

.textarea-input {
  width: 100%;
  min-height: 140rpx;
  padding: 16rpx;
  background: rgba(255,255,255,0.05);
  border: 1rpx solid rgba(255,255,255,0.1);
  border-radius: 14rpx;
  color: rgba(255,255,255,0.85);
  font-size: 24rpx;
  line-height: 1.6;
  box-sizing: border-box;
}

.textarea-large { min-height: 280rpx; }

.char-count { font-size: 20rpx; color: rgba(255,255,255,0.3); margin-top: 8rpx; display: block; }

/* 素材组 */
.material-group { margin-bottom: 16rpx; }
.mg-header { display: flex; align-items: center; gap: 8rpx; margin-bottom: 10rpx; color: rgba(255,255,255,0.5); }
.mg-title { font-size: 22rpx; font-weight: 600; }

.photo-list { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10rpx; }
.photo-thumb { position: relative; aspect-ratio: 1; border-radius: 10rpx; overflow: hidden; }
.photo-img { width: 100%; height: 100%; }
.photo-remove { position: absolute; top: 4rpx; right: 4rpx; width: 32rpx; height: 32rpx; border-radius: 50%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; color: #fff; }

.video-list, .transcript-list { display: flex; flex-direction: column; gap: 8rpx; }
.video-item, .tr-item { display: flex; align-items: center; gap: 12rpx; padding: 12rpx 14rpx; background: rgba(255,255,255,0.04); border: 1rpx solid rgba(255,255,255,0.06); border-radius: 10rpx; }
.vi-icon { width: 36rpx; height: 36rpx; border-radius: 8rpx; background: rgba(37,99,235,0.18); color: #60A5FA; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.vi-icon svg { width: 18rpx; height: 18rpx; }
.vi-name, .tr-id { font-size: 20rpx; font-weight: 600; color: rgba(255,255,255,0.6); font-family: 'SF Mono', monospace; }
.vi-duration { font-size: 20rpx; color: rgba(255,255,255,0.35); margin-left: auto; }
.tr-desc { font-size: 20rpx; color: rgba(255,255,255,0.4); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vi-remove, .tr-remove { color: rgba(255,255,255,0.3); flex-shrink: 0; }

.material-empty { display: flex; flex-direction: column; align-items: center; padding: 40rpx; text-align: center; }
.me-icon { width: 80rpx; height: 80rpx; margin-bottom: 14rpx; }
.me-text { font-size: 22rpx; color: rgba(255,255,255,0.3); }

.safe-bottom { height: 60rpx; }

/* 素材选择弹窗 */
.picker-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); display: flex; align-items: flex-end; z-index: 9999; }
.picker-panel { width: 100%; max-height: 85vh; background: #1E293B; border-radius: 32rpx 32rpx 0 0; display: flex; flex-direction: column; }
.picker-header { display: flex; justify-content: space-between; align-items: center; padding: 24rpx 28rpx; border-bottom: 1rpx solid rgba(255,255,255,0.08); }
.picker-title { font-size: 30rpx; font-weight: 600; color: #fff; }
.picker-close { width: 48rpx; height: 48rpx; border-radius: 50%; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.6); }
.picker-scroll { flex: 1; overflow-y: auto; padding: 20rpx 24rpx; }
.picker-section { margin-bottom: 24rpx; }
.picker-sec-title { font-size: 24rpx; font-weight: 600; color: rgba(255,255,255,0.5); display: block; margin-bottom: 14rpx; }

.picker-photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12rpx; }
.picker-photo { position: relative; aspect-ratio: 1; border-radius: 12rpx; overflow: hidden; border: 2rpx solid transparent; }
.picker-photo-selected { border-color: #3B82F6; }
.picker-photo-img { width: 100%; height: 100%; }
.picker-photo-check { position: absolute; top: 6rpx; right: 6rpx; width: 36rpx; height: 36rpx; border-radius: 50%; background: #3B82F6; display: flex; align-items: center; justify-content: center; color: #fff; }
.picker-photo-check svg { width: 20rpx; height: 20rpx; }

.picker-list { display: flex; flex-direction: column; gap: 8rpx; }
.picker-list-item { display: flex; align-items: center; gap: 14rpx; padding: 16rpx; background: rgba(255,255,255,0.04); border: 1rpx solid rgba(255,255,255,0.08); border-radius: 12rpx; }
.picker-item-selected { background: rgba(37,99,235,0.12); border-color: rgba(37,99,235,0.3); }
.pli-check { width: 32rpx; height: 32rpx; border-radius: 50%; border: 2rpx solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.picker-item-selected .pli-check { background: #3B82F6; border-color: #3B82F6; color: #fff; }
.pli-check svg { width: 18rpx; height: 18rpx; }
.pli-name { font-size: 22rpx; font-weight: 600; color: rgba(255,255,255,0.7); font-family: 'SF Mono', monospace; }
.pli-meta, .pli-desc { font-size: 20rpx; color: rgba(255,255,255,0.4); margin-left: auto; }

.picker-footer { padding: 20rpx 24rpx 40rpx; border-top: 1rpx solid rgba(255,255,255,0.08); }
.picker-btn { width: 100%; height: 88rpx; background: linear-gradient(135deg, #2563EB, #3B82F6); border-radius: 16rpx; color: #fff; font-size: 28rpx; font-weight: 600; display: flex; align-items: center; justify-content: center; border: none; }
.picker-btn::after { border: none; }
.picker-btn:active { opacity: 0.85; }
</style>