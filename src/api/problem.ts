import { postRequest, getRequest, deleteRequestForm, putRequest } from '@/utils/request'

// 教师端接口
// 增加题目
export const addProblem = (data: any) =>
  postRequest('/api/teacher/problem', data)

// 修改题目信息
export const updateProblem = (data: any) =>
  putRequest('/api/teacher/problem', data)

// 批量删除题目
export const deleteProblems = (ids: number[]) =>
  deleteRequestForm('/api/teacher/problem', { ids })

// 题目分页查询
export const getProblemPage = (params: any) =>
  getRequest(`/api/teacher/problem/page?pageNo=${params.pageNo}&pageSize=${params.pageSize}&name=${params.name || ''}&isAsc=${params.isAsc || false}&sortBy=${params.sortBy || ''}`)

// 为题目设置标签集合
export const setProblemTags = (data: any) =>
  putRequest('/api/teacher/problem/tag', data)

// 获取题目详细信息(教师)
export const getTeacherProblemDetail = (id: number) =>
  getRequest(`/api/teacher/problem/${id}`)

// 学生端接口
// 获取题目详细信息(学生)
export const getStudentProblemDetail = (id: number) =>
  getRequest(`/api/student/problem/${id}`)

// 调试代码
export const debugCode = (data: any) =>
  postRequest('/api/user/code/debug', data)

// 运行代码(判断题目代码)
export const runCode = (data: any) =>
  postRequest('/api/user/code/run', data) 