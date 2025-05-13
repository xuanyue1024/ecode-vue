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
          <h3>{{ classInfo.name }}</h3>
          <p></p>
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
          <el-menu-item index="problemRank">
            <i class="el-icon-trophy"></i>
            <span>排行榜</span>
          </el-menu-item>
          <el-menu-item index="knowledgeBase">
            <i class="el-icon-reading"></i>
            <span>知识库</span>
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
            
            <!-- 添加题目难度和标签分布图 -->
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
              <el-table-column prop="createTime" label="创建时间" width="150"></el-table-column>
              <el-table-column prop="updateTime" label="更新时间" width="150"></el-table-column>
              <el-table-column label="操作" width="200">
                <template slot-scope="scope">
                  <el-button type="text" @click="handleStartProblem(scope.row)">查看</el-button>
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

        <!-- 题目排行榜 -->
        <div v-show="activeMenu === 'problemRank'" class="content-section">
          <el-card v-loading="problemRankLoading">
            <div class="statistics-content">
              <div class="charts-container">
                <div class="chart-item">
                  <v-chart 
                    ref="problemPassRateChart" 
                    :options="problemPassRateOptions" 
                    style="width: 100%; height: 400px;"
                    autoresize>
                  </v-chart>
                </div>
                <div class="table-container">
                  <el-table 
                    :data="problemRankList"
                    border
                    stripe
                    style="width: 100%; margin-top: 20px;">
                    <el-table-column prop="problemTitle" label="题目" width="300"></el-table-column>
                    <el-table-column label="难度" width="120">
                      <template slot-scope="scope">
                        <el-tag :type="scope.row.difficulty === 1 ? 'success' : scope.row.difficulty === 2 ? 'warning' : 'danger'">
                          {{ scope.row.difficulty === 1 ? '简单' : scope.row.difficulty === 2 ? '中等' : '困难' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="attemptedStudents" label="尝试人数"></el-table-column>
                    <el-table-column prop="totalSubmissions" label="总提交次数"></el-table-column>
                    <el-table-column label="通过率">
                      <template slot-scope="scope">
                        <el-progress 
                          :percentage="parseFloat((scope.row.passRate).toFixed(2))"
                          :format="percentFormat">
                        </el-progress>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </div>
          </el-card>
          
          <!-- 学生成绩排名 -->
          <el-card v-loading="studentRankLoading" style="margin-top: 20px;">
            <div class="statistics-content">
              <!-- <h3>学生成绩排名</h3> -->
              <div class="charts-container">
                <div class="chart-item">
                  <v-chart 
                    ref="studentRankChart" 
                    :options="studentRankOptions" 
                    style="width: 100%; height: 400px;"
                    autoresize>
                  </v-chart>
                </div>
                <div class="table-container">
                  <el-table 
                    :data="studentRankList"
                    border
                    stripe
                    style="width: 100%; margin-top: 20px;">
                    <el-table-column prop="studentName" label="学生姓名" width="180"></el-table-column>
                    <el-table-column prop="attemptedProblems" label="尝试题目数" width="120"></el-table-column>
                    <el-table-column prop="totalSubmissions" label="总提交次数" width="120"></el-table-column>
                    <el-table-column prop="passedSubmissions" label="通过次数" width="120"></el-table-column>
                    <el-table-column prop="avgScore" label="平均分" width="120">
                      <template slot-scope="scope">
                        {{ scope.row.avgScore.toFixed(2) }}
                      </template>
                    </el-table-column>
                    <el-table-column label="通过率" width="180">
                      <template slot-scope="scope">
                        <el-progress 
                          :percentage="parseFloat(scope.row.passRatePercentage.toFixed(2))"
                          :format="percentFormat">
                        </el-progress>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 知识库 -->
        <div v-show="activeMenu === 'knowledgeBase'" class="content-section">
          <el-card v-loading="pdfLoading">
            <div class="knowledge-base-content">
              <h3>班级知识库</h3>
              
              <div v-if="hasPdf" class="knowledge-base-actions">
                <p class="pdf-info">
                  <i class="el-icon-document"></i>
                  班级学习资料已上传
                </p>
                <div class="action-buttons">
                  <el-button type="primary" @click="viewPdf">查看PDF</el-button>
                  <el-button type="success" @click="downloadPdf">下载PDF</el-button>
                  <el-button type="warning" @click="showUploadDialog">重新上传</el-button>
                  <el-button type="danger" @click="deletePdfFile">删除PDF</el-button>
                </div>
              </div>
              
              <div v-else class="knowledge-base-upload">
                <el-empty description="暂无知识库文件">
                  <el-button type="primary" @click="showUploadDialog">上传PDF文件</el-button>
                </el-empty>
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
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
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
          <el-table-column prop="createTime" label="创建时间" width="150"></el-table-column>
          <el-table-column prop="updateTime" label="更新时间" width="150"></el-table-column>
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

    <!-- PDF上传对话框 -->
    <el-dialog
      title="上传知识库PDF文件"
      :visible.sync="uploadDialogVisible"
      width="500px">
      <div class="upload-dialog-content">
        <el-upload
          class="upload-demo"
          drag
          action="#"
          :http-request="handlePdfUpload"
          :before-upload="beforePdfUpload"
          :limit="1"
          accept=".pdf"
          :file-list="fileList">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传PDF文件</div>
        </el-upload>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="uploadDialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getTeacherClassMembers, getClassProblemPage, addProblemToClass, removeProblemFromClass, getTeacherClassProblemInfo, getClassProblemPassRate, getClassStudentRank, getTeacherClassProblemDifficultyNum, getTeacherClassProblemTagNum } from '@/api/class'
import { getProblemPage } from '@/api/problem'
import { getUserInfo } from '@/api/user'
import { formatDate } from '@/utils/date'
import { checkPdfExists, getKnowledgeBasePdfUrl, uploadPdf, deletePdf } from '@/api/ai'
import { uploadFileRequest } from '@/utils/request'
import ECharts from 'vue-echarts'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/pie'
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
      // 知识库相关
      hasPdf: false,
      pdfUrl: '',
      uploadDialogVisible: false,
      fileList: [],
      pdfLoading: false,
      // 题目排行榜相关
      problemRankLoading: false,
      problemRankList: [],
      problemPassRateOptions: {
        title: {
          text: '题目通过率排行榜',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            const data = params[0]
            return `${data.name}<br/>通过率：${(data.value ).toFixed(2)}%`
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
              if (value.length > 15) {
                return value.substring(0, 12) + '...'
              }
              return value
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '通过率',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: function(value) {
              return (value).toFixed(0) + '%'
            }
          }
        },
        series: [
          {
            type: 'bar',
            data: [],
            itemStyle: {
              color: function(params) {
                // 根据通过率设置不同颜色
                const value = params.data
                if (value >= 0.8) return '#67C23A'  // 高通过率为绿色
                if (value >= 0.5) return '#E6A23C'  // 中等通过率为黄色
                return '#F56C6C'  // 低通过率为红色
              }
            },
            label: {
              show: true,
              position: 'top',
              formatter: function(params) {
                return (params.value).toFixed(0) + '%'
              }
            }
          }
        ]
      },
      // 学生排名相关
      studentRankLoading: false,
      studentRankList: [],
      studentRankOptions: {
        title: {
          text: '学生成绩排名',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            const data = params[0]
            return `${data.name}<br/>平均分：${data.value.toFixed(2)}`
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
            rotate: 30
          }
        },
        yAxis: {
          type: 'value',
          name: '平均分'
        },
        series: [
          {
            type: 'bar',
            data: [],
            itemStyle: {
              color: function(params) {
                // 根据分数设置不同颜色
                const value = params.data
                if (value >= 3) return '#67C23A'  // 高分为绿色
                if (value >= 2) return '#E6A23C'  // 中等分为黄色
                return '#F56C6C'  // 低分为红色
              }
            },
            label: {
              show: true,
              position: 'top',
              formatter: function(params) {
                return params.value.toFixed(2)
              }
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
    // 从路由参数中获取班级ID和名称
    const { id } = this.$route.params
    const { name, teacherName, activeTab } = this.$route.query
    
    // 设置班级基本信息
    this.classInfo = {
      ...this.classInfo,
      id,
      name: name || ''
    }

    // 设置查询参数
    this.memberQuery.classId = id
    this.problemQuery.classId = id

    // 如果有activeTab参数，则设置激活的菜单
    if (activeTab) {
      this.activeMenu = activeTab
    }

    // 初始化数据
    this.initData()
    this.getUserDetails()

    // 加载难度分布和标签分布数据
    this.loadDifficultyDistribution()
    this.loadTagDistribution()

    // 如果是知识库页面，检查PDF文件是否存在
    if (this.activeMenu === 'knowledgeBase') {
      this.checkPdfExistence()
    }
  },
  methods: {
    formatDate,
    initData() {
      this.queryMembers()
      this.queryProblems()
    },
    async handleMenuSelect(index) {
      this.activeMenu = index
      if (index === 'overview') {
        await this.loadDifficultyDistribution()
        await this.loadTagDistribution()
      } else if (index === 'knowledgeBase') {
        await this.checkPdfExistence()
      } else if (index === 'problemRank') {
        await this.loadProblemPassRate()
        await this.loadStudentRank()
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
          const problems = res.data.data.records
          this.addProblemTotal = res.data.data.total
          
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
          this.availableProblems = problemsWithTags
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
    // 开始做题
    handleStartProblem(problem) {
      this.$router.push({
        path: '/code',
        query: {
          problemId: problem.id,
          classId: this.problemQuery.classId,
          classProblemId: problem.classProblemId
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
    },
    // 知识库相关方法
    async checkPdfExistence() {
      this.pdfLoading = true
      try {
        const response = await checkPdfExists(this.classInfo.id)
        this.hasPdf = response.data.code === 200 && response.data.data !== null
        if (this.hasPdf) {
          this.pdfUrl = response.data.data.url
        }
      } catch (error) {
        console.error('检查PDF文件存在失败:', error)
        this.hasPdf = false
      } finally {
        this.pdfLoading = false
      }
    },
    viewPdf() {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || ''
      window.open(`${this.pdfUrl}`, '_blank')
    },
    downloadPdf() {
    
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || ''
      const a = document.createElement('a')
      a.href = `${this.pdfUrl}`
      a.download = `${this.classInfo.name}-学习资料.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    },
    showUploadDialog() {
      this.uploadDialogVisible = true
      this.fileList = []
    },
    beforePdfUpload(file) {
      const isPdf = file.type === 'application/pdf'
      
      if (!isPdf) {
        this.$message.error('只能上传PDF文件!')
      }
      return isPdf
    },
    async handlePdfUpload({ file }) {
  try {
    const res = await uploadPdf(this.classInfo.id, file)
    
    if (res.code === 200) {
      this.$message.success('PDF文件上传成功')
      this.uploadDialogVisible = false
      await this.checkPdfExistence()
    } else {
      this.$message.error(res.msg || '上传失败')
    }
  } catch (error) {
    console.error('上传PDF文件失败:', error)
    this.$message.error('上传PDF文件失败')
  }
},
    async deletePdfFile() {
      try {
        const res = await deletePdf(this.classInfo.id)
        if (res.data.code === 200) {
          this.$message.success('PDF文件删除成功')
          this.hasPdf = false
        } else {
          this.$message.error(res.data.msg || '删除失败')
        }
      } catch (error) {
        console.error('删除PDF文件失败:', error)
        this.$message.error('删除PDF文件失败')
      }
    },
    // 加载题目通过率排行榜数据
    async loadProblemPassRate() {
      if (!this.classInfo.id) return
      this.problemRankLoading = true
      try {
        const res = await getClassProblemPassRate(this.classInfo.id)
        if (res.data.code === 200) {
          this.problemRankList = res.data.data || []
          
          // 更新图表数据
          this.updateProblemPassRateChart()
        }
      } catch (error) {
        console.error('获取题目通过率数据失败:', error)
        this.$message.error('获取题目通过率数据失败')
      } finally {
        this.problemRankLoading = false
      }
    },
    // 更新题目通过率图表
    updateProblemPassRateChart() {
      // 按通过率排序
      const sortedProblems = [...this.problemRankList].sort((a, b) => b.passRate - a.passRate)
      
      this.problemPassRateOptions = {
        ...this.problemPassRateOptions,
        xAxis: {
          ...this.problemPassRateOptions.xAxis,
          data: sortedProblems.map(problem => problem.problemTitle)
        },
        series: [
          {
            ...this.problemPassRateOptions.series[0],
            data: sortedProblems.map(problem => problem.passRate)
          }
        ]
      }
    },
    // 格式化百分比
    percentFormat(percentage) {
      return percentage + '%'
    },
    // 加载学生成绩排名数据
    async loadStudentRank() {
      if (!this.classInfo.id) return
      this.studentRankLoading = true
      try {
        const res = await getClassStudentRank(this.classInfo.id)
        if (res.data.code === 200) {
          this.studentRankList = res.data.data || []
          
          // 更新图表数据
          this.updateStudentRankChart()
        }
      } catch (error) {
        console.error('获取学生成绩排名数据失败:', error)
        this.$message.error('获取学生成绩排名数据失败')
      } finally {
        this.studentRankLoading = false
      }
    },
    // 更新学生成绩排名图表
    updateStudentRankChart() {
      // 按平均分排序
      const sortedStudents = [...this.studentRankList].sort((a, b) => b.avgScore - a.avgScore)
      
      this.studentRankOptions = {
        ...this.studentRankOptions,
        xAxis: {
          ...this.studentRankOptions.xAxis,
          data: sortedStudents.map(student => student.studentName)
        },
        series: [
          {
            ...this.studentRankOptions.series[0],
            data: sortedStudents.map(student => student.avgScore)
          }
        ]
      }
    },
    async loadDifficultyDistribution() {
      try {
        const res = await getTeacherClassProblemDifficultyNum(this.classInfo.id)
        if (res.data.code === 200) {
          const difficultyData = res.data.data || []
          
          // 转换数据格式为图表所需格式
          const chartData = difficultyData.map(item => ({
            name: item.difficulty,
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
        const res = await getTeacherClassProblemTagNum(this.classInfo.id)
        if (res.data.code === 200) {
          let tagData = res.data.data
          if (!Array.isArray(tagData)) tagData = []
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
    }
  }
}
</script>

<style scoped>
/* 全局容器 */
.class-detail-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  padding: 0;
  margin: 0;
}

/* 顶部导航 */
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

/* 主内容区域 */
.main-container {
  margin-top: 0px; 
  flex: 1;
  display: flex;
  min-height: calc(100vh - 60px);
  width: 100%;
  position: relative;
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
  margin-left: 0px;
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
    width: 100%;
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

/* 知识库样式 */
.knowledge-base-content {
  padding: 20px;
}

.knowledge-base-upload {
  margin-top: 30px;
  text-align: center;
}

.knowledge-base-actions {
  margin-top: 20px;
  text-align: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.pdf-info {
  font-size: 16px;
  color: #409EFF;
  margin-bottom: 20px;
}

.pdf-info i {
  margin-right: 5px;
  font-size: 20px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

@media screen and (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
}

.upload-dialog-content {
  text-align: center;
}

.table-container {
  margin-top: 30px;
}

.chart-container-wrapper {
  margin-top: 30px;
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
</style>