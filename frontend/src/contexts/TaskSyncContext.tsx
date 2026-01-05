'use client';

export const dynamic = 'force-dynamic';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Task, TaskSyncContextType, TaskSyncState } from '../types/chat.types';
import { websocketService } from '../services/websocketService';

// Define action types for the reducer
type TaskSyncAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SYNC_TASKS_START' }
  | { type: 'SYNC_TASKS_SUCCESS'; payload: Task[] }
  | { type: 'SYNC_TASKS_ERROR'; payload: string }
  | { type: 'SET_WEBSOCKET_STATUS'; payload: 'connecting' | 'connected' | 'disconnected' | 'error' };

// Reducer function
const taskSyncReducer = (state: TaskSyncState, action: TaskSyncAction): TaskSyncState => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, isLoading: false, error: null };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        isLoading: false,
        error: null
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? { ...task, ...action.payload.updates } : task
        ),
        isLoading: false,
        error: null
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        isLoading: false,
        error: null
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SYNC_TASKS_START':
      return { ...state, isLoading: true, error: null };
    case 'SYNC_TASKS_SUCCESS':
      return { ...state, tasks: action.payload, isLoading: false, error: null };
    case 'SYNC_TASKS_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'SET_WEBSOCKET_STATUS':
      return { ...state, websocketStatus: action.payload };
    default:
      return state;
  }
};

// Create the context
const TaskSyncContext = createContext<TaskSyncContextType | undefined>(undefined);

// Provider component
interface TaskSyncProviderProps {
  children: React.ReactNode;
}

export const TaskSyncProvider: React.FC<TaskSyncProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(taskSyncReducer, {
    tasks: [],
    isLoading: false,
    error: null,
    websocketStatus: 'disconnected',
  });

  // ✅ Add check for client-side only
  const [isClient, setIsClient] = React.useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Effect to handle WebSocket connections and event handling
  useEffect(() => {
    // ✅ Only run on client side
    if (!isClient) return;

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');

    if (!token) return; // Early return if no token

    // Connect to WebSocket
    websocketService.connect(token);

    // Subscribe to WebSocket status changes
    websocketService.onConnectionStatusChange((status) => {
      dispatch({ type: 'SET_WEBSOCKET_STATUS', payload: status });
    });

    // Subscribe to task sync events
    const unsubscribeTaskCreated = websocketService.subscribe('task_created', (data) => {
      if (data.task) {
        dispatch({ type: 'ADD_TASK', payload: data.task });
      }
    });

    const unsubscribeTaskUpdated = websocketService.subscribe('task_updated', (data) => {
      if (data.task) {
        dispatch({ type: 'UPDATE_TASK', payload: { id: data.task.id, updates: data.task } });
      }
    });

    const unsubscribeTaskDeleted = websocketService.subscribe('task_deleted', (data) => {
      if (data.taskId) {
        dispatch({ type: 'DELETE_TASK', payload: data.taskId });
      }
    });

    const unsubscribeSyncResponse = websocketService.subscribe('sync_response', (data) => {
      if (data.tasks) {
        dispatch({ type: 'SET_TASKS', payload: data.tasks });
      }
    });

    // Request initial sync when connected
    websocketService.requestSync();

    // Cleanup function
    return () => {
      unsubscribeTaskCreated();
      unsubscribeTaskUpdated();
      unsubscribeTaskDeleted();
      unsubscribeSyncResponse();
      websocketService.disconnect();
    };
  }, [isClient]); // ✅ Add isClient as dependency

  // Function to handle API calls with fallback when WebSocket is unavailable
  const makeApiCall = useCallback(async (url: string, options: RequestInit) => {
    try {
      // Construct the full API URL using the backend API
      const apiUrl = `http://localhost:8000/api/v1${url}`;
      console.log('🔗 API Call:', apiUrl);
      console.log('📦 Request body:', options.body);
      console.log('🔑 Headers:', options.headers);
      
      const response = await fetch(apiUrl, options);
      
      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Response data:', data);
      return data;
    } catch (error) {
      console.error('❌ API call failed:', error);
      throw error;
    }
  }, []);

  // Function to add a task with optimistic update
  const addTask = useCallback(async (task: Task) => {
    // ✅ Only run on client side
    if (!isClient) return;

    console.log('🚀 addTask called with:', task);

    // Get token
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    console.log('🔑 Token:', token ? `${token.substring(0, 30)}...` : 'MISSING');

    if (!token) {
      const errorMessage = 'No authentication token found. Please login.';
      console.error('❌', errorMessage);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return;
    }

    // Optimistic update: add the task immediately to the UI
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = { ...task, id: tempId };
    dispatch({ type: 'ADD_TASK', payload: optimisticTask });

    try {
      // ✅ Prepare task data for backend
      const taskData = {
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        due_date: task.due_date || null,
        project_id: task.projectId ? parseInt(task.projectId) : null,
        tag_ids: []
      };

      console.log('📤 Sending to backend:', taskData);

      const newTask = await makeApiCall('/users/me/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      console.log('✅ Task created successfully:', newTask);

      // Replace the temporary task with the actual one from backend
      dispatch({ type: 'DELETE_TASK', payload: tempId });
      const finalTask = {
        id: newTask.id.toString(),
        title: newTask.title,
        description: newTask.description,
        status: newTask.status || (newTask.completed ? 'completed' : 'pending'),
        priority: newTask.priority,
        due_date: newTask.due_date,
        project_id: newTask.project_id?.toString(),
        user_id: newTask.user_id.toString(),
        tags: newTask.tags || [],
        created_at: newTask.created_at,
        updated_at: newTask.updated_at
      };
      dispatch({ type: 'ADD_TASK', payload: finalTask });

      // Send WebSocket event if connected
      if (state.websocketStatus === 'connected') {
        websocketService.send({
          type: 'task_created',
          data: { task: newTask }
        });
      }
    } catch (error) {
      // Rollback on error: remove the optimistic task
      dispatch({ type: 'DELETE_TASK', payload: tempId });
      const errorMessage = error instanceof Error ? error.message : 'Failed to add task';
      console.error('❌ Error in addTask:', errorMessage);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [isClient, makeApiCall, state.websocketStatus]);

  // Function to update a task with optimistic update
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    // ✅ Only run on client side
    if (!isClient) return;

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');

    if (!token) {
      dispatch({ type: 'SET_ERROR', payload: 'No authentication token' });
      return;
    }

    // Get the current task to save for rollback
    const currentTask = state.tasks.find(task => task.id === id);
    if (!currentTask) return;

    // Optimistic update: update the task immediately in the UI
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });

    try {
      const updateData = {
        title: updates.title,
        description: updates.description,
        completed: updates.status === 'completed',
        priority: updates.priority,
        due_date: updates.due_date || null,
        project_id: updates.projectId ? parseInt(updates.projectId) : null,
        tag_ids: []
      };

      const updatedTask = await makeApiCall(`/users/me/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      // Update with the server response to ensure consistency
      dispatch({ type: 'UPDATE_TASK', payload: { id, updates: updatedTask } });

      // Send WebSocket event if connected
      if (state.websocketStatus === 'connected') {
        websocketService.send({
          type: 'task_updated',
          data: { task: updatedTask }
        });
      }
    } catch (error) {
      // Rollback on error: restore the original task state
      const rollbackUpdates: Partial<Task> = {};
      for (const key in updates) {
        if (key in currentTask) {
          (rollbackUpdates as any)[key] = currentTask[key as keyof Task];
        }
      }
      dispatch({ type: 'UPDATE_TASK', payload: { id, updates: rollbackUpdates } });
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, [isClient, makeApiCall, state.tasks, state.websocketStatus]);

  // Function to delete a task with optimistic update
  const deleteTask = useCallback(async (id: string) => {
    // ✅ Only run on client side
    if (!isClient) return;

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    
    if (!token) {
      dispatch({ type: 'SET_ERROR', payload: 'No authentication token' });
      return;
    }

    // Get the task to save for rollback
    const taskToDelete = state.tasks.find(task => task.id === id);
    if (!taskToDelete) return;

    // Optimistic update: remove the task immediately from the UI
    dispatch({ type: 'DELETE_TASK', payload: id });

    try {
      await makeApiCall(`/users/me/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Send WebSocket event if connected
      if (state.websocketStatus === 'connected') {
        websocketService.send({
          type: 'task_deleted',
          data: { taskId: id }
        });
      }
    } catch (error) {
      // Rollback on error: restore the deleted task
      if (taskToDelete) {
        dispatch({ type: 'ADD_TASK', payload: taskToDelete });
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, [isClient, makeApiCall, state.tasks, state.websocketStatus]);

  // Function to sync tasks
  const syncTasks = useCallback(async () => {
    // ✅ Only run on client side
    if (!isClient) return;

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    
    if (!token) {
      dispatch({ type: 'SYNC_TASKS_ERROR', payload: 'No authentication token' });
      return;
    }

    dispatch({ type: 'SYNC_TASKS_START' });
    try {
      const tasks = await makeApiCall('/users/me/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Convert backend format to frontend format
      const formattedTasks = tasks.map((task: any) => ({
        id: task.id.toString(),
        title: task.title,
        description: task.description,
        status: task.status || (task.completed ? 'completed' : 'pending'),
        priority: task.priority,
        due_date: task.due_date,
        project_id: task.project_id?.toString(),
        user_id: task.user_id.toString(),
        tags: task.tags || [],
        created_at: task.created_at,
        updated_at: task.updated_at
      }));
      
      dispatch({ type: 'SYNC_TASKS_SUCCESS', payload: formattedTasks });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SYNC_TASKS_ERROR', payload: errorMessage });
    }
  }, [isClient, makeApiCall]);

  // Load tasks on mount
  useEffect(() => {
    // ✅ Only run on client side
    if (!isClient) return;
    syncTasks();
  }, [isClient, syncTasks]); // ✅ Add isClient as dependency

  // Expose the context value
  const contextValue = {
    tasks: state.tasks,
    addTask,
    updateTask,
    deleteTask,
    syncTasks,
    isLoading: state.isLoading,
    websocketStatus: state.websocketStatus,
  };

  return (
    <TaskSyncContext.Provider value={contextValue}>
      {children}
    </TaskSyncContext.Provider>
  );
};

// Custom hook to use the TaskSyncContext
export const useTaskSync = (): TaskSyncContextType => {
  const context = useContext(TaskSyncContext);
  if (!context) {
    throw new Error('useTaskSync must be used within a TaskSyncProvider');
  }
  return context;
};