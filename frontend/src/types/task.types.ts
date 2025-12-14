export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  dueDate?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string;
}

export interface TaskFilter {
  status?: 'all' | 'active' | 'completed';
  search?: string;
  allCount?: number;
  activeCount?: number;
  completedCount?: number;
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