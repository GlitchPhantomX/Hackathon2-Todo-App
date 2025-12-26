# Data Model: User Settings

## Core Entities

### UserSettings
**Description**: Stores all user preferences and settings across different categories

**Fields**:
- `id`: number - Unique identifier for the settings record
- `user_id`: number - Reference to the user who owns these settings
- `appearance`: AppearanceSettings - Theme, accent color, font size preferences
- `notifications`: NotificationSettings - Notification preferences
- `task_defaults`: TaskDefaultSettings - Default values for new tasks
- `privacy`: PrivacySettings - Privacy and data preferences
- `integrations`: IntegrationSettings - Connected services and integrations
- `created_at`: string - Timestamp when settings were first created
- `updated_at`: string - Timestamp when settings were last updated

### AppearanceSettings
**Description**: User preferences for application appearance

**Fields**:
- `theme`: "light" | "dark" | "system" - UI theme preference
- `accent_color`: string - Hex code for primary accent color
- `font_size`: "S" | "M" | "L" - Font size preference
- `language`: string - Language preference (e.g., "en", "es")
- `date_format`: string - Preferred date format
- `time_format`: "12h" | "24h" - Time format preference

### NotificationSettings
**Description**: User preferences for application notifications

**Fields**:
- `enabled`: boolean - Whether notifications are enabled
- `sound_enabled`: boolean - Whether notification sounds are enabled
- `email_notifications`: boolean - Whether to receive email notifications
- `push_notifications`: boolean - Whether to receive push notifications
- `task_reminders`: boolean - Whether to receive task reminder notifications
- `daily_digest`: boolean - Whether to receive daily summary emails

### TaskDefaultSettings
**Description**: Default values for new tasks

**Fields**:
- `default_priority`: "low" | "medium" | "high" - Default priority for new tasks
- `default_project_id`: number | null - Default project for new tasks
- `default_view`: "list" | "grid" - Default view for task lists
- `items_per_page`: number - Number of items to show per page (default 10, 25, 50, 100)
- `auto_assign_today`: boolean - Whether to auto-assign today's date to new tasks

### PrivacySettings
**Description**: User privacy and data preferences

**Fields**:
- `data_retention_days`: number - How long to retain user data (0 = forever, max 365)
- `export_data_enabled`: boolean - Whether to allow data export
- `analytics_enabled`: boolean - Whether to share usage analytics
- `profile_visible`: boolean - Whether profile is visible to other users

### IntegrationSettings
**Description**: Connected services and integrations

**Fields**:
- `calendar_connected`: boolean - Whether calendar integration is connected
- `email_connected`: boolean - Whether email integration is connected
- `webhooks_enabled`: boolean - Whether webhooks are enabled
- `connected_services`: string[] - List of connected service names

## Relationships

### User to UserSettings
- One-to-One relationship
- A user has exactly one settings object
- Settings are created when user registers or on first visit to settings page

## Validation Rules

### UserSettings
- All nested setting objects must be valid
- User ID must reference an existing user
- Updated timestamp must be after created timestamp

### AppearanceSettings
- Theme must be one of the allowed values
- Accent color must be a valid hex code (#RRGGBB)
- Font size must be S, M, or L
- Language must be a valid ISO 639-1 code

### NotificationSettings
- All fields must be boolean values
- At least one notification type should be enabled (for user value)

### TaskDefaultSettings
- Default priority must be one of the allowed values
- Default project ID must reference an existing project or be null
- Items per page must be between 1 and 100 (default 10)

### PrivacySettings
- Data retention days must be between 0 and 365 (0 = forever)
- All fields must be boolean values

### IntegrationSettings
- All fields must be boolean values
- Connected services must be valid service identifiers

## State Transitions

### Settings Updates
1. User modifies settings via UI
2. Client validates settings locally
3. Client sends update request to API
4. API validates settings server-side
5. API updates settings in database
6. API returns updated settings
7. Client updates local cache (localStorage)

## API Endpoints

### GET /api/usersettings
- Retrieves user's current settings
- Requires authentication
- Returns complete UserSettings object

### PUT /api/usersettings
- Updates user's settings
- Requires authentication
- Accepts partial updates
- Returns updated UserSettings object

### POST /api/usersettings/export
- Exports user's data in specified format
- Requires authentication
- Returns user data in requested format (JSON, CSV)

## Default Values

### AppearanceSettings (default)
```json
{
  "theme": "system",
  "accent_color": "#3b82f6",
  "font_size": "M",
  "language": "en",
  "date_format": "MM/DD/YYYY",
  "time_format": "12h"
}
```

### NotificationSettings (default)
```json
{
  "enabled": true,
  "sound_enabled": true,
  "email_notifications": true,
  "push_notifications": false,
  "task_reminders": true,
  "daily_digest": false
}
```

### TaskDefaultSettings (default)
```json
{
  "default_priority": "medium",
  "default_project_id": null,
  "default_view": "list",
  "items_per_page": 10,
  "auto_assign_today": true
}
```

### PrivacySettings (default)
```json
{
  "data_retention_days": 365,
  "export_data_enabled": true,
  "analytics_enabled": true,
  "profile_visible": false
}
```

### IntegrationSettings (default)
```json
{
  "calendar_connected": false,
  "email_connected": false,
  "webhooks_enabled": false,
  "connected_services": []
}
```