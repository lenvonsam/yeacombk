<template lang="pug">
.bk-container
  nav-sider
  .bk-content
    nav-header 
    .box-wrap
      nuxt
  .clearfix

</template>

<script>
import navHeader from '../components/NavHeader.vue'
import navSider from '../components/NavSider.vue'
export default {
  middleware: 'userAuth',
  components: {
    navHeader,
    navSider
  },
  data: function() {
    return {
      isCollapse: false
    }
  }
}
</script>

<style lang="stylus">
@import "../assets/stylus/common"
.product-preview 
  img
    width 100%
.ql-header.ql-picker .ql-picker-label
  top 0px !important

</style>
