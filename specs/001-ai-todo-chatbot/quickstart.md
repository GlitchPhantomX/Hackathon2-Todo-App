# Quickstart: AI-Powered Todo Chatbot

## Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 12+
- OpenAI API key

## Setup Backend

### 1. Install Dependencies
```bash
cd backend
pip install -e .
```

### 2. Set Environment Variables
```bash
# backend/.env
DATABASE_URL=postgresql://username:password@localhost/todo_app
JWT_SECRET_KEY=your-super-secret-key
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
MCP_SERVER_URL=http://localhost:8001
```

### 3. Run Database Migrations
```bash
cd backend
alembic revision --autogenerate -m "Add chat models"
alembic upgrade head
```

### 4. Start MCP Server
```bash
cd backend
python -m mcp.server
```

### 5. Start Backend API
```bash
cd backend
uvicorn main:app --reload --port 8000
```

## Setup Frontend

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Set Environment Variables
```bash
# frontend/.env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CHAT_ENABLED=true
```

### 3. Run Development Server
```bash
cd frontend
npm run dev
```

## API Endpoints

### Chat API
- `POST /api/chat/message` - Send message to AI
- `GET /api/chat/conversations` - List user conversations
- `POST /api/chat/conversations/new` - Create conversation
- `GET /api/chat/conversations/{id}/messages` - Get messages
- `PUT /api/chat/conversations/{id}` - Update conversation
- `DELETE /api/chat/conversations/{id}` - Delete conversation

## Key Components

### Backend Structure
```
backend/
├── mcp/                  # MCP server and tools
│   ├── server.py
│   ├── tools.py
│   └── schemas.py
├── agents/              # OpenAI agent implementation
│   ├── todo_agent.py
│   ├── prompts.py
│   └── conversation_manager.py
├── routers/
│   └── chat_router.py   # Chat API endpoints
├── models.py            # Extended with Conversation, ChatMessage
└── config.py            # Extended with OpenAI settings
```

### Frontend Structure
```
frontend/src/
├── components/
│   ├── chat/            # All chat components
│   │   ├── ChatSidebar.tsx
│   │   ├── ChatHeader.tsx
│   │   ├── MessageArea.tsx
│   │   ├── ChatInput.tsx
│   │   └── ChatEmptyState.tsx
│   ├── FloatingChatbot.tsx
│   └── NewDashboardNavbar.tsx
├── contexts/
│   └── ChatContext.tsx
├── services/
│   └── chatService.ts
├── types/
│   └── chat.types.ts
└── app/
    └── new-dashboard/
        └── chat/         # Chat page implementation
```

## Testing

### Backend Tests
```bash
cd backend
pytest tests/test_chat.py
```

### Frontend Tests
```bash
cd frontend
npm run test -- src/__tests__/chat/
```

## Deployment

### Environment Variables
```bash
# Production environment variables
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

### Build Frontend
```bash
cd frontend
npm run build
```

### Run in Production
```bash
cd backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```