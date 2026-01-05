// Basic tests for TaskSyncContext
import React from 'react';
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

describe('TaskSyncContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set a mock token in localStorage
    localStorage.setItem('access_token', 'mock-token');
  });

  test('should provide initial state', () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <TaskSyncProvider>{children}</TaskSyncProvider>
    );

    const { result } = renderHook(() => useTaskSync(), { wrapper });

    expect(result.current.tasks).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.websocketStatus).toBeDefined();
  });

  test('should add a task', async () => {
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
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/users/me/tasks',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: JSON.stringify(newTask),
      })
    );
  });

  test('should update a task', async () => {
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
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/users/me/tasks/${taskId}`,
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: JSON.stringify(updates),
      })
    );
  });

  test('should delete a task', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <TaskSyncProvider>{children}</TaskSyncProvider>
    );

    const { result } = renderHook(() => useTaskSync(), { wrapper });

    const taskId = '1';

    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    await act(async () => {
      await result.current.deleteTask(taskId);
    });

    // Check that fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/users/me/tasks/${taskId}`,
      expect.objectContaining({
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer mock-token',
        },
      })
    );
  });
});