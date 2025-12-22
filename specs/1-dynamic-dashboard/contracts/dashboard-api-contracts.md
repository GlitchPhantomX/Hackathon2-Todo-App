# API Contracts: Dynamic Dashboard Enhancement

## 1. Overview

This document outlines the API contracts for the dynamic dashboard functionality. The dashboard will consume existing backend API endpoints that are already implemented in the FastAPI backend with Better Auth authentication.

## 2. Authentication Requirements

All dashboard API calls require authentication via JWT token provided by Better Auth. The token must be included in the Authorization header:

```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

## 3. Task Management Endpoints

### 3.1 Get User Tasks
**Endpoint**: `GET /api/{user_id}/tasks`

**Description**: Fetch all tasks for the authenticated user

**Path Parameters**:
- `user_id` (string): The ID of the user whose tasks to retrieve

**Headers**:
- `Authorization`: Bearer token from Better Auth session

**Response**:
```json
{
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "description": "string | null",
      "completed": "boolean",
      "priority": "low | medium | high",
      "due_date": "string | null",
      "created_at": "string",
      "updated_at": "string",
      "user_id": "string",
      "tags": ["string"]
    }
  ]
}
```

**Usage in Dashboard**:
- Used by `DashboardStats` to calculate statistics
- Used by chart components to generate visualizations
- Used by `TaskManagementPanel` to display task list

### 3.2 Create New Task
**Endpoint**: `POST /api/{user_id}/tasks`

**Description**: Create a new task for the user

**Path Parameters**:
- `user_id` (string): The ID of the user creating the task

**Headers**:
- `Authorization`: Bearer token from Better Auth session

**Request Body**:
```json
{
  "title": "string",
  "description": "string",
  "priority": "low | medium | high",
  "due_date": "string (ISO format)",
  "tags": ["string"]
}
```

**Response**:
```json
{
  "id": "string",
  "title": "string",
  "description": "string | null",
  "completed": "boolean",
  "priority": "low | medium | high",
  "due_date": "string | null",
  "created_at": "string",
  "updated_at": "string",
  "user_id": "string",
  "tags": ["string"]
}
```

**Usage in Dashboard**:
- Used by `AddTaskModal` when creating new tasks
- Triggers refresh of dashboard data after successful creation

### 3.3 Update Task
**Endpoint**: `PUT /api/{user_id}/tasks/{task_id}`

**Description**: Update an existing task

**Path Parameters**:
- `user_id` (string): The ID of the user
- `task_id` (string): The ID of the task to update

**Headers**:
- `Authorization`: Bearer token from Better Auth session

**Request Body**:
```json
{
  "title": "string",
  "description": "string",
  "completed": "boolean",
  "priority": "low | medium | high",
  "due_date": "string (ISO format)",
  "tags": ["string"]
}
```

**Response**:
```json
{
  "id": "string",
  "title": "string",
  "description": "string | null",
  "completed": "boolean",
  "priority": "low | medium | high",
  "due_date": "string | null",
  "created_at": "string",
  "updated_at": "string",
  "user_id": "string",
  "tags": ["string"]
}
```

**Usage in Dashboard**:
- Used by task editing functionality
- Triggers refresh of dashboard data after successful update

### 3.4 Delete Task
**Endpoint**: `DELETE /api/{user_id}/tasks/{task_id}`

**Description**: Delete a task

**Path Parameters**:
- `user_id` (string): The ID of the user
- `task_id` (string): The ID of the task to delete

**Headers**:
- `Authorization`: Bearer token from Better Auth session

**Response**:
```json
{
  "message": "string"
}
```

**Usage in Dashboard**:
- Used by task deletion functionality in `TaskManagementPanel`
- Triggers refresh of dashboard data after successful deletion

### 3.5 Toggle Task Completion
**Endpoint**: `PATCH /api/{user_id}/tasks/{task_id}/complete`

**Description**: Toggle the completion status of a task

**Path Parameters**:
- `user_id` (string): The ID of the user
- `task_id` (string): The ID of the task to toggle

**Headers**:
- `Authorization`: Bearer token from Better Auth session

**Response**:
```json
{
  "id": "string",
  "title": "string",
  "description": "string | null",
  "completed": "boolean",
  "priority": "low | medium | high",
  "due_date": "string | null",
  "created_at": "string",
  "updated_at": "string",
  "user_id": "string",
  "tags": ["string"]
}
```

**Usage in Dashboard**:
- Used by completion toggles in `TaskManagementPanel`
- Triggers refresh of dashboard stats after successful toggle

## 4. Dashboard-Specific Data Processing

### 4.1 Stats Calculation
The dashboard will calculate statistics from the task data on the frontend:

- **Total Tasks**: Count of all tasks
- **Completed Tasks**: Count of tasks with `completed: true`
- **Pending Tasks**: Count of tasks with `completed: false`
- **Overdue Tasks**: Count of incomplete tasks with `due_date` in the past

### 4.2 Chart Data Processing
The dashboard will transform task data for visualization:

- **Productivity Chart**: Group tasks by date and completion status
- **Tasks Over Time**: Show cumulative task creation over time
- **Priority Distribution**: Count tasks by priority level

## 5. Error Handling

### 5.1 Standard Error Response
All endpoints return standard error responses when applicable:

```json
{
  "detail": "string"
}
```

### 5.2 Common Error Status Codes
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User does not have permission to access resource
- `404 Not Found`: Requested resource does not exist
- `422 Unprocessable Entity`: Request validation failed
- `500 Internal Server Error`: Server-side error occurred

## 6. Performance Considerations

### 6.1 Rate Limiting
- API endpoints may be subject to rate limiting
- Dashboard should implement appropriate retry mechanisms with exponential backoff

### 6.2 Caching Strategy
- Dashboard components should cache data to reduce API calls
- Implement smart refresh strategies (e.g., 30-second intervals)
- Invalidate cache on user actions that modify data

## 7. Frontend Implementation

### 7.1 API Service Integration
The existing `taskService` in `frontend/src/services/api.ts` already implements all required API calls. The dashboard components will use this service directly.

### 7.2 Authentication Integration
Dashboard components will retrieve the user ID and authentication token using Better Auth's session management functions.

### 7.3 Data Transformation
Dashboard components will transform the raw task data into the required formats for stats and charts as outlined in the data model documentation.