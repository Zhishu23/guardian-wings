<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />

    <view class="navbar">
      <view class="nav-back" @click="goBack">
        <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>
      </view>
      <view class="nav-center">
        <text class="nav-title">新闻管理</text>
        <text class="nav-sub">{{ total }} 条记录</text>
      </view>
      <view class="nav-actions">
        <view class="nav-action primary" @click="triggerCrawler" :class="{ disabled: loading || crawling }">
          <text>{{ crawling ? '更新中' : '抓取更新' }}</text>
        </view>
        <view class="nav-icon" @click="refresh">
          <svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/></svg>
        </view>
      </view>
    </view>

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

    <view class="brief-panel">
      <view class="brief-head">
        <view>
          <text class="brief-title">每日早报</text>
          <text class="brief-sub">按“候鸟优先、生态兜底”从全文新闻池生成</text>
        </view>
        <view class="brief-actions">
          <view class="brief-btn" @click="generateMorningBrief(false)">
            <text>{{ generatingBrief ? '生成中' : '生成早报' }}</text>
          </view>
          <view class="brief-btn light" @click="generateMorningBrief(true)">
            <text>抓取并生成</text>
          </view>
        </view>
      </view>
      <view v-if="latestBrief && latestBrief._id" class="brief-card" @click="viewMorningBrief">
        <text class="brief-card-title">{{ latestBrief.title }}</text>
        <text class="brief-card-summary">{{ latestBrief.summary }}</text>
        <text class="brief-card-meta">
          {{ latestBrief.dateKey }} · 纳入 {{ latestBrief.stats && latestBrief.stats.newsCount || 0 }} 条
        </text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll" @scrolltolower="loadMore">
      <view v-if="newsList.length" class="news-list">
        <view v-for="news in newsList" :key="news.id" class="news-card">
          <view class="news-main" @click="viewNews(news)">
            <view class="news-head">
              <text class="news-title">{{ news.title }}</text>
              <view class="news-tag" :class="'tag-' + news.tagType">
                <text>{{ news.tag }}</text>
              </view>
            </view>
            <text class="news-summary">{{ news.summary }}</text>
            <view class="news-meta">
              <text>{{ news.source || '系统来源' }}</text>
              <text>·</text>
              <text>{{ news.time }}</text>
            </view>
          </view>
          <view class="news-actions">
            <view class="action-btn preview" @click.stop="viewNews(news)">查看</view>
            <view class="action-btn delete" @click.stop="deleteNews(news)">删除</view>
          </view>
        </view>

        <view class="list-footer">
          <text v-if="loadingMore">加载中...</text>
          <text v-else-if="!hasMore">没有更多了</text>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-container">
        <text class="empty-text">暂无新闻数据</text>
      </view>
    </scroll-view>

    <view v-if="loading" class="loading-overlay">
      <view class="loading-card">
        <view class="loading-spinner"></view>
        <text>{{ crawling ? '正在抓取新闻...' : '正在加载...' }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      newsList: [],
      total: 0,
      page: 1,
      pageSize: 10,
      hasMore: true,
      loading: false,
      loadingMore: false,
      crawling: false,
      generatingBrief: false,
      currentTag: '',
      latestBrief: null,
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
    this.loadNews(true)
    this.loadLatestBrief()
  },

  onShow() {
    this.loadLatestBrief()
  },

  methods: {
    async callNewsAdmin(action, payload = {}) {
      const res = await uniCloud.callFunction({
        name: 'gw-news-admin',
        data: {
          action,
          ...payload
        }
      })
      const result = res.result || {}
      if (!result.success) {
        throw new Error(result.message || '操作失败')
      }
      return result
    },

    normalizeNews(item) {
      const summary = item.summary || this.extractSummary(item.content)
      return {
        id: item._id || item.id,
        title: item.title || '未命名新闻',
        source: item.source || '',
        time: item.time || this.formatTime(item.publishTime || item.createTime),
        tag: item.tag || '新闻',
        tagType: item.tagType || 'news',
        summary,
        content: item.content || '',
        link: item.link || ''
      }
    },

    extractSummary(content) {
      if (!content) return '暂无摘要'
      return String(content)
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 70) || '暂无摘要'
    },

    formatTime(value) {
      if (!value) return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) {
        return value
      }
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    },

    async loadNews(reset = false) {
      if (this.loading || this.loadingMore) {
        return
      }

      if (reset) {
        this.page = 1
        this.hasMore = true
        this.loading = true
      } else {
        if (!this.hasMore) return
        this.loadingMore = true
      }

      try {
        const result = await this.callNewsAdmin('getNewsList', {
          page: this.page,
          pageSize: this.pageSize,
          tag: this.currentTag
        })

        const list = (result.data || []).map(this.normalizeNews)
        this.total = result.total || 0
        this.hasMore = typeof result.hasMore === 'boolean'
          ? result.hasMore
          : list.length >= this.pageSize

        this.newsList = reset ? list : this.newsList.concat(list)
        if (this.hasMore) {
          this.page += 1
        }
      } catch (error) {
        console.error('load news failed:', error)
        uni.showToast({
          title: error.message || '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },

    async loadLatestBrief() {
      try {
        const result = await this.callNewsAdmin('getLatestMorningBrief')
        this.latestBrief = result.data || null
      } catch (error) {
        console.error('load latest brief failed:', error)
        this.latestBrief = null
      }
    },

    setTagFilter(tag) {
      if (this.currentTag === tag) return
      this.currentTag = tag
      this.loadNews(true)
    },

    refresh() {
      this.loadNews(true)
    },

    loadMore() {
      this.loadNews(false)
    },

    async triggerCrawler() {
      if (this.crawling) return
      this.crawling = true
      this.loading = true
      try {
        const result = await this.callNewsAdmin('triggerCrawler')
        uni.showToast({
          title: result.message || '更新完成',
          icon: 'success'
        })
        await this.loadNews(true)
      } catch (error) {
        console.error('trigger crawler failed:', error)
        uni.showToast({
          title: error.message || '更新失败',
          icon: 'none'
        })
      } finally {
        this.crawling = false
        this.loading = false
      }
    },

    async generateMorningBrief(refreshNews = false) {
      if (this.generatingBrief) return
      this.generatingBrief = true
      try {
        const result = await this.callNewsAdmin('triggerMorningBrief', { refreshNews })
        uni.showToast({
          title: result.message || '生成完成',
          icon: 'success'
        })
        await this.loadLatestBrief()
        if (refreshNews) {
          await this.loadNews(true)
        }
      } catch (error) {
        console.error('generate morning brief failed:', error)
        uni.showToast({
          title: error.message || '生成失败',
          icon: 'none'
        })
      } finally {
        this.generatingBrief = false
      }
    },

    async deleteNews(news) {
      uni.showModal({
        title: '删除确认',
        content: `确定删除《${news.title}》吗？`,
        success: async ({ confirm }) => {
          if (!confirm) return
          try {
            await this.callNewsAdmin('deleteNews', { id: news.id })
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
            await this.loadNews(true)
          } catch (error) {
            console.error('delete news failed:', error)
            uni.showToast({
              title: error.message || '删除失败',
              icon: 'none'
            })
          }
        }
      })
    },

    viewNews(news) {
      uni.navigateTo({
        url: `/pages/public/home/news-detail?id=${news.id}`
      })
    },

    viewMorningBrief() {
      if (!this.latestBrief || !this.latestBrief._id) return
      uni.navigateTo({
        url: `/pages/public/home/morning-brief-detail?id=${this.latestBrief._id}`
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
  background: #f2f6fc;
  display: flex;
  flex-direction: column;
}

.status-bar,
.navbar {
  background: #1b4b8c;
}

.navbar {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  color: #fff;
}

.nav-back,
.nav-icon {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back svg,
.nav-icon svg {
  width: 32rpx;
  height: 32rpx;
  fill: currentColor;
}

.nav-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
}

.nav-sub {
  font-size: 20rpx;
  opacity: 0.75;
  margin-top: 4rpx;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.nav-action {
  min-width: 132rpx;
  height: 56rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
}

.nav-action.primary {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.nav-action.disabled {
  opacity: 0.55;
}

.filter-bar {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  background: #fff;
  overflow-x: auto;
  white-space: nowrap;
}

.brief-panel {
  margin: 20rpx 24rpx 0;
  padding: 24rpx;
  background: linear-gradient(135deg, #ffffff 0%, #eef5ff 100%);
  border-radius: 24rpx;
  box-shadow: 0 14rpx 28rpx rgba(27, 75, 140, 0.08);
}

.brief-head {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.brief-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #1b2b44;
}

.brief-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #7b8aa0;
}

.brief-actions {
  display: flex;
  gap: 12rpx;
  flex-shrink: 0;
}

.brief-btn {
  height: 64rpx;
  padding: 0 22rpx;
  border-radius: 18rpx;
  background: #1b4b8c;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brief-btn.light {
  background: rgba(27, 75, 140, 0.1);
}

.brief-btn text {
  font-size: 22rpx;
  color: #fff;
}

.brief-btn.light text {
  color: #1b4b8c;
}

.brief-card {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(27, 75, 140, 0.08);
}

.brief-card-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
}

.brief-card-summary {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #5d6b82;
  line-height: 1.6;
}

.brief-card-meta {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #8a97a8;
}

.filter-chip {
  padding: 12rpx 28rpx;
  border-radius: 999rpx;
  background: #edf2f7;
  color: #5f6b7a;
  font-size: 24rpx;
}

.filter-active {
  background: #1b4b8c;
  color: #fff;
}

.scroll {
  flex: 1;
}

.news-list {
  padding: 20rpx 24rpx 40rpx;
}

.news-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 12rpx 30rpx rgba(27, 75, 140, 0.08);
}

.news-head {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  align-items: flex-start;
}

.news-title {
  flex: 1;
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2933;
  line-height: 1.5;
}

.news-tag {
  flex-shrink: 0;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #1b4b8c;
  background: rgba(27, 75, 140, 0.08);
}

.tag-science {
  color: #2f855a;
  background: rgba(47, 133, 90, 0.12);
}

.tag-notice {
  color: #b7791f;
  background: rgba(183, 121, 31, 0.12);
}

.tag-activity {
  color: #9f3a38;
  background: rgba(159, 58, 56, 0.12);
}

.news-summary {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  color: #52606d;
  line-height: 1.7;
}

.news-meta {
  display: flex;
  gap: 10rpx;
  margin-top: 14rpx;
  font-size: 22rpx;
  color: #7b8794;
}

.news-actions {
  display: flex;
  gap: 12rpx;
  margin-top: 20rpx;
}

.action-btn {
  height: 60rpx;
  padding: 0 28rpx;
  border-radius: 14rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.action-btn.preview {
  background: #edf4ff;
  color: #1b4b8c;
}

.action-btn.delete {
  background: #fff1f0;
  color: #c53030;
}

.list-footer,
.empty-container {
  padding: 28rpx 24rpx 40rpx;
  text-align: center;
  color: #7b8794;
  font-size: 24rpx;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-card {
  width: 240rpx;
  padding: 28rpx 24rpx;
  border-radius: 20rpx;
  background: #fff;
  text-align: center;
  color: #52606d;
  font-size: 24rpx;
}

.loading-spinner {
  width: 56rpx;
  height: 56rpx;
  margin: 0 auto 20rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(27, 75, 140, 0.16);
  border-top-color: #1b4b8c;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
