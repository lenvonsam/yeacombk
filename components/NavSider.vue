<template lang="pug">
.bk-sidebar(:class="{'toggle': navToggle}")
  el-menu(:collapse="navToggle", background-color="#2f4050", :unique-opened="true", text-color="#a7b1c2", active-text-color="#fff", :collapse-transition="false", :default-active="$route.path", router)
    template(v-for="(menu, idx) in currentMenus")
      el-submenu(v-if="menu.items", :index="'-'+idx")
        template(slot="title")
          i(:class="menu.icon", v-if="menu.icon")
          span {{menu.title}}
        el-menu-item-group
          el-menu-item(v-for="(sub,sidx) in menu.items", :index="sub.path", :key="idx + '-' + sidx")
            span {{sub.title}}
      el-menu-item(v-else, :index="menu.path")
        i(:class="menu.icon", v-if="menu.icon")
        span {{menu.title}}
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
      navToggle: state => state.navToggle,
      currentMenus: state => state.currentMenus
    })
  }
}
</script>

<style lang="stylus" scoped>
</style>
