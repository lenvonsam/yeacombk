<template lang="pug">
  .box
    .padding
      el-row
        el-col(:span="12")
          el-button-group
            el-button(type="primary", @click="jump({path: '/news/form'})") 新增
            el-button(type="danger", @click="batchDel") 删除
            //- el-button(type="info",@click="handleDownload") 导出
        el-col.text-right(:span="12")
          //- el-input(v-model="searchTitle", placeholder="标题")
            el-button(slot="append", icon="el-icon-search")
      el-row
        el-col(:span="24", style="padding-top:15px")
          el-table(:data="tableData",border,tooltip-effect="dark", style="width:100%", @selection-change="handleSelectionChange")
            el-table-column(type="selection",width="55")
            el-table-column(label="缩略图", width="150")
              template(slot-scope="scope")
                img.full-width(:src="getRowImage(scope.row)")
            el-table-column(label="标题",prop="title")
            el-table-column(label="来源",prop="source")
            el-table-column(label="作者",prop="author")
            //- el-table-column(label="标签")
              template(slot-scope="scope")
                el-tag(v-for="itm in scope.row.tags", size="mini", type="info", :key="itm.id") {{itm.name}}
            el-table-column(label="发布时间", :formatter="dateFormatter")
            el-table-column(label="操作", width="150")
              template(slot-scope="scope")
                el-button(size="small", @click="openDetailDialog(scope.row)") 详情
                el-button.ml-10(size="small", @click="jump({path: '/news/form?tid=' + scope.row.id})") 编辑
      .pt-10
        el-pagination.text-right(@current-change="handleCurrentChange", :current-page="currentPage", :total="totalCount", :page-size="pageSize", background, layout="prev, pager, next, jumper")
    el-dialog(title="新闻详情", width="70%", :visible.sync="dialogShow")
      iframe.full-width(frameborder="0", scrolling="auto", height="500px", v-if="chooseObj.link", :src="'http://' + chooseObj.linkUrl")
      .product-preview(v-else, v-html="chooseObj.articleDetail")
      .dialog-footer(slot="footer")
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
        let { data } = await this.proxy(this, '/backend/article', 'post', {
          bid: this.currentUser.currentBucket.id,
          pageSize: this.pageSize,
          currentPage: this.currentPage - 1
        })
        console.log('new list data', data)
        data.return_code === 0
          ? (this.tableData = data.list)
          : this.msgShow(this, data.errMsg)
        if (data.return_code === 0) this.totalCount = data.total
      } catch (err) {
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
