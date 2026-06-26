<template>
  <view class="news-section">
    <view class="section-header">
      <text class="section-title">最新动态</text>
      <view class="section-action" @click="goAllNews">
        <text class="action-text">查看全部</text>
        <uni-icons type="right" size="14" color="#1B4B8C" />
      </view>
    </view>
    
    <view class="news-list">
      <view 
        class="news-item" 
        v-for="item in list.slice(0, 3)" 
        :key="item.id"
        @click="goDetail(item)"
      >
        <!-- 封面图 -->
        <image 
          v-if="item.cover" 
          :src="item.cover" 
          class="news-cover" 
          mode="aspectFill" 
        />
        
        <!-- 内容区 -->
        <view class="news-content">
          <text class="news-title">{{ item.title }}</text>
          <text class="news-summary">{{ item.summary }}</text>
          
          <!-- 底部元信息 -->
          <view class="news-meta">
            <view class="meta-left">
              <text class="meta-source">{{ item.source }}</text>
              <text class="meta-divider">|</text>
              <text class="meta-time">{{ item.time }}</text>
            </view>
            <view class="meta-right">
              <view class="news-tag" :class="item.tagType">
                {{ item.tag }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  
  methods: {
    goDetail(item) {
      uni.navigateTo({
        url: `/pages/public/home/news-detail?id=${item.id}`
      })
    },
    goAllNews() {
      uni.navigateTo({
        url: `/pages/public/home/all-news`
      })
    }
  }
}
</script>

<style scoped lang="scss">
/* =========================
   新闻列表组件 - 政务级风格
========================= */
.news-section {
  padding: 0rpx 30rpx 40rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding-top: 30rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #1F2937;
  padding-left: 8rpx;
  border-left: 4rpx solid #1B4B8C;
  font-family: "Microsoft YaHei", sans-serif;
}

.section-action {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: #EBF5FF;
  border-radius: 12rpx;
}

.action-text {
  font-size: 24rpx;
  color: #1B4B8C;
  font-family: "Microsoft YaHei", sans-serif;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

/* 新闻项 */
.news-item {
  display: flex;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #E8E8E8;
  transition: all 0.3s ease;
  overflow: hidden;
}

.news-item:active {
  transform: scale(0.99);
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.1);
}

.news-cover {
  width: 200rpx;
  height: 150rpx;
  border-radius: 12rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
  border: 1rpx solid #E8E8E8;
}

.news-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.news-title {
  font-size: 28rpx;
  color: #1F2937;
  font-weight: 600;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 8rpx;
  font-family: "Microsoft YaHei", sans-serif;
}

.news-summary {
  font-size: 24rpx;
  color: #6B7280;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 16rpx;
  font-family: "Microsoft YaHei", sans-serif;
}

/* 底部信息 */
.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.meta-right {
  display: flex;
  align-items: center;
}

.meta-source {
  font-size: 22rpx;
  color: #9CA3AF;
  font-family: "Microsoft YaHei", sans-serif;
}

.meta-divider {
  font-size: 22rpx;
  color: #D1D5DB;
}

.meta-time {
  font-size: 22rpx;
  color: #9CA3AF;
  font-family: "Microsoft YaHei", sans-serif;
}

.news-tag {
  font-size: 20rpx;
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  font-weight: 500;
  font-family: "Microsoft YaHei", sans-serif;
}

/* 标签颜色 */
.news-tag.law {
  background: #F0FDF4;
  color: #10B981;
}

.news-tag.news {
  background: #FFFBEB;
  color: #F59E0B;
}

.news-tag.science {
  background: #F0F9FF;
  color: #3B82F6;
}
</style>
