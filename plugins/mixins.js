import Vue from 'vue'
import elementUtil from '../utils/elemtUtil'

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const minixs = {
  watch: {
    '$store.state.globalSuccessMsg'(newVal, oldVal) {
      if (newVal !== '') this.msgShow(this, newVal, 'success')
    },
    '$store.state.globalErrorMsg'(newVal, oldVal) {
      if (newVal !== '') this.msgShow(this, newVal)
    }
  },
  methods: {
    jump(to) {
      if (this.$router) this.$router.push(to)
    },
    back() {
      if (this.$router) this.$router.go(-1)
    },
    date2Str(date) {
      if (date) {
        let years = date.getFullYear()
        let month = date.getMonth() + 1
        let day = date.getDate()
        return [years, month, day].map(formatNumber).join('-')
      } else {
        return ''
      }
    },
    request(ctx, config) {
      console.log('domain:>', window.location.host)
      return ctx.$axios({
        method: 'post',
        url: 'http://' + window.location.host + config.url,
        data: config.params
      })
    },
    proxy(ctx, url, method = 'get', params = {}) {
      return this.request(ctx, {
        url: '/proxy',
        params: {
          method,
          url,
          params
        }
      })
    },
    formValidate(ctx, formName) {
      return new Promise((resolve, reject) => {
        ctx.$refs[formName].validate(valid => {
          if (valid) {
            resolve('success')
          } else {
            reject(new Error('valid fail'))
            return
          }
        })
      })
    },
    pageShow: elementUtil.pageShow,
    pageHide: elementUtil.pageHide,
    msgShow: elementUtil.msgShow,
    confirmDialog: elementUtil.confirmDialog
  }
}
Vue.mixin(minixs)
