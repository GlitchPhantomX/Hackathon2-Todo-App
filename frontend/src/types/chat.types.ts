// TypeScript types for chat entities

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  message_type?: 'text' | 'command' | 'response';
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface SyncEvent {
  type: 'task_created' | 'task_updated' | 'task_deleted' | 'task_status_changed';
  data: {
    task: Task;
    userId: string;
    timestamp: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  projectId?: string;
}

export interface TaskSyncState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  websocketStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export interface TaskSyncContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  syncTasks: () => Promise<void>;
  isLoading: boolean;
  websocketStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  createConversation: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  updateConversationTitle: (id: string, title: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
}
