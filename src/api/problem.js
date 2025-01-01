import { getRequest, postRequest, putRequest, deleteRequest } from '@/utils/request'

// 获取题目分页列表
export function getProblemPage(params) {
  return getRequest('/api/teacher/problem/page', { params })
}

// 添加题目
export function addProblem(data) {
  return postRequest('/api/teacher/problem', data)
}

// 更新题目
export function updateProblem(data) {
  return putRequest('/api/teacher/problem', data)
}

// 删除题目
export function deleteProblem(id) {
  return deleteRequest(`/api/teacher/problem/${id}`)
}

// 批量删除题目
export function deleteProblems(ids) {
  return deleteRequest('/api/teacher/problem', {
    params: {
      ids: ids.join(',')
    }
  })
}

// 设置题目标签
export function setProblemTags(data) {
  return postRequest('/api/teacher/problem/tags', data)
} 