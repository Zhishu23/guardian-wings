<script>
export default {
  onLaunch() {
    this.restoreLogin()
  },
  methods: {
    restoreLogin() {
      try {
        const userInfo = uni.getStorageSync('gw_user_info')
        const storedToken = uni.getStorageSync('gw_token')
        if (userInfo) {
          const parsed = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo
          const token = storedToken || parsed.token || ''
          this.$store.commit('user/SET_USER', parsed)
          if (token) this.$store.commit('user/SET_TOKEN', token)
        }
      } catch (e) {}
    }
  }
}
</script>
