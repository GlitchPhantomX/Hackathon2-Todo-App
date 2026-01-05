import api from "./api";
import { LoginCredentials, RegisterCredentials, AuthResponse } from "@/types/auth.types";

// Helper function to set cookie (same as in AuthContext)
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString};path=/;SameSite=Lax`;
};

// Helper function to get cookie (same as in AuthContext)
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    if (c && typeof c === 'string') {
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
};

// Helper function to delete cookie (same as in AuthContext)
const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const register = async (credentials: RegisterCredentials) => {
  try {
    const res = await api.post("/auth/register", credentials);

    // Store token in both localStorage and cookie (consistent with AuthContext)
    const token = res.data.access_token;
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('token_type', res.data.token_type || 'bearer');
      setCookie('token', token, 7);
    }

    return res.data;
  } catch (e: any) {
    throw new Error(e.response?.data?.detail || "Registration failed");
  }
};

// LOGIN — FIXED COMPLETELY
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const form = new URLSearchParams();
    form.append("username", credentials.email);
    form.append("password", credentials.password);

    const res = await api.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const { access_token, refresh_token } = res.data;
    if (!access_token) throw new Error("Token missing from response");

    // Store tokens in both localStorage and cookie (consistent with AuthContext)
    localStorage.setItem('token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('token_type', res.data.token_type || 'bearer');
    setCookie('token', access_token, 0.5); // 30 minutes (0.5 * 24 hours)
    setCookie('refresh_token', refresh_token, 7); // 7 days

    // now fetch user
    const userRes = await api.get("/auth/me");

    // Store user in localStorage (consistent with AuthContext pattern)
    localStorage.setItem('user', JSON.stringify(userRes.data));

    return { token: access_token, user: userRes.data };
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || "Login failed");
  }
};

export const getCurrentUser = async () => {
  // First try to get from localStorage
  const token = localStorage.getItem('token');
  if (!token) throw new Error("No auth token");

  // Try to get cached user from localStorage
  const cachedUserStr = localStorage.getItem('user');
  if (cachedUserStr) {
    try {
      const cachedUser = JSON.parse(cachedUserStr);
      return cachedUser;
    } catch (e) {
      console.error('Error parsing cached user:', e);
    }
  }

  const res = await api.get("/auth/me");
  // Cache user in localStorage
  localStorage.setItem('user', JSON.stringify(res.data));
  return res.data;
};

export const logout = async () => {
  // Clear both localStorage and cookies (consistent with AuthContext)
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_type');
  localStorage.removeItem('user');
  deleteCookie('token');
  deleteCookie('refresh_token');
  deleteCookie('user');
};
