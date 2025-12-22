import axios, { AxiosInstance, AxiosResponse } from 'axios';
import qs from 'qs';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get token from cookie or localStorage
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try cookie first
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='));
  
  if (cookie) {
    return cookie.split('=')[1];
  }
  
  // Fallback to localStorage
  return localStorage.getItem('token');
};

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if unauthorized
      localStorage.removeItem('token');
      if (typeof document !== 'undefined') {
        document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
      }
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Login function for OAuth2PasswordRequestForm backend
export const loginAPI = async (email: string, password: string) => {
  return api.post(
    '/auth/login',
    qs.stringify({ username: email, password }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );
};

// Task service functions
export const taskService = {
  getTasks: async (userId: string) => {
    try {
      console.log('🔄 Fetching tasks for user:', userId);
      const response = await api.get(`/users/${userId}/tasks`);
      console.log('📦 Tasks API raw response:', response);
      console.log('📦 Tasks API response.data:', response.data);
      
      // ✅ Extract data from axios response and ensure it's an array
      const tasks = response.data;
      return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      return []; // Return empty array on error
    }
  },

  getTask: async (userId: string, taskId: string) => {
    const response = await api.get(`/users/${userId}/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (userId: string, data: any) => {
    const response = await api.post(`/users/${userId}/tasks`, data);
    return response.data;
  },

  updateTask: async (userId: string, taskId: string, data: any) => {
    const response = await api.put(`/users/${userId}/tasks/${taskId}`, data);
    return response.data;
  },

  deleteTask: async (userId: string, taskId: string) => {
    const response = await api.delete(`/users/${userId}/tasks/${taskId}`);
    return response.data;
  },

  toggleComplete: async (userId: string, taskId: string) => {
    const response = await api.patch(`/users/${userId}/tasks/${taskId}/complete`);
    return response.data;
  }
};

export default api;