import request, { postRequest } from '@/utils/request'
// 用户登录
export const loginByPassword = (data: any) =>
  postRequest('/api/user/login',data)