import axios from 'axios';
import { getToken, clearToken } from './token';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  // ✅ FIX: 15s was too tight for a cold-starting free-tier backend
  // (Render/Railway free plans sleep after ~15 min idle and can take
  // 30-60s to wake up) — every request during a cold start was hitting
  // this ceiling and showing "timeout of 15000ms exceeded" in red,
  // even though the backend eventually finished the request fine.
  timeout: 40000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // ✅ FIX: Skip JSON unwrapping for blob responses (PDF download)
    // Without this, the interceptor corrupts binary PDF data
    if (response.config?.responseType === 'blob') {
      return response.data;
    }
    const res = response.data;
    if (res && typeof res === 'object' && 'success' in res) {
      return res.data !== undefined ? res.data : res;
    }
    return res;
  },
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message || error.message || 'An error occurred';
    if (status === 401) {
      clearToken();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject({ message, status, data: error.response?.data });
  }
);

export default api;