<template lang="pug">
section.containter
    div(v-quill:myQuillEditor="editorOption", :content="content", class="quill-editor", @focus="onEditorFocus($event)", @change="onEditorChange($event)", @blur="onEditorBlur($event)", @ready="onEditorReady($event)", :style="{height: '200px'}")
</template>

<script>
import Vue from 'vue'
export default {
  props: {
    value: {
      type: null,
      default: ''
    }
  },
  data() {
    return {
      content: '<p>I am Example</p>',
      editorOption: {}
      //   // some quill options
      //   modules: {
      //     ImageExtend: {
      //       loading: true,
      //       name: 'img',
      //       action: '',
      //       response: res => {
      //         return res.info
      //       }
      //     },
      //     toolbar: {
      //       container: container,
      //       headers: {
      //         image: function() {
      //           QuillWatch.emit(this.quill.id)
      //         }
      //       }
      //     }
      //     // [
      //     // ['bold', 'italic', 'underline', 'strike'],
      //     // ['blockquote', 'code-block']
      //     // ]
      //   }
      // }
    }
  },
  watch: {
    value(newVal, oldVal) {
      this.content = this.value
    }
  },
  beforeMount() {
    const VueQuillEditor = require('vue-quill-editor/dist/ssr')
    const Quill = require('quill')
    const { ImageExtend, QuillWatch } = require('quill-image-extend-module')
    this.editorOption = {
      bounds: 'app',
      placeholder: '',
      modules: {
        ImageExtend: {
          loading: true,
          name: 'img', // 后端接收的文件名称
          action: '/fileupload', // 后端接收文件api
          response: res => {
            return res.data.url
            // 此处返回的值一定要直接是后端回馈的图片在服务器的存储路径如：/images/xxx.jpg
          }
        },
        toolbar: {
          handlers: {
            image: function() {
              QuillWatch.emit(this.quill.id)
            },
            video: function() {
              console.log('qulll video handle')
              QuillWatch.emit(this.quill.id)
            }
          },
          container: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            ['blockquote', 'code-block'],
            [{ script: 'sub' }, { script: 'super' }],
            ['image']
          ]
        }
      }
    }
    Quill.register('modules/ImageExtend', ImageExtend)
    Vue.use(VueQuillEditor)
  },
  mounted() {
    this.content = this.value
  },
  methods: {
    onEditorBlur(editor) {
      console.log('editor blur!', editor)
    },
    onEditorFocus(editor) {
      console.log('editor focus!', editor)
    },
    onEditorReady(editor) {
      console.log('editor ready!', editor)
    },
    onEditorChange({ editor, html, text }) {
      console.log('editor change!', editor, html, text)
      this.content = html
      this.$emit('input', this.content)
    }
  }
}
</script>

<style lang="stylus" scoped>
.ql-tooltip.ql-editing {
  left: 50%;
  top: 10px;
}

.ql-snow .ql-picker-label::before {
  position: relative !important;
  top: -7px !important;
}
</style>
