<template>
  <div>
    <div style="text-align: left;margin-left: 20px">
      <el-input placeholder="请输入内容" prefix-icon="el-icon-search" v-model="searchForm.name" style="max-width: 200px"/>
      <el-button type="primary" icon="el-icon-search" style="margin-left: 10px" @click="handleSearch">搜索</el-button>
      <el-button type="primary" icon="el-icon-plus" @click="dialogAddClassVisible = true">加入班级</el-button>
      <!--  加入班级表单  -->
      <el-dialog title="加入班级" :visible.sync="dialogAddClassVisible" width="400px">
        <el-form>
          <el-form-item label="邀请码" label-width="90px">
            <el-input v-model="invitationCode" autocomplete="off" ></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogAddClassVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleJoinClass">确 定</el-button>
        </div>
      </el-dialog>
    </div>
    <div class="card-container">
      <el-card class="box-card" v-for="i in classList" :key="i.id">
        <div class="card-header">
          <div style="text-align: right">
            <el-dropdown trigger="click" @command="handleCommand(i,$event)">
              <img src="../../../assets/more.svg" alt="icon" style="width: 20px;height: 20px" />
              <!-- 下拉菜单 -->
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="1">复制邀请码</el-dropdown-item>
                <el-dropdown-item command="2">退出班级</el-dropdown-item>
                <el-dropdown-item command="3">查看成员</el-dropdown-item>
                <el-dropdown-item command="4">查看题目</el-dropdown-item>
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

    <!-- 班级成员对话框 -->
    <el-dialog title="班级成员" :visible.sync="memberDialogVisible" width="800px">
      <div class="member-list">
        <!-- 成员搜索 -->
        <el-form :inline="true">
          <el-form-item>
            <el-input v-model="memberQuery.name" placeholder="请输入学生姓名" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryMembers">搜索</el-button>
            <el-button @click="resetMemberSearch">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 成员表格 -->
        <el-table :data="memberList" v-loading="memberLoading">
          <el-table-column prop="username" label="用户名"></el-table-column>
          <el-table-column prop="name" label="姓名"></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
          <el-table-column prop="score" label="积分"></el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            @size-change="handleMemberSizeChange"
            @current-change="handleMemberCurrentChange"
            :current-page="memberQuery.pageNo"
            :page-sizes="[10, 20, 30, 50]"
            :page-size="memberQuery.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="memberTotal">
          </el-pagination>
        </div>
      </div>
    </el-dialog>

    <!-- 班级题目对话框 -->
    <el-dialog title="班级题目" :visible.sync="problemDialogVisible" width="800px">
      <div class="problem-list">
        <!-- 题目搜索 -->
        <el-form :inline="true">
          <el-form-item>
            <el-input v-model="problemQuery.name" placeholder="请输入题目名称" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryProblems">搜索</el-button>
            <el-button @click="resetProblemSearch">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 题目表格 -->
        <el-table :data="problemList" v-loading="problemLoading">
          <el-table-column prop="title" label="题目标题"></el-table-column>
          <el-table-column prop="grade" label="难度">
            <template slot-scope="scope">
              <el-tag :type="scope.row.grade === 'EASY' ? 'success' : scope.row.grade === 'GENERAL' ? 'warning' : 'danger'">
                {{ scope.row.grade === 'EASY' ? '简单' : scope.row.grade === 'GENERAL' ? '中等' : '困难' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button type="text" @click="handleViewProblem(scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            @size-change="handleProblemSizeChange"
            @current-change="handleProblemCurrentChange"
            :current-page="problemQuery.pageNo"
            :page-sizes="[10, 20, 30, 50]"
            :page-size="problemQuery.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="problemTotal">
          </el-pagination>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getClassList, quitClass, getClassMemberPage, getClassProblemPage } from '@/api/class'
import { getProblemPage } from '@/api/problem'

export default {
  name: 'MyClass',
  data() {
    return {
      loading: false,
      classList: [],
      searchForm: {
        name: ''
      },
      // 成员对话框
      memberDialogVisible: false,
      memberLoading: false,
      memberList: [],
      memberTotal: 0,
      memberQuery: {
        pageNo: 1,
        pageSize: 10,
        classId: null
      },
      // 题目对话框
      problemDialogVisible: false,
      problemLoading: false,
      problemList: [],
      problemTotal: 0,
      problemQuery: {
        pageNo: 1,
        pageSize: 10,
        classId: null
      },
      currentClassId: null
    }
  },
  created() {
    this.getClassList()
  },
  methods: {
    // 获取班级列表
    async getClassList() {
      this.loading = true
      try {
        const res = await getClassList()
        if (res.data.code === 200) {
          this.classList = res.data.data
        } else {
          this.$message.error(res.data.msg || '获取班级列表失败')
        }
      } catch (error) {
        console.error('获取班级列表错误:', error)
        this.$message.error('获取班级列表失败')
      } finally {
        this.loading = false
      }
    },
    // 复制邀请码
    handleCopy(invitationCode) {
      navigator.clipboard.writeText(invitationCode).then(() => {
        this.$message.success('复制成功')
      }).catch(err => {
        console.error('无法复制文本: ', err)      
        this.$message.error('复制失败')
      })
    },
    // 查看班级成员
    handleViewMembers(classId) {
      this.currentClassId = classId
      this.memberQuery.classId = classId
      this.memberDialogVisible = true
      this.queryMembers()
    },
    // 查询班级成员
    async queryMembers() {
      this.memberLoading = true
      try {
        const res = await getClassMemberPage(this.memberQuery)
        if (res.data.code === 200) {
          this.memberList = res.data.data.records
          this.memberTotal = res.data.data.total  
        } else {
          this.$message.error(res.data.msg || '获取成员列表失败')
        }
      } catch (error) {
        console.error('获取成员列表错误:', error)
        this.$message.error('获取成员列表失败')
      } finally {
        this.memberLoading = false
      }
    },
    // 成员分页
    handleMemberSizeChange(val) {
      this.memberQuery.pageSize = val
      this.queryMembers()
    },
    handleMemberCurrentChange(val) {
      this.memberQuery.pageNo = val
      this.queryMembers()
    },
    // 查看班级题目
    handleViewProblems(classId) {
      this.currentClassId = classId
      this.problemQuery.classId = classId
      this.problemDialogVisible = true
      this.queryProblems()
    },
    // 查询班级题目
    async queryProblems() {
      this.problemLoading = true
      try {
        const res = await getClassProblemPage(this.problemQuery)
        if (res.data.code === 200) {
          this.problemList = res.data.data.records
          this.problemTotal = res.data.data.total 
        } else {
          this.$message.error(res.data.msg || '获取题目列表失败')
        }
      } catch (error) {
        console.error('获取题目列表错误:', error)
        this.$message.error('获取题目列表失败')
      } finally {
        this.problemLoading = false
      }
    },
    // 题目分页
    handleProblemSizeChange(val) {
      this.problemQuery.pageSize = val
      this.queryProblems()
    },
    handleProblemCurrentChange(val) {
      this.problemQuery.pageNo = val
      this.queryProblems()
    },
    // 查看题目详情
    handleViewProblem(problem) {
      this.$router.push({
        path: `/problem/${problem.id}`,
        query: {
          classId: this.currentClassId,
        }
      })
    },
    // 退出班级
    handleQuit(classId) {
      this.$confirm('确定要退出该班级吗？', '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          const res = await quitClass([classId])
          if (res.data.code === 200) {
            this.$message.success('退出成功')
            this.getClassList()
          } else {
            this.$message.error(res.data.msg || '退出失败')
          }
        } catch (error) {
          console.error('退出班级错误:', error)
          this.$message.error('退出失败')
        }
      })
    },
    // 搜索
    handleSearch() {
      const filteredList = this.classList.filter(item => 
        item.name.toLowerCase().includes(this.searchForm.name.toLowerCase())
      )
      this.classList = filteredList
    },
    // 重置搜索
    resetSearch() {
      this.searchForm.name = ''
      this.getClassList()
    },
    // 格式化日期
    formatDate(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hour}:${minute}`
    }
  }
}
</script>

<style scoped>
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

.member-list,
.problem-list {
  padding: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
