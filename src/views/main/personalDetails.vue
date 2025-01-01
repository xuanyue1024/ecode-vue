<template>
  <div class="personal-details">
    <div class="page-header">
      <div class="header-content">
        <i class="el-icon-user"></i>
        <span>个人信息</span>
      </div>
      <div class="header-divider"></div>
    </div>
    
    <div class="profile-container">
      <!-- 左侧头像区域 -->
      <div class="avatar-section">
        <el-upload
          class="avatar-uploader"
          action="/api/open/upload"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload">
          <div class="avatar-wrapper">
            <img v-if="avatarUrl" :src="avatarUrl" class="avatar" alt="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="avatar-hover-mask">
              <i class="el-icon-camera"></i>
              <span>更换头像</span>
            </div>
          </div>
        </el-upload>
        <p class="upload-tip">支持 jpg、png 格式大小 2MB 以内的图片</p>
      </div>

      <!-- 右侧表单区域 -->
      <div class="form-section">
        <el-form :model="userInfo" label-width="100px" ref="form" :rules="rules" class="info-form">
          <el-form-item label="用户名">
            <el-input v-model="userInfo.username" disabled></el-input>
          </el-form-item>

          <el-form-item label="角色">
            <el-input v-model="userInfo.role" disabled></el-input>
          </el-form-item>

          <el-form-item label="昵称" prop="name">
            <el-input v-model="userInfo.name" placeholder="请输入昵称"></el-input>
          </el-form-item>

          <el-form-item label="性别">
            <el-radio-group v-model="userInfo.sex">
              <el-radio label="MALE">男</el-radio>
              <el-radio label="FEMALE">女</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="电话" prop="phone">
            <el-input v-model="userInfo.phone" placeholder="请输入电话号码"></el-input>
          </el-form-item>

          <el-form-item label="地址" prop="address">
            <el-input v-model="userInfo.address" placeholder="请输入地址"></el-input>
          </el-form-item>

          <el-form-item label="出生日期">
            <el-date-picker
              v-model="userInfo.birthDate"
              type="date"
              placeholder="选择出生日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              style="width: 100%">
            </el-date-picker>
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <div class="email-input">
              <el-input v-model="userInfo.email" placeholder="请输入邮箱" disabled></el-input>
              <el-button type="primary" @click="openEmailDialog" size="small">修改</el-button>
            </div>
          </el-form-item>

          <el-form-item class="form-buttons">
            <el-button @click="cancelEdit">取 消</el-button>
            <el-button type="primary" @click="saveInfo">保 存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 修改邮箱弹窗 -->
    <el-dialog title="修改邮箱" :visible.sync="emailDialogVisible" width="400px" custom-class="email-dialog">
      <el-form :model="emailForm" :rules="emailRules" ref="emailForm" label-width="0">
        <el-form-item prop="newEmail">
          <el-input v-model="emailForm.newEmail" placeholder="请输入新邮箱地址">
            <template slot="prepend">新邮箱</template>
          </el-input>
        </el-form-item>
        <el-form-item prop="code">
          <div class="verify-code">
            <el-input v-model="emailForm.code" placeholder="请输入验证码">
              <template slot="prepend">验证码</template>
            </el-input>
            <el-button 
              type="primary" 
              @click="sendEmailCode" 
              :loading="isEmailSending"
              :disabled="isEmailSending">
              {{ sendButtonText }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="emailDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEmailChange">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUserInfo, updateUserInfo, uploadFile, getEmailCode } from '@/api/user'

export default {
  name: 'PersonalDetails',
  data() {
    return {
      userInfo: {
        id: null,
        username: '',
        role: '',
        email: '',
        status: '',
        name: '',
        profilePicture: '',
        phone: '',
        sex: 'MALE',
        address: '',
        score: 0,
        birthDate: '',
        createTime: '',
        updateTime: ''
      },
      avatarUrl: '',
      emailDialogVisible: false,
      isEmailSending: false,
      countdown: 60,
      timer: null,
      emailForm: {
        newEmail: '',
        code: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ]
      },
      emailRules: {
        newEmail: [
          { required: true, message: '请输入新邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '验证码长度应为6位', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    sendButtonText() {
      return this.isEmailSending ? `${this.countdown}s后重试` : '发送验证码'
    }
  },
  created() {
    this.getUserDetails()
  },
  methods: {
    // 获取用户详情
    async getUserDetails() {
      try {
        const res = await getUserInfo()
        if (res.data.code === 200) {
          const data = res.data.data
          this.userInfo = {
            id: data.id,
            username: data.username,
            role: data.role,
            email: data.email,
            status: data.status,
            name: data.name,
            profilePicture: data.profilePicture,
            phone: data.phone,
            sex: data.sex,
            address: data.address,
            score: data.score,
            birthDate: data.birthDate,
            createTime: data.createTime,
            updateTime: data.updateTime
          }
          this.avatarUrl = data.profilePicture
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        this.$message.error('获取用户信息失败')
      }
    },

    // 处理头像上传成功
    async handleAvatarSuccess(res, file) {
      if (res.code === 200) {
        this.avatarUrl = res.data
        // 更新用户信息中的头像
        try {
          const updateData = {
            profilePicture: res.data
          }
          const updateRes = await updateUserInfo(updateData)
          if (updateRes.data.code === 200) {
            this.$message.success('头像更新成功')
            this.getUserDetails() // 刷新用户信息
          } else {
            this.$message.error(updateRes.data.msg || '更新头像失败')
          }
        } catch (error) {
          console.error('更新头像失败:', error)
          this.$message.error('更新头像失败')
        }
      } else {
        this.$message.error(res.msg || '上传头像失败')
      }
    },

    // 头像上传前的验证
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },

    // 打开邮箱修改对话框
    openEmailDialog() {
      this.emailDialogVisible = true
      this.emailForm.newEmail = ''
      this.emailForm.code = ''
    },

    // 发送邮箱验证码
    async sendEmailCode() {
      if (!this.emailForm.newEmail) {
        return this.$message.warning('请先输入新邮箱地址')
      }
      this.isEmailSending = true
      this.countdown = 60
      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--
        } else {
          this.isEmailSending = false
          clearInterval(this.timer)
        }
      }, 1000)
      
      try {
        const res = await getEmailCode(this.emailForm.newEmail)
        if (res.data.code === 200) {
          this.$message.success('验证码已发送到邮箱')
        } else {
          this.$message.error(res.data.msg || '发送验证码失败')
          this.isEmailSending = false
          clearInterval(this.timer)
        }
      } catch (error) {
        console.error('发送验证码失败:', error)
        this.$message.error('发送验证码失败')
        this.isEmailSending = false
        clearInterval(this.timer)
      }
    },

    // 确认修改邮箱
    async confirmEmailChange() {
      this.$refs.emailForm.validate(async valid => {
        if (valid) {
          try {
            const updateData = {
              email: this.emailForm.newEmail,
              code: this.emailForm.code
            }
            const res = await updateUserInfo(updateData)
            if (res.data.code === 200) {
              this.userInfo.email = this.emailForm.newEmail
              this.emailDialogVisible = false
              this.$message.success('邮箱修改成功')
              this.getUserDetails() // 刷新用户信息
            } else {
              this.$message.error(res.data.msg || '修改邮箱失败')
            }
          } catch (error) {
            console.error('修改邮箱失败:', error)
            this.$message.error('修改邮箱失败')
          }
        }
      })
    },

    // 保存用户信息
    async saveInfo() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          try {
            const updateData = {
              name: this.userInfo.name,
              sex: this.userInfo.sex,
              birthDate: this.userInfo.birthDate || null,
              address: this.userInfo.address || '',
              phone: this.userInfo.phone || null
            }
            
            const res = await updateUserInfo(updateData)
            if (res.data.code === 200) {
              this.$message.success('个人信息保存成功')
              this.getUserDetails() // 刷新用户信息
            } else {
              this.$message.error(res.data.msg || '保存失败')
            }
          } catch (error) {
            console.error('保存用户信息失败:', error)
            this.$message.error('保存失败')
          }
        }
      })
    },

    // 取消修改
    cancelEdit() {
      this.getUserDetails()
      this.$message.info('已取消修改')
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>

<style scoped>
.personal-details {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  color: #303133;
  font-weight: 500;
}

.header-content i {
  font-size: 24px;
  color: #409EFF;
}

.header-divider {
  margin-top: 15px;
  height: 1px;
  background: linear-gradient(to right, #409EFF, transparent);
  width: 100%;
  max-width: 900px;
}

.profile-container {
  display: flex;
  gap: 40px;
  background-color: white;
  padding: 30px;
  border-radius: 4px;
  max-width: 900px;
}

.avatar-section {
  flex: 0 0 200px;
  text-align: center;
}

.form-section {
  flex: 1;
  max-width: 600px;
}

.avatar-wrapper {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  border: 2px solid #ebeef5;
  margin: 0 auto;
  cursor: pointer;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 100%;
  line-height: 180px;
  text-align: center;
  background-color: #f5f7fa;
}

.avatar-hover-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-wrapper:hover .avatar-hover-mask {
  opacity: 1;
}

.avatar-hover-mask i {
  font-size: 24px;
  margin-bottom: 8px;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 10px;
}

.email-input {
  display: flex;
  gap: 10px;
}

.email-input .el-input {
  flex: 1;
}

.verify-code {
  display: flex;
  gap: 10px;
}

.verify-code .el-input {
  flex: 1;
}

.verify-code .el-button {
  width: 120px;
}

.form-buttons {
  margin-top: 30px;
  text-align: right;
}

.email-dialog .el-input-group__prepend {
  width: 60px;
  text-align: center;
}

.info-form .el-form-item {
  width: 100%;
  max-width: 500px;
}

.info-form .el-input,
.info-form .el-select,
.info-form .el-date-picker {
  width: 100%;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .profile-container {
    flex-direction: column;
    align-items: center;
    padding: 20px;
    max-width: none;
  }
  
  .avatar-section {
    margin-bottom: 30px;
  }
  
  .form-section {
    width: 100%;
    max-width: none;
  }
  
  .info-form .el-form-item {
    max-width: none;
  }
  
  .email-input {
    max-width: none;
    display: flex;
    gap: 10px;
  }
}
</style>
