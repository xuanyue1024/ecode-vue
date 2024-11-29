<template>
<div class="main">
  <el-container>
    <el-header>
      <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal">
        <el-menu-item index="">
          <el-radio-group v-model="isCollapse" style="margin-bottom: 20px;">
            <el-radio-button :label="false">展开</el-radio-button>
            <el-radio-button :label="true">收起</el-radio-button>
          </el-radio-group>
        </el-menu-item>
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

        <el-submenu index="img" style="float: right">
          <template slot="title">
            <span class="el-dropdown-link">
              点我查看  <el-image
                        style="width: 38px; height: 38px; border-radius: 50%;"
                        src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg"
                        fit="contain">
                    </el-image>
            </span>
          </template>
          <el-menu-item index="2-1">选项1</el-menu-item>
          <el-menu-item index="2-2">选项2</el-menu-item>
          <el-menu-item index="logout" @click="logout">退出登录</el-menu-item>
        </el-submenu>
        <!-- <el-menu-item index="3" style="float: right">消息中心</el-menu-item> -->
      </el-menu>
    </el-header>
    <el-container>
      <el-aside style="overflow: hidden;width: auto;height: 100%">
        <el-menu default-active="1-4-1" class="el-menu-vertical-demo" :collapse="isCollapse">
          <el-submenu index="1">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span slot="title">班级中心</span>
            </template>
            <el-menu-item-group>
              <router-link style="text-decoration: none" to="/classManage"><el-menu-item index="1-1">班级管理</el-menu-item></router-link>

              <el-menu-item index="1-2">选项2</el-menu-item>
            </el-menu-item-group>
              <el-menu-item index="1-3">选项3</el-menu-item>
            <el-submenu index="1-4">
              <span slot="title">选项4</span>
              <el-menu-item index="1-4-1">选项1</el-menu-item>
            </el-submenu>
          </el-submenu>
          <el-menu-item index="2">
            <i class="el-icon-menu"></i>
            <span slot="title">导航二</span>
          </el-menu-item>
          <el-menu-item index="3" disabled>
            <i class="el-icon-document"></i>
            <span slot="title">导航三</span>
          </el-menu-item>
          <el-menu-item index="4">
            <i class="el-icon-setting"></i>
            <span slot="title">导航四</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'main',
  data() {
    return {
      isCollapse: true,
      activeIndex: '1',
      activeIndex2: '1'
    }
  },
  methods: {
    //退出登录
    logout(){
      window.localStorage.removeItem('token');
      this.$message.success('退出登录成功');
      this.$router.push('/login');
    }
  }
});
</script>

<style>
body,
html {
  height: 100%;
}

.el-menu-vertical-demo {
  height: 100vh;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>
