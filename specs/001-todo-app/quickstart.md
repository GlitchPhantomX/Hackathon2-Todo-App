# Quickstart Guide: Todo In-Memory Python Console Application

## Prerequisites
- Python 3.13 or higher
- No additional dependencies required (using only Python standard library)

## Project Structure
```
src/
├── main.py              # CLI entry point
├── models.py            # Task data model
└── services.py          # All task CRUD operations
```

## Getting Started

### 1. Run the Application
```bash
python src/main.py
```

### 2. Main Menu Options
Once the application starts, you'll see the main menu:
```
1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Mark Task Complete/Incomplete
0. Exit
```

### 3. Using the Application
- Enter the number corresponding to your desired action
- Follow the prompts to complete each operation
- The application will return to the main menu after each operation

## Core Operations

### Add Task
- Select option 1
- Enter task title (1-200 characters)
- Optionally enter task description
- Task will be created with unique ID and timestamp

### View Tasks
- Select option 2
- All tasks will be displayed with ID, title, completion status, and creation time
- If no tasks exist, the application will display "No tasks found." and return to main menu

### Update Task
- Select option 3
- Enter the task ID you want to update
- Enter new title and/or description
- Validation ensures title remains 1-200 characters

### Delete Task
- Select option 4
- Enter the task ID you want to delete
- Confirm deletion if prompted

### Mark Task Complete/Incomplete
- Select option 5
- Enter the task ID you want to toggle
- The completion status will switch from complete to incomplete or vice versa

## Error Handling
- Invalid menu options will show an error message and return to main menu
- Non-existent task IDs will show an error message and return to main menu
- Invalid input (empty titles, overly long titles) will show validation errors and allow re-entry

## In-Memory Storage Note
- All tasks are stored in memory only
- When the application exits, all tasks are cleared
- Data does not persist between application runs