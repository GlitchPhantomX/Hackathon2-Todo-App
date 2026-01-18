export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  status?: 'pending' | 'completed';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  projectId?: string;

  // Recurring task fields
  isRecurring: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrenceEndDate?: string;
  parentTaskId?: string;
  recurrencePattern?: Record<string, any>;

  // Reminder fields
  reminderEnabled: boolean;
  reminderTiming: '15min' | '1hr' | '1day';
  reminderSent: boolean;

  // Timezone field
  timezone: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  dueDate?: string;

  // Recurring task fields
  isRecurring?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrenceEndDate?: string;
  recurrencePattern?: Record<string, any>;

  // Reminder fields
  reminderEnabled?: boolean;
  reminderTiming?: '15min' | '1hr' | '1day';

  // Timezone field
  timezone?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string;

  // Recurring task fields
  isRecurring?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrenceEndDate?: string;
  recurrencePattern?: Record<string, any>;

  // Reminder fields
  reminderEnabled?: boolean;
  reminderTiming?: '15min' | '1hr' | '1day';

  // Timezone field
  timezone?: string;
}

export interface RecurringTaskSeries {
  id: string;
  originalTaskId: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrenceEndDate?: string;
  totalInstances: number;
  activeInstances: number;
}

export interface ReminderSettings {
  reminderEnabled: boolean;
  reminderTiming: '15min' | '1hr' | '1day';
}

export interface Reminder extends Task {
  reminderType: 'REMINDER_DUE_15MIN' | 'REMINDER_DUE_1HR' | 'REMINDER_DUE_1DAY' | 'REMINDER_OVERDUE';
  timeUntilDueMinutes: number;
  priority: 'low' | 'medium' | 'high';
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilter {
  status?: 'all' | 'active' | 'completed';
  search?: string;
  allCount?: number;
  activeCount?: number;
  completedCount?: number;
  priority?: 'low' | 'medium' | 'high';
  startDate?: string;
  endDate?: string;
  projectId?: string;
}

export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

export interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  getTasks: () => Promise<void>;
  getTask: (id: string) => Promise<Task>;
  createTask: (data: TaskCreate) => Promise<Task>;
  updateTask: (id: string, data: TaskUpdate) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
}

// Additional utility types
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';
export type ReminderTiming = '15min' | '1hr' | '1day';
export type ReminderType = 'REMINDER_DUE_15MIN' | 'REMINDER_DUE_1HR' | 'REMINDER_DUE_1DAY' | 'REMINDER_OVERDUE';

// Interface for task creation form state
export interface TaskFormState {
  title: string;
  description: string;
  dueDate?: string;
  priority: TaskPriority;
  projectId?: string;
  tagIds: string[];

  // Recurring task options
  isRecurring: boolean;
  frequency: TaskFrequency;
  recurrenceEndDate?: string;
  recurrencePattern?: Record<string, any>;

  // Reminder options
  reminderEnabled: boolean;
  reminderTiming: ReminderTiming;

  // Timezone
  timezone: string;
}

// Interface for recurring task configuration
export interface RecurringTaskConfig {
  isRecurring: boolean;
  frequency: TaskFrequency;
  recurrenceEndDate?: string;
  recurrencePattern?: Record<string, any>;
}

// Interface for reminder configuration
export interface ReminderConfig {
  reminderEnabled: boolean;
  reminderTiming: ReminderTiming;
}

// Interface for timezone configuration
export interface TimezoneConfig {
  timezone: string;
}