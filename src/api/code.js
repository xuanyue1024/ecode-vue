import request from '@/utils/request'

// 调试代码
export function debugCode(data) {
  return request({
    url: '/user/code/debug',
    method: 'post',
    data
  })
}

// 提交代码
export function runCode(data) {
  return request({
    url: '/user/code/run',
    method: 'post',
    data
  })
}