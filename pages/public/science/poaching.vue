<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="top-nav">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </view>
      <text class="nav-title">打击捕猎</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 英雄区 -->
    <view class="hero-section">
      <view class="hero-bg">
        <view class="hero-circle c1"></view>
        <view class="hero-circle c2"></view>
      </view>
      <view class="hero-icon">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
          <path d="M28 28L52 52M52 28L28 52" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
          <circle cx="40" cy="40" r="14" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
        </svg>
      </view>
      <text class="hero-title">打击捕猎</text>
      <text class="hero-subtitle">依法严厉打击，为候鸟守护一片安全的天空</text>
      <view class="hero-tag">
        <text>违法必究 · 严惩不贷</text>
      </view>
    </view>

    <view class="content-wrap">

      <!-- 警示横幅 -->
      <view class="alert-banner">
        <text class="alert-icon">⚠️</text>
        <view class="alert-content">
          <text class="alert-title">非法捕猎候鸟属于违法犯罪行为</text>
          <text class="alert-sub">最高可处10年以上有期徒刑并处罚金</text>
        </view>
      </view>

      <!-- 法律基础 -->
      <view class="section-block">
        <view class="block-header">
          <view class="block-dot red"></view>
          <text class="block-title">法律依据</text>
        </view>

        <view class="law-card" v-for="(law, i) in laws" :key="i">
          <view class="law-tag">{{ law.tag }}</view>
          <text class="law-title">{{ law.title }}</text>
          <text class="law-content">{{ law.content }}</text>
        </view>
      </view>

      <!-- 常见违法行为 -->
      <view class="section-block">
        <view class="block-header">
          <view class="block-dot red"></view>
          <text class="block-title">常见违法捕猎方式</text>
        </view>
        <text class="block-tip">以下行为均属违法，一经发现请立即举报：</text>

        <view class="illegal-list">
          <view class="illegal-item" v-for="(item, i) in illegalActs" :key="i">
            <view class="illegal-no">
              <text class="no-text">{{ String(i+1).padStart(2,'0') }}</text>
            </view>
            <view class="illegal-content">
              <text class="illegal-name">{{ item.name }}</text>
              <text class="illegal-desc">{{ item.desc }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 重点保护鸟类 -->
      <view class="section-block">
        <view class="block-header">
          <view class="block-dot red"></view>
          <text class="block-title">国家重点保护候鸟（部分）</text>
        </view>

        <view class="bird-grid">
          <view class="bird-chip" v-for="(bird, i) in protectedBirds" :key="i" :class="bird.level">
            <text class="bird-level-dot"></text>
            <text class="bird-name">{{ bird.name }}</text>
            <text class="bird-level-tag">{{ bird.level === 'first' ? '一级' : '二级' }}</text>
          </view>
        </view>
        <view class="bird-legend">
          <view class="legend-item">
            <view class="legend-dot first-dot"></view>
            <text class="legend-text">国家一级保护动物</text>
          </view>
          <view class="legend-item">
            <view class="legend-dot second-dot"></view>
            <text class="legend-text">国家二级保护动物</text>
          </view>
        </view>
      </view>

      <!-- 举报流程 -->
      <view class="section-block">
        <view class="block-header">
          <view class="block-dot red"></view>
          <text class="block-title">举报流程</text>
        </view>

        <view class="flow-list">
          <view class="flow-item" v-for="(step, i) in reportSteps" :key="i">
            <view class="flow-left">
              <view class="flow-circle">
                <text class="flow-num">{{ i + 1 }}</text>
              </view>
              <view class="flow-line" v-if="i < reportSteps.length - 1"></view>
            </view>
            <view class="flow-right">
              <text class="flow-title">{{ step.title }}</text>
              <text class="flow-desc">{{ step.desc }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 举报按钮 -->
      <view class="report-card">
        <view class="report-card-top">
          <text class="report-card-emoji">🚨</text>
          <view>
            <text class="report-card-title">发现违法行为？</text>
            <text class="report-card-sub">证据保全后立即举报，保护你的个人信息</text>
          </view>
        </view>
        <view class="report-btn" @click="goReport">
          <text class="report-btn-text">立即举报</text>
          <svg viewBox="0 0 24 24" fill="none" style="width:32rpx;height:32rpx;">
            <path d="M5 12H19M13 6L19 12L13 18" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </view>
        <text class="report-anonymous">举报信息严格保密，支持匿名举报</text>
      </view>

    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      laws: [
        {
          tag: '刑法第341条',
          title: '非法猎捕、杀害珍贵、濒危野生动物罪',
          content: '非法猎捕、杀害国家重点保护的珍贵、濒危野生动物的，处五年以下有期徒刑或者拘役，并处罚金；情节严重的，处五年以上十年以下有期徒刑，并处罚金；情节特别严重的，处十年以上有期徒刑，并处罚金或者没收财产。'
        },
        {
          tag: '野生动物保护法',
          title: '第44条 非法猎捕行政处罚',
          content: '违反本法规定，在自然保护区、禁猎区、禁猎期猎捕野生动物，或者使用禁止使用的猎捕工具、方法猎捕野生动物的，由野生动物保护主管部门没收猎获物、猎捕工具，吊销特许猎捕证，并处猎获物价值一倍以上十倍以下的罚款。'
        }
      ],
      illegalActs: [
        { name: '网捕', desc: '架设粘网、撒网等工具大规模捕捉候鸟，是目前最常见的违法捕猎方式之一。' },
        { name: '毒杀', desc: '在水源、食物中投放毒饵，可能同时造成多种野生动物集体死亡，危害极大。' },
        { name: '电击', desc: '使用电击装置，在候鸟栖息地或觅食区域非法捕杀，属于严重违法行为。' },
        { name: '非法交易', desc: '收购、出售、运输受保护候鸟及其制品，包括网络平台销售均属违法。' },
        { name: '餐饮消费', desc: '餐厅提供、个人食用受保护野生鸟类，消费者同样需要承担法律责任。' },
      ],
      protectedBirds: [
        { name: '丹顶鹤', level: 'first' },
        { name: '白鹤', level: 'first' },
        { name: '东方白鹳', level: 'first' },
        { name: '遗鸥', level: 'first' },
        { name: '黑脸琵鹭', level: 'first' },
        { name: '大天鹅', level: 'second' },
        { name: '灰鹤', level: 'second' },
        { name: '鸳鸯', level: 'second' },
        { name: '斑头雁', level: 'second' },
        { name: '红隼', level: 'second' },
      ],
      reportSteps: [
        { title: '保持安全距离', desc: '不要正面阻止违法者，确保自身安全，远距离观察记录。' },
        { title: '拍照/录像取证', desc: '拍摄违法现场、人员、车牌等关键信息作为证据。' },
        { title: '记录地点时间', desc: '记录准确的发生地点、时间及具体违法行为描述。' },
        { title: '通过App上传举报', desc: '打开翼路平安，填写举报信息，上传证据材料。' },
        { title: '等待处理反馈', desc: '平台将在24小时内响应，案件处理进度可在"我的举报"中查看。' },
      ]
    }
  },
  methods: {
    goBack() { uni.navigateBack() },
    goReport() { uni.switchTab({ url: '/pages/public/report/report' }) }
  }
}
</script>

<style scoped lang="scss">
.page { background: #F2F6FC; min-height: 100vh; padding-bottom: 60rpx; }

.top-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24rpx 32rpx;
  background: linear-gradient(135deg, #8B1A1A 0%, #C0392B 50%, #E74C3C 100%);
  position: sticky; top: 0; z-index: 100;
}
.back-btn {
  width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.2); border-radius: 12rpx;
}
.back-btn svg { width: 36rpx; height: 36rpx; }
.nav-title { font-size: 32rpx; font-weight: bold; color: #FFFFFF; }
.nav-placeholder { width: 56rpx; }

.hero-section {
  background: linear-gradient(160deg, #8B1A1A 0%, #C0392B 40%, #E74C3C 100%);
  padding: 60rpx 40rpx 80rpx;
  display: flex; flex-direction: column; align-items: center;
  position: relative; overflow: hidden;
}
.hero-bg { position: absolute; inset: 0; }
.hero-circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.06); }
.c1 { width: 300rpx; height: 300rpx; top: -80rpx; right: -60rpx; }
.c2 { width: 200rpx; height: 200rpx; bottom: 0; left: -40rpx; }

.hero-icon {
  width: 140rpx; height: 140rpx; background: rgba(255,255,255,0.15);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  margin-bottom: 32rpx; border: 2rpx solid rgba(255,255,255,0.3);
}
.hero-icon svg { width: 90rpx; height: 90rpx; }
.hero-title { font-size: 52rpx; font-weight: bold; color: #FFFFFF; margin-bottom: 16rpx; }
.hero-subtitle { font-size: 25rpx; color: rgba(255,255,255,0.85); margin-bottom: 32rpx; text-align: center; line-height: 1.5; }
.hero-tag {
  background: rgba(255,255,255,0.2); border: 1rpx solid rgba(255,255,255,0.4);
  border-radius: 40rpx; padding: 10rpx 32rpx;
}
.hero-tag text { font-size: 22rpx; color: #FFFFFF; }

.content-wrap { padding: 32rpx; margin-top: -20rpx; }

/* 警示横幅 */
.alert-banner {
  background: linear-gradient(135deg, #FEF2F2, #FEE2E2);
  border: 1rpx solid #FECACA; border-radius: 16rpx;
  padding: 28rpx; margin-bottom: 28rpx;
  display: flex; align-items: center; gap: 20rpx;
  border-left: 6rpx solid #EF4444;
}
.alert-icon { font-size: 44rpx; }
.alert-title { font-size: 28rpx; font-weight: bold; color: #991B1B; display: block; margin-bottom: 6rpx; }
.alert-sub { font-size: 23rpx; color: #B91C1C; }

/* 通用块 */
.section-block {
  background: #FFFFFF; border-radius: 20rpx;
  padding: 32rpx; margin-bottom: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}
.block-header { display: flex; align-items: center; gap: 16rpx; margin-bottom: 24rpx; }
.block-dot { width: 10rpx; height: 10rpx; border-radius: 50%; }
.block-dot.red { background: #F56C6C; box-shadow: 0 0 0 4rpx rgba(245,108,108,0.2); }
.block-title { font-size: 30rpx; font-weight: bold; color: #303133; }
.block-tip { font-size: 24rpx; color: #909399; margin-bottom: 20rpx; display: block; }

/* 法律卡片 */
.law-card {
  background: #FFF8F8; border: 1rpx solid #FECACA;
  border-radius: 12rpx; padding: 24rpx; margin-bottom: 16rpx;
}
.law-card:last-child { margin-bottom: 0; }
.law-tag {
  display: inline-block; background: #EF4444; color: #FFFFFF;
  font-size: 20rpx; padding: 6rpx 16rpx; border-radius: 8rpx; margin-bottom: 12rpx;
}
.law-title { font-size: 26rpx; font-weight: 600; color: #303133; display: block; margin-bottom: 10rpx; }
.law-content { font-size: 23rpx; color: #606266; line-height: 1.8; }

/* 违法行为列表 */
.illegal-list { }
.illegal-item {
  display: flex; gap: 20rpx; padding: 20rpx 0;
  border-bottom: 1rpx solid #F2F6FC;
}
.illegal-item:last-child { border-bottom: none; }
.illegal-no {
  width: 56rpx; height: 56rpx; border-radius: 12rpx;
  background: rgba(239,68,68,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.no-text { font-size: 22rpx; font-weight: bold; color: #EF4444; }
.illegal-name { font-size: 27rpx; font-weight: 600; color: #303133; display: block; margin-bottom: 8rpx; }
.illegal-desc { font-size: 23rpx; color: #606266; line-height: 1.7; }

/* 鸟类保护等级 */
.bird-grid { display: flex; flex-wrap: wrap; gap: 12rpx; margin-bottom: 20rpx; }
.bird-chip {
  display: flex; align-items: center; gap: 8rpx;
  padding: 10rpx 20rpx; border-radius: 40rpx;
}
.bird-chip.first { background: rgba(239,68,68,0.08); border: 1rpx solid rgba(239,68,68,0.25); }
.bird-chip.second { background: rgba(245,158,11,0.08); border: 1rpx solid rgba(245,158,11,0.25); }
.bird-name { font-size: 24rpx; color: #303133; }
.bird-level-tag { font-size: 18rpx; }
.bird-chip.first .bird-level-tag { color: #EF4444; }
.bird-chip.second .bird-level-tag { color: #D97706; }
.bird-legend { display: flex; gap: 32rpx; padding-top: 16rpx; border-top: 1rpx solid #F2F6FC; }
.legend-item { display: flex; align-items: center; gap: 10rpx; }
.legend-dot { width: 16rpx; height: 16rpx; border-radius: 50%; }
.first-dot { background: #EF4444; }
.second-dot { background: #D97706; }
.legend-text { font-size: 22rpx; color: #909399; }

/* 举报流程 */
.flow-list { }
.flow-item { display: flex; gap: 16rpx; }
.flow-left { display: flex; flex-direction: column; align-items: center; }
.flow-circle {
  width: 48rpx; height: 48rpx; border-radius: 50%;
  background: linear-gradient(135deg, #C0392B, #E74C3C);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.flow-num { font-size: 22rpx; font-weight: bold; color: #FFFFFF; }
.flow-line { width: 2rpx; flex: 1; background: #FECACA; margin: 6rpx 0; min-height: 30rpx; }
.flow-right { flex: 1; padding-bottom: 28rpx; }
.flow-title { font-size: 27rpx; font-weight: 600; color: #303133; display: block; margin-bottom: 8rpx; line-height: 1.6; }
.flow-desc { font-size: 23rpx; color: #606266; line-height: 1.7; }

/* 举报卡片 */
.report-card {
  background: linear-gradient(135deg, #8B1A1A, #C0392B);
  border-radius: 20rpx; padding: 36rpx;
  box-shadow: 0 8rpx 32rpx rgba(139,26,26,0.3);
}
.report-card-top { display: flex; align-items: center; gap: 20rpx; margin-bottom: 28rpx; }
.report-card-emoji { font-size: 52rpx; }
.report-card-title { font-size: 30rpx; font-weight: bold; color: #FFFFFF; display: block; margin-bottom: 8rpx; }
.report-card-sub { font-size: 23rpx; color: rgba(255,255,255,0.8); }
.report-btn {
  background: rgba(255,255,255,0.2); border: 1rpx solid rgba(255,255,255,0.4);
  border-radius: 12rpx; padding: 24rpx;
  display: flex; align-items: center; justify-content: center; gap: 12rpx;
  margin-bottom: 20rpx;
}
.report-btn-text { font-size: 28rpx; font-weight: 600; color: #FFFFFF; }
.report-anonymous { font-size: 22rpx; color: rgba(255,255,255,0.7); text-align: center; display: block; }
</style>