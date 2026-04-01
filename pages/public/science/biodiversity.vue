<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="top-nav">
      <view class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </view>
      <text class="nav-title">生物多样性</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 英雄区 -->
    <view class="hero-section">
      <view class="hero-bg">
        <view class="hero-circle c1"></view>
        <view class="hero-circle c2"></view>
        <view class="hero-circle c3"></view>
      </view>
      <view class="hero-icon">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
          <path d="M28 50C32 38 40 30 48 26" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
          <path d="M52 30C48 42 40 50 32 54" stroke="rgba(255,255,255,0.7)" stroke-width="3" stroke-linecap="round"/>
          <circle cx="40" cy="40" r="5" fill="#FFFFFF" opacity="0.9"/>
          <circle cx="28" cy="50" r="3" fill="rgba(255,255,255,0.6)"/>
          <circle cx="52" cy="30" r="3" fill="rgba(255,255,255,0.6)"/>
        </svg>
      </view>
      <text class="hero-title">生物多样性</text>
      <text class="hero-subtitle">守护地球上每一个生命的权利</text>
      <view class="hero-tag">
        <text>候鸟保护核心价值</text>
      </view>
    </view>

    <!-- 内容区 -->
    <view class="content-wrap">

      <!-- 引言 -->
      <view class="quote-card">
        <view class="quote-mark">"</view>
        <text class="quote-text">候鸟是生物多样性的晴雨表，它们的迁徙路线跨越数千公里，将不同生态系统紧密相连。保护候鸟，就是守护整个地球的生命网络。</text>
        <text class="quote-author">—— 国家林业和草原局</text>
      </view>

      <!-- 数据卡片组 -->
      <view class="stats-row">
        <view class="stat-card">
          <text class="stat-num">1400<text class="stat-unit">+</text></text>
          <text class="stat-label">中国鸟类种数</text>
        </view>
        <view class="stat-card highlight">
          <text class="stat-num">240<text class="stat-unit">+</text></text>
          <text class="stat-label">候鸟迁徙种类</text>
        </view>
        <view class="stat-card">
          <text class="stat-num">9<text class="stat-unit">条</text></text>
          <text class="stat-label">全球迁飞通道</text>
        </view>
      </view>

      <!-- 什么是生物多样性 -->
      <view class="section-block">
        <view class="block-header">
          <view class="block-dot green"></view>
          <text class="block-title">什么是生物多样性？</text>
        </view>
        <text class="block-text">生物多样性是指地球上所有生物（动物、植物、微生物）及其所构成的综合体，包括物种多样性、遗传多样性和生态系统多样性三个层次。它是人类赖以生存和持续发展的物质基础。</text>
      </view>

      <!-- 候鸟的生态价值 -->
      <view class="section-block">
        <view class="block-header">
          <view class="block-dot green"></view>
          <text class="block-title">候鸟的生态价值</text>
        </view>

        <view class="value-item" v-for="(item, i) in ecoValues" :key="i">
          <view class="value-icon-wrap" :style="{background: item.bg}">
            <text class="value-emoji">{{ item.emoji }}</text>
          </view>
          <view class="value-content">
            <text class="value-title">{{ item.title }}</text>
            <text class="value-desc">{{ item.desc }}</text>
          </view>
        </view>
      </view>

      <!-- 迁徙通道 -->
      <view class="section-block">
        <view class="block-header">
          <view class="block-dot green"></view>
          <text class="block-title">候鸟迁飞通道</text>
        </view>
        <text class="block-text">全球共有9条候鸟迁飞通道，其中4条经过中国。每年数亿只候鸟沿这些通道南北迁徙，形成壮观的自然奇观。</text>

        <view class="route-list">
          <view class="route-item" v-for="(r, i) in routes" :key="i">
            <view class="route-num">{{ i + 1 }}</view>
            <view class="route-info">
              <text class="route-name">{{ r.name }}</text>
              <text class="route-desc">{{ r.desc }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 威胁与挑战 -->
      <view class="section-block danger-block">
        <view class="block-header">
          <view class="block-dot red"></view>
          <text class="block-title">当前面临的威胁</text>
        </view>

        <view class="threat-grid">
          <view class="threat-card" v-for="(t, i) in threats" :key="i">
            <text class="threat-icon">{{ t.icon }}</text>
            <text class="threat-name">{{ t.name }}</text>
          </view>
        </view>
      </view>

      <!-- 你能做什么 -->
      <view class="action-card">
        <view class="action-header">
          <text class="action-title">🌿 你能做什么？</text>
        </view>
        <view class="action-list">
          <view class="action-item" v-for="(a, i) in actions" :key="i">
            <view class="action-check">✓</view>
            <text class="action-text">{{ a }}</text>
          </view>
        </view>
        <view class="action-btn" @click="goReport">
          <text class="action-btn-text">立即举报违法行为</text>
          <svg viewBox="0 0 24 24" fill="none" style="width:32rpx;height:32rpx;">
            <path d="M5 12H19M13 6L19 12L13 18" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </view>
      </view>

    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      ecoValues: [
        { emoji: '🌾', bg: 'rgba(103,194,58,0.12)', title: '种子传播者', desc: '候鸟在迁徙途中传播植物种子，促进植被更新与生态修复，维持森林与湿地生态系统的健康运转。' },
        { emoji: '🦟', bg: 'rgba(64,158,255,0.12)', title: '天然灭虫剂', desc: '大量候鸟以昆虫为食，每年消耗数以亿计的农业害虫，为粮食生产提供天然的生物防治屏障。' },
        { emoji: '🌊', bg: 'rgba(27,75,140,0.12)', title: '湿地守护者', desc: '候鸟是湿地生态系统的核心物种，它们的存在与湿地的水质净化、碳汇功能紧密相关。' },
        { emoji: '📊', bg: 'rgba(245,108,108,0.12)', title: '环境指示器', desc: '候鸟种群数量的变化是生态环境健康状况的重要指标，科学家通过监测候鸟评估生态系统质量。' },
      ],
      routes: [
        { name: '东亚-澳大利亚西亚迁飞通道', desc: '经过中国东部沿海，是水鸟最重要的通道之一' },
        { name: '中亚迁飞通道', desc: '经过中国西北部，连接西伯利亚与南亚地区' },
        { name: '东非-西亚迁飞通道', desc: '部分经过中国西藏高原地区' },
        { name: '西太平洋迁飞通道', desc: '沿中国台湾及东南沿海延伸至东南亚' },
      ],
      threats: [
        { icon: '🏗️', name: '栖息地丧失' },
        { icon: '🔫', name: '非法捕猎' },
        { icon: '☠️', name: '农药污染' },
        { icon: '🌡️', name: '气候变化' },
        { icon: '💡', name: '光污染干扰' },
        { icon: '🏭', name: '工业污染' },
      ],
      actions: [
        '发现非法捕猎行为立即通过App举报',
        '参与本地候鸟监测与保护志愿活动',
        '减少农药使用，保护迁徙停歇地',
        '向身边的人传播候鸟保护知识',
        '支持湿地自然保护区建设',
      ]
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    goReport() {
      uni.switchTab({ url: '/pages/public/report/report' })
    }
  }
}
</script>

<style scoped lang="scss">
.page {
  background: #F2F6FC;
  min-height: 100vh;
  padding-bottom: 60rpx;
}

.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: linear-gradient(135deg, #2D6A1F 0%, #3D8B2D 50%, #67C23A 100%);
  position: sticky;
  top: 0;
  z-index: 100;
}
.back-btn {
  width: 56rpx; height: 56rpx;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.2);
  border-radius: 12rpx;
}
.back-btn svg { width: 36rpx; height: 36rpx; }
.nav-title { font-size: 32rpx; font-weight: bold; color: #FFFFFF; }
.nav-placeholder { width: 56rpx; }

/* 英雄区 */
.hero-section {
  background: linear-gradient(160deg, #2D6A1F 0%, #3D8B2D 40%, #67C23A 100%);
  padding: 60rpx 40rpx 80rpx;
  display: flex; flex-direction: column; align-items: center;
  position: relative; overflow: hidden;
}
.hero-bg { position: absolute; inset: 0; }
.hero-circle {
  position: absolute; border-radius: 50%;
  background: rgba(255,255,255,0.06);
}
.c1 { width: 300rpx; height: 300rpx; top: -80rpx; right: -60rpx; }
.c2 { width: 200rpx; height: 200rpx; bottom: 0; left: -40rpx; }
.c3 { width: 120rpx; height: 120rpx; top: 60rpx; left: 80rpx; background: rgba(255,255,255,0.04); }

.hero-icon {
  width: 140rpx; height: 140rpx;
  background: rgba(255,255,255,0.15);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 32rpx;
  border: 2rpx solid rgba(255,255,255,0.3);
}
.hero-icon svg { width: 90rpx; height: 90rpx; }
.hero-title { font-size: 52rpx; font-weight: bold; color: #FFFFFF; margin-bottom: 16rpx; }
.hero-subtitle { font-size: 26rpx; color: rgba(255,255,255,0.85); margin-bottom: 32rpx; text-align: center; }
.hero-tag {
  background: rgba(255,255,255,0.2);
  border: 1rpx solid rgba(255,255,255,0.4);
  border-radius: 40rpx;
  padding: 10rpx 32rpx;
}
.hero-tag text { font-size: 22rpx; color: #FFFFFF; }

/* 内容区 */
.content-wrap { padding: 32rpx; margin-top: -20rpx; }

/* 引言卡片 */
.quote-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 28rpx;
  position: relative;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.06);
  border-left: 6rpx solid #67C23A;
}
.quote-mark {
  font-size: 80rpx; color: #67C23A; opacity: 0.3;
  position: absolute; top: 16rpx; left: 28rpx;
  font-family: Georgia, serif; line-height: 1;
}
.quote-text {
  font-size: 27rpx; color: #303133; line-height: 1.8;
  display: block; padding-top: 24rpx;
}
.quote-author { font-size: 22rpx; color: #909399; margin-top: 20rpx; display: block; text-align: right; }

/* 数据卡片 */
.stats-row {
  display: flex; gap: 16rpx; margin-bottom: 28rpx;
}
.stat-card {
  flex: 1; background: #FFFFFF; border-radius: 16rpx;
  padding: 28rpx 16rpx; text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}
.stat-card.highlight { background: linear-gradient(135deg, #3D8B2D, #67C23A); }
.stat-num { font-size: 40rpx; font-weight: bold; color: #2D6A1F; display: block; line-height: 1.2; }
.stat-unit { font-size: 22rpx; font-weight: normal; }
.stat-card.highlight .stat-num { color: #FFFFFF; }
.stat-label { font-size: 20rpx; color: #909399; margin-top: 8rpx; display: block; }
.stat-card.highlight .stat-label { color: rgba(255,255,255,0.85); }

/* 通用块 */
.section-block {
  background: #FFFFFF; border-radius: 20rpx;
  padding: 32rpx; margin-bottom: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}
.block-header { display: flex; align-items: center; gap: 16rpx; margin-bottom: 24rpx; }
.block-dot { width: 10rpx; height: 10rpx; border-radius: 50%; }
.block-dot.green { background: #67C23A; box-shadow: 0 0 0 4rpx rgba(103,194,58,0.2); }
.block-dot.red { background: #F56C6C; box-shadow: 0 0 0 4rpx rgba(245,108,108,0.2); }
.block-title { font-size: 30rpx; font-weight: bold; color: #303133; }
.block-text { font-size: 26rpx; color: #606266; line-height: 1.9; }

/* 生态价值列表 */
.value-item {
  display: flex; align-items: flex-start; gap: 20rpx;
  padding: 20rpx 0; border-bottom: 1rpx solid #F2F6FC;
}
.value-item:last-child { border-bottom: none; }
.value-icon-wrap {
  width: 72rpx; height: 72rpx; border-radius: 16rpx;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.value-emoji { font-size: 36rpx; }
.value-content { flex: 1; }
.value-title { font-size: 27rpx; font-weight: 600; color: #303133; display: block; margin-bottom: 8rpx; }
.value-desc { font-size: 24rpx; color: #606266; line-height: 1.7; }

/* 迁徙通道 */
.route-list { margin-top: 20rpx; }
.route-item {
  display: flex; align-items: flex-start; gap: 20rpx;
  padding: 18rpx 0; border-bottom: 1rpx solid #F2F6FC;
}
.route-item:last-child { border-bottom: none; }
.route-num {
  width: 44rpx; height: 44rpx; border-radius: 50%;
  background: linear-gradient(135deg, #3D8B2D, #67C23A);
  color: #FFFFFF; font-size: 24rpx; font-weight: bold;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.route-info { flex: 1; }
.route-name { font-size: 26rpx; font-weight: 600; color: #303133; display: block; margin-bottom: 6rpx; }
.route-desc { font-size: 23rpx; color: #909399; line-height: 1.6; }

/* 威胁卡片 */
.danger-block { border-left: 4rpx solid #F56C6C; }
.threat-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16rpx;
}
.threat-card {
  background: rgba(245,108,108,0.06); border-radius: 12rpx;
  padding: 20rpx; text-align: center;
  border: 1rpx solid rgba(245,108,108,0.15);
}
.threat-icon { font-size: 40rpx; display: block; margin-bottom: 8rpx; }
.threat-name { font-size: 22rpx; color: #606266; }

/* 行动卡片 */
.action-card {
  background: linear-gradient(135deg, #2D6A1F, #3D8B2D);
  border-radius: 20rpx; padding: 36rpx;
  box-shadow: 0 8rpx 32rpx rgba(45,106,31,0.3);
}
.action-header { margin-bottom: 28rpx; }
.action-title { font-size: 30rpx; font-weight: bold; color: #FFFFFF; }
.action-list { margin-bottom: 32rpx; }
.action-item {
  display: flex; align-items: flex-start; gap: 16rpx;
  padding: 12rpx 0;
}
.action-check {
  width: 36rpx; height: 36rpx; border-radius: 50%;
  background: rgba(255,255,255,0.25);
  color: #FFFFFF; font-size: 20rpx;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.action-text { font-size: 25rpx; color: rgba(255,255,255,0.9); line-height: 1.7; flex: 1; }
.action-btn {
  background: rgba(255,255,255,0.2); border: 1rpx solid rgba(255,255,255,0.4);
  border-radius: 12rpx; padding: 24rpx;
  display: flex; align-items: center; justify-content: center; gap: 12rpx;
}
.action-btn-text { font-size: 28rpx; font-weight: 600; color: #FFFFFF; }
</style>