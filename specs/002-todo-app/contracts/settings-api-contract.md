# API Contract: User Settings

## Overview
This document defines the API endpoints for managing user settings in the Todo App. The settings include appearance preferences, notification settings, task defaults, privacy options, and integration connections.

## Base Path
All endpoints are relative to `/api/v1`

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer {jwt_token}
```

## Endpoints

### GET /usersettings
Retrieve the current user's settings.

#### Request
```
GET /api/v1/usersettings
Authorization: Bearer {jwt_token}
```

#### Response
**Success Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 123,
  "appearance": {
    "theme": "light",
    "accent_color": "#3b82f6",
    "font_size": "M",
    "language": "en",
    "date_format": "MM/DD/YYYY",
    "time_format": "12h"
  },
  "notifications": {
    "enabled": true,
    "sound_enabled": true,
    "email_notifications": true,
    "push_notifications": false,
    "task_reminders": true,
    "daily_digest": false
  },
  "task_defaults": {
    "default_priority": "medium",
    "default_project_id": null,
    "default_view": "list",
    "items_per_page": 10,
    "auto_assign_today": true
  },
  "privacy": {
    "data_retention_days": 365,
    "export_data_enabled": true,
    "analytics_enabled": true,
    "profile_visible": false
  },
  "integrations": {
    "calendar_connected": false,
    "email_connected": false,
    "webhooks_enabled": false,
    "connected_services": []
  },
  "created_at": "2025-12-23T10:00:00Z",
  "updated_at": "2025-12-23T10:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing JWT token
- `404 Not Found`: User settings not found
- `500 Internal Server Error`: Server error

### PUT /usersettings
Update the current user's settings. Supports partial updates.

#### Request
```
PUT /api/v1/usersettings
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "appearance": {
    "theme": "dark",
    "accent_color": "#8b5cf6",
    "font_size": "L"
  },
  "notifications": {
    "enabled": false
  }
}
```

#### Response
**Success Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 123,
  "appearance": {
    "theme": "dark",
    "accent_color": "#8b5cf6",
    "font_size": "L",
    "language": "en",
    "date_format": "MM/DD/YYYY",
    "time_format": "12h"
  },
  "notifications": {
    "enabled": false,
    "sound_enabled": true,
    "email_notifications": true,
    "push_notifications": false,
    "task_reminders": true,
    "daily_digest": false
  },
  "task_defaults": {
    "default_priority": "medium",
    "default_project_id": null,
    "default_view": "list",
    "items_per_page": 10,
    "auto_assign_today": true
  },
  "privacy": {
    "data_retention_days": 365,
    "export_data_enabled": true,
    "analytics_enabled": true,
    "profile_visible": false
  },
  "integrations": {
    "calendar_connected": false,
    "email_connected": false,
    "webhooks_enabled": false,
    "connected_services": []
  },
  "created_at": "2025-12-23T10:00:00Z",
  "updated_at": "2025-12-23T11:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request body or validation errors
- `401 Unauthorized`: Invalid or missing JWT token
- `404 Not Found`: User settings not found
- `500 Internal Server Error`: Server error

### POST /usersettings/export
Export user data in the specified format.

#### Request
```
POST /api/v1/usersettings/export?format=json
Authorization: Bearer {jwt_token}
```

#### Query Parameters
- `format`: Export format (json, csv, pdf) - defaults to json

#### Response
**Success Response (200 OK):**
Returns the exported data in the requested format.

**Error Responses:**
- `400 Bad Request`: Invalid format parameter
- `401 Unauthorized`: Invalid or missing JWT token
- `500 Internal Server Error`: Server error during export

### POST /usersettings/integrations/{service}/connect
Connect to a specific integration service.

#### Request
```
POST /api/v1/usersettings/integrations/calendar/connect
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "access_token": "service_access_token",
  "refresh_token": "service_refresh_token"
}
```

#### Response
**Success Response (200 OK):**
```json
{
  "success": true,
  "service": "calendar",
  "connected": true
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Invalid or missing JWT token
- `404 Not Found`: Service not found
- `500 Internal Server Error`: Server error

### DELETE /usersettings/integrations/{service}/disconnect
Disconnect from a specific integration service.

#### Request
```
DELETE /api/v1/usersettings/integrations/calendar/disconnect
Authorization: Bearer {jwt_token}
```

#### Response
**Success Response (200 OK):**
```json
{
  "success": true,
  "service": "calendar",
  "connected": false
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing JWT token
- `404 Not Found`: Service not found or not connected
- `500 Internal Server Error`: Server error

## Common Error Format
All error responses follow this format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Optional error details
    }
  }
}
```

## Validation Rules
- All color values must be valid hex codes (#RRGGBB format)
- Theme values must be one of: "light", "dark", "system"
- Font size must be one of: "S", "M", "L"
- Priority values must be one of: "low", "medium", "high"
- View values must be one of: "list", "grid"
- Data retention days must be between 0 and 365
- All boolean values must be true or false