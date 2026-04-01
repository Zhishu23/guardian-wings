<template>
  <view class="banner-container">
    <swiper
      class="banner"
      autoplay
      circular
      indicator-dots
      indicator-color="rgba(255, 255, 255, 0.5)"
      indicator-active-color="#FFFFFF"
      indicator-dots-style="bottom: 30rpx;"
    >
      <swiper-item v-for="(item, i) in list" :key="i" @click="$emit('clickBanner', item)">
        <view class="banner-item">
          <image :src="item.image" class="banner-img" mode="aspectFill" />
          <view class="banner-overlay">
            <text class="banner-title">{{ item.title }}</text>
          </view>
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped lang="scss">
/* =========================
   轮播组件 - 政务级风格
========================= */
.banner-container {
  margin: 20rpx 30rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.banner {
  height: 380rpx;
}

.banner-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.banner-img {
  width: 100%;
  height: 100%;
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40rpx 30rpx;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
}

.banner-title {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: bold;
  line-height: 1.4;
  max-width: 90%;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
  font-family: "Microsoft YaHei", sans-serif;
}
</style>

