<template lang="pug">
  .box
    .padding
      el-row
        el-col(:span="12")
          el-button-group
            el-button(type="primary", @click="jump({path: '/recruit/form'})") 新增
            el-button(type="warning", @click="batchAction(1)") 上架
            el-button(type="danger", @click="batchAction(2)") 下架
            //- el-button(type="danger", @click="batchDel") 删除
            //- el-button(type="info",@click="handleDownload") 导出
        el-col.text-right(:span="12")
          //- el-input(v-model="searchTitle", placeholder="标题")
            el-button(slot="append", icon="el-icon-search")
      el-row
        el-col(:span="24", style="padding-top:15px")
          el-table(:data="tableData",border,tooltip-effect="dark", style="width:100%", @selection-change="handleSelectionChange")
            el-table-column(type="selection",width="55")
            el-table-column(label="职位", width="150", prop="job")
            el-table-column(label="公司",prop="company")
            el-table-column(label="地点",prop="location")
            el-table-column(label="薪资",prop="salaryDescription")
            //- el-table-column(label="标签")
              template(slot-scope="scope")
                el-tag(v-for="itm in scope.row.tags", size="mini", type="info", :key="itm.id") {{itm.name}}
            el-table-column(label="发布时间", :formatter="dateFormatter")
            //- el-table-column(label="发布顺序", prop="factOrder")
            el-table-column(label="优先级", prop="factOrder")
            el-table-column(label="状态")
              template(slot-scope="scope")
                el-tag {{recruitStatusInfo(scope.row.status)}}
            el-table-column(label="操作", width="150")
              template(slot-scope="scope")
                el-button(size="small", @click="openDetailDialog(scope.row)") 详情
                el-button.ml-10(size="small", @click="jump2Detail(scope.row)") 编辑
      .pt-10
        el-pagination.text-right(@current-change="handleCurrentChange", :current-page="currentPage", :total="totalCount", :page-size="pageSize", background, layout="prev, pager, next, jumper")
    el-dialog(title="招聘详情", width="70%", :visible.sync="dialogShow")
      el-form(:inline="true")
       .row 
        .col
          el-form-item(label="岗位")
            el-input(readOnly, :value="chooseObj.job")
        .col
          el-form-item(label="薪酬")
            el-input(readOnly, :value="chooseObj.salaryDescription")
        .col
          el-form-item(label="地点")
            el-input(readOnly, :value="chooseObj.location")
      .row
        el-label 招聘要求
      .padding.mt-15.mb-15(style="border:1px solid #dcdfe6; border-radius: 4px; width: 90%") {{chooseObj.requireDetail}}
      .row
        el-button(@click="dialogShow = false", type="primary") 关闭
</template>

<script>
import { mapState } from 'vuex'
export default {
  layout: 'backend',
  data() {
    return {
      searchTitle: '',
      tableData: [],
      chooseData: [],
      currentPage: 1,
      totalCount: 0,
      dialogShow: false,
      chooseObj: {}
    }
  },
  computed: {
    ...mapState({
      currentUser: state => state.user.currentUser,
      pageSize: state => state.pageSize
    })
  },
  beforeMount() {
    this.loadData()
    this.$nextTick(() => {
      this.$store.dispatch('configVal', { key: 'globalSuccessMsg', val: '' })
    })
  },
  methods: {
    async loadData() {
      try {
        this.pageShow(this)
        let { data } = await this.proxy(this, '/backend/recruit', 'post', {
          bid: this.currentUser.currentBucket.id,
          pageSize: this.pageSize,
          currentPage: this.currentPage - 1
        })
        console.log('new list data', data)
        this.pageHide(this)
        data.return_code === 0
          ? (this.tableData = data.list)
          : this.msgShow(this, data.errMsg)
        if (data.return_code === 0) this.totalCount = data.total
      } catch (err) {
        this.pageHide(this)
        this.msgShow(this, '网络异常')
      }
    },
    openDetailDialog(obj) {
      this.chooseObj = Object.assign({}, obj)
      this.dialogShow = true
    },
    getRowImage(row) {
      console.log(typeof row.images)
      console.log(row.images)
      let obj = Object.assign({}, row.images)
      console.log(JSON.stringify(obj.id))
      return obj.url
    },
    batchAction(type) {
      if (this.chooseData.length === 0) {
        this.msgShow(this, '请选择操作行')
        return
      }
      const ids = this.chooseData.map(item => item.id).join(',')
      switch (type) {
        // 上架
        case 1:
          this.remoteBatchUpdate(1, ids)
          break
        // 下架
        case 2:
          this.remoteBatchUpdate(2, ids)
          break
        default:
          break
      }
    },
    batchDel() {
      if (this.chooseData.length === 0) {
        this.msgShow(this, '请选择删除的新闻')
        return
      }
      const me = this
      this.confirmDialog(this, '您确定要删除吗？')
        .then(() => {
          let ids = me.chooseData.map(itm => itm.id).join(',')
          me.proxy(me, '/backend/article/del?ids=' + ids, 'delete')
            .then(({ data }) => {
              if (data.return_code === 0) {
                me.tableData = []
                me.loadData()
                me.msgShow(me, '删除成功', 'success')
              } else {
                me.msgShow(me, data.errMsg)
              }
            })
            .catch(err => {
              me.msgShow(me, '网络异常')
            })
        })
        .catch(() => {})
    },
    dateFormatter(row, column) {
      let d = new Date(row.publishTime)
      return this.date2Str(d)
    },
    handleSelectionChange(val) {
      this.chooseData = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadData()
    },
    recruitStatusInfo(status) {
      console.log('status:>>', status)
      switch (status) {
        case 1:
          return '上架'
        case 2:
          return '下架'
        default:
          return '草稿'
      }
    },
    jump2Detail(obj) {
      if (obj.status === 1) {
        this.msgShow(this, '已上架无法修改')
        return
      }
      this.jump({ path: '/recruit/form?tid=' + obj.id })
    },
    handleDownload() {
      const me = this
      // require.ensure([], () => {
      //   const { export_json_to_excel } = require('../../../utils/excelExport/Export2Excel')
      //   const tHeader = ['名称', '地址']
      //   const filterVal = ['name', 'addr']
      //   const list = me.tableData
      //   const data = me.formatJson(filterVal, list)
      //   export_json_to_excel(tHeader, data, '列表_excel')
      // })
    },
    async remoteBatchUpdate(status, ids) {
      try {
        this.pageShow(this)
        const { data } = await this.proxy(
          this,
          '/backend/recruit/batchAction',
          'post',
          {
            mark: status,
            bid: this.currentUser.currentBucket.id,
            ids: ids
          }
        )
        this.pageHide(this)
        if (data.return_code === 0) {
          this.msgShow(this, '操作成功', 'success')
          this.currentPage = 1
          this.loadData()
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e)
        this.pageHide(this)
      }
    },
    formatJson(filterVal, jsonData) {
      const me = this
      return jsonData.map(v =>
        filterVal.map(j => {
          if (j === 'updateAt' || j === 'createAt' || j === 'expireTime') {
            return me.formatDate(v[j])
          } else {
            return v[j]
          }
        })
      )
    }
  }
}
</script>

<style scoped>
.product-preview img {
  width: 100% !important;
}
.commbackend-expand-form {
  font-size: 0px;
}

.commbackend-expand-form label {
  width: 90px;
  color: #99a9bf !important;
}
.commbackend-expand-form .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
</style>
