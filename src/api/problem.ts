import { postRequest, getRequest, deleteRequestForm, putRequest, putRequestJson, deleteRequest } from '@/utils/request'

interface ProblemForm {
  id?: number
  title: string
  grade: 'EASY' | 'GENERAL' | 'DIFFICULT'
  content: string
  require: string
  maxTime: number
  maxMemory: string
  inputTest1: string
  outputTest1: string
  inputTest2: string
  outputTest2: string
  inputTest3: string
  outputTest3: string
  inputTest4: string
  outputTest4: string
}

interface PageParams {
  pageNo: number
  pageSize: number
  name?: string
  isAsc?: boolean
  sortBy?: string
}

interface SetTagsDTO {
  problemId: number
  tagIds: number[]
}

// 教师端接口
// 增加题目
export const addProblem = (data: ProblemForm) =>
  postRequest('/api/teacher/problem', data)

// 修改题目信息
export const updateProblem = (data: ProblemForm) =>
  putRequestJson('/api/teacher/problem', data)

// 批量删除题目
export const deleteProblems = (ids: number[]) =>
  deleteRequestForm('/api/teacher/problem', { ids: ids.join(',') })

// 题目分页查询
export const getProblemPage = (params: PageParams) =>
  getRequest(`/api/teacher/problem/page?pageNo=${params.pageNo}&pageSize=${params.pageSize}&name=${params.name || ''}&isAsc=${params.isAsc || false}&sortBy=${params.sortBy || ''}`)

// 为题目设置标签集合
export const setProblemTags = (data: SetTagsDTO) =>
  putRequestJson('/api/teacher/problem/tag', data)

// 获取题目详细信息(教师)
export const getTeacherProblemDetail = (id: number) =>
  getRequest(`/api/teacher/problem/${id}`)

// 学生端接口
// 获取题目详细信息(学生)
export const getStudentProblemDetail = (id: number) =>
  getRequest(`/api/student/problem/${id}`)

// 调试代码
interface DebugCodeDTO {
  code: string
  input: string
  type: string
}

export const debugCode = (data: DebugCodeDTO) =>
  postRequest('/api/user/code/debug', data)

// 运行代码(判断题目代码)
interface RunCodeDTO {
  classId: number
  classProblemId: number
  code: string
  problemId: number
  type: string
}

export const runCode = (data: RunCodeDTO) =>
  postRequest('/api/user/code/run', data)

// 获取题目详情
export const getProblemDetail = (id: number) => {
  return getRequest(`/api/teacher/problem/${id}`)
} 