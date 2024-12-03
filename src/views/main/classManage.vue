<template>
  <div class="classManage">
    <div style="text-align: left">
      <el-input placeholder="请输入内容" prefix-icon="el-icon-search" v-model="classQuery.name" style="max-width: 200px"/>
      <el-button type="primary" icon="el-icon-search" style="margin-left: 10px" @click="queryClass">搜索</el-button>
      <el-button type="primary" icon="el-icon-plus" @click="dialogAddClassVisible = true" :loading="addIsLoading">添加班级</el-button>
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
    <el-table :data="records" style="width: 100%;margin: 5px" height="660" @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
<!--      <el-table-column label="id" prop="id" width="180">
      </el-table-column>-->
      <el-table-column label="班级名称" prop="name" width="180">
      </el-table-column>
      <el-table-column label="邀请码" prop="invitationCode">
      </el-table-column>
      <el-table-column label="更新时间" prop="updateTime">
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime">
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="100">
        <template slot-scope="scope">
          <el-button @click="handleClick(scope.row)" type="text" size="small">查看</el-button>
          <el-button type="text" size="small">编辑</el-button>
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
import {addClass, deleteBatchClass, pageClass} from "@/api/class";

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
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    }

  }
}
</script>
<style>

.paginationClass {
  position: fixed;
  bottom: 0;
  height: 40px;
  width: 100%;
  text-align: center;
}
</style>