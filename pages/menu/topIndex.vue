<template lang="pug">
i-box(:topHidden="false", title="菜单列表")
  b-table(:tableValue="tableConfig", :loading="dataLoad", @rightTopSearch="topSearch", @actionBtnClick="btnGroupClick", :total="totalRecords", @rowEdit="rowCellEdit")
  el-dialog(:visible.sync="dialogVisible", :title="'账户' + (formEditType == 1 ? '新增' : '修改')")
    b-form(:basicformConfig="formConfig", :modelForm="menuObj", :formCancel="dialogFormCancel", :resetForm="dialogVisible", @formSubmit="formResult")
      template(slot="append")
        el-form-item(label="所属空间")
          el-select(v-model="menuBucket", v-if="allBuckets.length > 0")
            el-option(:label="bkt.name", v-for="(bkt,idx) in allBuckets", :key="idx", :value="bkt.id")
        el-form-item(label="是否子菜单")
          el-switch(:value="isMenuChild", @change="childMenuChange")
        el-form-item(label="上级菜单", v-if="isMenuChild")
          el-select(v-if="parentMenus.length > 0", v-model="parentMenu")
            el-option(:label="pMenu.name", v-for="(pMenu,idx) in parentMenus", :value="pMenu.id", :key="idx")
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
      tableConfig: {
        hasCbx: true,
        tableHead: [
          { lbl: '菜单名称', prop: 'name' },
          { lbl: '菜单编号', prop: 'code' },
          { lbl: '图标样式', prop: 'iconName' },
          { lbl: '菜单排序', prop: 'factOrder' },
          { lbl: '访问地址', prop: 'path' },
          {
            lbl: '所属空间',
            type: 'object',
            factValue: function(itm) {
              return itm.bucket.name
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
      menuObj: {},
      isMenuChild: false,
      parentMenus: [],
      parentMenu: '',
      menuBucket: '',
      allBuckets: [],
      formConfig: {
        formHeader: [
          {
            labelName: '菜单名称',
            propName: 'name',
            type: 'input'
          },
          {
            labelName: '菜单编号',
            propName: 'code',
            type: 'input'
          },
          {
            labelName: '菜单图标',
            propName: 'iconName',
            type: 'input'
          },
          {
            labelName: '菜单排序',
            propName: 'factOrder',
            type: 'inputNumber'
          },
          {
            labelName: '访问地址',
            propName: 'path',
            type: 'select',
            optKey: 'value',
            optLbl: 'value',
            dataType: 'globalArray',
            listName: 'menuVistList',
            globalValue(ctx) {
              var array = []
              ctx.$router.options.routes.map(itm => {
                array.push({ value: itm.path })
              })
              return array
            }
          }
          // {
          //   labelName: '所属空间',
          //   propName: 'bucket',
          //   type: 'select',
          //   optKey: 'id',
          //   optLbl: 'name',
          //   dataType: 'api',
          //   dataUrl: '/backend/account/allBuckets',
          //   listName: 'bucketList'
          // }
        ],
        rules: {
          name: [
            { required: true, message: '请输入菜单名称', trigger: 'blur' }
          ],
          code: [{ required: true, message: '请输入菜单编号', trigger: 'blur' }]
          // ,
          // bucket: [
          //   { required: true, message: '请选择所属空间', trigger: 'blur' }
          // ]
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
    console.log(this.$router.options.routes)
    const me = this
    this.getAllBuckets()
    this.callMenuList()
  },
  methods: {
    formResult(obj) {
      this.menuObj = Object.assign({}, obj)
      this.dialogVisible = false
      this.callMenuSaveOrUpdate()
    },
    async callMenuList() {
      try {
        let { data } = await this.proxy(this, this.apiList.menus, 'get', {
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
    async callMenuSaveOrUpdate() {
      try {
        console.log('this.menuObj', this.menuObj)
        delete this.menuObj.createAt
        delete this.menuObj.updateAt
        delete this.menuObj.menuVistList
        this.menuObj.bucket = this.menuBucket
        if (
          this.menuObj.factOrder &&
          (this.menuObj.factOrder == '' ||
            this.menuObj.factOrder.toString().trim().length === 0)
        )
          delete this.menuObj.factOrder

        if (this.parentMenu != '') this.menuObj.parent = Number(this.parentMenu)
        let { data } = await this.proxy(
          this,
          this.formEditType == 1
            ? this.apiList.menuCreate
            : this.apiList.menuUpdate,
          'post',
          this.menuObj
        )
        if (data.return_code === 0) {
          this.currentPage = 0
          this.dataLoad = true
          this.callMenuList()
          this.msgShow(
            this,
            `菜单${this.formEditType == 1 ? '创建' : '更新'}成功`,
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
      this.menuObj = Object.assign({}, obj)
      this.menuBucket = this.menuObj.bucket.id
      if (obj.parent && obj.parent.id > 0) {
        this.parentMenu = obj.parent.id
        this.getParentMenu()
        this.isMenuChild = true
        // this.getParentMenu()
        // this.
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
        this.menuObj = {}
        this.formEditType = 1
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
    async getParentMenu() {
      try {
        let { data } = await this.proxy(this, this.apiList.parentMenus, 'get', {
          bid: Number(this.menuBucket)
        })
        if (data.return_code == 0) {
          this.parentMenus = data.list
          if (data.list.length === 0) {
            this.msgShow(this, '暂无没有选择的上级菜单')
            if (this.isMenuChild) this.isMenuChild = false
          }
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
      this.isMenuChild = val
      if (this.menuBucket > 0) {
        if (val) {
          this.getParentMenu()
          // if (this.parentMenus.length > 0) this.isMenuChild = val
        }
      } else {
        this.msgShow(this, '请先选择所属空间')
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
