# Data Model: AI-Powered Todo Chatbot

## Overview
This document describes the data models for the AI-powered todo chatbot feature, extending the existing todo application data model.

## Entity: Conversation
**Purpose**: Represents a user's chat session with the AI assistant

**Fields**:
- id: int (Primary Key, Auto-increment)
- user_id: int (Foreign Key to users.id, ON DELETE CASCADE)
- title: str (VARCHAR(200), NOT NULL) - Auto-generated from first message
- created_at: datetime (TIMESTAMP, DEFAULT NOW(), NOT NULL)
- updated_at: datetime (TIMESTAMP, DEFAULT NOW(), NOT NULL)
- is_archived: bool (BOOLEAN, DEFAULT FALSE)

**Relationships**:
- One-to-Many: Conversation → ChatMessage (via conversation_id)
- Many-to-One: Conversation ← User (via user_id)

**Validation Rules**:
- user_id must reference an existing user
- title must be between 1 and 200 characters
- created_at and updated_at are automatically managed

## Entity: ChatMessage
**Purpose**: Represents individual messages in a conversation

**Fields**:
- id: int (Primary Key, Auto-increment)
- conversation_id: int (Foreign Key to conversations.id, ON DELETE CASCADE)
- role: str (VARCHAR(20), CHECK: 'user' or 'assistant', NOT NULL)
- content: str (TEXT, NOT NULL)
- timestamp: datetime (TIMESTAMP, DEFAULT NOW(), NOT NULL)
- metadata_json: str (TEXT, optional) - For tool calls, etc.

**Relationships**:
- Many-to-One: ChatMessage → Conversation (via conversation_id)
- One-to-Many: ChatMessage ← Conversation (via conversation_id)

**Validation Rules**:
- conversation_id must reference an existing conversation
- role must be either 'user' or 'assistant'
- content must not be empty
- content length should be less than 4000 characters (for rate limiting)

## State Transitions

### Conversation States
- **Active**: Default state when conversation is created
- **Archived**: When is_archived = true, conversation is moved to archive

### Lifecycle
1. User starts new conversation → Conversation created with is_archived = false
2. User interacts → ChatMessage records created with conversation_id
3. User archives conversation → is_archived set to true
4. User deletes conversation → Conversation and all related ChatMessages deleted (due to CASCADE)

## Indexes
- idx_user_conversations: ON conversations(user_id, updated_at DESC) - For efficient user conversation listing
- idx_conversation_messages: ON chat_messages(conversation_id, timestamp) - For efficient message retrieval

## Security Considerations
- All chat messages must be encrypted at rest using AES-256
- Data isolation by user_id ensures users can only access their own conversations
- Content sanitization required to prevent XSS in chat messages