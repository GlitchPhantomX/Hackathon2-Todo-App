import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import qs from 'qs';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if unauthorized
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        // Redirect to login page in Next.js
        window.location.href = '/login'; // change this to your actual login route
      }
    }
    return Promise.reject(error);
  }
);

// Login function for OAuth2PasswordRequestForm backend
export const loginAPI = async (email: string, password: string) => {
  return api.post(
    '/auth/login',
    qs.stringify({ username: email, password }), // form-urlencoded required by FastAPI OAuth2
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );
};

export default api;
