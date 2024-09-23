<template>
  <div class="login">
    <el-card class="um-loginbox">
      <el-row type="flex" justify="center" align="middle" class="login-container">
        <el-col :span="12">2</el-col>
        <el-col :span="12">
          <el-row type="flex" align="middle">
            <el-col :span="24">
              <!-- 登录方式切换 -->
              <div class="login-toggle">
                <el-button :disabled="loginBtn.passwd" type="text" @click="() => {form.loginType = 'passwd';loginBtn.passwd = true;loginBtn.qr = false}">密码登录</el-button>
                <el-button :disabled="loginBtn.qr" type="text" @click="() => {form.loginType = 'qr';loginBtn.qr = true; loginBtn.passwd = false}">扫码登录</el-button>
              </div>
              <div v-if="form.loginType == 'passwd'" style="padding: 5%;">
                <el-form ref="form" :model="form" label-width="80px" :rules="rules">
                  <el-form-item label="用户名" prop="username">
                    <el-input placeholder="请输入用户名" prefix-icon="el-icon-user" v-model="form.username"></el-input>
                  </el-form-item>
                  <el-form-item label="密码" prop="password">
                    <el-input placeholder="请输入密码" prefix-icon="el-icon-lock" v-model="form.password" show-password></el-input>
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" @click="onSubmit('form')">一键登录</el-button>
                    <el-button>取消</el-button>
                  </el-form-item>
                </el-form>
              </div>
              <div v-if="form.loginType == 'qr'">我是扫码登录</div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-card>
  </div>
  </template>
  
  <script lang="ts">
  import Vue from 'vue';
  import {loginByPassword} from '@/api/user';
  import md5 from 'md5';
  export default Vue.extend({
    name: 'index',
    data() {
      return {
        form: {
          username: '',
          password: '',
          role: '',
          loginType: 'passwd'
        },
        loginBtn: {
          passwd: true,
          qr: false
        },
        // 表单校验规则
        rules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 12, message: '用户名长度在 3 到 12 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },  // 修改提示信息
            { min: 3, max: 12, message: '密码长度在 3 到 12 个字符', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      onSubmit(formName: string) {
        const formRef = this.$refs[formName] as Vue & {
          validate: (callback: (valid: boolean) => void) => void
        };
  
        formRef.validate((valid: boolean) => {
          if (valid) {
            let data = {...this.form};
            data.password = md5(this.form.password).toUpperCase();
            loginByPassword(data).then(res => {
              alert(JSON.stringify(res.data));
            })
          } else {
            alert('验证未通过');
            return false;
          }
        });
      }
    }
  });
  </script>
  
  <style>
  /* 样式保持不变 */
  .login {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  
  .login-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .um-loginbox {
    width: 60%;
    height: 50%;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
  
  .login-toggle {
    margin-bottom: 5%;
  }
  </style>
  