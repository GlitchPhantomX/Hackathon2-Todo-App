# Data Model: Advanced Todo App Features

## 1. Task Entity Extension

### Fields
- `id`: Integer (Primary Key)
- `title`: String (Required)
- `description`: Text (Optional)
- `completed`: Boolean (Default: false)
- `priority`: String (Enum: 'low', 'medium', 'high')
- `due_date`: DateTime (Optional, with timezone)
- `timezone`: String (Default: 'UTC', based on user preference)
- `is_recurring`: Boolean (Default: false)
- `frequency`: String (Enum: 'daily', 'weekly', 'monthly', 'custom')
- `recurrence_end_date`: DateTime (Optional)
- `parent_task_id`: Integer (Foreign Key to tasks.id, Optional)
- `recurrence_pattern`: JSONB (For complex patterns, Optional)
- `reminder_enabled`: Boolean (Default: true)
- `reminder_timing`: String (Enum: '15min', '1hr', '1day', Default: '1hr')
- `reminder_sent`: Boolean (Default: false)
- `is_overdue`: Computed Boolean (based on due_date and completion status)
- `user_id`: Integer (Foreign Key to users.id, Required)
- `created_at`: DateTime (Default: now)
- `updated_at`: DateTime (Default: now, updates on change)

### Relationships
- One-to-many: User → Tasks
- Self-referencing: Parent Task → Child Tasks (for recurring task instances)
- Many-to-one: Child Task → Parent Task (for recurring task instances)

### Validation Rules
- If `is_recurring` is true, `frequency` must be specified
- If `recurrence_end_date` is set, it must be after `due_date`
- `due_date` cannot be in the past for new recurring tasks
- `reminder_timing` values must be valid time units
- `frequency` must be one of the allowed values

## 2. User Entity Extension

### Fields
- `id`: Integer (Primary Key)
- `timezone_preference`: String (Default: detected from browser/system)
- `reminder_settings`: JSONB (Default reminder preferences)

### Relationships
- One-to-many: User → Tasks

## 3. Event Entity (for Kafka integration)

### Fields
- `id`: UUID (Primary Key)
- `event_type`: String (Enum: 'TASK_CREATED', 'TASK_UPDATED', 'TASK_COMPLETED', 'TASK_DELETED', 'TASK_RECURRING_CREATED', 'REMINDER_DUE_15MIN', 'REMINDER_DUE_1HR', 'REMINDER_DUE_1DAY', 'REMINDER_OVERDUE')
- `task_id`: Integer (Foreign Key to tasks.id)
- `user_id`: Integer (Foreign Key to users.id)
- `payload`: JSONB (Event-specific data)
- `timestamp`: DateTime (Default: now)
- `processed`: Boolean (Default: false)

### Validation Rules
- `event_type` must be one of the allowed values
- `task_id` and `user_id` must reference valid records
- `payload` must contain required fields for the event type

## 4. Notification Entity

### Fields
- `id`: UUID (Primary Key)
- `user_id`: Integer (Foreign Key to users.id)
- `task_id`: Integer (Foreign Key to tasks.id, Optional)
- `type`: String (Enum: 'success', 'info', 'warning', 'error', 'reminder')
- `title`: String (Required)
- `message`: Text (Required)
- `timestamp`: DateTime (Default: now)
- `read_status`: Boolean (Default: false)
- `delivery_method`: String (Enum: 'websocket', 'email', 'push', Default: 'websocket')

### Validation Rules
- `type` must be one of the allowed values
- `user_id` must reference a valid user
- `delivery_method` must be valid

## 5. Recurring Task Series Entity (Optional Enhancement)

### Fields
- `id`: Integer (Primary Key)
- `name`: String (Optional, for series identification)
- `original_task_id`: Integer (Foreign Key to tasks.id)
- `frequency`: String (Enum: 'daily', 'weekly', 'monthly', 'custom')
- `recurrence_pattern`: JSONB (Complex pattern specification)
- `recurrence_end_date`: DateTime (Optional)
- `total_instances`: Integer (Calculated count)
- `active_instances`: Integer (Count of non-completed instances)

### Relationships
- One-to-many: Series → Tasks (via parent_task_id)

### Validation Rules
- `original_task_id` must reference a recurring task
- `recurrence_end_date` must be after the original task's due date if set