'use client';

import React, { createContext, useReducer, useContext, useEffect, ReactNode, useRef } from 'react';
import { AuthState, AuthContextType, LoginCredentials, RegisterCredentials } from '@/types/auth.types';

// Define action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: any; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: any; token: string } }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESTORE_SESSION'; payload: { user: any; token: string } }; // 🆕 Added

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // 🆕 Start with true to avoid flash
};

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
    case 'RESTORE_SESSION': // 🆕 Added
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

// 🆕 Helper function to set cookie
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

// 🆕 Helper function to get cookie
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// 🆕 Helper function to delete cookie
const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const isCheckingAuth = useRef(false); // 🆕 Prevent multiple auth checks
  const hasCheckedAuth = useRef(false); // 🆕 Track if we've checked once

  // ✅ Check for existing token on mount ONLY ONCE
  useEffect(() => {
    // 🆕 Skip if already checking or already checked
    if (isCheckingAuth.current || hasCheckedAuth.current) return;

    const checkAuthStatus = async () => {
      isCheckingAuth.current = true;

      try {
        // Check BOTH localStorage AND cookies
        const localToken = localStorage.getItem('token');
        const cookieToken = getCookie('token');
        const token = localToken || cookieToken;
        
        console.log('🔍 Auth Check - Token found:', !!token); // Debug log

        if (token) {
          // Fetch current user with token
          const response = await fetch('http://127.0.0.1:8000/api/v1/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          console.log('🔍 Auth /me response status:', response.status); // Debug log

          if (response.ok) {
            const user = await response.json();
            console.log('✅ Auth restored successfully'); // Debug log
            
            dispatch({
              type: 'RESTORE_SESSION', // 🆕 Use different action
              payload: { user, token },
            });
          } else {
            console.warn('⚠️ Token invalid, clearing auth'); // Debug log
            // Token invalid, clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('token_type');
            deleteCookie('token');
            dispatch({ type: 'LOGOUT' });
          }
        } else {
          console.log('ℹ️ No token found'); // Debug log
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('token_type');
        deleteCookie('token');
        dispatch({ type: 'LOGOUT' });
      } finally {
        isCheckingAuth.current = false;
        hasCheckedAuth.current = true; // 🆕 Mark as checked
      }
    };

    checkAuthStatus();
  }, []); // 🆕 Empty dependency array - run ONLY once

  // ✅ Login function
  const loginHandler = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });

      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      const token = data.access_token;

      console.log('✅ Login successful, saving token'); // Debug log

      // Save token to BOTH localStorage AND cookie
      localStorage.setItem('token', token);
      localStorage.setItem('token_type', data.token_type || 'bearer');
      setCookie('token', token, 7);

      // Fetch user info
      const userResponse = await fetch('http://127.0.0.1:8000/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const user = await userResponse.json();

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      console.log('✅ Login complete, user data loaded'); // Debug log
    } catch (error: any) {
      console.error('❌ Login error:', error); // Debug log
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      throw error;
    }
  };

  // ✅ Register function
  const registerHandler = async (credentials: RegisterCredentials) => {
    try {
      dispatch({ type: 'REGISTER_START' });

      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          name: credentials.username,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = 'Registration failed';
        
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            errorMsg = data.detail.map((err: any) => 
              `${err.loc ? err.loc.join('.') : ''}: ${err.msg}`
            ).join(', ');
          } else if (typeof data.detail === 'string') {
            errorMsg = data.detail;
          }
        }
        
        throw new Error(errorMsg);
      }

      const token = data.access_token;
      const user = data.user || data;

      // Save token to BOTH localStorage AND cookie
      localStorage.setItem('token', token);
      localStorage.setItem('token_type', data.token_type || 'bearer');
      setCookie('token', token, 7);

      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: { user, token },
      });
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      dispatch({ type: 'REGISTER_FAILURE', payload: error.message });
      throw error;
    }
  };

  // ✅ Logout function
  const logoutHandler = async () => {
    console.log('🚪 Logging out...'); // Debug log
    try {
      // Clear BOTH localStorage AND cookie
      localStorage.removeItem('token');
      localStorage.removeItem('token_type');
      deleteCookie('token');
      hasCheckedAuth.current = false; // 🆕 Reset check flag
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const contextValue: AuthContextType = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login: loginHandler,
    register: registerHandler,
    logout: logoutHandler,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};