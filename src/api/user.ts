import request, { postRequest, getRequest, putRequest, putRequestJson, deleteRequestForm } from '@/utils/request'
// 用户登录
export const login = (data: any) =>
  postRequest('/api/user/login',data)

//获取通行密钥登录凭证
export const getPasskeyVoucher = (identifier: string) => 
  getRequest(`/api/auth/passkey/assertion?identifier=${identifier}`)

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

//获取当前用户通行密钥列表
export const getPasskeyList = () => 
  getRequest(`/api/auth/passkey`)

// 删除通行密钥
export const deletePasskey = (id: string) => {
  return deleteRequestForm('/api/auth/passkey', {
    id: id
  })
}

//获取通行密钥注册凭证
export const getPasskeyRegistration = () => 
  getRequest(`/api/auth/passkey/registration`)

export const passkeyRegistration = (data: any) =>
  postRequest('/api/auth/passkey/registration',data)