# 🚀 Complete Dashboard Application Fix Specifications

## 📋 Project Overview
A Next.js 14 todo/task management dashboard with FastAPI backend that requires complete functional implementation. Currently, all components are static with no real functionality.

---

## 🎯 Primary Issues to Fix

### 1. **Backend Integration Issues**
- ❌ Tasks not persisting to database
- ❌ Stats endpoint returning static/incorrect data
- ❌ Tags API not implemented (404 errors)
- ❌ Notifications API not implemented (404 errors)
- ❌ Projects API partially working
- ❌ CORS errors on some endpoints
- ❌ WebSocket authentication failing (403 errors)

### 2. **Frontend Component Issues**
- ❌ All dashboard components showing static/dummy data
- ❌ No real-time updates
- ❌ Forms not submitting to backend
- ❌ Graphs/charts not rendering actual data
- ❌ Task operations not saving (create, update, delete)
- ❌ Filter and sort functionality not working
- ❌ Profile page is UI only (no functionality)
- ❌ Settings page is UI only (no functionality)
- ❌ Help page is UI only (no functionality)

### 3. **UI/UX Issues**
- ❌ Graphs poorly styled
- ❌ Inconsistent loading states
- ❌ No error handling/display
- ❌ Mobile responsiveness issues
- ❌ Dashboard layout breaks on different screen sizes

---

## 📁 Current Project Structure

```
project-root/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── models.py              # Database models (User, Task, Project)
│   ├── database.py            # SQLAlchemy setup
│   ├── auth.py               # JWT authentication
│   ├── schemas.py            # Pydantic schemas
│   ├── config.py             # Settings/config
│   ├── routers/
│   │   ├── tasks.py          # Task CRUD endpoints ⚠️ Partially working
│   │   ├── projects.py       # Project endpoints ⚠️ Partially working
│   │   ├── stats.py          # Statistics endpoint ⚠️ Static data
│   │   ├── auth.py           # Login/register endpoints ✅ Working
│   │   └── tags.py           # ❌ DELETED (needs reimplementation)
│   └── tasks.db              # SQLite database
│
└── frontend/
    └── src/
        ├── app/
        │   ├── (auth)/
        │   │   ├── login/
        │   │   └── register/
        │   ├── new-dashboard/          # ⚠️ MAIN FOCUS AREA
        │   │   ├── page.tsx           # ❌ Static dashboard
        │   │   ├── overview/          # ❌ Static overview
        │   │   ├── tasks/             # ❌ Tasks not saving
        │   │   ├── projects/          # ❌ Projects not working
        │   │   ├── analytics/         # ❌ Static charts
        │   │   ├── calendar/          # ❌ No functionality
        │   │   ├── notifications/     # ❌ Static notifications
        │   │   ├── profile/           # ❌ UI only
        │   │   ├── settings/          # ❌ UI only
        │   │   └── help/              # ❌ UI only
        │   └── layout.tsx
        ├── components/
        │   ├── ui/                    # Shadcn components ✅
        │   ├── dashboard/             # ❌ All static
        │   ├── tasks/                 # ❌ Forms not submitting
        │   └── charts/                # ❌ No real data
        ├── contexts/
        │   ├── AuthContext.tsx        # ✅ Working
        │   └── DashboardContext.tsx   # ⚠️ API calls failing
        ├── services/
        │   └── apiService.ts          # ⚠️ Some endpoints not implemented
        ├── types/
        │   └── types.ts               # Type definitions
        └── lib/
            └── utils.ts
```

---

## 🔧 Technical Stack

### Backend
- **Framework**: FastAPI 0.104+
- **Database**: SQLite with SQLAlchemy
- **Authentication**: JWT tokens with 30-minute expiration and automatic refresh using refresh tokens (7-day expiration)
- **CORS**: FastAPI CORS middleware
- **Port**: 8000

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: React Context API
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Port**: 3000

---

## 🎯 Detailed Requirements

### **PHASE 1: Backend API Implementation** (Priority: CRITICAL)

#### 1.1 Fix Task Persistence
**File**: `backend/routers/tasks.py`

**Current Issues**:
- Tasks created but not saving to database
- Update operations not persisting
- Delete operations failing silently
- No input validation
- No proper error handling

**Required Implementation**:
```python
# All endpoints must:
1. Accept snake_case from database
2. Return camelCase to frontend
3. Properly commit to database
4. Handle errors with proper HTTP status codes
5. Validate user ownership of resources
6. Implement input validation (title: 3-100 chars, description: max 1000 chars)
7. Include proper error logging with tracking IDs

# Required endpoints:
GET    /api/v1/tasks                    # List all user tasks
POST   /api/v1/tasks                    # Create task
GET    /api/v1/tasks/{task_id}         # Get single task
PUT    /api/v1/tasks/{task_id}         # Update task
DELETE /api/v1/tasks/{task_id}         # Delete task
PATCH  /api/v1/tasks/{task_id}/toggle  # Toggle completion

# Input validation requirements:
- Task title: 3-100 characters, non-empty
- Task description: max 1000 characters
- Priority: must be one of ['low', 'medium', 'high']
- Status: must be one of ['pending', 'in-progress', 'completed']
```

**Expected Response Format** (camelCase):
```json
{
  "id": "task_123",
  "title": "Complete project",
  "description": "Finish the dashboard",
  "status": "pending",
  "priority": "high",
  "dueDate": "2024-12-31T00:00:00Z",
  "projectId": "proj_1",
  "userId": "user_123",
  "tags": ["urgent", "work"],
  "createdAt": "2024-12-24T10:00:00Z",
  "updatedAt": "2024-12-24T10:00:00Z"
}
```

#### 1.2 Implement Tags System
**File**: `backend/routers/tags.py` (CREATE NEW)

**Database Model** (Add to `models.py`):
```python
class Tag(Base):
    __tablename__ = "tags"

    id = Column(String, primary_key=True, default=lambda: f"tag_{uuid.uuid4().hex[:8]}")
    name = Column(String, nullable=False)
    color = Column(String, default="#3B82F6")
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="tags")
```

**Required Endpoints**:
```python
GET    /api/v1/tags           # List all user tags
POST   /api/v1/tags           # Create tag
PUT    /api/v1/tags/{tag_id}  # Update tag
DELETE /api/v1/tags/{tag_id}  # Delete tag

# Input validation requirements:
- Tag name: 3-100 characters, non-empty
- Color: valid hex color format
```

**Expected Response Format** (camelCase):
```json
{
  "id": "tag_123abcde",
  "name": "work",
  "color": "#3B82F6",
  "userId": "user_123",
  "createdAt": "2024-12-24T10:00:00Z"
}
```

#### 1.3 Fix Stats Endpoint
**File**: `backend/routers/stats.py`

**Current Issue**: Returns static dummy data

**Required Implementation**:
- Calculate real-time statistics from database
- Group by priority, project, date ranges
- Calculate completion rate
- Generate productivity trend (last 7 days)

**Expected Response**:
```json
{
  "total": 25,
  "completed": 15,
  "pending": 8,
  "overdue": 2,
  "byPriority": {
    "high": 8,
    "medium": 12,
    "low": 5
  },
  "byProject": [
    {
      "projectId": "proj_1",
      "projectName": "Website Redesign",
      "count": 10
    }
  ],
  "completionRate": 60,
  "productivityTrend": [
    {
      "date": "2024-12-18",
      "completed": 3,
      "created": 5
    }
  ]
}
```

#### 1.4 Implement Notifications System
**File**: `backend/routers/notifications.py` (CREATE NEW)

**Database Model** (Add to `models.py`):
```python
class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    message = Column(String)
    type = Column(String)  # 'info', 'warning', 'success', 'error'
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="notifications")
```

**Required Endpoints**:
```python
GET    /api/v1/notifications              # Get all notifications
POST   /api/v1/notifications              # Create notification
PATCH  /api/v1/notifications/{id}/read    # Mark as read
PATCH  /api/v1/notifications/read-all     # Mark all as read
DELETE /api/v1/notifications/{id}         # Delete notification
```

#### 1.5 Fix Projects API
**File**: `backend/routers/projects.py`

**Issues to Fix**:
- Ensure proper CRUD operations
- Add task count to project responses
- Implement project statistics

**Additional Endpoint Needed**:
```python
GET /api/v1/projects/{project_id}/tasks  # Get all tasks for a project
GET /api/v1/projects/{project_id}/stats  # Get project statistics
```

#### 1.6 WebSocket for Real-time Notifications
**File**: `backend/main.py`

**Implement**:
```python
from fastapi import WebSocket, WebSocketDisconnect

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        # Verify user identity and authorization before connecting
        self.active_connections[user_id] = websocket

    async def disconnect(self, user_id: str):
        self.active_connections.pop(user_id, None)

    async def send_notification(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, token: str = Query(...)):
    # Verify JWT token and ensure user_id matches token's user
    user = verify_token_and_get_user(token)
    if user.id != user_id:
        await websocket.close(code=1008, reason="Unauthorized")
        return

    await manager.connect(user_id, websocket)
    try:
        while True:
            # Only receive messages from client if needed (typically one-way for notifications)
            data = await websocket.receive_text()
            # Process client messages if needed
    except WebSocketDisconnect:
        await manager.disconnect(user_id)
```

**Security Requirements**:
- Verify JWT token before establishing WebSocket connection
- Ensure user_id parameter matches authenticated user
- Implement proper connection cleanup
- Add rate limiting to prevent abuse

---

### **PHASE 2: Frontend Dynamic Implementation** (Priority: HIGH)

#### 2.1 Fix API Service Layer
**File**: `frontend/src/services/apiService.ts`

**Current Issues**:
- Mock implementations returning empty arrays
- Missing error handling
- No retry logic
- No input validation
- No error tracking

**Required Implementation**:

```typescript
// Remove ALL mock implementations
// Implement real API calls for:

export const tagService = {
  getTags: async (userId: string): Promise<Tag[]> => {
    const response = await api.get(`/tags?userId=${userId}`);
    return response.data;
  },
  createTag: async (userId: string, tag: Omit<Tag, 'id'>): Promise<Tag> => {
    // Input validation
    if (!tag.name || tag.name.length < 3 || tag.name.length > 100) {
      throw new Error('Tag name must be between 3 and 100 characters');
    }
    const response = await api.post('/tags', { ...tag, userId });
    return response.data;
  },
  updateTag: async (userId: string, id: string, updates: Partial<Tag>): Promise<Tag> => {
    // Input validation
    if (updates.name && (updates.name.length < 3 || updates.name.length > 100)) {
      throw new Error('Tag name must be between 3 and 100 characters');
    }
    const response = await api.put(`/tags/${id}`, updates);
    return response.data;
  },
  deleteTag: async (userId: string, id: string): Promise<void> => {
    await api.delete(`/tags/${id}`);
  }
};

export const notificationService = {
  getNotifications: async (userId: string): Promise<Notification[]> => {
    const response = await api.get(`/notifications?userId=${userId}`);
    return response.data;
  },
  markAsRead: async (userId: string, id: string): Promise<Notification> => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async (userId: string): Promise<void> => {
    await api.patch('/notifications/read-all', { userId });
  },
  deleteNotification: async (userId: string, id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  }
};

// Add comprehensive error handling with retry mechanism
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Error tracking with unique IDs
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    } else if (error.response?.status >= 500) {
      // Server error - implement retry with exponential backoff
      const maxRetries = 3;
      let retryCount = 0;

      while (retryCount < maxRetries) {
        try {
          retryCount++;
          // Exponential backoff: 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          return await api(error.config);
        } catch (retryError) {
          if (retryCount === maxRetries) {
            console.error(`API Error [${errorId}]:`, error.response?.data || error.message);
            // Report error for monitoring
            reportError(errorId, error.response?.data || error.message, error.config.url);
            throw retryError;
          }
        }
      }
    } else {
      console.error(`API Error [${errorId}]:`, error.response?.data || error.message);
      reportError(errorId, error.response?.data || error.message, error.config.url);
    }
    throw error;
  }
);

// Error reporting function
function reportError(errorId: string, message: string, url: string) {
  // Send error to monitoring service
  console.log(`Error reported [${errorId}]: ${message} at ${url}`);
}
```

#### 2.2 Fix Dashboard Context
**File**: `frontend/src/contexts/DashboardContext.tsx`

**Current Issues**:
- Try-catch blocks swallowing errors
- Setting empty arrays on API failures
- No retry mechanism

**Required Changes**:
```typescript
// Remove fallback to empty arrays - let errors propagate
// Add proper loading states
// Implement optimistic updates for better UX
// Add WebSocket connection for real-time updates

useEffect(() => {
  if (!user?.id) return;

  // WebSocket connection
  const ws = new WebSocket(`ws://localhost:8000/ws/${user.id}`);
  
  ws.onmessage = (event) => {
    const notification = JSON.parse(event.data);
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  return () => ws.close();
}, [user?.id]);
```

#### 2.3 Fix Dashboard Overview Page
**File**: `frontend/src/app/new-dashboard/page.tsx`

**Make Dynamic**:
```typescript
// Remove all static data
// Connect to DashboardContext
// Display real stats from backend
// Add loading skeletons
// Show error states

const DashboardPage = () => {
  const { stats, tasks, loading, error } = useDashboard();
  
  if (loading.stats || loading.tasks) {
    return <DashboardSkeleton />;
  }
  
  if (error) {
    return <ErrorDisplay message={error} />;
  }
  
  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />
      <TasksOverview tasks={tasks} />
      <ProductivityChart data={stats.productivityTrend} />
    </div>
  );
};
```

#### 2.4 Fix Tasks Page
**File**: `frontend/src/app/new-dashboard/tasks/page.tsx`

**Implement**:
- Real task list from backend
- Working create/edit/delete operations
- Filter by status, priority, tags, date range
- Sort by date, priority, title
- Drag and drop to reorder (optional)
- Bulk operations (mark complete, delete)

**Required Components**:
```typescript
- <TaskList />          // Display all tasks with filters
- <TaskForm />          // Create/edit task modal
- <TaskFilters />       // Filter and sort controls
- <TaskCard />          // Individual task display
- <BulkActions />       // Select multiple tasks
```

#### 2.5 Fix Analytics Page
**File**: `frontend/src/app/new-dashboard/analytics/page.tsx`

**Current Issue**: Static dummy charts

**Implement Real Charts**:
```typescript
import { LineChart, BarChart, PieChart } from 'recharts';

// 1. Productivity Trend (Line Chart)
- X-axis: Last 30 days
- Y-axis: Tasks completed vs created
- Data from stats.productivityTrend

// 2. Tasks by Priority (Pie Chart)
- Data from stats.byPriority
- Show high, medium, low

// 3. Tasks by Project (Bar Chart)
- Data from stats.byProject
- Show task count per project

// 4. Completion Rate (Progress Bar)
- Data from stats.completionRate
- Animated progress

// 5. Weekly Summary (Cards)
- This week vs last week
- Percentage change
```

**Styling Requirements**:
```css
- Proper responsive grid layout
- Smooth animations on data updates
- Consistent color scheme (Tailwind palette)
- Loading states for each chart
- Empty states when no data
- Tooltips on hover
```

#### 2.6 Fix Projects Page
**File**: `frontend/src/app/new-dashboard/projects/page.tsx`

**Implement**:
- Project list with task count
- Create/edit/delete projects
- Project detail view with tasks
- Project statistics
- Project color picker
- Archive/unarchive functionality

#### 2.7 Fix Calendar View
**File**: `frontend/src/app/new-dashboard/calendar/page.tsx`

**Current**: Empty/non-functional

**Implement**:
- Monthly calendar view
- Show tasks on due dates
- Click date to see tasks
- Drag tasks to change due date
- Color code by priority
- Filter by project/tags

**Suggested Library**: `react-big-calendar` or build custom

#### 2.8 Fix Profile Page
**File**: `frontend/src/app/new-dashboard/profile/page.tsx`

**Current**: UI only, no functionality

**Implement**:
- Display user info from AuthContext
- Edit profile form (name, email, avatar)
- Change password functionality
- Upload profile picture
- Save to backend user endpoint

**Required Backend Endpoint** (Add to `backend/routers/auth.py`):
```python
GET    /api/v1/users/me          # Get current user
PUT    /api/v1/users/me          # Update user profile
POST   /api/v1/users/me/avatar   # Upload avatar
PUT    /api/v1/users/me/password # Change password
```

#### 2.9 Fix Settings Page
**File**: `frontend/src/app/new-dashboard/settings/page.tsx`

**Current**: UI only

**Implement**:
```typescript
// Settings Categories:

1. Appearance
   - Theme (light/dark/system)
   - Accent color
   - Font size
   
2. Notifications
   - Enable/disable notifications
   - Email notifications
   - Push notifications
   - Notification types
   
3. Task Defaults
   - Default priority
   - Default project
   - Auto-archive completed tasks
   - Task reminder settings
   
4. Data Management
   - Export data (JSON/CSV)
   - Import data
   - Clear completed tasks
   - Delete account
```

**Backend Endpoints** (Add to `backend/routers/users.py`):
```python
GET    /api/v1/users/me/preferences
PUT    /api/v1/users/me/preferences
POST   /api/v1/users/me/export-data
```

#### 2.10 Fix Help Page
**File**: `frontend/src/app/new-dashboard/help/page.tsx`

**Current**: Static UI

**Implement**:
- Searchable FAQ
- Quick actions guide
- Keyboard shortcuts
- Video tutorials (embed)
- Contact support form
- Changelog/updates

---

### **PHASE 3: UI/UX Improvements** (Priority: MEDIUM)

#### 3.1 Chart Styling
**Files**: All chart components

**Requirements**:
- Use consistent Recharts configuration
- Tailwind color palette
- Smooth animations
- Responsive sizing
- Proper legends
- Tooltips with formatted data
- Loading skeletons

**Standard Chart Config**:
```typescript
const chartConfig = {
  colors: {
    primary: '#3B82F6',    // blue-500
    secondary: '#10B981',  // green-500
    accent: '#F59E0B',     // amber-500
    danger: '#EF4444',     // red-500
  },
  animation: {
    duration: 800,
    easing: 'ease-in-out'
  },
  responsive: true,
  maintainAspectRatio: false
};
```

#### 3.2 Loading States
**Global**: Add to all data-fetching components

**Implement**:
```typescript
// Skeleton Components
- <TaskListSkeleton />
- <CardSkeleton />
- <ChartSkeleton />
- <TableSkeleton />

// Use Shadcn Skeleton component
import { Skeleton } from '@/components/ui/skeleton';
```

#### 3.3 Error Handling
**Global**: Add to all components

**Implement**:
```typescript
// Error Boundary
- Wrap app in ErrorBoundary
- Show user-friendly error messages
- Retry button
- Report error option

// Toast Notifications
import { toast } from '@/components/ui/use-toast';

// On error:
toast({
  title: "Error",
  description: "Failed to load tasks",
  variant: "destructive",
});
```

#### 3.4 Mobile Responsiveness
**All Pages**

**Requirements**:
- Mobile-first design
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible sidebar on mobile
- Touch-friendly buttons (min 44x44px)
- Horizontal scroll for tables
- Bottom navigation for mobile

---

### **PHASE 4: Data Flow & State Management** (Priority: HIGH)

#### 4.1 Data Flow Architecture

```
Backend (SQLite)
    ↓
FastAPI Endpoints (snake_case)
    ↓
Frontend API Service (converts to camelCase)
    ↓
Dashboard Context (global state)
    ↓
Components (local state + context)
    ↓
UI (Tailwind + Shadcn)
```

#### 4.2 Case Conversion
**Critical**: Backend uses snake_case, Frontend uses camelCase

**Implement in API Service**:
```typescript
// Utility functions
const toCamelCase = (obj: any): any => {
  // Convert snake_case to camelCase
};

const toSnakeCase = (obj: any): any => {
  // Convert camelCase to snake_case
};

// Apply to all API calls
api.interceptors.request.use((config) => {
  if (config.data) {
    config.data = toSnakeCase(config.data);
  }
  return config;
});

api.interceptors.response.use((response) => {
  if (response.data) {
    response.data = toCamelCase(response.data);
  }
  return response;
});
```

#### 4.3 Optimistic Updates
**Implement in Dashboard Context**

```typescript
// For better UX, update UI immediately then sync with backend
const createTask = async (taskData) => {
  // 1. Create optimistic task
  const optimisticTask = {
    id: `temp_${Date.now()}`,
    ...taskData,
    createdAt: new Date().toISOString()
  };
  
  // 2. Update UI immediately
  dispatch({ type: 'ADD_TASK', payload: optimisticTask });
  
  try {
    // 3. Save to backend
    const savedTask = await taskService.createTask(userId, taskData);
    
    // 4. Replace optimistic with real data
    dispatch({ type: 'UPDATE_TASK', payload: { 
      id: optimisticTask.id, 
      updates: savedTask 
    }});
  } catch (error) {
    // 5. Rollback on error
    dispatch({ type: 'DELETE_TASK', payload: optimisticTask.id });
    toast.error('Failed to create task');
  }
};
```

---

## 🧪 Testing Requirements

### Backend Testing
```bash
# Test with curl/Postman:

# 1. Create task
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "Testing",
    "priority": "high",
    "status": "pending",
    "user_id": "user_123"
  }'

# 2. Get tasks
curl http://localhost:8000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Get stats
curl http://localhost:8000/api/v1/tasks/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: Real data, not empty arrays or static values
```

### Frontend Testing
```typescript
// 1. Create task → should persist in database
// 2. Refresh page → task should still be there
// 3. Update task → changes should save
// 4. Delete task → should remove from database
// 5. Check browser console → no errors
// 6. Check Network tab → API calls succeeding
```

---

## 📊 Success Criteria

### Must Have (Critical)
- ✅ Tasks persist to database
- ✅ Real-time stats from backend
- ✅ All CRUD operations working
- ✅ No console errors
- ✅ Proper loading states
- ✅ Error handling implemented with retry mechanism
- ✅ Tags system working with validation
- ✅ Notifications working
- ✅ JWT token authentication with automatic refresh
- ✅ Input validation implemented (task titles: 3-100 chars, descriptions: max 1000 chars)
- ✅ Error logging with tracking IDs

### Should Have (Important)
- ✅ WebSocket real-time updates
- ✅ Optimistic UI updates
- ✅ Mobile responsive
- ✅ Charts displaying real data
- ✅ Profile page functional
- ✅ Settings page functional
- ✅ Filters and sorting working
- ✅ Circuit breaker pattern for service failures
- ✅ Ownership-based access control (users access only their own data)

### Nice to Have (Optional)
- ✅ Drag and drop
- ✅ Keyboard shortcuts
- ✅ Dark mode
- ✅ Export/import data
- ✅ Calendar view
- ✅ Bulk operations

---

## 🚀 Implementation Order

### Step 1: Backend Foundation (2-3 hours)
1. Fix task persistence in `tasks.py` with validation (3-100 chars for title, max 1000 for description)
2. Implement tags system with validation (3-100 chars for name)
3. Fix stats endpoint with real calculations
4. Implement notifications API
5. Implement JWT token refresh mechanism (30 min access token, 7-day refresh token)
6. Test all endpoints with Postman/curl

### Step 2: Frontend API Integration (1-2 hours)
1. Remove mock implementations from `apiService.ts`
2. Implement comprehensive error handling with retry mechanism (exponential backoff, max 3 attempts)
3. Add case conversion utilities
4. Add input validation (3-100 chars for title, max 1000 for description)
5. Add error logging with tracking IDs
6. Test API calls in browser console

### Step 3: Security & Authentication (1 hour)
1. Implement JWT token refresh logic
2. Add ownership-based access control (users access only their own data)
3. Secure WebSocket connections with token verification
4. Test authentication flow

### Step 4: Dashboard Context (1 hour)
1. Fix error handling in context
2. Implement WebSocket connection with proper authentication
3. Add optimistic updates
4. Test state management

### Step 5: Core Components (3-4 hours)
1. Fix Tasks page (priority #1)
2. Fix Dashboard overview
3. Fix Analytics page
4. Fix Projects page

### Step 6: Secondary Pages (2-3 hours)
1. Fix Profile page
2. Fix Settings page
3. Fix Calendar view
4. Fix Help page

### Step 7: UI Polish (2-3 hours)
1. Fix chart styling
2. Add loading states
3. Improve mobile responsiveness
4. Add error boundaries

### Step 8: Testing & Debugging (2 hours)
1. End-to-end testing
2. Fix any remaining bugs
3. Performance optimization
4. Final QA

---

## 🔥 Common Pitfalls to Avoid

1. **Case Mismatch**: Backend snake_case vs Frontend camelCase
2. **Missing Commits**: Database changes not committed
3. **CORS Issues**: Ensure backend allows frontend origin
4. **Token Expiry**: Implement token refresh logic
5. **Race Conditions**: Handle multiple simultaneous requests
6. **Memory Leaks**: Cleanup WebSocket connections
7. **Stale Data**: Implement proper cache invalidation

---

## 📝 Environment Variables

### Backend `.env`
```env
DATABASE_URL=sqlite:///./tasks.db
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

## 🎨 Design System

### Colors (Tailwind)
```typescript
primary: 'blue-500'      // #3B82F6
success: 'green-500'     // #10B981
warning: 'amber-500'     // #F59E0B
danger: 'red-500'        // #EF4444
neutral: 'slate-500'     // #64748B
```

### Typography
```typescript
headings: 'font-semibold'
body: 'font-normal'
code: 'font-mono'
```

### Spacing
```typescript
sections: 'space-y-6'
cards: 'p-6'
lists: 'space-y-4'
```

---

## 📚 Additional Resources

### Documentation
- FastAPI: https://fastapi.tiangolo.com/
- Next.js: https://nextjs.org/docs
- Shadcn UI: https://ui.shadcn.com/
- Recharts: https://recharts.org/

### Code Examples
- See existing working components in the codebase
- Follow patterns from `AuthContext.tsx` (this works correctly)
- Reference Shadcn UI examples for component usage

---

## ✅ Final Checklist

Before considering the project complete:

- [ ] Backend server starts without errors
- [ ] All database models created
- [ ] All API endpoints returning correct data with proper validation
- [ ] Frontend builds without errors
- [ ] Can create, read, update, delete tasks with validation (3-100 chars for title, max 1000 for description)
- [ ] JWT token authentication with automatic refresh working (30 min access token, 7-day refresh token)
- [ ] Stats show real data
- [ ] Graphs render actual data
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Loading states implemented
- [ ] Error handling implemented with retry mechanism (exponential backoff, max 3 attempts)
- [ ] Error logging with tracking IDs working
- [ ] Input validation implemented throughout the application
- [ ] WebSocket working with proper authentication
- [ ] Ownership-based access control (users access only their own data)
- [ ] Profile page functional
- [ ] Settings page functional
- [ ] All pages in new-dashboard route working
- [ ] Circuit breaker pattern implemented for service failures
- [ ] All security requirements met

---

## 🎯 Summary

This specification document provides **complete instructions** for fixing the entire dashboard application. Focus on **backend data persistence first**, then **frontend integration**, then **UI polish**. Follow the implementation order and test thoroughly at each step.

**Primary Goal**: Make the application fully functional with real data, proper error handling, and good UX.

**Expected Timeline**: 12-15 hours for complete implementation by an experienced developer.

## Clarifications

### Session 2025-12-24

- Q: What JWT token expiration and refresh strategy should be implemented? → A: JWT access tokens expire in 30 minutes with refresh tokens that expire in 7 days, with automatic refresh 5 minutes before expiration
- Q: What input validation strategy should be used? → A: Implement comprehensive validation: task titles (3-100 chars), descriptions (max 1000 chars), with sanitization to prevent XSS
- Q: What error handling and retry mechanism should be implemented? → A: Automatic retry with exponential backoff (3 attempts max), circuit breaker for failed services, fallback to cached data
- Q: What user role and access control model should be used? → A: Single user role with ownership-based access control (users only access their own data)
- Q: What error logging approach should be implemented? → A: Comprehensive error logging with user-friendly messages, error tracking IDs, and automatic error reporting

Good luck! 🚀