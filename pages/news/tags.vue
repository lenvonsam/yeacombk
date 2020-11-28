<template lang="pug">
  .box
    .padding
      el-row
        el-col(:span="12")
          el-button-group
            el-button(type="primary", @click="actionBtn('create')") 新增
            //- el-button(type="info",@click="handleDownload") 导出
        el-col.text-right(:span="12")
          //- el-input(v-model="searchTitle", placeholder="标题")
            el-button(slot="append", icon="el-icon-search")
      el-row
        el-col(:span="24", style="padding-top:15px")
          el-table(:data="tableData",border,tooltip-effect="dark", style="width:100%", @selection-change="handleSelectionChange")
            el-table-column(label="名称",prop="name")
            el-table-column(label="创建时间", :formatter="dateFormatter", prop="createAt")
            el-table-column(label="更新时间", :formatter="dateFormatter", prop="updateAt")
            el-table-column(label="操作", width="150")
              template(slot-scope="scope")
                el-button.ml-10(size="small", @click="actionBtn('edit', scope.row)") 编辑
      .pt-10
        el-pagination.text-right(@current-change="handleCurrentChange", :current-page="currentPage", :total="totalCount", :page-size="pageSize", background, layout="prev, pager, next, jumper")
    el-dialog(title="分类编辑",:visible.sync="dialogShow", width="40%")
      el-form
        el-form-item(label="名称")
          el-input(placeholder="请输入文章大类", v-model="chooseObj.name", style="width: 60%")
      .dialog-footer(slot="footer")
        el-button(@click="tagSave", type="primary") 确定
        el-button(@click="dialogShow = false") 取消

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
    actionBtn(type, obj) {
      console.log('obj', obj)
      switch (type) {
        case 'create':
          this.chooseObj = {}
          this.dialogShow = true
          break
        case 'edit':
          this.chooseObj = {
            id: obj.id,
            name: obj.name,
            bucket: obj.bucket.id
          }
          this.dialogShow = true
          break
        default:
          break
      }
    },
    async tagSave() {
      try {
        this.pageShow(this)
        if (!this.chooseObj.bucket)
          this.chooseObj.bucket = this.currentUser.currentBucket.id
        const { data } = await this.proxy(
          this,
          '/backend/articleTag/save',
          'post',
          this.chooseObj
        )
        this.pageHide(this)
        if (data.return_code === 0) {
          this.msgShow(this, '操作成功', 'success')
          this.currentPage = 1
          this.dialogShow = false
          this.loadData()
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.error(e)
        this.pageHide(this)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    async loadData() {
      try {
        this.pageShow(this)
        let { data } = await this.proxy(this, '/backend/articleTag', 'post', {
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
    dateFormatter(row, column, cellValue, index) {
      let d = new Date(cellValue)
      return this.date2Str(d)
    },
    handleSelectionChange(val) {
      this.chooseData = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadData()
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
