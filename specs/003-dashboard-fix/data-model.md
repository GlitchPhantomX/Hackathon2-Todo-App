# Data Model: Dashboard Application Fix

## Entities

### 1. User
**Description**: Represents a registered user of the system
**Fields**:
- id: String (primary key, format: "user_{UUID}")
- email: String (unique, required)
- name: String (required, 1-100 chars)
- hashed_password: String (required)
- created_at: DateTime (default: now)
- updated_at: DateTime (default: now, auto-update)

**Relationships**:
- tasks: One-to-many (User has many Tasks)
- projects: One-to-many (User has many Projects)
- tags: One-to-many (User has many Tags)
- notifications: One-to-many (User has many Notifications)

**Validation Rules**:
- email: Must be valid email format
- name: 1-100 characters, no special characters

### 2. Task
**Description**: Represents a task in the system
**Fields**:
- id: String (primary key, format: "task_{UUID}")
- title: String (required, 3-100 chars)
- description: String (optional, max 1000 chars)
- status: String (required, enum: ['pending', 'in-progress', 'completed'])
- priority: String (required, enum: ['low', 'medium', 'high'])
- due_date: DateTime (optional)
- project_id: String (foreign key to Project, optional)
- user_id: String (foreign key to User, required)
- created_at: DateTime (default: now)
- updated_at: DateTime (default: now, auto-update)

**Relationships**:
- user: Many-to-one (Task belongs to User)
- project: Many-to-one (Task belongs to Project, optional)
- tags: Many-to-many (Task has many Tags through task_tags junction table)

**Validation Rules**:
- title: 3-100 characters
- description: max 1000 characters
- status: must be one of ['pending', 'in-progress', 'completed']
- priority: must be one of ['low', 'medium', 'high']

### 3. Project
**Description**: Represents a project grouping tasks
**Fields**:
- id: String (primary key, format: "proj_{UUID}")
- name: String (required, 1-100 chars)
- description: String (optional, max 500 chars)
- color: String (optional, default: "#3B82F6")
- user_id: String (foreign key to User, required)
- created_at: DateTime (default: now)
- updated_at: DateTime (default: now, auto-update)

**Relationships**:
- user: Many-to-one (Project belongs to User)
- tasks: One-to-many (Project has many Tasks)
- tags: One-to-many (Project has many Tags)

**Validation Rules**:
- name: 1-100 characters
- description: max 500 characters
- color: valid hex color format

### 4. Tag
**Description**: Represents a tag that can be applied to tasks and projects
**Fields**:
- id: String (primary key, format: "tag_{UUID}")
- name: String (required, 3-100 chars)
- color: String (optional, default: "#3B82F6")
- user_id: String (foreign key to User, required)
- created_at: DateTime (default: now)

**Relationships**:
- user: Many-to-one (Tag belongs to User)
- tasks: Many-to-many (Tag has many Tasks through task_tags junction table)
- projects: Many-to-many (Tag has many Projects through project_tags junction table)

**Validation Rules**:
- name: 3-100 characters
- color: valid hex color format

### 5. Notification
**Description**: Represents a notification for a user
**Fields**:
- id: String (primary key, format: "notif_{UUID}")
- title: String (required, 1-100 chars)
- message: String (optional, max 500 chars)
- type: String (required, enum: ['info', 'warning', 'success', 'error'])
- read: Boolean (default: false)
- user_id: String (foreign key to User, required)
- created_at: DateTime (default: now)

**Relationships**:
- user: Many-to-one (Notification belongs to User)

**Validation Rules**:
- title: 1-100 characters
- message: max 500 characters
- type: must be one of ['info', 'warning', 'success', 'error']

## State Transitions

### Task Status Transitions
- pending → in-progress (when user starts working on task)
- in-progress → completed (when user finishes task)
- completed → pending (when user reopens completed task)
- pending → completed (direct transition possible)

### Notification Read State
- unread (default) → read (when user marks as read)

## Database Schema

### Tables
1. `users` - Stores user information
2. `tasks` - Stores task information
3. `projects` - Stores project information
4. `tags` - Stores tag information
5. `notifications` - Stores notification information
6. `task_tags` - Junction table for many-to-many relationship between tasks and tags
7. `project_tags` - Junction table for many-to-many relationship between projects and tags

### Indexes
- users.email: Unique index for fast user lookup
- tasks.user_id: Index for filtering user's tasks
- tasks.project_id: Index for filtering tasks by project
- notifications.user_id: Index for filtering user's notifications
- notifications.read: Index for filtering read/unread notifications
- tags.user_id: Index for filtering user's tags

### Constraints
- Foreign key constraints to maintain referential integrity
- Check constraints for enum values (status, priority, type)
- Not null constraints for required fields
- Unique constraints where appropriate (email)