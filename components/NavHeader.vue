<template lang="pug">
.header.row.border-bottom-line
  .col.pl-15.flex-80
    el-button(@click="navSwitch", size="small", type="primary") 
      i.fa.fa-outdent
  .col
    h2 新闻管理
  //- .col(style="flex: 0 0 85px")
    el-button(icon="el-icon-search", size="small") 搜索
  .col.flex-62
    el-dropdown(@command="topDrowdown")
      img.avatar(:src="avatar")
      el-dropdown-menu.text-center(slot="dropdown")
        //- el-dropdown-item.border-bottom-line(command="profile") 个人中心
        el-dropdown-item(command="bucketList", v-if="(currentUser.buckets.length > 1 || currentUser.acctLevel == 3)") 空间切换
        el-dropdown-item(command="exit") 退出
</template>

<script>
import avatar from '../assets/imgs/yc_bg.jpg'
import { mapActions, mapState } from 'vuex'
export default {
  data: function() {
    return {
      avatar: avatar,
      isToggle: false
    }
  },
  computed: {
    ...mapState({
      currentUser: state => state.user.currentUser
    })
  },
  beforeMount() {
    console.log('currentUser', this.currentUser)
  },
  methods: {
    ...mapActions(['configVal']),
    navSwitch() {
      this.isToggle = !this.isToggle
      this.configVal({ key: 'navToggle', val: this.isToggle })
    },
    topDrowdown(c) {
      switch (c) {
        case 'exit':
          this.userLogout()
          break
        case 'bucketList':
          this.jump({ path: '/bucket' })
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

<style lang="stylus", scoped>
.flex-62 {
  flex: 0 0 62px !important;
}
</style>
