<template>
  <view class="emergency-page">
    <!-- 顶部导航 -->
    <view class="top-nav">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#FFFFFF"/>
        </svg>
      </view>
      <text class="nav-title">紧急救助</text>
      <view style="width:72rpx" />
    </view>

    <!-- 紧急提示横幅 -->
    <view class="alert-banner">
      <text class="alert-icon">🚨</text>
      <text class="alert-text">发现受伤野生鸟类？请保持冷静，立即拨打救助热线</text>
    </view>

    <!-- 救助热线卡片 -->
    <view class="section-title-row">
      <text class="section-title">救助热线</text>
    </view>

    <view class="hotlines-list">
      <view
        v-for="hotline in hotlines"
        :key="hotline.number"
        class="hotline-card"
        @click="callPhone(hotline.number)"
      >
        <view class="hotline-icon-wrap" :style="{ background: hotline.bgColor }">
          <text class="hotline-icon">{{ hotline.icon }}</text>
        </view>
        <view class="hotline-info">
          <text class="hotline-name">{{ hotline.name }}</text>
          <text class="hotline-desc">{{ hotline.desc }}</text>
          <text class="hotline-number">{{ hotline.number }}</text>
        </view>
        <view class="call-btn" :style="{ background: hotline.color }">
          <text class="call-text">拨打</text>
        </view>
      </view>
    </view>

    <!-- 处理指南 -->
    <view class="section-title-row" style="margin-top:40rpx">
      <text class="section-title">受伤鸟类处理指南</text>
    </view>

    <view class="guide-list">
      <view
        v-for="(step, idx) in guideSteps"
        :key="idx"
        class="guide-card"
        @click="toggleGuide(idx)"
      >
        <view class="guide-header">
          <view class="step-num" :style="{ background: step.color }">
            <text>{{ idx + 1 }}</text>
          </view>
          <view class="guide-title-wrap">
            <text class="guide-title">{{ step.title }}</text>
            <text class="guide-sub">{{ step.sub }}</text>
          </view>
          <view class="guide-expand" :class="{ expanded: expandedGuides.includes(idx) }">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10l5 5 5-5z" fill="#9CA3AF"/>
            </svg>
          </view>
        </view>
        <view class="guide-content" v-if="expandedGuides.includes(idx)">
          <view v-for="(point, pi) in step.points" :key="pi" class="guide-point">
            <text class="point-dot">•</text>
            <text class="point-text">{{ point }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 注意事项 -->
    <view class="warning-card">
      <view class="warning-header">
        <text class="warning-icon">⚠️</text>
        <text class="warning-title">重要提示</text>
      </view>
      <view class="warning-list">
        <view v-for="(w, i) in warnings" :key="i" class="warning-item">
          <text class="warning-dot">•</text>
          <text class="warning-text">{{ w }}</text>
        </view>
      </view>
    </view>

    <!-- 举报入口 -->
    <view class="report-entry" @click="goReport">
      <view class="report-entry-left">
        <text class="report-entry-icon">📢</text>
        <view>
          <text class="report-entry-title">发现违法行为？</text>
          <text class="report-entry-sub">立即举报，保护野生动物</text>
        </view>
      </view>
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:40rpx;height:40rpx;flex-shrink:0">
        <path d="M9 6l6 6-6 6" stroke="#1B4B8C" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      expandedGuides: [0],  // 默认展开第一步
      hotlines: [
        {
          name:    '野生动物保护热线',
          desc:    '国家林业和草原局',
          number:  '12119',
          icon:    '🌿',
          color:   '#2D8F47',
          bgColor: 'rgba(45,143,71,0.1)'
        },
        {
          name:    '野生动物救助中心',
          desc:    '受伤野生动物救治',
          number:  '12345',
          icon:    '🏥',
          color:   '#2563EB',
          bgColor: 'rgba(37,99,235,0.1)'
        },
        {
          name:    '环保投诉热线',
          desc:    '生态环境问题举报',
          number:  '12369',
          icon:    '♻️',
          color:   '#10B981',
          bgColor: 'rgba(16,185,129,0.1)'
        },
        {
          name:    '公安报警',
          desc:    '非法捕猎等刑事案件',
          number:  '110',
          icon:    '👮',
          color:   '#DC2626',
          bgColor: 'rgba(220,38,38,0.1)'
        }
      ],
      guideSteps: [
        {
          title:  '保持距离，观察状态',
          sub:    '不要急于接近',
          color:  '#3B82F6',
          points: [
            '保持至少2-3米距离，避免让鸟儿更加紧张',
            '观察鸟儿是否能自行移动，是否有明显外伤',
            '判断鸟儿是幼鸟（羽毛不全）还是成鸟',
            '如鸟儿能飞但飞行异常，可能翅膀受伤'
          ]
        },
        {
          title:  '准备容器，安全捕捉',
          sub:    '避免二次伤害',
          color:  '#F59E0B',
          points: [
            '准备纸箱或塑料容器，底部铺毛巾或报纸',
            '戴上手套（或用毛巾包裹双手）再接触鸟',
            '用毛巾轻轻覆盖鸟儿全身，避免挣扎受伤',
            '将鸟放入容器后立即盖上，保留通气孔'
          ]
        },
        {
          title:  '安置保温，等待救援',
          sub:    '提供临时庇护',
          color:  '#10B981',
          points: [
            '将容器放在温暖、安静、光线昏暗的地方',
            '温度保持在25-30°C（可用热水袋隔布保温）',
            '不要强迫喂水喂食，以免呛水',
            '减少打开容器查看的次数，降低应激反应'
          ]
        },
        {
          title:  '联系专业机构',
          sub:    '让专业人员处理',
          color:  '#8B5CF6',
          points: [
            '拨打上方救助热线，告知鸟的种类和伤情',
            '告知你的具体位置，等待工作人员上门',
            '或将鸟送往最近的野生动物救助站',
            '运送途中保持容器稳定，减少颠簸'
          ]
        }
      ],
      warnings: [
        '禁止将野生鸟类带回家饲养，这是违法行为',
        '不要尝试自行治疗骨折或内伤，以免加重伤情',
        '不要给鸟喂人类食物（面包、饼干等）',
        '如发现大量鸟类集体异常，可能为传染病，切勿直接接触，立即报告',
        '在法律规定中，非法持有保护动物最高可判处5年有期徒刑'
      ]
    }
  },

  methods: {
    callPhone(number) {
      uni.showModal({
        title:       '拨打电话',
        content:     `确认拨打 ${number} 吗？`,
        confirmText: '拨打',
        success: res => {
          if (res.confirm) {
            uni.makePhoneCall({
              phoneNumber: number,
              fail: () => uni.showToast({ title: '拨号失败', icon: 'none' })
            })
          }
        }
      })
    },

    toggleGuide(idx) {
      const i = this.expandedGuides.indexOf(idx)
      if (i >= 0) {
        this.expandedGuides.splice(i, 1)
      } else {
        this.expandedGuides.push(idx)
      }
    },

    goReport() {
      uni.switchTab({ url: '/pages/public/report/report' })
        .catch(() => uni.navigateTo({ url: '/pages/public/report/report' }))
    },

    goBack() { uni.navigateBack() }
  }
}
</script>

<style scoped lang="scss">
.emergency-page { min-height: 100vh; background: #F5F7FA; padding-bottom: 60rpx; }
.top-nav { display: flex; align-items: center; justify-content: space-between; padding: 88rpx 32rpx 24rpx; background: linear-gradient(135deg, #DC2626 0%, #EF4444 100%); }
.back-btn { width: 72rpx; height: 72rpx; display: flex; align-items: center; justify-content: center; }
.back-btn svg { width: 48rpx; height: 48rpx; }
.nav-title { font-size: 34rpx; font-weight: 600; color: #FFFFFF; }
.alert-banner { display: flex; align-items: center; gap: 16rpx; margin: 24rpx 24rpx 0; padding: 24rpx; background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%); border-radius: 16rpx; border-left: 6rpx solid #DC2626; }
.alert-icon { font-size: 40rpx; flex-shrink: 0; }
.alert-text { flex: 1; font-size: 26rpx; color: #991B1B; line-height: 1.6; font-weight: 500; }
.section-title-row { padding: 32rpx 24rpx 16rpx; }
.section-title { font-size: 32rpx; font-weight: 700; color: #1F2937; }
.hotlines-list { padding: 0 24rpx; display: flex; flex-direction: column; gap: 16rpx; }
.hotline-card { display: flex; align-items: center; gap: 20rpx; background: #FFFFFF; border-radius: 16rpx; padding: 24rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); }
.hotline-icon-wrap { width: 96rpx; height: 96rpx; border-radius: 24rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.hotline-icon { font-size: 48rpx; }
.hotline-info { flex: 1; }
.hotline-name { display: block; font-size: 30rpx; font-weight: 600; color: #1F2937; margin-bottom: 6rpx; }
.hotline-desc { display: block; font-size: 22rpx; color: #9CA3AF; margin-bottom: 8rpx; }
.hotline-number { display: block; font-size: 32rpx; font-weight: 700; color: #1B4B8C; }
.call-btn { padding: 16rpx 32rpx; border-radius: 12rpx; flex-shrink: 0; }
.call-text { font-size: 28rpx; color: #FFFFFF; font-weight: 600; }
.guide-list { padding: 0 24rpx; display: flex; flex-direction: column; gap: 16rpx; }
.guide-card { background: #FFFFFF; border-radius: 16rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.guide-header { display: flex; align-items: center; gap: 20rpx; padding: 24rpx; }
.step-num { width: 64rpx; height: 64rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; text { font-size: 28rpx; color: #FFFFFF; font-weight: 700; } }
.guide-title-wrap { flex: 1; }
.guide-title { display: block; font-size: 28rpx; font-weight: 600; color: #1F2937; margin-bottom: 6rpx; }
.guide-sub { font-size: 22rpx; color: #9CA3AF; }
.guide-expand { width: 48rpx; height: 48rpx; display: flex; align-items: center; justify-content: center; transition: transform 0.3s; svg { width: 40rpx; height: 40rpx; } &.expanded { transform: rotate(180deg); } }
.guide-content { padding: 0 24rpx 24rpx 108rpx; border-top: 1rpx solid #F3F4F6; }
.guide-point { display: flex; gap: 12rpx; margin-top: 16rpx; }
.point-dot { font-size: 28rpx; color: #6B7280; flex-shrink: 0; }
.point-text { flex: 1; font-size: 26rpx; color: #4B5563; line-height: 1.7; }
.warning-card { margin: 40rpx 24rpx 0; background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); border-radius: 16rpx; padding: 28rpx; border: 2rpx solid #FDE68A; }
.warning-header { display: flex; align-items: center; gap: 12rpx; margin-bottom: 20rpx; }
.warning-icon { font-size: 36rpx; }
.warning-title { font-size: 30rpx; font-weight: 600; color: #92400E; }
.warning-item { display: flex; gap: 12rpx; margin-bottom: 16rpx; &:last-child { margin-bottom: 0; } }
.warning-dot { font-size: 28rpx; color: #D97706; flex-shrink: 0; }
.warning-text { flex: 1; font-size: 26rpx; color: #78350F; line-height: 1.6; }
.report-entry { display: flex; align-items: center; justify-content: space-between; margin: 24rpx 24rpx 0; padding: 28rpx; background: #FFFFFF; border-radius: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); }
.report-entry-left { display: flex; align-items: center; gap: 20rpx; }
.report-entry-icon { font-size: 48rpx; }
.report-entry-title { display: block; font-size: 30rpx; font-weight: 600; color: #1F2937; margin-bottom: 6rpx; }
.report-entry-sub { font-size: 24rpx; color: #9CA3AF; }
</style>