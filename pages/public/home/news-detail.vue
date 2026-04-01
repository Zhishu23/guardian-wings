<template>
  <view class="page">
    <!-- 顶部返回栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <svg viewBox="0 0 24 24" style="width:40rpx;height:40rpx;">
          <path d="M15 6l-6 6 6 6" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>
        <text>返回</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 文章内容 -->
    <view v-else-if="article.title" class="article-container">
      <!-- 标题区 -->
      <view class="header">
        <text class="title">{{ article.title }}</text>
        <view class="meta">
          <text class="source">{{ article.source }}</text>
          <text class="divider" v-if="article.source && article.time">·</text>
          <text class="time">{{ article.time }}</text>
          <view class="tag" v-if="article.tag">
            <text>{{ article.tag }}</text>
          </view>
        </view>
      </view>

      <!-- 封面图 -->
      <image
        v-if="article.cover"
        :src="article.cover"
        class="cover"
        mode="widthFix"
      />

      <!-- 正文内容 -->
      <view class="content">
        <view v-if="isHtml" class="rich-content" v-html="article.rawContent" />
        <view v-else>
          <text
            v-for="(paragraph, index) in article.paragraphs"
            :key="index"
            class="paragraph"
          >{{ paragraph }}</text>
        </view>
      </view>

      <!-- 底部操作区 -->
      <view class="actions">
        <view class="action-btn" @click="goBack">
          <text>返回</text>
        </view>
        <view class="action-btn primary" @click="share">
          <text>分享</text>
        </view>
      </view>
    </view>

    <!-- 错误状态 -->
    <view v-else class="error-container">
      <text class="error-icon">📰</text>
      <text class="error-text">未找到相关内容</text>
      <view class="back-btn" @click="goBack"><text>返回首页</text></view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      article: {
        title:      '',
        source:     '',
        time:       '',
        tag:        '',
        cover:      '',
        rawContent: '',
        paragraphs: []
      }
    }
  },

  computed: {
    isHtml() {
      return typeof this.article.rawContent === 'string' &&
        /<[a-z][\s\S]*>/i.test(this.article.rawContent)
    }
  },

  onLoad(options) {
    const id = options.id
    if (id) {
      this.loadArticle(id)
    } else {
      this.loading = false
    }
  },

  methods: {
    async loadArticle(id) {
      this.loading = true
      try {
        const db = uniCloud.database()
        const res = await db.collection('news').doc(id).get()

        // clientDB 返回结构: res.result.data 是数组
        const data = res.result && res.result.data
        const item = Array.isArray(data) ? data[0] : data

        if (item && item.title) {
          const rawContent = item.content || ''

          // 判断是否含HTML标签，若否则按行分段
          const isHtml = /<[a-z][\s\S]*>/i.test(rawContent)
          const paragraphs = isHtml ? [] : rawContent
            .split('\n')
            .map(p => p.trim())
            .filter(p => p.length > 0)

          this.article = {
            title:      item.title,
            source:     item.source || '',
            time:       item.time   || this.formatTime(item.createTime),
            tag:        item.tag    || '新闻',
            cover:      item.cover  || '',
            rawContent: rawContent,
            paragraphs: paragraphs.length > 0 ? paragraphs : ['暂无详细内容']
          }
        }
      } catch (e) {
        console.error('loadArticle error:', e)
      } finally {
        this.loading = false
      }
    },

    formatTime(ts) {
      if (!ts) return ''
      const d = new Date(ts)
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    },

    goBack() {
      uni.navigateBack({ delta: 1 })
    },

    share() {
      uni.showToast({ title: '分享功能开发中', icon: 'none' })
    }
  }
}
</script>

<style scoped lang="scss">
.page { background: #faf7f2; min-height: 100vh; }

.nav-bar {
  display: flex;
  align-items: center;
  padding: 88rpx 32rpx 20rpx;
  background: #FFFFFF;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}
.nav-back {
  display: flex;
  align-items: center;
  gap: 8rpx;
  text { font-size: 30rpx; color: #333; }
}

.loading-container { display: flex; align-items: center; justify-content: center; height: 80vh; }
.loading-text { font-size: 28rpx; color: #999; }

.error-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh; gap: 24rpx; }
.error-icon { font-size: 120rpx; }
.error-text { font-size: 28rpx; color: #999; }
.back-btn { padding: 20rpx 64rpx; background: #1B4B8C; border-radius: 12rpx; text { font-size: 28rpx; color: #fff; } }

.article-container { padding: 32rpx; padding-bottom: 120rpx; }

.header { margin-bottom: 28rpx; }
.title { font-size: 40rpx; font-weight: 700; color: #1a1a1a; line-height: 1.5; display: block; margin-bottom: 20rpx; }
.meta { display: flex; align-items: center; flex-wrap: wrap; gap: 8rpx; }
.source, .time { font-size: 24rpx; color: #999; }
.divider { color: #ddd; font-size: 24rpx; }
.tag { padding: 4rpx 16rpx; background: rgba(245,158,11,0.1); border-radius: 12rpx; text { font-size: 22rpx; color: #F59E0B; } }

.cover { width: 100%; border-radius: 16rpx; margin: 24rpx 0; }

.content { background: #fffdf9; padding: 32rpx; border-radius: 16rpx; box-shadow: 0 2rpx 8rpx rgba(92,164,112,0.06); }
.rich-content { font-size: 30rpx; line-height: 1.9; color: #444; }
.paragraph { display: block; font-size: 30rpx; color: #444; line-height: 1.9; margin-bottom: 24rpx; text-indent: 2em; &:last-child { margin-bottom: 0; } }

.actions { display: flex; gap: 24rpx; margin-top: 48rpx; }
.action-btn {
  flex: 1; height: 88rpx; display: flex; align-items: center; justify-content: center;
  background: #fff; border: 1rpx solid #e0e0e0; border-radius: 12rpx;
  text { font-size: 28rpx; color: #666; }
  &.primary { background: #1B4B8C; border-color: #1B4B8C; text { color: #fff; } }
  &:active { opacity: 0.8; }
}
</style>