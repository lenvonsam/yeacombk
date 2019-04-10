<template lang="pug">
div
  el-tag(type="primary") 菜单权限设置
  .padding.pr-0
    el-steps(:active="stepIdx")
      el-step(title="设置菜单")
      el-step(title="分配权限")
      el-step(title="提交")
  .padding.pt-0.pb-0.text-right
    template(v-if="stepIdx == 1")
      el-button(size="small", @click="nextStep") 下一步
    template(v-else)
      el-button(size="small", @click="preStep") 上一步
      el-button(size="small", @click="stepFinish") 提交

  .padding(v-if="stepIdx == 1")
    el-transfer(filterable, :titles="['未分配菜单', '已分配菜单']", style="margin: 0 auto", :data="originMenuData", :props="{key: 'id', label: 'name'}", v-model="chooseData")
  .padding(v-else)
    el-table(border, :span-method="tableRowSpan", :data="menuList", v-if="menuList.length > 0")
      el-table-column(label="一级菜单", width="100")
        template(slot-scope="scope") {{scope.row.parent ? scope.row.parent.name : scope.row.name}}
      el-table-column(label="二级菜单", width="120")
        template(slot-scope="scope") {{scope.row.parent ? scope.row.name : '无'}}
      el-table-column(label="权限")
        template(slot-scope="scope")
          cbx-group(:cbxs="rowCbxLbl", @change="cbxChange", :rIdx="scope.$index", :chooseGroup="scope.row.authConfig")
  
</template>

<script>
import _ from 'lodash'
import cbxGroup from '../../CbxGroup.vue'
export default {
  components: {
    cbxGroup
  },
  props: {
    parentStepIdx: {
      type: Number,
      default: 1
    },
    parentMenuData: {
      type: Array,
      required: true
    },
    auths: {
      type: null,
      default: false
    }
  },
  data() {
    return {
      stepIdx: 1,
      originMenuData: [],
      chooseData: [],
      menuGroupList: [],
      rowCbxLbl: ['新增', '修改', '删除']
    }
  },
  watch: {
    parentStepIdx(newVal, oldVal) {
      if (newVal != this.stepIdx) this.stepIdx = this.parentStepIdx
    },
    originMenuData: {
      handler(newVal, oldVal) {
        this.originMenuData = newVal
        if (newVal.length == 0) {
          this.chooseData = []
        }
      },
      deep: true
    },
    auths: {
      handler(newVal, oldVal) {
        this.chooseData = newVal.map(itm => itm.menu.id)
      }
    }
  },
  beforeMount() {
    if (this.auths) this.chooseData = this.auths.map(itm => itm.menu.id)
    this.stepIdx = this.parentStepIdx
    this.originMenuData = this.parentMenuData
    console.log('origin_menu_data:>>', this.originMenuData)
  },
  methods: {
    renderFunc(h, opt) {
      return h('span', opt.parent.name + '-' + opt.name)
    },
    stepFinish() {
      this.stepIdx = 1
      console.log('menuList:>>', this.menuList)
      this.$emit('transferResult', this.menuList)
      this.$emit('currentStepIndex', this.stepIdx)
    },
    nextStep() {
      let filterArr = this.originMenuData.filter(itm =>
        this.chooseData.includes(itm.id)
      )
      if (filterArr.length === 0) {
        this.msgShow(this, '请选择分配的菜单', 'warning')
        return
      }
      this.menuGroupList = _.groupBy(filterArr, itm => {
        return itm.parent ? itm.parent.id : 'null'
      })
      this.menuList = Object.assign([], filterArr)
      this.stepIdx = 2
      console.log(this.auths)
      if (this.auths && this.auths.length > 0) {
        // TODO 更新数据
        this.menuList.map((itm, idx) => {
          if (this.chooseData.includes(itm.id)) {
            let ridx = this.auths.findIndex(auth => auth.menu.id === itm.id)
            let tempArr = []
            if (ridx > -1) {
              let temp = Object.assign({}, this.auths[ridx])
              if (temp.createAuth) tempArr.push('新增')
              if (temp.updateAuth) tempArr.push('修改')
              if (temp.deleteAuth) tempArr.push('删除')
              itm.authId = temp.id
            }
            itm.authConfig = tempArr
          }
        })
      }
      this.$emit('currentStepIndex', this.stepIdx)
    },
    preStep() {
      this.stepIdx = 1
      this.$emit('currentStepIndex', this.stepIdx)
    },
    tableRowSpan({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        let firstName = row.parent
          ? this.menuGroupList[row.parent.id][0].name
          : 'null'
        if (firstName == 'null') {
          return {
            rowspan: 1,
            colspan: 1
          }
        } else if (row.name === firstName) {
          return {
            rowspan: this.menuGroupList[row.parent.id].length,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
    },
    cbxChange(val, idx) {
      this.menuList[idx].authConfig = val
    }
  }
}
</script>

<style lang="stylus" scoped>
.max-80 {
  max-width: 80%;
}
</style>
