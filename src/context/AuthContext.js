// src/context/AuthContext.js — JWT auth state, persisted via AsyncStorage
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true); // true until session restored

  // ── Restore session on app launch ─────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('authToken');
        if (saved) {
          api.defaults.headers.common['Authorization'] = `Bearer ${saved}`;
          const res = await api.get('/auth/me');
          setToken(saved);
          setUser(res.data);
        }
      } catch {
        // Token expired or invalid — clear it
        await AsyncStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Login ─────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: t, user: u } = res.data;
    await AsyncStorage.setItem('authToken', t);
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return u;
  };

  // ── Register ──────────────────────────────────────────────────
  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    const { token: t, user: u } = res.data;
    await AsyncStorage.setItem('authToken', t);
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return u;
  };

  // ── Logout ────────────────────────────────────────────────────
  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  // ── Patch user locally (after profile update) ─────────────────
  const updateUser = (updates) => setUser((prev) => ({ ...prev, ...updates }));

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
