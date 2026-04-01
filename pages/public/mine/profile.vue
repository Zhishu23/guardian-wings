<template>
  <view class="profile-page">
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <svg viewBox="0 0 24 24" style="width:44rpx;height:44rpx;">
          <path d="M15 18l-6-6 6-6" stroke="#1C1C1E" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </view>
      <text class="nav-title">个人资料</text>
      <view style="width:64rpx;" />
    </view>

    <scroll-view scroll-y class="scroll-wrap">
      <view class="group-gap" />
      <view class="cell-group">
        <!-- 头像 -->
        <view class="cell cell-tap" @click="chooseAvatar">
          <text class="cell-label">头像</text>
          <view class="cell-right">
            <image :src="form.avatar || defaultAvatar" mode="aspectFill" class="avatar-thumb" />
            <svg viewBox="0 0 24 24" style="width:28rpx;height:28rpx;margin-left:12rpx;">
              <path d="M9 6l6 6-6 6" stroke="#C7C7CC" stroke-width="2" fill="none" stroke-linecap="round"/>
            </svg>
          </view>
        </view>
        <view class="cell-line" />
        <!-- 名字 -->
        <view class="cell cell-tap" @click="editField('nickname','修改名字',15)">
          <text class="cell-label">名字</text>
          <view class="cell-right">
            <text class="cell-value">{{ form.nickname || '未设置' }}</text>
            <svg viewBox="0 0 24 24" style="width:28rpx;height:28rpx;margin-left:12rpx;">
              <path d="M9 6l6 6-6 6" stroke="#C7C7CC" stroke-width="2" fill="none" stroke-linecap="round"/>
            </svg>
          </view>
        </view>
        <view class="cell-line" />
        <!-- 性别 -->
        <view class="cell cell-tap" @click="showGenderModal = true">
          <text class="cell-label">性别</text>
          <view class="cell-right">
            <text class="cell-value">{{ genderLabel }}</text>
            <svg viewBox="0 0 24 24" style="width:28rpx;height:28rpx;margin-left:12rpx;">
              <path d="M9 6l6 6-6 6" stroke="#C7C7CC" stroke-width="2" fill="none" stroke-linecap="round"/>
            </svg>
          </view>
        </view>
        <view class="cell-line" />
        <!-- 地区 -->
        <view class="cell cell-tap" @click="editRegion">
          <text class="cell-label">地区</text>
          <view class="cell-right">
            <text class="cell-value">{{ regionLabel }}</text>
            <svg viewBox="0 0 24 24" style="width:28rpx;height:28rpx;margin-left:12rpx;">
              <path d="M9 6l6 6-6 6" stroke="#C7C7CC" stroke-width="2" fill="none" stroke-linecap="round"/>
            </svg>
          </view>
        </view>
        <view class="cell-line" />
        <!-- 手机号 -->
        <view class="cell">
          <text class="cell-label">手机号</text>
          <view class="cell-right">
            <text class="cell-value">{{ maskedMobile }}</text>
          </view>
        </view>
        <view class="cell-line" />
        <!-- 注册时间 -->
        <view class="cell">
          <text class="cell-label">注册时间</text>
          <view class="cell-right">
            <text class="cell-value gray">{{ registerDate || '加载中...' }}</text>
          </view>
        </view>
      </view>

      <view class="group-gap" />
      <view class="cell-group">
        <!-- 签名 -->
        <view class="cell cell-tap" @click="editField('bio','个性签名',30)">
          <text class="cell-label">签名</text>
          <view class="cell-right">
            <text class="cell-value gray">{{ form.bio || '未填写' }}</text>
            <svg viewBox="0 0 24 24" style="width:28rpx;height:28rpx;margin-left:12rpx;">
              <path d="M9 6l6 6-6 6" stroke="#C7C7CC" stroke-width="2" fill="none" stroke-linecap="round"/>
            </svg>
          </view>
        </view>
      </view>
      <view class="group-gap" />
    </scroll-view>

    <!-- 通用文字编辑弹窗 -->
    <view class="modal-mask" v-if="editModal.show" @click.self="editModal.show = false">
      <view class="modal-card">
        <text class="modal-title">{{ editModal.title }}</text>
        <view class="modal-input-wrap">
          <input v-model="editModal.val" :maxlength="editModal.max"
            placeholder-style="color:#C7C7CC;font-size:30rpx;"
            :placeholder="`请输入${editModal.title}`"
            class="modal-input" :focus="editModal.show" />
          <text class="char-count">{{ editModal.val.length }}/{{ editModal.max }}</text>
        </view>
        <view class="modal-actions">
          <view class="modal-btn cancel-btn" @click="editModal.show = false"><text>取消</text></view>
          <view class="modal-btn confirm-btn" @click="confirmEdit"><text>确定</text></view>
        </view>
      </view>
    </view>

    <!-- 性别弹窗 -->
    <view class="modal-mask" v-if="showGenderModal" @click.self="showGenderModal = false">
      <view class="modal-card">
        <text class="modal-title">选择性别</text>
        <view class="gender-opts">
          <view v-for="g in [{v:1,l:'男'},{v:2,l:'女'},{v:0,l:'保密'}]" :key="g.v"
            class="gender-item" :class="{ active: form.gender === g.v }"
            @click="selectGender(g.v)">
            <text>{{ g.l }}</text>
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
      defaultAvatar: '/static/icons/avatar.png',
      uid: '',
      form: { nickname:'', avatar:'', gender:0, province:'', city:'', mobile:'', bio:'' },
      originalForm: {},
      registerDate: '',
      showGenderModal: false,
      editModal: { show: false, field: '', title: '', val: '', max: 15 }
    }
  },
  computed: {
    genderLabel() { return {0:'保密',1:'男',2:'女'}[this.form.gender] || '保密' },
    regionLabel() {
      if (this.form.province && this.form.city) return `${this.form.province} ${this.form.city}`
      return this.form.province || '未设置'
    },
    maskedMobile() { return this.form.mobile || '未绑定' }
  },
  onLoad() {
    this.uid = this.$store.state.user.uid || ''
    this.loadUserInfo()
  },
  methods: {
    goBack() {
      if (JSON.stringify(this.form) !== JSON.stringify(this.originalForm)) {
        this.saveProfile(true).then(() => uni.navigateBack())
      } else { uni.navigateBack() }
    },
    async loadUserInfo() {
      if (!this.uid) return
      const s = this.$store.state.user
      this.form.nickname = s.nickname || ''
      this.form.avatar   = s.avatar   || ''
      try {
        const res = await uniCloud.callFunction({
          name: 'gw-user',
          data: { action: 'getUserInfo', params: { uid: this.uid } }
        })
        if (res.result.code === 0) {
          const u = res.result.data
          this.form = { nickname:u.nickname||'', avatar:u.avatar||'', gender:u.gender||0,
            province:u.province||'', city:u.city||'', mobile:u.mobile||'', bio:u.bio||'' }
          if (u.register_date) {
            const d = new Date(u.register_date)
            this.registerDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
          }
        }
      } catch(e) {}
      this.originalForm = JSON.parse(JSON.stringify(this.form))
    },
    chooseAvatar() {
      uni.chooseImage({ count:1, sizeType:['compressed'], sourceType:['album','camera'],
        success: async res => {
          uni.showLoading({ title:'上传中...' })
          try {
            const up = await uniCloud.uploadFile({ filePath:res.tempFilePaths[0], cloudPath:`avatars/${this.uid}_${Date.now()}.jpg` })
            uni.hideLoading()
            if (up.fileID) { this.form.avatar = up.fileID; await this.saveProfile(true); uni.showToast({ title:'头像已更新', icon:'success' }) }
          } catch(e) { uni.hideLoading(); uni.showToast({ title:'上传失败', icon:'none' }) }
        }
      })
    },
    editField(field, title, max) {
      this.editModal = { show:true, field, title, val:this.form[field]||'', max }
    },
    confirmEdit() {
      const val = this.editModal.val.trim()
      if (this.editModal.field === 'nickname' && !val) { uni.showToast({ title:'名字不能为空', icon:'none' }); return }
      this.form[this.editModal.field] = val
      this.editModal.show = false
      this.saveProfile(true)
    },
    selectGender(val) { this.form.gender = val; this.showGenderModal = false; this.saveProfile(true) },
    editRegion() {
      uni.showModal({ title:'输入地区', editable:true, placeholderText:'如：广东省 广州市',
        success: res => {
          if (res.confirm && res.content) {
            const p = res.content.trim().split(/\s+/)
            this.form.province = p[0]||''; this.form.city = p[1]||''
            this.saveProfile(true)
          }
        }
      })
    },
    async saveProfile(silent = false) {
      if (!this.uid) return
      try {
        const res = await uniCloud.callFunction({
          name:'gw-user', data:{ action:'updateProfile',
            params:{ uid:this.uid, nickname:this.form.nickname, avatar:this.form.avatar,
              gender:this.form.gender, province:this.form.province, city:this.form.city, bio:this.form.bio } }
        })
        if (res.result.code === 0) {
          this.$store.dispatch('user/login', { ...this.$store.state.user, nickname:this.form.nickname, avatar:this.form.avatar })
          this.originalForm = JSON.parse(JSON.stringify(this.form))
          if (!silent) uni.showToast({ title:'保存成功', icon:'success' })
        }
      } catch(e) { if (!silent) uni.showToast({ title:'保存失败', icon:'none' }) }
    }
  }
}
</script>

<style scoped lang="scss">
page { background: #EFEFF4; }
.profile-page { min-height: 100vh; background: #EFEFF4; }
.nav-bar { display:flex; align-items:center; justify-content:space-between; padding:88rpx 32rpx 20rpx; background:#FFFFFF; }
.nav-back { width:64rpx; height:64rpx; display:flex; align-items:center; justify-content:center; }
.nav-title { font-size:34rpx; font-weight:600; color:#1C1C1E; }
.scroll-wrap { height:calc(100vh - 160rpx); }
.group-gap { height:24rpx; }
.cell-group { background:#FFFFFF; }
.cell { display:flex; align-items:center; justify-content:space-between; padding:0 32rpx; min-height:112rpx; }
.cell-tap { transition:background 0.15s; }
.cell-tap:active { background:#F7F7F7; }
.cell-label { font-size:34rpx; color:#1C1C1E; }
.cell-right { display:flex; align-items:center; max-width:68%; }
.cell-value { font-size:32rpx; color:#1C1C1E; text-align:right; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.cell-value.gray { color:#8E8E93; }
.avatar-thumb { width:96rpx; height:96rpx; border-radius:12rpx; background:#E5E5EA; }
.cell-line { height:1rpx; background:#E5E5EA; margin-left:32rpx; }
.modal-mask { position:fixed; inset:0; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:999; }
.modal-card { width:620rpx; background:#FFFFFF; border-radius:24rpx; padding:48rpx 40rpx 40rpx; }
.modal-title { display:block; font-size:34rpx; font-weight:600; color:#1C1C1E; text-align:center; margin-bottom:40rpx; }
.modal-input-wrap { background:#F2F2F7; border-radius:12rpx; padding:0 28rpx; height:88rpx; display:flex; align-items:center; margin-bottom:8rpx; }
.modal-input { flex:1; font-size:30rpx; color:#1C1C1E; }
.char-count { font-size:24rpx; color:#C7C7CC; flex-shrink:0; }
.modal-actions { display:flex; gap:20rpx; margin-top:32rpx; }
.modal-btn { flex:1; height:88rpx; border-radius:12rpx; display:flex; align-items:center; justify-content:center; }
.cancel-btn { background:#F2F2F7; }
.cancel-btn text { font-size:30rpx; color:#8E8E93; font-weight:500; }
.confirm-btn { background:#07C160; }
.confirm-btn text { font-size:30rpx; color:#FFFFFF; font-weight:600; }
.gender-opts { display:flex; gap:16rpx; }
.gender-item { flex:1; height:88rpx; border-radius:12rpx; background:#F2F2F7; display:flex; align-items:center; justify-content:center; border:2rpx solid transparent; transition:all 0.2s; }
.gender-item.active { background:rgba(7,193,96,0.08); border-color:#07C160; }
.gender-item text { font-size:30rpx; color:#1C1C1E; font-weight:500; }
.gender-item.active text { color:#07C160; font-weight:600; }
</style>