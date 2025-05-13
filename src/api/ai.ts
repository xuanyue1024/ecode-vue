import { getRequest, deleteRequest } from '@/utils/request'

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

// 获取知识库PDF文件URL
export function getKnowledgeBasePdfUrl(classId: string) {
  return `/api/teacher/ai/pdf/file/${classId}`;
}

// 检查知识库PDF文件是否存在 - 通过下载接口判断
export function checkPdfExists(classId: string) {
  return getRequest(`/api/teacher/ai/pdf/file/${classId}`);
}

// 上传PDF文件
export function uploadPdf(classId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  return fetch(`/api/teacher/ai/pdf/upload/${classId}`, {
    method: 'POST',
    body: formData,
    headers: {
      'token': localStorage.getItem('token') || sessionStorage.getItem('token') || ''
    }
  }).then(response => response.json());
}

// 删除PDF文件
export function deletePdf(classId: string) {
  return deleteRequest(`/api/teacher/ai/pdf/delete/${classId}`, null);
}