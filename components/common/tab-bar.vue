<template>
  <view class="custom-tabbar">
    <view 
      v-for="item in tabList" 
      :key="item.value"
      class="tab-item"
      :class="{ 'active': active === item.value }"
      @click="switchTab(item)"
    >
      <view class="tab-icon" v-html="getIcon(item.value)" />
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
        { label: '首页', value: 'home', path: '/pages/public/home/home' },
        { label: '识鸟', value: 'bird', path: '/pages/public/bird/bird' },
        { label: '举报', value: 'report', path: '/pages/public/report/report' },
        { label: '志愿者', value: 'volunteer', path: '/pages/public/volunteer/index' },
        { label: '我的', value: 'mine', path: '/pages/public/mine/mine' }
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
    },
    getIcon(value) {
      const isActive = this.active === value
      const color = isActive ? '#1B4B8C' : '#6B7280'
      const strokeWidth = isActive ? '2.5' : '2'
      
      const icons = {
        home: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="${color}"/>
        </svg>`,
        bird: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 4c.85 0 1.57.5 1.88 1.2l2.09 5.22c.18.49-.01 1.04-.45 1.39l-1.09 1.1-2.2-1.05-.37.37 1.16 1.09c.46.46.46 1.18 0 1.64l-3.47 3.48c-.47.46-1.19.46-1.66 0L6.4 13c-.4-.46-.4-1.18.07-1.65l1.89-1.88-1.27-1.97c-.18-.24-.04-.57.21-.67l2.67-1.01c.7-.26 1.42.23 1.68.93l.67 1.92 1.65-.48.46-1.69c.16-.64.71-1.16 1.35-1.28L16 4M12 2c-.5 0-.97.21-1.31.56L7.38 5.87c-.88.88-.88 2.3 0 3.18L8.5 10.16l1.68-1.66c.49-.5 1.21-.5 1.7 0l1.35 1.35 1.11-1.11c.88-.88.88-2.3 0-3.18l-1.21-1.21-.81-2.12C12.19 2.05 12.09 2 12 2z" fill="${color}"/>
        </svg>`,
        report: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="${color}"/>
          <path d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="${color}"/>
        </svg>`,
        volunteer: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="${color}"/>
        </svg>`,
        mine: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="${color}"/>
        </svg>`
      }
      
      return icons[value] || icons.home
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

.tab-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-icon svg {
  width: 100%;
  height: 100%;
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