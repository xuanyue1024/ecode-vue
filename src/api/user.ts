import request, { postRequest, getRequest, putRequest, putRequestJson } from '@/utils/request'
// 用户登录
export const loginByPassword = (data: any) =>
  postRequest('/api/user/login',data)

//用户注册
export const registerByEmail = (data: any) =>
  postRequest('/api/user/register', data)

//获取邮箱验证码
export const getEmailCode = (email: string) =>
  getRequest(`/api/open/captcha/getCaptcha?email=${email}`)

// 获取用户详细信息
export const getUserInfo = () => getRequest('/api/user')

// 修改用户信息
interface UserUpdateDTO {
  address?: string
  birthDate?: string
  email?: string
  name?: string
  password?: string
  profilePicture?: string
  sex?: 'MALE' | 'FEMALE'
  username?: string
}

export const updateUserInfo = (data: UserUpdateDTO) => putRequestJson('/api/user', data)

// 上传文件
export const uploadFile = (formData: FormData) => {
  return fetch('/api/open/upload', {
    method: 'POST',
    body: formData
  }).then(response => response.json())
}