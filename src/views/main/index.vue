<template>
<div class="main">
  <el-container>
    <el-header>
      <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal">
        <el-menu-item index="">
          <div class="collapse-btn" @click="toggleCollapse">
            <img src="@/assets/logo.png" class="menu-icon" :class="{'is-active': isCollapse}" alt="toggle menu" />
          </div>
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
              {{$store.state.username}}  <el-image
                        style="width: 38px; height: 38px; border-radius: 50%;"
                        src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg"
                        fit="contain">
                    </el-image>
            </span>
          </template>
          <el-menu-item index="2-1">选项1</el-menu-item>
          <el-menu-item index="2-2" @click="() => {this.$router.push('/personalDetails')}">个人信息</el-menu-item>
          <el-menu-item index="logout" @click="logout">退出登录</el-menu-item>
        </el-submenu>
        <!-- <el-menu-item index="3" style="float: right">消息中心</el-menu-item> -->
      </el-menu>
    </el-header>
    <!--左侧布局-->
    <el-container>
      <el-aside style="overflow: hidden;width: auto;height: 100%">
        <el-menu default-active="1-4-1" class="el-menu-vertical-demo" :collapse="isCollapse">
          <!--班级管理-->
          <el-menu-item index="myClass" @click="() => {this.$router.push('/myClass')}">
            <i class="el-icon-document"></i>
            <span slot="title">s我的班级</span>
          </el-menu-item>

          <el-menu-item index="classManage" @click="() => {this.$router.push('/classManage')}">
            <i class="el-icon-document"></i>
            <span slot="title">t班级管理</span>
          </el-menu-item>

          <el-menu-item index="problemManage" @click="() => {this.$router.push('/problemManage')}">
            <i class="el-icon-edit-outline"></i>
            <span slot="title">t题目管理</span>
          </el-menu-item>

          <el-menu-item index="4" @click="navigateTo()">
            <i class="el-icon-setting"></i>
            <span slot="title">导航四</span>
          </el-menu-item>

        </el-menu>
      </el-aside>
      <!--主界面-->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</div>
</template>

<script>
export default {
  name: 'MainLayout',
  data() {
    return {
      isCollapse: false,
      activeIndex: '1',
      activeIndex2: '1'
    }
  },
  methods: {
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    //退出登录
    logout() {
      window.localStorage.removeItem('token')
      this.$message.success('退出登录成功')
      this.$router.push('/login')
    },
    navigateTo() {
      // 导航方法的实现
    }
  }
}
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

.collapse-btn {
  cursor: pointer;
  padding: 0 15px;
}

.menu-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s;
}

.menu-icon.is-active {
  transform: rotate(180deg);
}
</style>
