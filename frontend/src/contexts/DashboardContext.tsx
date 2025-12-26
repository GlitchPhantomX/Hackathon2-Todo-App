'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { taskService, projectService, tagService, notificationService, statsService } from '@/services/apiService';
import { Task, Project, Tag, UserPreferences, TaskStats, Notification } from '@/types/types';
import { useAuth } from './AuthContext';
import { webSocketNotificationService } from '@/services/notificationService';
import { notificationSoundService } from '@/services/notificationSoundService';

// Define types
export type SortBy = 'date' | 'priority' | 'title';
export type FilterStatus = 'all' | 'pending' | 'completed';

interface DashboardState {
  tasks: Task[];
  projects: Project[];
  tags: Tag[];
  stats: TaskStats;
  notifications: Notification[];
  filters: {
    status: FilterStatus;
    priority: 'all' | 'high' | 'medium' | 'low';
    tags: string[];
    dateRange: { start: Date | null; end: Date | null };
    project: string | null;
  };
  sortBy: SortBy;
  loading: {
    tasks: boolean;
    stats: boolean;
    projects: boolean;
    tags: boolean;
    notifications: boolean;
  };
  toasts: Array<{
    id: string;
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
    icon?: string;
  }>;
  error: string | null;
}

interface DashboardContextType extends DashboardState {
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  createProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  createTag: (tag: Omit<Tag, 'id'>) => Promise<void>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  createTaskNotification: (type: 'created' | 'updated' | 'completed' | 'deleted', taskTitle: string, taskId?: string) => void;
  removeToast: (id: string) => void;
  setFilter: (filterType: keyof DashboardState['filters'], value: any) => void;
  setSortBy: (sortBy: SortBy) => void;
  setLoading: (loadingType: keyof DashboardState['loading'], value: boolean) => void;
  setError: (error: string | null) => void;
}

// Initial state
const initialState: DashboardState = {
  tasks: [],
  projects: [],
  tags: [],
  notifications: [],
  stats: {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    byPriority: { high: 0, medium: 0, low: 0 },
    byProject: [],
    completionRate: 0,
    productivityTrend: [],
  },
  filters: {
    status: 'all',
    priority: 'all',
    tags: [],
    dateRange: { start: null, end: null },
    project: null,
  },
  sortBy: 'date',
  loading: {
    tasks: false,
    stats: false,
    projects: false,
    tags: false,
    notifications: false,
  },
  toasts: [],
  error: null,
};

// Action types
type Action =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_TAGS'; payload: Tag[] }
  | { type: 'ADD_TAG'; payload: Tag }
  | { type: 'UPDATE_TAG'; payload: { id: string; updates: Partial<Tag> } }
  | { type: 'DELETE_TAG'; payload: string }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<Notification> } }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'SET_STATS'; payload: TaskStats }
  | { type: 'SET_FILTER'; payload: { filterType: keyof DashboardState['filters']; value: any } }
  | { type: 'SET_SORT_BY'; payload: SortBy }
  | { type: 'SET_LOADING'; payload: { loadingType: keyof DashboardState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_TOAST'; payload: any }
  | { type: 'REMOVE_TOAST'; payload: string };

// Reducer
const dashboardReducer = (state: DashboardState, action: Action): DashboardState => {
  switch (action.type) {
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
        stats: calculateStats(action.payload),
      };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        stats: calculateStats([...state.tasks, action.payload]),
      };
    case 'UPDATE_TASK':
      const updatedTasks = state.tasks.map(task =>
        task.id === action.payload.id ? { ...task, ...action.payload.updates } : task
      );
      return {
        ...state,
        tasks: updatedTasks,
        stats: calculateStats(updatedTasks),
      };
    case 'DELETE_TASK':
      const filteredTasks = state.tasks.filter(task => task.id !== action.payload);
      return {
        ...state,
        tasks: filteredTasks,
        stats: calculateStats(filteredTasks),
      };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? { ...project, ...action.payload.updates } : project
        ),
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
      };
    case 'SET_TAGS':
      return { ...state, tags: action.payload };
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.payload] };
    case 'UPDATE_TAG':
      return {
        ...state,
        tags: state.tags.map(tag =>
          tag.id === action.payload.id ? { ...tag, ...action.payload.updates } : tag
        ),
      };
    case 'DELETE_TAG':
      return {
        ...state,
        tags: state.tags.filter(tag => tag.id !== action.payload),
      };
    case 'SET_NOTIFICATIONS':
      console.log('🔥 REDUCER: SET_NOTIFICATIONS called with:', action.payload);
      return { ...state, notifications: action.payload };
      
    case 'ADD_NOTIFICATION':
      console.log('🔥 REDUCER: ADD_NOTIFICATION called with:', action.payload);
      console.log('🔥 REDUCER: Current notifications:', state.notifications);
      const newNotifications = [action.payload, ...state.notifications].slice(0, 50);
      console.log('🔥 REDUCER: New notifications array:', newNotifications);
      console.log('🔥 REDUCER: New notifications count:', newNotifications.length);
      return {
        ...state,
        notifications: newNotifications
      };
      
    case 'UPDATE_NOTIFICATION':
      console.log('🔥 REDUCER: UPDATE_NOTIFICATION called');
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id ? { ...notification, ...action.payload.updates } : notification
        ),
      };
      
    case 'DELETE_NOTIFICATION':
      console.log('🔥 REDUCER: DELETE_NOTIFICATION called');
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
      };
      
    case 'SET_STATS':
      return { ...state, stats: action.payload };
      
    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.filterType]: action.payload.value,
        },
      };
      
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };
      
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.loadingType]: action.payload.value,
        },
      };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'ADD_TOAST':
      console.log('🔥 REDUCER: ADD_TOAST called with:', action.payload);
      console.log('🔥 REDUCER: Current toasts:', state.toasts);
      const newToasts = [...state.toasts, action.payload];
      console.log('🔥 REDUCER: New toasts array:', newToasts);
      return {
        ...state,
        toasts: newToasts,
      };
      
    case 'REMOVE_TOAST':
      console.log('🔥 REDUCER: REMOVE_TOAST called with:', action.payload);
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.payload),
      };
      
    default:
      return state;
  }
};

// Helper function to calculate stats
const calculateStats = (tasks: Task[]): TaskStats => {
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === 'completed').length;
  const pending = tasks.filter(task => task.status === 'pending').length;
  const overdue = tasks.filter(task =>
    task.status === 'pending' &&
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))
  ).length;

  const byPriority = {
    high: tasks.filter(task => task.priority === 'high').length,
    medium: tasks.filter(task => task.priority === 'medium').length,
    low: tasks.filter(task => task.priority === 'low').length,
  };

  const byProjectMap = new Map<string, number>();
  tasks.forEach(task => {
    if (task.projectId) {
      byProjectMap.set(task.projectId, (byProjectMap.get(task.projectId) || 0) + 1);
    }
  });
  const byProject = Array.from(byProjectMap.entries()).map(([projectId, count]) => ({
    projectId,
    projectName: `Project ${projectId}`,
    count,
  }));

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const productivityTrend = [];

  return {
    total,
    completed,
    pending,
    overdue,
    byPriority,
    byProject,
    completionRate,
    productivityTrend,
  };
};

// 🔥 LOCAL STORAGE HELPERS FOR PERSISTENCE
const STORAGE_KEY = 'dashboard_tasks_backup';

const saveTasksToLocalStorage = (tasks: Task[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    console.log('💾 Tasks saved to localStorage:', tasks.length);
  } catch (error) {
    console.error('❌ Error saving to localStorage:', error);
  }
};

const loadTasksFromLocalStorage = (): Task[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const tasks = JSON.parse(stored);
      console.log('✅ Tasks loaded from localStorage:', tasks.length);
      return tasks;
    }
  } catch (error) {
    console.error('❌ Error loading from localStorage:', error);
  }
  return [];
};

// Create context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Provider component
export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // ✅ Browser notification permission (FIXED)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if ('Notification' in window) {
      if (window.Notification.permission === 'default') {
        window.Notification.requestPermission().then(permission => {
          console.log('📬 Notification permission:', permission);
        });
      }
    }
  }, []);

  // ✅ Show browser notification (FIXED - Don't pass emoji as icon)
  const showBrowserNotification = (title: string, body: string) => {
    if (typeof window === 'undefined') return;
    
    if ('Notification' in window && window.Notification.permission === 'granted') {
      try {
        const notification = new window.Notification(title, {
          body,
          icon: '/next.svg',
          badge: '/next.svg',
          tag: `notification-${Date.now()}`,
        });

        setTimeout(() => notification.close(), 5000);
      } catch (error) {
        console.warn('Failed to show notification:', error);
      }
    }
  };

  // ✅ Create task notification (Legacy function - now just calls direct dispatch)
  const createTaskNotification = (
    type: 'created' | 'updated' | 'completed' | 'deleted',
    taskTitle: string,
    taskId?: string
  ) => {
    console.log('🎯 createTaskNotification called:', type, taskTitle, taskId);
    
    const notificationMessages = {
      created: {
        title: '✅ Task Created',
        message: `"${taskTitle}" has been added to your list`,
        type: 'task_created',
        icon: '✅',
        color: '#10b981',
        sound: 'taskCreated',
        toastType: 'success' as const,
      },
      updated: {
        title: '📝 Task Updated',
        message: `"${taskTitle}" has been modified`,
        type: 'task_updated',
        icon: '📝',
        color: '#3b82f6',
        sound: 'taskUpdated',
        toastType: 'info' as const,
      },
      completed: {
        title: '🎉 Task Completed!',
        message: `Awesome! "${taskTitle}" is done`,
        type: 'task_completed',
        icon: '🎉',
        color: '#22c55e',
        sound: 'taskCompleted',
        toastType: 'success' as const,
      },
      deleted: {
        title: '🗑️ Task Deleted',
        message: `"${taskTitle}" has been removed`,
        type: 'task_deleted',
        icon: '🗑️',
        color: '#ef4444',
        sound: 'taskDeleted',
        toastType: 'error' as const,
      },
    };

    const config = notificationMessages[type];
    
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user?.id || '',
      type: config.type,
      title: config.title,
      message: config.message,
      taskId: taskId,
      taskTitle: taskTitle,
      icon: config.icon,
      color: config.color,
      read: false,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

    const toast = {
      id: notification.id,
      title: config.title,
      message: config.message,
      type: config.toastType,
      icon: config.icon,
    };
    dispatch({ type: 'ADD_TOAST', payload: toast });

    try {
      notificationSoundService.play(config.sound);
    } catch (error) {
      console.error('❌ Sound play failed:', error);
    }

    try {
      showBrowserNotification(config.title, config.message);
    } catch (error) {
      console.error('❌ Browser notification failed:', error);
    }
  };

  // ✅ Remove toast
  const removeToast = (id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  };

  // ✅ Load initial data when user is authenticated
  useEffect(() => {
    if (user?.id) {
      const loadInitialData = async () => {
        // LOAD TASKS
        try {
          dispatch({ type: 'SET_LOADING', payload: { loadingType: 'tasks', value: true } });
          
          try {
            const tasks = await taskService.getTasks(user.id);
            console.log('✅ Tasks loaded from backend:', tasks);
            dispatch({ type: 'SET_TASKS', payload: tasks });
            saveTasksToLocalStorage(tasks);
          } catch (backendError) {
            console.warn('⚠️ Backend not available, loading from localStorage:', backendError);
            const localTasks = loadTasksFromLocalStorage();
            dispatch({ type: 'SET_TASKS', payload: localTasks });
          }
        } catch (error) {
          console.error('❌ Error loading tasks:', error);
          dispatch({ type: 'SET_TASKS', payload: [] });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: { loadingType: 'tasks', value: false } });
        }

        // LOAD PROJECTS
        try {
          dispatch({ type: 'SET_LOADING', payload: { loadingType: 'projects', value: true } });
          const projects = await projectService.getProjects(user.id);
          dispatch({ type: 'SET_PROJECTS', payload: projects });
        } catch (error) {
          console.warn('⚠️ Projects API not available:', error);
          dispatch({ type: 'SET_PROJECTS', payload: [] });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: { loadingType: 'projects', value: false } });
        }

        // LOAD TAGS
        try {
          dispatch({ type: 'SET_LOADING', payload: { loadingType: 'tags', value: true } });
          const tags = await tagService.getTags(user.id);
          dispatch({ type: 'SET_TAGS', payload: tags });
        } catch (error) {
          console.warn('⚠️ Tags API not available:', error);
          dispatch({ type: 'SET_TAGS', payload: [] });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: { loadingType: 'tags', value: false } });
        }

        // LOAD NOTIFICATIONS
        try {
          dispatch({ type: 'SET_LOADING', payload: { loadingType: 'notifications', value: true } });
          const notifications = await notificationService.getNotifications(user.id);
          dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
        } catch (error) {
          console.warn('⚠️ Notifications API not available:', error);
          dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: { loadingType: 'notifications', value: false } });
        }

        // LOAD STATS
        try {
          dispatch({ type: 'SET_LOADING', payload: { loadingType: 'stats', value: true } });
          const stats = await statsService.getStats(user.id);
          dispatch({ type: 'SET_STATS', payload: stats });
        } catch (error) {
          console.warn('⚠️ Stats API failed, using local calculation');
          const tasks = loadTasksFromLocalStorage();
          const calculatedStats = calculateStats(tasks);
          dispatch({ type: 'SET_STATS', payload: calculatedStats });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: { loadingType: 'stats', value: false } });
        }
      };

      loadInitialData();

      // WEBSOCKET CONNECTION
      const connectWebSocket = async () => {
        try {
          const token = localStorage.getItem('token') ||
            document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

          if (token) {
            await webSocketNotificationService.connect(user.id, token);
            webSocketNotificationService.on('new_notification', (data) => {
              if (data.notification) {
                dispatch({ type: 'ADD_NOTIFICATION', payload: data.notification });
              }
            });
          }
        } catch (error) {
          console.error('Error connecting to WebSocket:', error);
        }
      };

      connectWebSocket();
    }

    return () => {
      webSocketNotificationService.disconnect();
    };
  }, [user?.id]);

  // ✅ CREATE TASK with IMMEDIATE notification
 // ✅ CREATE TASK with IMMEDIATE notification (FIXED - use shared function for consistency)
const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (!user?.id) {
    console.error('❌ No user ID found');
    return;
  }

  const newTask: Task = {
    ...taskData,
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  console.log('🎯 CREATE TASK CALLED from AddTaskModal:', newTask.title);

  try {
    dispatch({ type: 'SET_LOADING', payload: { loadingType: 'tasks', value: true } });

    // ✅ FIRST: Add task to state immediately
    dispatch({ type: 'ADD_TASK', payload: newTask });
    console.log('✅ Task added to state first');

    // ✅ THEN: Create notification using the shared function to ensure consistency with other notification creation
    console.log('🔔 Creating task notification via createTaskNotification function');
    createTaskNotification('created', newTask.title, newTask.id);
    console.log('✅ Notification created via shared function - should propagate to all context consumers');

    // ✅ Save to localStorage immediately
    const currentTasks = loadTasksFromLocalStorage();
    saveTasksToLocalStorage([...currentTasks, newTask]);

    // ✅ Play sound and browser notification are handled in createTaskNotification

    // Now handle backend API (optional - task already in state)
    try {
      const createdTask = await taskService.createTask(user.id, taskData);
      console.log('✅ Task created on backend:', createdTask);

      // Update with backend response if needed
      if (createdTask.id !== newTask.id) {
        dispatch({ type: 'UPDATE_TASK', payload: { id: newTask.id, updates: createdTask } });
      }
    } catch (backendError) {
      console.warn('⚠️ Backend failed, but task already in localStorage:', backendError);
      // Task already added to state and localStorage, so we're good
    }
  } catch (error) {
    console.error('❌ Error creating task:', error);
    dispatch({ type: 'SET_ERROR', payload: 'Failed to create task' });
    throw error;
  } finally {
    dispatch({ type: 'SET_LOADING', payload: { loadingType: 'tasks', value: false } });
  }
};

  // ✅ UPDATE TASK with notification
  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user?.id) return;

    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'tasks', value: true } });

      // ✅ Only show notification for significant changes using shared function
      if (updates.title || updates.priority || updates.dueDate) {
        createTaskNotification('updated', task.title, id);
      }

      try {
        const updatedTask = await taskService.updateTask(user.id, id, updates);
        dispatch({ type: 'UPDATE_TASK', payload: { id, updates: updatedTask } });

        const updatedTasks = state.tasks.map(t => t.id === id ? { ...t, ...updatedTask } : t);
        saveTasksToLocalStorage(updatedTasks);
      } catch (backendError) {
        console.warn('⚠️ Backend failed, updating localStorage only:', backendError);
        dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });

        const updatedTasks = state.tasks.map(t => t.id === id ? { ...t, ...updates } : t);
        saveTasksToLocalStorage(updatedTasks);
      }
    } catch (error) {
      console.error('❌ Error updating task:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update task' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'tasks', value: false } });
    }
  };

  // ✅ DELETE TASK with notification
  const deleteTask = async (id: string) => {
    if (!user?.id) return;

    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'tasks', value: true } });

      // ✅ Create notification using shared function
      createTaskNotification('deleted', task.title, id);

      try {
        await taskService.deleteTask(user.id, id);
        dispatch({ type: 'DELETE_TASK', payload: id });

        const updatedTasks = state.tasks.filter(t => t.id !== id);
        saveTasksToLocalStorage(updatedTasks);
      } catch (backendError) {
        console.warn('⚠️ Backend failed, deleting from localStorage only:', backendError);
        dispatch({ type: 'DELETE_TASK', payload: id });

        const updatedTasks = state.tasks.filter(t => t.id !== id);
        saveTasksToLocalStorage(updatedTasks);
      }
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete task' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'tasks', value: false } });
    }
  };

  // ✅ TOGGLE TASK COMPLETION with notification
  const toggleTaskCompletion = async (id: string) => {
    if (!user?.id) return;

    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';

    try {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'tasks', value: true } });

      // ✅ Only show notification when COMPLETING using shared function
      if (newStatus === 'completed') {
        createTaskNotification('completed', task.title, id);
      }

      try {
        const updatedTask = await taskService.toggleTaskCompletion(user.id, id);
        dispatch({ type: 'UPDATE_TASK', payload: { id, updates: updatedTask } });

        const updatedTasks = state.tasks.map(t => t.id === id ? { ...t, ...updatedTask } : t);
        saveTasksToLocalStorage(updatedTasks);
      } catch (backendError) {
        console.warn('⚠️ Backend failed, toggling in localStorage only:', backendError);
        dispatch({ type: 'UPDATE_TASK', payload: { id, updates: { status: newStatus } } });

        const updatedTasks = state.tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
        saveTasksToLocalStorage(updatedTasks);
      }
    } catch (error) {
      console.error('❌ Error toggling task:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to toggle task completion' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'tasks', value: false } });
    }
  };

  // Rest of the functions...
  const createProject = async (projectData: Omit<Project, 'id'>) => {
    if (!user?.id) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'projects', value: true } });
      const newProject = await projectService.createProject(user.id, projectData);
      dispatch({ type: 'ADD_PROJECT', payload: newProject });
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'projects', value: false } });
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (!user?.id) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'projects', value: true } });
      const updatedProject = await projectService.updateProject(user.id, id, updates);
      dispatch({ type: 'UPDATE_PROJECT', payload: { id, updates: updatedProject } });
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'projects', value: false } });
    }
  };

  const deleteProject = async (id: string) => {
    if (!user?.id) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'projects', value: true } });
      await projectService.deleteProject(user.id, id);
      dispatch({ type: 'DELETE_PROJECT', payload: id });
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'projects', value: false } });
    }
  };

  const createTag = async (tagData: Omit<Tag, 'id'>) => {
    if (!user?.id) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'tags', value: true } });
      const newTag = await tagService.createTag(user.id, tagData);
      dispatch({ type: 'ADD_TAG', payload: newTag });
    } catch (error) {
      console.error('Error creating tag:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'tags', value: false } });
    }
  };

  const updateTag = async (id: string, updates: Partial<Tag>) => {
    if (!user?.id) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'tags', value: true } });
      const updatedTag = await tagService.updateTag(user.id, id, updates);
      dispatch({ type: 'UPDATE_TAG', payload: { id, updates: updatedTag } });
    } catch (error) {
      console.error('Error updating tag:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'tags', value: false } });
    }
  };

  const deleteTag = async (id: string) => {
    if (!user?.id) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'tags', value: true } });
      await tagService.deleteTag(user.id, id);
      dispatch({ type: 'DELETE_TAG', payload: id });
    } catch (error) {
      console.error('Error deleting tag:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'tags', value: false } });
    }
  };

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'notifications', value: true } });
      const notifications = await notificationService.getNotifications(user.id);
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loadingType: 'notifications', value: false } });
    }
  };

  const markNotificationAsRead = async (id: string) => {
    if (!user?.id) return;
    try {
      const updatedNotification = await notificationService.markNotificationAsRead(user.id, id);
      dispatch({ type: 'UPDATE_NOTIFICATION', payload: { id, updates: updatedNotification } });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    const updatedNotifications = state.notifications.map(n => ({ ...n, read: true }));
    dispatch({ type: 'SET_NOTIFICATIONS', payload: updatedNotifications });
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
  };

  const setFilter = (filterType: keyof DashboardState['filters'], value: any) => {
    dispatch({ type: 'SET_FILTER', payload: { filterType, value } });
  };

  const setSortBy = (sortBy: SortBy) => {
    dispatch({ type: 'SET_SORT_BY', payload: sortBy });
  };

  const setLoading = (loadingType: keyof DashboardState['loading'], value: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { loadingType, value } });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const value = {
    ...state,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    createProject,
    updateProject,
    deleteProject,
    createTag,
    updateTag,
    deleteTag,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    addNotification,
    createTaskNotification,
    removeToast,
    setFilter,
    setSortBy,
    setLoading,
    setError,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};