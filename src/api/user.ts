import request, { postRequest, getRequest } from '@/utils/request'
// 用户登录
export const loginByPassword = (data: any) =>
  postRequest('/api/user/login',data)

//用户注册
export const registerByEmail = (data: any) =>
  postRequest('/api/user/register', data)

//获取邮箱验证码
export const getEmailCode = (email: string) =>
  getRequest(`/api/open/captcha/getCaptcha?email=${email}`)