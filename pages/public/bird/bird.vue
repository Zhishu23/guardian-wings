<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          placeholder="搜索鸟类名称或特征"
          v-model="searchKeyword"
          @confirm="handleSearch"
          @input="onSearchInput"
        />
        <text v-if="searchKeyword" class="clear-icon" @click="clearSearch">✕</text>
      </view>
      <view class="voice-btn" @click="handleSearch">
        <text class="icon">🔍</text>
      </view>
    </view>

    <!-- 识别功能区 -->
    <view class="identify-section">
      <view class="identify-card camera" @click="openCamera">
        <text class="icon">📷</text>
        <text class="label">拍照识别</text>
      </view>
      <view class="identify-card album" @click="chooseImage">
        <text class="icon">🖼</text>
        <text class="label">相册识别</text>
      </view>
      <view class="identify-card dongNiao" @click="jumpToDongNiao">
        <text class="icon">🦜</text>
        <text class="label">懂鸟识别</text>
      </view>
    </view>

    <!-- Tab切换 -->
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: currentTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        <text class="tab-text">{{ tab.label }}</text>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view v-if="isSearching" class="content-section">
      <view class="section-title">
        <text>搜索结果</text>
        <text class="subtitle">共 {{ searchResults.length }} 条</text>
      </view>
      <view v-if="searchLoading" class="loading-box"><text>搜索中...</text></view>
      <view v-else-if="searchResults.length === 0" class="empty">
        <text>未找到"{{ searchKeyword }}"相关鸟类</text>
      </view>
      <view v-else class="bird-grid">
        <view
          v-for="bird in searchResults"
          :key="bird._id"
          class="bird-item"
          @click="goDetail(bird)"
        >
          <image :src="bird.images && bird.images[0] || '/static/icons/bird-placeholder.png'" mode="aspectFill" class="bird-thumb" />
          <view class="bird-info">
            <text class="bird-name">{{ bird.name }}</text>
            <text class="bird-latin">{{ bird.scientificName }}</text>
            <view class="level-tag-small" :style="getLevelStyle(bird.protectionLevel)">
              <text>{{ getLevelLabel(bird.protectionLevel) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 热门鸟类 Tab -->
    <view v-else-if="currentTab === 'hot'" class="content-section">
      <view class="section-title">
        <text>热门鸟类</text>
        <text class="subtitle">常见与珍稀物种</text>
      </view>
      <view v-if="loading" class="loading-box"><text>加载中...</text></view>
      <view v-else class="bird-grid">
        <view
          v-for="bird in birdList"
          :key="bird._id"
          class="bird-item"
          @click="goDetail(bird)"
        >
          <image :src="bird.images && bird.images[0] || '/static/icons/bird-placeholder.png'" mode="aspectFill" class="bird-thumb" />
          <view class="bird-info">
            <text class="bird-name">{{ bird.name }}</text>
            <text class="bird-latin">{{ bird.scientificName }}</text>
            <view class="level-tag-small" :style="getLevelStyle(bird.protectionLevel)">
              <text>{{ getLevelLabel(bird.protectionLevel) }}</text>
            </view>
          </view>
        </view>
      </view>
      <!-- 加载更多 -->
      <view class="load-more-btn" v-if="hasMore" @click="loadMore">
        <text>加载更多</text>
      </view>
    </view>

    <!-- 保护等级 Tab -->
    <view v-else-if="currentTab === 'level'" class="content-section">
      <view class="level-filters">
        <view
          v-for="level in levelFilters"
          :key="level.key"
          class="level-filter"
          :class="{ active: selectedLevel === level.key }"
          :style="{
            borderColor: selectedLevel === level.key ? level.color : '#e0e0e0',
            background:  selectedLevel === level.key ? level.bgColor : '#fff'
          }"
          @click="selectLevel(level.key)"
        >
          <text :style="{ color: level.color }">{{ level.label }}</text>
        </view>
      </view>
      <view v-if="levelLoading" class="loading-box"><text>加载中...</text></view>
      <view v-else-if="levelBirds.length === 0" class="empty"><text>暂无该等级鸟类</text></view>
      <view v-else class="bird-grid">
        <view
          v-for="bird in levelBirds"
          :key="bird._id"
          class="bird-item"
          @click="goDetail(bird)"
        >
          <image :src="bird.images && bird.images[0] || '/static/icons/bird-placeholder.png'" mode="aspectFill" class="bird-thumb" />
          <view class="bird-info">
            <text class="bird-name">{{ bird.name }}</text>
            <text class="bird-latin">{{ bird.scientificName }}</text>
            <view class="level-tag-small" :style="getLevelStyle(bird.protectionLevel)">
              <text>{{ getLevelLabel(bird.protectionLevel) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 识别历史 Tab -->
    <view v-else-if="currentTab === 'history'" class="content-section">
      <view v-if="historyList.length > 0">
        <view class="section-title">
          <text>识别历史</text>
          <text class="clear-btn" @click="clearHistory">清空</text>
        </view>
        <view class="history-list">
          <view
            v-for="item in historyList"
            :key="item.id"
            class="history-item"
            @click="goDetailById(item.birdId)"
          >
            <image :src="item.image || '/static/icons/bird-placeholder.png'" class="history-thumb" mode="aspectFill" />
            <view class="history-info">
              <text class="history-name">{{ item.name }}</text>
              <text class="history-time">{{ item.time }}</text>
            </view>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>
      <view v-else class="empty">
        <text class="empty-icon">🔍</text>
        <text class="empty-text">还没有识别记录</text>
        <text class="empty-hint">去识别鸟类吧</text>
      </view>
    </view>

    <tab-bar active="bird" />
  </view>
</template>

<script>
import TabBar from '@/components/common/tab-bar.vue'
import { recognizeBirdImage } from '@/utils/birdRecognize.js'

export default {
  components: {
    TabBar
  },

  onShow() {
    uni.hideTabBar({ animation: false })
  },
  
  data() {
    return {
      searchKeyword:  '',
      isSearching:    false,
      searchLoading:  false,
      searchResults:  [],
      searchTimer:    null,
      currentTab:     'hot',
      tabs: [
        { key: 'hot',     label: '热门鸟类' },
        { key: 'level',   label: '保护等级' },
        { key: 'history', label: '识别历史' }
      ],
      // 热门列表
      loading:  false,
      birdList: [],
      page:     1,
      pageSize: 20,
      hasMore:  true,
      // 保护等级
      levelLoading:  false,
      levelBirds:    [],
      levelFilters: [
        { key: '一级保护', label: '一级保护', color: '#DC2626', bgColor: '#FEE2E2' },
        { key: '二级保护', label: '二级保护', color: '#F59E0B', bgColor: '#FEF3C7' },
        { key: '三级保护', label: '三级保护', color: '#10B981', bgColor: '#D1FAE5' },
        { key: '濒危物种', label: '濒危物种', color: '#8B5CF6', bgColor: '#EDE9FE' }
      ],
      selectedLevel: '一级保护',
      historyList: []
    }
  },

  onLoad() {
    this.loadBirdList(true)
    this.loadHistory()
  },

  methods: {
    // ── 搜索 ──
    onSearchInput(e) {
      const kw = (e.detail && e.detail.value !== undefined) ? e.detail.value : this.searchKeyword
      if (!kw.trim()) {
        this.isSearching   = false
        this.searchResults = []
      }
    },

    async handleSearch() {
      if (!this.searchKeyword.trim()) return
      this.isSearching = true
      await this.doSearch(this.searchKeyword)
    },

    async doSearch(keyword) {
      if (!keyword || !keyword.trim()) return
      this.isSearching   = true
      this.searchLoading = true
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-bird',
          data: { action: 'searchBirds', params: { keyword, page: 1, pageSize: 50 } }
        })
        console.log('搜索返回:', JSON.stringify(res.result))
        console.log('isSearching:', this.isSearching)
        console.log('searchResults长度:', res.result.data ? res.result.data.list.length : '无data')
        if (res.result.code === 0) {
          this.searchResults = res.result.data.list
        } else {
          this.searchResults = []
        }
      } catch (e) {
        console.error(e)
        this.searchResults = []
      } finally {
        this.searchLoading = false
      }
    },

    clearSearch() {
      this.searchKeyword = ''
      this.isSearching   = false
      this.searchResults = []
    },

    voiceSearch() {
      uni.showToast({ title: '语音识别功能开发中', icon: 'none' })
    },

    // ── 识别 ──
    openCamera() {
      uni.chooseImage({
        count: 1,
        sourceType: ['camera'],
        sizeType: ['compressed'],  
        success: res => this.recognizeBird(res.tempFilePaths[0])
      })
    },
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sourceType: ['album'],// ← 加这行
        success: res => this.recognizeBird(res.tempFilePaths[0])
      })
    },
    async recognizeBird(imagePath) {
      uni.showLoading({ title: '识别中...' })
      try {
        const result = await recognizeBirdImage(imagePath)
    
        // 在本地鸟类库匹配
        const matched = this.birdList.find(b =>
          b.name === result.chineseName ||
          b.alias === result.chineseName ||
          (b.latinName && b.latinName === result.latinName)
        )
    
        const confidence = Math.round(result.confidence)
    
        if (matched) {
          // 本地有数据，直接跳转详情
          this.addToHistory(matched)
          uni.hideLoading()
          uni.showToast({ title: `识别成功：${result.chineseName}（${confidence}%）`, icon: 'none', duration: 1500 })
          setTimeout(() => this.goDetail(matched), 1000)
        } else {
          // 本地没有，展示 API 返回结果
          uni.hideLoading()
          uni.showModal({
            title: `🐦 ${result.chineseName}`,
            content: `置信度：${confidence}%\n英文名：${result.englishName || '暂无'}\n学名：${result.latinName || '暂无'}\n\n（本地暂无该鸟类详细资料）`,
            showCancel: false,
            confirmText: '知道了'
          })
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: e.message || '识别失败，请重试', icon: 'none', duration: 2500 })
      }
    },
    jumpToDongNiao() {
      uni.showModal({
        title: '跳转确认', content: '即将跳转到懂鸟APP进行识别',
        success: res => { if (res.confirm) uni.showToast({ title: '懂鸟集成功能开发中', icon: 'none' }) }
      })
    },

    // ── Tab ──
    switchTab(key) {
      this.currentTab = key
      if (key === 'level' && this.levelBirds.length === 0) {
        this.loadLevelBirds()
      }
    },

    // ── 热门列表 ──
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
          this.hasMore  = hasMore
          if (hasMore) this.page++
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    loadMore() {
      if (!this.loading && this.hasMore) this.loadBirdList(false)
    },

    // ── 保护等级筛选 ──
    selectLevel(key) {
      if (this.selectedLevel === key) return
      this.selectedLevel = key
      this.loadLevelBirds()
    },

    async loadLevelBirds() {
      this.levelLoading = true
      this.levelBirds   = []
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-bird',
          data: {
            action: 'getBirdList',
            params: { protectionLevel: this.selectedLevel, page: 1, pageSize: 50 }
          }
        })
        if (res.result.code === 0) {
          this.levelBirds = res.result.data.list
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.levelLoading = false
      }
    },

    // ── 跳转详情 ──
    goDetail(bird) {
      this.addToHistory(bird)
      uni.navigateTo({ url: `/pages/public/bird/bird-detail?id=${bird._id}` })
    },

    goDetailById(id) {
      uni.navigateTo({ url: `/pages/public/bird/bird-detail?id=${id}` })
    },

    // ── 历史记录（本地存储） ──
    loadHistory() {
      this.historyList = uni.getStorageSync('bird_history') || []
    },

    addToHistory(bird) {
      const record = {
        id:     Date.now(),
        birdId: bird._id,
        name:   bird.name,
        image:  bird.images && bird.images[0] || '',
        time:   this.formatTime(new Date())
      }
      this.historyList = [record, ...this.historyList.filter(h => h.birdId !== bird._id)].slice(0, 20)
      uni.setStorageSync('bird_history', this.historyList)
    },

    clearHistory() {
      uni.showModal({
        title: '确认清空', content: '确定要清空所有识别历史吗？',
        success: res => {
          if (res.confirm) {
            this.historyList = []
            uni.removeStorageSync('bird_history')
            uni.showToast({ title: '已清空', icon: 'success' })
          }
        }
      })
    },

    // ── 工具方法 ──
    getLevelLabel(level) {
      return level || '未知'
    },
    
    getLevelStyle(level) {
      const map = {
        '一级保护': { background: '#FEE2E2', color: '#DC2626' },
        '二级保护': { background: '#FEF3C7', color: '#F59E0B' },
        '三级保护': { background: '#D1FAE5', color: '#10B981' },
        '濒危物种': { background: '#EDE9FE', color: '#8B5CF6' }
      }
      return map[level] || { background: '#F3F4F6', color: '#6B7280' }
    },

    formatTime(date) {
      const pad = n => String(n).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    }
  }
}
</script>

<style scoped lang="scss">
.page { background: #f5f5f5; min-height: 100vh; padding-bottom: 120rpx; }
.search-section { display: flex; align-items: center; gap: 16rpx; padding: 24rpx; padding-top: calc(var(--status-bar-height) + 24rpx); background: #fff; }
.search-bar { flex: 1; display: flex; align-items: center; background: #f5f5f5; border-radius: 24rpx; padding: 16rpx 24rpx; }
.search-icon { font-size: 32rpx; margin-right: 12rpx; }
.search-input { flex: 1; font-size: 28rpx; color: #333; }
.clear-icon { font-size: 32rpx; color: #999; padding: 0 8rpx; }
.voice-btn { width: 80rpx; height: 80rpx; background: linear-gradient(135deg, #5ca470 0%, #4a9d5f 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(92,164,112,0.3); .icon { font-size: 36rpx; } }
.identify-section { display: flex; gap: 16rpx; padding: 24rpx; background: #fff; margin-top: 16rpx; }
.identify-card { flex: 1; background: linear-gradient(135deg, #f0f7f2 0%, #e8f5e9 100%); border-radius: 16rpx; padding: 32rpx 16rpx; text-align: center; border: 2px solid #5ca470; &:active { transform: scale(0.95); } .icon { display: block; font-size: 48rpx; margin-bottom: 12rpx; } .label { font-size: 26rpx; color: #2d3748; font-weight: 500; } &.dongNiao { background: linear-gradient(135deg, #fff7e0 0%, #ffe0b2 100%); border-color: #ff9800; } }
.tabs { display: flex; background: #fff; padding: 0 24rpx; margin-top: 16rpx; }
.tab-item { flex: 1; padding: 24rpx 0; text-align: center; position: relative; &.active { .tab-text { color: #5ca470; font-weight: 600; } &::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 60rpx; height: 6rpx; background: #5ca470; border-radius: 3rpx; } } }
.tab-text { font-size: 28rpx; color: #666; }
.content-section { padding: 24rpx; }
.section-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24rpx; text { font-size: 32rpx; font-weight: 600; color: #2d3748; } .subtitle { font-size: 24rpx; color: #999; font-weight: 400; } .clear-btn { font-size: 26rpx; color: #5ca470; font-weight: 400; } }
.bird-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20rpx; }
.bird-item { background: #fff; border-radius: 16rpx; overflow: hidden; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); &:active { opacity: 0.85; } }
.bird-thumb { width: 100%; height: 220rpx; }
.bird-info { padding: 16rpx; }
.bird-name { display: block; font-size: 28rpx; font-weight: 600; color: #2d3748; margin-bottom: 6rpx; }
.bird-latin { display: block; font-size: 22rpx; color: #999; font-style: italic; margin-bottom: 12rpx; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.level-tag-small { display: inline-block; padding: 4rpx 14rpx; border-radius: 6rpx; font-size: 20rpx; font-weight: 500; }
.level-filters { display: flex; flex-wrap: wrap; gap: 16rpx; margin-bottom: 24rpx; }
.level-filter { padding: 16rpx 32rpx; border-radius: 24rpx; border: 2px solid #e0e0e0; font-size: 26rpx; &:active { transform: scale(0.95); } }
.history-list { background: #fff; border-radius: 16rpx; overflow: hidden; }
.history-item { display: flex; align-items: center; padding: 24rpx; border-bottom: 1px solid #f0f0f0; &:last-child { border-bottom: none; } }
.history-thumb { width: 120rpx; height: 120rpx; border-radius: 12rpx; margin-right: 24rpx; }
.history-info { flex: 1; display: flex; flex-direction: column; }
.history-name { font-size: 30rpx; color: #2d3748; font-weight: 500; margin-bottom: 8rpx; }
.history-time { font-size: 24rpx; color: #999; }
.arrow { font-size: 36rpx; color: #ccc; }
.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120rpx 0; text { color: #999; font-size: 28rpx; } .empty-icon { font-size: 120rpx; margin-bottom: 24rpx; } .empty-text { font-size: 30rpx; color: #666; margin-bottom: 12rpx; } .empty-hint { font-size: 26rpx; color: #999; } }
.loading-box { display: flex; align-items: center; justify-content: center; padding: 60rpx; text { font-size: 26rpx; color: #999; } }
.load-more-btn { text-align: center; padding: 32rpx; font-size: 26rpx; color: #5ca470; font-weight: 500; }
</style>