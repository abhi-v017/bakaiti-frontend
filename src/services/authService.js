// src/services/authService.js
import api from './api';

export const loginApi    = (email, password)              => api.post('/auth/login',    { email, password });
export const registerApi = (username, email, password)    => api.post('/auth/register', { username, email, password });
export const getMeApi    = ()                              => api.get('/auth/me');
