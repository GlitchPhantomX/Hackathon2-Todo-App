import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Task, Project, Tag, Notification, UserPreferences, TaskStats } from '@/types/types';
import logging from '@/utils/logging';
import CircuitBreaker, { createCircuitBreaker } from '@/utils/CircuitBreaker';
import { apiCache, generateCacheKey } from '@/utils/caching';

// ============================================
// TYPES
// ============================================

// User type definition (add this to your types/types.ts file if not present)
interface User {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Extended Axios config to support retry flag
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ============================================
// HELPER FUNCTIONS - Backend <-> Frontend Conversion
// ============================================

const convertBackendTaskToFrontend = (backendTask: any): Task => {
  return {
    id: backendTask.id?.toString() || '',
    title: backendTask.title || '',
    description: backendTask.description || '',
    status: backendTask.completed ? 'completed' : 'pending',
    dueDate: backendTask.due_date || undefined,
    priority: backendTask.priority || 'medium',
    projectId: backendTask.project_id?.toString() || undefined,
    userId: backendTask.user_id?.toString() || '',
    tags: backendTask.tags || [],
    createdAt: backendTask.created_at || new Date().toISOString(),
    updatedAt: backendTask.updated_at || new Date().toISOString(),
  };
};

const convertFrontendTaskToBackend = (frontendTask: Partial<Task>) => {
  return {
    title: frontendTask.title,
    description: frontendTask.description || '',
    completed: frontendTask.status === 'completed',
    due_date: frontendTask.dueDate || null,
    priority: frontendTask.priority || 'medium',
    project_id: frontendTask.projectId ? parseInt(frontendTask.projectId) : null,
  };
};

const convertBackendProjectToFrontend = (backendProject: any): Project => {
  return {
    id: backendProject.id?.toString() || '',
    name: backendProject.name || '',
    description: backendProject.description || '',
    color: backendProject.color || '#3B82F6',
    icon: backendProject.icon || '',
    userId: backendProject.user_id?.toString() || '',
    createdAt: backendProject.created_at || new Date().toISOString(),
    updatedAt: backendProject.updated_at || new Date().toISOString(),
  };
};

const convertBackendTagToFrontend = (backendTag: any): Tag => {
  return {
    id: backendTag.id?.toString() || '',
    name: backendTag.name || '',
    color: backendTag.color || '#3B82F6',
    userId: backendTag.user_id?.toString() || '',
    createdAt: backendTag.created_at || new Date().toISOString(),
    updatedAt: backendTag.updated_at || new Date().toISOString(),
  };
};

// ============================================
// CIRCUIT BREAKERS
// ============================================

const taskCircuitBreaker = createCircuitBreaker({
  failureThreshold: 3,
  timeoutMs: 30000,
  successThreshold: 2
});

const projectCircuitBreaker = createCircuitBreaker({
  failureThreshold: 3,
  timeoutMs: 30000,
  successThreshold: 2
});

const notificationCircuitBreaker = createCircuitBreaker({
  failureThreshold: 3,
  timeoutMs: 30000,
  successThreshold: 2
});

const userPreferencesCircuitBreaker = createCircuitBreaker({
  failureThreshold: 3,
  timeoutMs: 30000,
  successThreshold: 2
});

const profileCircuitBreaker = createCircuitBreaker({
  failureThreshold: 3,
  timeoutMs: 30000,
  successThreshold: 2
});

const importExportCircuitBreaker = createCircuitBreaker({
  failureThreshold: 3,
  timeoutMs: 30000,
  successThreshold: 2
});

// ============================================
// AXIOS INSTANCE CONFIGURATION
// ============================================

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// TOKEN MANAGEMENT
// ============================================

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  // Try localStorage first (more reliable)
  const localToken = localStorage.getItem('access_token') || localStorage.getItem('token');
  if (localToken) return localToken;

  // Fallback to cookie
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('access_token=') || row.startsWith('token='));

  if (cookie) {
    return cookie.split('=')[1];
  }

  return null;
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  // Try localStorage first
  const localToken = localStorage.getItem('refresh_token');
  if (localToken) return localToken;

  // Fallback to cookie
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('refresh_token='));

  if (cookie) {
    return cookie.split('=')[1];
  }

  return null;
};

const setTokens = (accessToken: string, refreshToken?: string): void => {
  if (typeof window !== 'undefined') {
    // Set access token in localStorage
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('token', accessToken); // Backup key

    // Set access token in cookie
    document.cookie = `access_token=${accessToken}; path=/; max-age=${30 * 60}; SameSite=Lax`;
    document.cookie = `token=${accessToken}; path=/; max-age=${30 * 60}; SameSite=Lax`;

    // Set refresh token if provided
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
      document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    }
  }
};

const clearTokens = (): void => {
  if (typeof window !== 'undefined') {
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');

    // Clear cookies
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
  }
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    logging.warn('No refresh token available');
    return null;
  }

  try {
    logging.info('Attempting to refresh access token');
    
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'}/auth/refresh`,
      { refresh_token: refreshToken }
    );

    const { access_token, refresh_token: newRefreshToken } = response.data;

    setTokens(access_token, newRefreshToken || refreshToken);
    
    logging.info('Access token refreshed successfully');
    return access_token;
  } catch (error: any) {
    logging.error('Token refresh failed', {
      status: error.response?.status,
      message: error.message
    }, error);

    // Clear tokens and redirect to login
    clearTokens();
    
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    
    return null;
  }
};

// ============================================
// AXIOS INTERCEPTORS
// ============================================

// Request interceptor - Add correlation ID and token
api.interceptors.request.use(
  (config) => {
    // Add correlation ID
    const correlationId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    config.headers['X-Correlation-ID'] = correlationId;

    // Add authentication token
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      logging.debug('Added auth token to request', { 
        url: config.url,
        hasToken: !!token 
      });
    } else {
      logging.warn('No token found for request', { url: config.url });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    const correlationId = originalRequest?.headers?.['X-Correlation-ID'] || logging.generateCorrelationId();

    // Log error with correlation ID
    logging.error('API Error occurred', {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      correlationId
    }, error);

    // Handle 401 Unauthorized - Token refresh logic
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      logging.info('Received 401, attempting token refresh', { 
        url: originalRequest.url 
      });

      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        // Update the failed request with new token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        logging.info('Retrying request with new token', { 
          url: originalRequest.url 
        });

        // Retry the original request
        return api(originalRequest);
      } else {
        // Token refresh failed - already redirected to login in refreshAccessToken
        logging.error('Token refresh failed, cannot retry request');
        return Promise.reject(error);
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      logging.error('Forbidden access', {
        url: originalRequest?.url,
        status: error.response?.status,
        data: error.response?.data,
        correlationId
      });
    } else if (error.response?.status >= 500) {
      logging.error('Server error', {
        url: originalRequest?.url,
        status: error.response?.status,
        data: error.response?.data,
        correlationId
      });
    }

    return Promise.reject(error);
  }
);

// ============================================
// HELPER FUNCTIONS
// ============================================

const withCaching = async <T>(
  requestFn: () => Promise<T>,
  cacheKey: string,
  cacheExpiryMs: number = 5 * 60 * 1000
): Promise<T> => {
  const cached = apiCache.get<T>(cacheKey);
  if (cached) {
    logging.debug(`Cache hit for ${cacheKey}`);
    return cached;
  }

  const result = await requestFn();
  apiCache.set(cacheKey, result, cacheExpiryMs);
  logging.debug(`Cached result for ${cacheKey}`);

  return result;
};

const withCircuitBreakerAndRetry = async <T>(
  requestFn: () => Promise<T>,
  circuitBreaker: CircuitBreaker,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  const correlationId = logging.generateCorrelationId();

  if (circuitBreaker.getState() === 'OPEN') {
    logging.warn('Circuit breaker is OPEN, skipping request', {
      correlationId,
      circuitState: circuitBreaker.getState()
    });
    throw new Error('Service temporarily unavailable (circuit breaker is open)');
  }

  const wrappedRequest = () => circuitBreaker.call(requestFn);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await wrappedRequest();
    } catch (error: any) {
      logging.error(`API request failed (attempt ${attempt + 1}/${maxRetries + 1})`, {
        correlationId,
        attempt: attempt + 1,
        maxRetries: maxRetries + 1,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        circuitState: circuitBreaker.getState()
      }, error);

      // Don't retry on 4xx errors (client errors) except 401
      if (error.response && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 401) {
        throw error;
      }

      if (attempt === maxRetries) {
        logging.error('Max retries reached for API request', {
          correlationId,
          url: error.config?.url,
          method: error.config?.method,
          circuitState: circuitBreaker.getState()
        });
        throw error;
      }

      const waitTime = delay * Math.pow(2, attempt);
      logging.info(`Waiting ${waitTime}ms before retrying`, {
        correlationId,
        attempt: attempt + 1,
        waitTime,
        circuitState: circuitBreaker.getState()
      });
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error(`API request failed after ${maxRetries + 1} attempts`);
};

const withCachingAndCircuitBreaker = async <T>(
  requestFn: () => Promise<T>,
  cacheKey: string,
  circuitBreaker: CircuitBreaker,
  cacheExpiryMs: number = 5 * 60 * 1000,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  const cached = apiCache.get<T>(cacheKey);
  if (cached) {
    logging.debug(`Cache hit for ${cacheKey}`);
    return cached;
  }

  const result = await withCircuitBreakerAndRetry(
    requestFn,
    circuitBreaker,
    maxRetries,
    delay
  );

  apiCache.set(cacheKey, result, cacheExpiryMs);
  logging.debug(`Cached result for ${cacheKey}`);

  return result;
};

// ============================================
// TASK SERVICE
// ============================================

export const taskService = {
  getTasks: async (userId: string): Promise<Task[]> => {
    const cacheKey = generateCacheKey(`/users/${userId}/tasks`);
    return withCachingAndCircuitBreaker(async () => {
      const response = await api.get(`/users/${userId}/tasks`);
      return response.data.map(convertBackendTaskToFrontend);
    }, cacheKey, taskCircuitBreaker, 5 * 60 * 1000);
  },

  getTask: async (userId: string, taskId: string): Promise<Task> => {
    const cacheKey = generateCacheKey(`/users/${userId}/tasks/${taskId}`);
    return withCachingAndCircuitBreaker(async () => {
      const response = await api.get(`/users/${userId}/tasks/${taskId}`);
      return convertBackendTaskToFrontend(response.data);
    }, cacheKey, taskCircuitBreaker, 10 * 60 * 1000);
  },

  createTask: async (userId: string, data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    return withCircuitBreakerAndRetry(async () => {
      const backendData = convertFrontendTaskToBackend(data);
      const response = await api.post(`/users/${userId}/tasks`, backendData);

      // Invalidate cache
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks`));
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks/today`));
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks/upcoming`));
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks/overdue`));
      apiCache.delete(generateCacheKey(`/tasks/stats`, { userId }));

      return convertBackendTaskToFrontend(response.data);
    }, taskCircuitBreaker);
  },

  updateTask: async (userId: string, taskId: string, data: Partial<Task>): Promise<Task> => {
    return withCircuitBreakerAndRetry(async () => {
      const backendData = convertFrontendTaskToBackend(data);
      const response = await api.put(`/users/${userId}/tasks/${taskId}`, backendData);

      // Invalidate cache
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks`));
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks/${taskId}`));
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks/today`));
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks/upcoming`));
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks/overdue`));
      apiCache.delete(generateCacheKey(`/tasks/stats`, { userId }));

      return convertBackendTaskToFrontend(response.data);
    }, taskCircuitBreaker);
  },

  deleteTask: async (userId: string, taskId: string): Promise<void> => {
    return withCircuitBreakerAndRetry(async () => {
      await api.delete(`/users/${userId}/tasks/${taskId}`);

      // Invalidate cache
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks`));
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks/${taskId}`));
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks/today`));
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks/upcoming`));
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks/overdue`));
      apiCache.delete(generateCacheKey(`/tasks/stats`, { userId }));
    }, taskCircuitBreaker);
  },

  toggleTaskCompletion: async (userId: string, taskId: string): Promise<Task> => {
    return withCircuitBreakerAndRetry(async () => {
      const currentTask = await taskService.getTask(userId, taskId);
      const newStatus = currentTask.status === 'completed' ? 'pending' : 'completed';
      const result = await taskService.updateTask(userId, taskId, { status: newStatus });

      // Additional cache invalidation
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks/today`));
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks/overdue`));

      return result;
    }, taskCircuitBreaker);
  },

  getTodayTasks: async (userId: string): Promise<Task[]> => {
    const cacheKey = generateCacheKey(`/users/${userId}/tasks/today`);
    return withCachingAndCircuitBreaker(async () => {
      const response = await api.get(`/users/${userId}/tasks/today`);
      return response.data.map(convertBackendTaskToFrontend);
    }, cacheKey, taskCircuitBreaker, 2 * 60 * 1000);
  },

  getUpcomingTasks: async (userId: string): Promise<Task[]> => {
    const cacheKey = generateCacheKey(`/users/${userId}/tasks/upcoming`);
    return withCachingAndCircuitBreaker(async () => {
      const response = await api.get(`/users/${userId}/tasks/upcoming`);
      return response.data.map(convertBackendTaskToFrontend);
    }, cacheKey, taskCircuitBreaker, 5 * 60 * 1000);
  },

  getOverdueTasks: async (userId: string): Promise<Task[]> => {
    const cacheKey = generateCacheKey(`/users/${userId}/tasks/overdue`);
    return withCachingAndCircuitBreaker(async () => {
      const response = await api.get(`/users/${userId}/tasks/overdue`);
      return response.data.map(convertBackendTaskToFrontend);
    }, cacheKey, taskCircuitBreaker, 2 * 60 * 1000);
  },

  bulkUpdateTasks: async (userId: string, taskIds: string[], updateData: Partial<Task>): Promise<Task[]> => {
    return withCircuitBreakerAndRetry(async () => {
      const backendData = convertFrontendTaskToBackend(updateData);
      const response = await api.post(`/users/${userId}/tasks/bulk-update`, {
        task_ids: taskIds,
        update_data: backendData,
      });

      // Invalidate cache
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks`));
      taskIds.forEach(taskId => {
        apiCache.delete(generateCacheKey(`/users/${userId}/tasks/${taskId}`));
      });
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks/today`));
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks/upcoming`));
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks/overdue`));
      apiCache.delete(generateCacheKey(`/tasks/stats`, { userId }));

      return response.data.map(convertBackendTaskToFrontend);
    }, taskCircuitBreaker);
  },

  bulkDeleteTasks: async (userId: string, taskIds: string[]): Promise<void> => {
    return withCircuitBreakerAndRetry(async () => {
      await api.post(`/users/${userId}/tasks/bulk-delete`, {
        task_ids: taskIds,
      });

      // Invalidate cache
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks`));
      taskIds.forEach(taskId => {
        apiCache.delete(generateCacheKey(`/users/${userId}/tasks/${taskId}`));
      });
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks/today`));
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks/upcoming`));
      apiCache.delete(generateCacheKey(`/users/${userId}/tasks/overdue`));
      apiCache.delete(generateCacheKey(`/tasks/stats`, { userId }));
    }, taskCircuitBreaker);
  },
};

// ============================================
// PROJECT SERVICE
// ============================================

export const projectService = {
  getProjects: async (userId: string): Promise<Project[]> => {
    const cacheKey = generateCacheKey(`/users/${userId}/projects`);
    return withCachingAndCircuitBreaker(async () => {
      const response = await api.get(`/users/${userId}/projects`);
      return response.data.map(convertBackendProjectToFrontend);
    }, cacheKey, projectCircuitBreaker, 10 * 60 * 1000);
  },

  getProject: async (userId: string, projectId: string): Promise<Project> => {
    const cacheKey = generateCacheKey(`/users/${userId}/projects/${projectId}`);
    return withCachingAndCircuitBreaker(async () => {
      const response = await api.get(`/users/${userId}/projects/${projectId}`);
      return convertBackendProjectToFrontend(response.data);
    }, cacheKey, projectCircuitBreaker, 15 * 60 * 1000);
  },

  createProject: async (userId: string, data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    return withCircuitBreakerAndRetry(async () => {
      const response = await api.post(`/users/${userId}/projects`, {
        name: data.name,
        description: data.description || '',
        color: data.color || '#3B82F6',
        icon: data.icon || '',
      });

      apiCache.delete(generateCacheKey(`/users/${userId}/projects`));

      return convertBackendProjectToFrontend(response.data);
    }, projectCircuitBreaker);
  },

  updateProject: async (userId: string, projectId: string, data: Partial<Project>): Promise<Project> => {
    return withCircuitBreakerAndRetry(async () => {
      const response = await api.put(`/users/${userId}/projects/${projectId}`, {
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
      });

      apiCache.delete(generateCacheKey(`/users/${userId}/projects`));
      apiCache.delete(generateCacheKey(`/users/${userId}/projects/${projectId}`));

      return convertBackendProjectToFrontend(response.data);
    }, projectCircuitBreaker);
  },

  deleteProject: async (userId: string, projectId: string): Promise<void> => {
    return withCircuitBreakerAndRetry(async () => {
      await api.delete(`/users/${userId}/projects/${projectId}`);

      apiCache.delete(generateCacheKey(`/users/${userId}/projects`));
      apiCache.delete(generateCacheKey(`/users/${userId}/projects/${projectId}`));
    }, projectCircuitBreaker);
  },
};

// ============================================
// TAG SERVICE
// ============================================

export const tagService = {
  getTags: async (userId: string): Promise<Tag[]> => {
    const cacheKey = generateCacheKey(`/users/${userId}/tags`);
    return withCachingAndCircuitBreaker(async () => {
      const response = await api.get(`/users/${userId}/tags`);
      return response.data.map(convertBackendTagToFrontend);
    }, cacheKey, taskCircuitBreaker, 10 * 60 * 1000);
  },

  getTag: async (userId: string, tagId: string): Promise<Tag> => {
    const cacheKey = generateCacheKey(`/users/${userId}/tags/${tagId}`);
    return withCachingAndCircuitBreaker(async () => {
      const response = await api.get(`/users/${userId}/tags/${tagId}`);
      return convertBackendTagToFrontend(response.data);
    }, cacheKey, taskCircuitBreaker, 15 * 60 * 1000);
  },

  createTag: async (userId: string, data: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tag> => {
    return withCircuitBreakerAndRetry(async () => {
      const response = await api.post(`/users/${userId}/tags`, {
        name: data.name,
        color: data.color || '#3B82F6',
      });

      apiCache.delete(generateCacheKey(`/users/${userId}/tags`));
      return convertBackendTagToFrontend(response.data);
    }, taskCircuitBreaker);
  },

  updateTag: async (userId: string, tagId: string, data: Partial<Tag>): Promise<Tag> => {
    return withCircuitBreakerAndRetry(async () => {
      const response = await api.put(`/users/${userId}/tags/${tagId}`, {
        name: data.name,
        color: data.color,
      });

      apiCache.delete(generateCacheKey(`/users/${userId}/tags`));
      apiCache.delete(generateCacheKey(`/users/${userId}/tags/${tagId}`));
      return convertBackendTagToFrontend(response.data);
    }, taskCircuitBreaker);
  },

  deleteTag: async (userId: string, tagId: string): Promise<void> => {
    return withCircuitBreakerAndRetry(async () => {
      await api.delete(`/users/${userId}/tags/${tagId}`);

      apiCache.delete(generateCacheKey(`/users/${userId}/tags`));
      apiCache.delete(generateCacheKey(`/users/${userId}/tags/${tagId}`));
    }, taskCircuitBreaker);
  },
};
// ============================================
// STATISTICS SERVICE
// ============================================

export const statsService = {
  getStats: async (userId: string): Promise<TaskStats> => {
    const cacheKey = generateCacheKey(`/tasks/stats`, { userId });
    return withCachingAndCircuitBreaker(async () => {
      const response = await api.get(`/tasks/stats`);

      return {
        total: response.data.total || 0,
        completed: response.data.completed || 0,
        pending: response.data.pending || 0,
        overdue: response.data.overdue || 0,
        byPriority: response.data.by_priority || { high: 0, medium: 0, low: 0 },
        byProject: (response.data.by_project || []).map((p: any) => ({
          projectId: p.id?.toString() || '',
          projectName: p.name || '',
          count: p.count || 0,
        })),
        completionRate: response.data.completion_rate || 0,
        productivityTrend: response.data.productivity_trend || [],
      };
    }, cacheKey, taskCircuitBreaker, 3 * 60 * 1000);
  },
};

// ============================================
// NOTIFICATION SERVICE
// ============================================

export const notificationService = {
  getNotifications: async (userId: string, unreadOnly: boolean = false, limit: number = 10): Promise<Notification[]> => {
    const cacheKey = generateCacheKey(`/users/${userId}/notifications`, { unread_only: unreadOnly, limit });
    return withCachingAndCircuitBreaker(async () => {
      const response = await api.get(`/users/${userId}/notifications`, {
        params: { unread_only: unreadOnly, limit },
      });
      return response.data;
    }, cacheKey, notificationCircuitBreaker, 1 * 60 * 1000);
  },

  getNotification: async (userId: string, notificationId: string): Promise<Notification> => {
    const cacheKey = generateCacheKey(`/users/${userId}/notifications/${notificationId}`);
    return withCachingAndCircuitBreaker(async () => {
      const response = await api.get(`/users/${userId}/notifications/${notificationId}`);
      return response.data;
    }, cacheKey, notificationCircuitBreaker, 5 * 60 * 1000);
  },

  createNotification: async (userId: string, data: Omit<Notification, 'id'>): Promise<Notification> => {
    return withCircuitBreakerAndRetry(async () => {
      const response = await api.post(`/users/${userId}/notifications`, data);

      apiCache.delete(generateCacheKey(`/users/${userId}/notifications`, { unread_only: true, limit: 10 }));
      apiCache.delete(generateCacheKey(`/users/${userId}/notifications`, { unread_only: false, limit: 10 }));

      return response.data;
    }, notificationCircuitBreaker);
  },

  markNotificationAsRead: async (userId: string, notificationId: string): Promise<Notification> => {
    return withCircuitBreakerAndRetry(async () => {
      const response = await api.patch(`/users/${userId}/notifications/${notificationId}/read`);

      apiCache.delete(generateCacheKey(`/users/${userId}/notifications`, { unread_only: true, limit: 10 }));
      apiCache.delete(generateCacheKey(`/users/${userId}/notifications`, { unread_only: false, limit: 10 }));
      apiCache.delete(generateCacheKey(`/users/${userId}/notifications/${notificationId}`));

      return response.data;
    }, notificationCircuitBreaker);
  },

  deleteNotification: async (userId: string, notificationId: string): Promise<void> => {
    return withCircuitBreakerAndRetry(async () => {
      await api.delete(`/users/${userId}/notifications/${notificationId}`);

      apiCache.delete(generateCacheKey(`/users/${userId}/notifications`, { unread_only: true, limit: 10 }));
      apiCache.delete(generateCacheKey(`/users/${userId}/notifications`, { unread_only: false, limit: 10 }));
      apiCache.delete(generateCacheKey(`/users/${userId}/notifications/${notificationId}`));
    }, notificationCircuitBreaker);
  },
};

// ============================================
// USER PREFERENCES SERVICE
// ============================================

export const userPreferencesService = {
  getUserPreferences: async (userId: string): Promise<UserPreferences> => {
    const cacheKey = generateCacheKey(`/users/${userId}/preferences`);
    return withCachingAndCircuitBreaker(async () => {
      const response = await api.get(`/users/${userId}/preferences`);
      return response.data;
    }, cacheKey, userPreferencesCircuitBreaker, 30 * 60 * 1000);
  },

  updateUserPreferences: async (userId: string, data: Partial<UserPreferences>): Promise<UserPreferences> => {
    return withCircuitBreakerAndRetry(async () => {
      const response = await api.put(`/users/${userId}/preferences`, data);

      apiCache.delete(generateCacheKey(`/users/${userId}/preferences`));

      return response.data;
    }, userPreferencesCircuitBreaker);
  },
};

// ============================================
// PROFILE SERVICE
// ============================================

export const profileService = {
  getProfile: async (): Promise<User> => {
    const cacheKey = generateCacheKey('/profile');
    return withCachingAndCircuitBreaker(async () => {
      const response = await api.get('/profile');
      return response.data;
    }, cacheKey, profileCircuitBreaker, 15 * 60 * 1000);
  },

  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    return withCircuitBreakerAndRetry(async () => {
      const response = await api.put('/profile', profileData);

      apiCache.delete(generateCacheKey('/profile'));

      return response.data;
    }, profileCircuitBreaker);
  },
};

// ============================================
// IMPORT/EXPORT SERVICE
// ============================================

export const importExportService = {
  importTasks: async (userId: string, file: File): Promise<{ imported: number; errors: number }> => {
    return withCircuitBreakerAndRetry(async () => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/users/${userId}/tasks/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }, importExportCircuitBreaker);
  },

  exportTasks: async (userId: string, format: 'csv' | 'json' | 'pdf', filters?: any): Promise<Blob> => {
    return withCircuitBreakerAndRetry(async () => {
      const response = await api.get(`/users/${userId}/tasks/export`, {
        params: {
          format,
          ...filters,
        },
        responseType: 'blob',
      });
      return response.data;
    }, importExportCircuitBreaker);
  },
};

// Export helper functions for use elsewhere
export { setTokens, clearTokens, getToken, getRefreshToken };

export default api;