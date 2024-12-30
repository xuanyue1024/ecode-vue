import { postRequest, getRequest, deleteRequestForm } from '@/utils/request'

// 模糊查询标签
export const searchTags = (name: string) =>
  getRequest(`/api/teacher/tag?name=${name}`)

// 批量删除标签
export const deleteTags = (ids: number[]) =>
  deleteRequestForm('/api/teacher/tag', { ids })

// 通过id获取标签集合
export const getTagsByIds = (ids: number[]) =>
  getRequest(`/api/teacher/tag/getByIds?ids=${ids.join(',')}`)

// 增加标签
export const addTag = (name: string) =>
  postRequest(`/api/teacher/tag/${name}`, {}) 