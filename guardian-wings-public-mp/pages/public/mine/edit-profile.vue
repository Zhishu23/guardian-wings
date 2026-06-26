<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @click="goBack"><text>‹ 返回</text></view>
      <text class="nav-title">编辑资料</text>
      <view class="nav-save" @click="save"><text>保存</text></view>
    </view>

    <view class="form-list">
      <!-- 头像 -->
      <view class="form-item avatar-item" @click="chooseAvatar">
        <text class="form-label">头像</text>
        <view class="form-right">
          <image :src="form.avatar || '/static/icons/avatar.png'" class="avatar-img" mode="aspectFill"/>
          <text class="form-arrow">›</text>
        </view>
      </view>

      <!-- 昵称 -->
      <view class="form-item">
        <text class="form-label">昵称</text>
        <input class="form-input" v-model="form.nickname" placeholder="请输入昵称" maxlength="20"/>
      </view>

      <!-- 性别 -->
      <view class="form-item" @click="showGenderPicker">
        <text class="form-label">性别</text>
        <view class="form-right">
          <text class="form-value">{{ genderLabel }}</text>
          <text class="form-arrow">›</text>
        </view>
      </view>

      <!-- 省份 -->
      <view class="form-item">
        <text class="form-label">省份</text>
        <input class="form-input" v-model="form.province" placeholder="请输入省份"/>
      </view>

      <!-- 城市 -->
      <view class="form-item">
        <text class="form-label">城市</text>
        <input class="form-input" v-model="form.city" placeholder="请输入城市"/>
      </view>

      <!-- 个人简介 -->
      <view class="form-item bio-item">
        <text class="form-label">简介</text>
        <textarea class="form-textarea" v-model="form.bio" placeholder="介绍一下自己吧..." maxlength="100"/>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        nickname: '',
        avatar:   '',
        gender:   0,
        province: '',
        city:     '',
        bio:      ''
      }
    }
  },

  computed: {
    genderLabel() {
      return ['保密', '男', '女'][this.form.gender] || '保密'
    }
  },

  onLoad() {
    this.loadForm()
  },

  methods: {
    loadForm() {
     
      try {
        const stored = uni.getStorageSync('gw_user_info')
        const u = stored ? (typeof stored === 'string' ? JSON.parse(stored) : stored) : this.$store.state.user
        this.form = {
          nickname: u.nickname || '',
          avatar:   u.avatar   || '',
          gender:   u.gender   !== undefined ? Number(u.gender) : 0,
          province: u.province || '',
          city:     u.city     || '',
          bio:      u.bio      || ''
        }
      } catch (e) {
        const u = this.$store.state.user
        this.form = {
          nickname: u.nickname || '',
          avatar:   u.avatar   || '',
          gender:   0,
          province: '',
          city:     '',
          bio:      ''
        }
      }
    },

    async chooseAvatar() {
      uni.chooseImage({
        count: 1,
        success: async res => {
          uni.showLoading({ title: '上传中...' })
          try {
            const uploadRes = await uniCloud.uploadFile({
              filePath:  res.tempFilePaths[0],
              cloudPath: `avatars/${this.$store.state.user.uid}_${Date.now()}.jpg`
            })
            this.form.avatar = uploadRes.fileID
            uni.hideLoading()
          } catch (e) {
            uni.hideLoading()
            uni.showToast({ title: '上传失败', icon: 'none' })
          }
        }
      })
    },

    showGenderPicker() {
      uni.showActionSheet({
        itemList: ['保密', '男', '女'],
        success: res => { this.form.gender = res.tapIndex }
      })
    },

    async save() {
      if (!this.form.nickname.trim()) {
        return uni.showToast({ title: '昵称不能为空', icon: 'none' })
      }
      uni.showLoading({ title: '保存中...' })
      try {
        const uid = this.$store.state.user.uid
        const res = await uniCloud.callFunction({
          name: 'gw-public-user',
          data: {
            action: 'updateProfile',
            params: { uid, ...this.form }
          }
        })
        uni.hideLoading()
        if (res.result.code === 0) {
          // 构建完整的新用户信息对象
          const currentUser = this.$store.state.user
          const newUserInfo = {
            ...currentUser,
            nickname: this.form.nickname,
            avatar:   this.form.avatar,
            gender:   this.form.gender,
            province: this.form.province,
            city:     this.form.city,
            bio:      this.form.bio
          }

         
          this.$store.commit('user/SET_USER', newUserInfo)

          // 覆盖写入 localStorage，不做 merge 避免旧脏数据
          uni.setStorageSync('gw_user_info', JSON.stringify(newUserInfo))

          uni.showToast({ title: '保存成功', icon: 'success' })
          setTimeout(() => uni.navigateBack(), 1000)
        } else {
          uni.showToast({ title: res.result.msg || '保存失败', icon: 'none' })
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
.page { min-height: 100vh; background: #EFEFF4; }
.nav-bar { display: flex; align-items: center; justify-content: space-between; padding: 88rpx 32rpx 20rpx; background: #FFFFFF; }
.nav-back text, .nav-save text { font-size: 30rpx; color: #2563EB; }
.nav-title { font-size: 34rpx; font-weight: 600; color: #1C1C1E; }
.form-list { margin-top: 20rpx; background: #FFFFFF; }
.form-item { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 32rpx; border-bottom: 1rpx solid #F3F4F6; }
.form-label { font-size: 28rpx; color: #1C1C1E; width: 120rpx; flex-shrink: 0; }
.form-input { flex: 1; font-size: 28rpx; color: #3C3C3E; text-align: right; }
.form-right { display: flex; align-items: center; gap: 12rpx; }
.form-value { font-size: 28rpx; color: #8E8E93; }
.form-arrow { font-size: 36rpx; color: #C4C4C6; }
.avatar-img { width: 80rpx; height: 80rpx; border-radius: 50%; }
.bio-item { align-items: flex-start; flex-direction: column; gap: 16rpx; }
.form-textarea { width: 100%; height: 160rpx; font-size: 28rpx; color: #3C3C3E; }
</style>