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
              <span class="username">{{ userInfo.name }}</span>
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
            <span>题目集</span>
          </el-menu-item>
          <el-menu-item index="statistics">
            <i class="el-icon-data-line"></i>
            <span>数据统计</span>
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

            <!-- 添加题目难度和标签分布图表 -->
            <div class="chart-container-wrapper">
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="chart-container">
                    <h4>题目难度分布</h4>
                    <v-chart 
                      :options="difficultyPieOptions" 
                      style="width: 100%; height: 300px;"
                      autoresize>
                    </v-chart>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="chart-container">
                    <h4>题目标签分布</h4>
                    <v-chart 
                      ref="tagBarChart" 
                      :options="tagBarOptions" 
                      style="width: 100%; height: 300px;"
                      autoresize>
                    </v-chart>
                  </div>
                </el-col>
              </el-row>
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
              <el-table-column prop="id" label="ID" width="80"></el-table-column>
              <el-table-column prop="title" label="题目标题"></el-table-column>
              <el-table-column prop="grade" label="难度" width="100">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.grade === 'EASY' ? 'success' : scope.row.grade === 'GENERAL' ? 'warning' : 'danger'">
                    {{ scope.row.grade === 'EASY' ? '简单' : scope.row.grade === 'GENERAL' ? '中等' : '困难' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="标签" width="300">
                <template slot-scope="scope">
                  <el-tag v-for="tag in scope.row.tags" :key="tag.id" size="small" style="margin-right: 5px">
                    {{ tag.name }}
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
              <div class="charts-container">
                <div class="chart-item">
                  <v-chart 
                    ref="scoreChart" 
                    :options="chartOptions" 
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
  </div>
</template>

<script>
import { getClassMembers, getStudentClassProblemPage, getClassProblemInfo, getStudentClassProblemDifficultyNum, getStudentClassProblemTagNum } from '@/api/class'
import { getUserInfo } from '@/api/user'
import { getStudentStatistic } from '@/api/statistic'
import { getStudentTagsByIds } from '@/api/tag'
import { getRequest } from '@/utils/request'
import ECharts from 'vue-echarts'
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/grid'
import 'echarts/lib/chart/pie'
import 'echarts/lib/chart/line'

export default {
  name: 'ClassDetail',
  components: {
    'v-chart': ECharts
  },
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
      },
      userInfo: {
        username: '',
        profilePicture: ''
      },
      // 统计相关
      chartOptions: {
        title: {
          text: '题目完成情况统计',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['得分', '提交次数', '通过次数'],
          top: 30
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
          type: 'value'
        },
        series: [
          {
            name: '得分',
            type: 'bar',
            data: [],
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '提交次数',
            type: 'bar',
            data: [],
            itemStyle: {
              color: '#67C23A'
            }
          },
          {
            name: '通过次数',
            type: 'bar',
            data: [],
            itemStyle: {
              color: '#E6A23C'
            }
          }
        ]
      },

      // 题目难度分布饼图配置
      difficultyPieOptions: {
        title: {
          text: '题目难度分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          top: 'center',
          data: ['简单', '中等', '困难']
        },
        color: ['#67C23A', '#E6A23C', '#F56C6C'],
        series: [
          {
            name: '难度分布',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: []
          }
        ]
      },
      
      // 题目标签分布柱状图配置
      tagBarOptions: {
        title: {
          text: '题目标签分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: [],
          axisLabel: {
            interval: 0,
            rotate: 30,
            formatter: function(value) {
              return value.length > 10 ? value.slice(0, 10) + '...' : value
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '题目数量'
        },
        series: [
          {
            name: '题目数量',
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
    this.memberQuery.classId = this.$route.params.id
    this.problemQuery.classId = this.$route.params.id
    this.initData()
    this.getUserDetails()
    this.loadDifficultyDistribution()
    this.loadTagDistribution()
  },
  methods: {

    

    async loadDifficultyDistribution() {
      try {
        const res = await getStudentClassProblemDifficultyNum(this.$route.params.id)
        if (res.data.code === 200) {
          const difficultyData = res.data.data || []
          
          // 直接使用API返回的难度名称
          const chartData = difficultyData.map(item => ({
            name: item.difficulty, // 直接使用API返回的难度名称
            value: item.problemNum
          }))
          
          this.difficultyPieOptions.series[0].data = chartData
          
          // 更新图例数据
          this.difficultyPieOptions.legend.data = chartData.map(item => item.name)
        }
      } catch (error) {
        console.error('获取题目难度分布失败:', error)
        this.$message.error('获取题目难度分布失败')
      }
    },
    
    async loadTagDistribution() {
      try {
        const res = await getStudentClassProblemTagNum(this.$route.params.id)
        if (res.data.code === 200) {
          const tagData = res.data.data || []
          // 只保留有数量的标签
          const sorted = tagData
            .filter(item => item && typeof item.problemCount === 'number' && item.problemCount > 0)
            .sort((a, b) => b.problemCount - a.problemCount)
          const names = sorted.map(item => item.tagName && item.tagName.trim() ? item.tagName : '未标记')
          const values = sorted.map(item => item.problemCount)
          // 若无数据，显示占位
          if (names.length === 0) {
            names.push('无标签数据')
            values.push(0)
          }
          this.tagBarOptions.xAxis.data = names
          this.tagBarOptions.series[0].data = values
        }
      } catch (error) {
        console.error('获取题目标签分布失败:', error)
        this.$message.error('获取题目标签分布失败')
      }
    },

    initData() {
      this.queryMembers()
      this.queryProblems()
    },
    async handleMenuSelect(index) {
      this.activeMenu = index
      if (index === 'overview') {
        await this.loadOverviewData()
        await this.loadDifficultyDistribution()
        await this.loadTagDistribution()
      } else if (index === 'statistics') {
        await this.loadStatistics()
      }
    },
    async loadStatistics() {
      try {
        const res = await getStudentStatistic(this.$route.params.id)
        if (res.data.code === 200) {
          const data = res.data.data
          const titles = data.key.split(',')
          const values = data.value
          const scores = values.score.split(',').map(Number)
          const submits = values.submit.split(',').map(Number)
          const passes = values.pass.split(',').map(Number)
          this.chartOptions = {
            ...this.chartOptions,
            xAxis: {
              ...this.chartOptions.xAxis,
              data: titles
            },
            series: [
              {
                ...this.chartOptions.series[0],
                data: scores
              },
              {
                ...this.chartOptions.series[1],
                data: submits
              },
              {
                ...this.chartOptions.series[2],
                data: passes
              }
            ]
          }
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
        this.$message.error('获取统计数据失败')
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
          const problems = res.data.data.records
          // 获取每个题目的作答情况
          const problemsWithInfo = await Promise.all(
            problems.map(async (problem) => {
              try {
                const infoRes = await getClassProblemInfo(problem.classProblemId)
                let updatedProblem = {
                  ...problem,
                  submitCount: infoRes.data.data.submitNumber,
                  passRate: infoRes.data.data.passNumber / (infoRes.data.data.submitNumber || 1),
                  status: infoRes.data.data.score === 4 ? 'COMPLETED' : 'UNCOMPLETED',
                  createTime: infoRes.data.data.createTime,
                  updateTime: infoRes.data.data.updateTime,
                  tags: []
                }
                
                // 单独获取标签信息
                if (problem.tagIds && problem.tagIds.length > 0) {
                  try {
                    const tagRes = await getStudentTagsByIds(problem.tagIds)
                    if (tagRes.data.code === 200) {
                      updatedProblem.tags = tagRes.data.data
                    }
                  } catch (tagError) {
                    console.error('获取题目标签失败:', tagError)
                  }
                }
                
                return updatedProblem
              } catch (error) {
                console.error('获取题目作答情况失败:', error)
                return { ...problem, tags: [] }
              }
            })
          )
          
          this.problemList = problemsWithInfo
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
      // 每道题满分4分，计算总分
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
  },
  beforeDestroy() {
    if (this.scoreChart) {
      this.scoreChart.dispose()
    }
  },

}
</script>

<style scoped>

/* 修改用户信息区域的样式 */
.user-info {
  display: flex;
  align-items: center;  /* 垂直居中对齐 */
  padding: 5px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background-color: #f5f7fa;
}

/* 修改用户名样式 */
.username {
  margin: 0 8px;  /* 保持左右间距 */
  color: #606266;
  font-size: 14px;
  line-height: 32px;  /* 与头像高度保持一致 */
}

/* 修改下拉箭头样式 */
.el-icon-caret-bottom {
  font-size: 12px;
  color: #909399;
  line-height: 32px;  /* 与头像高度保持一致 */
}

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
  width: calc(100% - 200px); /* 确保宽度正好是屏幕减去侧边栏的宽度 */
  overflow-y: auto; /* 添加垂直滚动能力 */
  height: calc(100vh - 60px); /* 设置固定高度以启用滚动 */
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

/* 修改整个概览区域的间距 */
.overview-card {
  margin-bottom: 20px;
  padding: 24px;
}

/* 修改标题与统计卡片之间的间距 */
.overview-header {
  margin-bottom: 32px;  /* 增加与下方统计卡片的间距 */
}

.overview-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

/* 修改统计卡片区域的布局和间距 */
.overview-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* 固定三列布局 */
  gap: 24px;  /* 统一卡片之间的间距 */
  margin-bottom: 40px;  /* 增加与下方图表的间距 */
}

/* 修改统计卡片的内部样式 */
.stat-card {
  display: flex;
  align-items: center;
  padding: 24px;
  background-color: #f8f9fb;  /* 更柔和的背景色 */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
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

/* 修改图表容器的样式和间距 */
.chart-container-wrapper {
  margin-top: 30px;
  margin-bottom: 30px;
}

.chart-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  margin-bottom: 20px;
}

.chart-container h4 {
  text-align: center;
  margin-top: 0;
  margin-bottom: 20px;
  color: #606266;
  font-weight: 500;
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

  /* 修改图表容器的样式和间距 */
  .chart-container {
    margin-top: 40px;  /* 增加与上方元素的间距 */
    margin-bottom: 40px;  /* 增加与下方元素的间距 */
    padding: 24px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  /* 为最后一个图表容器移除底部边距 */
  .chart-container:last-child {
    margin-bottom: 0;
  }
}
</style>