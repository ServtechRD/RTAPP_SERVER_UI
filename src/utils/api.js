import axios from 'axios';
import { BASE_URL } from './config';
//const BASE_URL = 'http://192.168.1.234:37200';

const api = axios.create({
  baseURL: BASE_URL, // 替換成你的 API URL
});

// 添加請求攔截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response 攔截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 處理未授權的情況
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { BASE_URL };
export default api;
