<template>
  <div>
    <div style="text-align: left;margin-left: 20px">
      <el-input placeholder="请输入内容" prefix-icon="el-icon-search" v-model="classQuery.name" style="max-width: 200px"/>
      <el-button type="primary" icon="el-icon-search" style="margin-left: 10px" @click="queryClass">搜索</el-button>
      <el-button type="primary" icon="el-icon-plus" @click="dialogAddClassVisible = true">加入班级</el-button>
      <!--  新增班级表单  -->
      <el-dialog title="加入班级" :visible.sync="dialogAddClassVisible" width="400px">
        <el-form>
          <el-form-item label="邀请码" label-width="90px">
            <el-input v-model="invitationCode" autocomplete="off" ></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogAddClassVisible = false">取 消</el-button>
          <el-button type="primary" @click="joinClass()">确 定</el-button>
        </div>
      </el-dialog>
    </div>
    <div class="card-container">
      <el-card class="box-card" v-for="i in records" :key="i.id">
        <div class="card-header">
          <div style="text-align: right">
            <el-dropdown trigger="click" @command="handleCommand(i,$event)">
            <img src="../../../assets/more.svg" alt="icon" style="width: 20px;height: 20px" />
              <!-- 下拉菜单 -->
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="1">复制邀请码</el-dropdown-item>
                <el-dropdown-item command="2">退出班级</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>

          <div style="text-align: center;margin-top: 0px"><span style="font-size: 18px">{{ i.name }}</span></div>
        </div>
        <div class="card-content">
          <img src="../../../assets/touxiang.png" alt="Avatar" class="avatar" style="width: 55px;height: 55px">
          <div class="user-name">{{ i.teacherName }}</div>
        </div>
        <div class="card-footer">
          <span><i class="el-icon-user"></i>&nbsp;{{ i.joinNumber }}</span>
          <span><i class="el-icon-time"></i>&nbsp;{{ formatDate(i.createTime) }}</span>
          <el-button style="float: right; padding: 3px 0" type="text">进入班级</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import {deleteBatchClass, exitBatchClass, joinClass, pageClassForStudent} from "@/api/class";

export default {
  data() {
    return {
      dialogAddClassVisible: false,//新增班级弹窗是否显示
      invitationCode: '',//添加班级邀请码
      records: [],
      classQuery: {
        isAsc: '',
        name: '',
        pageNo: 1,
        pageSize: 10,
        sortBy: ''
      }
    }
  },
  created() {
    this.queryClass();
  },
  methods: {
    //分页查询班级信息
    queryClass(){
      pageClassForStudent(this.classQuery).then(res => {
        if (res.data.code === 200){
          this.records = res.data.data.records;
          this.total = res.data.data.total;
        } else {
          this.$message.error(res.data.msg);
        }
      })
    },
    //增加班级
    joinClass() {
      joinClass(this.invitationCode).then(res => {
        if (res.data.code === 200){
          this.$message.success("班级添加成功");
          this.queryClass();
        }else {
          this.$message.error(res.data.msg);
        }
      });
      this.addIsLoading = false;
      this.dialogAddClassVisible = false;
    },
    //班级列表菜单项
    handleCommand(val, command){
      if (command === '1'){
        this.copyToClipboard(val.invitationCode);
      }else if (command === '2'){
        this.handleExit(val.id);
      }
    },
    //批量退出班级
    handleExit(id){
      //弹出确认退出框
      this.$confirm('此操作将不可恢复, 是否继续?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        exitBatchClass(id).then(res => {
          if (res.data.code === 200){
            this.$message({type: 'success', message: '退出成功!'});
            this.queryClass();
          }else {
            this.$message.error(res.data.msg);
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },
    //时间格式化
    formatDate(timeStr){
      const date = new Date(timeStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.$message.success('邀请码已复制到剪贴板');
      }).catch(err => {
        console.error('无法复制文本: ', err);
        this.$message.error('复制失败');
      });
    }

  }
};
</script>

<style>
.card-container {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  justify-content: flex-start; /* 左对齐 */
}

.box-card {
  width: 280px;
  height: 270px;
  margin: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}

.card-header {
  padding: 5px;
}

.card-content {
  padding: 20px;
  padding-top: 10px;
  padding-bottom: 30px;
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin: 10px 0;
}

.user-name {
  font-size: 16px;
  margin-bottom: 10px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-top: 1px solid #ebeef5; /* 添加分割线 */
}

.el-card__body{
  padding: 5px;
}
</style>
