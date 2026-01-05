# API Contracts: Chat-Dashboard Integration

## WebSocket API

### WebSocket Endpoint
```
ws://localhost:8000/ws?token={jwt_token}
```

### Authentication
- All WebSocket connections require valid JWT token in query parameter
- Token must be verified against existing auth system
- Unauthorized connections will be rejected with close code 1008

### Message Format
All messages follow this structure:

```json
{
  "type": "string",
  "data": "object",
  "timestamp": "ISO8601 datetime string"
}
```

### Event Types

#### Client to Server Events

**Message Send**
```
Type: "message"
Data: {
  "content": "string",
  "session_id": "UUID"
}
```

**Sync Request**
```
Type: "sync_request"
Data: {}
```

#### Server to Client Events

**Task Created**
```
Type: "task_created"
Data: {
  "task": {
    "id": "UUID",
    "title": "string",
    "description": "string",
    "status": "pending|in_progress|completed",
    "priority": "low|medium|high|urgent",
    "due_date": "ISO8601 datetime string | null",
    "created_at": "ISO8601 datetime string",
    "updated_at": "ISO8601 datetime string",
    "user_id": "UUID"
  },
  "userId": "UUID",
  "timestamp": "ISO8601 datetime string"
}
```

**Task Updated**
```
Type: "task_updated"
Data: {
  "task": { /* Same task structure as above */ },
  "userId": "UUID",
  "timestamp": "ISO8601 datetime string"
}
```

**Task Deleted**
```
Type: "task_deleted"
Data: {
  "taskId": "UUID",
  "userId": "UUID",
  "timestamp": "ISO8601 datetime string"
}
```

**Task Status Changed**
```
Type: "task_status_changed"
Data: {
  "task": { /* Same task structure as above */ },
  "userId": "UUID",
  "timestamp": "ISO8601 datetime string"
}
```

**Sync Response**
```
Type: "sync_response"
Data: {
  "tasks": "array of task objects",
  "timestamp": "ISO8601 datetime string"
}
```

## REST API Endpoints

### Chat Session Endpoints

**Get Chat Sessions**
```
GET /api/chat/sessions
Authorization: Bearer {jwt_token}

Response:
200 OK
[
  {
    "id": "UUID",
    "user_id": "UUID",
    "title": "string",
    "created_at": "ISO8601 datetime string",
    "updated_at": "ISO8601 datetime string",
    "is_active": "boolean"
  }
]
```

**Create New Chat Session**
```
POST /api/chat/sessions
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request:
{
  "title": "string"
}

Response:
200 OK
{
  "id": "UUID",
  "user_id": "UUID",
  "title": "string",
  "created_at": "ISO8601 datetime string",
  "updated_at": "ISO8601 datetime string",
  "is_active": "boolean"
}
```

**Get Chat Session Messages**
```
GET /api/chat/sessions/{session_id}/messages
Authorization: Bearer {jwt_token}

Response:
200 OK
[
  {
    "id": "UUID",
    "session_id": "UUID",
    "role": "user|assistant",
    "content": "string",
    "created_at": "ISO8601 datetime string",
    "message_type": "text|command|response"
  }
]
```

**Add Message to Session**
```
POST /api/chat/sessions/{session_id}/messages
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request:
{
  "role": "user|assistant",
  "content": "string",
  "message_type": "text|command|response"
}

Response:
200 OK
{
  "id": "UUID",
  "session_id": "UUID",
  "role": "user|assistant",
  "content": "string",
  "created_at": "ISO8601 datetime string",
  "message_type": "text|command|response"
}
```

**Update Chat Session Title**
```
PATCH /api/chat/sessions/{session_id}
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request:
{
  "title": "string"
}

Response:
200 OK
{
  "id": "UUID",
  "user_id": "UUID",
  "title": "string",
  "created_at": "ISO8601 datetime string",
  "updated_at": "ISO8601 datetime string",
  "is_active": "boolean"
}
```

**Delete Chat Session**
```
DELETE /api/chat/sessions/{session_id}
Authorization: Bearer {jwt_token}

Response:
204 No Content
```

## Task Synchronization Endpoints

**Get Tasks with Synchronization**
```
GET /api/tasks/sync
Authorization: Bearer {jwt_token}

Response:
200 OK
{
  "tasks": [/* array of task objects */],
  "last_sync": "ISO8601 datetime string"
}
```

**Create Task with Sync Broadcast**
```
POST /api/tasks/
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request:
{
  "title": "string",
  "description": "string",
  "status": "pending|in_progress|completed",
  "priority": "low|medium|high|urgent",
  "due_date": "ISO8601 datetime string | null"
}

Response:
200 OK
{
  "id": "UUID",
  "title": "string",
  "description": "string",
  "status": "pending|in_progress|completed",
  "priority": "low|medium|high|urgent",
  "due_date": "ISO8601 datetime string | null",
  "created_at": "ISO8601 datetime string",
  "updated_at": "ISO8601 datetime string",
  "user_id": "UUID"
}
```

**Update Task with Sync Broadcast**
```
PUT /api/tasks/{task_id}
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request:
{
  "title": "string",
  "description": "string",
  "status": "pending|in_progress|completed",
  "priority": "low|medium|high|urgent",
  "due_date": "ISO8601 datetime string | null"
}

Response:
200 OK
{
  "id": "UUID",
  "title": "string",
  "description": "string",
  "status": "pending|in_progress|completed",
  "priority": "low|medium|high|urgent",
  "due_date": "ISO8601 datetime string | null",
  "created_at": "ISO8601 datetime string",
  "updated_at": "ISO8601 datetime string",
  "user_id": "UUID"
}
```

**Delete Task with Sync Broadcast**
```
DELETE /api/tasks/{task_id}
Authorization: Bearer {jwt_token}

Response:
204 No Content
```

## Error Responses

All endpoints may return these standard error responses:

**400 Bad Request**
```json
{
  "error": "string",
  "details": "object"
}
```

**401 Unauthorized**
```json
{
  "error": "Unauthorized",
  "message": "Authentication token is missing or invalid"
}
```

**403 Forbidden**
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

**404 Not Found**
```json
{
  "error": "Not Found",
  "message": "The requested resource was not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```