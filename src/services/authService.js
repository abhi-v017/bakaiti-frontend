// src/services/authService.js
import api from './api';

export const loginApi    = (username, password) => api.post('/auth/login',    { username, password });
export const registerApi = (username, password) => api.post('/auth/register', { username, password });
export const getMeApi    = ()                    => api.get('/auth/me');