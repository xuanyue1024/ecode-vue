<template>
  <div class="my-class-container">
    <!-- 顶部搜索和操作栏 -->
    <div class="header-actions">
      <div class="search-box">
        <el-input
          v-model="searchForm.name"
          placeholder="搜索班级"
          prefix-icon="el-icon-search"
          clearable
          @clear="handleSearch"
          @keyup.enter.native="handleSearch">
        </el-input>
        <el-button type="primary" @click="handleSearch" icon="el-icon-search">搜索</el-button>
      </div>
      <el-button type="success" icon="el-icon-plus" @click="dialogAddClassVisible = true">加入班级</el-button>
    </div>

    <!-- 班级卡片列表 -->
    <div class="class-grid" v-loading="loading">
      <el-card 
        v-for="item in classList" 
        :key="item.id" 
        class="class-card"
        :body-style="{ padding: '0px' }">
        <div class="card-header">
          <span class="class-name">{{ item.name }}</span>
          <el-dropdown trigger="click" @command="handleCommand(item, $event)">
            <i class="el-icon-more"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="1" icon="el-icon-copy-document">复制邀请码</el-dropdown-item>
              <el-dropdown-item command="2" icon="el-icon-close" class="danger-item">退出班级</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="card-content">
          <div class="teacher-info">
            <el-avatar :size="40" icon="el-icon-user-solid"></el-avatar>
            <div class="info-text">
              <div class="teacher-name">{{ item.teacherName }}</div>
              <div class="create-time">创建于: {{ formatDate(item.createTime) }}</div>
            </div>
          </div>
          <div class="class-stats">
            <div class="stat-item">
              <i class="el-icon-user"></i>
              <span>{{ item.joinNumber }} 名学生</span>
            </div>
            <div class="stat-item">
              <i class="el-icon-key"></i>
              <span>邀请码：{{ item.invitationCode }}</span>
            </div>
          </div>
          <el-button 
            type="primary" 
            class="enter-btn" 
            @click="handleEnterClass(item)">
            进入班级
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 加入班级对话框 -->
    <el-dialog 
      title="加入班级" 
      :visible.sync="dialogAddClassVisible" 
      width="400px"
      custom-class="join-class-dialog">
      <el-form>
        <el-form-item label="邀请码">
          <el-input 
            v-model="invitationCode" 
            placeholder="请输入班级邀请码"
            maxlength="20"
            show-word-limit>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddClassVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleJoinClass">确 定</el-button>
      </div>
    </el-dialog>

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
          <el-table-column prop="grade" label="难度" width="100">
            <template slot-scope="scope">
              <el-tag :type="scope.row.grade === 'EASY' ? 'success' : scope.row.grade === 'GENERAL' ? 'warning' : 'danger'">
                {{ scope.row.grade === 'EASY' ? '简单' : scope.row.grade === 'GENERAL' ? '中等' : '困难' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="submitCount" label="提交次数" width="100"></el-table-column>
          <el-table-column prop="passRate" label="通过率" width="100">
            <template slot-scope="scope">
              {{ scope.row.passRate ? (scope.row.passRate * 100).toFixed(1) + '%' : '0%' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" @click="handleViewProblem(scope.row)">查看</el-button>
              <el-button type="primary" @click="handleStartProblem(scope.row)">开始做题</el-button>
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
import { getStudentClassPage, quitClass, getClassMembers, getStudentClassProblemPage, joinClass } from '@/api/class'
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
      // 加入班级对话框
      dialogAddClassVisible: false,
      invitationCode: '', // 邀请码
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
        const res = await getStudentClassPage({
          pageNo: 1,
          pageSize: 1000,
          name: this.searchForm.name
        })
        if (res.data.code === 200) {
          this.classList = res.data.data.records
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
        const res = await getClassMembers(this.memberQuery)
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
        const res = await getStudentClassProblemPage({
          classId: this.currentClassId,
          pageNo: this.problemQuery.pageNo,
          pageSize: this.problemQuery.pageSize,
          name: this.problemQuery.name || ''
        })
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
    },
    // 重置题目搜索
    resetProblemSearch() {
      this.problemQuery.name = ''
      this.queryProblems()
    },
    // 开始做题
    async handleStartProblem(problem) {
      this.problemDialogVisible = false
      this.$router.push({
        path: '/code',
        query: {
          problemId: problem.id,
          classId: this.currentClassId,
          classProblemId: problem.classProblemId
        }
      })
    },
    // 处理下拉菜单命令
    handleCommand(item, command) {
      switch (command) {
        case '1': // 复制邀请码
          this.handleCopy(item.invitationCode)
          break
        case '2': // 退出班级
          this.handleQuit(item.id)
          break
      }
    },
    // 加入班级
    async handleJoinClass() {
      if (!this.invitationCode) {
        this.$message.warning('请输入邀请码')
        return
      }

      try {
        const res = await joinClass(this.invitationCode)
        if (res.data.code === 200) {
          this.$message.success('加入班级成功')
          this.dialogAddClassVisible = false
          this.invitationCode = ''
          this.getClassList()
        } else {
          this.$message.error(res.data.msg || '加入班级失败')
        }
      } catch (error) {
        console.error('加入班级错误:', error)
        this.$message.error('加入班级失败')
      }
    },
    // 进入班级
    handleEnterClass(item) {
      this.$router.push({
        path: `/class/${item.id}`,
        query: {
          name: item.name,
          teacherName: item.teacherName
        }
      })
    }
  }
}
</script>

<style scoped>
.my-class-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-box .el-input {
  width: 300px;
}

.class-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 10px 0;
}

.class-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  border: 1px solid #ebeef5;
}

.class-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
}

.class-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.el-icon-more {
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  font-size: 16px;
  color: #909399;
  transition: all 0.3s;
}

.el-icon-more:hover {
  background-color: #f5f7fa;
  color: #409EFF;
}

.card-content {
  padding: 20px;
}

.teacher-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.info-text {
  margin-left: 12px;
}

.teacher-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
}

.create-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.class-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 13px;
}

.stat-item:last-child {
  color: #409EFF;
}

.stat-item i {
  font-size: 16px;
}

.stat-item:first-child i {
  color: #409EFF;
}

.stat-item:last-child i {
  color: #67c23a;
}

.enter-btn {
  width: 100%;
  border-radius: 4px;
  height: 36px;
  font-size: 14px;
}

.join-class-dialog .el-dialog__body {
  padding: 30px 20px;
}

.member-list,
.problem-list {
  padding: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-box {
    width: 100%;
  }
  
  .search-box .el-input {
    width: 100%;
  }
  
  .class-grid {
    grid-template-columns: 1fr;
  }
}

.danger-item {
  color: #f56c6c;
}

.danger-item:hover {
  background-color: #fef0f0;
}
</style>
