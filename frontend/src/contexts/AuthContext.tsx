'use client';

import React, { createContext, useReducer, useContext, useEffect, ReactNode } from 'react';
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
  | { type: 'SET_ERROR'; payload: string | null };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
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

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ✅ Check for existing token on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (token) {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          
          // ✅ Fetch current user with token
          const response = await fetch('http://127.0.0.1:8000/api/v1/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const user = await response.json();
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, token },
            });
          } else {
            // Token invalid, clear it
            localStorage.removeItem('token');
            dispatch({ type: 'LOGOUT' });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  // ✅ Login function
  const loginHandler = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });

      // Call backend login API
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

      // ✅ Backend returns { access_token, token_type }
      const token = data.access_token;

      // Save token to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('token_type', data.token_type || 'bearer');

      // ✅ Fetch user info with the new token
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
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      throw error;
    }
  };

  // ✅ Register function
  // ✅ Register function
// ✅ Register function
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
        name: credentials.username,  // ✅ "username" se "name" kar diya
        password: credentials.password,
      }),
    });

    const data = await response.json();
    console.log('🔍 Backend response:', data);

    if (data.detail && Array.isArray(data.detail)) {
      console.log('🔍 Validation errors:', JSON.stringify(data.detail, null, 2));
    }

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
      
      console.error('❌ Registration error details:', errorMsg);
      throw new Error(errorMsg);
    }

    const token = data.access_token;
    const user = data.user || data;

    localStorage.setItem('token', token);
    localStorage.setItem('token_type', data.token_type || 'bearer');

    dispatch({
      type: 'REGISTER_SUCCESS',
      payload: { user, token },
    });
  } catch (error: any) {
    console.error('❌ Full error:', error);
    dispatch({ type: 'REGISTER_FAILURE', payload: error.message });
    throw error;
  }
};
  // ✅ Logout function
  const logoutHandler = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('token_type');
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