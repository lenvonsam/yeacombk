<template lang="pug">
div
  el-checkbox-group(v-model="groups")
    el-checkbox(v-for="(cbx,idx) in cbxs", :label="cbx", :key="idx")
</template>

<script>
export default {
  props: {
    cbxs: {
      type: Array,
      required: true
    },
    rIdx: {
      type: Number,
      default: -1
    },
    chooseGroup: {
      type: null,
      default: false
    }
  },
  data() {
    return {
      groups: []
    }
  },
  watch: {
    groups: {
      handler(newVal, oldVal) {
        this.$emit('change', newVal, this.rIdx)
      },
      deep: true
    },
    chooseGroup: {
      handler(newVal, oldVal) {
        console.log(newVal)
        if (newVal) this.groups = newVal
      },
      deep: true
    }
  },
  beforeMount() {
    if (this.chooseGroup) this.groups = this.chooseGroup
  }
}
</script>
