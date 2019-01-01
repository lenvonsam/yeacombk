import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import user from './modules/user'
Vue.use(Vuex)

const store = () =>
  new Vuex.Store({
    state: state,
    actions: {
      configVal({ commit }, { key, val }) {
        commit('CONFIGVAL', { key: key, val: val })
      }
    },
    mutations: {
      CONFIGVAL(state, { key, val }) {
        state[key] = val
      }
    },
    modules: {
      user
    }
  })

export default store
