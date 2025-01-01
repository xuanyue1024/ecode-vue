<template>
  <div class="problem-manage">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item>
          <el-input v-model="searchForm.name" placeholder="请输入题目名称" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="primary" @click="handleAdd">新增题目</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 题目列表 -->
    <el-table :data="problemList" v-loading="loading" border>
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

    <!-- 新增/编辑题目对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px">
      <el-form :model="form" ref="form" label-width="100px">
        <el-form-item label="题目标题" prop="title">
          <el-input v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item label="难度" prop="grade">
          <el-select v-model="form.grade" placeholder="请选择难度">
            <el-option label="简单" value="EASY"></el-option>
            <el-option label="中等" value="GENERAL"></el-option>
            <el-option label="困难" value="DIFFICULT"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <div style="margin-bottom: 10px">
            <el-tag
              :key="tag.id"
              v-for="tag in selectedTags"
              closable
              :disable-transitions="false"
              @close="handleRemoveTag(tag)">
              {{tag.name}}
            </el-tag>
            <el-input
              class="input-new-tag"
              v-if="inputVisible"
              v-model="inputValue"
              ref="saveTagInput"
              size="small"
              @keyup.enter.native="handleInputConfirm"
              @blur="handleInputConfirm">
            </el-input>
            <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 添加标签</el-button>
          </div>
          <el-select
            v-model="selectedTagIds"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请输入标签名称搜索"
            :remote-method="remoteSearchTags"
            :loading="tagsLoading">
            <el-option
              v-for="item in tagOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="题目内容" prop="content">
          <el-input type="textarea" v-model="form.content" :rows="5"></el-input>
        </el-form-item>
        <el-form-item label="题目要求" prop="require">
          <el-input type="textarea" v-model="form.require" :rows="3"></el-input>
        </el-form-item>
        <el-form-item label="测试用例">
          <div v-for="(item, index) in 4" :key="index">
            <div style="margin-bottom: 10px">
              <el-input v-model="form['inputTest' + item]" placeholder="输入" style="width: 45%; margin-right: 10px">
                <template slot="prepend">测试输入{{item}}</template>
              </el-input>
              <el-input v-model="form['outputTest' + item]" placeholder="输出" style="width: 45%">
                <template slot="prepend">测试输出{{item}}</template>
              </el-input>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="运行限制">
          <el-input-number v-model="form.maxTime" :min="1" :max="60" label="最大运行时间(秒)"></el-input-number>
          <el-input-number v-model="form.maxMemory" :min="64" :max="1024" label="最大内存(MB)" style="margin-left: 20px"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getProblemPage, addProblem, updateProblem, deleteProblems, setProblemTags } from '@/api/problem'
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
      
      // 对话框
      dialogVisible: false,
      dialogTitle: '新增题目',
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
      inputValue: ''
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
      this.dialogTitle = '新增题目'
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
      this.dialogVisible = true
    },
    
    // 编辑题目
    async handleEdit(row) {
      this.dialogTitle = '编辑题目'
      this.form = { ...row }
      if (row.tagIds && row.tagIds.length > 0) {
        const res = await getTagsByIds(row.tagIds)
        if (res.data.code === 200) {
          this.selectedTags = res.data.data
          this.selectedTagIds = row.tagIds
        }
      }
      this.dialogVisible = true
    },
    
    // 删除题目
    handleDelete(row) {
      this.$confirm('确认删除该题目吗？', '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteProblems([row.id])
          if (res.data.code === 200) {
            this.$message.success('删除成功')
            this.getProblemList()
          }
        } catch (error) {
          console.error('删除题目失败:', error)
          this.$message.error('删除题目失败')
        }
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
              this.dialogVisible = false
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
              this.dialogVisible = false
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
    }
  }
}
</script>

<style scoped>
.problem-manage {
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
</style> 