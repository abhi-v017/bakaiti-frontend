// src/services/authService.js
import api from './api';

export const sendOtpApi         = (email)              => api.post('/auth/send-otp', { email });
export const getAccountsApi     = (email)              => api.post('/auth/accounts', { email });
export const registerApi        = (data)               => api.post('/auth/register', data);
export const loginApi           = (accountId, password)=> api.post('/auth/login', { accountId, password });
export const getMeApi           = ()                   => api.get('/auth/me');