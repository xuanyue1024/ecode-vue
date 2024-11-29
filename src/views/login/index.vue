<template>
<div class="login">
  <el-card class="um-loginbox">
    <el-row class="login-container">
      <el-col :span="12">
        <div style="margin-top: 10%;"><img src="../../assets/ecode.png" alt="" width="300px"></div>
      </el-col>
      <el-col :span="12">
        <div id="login" v-if="isLoginPage == true">
          <!-- 登录方式切换 -->
          <div class="login-toggle">
            <el-button :disabled="loginBtn.passwd" type="text" @click="() => {form.loginType = 'passwd';loginBtn.passwd = true;loginBtn.qr = false}">密码登录</el-button>
            <el-button :disabled="loginBtn.qr" type="text" @click="() => {form.loginType = 'qr';loginBtn.qr = true; loginBtn.passwd = false}">扫码登录</el-button>
          </div>
          <div style="padding: 5px;">
            <div v-if="form.loginType == 'passwd'">
              <el-form ref="form" :model="form" label-width="80px" :rules="rules">
                <el-form-item label="用户名" prop="username">
                  <el-input placeholder="请输入用户名" prefix-icon="el-icon-user" v-model="form.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password" style="margin-bottom: 0px;">
                  <el-input placeholder="请输入密码" prefix-icon="el-icon-lock" v-model="form.password" show-password></el-input>
                </el-form-item>
                <el-form-item style="margin: 5px;">
                  <div style="display: flex; justify-content: space-between;">
                    <el-button type="text">忘记密码？</el-button>
                    <el-button type="text" @click="() => {isLoginPage = false}">没有账号？戳我注册</el-button>
                  </div>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" style="width: 100%;" @click="login('form')" :loading="loginLoad">登录</el-button>
                </el-form-item>
                <el-form-item label="">
                  <el-divider>其它登录方式</el-divider>
                </el-form-item>
                <el-form-item label="">
                  <i class="el-icon-share"></i>
                </el-form-item>
              </el-form>
            </div>
            <div v-if="form.loginType == 'qr'"><img width="250px" src="data:image/png;base64,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" alt=""></div>
          </div>
        </div>
        <!-- 注册界面 -->
        <div id="register" v-if="isLoginPage == false" style="margin-top: 0px;">
          <span class="login-toggle">注册</span>
          <el-form ref="regForm" :model="regForm" label-width="80px" :rules="rules">
            <el-form-item label="用户名" prop="username">
              <el-input placeholder="请输入用户名" prefix-icon="el-icon-user" v-model="regForm.username"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input placeholder="请输入邮箱" prefix-icon="el-icon-message" v-model="regForm.email"><el-button slot="append" @click="getEmailCode()" :loading="codeLoad" :disabled="codeDisabled">{{ emailCodeButtonText }}</el-button></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input placeholder="请输入密码" prefix-icon="el-icon-lock" v-model="regForm.password" show-password></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="password">
              <el-input placeholder="请输入密码" prefix-icon="el-icon-lock" v-model="confirmPassword" show-password></el-input>
            </el-form-item>
            <el-form-item label="验证码" prop="emailCode" style="margin-bottom: 0px;">
              <el-input placeholder="请输入验证码" prefix-icon="el-icon-chat-line-square" v-model="regForm.emailCode"></el-input>
            </el-form-item>
            <el-form-item style="margin: 5px;">
              <div style="display: flex; justify-content: right;">
                <el-button type="text" @click="() => {isLoginPage = true}">已有账号？戳我登录</el-button>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" style="width: 100%;" @click="register('regForm')" :loading="loginLoad">注册</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
    </el-row>
  </el-card>
</div>
</template>

  
<script lang="ts">
import Vue from 'vue';
import {
  loginByPassword, registerByEmail, getEmailCode
} from '@/api/user';
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
      regForm: {
        username: '',
        email: '',
        emailCode: '',
        password: ''
      },
      confirmPassword: '',//单独的确认密码
      loginBtn: {
        passwd: true,
        qr: false
      },
      isLoginPage: true,//是否是登录界面
      countdown: 0, // 倒计时剩余秒数
      emailCodeButtonText: '获取验证码',//获取验证码按钮文本
      // 表单校验规则
      rules: {
        username: [{
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 12,
            message: '用户名长度在 3 到 12 个字符',
            trigger: 'blur'
          }
        ],
        password: [{
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          }, // 修改提示信息
          {
            min: 3,
            max: 12,
            message: '密码长度在 3 到 12 个字符',
            trigger: 'blur'
          }
        ],
        emailCode: [{
            required: true,
            message: '请输入验证码',
            trigger: 'blur'
          }, // 修改提示信息
          {
            min: 6,
            max: 6,
            message: '验证码为6位数字',
            trigger: 'blur'
          }
        ],
        email: [
        {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          }
        ]
      },
      loginLoad: false,//登录注册加载
      codeLoad: false,//验证码加载
      codeDisabled: false //验证码按钮禁用
    }
  },
  methods: {
    //登录提交
    login(formName: string) {
      const formRef = this.$refs[formName] as Vue & {
        validate: (callback: (valid: boolean) => void) => void
      };

      formRef.validate((valid: boolean) => {
        if (valid) {
          this.loginLoad = true;
          let data = {
            ...this.form
          };
          data.password = md5(this.form.password).toUpperCase();
          loginByPassword(data).then(res => {
            if (res.data.code === 200) {
              this.$message.success('登录成功，正在跳转');
              window.localStorage.setItem('token', res.data.data.token);
              this.$router.push({
                path: '/'
              })
            } else {
              this.$message.error(res.data.msg);
            }
            this.loginLoad = false;
          }).catch(error => {
            this.loginLoad = false;
          })
        }
      });
    },
    //注册提交
    register(formName: string) {
      const formRef = this.$refs[formName] as Vue & {
        validate: (callback: (valid: boolean) => void) => void
      };
      if(this.confirmPassword !== this.regForm.password){
        this.$message.error('两次输入密码不一致');
        return;
      }
      formRef.validate((valid: boolean) => {
        if (valid) {
          this.loginLoad = true;
          let data = {
            ...this.regForm
          };
          data.password = md5(this.regForm.password).toUpperCase();
          registerByEmail(data).then(res => {
            if (res.data.code === 200) {
              this.$message.success('注册成功，正在跳转登录');
              this.isLoginPage = true;
            } else {
              this.$message.error(res.data.msg);
            }
            this.loginLoad = false;
          }).catch(error => {
            this.loginLoad = false;
          })
        }
      });
    },
    //获取邮箱验证码
    getEmailCode(){
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      if (regEmail.test(this.regForm.email)) {
        this.codeLoad = true;
        this.codeDisabled = true;
        getEmailCode(this.regForm.email).then(res => {
          if (res.data.code === 200) {
            this.codeLoad = false;
            this.startCountdown();
          } else {
            this.$message.error(res.data.msg);
            this.codeLoad = false;
            this.codeDisabled = false;
          }
        })
      }else{
        this.$message.error('请输入正确的邮箱');
      }
    },
    //倒计时方法
    startCountdown() {
    if (this.countdown === 0) {
      this.countdown = 60;
      const intervalId = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
          this.emailCodeButtonText = `${this.countdown}秒后重新获取`;
        } else {
          this.emailCodeButtonText = '获取验证码';
          this.codeDisabled = false;
          clearInterval(intervalId); // 清除定时器
        }
      }, 1000);
    }
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
}

.um-loginbox {
  width: 60%;
  height: 50%;
  padding: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.login-toggle {
  margin-bottom: 5%;
}
</style>
