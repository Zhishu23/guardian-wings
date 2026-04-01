<template>
  <view class="page">
    <view class="nav-bar">
      <view @click="goBack"><text class="back">‹ 返回</text></view>
      <text class="title">任务详情</text>
      <view style="width:80rpx"/>
    </view>

    <view v-if="loading" class="loading"><text>加载中...</text></view>

    <view v-else-if="task._id">
      <view class="card">
        <text class="task-title">{{ task.title }}</text>
        <view class="tags">
          <view class="priority-tag" :class="'p-' + task.priority"><text>{{ priorityLabel }}</text></view>
          <view class="status-tag"   :class="'s-' + task.status"><text>{{ statusLabel }}</text></view>
        </view>
      </view>

      <view class="card">
        <view class="row"><text class="lbl">创建时间</text><text class="val">{{ formatTime(task.create_time) }}</text></view>
        <view class="row"><text class="lbl">截止时间</text><text class="val">{{ formatTime(task.deadline) }}</text></view>
        <view class="row" v-if="task.location"><text class="lbl">任务地点</text><text class="val">{{ task.location }}</text></view>
      </view>

      <view class="card" v-if="task.description">
        <text class="card-title">任务说明</text>
        <text class="desc">{{ task.description }}</text>
      </view>

      <!-- 操作按钮 -->
      <view class="bottom-bar" v-if="task.status === 0 || task.status === 1">
        <view class="btn btn-next" @click="updateStatus">
          <text>{{ task.status === 0 ? '开始执行' : '标记完成' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import taskState from '@/store/taskState.js'
export default {
  data() { return { loading: true, taskId: '', task: {} } },

  computed: {
    priorityLabel() {
      return { low: '低优先级', normal: '普通', high: '高优先级', urgent: '紧急' }[this.task.priority] || ''
    },
    statusLabel() {
      return ['待处理', '进行中', '已完成', '已关闭'][this.task.status] || ''
    }
  },

  onLoad(options) {
    this.taskId = options.id
    this.loadDetail()
  },

  methods: {
    async loadDetail() {
      this.loading = true
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-police',
          data: { action: 'getTaskDetail', params: { taskId: this.taskId } }
        })
        if (res.result.code === 0) this.task = res.result.data
      } catch (e) {} finally { this.loading = false }
    },

    async updateStatus() {
      const nextStatus = this.task.status === 0 ? 1 : 2
      try {
        await taskState.taskActions.updateTaskStatus(this.taskId, nextStatus)
        uni.showToast({ title: nextStatus === 1 ? '已开始执行' : '已标记完成', icon: 'success' })
        setTimeout(() => this.loadDetail(), 800)
      } catch (e) {
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    },

    formatTime(ts) {
      if (!ts) return '未设置'
      const d = new Date(ts)
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
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
.task-title { display: block; font-size: 34rpx; font-weight: 600; color: #F1F5F9; margin-bottom: 20rpx; }
.tags { display: flex; gap: 12rpx; }
.priority-tag, .status-tag { padding: 6rpx 20rpx; border-radius: 8rpx; }
.p-urgent { background: rgba(239,68,68,0.15); text { color: #EF4444; font-size: 22rpx; } }
.p-high   { background: rgba(245,158,11,0.15); text { color: #F59E0B; font-size: 22rpx; } }
.p-normal { background: rgba(59,130,246,0.15);  text { color: #60A5FA; font-size: 22rpx; } }
.p-low    { background: rgba(100,116,139,0.15); text { color: #94A3B8; font-size: 22rpx; } }
.s-0 { background: rgba(245,158,11,0.15); text { color: #F59E0B; font-size: 22rpx; } }
.s-1 { background: rgba(59,130,246,0.15);  text { color: #60A5FA; font-size: 22rpx; } }
.s-2 { background: rgba(16,185,129,0.15);  text { color: #10B981; font-size: 22rpx; } }
.card-title { display: block; font-size: 26rpx; color: #64748B; margin-bottom: 16rpx; font-weight: 600; }
.row { display: flex; justify-content: space-between; padding: 12rpx 0; border-bottom: 1rpx solid rgba(255,255,255,0.06); &:last-child { border: none; } }
.lbl { font-size: 26rpx; color: #64748B; }
.val { font-size: 26rpx; color: #E2E8F0; }
.desc { font-size: 28rpx; color: #CBD5E1; line-height: 1.7; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #1E293B; padding: 24rpx 32rpx; }
.btn { height: 88rpx; border-radius: 12rpx; display: flex; align-items: center; justify-content: center; }
.btn-next { background: #2563EB; text { font-size: 30rpx; color: #FFFFFF; font-weight: 600; } }
</style>