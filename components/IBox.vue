<template lang="pug">
.ibox
  .ibox-title.row(:style="{display: topHidden ? 'none' : 'block'}")
    .col
      span {{title}}
    .col.text-right
      slot(name="rightSide")
  .ibox-content(:style="{borderTop: topHidden ? '0px' : '1px solid #e7eaec'}")
    slot
</template>
<script>
export default {
  props: {
    topHidden: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: '新闻列表'
    }
  }
}
</script>
