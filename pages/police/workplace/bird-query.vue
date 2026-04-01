<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="top-nav">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </view>
      <text class="nav-title">识鸟百科</text>
      <view style="width:72rpx;"></view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-wrap">
      <view class="search-bar">
        <svg viewBox="0 0 24 24" fill="none" style="width:36rpx;height:36rpx;flex-shrink:0;">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#909399"/>
        </svg>
        <input
          class="search-input"
          placeholder="搜索鸟类名称或特征..."
          v-model="searchKeyword"
          @confirm="handleSearch"
        />
        <text v-if="searchKeyword" class="clear-btn" @click="clearSearch">✕</text>
      </view>
    </view>

    <!-- 提示条：仅供执法参考 -->
    <view class="ref-banner">
      <svg viewBox="0 0 24 24" fill="none" style="width:32rpx;height:32rpx;flex-shrink:0;">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#2563EB"/>
      </svg>
      <text class="ref-text">以下鸟类信息仅供执法参考，如需精准识别请拨打专家咨询</text>
    </view>

    <!-- 搜索结果 -->
    <view v-if="isSearching" class="content-wrap">
      <view class="result-header">
        <text class="result-title">搜索结果</text>
        <text class="result-count">共 {{ searchResults.length }} 条</text>
      </view>
      <view v-if="searchLoading" class="loading-wrap"><text>搜索中...</text></view>
      <view v-else-if="searchResults.length === 0" class="empty-wrap">
        <text>未找到"{{ searchKeyword }}"相关鸟类</text>
      </view>
      <view v-else class="bird-grid">
        <view class="bird-card" v-for="bird in searchResults" :key="bird._id" @click="goDetail(bird._id)">
          <image :src="bird.images && bird.images[0] || '/static/icons/bird-placeholder.png'" mode="aspectFill" class="bird-img"/>
          <view class="bird-card-info">
            <text class="bird-name">{{ bird.name }}</text>
            <text class="bird-latin">{{ bird.scientificName }}</text>
            <view class="level-tag" :class="getLevelClass(bird.protectionLevel)">
              <text>{{ bird.protectionLevel || '未知' }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Tab + 列表 -->
    <view v-else class="content-wrap">
      <view class="tabs">
        <view class="tab-item" :class="{active: currentTab === 'hot'}" @click="switchTab('hot')">热门鸟类</view>
        <view class="tab-item" :class="{active: currentTab === 'level'}" @click="switchTab('level')">保护等级</view>
      </view>

      <!-- 热门 -->
      <view v-if="currentTab === 'hot'">
        <view v-if="loading" class="loading-wrap"><text>加载中...</text></view>
        <view v-else class="bird-grid">
          <view class="bird-card" v-for="bird in birdList" :key="bird._id" @click="goDetail(bird._id)">
            <image :src="bird.images && bird.images[0] || '/static/icons/bird-placeholder.png'" mode="aspectFill" class="bird-img"/>
            <view class="bird-card-info">
              <text class="bird-name">{{ bird.name }}</text>
              <text class="bird-latin">{{ bird.scientificName }}</text>
              <view class="level-tag" :class="getLevelClass(bird.protectionLevel)">
                <text>{{ bird.protectionLevel || '未知' }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="load-more" v-if="hasMore" @click="loadMore">加载更多</view>
      </view>

      <!-- 保护等级筛选 -->
      <view v-if="currentTab === 'level'">
        <view class="level-filters">
          <view
            class="level-chip"
            v-for="lv in levelList"
            :key="lv.key"
            :class="{active: selectedLevel === lv.key}"
            :style="selectedLevel === lv.key ? {background: lv.bg, borderColor: lv.color} : {}"
            @click="selectLevel(lv.key)"
          >
            <text :style="selectedLevel === lv.key ? {color: lv.color} : {}">{{ lv.label }}</text>
          </view>
        </view>
        <view v-if="levelLoading" class="loading-wrap"><text>加载中...</text></view>
        <view v-else-if="levelBirds.length === 0" class="empty-wrap"><text>暂无该等级鸟类</text></view>
        <view v-else class="bird-grid">
          <view class="bird-card" v-for="bird in levelBirds" :key="bird._id" @click="goDetail(bird._id)">
            <image :src="bird.images && bird.images[0] || '/static/icons/bird-placeholder.png'" mode="aspectFill" class="bird-img"/>
            <view class="bird-card-info">
              <text class="bird-name">{{ bird.name }}</text>
              <text class="bird-latin">{{ bird.scientificName }}</text>
              <view class="level-tag" :class="getLevelClass(bird.protectionLevel)">
                <text>{{ bird.protectionLevel || '未知' }}</text>
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
  data() {
    return {
      searchKeyword: '',
      isSearching: false,
      searchLoading: false,
      searchResults: [],
      currentTab: 'hot',
      loading: false,
      birdList: [],
      page: 1, pageSize: 20, hasMore: true,
      levelLoading: false,
      levelBirds: [],
      selectedLevel: '一级保护',
      levelList: [
        { key: '一级保护', label: '一级保护', color: '#DC2626', bg: '#FEE2E2' },
        { key: '二级保护', label: '二级保护', color: '#D97706', bg: '#FEF3C7' },
        { key: '三级保护', label: '三级保护', color: '#059669', bg: '#D1FAE5' },
        { key: '濒危物种', label: '濒危物种', color: '#7C3AED', bg: '#EDE9FE' }
      ]
    }
  },

  onLoad() {
    this.loadBirdList(true)
  },

  methods: {
    goBack() { uni.navigateBack() },

    async handleSearch() {
      if (!this.searchKeyword.trim()) return
      this.isSearching = true
      this.searchLoading = true
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-bird',
          data: { action: 'searchBirds', params: { keyword: this.searchKeyword, page: 1, pageSize: 50 } }
        })
        if (res.result.code === 0) this.searchResults = res.result.data.list
        else this.searchResults = []
      } catch (e) { this.searchResults = [] }
      finally { this.searchLoading = false }
    },

    clearSearch() {
      this.searchKeyword = ''
      this.isSearching = false
      this.searchResults = []
    },

    switchTab(key) {
      this.currentTab = key
      if (key === 'level' && this.levelBirds.length === 0) this.loadLevelBirds()
    },

    async loadBirdList(reset = false) {
      if (reset) { this.page = 1; this.hasMore = true; this.birdList = [] }
      if (!this.hasMore) return
      this.loading = true
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-bird',
          data: { action: 'getBirdList', params: { page: this.page, pageSize: this.pageSize } }
        })
        if (res.result.code === 0) {
          const { list, hasMore } = res.result.data
          this.birdList = reset ? list : [...this.birdList, ...list]
          this.hasMore = hasMore
          if (hasMore) this.page++
        }
      } catch (e) {} finally { this.loading = false }
    },

    loadMore() { if (!this.loading && this.hasMore) this.loadBirdList(false) },

    selectLevel(key) {
      if (this.selectedLevel === key) return
      this.selectedLevel = key
      this.loadLevelBirds()
    },

    async loadLevelBirds() {
      this.levelLoading = true; this.levelBirds = []
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-bird',
          data: { action: 'getBirdList', params: { protectionLevel: this.selectedLevel, page: 1, pageSize: 50 } }
        })
        if (res.result.code === 0) this.levelBirds = res.result.data.list
      } catch (e) {} finally { this.levelLoading = false }
    },


    goDetail(id) {
      uni.navigateTo({ url: `/pages/public/bird/bird-detail?id=${id}` })
    },

    getLevelClass(level) {
      return { '一级保护': 'lv-first', '二级保护': 'lv-second', '三级保护': 'lv-third', '濒危物种': 'lv-danger' }[level] || 'lv-unknown'
    }
  }
}
</script>

<style scoped lang="scss">
.page { background: #F2F6FC; min-height: 100vh; padding-bottom: 40rpx; }

.top-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24rpx 28rpx;
  background: linear-gradient(135deg, #0F2A5C, #1B4B8C);
  position: sticky; top: 0; z-index: 100;
}
.back-btn {
  width: 72rpx; height: 72rpx; border-radius: 50%;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
}
.back-btn svg { width: 40rpx; height: 40rpx; }
.nav-title { font-size: 32rpx; font-weight: bold; color: #FFFFFF; }

.search-wrap { padding: 20rpx 24rpx; background: #FFFFFF; }
.search-bar {
  display: flex; align-items: center; gap: 12rpx;
  background: #F2F6FC; border-radius: 20rpx; padding: 16rpx 24rpx;
}
.search-input { flex: 1; font-size: 28rpx; color: #303133; }
.clear-btn { font-size: 28rpx; color: #909399; padding: 0 8rpx; }

.ref-banner {
  display: flex; align-items: center; gap: 12rpx;
  background: rgba(37,99,235,0.06); border-left: 4rpx solid #2563EB;
  padding: 16rpx 24rpx; margin: 0;
}
.ref-text { font-size: 22rpx; color: #2563EB; line-height: 1.5; flex: 1; }

.content-wrap { padding: 20rpx 24rpx; }
.result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.result-title { font-size: 28rpx; font-weight: bold; color: #303133; }
.result-count { font-size: 24rpx; color: #909399; }

.tabs {
  display: flex; background: #FFFFFF; border-radius: 12rpx;
  padding: 6rpx; margin-bottom: 20rpx;
}
.tab-item {
  flex: 1; text-align: center; padding: 16rpx;
  font-size: 26rpx; color: #909399; border-radius: 8rpx;
  transition: all 0.2s;
}
.tab-item.active { background: #1B4B8C; color: #FFFFFF; font-weight: 600; }

.level-filters { display: flex; flex-wrap: wrap; gap: 14rpx; margin-bottom: 20rpx; }
.level-chip {
  padding: 12rpx 28rpx; border-radius: 30rpx;
  border: 1rpx solid #DCDFE6; background: #FFFFFF;
  font-size: 24rpx; color: #606266;
}
.level-chip.active { font-weight: 600; }

.bird-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18rpx; }
.bird-card {
  background: #FFFFFF; border-radius: 16rpx; overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.06);
}
.bird-card:active { opacity: 0.8; }
.bird-img { width: 100%; height: 220rpx; }
.bird-card-info { padding: 16rpx; }
.bird-name { display: block; font-size: 27rpx; font-weight: 600; color: #1A202C; margin-bottom: 4rpx; }
.bird-latin { display: block; font-size: 21rpx; color: #909399; font-style: italic; margin-bottom: 10rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.level-tag { display: inline-block; font-size: 19rpx; padding: 4rpx 14rpx; border-radius: 6rpx; }
.lv-first  { background: #FEE2E2; color: #DC2626; }
.lv-second { background: #FEF3C7; color: #D97706; }
.lv-third  { background: #D1FAE5; color: #059669; }
.lv-danger { background: #EDE9FE; color: #7C3AED; }
.lv-unknown{ background: #F3F4F6; color: #6B7280; }

.load-more { text-align: center; padding: 32rpx; font-size: 26rpx; color: #2563EB; }
.loading-wrap { display: flex; justify-content: center; padding: 60rpx; text { font-size: 26rpx; color: #909399; } }
.empty-wrap { display: flex; justify-content: center; padding: 80rpx; text { font-size: 26rpx; color: #909399; } }
</style>