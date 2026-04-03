<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <svg viewBox="0 0 24 24">
          <path d="M15 6l-6 6 6 6" stroke="#1B4B8C" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>
      </view>
      <view class="nav-center">
        <text class="nav-title">全部新闻</text>
        <text class="nav-sub">支持分类筛选和下拉刷新</text>
      </view>
      <view class="nav-action" @click="refreshList">刷新</view>
    </view>

    <scroll-view scroll-x class="filter-scroll" :show-scrollbar="false">
      <view class="filter-row">
        <view
          v-for="tag in tagFilters"
          :key="tag.value"
          class="filter-chip"
          :class="{ active: currentTag === tag.value }"
          @click="changeTag(tag.value)"
        >
          <text>{{ tag.label }}</text>
        </view>
      </view>
    </scroll-view>

    <scroll-view
      scroll-y
      class="content-scroll"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <view v-if="newsList.length > 0" class="news-list">
        <view
          v-for="item in newsList"
          :key="item.id"
          class="news-card"
          @click="goDetail(item.id)"
        >
          <image v-if="item.cover" :src="item.cover" class="news-cover" mode="aspectFill" />
          <view class="news-body">
            <view class="news-top">
              <text class="news-title">{{ item.title }}</text>
              <view class="news-tag" :class="'tag-' + item.tagType">
                <text>{{ item.tag }}</text>
              </view>
            </view>
            <text class="news-summary">{{ item.summary }}</text>
            <view class="news-meta">
              <text class="meta-text">{{ item.source || '系统来源' }}</text>
              <text class="meta-divider">·</text>
              <text class="meta-text">{{ item.time }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-wrap">
        <text class="empty-icon">新闻</text>
        <text class="empty-title">暂无新闻数据</text>
        <text class="empty-desc">稍后可以下拉刷新，或先去后台手动抓取一次更新。</text>
      </view>

      <view v-if="loading" class="loading-wrap">
        <text class="loading-text">加载中...</text>
      </view>

      <view v-else-if="newsList.length > 0" class="load-more">
        <text>{{ hasMore ? '上拉加载更多' : '已经到底了' }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      newsList: [],
      loading: false,
      refreshing: false,
      currentTag: '',
      page: 1,
      pageSize: 10,
      hasMore: true,
      tagFilters: [
        { label: '全部', value: '' },
        { label: '新闻', value: '新闻' },
        { label: '科普', value: '科普' },
        { label: '通知', value: '通知' },
        { label: '活动', value: '活动' }
      ]
    }
  },

  onLoad() {
    this.fetchNews(true)
  },

  methods: {
    async fetchNews(reset = false) {
      if (this.loading) return
      if (!reset && !this.hasMore) return

      this.loading = true
      const nextPage = reset ? 1 : this.page

      try {
        const db = uniCloud.database()
        let query = db.collection('news').orderBy('createTime', 'desc')

        if (this.currentTag) {
          query = query.where({ tag: this.currentTag })
        }

        const res = await query.skip((nextPage - 1) * this.pageSize).limit(this.pageSize).get()
        const list = (res.result && res.result.data) ? res.result.data : (res.data || [])
        const mapped = list.map(item => this.normalizeNews(item))

        this.newsList = reset ? mapped : this.newsList.concat(mapped)
        this.page = nextPage + 1
        this.hasMore = list.length === this.pageSize
      } catch (error) {
        console.error('fetchNews error:', error)
        uni.showToast({
          title: '新闻加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },

    normalizeNews(item) {
      const content = Array.isArray(item.content) ? item.content.join(' ') : (item.content || '')
      const summary = item.summary || content.replace(/<[^>]+>/g, '').trim().slice(0, 48)
      return {
        id: item._id,
        title: item.title || '未命名新闻',
        source: item.source || '',
        time: item.time || this.formatTime(item.createTime),
        tag: item.tag || '新闻',
        tagType: item.tagType || 'news',
        cover: item.cover || '',
        summary: summary || '暂无摘要'
      }
    },

    formatTime(ts) {
      if (!ts) return ''
      const d = new Date(ts)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },

    changeTag(tag) {
      if (this.currentTag === tag) return
      this.currentTag = tag
      this.page = 1
      this.hasMore = true
      this.fetchNews(true)
    },

    onRefresh() {
      this.refreshing = true
      this.page = 1
      this.hasMore = true
      this.fetchNews(true)
    },

    refreshList() {
      this.page = 1
      this.hasMore = true
      this.fetchNews(true)
    },

    loadMore() {
      this.fetchNews(false)
    },

    goDetail(id) {
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
  gap: 20rpx;
  padding: 88rpx 28rpx 20rpx;
  background: #ffffff;
  box-shadow: 0 6rpx 20rpx rgba(27, 75, 140, 0.08);
}

.nav-back {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  background: rgba(27, 75, 140, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-back svg {
  width: 36rpx;
  height: 36rpx;
}

.nav-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #1b2b44;
}

.nav-sub {
  font-size: 22rpx;
  color: #8a97a8;
}

.nav-action {
  padding: 14rpx 24rpx;
  border-radius: 20rpx;
  background: #1b4b8c;
  color: #ffffff;
  font-size: 24rpx;
}

.filter-scroll {
  white-space: nowrap;
  padding: 20rpx 24rpx 0;
}

.filter-row {
  display: inline-flex;
  gap: 16rpx;
  padding-right: 24rpx;
}

.filter-chip {
  min-width: 108rpx;
  height: 60rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #607086;
  font-size: 24rpx;
  box-shadow: 0 8rpx 18rpx rgba(27, 75, 140, 0.06);
}

.filter-chip.active {
  background: #1b4b8c;
  color: #ffffff;
}

.content-scroll {
  height: calc(100vh - 220rpx);
  padding: 20rpx 24rpx 40rpx;
  box-sizing: border-box;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.news-card {
  display: flex;
  gap: 20rpx;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 14rpx 28rpx rgba(27, 75, 140, 0.08);
}

.news-cover {
  width: 180rpx;
  height: 180rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.news-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.news-top {
  display: flex;
  gap: 12rpx;
  align-items: flex-start;
}

.news-title {
  flex: 1;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1.5;
  color: #1f2937;
}

.news-tag {
  min-width: 72rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(27, 75, 140, 0.08);
  color: #1b4b8c;
  font-size: 20rpx;
  text-align: center;
}

.tag-science {
  background: rgba(39, 174, 96, 0.12);
  color: #1f8b4c;
}

.tag-notice {
  background: rgba(230, 126, 34, 0.14);
  color: #bb6b18;
}

.tag-activity {
  background: rgba(192, 57, 43, 0.12);
  color: #b23b2a;
}

.news-summary {
  font-size: 24rpx;
  line-height: 1.7;
  color: #607086;
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: auto;
}

.meta-text,
.meta-divider {
  font-size: 22rpx;
  color: #8a97a8;
}

.empty-wrap,
.loading-wrap,
.load-more {
  padding: 80rpx 32rpx;
  text-align: center;
}

.empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(27, 75, 140, 0.08);
  color: #1b4b8c;
  font-size: 28rpx;
  font-weight: 700;
}

.empty-title {
  display: block;
  margin-top: 24rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: #1f2937;
}

.empty-desc,
.loading-text,
.load-more text {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: #8a97a8;
}
</style>
