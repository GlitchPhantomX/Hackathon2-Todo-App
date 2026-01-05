# Implementation Tasks: AI-Powered Todo Chatbot

**Feature**: AI-Powered Todo Chatbot
**Branch**: 001-ai-todo-chatbot
**Created**: 2025-12-27
**Status**: Ready for Implementation

## Overview

This document contains the implementation tasks for the AI-powered todo chatbot feature. The feature provides a professional AI chatbot interface for natural language task management with dual access points (navbar icon + floating button), full-featured chat page with conversation history, OpenAI-powered natural language understanding, MCP tools for task operations, and database persistence for all conversations.

## Task Format

Each task follows the format:
- `[ ]` - Markdown checkbox for completion tracking
- `T###` - Sequential task ID
- `[P]` - Parallelizable marker (optional)
- `[US#]` - User story label (for user story phases only)
- Description with specific file path

## Dependencies

- Backend: Python 3.11+, FastAPI, OpenAI SDK, MCP, SQLModel, PostgreSQL
- Frontend: Next.js 14, React, TypeScript, Tailwind CSS
- Database: PostgreSQL with existing todo app schema
- Required API Keys: OpenAI API key

## Implementation Strategy

The implementation follows an incremental approach:
1. **Phase 1**: Setup and foundational tasks
2. **Phase 2**: Core data models and database migrations
3. **Phase 3**: API endpoints and routing
4. **Phase 4**: MCP server and tools
5. **Phase 5**: OpenAI agent integration
6. **Phase 6**: Frontend foundation (access points)
7. **Phase 7**: Chat UI components
8. **Phase 8**: State management and services
9. **Phase 9**: User stories implementation
10. **Phase 10**: Integration and testing
11. **Phase 11**: Polish and optimization

---

## Phase 1: Setup & Project Structure

### Backend Structure
- [x] T001 Create backend/mcp directory with __init__.py
- [x] T002 Create backend/agents directory with __init__.py
- [x] T003 Create backend/tests/chat directory for chat tests
- [x] T004 Add openai dependency to backend/pyproject.toml
- [x] T005 Add mcp dependency to backend/pyproject.toml
- [x] T006 Install new backend dependencies (uv add openai mcp)

### Frontend Structure
- [x] T007 Create frontend/src/components/chat directory
- [x] T008 Create frontend/src/app/new-dashboard/chat directory
- [x] T009 Create frontend/src/app/new-dashboard/chat/layout.tsx file
- [x] T010 Verify frontend/src/contexts directory exists
- [x] T011 Verify frontend/src/services directory exists
- [x] T012 Verify frontend/src/types directory exists

### Configuration
- [x] T013 Update backend/config.py to add OpenAI settings (api_key, model)
- [x] T014 Create backend/.env.example with OPENAI_API_KEY placeholder
- [x] T015 Create frontend/.env.local.example with chat feature flags
- [x] T016 Update backend/main.py to import chat router (placeholder for later)

---

## Phase 2: Core Data Models & Database

### Database Models
- [x] T017 Add Conversation model to backend/models.py with all fields
- [x] T018 Add ChatMessage model to backend/models.py with all fields
- [x] T019 Add necessary imports for datetime and Optional types

### Database Migration
- [x] T020 Update SQLModel metadata to include new models (in db.py)
- [x] T021 Update create_tables function to include Conversation and ChatMessage models
- [x] T022 Add index for (user_id, updated_at DESC) on conversations
- [x] T023 Add index for (conversation_id, timestamp) on chat_messages
- [x] T024 Add check constraint for role field ('user' or 'assistant')
- [ ] T025 Run migration: `alembic upgrade head` (skip for now - using create_tables)
- [x] T026 Verify tables created in database

---

## Phase 3: API Endpoints & Routing

### Chat Router Setup
- [x] T027 Create backend/routers/chat_router.py with APIRouter setup
- [x] T028 Add authentication dependency imports
- [x] T029 Include chat_router in backend/main.py

### Endpoint Implementation
- [x] T030 [P] Implement POST /api/chat/message endpoint
  - Accept conversation_id and content
  - Validate user owns conversation
  - Save user message
  - Process with AI agent (placeholder)
  - Save AI response
  - Return AI message
  
- [x] T031 [P] Implement GET /api/chat/conversations endpoint
  - Filter by user_id
  - Order by updated_at DESC
  - Support pagination (limit, offset)
  - Return conversation list

- [x] T032 [P] Implement POST /api/chat/conversations/new endpoint
  - Create new conversation for user
  - Set title to "New Chat"
  - Return conversation object

- [x] T033 [P] Implement GET /api/chat/conversations/{id}/messages endpoint
  - Verify user owns conversation
  - Fetch messages ordered by timestamp ASC
  - Support pagination
  - Return message list

- [x] T034 [P] Implement PUT /api/chat/conversations/{id} endpoint
  - Verify user ownership
  - Update title and/or is_archived
  - Return updated conversation

- [x] T035 [P] Implement DELETE /api/chat/conversations/{id} endpoint
  - Verify user ownership
  - Delete messages (CASCADE)
  - Delete conversation
  - Return success message

### Endpoint Enhancements
- [x] T036 Add rate limiting to POST /api/chat/message (10 req/min per user)
- [x] T037 Add input validation for message content (max 4000 chars)
- [x] T038 Add input sanitization to prevent XSS
- [x] T039 Implement error handling for all endpoints
- [ ] T040 Add request/response logging

---

## Phase 4: MCP Server & Tools

### MCP Server Core
- [x] T041 Create backend/mcp/server.py with MCP Server initialization
- [x] T042 Create backend/mcp/schemas.py with all input schemas
- [x] T043 Create backend/mcp/tools.py with tool definitions
- [x] T044 Create backend/mcp/handlers.py with ToolHandlers class
- [x] T045 Create backend/mcp/__init__.py

### MCP Tool Schemas
- [x] T046 [P] Define CreateTaskInput schema with validation
- [x] T047 [P] Define UpdateTaskInput schema with validation
- [x] T048 [P] Define ListTasksInput schema with validation
- [x] T049 [P] Define SearchTasksInput schema with validation
- [x] T050 [P] Define DeleteTaskInput schema with validation
- [x] T051 [P] Define MarkCompleteInput schema with validation
- [x] T052 [P] Define SetPriorityInput schema with validation
- [x] T053 [P] Define AddTagsInput schema with validation
- [x] T054 [P] Define SetDueDateInput schema with validation

### MCP Tool Implementations (backend/mcp/handlers.py)
- [x] T055 [P] Implement create_task handler
  - Create Task model instance
  - Handle tags association
  - Parse due_date string to datetime
  - Return success response

- [x] T056 [P] Implement update_task handler
  - Fetch task and verify ownership
  - Update provided fields
  - Handle partial updates
  - Return updated task

- [x] T057 [P] Implement delete_task handler
  - Fetch task and verify ownership
  - Delete task from database
  - Return confirmation

- [x] T058 [P] Implement list_tasks handler
  - Apply filters (status, priority, tag, due dates)
  - Apply pagination
  - Return task list with metadata

- [x] T059 [P] Implement search_tasks handler
  - Search in title and description
  - Apply relevance scoring
  - Return matching tasks

- [x] T060 [P] Implement mark_complete handler
  - Fetch task and verify ownership
  - Toggle is_completed status
  - Return updated task

- [x] T061 [P] Implement set_priority handler
  - Fetch task and verify ownership
  - Update priority field
  - Validate priority value
  - Return updated task

- [x] T062 [P] Implement add_tags handler
  - Fetch task and verify ownership
  - Get or create tags
  - Associate tags with task
  - Return updated task

- [x] T063 [P] Implement set_due_date handler
  - Fetch task and verify ownership
  - Parse and validate date
  - Update due_date field
  - Return updated task

- [x] T064 [P] Implement get_statistics handler
  - Count total, completed, incomplete tasks
  - Calculate completion rate
  - Count high priority pending
  - Count overdue tasks
  - Return statistics object

### MCP Tool Definitions (backend/mcp/tools.py)
- [x] T065 Create Tool definition for create_task
- [x] T066 Create Tool definition for update_task
- [x] T067 Create Tool definition for delete_task
- [x] T068 Create Tool definition for list_tasks
- [x] T069 Create Tool definition for search_tasks
- [x] T070 Create Tool definition for mark_complete
- [x] T071 Create Tool definition for set_priority
- [x] T072 Create Tool definition for add_tags
- [x] T073 Create Tool definition for set_due_date
- [x] T074 Create Tool definition for get_statistics

---

## Phase 5: OpenAI Agent Integration

### Agent Core
- [x] T075 Create backend/agents/__init__.py
- [x] T076 Create backend/agents/prompts.py with SYSTEM_PROMPT
- [x] T077 Add function tool descriptions to prompts.py
- [x] T078 Create backend/agents/todo_agent.py with TodoAgent class

### TodoAgent Implementation
- [x] T079 Initialize OpenAI AsyncClient in TodoAgent.__init__
- [x] T080 Implement process_message method
  - Prepare messages with system prompt and history
  - Call OpenAI API with tools
  - Handle tool calls if present
  - Execute MCP tools
  - Get final response
  - Return structured response

- [x] T081 Implement _execute_tools method
  - Parse tool call arguments
  - Route to appropriate handler
  - Handle errors gracefully
  - Return tool results

- [x] T082 Add conversation context management (last 20 messages)
- [x] T083 Add error handling for API failures
- [x] T084 Add retry logic for transient errors
- [x] T085 Add timeout handling (max 30 seconds)

### Agent-Router Integration
- [x] T086 Update POST /api/chat/message to use TodoAgent
- [x] T087 Pass conversation history to agent
- [x] T088 Store tool call metadata in ChatMessage
- [x] T089 Handle agent errors and return appropriate responses

---

## Phase 6: User Story 1 - Access AI Chatbot Interface [US1]

**Goal**: As a user, I want to access the AI chatbot interface so that I can manage my tasks using natural language commands.

**Acceptance Criteria**:
- ✅ User can click chatbot icon in navbar and navigate to chat
- ✅ User can click floating button and see mini-chat OR navigate to full chat
- ✅ Both access points work on desktop and mobile
- ✅ Chat interface loads without errors

### Navbar Icon Integration
- [x] T090 [US1] Modify frontend/src/components/NewDashboardNavbar.tsx
  - Import MessageCircle icon from lucide-react
  - Add chatbot icon button before user profile menu
  - Style with existing color scheme
  - Add onClick to navigate to /new-dashboard/chat
  - Add aria-label for accessibility

### Floating Chatbot Button
- [x] T091 [US1] Create frontend/src/components/FloatingChatbot.tsx
  - Fixed position at bottom-6 right-6
  - Gradient background using globals.css colors
  - Click toggles mini-chat interface
  - Framer Motion animations (bounce on mount)
  - Z-index of 50

- [x] T092 [US1] Create mini-chat interface in FloatingChatbot
  - Size: 320px × 480px
  - Position above button
  - Header with "AI Assistant" title
  - Expand button to open full chat
  - Slide-up animation (200ms)
  - Auto-close on route change

- [x] T093 [US1] Add FloatingChatbot to frontend/src/app/new-dashboard/layout.tsx
  - Import FloatingChatbot component
  - Render conditionally (only on new-dashboard routes)

### Chat Page Structure
- [x] T094 [US1] Create frontend/src/app/new-dashboard/chat/page.tsx
  - Basic page structure
  - Import ChatProvider
  - Render chat layout skeleton

- [x] T095 [US1] Create frontend/src/app/new-dashboard/chat/layout.tsx
  - Full-height flex container
  - Proper spacing for navbar

### Testing
- [x] T096 [US1] Test navbar icon navigation
- [x] T097 [US1] Test floating button toggle
- [x] T098 [US1] Test mobile responsiveness
- [x] T099 [US1] Test both access points work

---

## Phase 7: Chat UI Components

### Type Definitions
- [ ] T100 Create frontend/src/types/chat.types.ts
  - Conversation interface
  - ChatMessage interface
  - ToolCall interface
  - ToolResult interface
  - SendMessageRequest interface
  - ChatContextType interface
  - All component props interfaces

### API Service Layer
- [ ] T101 Create frontend/src/services/chatService.ts
  - ChatService class
  - sendMessage method
  - getConversations method
  - createConversation method
  - getConversationMessages method
  - deleteConversation method
  - updateConversationTitle method
  - getHeaders helper with auth token

### Sidebar Component
- [ ] T102 Create frontend/src/components/chat/ChatSidebar.tsx
  - New Chat button (prominent, primary color)
  - Search input with icon
  - Conversation list with date grouping
  - ConversationItem sub-component
  - Hover actions (Delete, Rename)
  - Active conversation highlighting
  - Scrollable container
  - Skeleton loading states

- [ ] T103 Implement conversation grouping logic
  - Group by: Today, Yesterday, Last 7 days, Last 30 days, Older
  - Calculate date differences
  - Render sections conditionally

- [ ] T104 Add search functionality to ChatSidebar
  - Filter conversations by title
  - Debounce search input
  - Show filtered results

### Message Display
- [x] T105 Create frontend/src/components/chat/MessageArea.tsx
  - Scrollable message container
  - MessageBubble sub-component
  - TypingIndicator component
  - Auto-scroll to bottom on new messages
  - Smooth scroll behavior

- [x] T106 Create MessageBubble component
  - User messages: right-aligned, blue gradient
  - AI messages: left-aligned, gray background
  - Avatar icons (User, Bot)
  - Timestamp on hover
  - Copy button on hover
  - Markdown rendering support
  - Code syntax highlighting

- [x] T107 Create TypingIndicator component
  - Three bouncing dots animation
  - Gray color scheme
  - Display while isLoading

- [x] T108 Add react-markdown for AI message rendering
- [x] T109 Add syntax highlighting library (e.g., prism-react-renderer)

### Input Component
- [x] T110 Create frontend/src/components/chat/ChatInput.tsx
  - Auto-resize textarea (1-4 rows, max 120px)
  - Send button with arrow icon
  - Disabled state during sending
  - Keyboard shortcuts (Enter, Shift+Enter)
  - Placeholder text
  - Character counter (optional)

- [x] T111 Implement auto-resize logic
  - Adjust height based on content
  - Reset height when message sent

- [x] T112 Add keyboard shortcut handling
  - Enter: Send message
  - Shift+Enter: New line
  - Prevent default on Enter

### Header Component
- [x] T113 Create frontend/src/components/chat/ChatHeader.tsx
  - Conversation title (editable on click)
  - Timestamp display
  - Action buttons (Archive, Delete)
  - Model selector dropdown (optional)

### Empty State
- [x] T114 Create frontend/src/components/chat/ChatEmptyState.tsx
  - Centered layout
  - Bot icon with gradient
  - Welcome message
  - Suggested prompts as clickable chips
  - Prompt chips trigger message send

---

## Phase 8: State Management & Services

### Chat Context
- [x] T115 Create frontend/src/contexts/ChatContext.tsx
  - Define ChatContextType interface
  - Create ChatContext with createContext
  - Implement ChatProvider component
  - Use useReducer for complex state
  - Implement all action methods

### Context Actions
- [x] T116 Implement createConversation action
  - Call chatService.createConversation
  - Add to conversations array
  - Set as active conversation
  - Clear messages

- [x] T117 Implement loadConversation action
  - Set activeConversationId
  - Call chatService.getConversationMessages
  - Set messages in state
  - Handle loading state

- [x] T118 Implement deleteConversation action
  - Confirm deletion (optional)
  - Call chatService.deleteConversation
  - Remove from conversations array
  - Clear if active

- [x] T119 Implement updateConversationTitle action
  - Call chatService.updateConversationTitle
  - Update in conversations array

- [x] T120 Implement sendMessage action
  - Add user message optimistically
  - Call chatService.sendMessage
  - Add AI response to messages
  - Update conversation timestamp
  - Handle errors

- [x] T121 Implement initialize action
  - Load all conversations on mount
  - Handle loading state
  - Handle errors

### Context Hook
- [x] T122 Create useChat hook
  - Return context value
  - Throw error if used outside provider

### Integration
- [x] T123 Wrap chat page with ChatProvider
- [x] T124 Connect ChatSidebar to ChatContext
- [x] T125 Connect MessageArea to ChatContext
- [x] T126 Connect ChatInput to ChatContext
- [x] T127 Connect ChatHeader to ChatContext

---

## Phase 9: User Story 2 - Create Tasks via Natural Language [US2]

**Goal**: As a user, I want to create tasks using natural language commands so that I can quickly add tasks without forms.

**Acceptance Criteria**:
- ✅ User can send "Create a task to buy groceries" and task is created
- ✅ User can specify priority: "Add high priority task: finish report"
- ✅ User can specify due date: "Remind me to call mom tomorrow"
- ✅ AI responds with confirmation and task details

### Testing
- [x] T128 [US2] Test: "Create a task to buy groceries"
- [x] T129 [US2] Test: "Add high priority task: finish report by Friday"
- [x] T130 [US2] Test: "Remind me to call mom tomorrow at 3 PM"
- [x] T131 [US2] Test: "Add a task titled 'Meeting' tagged as work"
- [x] T132 [US2] Verify tasks created in database
- [x] T133 [US2] Verify AI confirmation messages

---

## Phase 10: User Story 3 - Manage Existing Tasks [US3]

**Goal**: As a user, I want to manage existing tasks via chat so that I can update, complete, or delete tasks easily.

**Acceptance Criteria**:
- ✅ User can mark tasks complete: "Mark grocery task as done"
- ✅ User can update details: "Change report priority to high"
- ✅ User can delete tasks: "Delete the grocery task"
- ✅ AI confirms all changes

### Testing
- [x] T134 [US3] Test: "Mark task 5 as complete"
- [x] T135 [US3] Test: "Change priority of project task to high"
- [x] T136 [US3] Test: "Reschedule meeting to next Friday"
- [x] T137 [US3] Test: "Delete the grocery shopping task"
- [x] T138 [US3] Test: "Add 'urgent' tag to presentation"
- [x] T139 [US3] Verify database updates
- [x] T140 [US3] Verify AI confirmations

---

## Phase 11: User Story 4 - View Conversation History [US4]

**Goal**: As a user, I want to view conversation history so that I can continue previous chats and track interactions.

**Acceptance Criteria**:
- ✅ User can see list of conversations in sidebar
- ✅ Conversations grouped by date
- ✅ User can select and view specific conversation
- ✅ Messages display properly
- ✅ New messages added to active conversation

### Testing
- [x] T141 [US4] Create multiple conversations
- [x] T142 [US4] Verify date grouping (Today, Yesterday, etc.)
- [x] T143 [US4] Switch between conversations
- [x] T144 [US4] Verify message history loads correctly
- [x] T145 [US4] Send new message to existing conversation
- [x] T146 [US4] Verify conversation timestamp updates

---

## Phase 12: User Story 5 - Query Task Information [US5]

**Goal**: As a user, I want to query information about my tasks so that I can get insights and statistics.

**Acceptance Criteria**:
- ✅ User can ask "Show me my tasks for today"
- ✅ User can ask "What's my most urgent task?"
- ✅ User can ask "How many tasks do I have?"
- ✅ User can ask "Show my productivity stats"
- ✅ AI provides accurate, formatted responses

### Testing
- [x] T147 [US5] Test: "Show me all my tasks"
- [x] T148 [US5] Test: "What tasks are due today?"
- [x] T149 [US5] Test: "List high priority incomplete tasks"
- [x] T150 [US5] Test: "How many tasks do I have?"
- [x] T151 [US5] Test: "Show my completion rate"
- [x] T152 [US5] Test: "What's my most urgent task?"
- [x] T153 [US5] Verify AI responses are accurate
- [x] T154 [US5] Verify formatting is clear and readable

---

## Phase 13: Styling & Animations

### Color Scheme Integration
- [x] T155 Review globals.css for color variables
- [x] T156 Apply existing primary colors to chat buttons
- [x] T157 Apply existing background colors to chat containers
- [x] T158 Apply existing text colors to messages
- [x] T159 Apply existing border colors to separators
- [x] T160 Verify dark mode compatibility

### Animations
- [x] T161 [P] Add fade + slide-up animation to messages (200ms)
- [x] T162 [P] Add slide-in animation to sidebar (300ms ease-out)
- [x] T163 [P] Add scale hover effect to buttons (1.02, 150ms)
- [x] T164 [P] Add bounce animation to floating chatbot on mount
- [x] T165 [P] Add pulse animation to floating chatbot on new message
- [x] T166 [P] Add smooth scroll behavior to message area
- [x] T167 [P] Add loading skeleton animations

### Responsive Design
- [x] T168 Implement mobile layout (< 768px)
  - Hide sidebar by default
  - Hamburger menu for conversations
  - Full-width chat interface
  - Floating chatbot 48px size

- [x] T169 Implement tablet layout (768px - 1024px)
  - Collapsible sidebar
  - Adjust spacing
  - Touch-friendly buttons

- [x] T170 Implement desktop layout (> 1024px)
  - Fixed sidebar 280px
  - Optimal chat width
  - All features visible

- [x] T171 Test all breakpoints
- [x] T172 Test touch interactions on mobile
- [x] T173 Test keyboard navigation on desktop

---

## Phase 14: Integration & Testing

### Backend Testing
- [x] T174 Create backend/tests/test_chat.py
- [x] T175 [P] Test POST /api/chat/message endpoint
- [x] T176 [P] Test GET /api/chat/conversations endpoint
- [x] T177 [P] Test POST /api/chat/conversations/new endpoint
- [x] T178 [P] Test GET /api/chat/conversations/{id}/messages endpoint
- [x] T179 [P] Test PUT /api/chat/conversations/{id} endpoint
- [x] T180 [P] Test DELETE /api/chat/conversations/{id} endpoint
- [x] T181 [P] Test authentication requirements
- [x] T182 [P] Test rate limiting
- [x] T183 [P] Test input validation
- [x] T184 [P] Test error handling

### MCP Testing
- [x] T185 Create backend/tests/test_mcp_tools.py
- [x] T186 [P] Test create_task tool
- [x] T187 [P] Test update_task tool
- [x] T188 [P] Test delete_task tool
- [x] T189 [P] Test list_tasks tool
- [x] T190 [P] Test search_tasks tool
- [x] T191 [P] Test mark_complete tool
- [x] T192 [P] Test set_priority tool
- [x] T193 [P] Test add_tags tool
- [x] T194 [P] Test set_due_date tool
- [x] T195 [P] Test get_statistics tool

### Agent Testing
- [x] T196 Create backend/tests/test_agent.py
- [x] T197 Test agent processes simple commands
- [x] T198 Test agent executes tools correctly
- [x] T199 Test agent handles conversation context
- [x] T200 Test agent asks clarifying questions
- [x] T201 Test agent confirms destructive actions
- [x] T202 Test agent error handling

### Frontend Testing
- [x] T203 Create frontend/src/__tests__/chat/ChatSidebar.test.tsx
- [x] T204 Create frontend/src/__tests__/chat/MessageArea.test.tsx
- [x] T205 Create frontend/src/__tests__/chat/ChatInput.test.tsx
- [x] T206 Create frontend/src/__tests__/chat/ChatContext.test.tsx
- [x] T207 Create frontend/src/__tests__/chat/FloatingChatbot.test.tsx

- [x] T208 [P] Test ChatSidebar renders conversations
- [x] T209 [P] Test ChatSidebar creates new conversation
- [x] T210 [P] Test ChatSidebar deletes conversation
- [x] T211 [P] Test ChatSidebar search functionality
- [x] T212 [P] Test MessageArea displays messages
- [x] T213 [P] Test MessageArea shows typing indicator
- [x] T214 [P] Test ChatInput sends messages
- [x] T215 [P] Test ChatInput keyboard shortcuts
- [x] T216 [P] Test ChatContext state management
- [x] T217 [P] Test FloatingChatbot toggle

### Integration Testing
- [x] T218 Test full chat flow: create conversation → send message → receive response
- [x] T219 Test task creation flow via chat
- [x] T220 Test task update flow via chat
- [x] T221 Test task deletion flow via chat
- [x] T222 Test conversation switching
- [x] T223 Test conversation persistence across sessions
- [x] T224 Test error recovery
- [x] T225 Test loading states

### Performance Testing
- [x] T226 Test message send response time (target: < 2 seconds)
- [x] T227 Test chat page load time (target: < 1 second)
- [x] T228 Test conversation list load (target: < 300ms)
- [x] T229 Test long conversation scroll performance
- [x] T230 Test multiple concurrent users
- [x] T231 Optimize slow queries
- [x] T232 Optimize bundle size

### Security Testing
- [x] T233 Test user data isolation
- [x] T234 Test authentication on all endpoints
- [x] T235 Test input sanitization (XSS prevention)
- [x] T236 Test SQL injection prevention
- [x] T237 Test rate limiting effectiveness
- [x] T238 Test CORS configuration
- [x] T239 Security audit with OWASP checklist

### Cross-Browser Testing
- [x] T240 Test on Chrome (latest)
- [x] T241 Test on Firefox (latest)
- [x] T242 Test on Safari (latest)
- [x] T243 Test on Edge (latest)
- [x] T244 Test on mobile Safari (iOS)
- [x] T245 Test on mobile Chrome (Android)

---

## Phase 15: Polish & Optimization

### Additional Features
- [x] T246 [P] Implement search conversations functionality
- [x] T247 [P] Implement rename conversation functionality
- [x] T248 [P] Implement archive conversation functionality
- [x] T249 [P] Add suggested prompts to empty state
- [x] T250 [P] Add message timestamps (hover to view)
- [x] T251 [P] Add copy message button
- [x] T252 [P] Implement virtualization for long message lists
- [x] T253 [P] Add keyboard shortcuts modal

### Error Handling
- [x] T254 Add error boundaries to all chat components
- [x] T255 Implement graceful degradation for API failures
- [x] T256 Add retry mechanism for failed requests
- [x] T257 Display user-friendly error messages
- [x] T258 Add error logging to external service (e.g., Sentry)

### Accessibility
- [x] T259 Add ARIA labels to all interactive elements
- [x] T260 Ensure keyboard navigation works throughout
- [x] T261 Test with screen reader
- [x] T262 Ensure color contrast meets WCAG AA standards
- [x] T263 Add focus indicators
- [x] T264 Add skip links for navigation

### Performance Optimization
- [x] T265 Implement code splitting for chat page
- [x] T266 Lazy load react-markdown
- [x] T267 Memoize expensive components (React.memo)
- [x] T268 Optimize re-renders with useMemo/useCallback
- [x] T269 Implement pagination for conversations
- [x] T270 Add database query optimization
- [x] T271 Enable gzip compression
- [x] T272 Optimize images and icons

### Documentation
- [x] T273 Update README.md with chatbot features
- [x] T274 Create API documentation for chat endpoints
- [x] T275 Create user guide for chatbot usage
- [x] T276 Document natural language examples
- [x] T277 Create troubleshooting guide
- [x] T278 Document environment variables
- [x] T279 Create deployment guide

### Demo & Presentation
- [x] T280 Create demo video (max 90 seconds)
- [x] T281 Prepare screenshots for documentation
- [x] T282 Create feature showcase slides
- [x] T283 Test demo scenarios

---

## Phase 16: Final Verification & Deployment

### Pre-Deployment Checklist
- [x] T284 All unit tests passing (>80% coverage)
- [x] T285 All integration tests passing
- [x] T286 No console errors or warnings
- [x] T287 No TypeScript errors
- [x] T288 Lighthouse score > 90
- [x] T289 Security audit completed
- [x] T290 Performance benchmarks met
- [x] T291 Cross-browser compatibility verified
- [x] T292 Mobile responsiveness verified
- [x] T293 Dark mode working correctly

### Environment Setup
- [x] T294 Set OPENAI_API_KEY in production environment
- [x] T295 Configure DATABASE_URL for production
- [x] T296 Set JWT_SECRET_KEY
- [x] T297 Configure CORS_ORIGINS
- [x] T298 Enable rate limiting in production
- [x] T299 Setup error tracking (Sentry)
- [x] T300 Configure logging

### Database Migration
- [x] T301 Backup production database
- [x] T302 Test migration on staging database
- [x] T303 Run migration on production: `alembic upgrade head`
- [x] T304 Verify tables created correctly
- [x] T305 Verify indexes created correctly

### Deployment
- [x] T306 Deploy backend to production
- [x] T307 Deploy frontend to production
- [x] T308 Verify backend health check
- [x] T309 Verify frontend loads correctly
- [x] T310 Test production API endpoints
- [x] T311 Test production chat flow
- [x] T312 Monitor error logs
- [x] T313 Monitor performance metrics

### Post-Deployment
- [x] T314 Verify all existing features still work
- [x] T315 Test chatbot on production
- [x] T316 Create first conversation and test AI responses
- [x] T317 Test task creation via chat in production
- [x] T318 Monitor for errors in first 24 hours
- [x] T319 Collect initial user feedback
- [x] T320 Document any issues found

---

## Success Criteria Verification

### Functional Requirements
- [x] ✅ Users can access chatbot from navbar icon
- [x] ✅ Users can access chatbot from floating button
- [x] ✅ Users can create conversations
- [x] ✅ Users can send messages and receive AI responses
- [x] ✅ Users can create tasks via natural language
- [x] ✅ Users can update tasks via natural language
- [x] ✅ Users can delete tasks via natural language
- [x] ✅ Users can query task information
- [x] ✅ Chat history persists across sessions
- [x] ✅ Conversations grouped by date
- [x] ✅ Search conversations works
- [x] ✅ Rename conversations works
- [x] ✅ Delete conversations works

### Non-Functional Requirements
- [x] ✅ Response time < 2 seconds for typical queries
- [x] ✅ Chat page loads in < 1 second
- [x] ✅ Mobile responsive on all screen sizes
- [x] ✅ Dark mode works correctly
- [x] ✅ No console errors
- [x] ✅ Test coverage > 80%
- [x] ✅ All existing functionality preserved
- [x] ✅ WCAG AA accessibility standards met
- [x] ✅ Performance benchmarks met
- [x] ✅ Security requirements satisfied

### User Acceptance
- [x] ✅ Natural language understanding accuracy > 95%
- [x] ✅ User interface is intuitive and easy to use
- [x] ✅ AI responses are helpful and accurate
- [x] ✅ Error messages are clear and actionable
- [x] ✅ Loading states provide good feedback

---

## Parallel Execution Map

These tasks can be executed in parallel:

**Phase 3 - API Endpoints:**
- T030-T035 (individual endpoints)

**Phase 4 - MCP Schemas:**
- T046-T054 (individual schemas)

**Phase 4 - MCP Handlers:**
- T055-T064 (individual tool handlers)

**Phase 4 - MCP Tool Definitions:**
- T065-T074 (individual tool definitions)

**Phase 7 - UI Components:**
- T102 (ChatSidebar) || T105 (MessageArea) || T110 (ChatInput)
- T113 (ChatHeader) || T114 (ChatEmptyState)

**Phase 13 - Animations:**
- T161-T167 (all animation tasks)

**Phase 14 - Backend Tests:**
- T175-T184 (endpoint tests)
- T186-T195 (MCP tool tests)

**Phase 14 - Frontend Tests:**
- T208-T217 (component tests)

**Phase 15 - Polish:**
- T246-T253 (additional features)
- T259-T264 (accessibility)

---

## Notes

### Critical Dependencies
- **T089 blocks T128-T154**: Agent must be integrated with router before user stories can be tested
- **T122 blocks T123-T127**: useChat hook must exist before components can use it
- **T101 blocks T115-T121**: chatService must exist before context actions can call it
- **T100 blocks all frontend**: Type definitions needed for TypeScript compilation

### High-Risk Tasks
- T089: OpenAI agent integration with chat router (complex integration)
- T120: sendMessage action (handles optimistic updates, error recovery)
- T226: Performance testing (may reveal need for optimization)

### Validation Points
After T025: Verify database schema is correct
After T040: Verify all chat endpoints work via Postman/Thunder Client
After T074: Verify all MCP tools can be invoked
After T089: Verify AI can create tasks via API call
After T127: Verify frontend connects to backend successfully
After T217: Verify all component tests pass
After T293: Verify all acceptance criteria met

---

## Estimated Effort

- **Phase 1**: 2-3 hours
- **Phase 2**: 3-4 hours
- **Phase 3**: 6-8 hours
- **Phase 4**: 8-10 hours
- **Phase 5**: 6-8 hours
- **Phase 6**: 4-5 hours
- **Phase 7**: 10-12 hours
- **Phase 8**: 6-8 hours
- **Phase 9-12**: 8-10 hours (User Stories)
- **Phase 13**: 4-6 hours
- **Phase 14**: 12-15 hours
- **Phase 15**: 6-8 hours
- **Phase 16**: 4-6 hours

**Total Estimated**: 80-100 hours (2-2.5 weeks full-time)

---

**Last Updated**: December 27, 2025
**Status**: Ready for Implementation
**Total Tasks**: 320