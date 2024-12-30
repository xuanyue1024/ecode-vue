<template>
  <div class="chat-container">
    <div class="chat-messages" ref="messageContainer">
      <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
        <div class="message-content">{{ message.content }}</div>
      </div>
    </div>
    <div class="chat-input">
      <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="3"
        placeholder="请输入消息..."
        @keyup.enter.native="sendMessage"
      />
      <el-button type="primary" @click="sendMessage" :loading="loading">发送</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Message } from 'element-ui'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default Vue.extend({
  name: 'ChatView',
  data() {
    return {
      messages: [] as ChatMessage[],
      inputMessage: '',
      loading: false,
      eventSource: null as EventSource | null
    }
  },
  methods: {
    async scrollToBottom() {
      await this.$nextTick()
      const container = this.$refs.messageContainer as HTMLElement
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    closeEventSource() {
      if (this.eventSource) {
        this.eventSource.close()
        this.eventSource = null
      }
    },
    async sendMessage() {
      if (!this.inputMessage.trim()) {
        Message.warning('请输入消息')
        return
      }

      // 关闭之前的连接（如果有）
      this.closeEventSource()

      // 添加用户消息
      this.messages.push({
        role: 'user',
        content: this.inputMessage
      })
      
      const userMessage = this.inputMessage
      this.inputMessage = ''
      this.loading = true

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
        const decoder = new TextDecoder('utf-8')
        let buffer = ''
        
        let isReading = true
        while (isReading) {
          const { done, value } = await reader!.read()
          if (done) {
            isReading = false
            break
          }

          // 解码响应数据
          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk
          
          // 处理完整的行
          const lines = buffer.split('\n')
          // 保留最后一个可能不完整的行
          buffer = lines.pop() || ''
          
          // 处理完整的行
          for (const line of lines) {
            if (line.startsWith('data:')) {
              try {
                const jsonData = JSON.parse(line.slice(5))
                if (jsonData.code === 200 && jsonData.data !== null) {
                  // 更新最后一条消息
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

        // 处理缓冲区中剩余的数据
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

        // 最终清理
        decoder.decode()
        this.loading = false

      } catch (error) {
        console.error('Error:', error)
        Message.error('发送消息失败')
        this.loading = false
      }
    }
  },
  beforeDestroy() {
    // 组件销毁前关闭连接
    this.closeEventSource()
  },
  mounted() {
    this.scrollToBottom()
  }
})
</script>

<style scoped>
.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 8px;
}

.message {
  margin-bottom: 12px;
  max-width: 80%;
}

.message.user {
  margin-left: auto;
}

.message.assistant {
  margin-right: auto;
}

.message-content {
  padding: 10px 15px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
  line-height: 1.5;
  font-size: 14px;
}

.message.user .message-content {
  background: #409eff;
  color: white;
}

.message.assistant .message-content {
  background: #f4f4f5;
  color: #333;
}

.chat-input {
  display: flex;
  gap: 10px;
}

.chat-input .el-input {
  flex: 1;
}
</style> 