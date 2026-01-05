# Quickstart Guide: Chat-Dashboard Integration

## Overview
This guide provides a quick overview of how to implement the chat-dashboard integration feature with real-time synchronization, enhanced chat UI, and dashboard widget.

## Prerequisites
- Python 3.11+ with FastAPI
- Node.js 18+ with Next.js
- PostgreSQL database
- Existing authentication system with JWT tokens
- WebSocket support

## Backend Implementation

### 1. WebSocket Enhancement
**File**: `backend/routers/websocket.py`

```python
# Add new event types
class WebSocketEventType:
    TASK_CREATED = "task_created"
    TASK_UPDATED = "task_updated"
    TASK_DELETED = "task_deleted"
    TASK_STATUS_CHANGED = "task_status_changed"
    SYNC_REQUEST = "sync_request"
    SYNC_RESPONSE = "sync_response"

# Update WebSocket connection handler to include authentication
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    # Verify JWT token
    user = verify_token(token)
    if not user:
        await websocket.close(code=1008)
        return
    # Add to connection manager with user ID
    await manager.connect(websocket, user.id)
```

### 2. Task Router Enhancement
**File**: `backend/routers/tasks.py`

```python
# After each task operation, broadcast WebSocket event
@router.post("/tasks/", response_model=Task)
async def create_task(task: TaskCreate, current_user: User = Depends(get_current_user)):
    db_task = create_task_in_db(task, current_user.id)
    # Broadcast to all user's connections
    await websocket_manager.broadcast({
        "type": "task_created",
        "data": {
            "task": db_task.dict(),
            "userId": current_user.id,
            "timestamp": datetime.utcnow().isoformat()
        }
    })
    return db_task
```

### 3. Chat Agent Enhancement
**File**: `backend/agents/todo_agent.py`

```python
# After agent performs task operations, trigger WebSocket broadcasts
def handle_task_creation(task_data):
    task = create_task(task_data)
    # Broadcast the created task
    asyncio.create_task(
        websocket_manager.broadcast({
            "type": "task_created",
            "data": {
                "task": task.dict(),
                "userId": task.user_id,
                "timestamp": datetime.utcnow().isoformat()
            }
        })
    )
    return task
```

### 4. Database Models
**File**: `backend/models.py`

```python
# Add ChatSession model
class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: UUID = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    title: str = Column(String(255))
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    updated_at: datetime = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active: bool = Column(Boolean, default=True)

# Add ChatMessage model
class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: UUID = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id"))
    role: str = Column(String(20))  # "user" or "assistant"
    content: str = Column(Text)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
```

## Frontend Implementation

### 1. Task Sync Context
**File**: `frontend/src/contexts/TaskSyncContext.tsx`

```typescript
interface TaskSyncContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  syncTasks: () => Promise<void>;
  isLoading: boolean;
}

const TaskSyncContext = createContext<TaskSyncContextType>({
  tasks: [],
  addTask: () => {},
  updateTask: () => {},
  deleteTask: () => {},
  syncTasks: async () => {},
  isLoading: false,
});
```

### 2. WebSocket Service
**File**: `frontend/src/services/websocketService.ts`

```typescript
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws?token=${token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect(token);
        }, 1000 * this.reconnectAttempts); // Exponential backoff
      }
    };
  }

  private handleMessage(message: any) {
    // Handle task synchronization events
    switch(message.type) {
      case 'task_created':
        this.handleTaskCreated(message.data.task);
        break;
      case 'task_updated':
        this.handleTaskUpdated(message.data.task);
        break;
      case 'task_deleted':
        this.handleTaskDeleted(message.data.task);
        break;
    }
  }
}
```

### 3. Dashboard Integration
**File**: `frontend/src/app/new-dashboard/page.tsx`

```tsx
// Wrap with TaskSyncContext provider
export default function DashboardPage() {
  return (
    <TaskSyncProvider>
      <div className="dashboard-container">
        {/* Dashboard content */}
        <TaskList />
        <MinimizedChatWidget />
      </div>
    </TaskSyncProvider>
  );
}
```

### 4. Chat Integration
**File**: `frontend/src/app/chat/page.tsx`

```tsx
// Use TaskSyncContext for task operations
export default function ChatPage() {
  const { tasks, addTask, updateTask, deleteTask } = useTaskSync();

  return (
    <div className="chat-container">
      <ChatNavbar />
      <ChatSidebar />
      <div className="chat-content">
        {/* Chat messages */}
      </div>
    </div>
  );
}
```

## Enhanced Chat Components

### 1. Chat Navbar
**File**: `frontend/src/components/chat/ChatNavbar.tsx`

```tsx
export function ChatNavbar() {
  return (
    <nav className="chat-navbar">
      <div className="logo">AI Task Assistant</div>
      <div className="chat-title">Current Conversation</div>
      <div className="nav-actions">
        <button onClick={() => navigateToDashboard()}>
          Minimize
        </button>
      </div>
    </nav>
  );
}
```

### 2. Dashboard Widget
**File**: `frontend/src/components/chat/MinimizedChatWidget.tsx`

```tsx
export function MinimizedChatWidget() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="chat-widget-container">
      {isExpanded ? (
        <ExpandedChatWindow onClose={() => setIsExpanded(false)} />
      ) : (
        <button
          className="chat-widget-button"
          onClick={() => setIsExpanded(true)}
        >
          💬
        </button>
      )}
    </div>
  );
}
```

## Environment Variables

```bash
# Backend
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_API_URL=http://localhost:8000

# Frontend
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Testing

### Unit Tests
- Test TaskSyncContext operations
- Test WebSocket event handling
- Test chat history CRUD operations
- Test task CRUD operations

### Integration Tests
- Test dashboard to chat synchronization
- Test chat to dashboard synchronization
- Test WebSocket reconnection
- Test widget expand/minimize flow

### E2E Tests
1. Create task in dashboard → Verify appears in chat
2. Update task in chat → Verify updates in dashboard
3. Delete task in dashboard → Verify removed from chat
4. Open widget → Add task → Verify in dashboard
5. Multiple browser tabs → Test sync across tabs