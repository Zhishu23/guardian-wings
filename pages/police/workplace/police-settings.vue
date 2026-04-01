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
      <text class="nav-title">个人设置</text>
      <view class="save-btn" @click="saveSettings" v-if="hasEdited">
        <text class="save-text">保存</text>
      </view>
      <view v-else style="width:80rpx;"></view>
    </view>

    <!-- 警员信息卡 -->
    <view class="profile-hero">
      <view class="profile-avatar">
        <text class="avatar-char">{{ officerName.charAt(0) || '警' }}</text>
      </view>
      <text class="profile-name">{{ officerName || '警务人员' }}</text>
      <view class="profile-tags">
        <view class="profile-tag">
          <text>警号：{{ badgeNo || '未设置' }}</text>
        </view>
        <view class="profile-tag">
          <text>{{ officerDept || '未设置部门' }}</text>
        </view>
      </view>
      <view class="auth-badge">
        <svg viewBox="0 0 24 24" fill="none" style="width:24rpx;height:24rpx;">
          <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z" fill="#10B981"/>
        </svg>
        <text>已通过警务认证</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-body" :style="{height: scrollHeight + 'px'}" :show-scrollbar="false">

      <!-- 账号信息（只读，来自登录授权） -->
      <view class="group-card">
        <view class="group-title">
          <text>账号信息</text>
          <text class="group-tip">由警务部门授权，不可修改</text>
        </view>
        <view class="info-row readonly">
          <text class="info-label">姓名</text>
          <text class="info-value">{{ officerName || '——' }}</text>
          <view class="lock-icon">
            <svg viewBox="0 0 24 24" fill="none" style="width:28rpx;height:28rpx;">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="#C0C4CC"/>
            </svg>
          </view>
        </view>
        <view class="divider-line"></view>
        <view class="info-row readonly">
          <text class="info-label">警号</text>
          <text class="info-value">{{ badgeNo || '——' }}</text>
          <view class="lock-icon">
            <svg viewBox="0 0 24 24" fill="none" style="width:28rpx;height:28rpx;">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="#C0C4CC"/>
            </svg>
          </view>
        </view>
        <view class="divider-line"></view>
        <view class="info-row readonly">
          <text class="info-label">所属部门</text>
          <text class="info-value">{{ officerDept || '——' }}</text>
          <view class="lock-icon">
            <svg viewBox="0 0 24 24" fill="none" style="width:28rpx;height:28rpx;">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="#C0C4CC"/>
            </svg>
          </view>
        </view>
      </view>

      <!-- 个人补充信息（可编辑） -->
      <view class="group-card">
        <view class="group-title">
          <text>补充信息</text>
          <text class="group-tip">可自行填写完善</text>
        </view>

        <view class="edit-row">
          <text class="edit-label">职务/职级</text>
          <input
            class="edit-input"
            v-model="form.position"
            placeholder="如：民警、副队长等"
            @input="hasEdited = true"
          />
        </view>
        <view class="divider-line"></view>

        <view class="edit-row">
          <text class="edit-label">联系电话</text>
          <input
            class="edit-input"
            v-model="form.phone"
            placeholder="执勤联系号码"
            type="number"
            maxlength="11"
            @input="hasEdited = true"
          />
        </view>
        <view class="divider-line"></view>

        <view class="edit-row">
          <text class="edit-label">工作站点</text>
          <input
            class="edit-input"
            v-model="form.station"
            placeholder="如：XX派出所、XX中队"
            @input="hasEdited = true"
          />
        </view>
      </view>

      <!-- 安全设置 -->
      <view class="group-card">
        <view class="group-title"><text>安全设置</text></view>

        <view class="setting-row" @click="changePassword">
          <view class="setting-left">
            <view class="setting-icon" style="background:rgba(37,99,235,0.1);">
              <svg viewBox="0 0 24 24" fill="none" style="width:32rpx;height:32rpx;">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="#2563EB"/>
              </svg>
            </view>
            <text class="setting-name">修改登录密码</text>
          </view>
          <svg viewBox="0 0 24 24" fill="none" style="width:28rpx;height:28rpx;">
            <path d="M9 6L15 12L9 18" stroke="#C0C4CC" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </view>
        <view class="divider-line"></view>

        <view class="setting-row">
          <view class="setting-left">
            <view class="setting-icon" style="background:rgba(16,185,129,0.1);">
              <svg viewBox="0 0 24 24" fill="none" style="width:32rpx;height:32rpx;">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="#10B981"/>
              </svg>
            </view>
            <text class="setting-name">消息加密通信</text>
          </view>
          <view class="switch-badge on"><text>已开启</text></view>
        </view>
        <view class="divider-line"></view>

        <view class="setting-row">
          <view class="setting-left">
            <view class="setting-icon" style="background:rgba(245,158,11,0.1);">
              <svg viewBox="0 0 24 24" fill="none" style="width:32rpx;height:32rpx;">
                <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM20 18V10C20 6.13 16.87 3 13 3H11C7.13 3 4 6.13 4 10V18L2 20V21H22V20L20 18Z" fill="#D97706"/>
              </svg>
            </view>
            <text class="setting-name">任务预警推送</text>
          </view>
          <switch :checked="pushEnabled" color="#2563EB" @change="onPushChange"/>
        </view>
      </view>

      <!-- 其他 -->
      <view class="group-card">
        <view class="group-title"><text>其他</text></view>

        <view class="setting-row" @click="callSupport">
          <view class="setting-left">
            <view class="setting-icon" style="background:rgba(107,114,128,0.1);">
              <svg viewBox="0 0 24 24" fill="none" style="width:32rpx;height:32rpx;">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#6B7280"/>
              </svg>
            </view>
            <text class="setting-name">技术支持</text>
          </view>
          <svg viewBox="0 0 24 24" fill="none" style="width:28rpx;height:28rpx;">
            <path d="M9 6L15 12L9 18" stroke="#C0C4CC" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </view>
        <view class="divider-line"></view>

        <view class="setting-row" @click="clearCache">
          <view class="setting-left">
            <view class="setting-icon" style="background:rgba(107,114,128,0.1);">
              <svg viewBox="0 0 24 24" fill="none" style="width:32rpx;height:32rpx;">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4z" fill="#6B7280"/>
              </svg>
            </view>
            <text class="setting-name">清除本地缓存</text>
          </view>
          <text class="setting-hint">{{ cacheSize }}</text>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="logout-btn" @click="handleLogout">
        <text class="logout-text">退出登录</text>
      </view>

      <view class="version-info">
        <text>翼路平安 警务版 v1.0.0</text>
      </view>

      <view style="height:60rpx;"></view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 0,
      scrollHeight: 0,
      hasEdited: false,
      pushEnabled: true,
      cacheSize: '计算中...',
      officerName: '',
      officerDept: '',
      badgeNo: '',
      officerId: '',
      form: {
        position: '',
        phone: '',
        station: ''
      }
    }
  },

  onLoad() {
    const sys = uni.getSystemInfoSync()
    this.statusBarHeight = sys.statusBarHeight
    this.scrollHeight = sys.windowHeight - sys.statusBarHeight - uni.upx2px(88)
    this.loadInfo()
    this.calcCache()
  },

  methods: {
    loadInfo() {
      try {
        // 读取登录时存储的信息（只读）
        const raw = uni.getStorageSync('gw_police_info')
        const info = raw ? JSON.parse(raw) : {}
        this.officerName = info.name       || ''
        this.officerDept = info.department || ''
        this.badgeNo     = info.badge_no   || ''
        this.officerId   = info.officer_id || ''

        // 读取可编辑的补充信息
        const extRaw = uni.getStorageSync('gw_police_ext')
        const ext = extRaw ? JSON.parse(extRaw) : {}
        this.form.position = ext.position || ''
        this.form.phone    = ext.phone    || ''
        this.form.station  = ext.station  || ''
        this.pushEnabled   = ext.pushEnabled !== false
      } catch (e) {}
    },

    saveSettings() {
      try {
        uni.setStorageSync('gw_police_ext', JSON.stringify({
          position:    this.form.position,
          phone:       this.form.phone,
          station:     this.form.station,
          pushEnabled: this.pushEnabled
        }))
        this.hasEdited = false
        uni.showToast({ title: '保存成功', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    },

    onPushChange(e) {
      this.pushEnabled = e.detail.value
      this.hasEdited = true
    },

    changePassword() {
      uni.showModal({
        title: '修改密码',
        content: '修改警务系统密码请联系所属部门管理员，或拨打技术支持热线。',
        showCancel: false,
        confirmText: '知道了'
      })
    },

    callSupport() {
      uni.showModal({
        title: '技术支持',
        content: '技术支持热线：12345\n工作时间：9:00-18:00',
        confirmText: '拨打',
        success: res => {
          if (res.confirm) uni.makePhoneCall({ phoneNumber: '12345' })
        }
      })
    },

    calcCache() {
      // 模拟缓存大小计算
      this.cacheSize = '约 2.3MB'
    },

    clearCache() {
      uni.showModal({
        title: '清除缓存',
        content: '将清除本地识别历史、报告草稿等缓存数据，不影响账号信息。',
        confirmText: '确认清除',
        success: res => {
          if (res.confirm) {
            uni.removeStorageSync('bird_history')
            uni.removeStorageSync('gw_report_records')
            this.cacheSize = '0MB'
            uni.showToast({ title: '缓存已清除', icon: 'success' })
          }
        }
      })
    },

    handleLogout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出警务端登录吗？',
        confirmText: '确认退出',
        confirmColor: '#EF4444',
        success: res => {
          if (res.confirm) {
            this.$store.dispatch('police/logout')
            uni.reLaunch({ url: '/pages/login/login' })
          }
        }
      })
    },

    goBack() { uni.navigateBack() }
  }
}
</script>

<style scoped lang="scss">
.page { background: #F2F6FC;
        min-height: 100vh;
		width: 100%;
		box-sizing: border-box;
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
.save-btn {
  background: rgba(255,255,255,0.2); border: 1rpx solid rgba(255,255,255,0.35);
  border-radius: 20rpx; padding: 8rpx 28rpx;
}
.save-text { font-size: 26rpx; color: #FFFFFF; font-weight: 600; }

/* 个人信息英雄区 */
.profile-hero {
  background: linear-gradient(135deg, #1B4B8C, #2563EB);
  padding: 40rpx 28rpx 48rpx;
  display: flex; flex-direction: column; align-items: center; gap: 12rpx;
}
.profile-avatar {
  width: 120rpx; height: 120rpx; border-radius: 50%;
  background: rgba(255,255,255,0.2); border: 3rpx solid rgba(255,255,255,0.4);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 8rpx;
}
.avatar-char { font-size: 52rpx; font-weight: bold; color: #FFFFFF; }
.profile-name { font-size: 36rpx; font-weight: bold; color: #FFFFFF; }
.profile-tags { display: flex; gap: 16rpx; flex-wrap: wrap; justify-content: center; }
.profile-tag {
  background: rgba(255,255,255,0.15); border: 1rpx solid rgba(255,255,255,0.25);
  border-radius: 20rpx; padding: 6rpx 20rpx;
  text { font-size: 22rpx; color: rgba(255,255,255,0.9); }
}
.auth-badge {
  display: flex; align-items: center; gap: 8rpx; margin-top: 4rpx;
  text { font-size: 20rpx; color: rgba(255,255,255,0.75); }
}

/* 滚动区 */
.scroll-body {
  padding: 16rpx 24rpx 0;
  width: 100%;
  box-sizing: border-box;
}

/* 分组卡片 */
.group-card {
  background: #FFFFFF; border-radius: 20rpx;
  margin-bottom: 20rpx; overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}
.group-title {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24rpx 28rpx 16rpx;
  text { font-size: 26rpx; font-weight: bold; color: #303133; }
}
.group-tip { font-size: 21rpx; color: #C0C4CC; font-weight: normal; }

.divider-line { height: 1rpx; background: #F2F6FC; margin: 0 28rpx; }

/* 只读行 */
.info-row {
  display: flex; align-items: center;
  padding: 22rpx 28rpx;
}
.info-label { font-size: 26rpx; color: #606266; width: 160rpx; flex-shrink: 0; }
.info-value { flex: 1; font-size: 26rpx; color: #1A202C; }
.lock-icon { width: 40rpx; display: flex; justify-content: flex-end; }

/* 编辑行 */
.edit-row {
  display: flex; align-items: center;
  padding: 18rpx 28rpx;
}
.edit-label { font-size: 26rpx; color: #606266; width: 160rpx; flex-shrink: 0; }
.edit-input {
  flex: 1; font-size: 26rpx; color: #1A202C;
  padding: 10rpx 0;
}

/* 设置行 */
.setting-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 22rpx 28rpx;
}
.setting-row:active { background: #F8FAFF; }
.setting-left { display: flex; align-items: center; gap: 16rpx; }
.setting-icon {
  width: 64rpx; height: 64rpx; border-radius: 14rpx;
  display: flex; align-items: center; justify-content: center;
}
.setting-name { font-size: 27rpx; color: #303133; }
.setting-hint { font-size: 24rpx; color: #909399; }
.switch-badge {
  padding: 6rpx 18rpx; border-radius: 20rpx; font-size: 21rpx;
}
.switch-badge.on { background: rgba(16,185,129,0.1); color: #10B981; }

/* 退出按钮 */
.logout-btn {
  background: #FFFFFF; border-radius: 20rpx;
  margin: 0 0 20rpx; padding: 32rpx;
  text-align: center;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}
.logout-btn:active { background: #FEF2F2; }
.logout-text { font-size: 28rpx; font-weight: 600; color: #EF4444; }

.version-info { text-align: center; padding: 8rpx; font-size: 21rpx; color: #C0C4CC; }
</style>