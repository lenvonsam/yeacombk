<template lang="pug">
div
  div
    el-button-group.mb-15(v-if="tableValue.actions && tableValue.actions.length > 0")
      el-button(v-for="(btn, idx) in tableValue.actions", :key="idx", :type="btn.class || 'default'", @click="actionBtnClick(btn.type)", :size="btn.size ? btn.size : 'medium'") {{btn.lbl}}
    .float-right(v-if="rightPart")
      slot(name="right-part")
        el-input(size="medium", placeholder="搜索", v-model="searchVal")
          el-button(slot="append" icon="el-icon-search", @click="rightTopSearch")
  slot(name="searchPart")
  el-table(ref="multipleTable", :data="currentData", v-loading="loading", style="width: 100%", border, @selection-change="handleSelectionChange", @current-change="handleCurrentChange", :default-sort="{order: 'descending'}", size="medium", :filter-change="tableFiler", @sort-change="sortChange")
    el-table-column(v-if="tableValue.hasCbx", type="selection", width="55")    
    template(v-for="head in tableValue.tableHead")
      el-table-column(v-if="head.type == 'link'", :label="head.lbl", :width="head.width ? head.width : 'auto'", :min-width="head.minWidth? head.minWidth : 'auto'")
        template(slot-scope="scope")
          a(:href="head.linkUrl + '?id=' + scope.row.id") {{scope.row[head.prop]}}
      el-table-column(v-else-if="head.type == 'linkObject'", :label="head.lbl", :width="head.width? head.width : 'auto'", :min-width="head.minWidth? head.minWidth : 'auto'")
        template(slot-scope="scope")
          a(:href="head.linkUrl + '?id=' + head.factValue(scope.row[head.prop]).id") {{head.factValue(scope.row[head.prop]).name}}
      el-table-column(v-else-if="head.type == 'object'", :label="head.lbl", :width="head.width? head.width : 'auto'")
        template(slot-scope="scope")
          span {{head.factValue(scope.row)}}
      el-table-column(v-else-if="head.type == 'enum'", :label="head.lbl", :width="head.width? head.width : 'auto'")
        template(slot-scope="scope")
          span {{head.enumMap[scope.row[head.prop]]}}
      el-table-column(v-else-if="head.type == 'action'", :align="head.align ? head.align : 'left'" :fixed="head.fixed", label="操作", :width="head.width ? head.width : 'auto'", :min-width="head.minWidth? head.minWidth : 'auto'")
        template(slot-scope="scope")
          template(v-for="btn in head.actionBtns")
            el-button(type="text", :class="btn.class ? btn.class : 'default'", @click="handleRowBtn(scope.$index, scope.row, btn.type)") {{btn.lbl}}
      el-table-column(v-else-if="head.type == 'object'", :label="head.lbl", :width="head.width? head.width : 'auto'", :min-width="head.minWidth? head.minWidth : 'auto'",  :prop="head.prop", :sortable="head.sort")
        template(slot-scope="scope") {{head.factValue(scope.row[head.prop])}}
      el-table-column(v-else, :label="head.lbl", :prop="head.prop")
  .padding.text-right
    el-pagination(v-if="!tableValue.page", :current-page="currentPage", :page-size="pageSize", background, layout="prev, pager, next, jumper", :total="total", @current-change="pgCurrentChange")

</template>

<script>
import { mapState } from 'vuex'
export default {
  props: {
    tableValue: {
      type: null,
      default: false
    },
    currentPage: {
      type: Number,
      default: 1
    },
    total: {
      type: Number,
      default: 0
    },
    pageSize: {
      type: Number,
      default: 8
    },
    loading: {
      type: Boolean,
      default: false
    },
    rightPart: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      currentData: [],
      regionOptions: [],
      supplyCatalogOptions: [],
      comboOptions: [],
      acctOptions: [],
      orgOptions: [],
      isVerify: true,
      searchVal: ''
    }
  },
  computed: {
    ...mapState({
      currentUser: state => state.user.currentUser
    })
  },
  watch: {
    'tableValue.tableData': {
      handler(newVal, oldVal) {
        this.currentData = Object.assign([], newVal)
      },
      deep: true
    }
  },
  beforeMount() {
    this.$nextTick(() => {
      this.currentData = Object.assign([], this.tableValue.tableData)
    })
  },
  methods: {
    actionBtnClick(type) {
      this.$emit('actionBtnClick', type)
    },
    handleRowBtn(idx, row, btnType) {
      if (btnType === 'edit') {
        this.$emit('rowEdit', idx, row)
      }
    },
    handleSelectionChange(rows) {
      this.$emit('chooseData', rows)
    },
    handleCurrentChange(row) {
      this.$emit('chooseData', row)
    },
    pgCurrentChange(val) {
      this.$emit('pageChange', val)
    },
    rightTopSearch() {
      this.$emit('rightTopSearch', this.searchVal)
    },
    tableFiler(row, col) {
      // console.log('row')
      // console.log(row)
      // console.log('col')
      // console.log(col)
    },
    sortChange(column, prop, order) {
      let obj = {
        sortable: column.sortable,
        order: column.order,
        property: column.prop
      }
      console.log('********** sortChange >>', obj)
      this.$emit('sort', obj)
    }
  }
}
</script>

<style lang="stylus", scoped>
@import '../assets/stylus/color';

.el-table__row {
  .cell {
    a {
      color: $color-main;

      &:hover {
        cursor: pointer;
      }
    }

    i.iconfont.icon-locka:hover, i.iconfont.icon-lockb:hover {
      cursor: pointer;
    }
  }
}
</style>
