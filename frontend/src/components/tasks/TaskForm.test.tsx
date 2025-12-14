import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Task } from '@/types/task.types';
import { createTask, updateTask } from '@/services/taskService';

// Mock the services
jest.mock('@/services/taskService', () => ({
  createTask: jest.fn(),
  updateTask: jest.fn(),
}));

// Mock the UI components
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, type, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}));
jest.mock('@/components/ui/Input', () => ({
  Input: ({ label, id, name, value, onChange, error, ...props }: any) => (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        {...props}
      />
      {error && <span>{error}</span>}
    </div>
  )
}));
jest.mock('@/components/ui/Alert', () => ({
  Alert: ({ children, variant, onClose }: { children: React.ReactNode; variant?: string; onClose?: () => void }) => (
    <div data-testid="alert" data-variant={variant}>
      {children}
      {onClose && <button onClick={onClose} data-testid="alert-close">Close</button>}
    </div>
  )
}));

const mockedCreateTask = createTask as jest.MockedFunction<typeof createTask>;
const mockedUpdateTask = updateTask as jest.MockedFunction<typeof updateTask>;

describe('TaskForm Component', () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders task form for creating a new task', () => {
    render(<TaskForm onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText(/title \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  test('renders task form for editing an existing task', () => {
    const task: Task = {
      id: '1',
      title: 'Existing Task',
      description: 'Existing Description',
      completed: false,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      userId: '1',
    };

    render(<TaskForm task={task} onSuccess={mockOnSuccess} />);

    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
  });

  test('displays error when title is empty and form is submitted', async () => {
    render(<TaskForm onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });

  test('displays error when title is too short and form is submitted', async () => {
    render(<TaskForm onSuccess={mockOnSuccess} />);

    const titleInput = screen.getByLabelText(/title \*/i);
    fireEvent.change(titleInput, { target: { value: 'A' } });

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  test('displays error when title is too long and form is submitted', async () => {
    render(<TaskForm onSuccess={mockOnSuccess} />);

    const titleInput = screen.getByLabelText(/title \*/i);
    fireEvent.change(titleInput, { target: { value: 'A'.repeat(201) } });

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title must be less than 200 characters/i)).toBeInTheDocument();
    });
  });

  test('displays error when description is too long and form is submitted', async () => {
    render(<TaskForm onSuccess={mockOnSuccess} />);

    const titleInput = screen.getByLabelText(/title \*/i);
    fireEvent.change(titleInput, { target: { value: 'Valid Title' } });

    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'A'.repeat(1001) } });

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/description must be less than 1000 characters/i)).toBeInTheDocument();
    });
  });

  test('calls createTask when creating a new task with valid data', async () => {
    mockedCreateTask.mockResolvedValue({
      id: '1',
      title: 'New Task',
      description: 'New Description',
      completed: false,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      userId: '1',
    });

    render(<TaskForm onSuccess={mockOnSuccess} />);

    const titleInput = screen.getByLabelText(/title \*/i);
    fireEvent.change(titleInput, { target: { value: 'New Task' } });

    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedCreateTask).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New Description',
        dueDate: '',
      });
    });

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  test('calls updateTask when updating an existing task with valid data', async () => {
    const task: Task = {
      id: '1',
      title: 'Existing Task',
      description: 'Existing Description',
      completed: false,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      userId: '1',
    };

    mockedUpdateTask.mockResolvedValue({
      ...task,
      title: 'Updated Task',
      updatedAt: '2023-01-02T00:00:00Z',
    });

    render(<TaskForm task={task} onSuccess={mockOnSuccess} />);

    const titleInput = screen.getByDisplayValue('Existing Task');
    fireEvent.change(titleInput, { target: { value: 'Updated Task' } });

    const submitButton = screen.getByRole('button', { name: /update task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedUpdateTask).toHaveBeenCalledWith('1', {
        title: 'Updated Task',
        description: 'Existing Description',
        dueDate: '',
        completed: false,
      });
    });

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  test('shows loading state when submitting', async () => {
    // Mock createTask to return a promise that resolves after a delay
    mockedCreateTask.mockImplementation(() => new Promise<Task>((resolve) => {
      setTimeout(() => resolve({
        id: '1',
        title: 'New Task',
        description: '',
        completed: false,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        userId: '1',
      }), 100);
    }));

    render(<TaskForm onSuccess={mockOnSuccess} />);

    const titleInput = screen.getByLabelText(/title \*/i);
    fireEvent.change(titleInput, { target: { value: 'New Task' } });

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    // Button should be disabled (loading state)
    expect(submitButton).toBeDisabled();

    // Wait for the operation to complete
    await waitFor(() => {
      expect(mockedCreateTask).toHaveBeenCalledWith({
        title: 'New Task',
        description: '',
        dueDate: '',
      });
    });
  });

  test('displays error message when task creation fails', async () => {
    const errorMessage = 'Failed to create task';
    mockedCreateTask.mockRejectedValue(new Error(errorMessage));

    render(<TaskForm onSuccess={mockOnSuccess} />);

    const titleInput = screen.getByLabelText(/title \*/i);
    fireEvent.change(titleInput, { target: { value: 'New Task' } });

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('alert')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('displays error message when task update fails', async () => {
    const errorMessage = 'Failed to update task';
    mockedUpdateTask.mockRejectedValue(new Error(errorMessage));

    const task: Task = {
      id: '1',
      title: 'Existing Task',
      description: 'Existing Description',
      completed: false,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      userId: '1',
    };

    render(<TaskForm task={task} onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByRole('button', { name: /update task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('alert')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('clears errors when user starts typing', async () => {
    render(<TaskForm onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/title \*/i);
    fireEvent.change(titleInput, { target: { value: 'Valid Title' } });

    // Error should be cleared after typing
    expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
  });
});