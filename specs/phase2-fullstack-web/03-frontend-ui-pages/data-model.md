# Data Model: Frontend UI & Pages (Next.js 16+)

## Document Overview
**Feature:** Frontend UI & Pages
**Phase:** II - Full-Stack Web Application
**Framework:** Next.js 16+ with App Router
**Status:** 🟢 Data Model Complete
**Created:** December 9, 2025
**Last Updated:** December 9, 2025

---

## Entity Models

### 1. User Entity
```typescript
interface User {
  id: number;                    // Unique identifier from backend
  email: string;                 // User's email address (unique, validated)
  name: string;                  // User's display name
  created_at: string;            // ISO timestamp of account creation
}
```

**Validation Rules:**
- `id`: Positive integer, required, immutable
- `email`: Valid email format, required, unique, max 255 chars
- `name`: Required, min 1 char, max 100 chars
- `created_at`: ISO 8601 format timestamp, required

**Relationships:**
- One-to-many with Task (user has many tasks)
- Owned by one user (foreign key: user_id in Task)

### 2. Task Entity
```typescript
interface Task {
  id: number;                    // Unique identifier from backend
  user_id: number;               // Reference to owning user
  title: string;                 // Task title/description
  description: string;           // Detailed task description
  completed: boolean;            // Completion status
  created_at: string;            // ISO timestamp of creation
  updated_at: string;            // ISO timestamp of last update
}
```

**Validation Rules:**
- `id`: Positive integer, required, immutable
- `user_id`: Positive integer, required, references User.id
- `title`: Required, min 1 char, max 200 chars
- `description`: Optional, max 1000 chars
- `completed`: Boolean, default false
- `created_at`: ISO 8601 format timestamp, required
- `updated_at`: ISO 8601 format timestamp, required

**State Transitions:**
- `completed: false` → `completed: true` (mark as done)
- `completed: true` → `completed: false` (mark as undone)

### 3. Authentication Credentials
```typescript
interface LoginCredentials {
  email: string;                 // User's email address
  password: string;              // User's password (encrypted in transit)
}

interface RegisterCredentials {
  email: string;                 // User's email address
  name: string;                  // User's display name
  password: string;              // User's password (min 8 chars)
}
```

**Validation Rules:**
- `email`: Valid email format, required, max 255 chars
- `name`: Required, min 1 char, max 100 chars
- `password`: Required, min 8 chars, max 128 chars

### 4. Authentication Response
```typescript
interface AuthResponse {
  access_token: string;          // JWT token for authentication
  token_type: string;            // Token type (typically "bearer")
}
```

**Validation Rules:**
- `access_token`: JWT format string, required
- `token_type`: Literal "bearer", required

---

## State Models

### 1. Authentication State
```typescript
interface AuthState {
  user: User | null;             // Current authenticated user
  token: string | null;          // JWT token string
  isAuthenticated: boolean;      // Authentication status
  isLoading: boolean;            // Loading state during auth operations
  error: string | null;          // Error message during auth operations
}
```

**State Transitions:**
- `initial` → `loading` (during login/register)
- `loading` → `authenticated` (on successful login)
- `loading` → `unauthenticated` (on failed login)
- `authenticated` → `unauthenticated` (on logout/expiry)

### 2. Task State
```typescript
interface TaskState {
  tasks: Task[];                 // Array of user's tasks
  isLoading: boolean;            // Loading state during API operations
  error: string | null;          // Error message during task operations
}
```

**State Transitions:**
- `initial` → `loading` (during fetch/create/update/delete)
- `loading` → `loaded` (on successful operation)
- `loading` → `error` (on failed operation)

---

## API Models

### 1. Task Creation Payload
```typescript
interface TaskCreate {
  title: string;                 // Task title (required)
  description: string;           // Task description (optional)
}
```

### 2. Task Update Payload
```typescript
interface TaskUpdate {
  title?: string;                // Task title (optional)
  description?: string;          // Task description (optional)
  completed?: boolean;           // Completion status (optional)
}
```

### 3. API Response Wrapper
```typescript
interface ApiResponse<T> {
  data: T;                       // Response data payload
  message?: string;              // Optional success message
}
```

### 4. API Error Response
```typescript
interface ApiError {
  detail: string | ValidationError[]; // Error details
}

interface ValidationError {
  loc: string[];                 // Location of validation error
  msg: string;                   // Error message
  type: string;                  // Error type
}
```

---

## Component Props Models

### 1. Button Component
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; // Visual style
  size?: 'sm' | 'md' | 'lg';                             // Size variation
  loading?: boolean;                                      // Loading state indicator
  fullWidth?: boolean;                                    // Full-width display
  children: React.ReactNode;                              // Button content
}
```

### 2. Input Component
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;                                         // Input label
  error?: string;                                         // Error message
  helperText?: string;                                    // Helper text
}
```

### 3. Alert Component
```typescript
interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';     // Visual style
  title?: string;                                         // Alert title
  children: React.ReactNode;                              // Alert content
  onClose?: () => void;                                   // Close callback
}
```

### 4. Task Filter Options
```typescript
type TaskFilter = 'all' | 'active' | 'completed';         // Task filtering options
```

---

## Data Flow Models

### 1. Authentication Flow
```
User Input (credentials)
→ AuthService.login()
→ API call to /auth/login
→ JWT response
→ Store token in cookie
→ Get user details from /auth/me
→ Update AuthContext state
```

### 2. Task Creation Flow
```
User Input (task data)
→ TaskService.createTask()
→ API call to /tasks
→ Backend validation
→ Database insertion
→ Return created task
→ Update TaskContext state
```

### 3. Task Update Flow
```
User Input (task changes)
→ TaskService.updateTask()
→ API call to /tasks/{id}
→ Backend validation
→ Database update
→ Return updated task
→ Update TaskContext state
```

### 4. Task Deletion Flow
```
User Action (delete)
→ TaskService.deleteTask()
→ API call to /tasks/{id}
→ Backend validation
→ Database deletion
→ Update TaskContext state
```

---

## Storage Models

### 1. Client-Side Storage
- **JWT Token:** Stored in HttpOnly cookie (secure)
- **User Data:** Stored in cookie with 7-day expiry
- **Form State:** Managed in component state (ephemeral)
- **Session Data:** Managed in React Context (ephemeral)

### 2. Cache Models
- **API Responses:** Cached temporarily during request lifecycle
- **User Data:** Cached in cookie for quick access
- **Component Data:** Cached in component state until unmount

---

## Validation Rules

### 1. Input Validation
- **Email:** Must match email regex pattern
- **Password:** Minimum 8 characters
- **Task Title:** Minimum 1 character, maximum 200 characters
- **Task Description:** Maximum 1000 characters

### 2. Business Rules
- **Authentication Required:** For protected routes
- **Ownership Validation:** Users can only access their own tasks
- **Token Expiration:** Redirect to login on 401 responses
- **Unique Email:** During registration

### 3. Error Handling
- **Network Errors:** Show user-friendly message
- **Validation Errors:** Display field-specific errors
- **Server Errors:** Show appropriate error message
- **Permission Errors:** Redirect to login

---

## Performance Constraints

### 1. Data Volume
- **Tasks per User:** Maximum 1000 tasks per user
- **Pagination:** 50 tasks per page
- **Batch Operations:** Limit to 100 operations per request

### 2. Response Times
- **API Calls:** Under 2 seconds
- **Page Loads:** Under 3 seconds
- **Form Submissions:** Under 5 seconds

### 3. Memory Usage
- **Component State:** Minimize unnecessary data
- **Context Size:** Keep only essential data in global state
- **Browser Memory:** Limit to 100MB per tab

---

## Security Constraints

### 1. Authentication
- **Token Storage:** HttpOnly cookies with sameSite=lax
- **Token Expiry:** 7-day expiration by default
- **Secure Flag:** HTTPS-only in production

### 2. Authorization
- **Route Protection:** Middleware-based protection
- **API Access:** Token required for protected endpoints
- **Data Isolation:** Users can only access their own data

### 3. Input Sanitization
- **Client Validation:** All inputs validated on client
- **Server Validation:** All inputs validated on server
- **XSS Prevention:** React automatic escaping

---

## Accessibility Models

### 1. WCAG 2.1 AA Compliance
- **Keyboard Navigation:** All interactive elements accessible via keyboard
- **Screen Reader:** Proper ARIA labels and semantic HTML
- **Color Contrast:** Minimum 4.5:1 ratio for normal text
- **Focus Management:** Visible focus indicators
- **Alternative Text:** Descriptive alt text for images

### 2. Responsive Design
- **Mobile First:** Design starts with mobile and scales up
- **Breakpoints:** sm: 640px, md: 768px, lg: 1024px, xl: 1280px
- **Touch Targets:** Minimum 44px touch targets
- **Viewport Scaling:** Proper viewport meta tag configuration

---

## API Contract Summary

### Authentication Endpoints
- **POST /auth/register** → User (Register new user)
- **POST /auth/login** → AuthResponse (Login user)
- **GET /auth/me** → User (Get current user)
- **DELETE /auth/logout** → (Logout user - client side only)

### Task Endpoints
- **GET /tasks** → Task[] (Get all user tasks)
- **POST /tasks** → Task (Create new task)
- **GET /tasks/{id}** → Task (Get single task)
- **PUT /tasks/{id}** → Task (Update task)
- **DELETE /tasks/{id}** → (Delete task)

---

## Implementation Notes

### 1. TypeScript Strict Mode
- All entities strongly typed
- Optional fields explicitly marked with ?
- Union types for enums (TaskFilter)
- Generic types for API responses

### 2. Component Composition
- Small, focused components
- Reusable UI components
- Container vs presentational pattern
- Proper separation of concerns

### 3. State Management
- Context for global state
- useState for local component state
- useReducer for complex state logic
- Custom hooks for shared logic

### 4. Error Boundaries
- Global error handling via Axios interceptors
- Component-level error boundaries
- User-friendly error messages
- Graceful degradation patterns

---

## Data Transformation Patterns

### 1. API to Component Mapping
- Backend snake_case → Frontend camelCase
- ISO timestamps → Formatted dates via date-fns
- Raw API responses → Typed interfaces
- Error responses → User-friendly messages

### 2. Form Data Processing
- User input → Validation → API payload
- Error responses → Field-specific errors
- Loading states → UI feedback
- Success responses → Navigation/redirection

---

## Quality Assurance

### 1. Data Integrity
- Type safety via TypeScript
- Runtime validation where needed
- Proper error handling
- Consistent state management

### 2. Performance Monitoring
- Bundle size tracking
- API response time monitoring
- Component rendering optimization
- Memory usage optimization

### 3. Security Validation
- JWT token validation
- Cookie security settings
- XSS protection
- CSRF protection via sameSite cookies

---

## Versioning & Migration

### 1. API Compatibility
- Versioned API endpoints (v1)
- Backward compatibility maintained
- Proper error messages for deprecated features
- Migration paths for breaking changes

### 2. Client Updates
- Gradual rollout strategies
- Feature flags for new functionality
- Proper error fallbacks
- User notification for updates

---

**Status:** 🟢 Data Model Complete
**Next:** Proceed to implementation following the spec and plan
**Verification:** All entities, relationships, and validation rules documented