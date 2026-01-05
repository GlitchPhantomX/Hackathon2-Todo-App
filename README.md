# 📝 Todo Application - Multi-Phase Evolution

[![Python 3.13+](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/downloads/)
[![Spec-Driven](https://img.shields.io/badge/development-spec--driven-green.svg)](https://github.com/panaversity/spec-kit-plus)
[![Phase](https://img.shields.io/badge/phase-multi-blue.svg)](./constitution.md)

> A comprehensive todo application built using **Spec-Driven Development** with **Claude Code** and **Spec-Kit Plus**, evolving from console app to full-stack web API.

---

## 🎯 **Project Overview**

This is the **Multi-Phase Evolution** of the Hackathon II "Todo App" project. It includes:

**Phase I**: In-Memory Console App - A fully functional console-based task management system with in-memory storage.

**Phase II**: Full-Stack Web API - A secure, production-ready REST API using FastAPI with JWT-based authentication that enables user registration, login, and protected task management operations with proper data isolation and security controls.

**Phase I Key Features:**
- ➕ Add tasks with title and description
- 📋 View all tasks with status indicators
- ✏️ Update task details
- ❌ Delete tasks
- ✅ Mark tasks as complete/incomplete

**Phase II Key Features:**
- 🔐 User registration with email, name, and password
- 🔑 User login with JWT token authentication
- 📱 RESTful API endpoints for task management
- 🔒 Protected endpoints requiring valid JWT tokens
- 👥 User isolation (users can only access their own tasks)
- 📊 API documentation at `/docs` (Swagger UI) and `/redoc` (ReDoc)
- 🏥 Health check endpoints at `/health`

**Development Approach:**
- 100% Spec-Driven Development (no manual coding)
- AI-generated implementation via Claude Code
- Comprehensive specifications in `/specs/`
- Modular, clean code architecture

---

## 🏗️ **Project Structure**

```
hackathon2-todo-app/
├── constitution.md           # Project governance and principles
├── CLAUDE.md                 # Spec-Kit Plus agent configuration
├── specs/                    # Feature specifications
│   ├── 001-todo-app/         # Phase I: Console App
│   │   ├── spec.md           # Main feature specification
│   │   ├── plan.md           # Architecture plan
│   │   ├── tasks.md          # Task breakdown
│   │   ├── data-model.md     # Data structures
│   │   ├── quickstart.md     # Quick reference
│   │   ├── research.md       # Research notes
│   │   ├── checklists/       # Validation checklists
│   │   └── contracts/        # API contracts
│   └── phase2-fullstack-web/ # Phase II: Full-Stack Web API
│       └── 02-backend-api-auth/ # Backend API & Authentication
│           ├── specs.md      # Specifications
│           ├── plan.md       # Architecture plan
│           ├── tasks.md      # Task breakdown
│           ├── data-model.md # Data models
│           ├── research.md   # Research notes
│           ├── quickstart.md # Quick reference
│           └── checklists/   # Validation checklists
├── src/                      # Phase I: Console App Python implementation
│   ├── main.py               # Application entry point
│   ├── models.py             # Data models (Task class)
│   └── services.py           # Business logic
├── backend/                  # Phase II: Backend API implementation
│   ├── main.py               # FastAPI application entry point
│   ├── config.py             # Configuration settings
│   ├── models.py             # SQLModel database models
│   ├── db.py                 # Database connection
│   ├── schemas.py            # Pydantic request/response models
│   ├── auth.py               # Authentication utilities (JWT, password hashing)
│   ├── dependencies.py       # FastAPI dependencies
│   ├── routers/              # API route modules
│   │   ├── auth.py           # Authentication endpoints
│   │   └── tasks.py          # Task management endpoints
│   ├── tests/                # Test modules
│   │   ├── conftest.py       # Test configuration
│   │   └── test_*.py         # Test files
│   ├── pyproject.toml        # Dependencies
│   ├── .env.example          # Environment variables template
│   └── README.md             # Backend documentation
└── README.md                 # This file
```

---

## ⚙️ **Technology Stack**

### Phase I: Console App
| Component | Technology |
|-----------|-----------|
| **Language** | Python 3.13+ |
| **Environment** | uv (Python package manager) |
| **Architecture** | In-memory, modular design |

### Phase II: Web API Backend
| Component | Technology |
|-----------|-----------|
| **Framework** | FastAPI 0.104+ |
| **Database** | SQLModel (with PostgreSQL) |
| **Authentication** | JWT with python-jose, password hashing with passlib[bcrypt] |
| **Validation** | Pydantic V2 |
| **Environment** | uv (Python package manager) |
| **AI Assistant** | Claude Code |
| **Spec Framework** | Spec-Kit Plus |

---

## 🚀 **Setup Instructions**

### **Prerequisites**

- **Python 3.13 or higher** installed
- **uv** package manager installed (`pip install uv`)
- **Windows users:** WSL 2 (Windows Subsystem for Linux) recommended

#### **WSL 2 Setup (Windows Users)**

```bash
# Install WSL 2
wsl --install

# Set WSL 2 as default
wsl --set-default-version 2

# Install Ubuntu
wsl --install -d Ubuntu-22.04
```

### **Installation**

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd hackathon2-todo-app
   ```

2. **Verify Python version:**
   ```bash
   python --version  # Should show 3.13 or higher
   ```

3. **Install dependencies for Phase II (Backend API):**
   ```bash
   cd backend
   uv sync  # Install all dependencies from pyproject.toml
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env  # Copy example environment file
   # Edit .env with your configuration
   ```

5. **Phase I (Console App) has no additional dependencies** - uses Python standard library only

---

## 🎮 **Usage**

### **Phase I: Console Application**

```bash
python src/main.py
```

### **Phase II: Backend API**

#### **Running the API Server**
```bash
cd backend
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### **API Endpoints**

**Authentication Endpoints:**
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user (requires JWT token)

**Task Management Endpoints:**
- `GET /api/v1/tasks/` - Get all tasks for current user
- `POST /api/v1/tasks/` - Create new task
- `GET /api/v1/tasks/{task_id}` - Get specific task
- `PUT /api/v1/tasks/{task_id}` - Update task
- `DELETE /api/v1/tasks/{task_id}` - Delete task

**Documentation & Health:**
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - API documentation (ReDoc)
- `GET /health` - Health check endpoint

#### **API Usage Examples**

**Register a new user:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "SecurePassword123"
  }'
```

**Login to get JWT token:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'username=user@example.com&password=SecurePassword123'
```

**Create a task (with JWT token):**
```bash
curl -X POST "http://localhost:8000/api/v1/tasks/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sample Task",
    "description": "This is a sample task"
  }'
```

### **Phase I: Console App Menu Options**

```
==============================
     TODO APPLICATION
==============================
1. ➕ Add Task
2. 📋 View Tasks
3. ✏️  Update Task
4. ❌ Delete Task
5. ✅ Mark Task Complete/Incomplete
0. 🚪 Exit
==============================
```

### **Phase I: Console App Feature Guide**

#### **1️⃣ Add Task**
```
Enter task title (1-200 characters): Buy groceries
Enter task description (optional, press Enter to skip): Milk, eggs, bread
Task created successfully with ID: 1
```

#### **2️⃣ View Tasks**
```
📋 TASK LIST
============================================================
 1. [1] ⏳ Buy groceries
    Description: Milk, eggs, bread
    Created: 2025-12-08 23:31:51
------------------------------------------------------------
Total: 1 task(s)
```

#### **3️⃣ Update Task**
```
Enter task ID to update: 1
Current task: [1] ✗ Buy groceries (Created: 2025-12-08 23:31:51)
Enter new title (current: 'Buy groceries', press Enter to keep current): Buy groceries and fruits
Enter new description (current: 'Milk, eggs, bread', press Enter to keep current):
Task updated successfully.
```

#### **4️⃣ Delete Task**
```
Enter task ID to delete: 1
Current task: [1] ✗ Buy groceries (Created: 2025-12-08 23:31:51)
Are you sure you want to delete this task? (y/N): y
Task deleted successfully.
```

#### **5️⃣ Mark Task Complete/Incomplete**
```
Enter task ID to toggle completion status: 1
Current task: [1] ✗ Buy groceries (Created: 2025-12-08 23:31:51)
Task marked as completed.
```

---

## 🧪 **Testing**

### **Phase I: Console App Manual Testing Checklist**

- [x] Add task with title only
- [x] Add task with title and description
- [x] View empty task list
- [x] View tasks with items
- [x] Update task title
- [x] Update task description
- [x] Delete existing task
- [x] Mark task as complete
- [x] Mark task as incomplete
- [x] Toggle task status multiple times

### **Phase I: Edge Cases Validated**

- [x] Invalid task ID (non-existent)
- [x] Invalid input type (text instead of number)
- [x] Empty task list handling
- [x] Exit confirmation

### **Phase II: Backend API Testing**

#### **Authentication Tests**
- [x] User registration with valid data
- [x] User registration with invalid data (validation errors)
- [x] User login with correct credentials
- [x] User login with incorrect credentials
- [x] Protected endpoint access with valid token
- [x] Protected endpoint access without token

#### **Task Management Tests**
- [x] Create task with valid data
- [x] Create task with invalid data (validation errors)
- [x] Get all tasks for user
- [x] Get specific task by ID
- [x] Update task details
- [x] Delete task
- [x] User isolation (can't access other users' tasks)

#### **Running Backend Tests**
```bash
cd backend
python -m pytest tests/ -v
```

---

## 📋 **Features Implemented**

### **Phase I: Console App Features**

| Feature | Status | Description |
|---------|--------|-------------|
| **Add Task** | ✅ Complete | Create tasks with title (required) and description (optional) |
| **View Tasks** | ✅ Complete | Display all tasks with ID, status, title, description, timestamp |
| **Update Task** | ✅ Complete | Modify existing task title and/or description |
| **Delete Task** | ✅ Complete | Remove tasks by ID with confirmation |
| **Mark Complete** | ✅ Complete | Toggle task completion status |

**All Phase I features include:**
- ✅ Input validation
- ✅ Error handling
- ✅ User-friendly messages
- ✅ Graceful edge case handling

### **Phase II: Backend API Features**

| Feature | Status | Description |
|---------|--------|-------------|
| **User Registration** | ✅ Complete | Create users with email, name, and password |
| **User Login** | ✅ Complete | Authenticate users and return JWT tokens |
| **Get Current User** | ✅ Complete | Retrieve current authenticated user information |
| **Create Task** | ✅ Complete | Create tasks with title and description |
| **Get All Tasks** | ✅ Complete | Retrieve all tasks for current user |
| **Get Specific Task** | ✅ Complete | Retrieve specific task by ID |
| **Update Task** | ✅ Complete | Update task details (title, description, completion status) |
| **Delete Task** | ✅ Complete | Delete task by ID |
| **User Isolation** | ✅ Complete | Users can only access their own tasks |
| **API Documentation** | ✅ Complete | Interactive docs at /docs and /redoc |
| **Health Checks** | ✅ Complete | System status at /health |

**All Phase II features include:**
- ✅ JWT-based authentication
- ✅ Input validation with Pydantic
- ✅ Error handling with appropriate HTTP status codes
- ✅ Database integration with SQLModel
- ✅ Password hashing with bcrypt
- ✅ Comprehensive test coverage

---

## 🎯 **Spec-Driven Development Process**

This project was built following strict Spec-Driven Development principles:

1. **Constitution First** → Defined project governance in `constitution.md`
2. **Specifications** → Documented requirements in `/specs/001-todo-app/`
3. **AI Generation** → Used Claude Code to generate implementation
4. **Iteration** → Refined specs until output met requirements
5. **Validation** → Tested against acceptance criteria

**No manual coding** - all implementation generated from specifications.

---

## 📚 **Documentation**

| Document | Purpose |
|----------|---------|
| [constitution.md](./constitution.md) | Project governance, principles, requirements |
| [CLAUDE.md](./CLAUDE.md) | Spec-Kit Plus agent configuration |
| [specs/001-todo-app/spec.md](./specs/001-todo-app/spec.md) | Main feature specification |
| [specs/001-todo-app/plan.md](./specs/001-todo-app/plan.md) | Architecture and design decisions |
| [specs/001-todo-app/tasks.md](./specs/001-todo-app/tasks.md) | Task breakdown and implementation steps |

---

## 🔄 **Data Storage**

### **Phase I: Console App**
**Important:** This is an **in-memory application**. All data is stored in RAM and will be **lost when the application exits**.

- ✅ Fast performance (no disk I/O)
- ✅ Simple architecture
- ❌ No data persistence between sessions

### **Phase II: Backend API**
Persistent data storage using PostgreSQL database with SQLModel ORM.

- ✅ Data persistence between sessions
- ✅ ACID compliance
- ✅ Relational data modeling
- ✅ Scalable architecture
- ✅ User authentication and task management

---

## ☁️ **Cloud-Native Blueprints (Bonus Feature)**

This project implements Cloud-Native Blueprints using an Agent Skill
(`cloud-native-blueprint-skill`) rather than hardcoded infrastructure logic.

The TodoReasoningSubagent uses this skill to declaratively determine:
- execution model (sync, async, event-driven)
- communication pattern
- scaling and resiliency hints
- observability requirements

The same reasoning agent and blueprint skill are reused unchanged across:
- Phase III (Local AI Chatbot)
- Phase IV (Kubernetes Deployment)
- Phase V (Event-Driven Architecture)

This enables cloud portability and infrastructure independence while keeping
intelligence reusable and spec-driven.

---

## 🎓 **Learning Outcomes**

This phase demonstrates:
- ✅ Spec-Driven Development workflow
- ✅ Clean code architecture (separation of concerns)
- ✅ Input validation and error handling
- ✅ User-friendly console interface design
- ✅ AI-assisted development with Claude Code

---

## 🚀 **Next Phases**

- **Phase II:** Full-stack web application (Next.js + FastAPI + Neon DB) - **IN PROGRESS**
- **Phase III:** AI-powered chatbot with OpenAI Agents SDK
- **Phase IV:** Kubernetes deployment (Minikube + Helm)
- **Phase V:** Cloud deployment (DigitalOcean + Kafka + Dapr)

---

## 👤 **Author**

**[Your Name]**  
Hackathon II - Todo App Evolution  
Panaversity | PIAIC | GIAIC

---

## 📄 **License**

This project is part of the Hackathon II submission.

---

## 🙏 **Acknowledgments**

- **Panaversity Team** for organizing Hackathon II
- **Claude Code** for AI-assisted development
- **Spec-Kit Plus** for specification framework

---

**Built with ❤️ using Spec-Driven Development**