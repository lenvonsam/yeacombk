<template lang="pug">
.ibox
  .ibox-title.row(:style="{display: topHidden ? 'none' : 'block'}")
    .col
      span 新闻列表
    .col.text-right
      slot(name="rightSide")
  .ibox-content
    slot
</template>
<script>
export default {
  props: {
    topHidden: {
      type: Boolean,
      default: true
    }
  }
}
</script>
