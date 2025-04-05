// 最上面
const fs = require('fs')
const path = require('path')
const https = require('https')
const { defineConfig } = require('@vue/cli-service')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
module.exports = defineConfig({
  // 设置需要转译的依赖包
  transpileDependencies: true,

  devServer: {
    port: 443,
    open: false,
    hot: true,
    // 域名设置
    host: 'test.cn',
    // https设置  E:/zs/www.qinxuehai.com-key.pem不能乱写是你上面下载证书路径跟你设置域名对应
    https: {
      key: fs.readFileSync(
        path.resolve(__dirname, 'D:/biancode/证书/private.key')
      ),
      cert: fs.readFileSync(
        path.resolve(__dirname, 'D:/biancode/证书/certificate.crt')
      )
    },
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_URL,
        ws: true,
        secure: false,
        // 将请求头中的 origin 设置为目标 URL
        changeOrigin: true,
        // 路径重写，去掉请求路径中的 '/api'
        pathRewrite: {
          '^/api': ''
        },
        logLevel: 'debug'
      }
    },
    compress: false
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
