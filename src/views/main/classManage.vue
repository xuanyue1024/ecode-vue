<template>
  <div class="classManage">
    <div style="text-align: left">
      <el-input placeholder="请输入内容" prefix-icon="el-icon-search" v-model="input2" style="max-width: 200px"/>
      <el-button type="primary" icon="el-icon-search" style="margin-left: 10px">搜索</el-button>
      <el-button type="primary" icon="el-icon-plus" @click="dialogAddClassVisible = true" :loading="addIsLoading">添加班级</el-button>
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
    <el-table :data="tableData" stripe style="width: 100%">
      <el-table-column label="日期" prop="date" width="180">
      </el-table-column>
      <el-table-column label="姓名" prop="name" width="180">
      </el-table-column>
      <el-table-column label="地址" prop="address">
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="100">
        <template slot-scope="scope">
          <el-button @click="handleClick(scope.row)" type="text" size="small">查看</el-button>
          <el-button type="text" size="small">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        background
        layout="sizes, prev, pager, next"
        :total="1000">
    </el-pagination>

  </div>
</template>

<script>
import {addClass} from "@/api/class";

export default {
  data() {
    return {
      dialogAddClassVisible: false,//新增班级弹窗是否显示
      addIsLoading: false,//添加按钮是否加载中
      className: '',//新增班级名称
      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }]
    }
  },
  methods: {
    //增加班级请求
    addClass(){
      this.addIsLoading = true;
      addClass({name: this.className}).then(res => {
        if (res.data.code == 200){
          this.$message.success("班级添加成功");
        }else {
          this.$message.error(res.data.msg);
        }
      });
      this.addIsLoading = false;
      this.dialogAddClassVisible = false;
    }
  }
}
</script>
<style>

</style>