<template>
<div class="main">
  <!-- 顶部导航栏 -->
  <div class="top-header">
    <div class="header-content">
      <div class="header-left">
        <i class="el-icon-menu toggle-icon" @click="toggleCollapse"></i>
        <div class="divider"></div>
        <h2 class="page-title">ecode编程实践平台</h2>
      </div>
      <div class="header-right">
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="avatar-container">
            <el-avatar 
              :size="36" 
              :src="userInfo.profilePicture"
              icon="el-icon-user-solid"
            ></el-avatar>
            <span class="username">{{ userInfo.username }}</span>
            <i class="el-icon-caret-bottom"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
  </div>

  <!-- 主要内容区域 -->
  <div class="main-container">
    <!-- 左侧菜单 -->
    <div class="side-menu" :class="{ 'is-collapse': isCollapse }">
      <el-menu 
        :default-active="activeIndex" 
        class="menu-list"
        :collapse="isCollapse"
        background-color="#fff"
        text-color="#303133"
        active-text-color="#409EFF">
        <!-- 个人信息 -->
        <el-menu-item index="personalDetails" @click="$router.push('/personalDetails')">
          <i class="el-icon-user"></i>
          <span slot="title">个人信息</span>
        </el-menu-item>
        <el-menu-item index="myClass" @click="$router.push('/myClass')">
          <i class="el-icon-document"></i>
          <span slot="title">我的班级</span>
        </el-menu-item>
        <el-menu-item index="classManage" @click="$router.push('/classManage')">
          <i class="el-icon-folder"></i>
          <span slot="title">班级管理</span>
        </el-menu-item>
        <el-menu-item index="problemManage" @click="$router.push('/problemManage')">
          <i class="el-icon-edit-outline"></i>
          <span slot="title">题目管理</span>
        </el-menu-item>
        <el-menu-item index="chat" @click="$router.push('/chat')">
          <i class="el-icon-chat-dot-round"></i>
          <span slot="title">AI 助手</span>
        </el-menu-item>
        <el-menu-item index="passkey" @click="$router.push('/passkey')">
          <i class="el-icon-chat-dot-round"></i>
          <span slot="title">注册Passkey(测试)</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content" :class="{ 'is-collapse': isCollapse }">
      <router-view />
    </div>
  </div>
</div>
</template>

<script>
import { getUserInfo } from '@/api/user'
import { marked } from 'marked'
import 'github-markdown-css/github-markdown.css'

export default {
  name: 'MainLayout',
  data() {
    return {
      isCollapse: false,
      activeIndex: 'myClass',
      userInfo: {
        profilePicture: ''
      },
      // AI 聊天相关
      showAiChat: false,
      messages: [],
      inputMessage: '',
      chatLoading: false
    }
  },
  created() {
    this.getUserDetails()
  },
  methods: {
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    handleCommand(command) {
      if (command === 'logout') {
        window.localStorage.removeItem('token')
        window.sessionStorage.removeItem('token')
        this.$router.push('/login')
        this.$message.success('已退出登录')
      }
    },
    async getUserDetails() {
      try {
        const res = await getUserInfo()
        if (res.data.code === 200) {
          this.userInfo = res.data.data
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },
    async scrollToBottom() {
      await this.$nextTick()
      const container = this.$refs.messageContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    async sendMessage() {
      if (!this.inputMessage.trim()) {
        this.$message.warning('请输入消息')
        return
      }

      // 添加用户消息
      this.messages.push({
        role: 'user',
        content: this.inputMessage
      })
      
      const userMessage = this.inputMessage
      this.inputMessage = ''
      this.chatLoading = true

      try {
        // 添加 AI 回复消息
        this.messages.push({
          role: 'assistant',
          content: ''
        })

        const token = window.localStorage.getItem('token') || window.sessionStorage.getItem('token')
        
        // 创建 POST 请求
        const response = await fetch('/api/user/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            aiAction: 'NEXT',
            content: userMessage,
            token: token || ''
          })
        })

        // 获取响应的 reader
        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('Failed to get reader')
        }
        const decoder = new TextDecoder('utf-8')
        let buffer = ''
        
        let isReading = true
        while (isReading) {
          const { done, value } = await reader.read()
          if (done) {
            isReading = false
            break
          }

          // 解码响应数据
          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk
          
          // 处理完整的行
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          
          for (const line of lines) {
            if (line.startsWith('data:')) {
              try {
                const jsonData = JSON.parse(line.slice(5))
                if (jsonData.code === 200 && jsonData.data !== null) {
                  const lastMessage = this.messages[this.messages.length - 1]
                  lastMessage.content += jsonData.data
                  await this.scrollToBottom()
                }
              } catch (error) {
                console.error('Error parsing message:', error)
              }
            }
          }
        }

        if (buffer.length > 0) {
          const lines = buffer.split('\n')
          for (const line of lines) {
            if (line.startsWith('data:')) {
              try {
                const jsonData = JSON.parse(line.slice(5))
                if (jsonData.code === 200 && jsonData.data !== null) {
                  const lastMessage = this.messages[this.messages.length - 1]
                  lastMessage.content += jsonData.data
                  await this.scrollToBottom()
                }
              } catch (error) {
                console.error('Error parsing message:', error)
              }
            }
          }
        }

        decoder.decode()
        this.chatLoading = false

      } catch (error) {
        console.error('Error:', error)
        this.$message.error('发送消息失败')
        this.chatLoading = false
      }
    },
    renderMarkdown(content) {
      try {
        return marked(content || '')
      } catch (error) {
        console.error('Markdown 渲染错误:', error)
        return content
      }
    }
  }
}
</script>

<style scoped>
.main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.top-header {
  height: 60px;
  background-color: white;
  border-bottom: 1px solid #e6e6e6;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-content {
  height: 100%;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.toggle-icon {
  font-size: 20px;
  color: #606266;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s;
}

.toggle-icon:hover {
  background-color: #f5f7fa;
  color: #409EFF;
}

.divider {
  width: 1px;
  height: 24px;
  background-color: #dcdfe6;
  margin: 0 20px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

.avatar-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;
  height: 100%;
}

.avatar-container:hover {
  background: rgba(0,0,0,0.025);
}

.avatar-container .el-icon-caret-bottom {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}

.el-avatar {
  --el-avatar-bg-color: transparent;
}

.main-container {
  margin-top: 60px;
  flex: 1;
  display: flex;
  min-height: calc(100vh - 60px);
}

.side-menu {
  position: fixed;
  left: 0;
  top: 60px;
  bottom: 0;
  width: 200px;
  background-color: white;
  transition: all 0.3s;
  z-index: 999;
}

.side-menu.is-collapse {
  width: 64px;
}

.menu-list {
  border-right: none;
  height: 100%;
}

.main-content {
  flex: 1;
  margin-left: 200px;
  padding: 20px;
  transition: margin-left 0.3s;
  min-height: calc(100vh - 60px);
  box-sizing: border-box;
}

.is-collapse + .main-content {
  margin-left: 64px;
}

/* AI 聊天相关样式 */
.ai-chat-container {
  height: 600px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  background: #ffffff;
  border-radius: 16px 16px 0 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px !important;
  background: #f8f9fa;
  width: 100%;
  box-sizing: border-box;
}

.chat-message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px !important;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-message .avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.chat-message.user .avatar {
  margin-left: 12px;
  background: linear-gradient(135deg, #409eff, #3a8ee6);
  color: white;
  order: 2;
}

.chat-message.assistant .avatar {
  margin-right: 12px;
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
  order: 1;
}

.chat-message .avatar i {
  font-size: 18px;
}

.chat-message .message-content {
  max-width: 85%;
  min-width: 50px;
  padding: 12px 16px !important;
  border-radius: 16px;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.5;
  font-size: 14px;
  white-space: pre-wrap;
  box-sizing: border-box;
  font-weight: 400;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.chat-message.user .message-content {
  background: linear-gradient(135deg, #409eff, #3a8ee6);
  color: #fff;
  margin-right: 0;
  order: 1;
  border-top-right-radius: 4px;
}

.chat-message.assistant .message-content {
  background: #ffffff;
  color: #1a1a1a;
  margin-left: 0;
  order: 2;
  border-top-left-radius: 4px;
}

.chat-input {
  padding: 16px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background: #ffffff;
  border-radius: 0 0 16px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
}

.chat-input .el-textarea__inner {
  border-radius: 12px;
  resize: none;
  height: 45px !important;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  font-size: 14px;
  color: #1a1a1a;
  background: #f8f9fa;
}

.chat-input .el-textarea__inner:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.chat-input .el-button {
  height: 45px;
  width: 45px;
  padding: 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #409eff;
  border: none;
}

.chat-input .el-button:hover {
  background: #3a8ee6;
  transform: translateY(-1px);
}

.chat-input .el-button i {
  font-size: 20px;
  color: #ffffff;
}

.ai-chat-popover {
  padding: 0 !important;
  border-radius: 8px !important;
}

/* GitHub Markdown 样式覆盖 */
.markdown-body {
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji;
  font-size: 14px;
  word-wrap: break-word;
  padding: 0 !important;
  background-color: transparent !important;
}

/* 聊天框的 markdown 样式 */
.chat-message.assistant .message-content.markdown-body {
  background: #ffffff !important;
  color: #1a1a1a !important;
  border-radius: 16px;
  border-top-left-radius: 4px;
  padding: 16px !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.chat-message.user .message-content.markdown-body {
  background: linear-gradient(135deg, #409eff, #3a8ee6) !important;
  color: #fff !important;
  padding: 16px !important;
  border-radius: 16px;
  border-top-right-radius: 4px;
}

.chat-message.user .message-content.markdown-body pre {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.chat-message.assistant .message-content.markdown-body pre {
  background: #f8f9fa !important;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.chat-messages:hover::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .header-content {
    padding: 0 15px;
  }

  .divider {
    margin: 0 15px;
  }

  .username {
    display: none;
  }

  .side-menu {
    transform: translateX(-200px);
  }

  .main-content {
    margin-left: 0;
  }
}
</style>
