<template lang="pug">
el-form.login-form(:model="userForm", :rules="userRules", ref="userRuleForm")
  el-form-item
    h2.text-center XXXCMS
  el-form-item(prop="username")
    el-input(placeholder="请输入用户名", v-model="userForm.username")
      i.fa.fa-user-circle-o.mr-5(slot="suffix")
  el-form-item.mb-5(prop="pwd")
    el-input(placeholder="请输入密码", v-model="userForm.pwd", type="password", @keyup.enter.native="loginAdmin")
      i.fa.fa-unlock-alt(slot="suffix", style="margin-right: 8px")
    //- .text-right
      span.ft-12.text-gray.login-forget(style="margin-right: 2px", @click="forgetPwd") 忘记密码?
  el-form-item.mb-10.mt-20
    el-button(style="width: 100%; letter-spacing: 2px", type="primary", @click="loginAdmin") 登录 
</template>

<script>
import sha1 from 'sha1'
import { mapActions } from 'vuex'
export default {
  data: function() {
    return {
      userForm: {
        username: '',
        pwd: ''
      },
      userRules: {
        username: [
          { required: true, message: '用户名不能为空', trigger: 'blur' }
        ],
        pwd: [
          { required: true, message: '密码不能为空', trigger: 'blur' }
          // { min: 6, mesage: '密码不能少于6位', trigger: 'blur' }
        ]
      },
      pwd: '',
      username: ''
    }
  },
  beforeMount() {
    document.body.className = 'login-container'
  },
  methods: {
    ...mapActions(['setUser']),
    forgetPwd() {
      // TODO 以后再做
      console.log('忘记密码')
    },
    async loginAdmin() {
      try {
        await this.formValidate(this, 'userRuleForm')
        let { data } = await this.request(this, {
          url: '/proxy',
          params: {
            url: this.apiList.login,
            method: 'post',
            params: {
              username: this.userForm.username,
              pwd: sha1(this.userForm.pwd)
            }
          }
        })
        console.log('login data', data)
        if (data.return_code == 0) {
          console.log('登录成功')
          this.setUser(data.user)
          this.jump({ path: '/' })
        } else {
          this.msgShow(this, data.message)
        }
      } catch (e) {
        console.log(e.message)
      }
    }
  }
}
</script>

<style lang="stylus">
.login-container {
  background-image: url('~assets/imgs/yc_bg.jpg');
  height: 100vh;
  position: relative;
  background-repeat: no-repeat;
  background-size: cover;

  .login-form {
    position: absolute;
    width: 420px;
    // height 400px
    right: 5%;
    top: 20%;
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.7);
    border-radius: 3px;
    box-shadow: 0 3px 0 rgba(12, 12, 12, 0.03);
    padding: 30px;

    .login-forget:hover {
      cursor: pointer;
    }
  }
}
</style>
