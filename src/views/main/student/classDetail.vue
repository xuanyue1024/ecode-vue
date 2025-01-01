<template>
  <div class="class-detail-container">
    <!-- 顶部导航栏 -->
    <div class="top-header">
      <div class="header-content">
        <div class="header-left">
          <i class="el-icon-back back-icon" @click="$router.push('/myClass')"></i>
          <div class="divider"></div>
          <h2 class="page-title">班级详情</h2>
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
              <el-dropdown-item @click="handleLogout">
                <i class="el-icon-switch-button"></i> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-container">
      <!-- 侧边导航 -->
      <div class="side-menu">
        <div class="class-info">
          <h3>{{ $route.query.name }}</h3>
          <p>教师：{{ $route.query.teacherName }}</p>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="menu-list"
          @select="handleMenuSelect">
          <el-menu-item index="overview">
            <i class="el-icon-menu"></i>
            <span>班级概览</span>
          </el-menu-item>
          <el-menu-item index="members">
            <i class="el-icon-user"></i>
            <span>班级成员</span>
          </el-menu-item>
          <el-menu-item index="problems">
            <i class="el-icon-notebook-2"></i>
            <span>班级题目</span>
          </el-menu-item>
          <el-menu-item index="statistics">
            <i class="el-icon-data-line"></i>
            <span>学习统计</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 内容区域 -->
      <div class="main-content">
        <!-- 班级概览 -->
        <div v-show="activeMenu === 'overview'" class="content-section">
          <el-card class="overview-card">
            <div class="overview-header">
              <h3>班级概览</h3>
            </div>
            <div class="overview-stats">
              <div class="stat-card">
                <i class="el-icon-user"></i>
                <div class="stat-info">
                  <div class="stat-value">{{ classInfo.joinNumber || 0 }}</div>
                  <div class="stat-label">班级人数</div>
                </div>
              </div>
              <div class="stat-card">
                <i class="el-icon-notebook-2"></i>
                <div class="stat-info">
                  <div class="stat-value">{{ classInfo.problemCount || 0 }}</div>
                  <div class="stat-label">题目数量</div>
                </div>
              </div>
              <div class="stat-card">
                <i class="el-icon-document-checked"></i>
                <div class="stat-info">
                  <div class="stat-value">{{ completedCount || 0 }}</div>
                  <div class="stat-label">已完成题目</div>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 班级成员 -->
        <div v-show="activeMenu === 'members'" class="content-section">
          <el-card>
            <div class="section-header">
              <h3>班级成员</h3>
              <div class="search-box">
                <el-input
                  v-model="memberQuery.name"
                  placeholder="搜索成员"
                  prefix-icon="el-icon-search"
                  clearable
                  @clear="queryMembers"
                  @keyup.enter.native="queryMembers">
                </el-input>
              </div>
            </div>
            
            <el-table :data="memberList" v-loading="memberLoading" stripe>
              <el-table-column prop="username" label="用户名"></el-table-column>
              <el-table-column prop="name" label="姓名"></el-table-column>
              <el-table-column prop="email" label="邮箱"></el-table-column>
              <el-table-column prop="score" label="积分"></el-table-column>
              <el-table-column label="完成率" width="200">
                <template slot-scope="scope">
                  <el-progress 
                    :percentage="calculateProgress(scope.row)"
                    :format="percentageFormat">
                  </el-progress>
                </template>
              </el-table-column>
            </el-table>

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
          </el-card>
        </div>

        <!-- 班级题目 -->
        <div v-show="activeMenu === 'problems'" class="content-section">
          <el-card>
            <div class="section-header">
              <h3>班级题目</h3>
              <div class="search-box">
                <el-input
                  v-model="problemQuery.name"
                  placeholder="搜索题目"
                  prefix-icon="el-icon-search"
                  clearable
                  @clear="queryProblems"
                  @keyup.enter.native="queryProblems">
                </el-input>
              </div>
            </div>

            <el-table :data="problemList" v-loading="problemLoading" stripe>
              <el-table-column prop="title" label="题目标题"></el-table-column>
              <el-table-column prop="grade" label="难度" width="100">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.grade === 'EASY' ? 'success' : scope.row.grade === 'GENERAL' ? 'warning' : 'danger'">
                    {{ scope.row.grade === 'EASY' ? '简单' : scope.row.grade === 'GENERAL' ? '中等' : '困难' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="submitCount" label="提交次数" width="100"></el-table-column>
              <el-table-column prop="passRate" label="通过率" width="120">
                <template slot-scope="scope">
                  {{ scope.row.passRate ? (scope.row.passRate * 100).toFixed(1) + '%' : '0%' }}
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.status === 'COMPLETED' ? 'success' : 'info'">
                    {{ scope.row.status === 'COMPLETED' ? '已完成' : '未完成' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template slot-scope="scope">
                  <el-button type="text" @click="handleViewProblem(scope.row)">查看</el-button>
                  <el-button 
                    type="primary" 
                    size="small"
                    @click="handleStartProblem(scope.row)">
                    {{ scope.row.status === 'COMPLETED' ? '重做' : '开始' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

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
          </el-card>
        </div>

        <!-- 学习统计 -->
        <div v-show="activeMenu === 'statistics'" class="content-section">
          <el-card>
            <div class="statistics-content">
              <h3>学习统计</h3>
              <!-- 这里可以添加更多统计图表 -->
              <div class="charts-container">
                <div class="chart-item">
                  <!-- 在这里添加图表组件 -->
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getClassMembers, getStudentClassProblemPage } from '@/api/class'

export default {
  name: 'ClassDetail',
  data() {
    return {
      activeMenu: 'overview',
      classInfo: {
        joinNumber: 0,
        problemCount: 0
      },
      completedCount: 0,
      // 成员相关
      memberLoading: false,
      memberList: [],
      memberTotal: 0,
      memberQuery: {
        pageNo: 1,
        pageSize: 10,
        name: '',
        classId: ''
      },
      // 题目相关
      problemLoading: false,
      problemList: [],
      problemTotal: 0,
      problemQuery: {
        pageNo: 1,
        pageSize: 10,
        name: '',
        classId: ''
      }
    }
  },
  created() {
    this.memberQuery.classId = this.$route.params.id
    this.problemQuery.classId = this.$route.params.id
    this.initData()
  },
  methods: {
    initData() {
      this.queryMembers()
      this.queryProblems()
    },
    handleMenuSelect(index) {
      this.activeMenu = index
    },
    handleLogout() {
      window.localStorage.removeItem('token')
      this.$message.success('退出登录成功')
      this.$router.push('/login')
    },
    // 成员相关方法
    async queryMembers() {
      this.memberLoading = true
      try {
        const res = await getClassMembers(this.memberQuery)
        if (res.data.code === 200) {
          this.memberList = res.data.data.records
          this.memberTotal = res.data.data.total
          this.classInfo.joinNumber = res.data.data.total
        }
      } catch (error) {
        console.error('获取成员列表错误:', error)
        this.$message.error('获取成员列表失败')
      } finally {
        this.memberLoading = false
      }
    },
    handleMemberSizeChange(val) {
      this.memberQuery.pageSize = val
      this.queryMembers()
    },
    handleMemberCurrentChange(val) {
      this.memberQuery.pageNo = val
      this.queryMembers()
    },
    // 题目相关方法
    async queryProblems() {
      this.problemLoading = true
      try {
        const res = await getStudentClassProblemPage({
          classId: this.$route.params.id,
          pageNo: this.problemQuery.pageNo,
          pageSize: this.problemQuery.pageSize,
          name: this.problemQuery.name
        })
        if (res.data.code === 200) {
          this.problemList = res.data.data.records
          this.problemTotal = res.data.data.total
          this.classInfo.problemCount = res.data.data.total
          this.completedCount = this.problemList.filter(p => p.status === 'COMPLETED').length
        }
      } catch (error) {
        console.error('获取题目列表错误:', error)
        this.$message.error('获取题目列表失败')
      } finally {
        this.problemLoading = false
      }
    },
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
          classId: this.$route.params.id
        }
      })
    },
    // 开始做题
    handleStartProblem(problem) {
      this.$router.push({
        path: '/code',
        query: {
          problemId: problem.id,
          classId: this.$route.params.id,
          classProblemId: problem.classProblemId
        }
      })
    },
    // 计算完成进度
    calculateProgress(member) {
      if (!member.completedCount || !this.classInfo.problemCount) return 0
      return Math.round((member.completedCount / this.classInfo.problemCount) * 100)
    },
    // 格式化百分比
    percentageFormat(percentage) {
      return percentage + '%'
    }
  }
}
</script>

<style scoped>
.class-detail-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
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

.back-icon {
  font-size: 20px;
  color: #606266;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s;
}

.back-icon:hover {
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
  z-index: 999;
}

.class-info {
  padding: 20px;
  border-bottom: 1px solid #e6e6e6;
  background-color: #fafafa;
}

.class-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.class-info p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.menu-list {
  border-right: none;
  height: calc(100% - 81px);
}

.main-content {
  flex: 1;
  margin-left: 200px;
  padding: 20px;
  min-height: calc(100vh - 60px);
  box-sizing: border-box;
}

.content-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.search-box {
  width: 300px;
}

.overview-card {
  margin-bottom: 20px;
}

.overview-header {
  margin-bottom: 20px;
}

.overview-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.stat-card i {
  font-size: 36px;
  margin-right: 20px;
  color: #409EFF;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.charts-container {
  margin-top: 20px;
}

.chart-item {
  height: 400px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
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
    transition: transform 0.3s;
  }

  .side-menu.is-show {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }

  .search-box {
    width: 100%;
  }

  .overview-stats {
    grid-template-columns: 1fr;
  }
}
</style> 