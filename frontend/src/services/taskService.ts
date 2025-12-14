import api from './api';
import { Task, TaskCreate, TaskUpdate } from '@/types/task.types';

// Simple in-memory cache for tasks
const taskCache = new Map<string, { data: Task | Task[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>();

// Clear expired cache entries
const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of taskCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      taskCache.delete(key);
    }
  }
};

// Get all tasks with caching
export const getTasks = async (): Promise<Task[]> => {
  const cacheKey = 'tasks';

  // Check for duplicate requests
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  // Check cache first
  const cached = taskCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as Task[];
  }

  const requestPromise = (async (): Promise<Task[]> => {
    try {
      const response = await api.get('/tasks');
      const tasks = response.data;

      // Update cache
      taskCache.set(cacheKey, { data: tasks, timestamp: Date.now() });
      clearExpiredCache();

      return tasks;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

// Get a single task by ID with caching
export const getTask = async (id: string): Promise<Task> => {
  const cacheKey = `task-${id}`;

  // Check for duplicate requests
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  // Check cache first
  const cached = taskCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as Task;
  }

  const requestPromise = (async (): Promise<Task> => {
    try {
      const response = await api.get(`/tasks/${id}`);
      const task = response.data;

      // Update cache
      taskCache.set(cacheKey, { data: task, timestamp: Date.now() });
      clearExpiredCache();

      return task;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch task');
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

// Create a new task - clears related cache entries
export const createTask = async (data: TaskCreate): Promise<Task> => {
  try {
    const response = await api.post('/tasks', data);
    const newTask = response.data;

    // Clear cache since we added a new task
    taskCache.delete('tasks');

    return newTask;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create task');
  }
};

// Update a task - clears related cache entries
export const updateTask = async (id: string, data: TaskUpdate): Promise<Task> => {
  try {
    const response = await api.put(`/tasks/${id}`, data);
    const updatedTask = response.data;

    // Update cache with the new data
    taskCache.set(`task-${id}`, { data: updatedTask, timestamp: Date.now() });
    // Clear tasks list cache since task details changed
    taskCache.delete('tasks');

    return updatedTask;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update task');
  }
};

// Delete a task - clears related cache entries
export const deleteTask = async (id: string): Promise<void> => {
  try {
    await api.delete(`/tasks/${id}`);

    // Clear cache entries for this task and the tasks list
    taskCache.delete(`task-${id}`);
    taskCache.delete('tasks');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete task');
  }
};

// Toggle task completion status - clears related cache entries
export const toggleTaskCompletion = async (id: string): Promise<Task> => {
  try {
    const response = await api.patch(`/tasks/${id}/toggle-completion`);
    const updatedTask = response.data;

    // Update cache with the new data
    taskCache.set(`task-${id}`, { data: updatedTask, timestamp: Date.now() });
    // Clear tasks list cache since completion status changed
    taskCache.delete('tasks');

    return updatedTask;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to toggle task completion');
  }
};

// Helper function to clear cache when needed
export const clearTaskCache = () => {
  taskCache.clear();
};