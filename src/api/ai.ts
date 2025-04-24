import  { getRequest, deleteRequest } from '@/utils/request'

//获取新的chatId
export function createChatId(type: string) {
  return getRequest(`/api/user/ai/creat?type=${type}`);
}

// 获取会话列表
export function getChatHistory(type: string) {
  return getRequest(`/api/user/ai/history/${type}`);
}

// 获取单个会话历史记录
export function getChatMessages(type: string, chatId: string) {
  return getRequest(`/api/user/ai/history/${type}/${chatId}`);
}

// 删除会话
export function deleteChatHistory(type: string, chatId: string) {
  return deleteRequest(`/api/user/ai/history/${type}/${chatId}`, null);
}