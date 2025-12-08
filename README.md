# 📝 Todo Application - Phase I: In-Memory Console App

[![Python 3.13+](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/downloads/)
[![Spec-Driven](https://img.shields.io/badge/development-spec--driven-green.svg)](https://github.com/panaversity/spec-kit-plus)
[![Phase](https://img.shields.io/badge/phase-I-orange.svg)](./constitution.md)

> A command-line todo application built using **Spec-Driven Development** with **Claude Code** and **Spec-Kit Plus**.

---

## 🎯 **Project Overview**

This is **Phase I** of the Hackathon II "Evolution of Todo" project. It implements a fully functional console-based task management system with in-memory storage.

**Key Features:**
- ➕ Add tasks with title and description
- 📋 View all tasks with status indicators
- ✏️ Update task details
- ❌ Delete tasks
- ✅ Mark tasks as complete/incomplete

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
│   └── 001-todo-app/
│       ├── spec.md           # Main feature specification
│       ├── plan.md           # Architecture plan
│       ├── tasks.md          # Task breakdown
│       ├── data-model.md     # Data structures
│       ├── quickstart.md     # Quick reference
│       ├── research.md       # Research notes
│       ├── checklists/       # Validation checklists
│       └── contracts/        # API contracts
├── src/                      # Python implementation
│   ├── main.py               # Application entry point
│   ├── models.py             # Data models (Task class)
│   └── services.py           # Business logic
└── README.md                 # This file
```

---

## ⚙️ **Technology Stack**

| Component | Technology |
|-----------|-----------|
| **Language** | Python 3.13+ |
| **Environment** | uv (Python package manager) |
| **AI Assistant** | Claude Code |
| **Spec Framework** | Spec-Kit Plus |
| **Architecture** | In-memory, modular design |

---

## 🚀 **Setup Instructions**

### **Prerequisites**

- **Python 3.13 or higher** installed
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

3. **No additional dependencies required** - uses Python standard library only

---

## 🎮 **Usage**

### **Running the Application**

```bash
python src/main.py
```

### **Menu Options**

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

### **Feature Guide**

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

### **Manual Testing Checklist**

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

### **Edge Cases Validated**

- [x] Invalid task ID (non-existent)
- [x] Invalid input type (text instead of number)
- [x] Empty task list handling
- [x] Exit confirmation

---

## 📋 **Features Implemented**

| Feature | Status | Description |
|---------|--------|-------------|
| **Add Task** | ✅ Complete | Create tasks with title (required) and description (optional) |
| **View Tasks** | ✅ Complete | Display all tasks with ID, status, title, description, timestamp |
| **Update Task** | ✅ Complete | Modify existing task title and/or description |
| **Delete Task** | ✅ Complete | Remove tasks by ID with confirmation |
| **Mark Complete** | ✅ Complete | Toggle task completion status |

**All features include:**
- ✅ Input validation
- ✅ Error handling
- ✅ User-friendly messages
- ✅ Graceful edge case handling

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

**Important:** This is an **in-memory application**. All data is stored in RAM and will be **lost when the application exits**.

- ✅ Fast performance (no disk I/O)
- ✅ Simple architecture
- ❌ No data persistence between sessions

This is Phase I - persistence will be added in Phase II with database integration.

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

- **Phase II:** Full-stack web application (Next.js + FastAPI + Neon DB)
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