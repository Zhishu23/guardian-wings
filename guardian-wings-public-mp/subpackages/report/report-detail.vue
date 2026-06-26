<template>
  <view class="report-detail-page">
    <view class="top-nav">
      <view class="back-btn" @click="goBack">
        <text>‹</text>
      </view>
      <text class="nav-title">举报详情</text>
      <view class="nav-space"></view>
    </view>

    <view v-if="loading" class="state-box">
      <text>加载中...</text>
    </view>

    <view v-else-if="!report._id" class="state-box">
      <text>{{ errorText || '暂无举报详情' }}</text>
    </view>

    <scroll-view v-else scroll-y class="content-scroll">
      <view class="summary-section">
        <view class="summary-head">
          <text class="type-text">{{ getTypeLabel(report.type) }}</text>
          <text class="status-tag" :class="'status-' + report.status">{{ getStatusLabel(report.status) }}</text>
        </view>
        <text class="report-id">{{ formatReportId(report._id) }}</text>
      </view>

      <view class="info-section">
        <text class="section-title">事件信息</text>
        <view class="info-row">
          <text class="label">发生地点</text>
          <text class="value">{{ locationText }}</text>
        </view>
        <view class="info-row">
          <text class="label">发生时间</text>
          <text class="value">{{ formatTime(report.time) }}</text>
        </view>
        <view class="info-row">
          <text class="label">提交时间</text>
          <text class="value">{{ formatTime(report.create_time) }}</text>
        </view>
      </view>

      <view class="info-section">
        <text class="section-title">详细描述</text>
        <text class="description">{{ report.description || '暂无描述' }}</text>
      </view>

      <view v-if="report.images && report.images.length" class="info-section">
        <text class="section-title">现场图片</text>
        <view class="image-grid">
          <image
            v-for="(img, index) in report.images"
            :key="index"
            class="report-image"
            :src="img"
            mode="aspectFill"
            @click="previewImage(index)"
          />
        </view>
      </view>

      <view v-if="report.remark" class="info-section">
        <text class="section-title">处理反馈</text>
        <text class="description">{{ report.remark }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      reportId: '',
      loading: false,
      errorText: '',
      report: {}
    }
  },

  computed: {
    locationText() {
      const loc = this.report.location || {}
      return loc.address || loc.name || '未知地点'
    }
  },

  onLoad(options) {
    this.reportId = options && options.id ? options.id : ''
    this.loadDetail()
  },

  methods: {
    async loadDetail() {
      const uid = this.$store.state.user.uid
      if (!this.reportId) {
        this.errorText = '缺少举报编号'
        return
      }
      if (!uid) {
        uni.showModal({
          title: '未登录',
          content: '请先登录后查看举报详情',
          confirmText: '去登录',
          success: res => {
            if (res.confirm) uni.navigateTo({ url: '/pages/login/public-login' })
          }
        })
        this.errorText = '请先登录'
        return
      }

      this.loading = true
      this.errorText = ''
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-public-report',
          data: {
            action: 'getReportDetail',
            params: { reportId: this.reportId, user_id: uid }
          }
        })

        if (res.result && res.result.code === 0) {
          this.report = res.result.data || {}
        } else {
          this.errorText = (res.result && res.result.msg) || '加载失败'
        }
      } catch (e) {
        this.errorText = '网络异常，请稍后重试'
      } finally {
        this.loading = false
      }
    },

    previewImage(index) {
      const urls = this.report.images || []
      uni.previewImage({
        current: urls[index],
        urls
      })
    },

    getTypeLabel(type) {
      const map = {
        illegal_hunting: '非法捕鸟',
        illegal_trade: '非法贩卖',
        habitat_destruction: '栖息地破坏',
        other: '其他违法'
      }
      return map[type] || '未知类型'
    },

    getStatusLabel(status) {
      return ['待处理', '已处理', '已驳回'][status] || '未知'
    },

    formatReportId(id) {
      if (!id) return ''
      return 'GW' + String(id).slice(-8).toUpperCase()
    },

    formatTime(ts) {
      if (!ts) return '未知'
      const d = new Date(ts)
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },

    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped lang="scss">
.report-detail-page {
  min-height: 100vh;
  background: #F5F7FA;
}

.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 88rpx 32rpx 24rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #EEF2F7;
}

.back-btn,
.nav-space {
  width: 64rpx;
  height: 64rpx;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1F2937;
  font-size: 56rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #111827;
}

.content-scroll {
  height: calc(100vh - 176rpx);
}

.state-box {
  padding: 160rpx 32rpx;
  text-align: center;
  color: #6B7280;
  font-size: 28rpx;
}

.summary-section,
.info-section {
  margin: 24rpx 24rpx 0;
  padding: 28rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
}

.summary-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.type-text {
  color: #111827;
  font-size: 36rpx;
  font-weight: 700;
}

.report-id {
  display: block;
  margin-top: 16rpx;
  color: #6B7280;
  font-size: 24rpx;
}

.status-tag {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  background: #F3F4F6;
  color: #6B7280;
}

.status-0 {
  background: #FEF3C7;
  color: #D97706;
}

.status-1 {
  background: #DCFCE7;
  color: #16A34A;
}

.status-2 {
  background: #FEE2E2;
  color: #DC2626;
}

.section-title {
  display: block;
  margin-bottom: 20rpx;
  color: #111827;
  font-size: 30rpx;
  font-weight: 700;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #F3F4F6;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  flex: 0 0 150rpx;
  color: #6B7280;
  font-size: 26rpx;
}

.value {
  flex: 1;
  color: #1F2937;
  font-size: 26rpx;
  text-align: right;
}

.description {
  color: #374151;
  font-size: 28rpx;
  line-height: 1.8;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14rpx;
}

.report-image {
  width: 100%;
  height: 190rpx;
  border-radius: 12rpx;
  background: #F3F4F6;
}
</style>
