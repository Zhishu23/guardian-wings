<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 顶部导航 -->
    <view class="top-nav">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </view>
      <text class="nav-title">创建任务</text>
      <view style="width:72rpx;"></view>
    </view>

    <scroll-view scroll-y class="form-scroll" :style="{height: scrollHeight + 'px'}" :show-scrollbar="false">

      <!-- 基本信息 -->
      <view class="section-card">
        <view class="section-head">
          <view class="section-line"></view>
          <text class="section-title">基本信息</text>
        </view>

        <view class="field-item">
          <text class="field-label required">任务标题</text>
          <input
            class="field-input"
            v-model="form.title"
            placeholder="请输入任务标题"
            maxlength="50"
          />
          <text class="field-count">{{ form.title.length }}/50</text>
        </view>

        <view class="divider"></view>

        <view class="field-item">
          <text class="field-label required">优先级</text>
          <view class="priority-row">
            <view
              class="priority-chip"
              v-for="p in priorityList"
              :key="p.key"
              :class="{active: form.priority === p.key}"
              :style="form.priority === p.key ? {background: p.bg, borderColor: p.color} : {}"
              @click="form.priority = p.key"
            >
              <text :style="form.priority === p.key ? {color: p.color} : {}">{{ p.label }}</text>
            </view>
          </view>
        </view>

        <view class="divider"></view>

        <view class="field-item">
          <text class="field-label">截止时间</text>
          <picker mode="date" :value="form.dueDate" :start="today" @change="onDateChange">
            <view class="picker-display">
              <text :class="{'placeholder': !form.dueDate}">
                {{ form.dueDate || '选择截止日期（可选）' }}
              </text>
              <svg viewBox="0 0 24 24" fill="none" style="width:28rpx;height:28rpx;flex-shrink:0;">
                <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" fill="#909399"/>
              </svg>
            </view>
          </picker>
          <text v-if="form.dueDate" class="clear-date" @click="form.dueDate = ''">✕ 清除</text>
        </view>
      </view>

      <!-- 任务描述 -->
      <view class="section-card">
        <view class="section-head">
          <view class="section-line"></view>
          <text class="section-title">任务描述</text>
        </view>
        <textarea
          class="desc-textarea"
          v-model="form.description"
          placeholder="请详细描述任务内容、目标和注意事项..."
          maxlength="500"
          :auto-height="false"
        />
        <text class="textarea-count">{{ form.description.length }}/500</text>
      </view>

      <!-- 分配信息 -->
      <view class="section-card">
        <view class="section-head">
          <view class="section-line"></view>
          <text class="section-title">分配信息</text>
        </view>

        <view class="field-item">
          <text class="field-label required">执行人姓名</text>
          <input
            class="field-input"
            v-model="form.assigneeName"
            placeholder="请输入执行警员姓名"
          />
        </view>

        <view class="divider"></view>

        <view class="field-item">
          <text class="field-label required">执行人警号</text>
          <input
            class="field-input"
            v-model="form.assigneeId"
            placeholder="请输入执行警员警号"
          />
        </view>

        <view class="divider"></view>

        <view class="field-item">
          <text class="field-label">关联举报ID</text>
          <input
            class="field-input"
            v-model="form.reportId"
            placeholder="关联举报单号（可选）"
          />
        </view>
      </view>

      <!-- 任务地点 -->
      <view class="section-card">
        <view class="section-head">
          <view class="section-line"></view>
          <text class="section-title">任务地点</text>
        </view>
        <view class="field-item">
          <text class="field-label">地点描述</text>
          <input
            class="field-input"
            v-model="form.locationText"
            placeholder="如：XX湿地保护区北门"
          />
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-wrap">
        <view class="submit-btn" :class="{disabled: submitting}" @click="handleSubmit">
          <svg viewBox="0 0 24 24" fill="none" style="width:36rpx;height:36rpx;margin-right:12rpx;" v-if="!submitting">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#FFFFFF"/>
          </svg>
          <text class="submit-text">{{ submitting ? '提交中...' : '创建任务' }}</text>
        </view>
      </view>

      <view style="height:40rpx;"></view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 0,
      scrollHeight: 0,
      submitting: false,
      today: new Date().toISOString().slice(0, 10),
      form: {
        title:        '',
        priority:     'normal',
        dueDate:      '',
        description:  '',
        assigneeName: '',
        assigneeId:   '',
        reportId:     '',
        locationText: ''
      },
      priorityList: [
        { key: 'low',    label: '低',   color: '#10B981', bg: 'rgba(16,185,129,0.08)'  },
        { key: 'normal', label: '普通', color: '#2563EB', bg: 'rgba(37,99,235,0.08)'   },
        { key: 'high',   label: '紧急', color: '#D97706', bg: 'rgba(217,119,6,0.08)'   },
        { key: 'urgent', label: '特急', color: '#EF4444', bg: 'rgba(239,68,68,0.08)'   }
      ]
    }
  },

  onLoad() {
    const sys = uni.getSystemInfoSync()
    this.statusBarHeight = sys.statusBarHeight
    this.scrollHeight = sys.windowHeight - sys.statusBarHeight - uni.upx2px(88)
  },

  methods: {
    goBack() { uni.navigateBack() },

    onDateChange(e) { this.form.dueDate = e.detail.value },

    async handleSubmit() {
      if (!this.form.title.trim()) {
        uni.showToast({ title: '请输入任务标题', icon: 'none' }); return
      }
      if (!this.form.assigneeName.trim()) {
        uni.showToast({ title: '请输入执行人姓名', icon: 'none' }); return
      }
      if (!this.form.assigneeId.trim()) {
        uni.showToast({ title: '请输入执行人警号', icon: 'none' }); return
      }
      if (this.submitting) return

      this.submitting = true
      uni.showLoading({ title: '创建中...' })

      try {
      
        const raw = uni.getStorageSync('gw_police_info')
        const policeInfo = raw ? JSON.parse(raw) : {}

        const res = await uniCloud.callFunction({
          name: 'gw-police',
          data: {
            action: 'createTask',
            params: {
              title:         this.form.title.trim(),
              description:   this.form.description.trim(),
              assignee_id:   this.form.assigneeId.trim(),
              assignee_name: this.form.assigneeName.trim(),
              priority:      this.form.priority,
              due_date:      this.form.dueDate || null,
              report_id:     this.form.reportId.trim(),
              creator_id:    policeInfo.officer_id || '',
              creator_name:  policeInfo.name || ''
            }
          }
        })

        uni.hideLoading()
        this.submitting = false

        if (res.result.code === 0) {
          uni.showToast({ title: '任务创建成功', icon: 'success' })
          setTimeout(() => { uni.navigateBack() }, 800)
        } else {
          uni.showToast({ title: res.result.msg || '创建失败', icon: 'none' })
        }
      } catch (e) {
        uni.hideLoading()
        this.submitting = false
        uni.showToast({ title: '网络错误，请重试', icon: 'none' })
        console.error('createTask error:', e)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.page {
  background: #F2F6FC;
  min-height: 100vh;
  width: 100%;           
  overflow-x: hidden;    
}

.top-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20rpx 28rpx;
  background: linear-gradient(135deg, #0F2A5C, #1B4B8C);
}
.back-btn {
  width: 72rpx; height: 72rpx; border-radius: 50%;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
}
.back-btn svg { width: 40rpx; height: 40rpx; }
.nav-title { font-size: 32rpx; font-weight: bold; color: #FFFFFF; }

.form-scroll {
  padding: 20rpx 24rpx 0;
  width: 100%;           
  box-sizing: border-box; 
}

.section-card {
  background: #FFFFFF; border-radius: 20rpx;
  padding: 28rpx; margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}
.section-head { display: flex; align-items: center; gap: 14rpx; margin-bottom: 24rpx; }
.section-line { width: 8rpx; height: 30rpx; background: linear-gradient(180deg, #1B4B8C, #2563EB); border-radius: 4rpx; }
.section-title { font-size: 28rpx; font-weight: bold; color: #1A202C; }

.field-item { padding: 8rpx 0; }
.field-label {
  display: block; font-size: 24rpx; color: #909399; margin-bottom: 12rpx;
}
.field-label.required::before {
  content: '* '; color: #EF4444;
}
.field-input {
  width: 100%; font-size: 28rpx; color: #1A202C;
  padding: 16rpx 0; box-sizing: border-box;
}
.field-count { display: block; text-align: right; font-size: 20rpx; color: #C0C4CC; margin-top: 4rpx; }

.divider { height: 1rpx; background: #F2F6FC; margin: 8rpx 0; }

/* 优先级 */
.priority-row { display: flex; gap: 16rpx; flex-wrap: wrap; }
.priority-chip {
  padding: 12rpx 28rpx; border-radius: 30rpx;
  border: 1rpx solid #DCDFE6; background: #FFFFFF;
  font-size: 24rpx; color: #606266;
  transition: all 0.2s;
}
.priority-chip.active { font-weight: 600; }
.priority-chip:active { opacity: 0.8; }

/* 日期选择器 */
.picker-display {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16rpx 0;
}
.picker-display text { font-size: 28rpx; color: #1A202C; flex: 1; }
.picker-display .placeholder { color: #C0C4CC; }
.clear-date { display: block; font-size: 22rpx; color: #909399; margin-top: 8rpx; }

/* 描述文本域 */
.desc-textarea {
  width: 100%; height: 200rpx; font-size: 27rpx; color: #1A202C;
  line-height: 1.8; padding: 0; box-sizing: border-box;
}
.textarea-count { display: block; text-align: right; font-size: 20rpx; color: #C0C4CC; margin-top: 8rpx; }

/* 提交按钮 */
.submit-wrap { padding: 8rpx 0 0; }
.submit-btn {
  background: linear-gradient(135deg, #1B4B8C, #2563EB);
  border-radius: 16rpx; padding: 30rpx;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(27,75,140,0.3);
}
.submit-btn:active { opacity: 0.85; }
.submit-btn.disabled { opacity: 0.6; }
.submit-text { font-size: 30rpx; font-weight: bold; color: #FFFFFF; }
</style>