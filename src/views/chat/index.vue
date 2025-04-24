<template>
  <div class="chat-page">
    <!-- 聊天容器 -->
    <div class="chat-container">
      <!-- 侧边栏 - 会话列表 -->
      <div class="chat-sidebar">
        <div class="sidebar-header">
          <h3>会话列表</h3>
          <el-button 
            type="primary" 
            size="small" 
            icon="el-icon-plus" 
            @click="createNewChat"
            round
          >新建会话</el-button>
        </div>
        
        <div class="sidebar-content">
          <div v-if="chatList.length === 0" class="empty-chat-list">
            <i class="el-icon-chat-line-round"></i>
            <p>暂无会话记录</p>
          </div>
          <ul v-else class="chat-list">
            <li 
              v-for="(chat, index) in chatList" 
              :key="chat.chgatId"
              :class="['chat-item', { active: chat.chgatId === chatId }]"
              @click="switchChat(chat.chgatId)"
            >
              <div class="chat-item-icon">
                <i class="el-icon-chat-dot-round"></i>
              </div>
              <div class="chat-item-info">
                <div class="chat-item-title">会话 {{ chatList.length - index }}</div>
                <div class="chat-item-time">{{ formatDate(chat.createTime) }}</div>
              </div>
              <div class="chat-item-actions">
                <el-tooltip content="删除会话" placement="top">
                  <i 
                    class="el-icon-delete" 
                    @click.stop="confirmDeleteChat(chat.chgatId)"
                  ></i>
                </el-tooltip>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- 主聊天区域 -->
      <div class="chat-main">
        <div class="chat-header">
          <div class="header-title">
            <i class="el-icon-s-opportunity"></i>
            <h2>AI 智能助手</h2>
          </div>
          <el-button type="text" icon="el-icon-refresh-right" @click="confirmCreateNewChat">新对话</el-button>
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
  </div>
</template>

<script>
import { marked } from 'marked'
import { getUserInfo } from '@/api/user'
import { createChatId, getChatHistory, getChatMessages, deleteChatHistory } from '@/api/ai'
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
      },
      chatList: [], // 会话列表
      isLoadingHistory: false // 是否正在加载历史记录
    }
  },
  created() {
    this.getUserDetails()
    this.getChatList()
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
    // 获取会话列表
    async getChatList() {
      try {
        const res = await getChatHistory('CHAT')
        if (res.data.code === 200) {
          this.chatList = res.data.data || []
          // 如果有会话列表但没有选中会话，选择最新一个
          if (this.chatList.length > 0 && !this.chatId) {
            const storedChatId = localStorage.getItem('chatId')
            if (storedChatId && this.chatList.some(chat => chat.chgatId === storedChatId)) {
              // 如果存储的chatId在列表中，使用它
              this.chatId = storedChatId
            } else {
              // 否则使用最新的会话
              this.chatId = this.chatList[0].chgatId
            }
            localStorage.setItem('chatId', this.chatId)
            this.loadChatHistory(this.chatId)
          } else if (this.chatList.length === 0) {
            // 如果没有会话，创建一个新的
            this.createAiChatId()
          }
        }
      } catch (error) {
        console.error('获取会话列表失败:', error)
        this.$message.error('获取会话列表失败')
      }
    },
    // 加载特定会话的历史记录
    async loadChatHistory(chatId) {
      if (!chatId) return
      
      this.isLoadingHistory = true
      this.messages = [] // 清空当前消息
      
      try {
        const res = await getChatMessages('CHAT', chatId)
        if (res.data.code === 200) {
          this.messages = res.data.data || []
          this.scrollToBottom()
        }
      } catch (error) {
        console.error('获取会话历史失败:', error)
        this.$message.error('获取会话历史失败')
      } finally {
        this.isLoadingHistory = false
      }
    },
    // 切换会话
    async switchChat(chatId) {
      if (this.chatId === chatId || this.chatLoading || this.isLoadingHistory) return
      
      this.chatId = chatId
      localStorage.setItem('chatId', chatId)
      await this.loadChatHistory(chatId)
    },
    // 确认创建新对话
    confirmCreateNewChat() {
      this.$confirm('开始新对话将清空当前对话记录，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.createNewChat()
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      }).catch(() => {})
    },
    // 创建新对话
    async createNewChat() {
      await this.createAiChatId()
      this.messages = []
      this.$message({
        type: 'success',
        message: '已开始新对话'
      })
      // 更新会话列表
      this.getChatList()
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
        
        // 对话完成后刷新会话列表
        this.getChatList()

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
    async createAiChatId(){
      try {
        const res = await createChatId('CHAT')
        if(res.data.code === 200){
          this.chatId = res.data.data
          window.localStorage.setItem('chatId', res.data.data)
        }
      } catch (error) {
        console.error('创建会话ID失败:', error)
        this.$message.error('创建会话失败')
      }
    },
    // 确认删除会话
    confirmDeleteChat(chatId) {
      this.$confirm('确定要删除这个会话吗？此操作无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteChat(chatId)
      }).catch(() => {
        // 用户取消删除操作
      })
    },
    
    // 删除会话
    async deleteChat(chatId) {
      try {
        const res = await deleteChatHistory('CHAT', chatId)
        if (res.data.code === 200) {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          
          // 如果删除的是当前选中的会话
          if (chatId === this.chatId) {
            this.messages = []
            // 获取最新的会话列表
            const chatListRes = await getChatHistory('CHAT')
            if (chatListRes.data.code === 200) {
              this.chatList = chatListRes.data.data || []
              
              if (this.chatList.length > 0) {
                // 如果还有其他会话，选择第一个
                this.chatId = this.chatList[0].chgatId
                localStorage.setItem('chatId', this.chatId)
                await this.loadChatHistory(this.chatId)
              } else {
                // 如果没有会话了，创建一个新的
                await this.createAiChatId()
              }
            }
          } else {
            // 如果删除的不是当前会话，只需要刷新列表
            this.getChatList()
          }
        } else {
          this.$message.error('删除失败')
        }
      } catch (error) {
        console.error('删除会话失败:', error)
        this.$message.error('删除会话失败')
      }
    },
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      // 如果是今天
      if (date >= today) {
        return this.formatTime(date)
      }
      // 如果是昨天
      else if (date >= yesterday) {
        return '昨天 ' + this.formatTime(date)
      }
      // 其他日期
      else {
        return `${date.getMonth() + 1}月${date.getDate()}日 ${this.formatTime(date)}`
      }
    },
    // 格式化时间
    formatTime(date) {
      const hours = date.getHours()
      const minutes = date.getMinutes()
      return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`
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
  width: 1200px;
  height: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  overflow: hidden;
  max-width: 95%;
}

/* 侧边栏样式 */
.chat-sidebar {
  width: 280px;
  background: #f0f4f9;
  border-right: 1px solid #e0e6ed;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e0e6ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.empty-chat-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
}

.empty-chat-list i {
  font-size: 40px;
  margin-bottom: 10px;
}

.chat-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 8px;
  margin: 0 8px 4px 8px;
  position: relative;
}

.chat-item:hover {
  background-color: rgba(64, 158, 255, 0.08);
}

.chat-item.active {
  background-color: rgba(64, 158, 255, 0.15);
}

.chat-item-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e0f0ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #409EFF;
}

.chat-item-info {
  flex: 1;
  overflow: hidden;
}

.chat-item-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-item-time {
  font-size: 12px;
  color: #909399;
}

.chat-item-actions {
  display: none;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.chat-item:hover .chat-item-actions {
  display: block;
}

.chat-item-actions i {
  font-size: 16px;
  color: #909399;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s;
}

.chat-item-actions i:hover {
  color: #F56C6C;
}

/* 确保在选中状态下删除按钮也显示 */
.chat-item.active .chat-item-actions {
  display: block;
}

/* 主聊天区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
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
  max-width: 85%;
  padding: 16px 20px !important;
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
.chat-messages::-webkit-scrollbar,
.sidebar-content::-webkit-scrollbar {
  width: 4px;
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb,
.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.chat-messages:hover::-webkit-scrollbar-thumb,
.sidebar-content:hover::-webkit-scrollbar-thumb {
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
  
  .chat-sidebar {
    width: 240px;
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
  
  .chat-sidebar {
    width: 200px;
  }
}
</style>