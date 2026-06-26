<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <uni-icons type="back" size="24" color="#333333" />
        <text>返回</text>
      </view>
    </view>

    <view v-if="loading" class="state-box">
      <text>加载中...</text>
    </view>

    <view v-else-if="brief._id" class="content">
      <image v-if="brief.cover" :src="brief.cover" class="cover" mode="aspectFill" />

      <view class="hero-card">
        <text class="hero-title">{{ brief.title }}</text>
        <text class="hero-date">{{ brief.dateKey }}</text>
        <text class="hero-summary">{{ brief.summary }}</text>
        <text class="hero-lead">{{ brief.lead }}</text>
      </view>

      <view class="stats-row" v-if="brief.stats">
        <view class="stat-card">
          <text class="stat-value">{{ brief.stats.newsCount || 0 }}</text>
          <text class="stat-label">纳入新闻</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ brief.stats.migratoryBirdCount || 0 }}</text>
          <text class="stat-label">候鸟优先</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ brief.stats.ecologyCount || 0 }}</text>
          <text class="stat-label">生态兜底</text>
        </view>
      </view>

      <view
        v-for="(section, index) in brief.sections || []"
        :key="index"
        class="section-card"
      >
        <text class="section-title">{{ section.title }}</text>
        <text class="section-content">{{ section.content }}</text>
      </view>

      <view v-if="brief.newsRefs && brief.newsRefs.length" class="section-card">
        <text class="section-title">相关新闻</text>
        <view
          v-for="item in brief.newsRefs"
          :key="item.id"
          class="news-item"
          @click="openNews(item.id)"
        >
          <view class="news-main">
            <text class="news-title">{{ item.title }}</text>
            <text class="news-summary">{{ item.summary }}</text>
            <text class="news-meta">{{ item.source }} · {{ item.time }}</text>
          </view>
          <view class="news-tag">
            <text>{{ item.themeCategory === 'migratory-bird' ? '候鸟' : '生态' }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="state-box">
      <text>暂无早报内容</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      brief: {}
    }
  },

  onLoad(options) {
    this.loadBrief(options.id)
  },

  methods: {
    async loadBrief(id) {
      this.loading = true
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-news-admin',
          data: {
            action: id ? 'getMorningBriefDetail' : 'getLatestMorningBrief',
            id
          }
        })

        const result = res.result || {}
        if (!result.success) {
          throw new Error(result.message || '早报加载失败')
        }
        this.brief = result.data || {}
      } catch (error) {
        console.error('load brief failed:', error && error.message ? error.message : error)
        this.brief = {}
      } finally {
        this.loading = false
      }
    },

    openNews(id) {
      if (!id) return
      uni.navigateTo({
        url: `/pages/public/home/news-detail?id=${id}`
      })
    },

    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f4f8fc 0%, #eef3f8 100%);
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 88rpx 32rpx 20rpx;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.nav-back {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.nav-back text {
  font-size: 30rpx;
  color: #333;
}

.state-box {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8894a7;
  font-size: 28rpx;
}

.content {
  padding: 24rpx;
}

.cover {
  width: 100%;
  height: 320rpx;
  border-radius: 28rpx;
  margin-bottom: 20rpx;
}

.hero-card,
.section-card {
  background: #fff;
  border-radius: 28rpx;
  padding: 28rpx;
  box-shadow: 0 14rpx 28rpx rgba(27, 75, 140, 0.08);
  margin-bottom: 20rpx;
}

.hero-title {
  display: block;
  font-size: 38rpx;
  font-weight: 700;
  color: #1b2b44;
  line-height: 1.5;
}

.hero-date {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #7b8aa0;
}

.hero-summary,
.hero-lead,
.section-content {
  display: block;
  margin-top: 16rpx;
  font-size: 28rpx;
  line-height: 1.8;
  color: #425466;
  white-space: pre-line;
}

.stats-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx 12rpx;
  text-align: center;
  box-shadow: 0 14rpx 28rpx rgba(27, 75, 140, 0.08);
}

.stat-value {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #1b4b8c;
}

.stat-label {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #7b8aa0;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #1b2b44;
}

.news-item {
  display: flex;
  gap: 18rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eef2f7;
}

.news-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.news-main {
  flex: 1;
}

.news-title {
  display: block;
  font-size: 28rpx;
  color: #1f2937;
  line-height: 1.5;
  font-weight: 600;
}

.news-summary {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #68758a;
}

.news-meta {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #95a1b2;
}

.news-tag {
  align-self: flex-start;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: #eef5ff;
}

.news-tag text {
  font-size: 22rpx;
  color: #1b4b8c;
}
</style>
