<template>
  <div class="classManage">
    <div style="text-align: left">
      <el-input placeholder="请输入内容" prefix-icon="el-icon-search" v-model="classQuery.name" style="max-width: 200px"/>
      <el-button type="primary" icon="el-icon-search" style="margin-left: 10px" @click="queryClass">搜索</el-button>
      <el-button type="plain" icon="el-icon-plus" @click="dialogAddClassVisible = true" :loading="addIsLoading">添加班级</el-button>
      <el-button type="danger" v-if="deleteVisible" style="margin-left: 10px" @click="handleDelete">删除</el-button>
      <!--  新增班级表单  -->
      <el-dialog title="新增班级" :visible.sync="dialogAddClassVisible" width="400px">
        <el-form>
          <el-form-item label="班级名称" label-width="90px">
            <el-input v-model="className" autocomplete="off" ></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogAddClassVisible = false">取 消</el-button>
          <el-button type="primary" @click="addClass()">确 定</el-button>
        </div>
      </el-dialog>
    </div>
    <el-table :data="records" style="width: 100%;margin: 5px;margin-top: 15px" height="660" @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>

      <el-table-column label="班级名称" width="180">
        <template slot-scope="scope">
          <div class="action-cell">
            <span>{{ scope.row.name }}</span>
            <el-button type="text" size="small" @click="handleUpdateName(scope.row.id, scope.row.name)">
              <i class="el-icon-edit"></i>
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="邀请码" prop="">
        <template slot-scope="scope">
          <div class="action-cell">
            <span>{{ scope.row.invitationCode }}</span>
            <el-button type="text" size="small" @click="copyToClipboard(scope.row.invitationCode)">
              <i class="el-icon-copy-document"></i>
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" prop="updateTime">
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime">
      </el-table-column>
      <el-table-column fixed="right" label="操作">
        <template slot-scope="scope">
          <div style="display: flex; justify-content: center; align-items: center;">
            <el-button @click="handleEnter(scope)" size="mini" icon="el-icon-download">进入</el-button>
            <el-button @click="handleDelete(scope)" size="mini" style="color: white !important;" type="danger" icon="el-icon-edit">删除</el-button>
          </div>
        </template>
      </el-table-column>

    </el-table>
    <el-pagination
        class="paginationClass"
        background
        layout="sizes, prev, pager, next"
        :total="total"
        :page-sizes="[5, 10, 20, 30, 40]"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange">
    </el-pagination>

  </div>
</template>

<script>
import {addClass, deleteBatchClass, pageClass, updateClassName} from "@/api/class";

export default {
  data() {
    return {
      dialogAddClassVisible: false,//新增班级弹窗是否显示
      addIsLoading: false,//添加按钮是否加载中
      className: '',//新增班级名称
      classQuery: {
        isAsc: '',
        name: '',
        pageNo: 1,
        pageSize: 10,
        sortBy: ''
      },
      total: 0,
      records: [],
      //按钮是否显示：
      deleteVisible: false,//删除按钮

      //被选中项列表
      multipleSelection: []
    }
  },
  //创建时调用
  created() {
    this.queryClass();
  },
  methods: {
    //增加班级请求
    addClass(){
      this.addIsLoading = true;
      addClass({name: this.className}).then(res => {
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
    //分页查询班级信息
    queryClass(){
      pageClass(this.classQuery).then(res => {
        if (res.data.code === 200){
          this.records = res.data.data.records;
          this.total = res.data.data.total;
        } else {
          this.$message.error(res.data.msg);
        }
      })
    },
    //页面改变时
    handleCurrentChange(page){
      this.classQuery.pageNo = page;
      this.queryClass();
    },
    //每页展示数改变时
    handleSizeChange(size){
      this.classQuery.pageSize = size;
      this.queryClass();
    },
    //多选改变时触发
    handleSelectionChange(val){
      console.log(val);
      this.multipleSelection = val;
      if (val.length > 0){
        this.deleteVisible = true;
      }else {
        this.deleteVisible = false;
      }
    },
    //删除班级批量
    handleDelete(){
      const array = [];
      this.multipleSelection.forEach(m => array.push(m.id));
      //弹出确认删除框
      this.$confirm('此操作将不可恢复, 是否继续?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteBatchClass(array.join(",")).then(res => {
          if (res.data.code === 200){
            this.$message({type: 'success', message: '删除成功!'});
            this.queryClass();
          }else {
            this.$message.error(res.data.msg);
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    //重命名班级名称
    handleUpdateName(id, name){
      this.$prompt('请输入新名称', '重命名', {
        confirmButtonText: '确定', cancelButtonText: '取消', inputPattern: /^\S{2,12}$/, inputErrorMessage: '名称格式不正确',inputValue: name
      }).then(({ value }) => {
        updateClassName(id, value).then(res => {
          if (res.data.code === 200){
            this.$message.success("成功修改班级名称为\"" + value + "\"");
            this.queryClass();
          }else {
            this.$message.error(res.data.msg);
          }
        })
      }).catch(() => {console.log("取消重命名")})
    },
    //复制内容到剪切板
    copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.$message.success('邀请码已复制到剪贴板');
      }).catch(err => {
        console.error('无法复制文本: ', err);
        this.$message.error('复制失败');
      });
    }

  }
}
</script>
<style>

.el-icon-copy-document {
  visibility: hidden; /* 默认隐藏 */
}

.el-icon-edit {
  visibility: hidden;
}

.action-cell:hover .el-icon-edit,
.action-cell:hover .el-icon-copy-document {
  visibility: visible;
}

/* 只影响本组件内的 .el-table 表头 */
.el-table th.el-table__cell {
  background-color: #eef1f6;
  color: #606266;
}

/* 确保表头和单元格内容都居中 */
.el-table th, .el-table .cell {
  text-align: center;
}

</style>