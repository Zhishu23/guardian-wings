<template>
  <view class="page">
    <view class="nav-bar">
      <view @click="goBack"><text class="back">‹ 返回</text></view>
      <text class="title">举报详情</text>
      <view style="width:80rpx"/>
    </view>

    <view v-if="loading" class="loading"><text>加载中...</text></view>

    <view v-else-if="report._id">
      <view class="card">
        <view class="row"><text class="lbl">举报类型</text><text class="val">{{ typeLabel }}</text></view>
        <view class="row"><text class="lbl">举报时间</text><text class="val">{{ formatTime(report.create_time) }}</text></view>
        <view class="row"><text class="lbl">事发地点</text><text class="val">{{ report.location && report.location.address }}</text></view>
        <view class="row"><text class="lbl">当前状态</text><view class="status-tag" :class="'s' + report.status"><text>{{ statusLabel }}</text></view></view>
      </view>

      <view class="card">
        <text class="card-title">情况描述</text>
        <text class="desc">{{ report.description }}</text>
      </view>

      <view class="card" v-if="report.images && report.images.length > 0">
        <text class="card-title">现场图片</text>
        <scroll-view scroll-x class="img-scroll">
          <view class="img-list">
            <image v-for="(img, i) in report.images" :key="i" :src="img" mode="aspectFill" class="report-img" @click="previewImg(i)"/>
          </view>
        </scroll-view>
      </view>

      <view class="card" v-if="report.remark">
        <text class="card-title">处理备注</text>
        <text class="desc">{{ report.remark }}</text>
      </view>

      <!-- 处理按钮（待处理状态才显示）-->
      <view class="bottom-bar" v-if="report.status === 0">
        <view class="btn btn-reject" @click="handleReport(2)"><text>驳回</text></view>
        <view class="btn btn-approve" @click="handleReport(1)"><text>标记已处理</text></view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return { loading: true, reportId: '', report: {}, remark: '' }
  },

  computed: {
    typeLabel() {
      const map = { illegal_hunting: '非法捕猎', habitat_destruction: '栖息地破坏', illegal_trade: '非法交易', other: '其他' }
      return map[this.report.type] || this.report.type
    },
    statusLabel() {
      return ['待处理', '已处理', '已驳回'][this.report.status] || '未知'
    }
  },

  onLoad(options) {
    this.reportId = options.id
    this.loadDetail()
  },

  methods: {
    async loadDetail() {
      this.loading = true
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-report',
          data: { action: 'getReportDetail', params: { reportId: this.reportId } }
        })
        if (res.result.code === 0) this.report = res.result.data
      } catch (e) {} finally { this.loading = false }
    },

    async handleReport(status) {
      uni.showModal({
        title: status === 1 ? '标记已处理' : '驳回举报',
        content: '请输入备注',
        editable: true,
        success: async res => {
          if (!res.confirm) return
          const policeInfo = uni.getStorageSync('gw_police_info') || {}
          await uniCloud.callFunction({
            name: 'gw-report',
            data: {
              action: 'updateReportStatus',
              params: { reportId: this.reportId, status, remark: res.content || '', handler_id: policeInfo.officer_id || '' }
            }
          })
          uni.showToast({ title: status === 1 ? '已标记处理' : '已驳回', icon: 'success' })
          setTimeout(() => this.loadDetail(), 800)
        }
      })
    },

    previewImg(index) {
      uni.previewImage({ urls: this.report.images, current: index })
    },

    formatTime(ts) {
      if (!ts) return ''
      const d = new Date(ts)
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
    },
    goBack() { uni.navigateBack() }
  }
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; background: #0F172A; padding-bottom: 160rpx; }
.nav-bar { display: flex; align-items: center; justify-content: space-between; padding: 88rpx 32rpx 20rpx; }
.back { font-size: 30rpx; color: #60A5FA; }
.title { font-size: 34rpx; color: #F1F5F9; font-weight: 600; }
.loading { display: flex; align-items: center; justify-content: center; height: 300rpx; text { color: #94A3B8; } }
.card { background: #1E293B; margin: 16rpx 24rpx; border-radius: 16rpx; padding: 28rpx; }
.card-title { display: block; font-size: 28rpx; font-weight: 600; color: #94A3B8; margin-bottom: 20rpx; }
.row { display: flex; justify-content: space-between; align-items: center; padding: 12rpx 0; border-bottom: 1rpx solid rgba(255,255,255,0.06); &:last-child { border-bottom: none; } }
.lbl { font-size: 26rpx; color: #64748B; }
.val { font-size: 26rpx; color: #E2E8F0; max-width: 70%; text-align: right; }
.desc { font-size: 28rpx; color: #CBD5E1; line-height: 1.7; }
.status-tag { padding: 6rpx 20rpx; border-radius: 8rpx; }
.s0 { background: rgba(245,158,11,0.15); text { color: #F59E0B; font-size: 22rpx; } }
.s1 { background: rgba(16,185,129,0.15); text { color: #10B981; font-size: 22rpx; } }
.s2 { background: rgba(107,114,128,0.15); text { color: #9CA3AF; font-size: 22rpx; } }
.img-scroll { width: 100%; }
.img-list { display: flex; gap: 16rpx; }
.report-img { width: 200rpx; height: 200rpx; border-radius: 12rpx; flex-shrink: 0; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #1E293B; padding: 24rpx 32rpx; display: flex; gap: 20rpx; }
.btn { flex: 1; height: 88rpx; border-radius: 12rpx; display: flex; align-items: center; justify-content: center; text { font-size: 30rpx; font-weight: 600; } }
.btn-reject  { background: rgba(239,68,68,0.15); border: 2rpx solid rgba(239,68,68,0.3); text { color: #EF4444; } }
.btn-approve { background: #2563EB; text { color: #FFFFFF; } }
</style>