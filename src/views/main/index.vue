<template>
<div class="main">
  <!-- 顶部导航栏 -->
  <div class="top-header">
    <div class="header-content">
      <div class="header-left">
        <i class="el-icon-menu toggle-icon" @click="toggleCollapse"></i>
        <div class="divider"></div>
        <h2 class="page-title">在线编程学习平台</h2>
      </div>
      <div class="header-right">
        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            <el-avatar :size="32" icon="el-icon-user-solid"></el-avatar>
            <span class="username">{{ $store.state.username }}</span>
            <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click="$router.push('/personalDetails')">
              <i class="el-icon-user"></i> 个人信息
            </el-dropdown-item>
            <el-dropdown-item @click="logout">
              <i class="el-icon-switch-button"></i> 退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
  </div>

  <!-- 主要内容区域 -->
  <div class="main-container">
    <!-- 左侧菜单 -->
    <div class="side-menu" :class="{ 'is-collapse': isCollapse }">
      <el-menu 
        :default-active="activeIndex" 
        class="menu-list"
        :collapse="isCollapse"
        background-color="#fff"
        text-color="#303133"
        active-text-color="#409EFF">
        <el-menu-item index="myClass" @click="$router.push('/myClass')">
          <i class="el-icon-document"></i>
          <span slot="title">我的班级</span>
        </el-menu-item>
        <el-menu-item index="classManage" @click="$router.push('/classManage')">
          <i class="el-icon-folder"></i>
          <span slot="title">班级管理</span>
        </el-menu-item>
        <el-menu-item index="problemManage" @click="$router.push('/problemManage')">
          <i class="el-icon-edit-outline"></i>
          <span slot="title">题目管理</span>
        </el-menu-item>
        <el-menu-item index="chat" @click="$router.push('/chat')">
          <i class="el-icon-chat-dot-round"></i>
          <span slot="title">AI 助手</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <router-view />
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'MainLayout',
  data() {
    return {
      isCollapse: false,
      activeIndex: 'myClass'
    }
  },
  methods: {
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    logout() {
      window.localStorage.removeItem('token')
      this.$message.success('退出登录成功')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.top-header {
  height: 60px;
  background-color: white;
  border-bottom: 1px solid #e6e6e6;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-content {
  height: 100%;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.toggle-icon {
  font-size: 20px;
  color: #606266;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s;
}

.toggle-icon:hover {
  background-color: #f5f7fa;
  color: #409EFF;
}

.divider {
  width: 1px;
  height: 24px;
  background-color: #dcdfe6;
  margin: 0 20px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.el-dropdown-link:hover {
  background-color: #f5f7fa;
}

.username {
  margin: 0 8px;
  color: #606266;
}

.el-dropdown-menu i {
  margin-right: 8px;
}

.main-container {
  margin-top: 60px;
  flex: 1;
  display: flex;
  min-height: calc(100vh - 60px);
}

.side-menu {
  position: fixed;
  left: 0;
  top: 60px;
  bottom: 0;
  width: 200px;
  background-color: white;
  transition: all 0.3s;
  z-index: 999;
}

.side-menu.is-collapse {
  width: 64px;
}

.menu-list {
  border-right: none;
  height: 100%;
}

.main-content {
  flex: 1;
  margin-left: 200px;
  padding: 20px;
  transition: margin-left 0.3s;
  min-height: calc(100vh - 60px);
  box-sizing: border-box;
}

.is-collapse + .main-content {
  margin-left: 64px;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .header-content {
    padding: 0 15px;
  }

  .divider {
    margin: 0 15px;
  }

  .username {
    display: none;
  }

  .side-menu {
    transform: translateX(-200px);
  }

  .side-menu.is-collapse {
    transform: translateX(-64px);
  }

  .side-menu:not(.is-collapse) {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }

  .is-collapse + .main-content {
    margin-left: 0;
  }
}
</style>
