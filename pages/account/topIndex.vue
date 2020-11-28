<template lang="pug">
i-box(:topHidden="false", title="账户列表")
  b-table(:tableValue="tableConfig", :loading="dataLoad", @rightTopSearch="topSearch", @actionBtnClick="btnGroupClick", :total="totalRecords", @rowEdit="rowCellEdit")
  el-dialog(:visible.sync="dialogVisible", :title="'账户' + (formEditType == 1 ? '新增' : '修改')")
    b-form(:basicformConfig="formConfig", :modelForm="acctObj", :formCancel="dialogFormCancel", :resetForm="dialogVisible", @formSubmit="formResult", @selectChange="formSelectChange")
      div(slot="append", v-if="acctObj.currentBucket")
        el-form-item(label="所属角色")
          el-select(v-model="acctObj.role")
            el-option(v-for="role in roleList", :label="role.name",:value="role.id", :key="role.id")
</template>

<script>
import { mapState } from 'vuex'
export default {
  layout: 'topLayout',
  data() {
    return {
      dialogVisible: false,
      // 1 新增 2 修改
      formEditType: 1,
      roleList: [],
      tableConfig: {
        hasCbx: true,
        tableHead: [
          { lbl: '账户名', prop: 'username' },
          {
            lbl: '账户等级',
            prop: 'acctLevel',
            type: 'enum',
            enumMap: {
              0: '普通员工',
              1: '子公司管理员',
              2: '公司管理员',
              3: '超级管理管理员'
            }
          },
          {
            lbl: '拥有空间',
            type: 'object',
            factValue: function(itm) {
              return itm.buckets.map(item => item.name).join(',')
            }
          },
          {
            lbl: '操作',
            type: 'action',
            actionBtns: [
              {
                type: 'edit',
                lbl: '编辑'
              }
            ]
          }
        ],
        tableData: [],
        actions: [
          {
            lbl: '新增',
            type: 'create',
            class: 'primary'
          }
        ]
      },
      dataLoad: true,
      currentPage: 0,
      totalRecords: 0,
      acctObj: {},
      formConfig: {
        formHeader: [
          {
            labelName: '登录名称',
            propName: 'username',
            type: 'input'
          },
          {
            labelName: '所属空间',
            propName: 'currentBucket',
            type: 'select',
            optKey: 'id',
            optLbl: 'name',
            dataType: 'api',
            dataUrl: '/backend/account/allBuckets',
            listName: 'bucketList'
          },
          {
            labelName: '账户权限',
            propName: 'acctLevel',
            type: 'select',
            optKey: 'id',
            optLbl: 'name',
            dataType: 'array',
            listArray: [
              { id: 0, name: '普通' },
              { id: 1, name: '子公司管理员' },
              { id: 2, name: '公司管理员' }
            ]
          },
          {
            labelName: '邮箱',
            propName: 'email',
            type: 'input'
          },
          {
            labelName: '手机号',
            propName: 'phone',
            type: 'input'
          },
          {
            labelName: '昵称',
            propName: 'nickname',
            type: 'input'
          },
          {
            labelName: '真实姓名',
            propName: 'realName',
            type: 'input'
          }
        ],
        rules: {
          username: [
            { required: true, message: '请输入账户名称', trigger: 'blur' }
          ],
          currentBucket: [
            { required: true, message: '请选择所属空间', trigger: 'blur' }
          ],
          acctLevel: [
            { required: true, message: '请选择账户权限', trigger: 'blur' }
          ]
        }
      }
    }
  },
  computed: {
    ...mapState({
      currentUser: state => state.user.currentUser,
      pageSize: state => state.pageSize
    })
  },
  beforeMount() {
    const me = this
    this.callAccountList()
  },
  methods: {
    formResult(obj) {
      this.acctObj = Object.assign({}, obj)
      this.dialogVisible = false
      this.callAccountSaveOrUpdate()
    },
    formSelectChange(val, key) {
      if (key === 'currentBucket') {
        this.acctObj.currentBucket = val
        this.roleData(val)
        this.$forceUpdate()
      }
    },
    async callAccountList() {
      try {
        let { data } = await this.proxy(this, this.apiList.accounts, 'get', {
          // creatorId: this.currentUser.id,
          currentPage: this.currentPage,
          pageSize: this.pageSize
        })
        console.log(data)
        if (data.list.length > 0) {
          this.tableConfig.tableData = data.list
        } else {
          this.tableConfig.tableData = []
        }
        this.totalRecords = data.total
        this.dataLoad = false
      } catch (e) {
        this.dataLoad = false
        this.msgShow(this, '网络异常')
      }
    },
    async callAccountSaveOrUpdate() {
      try {
        delete this.acctObj.bucketList
        delete this.acctObj.buckets
        delete this.acctObj.createAt
        delete this.acctObj.updateAt
        delete this.acctObj.expireTime
        delete this.acctObj.creator

        if (this.acctObj.currentBucket.id)
          this.acctObj.currentBucket = this.acctObj.currentBucket.id

        this.acctObj.creatorId = this.currentUser.id
        let { data } = await this.proxy(
          this,
          this.formEditType == 1
            ? this.apiList.accountCreate
            : this.apiList.accountUpdate,
          'post',
          this.acctObj
        )
        if (data.return_code === 0) {
          this.currentPage = 0
          this.dataLoad = true
          this.callAccountList()
          this.msgShow(
            this,
            `账号${this.formEditType == 1 ? '创建' : '更新'}成功`,
            'success'
          )
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.error(e)
        this.msgShow(this, '操作失败')
      }
    },
    rowCellEdit(idx, obj) {
      console.log('row index:>>', idx, '; obj:>>', obj)
      this.acctObj = Object.assign({}, obj)
      if (this.acctObj.currentBucket && this.acctObj.currentBucket.id > 0) {
        this.roleData(this.acctObj.currentBucket.id)
      }
      this.formEditType = 2
      this.dialogVisible = true
    },
    topSearch(val) {
      console.log('search val', val)
    },
    dialogFormCancel() {
      this.dialogVisible = false
    },
    btnGroupClick(type) {
      console.log('btnGroupClick', type)
      if (type === 'create') {
        this.acctObj = {}
        this.formEditType = 1
        this.dialogVisible = true
      }
    },
    async roleData(bid) {
      try {
        const { data } = await this.proxy(
          this,
          this.apiList.accountRole + '?bid=' + bid
        )
        if (data.return_code === 0) {
          this.roleList = data.list
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
