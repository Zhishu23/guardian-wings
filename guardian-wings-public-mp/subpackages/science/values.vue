<template>
  <view class="page">
    <view class="top-nav">
      <view class="back-btn" @click="goBack">
        <uni-icons type="back" size="24" color="#FFFFFF" />
      </view>
      <text class="nav-title">价值观</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 英雄区 -->
    <view class="hero-section">
      <view class="hero-bg">
        <view class="hero-circle c1"></view>
        <view class="hero-circle c2"></view>
      </view>
      <view class="hero-icon">
        <uni-icons type="star-filled" size="54" color="#FFFFFF" />
      </view>
      <text class="hero-title">核心价值观</text>
      <text class="hero-subtitle">守护候鸟，守护秩序，守护人与自然的和谐共生</text>
      <view class="hero-tag">
        <text>翼路平安 · 使命与愿景</text>
      </view>
    </view>

    <view class="content-wrap">

      <!-- 使命宣言 -->
      <view class="mission-card">
        <view class="mission-top">
          <text class="mission-label">我们的使命</text>
        </view>
        <text class="mission-text">构建感知—决策—行动—反馈的智能闭环保护体系，让每一只候鸟都能在安全的天空中自由翱翔，让每一起违法行为都无处遁形。</text>
        <view class="mission-bottom">
          <view class="mission-badge" v-for="(b, i) in missionBadges" :key="i">
            <text class="mission-badge-text">{{ b }}</text>
          </view>
        </view>
      </view>

      <!-- 核心价值 -->
      <view class="section-block">
        <view class="block-header">
          <view class="block-dot navy"></view>
          <text class="block-title">我们的核心价值</text>
        </view>

        <view class="value-big-card" v-for="(v, i) in coreValues" :key="i">
          <view class="vbc-header">
            <view class="vbc-num">{{ String(i+1).padStart(2,'0') }}</view>
            <view class="vbc-title-wrap">
              <text class="vbc-emoji">{{ v.emoji }}</text>
              <text class="vbc-title">{{ v.title }}</text>
            </view>
          </view>
          <text class="vbc-desc">{{ v.desc }}</text>
          <view class="vbc-tags">
            <view class="vbc-tag" v-for="(t, j) in v.tags" :key="j">
              <text>{{ t }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 平台理念 -->
      <view class="section-block">
        <view class="block-header">
          <view class="block-dot navy"></view>
          <text class="block-title">平台理念</text>
        </view>

        <view class="concept-timeline">
          <view class="timeline-item" v-for="(c, i) in concepts" :key="i">
            <view class="tl-left">
              <view class="tl-dot" :style="{background: c.color}"></view>
              <view class="tl-line" v-if="i < concepts.length - 1"></view>
            </view>
            <view class="tl-right">
              <view class="tl-header">
                <text class="tl-step">{{ c.step }}</text>
                <text class="tl-title">{{ c.title }}</text>
              </view>
              <text class="tl-desc">{{ c.desc }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 人与自然 -->
      <view class="section-block">
        <view class="block-header">
          <view class="block-dot navy"></view>
          <text class="block-title">人与自然和谐共生</text>
        </view>
        <text class="block-text">候鸟保护不是将人与自然对立起来，而是让更多人理解自然、亲近自然、敬畏自然。我们相信，当每一个普通公民都成为生态守护者，人与候鸟之间的纽带将更加紧密，生态安全防线将更加牢固。</text>

        <view class="harmony-grid">
          <view class="harmony-card" v-for="(h, i) in harmonyItems" :key="i">
            <text class="harmony-emoji">{{ h.emoji }}</text>
            <text class="harmony-title">{{ h.title }}</text>
            <text class="harmony-desc">{{ h.desc }}</text>
          </view>
        </view>
      </view>

      <!-- 愿景 -->
      <view class="vision-card">
        <view class="vision-bg">
          <view class="vision-circle vc1"></view>
          <view class="vision-circle vc2"></view>
        </view>
        <text class="vision-label">我们的愿景</text>
        <text class="vision-title">让候鸟的迁徙路上，不再有人为的阴影</text>
        <view class="vision-list">
          <view class="vision-item" v-for="(vi, i) in visions" :key="i">
            <text class="vi-icon">{{ vi.icon }}</text>
            <text class="vi-text">{{ vi.text }}</text>
          </view>
        </view>
        <view class="vision-btn" @click="goVolunteer">
          <text class="vision-btn-text">加入翼路平安志愿者</text>
        </view>
      </view>

    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      missionBadges: ['科技赋能', '警民联动', '社会共治', '智能闭环'],
      coreValues: [
        {
          emoji: '⚖️', title: '依法保护',
          desc: '以国家法律法规为准绳，严格依法推进候鸟保护工作。一切执法行为均在法律框架内进行，做到有法必依、违法必究、执法必严。',
          tags: ['野生动物保护法', '刑法第341条', '行政处罚法']
        },
        {
          emoji: '🔬', title: '科学守护',
          desc: '依托大数据、人工智能和卫星遥感技术，构建精准的候鸟迁徙监测体系。让保护工作有科学数据支撑，而非仅凭经验和直觉。',
          tags: ['数据驱动', 'AI预警', '精准执法']
        },
        {
          emoji: '🤝', title: '协同共治',
          desc: '打破部门壁垒，建立公安、林草、检察、公众多方协同机制。每个人都是候鸟保护网络的一个节点，共同构成密不透风的保护防线。',
          tags: ['行刑衔接', '警民联动', '公众参与']
        },
        {
          emoji: '💡', title: '持续进化',
          desc: '每一次执法结果、每一条举报数据都将用于优化系统算法，让平台越用越智能，让保护工作越来越精准高效。',
          tags: ['闭环反馈', '模型迭代', '持续优化']
        },
      ],
      concepts: [
        { step: '感知', title: '线索采集', color: '#409EFF', desc: '通过群众举报、网络监测、联合执法等多渠道汇聚线索，织密信息感知网络。' },
        { step: '决策', title: '智能研判', color: '#F59E0B', desc: 'PC平台对线索进行自动关联分析、风险评级，辅助指挥人员做出科学决策。' },
        { step: '行动', title: '协同处置', color: '#EF4444', desc: '警员收到精准预警后出击，同步调度志愿者协助宣传，形成立体处置合力。' },
        { step: '反馈', title: '数据归档', color: '#67C23A', desc: '案件结果数据化入库，用于训练更智能的预警模型，推动系统持续进化。' },
      ],
      harmonyItems: [
        { emoji: '🌅', title: '敬畏生命', desc: '每一种鸟类都有其存在的意义与价值，值得我们的尊重与保护。' },
        { emoji: '🏙️', title: '城市共栖', desc: '推动城市生态友好改造，让候鸟迁徙停歇地与城市发展和谐共存。' },
        { emoji: '📖', title: '生态教育', desc: '将候鸟保护知识纳入公众教育，从小培育生态文明意识。' },
        { emoji: '🌐', title: '国际合作', desc: '与沿线各国共享候鸟迁徙数据，共同守护跨国界的候鸟家园。' },
      ],
      visions: [
        { icon: '🦅', text: '候鸟迁徙通道全线安全无威胁' },
        { icon: '⚡', text: '违法行为24小时内得到响应处置' },
        { icon: '🌏', text: '形成全社会参与的保护文化氛围' },
        { icon: '🤖', text: '建成全国领先的候鸟智慧保护平台' },
      ]
    }
  },
  methods: {
    goBack() { uni.navigateBack() },
    goVolunteer() { uni.switchTab({ url: '/pages/public/volunteer/index' }) }
  }
}
</script>

<style scoped lang="scss">
.page { background: #F2F6FC; min-height: 100vh; padding-bottom: 60rpx; }

.top-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24rpx 32rpx;
  background: linear-gradient(135deg, #0F2A5C 0%, #1B4B8C 50%, #2563EB 100%);
  position: sticky; top: 0; z-index: 100;
}
.back-btn {
  width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.2); border-radius: 12rpx;
}
.nav-title { font-size: 32rpx; font-weight: bold; color: #FFFFFF; }
.nav-placeholder { width: 56rpx; }

.hero-section {
  background: linear-gradient(160deg, #0F2A5C 0%, #1B4B8C 40%, #2563EB 100%);
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
.hero-title { font-size: 52rpx; font-weight: bold; color: #FFFFFF; margin-bottom: 16rpx; }
.hero-subtitle { font-size: 25rpx; color: rgba(255,255,255,0.85); margin-bottom: 32rpx; text-align: center; line-height: 1.5; }
.hero-tag {
  background: rgba(255,255,255,0.2); border: 1rpx solid rgba(255,255,255,0.4);
  border-radius: 40rpx; padding: 10rpx 32rpx;
}
.hero-tag text { font-size: 22rpx; color: #FFFFFF; }

.content-wrap { padding: 32rpx; margin-top: -20rpx; }

/* 使命卡片 */
.mission-card {
  background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
  border: 1rpx solid #93C5FD; border-radius: 20rpx;
  padding: 32rpx; margin-bottom: 28rpx;
}
.mission-top { margin-bottom: 16rpx; }
.mission-label {
  display: inline-block; background: #1B4B8C; color: #FFFFFF;
  font-size: 20rpx; padding: 6rpx 20rpx; border-radius: 8rpx;
}
.mission-text { font-size: 27rpx; color: #1E3A5F; line-height: 1.9; display: block; margin-bottom: 24rpx; }
.mission-bottom { display: flex; flex-wrap: wrap; gap: 12rpx; }
.mission-badge {
  background: rgba(27,75,140,0.1); border: 1rpx solid rgba(27,75,140,0.25);
  border-radius: 20rpx; padding: 8rpx 20rpx;
}
.mission-badge-text { font-size: 22rpx; color: #1B4B8C; }

.section-block {
  background: #FFFFFF; border-radius: 20rpx;
  padding: 32rpx; margin-bottom: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}
.block-header { display: flex; align-items: center; gap: 16rpx; margin-bottom: 24rpx; }
.block-dot { width: 10rpx; height: 10rpx; border-radius: 50%; }
.block-dot.navy { background: #1B4B8C; box-shadow: 0 0 0 4rpx rgba(27,75,140,0.2); }
.block-title { font-size: 30rpx; font-weight: bold; color: #303133; }
.block-text { font-size: 26rpx; color: #606266; line-height: 1.9; display: block; margin-bottom: 24rpx; }

/* 核心价值大卡片 */
.value-big-card {
  background: #F8FAFF; border: 1rpx solid #DBEAFE;
  border-radius: 16rpx; padding: 28rpx; margin-bottom: 16rpx;
}
.value-big-card:last-child { margin-bottom: 0; }
.vbc-header { display: flex; align-items: center; gap: 16rpx; margin-bottom: 16rpx; }
.vbc-num {
  font-size: 20rpx; font-weight: bold; color: #1B4B8C; opacity: 0.4;
  font-variant-numeric: tabular-nums;
}
.vbc-title-wrap { display: flex; align-items: center; gap: 12rpx; }
.vbc-emoji { font-size: 32rpx; }
.vbc-title { font-size: 28rpx; font-weight: bold; color: #303133; }
.vbc-desc { font-size: 24rpx; color: #606266; line-height: 1.8; display: block; margin-bottom: 16rpx; }
.vbc-tags { display: flex; flex-wrap: wrap; gap: 10rpx; }
.vbc-tag {
  background: rgba(27,75,140,0.08); border-radius: 8rpx;
  padding: 6rpx 16rpx;
}
.vbc-tag text { font-size: 20rpx; color: #1B4B8C; }

/* 时间线 */
.concept-timeline { }
.timeline-item { display: flex; gap: 20rpx; }
.tl-left { display: flex; flex-direction: column; align-items: center; width: 32rpx; }
.tl-dot { width: 20rpx; height: 20rpx; border-radius: 50%; flex-shrink: 0; margin-top: 8rpx; }
.tl-line { width: 2rpx; flex: 1; background: #E5E7EB; margin: 8rpx 0; min-height: 32rpx; }
.tl-right { flex: 1; padding-bottom: 32rpx; }
.tl-header { display: flex; align-items: center; gap: 12rpx; margin-bottom: 10rpx; }
.tl-step {
  font-size: 20rpx; font-weight: bold; color: #FFFFFF;
  background: #1B4B8C; padding: 4rpx 14rpx; border-radius: 8rpx;
}
.tl-title { font-size: 27rpx; font-weight: 600; color: #303133; }
.tl-desc { font-size: 24rpx; color: #606266; line-height: 1.8; }

/* 和谐共生 */
.harmony-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16rpx; }
.harmony-card {
  background: #F8FAFF; border: 1rpx solid #DBEAFE;
  border-radius: 12rpx; padding: 24rpx;
}
.harmony-emoji { font-size: 40rpx; display: block; margin-bottom: 12rpx; }
.harmony-title { font-size: 26rpx; font-weight: 600; color: #303133; display: block; margin-bottom: 8rpx; }
.harmony-desc { font-size: 22rpx; color: #909399; line-height: 1.6; }

/* 愿景卡片 */
.vision-card {
  background: linear-gradient(135deg, #0F2A5C, #1B4B8C);
  border-radius: 20rpx; padding: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(15,42,92,0.35);
  position: relative; overflow: hidden;
}
.vision-bg { position: absolute; inset: 0; }
.vision-circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.05); }
.vc1 { width: 260rpx; height: 260rpx; top: -80rpx; right: -60rpx; }
.vc2 { width: 160rpx; height: 160rpx; bottom: -40rpx; left: 40rpx; }

.vision-label {
  font-size: 22rpx; color: rgba(255,255,255,0.7);
  display: block; margin-bottom: 12rpx;
}
.vision-title {
  font-size: 30rpx; font-weight: bold; color: #FFFFFF;
  line-height: 1.5; display: block; margin-bottom: 32rpx;
}
.vision-list { margin-bottom: 32rpx; }
.vision-item { display: flex; align-items: center; gap: 16rpx; padding: 12rpx 0; }
.vi-icon { font-size: 28rpx; }
.vi-text { font-size: 25rpx; color: rgba(255,255,255,0.9); }

.vision-btn {
  background: rgba(255,255,255,0.2); border: 1rpx solid rgba(255,255,255,0.35);
  border-radius: 12rpx; padding: 24rpx;
  display: flex; align-items: center; justify-content: center;
}
.vision-btn-text { font-size: 27rpx; font-weight: 600; color: #FFFFFF; }
</style>
