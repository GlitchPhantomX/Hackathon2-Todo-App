import React from 'react';
import { render, screen } from '@testing-library/react';
import { TaskList } from '@/components/tasks/TaskList';
import { Task } from '@/types/task.types';

// Mock the TaskItem component
jest.mock('@/components/tasks/TaskItem', () => ({
  default: ({ task }: { task: any }) => <div data-testid="task-item">{task.title}</div>,
}));

describe('TaskList Component', () => {
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

  const mockOnTaskUpdate = jest.fn();
  const mockOnToggle = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  test('renders loading state when loading is true', () => {
    render(
      <TaskList
        tasks={mockTasks}
        onTaskUpdate={mockOnTaskUpdate}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={true}
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner has role="status"
  });

  test('renders empty state when no tasks are provided', () => {
    render(
      <TaskList
        tasks={[]}
        onTaskUpdate={mockOnTaskUpdate}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={false}
      />
    );

    expect(screen.getByText(/no tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/get started by creating a new task/i)).toBeInTheDocument();
  });

  test('renders task items when tasks are provided', () => {
    render(
      <TaskList
        tasks={mockTasks}
        onTaskUpdate={mockOnTaskUpdate}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={false}
      />
    );

    expect(screen.getAllByTestId('task-item')).toHaveLength(2);
  });

  test('passes correct props to TaskItem components', () => {
    render(
      <TaskList
        tasks={mockTasks}
        onTaskUpdate={mockOnTaskUpdate}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={false}
      />
    );

    // Check that the task titles are rendered (from the mock)
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  test('applies correct styling to task list', () => {
    render(
      <TaskList
        tasks={mockTasks}
        onTaskUpdate={mockOnTaskUpdate}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={false}
      />
    );

    // Verify that the list container has appropriate styling
    const taskItem = screen.getByTestId('task-item');
    const parentElement = taskItem.parentElement;
    expect(parentElement).toHaveClass('divide-y');
    expect(parentElement).toHaveClass('divide-gray-200');
  });
});