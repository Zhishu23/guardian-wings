<template>
  <view class="home-page">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <view class="nav-left">
        <view class="logo-container">
          <view class="logo-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M12 7V12L15 15" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </view>
          <text class="nav-title">翼路平安</text>
        </view>
        <text class="nav-subtitle">国家林草局指导 · 候鸟保护平台</text>
      </view>
      <view class="nav-actions">
        <view class="action-icon" @click="goNotification">
          <view class="badge-dot" v-if="hasNotification"></view>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM20 18V10C20 6.13 16.87 3 13 3H11C7.13 3 4 6.13 4 10V18L2 20V21H22V20L20 18Z" 
                  fill="#FFFFFF"/>
          </svg>
        </view>
        <view class="action-icon" @click="goSearch">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" 
                  fill="#FFFFFF"/>
          </svg>
        </view>
      </view>
    </view>

    <!-- 顶部轮播宣传 - 调整高度 -->
    <view class="banner-section">
      <swiper 
        class="banner-swiper" 
        :indicator-dots="true" 
        :autoplay="true" 
        :interval="4000" 
        :duration="500"
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#FFFFFF"
      >
        <swiper-item v-for="banner in bannerList" :key="banner.id" @click="goNewsDetail(banner.id)">
          <view class="banner-item">
            <image :src="banner.image" mode="aspectFill" class="banner-image" />
            <view class="banner-overlay">
              <view class="banner-tag">{{ banner.tag }}</view>
              <text class="banner-title">{{ banner.title }}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 核心价值模块 - 优化卡片尺寸 -->
    <view class="core-values-section">
      <view class="section-header">
        <view class="header-left">
          <view class="title-line"></view>
          <text class="section-title">为什么要保护候鸟</text>
        </view>
        <text class="section-subtitle">构建生态安全防线</text>
      </view>
      
      <!-- 4个核心价值卡片 - 紧凑布局 -->
      <view class="values-grid">
        <view 
          v-for="(item, index) in valuesList" 
          :key="index"
          class="value-card"
          @click="goValueDetail(item)"
        >
          <view class="card-icon-bg" :style="{ backgroundColor: item.bgColor }">
            <view class="icon-wrapper" v-html="item.icon"></view>
          </view>
          
          <view class="card-content">
            <text class="card-title">{{ item.title }}</text>
            <text class="card-desc">{{ item.desc }}</text>
          </view>
          
          <view class="card-arrow">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="#909399" stroke-width="2" fill="none" stroke-linecap="round"/>
            </svg>
          </view>
        </view>
      </view>
      
      <view class="official-guide">
        <view class="guide-line"></view>
        <text class="guide-text">国家林业和草原局指导</text>
        <view class="guide-line"></view>
      </view>
    </view>

    <!-- 最新动态 -->
    <view v-if="morningBrief._id" class="brief-section" @click="goMorningBrief">
      <view class="section-header">
        <view class="header-left">
          <view class="title-line"></view>
          <text class="section-title">今日早报</text>
        </view>
        <text class="brief-date">{{ morningBrief.dateKey }}</text>
      </view>

      <view class="brief-card">
        <view class="brief-main">
          <text class="brief-title">{{ morningBrief.title }}</text>
          <text class="brief-summary">{{ morningBrief.summary }}</text>
          <view class="brief-stats" v-if="morningBrief.stats">
            <text>纳入 {{ morningBrief.stats.newsCount || 0 }} 条</text>
            <text>候鸟 {{ morningBrief.stats.migratoryBirdCount || 0 }}</text>
            <text>生态 {{ morningBrief.stats.ecologyCount || 0 }}</text>
          </view>
        </view>
        <image v-if="morningBrief.cover" :src="morningBrief.cover" class="brief-cover" mode="aspectFill" />
      </view>
    </view>

    <!-- 最新动态 -->
    <view class="news-section">
      <view class="section-header">
        <view class="header-left">
          <view class="title-line"></view>
          <text class="section-title">最新动态</text>
        </view>
        <text class="view-all" @click="viewAllNews">
          查看全部
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 24rpx; height: 24rpx; margin-left: 8rpx;">
            <path d="M9 6L15 12L9 18" stroke="#1B4B8C" stroke-width="2" fill="none" stroke-linecap="round"/>
          </svg>
        </text>
      </view>

      <view 
        v-for="news in newsList.slice(0, 5)" 
        :key="news.id"
        class="news-card"
        @click="goNewsDetail(news.id)"
      >
        <view class="news-main">
          <text class="news-title">{{ news.title }}</text>
          <view class="news-meta">
            <text class="news-source">{{ news.source }}</text>
            <text class="news-divider">·</text>
            <text class="news-time">{{ news.time }}</text>
          </view>
        </view>
        <view class="news-tag" :class="'tag-' + news.tagType">
          <text>{{ news.tag }}</text>
        </view>
      </view>
    </view>

    <!-- 底部导航 -->
    <tab-bar active="home" />
  </view>
</template>

<script>
import TabBar from '@/components/common/tab-bar.vue'

export default {
  components: {
    TabBar
  },
  
  data() {
    return {
      newsList: [],
      morningBrief: {},
      newsLoading: false,
      bannerList: [],
      valuesList: [
        {
          title: '生物多样性',
          desc: '守护生命之源',
          icon: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="18" stroke="#67C23A" stroke-width="2.5" fill="none"/>
            <path d="M16 28C18 22 24 18 28 16" stroke="#67C23A" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M32 20C30 26 24 30 20 32" stroke="#67C23A" stroke-width="2.5" stroke-linecap="round"/>
          </svg>`,
          bgColor: 'rgba(103, 194, 58, 0.1)',
          path: '/pages/public/science/biodiversity'
        },
        {
          title: '打击捕猎',
          desc: '依法严厉打击',
          icon: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="18" stroke="#F56C6C" stroke-width="2.5" fill="none"/>
            <path d="M18 18L30 30M30 18L18 30" stroke="#F56C6C" stroke-width="2.5" stroke-linecap="round"/>
          </svg>`,
          bgColor: 'rgba(245, 108, 108, 0.1)',
          path: '/pages/public/science/poaching'
        },
        {
          title: '公众参与',
          desc: '共建美好家园',
          icon: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="18" stroke="#409EFF" stroke-width="2.5" fill="none"/>
            <circle cx="24" cy="18" r="4" stroke="#409EFF" stroke-width="2.5" fill="none"/>
            <path d="M16 32C16 28.5 19 26 24 26C29 26 32 28.5 32 32" stroke="#409EFF" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          </svg>`,
          bgColor: 'rgba(64, 158, 255, 0.1)',
          path: '/pages/public/science/public-participation'
        },
        {
          title: '价值观',
          desc: '守护与秩序',
          icon: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="18" stroke="#1B4B8C" stroke-width="2.5" fill="none"/>
            <path d="M24 12L30 18V24C30 28 26 30 24 32C22 30 18 28 18 24V18L24 12Z" stroke="#1B4B8C" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          </svg>`,
          bgColor: 'rgba(27, 75, 140, 0.1)',
          path: '/pages/public/science/values'
        }
      ],
      hasNotification: true
    }
  },
  
  onLoad() {
    this.loadNews()
    this.loadMorningBrief()
  },

  onShow() {
    this.loadMorningBrief()
  },
  
  methods: {
    async loadNews() {
      this.newsLoading = true
      try {
        const db = uniCloud.database()
        const dbCmd = db.command
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        const res = await db.collection('news')
          .where({
            publishTime: dbCmd.gte(oneWeekAgo)
          })
          .orderBy('publishTime', 'desc')
          .limit(20)
          .get()
    
        const list = (res.result && res.result.data) ? res.result.data : (res.data || [])
        
        // 兼容数据库字段和本地字段
        this.newsList = list.map(item => ({
          id:      item._id,
          title:   item.title,
          source:  item.source || '',
          time:    item.time   || this.formatNewsTime(item.createTime),
          cover:   item.cover  || '',
          tag:     item.tag    || '新闻',
          tagType: item.tagType || 'news',
          content: item.content || '',
          publishTime: item.publishTime || item.createTime || 0
        }))

        const latestThree = [...this.newsList]
          .sort((a, b) => (b.publishTime || 0) - (a.publishTime || 0))
          .slice(0, 3)

        // 轮播按发布时间展示最新三条，无图时回退默认图
        this.bannerList = latestThree.map(news => ({
          id:    news.id,
          image: news.cover || '/static/banners/default.jpg',
          title: news.title,
          tag:   news.tag || '新闻'
        }))
      } catch (e) {
        console.error('loadNews error:', e)
        // 加载失败时用空数组，不崩溃
        this.newsList   = []
        this.bannerList = []
      } finally {
        this.newsLoading = false
      }
    },

    async loadMorningBrief() {
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-news-admin',
          data: {
            action: 'getLatestMorningBrief'
          }
        })

        const result = res.result || {}
        if (!result.success) {
          throw new Error(result.message || '早报加载失败')
        }
        this.morningBrief = result.data || {}
      } catch (error) {
        console.error('loadMorningBrief error:', error && error.message ? error.message : error)
        this.morningBrief = {}
      }
    },
    
    formatNewsTime(ts) {
      if (!ts) return ''
      const d = new Date(ts)
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    },
    
    goNewsDetail(id) {
      console.log('跳转新闻详情，ID:', id)
      uni.navigateTo({
        url: `/pages/public/home/news-detail?id=${id}`,
        success: () => {
          console.log('跳转成功')
        },
        fail: (err) => {
          console.error('跳转失败:', err)
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          })
        }
      })
    },
    
    goValueDetail(item) {
      if (item.path) {
        uni.navigateTo({
          url: item.path
        }).catch(() => {
          uni.showToast({
            title: '页面开发中',
            icon: 'none'
          })
        })
      }
    },
    
    viewAllNews() {
      uni.navigateTo({
        url: '/pages/public/home/all-news'
      })
    },

    goMorningBrief() {
      if (!this.morningBrief._id) return
      uni.navigateTo({
        url: `/pages/public/home/morning-brief-detail?id=${this.morningBrief._id}`
      })
    },
    
    goNotification() {
      uni.showToast({
        title: '通知功能开发中',
        icon: 'none'
      })
    },
    
    goSearch() {
      uni.showToast({
        title: '搜索功能开发中',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped lang="scss">
.home-page {
  background-color: #F2F6FC;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

/* 顶部导航栏 */
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: linear-gradient(135deg, #1B4B8C 0%, #2563EB 100%);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4rpx 12rpx rgba(27, 75, 140, 0.2);
}

.nav-left {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.logo-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8rpx;
  padding: 8rpx;
}

.logo-icon svg {
  width: 32rpx;
  height: 32rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #FFFFFF;
  line-height: 1.2;
}

.nav-subtitle {
  font-size: 22rpx;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 4rpx;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.action-icon {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
  position: relative;
}

.action-icon svg {
  width: 32rpx;
  height: 32rpx;
}

.badge-dot {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 12rpx;
  height: 12rpx;
  background-color: #F56C6C;
  border-radius: 50%;
  border: 2rpx solid #1B4B8C;
}

/* 轮播Banner - 调整高度 */
.banner-section {
  margin: 24rpx 32rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.banner-swiper {
  height: 320rpx;
}

.banner-item {
  width: 100%;
  height: 100%;
  position: relative;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.banner-tag {
  display: inline-flex;
  align-self: flex-start;
  padding: 6rpx 16rpx;
  background: rgba(27,75,140,0.9);
  border-radius: 20rpx;
  font-size: 20rpx;
  color: #FFFFFF;
}

.banner-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #FFFFFF;
  line-height: 1.4;
}

/* 核心价值模块 - 紧凑布局 */
.core-values-section {
  padding: 28rpx;
  background-color: #FFFFFF;
  margin: 0 32rpx 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 28rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.title-line {
  width: 8rpx;
  height: 32rpx;
  background-color: #1B4B8C;
  border-radius: 4rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #303133;
  line-height: 1.3;
}

.section-subtitle {
  font-size: 24rpx;
  color: #909399;
}

.view-all {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #1B4B8C;
}

/* 卡片网格 - 调整为更紧凑的2x2布局 */
.values-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 28rpx;
}

.value-card {
  background: #FFFFFF;
  border: 1rpx solid #DCDFE6;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  position: relative;
  transition: all 0.3s ease;
}

.value-card:active {
  background-color: #F2F6FC;
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.card-icon-bg {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-wrapper {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.card-title {
  font-size: 26rpx;
  font-weight: 500;
  color: #303133;
  line-height: 1.3;
}

.card-desc {
  font-size: 20rpx;
  font-weight: 400;
  color: #909399;
  line-height: 1.2;
}

.card-arrow {
  width: 20rpx;
  height: 20rpx;
  display: flex;
  align-items: center
  ;
  justify-content: center;
  }
.official-guide {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 16rpx 0;
  border-top: 1rpx solid #DCDFE6;
}

.brief-section {
  padding: 0 30rpx 28rpx;
}

.brief-date {
  font-size: 22rpx;
  color: #7B8AA0;
}

.brief-card {
  display: flex;
  gap: 20rpx;
  background: linear-gradient(135deg, #ffffff 0%, #eef5ff 100%);
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 14rpx 28rpx rgba(27, 75, 140, 0.08);
}

.brief-main {
  flex: 1;
}

.brief-title {
  display: block;
  font-size: 30rpx;
  line-height: 1.5;
  color: #1B2B44;
  font-weight: 700;
}

.brief-summary {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: #5D6B82;
}

.brief-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.brief-stats text {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(27, 75, 140, 0.08);
  color: #1B4B8C;
  font-size: 20rpx;
}

.brief-cover {
  width: 180rpx;
  height: 180rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}
  .guide-line {
  flex: 1;
  height: 1rpx;
  background-color: #DCDFE6;
  }
  .guide-text {
  font-size: 22rpx;
  color: #909399;
  padding: 0 16rpx;
  }
  /* 最新动态 */
  .news-section {
  padding: 28rpx;
  background-color: #FFFFFF;
  margin: 0 32rpx 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  }
  .news-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #F2F6FC;
  }
  .news-card:last-child {
  border-bottom: none;
  }
  .news-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding-right: 16rpx;
  }
  .news-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #303133;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  }
  .news-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  }
  .news-source,
  .news-time {
  font-size: 22rpx;
  color: #909399;
  }
  .news-divider {
  color: #DCDFE6;
  }
  .news-tag {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  white-space: nowrap;
  }
  .tag-law {
  background: rgba(103, 194, 58, 0.1);
  color: #67C23A;
  }
  .tag-news {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
  }
  .tag-science {
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
  }
  </style>
