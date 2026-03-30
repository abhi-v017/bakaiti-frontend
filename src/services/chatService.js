// src/services/chatService.js
import api from './api';

// Chats
export const getMyChats   = ()              => api.get('/chats').then((r) => r.data);
export const accessChat   = (userId)        => api.post('/chats', { userId }).then((r) => r.data);
export const createGroup  = (name, members) => api.post('/chats/group', { name, members }).then((r) => r.data);
export const addToGroup   = (chatId, userId)    => api.put(`/chats/group/${chatId}/add`,    { userId }).then((r) => r.data);
export const removeFromGroup = (chatId, userId) => api.put(`/chats/group/${chatId}/remove`, { userId }).then((r) => r.data);
export const renameGroup  = (chatId, name)  => api.put(`/chats/group/${chatId}`, { name }).then((r) => r.data);

// Messages
export const getMessages = (chatId, page = 1, limit = 50) =>
  api.get(`/messages/${chatId}?page=${page}&limit=${limit}`).then((r) => r.data);

export const sendTextMessage = (chatId, content) =>
  api.post('/messages', { chatId, content }).then((r) => r.data);

export const sendMediaMessage = async (chatId, uri, mimeType) => {
  const form = new FormData();
  form.append('chatId', chatId);
  form.append('file', { uri, name: uri.split('/').pop(), type: mimeType });
  const res = await api.post('/messages/media', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const markRead = (messageId) =>
  api.put(`/messages/${messageId}/read`).then((r) => r.data);
