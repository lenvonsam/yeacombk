<template lang="pug">
.box
	i-box
		el-row
			el-col(:span="20")
				el-form(:model="articleObj",:rules="articleRules", label-width="100px", ref="articleForm")
					el-form-item(label="新闻标题", prop="title")
						el-input(v-model="articleObj.title")
					el-form-item(label="新闻来源", prop="source")
						el-input(v-model="articleObj.source", placeholder="百姓网")
					el-form-item(label="新闻作者", prop="author")
						el-input(v-model="articleObj.author")
					el-form-item(label="发布时间", prop="time")
						el-date-picker(type="date", v-model="articleObj.time", :clearable="false", value-format="yyyy-MM-dd")
					//- el-form-item(label="新闻标签", prop="tag")
						el-select(v-model="articleObj.tag", multiple)
							el-option(v-for="(t,tidx) in articleTags", :key="tidx", :label="t.name", :value="t.id")
					el-form-item(label="新闻缩略图", prop="thumbUrl")
						single-pic-upload(v-model="articleObj.thumbUrl")
					el-form-item(label="是否外链")
						el-switch(v-model="articleObj.isOutLink",on-text="是",off-text="否")
					el-form-item(label="外链地址",prop="outLinkUrl",v-show="articleObj.isOutLink")
						el-input(v-model="articleObj.outLinkUrl")
							template(slot="prepend") Http://
					el-form-item(label="新闻内容", v-show="!articleObj.isOutLink")
						q-editor(v-model="articleObj.content")
					el-form-item
						el-button(type="primary", @click="submitForm('articleForm')") 保存
						el-button(@click="back") 返回

</template>

<script>
import { mapState, mapActions } from 'vuex'
import SinglePicUpload from '~/components/SinglePicUpload.vue'
import qEditor from '~/components/QuillEditor.vue'
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
      articleObj: {
        title: '',
        tag: '',
        source: '',
        thumbUrl: '',
        isOutLink: false,
        outLinkUrl: '',
        author: '',
        content: '',
        time: this.date2Str(new Date())
      },
      articleRules: {
        title: [
          { required: true, message: '请输入新闻标题', trigger: 'blur' },
          { min: 2, message: '标题不能少于2个字', trigger: 'change' }
        ],
        source: [
          { required: true, message: '请输入新闻来源', trigger: 'blur' }
        ],
        thumbUrl: [
          { required: true, message: '请选择缩略图', trigger: 'blur' }
        ],
        author: [
          { required: true, message: '请输入新闻作者', trigger: 'blur' }
        ],
        time: [{ required: true, message: '请选择发布时间', trigger: 'blur' }]
      },
      dialogVisible: false,
      articleTags: [],
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
    articleObj: {
      handler(newVal, oldVal) {
        console.log(newVal)
      },
      deep: true
    }
  },
  beforeMount() {
    // this.initTags()
    if (this.$route.query.tid) this.loadArticle()
  },
  methods: {
    ...mapActions(['configVal']),
    onEditorBlur(editor) {
      console.log('editor blur!', editor)
    },
    onEditorFocus(editor) {
      console.log('editor focus!', editor)
    },
    onEditorReady(editor) {
      console.log('editor ready!', editor)
    },
    // onEditorChange({ editor, html, text }) {
    // console.log('editor change!', editor, html, text)
    //   this.content = html
    // },
    async loadArticle() {
      try {
        let { data } = await this.proxy(
          this,
          '/backend/article/' + this.$route.query.tid
        )
        console.log(data.article)
        if (data.return_code === 0) {
          let obj = {
            title: data.article.title,
            source: data.article.source,
            author: data.article.author,
            thumbUrl: data.article.images.url,
            time: this.date2Str(new Date(data.article.publishTime)),
            tag: data.article.tags.map(itm => itm.id),
            isOutLink: data.article.link
          }
          data.article.link
            ? (obj.outLinkUrl = data.article.linkUrl)
            : (obj.content = data.article.articleDetail)
          if (data.article.link) obj.content = ''
          this.articleObj = obj
          console.log(this.articleObj)
        }
      } catch (err) {
        console.log(err)
        this.msgShow(this, '获取新闻异常')
      }
    },
    async initTags() {
      try {
        let { data } = await this.proxy(
          this,
          '/backend/article/tags?bid=' + this.currentUser.currentBucket.id
        )
        console.log('tags', data)
        data.return_code === 0
          ? (this.articleTags = data.tags)
          : this.msgShow(this, data.errMsg)
        if (data.return_code === 0)
          this.articleObj.tag = [this.articleTags[0].id]
      } catch (err) {
        console.log(err)
        this.msgShow(this, '获取新闻标签异常')
      }
    },
    moreUpload(id, content) {
      let row = 0
      if (content.length % 1600 === 0) {
        row = content.length / 1600
      } else {
        row = Math.floor(content.length / 1600) + 1
      }
      try {
        this.artUpdate(id, content, row, 0)
      } catch (err) {
        console.error(err)
        // 删除操作
        this.proxy(this, '/backend/common/del', {
          url: 'backend/article/del?ids=' + id,
          params: {}
        })
        if (this.pageLoad) this.pageLoad.close()
        this.msgShow(this, '新闻内容太长，请缩减新闻内容')
      }
    },
    artUpdate(id, content, row, k) {
      let cnt = content.substring(k * 1600, (k + 1) * 1600)
      if (k === row - 1) cnt = content.substring(k * 1600, content.length)
      const me = this
      this.proxy('/backend/common/post', {
        url: 'backend/article/update',
        params: { id: id, content: cnt, isAppend: k > 0 ? 1 : 0 }
      }).then(({ data }) => {
        if (data.return_code === 0) {
          k++
          if (k < row) {
            me.artUpdate(id, content, row, k)
          } else {
            me.pageLoad.close()
            me.configVal({
              key: 'globalSuccessMsg',
              val: `新闻${this.$route.query.tid > 0 ? '更改' : '创建'}成功`
            })
            me.jump({ path: '/backend/articles' })
          }
        } else {
          throw new Error('save error')
        }
      })
    },
    async submitForm(formName) {
      // console.log('content', this.content)
      const me = this
      try {
        await this.formValidate(this, formName)
        if (me.articleObj.isOutLink) {
          if (me.articleObj.outLinkUrl.toString().trim().length === 0) {
            me.msgShow(me, '链接不能为空')
            return
          }
        } else {
          if (me.articleObj.content.toString().trim().length === 0) {
            me.msgShow(me, '新闻详情不能为空')
            return
          }
        }
        let articleObject = {
          title: me.articleObj.title,
          source: me.articleObj.source,
          author: me.articleObj.author,
          thumbUrl: me.articleObj.thumbUrl,
          artTime: me.articleObj.time,
          // tagIds: me.articleObj.tag.join(','),
          tagIds: '1',
          bucketId: me.currentUser.currentBucket.id,
          link: me.articleObj.isOutLink
        }

        me.articleObj.isOutLink
          ? (articleObject.linkUrl = me.articleObj.outLinkUrl)
          : (articleObject.articleDetail = me.articleObj.content)
        if (me.$route.query.tid) articleObject.id = Number(me.$route.query.tid)
        // console.log(articleObject.articleDetail.length)
        if (!me.articleObj.isOutLink) {
          // 分段上传
          // articleObject.articleDetail = ''
        }
        me.pageLoad = me.$loading({
          lock: true,
          text: '数据上传中',
          spinner: 'el-icon-loading',
          background: 'rgba(255, 255, 255, 0.7)'
        })
        let { data } = await me.proxy(
          this,
          '/backend/article/createOrUpdate',
          'post',
          articleObject
        )
        if (data.return_code === 0) {
          me.configVal({ key: 'globalSuccessMsg', val: '操作成功' })
          if (!me.articleObj.isOutLink) {
            me.pageLoad.close()
            // 分段上传
            // me.moreUpload(data.newId, me.articleObj.content)
            me.jump({ path: '/news' })
          } else {
            me.pageLoad.close()
            // me.configVal({
            //   key: 'globalSuccessMsg',
            //   val: `新闻${me.$route.query.tid > 0 ? '更改' : '创建'}成功`
            // })
            me.jump({ path: '/news' })
          }
        } else {
          me.pageLoad.close()
          me.msgShow(me, data.errMsg)
        }
      } catch (e) {
        console.log(e)
        me.pageLoad.close()
      }
    }
  }
}
</script>

<style scoped>
</style>
