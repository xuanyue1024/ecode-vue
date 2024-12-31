<template>
  <div class="code">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossorigin="anonymous">
    <el-container>
      <el-header style="height: auto;width: 100%;padding:0px">
        <el-menu style="width: 100%" :default-active="activeIndex2" class="el-menu-demo" mode="horizontal"
                 @select="handleSelect" background-color="transparent" text-color="#1E1E1E" active-text-color="#000000">
          <el-menu-item index="back" class="menu-left-item">
            <i class="el-icon-back" @click="goBack"></i>
          </el-menu-item>
          <el-menu-item index="ai" class="menu-left-item">
            <el-popover
              placement="bottom-start"
              width="500"
              trigger="click"
              v-model="showAiChat">
              <div class="ai-chat-container">
                <div class="chat-header">
                  <span>AI 助手</span>
                </div>
                <div class="chat-messages" ref="messageContainer">
                  <template v-for="(message, index) in messages">
                    <div :key="index" :class="['chat-message', message.role]">
                      <template v-if="message.role === 'user'">
                        <div class="message-content">{{ message.content }}</div>
                        <div class="avatar">
                          <i class="el-icon-user"></i>
                        </div>
                      </template>
                      <template v-else>
                        <div class="avatar">
                          <i class="el-icon-service"></i>
                        </div>
                        <div class="message-content markdown-body" v-html="renderMarkdown(message.content)"></div>
                      </template>
                    </div>
                  </template>
                </div>
                <div class="chat-input">
                  <el-input
                    v-model="inputMessage"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入消息..."
                    @keyup.enter.native="sendMessage"
                  />
                  <el-button type="primary" circle @click="sendMessage" :loading="chatLoading">
                    <i class="el-icon-s-promotion"></i>
                  </el-button>
                </div>
              </div>
              <i class="el-icon-chat-dot-round" slot="reference" style="font-size: 20px;"></i>
            </el-popover>
          </el-menu-item>
          <el-menu-item index="s3" class="setting-menu-item" style="float: right; padding-right: 20px; width: auto;">
            <div class="editor-settings">
              <el-select size="small" v-model="codeEditorSetting.theme" placeholder="主题" style="width: 100px; margin-right: 10px;"
                       @change="() => {this.monacoEditor.updateOptions({ theme: this.codeEditorSetting.theme })}">
                <el-option value="vs-dark" label="vs-dark"></el-option>
                <el-option value="hc-black" label="hc-black"></el-option>
                <el-option value="vs" label="vs"></el-option>
              </el-select>
              <el-select size="small" v-model="codeEditorSetting.language" placeholder="语言" style="width: 100px; margin-right: 10px;"
                       @change="() => {this.monacoEditor.updateOptions({ language: this.codeEditorSetting.language });this.monacoEditor.setValue($store.state.exampleCode.get(this.codeEditorSetting.language))}">
                <el-option value="java" label="java"></el-option>
                <el-option value="python3" label="python3"></el-option>
                <el-option value="cpp" label="cpp"></el-option>
              </el-select>
              <el-select size="small" v-model="codeEditorSetting.fontSize" placeholder="字体大小" style="width: 100px;"
                       @change="() => {this.monacoEditor.updateOptions({ fontSize: this.codeEditorSetting.fontSize })}">
                <el-option value="12px" label="12px"></el-option>
                <el-option value="14px" label="14px"></el-option>
                <el-option value="16px" label="16px"></el-option>
                <el-option value="18px" label="18px"></el-option>
                <el-option value="20px" label="20px"></el-option>
              </el-select>
            </div>
          </el-menu-item>
        </el-menu>
      </el-header>
      <el-container>
        <el-aside class="problem-aside" style="width: 400px;">
          <el-card class="problem-card" style="margin: 5px;" shadow="hover" v-loading="loading">
            <div class="problem-content">
              <div class="problem-header">
                <h2 style="margin: 0; display: inline-block;">{{ problem.title }}</h2>
                <el-tag :type="problem.grade === 'EASY' ? 'success' : problem.grade === 'GENERAL' ? 'warning' : 'danger'" 
                       style="margin-left: 10px;">
                  {{ problem.grade === 'EASY' ? '简单' : problem.grade === 'GENERAL' ? '中等' : '困难' }}
                </el-tag>
              </div>
              
              <div style="margin: 15px 0">
                <h3 style="margin-bottom: 10px">题目内容</h3>
                <div class="markdown-body" v-html="markedContent"></div>
              </div>
              
              <!-- <div style="margin: 15px 0">
                <h3 style="margin-bottom: 10px">题目要求</h3>
                <p>{{ problem.require }}</p>
              </div> -->
            </div>
          </el-card>
        </el-aside>
        <el-container>
          <el-main style="overflow-x: hidden;width: auto;padding: 0px;">
            <el-card shadow="hover" body-style="padding: 0px;" style="margin: 5px;width: 100%;height: 62vh;">
              <div ref="container" class="monaco-editor"
                   style="height: 62vh;text-align:left;margin: 0px;margin-top: 5px;"></div>
            </el-card>
          </el-main>
          <el-footer style="height: 27vh;text-align:left;margin: 5px;padding: 0px;">
            <el-card shadow="hover" style="width: 100%;height: 100%;" body-style="padding: 10px;">
              <div>
                <el-button type="text">测试结果</el-button>
                <el-button type="text" disabled>自测结果</el-button>
              </div>
              <div>
                <el-row :gutter="40">
                  <el-col :span="12">
                    <div>自测输入值</div>
                    <el-card body-style="padding: 0px;" style="margin-top: 8px;" shadow="hover">
                      <div ref="input" style="height: 11vh;"></div>
                    </el-card>
                  </el-col>
                  <el-col :span="12">
                    <div>结果</div>
                    <el-card body-style="padding: 0px;" style="margin-top: 8px;" shadow="hover">
                      <div ref="output" style="height: 11vh;"></div>
                    </el-card>
                  </el-col>
                </el-row>
              </div>
              <div style="text-align:right;margin-top: 10px;">
                <el-button type="primary" @click="debugBtn()" :loading="isDebugLoad" :disabled="isDebugDisabled" plain>
                  调试
                </el-button>
                <el-button type="primary">提交</el-button>
              </div>
            </el-card>
          </el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import * as monaco from 'monaco-editor'
import { marked } from 'marked'
import katex from 'katex'
import 'github-markdown-css/github-markdown.css'
import { debugCode } from '@/api/code'
import { getStudentProblemDetail } from '@/api/problem'

export default {
  name: 'AcMonaco',
  props: {
    opts: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      // 主要配置
      defaultOpts: {
        value: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}`, // 代码编辑器的值
        theme: 'vs', // 编辑器主题：vs, hc-black, or vs-dark，更多选择详见官网
        roundedSelection: true, // 选中圆角
        autoIndent: true, // 自动缩进
        language: 'java',
        automaticLayout: true, // 自动布局
        minimap: {
          enabled: true // 是否启用预览图
        }, // 预览图设置
        fontSize: '18px'//字体大小
      },
      //输入框与输出框编辑器配置
      inoutOpts: {
        language: 'customLang', // 设置语言
        theme: 'vs',
        lineNumbers: 'off', // 隐藏左侧行号
        minimap: {enabled: false}, // 取消右侧的预览图
        contextMenu: false // 禁用右键菜单
      },
      // 编辑器对象
      monacoEditor: {},//代码编辑器对象
      outputEditor: {},//调试输入框对象
      inputEditor: {},//调试输出框对象
      isDebugLoad: false,//是否开启调试按钮加载状态
      isDebugDisabled: false,//是否开启调试按钮禁止点击状态
      codeDebugForm: {//调试表单
        code: '',
        type: '',
        input: ''
      },
      codeEditorSetting: {//编辑器栏设置
        language: 'java',//语言
        fontSize: '18px',//字体大小
        theme: 'vs'
      },
      // 题目信息
      loading: false,
      problem: {
        title: '',
        grade: '',
        content: '',
        require: ''
      },
      markedContent: '',  // 新增用于存储渲染后的markdown内容
      // AI 聊天相关
      showAiChat: false,
      messages: [],
      inputMessage: '',
      chatLoading: false,
    }
  },
  watch: {
    opts: {
      handler() {
        this.init()
      },
      deep: true
    },
    'problem.content': {
      handler(newVal) {
        if (newVal) {
          try {
            this.markedContent = marked(newVal || '')
          } catch (error) {
            console.error('Markdown 渲染错误:', error)
            this.markedContent = newVal
          }
        } else {
          this.markedContent = ''
        }
      },
      immediate: true
    }
  },
  created() {
    // 配置 marked 的数学公式渲染
    const renderer = {
      text(text) {
        let result = text;
        // 处理行内公式
        result = result.replace(/\$([^$]+)\$/g, (_, formula) => {
          try {
            return katex.renderToString(formula, { displayMode: false });
          } catch (err) {
            console.error('KaTeX error:', err);
            return formula;
          }
        });
        // 处理块级公式
        result = result.replace(/\$\$([^$]+)\$\$/g, (_, formula) => {
          try {
            return katex.renderToString(formula, { displayMode: true });
          } catch (err) {
            console.error('KaTeX error:', err);
            return formula;
          }
        });
        return result;
      }
    };

    marked.use({ renderer });
    
    // 设置基本配置
    marked.setOptions({
      gfm: true,
      breaks: true,
      sanitize: false,
      smartLists: true
    });

    this.getProblemDetail()
  },
  mounted() {
    this.init()
    // 注册自定义语言
    monaco.languages.register({id: 'customLang'})

    // 定义语法高亮规则
    monaco.languages.setMonarchTokensProvider('customLang', {
      tokenizer: {
        root: [
          [/\/[^\s]+\.\w+/, 'type'], // 匹配路径格式
          [/error/, 'keyword'],
          [/\^/, 'string'],
          [/[a-zA-Z_]\w*/, 'identifier'],
          [/\d+/, 'number'],
          [/[{}()[]/, 'delimiter'],
          [/"([^"]|\\.)*"/, 'string'],
          [/'([^']|\\.)*'/, 'string'],
        ],
      },
    })
    //初始化输入输出框
    this.outputEditor = monaco.editor.create(this.$refs.output, this.inoutOpts)
    this.outputEditor.updateOptions({readOnly: true})
    this.inputEditor = monaco.editor.create(this.$refs.input, this.inoutOpts)
  },
  methods: {
    init() {
      // 初始化container的内容，销毁之前生成的编辑器
      this.$refs.container.innerHTML = ''
      // 生成编辑器配置
      let editorOptions = Object.assign(this.defaultOpts, this.opts)
      // 生成编辑器对象
      this.monacoEditor = monaco.editor.create(this.$refs.container, editorOptions)
      // 编辑器内容发生改变时触发
      this.monacoEditor.onDidChangeModelContent(() => {
        this.$emit('change', this.monacoEditor.getValue())
      })
    },
    // 供父组件调用手动获取值
    getVal() {
      return this.monacoEditor.getValue()
    },
    //调试按钮网络请求
    debugBtn() {
      this.outputEditor.setValue('')
      this.isDebugLoad = true
      this.isDebugDisabled = true
      this.codeDebugForm.code = this.getVal()
      this.codeDebugForm.input = this.inputEditor.getValue()
      this.codeDebugForm.type = this.codeEditorSetting.language
      console.log(JSON.stringify(this.codeDebugForm))
      debugCode(this.codeDebugForm).then(res => {
        if (res.data.code === 200) {
          this.outputEditor.setValue(res.data.data)
          this.$notify({title: '成功', message: '代码运行成功', type: 'success'})
        } else {
          this.$notify.error({title: '代码运行错误', message: res.data.msg})
          this.outputEditor.setValue(res.data.msg)
        }
        this.isDebugLoad = false
        this.isDebugDisabled = false
      })
    },
    // 获取题目详情
    async getProblemDetail() {
      const problemId = this.$route.query.problemId
      if (!problemId) {
        this.$message.error('题目ID不能为空')
        return
      }

      this.loading = true
      try {
        const res = await getStudentProblemDetail(problemId)
        if (res.data.code === 200) {
          this.problem = res.data.data
        } else {
          this.$message.error(res.data.msg || '获取题目详情失败')
        }
      } catch (error) {
        console.error('获取题目详情错误:', error)
        this.$message.error('获取题目详情失败')
      } finally {
        this.loading = false
      }
    },
    goBack() {
      this.$router.go(-1)
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
    },
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

.code {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.el-container {
  height: 100%;
  width: 100%;
}

.problem-aside {
  height: calc(100vh - 60px);
  overflow: hidden;
  flex-shrink: 0;
}

.problem-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 5px;
}

.problem-card .el-card__body {
  height: 100%;
  overflow: hidden;
  padding: 8px;
}

.problem-content {
  height: 100%;
  overflow-y: auto;
  padding-right: 16px;
  padding-left: 16px;
  text-align: left;
}

.problem-content p {
  margin: 2px 0;
  line-height: 1;
}

.problem-content h2 {
  margin: 6px 0;
  line-height: 1.2;
}

.problem-content h3 {
  margin: 4px 0;
  line-height: 1.2;
}

/* 右侧容器样式 */
.el-main {
  padding: 0;
  overflow: hidden;
}

.el-footer {
  padding: 0;
}

/* 数学公式样式 */
.katex-display {
  margin: 0.5em 0 !important;
  overflow-x: auto;
  overflow-y: hidden;
}

.katex {
  font-size: 1em !important;
}

.katex-display > .katex {
  white-space: normal;
}

/* markdown 内容样式 */
.problem-content div[v-html] {
  line-height: 1;
}

.problem-content div[v-html] p {
  margin: 2px 0;
}

.problem-content div[v-html] ul,
.problem-content div[v-html] ol {
  margin: 2px 0;
  padding-left: 16px;
}

.problem-content div[v-html] li {
  margin: 1px 0;
  line-height: 1;
}

/* 滚动条样式 */
.problem-content::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}

.problem-content::-webkit-scrollbar-track {
  background: transparent;
}

.problem-content::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.problem-content:hover::-webkit-scrollbar-thumb {
  background: #88888880;
}

.problem-content:hover::-webkit-scrollbar-thumb:hover {
  background: #888;
}

/* 确保卡片内容不溢出 */
.el-card {
  overflow: hidden;
}

/* 编辑器设置样式 */
.editor-settings {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 330px;
}

.editor-settings .el-select {
  margin-left: 10px;
}

/* 修复菜单项样式 */
.setting-menu-item {
  background-color: transparent !important;
  border-bottom: none !important;
}

.setting-menu-item:hover {
  background-color: transparent !important;
}

.el-menu-item {
  border-bottom: none !important;
}

/* 修复选择器样式 */
.editor-settings .el-select .el-input__inner {
  border: 1px solid #DCDFE6;
}

.editor-settings .el-select:hover .el-input__inner {
  border-color: #409EFF;
}

/* 确保下拉菜单不会被截断 */
.el-select-dropdown {
  z-index: 3000 !important;
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

.markdown-body pre {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
}

.markdown-body code {
  background-color: rgba(175,184,193,0.2);
  border-radius: 6px;
  padding: 0.2em 0.4em;
  font-size: 85%;
}

.markdown-body pre code {
  background-color: transparent;
  padding: 0;
}

.markdown-body table {
  border-spacing: 0;
  border-collapse: collapse;
  margin: 16px 0;
  width: 100%;
}

.markdown-body table th,
.markdown-body table td {
  padding: 6px 13px;
  border: 1px solid #d0d7de;
}

.markdown-body table tr {
  background-color: #ffffff;
  border-top: 1px solid #d0d7de;
}

.markdown-body table tr:nth-child(2n) {
  background-color: #f6f8fa;
}

.markdown-body blockquote {
  padding: 0 1em;
  color: #656d76;
  border-left: 0.25em solid #d0d7de;
  margin: 16px 0;
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 2em;
  margin: 16px 0;
}

.markdown-body li {
  margin: 0.25em 0;
}

.markdown-body p {
  margin: 16px 0;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin: 24px 0 16px;
  font-weight: 600;
  line-height: 1.25;
}

/* 题目头部样式 */
.problem-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.problem-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  padding: 0;
}

.problem-header .el-tag {
  margin-left: 12px;
  font-size: 13px;
  height: 24px;
  line-height: 24px;
  padding: 0 8px;
}

/* 左侧菜单项样式 */
.menu-left-item {
  padding: 0 15px !important;
}

.menu-left-item i {
  font-size: 20px;
  cursor: pointer;
}

/* AI 聊天窗口样式 */
.ai-chat-container {
  height: 600px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  overflow: hidden;
  width: 100%;
}

.chat-header {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  background: #f8f9fb;
  border-radius: 8px 8px 0 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  background: #f7f8fa;
  width: 100%;
  box-sizing: border-box;
}

.chat-messages .message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  max-width: 100%;
}

.chat-messages .message .avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  flex-shrink: 0;
}

.chat-messages .message.user {
  flex-direction: row-reverse;
  justify-content: flex-end;
}

.chat-messages .message.assistant {
  flex-direction: row;
  justify-content: flex-start;
}

.chat-messages .message.user .avatar {
  margin-right: 0;
  margin-left: 8px;
  background: #409eff;
  color: white;
}

.chat-messages .message.assistant .avatar {
  margin-right: 8px;
  margin-left: 0;
  background: #95a5a6;
  color: white;
}

.chat-messages .message-content {
  max-width: calc(100% - 50px);
  padding: 10px 14px;
  border-radius: 12px;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.6;
  font-size: 15px;
  white-space: pre-wrap;
  box-sizing: border-box;
  font-weight: 400;
}

.chat-messages .message.user .message-content {
  background: #409eff;
  color: #fff;
  margin-left: 20%;
  margin-right: 8px;
  font-weight: 400;
}

.chat-messages .message.assistant .message-content {
  background: #e9ecef;
  color: #2c3e50;
  margin-right: 20%;
  margin-left: 8px;
  font-weight: 400;
}

.chat-message.assistant .message-content.markdown-body {
  background: #e9ecef !important;
  color: #2c3e50 !important;
  border-radius: 12px;
  border-top-left-radius: 4px;
  padding: 16px !important;
  line-height: 1.4 !important;
}

.chat-message.assistant .message-content.markdown-body p {
  color: #2c3e50 !important;
  margin: 4px 0 !important;
  line-height: 1.4 !important;
}

.chat-message.assistant .message-content.markdown-body h1,
.chat-message.assistant .message-content.markdown-body h2,
.chat-message.assistant .message-content.markdown-body h3,
.chat-message.assistant .message-content.markdown-body h4,
.chat-message.assistant .message-content.markdown-body h5,
.chat-message.assistant .message-content.markdown-body h6 {
  margin: 8px 0 4px !important;
  line-height: 1.4 !important;
}

.chat-message.assistant .message-content.markdown-body ul,
.chat-message.assistant .message-content.markdown-body ol {
  color: #2c3e50 !important;
  padding-left: 24px !important;
  margin: 4px 0 !important;
}

.chat-message.assistant .message-content.markdown-body li {
  color: #2c3e50 !important;
  margin: 2px 0 !important;
  line-height: 1.4 !important;
}

.chat-message.assistant .message-content.markdown-body pre {
  margin: 6px 0 !important;
  background: #f8f9fa !important;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  padding: 12px !important;
}

.chat-message.assistant .message-content.markdown-body blockquote {
  color: #57606a !important;
  border-left-color: #d0d7de !important;
  background: rgba(175,184,193,0.2) !important;
  padding: 0.25em 1em !important;
  margin: 6px 0 !important;
  line-height: 1.4 !important;
}

.chat-input {
  padding: 12px;
  border-top: 1px solid #ebeef5;
  background: #fff;
  border-radius: 0 0 8px 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
}

.chat-input .el-textarea {
  flex: 1;
  overflow: hidden;
  width: 0; /* 让 flex: 1 生效 */
}

.chat-input .el-textarea__inner {
  border-radius: 8px;
  resize: none;
  height: 45px !important;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
  font-size: 14px;
  color: #2c3e50;
}

.chat-input .el-button {
  height: 45px;
  width: 45px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.chat-input .el-button i {
  font-size: 20px;
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #dcdfe680;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.chat-messages:hover::-webkit-scrollbar-thumb {
  background: #dcdfe6;
}

.el-popover {
  padding: 0 !important;
  border-radius: 8px !important;
}

/* AI 聊天消息样式 */
.chat-message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
}

.chat-message.user {
  justify-content: flex-end;
}

.chat-message.assistant {
  justify-content: flex-start;
}

.chat-message .avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-message.user .avatar {
  margin-left: 8px;
  background: #409eff;
  color: white;
}

.chat-message.assistant .avatar {
  margin-right: 8px;
  background: #95a5a6;
  color: white;
}

.chat-message .message-content {
  max-width: calc(100% - 50px);
  padding: 10px 14px;
  border-radius: 12px;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.6;
  font-size: 15px;
  white-space: pre-wrap;
  box-sizing: border-box;
  font-weight: 400;
}

.chat-message.user .message-content {
  background: #409eff;
  color: #fff;
  margin-left: 20%;
  margin-right: 8px;
  font-weight: 400;
}

.chat-message.assistant .message-content {
  background: #e9ecef;
  color: #2c3e50;
  margin-right: 20%;
  margin-left: 8px;
  font-weight: 400;
}

.chat-message.assistant .message-content.markdown-body {
  background: #e9ecef !important;
  color: #2c3e50 !important;
  border-radius: 12px;
  border-top-left-radius: 4px;
  padding: 16px !important;
  line-height: 1.4 !important;
}

.chat-message.assistant .message-content.markdown-body p {
  color: #2c3e50 !important;
  margin: 4px 0 !important;
  line-height: 1.4 !important;
}

.chat-message.assistant .message-content.markdown-body h1,
.chat-message.assistant .message-content.markdown-body h2,
.chat-message.assistant .message-content.markdown-body h3,
.chat-message.assistant .message-content.markdown-body h4,
.chat-message.assistant .message-content.markdown-body h5,
.chat-message.assistant .message-content.markdown-body h6 {
  margin: 8px 0 4px !important;
  line-height: 1.4 !important;
}

.chat-message.assistant .message-content.markdown-body ul,
.chat-message.assistant .message-content.markdown-body ol {
  color: #2c3e50 !important;
  padding-left: 24px !important;
  margin: 4px 0 !important;
}

.chat-message.assistant .message-content.markdown-body li {
  color: #2c3e50 !important;
  margin: 2px 0 !important;
  line-height: 1.4 !important;
}

.chat-message.assistant .message-content.markdown-body pre {
  margin: 6px 0 !important;
  background: #f8f9fa !important;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  padding: 12px !important;
}

.chat-message.assistant .message-content.markdown-body blockquote {
  color: #57606a !important;
  border-left-color: #d0d7de !important;
  background: rgba(175,184,193,0.2) !important;
  padding: 0.25em 1em !important;
  margin: 6px 0 !important;
  line-height: 1.4 !important;
}
</style>
