<template>
  <view class="law-page">
    <!-- 顶部导航 -->
    <view class="top-nav">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#FFFFFF"/>
        </svg>
      </view>
      <text class="nav-title">法律法规</text>
      <view style="width:72rpx" />
    </view>

    <!-- 分类Tab -->
    <view class="category-tabs">
      <scroll-view scroll-x :show-scrollbar="false" class="tabs-scroll">
        <view class="tabs-inner">
          <view
            v-for="cat in categories"
            :key="cat.key"
            class="cat-tab"
            :class="{ active: currentCategory === cat.key }"
            @click="switchCategory(cat.key)"
          >
            <text>{{ cat.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 搜索框 -->
    <view class="search-bar">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="search-icon">
        <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#9CA3AF"/>
      </svg>
      <input
        class="search-input"
        v-model="searchKeyword"
        placeholder="搜索法律条文..."
        @input="onSearch"
      />
      <text v-if="searchKeyword" class="clear-btn" @click="clearSearch">✕</text>
    </view>

    <!-- 法条列表 -->
    <scroll-view scroll-y class="law-scroll" @scrolltolower="loadMore">
      <view v-if="loading && laws.length === 0" class="loading-box">
        <text>加载中...</text>
      </view>

      <view v-else class="law-list">
        <view
          v-for="law in laws"
          :key="law._id"
          class="law-card"
          @click="toggleExpand(law._id)"
        >
          <view class="law-header">
            <view class="law-left">
              <view class="article-badge">
                <text>{{ law.articleNo || '第—条' }}</text>
              </view>
              <view class="law-meta">
                <text class="law-title">{{ law.title }}</text>
                <view class="law-tag" :style="getLawTagStyle(law.category)">
                  <text>{{ getCategoryLabel(law.category) }}</text>
                </view>
              </view>
            </view>
            <view class="expand-icon" :class="{ expanded: expandedIds.includes(law._id) }">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10l5 5 5-5z" fill="#9CA3AF"/>
              </svg>
            </view>
          </view>

          <!-- 展开内容 -->
          <view class="law-content" v-if="expandedIds.includes(law._id)">
            <text class="law-text">{{ law.content }}</text>
            <view class="law-footer">
              <text class="law-source">来源：{{ getCategoryLabel(law.category) }}</text>
            </view>
          </view>
        </view>

        <view v-if="laws.length === 0 && !loading" class="empty-box">
          <text class="empty-icon">📜</text>
          <text class="empty-text">暂无相关法条</text>
        </view>

        <view class="load-more" v-if="hasMore"><text>上拉加载更多</text></view>
        <view class="load-more" v-else-if="laws.length > 0"><text>已加载全部</text></view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loading:         false,
      laws:            [],
      page:            1,
      pageSize:        15,
      hasMore:         true,
      currentCategory: 'all',
      searchKeyword:   '',
      searchTimer:     null,
      expandedIds:     [],
      categories: [
        { key: 'all',        label: '全部'          },
        { key: '刑法',        label: '刑法'          },
        { key: '野生动物保护法', label: '野生动物保护法'  },
        { key: '行政法规',     label: '行政法规'      },
        { key: '地方法规',     label: '地方法规'      }
      ],
    }
  },

  onLoad() {
    this.loadLaws(true)
  },

  methods: {
    async loadLaws(reset = false) {
      if (reset) { this.page = 1; this.hasMore = true; this.laws = [] }
      if (!this.hasMore) return
      this.loading = true
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-bird',
          data: {
            action: 'getLaws',
            params: {
              page: this.page,
              pageSize: this.pageSize,
              category: this.currentCategory,
              keyword: this.searchKeyword
            }
          }
        })
        if (res.result.code === 0) {
          const list = res.result.data.list
          this.laws    = reset ? list : [...this.laws, ...list]
          this.hasMore = false
        } else {
          this.laws    = []
          this.hasMore = false
        }
      } catch (e) {
        console.error('loadLaws error:', e)
        this.laws    = []
        this.hasMore = false
      } finally {
        this.loading = false
      }
    },

    switchCategory(key) {
      if (this.currentCategory === key) return
      this.currentCategory = key
      this.expandedIds     = []
      this.loadLaws(true)
    },

    onSearch() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.loadLaws(true)
      }, 400)
    },

    clearSearch() {
      this.searchKeyword = ''
      this.loadLaws(true)
    },

    loadMore() {
      if (!this.loading && this.hasMore) this.loadLaws(false)
    },

    toggleExpand(id) {
      const idx = this.expandedIds.indexOf(id)
      if (idx >= 0) {
        this.expandedIds.splice(idx, 1)
      } else {
        this.expandedIds.push(id)
      }
    },

    getCategoryLabel(cat) {
      return cat || '其他'
    },

    getLawTagStyle(cat) {
      const map = {
        '刑法':          { background: '#FEE2E2', color: '#DC2626' },
        '野生动物保护法': { background: '#D1FAE5', color: '#065F46' },
        '行政法规':       { background: '#DBEAFE', color: '#1E40AF' },
        '地方法规':       { background: '#EDE9FE', color: '#7C3AED' }
      }
      return map[cat] || { background: '#F3F4F6', color: '#6B7280' }
    },
    
    goBack() { uni.navigateBack() }
  }
}
</script>

<style scoped lang="scss">
.law-page { min-height: 100vh; background: #F5F7FA; display: flex; flex-direction: column; }
.top-nav { display: flex; align-items: center; justify-content: space-between; padding: 88rpx 32rpx 24rpx; background: linear-gradient(135deg, #1B4B8C 0%, #2563EB 100%); }
.back-btn { width: 72rpx; height: 72rpx; display: flex; align-items: center; justify-content: center; }
.back-btn svg { width: 48rpx; height: 48rpx; }
.nav-title { font-size: 34rpx; font-weight: 600; color: #FFFFFF; }
.category-tabs { background: #FFFFFF; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); }
.tabs-scroll { width: 100%; }
.tabs-inner { display: flex; padding: 0 16rpx; white-space: nowrap; }
.cat-tab { display: inline-flex; align-items: center; padding: 24rpx 24rpx; font-size: 28rpx; color: #6B7280; position: relative; white-space: nowrap; &.active { color: #1B4B8C; font-weight: 600; &::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 40rpx; height: 6rpx; background: #1B4B8C; border-radius: 3rpx; } } }
.search-bar { display: flex; align-items: center; gap: 16rpx; margin: 20rpx 24rpx; padding: 20rpx 24rpx; background: #FFFFFF; border-radius: 12rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); }
.search-icon { width: 36rpx; height: 36rpx; flex-shrink: 0; }
.search-input { flex: 1; font-size: 28rpx; color: #374151; }
.clear-btn { font-size: 28rpx; color: #9CA3AF; padding: 0 8rpx; }
.law-scroll { flex: 1; height: calc(100vh - 380rpx); }
.law-list { padding: 0 24rpx 48rpx; }
.law-card { background: #FFFFFF; border-radius: 16rpx; margin-bottom: 20rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.law-header { display: flex; align-items: center; justify-content: space-between; padding: 28rpx; }
.law-left { display: flex; align-items: flex-start; gap: 20rpx; flex: 1; }
.article-badge { padding: 8rpx 16rpx; background: linear-gradient(135deg, #1B4B8C 0%, #2563EB 100%); border-radius: 8rpx; flex-shrink: 0; text { font-size: 22rpx; color: #FFFFFF; font-weight: 500; white-space: nowrap; } }
.law-meta { flex: 1; }
.law-title { display: block; font-size: 28rpx; font-weight: 500; color: #1F2937; line-height: 1.5; margin-bottom: 12rpx; }
.law-tag { display: inline-block; padding: 4rpx 14rpx; border-radius: 6rpx; font-size: 20rpx; }

.expand-icon { width: 48rpx; height: 48rpx; display: flex; align-items: center; justify-content: center; transition: transform 0.3s; svg { width: 40rpx; height: 40rpx; } &.expanded { transform: rotate(180deg); } }
.law-content { padding: 0 28rpx 28rpx; border-top: 1rpx solid #F3F4F6; }
.law-text { display: block; font-size: 26rpx; color: #4B5563; line-height: 1.9; padding-top: 24rpx; text-indent: 2em; }
.law-footer { margin-top: 20rpx; padding-top: 16rpx; border-top: 1rpx solid #F3F4F6; }
.law-source { font-size: 22rpx; color: #9CA3AF; }
.loading-box { display: flex; align-items: center; justify-content: center; padding: 80rpx; text { font-size: 26rpx; color: #999; } }
.empty-box { display: flex; flex-direction: column; align-items: center; padding: 100rpx; gap: 20rpx; }
.empty-icon { font-size: 100rpx; }
.empty-text { font-size: 28rpx; color: #9CA3AF; }
.load-more { text-align: center; padding: 32rpx; font-size: 24rpx; color: #9CA3AF; }
</style>