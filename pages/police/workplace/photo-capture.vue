<template>
  <view class="photo-capture-page">
    <!-- 隐藏的 canvas，用于水印绘制 -->
    <canvas
      class="watermark-canvas"
      :canvas-id="'watermarkCanvas'"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
    />

    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />

    <!-- 顶部导航 -->
    <view class="top-navbar">
      <view class="nav-back" @click="goBack">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
        </svg>
      </view>
      <view class="nav-center">
        <text class="nav-title">照片采集</text>
        <text class="nav-subtitle">{{ photoList.length }} 张已采集</text>
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

    <!-- 位置状态栏 -->
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

    <!-- 水印预览信息栏 -->
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
    </view>

    <!-- 核心区域：预览图片列表或空态 -->
    <scroll-view scroll-y class="content-area">
      <!-- 有图片时的列表 -->
      <view class="photo-grid" v-if="photoList.length > 0">
        <view
          v-for="(photo, index) in photoList"
          :key="photo.id"
          class="photo-card"
          @click="previewPhoto(index)"
        >
          <view class="photo-thumb-wrapper">
            <image
              :src="photo.watermarkedPath || photo.originalPath"
              class="photo-thumb"
              mode="aspectFill"
            />
            <!-- 水印状态标记 -->
            <view class="watermark-badge" :class="photo.watermarked ? 'badge-done' : 'badge-pending'">
              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" width="12" height="12" v-if="photo.watermarked">
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="currentColor"/>
              </svg>
              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" width="12" height="12" v-else>
                <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 4v4l3 1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </view>
            <!-- 序号 -->
            <view class="photo-index">
              <text>{{ index + 1 }}</text>
            </view>
          </view>

          <view class="photo-meta">
            <text class="photo-time">{{ photo.time }}</text>
            <text class="photo-loc">{{ photo.location || '位置未知' }}</text>
          </view>
        </view>
      </view>

      <!-- 空态 -->
      <view class="empty-state" v-else>
        <view class="empty-icon-wrap">
          <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" class="empty-svg">
            <circle cx="40" cy="40" r="36" fill="#EBF8FF" stroke="#BFDBFE" stroke-width="2"/>
            <path d="M30 28h-4c-1.1 0-2 .9-2 2v20c0 1.1.9 2 2 2h28c1.1 0 2-.9 2-2V30c0-1.1-.9-2-2-2h-4l-3-4H33l-3 4z" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="40" cy="41" r="5" fill="none" stroke="#2563EB" stroke-width="2"/>
            <path d="M46 27l3-3" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M49 24l2 0M49 24l0 2" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </view>
        <text class="empty-title">开始采集照片</text>
        <text class="empty-desc">点击下方拍照按钮，系统将自动添加时间戳、位置信息和警员ID水印</text>
      </view>

      <view class="bottom-safe" />
    </scroll-view>

    <!-- 底部拍照操作栏 -->
    <view class="bottom-action-bar">
      <!-- 左侧：照相册选图 -->
      <view class="action-side" @click="chooseFromAlbum">
        <view class="action-btn-small">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
          </svg>
        </view>
        <text class="action-label">相册</text>
      </view>

      <!-- 中央：拍照按钮 -->
      <view class="capture-btn-outer" @click="takePhoto">
        <view class="capture-btn-inner">
          <view class="capture-btn-core">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="currentColor"/>
            </svg>
          </view>
        </view>
      </view>

      <!-- 右侧：删除/清理 -->
      <view class="action-side" @click="batchAction" v-if="photoList.length > 0">
        <view class="action-btn-small action-delete">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
          </svg>
        </view>
        <text class="action-label">删除</text>
      </view>
      <view class="action-side" v-else>
        <!-- 占位，保持按钮居中 -->
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

      // 照片列表（本地存储）
      photoList: [],

      // 当前位置信息
      currentLatitude: null,
      currentLongitude: null,
      currentAddress: '',
      locationStatus: 'loading', // loading | success | failed
      locationText: '定位中...',

      // 警员信息（实际应从登录状态获取）
      officerId: 'GW-2025-0312',

      // 实时时间显示
      currentTime: '',
      timeTimer: null,

      // canvas 绘制用
      canvasWidth: 1,
      canvasHeight: 1,

      // 上传状态占位
      syncStatus: 'idle' // idle | syncing | synced
    }
  },

  onLoad() {
    const info = uni.getSystemInfoSync()
    this.statusBarHeight = info.statusBarHeight

    // 加载本地存储的照片列表
    this.loadPhotoList()

    // 启动实时时钟
    this.startClock()

    // 获取位置
    this.getLocation()
  },

  onUnload() {
    if (this.timeTimer) clearInterval(this.timeTimer)
  },

  methods: {
  
    startClock() {
      this.updateTime()
      this.timeTimer = setInterval(() => { this.updateTime() }, 1000)
    },

    updateTime() {
      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      this.currentTime =
        now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) +
        ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds())
    },

  
    getLocation() {
      this.locationStatus = 'loading'
      this.locationText = '定位中...'

      uni.getLocation({
        type: 'wgs84',
        success: (res) => {
          this.currentLatitude = res.latitude
          this.currentLongitude = res.longitude
          this.locationStatus = 'success'

          this.currentAddress = `纬度 ${res.latitude.toFixed(5)}, 经度 ${res.longitude.toFixed(5)}`
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
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            this.processPhoto(res.tempFilePaths[0])
          }
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
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            this.processPhoto(res.tempFilePaths[0])
          }
        },
        fail: () => {
          uni.showToast({ title: '选图失败', icon: 'none' })
        }
      })
    },

  
    processPhoto(tempPath) {
    
      uni.getImageInfo({
        src: tempPath,
        success: (imageInfo) => {
          const imgW = imageInfo.width
          const imgH = imageInfo.height

         
          this.canvasWidth = imgW
          this.canvasHeight = imgH

        
          uni.nextTick(() => {
            this.drawWatermark(tempPath, imgW, imgH)
          })
        },
        fail: () => {
         
          this.canvasWidth = 1080
          this.canvasHeight = 1920
          uni.nextTick(() => {
            this.drawWatermark(tempPath, 1080, 1920)
          })
        }
      })
    },

    drawWatermark(tempPath, imgW, imgH) {
      const ctx = uni.createCanvasContext('watermarkCanvas', this)

      // 1. 绘制原图
      ctx.drawImage(tempPath, 0, 0, imgW, imgH)

      // 2. 底部水印背景（半透明黑色条带）
      const barHeight = Math.round(imgH * 0.13)
      const barY = imgH - barHeight
      ctx.fillStyle = 'rgba(0, 0, 0, 0.52)'
      ctx.fillRect(0, barY, imgW, barHeight)

      // 3. 文本参数
      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const timeStr =
        now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) +
        ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds())

      const locStr = this.currentAddress || '位置信息不可用'
      const idStr = 'ID: ' + this.officerId

      // 图标区域宽度
      const iconSize = Math.round(imgH * 0.055)
      const fontSize1 = Math.round(imgH * 0.032)  
      const fontSize2 = Math.round(imgH * 0.028)  
      const fontSize3 = Math.round(imgH * 0.026)  
      const marginLeft = Math.round(imgW * 0.04)
      const lineGap = Math.round(imgH * 0.018)

      // ---- 左侧：时间 + 位置 ----
      const textStartY = barY + Math.round(barHeight * 0.28)

      // 时间图标（圆+线）
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'
      ctx.lineWidth = Math.round(iconSize * 0.15)
      ctx.beginPath()
      ctx.arc(marginLeft + iconSize * 0.5, textStartY + fontSize1 * 0.38, iconSize * 0.42, 0, Math.PI * 2)
      ctx.stroke()
      // 时间针
      ctx.beginPath()
      ctx.moveTo(marginLeft + iconSize * 0.5, textStartY + fontSize1 * 0.38 - iconSize * 0.06)
      ctx.lineTo(marginLeft + iconSize * 0.5 + iconSize * 0.2, textStartY + fontSize1 * 0.38 + iconSize * 0.12)
      ctx.stroke()

      // 时间文本
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.font = `bold ${fontSize1}px sans-serif`
      ctx.fillText(timeStr, marginLeft + iconSize * 1.1, textStartY + fontSize1 * 0.85)

      // 位置图标（定位针）
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

      // 位置文本（截断处理）
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.font = `${fontSize2}px sans-serif`
      let locDisplay = locStr
      if (locDisplay.length > 22) locDisplay = locDisplay.substring(0, 20) + '...'
      ctx.fillText(locDisplay, marginLeft + iconSize * 1.1, locIconY + fontSize2 * 0.85)

      // ---- 右侧：警员ID ----
      // 背景胶囊
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

      // ID 图标（人形简图）
      const idIconX = capsuleX + Math.round(iconSize * 0.5)
      const idIconY = capsuleY + Math.round(capsuleH * 0.5) - Math.round(fontSize3 * 0.45)
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.arc(idIconX, idIconY, Math.round(fontSize3 * 0.22), 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(idIconX, idIconY + Math.round(fontSize3 * 0.55), Math.round(fontSize3 * 0.28), Math.round(fontSize3 * 0.18), 0, 0, Math.PI)
      ctx.fill()

      // ID 文本
      ctx.fillStyle = '#FFFFFF'
      ctx.font = `bold ${fontSize3}px sans-serif`
      ctx.fillText(idStr, idIconX + Math.round(iconSize * 0.55), capsuleY + Math.round(capsuleH * 0.68))

      // ---- 左下角：项目标识 ----
      const brandY = barY + barHeight - Math.round(barHeight * 0.25)
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.font = `${Math.round(imgH * 0.018)}px sans-serif`
      ctx.fillText('Guardian Wings · 翼路平安', marginLeft, brandY)

      // 4. 导出 canvas 为图片
      uni.canvasToTempFilePath({
        canvasId: 'watermarkCanvas',
        success: (res) => {
          this.savePhoto(tempPath, res.tempFilePath)
        },
        fail: () => {
          // canvas导出失败，保存原图
          uni.showToast({ title: '水印添加失败，已保存原图', icon: 'none' })
          this.savePhoto(tempPath, null)
        }
      }, this)
    },

 
    savePhoto(originalPath, watermarkedPath) {
      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')

      const photo = {
        id: Date.now().toString(),
        originalPath: originalPath,
        watermarkedPath: watermarkedPath || null,
        watermarked: !!watermarkedPath,
        time: now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) +
              ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds()),
        location: this.currentAddress || '位置信息不可用',
        latitude: this.currentLatitude,
        longitude: this.currentLongitude,
        officerId: this.officerId,
        synced: false
      }

      this.photoList.unshift(photo)
      this.savePhotoList()

      uni.showToast({ title: '照片已采集', icon: 'success' })
    },

   
    savePhotoList() {
      try {
        uni.setStorageSync('guardian_wings_photos', JSON.stringify(this.photoList))
      } catch (e) {
        uni.showToast({ title: '存储失败', icon: 'none' })
      }
    },

    loadPhotoList() {
      try {
        const raw = uni.getStorageSync('guardian_wings_photos')
        if (raw) {
          this.photoList = JSON.parse(raw)
        }
      } catch (e) {
        this.photoList = []
      }
    },

 
    previewPhoto(index) {
      const photo = this.photoList[index]
      const urls = this.photoList.map(p => p.watermarkedPath || p.originalPath)
      uni.previewImage({
        current: index,
        urls: urls
      })
    },


    batchAction() {
      uni.showActionSheet({
        itemList: ['删除最新一张', '清空全部照片'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.deletePhoto(0)
          } else if (res.tapIndex === 1) {
            this.clearAllPhotos()
          }
        }
      })
    },

    deletePhoto(index) {
      uni.showModal({
        title: '确认删除',
        content: '删除后无法恢复，确定要删除吗？',
        success: (res) => {
          if (res.confirm) {
            this.photoList.splice(index, 1)
            this.savePhotoList()
            uni.showToast({ title: '已删除', icon: 'success' })
          }
        }
      })
    },

    clearAllPhotos() {
      uni.showModal({
        title: '确认清空',
        content: `将删除全部 ${this.photoList.length} 张照片，此操作不可恢复。`,
        success: (res) => {
          if (res.confirm) {
            this.photoList = []
            this.savePhotoList()
            uni.showToast({ title: '已清空', icon: 'success' })
          }
        }
      })
    },

   
    showSettings() {
      uni.showActionSheet({
        itemList: ['保存最新照片到相册', '查看采集明细'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.saveToAlbum()
          } else if (res.tapIndex === 1) {
            uni.showToast({ title: '采集明细功能开发中', icon: 'none' })
          }
        }
      })
    },

    // 保存到系统相册
    saveToAlbum() {
      if (this.photoList.length === 0) return
      const latest = this.photoList[0]
      const path = latest.watermarkedPath || latest.originalPath
      uni.saveImageToPhotosAlbum({
        filePath: path,
        success: () => {
          uni.showToast({ title: '已保存到相册', icon: 'success' })
        },
        fail: () => {
          uni.showToast({ title: '保存失败，请检查相册权限', icon: 'none' })
        }
      })
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

.status-bar {
  background: #0F172A;
  flex-shrink: 0;
}


.top-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx;
  background: #0F172A;
  flex-shrink: 0;
}

.nav-back {
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

.nav-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.nav-subtitle {
  font-size: 20rpx;
  color: rgba(255,255,255,0.45);
}

.nav-right {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-action {
  color: rgba(255,255,255,0.6);
}


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

.loc-icon {
  width: 28rpx;
  height: 28rpx;
  flex-shrink: 0;
}

.loc-text {
  font-size: 22rpx;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loc-refresh {
  flex-shrink: 0;
}

// 状态颜色
.location-bar.loading {
  background: rgba(37, 99, 235, 0.15);
  border: 1rpx solid rgba(37, 99, 235, 0.3);

  .loc-icon, .loc-text { color: #60A5FA; }
}

.location-bar.success {
  background: rgba(16, 185, 129, 0.15);
  border: 1rpx solid rgba(16, 185, 129, 0.3);

  .loc-icon, .loc-text { color: #34D399; }
}

.location-bar.failed {
  background: rgba(239, 68, 68, 0.15);
  border: 1rpx solid rgba(239, 68, 68, 0.3);

  .loc-icon, .loc-text, .loc-refresh { color: #F87171; }
}


.watermark-info-bar {
  flex-shrink: 0;
  display: flex;
  gap: 12rpx;
  padding: 16rpx 20rpx;
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


.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 16rpx 20rpx;
}


.photo-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.photo-card {
  display: flex;
  gap: 20rpx;
  align-items: center;
  padding: 16rpx;
  background: rgba(255,255,255,0.05);
  border: 1rpx solid rgba(255,255,255,0.08);
  border-radius: 16rpx;
  transition: background 0.2s;
}

.photo-card:active {
  background: rgba(255,255,255,0.1);
}

.photo-thumb-wrapper {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  flex-shrink: 0;
  border-radius: 12rpx;
  overflow: hidden;
}

.photo-thumb {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.watermark-badge {
  position: absolute;
  top: 6rpx;
  right: 6rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-done {
  background: rgba(16, 185, 129, 0.85);
  color: #FFFFFF;
}

.badge-pending {
  background: rgba(245, 158, 11, 0.85);
  color: #FFFFFF;
}

.photo-index {
  position: absolute;
  bottom: 6rpx;
  left: 6rpx;
  min-width: 36rpx;
  height: 36rpx;
  padding: 0 8rpx;
  background: rgba(0,0,0,0.55);
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.photo-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
}

.photo-time {
  font-size: 24rpx;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
}

.photo-loc {
  font-size: 20rpx;
  color: rgba(255,255,255,0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  text-align: center;
}

.empty-icon-wrap {
  margin-bottom: 32rpx;
}

.empty-svg {
  width: 160rpx;
  height: 160rpx;
}

.empty-title {
  font-size: 30rpx;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  margin-bottom: 12rpx;
  display: block;
}

.empty-desc {
  font-size: 24rpx;
  color: rgba(255,255,255,0.4);
  line-height: 1.6;
  display: block;
}

.bottom-safe {
  height: 160rpx;
}


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
  transition: background 0.2s;
}

.action-btn-small:active {
  background: rgba(255,255,255,0.16);
}

.action-btn-small svg {
  width: 36rpx;
  height: 36rpx;
}

.action-btn-small.action-delete {
  color: #F87171;
  border-color: rgba(248, 113, 113, 0.25);
  background: rgba(239, 68, 68, 0.1);
}

.action-label {
  font-size: 20rpx;
  color: rgba(255,255,255,0.45);
}

// 核心拍照按钮 - 三层圆环
.capture-btn-outer {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.capture-btn-outer:active {
  background: rgba(255,255,255,0.15);
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

.capture-btn-core svg {
  width: 48rpx;
  height: 48rpx;
}
</style>