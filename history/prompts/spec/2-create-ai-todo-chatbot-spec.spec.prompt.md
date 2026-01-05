---
id: 2
title: create-ai-todo-chatbot-spec
stage: spec
date: 2025-12-27
surface: agent
model: claude-sonnet-4-5-20250929
feature: ai-todo-chatbot
branch: 001-ai-todo-chatbot
user: claude
command: sp.specify
labels: [specification, ai-chatbot, todo-app, phase3]
links:
  spec: specs/001-ai-todo-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - C:\\hackathon2-todo-app\\specs\\001-ai-todo-chatbot\\spec.md
 - C:\\hackathon2-todo-app\\specs\\001-ai-todo-chatbot\\checklists\\requirements.md
tests:
---

## Prompt

```
# Phase 3 Specification: AI-Powered Todo Chatbot

## SPEC METADATA
```yaml
version: 1.0.0
phase: 3
status: ready_for_implementation
priority: high
estimated_effort: 40-50 hours
technologies:
  backend: [FastAPI, OpenAI SDK, MCP, SQLModel, PostgreSQL]
  frontend: [Next.js 14, React, TypeScript, Tailwind CSS]
```

---

## 1. REQUIREMENTS OVERVIEW

### 1.1 Core Objectives
Build a professional AI chatbot interface for natural language task management with:
- Dual access points (navbar icon + floating button)
- Full-featured chat page with conversation history
- OpenAI-powered natural language understanding
- MCP tools for task operations
- Database persistence for all conversations

### 1.2 Success Criteria
- [ ] Users can access chatbot from 2 locations
- [ ] Natural language commands work (>95% accuracy)
- [ ] Chat history persists across sessions
- [ ] Response time < 2 seconds
- [ ] All existing functionality preserved
- [ ] Mobile responsive with dark mode

---

## 2. BACKEND SPECIFICATION

### 2.1 Database Schema

**New Tables:**

```sql
-- Conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_user_conversations ON conversations(user_id, updated_at DESC);

-- Chat messages table
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    metadata_json TEXT
);
CREATE INDEX idx_conversation_messages ON chat_messages(conversation_id, timestamp);
```

### 2.2 API Endpoints

**Router:** `/backend/routers/chat_router.py`

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/chat/message` | Send message to AI | Required |
| GET | `/api/chat/conversations` | List user conversations | Required |
| POST | `/api/chat/conversations/new` | Create conversation | Required |
| GET | `/api/chat/conversations/{id}/messages` | Get messages | Required |
| PUT | `/api/chat/conversations/{id}` | Update conversation | Required |
| DELETE | `/api/chat/conversations/{id}` | Delete conversation | Required |

**Request/Response Examples:**

```typescript
// POST /api/chat/message
Request: {
  conversation_id: number,
  content: string  // max 4000 chars
}
Response: {
  id: number,
  role: "assistant",
  content: string,
  timestamp: string,
  metadata_json?: string
}

// GET /api/chat/conversations
Response: {
  conversations: [{
    id: number,
    title: string,
    created_at: string,
    updated_at: string,
    is_archived: boolean
  }],
  total: number
}
```

### 2.3 MCP Tools (10 Required)

**Directory:** `/backend/mcp/`

1. **create_task** - Create new tasks with details
2. **update_task** - Modify existing tasks
3. **delete_task** - Remove tasks (with confirmation)
4. **list_tasks** - Retrieve tasks with filters
5. **search_tasks** - Search by content
6. **mark_complete** - Toggle completion status
7. **set_priority** - Update priority level
8. **add_tags** - Add tags to tasks
9. **set_due_date** - Set/update due dates
10. **get_statistics** - Get productivity stats

**Tool Schema Example:**
```python
class CreateTaskInput(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")
    due_date: Optional[str] = Field(None, description="ISO format")
    tags: Optional[List[str]] = Field(None, max_items=10)
```

### 2.4 OpenAI Agent

**Directory:** `/backend/agents/`

**Files:**
- `todo_agent.py` - Main agent class
- `prompts.py` - System prompts and tool descriptions
- `conversation_manager.py` - Conversation state

**Agent Capabilities:**
- Understand natural language commands
- Execute MCP tools as needed
- Multi-turn conversation with context
- Clarification questions for ambiguous requests
- Confirmation for destructive actions

**System Prompt Summary:**
```
You are a helpful todo assistant. You can:
- Create, update, delete tasks
- Search and filter tasks
- Mark tasks complete
- Set priorities and due dates
- Provide statistics

Be conversational, ask clarifying questions, and always
confirm before deleting tasks.
```

### 2.5 Configuration

**Add to `/backend/config.py`:**
```python
class Settings(BaseSettings):
    # Existing settings...
    openai_api_key: str
    openai_model: str = "gpt-4-turbo-preview"
    mcp_server_url: str = "http://localhost:8001"
```

**Add to `/backend/pyproject.toml`:**
```toml
[project.dependencies]
openai = "^1.12.0"
mcp = "^1.0.0"
```

---

## 3. FRONTEND SPECIFICATION

### 3.1 Component Structure

```
new-dashboard/
├── chat/
│   ├── page.tsx              # Main chat page
│   └── layout.tsx            # Chat layout wrapper
└── layout.tsx                # ADD: FloatingChatbot

components/
├── NewDashboardNavbar.tsx    # MODIFY: Add chatbot icon
├── FloatingChatbot.tsx       # NEW: Bottom-right button
└── chat/                     # NEW: All chat components
    ├── ChatSidebar.tsx
    ├── ChatHeader.tsx
    ├── MessageArea.tsx
    ├── ChatInput.tsx
    └── ChatEmptyState.tsx

contexts/
└── ChatContext.tsx           # NEW: Chat state management

services/
└── chatService.ts            # NEW: API client

types/
└── chat.types.ts             # NEW: TypeScript types
```

### 3.2 Chatbot Icons (2 Locations)

#### 3.2.1 Navbar Icon
**File:** `/frontend/src/components/NewDashboardNavbar.tsx`

**Location:** Top-right, before user profile
**Action:** Navigate to `/new-dashboard/chat`
**Icon:** MessageCircle from lucide-react
**Styling:** Uses accent color from globals.css

```tsx
<button
  onClick={() => router.push('/new-dashboard/chat')}
  className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500"
>
  <MessageCircle className="h-6 w-6" />
</button>
```

#### 3.2.2 Floating Button
**File:** `/frontend/src/components/FloatingChatbot.tsx` (NEW)

**Location:** Bottom-right corner
**Position:** `fixed bottom-6 right-6 z-50`
**Size:** 56px × 56px
**Action:** Toggle mini-chat OR navigate to full chat
**Styling:** Gradient background, pulse animation

**Mini-Chat Interface:**
- Size: 320px × 480px
- Position: Above button
- Features: Quick preview, expand button
- Animation: Slide-up from bottom

### 3.3 Full Chat Page

**Route:** `/new-dashboard/chat/page.tsx`

**Layout:**
```
┌────────────────────────────────────────────┐
│ NewDashboardNavbar                          │
├──────────┬─────────────────────────────────┤
│ Sidebar  │ Chat Area                       │
│ (280px)  │                     `

### 3.4 Component Specifications

#### ChatSidebar
**Purpose:** Conversation list and management

**Features:**
- New Chat button (primary CTA)
- Search conversations
- Grouped by date (Today, Yesterday, Last 7 days, etc.)
- Active conversation highlighted
- Hover actions: Delete, Rename
- Scroll for long lists

#### MessageArea
**Purpose:** Display conversation messages

**Features:**
- User messages: Right-aligned, blue gradient
- AI messages: Left-aligned, gray background
- Markdown rendering for AI responses
- Code syntax highlighting
- Copy button on hover
- Auto-scroll to bottom
- Typing indicator
- Avatar icons

#### ChatInput
**Purpose:** Message input interface

**Features:**
- Auto-resize textarea (1-4 rows, max 120px)
- Send button (arrow icon)
- Keyboard shortcuts:
  - Enter: Send
  - Shift+Enter: New line
- Disabled during AI response
- Placeholder: "Ask me to manage your tasks..."

#### ChatEmptyState
**Purpose:** Initial state when no conversation selected

**Content:**
- Welcome message
- Bot icon with gradient
- Suggested prompts:
  - "Show me my tasks for today"
  - "Create a high priority task"
  - "What tasks are due this week?"
  - "Mark all shopping tasks as complete"

### 3.5 State Management

**ChatContext** (`/frontend/src/contexts/ChatContext.tsx`):

```typescript
interface ChatContextType {
  // State
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;

  // Actions
  createConversation: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  updateConversationTitle: (id: string, title: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
}
```

### 3.6 Styling Requirements

**Colors:** Use existing globals.css variables
- Primary: Existing brand colors
- Backgrounds: Existing light/dark values
- Text: Existing foreground colors
- Borders: Existing border colors

**Animations:**
- Message appear: Fade + slide-up (200ms)
- Sidebar: Slide-in (300ms)
- Button hover: Scale 1.02 (150ms)
- Floating chatbot: Bounce on mount

**Responsive:**
- Mobile (< 768px): Hamburger sidebar, full-width chat
- Tablet (768-1024px): Collapsible sidebar
- Desktop (> 1024px): Fixed sidebar (280px)

---

## 4. NATURAL LANGUAGE EXAMPLES

The AI should understand these commands:

**Task Creation:**
- "Create a task to buy groceries"
- "Add high priority task: finish report by Friday"
- "Remind me to call mom tomorrow at 3 PM"

**Task Management:**
- "Show me all my tasks"
- "What tasks are due today?"
- "List high priority tasks"
- "Show incomplete work tasks"

**Task Updates:**
- "Mark grocery task as done"
- "Change project report to high priority"
- "Reschedule morning meetings to 2 PM"
- "Add urgent tag to presentation task"

**Task Deletion:**
- "Delete the grocery task"
- "Remove all completed tasks"

**Information:**
- "How many tasks do I have?"
- "What's my most urgent task?"
- "Show my productivity stats"

---

## 5. TESTING REQUIREMENTS

### 5.1 Backend Tests
**File:** `/backend/tests/test_chat.py`

**Test Cases:**
- Create/list/delete conversations
- Send message and receive AI response
- MCP tool execution
- Agent processes natural language
- Authentication and authorization
- Rate limiting
- Error handling

### 5.2 Frontend Tests
**Files:** `/frontend/src/__tests__/chat/*.test.tsx`

**Test Cases:**
- ChatSidebar: Render, create, delete conversations
- MessageArea: Display messages, typing indicator
- ChatInput: Send message, keyboard shortcuts
- ChatContext: State updates, API calls
- Integration: Full chat flow

**Coverage Target:** > 80%

---

## 6. SECURITY & PERFORMANCE

### 6.1 Security
- Input validation (max 4000 chars, sanitize HTML)
- Rate limiting (10 messages/minute)
- Authentication on all endpoints
- Data isolation by user_id
- HTTPS only in production

### 6.2 Performance
- Message send: < 2 seconds
- Chat page load: < 1 second
- Conversation list: < 300ms
- Database query: < 100ms (p95)
- Virtualize long message lists

---

## 7. DEPLOYMENT

### 7.1 Environment Variables

**Backend:**
```env
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=...
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CHAT_ENABLED=true
```

### 7.2 Database Migration
```bash
cd backend
alembic revision --autogenerate -m "Add chat models"
alembic upgrade head
```

### 7.3 Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] OpenAI API key set
- [ ] Rate limiting enabled
- [ ] Error tracking (Sentry) configured
- [ ] CORS properly set
- [ ] SSL/TLS enabled
- [ ] Monitoring active

---

## 8. CRITICAL PRESERVATION RULES

### 8.1 DO NOT MODIFY
- Any files in `/frontend/src/app/(protected)/`
- Any files in `/frontend/src/app/` except `new-dashboard/`
- Existing components (except NewDashboardNavbar)
- Existing routers in `/backend/routers/` except chat_router
- Existing models (only ADD Conversation, ChatMessage)
- Database schema for existing tables
- `/frontend/src/app/globals.css`

### 8.2 ONLY MODIFY
- `/frontend/src/components/NewDashboardNavbar.tsx` - Add chatbot icon
- `/frontend/src/app/new-dashboard/layout.tsx` - Add FloatingChatbot
- `/backend/models.py` - Add new models
- `/backend/main.py` - Include chat router

### 8.3 CREATE NEW FILES
All files in:
- `/backend/mcp/`
- `/backend/agents/`
- `/backend/routers/chat_router.py`
- `/frontend/src/app/new-dashboard/chat/`
- `/frontend/src/components/chat/`
- `/frontend/src/contexts/ChatContext.tsx`
- `/frontend/src/services/chatService.ts`
- `/frontend/src/types/chat.types.ts`

---

## 9. ACCEPTANCE CRITERIA

### Must Have ✅
- [ ] Chatbot icon in NewDashboardNavbar navigates to chat
- [ ] Floating chatbot button visible on new-dashboard
- [ ] Full chat page renders at `/new-dashboard/chat`
- [ ] Can create and delete conversations
- [ ] Can send messages and receive AI responses
- [ ] AI understands all example commands (Section 4)
- [ ] Chat history persists in database
- [ ] Sidebar shows conversations grouped by date
- [ ] Messages display with proper styling
- [ ] Mobile responsive (sidebar, messages, input)
- [ ] Dark mode works correctly
- [ ] No existing functionality broken
- [ ] All tests passing (>80% coverage)
- [ ] No console errors

### Should Have 📋
- [ ] Search conversations
- [ ] Rename conversations
- [ ] Typing indicator
- [ ] Markdown rendering
- [ ] Code syntax highlighting
- [ ] Copy message button
- [ ] Error handling
- [ ] Loading states

---

## 10. IMPLEMENTATION TIMELINE

**Week 1: Backend (7 days)**
- Days 1-2: Database models, migrations, chat router
- Days 3-4: MCP server and tools
- Days 5-7: OpenAI agent integration

**Week 2: Frontend (7 days)**
- Days 8-9: Chatbot icons and navigation
- Days 10-12: Chat page components
- Days 13-14: Integration, ChatContext, styling

**Week 3: Testing & Deploy (5 days)
- Days 15-16: Write and run all tests
- Days 17-18: Deployment and configuration
- Day 19: Documentation and demo video

---

## 11. DELIVERABLES

**Backend:**
1. `/backend/mcp/` - Complete MCP server
2. `/backend/agents/` - OpenAI agent implementation
3. `/backend/routers/chat_router.py` - Chat API
4. `/backend/models.py` - New models added
5. `/backend/tests/test_chat.py` - Tests

**Frontend:**
1. `/frontend/src/app/new-dashboard/chat/` - Chat page
2. `/frontend/src/components/chat/` - All chat components
3. `/frontend/src/components/FloatingChatbot.tsx` - Floating button
4. `/frontend/src/contexts/ChatContext.tsx` - State management
5. `/frontend/src/services/chatService.ts` - API service
6. `/frontend/src/types/chat.types.ts` - Type definitions
7. Modified: `NewDashboardNavbar.tsx` - Chatbot icon
8. `/frontend/src/__tests__/chat/` - Component tests

**Documentation:**
- README updates
- API documentation
- User guide for chatbot
- Demo video (<90 seconds)

---

## 12. SUCCESS METRICS

**Technical:**
- Response time < 2 seconds
- Uptime > 99.5%
- Error rate < 1%
- Test coverage > 80%

**User Experience:*  be careful do not remove and overwirte any other specification folder just create a new folder and create
specification  in it C:\hackathon2-todo-app\specs  create anew folder in this path
```

## Response snapshot

Created the Phase 3 specification for the AI-powered todo chatbot feature. The specification includes:
- User scenarios and testing with prioritized user stories
- Functional requirements for the chatbot interface, task management, and data persistence
- Success criteria with measurable outcomes
- Quality checklist validation

The specification covers both backend (MCP server, OpenAI integration) and frontend (chat interface, components) requirements while preserving existing functionality.

## Outcome

- ✅ Impact: Created comprehensive specification for AI todo chatbot feature
- 🧪 Tests: N/A for specification creation
- 📁 Files: Created specs/001-ai-todo-chatbot/spec.md and checklists/requirements.md
- 🔁 Next prompts: Planning and implementation of the AI chatbot feature
- 🧠 Reflection: Specification provides clear guidance for implementing the AI chatbot feature with clear user stories and requirements

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Not applicable
- Prompt variant (if applicable): Not applicable
- Next experiment (smallest change to try): Begin planning the implementation based on the specification