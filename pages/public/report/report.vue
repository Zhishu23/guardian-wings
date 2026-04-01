<template>
  <view class="report-page">
    <view class="info-banner">
      <svg class="info-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#2D6A4F"/>
        <text x="12" y="16" font-size="14" font-weight="bold" fill="white" text-anchor="middle">i</text>
      </svg>
      <text class="info-text">您的举报对保护野生动物至关重要，我们将严格保密您的信息</text>
    </view>

    <view class="form-container">
      <!-- 事件类型 -->
      <view class="form-section">
        <view class="section-header">
          <text class="section-title">事件类型</text>
          <text class="required-mark">*</text>
        </view>
        <view class="type-grid">
          <view
            v-for="type in reportTypes"
            :key="type.value"
            class="type-item"
            :class="{ 'active': formData.type === type.value }"
            @click="selectType(type.value)"
          >
            <view class="type-icon" v-html="type.icon" />
            <text class="type-label">{{ type.label }}</text>
          </view>
        </view>
      </view>

      <!-- 事件地点 -->
      <view class="form-section">
        <view class="section-header">
          <text class="section-title">事件地点</text>
          <text class="required-mark">*</text>
        </view>
        <view class="location-input">
          <svg class="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#6B7280"/>
          </svg>
          <input
            class="location-text"
            :value="locationDisplay"
            placeholder="点击右侧按钮获取当前位置"
            disabled
          />
          <view class="current-location-btn" @click="getCurrentLocation" :class="{ loading: locating }">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3" fill="#fff"/>
              <circle cx="12" cy="12" r="8" fill="none" stroke="#fff" stroke-width="2"/>
            </svg>
          </view>
        </view>
        <!-- 手动修改地址 -->
        <input
          class="location-manual"
          v-model="formData.location.address"
          placeholder="或手动输入详细地址（可选修改）"
          maxlength="100"
        />
      </view>

      <!-- 事件时间 -->
      <view class="form-section">
        <view class="section-header">
          <text class="section-title">事件时间</text>
          <text class="required-mark">*</text>
        </view>
        <view class="time-row">
          <picker mode="date" :value="formData.date" @change="onDateChange" class="time-picker">
            <view class="picker-display">
              <svg class="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="#6B7280" stroke-width="2"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="#6B7280" stroke-width="2"/>
              </svg>
              <text class="picker-text">{{ formData.date || '选择日期' }}</text>
            </view>
          </picker>
          <picker mode="time" :value="formData.time" @change="onTimeChange" class="time-picker">
            <view class="picker-display">
              <svg class="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="none" stroke="#6B7280" stroke-width="2"/>
                <path d="M12 6v6l4 2" stroke="#6B7280" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <text class="picker-text">{{ formData.time || '选择时间' }}</text>
            </view>
          </picker>
        </view>
      </view>

      <!-- 详细描述 -->
      <view class="form-section">
        <view class="section-header">
          <text class="section-title">详细描述</text>
          <text class="required-mark">*</text>
        </view>
        <textarea
          class="textarea-input"
          v-model="formData.description"
          placeholder="请详细描述事件经过、涉及人员、车辆信息等..."
          maxlength="500"
        />
        <text class="char-count">{{ formData.description.length }}/500</text>
      </view>

      <!-- 上传照片 -->
      <view class="form-section">
        <view class="section-header">
          <text class="section-title">上传照片（选填，最多6张）</text>
        </view>
        <view class="upload-container">
          <view v-for="(img, idx) in formData.images" :key="idx" class="upload-item">
            <image :src="img.src" mode="aspectFill" class="upload-image" />
            <view class="upload-status" v-if="img.uploading">
              <text class="upload-status-text">上传中...</text>
            </view>
            <view class="delete-btn" @click="deleteImage(idx)">
              <text>×</text>
            </view>
          </view>
          <view v-if="formData.images.length < 6" class="upload-btn" @click="chooseImage">
            <svg class="upload-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z" fill="#2D6A4F"/>
            </svg>
            <text class="upload-text">添加照片</text>
          </view>
        </view>
      </view>

      <!-- 匿名举报 -->
      <view class="form-section">
        <view class="anonymous-row">
          <view class="anonymous-left">
            <svg class="anonymous-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="#6B7280"/>
            </svg>
            <view class="anonymous-texts">
              <text class="anonymous-title">匿名举报</text>
              <text class="anonymous-sub">启用后不记录您的账号信息</text>
            </view>
          </view>
          <switch :checked="formData.anonymous" @change="onAnonymousChange" color="#2D6A4F" />
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-container">
      <button class="submit-btn" @click="submitReport" :disabled="submitting">
        <svg v-if="!submitting" class="btn-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="white"/>
        </svg>
        <text>{{ submitting ? '提交中...' : '提交举报' }}</text>
      </button>
    </view>

    <tab-bar active="report" />
  </view>
</template>

<script>
import TabBar from '@/components/common/tab-bar.vue'

export default {
  components: { TabBar },
  data() {
    return {
      submitting: false,
      locating: false,
      reportTypes: [
        {
          value: 'illegal_hunting',
          label: '非法捕鸟',
          icon: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="20" fill="none" stroke="#DC2626" stroke-width="3"/><path d="M16 16l16 16M32 16L16 32" stroke="#DC2626" stroke-width="3" stroke-linecap="round"/></svg>`
        },
        {
          value: 'illegal_trade',
          label: '非法贩卖',
          icon: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="20" fill="none" stroke="#F59E0B" stroke-width="3"/><text x="24" y="30" font-size="20" fill="#F59E0B" text-anchor="middle" font-weight="bold">¥</text></svg>`
        },
        {
          value: 'habitat_destruction',
          label: '栖息地破坏',
          icon: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="20" fill="none" stroke="#8B5CF6" stroke-width="3"/><path d="M18 28l6-8 6 8" fill="none" stroke="#8B5CF6" stroke-width="2.5"/></svg>`
        },
        {
          value: 'other',
          label: '其他违法',
          icon: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="20" fill="none" stroke="#6B7280" stroke-width="3"/><circle cx="24" cy="18" r="2" fill="#6B7280"/><rect x="22" y="24" width="4" height="8" rx="2" fill="#6B7280"/></svg>`
        }
      ],
      formData: {
        type: '',
        location: { address: '', latitude: 0, longitude: 0, name: '' },
        date: '',
        time: '',
        description: '',
        images: [],   // [{ src, url, uploading }]
        anonymous: false
      }
    }
  },

  computed: {
    locationDisplay() {
      const loc = this.formData.location
      if (loc.address) return loc.address
      if (loc.latitude) return `${loc.latitude}, ${loc.longitude}`
      return ''
    }
  },

  onLoad() {
    // 设置默认时间为当前时间
    const now = new Date()
    const pad = n => String(n).padStart(2, '0')
    this.formData.date = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`
    this.formData.time = `${pad(now.getHours())}:${pad(now.getMinutes())}`
  },

  methods: {
    selectType(value) {
      this.formData.type = value
    },

    getCurrentLocation() {
      if (this.locating) return
      this.locating = true
      uni.showLoading({ title: '定位中...' })

      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.formData.location.latitude  = res.latitude
          this.formData.location.longitude = res.longitude

          // 逆地理编码（用 uni.chooseLocation 替代）
          // 这里先显示坐标，用户可手动修改地址
          if (!this.formData.location.address) {
            this.formData.location.address = `${res.latitude.toFixed(5)}, ${res.longitude.toFixed(5)}`
          }
          uni.hideLoading()
          uni.showToast({ title: '定位成功', icon: 'success' })
        },
        fail: () => {
          uni.hideLoading()
          // 定位失败时提供手动输入
          uni.showModal({
            title: '定位失败',
            content: '无法自动获取位置，请手动输入地址',
            showCancel: false
          })
        },
        complete: () => {
          this.locating = false
        }
      })
    },

    onDateChange(e) { this.formData.date = e.detail.value },
    onTimeChange(e) { this.formData.time = e.detail.value },

    onAnonymousChange(e) {
      this.formData.anonymous = e.detail.value
    },

    chooseImage() {
      const remaining = 6 - this.formData.images.length
      uni.chooseImage({
        count: remaining,
        sizeType: ['compressed'],
        success: (res) => {
          res.tempFilePaths.forEach(path => {
            this.formData.images.push({ src: path, url: '', uploading: false })
          })
        }
      })
    },

    deleteImage(idx) {
      this.formData.images.splice(idx, 1)
    },

    async uploadImages() {
      const uploadPromises = this.formData.images
        .filter(img => !img.url)
        .map(async (img, i) => {
          img.uploading = true
          try {
            const ext = img.src.split('.').pop() || 'jpg'
            const uid = this.$store.state.user.uid || 'anon'
            const res = await uniCloud.uploadFile({
              filePath:   img.src,
              cloudPath:  `reports/${uid}_${Date.now()}_${i}.${ext}`,
              onUploadProgress: () => {}
            })
            img.url      = res.fileID
            img.uploading = false
            return res.fileID
          } catch (e) {
            img.uploading = false
            console.error('图片上传失败', e)
            return null
          }
        })
      return Promise.all(uploadPromises)
    },

    async submitReport() {
      // 校验
      if (!this.formData.type) {
        return uni.showToast({ title: '请选择事件类型', icon: 'none' })
      }
      if (!this.formData.location.address && !this.formData.location.latitude) {
        return uni.showToast({ title: '请获取或填写事件地点', icon: 'none' })
      }
      if (!this.formData.date || !this.formData.time) {
        return uni.showToast({ title: '请选择事件时间', icon: 'none' })
      }
      if (!this.formData.description || this.formData.description.trim().length < 10) {
        return uni.showToast({ title: '请详细描述事件（至少10字）', icon: 'none' })
      }

      const uid = this.$store.state.user.uid
      if (!uid) {
        return uni.showModal({
          title: '未登录',
          content: '请先登录后再提交举报',
          confirmText: '去登录',
          success: res => {
            if (res.confirm) uni.navigateTo({ url: '/pages/login/public-login' })
          }
        })
      }

      this.submitting = true
      uni.showLoading({ title: '提交中...' })

      try {
        // 1. 先上传图片
        let imageUrls = []
        if (this.formData.images.length > 0) {
          uni.showLoading({ title: '上传图片中...' })
          const results = await this.uploadImages()
          imageUrls = results.filter(Boolean)
        }

        // 2. 构建时间戳
        const timeStr  = `${this.formData.date} ${this.formData.time}`
        const timestamp = new Date(timeStr).getTime()

        // 3. 提交举报
        uni.showLoading({ title: '提交举报中...' })
        const res = await uniCloud.callFunction({
          name: 'gw-report',
          data: {
            action: 'submitReport',
            params: {
              user_id:     this.formData.anonymous ? 'anonymous' : uid,
              type:        this.formData.type,
              location:    this.formData.location,
              time:        timestamp,
              description: this.formData.description.trim(),
              images:      imageUrls
            }
          }
        })

        uni.hideLoading()

        if (res.result.code === 0) {
          uni.navigateTo({ url: '/pages/public/report/report-success' })
        } else {
          uni.showToast({ title: res.result.msg || '提交失败', icon: 'none' })
        }
      } catch (e) {
        uni.hideLoading()
        console.error('submitReport error:', e)
        uni.showToast({ title: '网络异常，请重试', icon: 'none' })
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped lang="scss">
.report-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F0F9FF 0%, #F5F7FA 100%);
  padding-bottom: 180rpx;
}
.info-banner {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  margin: 24rpx 24rpx 0;
  background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
  border-radius: 16rpx;
  border-left: 6rpx solid #2D6A4F;
}
.info-icon { width: 40rpx; height: 40rpx; flex-shrink: 0; }
.info-text { flex: 1; font-size: 26rpx; color: #065F46; line-height: 1.6; }
.form-container { padding: 0 24rpx; }
.form-section {
  margin-top: 32rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.section-header { display: flex; align-items: center; margin-bottom: 24rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: #1F2937; }
.required-mark { color: #DC2626; font-size: 32rpx; margin-left: 8rpx; }
.type-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20rpx; }
.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32rpx 16rpx;
  background: #F9FAFB;
  border: 2rpx solid #E5E7EB;
  border-radius: 12rpx;
}
.type-item.active {
  background: #ECFDF5;
  border-color: #2D6A4F;
  box-shadow: 0 4rpx 12rpx rgba(45,106,79,0.15);
}
.type-icon { width: 96rpx; height: 96rpx; margin-bottom: 16rpx; }
.type-label { font-size: 26rpx; color: #374151; font-weight: 500; }
.type-item.active .type-label { color: #2D6A4F; font-weight: 600; }
.location-input {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
  border: 2rpx solid #E5E7EB;
  margin-bottom: 16rpx;
}
.input-icon { width: 40rpx; height: 40rpx; flex-shrink: 0; }
.location-text { flex: 1; font-size: 26rpx; color: #374151; }
.current-location-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2D6A4F;
  border-radius: 12rpx;
  flex-shrink: 0;
}
.current-location-btn svg { width: 32rpx; height: 32rpx; }
.current-location-btn.loading { opacity: 0.6; }
.location-manual {
  width: 100%;
  padding: 20rpx 24rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
  border: 2rpx solid #E5E7EB;
  font-size: 26rpx;
  color: #374151;
  box-sizing: border-box;
}
.time-row { display: flex; gap: 20rpx; }
.time-picker { flex: 1; }
.picker-display {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
  border: 2rpx solid #E5E7EB;
}
.picker-text { flex: 1; font-size: 26rpx; color: #374151; }
.textarea-input {
  width: 100%;
  min-height: 280rpx;
  padding: 24rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
  border: 2rpx solid #E5E7EB;
  font-size: 28rpx;
  color: #374151;
  line-height: 1.6;
  box-sizing: border-box;
}
.char-count { display: block; text-align: right; font-size: 22rpx; color: #9CA3AF; margin-top: 8rpx; }
.upload-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16rpx; }
.upload-item { position: relative; aspect-ratio: 1; border-radius: 12rpx; overflow: hidden; }
.upload-image { width: 100%; height: 100%; }
.upload-status {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-status-text { font-size: 22rpx; color: #fff; }
.delete-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 48rpx;
  height: 48rpx;
  background: rgba(0,0,0,0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36rpx;
  line-height: 1;
}
.upload-btn {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #F9FAFB;
  border: 2rpx dashed #D1D5DB;
  border-radius: 12rpx;
}
.upload-icon { width: 64rpx; height: 64rpx; margin-bottom: 12rpx; }
.upload-text { font-size: 24rpx; color: #6B7280; }
.anonymous-row { display: flex; align-items: center; justify-content: space-between; }
.anonymous-left { display: flex; align-items: center; gap: 20rpx; }
.anonymous-icon { width: 56rpx; height: 56rpx; }
.anonymous-texts { display: flex; flex-direction: column; }
.anonymous-title { font-size: 28rpx; color: #1F2937; font-weight: 500; }
.anonymous-sub { font-size: 24rpx; color: #9CA3AF; margin-top: 4rpx; }
.submit-container {
  position: fixed;
  bottom: 120rpx;
  left: 0;
  right: 0;
  padding: 24rpx;
  background: linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.9) 30%, #FFFFFF 100%);
}
.submit-btn {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  background: linear-gradient(135deg, #2D8F47 0%, #2D6A4F 100%);
  border-radius: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(45,106,79,0.3);
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
  border: none;
}
.submit-btn[disabled] { opacity: 0.7; }
.submit-btn::after { border: none; }
.btn-icon { width: 36rpx; height: 36rpx; }
</style>