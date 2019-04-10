<template lang="pug">
.bk-container
  .bk-content
    .header.row.border-bottom-line
      .flex-200
        .top-brand XXCMS平台
      .flex-120
        h3(@click="jump({path: '/news'})") {{currentUser.currentBucket.name}}
      .col
        el-button(type="text", @click="jump({path: '/account/topIndex'})") 账号管理
        el-button.ml-10(type="text", @click="jump({path: '/menu/topIndex'})") 菜单管理
        el-button.ml-10(type="text", @click="jump({path: '/auth/topIndex'})") 权限管理
      .flex-62
        el-dropdown(@command="topDrowdown")
          img.avatar(:src="avatar")
          el-dropdown-menu.text-center(slot="dropdown")
            el-dropdown-item(command="exit") 退出
    .box-wrap
      .box.top-contain
        nuxt
</template>

<script>
import avatar from '../assets/imgs/yc_bg.jpg'
import { mapState } from 'vuex'
export default {
  middleware: 'userAuth',
  data() {
    return {
      avatar
    }
  },
  computed: {
    ...mapState({
      currentUser: state => state.user.currentUser
    })
  },
  methods: {
    topDrowdown(c) {
      switch (c) {
        case 'exit':
          this.userLogout()
          break
        default:
          break
      }
    },
    async userLogout() {
      console.log('userLogin')
      let data = await this.request(this, { url: '/logout', params: {} })
      this.jump({ path: '/login' })
    }
  }
}
</script>

<style lang="stylus">
@import '../assets/stylus/common';
.top-contain 
  max-width 1280px
  margin 0 auto
  box-sizing border-box
.top-brand
  padding 0 15px
  font-size 1.5em
  font-weight bold
  text-align center
.flex-200 {
  flex 0 0 200px
}

.flex-62 {
  flex: 0 0 62px !important;
}
</style>
