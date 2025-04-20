import  { getRequest } from '@/utils/request'
//获取新的chatId
export function createChatId(type: string) {
  return getRequest(`/api/user/ai/creat?type=${type}`);
}