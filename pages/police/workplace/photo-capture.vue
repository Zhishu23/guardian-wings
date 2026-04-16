<template>
  <view class="photo-capture-page">
    <canvas
      class="watermark-canvas"
      :canvas-id="'watermarkCanvas'"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
    />

    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />

    <view class="top-navbar">
      <view class="nav-back" @click="goBack">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
        </svg>
      </view>
      <view class="nav-center">
        <text class="nav-title">拍照取证</text>
        <text class="nav-subtitle">{{ filteredPhotoList.length }} / {{ activePhotoCount }} 张</text>
      </view>
      <view class="nav-right">
        <view class="nav-action" @click="showSettings" v-if="photoList.length > 0">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
          </svg>
        </view>
      </view>
    </view>

    <view class="location-bar" :class="locationStatus">
      <view class="location-inner">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="loc-icon">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
        </svg>
        <text class="loc-text">{{ locationText }}</text>
        <view class="loc-refresh" @click="refreshLocation" v-if="locationStatus === 'failed'">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08C16.95 15.3 14.76 17 12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5c1.38 0 2.64.56 3.54 1.46L13 10h7V3l-2.35 3.35z" fill="currentColor"/>
          </svg>
        </view>
      </view>
    </view>

    <view class="watermark-info-bar">
      <view class="info-chip">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="14" height="14">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
          <path d="M12 6v6l4 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <text>{{ currentTime }}</text>
      </view>
      <view class="info-chip">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="14" height="14">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor"/>
        </svg>
        <text>警员 {{ officerId }}</text>
      </view>
      <view class="info-chip info-chip-accent">
        <text>批次 {{ currentBatchLabel }}</text>
      </view>
    </view>

    <view class="filter-strip">
      <view
        v-for="tab in filterTabs"
        :key="tab.key"
        class="filter-pill"
        :class="{ active: activeFilter === tab.key }"
        @click="activeFilter = tab.key"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="content-area">
      <view class="photo-grid" v-if="filteredPhotoList.length > 0">
        <view
          v-for="(photo, index) in filteredPhotoList"
          :key="photo.id"
          class="photo-card"
          :class="{ discarded: photo.status === 'discarded' }"
          @click="openEditor(photo)"
        >
          <view class="photo-thumb-wrapper">
            <image
              :src="photo.watermarkedPath || photo.originalPath"
              class="photo-thumb"
              mode="aspectFill"
            />
            <view class="watermark-badge" :class="photo.watermarked ? 'badge-done' : 'badge-pending'">
              <text>{{ photo.watermarked ? '印' : '原' }}</text>
            </view>
            <view class="photo-index">
              <text>{{ index + 1 }}</text>
            </view>
            <view class="evidence-badge" v-if="photo.isKeyEvidence">
              <text>关键</text>
            </view>
          </view>

          <view class="photo-meta">
            <view class="photo-topline">
              <text class="photo-time">{{ formatDateTime(photo.createdAt || photo.time) }}</text>
              <text class="photo-status" :class="'status-' + normalizeStatus(photo.status)">{{ getStatusText(photo.status) }}</text>
            </view>
            <text class="photo-loc">{{ photo.locationText || photo.location || '位置未知' }}</text>
            <text class="photo-remark" v-if="photo.remark">{{ photo.remark }}</text>
            <text class="photo-event">{{ getPhotoRelationText(photo) }}</text>
            <view class="tag-row" v-if="photo.tags && photo.tags.length">
              <view class="mini-tag" v-for="tag in photo.tags.slice(0, 3)" :key="tag">
                <text>{{ tag }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="empty-state" v-else>
        <view class="empty-icon-wrap">
          <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" class="empty-svg">
            <circle cx="40" cy="40" r="36" fill="#EBF8FF" stroke="#BFDBFE" stroke-width="2"/>
            <path d="M30 28h-4c-1.1 0-2 .9-2 2v20c0 1.1.9 2 2 2h28c1.1 0 2-.9 2-2V30c0-1.1-.9-2-2-2h-4l-3-4H33l-3 4z" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="40" cy="41" r="5" fill="none" stroke="#2563EB" stroke-width="2"/>
          </svg>
        </view>
        <text class="empty-title">开始采集照片</text>
        <text class="empty-desc">拍摄后可立即补充备注、标记关键证据，并归入事件包</text>
      </view>

      <view class="bottom-safe" />
    </scroll-view>

    <view class="bottom-action-bar">
      <view class="action-side" @click="chooseFromAlbum">
        <view class="action-btn-small">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
          </svg>
        </view>
        <text class="action-label">相册</text>
      </view>

      <view class="capture-btn-outer" @click="takePhoto">
        <view class="capture-btn-inner">
          <view class="capture-btn-core">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="currentColor"/>
            </svg>
          </view>
        </view>
      </view>

      <view class="action-side" @click="batchAction" v-if="activePhotoCount > 0">
        <view class="action-btn-small action-delete">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
          </svg>
        </view>
        <text class="action-label">整理</text>
      </view>
      <view class="action-side" v-else></view>
    </view>

    <view class="editor-mask" v-if="editorVisible" @click="closeEditor">
      <view class="editor-sheet" @click.stop="">
        <view class="editor-header">
          <text class="editor-title">照片信息</text>
          <view class="editor-close" @click="closeEditor">
            <text>关闭</text>
          </view>
        </view>

        <scroll-view scroll-y class="editor-scroll">
          <image
            v-if="editorForm.originalPath"
            :src="editorForm.watermarkedPath || editorForm.originalPath"
            class="editor-preview"
            mode="aspectFill"
            @click="previewEditorPhoto"
          />

          <view class="editor-section">
            <text class="editor-label">照片说明</text>
            <textarea
              class="editor-textarea"
              v-model="editorForm.remark"
              maxlength="120"
              placeholder="输入现场说明、目标物或补充信息"
            />
          </view>

          <view class="editor-section">
            <text class="editor-label">归属事件</text>
            <view class="picker-row" @click="pickEvent">
              <text>{{ selectedEventLabel }}</text>
              <text class="picker-arrow">选择</text>
            </view>
          </view>

          <view class="editor-section">
            <text class="editor-label">照片状态</text>
            <view class="chip-row">
              <view
                v-for="item in statusOptions"
                :key="item.value"
                class="select-chip"
                :class="{ active: editorForm.status === item.value }"
                @click="editorForm.status = item.value"
              >
                <text>{{ item.label }}</text>
              </view>
            </view>
          </view>

          <view class="editor-section">
            <view class="switch-row" @click="editorForm.isKeyEvidence = !editorForm.isKeyEvidence">
              <text class="editor-label">关键证据</text>
              <view class="switch-pill" :class="{ on: editorForm.isKeyEvidence }">
                <text>{{ editorForm.isKeyEvidence ? '是' : '否' }}</text>
              </view>
            </view>
          </view>

          <view class="editor-section">
            <text class="editor-label">标签</text>
            <view class="chip-row">
              <view
                v-for="tag in presetTags"
                :key="tag"
                class="select-chip"
                :class="{ active: editorForm.tags.includes(tag) }"
                @click="toggleTag(tag)"
              >
                <text>{{ tag }}</text>
              </view>
            </view>
          </view>

          <view class="editor-section">
            <text class="editor-label">采集信息</text>
            <text class="editor-meta">时间：{{ formatDateTime(editorForm.createdAt || editorForm.time) }}</text>
            <text class="editor-meta">位置：{{ editorForm.locationText || editorForm.location || '位置未知' }}</text>
            <text class="editor-meta">批次：{{ editorForm.batchTitle || editorForm.batchId || '未分批次' }}</text>
          </view>
        </scroll-view>

        <view class="editor-footer">
          <button class="editor-btn editor-btn-light" @click="previewEditorPhoto">预览</button>
          <button class="editor-btn editor-btn-primary" @click="saveEditor">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PhotoCapture',

  data() {
    return {
      statusBarHeight: 0,
      photoList: [],
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
      presetTags: ['现场环境', '嫌疑工具', '动物个体', '车辆船只', '人员痕迹', '其他'],
      statusOptions: [
        { value: 'normal', label: '正常' },
        { value: 'draft', label: '待整理' },
        { value: 'discarded', label: '作废' }
      ],
      currentLatitude: null,
      currentLongitude: null,
      currentAddress: '',
      locationStatus: 'loading',
      locationText: '定位中...',
      officerId: 'GW-2025-0312',
      currentTime: '',
      timeTimer: null,
      canvasWidth: 1,
      canvasHeight: 1,
      editorVisible: false,
      editorForm: null,
      currentBatchId: '',
      pendingEditId: ''
    }
  },

  computed: {
    activePhotoCount() {
      return this.photoList.filter((item) => item.status !== 'discarded').length
    },

    filteredPhotoList() {
      const today = this.getTodayKey()
      return this.photoList.filter((item) => {
        const status = this.normalizeStatus(item.status)
        if (this.activeFilter === 'today') return this.getDateKey(item.createdAt || item.time) === today && status !== 'discarded'
        if (this.activeFilter === 'unfiled') return !item.eventId && status !== 'discarded'
        if (this.activeFilter === 'unlinked') return (!item.linkedReportIds || item.linkedReportIds.length === 0) && status !== 'discarded'
        if (this.activeFilter === 'key') return !!item.isKeyEvidence && status !== 'discarded'
        if (this.activeFilter === 'discarded') return status === 'discarded'
        return status !== 'discarded'
      })
    },

    currentBatchLabel() {
      if (!this.currentBatchId) return '未开始'
      return this.currentBatchId.slice(-6)
    },

    selectedEventLabel() {
      if (!this.editorForm) return '未选择'
      if (!this.editorForm.eventId) return '未归档'
      const found = this.eventOptions.find((item) => item.id === this.editorForm.eventId)
      return found ? found.title : '未归档'
    }
  },

  onLoad(query) {
    const info = uni.getSystemInfoSync()
    this.statusBarHeight = info.statusBarHeight
    this.pendingEditId = query && query.editId ? query.editId : ''
    this.loadOfficerInfo()
    this.loadPhotoList()
    this.loadEventOptions()
    this.startClock()
    this.getLocation()
  },

  onShow() {
    this.loadPhotoList()
    this.loadEventOptions()
    this.tryOpenPendingEditor()
  },

  onUnload() {
    if (this.timeTimer) clearInterval(this.timeTimer)
  },

  methods: {
    loadOfficerInfo() {
      try {
        const raw = uni.getStorageSync('gw_police_info')
        const info = raw ? JSON.parse(raw) : {}
        if (info.officer_id) this.officerId = info.officer_id
      } catch (e) {}
    },

    startClock() {
      this.updateTime()
      this.timeTimer = setInterval(() => this.updateTime(), 1000)
    },

    updateTime() {
      this.currentTime = this.formatFullDateTime(new Date())
    },

    loadEventOptions() {
      this.eventOptions = this.readStorageArray('gw_event_records')
        .slice()
        .sort((a, b) => this.getTimeValue(b.updatedAt || b.createdAt) - this.getTimeValue(a.updatedAt || a.createdAt))
        .map((item) => ({
          id: item.id,
          title: item.title || item.description || '未命名事件'
        }))
    },

    getLocation() {
      this.locationStatus = 'loading'
      this.locationText = '定位中...'
      uni.getLocation({
        type: 'wgs84',
        success: (res) => {
          this.currentLatitude = res.latitude
          this.currentLongitude = res.longitude
          this.currentAddress = '纬度 ' + res.latitude.toFixed(5) + ', 经度 ' + res.longitude.toFixed(5)
          this.locationStatus = 'success'
          this.locationText = this.currentAddress
        },
        fail: () => {
          this.locationStatus = 'failed'
          this.locationText = '定位失败，点击重试'
        }
      })
    },

    refreshLocation() {
      this.getLocation()
    },

    takePhoto() {
      uni.chooseImage({
        count: 1,
        sourceType: ['camera'],
        success: (res) => {
          if (res.tempFilePaths && res.tempFilePaths.length > 0) this.processPhoto(res.tempFilePaths[0])
        },
        fail: () => {
          uni.showToast({ title: '拍照失败，请检查权限', icon: 'none' })
        }
      })
    },

    chooseFromAlbum() {
      uni.chooseImage({
        count: 1,
        sourceType: ['album'],
        success: (res) => {
          if (res.tempFilePaths && res.tempFilePaths.length > 0) this.importAlbumPhoto(res.tempFilePaths[0])
        },
        fail: () => {
          uni.showToast({ title: '选图失败', icon: 'none' })
        }
      })
    },

    importAlbumPhoto(tempPath) {
      if (!this.currentBatchId) this.currentBatchId = this.createBatchId()
      this.savePhoto(tempPath, null)
    },

    processPhoto(tempPath) {
      if (!this.currentBatchId) this.currentBatchId = this.createBatchId()
      uni.getImageInfo({
        src: tempPath,
        success: (imageInfo) => {
          this.canvasWidth = imageInfo.width
          this.canvasHeight = imageInfo.height
          uni.nextTick(() => this.drawWatermark(tempPath, imageInfo.width, imageInfo.height))
        },
        fail: () => {
          this.canvasWidth = 1080
          this.canvasHeight = 1920
          uni.nextTick(() => this.drawWatermark(tempPath, 1080, 1920))
        }
      })
    },

    drawWatermark(tempPath, imgW, imgH) {
      const ctx = uni.createCanvasContext('watermarkCanvas', this)
      ctx.drawImage(tempPath, 0, 0, imgW, imgH)

      const barHeight = Math.round(imgH * 0.13)
      const barY = imgH - barHeight
      ctx.fillStyle = 'rgba(0, 0, 0, 0.52)'
      ctx.fillRect(0, barY, imgW, barHeight)

      const timeStr = this.formatFullDateTime(new Date())
      const locStr = this.currentAddress || '位置信息不可用'
      const idStr = 'ID: ' + this.officerId

      const iconSize = Math.round(imgH * 0.055)
      const fontSize1 = Math.round(imgH * 0.032)
      const fontSize2 = Math.round(imgH * 0.028)
      const fontSize3 = Math.round(imgH * 0.026)
      const marginLeft = Math.round(imgW * 0.04)
      const lineGap = Math.round(imgH * 0.018)
      const textStartY = barY + Math.round(barHeight * 0.28)

      ctx.strokeStyle = 'rgba(255,255,255,0.9)'
      ctx.lineWidth = Math.round(iconSize * 0.15)
      ctx.beginPath()
      ctx.arc(marginLeft + iconSize * 0.5, textStartY + fontSize1 * 0.38, iconSize * 0.42, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(marginLeft + iconSize * 0.5, textStartY + fontSize1 * 0.38 - iconSize * 0.06)
      ctx.lineTo(marginLeft + iconSize * 0.5 + iconSize * 0.2, textStartY + fontSize1 * 0.38 + iconSize * 0.12)
      ctx.stroke()

      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.font = `bold ${fontSize1}px sans-serif`
      ctx.fillText(timeStr, marginLeft + iconSize * 1.1, textStartY + fontSize1 * 0.85)

      const locIconY = textStartY + fontSize1 + lineGap
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.beginPath()
      ctx.arc(marginLeft + iconSize * 0.5, locIconY + fontSize2 * 0.25, iconSize * 0.22, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(marginLeft + iconSize * 0.5, locIconY + fontSize2 * 0.6)
      ctx.lineTo(marginLeft + iconSize * 0.26, locIconY + fontSize2 * 0.0)
      ctx.lineTo(marginLeft + iconSize * 0.74, locIconY + fontSize2 * 0.0)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.font = `${fontSize2}px sans-serif`
      let locDisplay = locStr
      if (locDisplay.length > 22) locDisplay = locDisplay.substring(0, 20) + '...'
      ctx.fillText(locDisplay, marginLeft + iconSize * 1.1, locIconY + fontSize2 * 0.85)

      const idTextWidth = ctx.measureText(idStr).width
      const capsuleW = idTextWidth + Math.round(iconSize * 2.2)
      const capsuleH = Math.round(fontSize3 * 1.7)
      const capsuleX = imgW - marginLeft - capsuleW
      const capsuleY = barY + Math.round(barHeight * 0.34)
      const capsuleR = Math.round(capsuleH * 0.4)

      ctx.fillStyle = 'rgba(37, 99, 235, 0.75)'
      ctx.beginPath()
      ctx.moveTo(capsuleX + capsuleR, capsuleY)
      ctx.lineTo(capsuleX + capsuleW - capsuleR, capsuleY)
      ctx.arc(capsuleX + capsuleW - capsuleR, capsuleY + capsuleR, capsuleR, -Math.PI / 2, Math.PI / 2)
      ctx.lineTo(capsuleX + capsuleR, capsuleY + capsuleH)
      ctx.arc(capsuleX + capsuleR, capsuleY + capsuleR, capsuleR, Math.PI / 2, -Math.PI / 2)
      ctx.closePath()
      ctx.fill()

      const idIconX = capsuleX + Math.round(iconSize * 0.5)
      const idIconY = capsuleY + Math.round(capsuleH * 0.5) - Math.round(fontSize3 * 0.45)
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.arc(idIconX, idIconY, Math.round(fontSize3 * 0.22), 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(idIconX, idIconY + Math.round(fontSize3 * 0.55), Math.round(fontSize3 * 0.28), Math.round(fontSize3 * 0.18), 0, 0, Math.PI)
      ctx.fill()

      ctx.fillStyle = '#FFFFFF'
      ctx.font = `bold ${fontSize3}px sans-serif`
      ctx.fillText(idStr, idIconX + Math.round(iconSize * 0.55), capsuleY + Math.round(capsuleH * 0.68))

      const brandY = barY + barHeight - Math.round(barHeight * 0.25)
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.font = `${Math.round(imgH * 0.018)}px sans-serif`
      ctx.fillText('Guardian Wings', marginLeft, brandY)

      ctx.draw(false, () => {
        uni.canvasToTempFilePath({
          canvasId: 'watermarkCanvas',
          success: (res) => this.savePhoto(tempPath, res.tempFilePath),
          fail: () => {
            uni.showToast({ title: '水印失败，已保存原图', icon: 'none' })
            this.savePhoto(tempPath, null)
          }
        }, this)
      })
    },

    savePhoto(originalPath, watermarkedPath) {
      const finalOriginalPath = originalPath || ''
      const finalWatermarkedPath = watermarkedPath || null
      const photo = {
        id: this.createId('photo'),
        batchId: this.currentBatchId,
        batchTitle: '批次 ' + this.currentBatchId.slice(-6),
        eventId: '',
        createdAt: this.formatFullDateTime(new Date()),
        updatedAt: this.formatFullDateTime(new Date()),
        originalPath: finalOriginalPath,
        watermarkedPath: finalWatermarkedPath,
        watermarked: !!finalWatermarkedPath,
        locationText: this.currentAddress || '位置信息不可用',
        location: this.currentAddress || '位置信息不可用',
        latitude: this.currentLatitude,
        longitude: this.currentLongitude,
        officerId: this.officerId,
        officerName: '',
        remark: '',
        tags: [],
        isKeyEvidence: false,
        linkedReportIds: [],
        status: 'draft'
      }

      this.photoList.unshift(photo)
      this.savePhotoList()
      this.openEditor(photo)
      this.persistPhotoPathInBackground(photo.id, finalOriginalPath, finalWatermarkedPath)
      uni.showToast({ title: '照片已采集', icon: 'success' })
    },

    savePhotoList() {
      try {
        uni.setStorageSync('gw_photo_records', JSON.stringify(this.photoList))
      } catch (e) {
        uni.showToast({ title: '存储失败', icon: 'none' })
      }
    },

    loadPhotoList() {
      const current = this.readStorageArray('gw_photo_records')
      if (current.length > 0) {
        this.photoList = current.map((item) => this.normalizePhoto(item))
        this.tryOpenPendingEditor()
        return
      }
      const legacy = this.readStorageArray('guardian_wings_photos')
      this.photoList = legacy.map((item) => this.normalizePhoto(item))
      if (legacy.length > 0) this.savePhotoList()
      this.tryOpenPendingEditor()
    },

    tryOpenPendingEditor() {
      if (!this.pendingEditId || this.editorVisible) return
      const found = this.photoList.find((item) => item.id === this.pendingEditId)
      if (!found) return
      this.pendingEditId = ''
      this.openEditor(found)
    },

    openEditor(photo) {
      this.editorForm = JSON.parse(JSON.stringify(this.normalizePhoto(photo)))
      this.editorVisible = true
    },

    closeEditor() {
      this.editorVisible = false
      this.editorForm = null
    },

    saveEditor() {
      if (!this.editorForm) return
      const idx = this.photoList.findIndex((item) => item.id === this.editorForm.id)
      if (idx === -1) return
      this.editorForm.updatedAt = this.formatFullDateTime(new Date())
      this.photoList.splice(idx, 1, this.normalizePhoto(this.editorForm))
      this.savePhotoList()
      this.closeEditor()
      uni.showToast({ title: '已保存', icon: 'success' })
    },

    toggleTag(tag) {
      if (!this.editorForm) return
      const tags = this.editorForm.tags || []
      const idx = tags.indexOf(tag)
      if (idx > -1) tags.splice(idx, 1)
      else tags.push(tag)
      this.editorForm.tags = tags
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

    previewEditorPhoto() {
      if (!this.editorForm) return
      const path = this.editorForm.watermarkedPath || this.editorForm.originalPath
      if (!path) {
        uni.showToast({ title: '图片文件丢失', icon: 'none' })
        return
      }
      uni.navigateTo({
        url: '/pages/police/workplace/media-preview?type=image&path=' + encodeURIComponent(path)
      })
    },

    batchAction() {
      uni.showActionSheet({
        itemList: ['标记最新照片作废', '清空全部照片'],
        success: (res) => {
          if (res.tapIndex === 0) this.markLatestDiscarded()
          if (res.tapIndex === 1) this.clearAllPhotos()
        }
      })
    },

    markLatestDiscarded() {
      const latest = this.photoList.find((item) => this.normalizeStatus(item.status) !== 'discarded')
      if (!latest) return
      const idx = this.photoList.findIndex((item) => item.id === latest.id)
      if (idx === -1) return
      const updated = this.normalizePhoto(Object.assign({}, latest, {
        status: 'discarded',
        updatedAt: this.formatFullDateTime(new Date())
      }))
      this.photoList.splice(idx, 1, updated)
      this.savePhotoList()
      uni.showToast({ title: '已标记作废', icon: 'success' })
    },

    clearAllPhotos() {
      uni.showModal({
        title: '确认清空',
        content: '将清空全部照片记录，此操作无法恢复，是否继续？',
        success: (res) => {
          if (!res.confirm) return
          this.photoList = []
          this.savePhotoList()
          uni.showToast({ title: '已清空', icon: 'success' })
        }
      })
    },

    showSettings() {
      uni.showActionSheet({
        itemList: ['保存最新照片到相册', '查看作废照片'],
        success: (res) => {
          if (res.tapIndex === 0) this.saveToAlbum()
          if (res.tapIndex === 1) this.activeFilter = 'discarded'
        }
      })
    },

    saveToAlbum() {
      if (this.photoList.length === 0) return
      const latest = this.photoList[0]
      uni.saveImageToPhotosAlbum({
        filePath: latest.watermarkedPath || latest.originalPath,
        success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
        fail: () => uni.showToast({ title: '保存失败，请检查权限', icon: 'none' })
      })
    },

    getPhotoRelationText(photo) {
      const eventText = photo.eventId ? '已归入事件' : '未归档'
      const reportCount = Array.isArray(photo.linkedReportIds) ? photo.linkedReportIds.length : 0
      return eventText + ' · 已引用 ' + reportCount + ' 次'
    },

    normalizePhoto(photo) {
      const createdAt = photo.createdAt || photo.time || this.formatFullDateTime(new Date())
      const batchId = photo.batchId || this.createBatchId(createdAt)
      return {
        id: photo.id || this.createId('photo'),
        batchId,
        batchTitle: photo.batchTitle || ('批次 ' + batchId.slice(-6)),
        eventId: photo.eventId || '',
        createdAt,
        updatedAt: photo.updatedAt || createdAt,
        originalPath: photo.originalPath,
        watermarkedPath: photo.watermarkedPath || null,
        watermarked: typeof photo.watermarked === 'boolean' ? photo.watermarked : !!photo.watermarkedPath,
        locationText: photo.locationText || photo.location || '位置信息不可用',
        location: photo.location || photo.locationText || '位置信息不可用',
        latitude: photo.latitude || null,
        longitude: photo.longitude || null,
        officerId: photo.officerId || this.officerId,
        officerName: photo.officerName || '',
        remark: photo.remark || '',
        tags: Array.isArray(photo.tags) ? photo.tags : [],
        isKeyEvidence: !!photo.isKeyEvidence,
        linkedReportIds: Array.isArray(photo.linkedReportIds) ? photo.linkedReportIds : [],
        status: this.normalizeStatus(photo.status)
      }
    },

    normalizeStatus(status) {
      if (status === 'discarded') return 'discarded'
      if (status === 'draft' || status === 'pending') return 'draft'
      return 'normal'
    },

    getStatusText(status) {
      const map = {
        normal: '正常',
        draft: '待整理',
        discarded: '作废'
      }
      return map[this.normalizeStatus(status)] || '正常'
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

    createId(prefix) {
      return prefix + '-' + Date.now() + '-' + Math.floor(Math.random() * 900 + 100)
    },

    createBatchId(seedTime) {
      const base = seedTime ? new Date(seedTime) : new Date()
      const pad = (n) => String(n).padStart(2, '0')
      return 'batch-' + base.getFullYear() + pad(base.getMonth() + 1) + pad(base.getDate()) + pad(base.getHours()) + pad(base.getMinutes()) + pad(base.getSeconds())
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
    async persistPhotoPathInBackground(photoId, originalPath, watermarkedPath) {
      if (!photoId) return
      const stableOriginalPath = await this.persistLocalFile(originalPath)
      const stableWatermarkedPath = watermarkedPath ? await this.persistLocalFile(watermarkedPath) : ''
      const finalOriginalPath = stableOriginalPath || originalPath || ''
      const finalWatermarkedPath = stableWatermarkedPath || watermarkedPath || null
      if (finalOriginalPath === originalPath && finalWatermarkedPath === (watermarkedPath || null)) return
      const idx = this.photoList.findIndex((item) => item.id === photoId)
      if (idx === -1) return
      const next = this.normalizePhoto(Object.assign({}, this.photoList[idx], {
        originalPath: finalOriginalPath,
        watermarkedPath: finalWatermarkedPath,
        watermarked: !!finalWatermarkedPath,
        updatedAt: this.formatFullDateTime(new Date())
      }))
      this.photoList.splice(idx, 1, next)
      if (this.editorForm && this.editorForm.id === photoId) {
        this.editorForm.originalPath = finalOriginalPath
        this.editorForm.watermarkedPath = finalWatermarkedPath
        this.editorForm.watermarked = !!finalWatermarkedPath
      }
      this.savePhotoList()
    },

    goBack() {
      uni.navigateBack({ delta: 1 })
    }
  }
}
</script>

<style scoped lang="scss">
.photo-capture-page {
  min-height: 100vh;
  max-height: 100vh;
  background: #0F172A;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.watermark-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
  opacity: 0;
  pointer-events: none;
}

.status-bar { background: #0F172A; flex-shrink: 0; }

.top-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx;
  background: #0F172A;
  flex-shrink: 0;
}

.nav-back,
.nav-right {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.8);
}

.nav-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.nav-title { font-size: 30rpx; font-weight: 600; color: #FFFFFF; }
.nav-subtitle { font-size: 20rpx; color: rgba(255,255,255,0.45); }
.nav-action { color: rgba(255,255,255,0.6); }

.location-bar {
  flex-shrink: 0;
  margin: 0 20rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.location-inner {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 14rpx 18rpx;
}

.loc-icon { width: 28rpx; height: 28rpx; flex-shrink: 0; }
.loc-text { font-size: 22rpx; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.loc-refresh { flex-shrink: 0; }

.location-bar.loading { background: rgba(37, 99, 235, 0.15); border: 1rpx solid rgba(37, 99, 235, 0.3); }
.location-bar.loading .loc-icon,
.location-bar.loading .loc-text { color: #60A5FA; }
.location-bar.success { background: rgba(16, 185, 129, 0.15); border: 1rpx solid rgba(16, 185, 129, 0.3); }
.location-bar.success .loc-icon,
.location-bar.success .loc-text { color: #34D399; }
.location-bar.failed { background: rgba(239, 68, 68, 0.15); border: 1rpx solid rgba(239, 68, 68, 0.3); }
.location-bar.failed .loc-icon,
.location-bar.failed .loc-text,
.location-bar.failed .loc-refresh { color: #F87171; }

.watermark-info-bar {
  flex-shrink: 0;
  display: flex;
  gap: 12rpx;
  padding: 16rpx 20rpx 10rpx;
}

.info-chip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: rgba(255,255,255,0.06);
  border: 1rpx solid rgba(255,255,255,0.1);
  border-radius: 20rpx;
  color: rgba(255,255,255,0.55);
  font-size: 20rpx;
  white-space: nowrap;
}

.info-chip-accent {
  color: #93C5FD;
  border-color: rgba(59,130,246,0.2);
  background: rgba(37,99,235,0.12);
}

.filter-strip {
  flex-shrink: 0;
  display: flex;
  gap: 12rpx;
  padding: 0 20rpx 16rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 96rpx;
  height: 56rpx;
  padding: 0 18rpx;
  border-radius: 28rpx;
  border: 1rpx solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.55);
  background: rgba(255,255,255,0.04);
  font-size: 22rpx;
}

.filter-pill.active {
  background: rgba(37,99,235,0.18);
  border-color: rgba(59,130,246,0.4);
  color: #BFDBFE;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 0 20rpx 16rpx;
}

.photo-grid { display: flex; flex-direction: column; gap: 16rpx; }

.photo-card {
  display: flex;
  gap: 20rpx;
  align-items: center;
  padding: 16rpx;
  background: rgba(255,255,255,0.05);
  border: 1rpx solid rgba(255,255,255,0.08);
  border-radius: 16rpx;
}

.photo-card.discarded { opacity: 0.6; border-color: rgba(248,113,113,0.2); }
.photo-thumb-wrapper { position: relative; width: 120rpx; height: 120rpx; flex-shrink: 0; border-radius: 12rpx; overflow: hidden; }
.photo-thumb { width: 100%; height: 100%; border-radius: 12rpx; }

.watermark-badge,
.photo-index,
.evidence-badge {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18rpx;
  padding: 0 10rpx;
  color: #FFFFFF;
  font-size: 18rpx;
}

.watermark-badge { top: 6rpx; right: 6rpx; min-width: 36rpx; height: 36rpx; }
.badge-done { background: rgba(16,185,129,0.85); }
.badge-pending { background: rgba(245,158,11,0.85); }
.photo-index { bottom: 6rpx; left: 6rpx; min-width: 36rpx; height: 36rpx; background: rgba(0,0,0,0.55); }
.evidence-badge { bottom: 6rpx; right: 6rpx; height: 36rpx; background: rgba(220,38,38,0.85); }

.photo-meta { flex: 1; display: flex; flex-direction: column; gap: 8rpx; min-width: 0; }
.photo-topline { display: flex; align-items: center; justify-content: space-between; gap: 12rpx; }
.photo-time { font-size: 24rpx; font-weight: 600; color: rgba(255,255,255,0.9); }
.photo-status { font-size: 20rpx; }
.status-normal { color: #34D399; }
.status-draft { color: #FBBF24; }
.status-discarded { color: #F87171; }
.photo-loc,
.photo-remark,
.photo-event { font-size: 20rpx; color: rgba(255,255,255,0.46); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.photo-remark { color: rgba(255,255,255,0.72); }

.tag-row,
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.mini-tag,
.select-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46rpx;
  padding: 0 16rpx;
  border-radius: 24rpx;
  background: rgba(255,255,255,0.06);
  border: 1rpx solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.7);
  font-size: 20rpx;
}

.select-chip.active {
  background: rgba(37,99,235,0.18);
  border-color: rgba(59,130,246,0.35);
  color: #BFDBFE;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  text-align: center;
}

.empty-icon-wrap { margin-bottom: 32rpx; }
.empty-svg { width: 160rpx; height: 160rpx; }
.empty-title { font-size: 30rpx; font-weight: 600; color: rgba(255,255,255,0.85); margin-bottom: 12rpx; display: block; }
.empty-desc { font-size: 24rpx; color: rgba(255,255,255,0.4); line-height: 1.6; display: block; }
.bottom-safe { height: 160rpx; }

.bottom-action-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 40rpx 40rpx;
  background: linear-gradient(180deg, transparent 0%, rgba(15,23,42,0.95) 30%);
}

.action-side {
  width: 100rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.action-btn-small {
  width: 76rpx;
  height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.08);
  border: 1rpx solid rgba(255,255,255,0.15);
  border-radius: 50%;
  color: rgba(255,255,255,0.7);
}

.action-btn-small svg { width: 36rpx; height: 36rpx; }
.action-btn-small.action-delete { color: #F87171; border-color: rgba(248,113,113,0.25); background: rgba(239,68,68,0.1); }
.action-label { font-size: 20rpx; color: rgba(255,255,255,0.45); }

.capture-btn-outer {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.capture-btn-inner {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 3rpx solid rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.capture-btn-core {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  box-shadow: 0 4rpx 20rpx rgba(37, 99, 235, 0.45);
}

.capture-btn-core svg { width: 48rpx; height: 48rpx; }

.editor-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: flex-end;
  z-index: 30;
}

.editor-sheet {
  width: 100%;
  max-height: 82vh;
  background: #111827;
  border-radius: 28rpx 28rpx 0 0;
  overflow: hidden;
}

.editor-header,
.editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
}

.editor-header { border-bottom: 1rpx solid rgba(255,255,255,0.08); }
.editor-title { font-size: 30rpx; font-weight: 600; color: #FFFFFF; }
.editor-close { font-size: 24rpx; color: rgba(255,255,255,0.5); }
.editor-scroll { max-height: 58vh; padding: 0 24rpx 24rpx; }
.editor-preview { width: 100%; height: 320rpx; border-radius: 20rpx; margin: 24rpx 0; }
.editor-section { margin-bottom: 24rpx; }
.editor-label { display: block; font-size: 24rpx; color: rgba(255,255,255,0.78); margin-bottom: 14rpx; }

.editor-textarea {
  width: 100%;
  min-height: 120rpx;
  background: rgba(255,255,255,0.05);
  border-radius: 16rpx;
  color: #FFFFFF;
  padding: 20rpx;
  box-sizing: border-box;
}

.picker-row,
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 88rpx;
  padding: 0 20rpx;
  background: rgba(255,255,255,0.05);
  border-radius: 16rpx;
  color: rgba(255,255,255,0.78);
}

.picker-arrow { color: #93C5FD; }

.switch-pill {
  min-width: 84rpx;
  height: 44rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.6);
}

.switch-pill.on {
  background: rgba(220,38,38,0.18);
  color: #FCA5A5;
}

.editor-meta {
  display: block;
  font-size: 22rpx;
  color: rgba(255,255,255,0.5);
  line-height: 1.8;
}

.editor-footer { border-top: 1rpx solid rgba(255,255,255,0.08); gap: 16rpx; }
.editor-btn { flex: 1; height: 84rpx; line-height: 84rpx; border-radius: 18rpx; font-size: 28rpx; }
.editor-btn::after { border: none; }
.editor-btn-light { background: rgba(255,255,255,0.08); color: #E5E7EB; }
.editor-btn-primary { background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%); color: #FFFFFF; }
</style>
