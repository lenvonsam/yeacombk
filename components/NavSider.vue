<template lang="pug">
.bk-sidebar(:class="{'toggle': navToggle}")
  el-menu(:collapse="navToggle", background-color="#2f4050", :unique-opened="true", text-color="#a7b1c2", active-text-color="#fff", :collapse-transition="false", default-active="1")
    el-menu-item(index="1") 
      i.el-icon-document
      span 新闻管理
    //- el-submenu(index="1")
      //- template(slot="title")
      //-   i.el-icon-location
      //-   span(slot="title") 新闻管理
      //- el-menu-item-group
      //-   el-menu-item(index="1-1")  
      //-   el-menu-item(index="1-2") {{navToggle}}
</template>
<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState({
      navToggle: state => state.navToggle
    })
  }
}
</script>

<style lang="stylus" scoped>
</style>
