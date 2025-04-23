import request, { postRequest, getRequest } from '@/utils/request'
// 调试代码
export const debugCode = (data: any) =>
  postRequest('/api/user/code/debug',data)

// 获取代码提交记录
export const getCodeSubmissions = (classId: number, classProblemId: number) =>
  getRequest(`/api/user/code/codeSubmissions/${classId}/${classProblemId}`)
