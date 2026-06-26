<template>
  <view class="bird-card" @click="handleClick">
    <!-- 收藏按钮 -->
    <view class="favorite-btn" @click.stop="toggleFavorite">
      <text class="icon">{{ isFavorite ? '♥' : '♡' }}</text>
    </view>
    
    <!-- 保护等级标签 -->
    <view 
      class="level-badge" 
      :style="{
        background: levelInfo.bgColor,
        color: levelInfo.color
      }"
    >
      {{ levelInfo.label }}
    </view>
    
    <!-- 鸟类图片 -->
    <image 
      :src="bird.thumbnail || bird.image" 
      class="bird-image" 
      mode="aspectFill"
    />
    
    <!-- 信息区 -->
    <view class="info">
      <text class="name">{{ bird.name }}</text>
      <text class="latin-name">{{ bird.latinName }}</text>
      
      <!-- 标签 -->
      <view class="tags">
        <view class="tag habitat">
          {{ habitatLabel }}
        </view>
        <view class="tag size">
          {{ bird.size }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { PROTECTION_LEVELS, HABITAT_TYPES } from '@/data/birds.js'

export default {
  props: {
    bird: {
      type: Object,
      required: true
    }
  },
  
  data() {
    return {
      isFavorite: false
    }
  },
  
  computed: {
    levelInfo() {
      return PROTECTION_LEVELS[this.bird.protectionLevel] || {}
    },
    
    habitatLabel() {
      return HABITAT_TYPES[this.bird.habitat] || this.bird.habitat
    }
  },
  
  methods: {
    handleClick() {
      this.$emit('click', this.bird)
    },
    
    toggleFavorite() {
      this.isFavorite = !this.isFavorite
      
      uni.showToast({
        title: this.isFavorite ? '已收藏' : '已取消收藏',
        icon: 'none',
        duration: 1500
      })
      
      this.$emit('favorite', {
        bird: this.bird,
        isFavorite: this.isFavorite
      })
    }
  }
}
</script>

<style scoped lang="scss">
.bird-card {
  position: relative;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(92, 164, 112, 0.08);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
}

/* 收藏按钮 */
.favorite-btn {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  width: 56rpx;
  height: 56rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .icon {
    font-size: 32rpx;
    color: #E53E3E;
  }
}

/* 保护等级标签 */
.level-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
  z-index: 2;
  backdrop-filter: blur(10px);
}

/* 鸟类图片 */
.bird-image {
  width: 100%;
  height: 280rpx;
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
}

/* 信息区 */
.info {
  padding: 24rpx;
}

.name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8rpx;
}

.latin-name {
  display: block;
  font-size: 24rpx;
  color: #718096;
  font-style: italic;
  margin-bottom: 16rpx;
}

/* 标签组 */
.tags {
  display: flex;
  gap: 12rpx;
}

.tag {
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  
  &.habitat {
    background: #e6f4ea;
    color: #34a853;
  }
  
  &.size {
    background: #e8f0fe;
    color: #4285f4;
  }
}
</style>