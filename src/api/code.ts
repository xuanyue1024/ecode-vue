import request, { postRequest, getRequest } from '@/utils/request'
// 调试代码
export const debugCode = (data: any) =>
  postRequest('/api/code/run',data)
