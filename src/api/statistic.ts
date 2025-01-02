import { getRequestForm } from '@/utils/request'

// 获取学生在班级中每道题的得分统计
export const getStudentStatistic = (classId: number) => {
  return getRequestForm('/api/student/statistic/dateCreateUser', { classId })
} 