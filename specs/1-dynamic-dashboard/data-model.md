# Data Model: Dynamic Dashboard Enhancement

## 1. Overview

The dynamic dashboard will utilize the existing `Task` data model from the backend while introducing new data structures for dashboard-specific functionality. This document outlines the data models, transformations, and structures required for the enhanced dashboard.

## 2. Existing Data Models

### Task Model (from backend)
The primary data model used by the dashboard is the `Task` model, which is defined as:

```typescript
interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null; // ISO string format
  created_at: string; // ISO string format
  updated_at: string; // ISO string format
  user_id: string;
  tags: string[];
}
```

This model is provided by the backend API and consumed via the existing `taskService` in the frontend.

## 3. Dashboard-Specific Data Models

### DashboardStats Model
For the statistics cards, we'll create a computed model:

```typescript
interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}
```

### Chart Data Models
Each chart requires specific data transformations:

#### Productivity Chart Data
```typescript
interface ProductivityChartData {
  date: string; // Formatted date string
  completed: number;
  pending: number;
}
```

#### Tasks Over Time Chart Data
```typescript
interface TasksOverTimeData {
  date: string; // Formatted date string
  total: number;
  completed: number;
}
```

#### Priority Distribution Data
```typescript
interface PriorityDistributionData {
  priority: 'low' | 'medium' | 'high';
  count: number;
  percentage: number;
}
```

### Task Summary Model
For the task management panel:

```typescript
interface TaskSummary {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
  updated_at: string;
  isOverdue: boolean;
}
```

## 4. Data Transformations

### Stats Calculation
The dashboard stats are calculated from the raw task data:

```typescript
function calculateDashboardStats(tasks: Task[]): DashboardStats {
  const now = new Date();

  return {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t =>
      !t.completed &&
      t.due_date &&
      new Date(t.due_date) < now
    ).length
  };
}
```

### Productivity Chart Data Transformation
```typescript
function transformForProductivityChart(tasks: Task[]): ProductivityChartData[] {
  // Group tasks by completion date and calculate daily metrics
  // Implementation will depend on actual task data structure
  const taskMap = new Map<string, { completed: number; pending: number }>();

  // Process tasks to create daily summaries
  // Return array of ProductivityChartData items
}
```

### Tasks Over Time Transformation
```typescript
function transformForTasksOverTime(tasks: Task[]): TasksOverTimeData[] {
  // Group tasks by creation date and calculate cumulative metrics
  // Return array of TasksOverTimeData items
}
```

### Priority Distribution Transformation
```typescript
function transformForPriorityDistribution(tasks: Task[]): PriorityDistributionData[] {
  const total = tasks.length;
  const priorityCounts = {
    low: 0,
    medium: 0,
    high: 0
  };

  tasks.forEach(task => {
    priorityCounts[task.priority]++;
  });

  return [
    {
      priority: 'low',
      count: priorityCounts.low,
      percentage: total > 0 ? Math.round((priorityCounts.low / total) * 100) : 0
    },
    {
      priority: 'medium',
      count: priorityCounts.medium,
      percentage: total > 0 ? Math.round((priorityCounts.medium / total) * 100) : 0
    },
    {
      priority: 'high',
      count: priorityCounts.high,
      percentage: total > 0 ? Math.round((priorityCounts.high / total) * 100) : 0
    }
  ];
}
```

## 5. Data Flow Architecture

### Data Fetching
1. Dashboard component fetches all tasks for the user via `taskService.getTasks(userId)`
2. Raw task data is processed into dashboard-specific models
3. Stats and chart data are derived from the raw task data
4. Data is cached temporarily to avoid excessive API calls

### Data Update Strategy
- Initial data load on component mount
- Automatic refresh every 30 seconds
- Manual refresh on user actions (add, edit, delete tasks)
- Optimistic updates where appropriate for better UX

## 6. Dashboard Component Data Requirements

### DashboardNavbar
- User profile information (name, email, avatar)
- Search query state
- Notification count (if implemented)

### DashboardStats
- Array of Task objects
- Calculated DashboardStats object

### Chart Components
- Array of Task objects
- Transformed chart data objects

### TaskManagementPanel
- Array of Task objects (potentially filtered)
- Search query state
- Loading and error states

### AddTaskModal
- Form state for task creation
- Validation errors

## 7. Performance Considerations

### Data Caching
- Cache task data locally in component state
- Implement smart refresh mechanisms to avoid unnecessary API calls
- Consider pagination for large task sets (though not initially required)

### Data Optimization
- Fetch only necessary fields when possible
- Implement virtual scrolling for large task lists
- Debounce search operations to prevent excessive API calls

## 8. Error Handling Data Models

### API Error Response
```typescript
interface ApiErrorResponse {
  error: string;
  message: string;
  status: number;
}
```

### Local Error State
```typescript
interface ErrorState {
  hasError: boolean;
  errorType: 'api' | 'validation' | 'network' | 'auth';
  errorMessage: string;
  canRetry: boolean;
}
```

## 9. Loading States

### Loading State Model
```typescript
interface LoadingState {
  isLoading: boolean;
  loadingType: 'initial' | 'refresh' | 'action';
  progress?: number; // For progress-indicating operations
}
```

## 10. Data Validation

### Task Creation Validation
```typescript
interface TaskValidation {
  title: {
    isValid: boolean;
    error?: string;
  };
  description?: {
    isValid: boolean;
    error?: string;
  };
  priority: {
    isValid: boolean;
    error?: string;
  };
}
```

This data model provides the foundation for the dynamic dashboard implementation, ensuring consistent data handling across all dashboard components while leveraging the existing backend API and task model.