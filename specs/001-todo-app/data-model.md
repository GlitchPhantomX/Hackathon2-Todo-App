# Data Model: Todo In-Memory Python Console Application

## Task Entity

### Fields
- **id**: int (auto-incrementing starting from 1)
  - Unique identifier for each task
  - Primary key for task identification
  - Generated automatically when task is created

- **title**: str (required, 1-200 characters)
  - Task title/description in short form
  - Required field with validation for length constraints
  - Cannot be empty

- **description**: str (optional)
  - Detailed description of the task
  - Optional field, can be empty or null equivalent
  - No length restrictions

- **completed**: bool (default false)
  - Task completion status
  - Boolean value indicating if task is completed
  - Default value is false when task is created

- **created_at**: datetime (ISO 8601 format: YYYY-MM-DD HH:MM:SS)
  - Timestamp of when the task was created
  - Automatically set when task is created
  - Stored in ISO 8601 format for consistency

### Validation Rules
- Title must be 1-200 characters (no empty titles, no overly long titles)
- ID must be unique within the application session
- created_at is read-only after creation
- completed status can be toggled between true/false

### State Transitions
- **Creation**: id (auto-assigned), title (required), description (optional), completed (false), created_at (auto-assigned)
- **Update**: title and/or description can be modified while maintaining validation rules
- **Completion Toggle**: completed status switches between true and false
- **Deletion**: Task is removed from the in-memory collection

## Task Collection

### Structure
- **tasks**: List[Task] or Dict[int, Task]
  - In-memory storage for all Task entities during application session
  - Either a list of Task objects or dictionary with ID as key
  - Maintains all tasks until application exits

### Operations
- Add: Appends new Task to collection
- Retrieve: Access Task by ID
- Update: Modifies existing Task in collection
- Delete: Removes Task from collection
- List: Returns all Tasks in collection for viewing