<template lang="pug">
.bucket-wrap
  el-row(:gutter="20")
    el-col(:span="6") 
      img(:src="avatar", style="height: 200px; width: 100%")
    el-col(:span="6") 
      img(:src="avatar", style="height: 200px; width: 100%")
    el-col(:span="6") 
      .bucket-item
        .title xxxx
          .set-icon(@click="showSettingDialog")
            i.el-icon-setting
        .sub-title 这是xxx的备注描述
        .shadow
    el-col(:span="6") 
      .bucket-add
        i.el-icon-plus
  el-row.mt-15(:gutter="20")
    el-col(:span="6") 
      img(:src="avatar", style="height: 200px; width: 100%")
    el-col(:span="6") 
      img(:src="avatar", style="height: 200px; width: 100%")
    el-col(:span="6") 123
    el-col(:span="6") 123
  el-dialog(:title="dialogAction == 'create' ? '空间新增' : '空间修改'", :visible.sync="dialogVisible")
    el-form(label-width="100px", style="max-width: 80%")
      el-form-item(label="空间缩略图")
        single-pic-upload(:isChild="true")
      el-form-item(label="空间名称", prop="title")
        el-input(placeholder="请输入空间名称")
      el-form-item(label="空间描述")
        el-input(type="textarea", :rows="5")
      el-form-item
        el-button(type="primary", @click="submitForm('articleForm')") 保存
      
</template>

<script>
import avatar from '../../assets/imgs/yc_bg.jpg'
import singlePicUpload from '~/components/SinglePicUpload.vue'
export default {
  layout: 'topLayout',
  components: {
    singlePicUpload
  },
  data() {
    return {
      avatar,
      dialogVisible: false,
      dialogAction: 'create'
    }
  },
  methods: {
    showSettingDialog() {
      console.log('showsetting dialog')
      this.dialogVisible = !this.dialogVisible
    }
  }
}
</script>

<style lang="stylus" scoped>
.top-contain {
  max-width: 1280px;
  margin: 0 auto;
  box-sizing: border-box;

  .bucket-wrap {
    margin-top: 15px;
    padding: 15px 15px;
    box-sizing: border-box;
    background: #fff;

    .bucket-item:hover {
      cursor: pointer;
      box-shadow: 8px 8px 4px #ddd;
      top: -3px;
    }

    .bucket-add:hover {
      cursor: pointer;
    }

    .bucket-add {
      position: relative;
      height: 200px;
      width: 100%;
      border: 2px dashed #ddd;
      border-radius: 3px;
      display flex
      flex-direction column
      align-items center
      justify-content center
      font-size 70px
      color #ddd
      font-weight 500
    }

    .bucket-item {
      position: relative;
      transition: all 0.5s;
      height: 200px;
      width: 100%;
      background-image: url('../../assets/imgs/yc_bg.jpg');
      background-size: cover;
      background-position: center;

      .shadow {
        background-image: linear-gradient(180deg, rgba(56, 56, 56, 0.35) 0%, rgba(56, 56, 56, 0));
        background-repeat: repeat-x;
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        z-index: 0;
      }

      .title {
        position: relative;
        padding: 10px 15px;
        font-size: 22px;
        line-height: 24px;
        font-weight: 500;
        color: #fff;
        z-index: 1;

        .set-icon {
          position: absolute;
          right: 15px;
          top: 12px;
          height: 20px;
          width: 20px;
          font-size: 18px;
          text-align: center;
          color: #fff;
        }
      }

      .sub-title {
        position: relative;
        padding: 10px 15px;
        padding-top: 0px;
        font-size: 14px;
        color: #fff;
        z-index: 1;
      }
    }
  }
}
</style>
