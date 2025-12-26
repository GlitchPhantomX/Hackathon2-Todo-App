# Quickstart Guide: Dashboard Application Fix

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm/yarn/pnpm
- SQLite3

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
pip install fastapi uvicorn sqlalchemy python-multipart python-jose[cryptography] passlib[bcrypt] python-dotenv psycopg2-binary
```

2. **Configure Environment**
```bash
# Create .env file in backend directory
DATABASE_URL=sqlite:///./tasks.db
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

3. **Initialize Database**
```bash
# Run the FastAPI app to initialize the database
uvicorn main:app --reload
```

4. **Verify Backend**
```bash
# Test API endpoints
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/tasks
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install next react react-dom typescript @types/react @types/node @types/react-dom axios tailwindcss postcss autoprefixer lucide-react recharts shadcn-ui @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-alert-dialog @radix-ui/react-toast
```

2. **Configure Environment**
```bash
# Create .env.local file in frontend directory
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

3. **Setup Tailwind CSS**
```bash
npx tailwindcss init -p
```

4. **Start Development Server**
```bash
npm run dev
```

## Running the Application

### Development Mode
```bash
# Terminal 1: Start backend
cd backend
uvicorn main:app --reload

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Run backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Key Endpoints

### Backend API
- `GET /api/v1/tasks` - Get all user tasks
- `POST /api/v1/tasks` - Create new task
- `PUT /api/v1/tasks/{id}` - Update task
- `DELETE /api/v1/tasks/{id}` - Delete task
- `GET /api/v1/users/me` - Get current user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Frontend Routes
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Main dashboard
- `/dashboard/tasks` - Task management
- `/dashboard/projects` - Project management
- `/dashboard/profile` - User profile
- `/dashboard/settings` - Settings page

## API Usage Examples

### Creating a Task
```javascript
// POST /api/v1/tasks
const newTask = {
  title: "Complete project",
  description: "Finish the dashboard application",
  status: "pending",
  priority: "high",
  dueDate: "2024-12-31T00:00:00Z"
};

const response = await fetch('/api/v1/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(newTask)
});
```

### Getting Tasks
```javascript
// GET /api/v1/tasks
const response = await fetch('/api/v1/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const tasks = await response.json();
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check that `CORS_ORIGINS` in backend .env includes frontend URL
   - Restart backend server after changing CORS settings

2. **JWT Token Issues**
   - Verify `ACCESS_TOKEN_EXPIRE_MINUTES` and `REFRESH_TOKEN_EXPIRE_DAYS` are set correctly
   - Check that token is being sent in Authorization header as "Bearer {token}"

3. **Database Connection**
   - Ensure SQLite file has correct permissions
   - Verify `DATABASE_URL` is set correctly

4. **WebSocket Connection**
   - Check that `NEXT_PUBLIC_WS_URL` matches backend WebSocket URL
   - Verify that WebSocket endpoint is secured with JWT token

### Environment Variables
- `NEXT_PUBLIC_API_URL` - Frontend: Backend API URL
- `NEXT_PUBLIC_WS_URL` - Frontend: WebSocket URL
- `DATABASE_URL` - Backend: Database connection string
- `SECRET_KEY` - Backend: JWT secret key
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Backend: Access token expiration time
- `REFRESH_TOKEN_EXPIRE_DAYS` - Backend: Refresh token expiration time
- `CORS_ORIGINS` - Backend: Allowed origins for CORS

## Testing

### Backend Tests
```bash
# Run backend tests
pytest tests/
```

### Frontend Tests
```bash
# Run frontend tests
npm test
```

### API Testing
Use Postman or curl to test API endpoints:
```bash
# Create a task
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "Testing",
    "priority": "high",
    "status": "pending"
  }'
```