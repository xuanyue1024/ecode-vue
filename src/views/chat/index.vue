<template>
  <div class="chat-page">
    <div class="chat-container">
      <div class="chat-header">
        <h2>AI 助手</h2>
      </div>
      <div class="chat-messages" ref="messageContainer">
        <template v-for="(message, index) in messages">
          <div :key="index" :class="['chat-message', message.role]">
            <div v-if="message.role === 'user'" class="message-content markdown-body" v-html="renderMarkdown(message.content)"></div>
            <div v-if="message.role === 'user'" class="avatar">
              <el-avatar :size="40" :src="userInfo.profilePicture" icon="el-icon-user"></el-avatar>
            </div>
            <div v-if="message.role === 'assistant'" class="avatar">
              <i class="el-icon-service"></i>
            </div>
            <div v-if="message.role === 'assistant'" class="message-content markdown-body" v-html="renderMarkdown(message.content)"></div>
          </div>
        </template>
      </div>
      <div class="chat-input">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="3"
          placeholder="请输入消息..."
          @keyup.enter.native="sendMessage"
        />
        <el-button type="primary" @click="sendMessage" :loading="chatLoading">
          发送
        </el-button>
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
    },
    createAiChatId(){
      const id = localStorage.getItem('chatId');
      if (id) {
        this.chatId = id;
        return;
      }
      createChatId('chat').then(res => {
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
}

.chat-container {
  width: 800px;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

.chat-header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f7fa;
}

.chat-message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  width: 100%;
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
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-message.user .avatar {
  margin-left: 12px;
  background: linear-gradient(135deg, #409eff, #3a8ee6);
  color: white;
}

.chat-message.assistant .avatar {
  margin-right: 12px;
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
}

.chat-message .message-content {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 8px;
  word-break: break-word;
  line-height: 1.5;
  text-align: left;
  color: #303133;
}

.chat-message.user .message-content {
  background: #f0f9ff;
  border: 1px solid #e6f3ff;
  border-top-right-radius: 4px;
}

.chat-message.assistant .message-content {
  background: white;
  border-top-left-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.chat-input {
  padding: 20px;
  border-top: 1px solid #ebeef5;
  background: white;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.chat-input .el-textarea {
  flex: 1;
}

.chat-input .el-button {
  height: 40px;
}

/* GitHub Markdown 样式覆盖 */
.markdown-body {
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  padding: 0 !important;
  background-color: transparent !important;
}

.chat-message.user .message-content.markdown-body {
  color: #303133 !important;
}

.chat-message.user .message-content.markdown-body * {
  color: #303133 !important;
}

.chat-message.user .message-content.markdown-body pre {
  background: rgba(0,0,0,0.02) !important;
  border: 1px solid rgba(0,0,0,0.05);
}

.chat-message.user .message-content.markdown-body code {
  background: rgba(0,0,0,0.02) !important;
  color: #303133 !important;
}

.chat-message.assistant .message-content.markdown-body pre {
  background: #f6f8fa !important;
  border: 1px solid #ebeef5;
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1);
  border-radius: 3px;
}

.chat-messages:hover::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
}

.chat-message .avatar .el-avatar {
  width: 100%;
  height: 100%;
}
</style> 