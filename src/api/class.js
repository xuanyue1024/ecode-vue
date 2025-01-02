// 获取班级信息
export function getClassInfo(id) {
  return request({
    url: `/teacher/class/info/${id}`,
    method: 'get'
  })
} 