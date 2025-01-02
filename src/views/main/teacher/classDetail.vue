<template>
  <div class="class-detail-container">
    <!-- 顶部导航栏 -->
    <div class="top-header">
      <div class="header-content">
        <div class="header-left">
          <i class="el-icon-arrow-left back-icon" @click="$router.go(-1)"></i>
          <div class="divider"></div>
          <h2 class="page-title">班级详情</h2>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userInfo.profilePicture"></el-avatar>
              <span class="username">{{ userInfo.username }}</span>
              <i class="el-icon-caret-bottom"></i>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
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
          <h3>{{ classInfo.name }}</h3>
          <p>邀请码：{{ classInfo.invitationCode }}</p>
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
                <i class="el-icon-trophy"></i>
                <div class="stat-info">
                  <div class="stat-value">{{ averageScore || 0 }}</div>
                  <div class="stat-label">平均得分</div>
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
              <el-table-column prop="totalScore" label="总得分"></el-table-column>
              <el-table-column label="完成率" width="200">
                <template slot-scope="scope">
                  <el-progress 
                    :percentage="calculateProgress(scope.row)"
                    :format="percentageFormat">
                  </el-progress>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                  <el-button 
                    type="text" 
                    @click="handleViewStudentDetail(scope.row)">
                    查看详情
                  </el-button>
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
              <div class="operation-wrapper">
                <el-button type="primary" @click="handleAddProblems">添加题目</el-button>
                <el-button 
                  type="danger" 
                  :disabled="!selectedProblems.length"
                  @click="handleRemoveProblems">
                  移除题目
                </el-button>
              </div>
            </div>

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

            <el-table 
              :data="problemList" 
              v-loading="problemLoading"
              @selection-change="handleProblemSelectionChange">
              <el-table-column type="selection" width="55"></el-table-column>
              <el-table-column prop="title" label="题目标题"></el-table-column>
              <el-table-column prop="grade" label="难度" width="100">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.grade === 'EASY' ? 'success' : scope.row.grade === 'GENERAL' ? 'warning' : 'danger'">
                    {{ scope.row.grade === 'EASY' ? '简单' : scope.row.grade === 'GENERAL' ? '中等' : '困难' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="标签" width="200">
                <template slot-scope="scope">
                  <el-tag v-for="tag in scope.row.tags" :key="tag.id" size="small" style="margin-right: 5px">
                    {{ tag.name }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template slot-scope="scope">
                  <el-button type="text" @click="handleViewProblem(scope.row)">查看</el-button>
                  <el-button type="text" @click="handleEditProblem(scope.row)">编辑</el-button>
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
              <div class="charts-container">
                <div class="chart-item">
                  <v-chart 
                    ref="memberScoreChart" 
                    :options="memberScoreOptions" 
                    style="width: 100%; height: 400px;"
                    autoresize>
                  </v-chart>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 添加题目对话框 -->
    <el-dialog
      title="添加题目"
      :visible.sync="addProblemDialogVisible"
      width="800px">
      <div class="add-problem-dialog">
        <!-- 题目搜索 -->
        <el-form :inline="true">
          <el-form-item>
            <el-input v-model="addProblemQuery.name" placeholder="请输入题目名称" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchProblemsToAdd">搜索</el-button>
            <el-button @click="resetAddProblemSearch">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 可选题目表格 -->
        <el-table 
          :data="availableProblems" 
          v-loading="addProblemLoading"
          @selection-change="handleAddSelectionChange">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="title" label="题目标题"></el-table-column>
          <el-table-column prop="grade" label="难度" width="100">
            <template slot-scope="scope">
              <el-tag :type="scope.row.grade === 'EASY' ? 'success' : scope.row.grade === 'GENERAL' ? 'warning' : 'danger'">
                {{ scope.row.grade === 'EASY' ? '简单' : scope.row.grade === 'GENERAL' ? '中等' : '困难' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            @size-change="handleAddProblemSizeChange"
            @current-change="handleAddProblemCurrentChange"
            :current-page="addProblemQuery.pageNo"
            :page-sizes="[10, 20, 30, 50]"
            :page-size="addProblemQuery.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="addProblemTotal">
          </el-pagination>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addProblemDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddProblems">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 学生详情对话框 -->
    <el-dialog
      title="学生做题详情"
      :visible.sync="studentDetailDialogVisible"
      width="800px">
      <div v-loading="studentDetailLoading">
        <el-table :data="studentProblemList">
          <el-table-column prop="title" label="题目标题"></el-table-column>
          <el-table-column prop="submitNumber" label="提交次数"></el-table-column>
          <el-table-column prop="passNumber" label="通过次数"></el-table-column>
          <el-table-column prop="score" label="得分"></el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getTeacherClassMembers, getClassProblemPage, addProblemToClass, removeProblemFromClass, getTeacherClassProblemInfo } from '@/api/class'
import { getProblemPage } from '@/api/problem'
import { getUserInfo } from '@/api/user'
import { formatDate } from '@/utils/date'
import ECharts from 'vue-echarts'
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/grid'
import { getTagsByIds } from '@/api/tag'

export default {
  name: 'TeacherClassDetail',
  components: {
    'v-chart': ECharts
  },
  data() {
    return {
      activeMenu: 'overview',
      classInfo: {
        id: '',
        name: '',
        invitationCode: '',
        joinNumber: 0,
        problemCount: 0,
        createTime: '',
        updateTime: ''
      },
      averageScore: 0,
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
      selectedProblems: [],
      problemQuery: {
        pageNo: 1,
        pageSize: 10,
        name: '',
        classId: ''
      },
      // 添加题目相关
      addProblemDialogVisible: false,
      addProblemLoading: false,
      availableProblems: [],
      selectedProblemsToAdd: [],
      addProblemTotal: 0,
      addProblemQuery: {
        pageNo: 1,
        pageSize: 10,
        name: ''
      },
      // 学生详情相关
      studentDetailDialogVisible: false,
      studentDetailLoading: false,
      currentStudentId: null,
      studentProblemList: [],
      // 用户信息
      userInfo: {
        username: '',
        profilePicture: ''
      },
      memberScoreOptions: {
        title: {
          text: '学生得分统计',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            const data = params[0]
            return `${data.name}<br/>得分：${data.value}`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: [],
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        yAxis: {
          type: 'value',
          name: '得分'
        },
        series: [
          {
            type: 'bar',
            data: [],
            itemStyle: {
              color: '#409EFF'
            },
            label: {
              show: true,
              position: 'top'
            }
          }
        ]
      }
    }
  },
  created() {
    // 从路由参数中获取班级ID和名称
    const { id } = this.$route.params
    const { name, teacherName } = this.$route.query
    
    // 设置班级基本信息
    this.classInfo = {
      ...this.classInfo,
      id,
      name: name || ''
    }

    // 设置查询参数
    this.memberQuery.classId = id
    this.problemQuery.classId = id

    // 初始化数据
    this.initData()
    this.getUserDetails()
  },
  methods: {
    formatDate,
    initData() {
      this.queryMembers()
      this.queryProblems()
    },
    async handleMenuSelect(index) {
      this.activeMenu = index
      if (index === 'statistics') {
        await this.queryMembers()
      }
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
        const res = await getTeacherClassMembers(this.memberQuery)
        if (res.data.code === 200) {
          this.memberList = res.data.data.records
          this.memberTotal = res.data.data.total
          this.classInfo.joinNumber = res.data.data.total
          
          // 计算平均分
          if (this.memberList.length > 0) {
            const totalScore = this.memberList.reduce((sum, member) => sum + member.totalScore, 0)
            this.averageScore = Math.round(totalScore / this.memberList.length)
          }

          // 如果是在统计页面，更新图表
          if (this.activeMenu === 'statistics') {
            this.updateMemberScoreChart(this.memberList)
          }
        }
      } catch (error) {
        console.error('获取成员列表错误:', error)
        this.$message.error('获取成员列表失败')
      } finally {
        this.memberLoading = false
      }
    },
    updateMemberScoreChart(members) {
      // 按得分排序
      const sortedMembers = [...members].sort((a, b) => b.totalScore - a.totalScore)
      
      this.memberScoreOptions = {
        ...this.memberScoreOptions,
        xAxis: {
          ...this.memberScoreOptions.xAxis,
          data: sortedMembers.map(member => member.name || member.username)
        },
        series: [
          {
            ...this.memberScoreOptions.series[0],
            data: sortedMembers.map(member => member.totalScore)
          }
        ]
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
        const res = await getClassProblemPage(this.problemQuery)
        if (res.data.code === 200) {
          const problems = res.data.data.records
          this.problemTotal = res.data.data.total
          this.classInfo.problemCount = res.data.data.total

          // 并行获取所有题目的标签
          const problemsWithTags = await Promise.all(
            problems.map(async (problem) => {
              if (problem.tagIds && problem.tagIds.length > 0) {
                try {
                  const tagRes = await getTagsByIds(problem.tagIds)
                  if (tagRes.data.code === 200) {
                    problem.tags = tagRes.data.data
                  } else {
                    problem.tags = []
                  }
                } catch (error) {
                  console.error('获取题目标签失败:', error)
                  problem.tags = []
                }
              } else {
                problem.tags = []
              }
              return problem
            })
          )

          this.problemList = problemsWithTags
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
    handleProblemSelectionChange(val) {
      this.selectedProblems = val
    },
    // 添加题目相关方法
    handleAddProblems() {
      this.addProblemDialogVisible = true
      this.searchProblemsToAdd()
    },
    async searchProblemsToAdd() {
      this.addProblemLoading = true
      try {
        const res = await getProblemPage(this.addProblemQuery)
        if (res.data.code === 200) {
          this.availableProblems = res.data.data.records
          this.addProblemTotal = res.data.data.total
        }
      } catch (error) {
        console.error('获取可添加题目列表错误:', error)
        this.$message.error('获取可添加题目列表失败')
      } finally {
        this.addProblemLoading = false
      }
    },
    handleAddSelectionChange(val) {
      this.selectedProblemsToAdd = val
    },
    resetAddProblemSearch() {
      this.addProblemQuery.name = ''
      this.searchProblemsToAdd()
    },
    handleAddProblemSizeChange(val) {
      this.addProblemQuery.pageSize = val
      this.searchProblemsToAdd()
    },
    handleAddProblemCurrentChange(val) {
      this.addProblemQuery.pageNo = val
      this.searchProblemsToAdd()
    },
    async confirmAddProblems() {
      if (this.selectedProblemsToAdd.length === 0) {
        this.$message.warning('请选择要添加的题目')
        return
      }

      try {
        const res = await addProblemToClass({
          classId: this.problemQuery.classId,
          problemIds: this.selectedProblemsToAdd.map(p => p.id)
        })
        if (res.data.code === 200) {
          this.$message.success('添加题目成功')
          this.addProblemDialogVisible = false
          this.queryProblems()
        }
      } catch (error) {
        console.error('添加题目错误:', error)
        this.$message.error('添加题目失败')
      }
    },
    handleRemoveProblems() {
      if (this.selectedProblems.length === 0) {
        this.$message.warning('请选择要移除的题目')
        return
      }

      this.$confirm('确定要移除选中的题目吗？', '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          const res = await removeProblemFromClass({
            classId: this.problemQuery.classId,
            problemIds: this.selectedProblems.map(p => p.id)
          })
          if (res.data.code === 200) {
            this.$message.success('移除题目成功')
            this.queryProblems()
          }
        } catch (error) {
          console.error('移除题目错误:', error)
          this.$message.error('移除题目失败')
        }
      })
    },
    // 查看题目详情
    handleViewProblem(problem) {
      this.$router.push({
        path: `/problem/${problem.id}`,
        query: {
          classId: this.problemQuery.classId
        }
      })
    },
    // 编辑题目
    handleEditProblem(problem) {
      this.$router.push({
        path: `/problemManage/edit/${problem.id}`
      })
    },
    // 查看学生详情
    async handleViewStudentDetail(student) {
      this.studentDetailDialogVisible = true
      this.studentDetailLoading = true
      this.currentStudentId = student.id
      
      try {
        // 获取该学生的所有题目完成情况
        const promises = this.problemList.map(async problem => {
          try {
            const res = await getTeacherClassProblemInfo(problem.classProblemId, student.id)
            if (res.data.code === 200) {
              return {
                ...problem,
                ...res.data.data
              }
            }
            return problem
          } catch (error) {
            console.error('获取题目完成情况失败:', error)
            return problem
          }
        })
        
        this.studentProblemList = await Promise.all(promises)
      } catch (error) {
        console.error('获取学生详情失败:', error)
        this.$message.error('获取学生详情失败')
      } finally {
        this.studentDetailLoading = false
      }
    },
    // 计算完成进度
    calculateProgress(member) {
      const maxScore = this.classInfo.problemCount * 4
      if (!maxScore) return 0
      return Math.round((member.totalScore / maxScore) * 100)
    },
    // 格式化百分比
    percentageFormat(percentage) {
      return percentage + '%'
    },
    // 获取用户信息
    async getUserDetails() {
      try {
        const res = await getUserInfo()
        if (res.data.code === 200) {
          this.userInfo = res.data.data
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },
    // 处理下拉菜单命令
    handleCommand(command) {
      if (command === 'logout') {
        this.handleLogout()
      }
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

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;
}

.username {
  margin: 0 8px;
  color: #303133;
  font-size: 14px;
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
  margin-bottom: 20px;
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

.operation-wrapper {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.add-problem-dialog {
  margin-bottom: 20px;
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

.statistics-content {
  padding: 20px;
}

.charts-container {
  margin-top: 20px;
}

.chart-item {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}
</style> 