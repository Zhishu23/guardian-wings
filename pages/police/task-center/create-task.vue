<template>
  <view class="page">
    <view class="nav-bar">
      <view @click="goBack"><text class="back">‹ 返回</text></view>
      <text class="title">新建任务</text>
      <view style="width:80rpx"/>
    </view>

    <view class="form-card">
      <view class="form-item">
        <text class="label">任务标题 *</text>
        <input class="input" v-model="form.title" placeholder="请输入任务标题" maxlength="50"/>
      </view>

      <view class="form-item">
        <text class="label">任务说明</text>
        <textarea class="textarea" v-model="form.description" placeholder="请输入任务说明..."/>
      </view>

      <view class="form-item" @click="showPriorityPicker">
        <text class="label">优先级</text>
        <view class="row-right"><text class="select-val">{{ priorityLabel }}</text><text class="arrow">›</text></view>
      </view>

      <view class="form-item">
        <text class="label">任务地点</text>
        <input class="input" v-model="form.location" placeholder="请输入任务地点"/>
      </view>
    </view>

    <view class="submit-btn" @click="submit"><text>创建任务</text></view>
  </view>
</template>

<script>
import taskState from '@/store/taskState.js'
export default {
  data() {
    return {
      form: { title: '', description: '', priority: 'normal', location: '' }
    }
  },

  computed: {
    priorityLabel() {
      return { low: '低优先级', normal: '普通', high: '高优先级', urgent: '紧急' }[this.form.priority]
    }
  },

  methods: {
    showPriorityPicker() {
      uni.showActionSheet({
        itemList: ['低优先级', '普通', '高优先级', '紧急'],
        success: res => {
          this.form.priority = ['low', 'normal', 'high', 'urgent'][res.tapIndex]
        }
      })
    },

    async submit() {
      if (!this.form.title.trim()) return uni.showToast({ title: '请填写任务标题', icon: 'none' })
      uni.showLoading({ title: '创建中...' })
      try {
        const policeInfo = uni.getStorageSync('gw_police_info') || {}
        const res = await uniCloud.callFunction({
          name: 'gw-police',
          data: {
            action: 'createTask',
            params: {
              ...this.form,
              title:       this.form.title.trim(),
              officer_id:  policeInfo.officer_id || '',
              deadline:    Date.now() + 7 * 24 * 60 * 60 * 1000  // 默认7天后
            }
          }
        })
        uni.hideLoading()
        if (res.result.code === 0) {
          uni.showToast({ title: '任务创建成功', icon: 'success' })
          setTimeout(() => uni.navigateBack(), 1000)
        } else {
          uni.showToast({ title: res.result.msg || '创建失败', icon: 'none' })
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '网络异常', icon: 'none' })
      }
    },

    goBack() { uni.navigateBack() }
  }
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; background: #0F172A; }
.nav-bar { display: flex; align-items: center; justify-content: space-between; padding: 88rpx 32rpx 20rpx; }
.back { font-size: 30rpx; color: #60A5FA; }
.title { font-size: 34rpx; color: #F1F5F9; font-weight: 600; }
.form-card { background: #1E293B; margin: 24rpx; border-radius: 16rpx; overflow: hidden; }
.form-item { padding: 28rpx 32rpx; border-bottom: 1rpx solid rgba(255,255,255,0.06); &:last-child { border: none; } }
.label { display: block; font-size: 24rpx; color: #64748B; margin-bottom: 12rpx; }
.input { font-size: 28rpx; color: #F1F5F9; width: 100%; }
.textarea { font-size: 28rpx; color: #F1F5F9; width: 100%; height: 160rpx; }
.row-right { display: flex; align-items: center; gap: 8rpx; }
.select-val { font-size: 28rpx; color: #60A5FA; }
.arrow { font-size: 36rpx; color: #475569; }
.submit-btn { margin: 32rpx 24rpx; height: 96rpx; background: #2563EB; border-radius: 16rpx; display: flex; align-items: center; justify-content: center; text { font-size: 32rpx; color: #FFFFFF; font-weight: 600; } }
</style>