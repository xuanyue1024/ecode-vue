<template>
  <el-card class="box-card">
    <div class="card-header">
      <span>计算机组成原理2024秋软工1</span>
    </div>
    <div class="card-content">
      <img src="path/to/avatar.png" alt="Avatar" class="avatar">
      <div class="user-name">熊磊</div>
    </div>
    <div class="card-footer">
      <span>1706</span>
      <span>113</span>
      <span class="status">进行中</span>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'YourComponentName',
  data() {
    return {
      // Your data here
    };
  },
};
</script>

<style scoped>
.box-card {
  width: 300px;
  margin: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}

.card-header {
  padding: 20px;
  text-align: center;
}

.card-content {
  padding: 20px;
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin: 20px 0;
}

.user-name {
  font-size: 18px;
  margin-bottom: 20px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-top: 1px solid #ebeef5; /* 添加分割线 */
}

.status {
  color: #409EFF;
}
</style>