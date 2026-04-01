<template>
  <view class="card" @click="$emit('click')">
    <image :src="icon" class="icon" />
    <view class="info">
      <text class="title">{{ title }}</text>
      <text class="desc">{{ desc }}</text>
    </view>
    <text class="arrow">›</text>
  </view>
</template>

<script>
export default {
  props: {
    icon: String,
    title: String,
    desc: String
  }
}
</script>

<style scoped lang="scss">
.card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1px solid #e8e2d6;
}

.icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 20rpx;
}

.info {
  flex: 1;
}

.title {
  font-size: 28rpx;
  color: #3c3c3c;
  font-weight: 500;
}

.desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
}

.arrow {
  font-size: 36rpx;
  color: #ccc;
}
</style>
