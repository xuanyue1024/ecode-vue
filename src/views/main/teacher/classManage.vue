<template>
  <div class="class-manage">
    <!-- 搜索栏和操作栏 -->
    <el-card class="header-card">
      <div class="header-wrapper">
        <div class="search-wrapper">
          <el-input 
            v-model="searchForm.name" 
            placeholder="请输入班级名称" 
            clearable 
            @keyup.enter.native="getClassList"
            class="search-input">
          </el-input>
          <el-button type="primary" @click="getClassList" :loading="loading">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
        <div class="operation-wrapper">
          <el-button type="primary" @click="handleAdd">新增班级</el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="selectedClasses.length === 0">批量删除</el-button>
        </div>
      </div>
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
        <el-table-column prop="invitationCode" label="邀请码">
          <template slot-scope="scope">
            <div class="invite-code">
              <span>{{ scope.row.invitationCode }}</span>
              <i class="el-icon-document-copy copy-icon" @click="copyInviteCode(scope.row.invitationCode)" title="复制邀请码"></i>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="joinNumber" label="加入人数"></el-table-column>
        <el-table-column prop="createTime" label="创建时间">
          <template slot-scope="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template slot-scope="scope">
            <el-button type="text" @click="handleViewDetail(scope.row)">查看详情</el-button>
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
  </div>
</template>

<script>
import { 
  addClass, 
  updateClass, 
  deleteClasses, 
  getClassPage
} from '@/api/class'

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
      }
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
    copyInviteCode(code) {
      const input = document.createElement('input')
      input.value = code
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      this.$message.success('邀请码已复制')
    },
    handleViewDetail(row) {
      // 跳转到班级详情页面，并默认切换到"班级题目"标签
      this.$router.push({
        path: `/teacher/classDetail/${row.id}`,
        query: {
          name: row.name,
          teacherName: this.userInfo ? this.userInfo.username : '',
          activeTab: 'problems' // 添加activeTab参数，用于在班级详情页面切换到班级题目标签
        }
      })
    }
  }
}
</script>

<style scoped>
.class-manage {
  height: 100%;
  padding: 20px;
  background-color: #f5f7fa;
  box-sizing: border-box;
}

.header-card {
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  width: 240px;
}

.operation-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 表格卡片样式 */
.el-card {
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1) !important;
}

/* 表格样式 */
.el-table {
  width: 100%;
  margin-top: 8px;
}

.el-table th {
  background-color: #f5f7fa !important;
  color: #606266;
  font-weight: 600;
  font-size: 14px;
}

.el-table td {
  padding: 12px 0;
}

/* 标签样式 */
.el-tag {
  margin-right: 5px;
  border-radius: 4px;
}

.el-tag--success {
  background-color: #f0f9eb;
}

.el-tag--warning {
  background-color: #fdf6ec;
}

.el-tag--danger {
  background-color: #fef0f0;
}

/* 分页样式 */
.pagination {
  margin-top: 20px;
  text-align: right;
  background-color: #fff;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

/* 对话框样式 */
.el-dialog {
  border-radius: 8px;
}

.el-dialog__header {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

.el-dialog__body {
  padding: 24px 40px;
}

.el-dialog__footer {
  padding: 16px 20px;
  border-top: 1px solid #ebeef5;
}

/* 加载状态样式 */
.el-loading-mask {
  background-color: rgba(255, 255, 255, 0.8);
}

/* 按钮样式 */
.el-button--text {
  padding: 0 8px;
}

.el-button--text + .el-button--text {
  margin-left: 8px;
}

/* 表单样式 */
.el-form-item {
  margin-bottom: 22px;
}

.el-form-item__label {
  font-weight: 500;
}

/* 输入框样式 */
.el-input {
  width: 240px;
}

.el-input__inner {
  border-radius: 4px;
}

/* 加载状态样式 */
.el-loading-mask {
  background-color: rgba(255, 255, 255, 0.8);
}

.invite-code {
  display: flex;
  align-items: center;
  gap: 8px;
}

.invite-code span {
  font-family: monospace;
  color: #606266;
}

.copy-icon {
  color: #409EFF;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.copy-icon:hover {
  color: #66b1ff;
  transform: scale(1.1);
}
</style>