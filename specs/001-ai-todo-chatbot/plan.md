# Implementation Plan: AI-Powered Todo Chatbot

**Branch**: `001-ai-todo-chatbot` | **Date**: 2025-12-27 | **Spec**: [link](../specs/001-ai-todo-chatbot/spec.md)
**Input**: Feature specification from `/specs/[001-ai-todo-chatbot]/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a professional AI chatbot interface for natural language task management with dual access points (navbar icon + floating button), full-featured chat page with conversation history, OpenAI-powered natural language understanding, MCP tools for task operations, and database persistence for all conversations.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Python 3.11, TypeScript/JavaScript ES2022
**Primary Dependencies**: FastAPI, OpenAI SDK, MCP, SQLModel, PostgreSQL, Next.js 14, React, Tailwind CSS
**Storage**: PostgreSQL database with SQLModel ORM
**Testing**: pytest for backend, Jest/React Testing Library for frontend
**Target Platform**: Web application (Linux/Mac/Windows compatible)
**Project Type**: Web application (dual frontend/backend structure)
**Performance Goals**: Response time < 2 seconds, 95% uptime, 80%+ test coverage
**Constraints**: <200ms p95 for chat responses, rate limiting at 10 messages/minute, secure data handling with AES-256 encryption
**Scale/Scope**: Support for 1000+ concurrent users, 10k+ daily messages, mobile-responsive UI

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The implementation must follow the preservation rules defined in the specification:
- DO NOT modify any files in `/frontend/src/app/(protected)/`
- DO NOT modify any files in `/frontend/src/app/` except `new-dashboard/`
- ONLY modify specific allowed files: NewDashboardNavbar.tsx, new-dashboard layout, models.py, main.py
- CREATE new files only in designated directories: `/backend/mcp/`, `/backend/agents/`, `/backend/routers/chat_router.py`, `/frontend/src/app/new-dashboard/chat/`, `/frontend/src/components/chat/`, etc.

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-todo-chatbot/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   ├── services/
│   ├── api/
│   ├── mcp/              # New: MCP server implementation
│   ├── agents/           # New: OpenAI agent implementation
│   └── routers/
│       └── chat_router.py # New: Chat API endpoints
└── tests/
    └── test_chat.py      # New: Chat functionality tests

frontend/
├── src/
│   ├── components/
│   │   ├── chat/        # New: All chat components
│   │   ├── NewDashboardNavbar.tsx # Modified: Add chatbot icon
│   │   └── FloatingChatbot.tsx    # New: Floating button component
│   ├── contexts/
│   │   └── ChatContext.tsx # New: Chat state management
│   ├── services/
│   │   └── chatService.ts # New: API client
│   ├── types/
│   │   └── chat.types.ts  # New: TypeScript types
│   └── app/
│       └── new-dashboard/
│           └── chat/      # New: Chat page implementation
└── tests/
    └── chat/             # New: Component tests
```

**Structure Decision**: Web application structure with separate backend and frontend components, following the existing architecture pattern while adding new chatbot functionality in designated areas.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |