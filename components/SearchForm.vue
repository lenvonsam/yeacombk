<template lang="pug">
.search-box(v-if="localSearchItems.length > 0") 
  .row
    .col
      .row.flex-center.flex-content-center.pr-10(:style="{'margin-bottom': (idx < localSearchItems.length - 1) ? '15px' : '0px'}", v-for="(item, idx) in localSearchItems")
        template(v-for="subitm in item")
          template(v-if="subitm == ''")
            .col.flex-90
            .col
          template(v-else)
            .text-right.pr-15.flex-90
              label {{subitm.lbl}}
            .col.pr-10
              el-input(size="small", v-model="subitm.val")
    .flex-column.flex-center.flex-content-center.flex.flex-150
      .col.flex-35
        el-button(size="small", type="primary", @click="searchContent") 搜索
        el-button(size="small", @click="resetSearch") 重置
</template>

<script>
export default {
  props: {
    grid: {
      type: Number,
      default: 3
    },
    searchItems: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      localSearchItems: [],
      originItems: []
    }
  },
  watch: {
    searchItems: {
      handler(newVal, oldVal) {
        this.originItems = newVal
        this.localSearchItems = this.One2DArray(newVal, this.grid)
        // this.$forceUpdate()
      },
      deep: true
    }
  },
  beforeMount() {
    this.originItems = Object.assign([], this.searchItems)
    this.localSearchItems = this.One2DArray(this.originItems, this.grid)
  },
  methods: {
    searchContent() {
      let valArr = this.originItems.filter(
        itm => itm.val.toString().trim().length > 0
      )
      this.$emit('searchContent', valArr)
    },
    resetSearch() {
      this.originItems.map(itm => {
        itm.val = ''
      })
      this.localSearchItems = this.One2DArray(this.originItems, this.grid)
    }
  }
}
</script>

<style lang="stylus" scoped>
.search-box {
  border: 1px dashed #ddd;
  padding-top: 15px;
  padding-bottom: 15px;
}

.flex-90 {
  flex: 0 0 90px;
}

.flex-150 {
  flex: 0 0 150px;
}

.flex-35 {
  flex: 0 0 35px;
}
</style>
