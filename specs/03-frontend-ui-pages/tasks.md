---
description: "Task list for Next.js Frontend UI Pages implementation"
---

# Tasks: Frontend UI Pages

**Input**: Design documents from `/specs/03-frontend-ui-pages/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The feature specification does not explicitly request automated tests - manual testing is specified. Tests are omitted from this task list.

**Organization**: Tasks are grouped by implementation phases to enable structured development.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **Include exact file paths in descriptions**

## Path Conventions

- **Frontend project**: `frontend/` at repository root
- Paths shown below assume frontend project structure

## Phase 1: Setup & Foundation (13 tasks)
**Goal:** Initialize Next.js project with proper configuration and dependencies
**Estimated Time:** 1-2 hours

### Story Goal
Initialize a Next.js 16+ project with TypeScript, Tailwind CSS, and all required dependencies following the specified architecture.

### Independent Test Criteria
- ✅ Project can be created with `create-next-app`
- ✅ TypeScript compiles without errors (`npm run build`)
- ✅ Tailwind CSS styles are applied correctly
- ✅ All required dependencies are installed
- ✅ Development server runs on port 3000
- ✅ No console errors on startup
- ✅ Hot reload works correctly

### Tasks

- [ ] **T001** Create Next.js project with TypeScript and App Router
  ```bash
  npx create-next-app@latest frontend --typescript --tailwind --app --src-dir
  cd frontend
  ```

- [ ] **T002** [P] Install core dependencies
  ```bash
  npm install axios js-cookie lucide-react date-fns
  ```

- [ ] **T003** [P] Install dev dependencies
  ```bash
  npm install -D @types/js-cookie
  ```

- [ ] **T004** Configure TypeScript with strict settings
  - Update `tsconfig.json` per specification
  - Enable strict mode, path aliases (@/*)
  - Configure for Next.js app directory

- [ ] **T005** [P] Configure Next.js settings
  - Update `next.config.js` with image domains
  - Set standalone output for deployment
  - Configure experimental features

- [ ] **T006** [P] Configure Tailwind CSS design system
  - Update `tailwind.config.ts` with color palette
  - Add custom utilities and components
  - Configure content paths

- [ ] **T007** [P] Configure PostCSS
  - Update `postcss.config.js` with Tailwind and autoprefixer

- [ ] **T008** [P] Configure ESLint
  - Update `.eslintrc.json` with Next.js and TypeScript rules
  - Add custom rules for code quality

- [ ] **T009** Create environment files
  - Create `.env.example` with template variables
  - Create `.env.local` with actual values (gitignored)
  - Add `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1`

- [ ] **T010** [P] Set up global styles
  - Create `src/app/globals.css` with Tailwind directives
  - Add custom component classes
  - Add custom utility classes

- [ ] **T011** Create `.gitignore` with proper exclusions
  - Add `.env.local`, `.next/`, `node_modules/`
  - Add IDE-specific files

- [ ] **T012** Configure package.json scripts
  - Add `dev`, `build`, `start`, `lint`, `type-check`

- [ ] **T013** Verify backend API connectivity
  - Start backend server (Constitution 2)
  - Test API endpoint accessibility
  - Verify CORS configuration

**Validation Checkpoint:**
```bash
npm run dev          # Should start on port 3000
npm run build        # Should build without errors
npm run type-check   # Should pass TypeScript checks
```

---

## Phase 2: Core UI Components (8 tasks)
**Goal:** Create reusable UI components for the todo application
**Estimated Time:** 2-3 hours

### Story Goal
Implement core UI components that will be used across the todo application including navigation, task cards, forms, and layout components.

### Independent Test Criteria
- ✅ Components render without errors
- ✅ Components accept proper props and handle state
- ✅ Components follow design system guidelines
- ✅ Components are responsive and accessible
- ✅ Components have proper TypeScript typing

### Tasks

- [ ] **T014** Create layout components
  - Create `src/app/components/layout/Header.tsx`
  - Create `src/app/components/layout/Sidebar.tsx`
  - Create `src/app/components/layout/Footer.tsx`

- [X] **T015** [P] Create reusable UI components
  - Create `src/app/components/ui/Button.tsx`
  - Create `src/app/components/ui/Input.tsx`
  - Create `src/app/components/ui/Checkbox.tsx`

- [ ] **T016** [P] Create task-related components
  - Create `src/app/components/TaskCard.tsx`
  - Create `src/app/components/TaskForm.tsx`
  - Create `src/app/components/TaskList.tsx`

- [ ] **T017** [P] Create navigation components
  - Create `src/app/components/Navigation.tsx`
  - Create `src/app/components/Breadcrumb.tsx`

- [ ] **T018** [P] Create icon components
  - Create `src/app/components/icons/` directory
  - Add icons from lucide-react for common actions

- [ ] **T019** [P] Create utility components
  - Create `src/app/components/LoadingSpinner.tsx`
  - Create `src/app/components/EmptyState.tsx`
  - Create `src/app/components/ErrorMessage.tsx`

- [ ] **T020** Create theme context
  - Create `src/app/context/ThemeContext.tsx`
  - Implement dark/light mode toggle

- [ ] **T021** Create global styles and utilities
  - Create `src/app/styles/` directory
  - Add utility classes and theme variables

**Validation Checkpoint:**
- All components render properly in isolation
- Components follow consistent styling
- TypeScript compilation passes

---

## Phase 3: Authentication Pages (5 tasks)
**Goal:** Implement authentication-related pages and functionality
**Estimated Time:** 2-3 hours

### Story Goal
Create authentication pages for user registration, login, and logout functionality that integrates with the backend authentication system.

### Independent Test Criteria
- ✅ Login page renders and functions correctly
- ✅ Registration page renders and functions correctly
- ✅ User session is properly managed
- ✅ Authentication state persists across page refreshes
- ✅ Protected routes redirect unauthenticated users

### Tasks

- [ ] **T022** Create authentication context
  - Create `src/app/context/AuthContext.tsx`
  - Implement login, logout, and registration functions
  - Handle authentication state and tokens

- [ ] **T023** Create login page
  - Create `src/app/handler/sign-in/page.tsx`
  - Implement login form with validation
  - Handle authentication errors

- [ ] **T024** Create registration page
  - Create `src/app/handler/sign-up/page.tsx`
  - Implement registration form with validation
  - Handle registration errors

- [ ] **T025** Create user profile page
  - Create `src/app/profile/page.tsx`
  - Display user information
  - Implement logout functionality

- [ ] **T026** Create protected route wrapper
  - Create `src/app/components/ProtectedRoute.tsx`
  - Implement authentication checks
  - Redirect to login for unauthenticated users

**Validation Checkpoint:**
- Authentication flows work end-to-end
- Protected routes properly redirect
- Session management works correctly

---

## Phase 4: Todo Management Pages (7 tasks)
**Goal:** Implement the core todo management functionality
**Estimated Time:** 3-4 hours

### Story Goal
Create pages for viewing, adding, updating, and deleting todo tasks that integrate with the backend API.

### Independent Test Criteria
- ✅ Tasks can be viewed in a list format
- ✅ New tasks can be added with proper validation
- ✅ Existing tasks can be updated
- ✅ Tasks can be deleted with confirmation
- ✅ Task completion status can be toggled
- ✅ All operations handle errors gracefully
- ✅ Loading states are properly displayed

### Tasks

- [ ] **T027** Create API service layer
  - Create `src/app/services/api.ts`
  - Implement axios configuration with interceptors
  - Create functions for all todo operations

- [ ] **T028** Create tasks page
  - Create `src/app/tasks/page.tsx`
  - Display all tasks in a list format
  - Implement loading and error states

- [ ] **T029** Create add task functionality
  - Add form to create new tasks in `src/app/tasks/page.tsx`
  - Implement validation and error handling
  - Handle successful creation feedback

- [ ] **T030** Create update task functionality
  - Implement task editing in `src/app/tasks/page.tsx`
  - Add modal or inline editing for task updates
  - Handle successful update feedback

- [ ] **T031** Create delete task functionality
  - Add delete button with confirmation dialog
  - Implement delete operation with API call
  - Handle successful deletion feedback

- [ ] **T032** Create task completion toggle
  - Add checkbox to toggle task completion status
  - Update task status via API call
  - Update UI immediately after toggle

- [ ] **T033** Create task filtering and search
  - Add search functionality to filter tasks
  - Add status filtering (all, completed, pending)
  - Implement sorting options

**Validation Checkpoint:**
- All CRUD operations work with backend API
- Error handling is properly implemented
- UI updates reflect API responses

---

## Phase 5: Polish & Integration (4 tasks)
**Goal:** Final integration, testing, and polish
**Estimated Time:** 2-3 hours

### Story Goal
Complete the frontend application by integrating all components, adding final styling, and ensuring proper functionality across all pages.

### Independent Test Criteria
- ✅ All pages navigate correctly
- ✅ All forms have proper validation
- ✅ Error handling is consistent across the application
- ✅ Responsive design works on all screen sizes
- ✅ Performance is optimized
- ✅ All features work end-to-end

### Tasks

- [ ] **T034** Create navigation and routing
  - Update `src/app/layout.tsx` with proper navigation
  - Implement consistent navigation across all pages
  - Add proper page titles and meta tags

- [ ] **T035** Add form validation and error handling
  - Implement client-side validation for all forms
  - Add proper error messages and display
  - Handle API errors consistently

- [ ] **T036** Add responsive design and accessibility
  - Ensure all pages work on mobile, tablet, and desktop
  - Add proper ARIA attributes
  - Implement keyboard navigation

- [ ] **T037** Final testing and integration
  - Test all functionality end-to-end
  - Verify API integration works properly
  - Perform final code cleanup and optimization

**Validation Checkpoint:**
- Complete manual testing passes
- Application builds and deploys successfully
- All features work as expected

---

## Phase 3: Core UI Components (10 tasks)
**Goal:** Create reusable UI components that will be used throughout the application
**Estimated Time:** 1.5-2 hours

### Story Goal
Build a library of reusable, accessible, and responsive UI components following the design system specification.

### Independent Test Criteria
- ✅ Button component renders with all variants
- ✅ Input component handles validation errors
- ✅ Alert component displays all variants correctly
- ✅ Spinner component animates smoothly
- ✅ Card component applies proper styling
- ✅ Modal component opens/closes correctly
- ✅ All components are responsive
- ✅ All components have proper TypeScript types

### Tasks

- [X] **T030** Create reusable Button component
  - Create `src/components/ui/Button.tsx`
  - Mark with `'use client'` directive
  - Implement variants: primary, secondary, ghost, danger
  - Implement sizes: sm, md, lg
  - Add loading state with spinner
  - Add fullWidth option
  - Add proper TypeScript types
  - Make responsive from start

- [X] **T031** [P] Create reusable Input component
  - Create `src/components/ui/Input.tsx`
  - Mark with `'use client'` directive
  - Add label, error, helperText props
  - Implement error styling
  - Use forwardRef for form libraries
  - Add proper TypeScript types
  - Make responsive from start

- [X] **T032** [P] Create reusable Alert component
  - Create `src/components/ui/Alert.tsx`
  - Mark with `'use client'` directive
  - Implement variants: success, error, warning, info
  - Add icons for each variant
  - Add close button with onClose callback
  - Add title and children props
  - Make responsive from start

- [X] **T033** [P] Create reusable Spinner component
  - Create `src/components/ui/Spinner.tsx`
  - Implement sizes: sm, md, lg
  - Add color customization
  - Use SVG with CSS animation
  - Add proper TypeScript types

- [X] **T034** [P] Create reusable Card component
  - Create `src/components/ui/Card.tsx`
  - Implement padding options: none, sm, md, lg
  - Add shadow and rounded corners
  - Add proper TypeScript types
  - Make responsive from start

- [X] **T035** [P] Create reusable Modal component
  - Create `src/components/ui/Modal.tsx`
  - Mark with `'use client'` directive
  - Implement size options: sm, md, lg, xl
  - Add backdrop with click-to-close
  - Add close button
  - Implement portal rendering
  - Add keyboard ESC handler
  - Make responsive from start

- [X] **T036** [P] Test Button component
  - Test all variants render correctly
  - Test loading state works
  - Test onClick handler fires
  - Test disabled state

- [X] **T037** [P] Test Input component
  - Test label displays correctly
  - Test error state styling
  - Test helperText displays
  - Test validation feedback

- [X] **T038** [P] Test Alert component
  - Test all variants display correctly
  - Test close button works
  - Test onClose callback fires

- [X] **T039** [P] Test responsive behavior of UI components
  - Test components on mobile (< 768px)
  - Test components on tablet (768px - 1024px)
  - Test components on desktop (> 1024px)

**Validation Checkpoint:**
- All UI components render without errors
- All variants and sizes work correctly
- Components are fully responsive
- TypeScript types are correct

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Core UI Components (Phase 2)**: Depends on Setup completion
- **Authentication Pages (Phase 3)**: Depends on Core UI Components completion
- **Todo Management Pages (Phase 4)**: Depends on Authentication Pages completion
- **Polish & Integration (Phase 5)**: Depends on all previous phases completion

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Core UI Components tasks marked [P] can run in parallel
- Different pages within Todo Management can be worked on in parallel

## Phase 4: [US1] Authentication System (15 tasks)
**Goal:** Implement complete authentication flow with registration, login, and protected routes
**Estimated Time:** 2-3 hours

### User Story
**As a user**, I want to register, login, and logout of the application so that I can access my personal task management system securely.

### Success Criteria
- ✅ User can navigate to registration page and create an account
- ✅ User can navigate to login page and authenticate
- ✅ Unauthenticated users are redirected from protected routes to login
- ✅ JWT token is stored securely in cookies with proper settings
- ✅ User session persists across browser sessions
- ✅ Token expiration triggers logout and redirect
- ✅ Form validation provides helpful error messages
- ✅ Loading states show during API calls
- ✅ Error messages display for failed operations

### Tasks

- [X] **T040** [US1] Create root layout with AuthProvider
  - Create `src/app/layout.tsx`
  - Import and configure Inter font
  - Add metadata for SEO
  - Wrap children with AuthProvider
  - Import globals.css

- [X] **T041** [US1] [P] Create home/landing page
  - Create `src/app/page.tsx`
  - Add hero section with title and subtitle
  - Add CTA buttons (Get Started → /register, Sign In → /login)
  - Add feature cards with icons
  - Add footer
  - Make fully responsive

- [X] **T042** [US1] [P] Create login page
  - Create `src/app/login/page.tsx`
  - Add page metadata
  - Add welcome header
  - Import and use LoginForm component
  - Add link to registration page
  - Make responsive

- [X] **T043** [US1] [P] Create registration page
  - Create `src/app/register/page.tsx`
  - Add page metadata
  - Add welcome header
  - Import and use RegisterForm component
  - Add link to login page
  - Make responsive

- [X] **T044** [US1] [P] Create login form component
  - Create `src/components/auth/LoginForm.tsx`
  - Mark with `'use client'` directive
  - Use useAuth hook for login
  - Use useRouter for navigation
  - Implement email and password inputs
  - Add client-side validation
  - Handle form submission
  - Display error alert
  - Show loading state on button
  - Redirect to /dashboard on success
  - Handle redirect parameter from URL

- [X] **T045** [US1] [P] Create registration form component
  - Create `src/components/auth/RegisterForm.tsx`
  - Mark with `'use client'` directive
  - Use useAuth hook for register
  - Use useRouter for navigation
  - Implement name, email, password, confirmPassword inputs
  - Add client-side validation
  - Validate password match
  - Handle form submission
  - Display error alert
  - Show loading state on button
  - Auto-login after registration
  - Redirect to /dashboard on success

- [X] **T046** [US1] Create 404 not-found page
  - Create `src/app/not-found.tsx`
  - Add "Page Not Found" message
  - Add link back to home
  - Style consistently with app

- [X] **T047** [US1] [P] Test complete registration flow
  - Navigate to /register
  - Fill registration form with valid data
  - Submit form
  - Verify account created in backend
  - Verify auto-login works
  - Verify redirect to /dashboard
  - Verify token stored in cookies

- [X] **T048** [US1] [P] Test complete login flow
  - Navigate to /login
  - Fill login form with valid credentials
  - Submit form
  - Verify authentication succeeds
  - Verify token stored in cookies
  - Verify redirect to /dashboard

- [X] **T049** [US1] [P] Test form validation
  - Test email format validation
  - Test password length validation (min 8 chars)
  - Test password match in registration
  - Test required field validation
  - Test error messages display correctly

- [X] **T050** [US1] [P] Test error handling
  - Test duplicate email registration
  - Test invalid login credentials
  - Test network error handling
  - Test backend error messages display

- [X] **T051** [US1] [P] Test route protection
  - Access /dashboard without authentication → should redirect to /login
  - Access /tasks without authentication → should redirect to /login
  - Access /login with authentication → should redirect to /dashboard
  - Verify middleware saves intended destination

- [X] **T052** [US1] [P] Test session persistence
  - Login successfully
  - Close browser completely
  - Reopen browser and visit app
  - Verify still authenticated
  - Verify no need to login again

- [X] **T053** [US1] [P] Test logout functionality
  - Login successfully
  - Trigger logout (will implement in profile)
  - Verify token removed from cookies
  - Verify redirected to /login
  - Verify cannot access protected routes

- [X] **T054** [US1] Verify JWT token security
  - Check token has proper expiration (24h)
  - Verify cookie has sameSite=lax
  - Verify cookie has secure flag in production
  - Verify token sent with all API requests

**Validation Checkpoint:**
- Complete authentication flow works end-to-end
- Form validation provides helpful feedback
- Error handling covers all edge cases
- Session persists across browser restarts
- Route protection works correctly

---

## Phase 5: Layout Components (5 tasks)
**Goal:** Create navigation and layout components for authenticated pages
**Estimated Time:** 1 hour

### Story Goal
Build navigation components that provide consistent layout and user experience across all protected pages.

### Independent Test Criteria
- ✅ Navbar displays user information
- ✅ Navbar provides logout functionality
- ✅ Sidebar shows navigation links
- ✅ Active route is highlighted in sidebar
- ✅ Layout components are responsive

### Tasks

- [X] **T055** Create Navbar component
  - Create `src/components/layout/Navbar.tsx`
  - Mark with `'use client'` directive
  - Use useAuth hook for user info
  - Display "Welcome, [Name]"
  - Add Profile link
  - Add Logout button with confirmation
  - Use useRouter for navigation
  - Make responsive with mobile menu
  - Add sticky positioning

- [X] **T056** [P] Create Sidebar component
  - Create `src/components/layout/Sidebar.tsx`
  - Mark with `'use client'` directive
  - Use usePathname to detect active route
  - Add navigation items: Dashboard, Tasks, Profile
  - Highlight active route
  - Add icons from lucide-react
  - Hide on mobile (< 1024px)
  - Style consistently with design system

- [X] **T057** [P] Create dashboard layout
  - Create `src/app/dashboard/layout.tsx`
  - Mark with `'use client'` directive
  - Import Navbar and Sidebar
  - Use useAuth for loading state
  - Show spinner while checking auth
  - Wrap children with layout structure
  - Make responsive

- [X] **T058** [P] Test Navbar functionality
  - Verify user name displays correctly
  - Test profile link navigation
  - Test logout functionality
  - Test mobile menu toggle

- [X] **T059** [P] Test Sidebar functionality
  - Verify all navigation links work
  - Verify active route highlighting
  - Test on mobile (sidebar should be hidden)
  - Test on desktop (sidebar should be visible)

**Validation Checkpoint:**
- Navigation components render correctly
- User information displays properly
- Links navigate correctly
- Responsive behavior works as expected

---

## Phase 6: [US2] Task Management Implementation (18 tasks)
**Goal:** Implement complete task management functionality with CRUD operations
**Estimated Time:** 3-4 hours

### User Story
**As an authenticated user**, I want to create, view, update, and delete tasks so that I can manage my todo list effectively.

### Success Criteria
- ✅ Authenticated user can create new tasks
- ✅ Authenticated user can view all their tasks
- ✅ Authenticated user can mark tasks as complete/incomplete
- ✅ Authenticated user can edit task details
- ✅ Authenticated user can delete tasks with confirmation
- ✅ Task list supports filtering (all/active/completed)
- ✅ Task counts display correctly for each filter
- ✅ Loading states show during operations
- ✅ Error messages display for failures
- ✅ Empty states provide helpful guidance

### Tasks

- [ ] **T060** [US2] Create dashboard page with statistics
  - Create `src/app/dashboard/page.tsx`
  - Mark with `'use client'` directive
  - Use useAuth for user info
  - Fetch tasks on mount
  - Calculate statistics (total, active, completed, completion rate)
  - Display stat cards with icons
  - Add quick actions section (Create Task, View All Tasks)
  - Show recent tasks preview (first 5 tasks)
  - Handle empty state (no tasks yet)
  - Make responsive

- [ ] **T061** [US2] [P] Create tasks list page with filtering
  - Create `src/app/tasks/page.tsx`
  - Mark with `'use client'` directive
  - Fetch tasks on mount
  - Implement filter state (all/active/completed)
  - Display task count
  - Add Refresh and New Task buttons
  - Show error alert if fetch fails
  - Use TaskFilter component for tabs
  - Use TaskList component for display
  - Handle empty state for each filter
  - Make responsive

- [ ] **T062** [US2] [P] Create task creation page
  - Create `src/app/tasks/create/page.tsx`
  - Mark with `'use client'` directive
  - Add back button to /tasks
  - Add page header
  - Create form with title (required) and description (optional)
  - Add client-side validation
  - Handle form submission
  - Show loading state on button
  - Display error alert on failure
  - Redirect to /tasks on success
  - Make responsive

- [ ] **T063** [US2] [P] Create task editing page with dynamic route
  - Create `src/app/tasks/[id]/edit/page.tsx`
  - Mark with `'use client'` directive
  - Use useParams to get task ID
  - Fetch task on mount
  - Show loading spinner while fetching
  - Handle task not found (redirect to /tasks)
  - Pre-fill form with task data
  - Add completed checkbox
  - Handle form submission
  - Show loading state on button
  - Display error alert on failure
  - Redirect to /tasks on success
  - Show task metadata (created, updated)
  - Make responsive

---

## Phase 7: [US3] User Profile & Account Management (7 tasks)
**Goal:** Implement user profile page and account management features
**Estimated Time:** 1 hour

### User Story
**As an authenticated user**, I want to view and manage my account information so that I can maintain my profile and log out securely.

### Success Criteria
- ✅ Authenticated user can view their profile information
- ✅ Profile page displays user name and email
- ✅ Profile page displays account creation date
- ✅ User can log out and be redirected to login
- ✅ User session is cleared on logout
- ✅ Profile page is protected behind authentication

### Tasks

- [X] **T078** [US3] Create profile page
  - Create `src/app/profile/page.tsx`
  - Mark with `'use client'` directive
  - Use useAuth for user info
  - Use useRouter for navigation
  - Display user avatar (icon placeholder)
  - Display user name and email
  - Display member since date
  - Add logout button
  - Handle logout with router push to /login
  - Make responsive

- [X] **T079** [US3] [P] Enhance Navbar logout functionality
  - Update `src/components/layout/Navbar.tsx`
  - Connect logout button to auth.logout()
  - Use router.push('/login') after logout
  - Add confirmation dialog (optional)

- [X] **T080** [US3] [P] Test profile page display
  - Navigate to /profile
  - Verify user name displays correctly
  - Verify email displays correctly
  - Verify creation date formats correctly
  - Test responsive layout

- [X] **T081** [US3] [P] Test logout from profile
  - Navigate to /profile
  - Click logout button
  - Verify redirected to /login
  - Verify token removed from cookies
  - Verify cannot access /profile without login

- [X] **T082** [US3] [P] Test logout from navbar
  - From any protected page
  - Click logout in navbar
  - Verify redirected to /login
  - Verify session cleared

- [X] **T083** [US3] [P] Test profile route protection
  - Logout completely
  - Try to access /profile directly
  - Verify redirected to /login
  - Login again
  - Verify can access /profile

- [X] **T084** [US3] Test session cleanup
  - Login, navigate around app
  - Logout
  - Verify no auth data in cookies
  - Verify no auth state in context
  - Verify cannot access any protected route

**Validation Checkpoint:**
- Profile page displays user information correctly
- Logout functionality works from all locations
- Session is properly cleaned up on logout
- Route protection works for profile page

---

## Phase 8: [US4] Responsive Design Testing (8 tasks)
**Goal:** Verify and enhance responsive design across all device sizes
**Estimated Time:** 1-1.5 hours

### User Story
**As a user**, I want the application to work well on all device sizes so that I can manage my tasks from anywhere.

### Success Criteria
- ✅ UI is responsive on mobile devices (< 768px)
- ✅ UI is responsive on tablet devices (768px - 1024px)
- ✅ UI is responsive on desktop devices (> 1024px)
- ✅ Navigation adapts to different screen sizes
- ✅ Forms and inputs are usable on all devices
- ✅ Loading and error states are properly displayed on all sizes
- ✅ Touch targets are large enough on mobile (min 44x44px)
- ✅ Text is readable on all screen sizes

### Tasks

- [X] **T085** [US4] Test home page responsiveness
  - Test on mobile (375px width)
  - Test on tablet (768px width)
  - Test on desktop (1024px+ width)
  - Verify hero section scales correctly
  - Verify feature cards stack on mobile
  - Verify CTA buttons are accessible

- [X] **T086** [US4] [P] Test authentication pages responsiveness
  - Test login page on all sizes
  - Test register page on all sizes
  - Verify forms are centered and properly sized
  - Verify input fields are touch-friendly
  - Verify buttons are large enough on mobile

- [X] **T087** [US4] [P] Test dashboard responsiveness
  - Test stat cards on mobile (should stack)
  - Test stat cards on tablet (2 columns)
  - Test stat cards on desktop (3 columns)
  - Verify quick actions adapt to screen size
  - Verify recent tasks list is scrollable on mobile

- [X] **T088** [US4] [P] Test task list responsiveness
  - Test task items on mobile
  - Test task items on tablet
  - Test task items on desktop
  - Verify action buttons remain accessible
  - Verify filter tabs work on all sizes
  - Verify checkbox touch targets are large enough

- [X] **T089** [US4] [P] Test task forms responsiveness
  - Test create form on all sizes
  - Test edit form on all sizes
  - Verify inputs take full width on mobile
  - Verify buttons are full-width on mobile
  - Verify textarea is properly sized

- [X] **T090** [US4] [P] Test navigation responsiveness
  - Test navbar on mobile (hamburger menu)
  - Test navbar on desktop (full menu)
  - Verify sidebar hidden on mobile/tablet
  - Verify sidebar visible on desktop
  - Test mobile menu open/close

- [X] **T091** [US4] [P] Test profile page responsiveness
  - Test avatar and info layout on mobile
  - Test avatar and info layout on tablet
  - Test avatar and info layout on desktop
  - Verify logout button is accessible on all sizes

- [X] **T092** [US4] Perform cross-browser testing
  - Test on Chrome (desktop and mobile)
  - Test on Firefox
  - Test on Safari (desktop and mobile)
  - Test on Edge
  - Document any browser-specific issues

**Validation Checkpoint:**
- All pages work correctly on mobile devices
- All pages work correctly on tablet devices
- All pages work correctly on desktop devices
- No horizontal scrolling on any screen size
- All interactive elements are accessible

---

## Phase 9: [US5] Performance & Optimization (8 tasks)
**Goal:** Optimize application performance and implement best practices
**Estimated Time:** 1-1.5 hours

### User Story
**As a user**, I want the application to load quickly and perform smoothly so that I can efficiently manage my tasks.

### Success Criteria
- ✅ Initial page load under 3 seconds
- ✅ API responses complete within 2 seconds
- ✅ Task list renders efficiently with 100+ tasks
- ✅ Loading states provide good UX during operations
- ✅ No unnecessary re-renders
- ✅ Smooth animations and transitions

### Tasks

- [ ] **T093** [US5] Implement dynamic imports for heavy components
  - Identify components that can be lazy loaded
  - Use `next/dynamic` for non-critical components
  - Add loading fallbacks with Spinner

- [ ] **T094** [US5] [P] Add suspense boundaries
  - Wrap async components with Suspense
  - Add loading fallbacks
  - Test loading states

- [ ] **T095** [US5] [P] Implement error boundaries
  - Create error boundary component
  - Wrap major sections with error boundaries
  - Add fallback UI for errors

- [ ] **T096** [US5] [P] Optimize task list rendering
  - Add memoization to TaskItem component
  - Implement virtual scrolling if list is very long (optional)
  - Test with 100+ tasks

- [ ] **T097** [US5] [P] Optimize API calls
  - Ensure loading states prevent duplicate calls
  - Add debouncing if needed (e.g., search)
  - Consider caching frequently accessed data

- [ ] **T098** [US5] [P] Analyze bundle size
  - Run `npm run build`
  - Check .next/server and .next/static sizes
  - Ensure main bundle < 250KB
  - Identify and optimize large dependencies

- [ ] **T099** [US5] [P] Test performance with Lighthouse
  - Run Lighthouse audit on all pages
  - Aim for Performance score > 90
  - Fix any critical issues
  - Document results

- [ ] **T100** [US5] Test with large datasets
  - Create 200+ tasks in test account
  - Test task list performance
  - Test filtering performance
  - Test dashboard statistics calculation
  - Ensure no lag or freezing

**Validation Checkpoint:**
- Application loads quickly
- No performance bottlenecks
- Smooth user experience with large datasets
- Lighthouse scores are good

---

## Implementation Strategy

### MVP First (Core Functionality Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Core UI Components
3. Complete Phase 3: Authentication Pages
4. Complete Phase 4: Todo Management Pages
5. Complete Phase 5: Polish & Integration
6. Complete Phase 6: Task Management Implementation
7. Complete Phase 7: User Profile & Account Management
8. Complete Phase 8: Responsive Design Testing
9. Complete Phase 9: Performance & Optimization
10. **STOP and VALIDATE**: Test complete application

### Notes

- [P] tasks = different files, no dependencies
- Each phase should be independently completable and testable
- Verify implementation works with manual testing as specified
- Commit after each task or logical group
- Stop at any checkpoint to validate functionality independently
- Avoid: vague tasks, same file conflicts, dependencies that break independence