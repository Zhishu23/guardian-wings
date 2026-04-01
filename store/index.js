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
    role:     'user',
    token:    '',
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
      state.role     = userInfo.role     || 'user'
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
      state.role     = 'user'
      state.token    = ''
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


const policeModule = {
  namespaced: true,
  state: {
    officer_id:  '',
    name:        '',
    department:  '',
    badge_no:    '',
    isLogin:     false
  },
  mutations: {
    SET_POLICE(state, info) {
      state.officer_id = info.officer_id || info._id || ''
      state.name       = info.name       || ''
      state.department = info.department || ''
      state.badge_no   = info.badge_no   || ''
      state.isLogin    = true
    },
    POLICE_LOGOUT(state) {
      state.officer_id = ''
      state.name       = ''
      state.department = ''
      state.badge_no   = ''
      state.isLogin    = false
    }
  },
  actions: {
    login({ commit }, info) {
      commit('SET_POLICE', info)
    },
	policeLogin({ commit }, info) {
	  commit('SET_POLICE', info)
	},
    logout({ commit }) {
      commit('POLICE_LOGOUT')
      uni.removeStorageSync('gw_police_info')
    }
  },
  getters: {
    isLogin:    state => state.isLogin,
    officerId:  state => state.officer_id,
    policeInfo: state => state
  }
}

export default new Vuex.Store({
  modules: {
    user:   userModule,
    police: policeModule
  }
})