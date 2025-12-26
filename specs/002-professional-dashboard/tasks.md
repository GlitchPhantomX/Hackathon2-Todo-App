# Implementation Tasks: Professional Todo Dashboard

**Feature**: Professional Todo Dashboard
**Branch**: `002-professional-dashboard`
**Created**: 2025-12-22
**Updated**: 2025-12-23
**Spec**: [spec.md](./spec.md)
**Input**: Phase II - Professional Todo Dashboard Specification

## Phase 1: Setup & Project Initialization

- [X] T001 Set up project structure per implementation plan with frontend/src, components/, contexts/, hooks/, lib/, types/, services/ directories
- [X] T002 Initialize Next.js 15 project with TypeScript, Tailwind CSS, and shadcn/ui components
- [X] T003 Configure environment variables for API connection (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_NAME, NEXT_PUBLIC_ENABLE_ANALYTICS)
- [X] T004 Set up basic routing structure for dashboard pages (dashboard, tasks, today, upcoming, projects, priorities, tags, statistics, calendar, settings, profile)
- [X] T005 Install and configure required dependencies (lucide-react, recharts, next-themes, react-query, framer-motion, react-big-calendar, etc.)

## Phase 2: Foundational Components & State Management

- [X] T006 [P] Set up DashboardContext with tasks, stats, filters, sortBy, loading states, error handling, and all CRUD actions as specified
- [X] T007 [P] Implement API service layer with all required endpoints (tasks, projects, tags, notifications, user preferences, stats, bulk operations, import/export)
- [X] T008 [P] Create base UI components (Card, Button, Dialog, Dropdown, Input, Select, Tabs, Toast, Avatar, Skeleton)
- [X] T009 [P] Implement authentication context and user session management with real user data
- [X] T010 [P] Set up React Query (TanStack Query) for data fetching, caching, and real-time updates

## Phase 3: [US1] Dashboard Core & Navigation (Priority: P1)

**User Story**: As a user, I want to see a comprehensive dashboard with real-time statistics and task management capabilities so that I can quickly understand my task status and manage my work efficiently.

**Independent Test**: The dashboard should display user's real name with a personalized greeting, show 4 stats cards (Total, Completed, Pending, Overdue tasks), and allow basic task creation and viewing.

**Test Criteria**:
- User sees personalized greeting with their real name
- 4 stats cards display accurate real-time task data
- Basic task creation and viewing functionality works

- [X] T011 [P] [US1] Create DashboardNavbar component with:
  - Logo with gradient (Purple to Indigo)
  - Global search bar (400-600px width, Ctrl+K shortcut, debounced 300ms)
  - Home icon with tooltip
  - Notifications icon with red dot badge and dropdown (last 10 notifications, live updates)
  - Theme toggle (Sun/Moon icon, 180deg rotation animation)
  - User avatar with dropdown menu (Profile, Preferences, Help, Logout)
- [X] T012 [P] [US1] Implement DashboardSidebar with all navigation items:
  - Dashboard, My Tasks (expandable: All/Completed/Pending)
  - Today (badge count), Upcoming (badge count)
  - Projects (expandable, dynamic user projects)
  - Priorities (expandable: High/Medium/Low with color dots and counts)
  - Tags, Statistics, Reminders
  - Profile, Settings, Help, Logout
  - Width: 280px expanded, 72px collapsed
  - Smooth 300ms transition animation
- [X] T013 [US1] Build dashboard header with:
  - Personalized greeting showing user's real name from auth context
  - Dynamic motivational message based on task stats
  - Implementation of getDescription() function with overdue/pending/completed logic
- [X] T014 [P] [US1] Create DashboardStats component with 4 real-time statistics cards:
  - Card 1: Total Tasks (Target icon, Blue gradient, count up animation)
  - Card 2: Completed (CheckCircle2 icon, Green gradient, progress ring, percentage)
  - Card 3: Pending (Clock icon, Amber gradient)
  - Card 4: Overdue (AlertCircle icon, Red gradient, pulsing animation if > 0)
  - Hover effects: translateY(-4px), elevated shadow
- [X] T015 [P] [US1] Implement TaskList component with:
  - TaskItem cards with checkbox, title, priority indicator, tags, due date, menu (⋮)
  - Filter bar (status, priority, tags, date range, project)
  - Sort options (date, priority, title)
  - View toggle (list/grid)
  - Local search input
  - Drag handle for reordering (optional)
- [X] T016 [US1] Add theme switching functionality with:
  - next-themes package integration
  - Persistent user preference in localStorage + database
  - Support for light/dark/system modes
  - Smooth color transitions (300ms)
- [X] T017 [US1] Implement loading states and skeleton components:
  - StatsCardsSkeleton (animate-pulse, shimmer effect)
  - TaskListSkeleton (5-10 placeholder cards)
  - ChartSkeleton (spinner + "Loading data..." text)
  - Full page loading overlay with spinner

## Phase 4: [US2] Navigation & Theme Management (Priority: P1)

**User Story**: As a user, I want to navigate the application using a consistent sidebar and navbar with theme toggle functionality so that I can access different sections and customize my viewing experience.

**Independent Test**: Users should be able to toggle between light/dark mode, access all main sections from the sidebar, and use the global search functionality.

**Test Criteria**:
- Theme toggle switches between light and dark mode
- Sidebar navigation works for all main sections
- Global search returns relevant results

- [X] T018 [P] [US2] Enhance DashboardNavbar SearchBar with:
  - Real-time search using useDebouncedCallback (300ms)
  - Search by: task title, description, tags, priority
  - Clear button (X) when text present
  - MagnifyingGlass icon (lucide-react)
  - Min width 400px, max 600px
  - Height 44px
- [X] T019 [P] [US2] Implement search results dropdown with:
  - Max 5 results shown
  - Grouped by: Today, Upcoming, Completed
  - Click result navigates to task detail
  - "View all results" option at bottom
  - 360px width, max 400px height, scrollable
- [X] T020 [P] [US2] Create NotificationDropdown component with:
  - Last 10 notifications
  - Live updates on task events (create, update, delete, complete, overdue)
  - Notification format with icon, title, timestamp, category
  - "Mark all as read" button
  - "View all" link at bottom
  - Persistence: localStorage + database
  - Red dot badge when unread present
- [X] T021 [P] [US2] Implement user avatar dropdown with:
  - Profile section (avatar, username bold 16px, email muted 14px)
  - Menu items: Profile Settings, Preferences, Help & Support
  - Logout (red text, LogOut icon)
  - 240px width
  - 40x40px circular avatar with 2px primary border
  - Fallback: First letter with gradient background
- [X] T022 [US2] Add keyboard shortcuts support:
  - Global: Ctrl+K (search), Ctrl+N (new task), Ctrl+/ (shortcuts modal), Ctrl+B (sidebar), Ctrl+D (theme), Esc (close)
  - Navigation: G+D (dashboard), G+T (tasks), G+C (calendar), G+S (statistics)
  - Task list: J/K (navigate), Enter (open), Space (toggle), E (edit), Del (delete), N (new)
- [X] T023 [US2] Implement responsive design:
  - Mobile (<768px): Logo + Hamburger menu, full-screen sidebar overlay, single column, full-screen modals
  - Tablet (768-1023px): Collapsible sidebar (collapsed default), 2-card stats rows
  - Desktop (1024px+): Full layout, 4-card stats row, sidebar always visible

## Phase 5: [US3] Task Management Features (Priority: P2)

**User Story**: As a user, I want to create, edit, delete, and filter tasks with priority levels, tags, and projects so that I can organize my work effectively.

**Independent Test**: Users should be able to create tasks with title, description, due date, priority, tags, and project assignment. They should be able to filter tasks by status, priority, and other criteria.

**Test Criteria**:
- Create task modal accepts all required fields and creates task
- Edit and delete functionality works properly
- Filtering by status, priority, and other criteria works

- [X] T024 [P] [US3] Create AddTaskModal component with form fields:
  - Title (required, text, max 200 chars, non-empty validation)
  - Description (optional, textarea, rich text optional, max 2000 chars)
  - Due Date (optional, date picker, time picker, shortcuts: Today/Tomorrow/Next week)
  - Priority (required, select, High/Medium/Low, default Medium, color-coded buttons)
  - Tags (optional, multi-select, create inline, autocomplete, color picker for new tags)
  - Project (optional, select, default "Personal")
  - Recurring (optional - Phase 2 bonus, Daily/Weekly/Monthly/Custom)
  - Buttons: Create Task (primary), Cancel (secondary), Save as Template (tertiary)
  - Width 600px, max-height 80vh scrollable
  - Smooth enter/exit animations
  - Click outside or ESC to close with unsaved changes warning
- [X] T025 [P] [US3] Implement EditTaskModal with:
  - Same form as Create Task
  - Pre-filled with existing task data
  - Additional field: Status (Pending/Completed)
  - Edit history tracking (optional)
- [X] T026 [P] [US3] Create TaskItem component with:
  - Checkbox (toggle completion, scale animation)
  - Title (click to view details)
  - Priority indicator (color-coded star/flag)
  - Tags (clickable, filter by tag)
  - Due date (color-coded: red if overdue, yellow if today)
  - Menu (⋮): Edit, Delete, Duplicate, Move to project
  - Hover effects: elevation, border highlight
  - Drag handle (optional reordering)
- [X] T027 [P] [US3] Implement TaskFilters component with:
  - Status filter (all/pending/completed)
  - Priority filter (all/high/medium/low)
  - Tags multi-select filter
  - Date range picker
  - Project filter
  - Clear filters button
- [X] T028 [US3] Add bulk actions functionality:
  - Selection: Checkbox column in list view
  - Actions bar appears when items selected
  - Actions: Mark complete/pending, Change priority, Add tags, Move to project, Delete selected, Export selected
- [X] T029 [US3] Create TaskDetail view with:
  - Slide-over panel or full page modal
  - Header: Title (editable inline), Status toggle, Priority indicator, Close button
  - Details: Description (editable), Due date & time, Project, Tags, Created date, Last modified
  - Activity Log: All changes with format "{User} {action} {field} {timeAgo}", paginated
  - Comments (optional - Phase 2 bonus): Add comment textarea, user avatars, edit/delete own
  - Actions: Edit, Delete, Duplicate, Share (optional)
- [X] T030 [US3] Implement drag-and-drop reordering for tasks using react-beautiful-dnd or similar (optional feature)

## Phase 6: [US4] Analytics & Charts (Priority: P2)

**User Story**: As a user, I want to view charts and analytics about my task completion, priority distribution, and productivity trends so that I can understand my work patterns and improve efficiency.

**Independent Test**: Users should be able to view 4 different charts (completion rate, priority distribution, tasks over time, productivity trend) with real-time data.

**Test Criteria**:
- All 4 chart types display accurate data
- Charts update in real-time with less than 1 second delay

- [X] T031 [P] [US4] Create CompletionChart component:
  - Type: RadialBarChart (Recharts)
  - Data: Task completion percentage
  - Color: Success gradient (Green)
  - Size: 200x200px
  - Center text: Percentage value
  - Smooth fill animation
  - Container: Card with title "Task Completion Rate", h-[300px]
- [X] T032 [P] [US4] Implement PriorityChart component:
  - Type: PieChart (Recharts)
  - Data: High (Red), Medium (Yellow), Low (Blue) priority counts
  - Legend: Right side
  - Interaction: Hover to highlight segment
  - Container: Card with title "Priority Distribution"
- [X] T033 [P] [US4] Create TimelineChart component:
  - Type: AreaChart (Recharts)
  - Data: Last 7/30 days task creation/completion
  - X-Axis: Dates
  - Y-Axis: Task count
  - Colors: Created (Blue gradient), Completed (Green gradient)
  - Tooltip: Exact counts on hover
  - Container: Card with title "Tasks Over Time"
- [X] T034 [P] [US4] Implement ProductivityChart component:
  - Type: LineChart (Recharts)
  - Data: Daily productivity score (completed/total tasks), last 30 days
  - Trend line: Moving average
  - Colors: Gradient from red to green
  - Container: Card with title "Productivity Trend"
- [X] T035 [US4] Integrate charts with real-time data from backend API:
  - Connect to /api/tasks/stats endpoint
  - Auto-refresh every 30 seconds
  - React Query for caching and updates
- [X] T036 [US4] Add chart animations and tooltips:
  - Smooth entry animations
  - Interactive hover tooltips
  - Responsive container (ResponsiveContainer width="100%" height="100%")

## Phase 7: [US5] Search & Notifications (Priority: P3)

**User Story**: As a user, I want to search across all my tasks and receive notifications for task events so that I can quickly find information and stay informed about changes.

**Independent Test**: Users should be able to search tasks by title, description, tags, and priority, and receive notifications for task creation, updates, and completions.

**Test Criteria**:
- Global search returns relevant results within 500ms
- Notifications appear for task events

- [X] T037 [P] [US5] Enhance global search with:
  - Real-time results (< 500ms response time)
  - Keyboard shortcut activation (Ctrl+K / Cmd+K)
  - Search filters: title, description, tags, priority
  - Result grouping: Today, Upcoming, Completed
  - Highlight matching text in results
- [X] T038 [P] [US5] Implement NotificationContext for:
  - Managing notification state
  - Real-time updates (WebSocket or 30s polling)
  - Notification queue management
  - Read/unread tracking
- [X] T039 [P] [US5] Create notification service for API integration:
  - GET /api/notifications (unread_only, limit params)
  - POST /api/notifications (create)
  - PATCH /api/notifications/:id/read (mark read)
  - DELETE /api/notifications/:id
- [X] T040 [US5] Add notification indicators and counters:
  - Badge on navbar bell icon
  - Count display in dropdown header
  - Visual indicators for notification types
- [X] T041 [US5] Implement real-time notification updates:
  - WebSocket connection or polling every 30s
  - Toast notifications for new events
  - Auto-dismiss after 5 seconds (configurable)
- [X] T042 [US5] Add notification sounds and configurable settings:
  - Sound toggle in user preferences
  - Email notification settings
  - Push notification settings (future)

## Phase 8: Advanced Features & Polish

### Calendar Integration
- [X] T043 [P] Implement calendar integration with react-big-calendar:
  - Month view (default)
  - Week view, Day view, Agenda view
  - Tasks displayed on due dates
  - Color-coded by priority
  - Drag-and-drop to reschedule
  - Click date to create task
  - Click task to view details
- [X] T044 [P] Create calendar widget for dashboard sidebar:
  - Compact mini calendar showing current month
  - Dates with tasks highlighted
  - Click date to filter tasks
  - Navigate months with arrows

### Projects & Tags Management
- [X] T045 [P] Implement projects system:
  - Create/edit/delete projects
  - Default projects: Work (Briefcase), Personal (Home), Study (BookOpen)
  - Custom project icons and colors
  - Project detail pages with task lists
  - Drag to reorder projects in sidebar
- [X] T046 [P] Implement tags system:
  - Create/edit/delete tags
  - Color-coded tags
  - Tag management page
  - Click tag to filter tasks
  - Tag autocomplete in task forms

### Import/Export
- [X] T047 [P] Add import functionality:
  - CSV upload with column mapping interface
  - JSON upload with schema validation
  - Copy-paste text with auto-format detection
  - Template download link
  - Preview before import (table view)
  - Skip duplicates option
  - Success/error summary after import
- [X] T048 [P] Add export functionality:
  - Export formats: CSV, JSON, PDF (report)
  - Export options: All/Selected/Current View
  - Include completed/archived tasks toggle
  - Date range filter
  - Generate downloadable file

### Pagination & Performance
- [X] T049 [P] Implement infinite scroll and pagination:
  - Server-side pagination API support
  - Client-side caching (React Query)
  - Infinite scroll (load more on bottom)
  - Loading skeleton while fetching
  - "Load More" button as fallback
  - Virtual scrolling for large lists (react-window)
  - Items per page selector (10, 25, 50, 100)

### Dashboard Widgets
- [X] T050 [P] Create Recent Activity Feed:
  - Show last 10 activities
  - Real-time updates
  - Activity types: created, completed, updated, deleted, priority changed
  - Format: "[Icon] {User} {action} '{Task Title}' - {timeAgo} - {category}"
  - User avatar next to each activity
  - "View all activity" link
  - Full width below charts section
- [X] T051 [P] Implement Upcoming Tasks Quick View widget:
  - Next 5 upcoming tasks
  - Sorted by due date (earliest first)
  - Show: Title, due date, priority
  - Quick action: Mark complete checkbox
  - "View all" link
  - Right sidebar or below activity feed
- [X] T052 [P] Create Quick Actions Panel:
  - Horizontal button group below header
  - Actions: ➕ New Task, 📥 Import Tasks, 📊 View Reports, ⚙️ Settings
  - Keyboard shortcuts displayed on hover

### Settings & Preferences
- [X] T053 [P] Create user settings page with sections:
  - **Appearance**: Theme (Light/Dark/System), Accent color picker, Font size (S/M/L)
  - **Notifications**: Enable/disable, Notification sound, Email notifications, Push notifications
  - **Task Defaults**: Default priority, Default project, Default view (list/grid), Items per page
  - **Privacy**: Delete account, Export data, Data retention policy
  - **Integrations** (Future): Calendar, Email, Webhooks
  - Save settings to database and localStorage

### Accessibility & UX
- [ ] T054 [P] Add accessibility features:
  - WCAG 2.1 Level AA compliance
  - Color contrast minimum 4.5:1 for text, 3:1 for UI
  - Keyboard navigation for all interactive elements
  - Visible focus indicators (2px solid primary)
  - ARIA labels for all buttons, links, form inputs
  - Screen reader support with semantic HTML
  - Proper heading hierarchy
  - Focus trap in modals
  - Skip to main content link
  - aria-live regions for dynamic updates
- [ ] T055 [P] Implement performance optimizations:
  - Code splitting (Next.js automatic)
  - Image optimization (next/image)
  - Lazy loading components (React.lazy, Suspense)
  - Memoization (React.memo, useMemo, useCallback)
  - Debounce search/filter inputs
  - Virtual scrolling for long lists
  - Service Worker for offline support (optional)
  - Target Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] T056 [P] Add animations and transitions using Framer Motion:
  - Page transitions: Fade in/out (300ms), Slide from side
  - Card interactions: Hover (scale 1.02, elevation), Click (scale down)
  - Task completion: Checkbox scale, Card fade out + slide up, Confetti (optional)
  - Loading: Skeleton shimmer, Spinner rotation
  - Notification toast: Slide in from top-right
  - Respect prefers-reduced-motion
  - Duration: 200-400ms for most animations
- [ ] T057 [P] Create loading skeletons for all major components:
  - StatsCardsSkeleton (pulse animation, 4 cards)
  - TaskListSkeleton (5-10 cards, shimmer effect)
  - ChartSkeleton (spinner + loading text)
  - SidebarSkeleton
  - NavbarSkeleton
- [ ] T058 [P] Implement error handling and empty states:
  - API error state with retry and report buttons
  - Network error with offline indicator
  - Empty states: "No tasks yet" with create/import buttons
  - 404 page not found
  - 500 server error page
  - Form validation errors
  - Toast notifications for errors
- [ ] T059 [P] Add offline support:
  - Offline indicator in navbar
  - Queue actions for retry when online
  - Toast: "You're offline. Changes will sync when reconnected."
  - localStorage cache for offline access
  - Service Worker (optional)
- [ ] T060 [P] Implement comprehensive testing:
  - Unit tests: Utility functions (task-utils.ts, date-utils.ts)
  - Component tests: UI components, user interactions, form validation
  - Integration tests: Dashboard data flow, task CRUD, filtering/sorting, pagination
  - E2E tests (optional): Complete user flows, authentication, task management workflow
  - Test coverage target: > 80%
- [ ] T061 Conduct final quality assurance and bug fixes:
  - Manual testing on all screen sizes
  - Browser compatibility testing (Chrome, Firefox, Safari, Edge)
  - Performance testing (Lighthouse score > 90)
  - Accessibility audit (WCAG 2.1 AA)
  - Security review
  - Code review and refactoring

## Backend API Development Tasks

### New Endpoints Implementation
- [ ] T062 [P] Implement statistics endpoint (GET /api/tasks/stats):
  - Return: total, completed, pending, overdue counts
  - by_priority breakdown (high, medium, low)
  - by_project array with project_id, project_name, count
  - completion_rate percentage
  - productivity_trend array with date, created, completed, score
- [ ] T063 [P] Implement filtered task endpoints:
  - GET /api/tasks/today (due_date = today)
  - GET /api/tasks/upcoming (due_date > today, sorted, limit param)
  - GET /api/tasks/overdue (due_date < today, status != completed)
- [ ] T064 [P] Implement notifications endpoints:
  - GET /api/notifications (unread_only, limit params)
  - POST /api/notifications (create)
  - PATCH /api/notifications/:id/read
  - DELETE /api/notifications/:id
- [ ] T065 [P] Implement bulk operations endpoints:
  - POST /api/tasks/bulk-update (task_ids[], update_data)
  - POST /api/tasks/bulk-delete (task_ids[])
- [ ] T066 [P] Implement import/export endpoints:
  - POST /api/tasks/import (file upload, CSV/JSON)
  - GET /api/tasks/export (format param: csv/json/pdf, filters)
- [ ] T067 [P] Implement user preferences endpoints:
  - GET /api/user/preferences
  - PUT /api/user/preferences (theme, notifications, defaults, etc.)

### Database Schema Updates
- [ ] T068 [P] Create notifications table:
  - Fields: id, user_id, type, title, message, task_id, task_title, read, created_at, icon, color
  - Foreign keys: user_id → users, task_id → tasks (ON DELETE SET NULL)
- [ ] T069 [P] Create user_preferences table:
  - Fields: id, user_id, theme, accent_color, font_size, notifications_enabled, email_notifications, default_priority, default_project_id, default_view, items_per_page, updated_at
  - Foreign keys: user_id → users (UNIQUE), default_project_id → projects (ON DELETE SET NULL)
- [ ] T070 [P] Create projects table:
  - Fields: id, user_id, name, description, color, icon, created_at, updated_at
  - Foreign key: user_id → users (ON DELETE CASCADE)
- [ ] T071 [P] Update tasks table:
  - Add column: project_id (UUID, REFERENCES projects(id) ON DELETE SET NULL)
  - Add indexes for performance (user_id, status, due_date, project_id)

### Observability Implementation
- [ ] T072 [P] Implement structured logging:
  - JSON format with fields: timestamp, level, service, operation, user_id, task_id, correlation_id, message
  - Log levels: ERROR (system failures), WARN (recoverable errors), INFO (business events), DEBUG (execution flow)
  - Never log PII, passwords, or tokens
  - Retention: 30 days INFO/DEBUG, 90 days ERROR/WARN
- [ ] T073 [P] Implement application metrics:
  - Task CRUD operation counts and latencies
  - User session duration and activity patterns
  - API response times and error rates
  - Resource utilization (CPU, memory, DB connections)
  - Business metrics: DAU/MAU, task completion rates, feature adoption
  - Prometheus-compatible format, 15-second scrape interval
- [ ] T074 [P] Implement distributed tracing:
  - OpenTelemetry integration
  - Propagate correlation_id across services
  - Sampling: 100% error paths, 10% successful requests
  - Trace critical paths: dashboard load, task operations, notification delivery

## Dependencies

- **US2 depends on**: US1 (navigation requires dashboard foundation)
- **US3 depends on**: US1 (task management requires dashboard foundation)
- **US4 depends on**: US1 (charts require dashboard foundation and task data)
- **US5 depends on**: US1, US3 (notifications require dashboard and task functionality)
- **Backend tasks**: T062-T074 can be developed in parallel with frontend tasks

## Parallel Execution Examples

- **Parallel Tasks**: T006-T010 (foundational components can be developed simultaneously)
- **Parallel User Stories**: US2 and US3 can be developed in parallel after US1 foundation
- **Parallel Features**: Charts (US4) and Notifications (US5) can be developed in parallel
- **Backend/Frontend**: Backend API tasks (T062-T074) can be developed in parallel with frontend UI tasks

## Implementation Strategy

1. **MVP Scope**: Focus on US1 (Dashboard Core) and US2 (Navigation) for minimum viable product
2. **Incremental Delivery**: Each user story builds upon the previous one, delivering value at each phase
3. **Test Early**: Each phase includes independent test criteria to validate functionality
4. **Performance First**: Implement performance optimizations from the start (lazy loading, memoization)
5. **Observability Built-in**: Logging, metrics, and tracing from day one for production readiness

## Success Metrics

### User Experience
- Task completion time reduced by 50%
- User satisfaction score > 4.5/5
- Dashboard loads in < 2 seconds
- Zero critical bugs in production

### Technical Quality
- Code coverage > 80%
- Lighthouse score > 90
- No TypeScript errors
- Bundle size < 500KB (gzipped)
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

### Hackathon Scoring
- Functionality: 40%
- Code Quality: 30%
- User Experience: 20%
- Innovation: 10%

---

**Document Version**: 2.0
**Last Updated**: December 23, 2025
**Status**: Ready for Implementation
**Target Completion**: December 29, 2025