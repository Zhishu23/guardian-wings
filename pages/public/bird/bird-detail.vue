<template>
  <view class="page">

    <!-- 加载中 -->
    <view v-if="loading" class="loading-wrap">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在加载...</text>
    </view>

    <!-- 详情内容 -->
    <view v-else-if="bird._id" class="detail-container">

      <!-- 头图区（纯图片，不放文字） -->
      <view class="hero-section">
        <swiper v-if="bird.images && bird.images.length > 1"
          class="hero-swiper"
          :indicator-dots="true"
          :autoplay="true"
          :interval="4000"
          indicator-color="rgba(255,255,255,0.5)"
          indicator-active-color="#FFFFFF"
        >
          <swiper-item v-for="(img, i) in bird.images" :key="i">
            <image :src="img" class="hero-image" mode="aspectFill" />
          </swiper-item>
        </swiper>
        <image
          v-else
          :src="(bird.images && bird.images[0]) || '/static/icons/bird-placeholder.png'"
          class="hero-image"
          mode="aspectFill"
        />

        <!-- 顶部操作栏（返回 + 收藏） -->
        <view class="hero-topbar">
          <view class="topbar-btn" @click="goBack">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </view>
          <view class="topbar-btn" @click="toggleFavorite">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path v-if="isFavorite"
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="#F56C6C"/>
              <path v-else
                d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
                fill="#FFFFFF"/>
            </svg>
          </view>
        </view>

        <!-- 底部渐变（只做视觉过渡，不放文字） -->
        <view class="hero-bottom-fade"></view>
      </view>

      <!-- 主信息卡（浮出图片） -->
      <view class="main-info-card">
        <!-- 保护等级标签 -->
        <view class="level-badge" :class="'level-' + levelKey">
          <view class="level-dot"></view>
          <text class="level-text">{{ levelInfo.label }}</text>
        </view>

        <!-- 名称 -->
        <text class="bird-name">{{ bird.name }}</text>
        <text class="bird-latin">{{ bird.scientificName }}</text>

        <!-- 快速属性栏 -->
        <view class="quick-attrs">
          <view class="attr-chip" v-if="bird.habitat">
            <text class="attr-icon">🏡</text>
            <text class="attr-label">{{ bird.habitat }}</text>
          </view>
          <view class="attr-chip" v-if="bird.size">
            <text class="attr-icon">📏</text>
            <text class="attr-label">{{ bird.size }}</text>
          </view>
          <view class="attr-chip" v-if="bird.category">
            <text class="attr-icon">🐦</text>
            <text class="attr-label">{{ bird.category }}</text>
          </view>
        </view>
      </view>

      <!-- 特征标签 -->
      <view class="section-card" v-if="bird.features && bird.features.length">
        <view class="section-header">
          <view class="section-icon-wrap green">
            <svg viewBox="0 0 24 24" fill="none" style="width:32rpx;height:32rpx;">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#67C23A"/>
            </svg>
          </view>
          <text class="section-title">形态特征</text>
        </view>
        <view class="features-wrap">
          <view class="feature-tag" v-for="(f, i) in bird.features" :key="i">
            <text>{{ f }}</text>
          </view>
        </view>
      </view>

      <!-- 物种描述 -->
      <view class="section-card" v-if="bird.description">
        <view class="section-header">
          <view class="section-icon-wrap blue">
            <svg viewBox="0 0 24 24" fill="none" style="width:32rpx;height:32rpx;">
              <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 14H8v-2h8v2zm0-4H8v-2h8v2zm-3-4H8V6h5v2z" fill="#409EFF"/>
            </svg>
          </view>
          <text class="section-title">物种描述</text>
        </view>
        <text class="section-text">{{ bird.description }}</text>
      </view>

      <!-- 地理分布 -->
      <view class="section-card" v-if="bird.distribution">
        <view class="section-header">
          <view class="section-icon-wrap orange">
            <svg viewBox="0 0 24 24" fill="none" style="width:32rpx;height:32rpx;">
              <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" fill="#F59E0B"/>
            </svg>
          </view>
          <text class="section-title">地理分布</text>
        </view>
        <text class="section-text">{{ bird.distribution }}</text>
      </view>

      <!-- 生活习性 -->
      <view class="section-card" v-if="bird.habits">
        <view class="section-header">
          <view class="section-icon-wrap green">
            <svg viewBox="0 0 24 24" fill="none" style="width:32rpx;height:32rpx;">
              <path d="M17 8C8 10 5.9 16.17 3.82 19.9c-.08.15.06.32.22.27 4.83-1.65 7.78-5.47 9.35-8.34 1.17 1.04 2.27 2.47 2.75 4.17.06.2.31.24.43.07C18.5 13.33 19 11 17 8z" fill="#67C23A"/>
            </svg>
          </view>
          <text class="section-title">生活习性</text>
        </view>
        <text class="section-text">{{ bird.habits }}</text>
      </view>

      <!-- 保护状况 -->
      <view class="section-card" v-if="bird.conservation">
        <view class="section-header">
          <view class="section-icon-wrap red">
            <svg viewBox="0 0 24 24" fill="none" style="width:32rpx;height:32rpx;">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" fill="#F56C6C"/>
            </svg>
          </view>
          <text class="section-title">保护状况</text>
        </view>
        <text class="section-text">{{ bird.conservation }}</text>
        <view class="law-alert">
          <text class="law-alert-icon">⚖️</text>
          <text class="law-alert-text">该物种受《野生动物保护法》保护，非法捕猎、交易、伤害均属违法犯罪行为。</text>
        </view>
      </view>

      <!-- 底部操作（fixed） -->
      <view class="bottom-bar">
        <view class="bottom-btn report-btn" @click="report">
          <svg viewBox="0 0 24 24" fill="none" style="width:36rpx;height:36rpx;margin-right:10rpx;">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#FFFFFF"/>
          </svg>
          <text class="bottom-btn-text">举报违法行为</text>
        </view>
        <view class="bottom-btn rescue-btn" @click="rescue">
          <svg viewBox="0 0 24 24" fill="none" style="width:36rpx;height:36rpx;margin-right:10rpx;">
            <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" fill="#FFFFFF"/>
          </svg>
          <text class="bottom-btn-text">鸟类救助</text>
        </view>
      </view>

    </view>

    <!-- 未找到 -->
    <view v-else class="error-wrap">
      <text class="error-emoji">🐦</text>
      <text class="error-title">未找到该鸟类信息</text>
      <view class="error-back-btn" @click="goBack">
        <text>返回上一页</text>
      </view>
    </view>

  </view>
</template>

<script>
export default {
  data() {
    return {
      loading:    true,
      bird:       {},
      isFavorite: false,
      birdId:     ''
    }
  },

  computed: {
    levelKey() {
      const map = {
        '一级保护': 'first',
        '二级保护': 'second',
        '三级保护': 'third',
        '濒危物种': 'danger'
      }
      return map[this.bird.protectionLevel] || 'unknown'
    },
    levelInfo() {
      const map = {
        '一级保护': { label: '国家一级保护动物' },
        '二级保护': { label: '国家二级保护动物' },
        '三级保护': { label: '国家三级保护动物' },
        '濒危物种': { label: '濒危物种' }
      }
      return map[this.bird.protectionLevel] || { label: this.bird.protectionLevel || '保护动物' }
    }
  },

  onLoad(options) {
    this.birdId = options.id
    this.loadDetail()
  },

  methods: {
    async loadDetail() {
      this.loading = true
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-bird',
          data: { action: 'getBirdDetail', params: { birdId: this.birdId } }
        })
        if (res.result.code === 0) {
          this.bird = res.result.data
          await this.checkFavorite()
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async checkFavorite() {
      const uid = this.$store.state.user.uid
      if (!uid) return
      const localFavs = uni.getStorageSync('favorite_birds') || []
      this.isFavorite = localFavs.includes(this.birdId)
    },

    async toggleFavorite() {
      const uid = this.$store.state.user.uid
      if (!uid) {
        return uni.showModal({
          title: '未登录', content: '请先登录后再收藏',
          confirmText: '去登录',
          success: res => { if (res.confirm) uni.navigateTo({ url: '/pages/login/public-login' }) }
        })
      }
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-bird',
          data: { action: 'toggleFavorite', params: { userId: uid, birdId: this.birdId } }
        })
        if (res.result.code === 0) {
          this.isFavorite = res.result.isFavorite
          let localFavs = uni.getStorageSync('favorite_birds') || []
          if (this.isFavorite) {
            localFavs = [...new Set([...localFavs, this.birdId])]
          } else {
            localFavs = localFavs.filter(id => id !== this.birdId)
          }
          uni.setStorageSync('favorite_birds', localFavs)
          uni.showToast({ title: this.isFavorite ? '已收藏' : '已取消收藏', icon: this.isFavorite ? 'success' : 'none' })
        }
      } catch (e) {
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    },

    report() {
      uni.navigateTo({ url: '/pages/public/report/report' })
    },

    rescue() {
      uni.showModal({
        title: '🏥 野生动物救助',
        content: '全国野生动物救助热线：12119\n\n拨打后告知动物种类、发现地点，专业救助人员将及时响应。',
        confirmText: '立即拨打',
        cancelText: '稍后再说',
        success: res => {
          if (res.confirm) uni.makePhoneCall({ phoneNumber: '12119' })
        }
      })
    },

    goBack() { uni.navigateBack() }
  }
}
</script>

<style scoped lang="scss">
.page {
  background: #F2F6FC;
  min-height: 100vh;
}

/* ── 加载 ── */
.loading-wrap {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  height: 100vh; gap: 24rpx;
}
.loading-spinner {
  width: 80rpx; height: 80rpx;
  border: 6rpx solid #E5E7EB;
  border-top-color: #1B4B8C;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 26rpx; color: #909399; }

/* ── 头图 ── */
.detail-container { padding-bottom: 160rpx; }

.hero-section {
  position: relative;
  height: 560rpx;
  overflow: hidden;
}
.hero-swiper { width: 100%; height: 560rpx; }
.hero-image { width: 100%; height: 560rpx; display: block; }

/* 顶部操作栏 */
.hero-topbar {
  position: absolute;
  top: 0; left: 0; right: 0;
  padding: 24rpx 28rpx;
  display: flex; justify-content: space-between; align-items: center;
  background: linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%);
}
.topbar-btn {
  width: 72rpx; height: 72rpx;
  background: rgba(0,0,0,0.3);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 1rpx solid rgba(255,255,255,0.25);
}
.topbar-btn svg { width: 40rpx; height: 40rpx; }

/* 底部渐变过渡 */
.hero-bottom-fade {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 120rpx;
  background: linear-gradient(to top, #F2F6FC 0%, transparent 100%);
}

/* ── 主信息卡 ── */
.main-info-card {
  margin: -40rpx 28rpx 0;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.10);
  position: relative;
  z-index: 10;
}

/* 保护等级标签 */
.level-badge {
  display: inline-flex; align-items: center; gap: 10rpx;
  padding: 8rpx 20rpx; border-radius: 40rpx;
  margin-bottom: 20rpx;
}
.level-dot { width: 12rpx; height: 12rpx; border-radius: 50%; }
.level-text { font-size: 22rpx; font-weight: 600; }

.level-first  { background: rgba(220,38,38,0.08);  .level-dot { background: #DC2626; } .level-text { color: #DC2626; } }
.level-second { background: rgba(245,158,11,0.08); .level-dot { background: #F59E0B; } .level-text { color: #D97706; } }
.level-third  { background: rgba(16,185,129,0.08); .level-dot { background: #10B981; } .level-text { color: #059669; } }
.level-danger { background: rgba(139,92,246,0.08); .level-dot { background: #8B5CF6; } .level-text { color: #7C3AED; } }
.level-unknown{ background: rgba(107,114,128,0.08);.level-dot { background: #6B7280; } .level-text { color: #6B7280; } }

.bird-name {
  display: block;
  font-size: 52rpx; font-weight: bold; color: #1A202C;
  margin-bottom: 10rpx; line-height: 1.2;
}
.bird-latin {
  display: block;
  font-size: 26rpx; color: #909399; font-style: italic;
  margin-bottom: 28rpx;
}

/* 快速属性 */
.quick-attrs {
  display: flex; flex-wrap: wrap; gap: 14rpx;
}
.attr-chip {
  display: flex; align-items: center; gap: 8rpx;
  background: #F2F6FC; border-radius: 40rpx;
  padding: 10rpx 20rpx;
}
.attr-icon { font-size: 28rpx; }
.attr-label { font-size: 24rpx; color: #606266; }

/* ── 内容卡片 ── */
.section-card {
  margin: 24rpx 28rpx 0;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
}

.section-header {
  display: flex; align-items: center; gap: 16rpx;
  margin-bottom: 20rpx;
}
.section-icon-wrap {
  width: 60rpx; height: 60rpx; border-radius: 14rpx;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.section-icon-wrap.green  { background: rgba(103,194,58,0.12); }
.section-icon-wrap.blue   { background: rgba(64,158,255,0.12); }
.section-icon-wrap.orange { background: rgba(245,158,11,0.12); }
.section-icon-wrap.red    { background: rgba(245,108,108,0.12); }

.section-title {
  font-size: 30rpx; font-weight: bold; color: #303133;
}
.section-text {
  font-size: 28rpx; color: #4A5568; line-height: 1.9; display: block;
}

/* 特征标签 */
.features-wrap { display: flex; flex-wrap: wrap; gap: 14rpx; }
.feature-tag {
  background: rgba(103,194,58,0.08);
  border: 1rpx solid rgba(103,194,58,0.3);
  border-radius: 40rpx; padding: 10rpx 24rpx;
  text { font-size: 24rpx; color: #3D7A1F; }
}

/* 法律提示 */
.law-alert {
  display: flex; align-items: flex-start; gap: 14rpx;
  margin-top: 24rpx; padding: 24rpx;
  background: linear-gradient(135deg, #FFF7ED, #FEF3C7);
  border-radius: 14rpx;
  border-left: 5rpx solid #F59E0B;
}
.law-alert-icon { font-size: 32rpx; flex-shrink: 0; }
.law-alert-text { font-size: 24rpx; color: #92400E; line-height: 1.7; flex: 1; }

/* ── 底部操作栏 ── */
.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  padding: 20rpx 28rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #FFFFFF;
  box-shadow: 0 -2rpx 16rpx rgba(0,0,0,0.08);
  display: flex; gap: 20rpx;
  z-index: 100;
}
.bottom-btn {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 26rpx 0; border-radius: 16rpx; gap: 4rpx;
}
.bottom-btn-text { font-size: 28rpx; font-weight: 600; color: #FFFFFF; }

.report-btn {
  background: linear-gradient(135deg, #FF6B00, #FF8C00);
  box-shadow: 0 6rpx 20rpx rgba(255,107,0,0.35);
}
.rescue-btn {
  background: linear-gradient(135deg, #1B4B8C, #2563EB);
  box-shadow: 0 6rpx 20rpx rgba(27,75,140,0.3);
}

/* ── 错误态 ── */
.error-wrap {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  height: 100vh; gap: 24rpx;
}
.error-emoji { font-size: 120rpx; }
.error-title { font-size: 30rpx; color: #909399; }
.error-back-btn {
  margin-top: 16rpx; padding: 20rpx 64rpx;
  background: #1B4B8C; border-radius: 40rpx;
  text { font-size: 28rpx; color: #FFFFFF; }
}
</style>