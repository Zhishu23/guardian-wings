<template>
  <view class="bookmarks-page">
    <!-- 顶部统计 -->
    <view class="stats-bar">
      <text class="stats-text">共收藏 <text class="stats-num">{{ total }}</text> 种鸟类</text>
    </view>

    <!-- 下拉刷新滚动区 -->
    <scroll-view
      scroll-y
      class="list-scroll"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="loading && list.length === 0" class="loading-box">
        <text>加载中...</text>
      </view>

      <view v-else-if="list.length > 0" class="bird-grid">
        <view
          v-for="item in list"
          :key="item.favoriteId"
          class="bird-card"
          @click="goDetail(item._id)"
          @longpress="showRemoveMenu(item)"
        >
          <image
            :src="item.images && item.images[0] || '/static/icons/bird-placeholder.png'"
            mode="aspectFill"
            class="bird-thumb"
          />
          <view class="bird-info">
            <text class="bird-name">{{ item.name }}</text>
            <text class="bird-latin">{{ item.scientificName }}</text>
            <view class="level-tag" :class="item.protectionLevelClass">
              <text>{{ getLevelLabel(item.protectionLevel) }}</text>
            </view>
          </view>
          <view class="remove-hint">
            <text>长按取消收藏</text>
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <text class="empty-icon">🦅</text>
        <text class="empty-text">还没有收藏任何鸟类</text>
        <text class="empty-hint">在鸟类详情页点击 ♡ 即可收藏</text>
        <view class="go-btn" @click="goBird">
          <text>去看看鸟类</text>
        </view>
      </view>

      <view class="load-more" v-if="hasMore && list.length > 0"><text>上拉加载更多</text></view>
      <view class="load-more" v-else-if="list.length > 0"><text>没有更多了</text></view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loading:    false,
      refreshing: false,
      list:       [],
      total:      0,
      page:       1,
      pageSize:   20,
      hasMore:    true
    }
  },

  onLoad() {
    this.loadFavorites(true)
  },

  methods: {
    async loadFavorites(reset = false) {
      const uid = this.$store.state.user.uid
      if (!uid) return

      if (reset) { this.page = 1; this.hasMore = true; this.list = [] }
      if (!this.hasMore && !reset) return

      this.loading = true
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-bird',
          data: {
            action: 'getMyFavorites',
            params: { userId: uid, page: this.page, pageSize: this.pageSize }
          }
        })
        if (res.result.code === 0) {
          const { list, total, hasMore } = res.result.data
          const normalizedList = this.normalizeFavoriteList(list || [])
          this.list    = reset ? normalizedList : [...this.list, ...normalizedList]
          this.total   = total
          this.hasMore = hasMore
          if (hasMore) this.page++
        }
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading    = false
        this.refreshing = false
      }
    },

    onRefresh() {
      this.refreshing = true
      this.loadFavorites(true)
    },

    loadMore() {
      if (!this.loading && this.hasMore) this.loadFavorites(false)
    },

    goDetail(birdId) {
      uni.navigateTo({ url: `/pages/public/bird/bird-detail?id=${birdId}` })
    },

    showRemoveMenu(item) {
      uni.showModal({
        title:   '取消收藏',
        content: `确定取消收藏《${item.name}》吗？`,
        success: async res => {
          if (!res.confirm) return
          const uid = this.$store.state.user.uid
          try {
            const r = await uniCloud.callFunction({
              name: 'gw-bird',
              data: { action: 'toggleFavorite', params: { userId: uid, birdId: item._id } }
            })
            if (r.result.code === 0 && !r.result.isFavorite) {
              this.list  = this.list.filter(b => b._id !== item._id)
              this.total = Math.max(0, this.total - 1)
              // 同步本地缓存
              let localFavs = uni.getStorageSync('favorite_birds') || []
              localFavs = localFavs.filter(id => id !== item._id)
              uni.setStorageSync('favorite_birds', localFavs)
              uni.showToast({ title: '已取消收藏', icon: 'none' })
            }
          } catch (e) {
            uni.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      })
    },

    goBird() {
      uni.switchTab({ url: '/pages/public/bird/bird' })
    },

    getLevelLabel(level) {
      const map = { '一级': '一级保护', '二级': '二级保护', '三级': '三级保护', '濒危': '濒危物种' }
      return map[level] || level || '未知'
    },

    getLevelClass(level) {
      const map = {
        '一级': 'level-primary',
        '二级': 'level-secondary',
        '三级': 'level-tertiary',
        '濒危': 'level-endangered'
      }
      return map[level] || 'level-unknown'
    },

    normalizeFavoriteList(list) {
      return list.map(item => ({
        ...item,
        protectionLevelClass: this.getLevelClass(item.protectionLevel)
      }))
    }
  }
}
</script>

<style scoped lang="scss">
.bookmarks-page { min-height: 100vh; background: #F5F7FA; display: flex; flex-direction: column; }
.stats-bar { padding: 20rpx 24rpx; background: #FFFFFF; border-bottom: 1rpx solid #F3F4F6; }
.stats-text { font-size: 26rpx; color: #6B7280; }
.stats-num { font-size: 30rpx; font-weight: 700; color: #1F2937; }
.list-scroll { flex: 1; height: calc(100vh - 100rpx); }
.bird-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20rpx; padding: 24rpx; }
.bird-card { background: #FFFFFF; border-radius: 16rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); position: relative; &:active { opacity: 0.85; } }
.bird-thumb { width: 100%; height: 240rpx; }
.bird-info { padding: 16rpx; }
.bird-name { display: block; font-size: 28rpx; font-weight: 600; color: #1F2937; margin-bottom: 6rpx; }
.bird-latin { display: block; font-size: 20rpx; color: #9CA3AF; font-style: italic; margin-bottom: 12rpx; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.level-tag { display: inline-block; padding: 4rpx 14rpx; border-radius: 6rpx; font-size: 20rpx; font-weight: 500; background: #F3F4F6; color: #6B7280; }
.level-tag.level-primary { background: #FEE2E2; color: #DC2626; }
.level-tag.level-secondary { background: #FEF3C7; color: #F59E0B; }
.level-tag.level-tertiary { background: #D1FAE5; color: #10B981; }
.level-tag.level-endangered { background: #EDE9FE; color: #8B5CF6; }
.level-tag.level-unknown { background: #F3F4F6; color: #6B7280; }
.remove-hint { padding: 8rpx 16rpx 16rpx; text { font-size: 20rpx; color: #C4C4C4; } }
.loading-box { display: flex; align-items: center; justify-content: center; padding: 80rpx; text { font-size: 26rpx; color: #999; } }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 120rpx 48rpx; gap: 20rpx; }
.empty-icon { font-size: 120rpx; }
.empty-text { font-size: 30rpx; color: #6B7280; font-weight: 500; }
.empty-hint { font-size: 26rpx; color: #C4C4C4; text-align: center; }
.go-btn { margin-top: 16rpx; padding: 20rpx 60rpx; background: #1B4B8C; border-radius: 12rpx; text { font-size: 28rpx; color: #FFFFFF; } }
.load-more { text-align: center; padding: 32rpx; font-size: 24rpx; color: #9CA3AF; }
</style>
