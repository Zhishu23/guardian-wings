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
            <uni-icons type="back" size="24" color="#FFFFFF" />
          </view>
          <view class="topbar-btn" @click="toggleFavorite">
            <uni-icons :type="isFavorite ? 'heart-filled' : 'heart'" size="24" :color="isFavorite ? '#F56C6C' : '#FFFFFF'" />
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
            <uni-icons type="flag-filled" size="18" color="#67C23A" />
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
            <uni-icons type="compose" size="18" color="#409EFF" />
          </view>
          <text class="section-title">物种描述</text>
        </view>
        <text class="section-text">{{ bird.description }}</text>
      </view>

      <!-- 地理分布 -->
      <view class="section-card" v-if="bird.distribution">
        <view class="section-header">
          <view class="section-icon-wrap orange">
            <uni-icons type="map-filled" size="18" color="#F59E0B" />
          </view>
          <text class="section-title">地理分布</text>
        </view>
        <text class="section-text">{{ bird.distribution }}</text>
      </view>

      <!-- 生活习性 -->
      <view class="section-card" v-if="bird.habits">
        <view class="section-header">
          <view class="section-icon-wrap green">
            <uni-icons type="star-filled" size="18" color="#67C23A" />
          </view>
          <text class="section-title">生活习性</text>
        </view>
        <text class="section-text">{{ bird.habits }}</text>
      </view>

      <!-- 保护状况 -->
      <view class="section-card" v-if="bird.conservation">
        <view class="section-header">
          <view class="section-icon-wrap red">
            <uni-icons type="auth-filled" size="18" color="#F56C6C" />
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
          <uni-icons type="info-filled" size="20" color="#FFFFFF" />
          <text class="bottom-btn-text">举报违法行为</text>
        </view>
        <view class="bottom-btn rescue-btn" @click="rescue">
          <uni-icons type="plus-filled" size="20" color="#FFFFFF" />
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
      uni.switchTab({ url: '/pages/public/report/report' })
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
