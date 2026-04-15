<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
    <view class="navbar">
      <view class="nav-btn" @click="goBack">返回</view>
      <view class="nav-center">
        <text class="nav-title">{{ pageTitle }}</text>
      </view>
      <view class="nav-btn placeholder"></view>
    </view>

    <view class="content">
      <view v-if="!mediaPath" class="empty">
        <text class="empty-text">未找到可预览资源</text>
      </view>

      <view v-else-if="mediaType === 'video'" class="video-wrap">
        <video
          id="previewVideo"
          class="video-player"
          :src="mediaPath"
          :poster="poster"
          controls
          autoplay
          show-center-play-btn
          object-fit="contain"
          @error="onVideoError"
        />
      </view>

      <view v-else class="image-wrap">
        <image class="image-view" :src="mediaPath" mode="aspectFit" @click="zoomImage" />
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MediaPreview',
  data() {
    return {
      statusBarHeight: 0,
      mediaType: 'image',
      mediaPath: '',
      poster: '',
      pageTitle: '媒体预览'
    }
  },
  onLoad(query) {
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0
    const type = query && query.type ? String(query.type) : 'image'
    this.mediaType = type === 'video' ? 'video' : 'image'
    this.mediaPath = query && query.path ? decodeURIComponent(query.path) : ''
    this.poster = query && query.poster ? decodeURIComponent(query.poster) : ''
    this.pageTitle = this.mediaType === 'video' ? '视频预览' : '图片预览'
  },
  methods: {
    zoomImage() {
      if (!this.mediaPath) return
      uni.previewImage({
        current: 0,
        urls: [this.mediaPath]
      })
    },
    onVideoError() {
      uni.showToast({ title: '视频加载失败', icon: 'none' })
    },
    goBack() {
      uni.navigateBack({ delta: 1 })
    }
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #0f172a;
  display: flex;
  flex-direction: column;
}
.status-bar {
  background: #0f172a;
}
.navbar {
  height: 88rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  background: #0f172a;
}
.nav-btn {
  width: 88rpx;
  color: rgba(255, 255, 255, 0.75);
  font-size: 26rpx;
}
.nav-btn.placeholder {
  opacity: 0;
}
.nav-center {
  flex: 1;
  text-align: center;
}
.nav-title {
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
}
.content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  box-sizing: border-box;
}
.video-wrap,
.image-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.video-player {
  width: 100%;
  max-height: 72vh;
  border-radius: 16rpx;
  background: #000;
}
.image-view {
  width: 100%;
  height: 100%;
}
.empty-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 26rpx;
}
</style>
