<template>
  <div class="app">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-1"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
    >
    <el-menu-item index="0">
          <el-radio-group v-model="isCollapse" style="margin-bottom: 20px;">
            <el-radio-button :label="false">展开</el-radio-button>
            <el-radio-button :label="true">收起</el-radio-button>
          </el-radio-group>
        </el-menu-item>
        <el-menu-item index="1">处理中心</el-menu-item>
        <el-menu-item index="3" disabled style="float: right">消息中心</el-menu-item>
    </el-menu>
    

    <el-menu 
    :default-active="activeIndex" 
    class="el-menu-1" mode="horizontal" 
    @select="handleSelect">
        <el-menu-item index="0">
          <el-radio-group v-model="isCollapse" style="margin-bottom: 20px;">
            <el-radio-button :label="false">展开</el-radio-button>
            <el-radio-button :label="true">收起</el-radio-button>
          </el-radio-group>
        </el-menu-item>
        <el-menu-item index="1">处理中心</el-menu-item>
        <el-menu-item index="3" disabled style="float: right">消息中心</el-menu-item>
      </el-menu>
  </div>
</template>
<script setup>
import { ref } from "vue";

const activeIndex = ref();
</script>
<style scoped>
/* .el-menu-2,
.el-menu-3,
.el-menu-4 {
  display: flex;
} */
.color-red .el-divider__text {
  color: #f00;
}
strong {
  font-size: 30px;
}
</style>


