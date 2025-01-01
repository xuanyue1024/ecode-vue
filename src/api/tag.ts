import { getRequest, postRequest } from '@/utils/request'

// 搜索标签
export const searchTags = (name: string) =>
  getRequest(`/api/teacher/tag?name=${name}`)

// 添加标签
export const addTag = (name: string) =>
  postRequest(`/api/teacher/tag/${name}`, {})

// 根据id集合获取标签
export const getTagsByIds = (ids: number[]) =>
  getRequest(`/api/teacher/tag/getByIds?ids=${ids.join(',')}`) 