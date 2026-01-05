// Unit tests for task CRUD operations in TaskSyncContext
import { renderHook, act } from '@testing-library/react';
import { TaskSyncProvider, useTaskSync } from './TaskSyncContext';
import { Task } from '../types/chat.types';

// Mock the websocket service
jest.mock('../services/websocketService', () => ({
  websocketService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    send: jest.fn(),
    subscribe: jest.fn((event, callback) => {
      // Return an unsubscribe function
      return () => {};
    }),
    getConnectionStatus: jest.fn(() => 'connected'),
  },
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response)
) as jest.Mock;

// Mock localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('TaskSyncContext CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set a mock token in localStorage
    localStorage.setItem('access_token', 'mock-token');
  });

  test('should create a task successfully', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <TaskSyncProvider>{children}</TaskSyncProvider>
    );

    const { result } = renderHook(() => useTaskSync(), { wrapper });

    const newTask: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      priority: 'medium',
      due_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user123',
    };

    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...newTask, id: 'new-id' }),
    });

    await act(async () => {
      await result.current.addTask(newTask);
    });

    // Check that fetch was called with correct parameters
    const expectedOptions = expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
      },
      body: JSON.stringify(newTask),
    });
    expect(global.fetch).toHaveBeenCalledWith('/api/users/me/tasks', expectedOptions);

    // Check that the task was added to the state
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].id).toBe('new-id');
  });

  test('should update a task successfully', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <TaskSyncProvider>{children}</TaskSyncProvider>
    );

    const { result } = renderHook(() => useTaskSync(), { wrapper });

    const taskId = '1';
    const updates = { title: 'Updated Title' };

    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: taskId, ...updates }),
    });

    await act(async () => {
      await result.current.updateTask(taskId, updates);
    });

    // Check that fetch was called with correct parameters
    const expectedUpdateOptions = expect.objectContaining({
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
      },
      body: JSON.stringify(updates),
    });
    expect(global.fetch).toHaveBeenCalledWith(`/api/users/me/tasks/${taskId}`, expectedUpdateOptions);
  });

  test('should delete a task successfully', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <TaskSyncProvider>{children}</TaskSyncProvider>
    );

    const { result } = renderHook(() => useTaskSync(), { wrapper });

    // Add a task first
    const newTask: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      priority: 'medium',
      due_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user123',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...newTask, id: 'new-id' }),
    });

    await act(async () => {
      await result.current.addTask(newTask);
    });

    // Now delete the task
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    await act(async () => {
      await result.current.deleteTask('new-id');
    });

    // Check that fetch was called with correct parameters
    const expectedDeleteOptions = expect.objectContaining({
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer mock-token',
      },
    });
    expect(global.fetch).toHaveBeenCalledWith(`/api/users/me/tasks/new-id`, expectedDeleteOptions);

    // Check that the task was removed from the state
    expect(result.current.tasks).toHaveLength(0);
  });

  test('should handle error when creating a task', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <TaskSyncProvider>{children}</TaskSyncProvider>
    );

    const { result } = renderHook(() => useTaskSync(), { wrapper });

    const newTask: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      priority: 'medium',
      due_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user123',
    };

    // Mock failed API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await act(async () => {
      await result.current.addTask(newTask);
    });

    // Check that the task was not added to the state due to error
    expect(result.current.tasks).toHaveLength(0);
  });

  test('should handle error when updating a task', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <TaskSyncProvider>{children}</TaskSyncProvider>
    );

    const { result } = renderHook(() => useTaskSync(), { wrapper });

    const taskId = '1';
    const updates = { title: 'Updated Title' };

    // Mock failed API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await act(async () => {
      await result.current.updateTask(taskId, updates);
    });

    // Error should be handled and state preserved
    const expectedErrorUpdateOptions = expect.objectContaining({
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
      },
      body: JSON.stringify(updates),
    });
    expect(global.fetch).toHaveBeenCalledWith(`/api/users/me/tasks/${taskId}`, expectedErrorUpdateOptions);
  });

  test('should handle error when deleting a task', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <TaskSyncProvider>{children}</TaskSyncProvider>
    );

    const { result } = renderHook(() => useTaskSync(), { wrapper });

    // Add a task first
    const newTask: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      priority: 'medium',
      due_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user123',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...newTask, id: 'new-id' }),
    });

    await act(async () => {
      await result.current.addTask(newTask);
    });

    // Now try to delete the task with an error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await act(async () => {
      await result.current.deleteTask('new-id');
    });

    // Task should still be in state due to error
    expect(result.current.tasks).toHaveLength(1);
  });
});