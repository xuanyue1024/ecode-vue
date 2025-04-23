<template>
  <div class="submission-history">
    <div class="history-header">
      <h3>代码提交历史</h3>
      <el-tooltip content="刷新" placement="top">
        <el-button type="text" icon="el-icon-refresh" @click="fetchSubmissions"></el-button>
      </el-tooltip>
    </div>
    
    <div v-if="loading" class="history-loading">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else-if="submissions.length === 0" class="no-data">
      <i class="el-icon-document"></i>
      <p>暂无提交记录</p>
    </div>
    
    <el-table
      v-else
      :data="submissions"
      style="width: 100%"
      :row-class-name="tableRowClassName">
      <el-table-column
        prop="submitTime"
        label="提交时间"
        min-width="180">
        <template slot-scope="scope">
          {{ scope.row.submitTime }}
        </template>
      </el-table-column>
      <el-table-column
        prop="languageType"
        label="语言"
        min-width="100">
        <template slot-scope="scope">
          <el-tag size="small" :type="getLanguageTagType(scope.row.languageType)">
            {{ scope.row.languageType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="passCount"
        label="通过测试"
        min-width="100">
        <template slot-scope="scope">
          <div class="pass-count">
            <span :class="getPassCountClass(scope.row.passCount)">
              {{ scope.row.passCount }}/4
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="120">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="viewCode(scope.row)">
            查看代码
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 代码查看对话框 -->
    <el-dialog
      title="提交代码详情"
      :visible.sync="codeDialogVisible"
      width="70%"
      class="code-dialog">
      <div v-if="selectedSubmission" class="code-detail-header">
        <div>
          <span class="detail-label">提交时间：</span>
          <span>{{ selectedSubmission.submitTime }}</span>
        </div>
        <div>
          <span class="detail-label">语言：</span>
          <el-tag size="small" :type="getLanguageTagType(selectedSubmission.languageType)">
            {{ selectedSubmission.languageType }}
          </el-tag>
        </div>
        <div>
          <span class="detail-label">通过测试：</span>
          <span :class="getPassCountClass(selectedSubmission.passCount)">
            {{ selectedSubmission.passCount }}/4
          </span>
        </div>
      </div>
      <div ref="codeEditor" class="code-editor"></div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="codeDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="useThisCode">使用此代码</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getCodeSubmissions } from '@/api/code'
import * as monaco from 'monaco-editor'

export default {
  name: 'SubmissionHistory',
  props: {
    classId: {
      type: [Number, String],
      required: true
    },
    classProblemId: {
      type: [Number, String],
      required: true
    },
    currentLanguage: {
      type: String,
      default: 'java'
    }
  },
  data() {
    return {
      submissions: [],
      loading: false,
      codeDialogVisible: false,
      selectedSubmission: null,
      codeEditor: null
    }
  },
  created() {
    this.fetchSubmissions()
  },
  methods: {
    async fetchSubmissions() {
      this.loading = true
      try {
        const response = await getCodeSubmissions(this.classId, this.classProblemId)
        if (response.data.code === 200) {
          this.submissions = response.data.data || []
        } else {
          this.$message.error(response.data.msg || '获取提交记录失败')
        }
      } catch (error) {
        console.error('获取提交记录错误:', error)
        this.$message.error('获取提交记录失败')
      } finally {
        this.loading = false
      }
    },
    getLanguageTagType(language) {
      const languageMap = {
        'java': '',
        'python3': 'success',
        'cpp': 'warning',
        'nodejs': 'info',
        'go': 'danger'
      }
      return languageMap[language] || ''
    },
    getPassCountClass(count) {
      if (count === 4) return 'text-success'
      if (count >= 2) return 'text-warning'
      return 'text-danger'
    },
    tableRowClassName({ row, rowIndex }) {
      if (row.passCount === 4) {
        return 'success-row'
      }
      return ''
    },
    viewCode(submission) {
      this.selectedSubmission = submission
      this.codeDialogVisible = true
      
      // 创建代码编辑器的配置
      this.$nextTick(() => {
        // 如果已经有编辑器实例，先销毁
        if (this.codeEditor) {
          this.codeEditor.dispose()
        }
        
        // 创建编辑器
        this.codeEditor = monaco.editor.create(this.$refs.codeEditor, {
          value: submission.codeText,
          language: this.getMonacoLanguage(submission.languageType),
          theme: 'vs',
          readOnly: true,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fontSize: '14px'
        })
      })
    },
    getMonacoLanguage(language) {
      const languageMap = {
        'java': 'java',
        'python3': 'python',
        'cpp': 'cpp',
        'nodejs': 'javascript',
        'go': 'go'
      }
      return languageMap[language] || language
    },
    useThisCode() {
      if (this.selectedSubmission) {
        this.$emit('use-code', {
          code: this.selectedSubmission.codeText,
          language: this.selectedSubmission.languageType
        })
        this.codeDialogVisible = false
        this.$message.success('已加载选中的代码')
      }
    }
  }
}
</script>

<style scoped>
.submission-history {
  height: 100%;
  display: flex;
  flex-direction: column;
  text-align: left;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 10px;
  text-align: left;
}

.history-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.no-data {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 14px;
}

.no-data i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #DCDFE6;
}

.history-loading {
  padding: 20px;
}

.pass-count {
  display: flex;
  align-items: center;
}

.text-success {
  color: #67C23A;
  font-weight: 500;
}

.text-warning {
  color: #E6A23C;
  font-weight: 500;
}

.text-danger {
  color: #F56C6C;
  font-weight: 500;
}

.code-detail-header {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #EBEEF5;
}

.detail-label {
  font-weight: 500;
  margin-right: 8px;
  color: #606266;
}

.code-editor {
  height: 500px;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
}

/* 修复深度选择器语法 */
/deep/ .success-row {
  background-color: #f0f9eb;
}

/deep/ .el-table__row {
  cursor: pointer;
}

/deep/ .el-table__row:hover {
  background-color: #f5f7fa !important;
}
</style>

<style>
.code-dialog .el-dialog__body {
  padding: 20px !important;
}
</style>
