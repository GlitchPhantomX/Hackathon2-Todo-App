---
id: 1
title: create-constitution-for-ai-todo-chatbot
stage: constitution
date: 2025-12-27
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: claude
command: sp.constitution
labels: [constitution, ai-chatbot, todo-app]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - C:\\hackathon2-todo-app\\.specify\\memory\\constitution.md
tests:
---

## Prompt

```
# Phase 3: AI-Powered Todo Chatbot - Complete Constitution

## 🎯 Core Objective
Implement a professional AI-powered chatbot using OpenAI ChatKit, Agents SDK, and Official MCP SDK that allows users to manage their todo list via natural language while maintaining all existing Phase 1 and Phase 2 functionality.

## ⚠️ CRITICAL PRESERVATION RULES

### DO NOT TOUCH - Protected Areas
The following files, folders, and functionalities MUST remain completely untouched:

1. **Protected Routes & Components:**
   - `/frontend/src/app/(protected)/*` - All protected routes
   - `/frontend/src/app/calendar/*`
   - `/frontend/src/app/help/*`
   - `/frontend/src/app/login/*`
   - `/frontend/src/app/priorities/*`
   - `/frontend/src/app/profile/*`
   - `/frontend/src/app/projects/*`
   - `/frontend/src/app/register/*`
   - `/frontend/src/app/reminders/*`
   - `/frontend/src/app/settings/*`
   - `/frontend/src/app/statistics/*`
   - `/frontend/src/app/tags/*`
   - `/frontend/src/app/tasks/*`
   - `/frontend/src/app/today/*`
   - `/frontend/src/app/upcoming/*`

2. **Protected Backend Files:**
   - All existing routers in `/backend/routers/*`
   - All existing models in `/backend/models.py`
   - All existing schemas in `/backend/schemas.py`
   - Database configuration in `/backend/db.py` and `/backend/database/db.py`
   - Authentication files in `/backend/routers/auth_router.py`
   - All utility files in `/backend/utils/*`

3. **Protected Frontend Core:**
   - All existing components in `/frontend/src/components/*` except where explicitly extended
   - All existing contexts in `/frontend/src/contexts/*` except where explicitly extended
   - All existing services in `/frontend/src/services/*` except where explicitly extended
   - Global styles in `/frontend/src/app/globals.css`

### Working Area - New Dashboard Only
ALL new chatbot features will ONLY be added to:
- `/frontend/src/app/new-dashboard/*` and its subdirectories
- `/frontend/src/components/NewDashboardNavbar.tsx`
- `/frontend/src/app/new-dashboard/page.tsx`

---

## 📋 PHASE 3 REQUIREMENTS BREAKDOWN

### Backend Requirements (FastAPI + MCP SDK)

#### 1. MCP Server Implementation
Create a Model Context Protocol server for todo management operations.

**Location:** `/backend/mcp/`

**Files to Create:**
- `/backend/mcp/server.py` - Main MCP server implementation
- `/backend/mcp/tools.py` - MCP tool definitions
- `/backend/mcp/schemas.py` - MCP-specific schemas
- `/backend/mcp/__init__.py`

**MCP Tools Required:**
1. `create_task` - Add new tasks
2. `update_task` - Modify existing tasks
3. `delete_task` - Remove tasks
4. `list_tasks` - Retrieve tasks with filters
5. `search_tasks` - Search tasks by content
6. `mark_complete` - Toggle completion status
7. `set_priority` - Set task priority
8. `add_tags` - Add tags to tasks
9. `set_due_date` - Set/update due dates
10. `get_statistics` - Get user task statistics

#### 2. OpenAI Agents SDK Integration
Create agent-based chat interface for natural language task management.

**Location:** `/backend/agents/`

**Files to Create:**
- `/backend/agents/todo_agent.py` - Main agent implementation
- `/backend/agents/conversation_manager.py` - Conversation state management
- `/backend/agents/prompts.py` - System prompts and instructions
- `/backend/agents/__init__.py`

**Agent Capabilities:**
- Understand natural language task commands
- Multi-turn conversations with context
- Clarification questions for ambiguous requests
- Confirm destructive actions (delete, bulk updates)
- Provide helpful responses and summaries

#### 3. Chat API Endpoints
Create new router for chat functionality.

**Location:** `/backend/routers/chat_router.py`

**Endpoints to Create:**
```python
POST   /api/chat/message              # Send message to chatbot
GET    /api/chat/conversations        # List user conversations
GET    /api/chat/conversations/{id}   # Get conversation details
DELETE /api/chat/conversations/{id}   # Delete conversation
POST   /api/chat/conversations/new    # Start new conversation
GET    /api/chat/history/{conv_id}    # Get conversation history
```

#### 4. Database Models
Add new models for chat functionality.

**Location:** `/backend/models.py`

**Models to Add:**
```python
class Conversation(SQLModel, table=True):
    """User conversation sessions"""
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str  # Auto-generated from first message
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_archived: bool = Field(default=False)

class ChatMessage(SQLModel, table=True):
    """Individual chat messages"""
    id: int | None = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id")
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata_json: str | None = None  # For tool calls, etc.
```

#### 5. Configuration Updates
Add OpenAI API configuration.

**Location:** `/backend/config.py`

**Add:**
```python
class Settings(BaseSettings):
    # ... existing settings ...
    openai_api_key: str
    openai_model: str = "gpt-4-turbo-preview"
    mcp_server_url: str = "http://localhost:8001"
```

#### 6. Dependencies
Add required packages.

**Location:** `/backend/pyproject.toml`

**Add to dependencies:**
```toml
[project.dependencies]
openai = "^1.12.0"
mcp = "^1.0.0"
```

---

### Frontend Requirements (Next.js + React)

#### 1. Chatbot Icon Integration

##### A. NewDashboardNavbar Integration
**File:** `/frontend/src/components/NewDashboardNavbar.tsx`

**Requirements:**
- Add chatbot icon button in the top-right area (before user profile menu)
- Icon: Use MessageCircle or Bot from lucide-react
- Color: Use accent color from globals.css
- Click behavior: Navigate to `/new-dashboard/chat`
- Badge: Show unread message count (if any)
- Tooltip: "AI Assistant"

**Implementation Location:**
```tsx
// Add button between notifications and user menu
<div className="flex items-center gap-4">
  {/* Existing notifications */}
  <ChatbotIconButton />  {/* NEW */}
  {/* Existing user menu */}
</div>
```

##### B. Bottom-Right Floating Chatbot
**File:** `/frontend/src/components/FloatingChatbot.tsx` (NEW)

**Requirements:**
- Floating button at bottom-right of new-dashboard pages
- Position: `fixed bottom-6 right-6`
- Z-index: High enough to appear above content
- Icon: MessageCircle with animation on hover
- Colors: Primary gradient from globals.css
- Click behavior: Toggle mini-chat interface
- Only visible on new-dashboard routes

**Mini Chat Interface:**
- Compact chat window (320px × 480px)
- Slide-up animation from bottom
- Draggable header
- Minimizable
- Auto-close on route change (optional)
- Full conversation history access
- Quick actions: New chat, minimize, expand to full screen

#### 2. Full Chat Page
**Location:** `/frontend/src/app/new-dashboard/chat/page.tsx` (NEW)

**Layout Structure:**
```
┌─────────────────────────────- Auto-generated title (first 40 chars of first message)
     - Timestamp
     - Hover actions: Rename, Delete
   - Active conversation highlighted
   - Scroll for long lists
   - Loading states

2. **Chat Header** (`/frontend/src/components/chat/ChatHeader.tsx`):
   - Conversation title (editable on click)
   - Timestamp
   - Actions: Archive, Delete, Share (future)
   - Model selector (dropdown: GPT-4, GPT-3.5)

3. **Message Area** (`/frontend/src/components/chat/MessageArea.tsx`):
   - Auto-scroll to bottom on new messages
   - Smooth scroll behavior
   - Message bubbles:
     - User: Right-aligned, primary gradient background
     - AI: Left-aligned, secondary background
   - Avatar icons (user icon, AI bot icon)
   - Timestamp on hover
   - Copy button on hover
   - Code block syntax highlighting (if present)
   - Markdown rendering for AI responses
   - Loading indicator for AI response
   - Typing indicator animation

4. **Input Area** (`/frontend/src/components/chat/ChatInput.tsx`):
   - Textarea with auto-expand (max 4 lines)
   - Send button (arrow icon)
   - Keyboard shortcuts:
     - Enter: Send message
     - Shift+Enter: New line
   - File upload button (future phase)
   - Character counter (if needed)
   - Disabled during AI response
   - Placeholder: "Ask me to manage your tasks..."

5. **Empty State** (`/frontend/src/components/chat/ChatEmptyState.tsx`):
   - Displayed when no conversation selected
   - Welcome message
   - Suggested prompts:
     - "Show me my tasks for today"
     - "Create a high priority task"
     - "What tasks are due this week?"
     - "Mark all shopping tasks as complete"

#### 3. Color Scheme & Styling
**Must use existing globals.css variables:**

Extract from `/frontend/src/app/globals.css`:
- Primary colors: Use existing gradient colors
- Background colors: Use existing dark/light theme variables
- Text colors: Use existing foreground/muted text colors
- Border colors: Use existing border variables
- Accent colors: Use existing accent for highlights

**Component Styling Requirements:**
- Consistent with existing new-dashboard design
- Smooth transitions and animations
- Responsive (mobile, tablet, desktop)
- Dark mode support (follow existing theme)
- Loading states with skeleton loaders
- Error states with appropriate messages

#### 4. State Management

**New Context:** `/frontend/src/contexts/ChatContext.tsx`

**State to Manage:**
```typescript
interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  createConversation: () => Promise<string>;
  loadConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  updateConversationTitle: (id: string, title: string) => Promise<void>;
  clearError: () => void;
}
```

**Integration with DashboardContext:**
- Do NOT modify existing DashboardContext
- Import and use existing auth state
- Import and use existing task data for context

#### 5. API Service
**File:** `/frontend/src/services/chatService.ts` (NEW)

**Functions:**
```typescript
export const chatService = {
  sendMessage: async (conversationId: string, message: string): Promise<ChatMessage> => {},
  getConversations: async (): Promise<Conversation[]> => {},
  getConversationMessages: async (conversationId: string): Promise<ChatMessage[]> => {},
  createConversation: async (): Promise<Conversation> => {},
  deleteConversation: async (conversationId: string): Promise<void> => {},
  updateConversationTitle: async (conversationId: string, title: string): Promise<void> => {},
};
```

#### 6. TypeScript Types
**File:** `/frontend/src/types/chat.types.ts` (NEW)

```typescript
export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ChatContextType {
  // ... as defined above
}
```

---

## 🎨 UI/UX SPECIFICATIONS

### Design Principles
1. **Professional & Clean:** Follow ChatGPT/Claude.ai design patterns
2. **Consistent:** Match existing new-dashboard aesthetic
3. **Responsive:** Mobile-first approach
4. **Accessible:** ARIA labels, keyboard navigation
5. **Performant:** Lazy loading, virtualization for long chats

### Animation Specifications
- Message appearance: Fade + slide-up (200ms)
- Sidebar transitions: Slide-in (300ms ease-out)
- Button hover: Scale 1.02 + shadow (150ms)
- Floating chatbot: Bounce on mount, pulse on new message
- Loading states: Skeleton shimmer animation

### Responsive Breakpoints
```css
/* Mobile: < 768px */
- Hide sidebar by default
- Hamburger menu for conversation list
- Floating chatbot smaller (56px)
- Full-width chat interface

/* Tablet: 768px - 1024px */
- Collapsible sidebar
- Full chat features
- Adjust spacing

/* Desktop: > 1024px */
- Fixed sidebar (280px)
- Optimal chat width (600-800px)
- Full features visible
```

---

## 🔧 IMPLEMENTATION WORKFLOW

### Phase 3A: Backend Setup (Days 1-2)
1. Create MCP server structure
2. Implement MCP tools for all task operations
3. Add database models for conversations and messages
4. Create chat router with all endpoints
5. Integrate OpenAI Agents SDK
6. Test MCP tools independently
7. Test chat endpoints with Postman/Thunder Client

### Phase 3B: Frontend - Chatbot Icons (Day 3)
1. Create FloatingChatbot component
2. Integrate chatbot icon in NewDashboardNavbar
3. Create mini-chat interface
4. Test both icon placements
5. Implement routing to full chat page

### Phase 3C: Frontend - Full Chat Interface (Days 4-5)
1. Create chat page route structure
2. Implement ChatSidebar component
3. Implement ChatHeader component
4. Implement MessageArea component
5. Implement ChatInput component
6. Create ChatEmptyState component

### Phase 3D: State & Services (Day 6)
1. Create ChatContext
2. Implement chatService
3. Connect components to context
4. Test full chat flow

### Phase 3E: Integration & Polish (Day 7)
1. Connect frontend to backend
2. Test complete chat functionality
3. Add error handling
4. Implement loading states
5. Add animations and transitions
6. Mobile responsiveness testing
7. Cross-browser testing

---

## 🧪 TESTING REQUIREMENTS

### Backend Tests
**Location:** `/backend/tests/test_chat.py` (NEW)

**Test Cases:**
1. MCP server initialization
2. Each MCP tool functionality
3. Chat message endpoint
4. Conversation CRUD operations
5. Agent response generation
6. Error handling
7. Authentication integration

### Frontend Tests
**Location:** `/frontend/src/__tests__/chat/` (NEW)

**Test Files:**
- `ChatSidebar.test.tsx`
- `MessageArea.test.tsx`
- `ChatInput.test.tsx`
- `FloatingChatbot.test.tsx`
- `ChatContext.test.tsx`

**Test Scenarios:**
1. Component rendering
2. User interactions
3. State updates
4. API integration
5. Error states
6. Loading states
7. Responsive behavior

---

## 📝 NATURAL LANGUAGE EXAMPLES

The chatbot should handle these example queries:

### Task Creation
- "Create a task to buy groceries"
- "Add a high priority task: Finish project report by Friday"
- "Remind me to call mom tomorrow at 3 PM"

### Task Management
- "Show me all my tasks"
- "What tasks are due today?"
- "List high priority tasks"
- "Show incomplete tasks tagged as work"

### Task Updates
- "Mark 'buy groceries' as complete"
- "Change priority of 'project report' to urgent"
- "Reschedule my morning meetings to 2 PM"
- "Add tag 'urgent' to the presentation task"

### Task Deletion
- "Delete the grocery task"
- "Remove all completed tasks"
- "Clear tasks from last month"

### Information Queries
- "How many tasks do I have?"
- "What's my most urgent task?"
- "Show my productivity for this week"
- "What tasks am I behind on?"

---

## 🔐 SECURITY CONSIDERATIONS

1. **API Key Protection:**
   - Store OpenAI API key in environment variables
   - Never expose in frontend code
   - Use backend proxy for all AI calls

2. **User Data Isolation:**
   - All chat queries filtered by user_id
   - Conversations are user-specific
   - No cross-user data leakage

3. **Input Validation:**
   - Sanitize all user inputs
   - Validate message length (max 4000 chars)
   - Rate limiting on chat endpoint (10 messages/minute)

4. **Authentication:**
   - Require authentication for all chat endpoints
   - Use existing auth middleware
   - Validate JWT tokens

---

## 📚 DOCUMENTATION REQUIREMENTS

### Backend Documentation
**File:** `/backend/routers/chat_router.py`

- Docstrings for all endpoints
- Request/response schemas
- Example usage
- Error responses

### Frontend Documentation
**File:** `/frontend/src/app/new-dashboard/chat/README.md` (NEW)

- Component hierarchy
- Props documentation
- Usage examples
- Styling guide

### User Documentation
**File:** `/docs/CHATBOT_USER_GUIDE.md` (NEW)

- How to access chatbot
- Example commands
- Tips for best results
- Troubleshooting

---

## ✅ DEFINITION OF DONE

### Backend Checklist
- [ ] MCP server running and responsive
- [ ] All 10 MCP tools implemented and tested
- [ ] Chat router with all endpoints working
- [ ] Database models created and migrated
- [ ] OpenAI integration functional
- [ ] Conversation history persisted
- [ ] All tests passing
- [ ] Error handling comprehensive
- [ ] API documentation complete

### Frontend Checklist
- [ ] Chatbot icon in NewDashboardNavbar
- [ ] Floating chatbot button on new-dashboard
- [ ] Mini-chat interface functional
- [ ] Full chat page at /new-dashboard/chat
- [ ] Chat sidebar with conversation list
- [ ] Message area with proper styling
- [ ] Input area with keyboard shortcuts
- [ ] Real-time message updates
- [ ] Loading and error states
- [ ] Mobile responsive
- [ ] Dark mode support
- [ ] All animations smooth
- [ ] No console errors
- [ ] All tests passing

### Integration Checklist
- [ ] Frontend successfully calls backend APIs
- [ ] Messages sent and received correctly
- [ ] Conversation history loads properly
- [ ] New conversations created successfully
- [ ] Task operations work via chat
- [ ] Authentication working
- [ ] No conflicts with existing functionality
- [ ] Cross-browser tested
- [ ] Performance acceptable

---

## 🚫 ANTI-PATTERNS TO AVOID

1. **DO NOT:**
   - Modify existing dashboard routes or components
   - Change existing API endpoints
   - Alter database schema for existing tables
   - Remove or rename existing files
   - Change existing color scheme
   - Modify existing context providers
   - Break existing functionality

2. **DO:**
   - Create new files and components
   - Extend existing functionality
   - Follow existing patterns
   - Reuse existing utilities
   - Maintain consistent styling
   - Add new routes under new-dashboard
   - Keep changes isolated to chat feature

---

## 📊 SUCCESS METRICS

1. **Functionality:**
   - All natural language commands work
   - 95% accuracy in intent recognition
   - Response time < 2 seconds

2. **UX:**
   - Intuitive interface
   - Smooth animations
   - No jarring transitions
   - Professional appearance

3. **Code Quality:**
   - No TypeScript errors
   - All tests passing
   - Clean component structure
   - Proper error handling

4. **Performance:**
   - Chat page loads < 1 second
   - Messages render instantly
   - Smooth scrolling
   - No memory leaks

---

## 🔗 INTEGRATION POINTS

### With Existing Features
1. **Authentication:**
   - Use existing AuthContext
   - Leverage existing auth middleware
   - Respect user sessions

2. **Task Data:**
   - Read from existing task tables
   - Use existing task operations
   - Maintain data consistency

3. **UI Theme:**
   - Use global.css variables
   - Match new-dashboard styling
   - Support dark/light mode

4. **Navigation:**
   - Integrate with NewDashboardNavbar
   - Use existing routing structure
   - Maintain breadcrumb consistency

---

## 📱 MOBILE CONSIDERATIONS

1. **Responsive Design:**
   - Stack sidebar on mobile
   - Full-width chat area
   - Touch-friendly buttons
   - Swipe gestures for sidebar

2. **Performance:**
   - Lazy load conversations
   - Virtualize message list
   - Optimize images and icons
   - Reduce bundle size

3. **UX:**
   - Large touch targets (44px min)
   - Easy to type in input
   - Keyboard doesn't hide content
   - Smooth scroll on mobile

---

## 🎯 DELIVERABLES SUMMARY

### New Backend Files
1. `/backend/mcp/server.py`
2. `/backend/mcp/tools.py`
3. `/backend/mcp/schemas.py`
4. `/backend/mcp/__init__.py`
5. `/backend/agents/todo_agent.py`
6. `/backend/agents/conversation_manager.py`
7. `/backend/agents/prompts.py`
8. `/backend/agents/__init__.py`
9. `/backend/routers/chat_router.py`
10. `/backend/tests/test_chat.py`

### Modified Backend Files
1. `/backend/models.py` (add Conversation, ChatMessage models)
2. `/backend/config.py` (add OpenAI settings)
3. `/backend/main.py` (include chat router)
4. `/backend/pyproject.toml` (add dependencies)

### New Frontend Files
1. `/frontend/src/app/new-dashboard/chat/page.tsx`
2. `/frontend/src/app/new-dashboard/chat/layout.tsx`
3. `/frontend/src/components/FloatingChatbot.tsx`
4. `/frontend/src/components/chat/ChatSidebar.tsx`
5. `/frontend/src/components/chat/ChatHeader.tsx`
6. `/frontend/src/components/chat/MessageArea.tsx`
7. `/frontend/src/components/chat/ChatInput.tsx`
8. `/frontend/src/components/chat/ChatEmptyState.tsx`
9. `/frontend/src/contexts/ChatContext.tsx`
10. `/frontend/src/services/chatService.ts`
11. `/frontend/src/types/chat.types.ts`

### Modified Frontend Files
1. `/frontend/src/components/NewDashboardNavbar.tsx` (add chatbot icon)
2. `/frontend/src/app/new-dashboard/layout.tsx` (add FloatingChatbot)

---

## 🎨 VISUAL REFERENCE

### Chatbot Icon Placement
```
NewDashboardNavbar:
[Logo] [Search]                    [🤖 AI] [🔔 Notif] [👤 User]
                                     ↑
                                  NEW ICON

Page Bottom Right:
                                              [🤖]
                                               ↑
                                          FLOATING
```

### Color Palette (from globals.css)
Use existing CSS variables:
- `--primary` - Main brand color
- `--primary-foreground` - Text on primary
- `--secondary` - Secondary actions
- `--accent` - Highlights
- `--muted` - Subtle backgrounds
- `--border` - Borders and dividers

---

## 🏁 FINAL NOTES

This constitution ensures:
1. ✅ All Phase 3 requirements are met
2. ✅ No existing functionality is broken
3. ✅ Professional ChatGPT-like UI
4. ✅ Complete chat history persistence
5. ✅ Dual access points (navbar + floating)
6. ✅ Proper color scheme from globals.css
7. ✅ Works exclusively in new-dashboard
8. ✅ Clean, maintainable code structure

**Remember:** The goal is to ADD chatbot functionality WITHOUT touching existing features. All changes are additive and isolated to the new-dashboard area.

---

**Constitution Version:** 1.0
**Created For:** Phase 3 - AI-Powered Todo Chatbot
**Target Completion:** December 21, 2025
**Framework:** Spec-Driven Development with Claude Code

Good luck! 🚀 be careful do not remove and overwirte any other consitution file just create a new folder and create consitution in it C:\hackathon2-todo-app\.specify\memory create anew folder in this path
```

## Response snapshot

Created the Phase 3 constitution file for the AI-powered todo chatbot feature at `.specify/memory/constitution.md`. The constitution includes detailed requirements for both backend (MCP server, OpenAI agents, chat API) and frontend (chatbot icons, full chat interface) components. It specifies all the necessary files to be created, security considerations, testing requirements, and implementation workflow.

## Outcome

- ✅ Impact: Created comprehensive constitution for Phase 3 AI chatbot feature
- 🧪 Tests: No tests needed for constitution creation
- 📁 Files: Created .specify/memory/constitution.md
- 🔁 Next prompts: Implementation of the features described in the constitution
- 🧠 Reflection: Constitution provides clear guidance for implementing the AI chatbot feature while preserving existing functionality

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Not applicable
- Prompt variant (if applicable): Not applicable
- Next experiment (smallest change to try): Begin implementing the backend MCP server as specified in the constitution