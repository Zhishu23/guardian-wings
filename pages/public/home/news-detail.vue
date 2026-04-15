<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <svg viewBox="0 0 24 24" style="width:40rpx;height:40rpx;">
          <path d="M15 6l-6 6 6 6" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>
        <text>返回</text>
      </view>
    </view>

    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="article.title" class="article-container">
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

      <image
        v-if="article.cover"
        :src="article.cover"
        class="cover"
        mode="widthFix"
      />

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

      <view class="actions">
        <view class="action-btn" @click="goBack">
          <text>返回</text>
        </view>
        <view v-if="article.link" class="action-btn" @click="openSource">
          <text>原文</text>
        </view>
        <view class="action-btn primary" @click="share">
          <text>分享</text>
        </view>
      </view>
    </view>

    <view v-else class="error-container">
      <text class="error-icon">!</text>
      <text class="error-text">未找到相关新闻内容</text>
      <view class="back-btn" @click="goBack"><text>返回上一页</text></view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      article: {
        title: '',
        source: '',
        time: '',
        tag: '',
        cover: '',
        link: '',
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
        const data = res.result && res.result.data
        const item = Array.isArray(data) ? data[0] : data

        if (!item || !item.title) {
          return
        }

        const rawContent = item.content || ''
        const contentBlocks = Array.isArray(item.contentBlocks)
          ? item.contentBlocks.map(p => String(p || '').trim()).filter(Boolean)
          : []
        const plainText = item.contentText || rawContent || ''
        const htmlMode = /<[a-z][\s\S]*>/i.test(rawContent)
        const paragraphs = contentBlocks.length > 0
          ? contentBlocks
          : (htmlMode ? [] : plainText
            .split('\n')
            .map(p => p.trim())
            .filter(Boolean))

        this.article = {
          title: item.title,
          source: item.source || '',
          time: item.time || this.formatTime(item.publishTime || item.createTime),
          tag: item.tag || '新闻',
          cover: item.cover || '',
          link: item.link || '',
          rawContent,
          paragraphs: paragraphs.length > 0 ? paragraphs : ['暂无详细内容']
        }
      } catch (error) {
        console.error('loadArticle error:', error)
      } finally {
        this.loading = false
      }
    },

    formatTime(ts) {
      if (!ts) return ''
      const date = new Date(ts)
      if (Number.isNaN(date.getTime())) return ''
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },

    goBack() {
      uni.navigateBack({ delta: 1 })
    },

    openSource() {
      if (!this.article.link) return

      // #ifdef H5
      window.open(this.article.link, '_blank')
      // #endif

      // #ifndef H5
      uni.setClipboardData({
        data: this.article.link,
        success: () => {
          uni.showToast({ title: '原文链接已复制', icon: 'none' })
        }
      })
      // #endif
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
}

.nav-back text {
  font-size: 30rpx;
  color: #333;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  gap: 24rpx;
}

.error-icon {
  font-size: 120rpx;
}

.error-text {
  font-size: 28rpx;
  color: #999;
}

.back-btn {
  padding: 20rpx 64rpx;
  background: #1B4B8C;
  border-radius: 12rpx;
}

.back-btn text {
  font-size: 28rpx;
  color: #fff;
}

.article-container {
  padding: 32rpx;
  padding-bottom: 120rpx;
}

.header {
  margin-bottom: 28rpx;
}

.title {
  display: block;
  margin-bottom: 20rpx;
  font-size: 40rpx;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.5;
}

.meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8rpx;
}

.source,
.time {
  font-size: 24rpx;
  color: #999;
}

.divider {
  color: #ddd;
  font-size: 24rpx;
}

.tag {
  padding: 4rpx 16rpx;
  background: rgba(245,158,11,0.1);
  border-radius: 12rpx;
}

.tag text {
  font-size: 22rpx;
  color: #F59E0B;
}

.cover {
  width: 100%;
  border-radius: 16rpx;
  margin: 24rpx 0;
}

.content {
  background: #fffdf9;
  padding: 32rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(92,164,112,0.06);
}

.rich-content {
  font-size: 30rpx;
  line-height: 1.9;
  color: #444;
}

.paragraph {
  display: block;
  margin-bottom: 24rpx;
  font-size: 30rpx;
  color: #444;
  line-height: 1.9;
  text-indent: 2em;
}

.paragraph:last-child {
  margin-bottom: 0;
}

.actions {
  display: flex;
  gap: 24rpx;
  margin-top: 48rpx;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
}

.action-btn text {
  font-size: 28rpx;
  color: #666;
}

.action-btn.primary {
  background: #1B4B8C;
  border-color: #1B4B8C;
}

.action-btn.primary text {
  color: #fff;
}

.action-btn:active {
  opacity: 0.8;
}
</style>
