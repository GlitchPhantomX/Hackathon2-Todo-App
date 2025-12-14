import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskFilter } from '@/components/tasks/TaskFilter';
import { Task } from '@/types/task.types';
import { getTasks, createTask, updateTask, deleteTask, toggleTaskCompletion } from '@/services/taskService';

// Mock the router and auth context
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the task service
jest.mock('@/services/taskService', () => ({
  getTasks: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  toggleTaskCompletion: jest.fn(),
}));

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedGetTasks = getTasks as jest.MockedFunction<typeof getTasks>;
const mockedCreateTask = createTask as jest.MockedFunction<typeof createTask>;
const mockedUpdateTask = updateTask as jest.MockedFunction<typeof updateTask>;
const mockedDeleteTask = deleteTask as jest.MockedFunction<typeof deleteTask>;
const mockedToggleTaskCompletion = toggleTaskCompletion as jest.MockedFunction<typeof toggleTaskCompletion>;

describe('Task Operations Integration Tests', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      completed: false,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      userId: '1',
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      completed: true,
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
      userId: '1',
    },
  ];

  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseRouter.mockReturnValue({
      push: mockPush,
      prefetch: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      options: {},
    } as any);

    mockedUseAuth.mockReturnValue({
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      user: mockUser,
      token: null,
      isLoading: false,
      isAuthenticated: true,
    });

    mockedGetTasks.mockResolvedValue(mockTasks);
  });

  describe('Task Creation Flow', () => {
    test('creates a new task and updates the task list', async () => {
      const newTask: Task = {
        id: '3',
        title: 'New Task',
        description: 'New Description',
        completed: false,
        createdAt: '2023-01-03T00:00:00Z',
        updatedAt: '2023-01-03T00:00:00Z',
        userId: '1',
      };

      mockedCreateTask.mockResolvedValue(newTask);

      // Mock the initial task fetch to return the original tasks
      mockedGetTasks.mockResolvedValueOnce(mockTasks);

      render(<TaskForm onSuccess={jest.fn()} />);

      // Fill in task form
      const titleInput = screen.getByLabelText(/title \*/i);
      fireEvent.change(titleInput, { target: { value: 'New Task' } });

      const descriptionInput = screen.getByLabelText(/description/i);
      fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create task/i });
      fireEvent.click(submitButton);

      // Wait for task creation to complete
      await waitFor(() => {
        expect(mockedCreateTask).toHaveBeenCalledWith({
          title: 'New Task',
          description: 'New Description',
          dueDate: '',
        });
      });
    });

    test('shows error when task creation fails', async () => {
      const errorMessage = 'Failed to create task';
      mockedCreateTask.mockRejectedValue(new Error(errorMessage));

      render(<TaskForm onSuccess={jest.fn()} />);

      // Fill in task form
      const titleInput = screen.getByLabelText(/title \*/i);
      fireEvent.change(titleInput, { target: { value: 'New Task' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create task/i });
      fireEvent.click(submitButton);

      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Task Update Flow', () => {
    test('updates an existing task', async () => {
      const updatedTask: Task = {
        ...mockTasks[0],
        title: 'Updated Task',
        description: 'Updated Description',
      };

      mockedUpdateTask.mockResolvedValue(updatedTask);

      render(<TaskForm task={mockTasks[0]} onSuccess={jest.fn()} />);

      // Update task form
      const titleInput = screen.getByDisplayValue('Task 1');
      fireEvent.change(titleInput, { target: { value: 'Updated Task' } });

      const descriptionInput = screen.getByDisplayValue('Description 1');
      fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /update task/i });
      fireEvent.click(submitButton);

      // Wait for task update to complete
      await waitFor(() => {
        expect(mockedUpdateTask).toHaveBeenCalledWith('1', {
          title: 'Updated Task',
          description: 'Updated Description',
          dueDate: '',
          completed: false,
        } as any);
      });
    });

    test('shows error when task update fails', async () => {
      const errorMessage = 'Failed to update task';
      mockedUpdateTask.mockRejectedValue(new Error(errorMessage));

      render(<TaskForm task={mockTasks[0]} onSuccess={jest.fn()} />);

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /update task/i });
      fireEvent.click(submitButton);

      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Task Deletion Flow', () => {
    test('deletes a task and updates the task list', async () => {
      mockedDeleteTask.mockResolvedValue(undefined);

      render(
        <TaskList
          tasks={mockTasks}
          onTaskUpdate={jest.fn()}
          onToggle={jest.fn()}
          onEdit={jest.fn()}
          onDelete={mockedDeleteTask}
        />
      );

      // Find and click the delete button for the first task
      const deleteButtons = screen.getAllByRole('button', { name: /delete task/i });
      fireEvent.click(deleteButtons[0]);

      // Confirm deletion in the confirmation dialog
      const confirmDeleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(confirmDeleteButton);

      // Wait for task deletion to complete
      await waitFor(() => {
        expect(mockedDeleteTask).toHaveBeenCalledWith('1');
      });
    });

    test('shows error when task deletion fails', async () => {
      const errorMessage = 'Failed to delete task';
      mockedDeleteTask.mockRejectedValue(new Error(errorMessage));

      render(
        <TaskList
          tasks={mockTasks}
          onTaskUpdate={jest.fn()}
          onToggle={jest.fn()}
          onEdit={jest.fn()}
          onDelete={mockedDeleteTask}
        />
      );

      // Find and click the delete button for the first task
      const deleteButtons = screen.getAllByRole('button', { name: /delete task/i });
      fireEvent.click(deleteButtons[0]);

      // Confirm deletion in the confirmation dialog
      const confirmDeleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(confirmDeleteButton);

      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Task Toggle Flow', () => {
    test('toggles task completion status', async () => {
      const toggledTask: Task = {
        ...mockTasks[0],
        completed: true,
      };

      mockedToggleTaskCompletion.mockResolvedValue(toggledTask);

      render(
        <TaskList
          tasks={mockTasks}
          onTaskUpdate={jest.fn()}
          onToggle={mockedToggleTaskCompletion}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      );

      // Find and click the toggle button for the first task
      const toggleButtons = screen.getAllByRole('button', { name: /mark as complete/i });
      fireEvent.click(toggleButtons[0]);

      // Wait for task toggle to complete
      await waitFor(() => {
        expect(mockedToggleTaskCompletion).toHaveBeenCalledWith('1');
      });
    });

    test('shows error when task toggle fails', async () => {
      const errorMessage = 'Failed to toggle task';
      mockedToggleTaskCompletion.mockRejectedValue(new Error(errorMessage));

      render(
        <TaskList
          tasks={mockTasks}
          onTaskUpdate={jest.fn()}
          onToggle={mockedToggleTaskCompletion}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      );

      // Find and click the toggle button for the first task
      const toggleButtons = screen.getAllByRole('button', { name: /mark as complete/i });
      fireEvent.click(toggleButtons[0]);

      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Task Filtering Flow', () => {
    test('filters tasks based on status', async () => {
      render(
        <TaskFilter
          filter={{
            status: 'all',
            search: '',
            allCount: 2,
            activeCount: 1,
            completedCount: 1,
          }}
          onFilterChange={jest.fn()}
          onRefresh={jest.fn()}
        />
      );

      // Click on the 'active' filter button
      const activeButton = screen.getByRole('button', { name: /active/i });
      fireEvent.click(activeButton);

      // The filter change should trigger the onFilterChange callback
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /active/i })).toHaveClass('bg-blue-600');
      });
    });

    test('filters tasks based on search input', async () => {
      const mockOnFilterChange = jest.fn();

      render(
        <TaskFilter
          filter={{
            status: 'all',
            search: '',
            allCount: 2,
            activeCount: 1,
            completedCount: 1,
          }}
          onFilterChange={mockOnFilterChange}
          onRefresh={jest.fn()}
        />
      );

      // Type in the search input
      const searchInput = screen.getByPlaceholderText(/search tasks/i);
      fireEvent.change(searchInput, { target: { value: 'Task 1' } });

      // The filter change should trigger the onFilterChange callback
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({
          status: 'all',
          search: 'Task 1',
          allCount: 2,
          activeCount: 1,
          completedCount: 1,
        } as any);
      });
    });
  });
});