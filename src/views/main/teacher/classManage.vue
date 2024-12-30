<template>
  <div class="class-manage">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input v-model="searchForm.name" placeholder="请输入班级名称" clearable @keyup.enter.native="getClassList"></el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="getClassList" :loading="loading">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="operation-card">
      <el-button type="primary" @click="handleAdd">新增班级</el-button>
      <el-button type="danger" @click="handleBatchDelete" :disabled="selectedClasses.length === 0">批量删除</el-button>
    </el-card>

    <!-- 班级列表 -->
    <el-card v-loading="loading">
      <el-table
        :data="classList"
        @selection-change="handleClassSelectionChange"
        border
        stripe
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="name" label="班级名称"></el-table-column>
        <el-table-column prop="invitationCode" label="邀请码"></el-table-column>
        <el-table-column prop="joinNumber" label="加入人数"></el-table-column>
        <el-table-column prop="createTime" label="创建时间">
          <template slot-scope="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
            <el-button type="text" @click="handleProblemManage(scope.row)">题目管理</el-button>
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
          :total="total"
        >
        </el-pagination>
      </div>
    </el-card>

    <!-- 新增/编辑班级对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form :model="classForm" :rules="rules" ref="classForm" label-width="100px">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="classForm.name" placeholder="请输入班级名称"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 题目管理对话框 -->
    <el-dialog title="班级题目管理" :visible.sync="problemDialogVisible" width="1000px">
      <div class="problem-list">
        <!-- 操作按钮 -->
        <div class="operation-bar">
          <el-button type="primary" @click="handleAddProblems">批量添加题目</el-button>
          <el-button type="danger" :disabled="!selectedProblems.length" @click="handleRemoveProblems">批量移除题目</el-button>
        </div>
        
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
        <el-table 
          :data="problemRecords" 
          v-loading="problemLoading"
          @selection-change="handleProblemSelectionChange">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="title" label="题目标题"></el-table-column>
          <el-table-column label="标签" width="200">
            <template slot-scope="scope">
              <el-tag 
                v-for="tagId in scope.row.tagIds" 
                :key="tagId"
                size="small"
                style="margin-right: 5px">
                {{ tagCache.get(tagId) || '加载中...' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="grade" label="难度" width="100">
            <template slot-scope="scope">
              <el-tag :type="scope.row.grade === 'EASY' ? 'success' : scope.row.grade === 'GENERAL' ? 'warning' : 'danger'">
                {{ scope.row.grade === 'EASY' ? '简单' : scope.row.grade === 'GENERAL' ? '中等' : '困难' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="160"></el-table-column>
          <el-table-column prop="updateTime" label="更新时间" width="160"></el-table-column>
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

      <!-- 添加题目对话框 -->
      <el-dialog
        title="添加题目"
        :visible.sync="addProblemDialogVisible"
        width="800px"
        append-to-body>
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
            <el-table-column label="标签" width="200">
              <template slot-scope="scope">
                <el-tag 
                  v-for="tagId in scope.row.tagIds" 
                  :key="tagId"
                  size="small"
                  style="margin-right: 5px">
                  {{ tagCache.get(tagId) || '加载中...' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="grade" label="难度" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.grade === 'EASY' ? 'success' : scope.row.grade === 'GENERAL' ? 'warning' : 'danger'">
                  {{ scope.row.grade === 'EASY' ? '简单' : scope.row.grade === 'GENERAL' ? '中等' : '困难' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
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
    </el-dialog>
  </div>
</template>

<script>
import { 
  addClass, 
  updateClass, 
  deleteClasses, 
  getClassPage,
  addProblemToClass,
  removeProblemFromClass,
  getClassProblemPage
} from '@/api/class'
import { getProblemPage } from '@/api/problem'
import { getTagsByIds } from '@/api/tag'

export default {
  name: 'ClassManage',
  data() {
    return {
      searchForm: {
        pageNo: 1,
        pageSize: 10,
        name: ''
      },
      classList: [],
      selectedClasses: [],
      total: 0,
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      classForm: {
        id: '',
        name: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入班级名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ]
      },
      problemDialogVisible: false,
      currentClass: null,
      problemRecords: [],
      selectedProblems: [],
      problemTotal: 0,
      problemLoading: false,
      problemQuery: {
        pageNo: 1,
        pageSize: 10,
        name: '',
        classId: null
      },
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
      tagCache: new Map()
    }
  },
  created() {
    this.getClassList()
  },
  methods: {
    async getClassList() {
      this.loading = true
      try {
        const res = await getClassPage({
          pageNo: this.searchForm.pageNo,
          pageSize: this.searchForm.pageSize,
          name: this.searchForm.name || '',
          isAsc: false,
          sortBy: ''
        })
        if(res.data.code === 200) {
          this.classList = res.data.data.records
          this.total = res.data.data.total
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
    resetSearch() {
      this.searchForm = {
    pageNo: 1,
    pageSize: 10,
    name: ''
  }
      this.getClassList()
    },
    handleClassSelectionChange(val) {
      this.selectedClasses = val
    },
    handleAdd() {
      this.dialogTitle = '新增班级'
      this.classForm = {
        id: '',
        name: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑班级'
      this.classForm = {
        id: row.id,
        name: row.name
      }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确认删除该班级吗？', '提示', {
        type: 'warning'
      }).then(async () => {
        await deleteClasses([row.id])
        this.$message.success('删除成功')
        this.getClassList()
      })
    },
    handleBatchDelete() {
      if (this.selectedClasses.length === 0) return
      this.$confirm('确认删除选中的班级吗？', '提示', {
        type: 'warning'
      }).then(async () => {
        const ids = this.selectedClasses.map(item => item.id)
        await deleteClasses(ids)
        this.$message.success('删除成功')
        this.getClassList()
      })
    },
    submitForm() {
      this.$refs.classForm.validate(async valid => {
        if (valid) {
          try {
            if (this.classForm.id) {
              const res = await updateClass(this.classForm)
              if (res.data.code === 200) {
                this.$message.success('修改成功')
                this.dialogVisible = false
                this.getClassList()
              } else {
                this.$message.error(res.data.msg || '修改失败')
              }
            } else {
              const res = await addClass(this.classForm.name)
              if (res.data.code === 200) {
                this.$message.success('新增成功')
                this.dialogVisible = false
                this.getClassList()
              } else {
                this.$message.error(res.data.msg || '新增失败')
              }
            }
          } catch (error) {
            console.error('提交表单错误:', error)
            this.$message.error('操作失败')
          }
        }
      })
    },
    handleSizeChange(val) {
    this.searchForm.pageSize = val
    this.getClassList()
    },
    handleCurrentChange(val) {
      this.searchForm.pageNo = val
      this.getClassList()
    },
    handleProblemManage(row) {
      this.currentClass = row
      this.problemQuery.classId = row.id
      this.problemDialogVisible = true
      this.queryProblems()
    },
    async queryProblems() {
      this.problemLoading = true
      try {
        const res = await getClassProblemPage(this.problemQuery)
        if (res.data.code === 200) {
          this.problemRecords = res.data.data.records
          this.problemTotal = res.data.data.total
          
          // 获取所有题目的标签ID
          const tagIds = []
          this.problemRecords.forEach(problem => {
            if (problem.tagIds && problem.tagIds.length > 0) {
              tagIds.push(...problem.tagIds)
            }
          })
          
          // 批量获取标签名称
          if (tagIds.length > 0) {
            const tagRes = await getTagsByIds(tagIds)
            if (tagRes.data.code === 200) {
              // 更新标签缓存
              tagRes.data.data.forEach(tag => {
                this.tagCache.set(tag.id, tag.name)
              })
            }
          }
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
    resetProblemSearch() {
      this.problemQuery.name = ''
      this.queryProblems()
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
          
          // 获取所有题目的标签ID
          const tagIds = []
          this.availableProblems.forEach(problem => {
            if (problem.tagIds && problem.tagIds.length > 0) {
              tagIds.push(...problem.tagIds)
            }
          })
          
          // 批量获取标签名称
          if (tagIds.length > 0) {
            const tagRes = await getTagsByIds(tagIds)
            if (tagRes.data.code === 200) {
              // 更新标签缓存
              tagRes.data.data.forEach(tag => {
                this.tagCache.set(tag.id, tag.name)
              })
            }
          }
        } else {
          this.$message.error(res.data.msg || '获取可添加题目列表失败')
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
          classId: this.currentClass.id,
          problemIds: this.selectedProblemsToAdd.map(p => p.id)
        })
        if (res.data.code === 200) {
          this.$message.success('添加题目成功')
          this.addProblemDialogVisible = false
          this.queryProblems()
        } else {
          this.$message.error(res.data.msg || '添加题目失败')
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
            classId: this.currentClass.id,
            problemIds: this.selectedProblems.map(p => p.id)
          })
          if (res.data.code === 200) {
            this.$message.success('移除题目成功')
            this.queryProblems()
          } else {
            this.$message.error(res.data.msg || '移除题目失败')
          }
        } catch (error) {
          console.error('移除题目错误:', error)
          this.$message.error('移除题目失败')
        }
      })
    },
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
.class-manage {
  padding: 20px;
}
.search-card,
.operation-card {
  margin-bottom: 20px;
}
.pagination {
  margin-top: 20px;
  text-align: right;
}
.operation-bar {
  margin-bottom: 20px;
}
.add-problem-dialog {
  max-height: 600px;
  overflow-y: auto;
}
</style>