// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app launch
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
        await AsyncStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Login with username + password
  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { token: t, user: u } = res.data;
    await AsyncStorage.setItem('authToken', t);
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return u;
  };

  // Register with username + password
  const register = async (username, password) => {
    const res = await api.post('/auth/register', { username, password });
    const { token: t, user: u } = res.data;
    await AsyncStorage.setItem('authToken', t);
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return u; // includes userId so RegisterScreen can show it
  };

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => setUser((prev) => ({ ...prev, ...updates }));

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);