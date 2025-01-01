<template>
  <div class="add-problem">
    <div class="page-header">
      <div class="header-left">
        <el-button icon="el-icon-back" @click="handleBack">返回</el-button>
        <h2>{{ form.id ? '编辑题目' : '新增题目' }}</h2>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleSubmit" :loading="submitting">{{ form.id ? '保存修改' : '创建题目' }}</el-button>
      </div>
    </div>

    <div class="content-wrapper">
      <el-form :model="form" ref="form" label-width="120px" class="problem-form" :rules="rules">
        <div class="form-section">
          <h4 class="section-title">基本信息</h4>
          <el-form-item label="题目标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入题目标题，简洁明了">
              <template slot="prepend">Title</template>
            </el-input>
            <div class="form-tip">好的题目标题应该简洁明了，能清晰表达题目的主要内容</div>
          </el-form-item>
          <el-form-item label="难度等级" prop="grade">
            <el-select v-model="form.grade" placeholder="请选择题目难度" style="width: 100%">
              <el-option label="简单" value="EASY">
                <i class="el-icon-star-off" style="color: #67C23A"></i> 简单
              </el-option>
              <el-option label="中等" value="GENERAL">
                <i class="el-icon-star-off" style="color: #E6A23C"></i>
                <i class="el-icon-star-off" style="color: #E6A23C"></i> 中等
              </el-option>
              <el-option label="困难" value="DIFFICULT">
                <i class="el-icon-star-off" style="color: #F56C6C"></i>
                <i class="el-icon-star-off" style="color: #F56C6C"></i>
                <i class="el-icon-star-off" style="color: #F56C6C"></i> 困难
              </el-option>
            </el-select>
            <div class="form-tip">根据题目的复杂度和解题所需时间来选择合适的难度等级</div>
          </el-form-item>
          <el-form-item label="题目标签" prop="tags">
            <div class="tags-container">
              <div class="tag-input">
                <el-select
                  v-model="selectedTags"
                  multiple
                  filterable
                  remote
                  reserve-keyword
                  allow-create
                  default-first-option
                  @visible-change="handleSelectVisible"
                  @change="handleTagChange"
                  placeholder="搜索已有标签或输入新标签"
                  :remote-method="remoteSearchTags"
                  :loading="tagsLoading"
                  value-key="name">
                  <el-option
                    v-for="item in tagOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item">
                  </el-option>
                </el-select>
              </div>
            </div>
            <div class="form-tip">添加合适的标签有助于学生快速了解题目类型和知识点</div>
          </el-form-item>
        </div>

        <div class="form-section">
          <h4 class="section-title">题目详情</h4>
          <el-form-item label="题目描述" prop="content">
            <el-input 
              type="textarea" 
              v-model="form.content" 
              :rows="6"
              placeholder="请详细描述题目的背景、要求和输入输出格式">
            </el-input>
            <div class="form-tip">详细的题目描述能帮助学生更好地理解问题和要求</div>
          </el-form-item>
          <el-form-item label="解题要求" prop="require">
            <el-input 
              type="textarea" 
              v-model="form.require" 
              :rows="4"
              placeholder="请说明解题的具体要求，如时间复杂度、空间复杂度等">
            </el-input>
            <div class="form-tip">明确的解题要求可以帮助学生更好地思考解决方案</div>
          </el-form-item>
        </div>

        <div class="form-section">
          <h4 class="section-title">测试用例</h4>
          <div class="test-cases">
            <div v-for="(item, index) in 4" :key="index" class="test-case-item">
              <div class="test-case-header">测试用例 {{item}}</div>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item :label="'输入 ' + item" :prop="'inputTest' + item">
                    <el-input 
                      type="textarea"
                      v-model="form['inputTest' + item]" 
                      :rows="3"
                      placeholder="请输入测试数据">
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="'输出 ' + item" :prop="'outputTest' + item">
                    <el-input 
                      type="textarea"
                      v-model="form['outputTest' + item]" 
                      :rows="3"
                      placeholder="请输入期望输出">
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
          <div class="form-tip">请至少提供一组测试用例，帮助学生验证程序的正确性</div>
        </div>

        <div class="form-section">
          <h4 class="section-title">运行限制</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="最大运行时间" prop="maxTime">
                <el-input-number 
                  v-model="form.maxTime" 
                  :min="1" 
                  :max="60"
                  :step="1"
                  step-strictly>
                </el-input-number>
                <span class="unit-label">秒</span>
                <div class="form-tip">程序的最大允许运行时间</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最大内存限制" prop="maxMemory">
                <el-input-number 
                  v-model="form.maxMemory" 
                  :min="64" 
                  :max="1024"
                  :step="64"
                  step-strictly>
                </el-input-number>
                <span class="unit-label">MB</span>
                <div class="form-tip">程序的最大允许内存使用量</div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </div>

    <!-- 新建标签对话框 -->
    <el-dialog
      title="新建标签"
      :visible.sync="tagDialogVisible"
      width="30%"
      :close-on-click-modal="false">
      <el-form :model="tagForm" ref="tagForm" :rules="tagRules">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="tagDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAddTag" :loading="addingTag">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addProblem, updateProblem, setProblemTags } from '@/api/problem'
import { searchTags, addTag, getTagsByIds } from '@/api/tag'

export default {
  name: 'AddProblem',
  data() {
    return {
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
      tagOptions: [],
      tagsLoading: false,
      
      // 表单验证规则
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
        maxTime: [
          { required: true, message: '请设置最大运行时间', trigger: 'blur' }
        ],
        maxMemory: [
          { required: true, message: '请设置最大内存限制', trigger: 'blur' }
        ]
      },
      
      // 提交状态
      submitting: false,
      
      // 新建标签相关
      tagDialogVisible: false,
      tagForm: {
        name: ''
      },
      tagRules: {
        name: [
          { required: true, message: '请输入标签名称', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ]
      },
      addingTag: false
    }
  },
  computed: {
    // 计算选中的标签ID列表
    selectedTagIds() {
      return this.selectedTags.map(tag => tag.id).filter(id => id)
    }
  },
  created() {
    // 如果是编辑模式，获取题目数据
    const id = this.$route.params.id
    if (id) {
      this.loadProblemData(id)
    }
  },
  methods: {
    // 加载题目数据
    async loadProblemData(id) {
      try {
        const res = await this.$http.get(`/api/teacher/problem/${id}`)
        if (res.data.code === 200) {
          this.form = res.data.data
          if (this.form.tagIds && this.form.tagIds.length > 0) {
            const tagRes = await getTagsByIds(this.form.tagIds)
            if (tagRes.data.code === 200) {
              this.selectedTags = tagRes.data.data
            }
          }
        }
      } catch (error) {
        console.error('获取题目数据失败:', error)
        this.$message.error('获取题目数据失败')
      }
    },

    // 返回上一页
    handleBack() {
      this.$router.push('/problemManage')
    },

    // 提交表单
    async handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.submitting = true
          try {
            const data = { ...this.form }
            let res
            if (this.form.id) {
              // 更新题目
              res = await updateProblem(data)
              if (res.data.code === 200) {
                // 更新标签
                if (this.selectedTagIds.length > 0) {
                  const tagRes = await setProblemTags({
                    problemId: this.form.id,
                    tagIds: this.selectedTagIds
                  })
                  if (tagRes.data.code === 200) {
                    this.$message.success('更新成功')
                    this.handleBack()
                  }
                } else {
                  this.$message.success('更新成功')
                  this.handleBack()
                }
              }
            } else {
              // 新增题目
              res = await addProblem(data)
              if (res.data.code === 200) {
                const problemId = res.data.data
                // 设置标签
                if (this.selectedTagIds.length > 0) {
                  const tagRes = await setProblemTags({
                    problemId: problemId,
                    tagIds: this.selectedTagIds
                  })
                  if (tagRes.data.code === 200) {
                    this.$message.success('新增成功')
                    this.handleBack()
                  }
                } else {
                  this.$message.success('新增成功')
                  this.handleBack()
                }
              }
            }
          } catch (error) {
            console.error('保存题目失败:', error)
            this.$message.error('保存题目失败')
          } finally {
            this.submitting = false
          }
        }
      })
    },

    // 处理标签选择框显示状态变化
    handleSelectVisible(visible) {
      if (!visible) {
        // 当选择框关闭时，清空搜索结果
        this.tagOptions = []
      }
    },

    // 处理标签变化
    async handleTagChange(values) {
      // 找出新添加的标签（字符串值）
      const newTagValue = values.find(value => typeof value === 'string')
      if (newTagValue) {
        try {
          const res = await addTag(newTagValue)
          if (res.data.code === 200) {
            const newTagId = res.data.data
            // 创建新标签对象
            const newTag = {
              id: newTagId,
              name: newTagValue
            }
            // 更新选中的标签列表，移除临时字符串值并添加新标签
            this.selectedTags = [
              ...values.filter(v => typeof v !== 'string'),
              newTag
            ]
            // 更新标签选项列表
            this.tagOptions = [
              ...this.tagOptions.filter(t => t.id !== newTagId),
              newTag
            ]
            this.$message.success('创建标签成功')
          }
        } catch (error) {
          console.error('创建标签失败:', error)
          this.$message.error('创建标签失败')
          // 移除失败的标签
          this.selectedTags = values.filter(v => typeof v !== 'string')
        }
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
      this.selectedTagIds = this.selectedTagIds.filter(id => id !== tag.id)
    },

    showTagInput() {
      this.tagDialogVisible = true
      this.tagForm.name = ''
    },

    // 添加新标签
    async handleAddTag() {
      this.$refs.tagForm.validate(async (valid) => {
        if (valid) {
          this.addingTag = true
          try {
            const res = await addTag(this.tagForm.name)
            if (res.data.code === 200) {
              this.$message.success('添加标签成功')
              // 刷新标签列表
              await this.remoteSearchTags(this.tagForm.name)
              // 关闭对话框
              this.tagDialogVisible = false
            }
          } catch (error) {
            console.error('添加标签失败:', error)
            this.$message.error('添加标签失败')
          } finally {
            this.addingTag = false
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.add-problem {
  padding: 24px;
  height: 100%;
  background-color: #f5f7fa;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-left h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #1f2f3d;
}

.content-wrapper {
  background-color: #fff;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.form-section {
  margin-bottom: 36px;
  padding: 24px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-color: #e4e7ed;
}

.section-title {
  margin: 0 0 24px;
  color: #1f2f3d;
  font-size: 18px;
  font-weight: 600;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background-color: #409EFF;
  border-radius: 2px;
}

.form-tip {
  margin-top: 6px;
  color: #909399;
  font-size: 13px;
  line-height: 1.5;
}

.tags-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tag-input {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.tag-input :deep(.el-select) {
  width: 100%;
}

.test-cases {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.test-case-item {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.test-case-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.test-case-header {
  margin-bottom: 16px;
  color: #1f2f3d;
  font-weight: 600;
  font-size: 16px;
}

.unit-label {
  margin-left: 10px;
  color: #606266;
  font-size: 14px;
}

.problem-form {
  max-width: 1200px;
  margin: 0 auto;
}

.problem-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.problem-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #1f2f3d;
}

.problem-form :deep(.el-input-group__prepend) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
}

.problem-form :deep(.el-input-number) {
  width: 160px;
}

.problem-form :deep(.el-textarea__inner) {
  font-family: 'Consolas', 'Monaco', monospace;
}

:deep(.el-dialog) {
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

:deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #ebeef5;
}

:deep(.el-select-dropdown__item) {
  padding: 8px 16px;
}

:deep(.el-button) {
  padding: 10px 20px;
  font-weight: 500;
}

:deep(.el-button--primary) {
  background-color: #409EFF;
  border-color: #409EFF;
}

:deep(.el-button--primary:hover) {
  background-color: #66b1ff;
  border-color: #66b1ff;
}
</style> 