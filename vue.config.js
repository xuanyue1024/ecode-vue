const { defineConfig } = require('@vue/cli-service')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
module.exports = defineConfig({
  // 设置需要转译的依赖包
  transpileDependencies: true,

  // 开发服务器配置
  devServer: {
    // 指定开发服务器的端口
    port: 80,
    // 启动后自动打开浏览器
    open: false,
    // 启用热模块替换，自动更新模块而无需手动刷新
    hot: true,
    // 代理配置，用于解决跨域问题
    proxy: {
      '/api': {
        // 代理目标地址，从环境变量中读取
        target: process.env.VUE_APP_API_URL,
        // 禁用 WebSocket 代理
        ws: false,
        // 允许不安全的 HTTPS 请求
        secure: false,
        // 将请求头中的 origin 设置为目标 URL
        changeOrigin: true,
        // 路径重写，去掉请求路径中的 '/api'
        pathRewrite: {
          '^/api': ''
        },
        logLevel: 'debug'
      }
    }
  },
  configureWebpack: {
    entry: {
      'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js'
    },
    plugins: [
      new MonacoWebpackPlugin({
        languages: ["json", "xml", "yaml", "python", 'java'],
        features: ["coreCommands", "find", "format", "folding", 'smartSelect', 'snippets', 'suggest', 'hover']
      }),
      /* new MonacoLocalesPlugin({
        //设置支持的语言
        languages: ["es", "zh-cn"],
        //默认语言
        defaultLanguage: "zh-cn",
        //打印不匹配的文本
        logUnmatched: false,
        //自定义文本翻译
        mapLanguages: { "zh-cn": { "Peek References": "查找引用", "Go to Symbol...": "跳到变量位置", "Command Palette": "命令面板" } }
      }) */
    ]
  }
})
