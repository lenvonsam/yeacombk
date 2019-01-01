export default {
  actions: {
    nuxtServerInit({ commit }, { req }) {
      //   console.log('user req', req.session)
      if (req.session && req.session.currentUser) {
        // console.log(req.session.currentUser)
        commit('SETUSER', req.session.currentUser)
      } else {
        commit('EXITUSER')
      }
    },
    setUser({ commit }, usr) {
      commit('SETUSER', usr)
    },
    exitUser({ commit }) {
      commit('EXITUSER')
    }
  },
  state: {
    currentUser: {},
    isLogin: false
  },
  mutations: {
    SETUSER(state, usr) {
      state.currentUser = usr
      state.isLogin = true
    },
    EXITUSER(state) {
      state.currentUser = {}
      state.isLogin = false
    }
  }
}
