# Constitution 3: Frontend UI & Pages

## Project Context
Phase II of Hackathon Todo App - Building modern, responsive frontend interface using **Next.js 16+** with **TypeScript** and **App Router**, integrating with FastAPI backend, implementing authentication flow with middleware, and creating intuitive task management UI with server-side rendering capabilities.

---

## Mission Statement
Develop a modern, user-friendly web interface using **Next.js 16**, **TypeScript**, and **Tailwind CSS** that provides seamless user authentication, intuitive task management, responsive design with proper state management, API integration, and server-side rendering for optimal performance and SEO.

---

## Core Objectives

### Primary Goals
1. Set up Next.js 16+ project with TypeScript and App Router
2. Implement authentication UI (Login, Register, Protected Routes with Middleware)
3. Create task management interface (List, Create, Edit, Delete)
4. Integrate with FastAPI backend using Axios
5. Implement global state management (Context API with "use client")
6. Add responsive design with Tailwind CSS
7. Handle loading states and error messages
8. Implement form validation and user feedback
9. Configure middleware for route protection

### Success Criteria
- ✅ Next.js app runs without errors
- ✅ User can register with email/password
- ✅ User can login and stay authenticated
- ✅ Protected routes redirect to login via middleware
- ✅ User can create new tasks
- ✅ User can view all their tasks
- ✅ User can mark tasks as complete/incomplete
- ✅ User can edit task details
- ✅ User can delete tasks
- ✅ UI is responsive on mobile, tablet, and desktop
- ✅ Loading states are shown during API calls
- ✅ Error messages are displayed clearly
- ✅ JWT token is stored in cookies securely
- ✅ Server components used where appropriate
- ✅ Client components properly marked with "use client"

---

## Technical Requirements

### Frontend Stack
- **Framework:** Next.js 16.0+ with TypeScript 5.0+
- **Build Tool:** Turbopack (built into Next.js 16)
- **Styling:** Tailwind CSS 3.4+ (utility-first CSS)
- **HTTP Client:** Axios 1.6+ (API requests with interceptors)
- **State Management:** React Context API + useReducer (with "use client")
- **Routing:** Next.js App Router (file-based routing)
- **Form Handling:** React Hook Form 7.49+ (validation)
- **Icons:** Lucide React or Heroicons (modern icon sets)
- **Date Formatting:** date-fns or Day.js (lightweight)
- **Cookies:** js-cookie (client-side) or Next.js cookies (server-side)

### Development Tools
- **Linting:** ESLint with Next.js rules
- **Formatting:** Prettier
- **Testing:** Jest + React Testing Library (optional but recommended)
- **Type Checking:** TypeScript strict mode

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Application Architecture

### Page Structure (Next.js App Router)
```
/                          # Home/Landing page (app/page.tsx)
/login                     # Login page (app/login/page.tsx)
/register                  # Register page (app/register/page.tsx)
/dashboard                 # Main dashboard (app/dashboard/page.tsx) - Protected
/tasks                     # Task list view (app/tasks/page.tsx) - Protected
/tasks/create              # Create new task (app/tasks/create/page.tsx) - Protected
/tasks/[id]/edit           # Edit task (app/tasks/[id]/edit/page.tsx) - Protected
/profile                   # User profile (app/profile/page.tsx) - Protected
```

### Component Hierarchy
```
RootLayout (app/layout.tsx)
├── AuthProvider (Context with "use client")
│   ├── Public Pages
│   │   ├── Home (/)
│   │   ├── Login (/login)
│   │   └── Register (/register)
│   └── Protected Pages (middleware.ts guards)
│       ├── MainLayout (components/layout)
│       │   ├── Dashboard (/dashboard)
│       │   ├── TaskList (/tasks)
│       │   ├── TaskCreate (/tasks/create)
│       │   ├── TaskEdit (/tasks/[id]/edit)
│       │   └── Profile (/profile)
```

### State Management Strategy
```typescript
// Authentication State (Context API with "use client")
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Task State (Context API or Component State)
interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}
```

### Server vs Client Components

**Server Components (default in Next.js):**
- Pages that don't need interactivity
- Data fetching from backend
- SEO-critical pages
- Static content

**Client Components (with "use client"):**
- Forms and inputs
- Event handlers (onClick, onChange)
- Context providers
- useState, useEffect, etc.
- Browser APIs (localStorage, cookies)

---

## File Structure & Organization

```
hackathon2-todo-app/
├── frontend/                          # Next.js 16+ frontend
│   ├── public/
│   │   ├── favicon.ico                # Site favicon
│   │   └── images/                    # Static images
│   │
│   ├── src/
│   │   ├── app/                       # ⭐ Next.js App Router (file-based routing)
│   │   │   ├── layout.tsx             # ⭐ Root layout (wraps all pages)
│   │   │   ├── page.tsx               # ⭐ Home page (/)
│   │   │   ├── globals.css            # ⭐ Global styles with Tailwind
│   │   │   │
│   │   │   ├── login/
│   │   │   │   └── page.tsx           # ⭐ Login page (/login)
│   │   │   │
│   │   │   ├── register/
│   │   │   │   └── page.tsx           # ⭐ Register page (/register)
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── layout.tsx         # ⭐ Dashboard layout (with nav)
│   │   │   │   └── page.tsx           # ⭐ Dashboard page (/dashboard)
│   │   │   │
│   │   │   ├── tasks/
│   │   │   │   ├── layout.tsx         # ⭐ Tasks layout
│   │   │   │   ├── page.tsx           # ⭐ Task list (/tasks)
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx       # ⭐ Create task (/tasks/create)
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx   # ⭐ Edit task (/tasks/[id]/edit)
│   │   │   │
│   │   │   ├── profile/
│   │   │   │   └── page.tsx           # ⭐ User profile (/profile)
│   │   │   │
│   │   │   └── not-found.tsx          # ⭐ 404 page
│   │   │
│   │   ├── components/                # Reusable UI components
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx         # ⭐ Top navigation bar (client)
│   │   │   │   ├── Sidebar.tsx        # ⭐ Side navigation (client)
│   │   │   │   └── MainLayout.tsx     # ⭐ Main layout wrapper (client)
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx      # ⭐ Login form (client)
│   │   │   │   └── RegisterForm.tsx   # ⭐ Register form (client)
│   │   │   │
│   │   │   ├── tasks/
│   │   │   │   ├── TaskList.tsx       # ⭐ Task list display (client)
│   │   │   │   ├── TaskItem.tsx       # ⭐ Single task card (client)
│   │   │   │   ├── TaskForm.tsx       # ⭐ Create/Edit form (client)
│   │   │   │   └── TaskFilter.tsx     # ⭐ Filter tasks (client)
│   │   │   │
│   │   │   └── ui/                    # Generic UI components
│   │   │       ├── Button.tsx         # ⭐ Reusable button (client)
│   │   │       ├── Input.tsx          # ⭐ Form input (client)
│   │   │       ├── Card.tsx           # ⭐ Card container
│   │   │       ├── Modal.tsx          # ⭐ Modal dialog (client)
│   │   │       ├── Alert.tsx          # ⭐ Alert/notification (client)
│   │   │       └── Spinner.tsx        # ⭐ Loading spinner
│   │   │
│   │   ├── contexts/                  # React Context providers
│   │   │   ├── AuthContext.tsx        # ⭐ Authentication context ("use client")
│   │   │   └── TaskContext.tsx        # ⭐ Task management context ("use client")
│   │   │
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useAuth.ts             # ⭐ Authentication hook
│   │   │   ├── useTasks.ts            # ⭐ Task operations hook
│   │   │   └── useApi.ts              # ⭐ Generic API hook
│   │   │
│   │   ├── services/                  # API service layer
│   │   │   ├── api.ts                 # ⭐ Axios instance configuration
│   │   │   ├── authService.ts         # ⭐ Auth API calls
│   │   │   └── taskService.ts         # ⭐ Task API calls
│   │   │
│   │   ├── types/                     # TypeScript type definitions
│   │   │   ├── auth.types.ts          # ⭐ Auth-related types
│   │   │   ├── task.types.ts          # ⭐ Task-related types
│   │   │   └── api.types.ts           # ⭐ API response types
│   │   │
│   │   └── utils/                     # Utility functions
│   │       ├── cookies.ts             # ⭐ Cookie helpers (client/server)
│   │       ├── validation.ts          # ⭐ Form validation helpers
│   │       └── formatters.ts          # ⭐ Date/text formatters
│   │
│   ├── middleware.ts                  # ⭐ Next.js middleware (route protection)
│   ├── next.config.js                 # ⭐ Next.js configuration
│   ├── .env.example                   # Environment variables template
│   ├── .env.local                     # Local environment (gitignored)
│   ├── .eslintrc.json                 # ESLint configuration
│   ├── .gitignore                     # Git ignore rules
│   ├── package.json                   # NPM dependencies
│   ├── postcss.config.js              # PostCSS configuration
│   ├── tailwind.config.ts             # Tailwind configuration
│   ├── tsconfig.json                  # TypeScript configuration
│   └── README.md                      # Frontend documentation
│
└── specs/phase2-fullstack-web/03-frontend-ui-pages/
    ├── constitution.md                # This document
    ├── specs.md                       # Detailed technical specifications
    ├── clarify.md                     # Questions and clarifications
    ├── plan.md                        # Step-by-step implementation plan
    ├── tasks.md                       # Actionable task checklist
    ├── research.md                    # Research notes and references
    └── implementation-notes.md        # Post-implementation learnings
```

**Key Differences from React + Vite:**
- ❌ No `main.tsx`, `App.tsx`, `index.html` - Next.js handles this
- ❌ No `vite.config.ts` - Replaced with `next.config.js`
- ✅ `app/` directory for routing (file-based)
- ✅ `middleware.ts` for route protection
- ✅ `layout.tsx` files for nested layouts
- ✅ `page.tsx` files for actual pages
- ✅ Server and Client components distinction

---

## Type Definitions

### Authentication Types
```typescript
// src/types/auth.types.ts

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
```

### Task Types
```typescript
// src/types/task.types.ts

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}

export interface TaskContextType extends TaskState {
  fetchTasks: () => Promise<void>;
  createTask: (data: TaskCreate) => Promise<void>;
  updateTask: (id: number, data: TaskUpdate) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  clearError: () => void;
}
```

---

## API Integration

### Axios Configuration (Next.js Compatible)
```typescript
// src/services/api.ts

import axios from 'axios';
import Cookies from 'js-cookie'; // Client-side cookie handling

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token from cookies
api.interceptors.request.use(
  (config) => {
    // Get token from cookie (client-side)
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      Cookies.remove('token');
      Cookies.remove('user');

      // Redirect to login (Next.js way)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Auth Service (Same as React version)
```typescript
// src/services/authService.ts

import api from './api';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth.types';

export const authService = {
  // Register new user
  register: async (credentials: RegisterCredentials): Promise<User> => {
    const response = await api.post<User>('/auth/register', credentials);
    return response.data;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await api.post<AuthResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};
```

### Task Service (Same as React version)
```typescript
// src/services/taskService.ts

import api from './api';
import { Task, TaskCreate, TaskUpdate } from '../types/task.types';

export const taskService = {
  // Get all tasks
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get<Task[]>('/tasks');
    return response.data;
  },

  // Get single task
  getTask: async (id: number): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  // Create task
  createTask: async (data: TaskCreate): Promise<Task> => {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  // Update task
  updateTask: async (id: number, data: TaskUpdate): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  // Delete task
  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};
```

---

## Authentication Context (Next.js with "use client")

```typescript
// src/contexts/AuthContext.tsx
'use client'; // ⭐ Required for Next.js client components

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authService } from '../services/authService';
import {
  AuthState,
  AuthContextType,
  LoginCredentials,
  RegisterCredentials,
  User
} from '../types/auth.types';

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
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
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('token'); // Use cookies instead of localStorage
      if (token) {
        try {
          const user = await authService.getCurrentUser();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token }
          });
        } catch (error) {
          Cookies.remove('token');
          Cookies.remove('user');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const { access_token } = await authService.login(credentials);

      // Store token in cookie (7 days expiry)
      Cookies.set('token', access_token, { expires: 7, sameSite: 'lax' });

      const user = await authService.getCurrentUser();
      Cookies.set('user', JSON.stringify(user), { expires: 7, sameSite: 'lax' });

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token: access_token }
      });
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  };

  // Register function
  const register = async (credentials: RegisterCredentials) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await authService.register(credentials);
      // Auto-login after registration
      await login({
        email: credentials.email,
        password: credentials.password
      });
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## Next.js Middleware for Route Protection

```typescript
// middleware.ts (root level - not in src/)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = ['/dashboard', '/tasks', '/profile'];
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname); // Save intended destination
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if accessing auth routes with valid token
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**Key Features:**
- ✅ Automatic redirect to `/login` for unauthenticated users
- ✅ Automatic redirect to `/dashboard` for authenticated users on login page
- ✅ Saves intended destination for post-login redirect
- ✅ Cookie-based token verification
- ✅ Runs on every request (server-side)

---

## UI Component Examples

### Login Form Component (with "use client")
```typescript
// src/components/auth/LoginForm.tsx
'use client'; // ⭐ Required for interactive components

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ⭐ Next.js navigation
import { useAuth } from '@/contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ email, password });
      router.push('/dashboard'); // ⭐ Next.js navigation
    } catch (error) {
      // Error is handled by context
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      <Input
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
      />

      <Input
        type="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />

      <Button
        type="submit"
        fullWidth
        loading={isLoading}
      >
        Login
      </Button>
    </form>
  );
};

export default LoginForm;
```

### Task Item Component (with "use client")
```typescript
// src/components/tasks/TaskItem.tsx
'use client';

import { useState } from 'react';
import { Task } from '@/types/task.types';
import { CheckCircle, Circle, Pencil, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

interface TaskItemProps {
  task: Task;
  onToggle: (id: number, completed: boolean) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      await onDelete(task.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task.id, !task.completed)}
          className="mt-1 text-gray-400 hover:text-blue-600 transition-colors"
        >
          {task.completed ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1">
          <h3 className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {new Date(task.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(task.id)}
          >
            <Pencil className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            loading={isDeleting}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
```

---

## Routing Configuration (Next.js App Router)

### Root Layout
```typescript
// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Todo App - Task Management',
  description: 'Modern task management application built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Home Page
```typescript
// src/app/page.tsx

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Todo App
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Manage your tasks efficiently
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">Login</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">Register</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Login Page
```typescript
// src/app/login/page.tsx

import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Sign in to your account
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### Dashboard Layout (Protected)
```typescript
// src/app/dashboard/layout.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Spinner from '@/components/ui/Spinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Tasks Page (Dynamic Route)
```typescript
// src/app/tasks/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { taskService } from '@/services/taskService';
import { Task } from '@/types/task.types';
import TaskList from '@/components/tasks/TaskList';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <Link href="/tasks/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <TaskList
          tasks={tasks}
          onTaskUpdate={fetchTasks}
        />
      )}
    </div>
  );
}
```

### Edit Task Page (Dynamic Route with Params)
```typescript
// src/app/tasks/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { taskService } from '@/services/taskService';
import { Task } from '@/types/task.types';
import TaskForm from '@/components/tasks/TaskForm';
import Spinner from '@/components/ui/Spinner';

export default function EditTaskPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTask();
  }, [params.id]);

  const fetchTask = async () => {
    try {
      const data = await taskService.getTask(Number(params.id));
      setTask(data);
    } catch (error) {
      console.error('Failed to fetch task:', error);
      router.push('/tasks');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!task) {
    return <div>Task not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Task</h1>
      <TaskForm
        task={task}
        onSuccess={() => router.push('/tasks')}
      />
    </div>
  );
}
```

---

## Styling with Tailwind CSS

### Tailwind Configuration (Next.js)
```typescript
// tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### Global Styles
```css
/* src/app/globals.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }

  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
  }

  .input {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500;
  }

  .card {
    @apply bg-white rounded-lg shadow-sm p-6;
  }
}
```

---

## Environment Configuration

### Environment Variables (.env.example)
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# App Configuration
NEXT_PUBLIC_APP_NAME=Todo App
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Next.js Configuration
```javascript
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'], // Add your image domains here
  },
  // Enable if using standalone deployment
  output: 'standalone',
}

module.exports = nextConfig;
```

---

## Implementation Scope (This Iteration)

### In Scope ✅
- Set up Next.js 16+ project with TypeScript and App Router
- Install dependencies (Axios, Tailwind, js-cookie)
- Create authentication UI (Login, Register)
- Implement middleware for route protection
- Create task management UI (List, Create, Edit, Delete)
- Implement API integration with backend
- Add global state management (Auth Context with "use client")
- Style with Tailwind CSS
- Handle loading and error states
- Implement form validation
- Add responsive design
- Create reusable UI components
- Configure file-based routing
- Set up server and client components

### Out of Scope ❌
- Advanced animations (Framer Motion) - future enhancement
- Dark mode toggle - future enhancement
- Internationalization (i18n) - future enhancement
- Progressive Web App (PWA) - future enhancement
- Advanced filtering/sorting UI - future enhancement
- Drag-and-drop task reordering - future enhancement
- Real-time updates (WebSockets) - future enhancement
- Server-side data fetching (for now, all client-side)
- Deployment configuration (Constitution 4)

---

## Dependencies & Prerequisites

### Required Accounts
- ✅ Node.js 18+ installed
- ✅ npm or yarn or pnpm package manager
- ✅ Backend API running (Constitution 2)

### Required Tools
- ✅ VS Code or preferred IDE
- ✅ React DevTools (browser extension)
- ✅ Git for version control

### NPM Packages to Install
```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.2",
    "js-cookie": "^3.0.5",
    "lucide-react": "^0.294.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@types/js-cookie": "^3.0.6",
    "typescript": "^5.2.2",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-config-next": "^16.0.0"
  }
}
```

---

## Testing Strategy

### Component Testing
- ✅ Login form validates input
- ✅ Register form validates input
- ✅ Protected route redirects when not authenticated
- ✅ Task list renders correctly
- ✅ Task creation form submits correctly
- ✅ Task deletion confirms before deleting

### Integration Testing
- ✅ User can complete full registration flow
- ✅ User can complete full login flow
- ✅ Authenticated user can create task
- ✅ Authenticated user can edit task
- ✅ Authenticated user can delete task
- ✅ Token expiration redirects to login

### Manual Testing Checklist
```
Registration Flow:
[ ] Can navigate to /register
[ ] Form validates email format
[ ] Form validates password length
[ ] Shows error for duplicate email
[ ] Redirects to dashboard on success

Login Flow:
[ ] Can navigate to /login
[ ] Form validates required fields
[ ] Shows error for wrong credentials
[ ] Saves token to localStorage
[ ] Redirects to dashboard on success

Task Management:
[ ] Can view all tasks
[ ] Can create new task
[ ] Can mark task as complete
[ ] Can edit task details
[ ] Can delete task with confirmation
[ ] Can filter tasks (all/active/completed)

Responsive Design:
[ ] Works on mobile (< 768px)
[ ] Works on tablet (768px - 1024px)
[ ] Works on desktop (> 1024px)
[ ] Navigation adapts to screen size

Error Handling:
[ ] Shows loading spinner during API calls
[ ] Shows error message on API failure
[ ] Shows validation errors on forms
[ ] Handles network errors gracefully
```

---

## Performance Optimization

### Code Splitting
```typescript
// Lazy load pages
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tasks = lazy(() => import('./pages/Tasks'));

// Use with Suspense
<Suspense fallback={<Spinner />}>
  <Dashboard />
</Suspense>
```

### API Request Optimization
```typescript
// Debounce search
import { useState, useEffect } from 'react';

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
```

---

## Security Best Practices

### Token Storage
- ✅ Store JWT in localStorage (simple) or httpOnly cookie (more secure)
- ✅ Clear token on logout
- ✅ Validate token on app mount
- ✅ Redirect to login on 401 responses

### Form Security
- ✅ Validate all inputs client-side
- ✅ Never trust client-side validation alone
- ✅ Sanitize user inputs
- ✅ Use HTTPS in production

### XSS Prevention
- ✅ React automatically escapes JSX
- ✅ Never use dangerouslySetInnerHTML unless necessary
- ✅ Validate and sanitize all user inputs

---

## Validation Checklist

Before moving to Constitution 4, verify:

- [ ] React app runs without errors
- [ ] Can navigate to all pages
- [ ] Registration form works and validates
- [ ] Login form works and validates
- [ ] Protected routes redirect to login when not authenticated
- [ ] Can create tasks after authentication
- [ ] Can view all tasks
- [ ] Can edit task details
- [ ] Can mark tasks as complete/incomplete
- [ ] Can delete tasks with confirmation
- [ ] Error messages display correctly
- [ ] Loading states show during API calls
- [ ] Token is saved and sent with requests
- [ ] Token expiration redirects to login
- [ ] UI is responsive on mobile/tablet/desktop
- [ ] All icons and images load correctly
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors

---

## Common Issues & Solutions

### Issue: CORS errors when calling API
**Solution:** Ensure backend CORS is configured with frontend URL:
```python
# Backend main.py
allow_origins=["http://localhost:3000", "http://localhost:5173"]
```

### Issue: Token not sent with requests
**Solution:** Check Axios interceptor is configured correctly in api.ts and uses js-cookie

### Issue: "use client" directive missing
**Solution:** Add `'use client'` at the top of any component that uses:
- useState, useEffect, useContext
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window)

### Issue: Environment variables not working
**Solution:** Use `process.env.NEXT_PUBLIC_` prefix for client-side variables in Next.js

### Issue: Tailwind styles not applying
**Solution:** Check tailwind.config.ts content paths include all source files

### Issue: Middleware not running
**Solution:** Ensure middleware.ts is in root directory (not in src/)

### Issue: TypeScript errors
**Solution:** Run `npm run type-check` and fix type mismatches

### Issue: "Cannot use import statement outside a module"
**Solution:** Check that you're using `.tsx` extension and not `.jsx` for TypeScript files

### Issue: Hydration errors
**Solution:** Ensure server and client render the same HTML initially. Avoid:
- Using `new Date()` directly in JSX
- Using `window` or `localStorage` outside useEffect
- Rendering different content on server vs client

### Issue: Router.push() not working
**Solution:** Use `router.push()` from `next/navigation` not `next/router`:
```typescript
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/dashboard');
```

---

## Learning Outcomes

By completing this iteration, you will understand:
- Modern React development with TypeScript and Next.js 16
- Next.js App Router and file-based routing
- Server and Client Components distinction
- Middleware for authentication and route protection
- State management with Context API in Next.js
- Protected routing via middleware
- API integration with Axios interceptors
- JWT token handling in cookies (frontend)
- Form validation and error handling
- Responsive design with Tailwind CSS
- Component composition and reusability
- User experience best practices
- Next.js performance optimizations

---

## Next Steps (Constitution 4 Preview)

After completing this frontend:
1. Test full integration (frontend + backend)
2. Set up production build process
3. Configure environment variables for production
4. Deploy backend to cloud (Railway/Render/Fly.io)
5. Deploy frontend to **Vercel** (recommended for Next.js)
6. Set up CI/CD pipeline
7. Add monitoring and analytics
8. Perform security audit
9. Configure custom domain

---

## References & Resources

### Documentation
- Next.js 16: https://nextjs.org/docs
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/docs/
- App Router: https://nextjs.org/docs/app
- Axios: https://axios-http.com/docs/intro
- Tailwind CSS: https://tailwindcss.com/docs
- js-cookie: https://github.com/js-cookie/js-cookie

### Tutorials
- Next.js App Router: https://nextjs.org/docs/app/building-your-application/routing
- React + TypeScript: https://react-typescript-cheatsheet.netlify.app/
- Tailwind with Next.js: https://tailwindcss.com/docs/guides/nextjs
- JWT Authentication in Next.js: https://nextjs.org/docs/app/building-your-application/authentication

### Tools
- React DevTools: Browser extension for debugging
- Tailwind IntelliSense: VS Code extension
- ESLint: Code quality
- Prettier: Code formatting

---

## Version History

- **v1.0** - Initial constitution (Dec 9, 2025)
- Frontend structure defined
- Authentication flow documented
- Task management UI specified
- API integration outlined
- **v2.0** - Updated for Next.js 16+ (Dec 9, 2025)
- Migrated from React + Vite to Next.js
- Added App Router structure
- Added middleware for route protection
- Updated with server/client components
- Changed token storage to cookies

---

**Status:** 🟡 Ready for Implementation
**Next Action:** Create `specs.md` with detailed component code for Next.js
**Estimated Time:** 8-10 hours
**Dependencies:** Constitution 2 (Backend API) must be completed
**Due Date:** December 11, 2025 (End of Day)

---