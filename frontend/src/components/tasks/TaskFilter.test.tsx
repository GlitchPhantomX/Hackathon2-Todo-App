import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskFilter } from '@/components/tasks/TaskFilter';
import { TaskFilter as TaskFilterType } from '@/types/task.types';

describe('TaskFilter Component', () => {
  const mockFilter: TaskFilterType = {
    status: 'all',
    search: '',
    allCount: 10,
    activeCount: 5,
    completedCount: 5,
  };

  const mockOnFilterChange = jest.fn();
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders filter controls with status buttons and search input', () => {
    render(
      <TaskFilter
        filter={mockFilter}
        onFilterChange={mockOnFilterChange}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /active/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /completed/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search tasks/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
  });

  test('displays correct task counts for each status', () => {
    render(
      <TaskFilter
        filter={mockFilter}
        onFilterChange={mockOnFilterChange}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText('10')).toBeInTheDocument(); // All count
    expect(screen.getByText('5')).toBeInTheDocument(); // Active count
    expect(screen.getByText('5')).toBeInTheDocument(); // Completed count
  });

  test('calls onFilterChange when status buttons are clicked', () => {
    render(
      <TaskFilter
        filter={mockFilter}
        onFilterChange={mockOnFilterChange}
        onRefresh={mockOnRefresh}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /active/i }));

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockFilter,
      status: 'active',
    });

    fireEvent.click(screen.getByRole('button', { name: /completed/i }));

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockFilter,
      status: 'completed',
    });
  });

  test('calls onFilterChange when search input changes', () => {
    render(
      <TaskFilter
        filter={mockFilter}
        onFilterChange={mockOnFilterChange}
        onRefresh={mockOnRefresh}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search tasks/i);
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockFilter,
      search: 'test search',
    });
  });

  test('clears search when clear button is clicked', () => {
    const filterWithSearch = { ...mockFilter, search: 'test search' };
    render(
      <TaskFilter
        filter={filterWithSearch}
        onFilterChange={mockOnFilterChange}
        onRefresh={mockOnRefresh}
      />
    );

    // The clear button should appear when there's search text
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...filterWithSearch,
      search: '',
    });
  });

  test('calls onRefresh when refresh button is clicked', () => {
    render(
      <TaskFilter
        filter={mockFilter}
        onFilterChange={mockOnFilterChange}
        onRefresh={mockOnRefresh}
      />
    );

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    expect(mockOnRefresh).toHaveBeenCalled();
  });

  test('applies active styling to the current status button', () => {
    render(
      <TaskFilter
        filter={mockFilter}
        onFilterChange={mockOnFilterChange}
        onRefresh={mockOnRefresh}
      />
    );

    // The 'all' button should have primary variant styling (active)
    const allButton = screen.getByRole('button', { name: /all/i });
    expect(allButton).toHaveClass('bg-blue-600'); // Primary button class

    // The other buttons should have secondary variant styling (inactive)
    const activeButton = screen.getByRole('button', { name: /active/i });
    expect(activeButton).toHaveClass('bg-gray-200'); // Secondary button class

    const completedButton = screen.getByRole('button', { name: /completed/i });
    expect(completedButton).toHaveClass('bg-gray-200'); // Secondary button class
  });

  test('shows clear button when search has value', () => {
    const filterWithSearch = { ...mockFilter, search: 'test search' };
    render(
      <TaskFilter
        filter={filterWithSearch}
        onFilterChange={mockOnFilterChange}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
  });

  test('does not show clear button when search is empty', () => {
    render(
      <TaskFilter
        filter={mockFilter}
        onFilterChange={mockOnFilterChange}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
  });
});