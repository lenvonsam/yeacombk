<template lang="pug">
.box
	i-box
		el-row
			el-col(:span="20")
				el-form(:model="recruitObj",:rules="recruitRules", label-width="100px", ref="recruitForm")
					el-form-item(label="招聘岗位", prop="job")
						el-input(v-model="recruitObj.job")
					el-form-item(label="所属公司", prop="company")
						el-input(v-model="recruitObj.company", placeholder="怡康房产")
					el-form-item(label="工作地点", prop="location")
						el-input(v-model="recruitObj.location")
					el-form-item(label="发布时间", prop="time")
						el-date-picker(type="date", v-model="recruitObj.time", :clearable="false", value-format="yyyy-MM-dd")
					el-form-item(label="薪资范畴", prop="salaryDescription")
						el-input(v-model="recruitObj.salaryDescription")
					el-form-item(label="招聘要求", prop="requireDetail")
						el-input(v-model="recruitObj.requireDetail", type="textarea", :rows="5")
					el-form-item(label="招聘状态")
						el-select(v-model="recruitObj.status")
							el-option(label="草稿", value="0") 草稿
							el-option(label="上架", value="1") 上架
							el-option(label="下架", value="2") 下架
					el-form-item(label="优先级")
						el-input-number(v-model="recruitObj.factOrder")
					el-form-item
						el-button(type="primary", @click="submitForm('recruitForm')") 保存
						el-button(@click="back") 返回

</template>

<script>
import { mapState, mapActions } from 'vuex'
import SinglePicUpload from '~/components/SinglePicUpload.vue'
import qEditor from '~/components/QuillEditor.vue'
//- requireDetail
export default {
  layout: 'backend',
  components: {
    SinglePicUpload,
    qEditor
  },
  data() {
    return {
      editorOption: {},
      content: '',
      recruitObj: {
        job: '',
        company: '',
        location: '',
        salaryDescription: '',
        status: '0',
        requireDetail: '',
        factOrder: 1,
        time: this.date2Str(new Date())
      },
      recruitRules: {
        job: [
          { required: true, message: '请输入职位', trigger: 'blur' },
          { min: 2, message: '标题不能少于2个字', trigger: 'change' }
        ],
        company: [
          { required: true, message: '请输入所属公司', trigger: 'blur' }
        ],
        location: [
          { required: true, message: '请选择工作地点', trigger: 'blur' }
        ],
        salaryDescription: [
          { required: true, message: '请输入薪酬范围', trigger: 'blur' }
        ],
        time: [{ required: true, message: '请选择发布时间', trigger: 'blur' }],
        requireDetail: [
          {
            required: true,
            message: '内部不能为空',
            trigger: 'blur'
          }
        ]
      },
      dialogVisible: false,
      recruitTags: [],
      pageLoad: null
    }
  },
  computed: {
    ...mapState({
      fileUploadUrl: state => state.fileUploadUrl,
      currentUser: state => state.user.currentUser
    }),
    editor() {
      return this.$refs.newsTextEditor.quillEditor
    }
  },
  watch: {
    recruitObj: {
      handler(newVal, oldVal) {
        console.log(newVal)
      },
      deep: true
    }
  },
  beforeMount() {
    if (this.$route.query.tid) this.loadrecruit()
  },
  methods: {
    ...mapActions(['configVal']),
    async loadrecruit() {
      try {
        this.pageShow(this)
        let { data } = await this.proxy(
          this,
          '/backend/recruit/' + this.$route.query.tid
        )
        console.log(data.obj)
        this.pageHide(this)
        if (data.return_code === 0) {
          const obj = Object.assign({}, data.obj)
          obj.time = this.date2Str(new Date(data.obj.publishTime))
          obj.status = data.obj.status.toString()
          this.recruitObj = obj
          console.log(this.recruitObj)
        }
      } catch (err) {
        console.log(err)
        this.pageHide(this)
        this.msgShow(this, '获取招聘信息异常')
      }
    },
    async submitForm(formName) {
      // console.log('content', this.content)
      const me = this
      try {
        await this.formValidate(this, formName)
        let recruitObject = Object.assign({}, this.recruitObj)
        delete recruitObject.createAt
        delete recruitObject.updateAt
        delete recruitObject.recruitTime
        delete recruitObject.publishTime
        recruitObject.bucket = this.currentUser.currentBucket.id
        recruitObject.recruitTime = this.recruitObj.time
        if (me.$route.query.tid) recruitObject.id = Number(me.$route.query.tid)
        // console.log(recruitObject.recruitDetail.length)
        me.pageLoad = me.$loading({
          lock: true,
          text: '数据上传中',
          spinner: 'el-icon-loading',
          background: 'rgba(255, 255, 255, 0.7)'
        })
        let { data } = await me.proxy(
          this,
          '/backend/recruit/createOrUpdate',
          'post',
          recruitObject
        )
        me.pageLoad.close()
        if (data.return_code === 0) {
          me.configVal({ key: 'globalSuccessMsg', val: '操作成功' })
          me.back()
        } else {
          me.msgShow(me, data.errMsg)
        }
      } catch (e) {
        console.log(e)
        if (me.pageLoad) me.pageLoad.close()
      }
    }
  }
}
</script>

<style scoped>
</style>
