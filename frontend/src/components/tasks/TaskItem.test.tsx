import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskItem from '@/components/tasks/TaskItem';
import { Task } from '@/types/task.types';

// Mock the Alert component
jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant, onClose }: { children: React.ReactNode; variant?: string; onClose?: () => void }) => (
    <div data-testid="alert" data-variant={variant}>
      {children}
      {onClose && <button onClick={onClose} data-testid="alert-close">Close</button>}
    </div>
  ),
}));

describe('TaskItem Component', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    userId: '1',
  };

  const mockOnToggle = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders task item with title and description', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  test('renders completed task with strikethrough', () => {
    const completedTask = { ...mockTask, completed: true };
    render(
      <TaskItem
        task={completedTask}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const titleElement = screen.getByText('Test Task');
    expect(titleElement).toHaveClass('line-through');
    expect(titleElement).toHaveClass('text-gray-500');
  });

  test('calls onToggle when toggle button is clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /mark as complete/i });
    fireEvent.click(toggleButton);

    expect(mockOnToggle).toHaveBeenCalledWith('1', true);
  });

  test('calls onEdit when edit button is clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit task/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith('1');
  });

  test('shows delete confirmation when delete button is clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete task/i });
    fireEvent.click(deleteButton);

    expect(screen.getByText(/are you sure you want to delete this task/i)).toBeInTheDocument();
  });

  test('calls onDelete when delete confirmation is confirmed', async () => {
    render(
      <TaskItem
        task={mockTask}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Click delete button to show confirmation
    const deleteButton = screen.getByRole('button', { name: /delete task/i });
    fireEvent.click(deleteButton);

    // Click the delete button in the confirmation
    const confirmDeleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });
  });

  test('hides delete confirmation when cancel is clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Click delete button to show confirmation
    const deleteButton = screen.getByRole('button', { name: /delete task/i });
    fireEvent.click(deleteButton);

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Confirmation should be hidden
    expect(screen.queryByText(/are you sure you want to delete this task/i)).not.toBeInTheDocument();
  });

  test('shows error message when error prop is provided', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
  });

  test('disables buttons when toggle or delete loading states are active', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleLoading={true}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit task/i });
    const deleteButton = screen.getByRole('button', { name: /delete task/i });

    expect(editButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });
});