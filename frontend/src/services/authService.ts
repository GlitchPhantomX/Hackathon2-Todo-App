import api from "./api";
import { setToken, setUser, getToken, getUser, clearAuth } from "@/utils/cookies";
import { LoginCredentials, RegisterCredentials, AuthResponse } from "@/types/auth.types";

export const register = async (credentials: RegisterCredentials) => {
  try {
    const res = await api.post("/auth/register", credentials);
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

    const { access_token } = res.data;
    if (!access_token) throw new Error("Token missing from response");

    // save token
    setToken(access_token);

    // now fetch user
    const userRes = await api.get("/auth/me");
    setUser(userRes.data);

    return { token: access_token, user: userRes.data };
  } catch (err: any) {
    throw new Error(err.response?.data?.detail || "Login failed");
  }
};

export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  const cached = getUser();
  if (cached) return cached;

  const res = await api.get("/auth/me");
  setUser(res.data);
  return res.data;
};

export const logout = async () => {
  clearAuth();
};
