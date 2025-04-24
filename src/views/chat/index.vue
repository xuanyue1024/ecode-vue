<template>
  <div class="chat-page">
    <div class="chat-container">
      <div class="chat-header">
        <div class="header-title">
          <i class="el-icon-s-opportunity"></i>
          <h2>AI 智能助手</h2>
        </div>
        <el-button type="text" icon="el-icon-refresh-right" @click="createNewChat">新对话</el-button>
      </div>
      <div class="chat-messages" ref="messageContainer">
        <div class="messages-welcome" v-if="messages.length === 0">
          <div class="welcome-icon">
            <i class="el-icon-chat-dot-round"></i>
          </div>
          <h3>欢迎使用 AI 助手</h3>
          <p>请输入您的问题，AI 助手将为您提供帮助</p>
        </div>
        <transition-group name="message-fade">
          <template v-for="(message, index) in messages">
            <div :key="index" :class="['chat-message', message.role]">
              <div v-if="message.role === 'user'" class="message-content markdown-body" v-html="renderMarkdown(message.content)"></div>
              <div v-if="message.role === 'user'" class="avatar">
                <el-avatar :size="40" :src="userInfo.profilePicture" icon="el-icon-user"></el-avatar>
              </div>
              <div v-if="message.role === 'assistant'" class="avatar">
                <div class="assistant-avatar">
                  <i class="el-icon-s-opportunity"></i>
                </div>
              </div>
              <div v-if="message.role === 'assistant'" class="message-content markdown-body" v-html="renderMarkdown(message.content)"></div>
            </div>
          </template>
        </transition-group>
      </div>
      <div class="chat-input">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="3"
          placeholder="请输入您的问题..."
          @keyup.enter.native="sendMessage"
          resize="none"
          maxlength="2000"
          show-word-limit
        />
        <div class="input-buttons">
          <el-tooltip content="清空输入" placement="top">
            <el-button 
              v-if="inputMessage.trim()" 
              type="text" 
              icon="el-icon-delete" 
              @click="inputMessage = ''"
              class="clear-button"
            ></el-button>
          </el-tooltip>
          <el-button type="primary" @click="sendMessage" :loading="chatLoading" :disabled="!inputMessage.trim()">
            <i class="el-icon-s-promotion"></i>
            发送
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked'
import { getUserInfo } from '@/api/user'
import { createChatId } from '@/api/ai'
import 'github-markdown-css/github-markdown.css'

export default {
  name: 'ChatPage',
  data() {
    return {
      chatId: '',
      messages: [],
      inputMessage: '',
      chatLoading: false,
      userInfo: {
        profilePicture: ''
      }
    }
  },
  created() {
    this.getUserDetails()
    this.createAiChatId()
  },
  methods: {
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
    createNewChat() {
      this.$confirm('开始新对话将清空当前对话记录，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.messages = []
        this.createAiChatId()
        this.$message({
          type: 'success',
          message: '已开始新对话'
        })
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      }).catch(() => {})
    },
    async sendMessage(event) {
      if (event && event.type === 'keyup' && event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
      } else if (event && event.type === 'keyup' && event.key === 'Enter' && event.shiftKey) {
        return
      }
      
      if (!this.inputMessage.trim()) {
        this.$message.warning('请输入消息')
        return
      }

      this.messages.push({
        role: 'user',
        content: this.inputMessage
      })
      
      const userMessage = this.inputMessage
      this.inputMessage = ''
      this.chatLoading = true

      try {
        this.messages.push({
          role: 'assistant',
          content: ''
        })

        const token = window.localStorage.getItem('token') || window.sessionStorage.getItem('token')
        
        const response = await fetch('/api/user/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'token': token
          },
          body: JSON.stringify({
            type: 'CHAT',
            chatId: this.chatId,
            prompt: userMessage,
            thinking: true,
            search: true
          })
        })

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

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk
          
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
    },
    createAiChatId(){
      const id = localStorage.getItem('chatId');
      if (id) {
        this.chatId = id;
        return;
      }
      createChatId('CHAT').then(res => {
        if(res.data.code === 200){
          this.chatId = res.data.data;
          window.localStorage.setItem('chatId', res.data.data)
        }
      })
    }
  }
}
</script>

<style scoped>
.chat-page {
  padding: 20px;
  height: calc(100vh - 100px);
  display: flex;
  justify-content: center;
  background-color: #f7f9fc;
}

.chat-container {
  width: 1200px; /* 将宽度从900px增加到1200px */
  height: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: 95%; /* 添加最大宽度比例，以确保在小屏幕上有合适的间距 */
}

.chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
}

.header-title {
  display: flex;
  align-items: center;
}

.header-title i {
  font-size: 22px;
  color: #409EFF;
  margin-right: 10px;
}

.chat-header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f9fafc;
  scroll-behavior: smooth;
}

.messages-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  text-align: center;
  padding: 0 20px;
}

.welcome-icon {
  font-size: 50px;
  color: #409EFF;
  margin-bottom: 20px;
}

.messages-welcome h3 {
  font-size: 22px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #606266;
}

.messages-welcome p {
  font-size: 14px;
  line-height: 1.6;
  max-width: 400px;
}

.chat-message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
  width: 100%;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.chat-message.user {
  justify-content: flex-end;
}

.chat-message.assistant {
  justify-content: flex-start;
}

.chat-message .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.chat-message.user .avatar {
  margin-left: 16px;
  order: 2;
}

.chat-message.assistant .avatar {
  margin-right: 16px;
  order: 1;
}

.assistant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF, #007FFF);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.chat-message .message-content {
  max-width: 85%; /* 将消息气泡最大宽度从75%增加到85% */
  padding: 16px 20px !important; /* 确保内边距不被覆盖 */
  border-radius: 16px;
  word-break: break-word;
  line-height: 1.6;
  text-align: left;
  color: #303133;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.chat-message.user .message-content {
  background: linear-gradient(135deg, #ecf6ff, #e0f0ff);
  border-bottom-right-radius: 4px;
  color: #333;
  order: 1;
}

.chat-message.assistant .message-content {
  background: white;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  order: 2;
}

/* 添加气泡箭头效果 */
.chat-message.user .message-content::after {
  content: '';
  position: absolute;
  right: -8px;
  bottom: 15px;
  width: 0;
  height: 0;
  border-left: 10px solid #e0f0ff;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

.chat-message.assistant .message-content::after {
  content: '';
  position: absolute;
  left: -8px;
  bottom: 15px;
  width: 0;
  height: 0;
  border-right: 10px solid white;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

.chat-input {
  padding: 16px 24px;
  border-top: 1px solid #ebeef5;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-input .el-textarea >>> .el-textarea__inner {
  border-radius: 8px;
  padding: 12px 16px;
  resize: none;
  transition: all 0.3s;
  border: 1px solid #dcdfe6;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
}

.chat-input .el-textarea >>> .el-textarea__inner:focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.input-buttons {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.input-buttons .el-button {
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s;
}

.input-buttons .el-button i {
  margin-right: 6px;
}

.clear-button {
  margin-right: 8px;
  color: #909399;
}

/* GitHub Markdown 样式覆盖 */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
  padding: 0 !important;
  background-color: transparent !important;
}

/* 确保markdown内容不会覆盖消息气泡的内边距 */
.chat-message .message-content.markdown-body {
  padding: 16px 20px !important;
  margin: 0 !important;
}

/* 修复markdown内容与气泡边缘的间距 */
.chat-message .message-content.markdown-body > *:first-child {
  margin-top: 0 !important;
}

.chat-message .message-content.markdown-body > *:last-child {
  margin-bottom: 0 !important;
}

.chat-message.user .message-content.markdown-body {
  color: #333 !important;
}

.chat-message.user .message-content.markdown-body pre {
  background: rgba(0, 0, 0, 0.03) !important;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 16px;
  border-radius: 8px;
  margin: 12px 0;
}

.chat-message.user .message-content.markdown-body code {
  background: rgba(0, 0, 0, 0.04) !important;
  color: #333 !important;
  padding: 2px 6px;
  border-radius: 4px;
}

.chat-message.assistant .message-content.markdown-body pre {
  background: #f8f9fa !important;
  border: 1px solid #eaecef;
  padding: 16px;
  border-radius: 8px;
  margin: 12px 0;
}

.chat-message.assistant .message-content.markdown-body code {
  background: #f0f2f5 !important;
  padding: 2px 6px;
  border-radius: 4px;
}

.chat-message.assistant .message-content.markdown-body a {
  color: #409EFF !important;
  text-decoration: none;
}

.chat-message.assistant .message-content.markdown-body a:hover {
  text-decoration: underline;
}

/* 代码块样式增强 */
.markdown-body pre code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 13px;
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 4px;
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.chat-messages:hover::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
}

.message-fade-enter-active, .message-fade-leave-active {
  transition: all 0.3s;
}

.message-fade-enter, .message-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 添加媒体查询，使界面在不同屏幕尺寸下都有良好的表现 */
@media (max-width: 1400px) {
  .chat-container {
    width: 1000px;
  }
}

@media (max-width: 1100px) {
  .chat-container {
    width: 95%;
  }
  
  .chat-message .message-content {
    max-width: 80%;
  }
}

@media (max-width: 768px) {
  .chat-page {
    padding: 10px;
  }
  
  .chat-message .message-content {
    max-width: 75%;
  }
  
  .chat-header h2 {
    font-size: 16px;
  }
}
</style>