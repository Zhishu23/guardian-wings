import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const userModule = {
  namespaced: true,
  state: {
    uid:      '',
    nickname: '',
    avatar:   '',
    mobile:   '',
    points:   0,
    role:     'public',
    token:    '',
    tokenExpired: 0,
    isLogin:  false,

    gender:   0,
    province: '',
    city:     '',
    bio:      ''
  },
  mutations: {
    SET_USER(state, userInfo) {
      state.uid      = userInfo._id      || userInfo.uid || state.uid || ''
      state.nickname = userInfo.nickname || ''
      state.avatar   = userInfo.avatar   || ''
      state.mobile   = userInfo.mobile   || state.mobile || ''
      state.points   = userInfo.points   !== undefined ? userInfo.points : state.points
      state.role     = userInfo.role     || 'public'
      state.token    = userInfo.token    || state.token || ''
      state.tokenExpired = userInfo.tokenExpired || state.tokenExpired || 0
      state.isLogin  = true

      state.gender   = userInfo.gender   !== undefined ? Number(userInfo.gender) : 0
      state.province = userInfo.province || ''
      state.city     = userInfo.city     || ''
      state.bio      = userInfo.bio      || ''
    },
    SET_TOKEN(state, token) {
      state.token = token
    },
    LOGOUT(state) {
      state.uid      = ''
      state.nickname = ''
      state.avatar   = ''
      state.mobile   = ''
      state.points   = 0
      state.role     = 'public'
      state.token    = ''
      state.tokenExpired = 0
      state.isLogin  = false
      state.gender   = 0
      state.province = ''
      state.city     = ''
      state.bio      = ''
    },
    UPDATE_POINTS(state, points) {
      state.points = points
    }
  },
  actions: {
    login({ commit }, userInfo) {
      commit('SET_USER', userInfo)
      if (userInfo && userInfo.token) {
        commit('SET_TOKEN', userInfo.token)
      }
    },
    logout({ commit }) {
      commit('LOGOUT')
      uni.removeStorageSync('gw_user_info')
      uni.removeStorageSync('gw_token')
    }
  },
  getters: {
    isLogin:  state => state.isLogin,
    uid:      state => state.uid,
    userInfo: state => state
  }
}


export default new Vuex.Store({
  modules: {
    user: userModule
  }
})
