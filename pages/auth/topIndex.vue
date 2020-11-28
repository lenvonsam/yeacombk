<template lang="pug">
i-box(:topHidden="false", title="权限管理")
  el-tabs(tab-position="left", v-model="tabName")
    el-tab-pane(:label="tab", v-for="(tab,idx) in authTabs", :name="'' + idx", :key="idx") 
      template(v-if="tabName == '0'")
        b-table(:tableValue="roleTableConfig", :loading="dataLoad", :rightPart="false", @actionBtnClick="btnGroupClick", :total="totalRecords", @rowEdit="rowCellEdit")
      template(v-else)
        b-table(:tableValue="acctTableConfig", :loading="dataLoad", :rightPart="false", @actionBtnClick="btnGroupClick", :total="totalRecords", @rowEdit="rowCellEdit")
          search-form.mb-15(slot="searchPart",:searchItems="acctSearchItems")
  el-dialog(:visible.sync="dialogVisible", :title="dialogTitle", width="60%", :before-close="dialogClose")
    template(v-if="tabName == '0'")
      el-form(ref="roleForm", :model="roleFormObj", :rules="roleFormRules", status-icon, :validate-on-rule-change="false", label-width="85px")
        el-form-item(label="角色名称", prop="name")
          el-input(size="medium", v-model="roleFormObj.name", style="max-width: 40%")
        el-form-item(label="启用状态", prop="status")
          el-radio(label="1", v-model="roleFormObj.status") 启用
          el-radio(label="0", v-model="roleFormObj.status") 停用
        el-form-item(label="所属空间", prop="bucket", v-if="formEditType == 1")
          el-select(v-model="roleFormObj.bucket")
            el-option(v-for="(bkt,idx) in allBuckets", :key="idx", :label="bkt.name", :value="bkt.id")
        auth-form(:parentMenuData="originMenuData", v-if="(roleFormObj.bucket > 0 && originMenuData.length > 0)", style="max-width: 80%", @transferResult="roleTransferResult", :auths="chooseData", :parentStepIdx="stepIdx", @currentStepIndex="currentAuthTransferIdx")
  
</template>

<script>
import { mapState } from 'vuex'
import authForm from '../../components/page/auth/AuthForm.vue'
export default {
  layout: 'topLayout',
  components: {
    authForm
  },
  data() {
    return {
      tabName: '0',
      authTabs: ['角色管理', '权限分配'],
      dialogVisible: false,
      // 1 新增 2 修改
      formEditType: 1,
      roleTableConfig: {
        hasCbx: true,
        tableHead: [
          { lbl: '角色名称', prop: 'name' },
          {
            lbl: '启用状态',
            prop: 'status',
            type: 'object',
            factValue: function(itm) {
              return itm.status == 1 ? '启用' : '停用'
            }
          },
          {
            lbl: '操作',
            type: 'action',
            actionBtns: [
              {
                type: 'edit',
                lbl: '编辑'
              },
              {
                type: 'del',
                lbl: '删除'
              }
            ]
          }
        ],
        tableData: [],
        actions: [
          {
            lbl: '新增角色',
            type: 'create',
            class: 'default',
            size: 'small'
          },
          {
            lbl: '批量启用',
            type: 'batchOpen',
            class: 'primary',
            size: 'small'
          },
          {
            lbl: '批量停用',
            type: 'batchClose',
            class: 'danger',
            size: 'small'
          }
        ]
      },
      roleFormObj: {
        name: '',
        status: '1',
        bucket: ''
      },
      roleFormRules: {
        name: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ],
        bucket: [{ required: true, message: '请选择空间', trigger: 'blur' }]
      },
      dataLoad: true,
      currentPage: 0,
      totalRecords: 0,
      menuObj: {},
      isMenuChild: false,
      originMenuData: [],
      chooseData: [],
      stepIdx: 1,
      parentMenus: [],
      menuBucket: '',
      allBuckets: [],
      dialogTitle: '',
      acctTableConfig: {
        hasCbx: false,
        tableHead: [
          { lbl: '账户名', prop: 'username' },
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
                type: 'authManager',
                lbl: '权限分配'
              }
            ]
          }
        ],
        tableData: [],
        actions: []
      },
      acctSearchItems: [
        { lbl: '登录账号', key: 'username', val: '' },
        { lbl: '空间名称', key: 'bucketName', val: '' }
      ],
      acctBucketName: '',
      acctUsername: ''
    }
  },
  computed: {
    ...mapState({
      currentUser: state => state.user.currentUser,
      pageSize: state => state.pageSize
    })
  },
  watch: {
    'roleFormObj.bucket'(newVal, oldVal) {
      console.log('bucket val change:>>', newVal)
      // if (newVal != '') this.get
      if (newVal > 0) {
        this.loadMenu(newVal)
      }
    },
    tabName(newVal, oldVal) {
      this.currentPage = 0
      this.tabName == '0' ? this.callRoleList() : this.callAcctList()
    }
  },
  beforeMount() {
    console.log(this.$router.options.routes)
    const me = this
    this.getAllBuckets()
    this.tabName == '0' ? this.callRoleList() : this.callAcctList()
  },
  methods: {
    currentAuthTransferIdx(idx) {
      if (idx != this.stepIdx) this.stepIdx = idx
    },
    async callAcctList() {
      try {
        var body = {
          currentPage: this.currentPage,
          pageSize: this.pageSize
        }(this.acctBucketName.trim().length > 0)
          ? (body.bucketName = this.acctBucketName)
          : delete body.bucketName(this.acctUsername.trim().length > 0)
            ? (body.username = this.acctUsername)
            : delete body.username
        let { data } = await this.proxy(
          this,
          this.apiList.accounts,
          'get',
          body
        )
        this.dataLoad = false
        if (data.return_code == '0') {
          if (data.list.length > 0) {
            this.acctTableConfig.tableData = data.list
          } else {
            this.acctTableConfig.tableData = []
          }
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e)
        this.dataLoad = false
        this.msgShow(this, '网络异常')
      }
    },
    async callRoleList() {
      try {
        let { data } = await this.proxy(this, this.apiList.roles, 'get', {
          currentPage: this.currentPage,
          pageSize: this.pageSize
        })
        console.log(data)
        if (data.list.length > 0) {
          this.roleTableConfig.tableData = data.list
        } else {
          this.roleTableConfig.tableData = []
        }
        this.totalRecords = data.total
        this.dataLoad = false
      } catch (e) {
        this.dataLoad = false
        this.msgShow(this, '网络异常')
      }
    },
    rowCellEdit(idx, obj) {
      console.log('row index:>>', idx, '; obj:>>', obj)
      if (this.tabName === '0') {
        // 权限
        this.roleFormObj = Object.assign({}, obj)
        this.roleFormObj.bucket = obj.bucket.id
        this.roleFormObj.status = obj.status.toString()
        console.log('edit formobj:>>', this.roleFormObj)
        this.loadMenu(obj.bucket.id)
        this.getRoleAuth(obj.id)
      } else {
        // 人员权限
      }
    },
    async getRoleAuth(rid) {
      try {
        let { data } = await this.proxy(this, this.apiList.roleAuths, 'get', {
          rid
        })
        console.log('role auths: >>>', data.list)
        if (data.return_code == 0) {
          this.chooseData = data.list
          this.formEditType = 2
          this.dialogVisible = true
        }
      } catch (e) {
        console.log(e)
      }
    },
    topSearch(val) {
      console.log('search val', val)
    },
    btnGroupClick(type) {
      console.log('btnGroupClick', type)
      if (type === 'create') {
        this.menuObj = {}
        this.formEditType = 1
        if (this.tabName == '0') this.dialogTitle = '角色新增'
        this.dialogVisible = true
      }
    },
    async getAllBuckets() {
      try {
        let { data } = await this.proxy(this, this.apiList.allBuckets)
        this.allBuckets = data.list
      } catch (e) {
        console.log(e)
      }
    },
    async loadMenu(bid) {
      try {
        let { data } = await this.proxy(this, this.apiList.roleMenus, 'get', {
          bid: bid
        })
        this.originMenuData = data.list
      } catch (e) {
        console.log('load menu error:>>', e)
      }
    },
    async getParentMenu() {
      try {
        let { data } = await this.proxy(this, this.apiList.parentMenus, 'get', {
          bid: Number(this.menuBucket)
        })
        if (data.return_code == 0) {
          this.parentMenus = data.list
          if (data.list.length === 0)
            this.msgShow(this, '暂无没有选择的上级菜单')
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        this.msgShow(this, '网络异常')
      }
    },
    childMenuChange(val) {
      console.log('menu change:>>', val)
      console.log('menuBucket:>>>', this.menuBucket)
      if (this.menuBucket > 0) {
        if (val) {
          this.getParentMenu()
          if (this.parentMenus.length > 0) this.isMenuChild = val
        }
      } else {
        this.msgShow(this, '请先选择所属空间')
      }
    },
    dialogClose(done) {
      console.log('dialog close')
      if (this.tabName === '0') {
        this.$refs.roleForm.resetFields()
        this.stepIdx = 1
      }
      done()
    },
    roleTransferResult(val) {
      const me = this
      this.formValidate(this, 'roleForm')
        .then(() => {
          console.log('val:>>', val)
          let auths = ''
          let menus = ''
          let authIds = ''
          val.map(itm => {
            menus += itm.id + ','
            if (itm.authConfig && itm.authConfig.length > 0) {
              auths += itm.authConfig.join(',') + '|'
            } else {
              auths += '|'
            }
            if (itm.authId) {
              authIds += itm.authId + ','
            } else {
              authIds += ','
            }
          })
          auths = auths.substring(0, auths.length - 1)
          menus = menus.substring(0, menus.length - 1)
          if (authIds != '') authIds = authIds.substring(0, authIds.length - 1)
          let obj = Object.assign({}, me.roleFormObj)
          let url = ''
          if (obj.bucket && obj.bucket.id > 0) obj.bucket = obj.bucket.id
          if (me.formEditType == 2) {
            url = me.apiList.roleUpdate
            obj = {
              id: me.roleFormObj.id,
              name: me.roleFormObj.name,
              status: Number(me.roleFormObj.status),
              authIds: authIds,
              auths: auths,
              menus: menus,
              bucket: me.roleFormObj.bucket
            }
          } else {
            url = me.apiList.roleCreate
            obj.auths = auths
            obj.menus = menus
          }
          console.log('obj', obj)
          me.proxy(me, url, 'post', obj)
            .then(({ data }) => {
              me.dialogVisible = false
              me.$refs.roleForm.resetFields()
              me.originMenuData = []
              me.currentPage = 0
              if (data.return_code == 0) {
                me.msgShow(
                  me,
                  me.formEditType == 1 ? '新增成功' : '修改成功',
                  'success'
                )
                me.callRoleList()
              } else {
                me.msgShow(me, data.message)
              }
            })
            .catch(e => {
              console.error(e)
              me.msgShow(me, '操作失败')
            })
        })
        .catch(e => {
          console.log(e)
        })
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
