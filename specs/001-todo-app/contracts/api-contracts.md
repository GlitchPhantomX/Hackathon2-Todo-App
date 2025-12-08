# API Contracts: Todo In-Memory Python Console Application

## Overview
This document defines the functional contracts for the console todo application. Since this is a console application, the "API" refers to the internal function interfaces between modules.

## Core Services Interface

### TaskService Interface

#### create_task(title: str, description: str = None) -> Task
- **Purpose**: Creates a new task with the given title and optional description
- **Parameters**:
  - title: Required string (1-200 characters)
  - description: Optional string
- **Returns**: Task object with assigned ID and timestamp
- **Validation**: Title must be 1-200 characters
- **Side Effects**: Adds task to in-memory collection

#### get_all_tasks() -> List[Task]
- **Purpose**: Retrieves all tasks in the system
- **Parameters**: None
- **Returns**: List of all Task objects, sorted by ID
- **Side Effects**: None

#### get_task_by_id(task_id: int) -> Task | None
- **Purpose**: Retrieves a specific task by its ID
- **Parameters**:
  - task_id: Integer ID of the task to retrieve
- **Returns**: Task object if found, None if not found
- **Side Effects**: None

#### update_task(task_id: int, title: str = None, description: str = None) -> bool
- **Purpose**: Updates an existing task's title and/or description
- **Parameters**:
  - task_id: Integer ID of the task to update
  - title: Optional new title (if provided, must be 1-200 characters)
  - description: Optional new description
- **Returns**: True if update successful, False if task not found
- **Validation**: If title is provided, it must be 1-200 characters
- **Side Effects**: Modifies existing task in collection

#### delete_task(task_id: int) -> bool
- **Purpose**: Removes a task from the system
- **Parameters**:
  - task_id: Integer ID of the task to delete
- **Returns**: True if deletion successful, False if task not found
- **Side Effects**: Removes task from in-memory collection

#### toggle_task_completion(task_id: int) -> bool
- **Purpose**: Toggles the completion status of a task
- **Parameters**:
  - task_id: Integer ID of the task to toggle
- **Returns**: True if toggle successful, False if task not found
- **Side Effects**: Changes completed status of existing task

#### validate_title(title: str) -> bool
- **Purpose**: Validates that a title meets requirements
- **Parameters**:
  - title: String to validate
- **Returns**: True if valid (1-200 characters), False otherwise
- **Side Effects**: None