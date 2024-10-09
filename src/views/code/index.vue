<template>
<div class="code">
  <el-container>
    <el-header style="height: auto;width: 100%;padding:0px">
      <el-menu style="width: 100%" :default-active="activeIndex2" class="el-menu-demo" mode="horizontal" @select="handleSelect" background-color="transparent" text-color="#1E1E1E" active-text-color="#000000">
        <el-menu-item index="1">处理中心</el-menu-item>
        <el-menu-item index="3" disabled>消息中心</el-menu-item>
        <el-menu-item index="4"><a href="https://www.ele.me" target="_blank">订单管理</a></el-menu-item>
        <el-menu-item index="s1" style="float: right;width: 150px;">
          
        </el-menu-item>
        <el-menu-item index="s2" style="float: right;width: 150px;">
          
        </el-menu-item>
        <el-menu-item index="s3" style="float: right;width: 150px;">
          <el-select size="small" v-model="codeEditorSetting.theme" placeholder="主题" @change="() => {this.monacoEditor.updateOptions({ theme: this.codeEditorSetting.theme })}">
            <el-option value="vs-dark" label="vs-dark"></el-option>
            <el-option value="hc-black" label="hc-black"></el-option>
            <el-option value="vs" label="vs"></el-option>
          </el-select>
          <el-select size="small" v-model="codeEditorSetting.language" placeholder="语言" @change="() => {this.monacoEditor.updateOptions({ language: this.codeEditorSetting.language })}">
            <el-option value="java" label="java"></el-option>
            <el-option value="python" label="python"></el-option>
            <el-option value="c" label="c"></el-option>
          </el-select>
          <el-select size="small" v-model="codeEditorSetting.fontSize" placeholder="字体大小" @change="() => {this.monacoEditor.updateOptions({ fontSize: this.codeEditorSetting.fontSize })}">
            <el-option value="12px" label="12px"></el-option>
            <el-option value="14px" label="14px"></el-option>
            <el-option value="16px" label="16px"></el-option>
            <el-option value="18px" label="18px"></el-option>
            <el-option value="20px" label="20px"></el-option>
          </el-select>
        </el-menu-item>
      </el-menu>
    </el-header>
    <el-container>
      <el-aside style="width: 400px;overflow: hidden;padding-bottom: 5px;">
        <el-card style="height: 100%;margin: 5px;" shadow="hover">
          <h1>3123123</h1>
          <h2>3123123123123123123123123</h2>
          <h3>32123123123123123123123123</h3>
        </el-card>
      </el-aside>
      <el-container>
        <el-main style="overflow-x: hidden;width: auto;padding: 0px;">
          <el-card shadow="hover" body-style="padding: 0px;" style="margin: 5px;width: 100%;height: 62vh;">
            <div ref="container" class="monaco-editor" style="height: 62vh;text-align:left;margin: 0px;margin-top: 5px;"></div>
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
              <el-button type="primary" @click="debugBtn()" :loading="isDebugLoad" :disabled="isDebugDisabled" plain>调试</el-button><el-button type="primary">提交</el-button>
            </div>
          </el-card>
        </el-footer>
      
      </el-container>
    </el-container>
  </el-container>
</div>
</template>

<script>
import * as monaco from 'monaco-editor';
import {
  debugCode
} from '@/api/code';
export default {
  name: 'AcMonaco',
  props: {
    opts: {
      type: Object,
      default () {
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
        language: 'python',
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
      minimap: { enabled: false }, // 取消右侧的预览图
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
      }
    }
  },
  watch: {
    opts: {
      handler() {
        this.init()
      },
      deep: true
    }
  },
  mounted() {
    this.init();
    // 注册自定义语言
    monaco.languages.register({ id: 'customLang' });

    // 定义语法高亮规则
    monaco.languages.setMonarchTokensProvider('customLang', {
      tokenizer: {
        root: [
          [/\/[^\s]+\.\w+/, 'type'], // 匹配路径格式
          // 匹配 error 关键字并赋予 'keyword' 样式
          [/error/, 'keyword'],
          // 匹配 ^ 符号并赋予 'caret' 样式
          [/\^/, 'string'],
          // 其他规则...
          [/[a-zA-Z_]\w*/, 'identifier'], // 匹配标识符
          [/\d+/, 'number'], // 匹配数字
          [/[{}()[]/, 'delimiter'], // 匹配括号，移除转义
          [/"([^"]|\\.)*"/, 'string'], // 匹配字符串，确保不使用不必要的转义
          [/'([^']|\\.)*'/, 'string'], // 匹配单引号字符串
        ],
      },
    });
    //初始化输入输出框
    this.outputEditor = monaco.editor.create(this.$refs.output, this.inoutOpts);
    this.outputEditor.updateOptions({ readOnly: true });
    this.inputEditor = monaco.editor.create(this.$refs.input, this.inoutOpts);

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
      this.outputEditor.setValue('');
      this.isDebugLoad = true;
      this.isDebugDisabled = true;
      this.codeDebugForm.code = this.getVal();
      this.codeDebugForm.input = this.inputEditor.getValue();
      console.log(JSON.stringify(this.codeDebugForm));
      debugCode(this.codeDebugForm).then(res => {
        if(res.data.code === 1){
          this.outputEditor.setValue(res.data.data);
          this.$notify({title: '成功',message: '代码运行成功',type: 'success'});
        }else{
          this.$notify.error({title: '代码运行错误',message: res.data.msg});
          this.outputEditor.setValue(res.data.msg);
        }
        this.isDebugLoad = false;
        this.isDebugDisabled = false;
      })
    }
    
  }
}
</script>

<style>
  body {
    background: #F0F0F0;
    overflow: scroll;
  }
  body::-webkit-scrollbar { /* WebKit browsers */
     display: none
  }
</style>
