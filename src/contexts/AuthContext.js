// src/contexts/AuthContext.js
// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post('/token', formData);
      const { access_token } = response.data;

      // 設置 token 到 api instance
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // 保存到 localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', username);

      // 更新狀態
      setToken(access_token);
      setUser(username);

      // if can't not login , will cause error
      const webResonse = await api.get('/weblogin/');
      console.log(webResonse.data);

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.detail || '登入失敗');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    // 清除 api instance 的 token
    delete api.defaults.headers.common['Authorization'];

    // 清除 localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 清除狀態
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // 檢查 token 是否有效
  const checkAuth = useCallback(async () => {
    try {
      if (!token) return false;

      // 假設有一個驗證 token 的 API endpoint
      await api.get('/verify-token');
      return true;
    } catch (error) {
      logout();
      return false;
    }
  }, [token, logout]);

  // 刷新 token
  const refreshToken = useCallback(async () => {
    try {
      if (!token) return false;

      const response = await api.post('/refresh-token');
      const { access_token } = response.data;

      localStorage.setItem('token', access_token);
      setToken(access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      return true;
    } catch (error) {
      logout();
      return false;
    }
  }, [token, logout]);

  // 更新用戶資料
  const updateUserProfile = useCallback(async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      setUser(response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.detail || '更新資料失敗');
      throw error;
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    checkAuth,
    refreshToken,
    updateUserProfile,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
