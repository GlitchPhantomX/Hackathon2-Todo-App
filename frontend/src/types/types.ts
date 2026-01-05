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
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  taskId?: string;
  taskTitle?: string;
  read: boolean;
  createdAt: string;
  icon?: string;
  color?: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  defaultPriority: 'low' | 'medium' | 'high';
  defaultProjectId?: string;
  defaultView: 'list' | 'grid';
  itemsPerPage: number;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  byProject: Array<{
    projectId: string;
    projectName: string;
    count: number;
  }>;
  completionRate: number;
  productivityTrend: Array<{
    date: string;
    created: number;
    completed: number;
    score: number;
  }>;
}