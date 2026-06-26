<template>
  <view class="page">
    <view class="top-nav">
      <view class="back-btn" @click="goBack">
        <uni-icons type="back" size="24" color="#FFFFFF" />
      </view>
      <text class="nav-title">公众参与</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 英雄区 -->
    <view class="hero-section">
      <view class="hero-bg">
        <view class="hero-circle c1"></view>
        <view class="hero-circle c2"></view>
      </view>
      <view class="hero-icon">
        <uni-icons type="person-filled" size="54" color="#FFFFFF" />
      </view>
      <text class="hero-title">公众参与</text>
      <text class="hero-subtitle">每个人都是候鸟的守护者，共建生态安全防线</text>
      <view class="hero-stats-row">
        <view class="hero-stat">
          <text class="hs-num">12,000+</text>
          <text class="hs-label">注册志愿者</text>
        </view>
        <view class="hs-divider"></view>
        <view class="hero-stat">
          <text class="hs-num">3,800+</text>
          <text class="hs-label">有效举报</text>
        </view>
        <view class="hs-divider"></view>
        <view class="hero-stat">
          <text class="hs-num">96%</text>
          <text class="hs-label">处理率</text>
        </view>
      </view>
    </view>

    <view class="content-wrap">

      <!-- 为什么需要你 -->
      <view class="section-block">
        <view class="block-header">
          <view class="block-dot blue"></view>
          <text class="block-title">为什么需要你的参与？</text>
        </view>
        <text class="block-text">候鸟保护是一场全社会的行动。执法机关和专业人员的力量是有限的，而候鸟迁徙路线绵延数千公里，栖息地遍布各地。只有广大公众积极参与，才能真正织密保护网络，让违法行为无处遁形。</text>

        <view class="why-grid">
          <view class="why-card" v-for="(w, i) in whyItems" :key="i">
            <text class="why-emoji">{{ w.emoji }}</text>
            <text class="why-title">{{ w.title }}</text>
            <text class="why-desc">{{ w.desc }}</text>
          </view>
        </view>
      </view>

      <!-- 参与方式 -->
      <view class="section-block">
        <view class="block-header">
          <view class="block-dot blue"></view>
          <text class="block-title">你可以这样参与</text>
        </view>

        <view class="participate-list">
          <view class="participate-item" v-for="(p, i) in participateModes" :key="i">
            <view class="p-icon-wrap" :style="{background: p.bg}">
              <text class="p-emoji">{{ p.emoji }}</text>
            </view>
            <view class="p-content">
              <view class="p-top">
                <text class="p-title">{{ p.title }}</text>
                <view class="p-badge" :style="{background: p.badgeBg, color: p.badgeColor}">
                  <text>{{ p.badge }}</text>
                </view>
              </view>
              <text class="p-desc">{{ p.desc }}</text>
              <view class="p-action" @click="p.action && p.action()">
                <text class="p-action-text">{{ p.actionText }}</text>
                <uni-icons type="right" size="14" color="#409EFF" />
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 积分与成就 -->
      <view class="section-block">
        <view class="block-header">
          <view class="block-dot blue"></view>
          <text class="block-title">参与积分与成就</text>
        </view>
        <text class="block-text" style="margin-bottom: 24rpx;">每一次参与都将获得积分，积分可兑换荣誉证书和纪念品，并记录在你的个人主页上。</text>

        <view class="point-list">
          <view class="point-item" v-for="(pt, i) in pointRules" :key="i">
            <view class="point-left">
              <text class="point-emoji">{{ pt.emoji }}</text>
              <text class="point-action">{{ pt.action }}</text>
            </view>
            <view class="point-right">
              <text class="point-val">+{{ pt.points }}</text>
              <text class="point-unit">积分</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 成功案例 -->
      <view class="section-block">
        <view class="block-header">
          <view class="block-dot blue"></view>
          <text class="block-title">公众举报成功案例</text>
        </view>

        <view class="case-list">
          <view class="case-item" v-for="(c, i) in cases" :key="i">
            <view class="case-header">
              <view class="case-badge">案例 {{ i + 1 }}</view>
              <text class="case-location">{{ c.location }}</text>
            </view>
            <text class="case-title">{{ c.title }}</text>
            <text class="case-desc">{{ c.desc }}</text>
            <view class="case-result">
              <text class="case-result-icon">✅</text>
              <text class="case-result-text">{{ c.result }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 行动召唤 -->
      <view class="cta-card">
        <text class="cta-title">🤝 加入我们</text>
        <text class="cta-desc">候鸟的迁徙之路需要每一个人的守护。注册成为志愿者，用你的行动为大自然发声。</text>
        <view class="cta-btns">
          <view class="cta-btn primary" @click="goVolunteer">
            <text class="cta-btn-text">参与志愿活动</text>
          </view>
          <view class="cta-btn secondary" @click="goReport">
            <text class="cta-btn-text-s">举报违法行为</text>
          </view>
        </view>
      </view>

    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      whyItems: [
        { emoji: '👁️', title: '广泛的眼线', desc: '覆盖执法盲区，发现更多违法线索' },
        { emoji: '⚡', title: '快速响应', desc: '第一时间上报，提高执法时效' },
        { emoji: '🌍', title: '全民共治', desc: '形成社会监督氛围，提升违法成本' },
        { emoji: '📚', title: '知识传播', desc: '推动保护意识深入社区与校园' },
      ],
      participateModes: [
        {
          emoji: '📱', title: '线索举报', badge: '最常用',
          bg: 'rgba(64,158,255,0.12)', badgeBg: 'rgba(64,158,255,0.1)', badgeColor: '#409EFF',
          desc: '发现非法捕猎、贩卖野生鸟类等违法行为，拍照取证后通过App举报，平台24小时内响应。',
          actionText: '前往举报',
          action: () => uni.switchTab({ url: '/pages/public/report/report' })
        },
        {
          emoji: '🦅', title: '鸟类观测记录', badge: '推荐',
          bg: 'rgba(103,194,58,0.12)', badgeBg: 'rgba(103,194,58,0.1)', badgeColor: '#67C23A',
          desc: '在候鸟迁徙季节，记录并上传你观测到的鸟类信息，协助科研人员掌握种群动态。',
          actionText: '前往识鸟',
          action: () => uni.switchTab({ url: '/pages/public/bird/bird' })
        },
        {
          emoji: '🌿', title: '志愿者活动', badge: '获积分',
          bg: 'rgba(245,158,11,0.12)', badgeBg: 'rgba(245,158,11,0.1)', badgeColor: '#F59E0B',
          desc: '参加湿地清洁、候鸟救助站值班、宣传进社区等线下志愿活动，获得官方认证证书。',
          actionText: '查看活动',
          action: () => uni.switchTab({ url: '/pages/public/volunteer/index' })
        },
        {
          emoji: '📣', title: '知识传播', badge: '随时可做',
          bg: 'rgba(27,75,140,0.12)', badgeBg: 'rgba(27,75,140,0.1)', badgeColor: '#1B4B8C',
          desc: '转发平台发布的候鸟保护资讯，向身边的家人和朋友科普相关知识，扩大保护影响力。',
          actionText: '了解更多', action: null
        },
      ],
      pointRules: [
        { emoji: '📸', action: '上传有效举报线索', points: 50 },
        { emoji: '✅', action: '举报被采纳处理', points: 200 },
        { emoji: '🦜', action: '完成鸟类识别记录', points: 10 },
        { emoji: '🌱', action: '参加线下志愿活动', points: 100 },
        { emoji: '📅', action: '连续7天使用平台', points: 30 },
      ],
      cases: [
        {
          location: '辽宁省大连市',
          title: '市民举报非法粘网捕鸟，成功解救候鸟300余只',
          desc: '2024年10月，一名市民在城郊发现大规模粘网，立即通过翼路平安App上传现场照片。执法部门当日出警，现场查获粘网26张，解救东方鸻、黄胸鹀等候鸟300余只。',
          result: '涉案人员被行政拘留15日，处罚款5万元'
        },
        {
          location: '江苏省盐城市',
          title: '志愿者巡护队发现毒饵，阻止大规模毒杀事件',
          desc: '志愿者在条子泥湿地例行巡护时发现可疑饵料，立即取样上报，经检测确认含有违禁农药，有关部门迅速介入并溯源追查至源头。',
          result: '及时阻止了一起可能造成数百只候鸟死亡的毒杀事件'
        },
      ]
    }
  },
  methods: {
    goBack() { uni.navigateBack() },
    goVolunteer() { uni.switchTab({ url: '/pages/public/volunteer/index' }) },
    goReport() { uni.switchTab({ url: '/pages/public/report/report' }) }
  }
}
</script>

<style scoped lang="scss">
.page { background: #F2F6FC; min-height: 100vh; padding-bottom: 60rpx; }

.top-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24rpx 32rpx;
  background: linear-gradient(135deg, #1565C0 0%, #1976D2 50%, #42A5F5 100%);
  position: sticky; top: 0; z-index: 100;
}
.back-btn {
  width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.2); border-radius: 12rpx;
}
.nav-title { font-size: 32rpx; font-weight: bold; color: #FFFFFF; }
.nav-placeholder { width: 56rpx; }

.hero-section {
  background: linear-gradient(160deg, #1565C0 0%, #1976D2 40%, #42A5F5 100%);
  padding: 60rpx 40rpx 50rpx;
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
.hero-title { font-size: 52rpx; font-weight: bold; color: #FFFFFF; margin-bottom: 16rpx; }
.hero-subtitle { font-size: 25rpx; color: rgba(255,255,255,0.85); margin-bottom: 40rpx; text-align: center; line-height: 1.5; }

.hero-stats-row {
  display: flex; align-items: center; gap: 0;
  background: rgba(255,255,255,0.15); border-radius: 16rpx; padding: 20rpx 32rpx;
  border: 1rpx solid rgba(255,255,255,0.25);
}
.hero-stat { display: flex; flex-direction: column; align-items: center; padding: 0 24rpx; }
.hs-num { font-size: 32rpx; font-weight: bold; color: #FFFFFF; }
.hs-label { font-size: 20rpx; color: rgba(255,255,255,0.8); margin-top: 4rpx; }
.hs-divider { width: 1rpx; height: 50rpx; background: rgba(255,255,255,0.3); }

.content-wrap { padding: 32rpx; margin-top: -20rpx; }

.section-block {
  background: #FFFFFF; border-radius: 20rpx;
  padding: 32rpx; margin-bottom: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}
.block-header { display: flex; align-items: center; gap: 16rpx; margin-bottom: 24rpx; }
.block-dot { width: 10rpx; height: 10rpx; border-radius: 50%; }
.block-dot.blue { background: #409EFF; box-shadow: 0 0 0 4rpx rgba(64,158,255,0.2); }
.block-title { font-size: 30rpx; font-weight: bold; color: #303133; }
.block-text { font-size: 26rpx; color: #606266; line-height: 1.9; display: block; }

.why-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16rpx; margin-top: 24rpx; }
.why-card {
  background: rgba(64,158,255,0.05); border: 1rpx solid rgba(64,158,255,0.15);
  border-radius: 12rpx; padding: 24rpx; text-align: center;
}
.why-emoji { font-size: 44rpx; display: block; margin-bottom: 12rpx; }
.why-title { font-size: 26rpx; font-weight: 600; color: #303133; display: block; margin-bottom: 8rpx; }
.why-desc { font-size: 22rpx; color: #909399; line-height: 1.5; }

.participate-list { }
.participate-item {
  display: flex; gap: 20rpx; padding: 24rpx 0;
  border-bottom: 1rpx solid #F2F6FC;
}
.participate-item:last-child { border-bottom: none; }
.p-icon-wrap {
  width: 80rpx; height: 80rpx; border-radius: 16rpx;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.p-emoji { font-size: 40rpx; }
.p-content { flex: 1; }
.p-top { display: flex; align-items: center; gap: 12rpx; margin-bottom: 10rpx; }
.p-title { font-size: 27rpx; font-weight: 600; color: #303133; }
.p-badge {
  padding: 4rpx 14rpx; border-radius: 20rpx; font-size: 19rpx;
}
.p-desc { font-size: 23rpx; color: #606266; line-height: 1.7; margin-bottom: 14rpx; display: block; }
.p-action { display: flex; align-items: center; gap: 6rpx; }
.p-action-text { font-size: 23rpx; color: #409EFF; font-weight: 500; }

.point-list { }
.point-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18rpx 0; border-bottom: 1rpx solid #F2F6FC;
}
.point-item:last-child { border-bottom: none; }
.point-left { display: flex; align-items: center; gap: 16rpx; }
.point-emoji { font-size: 32rpx; }
.point-action { font-size: 26rpx; color: #606266; }
.point-right { display: flex; align-items: baseline; gap: 4rpx; }
.point-val { font-size: 32rpx; font-weight: bold; color: #409EFF; }
.point-unit { font-size: 20rpx; color: #909399; }

.case-list { }
.case-item {
  background: #F8FBFF; border: 1rpx solid #DBEAFE;
  border-radius: 12rpx; padding: 24rpx; margin-bottom: 16rpx;
}
.case-item:last-child { margin-bottom: 0; }
.case-header { display: flex; align-items: center; gap: 16rpx; margin-bottom: 12rpx; }
.case-badge {
  background: #1976D2; color: #FFFFFF;
  font-size: 20rpx; padding: 4rpx 16rpx; border-radius: 8rpx;
}
.case-location { font-size: 22rpx; color: #909399; }
.case-title { font-size: 27rpx; font-weight: 600; color: #303133; display: block; margin-bottom: 10rpx; line-height: 1.5; }
.case-desc { font-size: 23rpx; color: #606266; line-height: 1.8; display: block; margin-bottom: 16rpx; }
.case-result { display: flex; align-items: flex-start; gap: 10rpx; }
.case-result-icon { font-size: 24rpx; }
.case-result-text { font-size: 23rpx; color: #16A34A; font-weight: 500; flex: 1; line-height: 1.5; }

.cta-card {
  background: linear-gradient(135deg, #1565C0, #1976D2);
  border-radius: 20rpx; padding: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(21,101,192,0.3);
}
.cta-title { font-size: 32rpx; font-weight: bold; color: #FFFFFF; display: block; margin-bottom: 16rpx; }
.cta-desc { font-size: 25rpx; color: rgba(255,255,255,0.85); line-height: 1.7; display: block; margin-bottom: 32rpx; }
.cta-btns { display: flex; gap: 16rpx; }
.cta-btn { flex: 1; border-radius: 12rpx; padding: 24rpx; display: flex; align-items: center; justify-content: center; }
.cta-btn.primary { background: rgba(255,255,255,0.25); border: 1rpx solid rgba(255,255,255,0.4); }
.cta-btn.secondary { background: rgba(255,255,255,0.1); border: 1rpx solid rgba(255,255,255,0.2); }
.cta-btn-text { font-size: 26rpx; font-weight: 600; color: #FFFFFF; }
.cta-btn-text-s { font-size: 26rpx; color: rgba(255,255,255,0.85); }
</style>
