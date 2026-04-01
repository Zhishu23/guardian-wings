<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />

    <!-- 顶导航 -->
    <view class="navbar">
      <view class="nav-back" @click="goBack">
        <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>
      </view>
      <view class="nav-center">
        <text class="nav-title">新闻管理</text>
        <text class="nav-sub">{{ newsList.length }} 条记录</text>
      </view>
      <view class="nav-right">
        <view class="nav-action" @click="refresh">
          <svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/></svg>
        </view>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view
        v-for="tag in tagFilters"
        :key="tag.value"
        class="filter-chip"
        :class="currentTag === tag.value ? 'filter-active' : ''"
        @click="setTagFilter(tag.value)"
      >
        <text>{{ tag.label }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll">
      <!-- 新闻列表 -->
      <view class="news-list" v-if="newsList.length > 0">
        <view
          v-for="news in newsList"
          :key="news.id"
          class="news-card"
        >
          <view class="news-content" @click="viewNews(news)">
            <text class="news-title">{{ news.title }}</text>
            <view class="news-meta">
              <text class="news-source">{{ news.source }}</text>
              <text class="news-divider">·</text>
              <text class="news-time">{{ news.time }}</text>
            </view>
            <view class="news-tag" :class="'tag-' + news.tagType">
              <text>{{ news.tag }}</text>
            </view>
          </view>
          <view class="news-actions">
            <view class="action-btn edit" @click.stop="editNews(news)">
              <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
            </view>
            <view class="action-btn delete" @click.stop="deleteNews(news)">
              <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/></svg>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-container">
        <text class="empty-icon">📰</text>
        <text class="empty-text">暂无新闻数据</text>
      </view>
    </scroll-view>

    <!-- 加载遮罩 -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-spinner"></view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      newsList: [],
      loading: false,
      currentTag: '',
      tagFilters: [
        { label: '全部', value: '' },
        { label: '新闻', value: '新闻' },
        { label: '科普', value: '科普' },
        { label: '通知', value: '通知' },
        { label: '活动', value: '活动' }
      ]
    }
  },

  computed: {
    statusBarHeight() {
      return uni.getSystemInfoSync().statusBarHeight || 20
    }
  },

  onLoad() {
    this.loadNews()
  },

  methods: {
    async loadNews() {
      this.loading = true
      try {
        const db = uniCloud.database()
        let query = db.collection('news').orderBy('createTime', 'desc')
        
        if (this.currentTag) {
          query = query.where({ tag: this.currentTag })
        }
        
        const res = await query.get()
        
        const list = (res.result && res.result.data) ? res.result.data : (res.data || [])
        
        this.newsList = list.map(item => ({
          id:      item._id,
          title:   item.title,
          source:  item.source || '',
          time:    item.time   || this.formatTime(item.createTime),
          tag:     item.tag    || '新闻',
          tagType: item.tagType || 'news',
          content: item.content || ''
        }))
      } catch (error) {
        console.error('加载新闻失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    formatTime(ts) {
      if (!ts) return ''
      const d = new Date(ts)
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    },

    setTagFilter(tag) {
      this.currentTag = tag
      this.loadNews()
    },

    refresh() {
      this.loadNews()
    },

    viewNews(news) {
      uni.navigateTo({
        url: `/pages/public/home/news-detail?id=${news.id}`
      })
    },

    editNews(news) {
      uni.showModal({
        title: '编辑新闻',
        content: '新闻编辑功能开发中',
        showCancel: false
      })
    },

    deleteNews(news) {
      uni.showModal({
        title: '删除确认',
        content: `确定要删除新闻《${news.title}》吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const db = uniCloud.database()
              await db.collection('news').doc(news.id).remove()
              
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
              
              // 重新加载列表
              this.loadNews()
            } catch (error) {
              console.error('删除新闻失败:', error)
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
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
  height: 100vh;
  background-color: #F2F6FC;
}

.status-bar {
  background-color: #1B4B8C;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  height: 88rpx;
  background-color: #1B4B8C;
  color: #FFFFFF;
}

.nav-back, .nav-action {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back svg, .nav-action svg {
  width: 32rpx;
  height: 32rpx;
  fill: #FFFFFF;
}

.nav-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.nav-sub {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4rpx;
}

.filter-bar {
  display: flex;
  padding: 16rpx 32rpx;
  background-color: #FFFFFF;
  gap: 16rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.filter-chip {
  padding: 12rpx 24rpx;
  border-radius: 24rpx;
  background-color: #F5F7FA;
  font-size: 24rpx;
  color: #606266;
}

.filter-active {
  background-color: #1B4B8C;
  color: #FFFFFF;
}

.scroll {
  flex: 1;
  padding: 16rpx;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.news-card {
  display: flex;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  align-items: center;
}

.news-content {
  flex: 1;
  padding-right: 16rpx;
}

.news-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #303133;
  line-height: 1.5;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.news-source, .news-time {
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
  align-self: flex-start;
}

.tag-news {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.tag-science {
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.tag-notice {
  background: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.tag-activity {
  background: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
}

.news-actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  align-items: center;
}

.action-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
}

.action-btn.edit {
  background-color: rgba(64, 158, 255, 0.1);
}

.action-btn.edit svg {
  width: 28rpx;
  height: 28rpx;
  fill: #409EFF;
}

.action-btn.delete {
  background-color: rgba(245, 108, 108, 0.1);
}

.action-btn.delete svg {
  width: 28rpx;
  height: 28rpx;
  fill: #F56C6C;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #909399;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid #E6E6E6;
  border-top: 4rpx solid #1B4B8C;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>