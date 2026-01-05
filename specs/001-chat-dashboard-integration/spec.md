# Hackathon Phase-3: Chat-Dashboard Integration Specification

## Overview
This specification outlines the integration between the chat interface and dashboard, ensuring real-time synchronization of tasks, improving the chat UI/UX, and adding a minimized chatbot widget on the dashboard.

## Critical Requirements
⚠️ **IMPORTANT**: 
- Do NOT remove any existing files or folders
- Do NOT delete any existing feature code
- Do NOT modify unrelated functionality
- All changes must be additive or enhancement-focused
- Preserve all existing working features

## Current Architecture Review

### Backend Structure
```
backend/
├── agents/
│   └── todo_agent.py (AI agent for task operations)
├── routers/
│   ├── chat_router.py (Chat endpoints)
│   └── tasks.py (Task CRUD endpoints)
├── models.py (Database models)
├── schemas.py (Pydantic schemas)
└── main.py (FastAPI app)
```

### Frontend Structure
```
frontend/src/
├── app/
│   ├── new-dashboard/ (Working dashboard - PRIMARY ROUTE)
│   └── chat/ (Chat interface)
├── components/
│   ├── chat/ (Chat components)
│   ├── AddTaskModal.tsx
│   ├── EditTaskModal.tsx
│   └── TaskItem.tsx
├── contexts/
│   ├── ChatContext.tsx
│   └── DashboardContext.tsx
└── services/
    ├── chatService.ts
    └── apiService.ts
```

## Feature 1: Real-Time Task Synchronization

### 1.1 Backend Requirements

#### WebSocket Enhancement
**File**: `backend/routers/websocket.py`

```python
# ADD these event types (don't remove existing ones)
class WebSocketEventType:
    # Existing events...
    TASK_CREATED = "task_created"
    TASK_UPDATED = "task_updated"
    TASK_DELETED = "task_deleted"
    TASK_STATUS_CHANGED = "task_status_changed"
    SYNC_REQUEST = "sync_request"
    SYNC_RESPONSE = "sync_response"
```

**Requirements**:
- Add WebSocket broadcast functionality for task operations
- Emit events when tasks are created/updated/deleted via:
  - Dashboard task modals
  - Chat agent operations
  - Direct API calls
- Handle sync requests from clients
- Maintain existing WebSocket functionality

#### Task Router Enhancement
**File**: `backend/routers/tasks.py`

**Requirements**:
- After EACH task operation (create/update/delete), broadcast WebSocket event
- Include full task data in broadcasts
- Don't modify existing endpoint signatures
- Example pattern:
```python
# After creating task
await websocket_manager.broadcast({
    "type": "task_created",
    "data": task_dict,
    "user_id": current_user.id
})
```

#### Chat Agent Enhancement
**File**: `backend/agents/todo_agent.py`

**Requirements**:
- After agent performs task operations, trigger WebSocket broadcasts
- Ensure agent responses include updated task lists
- Add context awareness of existing dashboard tasks
- Don't remove existing agent tools/functionality

### 1.2 Frontend Requirements

#### Unified Task State Management
**File**: `frontend/src/contexts/TaskSyncContext.tsx` (NEW)

```typescript
interface TaskSyncContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  syncTasks: () => Promise<void>;
  isLoading: boolean;
}
```

**Requirements**:
- Create new context to manage task state globally
- Connect to WebSocket for real-time updates
- Provide methods for CRUD operations
- Sync with backend on mount and reconnection
- Handle optimistic updates with rollback on failure

#### Dashboard Integration
**File**: `frontend/src/app/new-dashboard/page.tsx`

**Requirements**:
- Wrap with TaskSyncContext provider
- Subscribe to task updates via context
- Update UI when WebSocket events received
- Show real-time notifications for task changes from chat
- Don't remove existing dashboard features

#### Chat Integration
**File**: `frontend/src/app/chat/page.tsx`

**Requirements**:
- Use TaskSyncContext for task operations
- Display current task count from dashboard
- Show recently added tasks from dashboard
- Update chat context when tasks change externally

#### WebSocket Service Enhancement
**File**: `frontend/src/services/websocketService.ts` (NEW or UPDATE)

**Requirements**:
- Establish WebSocket connection on app load
- Handle reconnection logic
- Parse and dispatch task events
- Provide subscription API for components
- Handle authentication token refresh

## Feature 2: Enhanced Chat Interface

### 2.1 Chat Navbar
**File**: `frontend/src/components/chat/ChatNavbar.tsx` (NEW)

**Requirements**:
- Professional navbar design matching dashboard style
- Include:
  - App logo/branding
  - Current chat title (editable)
  - User profile dropdown
  - Settings icon
  - Minimize button (redirects to dashboard with widget)
- Responsive design
- Sticky positioning

### 2.2 Chat Sidebar Enhancement
**File**: `frontend/src/components/chat/ChatSidebar.tsx` (NEW or UPDATE existing)

**Requirements**:
- "New Chat" button at top (already exists - enhance)
- Chat history list with:
  - Automatically generated chat names
  - Timestamp
  - Three-dot menu per chat with:
    - Rename option
    - Share option (copy shareable link)
    - Delete option with confirmation
- Store chat history in database
- Default: Always open with a new chat session
- Collapsible on mobile

### 2.3 Chat Welcome Screen
**File**: `frontend/src/components/chat/ChatWelcome.tsx` (NEW)

**Requirements**:
- Display when no messages in current chat
- Include:
  - Prominent heading: "Your AI Task Assistant"
  - Subtitle/description of capabilities
  - Example prompts/suggestions (cards):
    - "Add a new task"
    - "Show my pending tasks"
    - "Update task status"
    - "What's due today?"
  - Quick stats from dashboard (total tasks, pending, completed)
- Fade out when first message sent
- Professional, Claude-inspired design

### 2.4 Chat Layout Structure
**File**: `frontend/src/app/chat/layout.tsx`

**Requirements**:
- Add navbar at top
- Sidebar on left (collapsible)
- Main chat area in center
- Preserve existing chat functionality
- Responsive breakpoints

## Feature 3: Dashboard Chatbot Widget

### 3.1 Minimized Chat Widget
**File**: `frontend/src/components/chat/MinimizedChatWidget.tsx` (NEW)

**Requirements**:
- Position: Fixed bottom-right corner of dashboard
- Animated pulse effect (subtle)
- Chatbot icon (modern, friendly)
- Z-index above other elements
- Accessible (keyboard navigation, ARIA labels)

### 3.2 Expanded Chat Window
**File**: `frontend/src/components/chat/ExpandedChatWindow.tsx` (NEW)

**Requirements**:
- Opens as modal/overlay when widget clicked
- Dimensions: ~400px width, ~600px height
- Contains:
  - Header with title and minimize/expand buttons
  - Chat messages area
  - Input field
  - Same chat context as full chat page
- Full chat functionality:
  - Add tasks
  - Update tasks
  - Delete tasks
  - View tasks
  - Natural language processing
- "Expand" button redirects to `/chat` with same context
- Draggable (optional enhancement)

### 3.3 Dashboard Integration
**File**: `frontend/src/app/new-dashboard/page.tsx`

**Requirements**:
- Add MinimizedChatWidget component
- Position in bottom-right corner
- Don't interfere with existing dashboard elements
- Maintain z-index hierarchy
- Persist minimized/expanded state in localStorage

## Feature 4: Task CRUD Enhancement in Dashboard

### 4.1 Task Update Functionality
**File**: `frontend/src/components/EditTaskModal.tsx`

**Requirements**:
- Already exists - ensure it's properly connected
- Call from TaskItem component
- Trigger WebSocket broadcast after update
- Show success/error notifications
- Update local state optimistically

**File**: `frontend/src/components/TaskItem.tsx`

**Requirements**:
- Add edit button/icon if not present
- Open EditTaskModal on click
- Add delete button with confirmation
- Show loading states during operations

### 4.2 Task Delete Functionality
**File**: `frontend/src/components/TaskItem.tsx`

**Requirements**:
- Add delete button (trash icon)
- Confirmation dialog before deletion
- Call API endpoint: `DELETE /api/tasks/{task_id}`
- Trigger WebSocket broadcast
- Remove from UI optimistically with rollback on error

### 4.3 Component Integration
**File**: `frontend/src/app/new-dashboard/page.tsx`

**Requirements**:
- Ensure AddTaskModal is called and functional
- Ensure EditTaskModal is called from TaskItem
- Ensure TaskItem includes update/delete actions
- Wire up all event handlers
- Connect to TaskSyncContext

## Feature 5: Database Schema

### 5.1 Chat History Table
**File**: `backend/models.py`

**Requirements**:
- Add ChatSession model if not exists:
```python
class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id: UUID
    user_id: UUID (foreign key)
    title: str
    created_at: datetime
    updated_at: datetime
    is_active: bool
```

- Add ChatMessage model if not exists:
```python
class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id: UUID
    session_id: UUID (foreign key)
    role: str (user/assistant)
    content: str
    created_at: datetime
```

### 5.2 Migration
**File**: `backend/alembic/versions/xxx_add_chat_tables.py` (NEW)

**Requirements**:
- Create migration for new tables
- Run migration automatically or provide instructions

## Implementation Order

1. **Phase 1: Backend WebSocket Enhancement**
   - Update websocket.py with new event types
   - Modify task router to broadcast events
   - Enhance chat agent to trigger broadcasts
   - Test WebSocket events

2. **Phase 2: Frontend State Management**
   - Create TaskSyncContext
   - Create WebSocket service
   - Connect dashboard to context
   - Connect chat to context
   - Test real-time synchronization

3. **Phase 3: Chat UI Enhancement**
   - Create ChatNavbar component
   - Enhance ChatSidebar component
   - Create ChatWelcome component
   - Update chat layout
   - Add chat history management
   - Test chat interface

4. **Phase 4: Dashboard Widget**
   - Create MinimizedChatWidget
   - Create ExpandedChatWindow
   - Integrate into dashboard
   - Connect to chat context
   - Test widget functionality

5. **Phase 5: Task CRUD Enhancement**
   - Verify/enhance EditTaskModal
   - Add update/delete to TaskItem
   - Wire up event handlers
   - Test all CRUD operations

6. **Phase 6: Testing & Polish**
   - End-to-end testing
   - Fix any synchronization issues
   - Polish UI/UX
   - Add error handling
   - Performance optimization

## Testing Requirements

### Unit Tests
- TaskSyncContext operations
- WebSocket event handling
- Chat history CRUD operations
- Task CRUD operations

### Integration Tests
- Dashboard to chat synchronization
- Chat to dashboard synchronization
- WebSocket reconnection
- Widget expand/minimize flow

### E2E Tests
1. Create task in dashboard → Verify appears in chat
2. Update task in chat → Verify updates in dashboard
3. Delete task in dashboard → Verify removed from chat
4. Open widget → Add task → Verify in dashboard
5. Multiple browser tabs → Test sync across tabs

## Technical Specifications

### WebSocket Protocol
```json
{
  "type": "task_created" | "task_updated" | "task_deleted",
  "data": {
    "task": { /* Task object */ },
    "userId": "string",
    "timestamp": "ISO8601"
  }
}
```

### API Endpoints (Verify/Create)
- `GET /api/chat/sessions` - List chat sessions
- `POST /api/chat/sessions` - Create new session
- `GET /api/chat/sessions/{id}/messages` - Get messages
- `POST /api/chat/sessions/{id}/messages` - Add message
- `DELETE /api/chat/sessions/{id}` - Delete session
- `PATCH /api/chat/sessions/{id}` - Update session title

### Environment Variables
```
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Design Guidelines

### Color Scheme (Match existing dashboard)
- Primary: From dashboard theme
- Secondary: From dashboard theme
- Accent: Use for pulse animation
- Background: Match dashboard background

### Typography
- Headings: Match dashboard font
- Body: Match dashboard font
- Code blocks: Monospace font

### Spacing & Layout
- Consistent padding/margin with dashboard
- Responsive breakpoints matching dashboard
- Component sizing aligned with design system

## Non-Functional Requirements

### Performance
- **NFR-PERF-001**: 95% of sync operations must complete within 1 second under normal load
- **NFR-PERF-002**: WebSocket event propagation must complete within 1 second under normal network conditions
- **NFR-PERF-003**: Dashboard and chat interface must maintain responsive UI during sync operations
- **NFR-PERF-004**: Widget expand/collapse must complete within 300ms
- **NFR-PERF-005**: System must support 1000+ concurrent tasks per user without performance degradation

### Security
- **NFR-SEC-001**: WebSocket connections must be authenticated with valid JWT tokens from existing auth system
- **NFR-SEC-002**: Users can only receive updates for their own tasks
- **NFR-SEC-003**: All API endpoints must validate user permissions
- **NFR-SEC-004**: Chat message content must be properly sanitized

### Reliability
- **NFR-REL-001**: System must maintain 99.9% uptime for synchronization functionality
- **NFR-REL-002**: WebSocket connections must automatically recover from temporary network issues
- **NFR-REL-003**: 95% of synchronization operations must complete successfully
- **NFR-REL-004**: System must gracefully degrade with local caching when WebSocket unavailable
- **NFR-REL-005**: System must gracefully handle database connection interruptions

### Data Management
- **NFR-DM-001**: Chat sessions and messages must be stored in PostgreSQL with existing connection
- **NFR-DM-002**: Concurrent edits to the same task must be resolved using last write wins with timestamp-based resolution
- **NFR-DM-003**: All database operations must use proper transaction handling

### Usability
- **NFR-USAB-001**: All new UI components must follow existing dashboard design patterns
- **NFR-USAB-002**: Widget must be intuitive and not interfere with dashboard functionality
- **NFR-USAB-003**: All interactive elements must provide appropriate feedback
- **NFR-USAB-004**: Error messages must be user-friendly and actionable

## Success Criteria

✅ Tasks created in dashboard appear in chat instantly
✅ Tasks added via chat appear in dashboard instantly
✅ Task updates in dashboard reflect in chat instantly
✅ Task updates in chat reflect in dashboard instantly
✅ Task deletions sync across both interfaces
✅ Chat has professional navbar and enhanced sidebar
✅ Chat welcome screen displays on new chat
✅ Chat history is persisted and manageable
✅ Dashboard widget is functional and professional
✅ Widget expands to full chat with context preservation
✅ Dashboard task items have update/delete options
✅ All operations show loading states and error handling
✅ Real-time sync works across multiple browser tabs
✅ No existing features are broken or removed

## Clarifications

### Session 2025-12-29

- Q: What authentication approach should be used for WebSocket connections? → A: All WebSocket connections require valid JWT tokens from existing auth system
- Q: How should concurrent edits to the same task be resolved? → A: Last write wins with timestamp-based resolution
- Q: What are the performance requirements for sync operations? → A: 95% of sync operations complete within 1 second under normal load
- Q: Where should chat sessions and messages be stored? → A: Chat sessions and messages stored in PostgreSQL with existing connection
- Q: How should the system handle WebSocket connection failures? → A: Graceful degradation with local caching when WebSocket unavailable

## Notes for Implementation

- Review all existing files before making changes
- Test each phase independently before moving to next
- Use TypeScript for type safety
- Follow existing code style and patterns
- Add comprehensive error handling
- Include loading states for all async operations
- Use optimistic updates with rollback on failure
- Ensure accessibility (ARIA labels, keyboard navigation)
- Make responsive for mobile devices
- Add proper logging for debugging
- Document any new environment variables needed

---

**End of Specification**