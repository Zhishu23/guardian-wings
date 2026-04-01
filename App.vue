<script>
export default {
  onLaunch() {
    this.restoreLogin()
    this.restorePolice()
  },
  methods: {
    restoreLogin() {
      try {
        const userInfo = uni.getStorageSync('gw_user_info')
        const token    = uni.getStorageSync('gw_token')
        if (userInfo && token) {
          const parsed = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo
          this.$store.commit('user/SET_USER', parsed)
          this.$store.commit('user/SET_TOKEN', token)
        }
      } catch (e) {}
    },
    restorePolice() {
      try {
        const info = uni.getStorageSync('gw_police_info')
        if (info) {
          const parsed = typeof info === 'string' ? JSON.parse(info) : info
          this.$store.commit('police/SET_POLICE', parsed)
        }
      } catch (e) {}
    }
  }
}
</script>