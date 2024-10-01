<template>
<div class="code">
  <el-container>
    <el-header style="height: 7vh;width: 100%;padding:0px">
      <el-menu style="width: 100%" :default-active="activeIndex2" class="el-menu-demo" mode="horizontal" @select="handleSelect" background-color="#545c64" text-color="#fff" active-text-color="#ffd04b">
        <el-menu-item index="1">处理中心</el-menu-item>
        <el-submenu index="2">
          <template slot="title">我的工作台</template>
          <el-menu-item index="2-1">选项1</el-menu-item>
          <el-menu-item index="2-2">选项2</el-menu-item>
          <el-menu-item index="2-3">选项3</el-menu-item>
          <el-submenu index="2-4">
            <template slot="title">选项4</template>
            <el-menu-item index="2-4-1">选项1</el-menu-item>
            <el-menu-item index="2-4-2">选项2</el-menu-item>
            <el-menu-item index="2-4-3">选项3</el-menu-item>
          </el-submenu>
        </el-submenu>
        <el-menu-item index="3" disabled>消息中心</el-menu-item>
        <el-menu-item index="4"><a href="https://www.ele.me" target="_blank">订单管理</a></el-menu-item>
      </el-menu>
    </el-header>
    <el-container>
      <el-aside style="height: 93vh;width: 400px;overflow: hidden">
        <h1>3123123</h1>
        <h2>3123123123123123123123123</h2>
        <h3>32123123123123123123123123</h3>
      </el-aside>
      <el-container>
        <el-main style="overflow-x: hidden;width: auto;padding: 0px">
          <div ref="container" class="monaco-editor" style="height: 100%;text-align:left"></div>
        </el-main>
        <el-footer style="height: 25vh;text-align:left;background-color:#000000">
          <div>
            <el-button type="text">测试结果</el-button>
            <el-button type="text" disabled>自测结果</el-button>
          </div>
          <div>
            <el-row :gutter="40">
              <el-col :span="12">
                <div>自测输入值</div>
                <div><el-input type="textarea" :rows="4" placeholder="请输入内容" v-model="inputtext"></el-input></div>
              </el-col>
              <el-col :span="12">
                <div>结果</div>
                <div><el-input type="textarea" :rows="4" placeholder="请输入内容" v-model="resultValue"></el-input></div>
              </el-col>
            </el-row>
          </div>
          <div style="text-align:right">
            <el-button type="primary" @click="debugBtn()" :loading="isDebugLoad" :disabled="isDebugDisabled" plain>调试</el-button><el-button type="primary">提交</el-button>
          </div>
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
}`, // 编辑器的值
        theme: 'vs-dark', // 编辑器主题：vs, hc-black, or vs-dark，更多选择详见官网
        roundedSelection: true, // 右侧不显示编辑器预览框
        autoIndent: true, // 自动缩进
        language: 'java',
      },
      inputtext:  '',
      resultValue: '',//输出结果
      // 编辑器对象
      monacoEditor: {},
      isDebugLoad: false,//是否开启调试按钮加载状态
      isDebugDisabled: false,//是否开启调试按钮禁止点击状态
      codeDebugForm: {
        code: '',
        type: '',
        input: ''
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
    this.init()
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
      
      this.isDebugLoad = true;
      this.isDebugDisabled = true;
      this.codeDebugForm.code = this.getVal();
      console.log(JSON.stringify(this.codeDebugForm));
      debugCode(this.codeDebugForm).then(res => {
        if(res.data.code === 1){
          this.resultValue = res.data.data;
        }else{
          this.$message.error(res.data.msg);
        }
        this.isDebugLoad = false;
        this.isDebugDisabled = false;
      })
    }
    
  }
}
</script>

<style>

</style>
