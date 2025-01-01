<template>
  <div class="problem-manage">
    <div class="page-header">
      <div class="header-left">
        <h2>题目管理</h2>
      </div>
      <div class="header-right">
        <el-button 
          type="danger" 
          icon="el-icon-delete"
          :disabled="!selectedProblems.length"
          @click="handleBatchDelete">
          批量删除
        </el-button>
        <el-button 
          type="primary" 
          icon="el-icon-plus"
          @click="$router.push('/problemManage/add')">
          新增题目
        </el-button>
      </div>
    </div>

    <div class="content-wrapper">
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item>
            <el-input 
              v-model="searchForm.name" 
              placeholder="请输入题目名称" 
              clearable
              @keyup.enter.native="handleSearch">
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 题目列表 -->
      <el-table 
        :data="problemList" 
        v-loading="loading" 
        border 
        @selection-change="handleSelectionChange"
        style="width: 100%">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column prop="title" label="题目标题"></el-table-column>
        <el-table-column prop="grade" label="难度">
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
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="searchForm.pageNo"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="searchForm.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { getProblemPage, addProblem, updateProblem, deleteProblem, deleteProblems, setProblemTags } from '@/api/problem'
import { searchTags, addTag, getTagsByIds } from '@/api/tag'

export default {
  name: 'ProblemManage',
  data() {
    return {
      // 搜索表单
      searchForm: {
        pageNo: 1,
        pageSize: 10,
        name: ''
      },
      loading: false,
      problemList: [],
      total: 0,
      
      // 表单显示控制
      showAddForm: false,
      
      // 表单数据
      form: {
        title: '',
        grade: 'EASY',
        content: '',
        require: '',
        maxTime: 5,
        maxMemory: 512,
        inputTest1: '',
        outputTest1: '',
        inputTest2: '',
        outputTest2: '',
        inputTest3: '',
        outputTest3: '',
        inputTest4: '',
        outputTest4: ''
      },
      
      // 标签相关
      selectedTags: [],
      selectedTagIds: [],
      tagOptions: [],
      tagsLoading: false,
      inputVisible: false,
      inputValue: '',
      
      // 添加表单验证规则
      rules: {
        title: [
          { required: true, message: '请输入题目标题', trigger: 'blur' },
          { min: 2, max: 50, message: '标题长度应在 2 到 50 个字符之间', trigger: 'blur' }
        ],
        grade: [
          { required: true, message: '请选择题目难度', trigger: 'change' }
        ],
        content: [
          { required: true, message: '请输入题目描述', trigger: 'blur' },
          { min: 10, message: '题目描述不能少于 10 个字符', trigger: 'blur' }
        ],
        require: [
          { required: true, message: '请输入解题要求', trigger: 'blur' }
        ],
        maxTime: [
          { required: true, message: '请设置最大运行时间', trigger: 'blur' }
        ],
        maxMemory: [
          { required: true, message: '请设置最大内存限制', trigger: 'blur' }
        ]
      },
      
      // 添加提交状态
      submitting: false,
      selectedProblems: [], // 选中的题目列表
    }
  },
  created() {
    this.getProblemList()
  },
  methods: {
    // 获取题目列表
    async getProblemList() {
      this.loading = true
      try {
        const res = await getProblemPage(this.searchForm)
        if (res.data.code === 200) {
          const problems = res.data.data.records
          this.total = res.data.data.total

          // 并行获取所有题目的标签
          const tagPromises = problems.map(async (problem) => {
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

          // 等待所有标签请求完成
          this.problemList = await Promise.all(tagPromises)
        }
      } catch (error) {
        console.error('获取题目列表失败:', error)
        this.$message.error('获取题目列表失败')
      } finally {
        this.loading = false
      }
    },
    
    // 搜索和重置
    handleSearch() {
      this.searchForm.pageNo = 1
      this.getProblemList()
    },
    resetSearch() {
      this.searchForm.name = ''
      this.handleSearch()
    },
    
    // 分页
    handleSizeChange(val) {
      this.searchForm.pageSize = val
      this.getProblemList()
    },
    handleCurrentChange(val) {
      this.searchForm.pageNo = val
      this.getProblemList()
    },
    
    // 新增题目
    handleAdd() {
      this.$router.push('/problemManage/add')
    },
    
    // 编辑题目
    handleEdit(row) {
      this.$router.push(`/problemManage/edit/${row.id}`)
    },
    
    // 删除题目
    handleDelete(row) {
      this.$confirm('确认删除该题目吗？', '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteProblem(row.id)
          if (res.data.code === 200) {
            this.$message.success('删除成功')
            this.getProblemList()
          }
        } catch (error) {
          console.error('删除题目失败:', error)
          this.$message.error('删除题目失败')
        }
      }).catch(() => {
        // 用户取消删除操作
        this.$message.info('已取消删除')
      })
    },
    
    // 提交表单
    async handleSubmit() {
      try {
        const data = {
          ...this.form
        }
        let res
        if (this.form.id) {
          // 更新题目
          res = await updateProblem(data)
          if (res.data.code === 200) {
            // 更新标签
            const tagRes = await setProblemTags({
              problemId: this.form.id,
              tagIds: this.selectedTagIds
            })
            if (tagRes.data.code === 200) {
              this.$message.success('更新成功')
              this.showAddForm = false
              this.getProblemList()
            }
          }
        } else {
          // 新增题目
          res = await addProblem(data)
          if (res.data.code === 200) {
            // 设置标签
            const problemId = res.data.data
            const tagRes = await setProblemTags({
              problemId,
              tagIds: this.selectedTagIds
            })
            if (tagRes.data.code === 200) {
              this.$message.success('新增成功')
              this.showAddForm = false
              this.getProblemList()
            }
          }
        }
      } catch (error) {
        console.error('保存题目失败:', error)
        this.$message.error('保存题目失败')
      }
    },
    
    // 标签相关方法
    async remoteSearchTags(query) {
      if (query) {
        this.tagsLoading = true
        try {
          const res = await searchTags(query)
          if (res.data.code === 200) {
            this.tagOptions = res.data.data
          }
        } catch (error) {
          console.error('搜索标签失败:', error)
        } finally {
          this.tagsLoading = false
        }
      } else {
        this.tagOptions = []
      }
    },
    
    handleRemoveTag(tag) {
      this.selectedTags = this.selectedTags.filter(t => t.id !== tag.id)
      this.selectedTagIds = this.selectedTagIds.filter(id => id !== tag.id)
    },
    
    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    
    async handleInputConfirm() {
      if (this.inputValue) {
        try {
          const res = await addTag(this.inputValue)
          if (res.data.code === 200) {
            this.$message.success('添加标签成功')
            // 刷新标签列表
            this.remoteSearchTags(this.inputValue)
          }
        } catch (error) {
          console.error('添加标签失败:', error)
          this.$message.error('添加标签失败')
        }
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    
    // 取消编辑
    handleCancel() {
      this.showAddForm = false
      this.form = {
        title: '',
        grade: 'EASY',
        content: '',
        require: '',
        maxTime: 5,
        maxMemory: 512,
        inputTest1: '',
        outputTest1: '',
        inputTest2: '',
        outputTest2: '',
        inputTest3: '',
        outputTest3: '',
        inputTest4: '',
        outputTest4: ''
      }
      this.selectedTags = []
      this.selectedTagIds = []
    },

    // 处理多选变化
    handleSelectionChange(val) {
      this.selectedProblems = val
    },

    // 批量删除
    async handleBatchDelete() {
      if (!this.selectedProblems.length) return

      try {
        await this.$confirm('确定要删除选中的题目吗？此操作不可恢复', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const ids = this.selectedProblems.map(item => item.id)
        const res = await deleteProblems(ids)

        if (res.data.code === 200) {
          this.$message.success('删除成功')
          // 刷新列表
          this.getProblemList()
          // 清空选中状态
          this.selectedProblems = []
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除题目失败:', error)
          this.$message.error('删除题目失败')
        }
      }
    },
  }
}
</script>

<style scoped>
.problem-manage {
  height: 100%;
  padding: 20px;
  background-color: #f5f7fa;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.header-right {
  display: flex;
  gap: 10px;
}

.content-wrapper {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-bar {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

.search-bar :deep(.el-form-item) {
  margin-bottom: 0;
}

.search-bar :deep(.el-input) {
  width: 240px;
}

/* 表格样式 */
:deep(.el-table) {
  flex: 1;
  overflow: auto;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 600;
}

/* 标签样式 */
:deep(.el-tag) {
  margin-right: 5px;
}

/* 分页样式 */
.pagination {
  padding: 20px;
  text-align: right;
  border-top: 1px solid #ebeef5;
}
</style> 