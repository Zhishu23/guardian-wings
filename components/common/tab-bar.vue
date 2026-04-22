<template>
  <view class="custom-tabbar">
    <view 
      v-for="item in tabList" 
      :key="item.value"
      class="tab-item"
      :class="{ 'active': active === item.value }"
      @click="switchTab(item)"
    >
      <uni-icons 
        :type="item.icon" 
        :size="24" 
        :color="active === item.value ? '#1B4B8C' : '#6B7280'" 
      />
      <text class="tab-label">{{ item.label }}</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    active: {
      type: String,
      default: 'home'
    }
  },
  data() {
    return {
    tabList: [
      { label: '首页', value: 'home', path: '/pages/public/home/home', icon: 'home' },
      { label: '识鸟', value: 'bird', path: '/pages/public/bird/bird', icon: 'eye' },
      { label: '举报', value: 'report', path: '/pages/public/report/report', icon: 'chatbubble' },
      { label: '志愿者', value: 'volunteer', path: '/pages/public/volunteer/index', icon: 'heart' },
      { label: '我的', value: 'mine', path: '/pages/public/mine/mine', icon: 'person' }
    ]
    }
  },
  methods: {
    switchTab(item) {
      if (this.active === item.value) return
      uni.switchTab({
        url: item.path,
        fail: (err) => {
          console.error('跳转失败', err)
          uni.showToast({ title: '跳转失败', icon: 'none' })
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  display: flex;
  background: #FFFFFF;
  box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.08);
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: all 0.3s;
}

.tab-item:active {
  transform: scale(0.95);
}
.tab-label {
  font-size: 20rpx;
  color: #6B7280;
  font-weight: 500;
  transition: all 0.3s;
}

.tab-item.active .tab-label {
  color: #1B4B8C;
  font-weight: 600;
}
</style>