---
id: 003
title: Create Implementation Plan
stage: plan
date: 2025-12-08
surface: agent
model: Claude Sonnet 4.5
feature: todo-app
branch: 001-todo-app
user: user
command: /sp.plan
labels: [planning, architecture, implementation]
links:
  spec: specs/001-todo-app/spec.md
  plan: specs/001-todo-app/plan.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-todo-app/plan.md
 - specs/001-todo-app/research.md
 - specs/001-todo-app/data-model.md
 - specs/001-todo-app/quickstart.md
 - specs/001-todo-app/contracts/api-contracts.md
 - history/prompts/todo-app/003-create-implementation-plan.plan.prompt.md
tests:
 - none
---

## Prompt

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Setup**: Run `.specify/scripts/powershell/setup-plan.ps1 -Json` from repo root and parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load context**: Read FEATURE_SPEC and `.specify/memory/constitution.md`. Load IMPL_PLAN template (already copied).

3. **Execute plan workflow**: Follow the structure in IMPL_PLAN template to:
   - Fill Technical Context (mark unknowns as "NEEDS CLARIFICATION")
   - Fill Constitution Check section from constitution
   - Evaluate gates (ERROR if violations unjustified)
   - Phase 0: Generate research.md (resolve all NEEDS CLARIFICATION)
   - Phase 1: Generate data-model.md, contracts/, quickstart.md
   - Phase 1: Update agent context by running the agent script
   - Re-evaluate Constitution Check post-design

4. **Stop and report**: Command ends after Phase 2 planning. Report branch, IMPL_PLAN path, and generated artifacts.

## Phases

### Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```text
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

### Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Agent context update**:
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude`
   - These scripts detect which AI agent is in use
   - Update the appropriate agent-specific context file
   - Add only new technology from current plan
   - Preserve manual additions between markers

**Output**: data-model.md, /contracts/*, quickstart.md, agent-specific file

## Key rules

- Use absolute paths
- ERROR on gate failures or unresolved clarifications

---

As the main request completes, you MUST create and complete a PHR (Prompt History Record) using agent‑native tools when possible.

1) Determine Stage
   - Stage: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate Title and Determine Routing:
   - Generate Title: 3–7 words (slug for filename)
   - Route is automatically determined by stage:
     - `constitution` → `history/prompts/constitution/`
     - Feature stages → `history/prompts/<feature-name>/` (spec, plan, tasks, red, green, refactor, explainer, misc)
     - `general` → `history/prompts/general/`

3) Create and Fill PHR (Shell first; fallback agent‑native)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Open the file and fill remaining placeholders (YAML + body), embedding full PROMPT_TEXT (verbatim) and concise RESPONSE_TEXT.
   - If the script fails:
     - Read `.specify/templates/phr-template.prompt.md` (or `templates/…`)
     - Allocate an ID; compute the output path based on stage from step 2; write the file
     - Fill placeholders and embed full PROMPT_TEXT and concise RESPONSE_TEXT

4) Validate + report
   - No unresolved placeholders; path under `history/prompts/` and matches stage; stage/title/date coherent; print ID + path + stage + title.
   - On failure: warn, don't block. Skip only for `/sp.phr`.
## Response snapshot

I've successfully completed the implementation planning for the Todo In-Memory Python Console Application. Here's what was accomplished:

## Plan Artifacts Created:

1. **Implementation Plan**: specs/001-todo-app/plan.md
   - Technical context with Python 3.13+, in-memory storage, and constitution compliance
   - Constitution check with verification of all requirements
   - Project structure following constitution guidelines

2. **Research Document**: specs/001-todo-app/research.md
   - Technology stack decisions (Python standard library only)
   - Data model and ID generation approaches
   - Console interface and error handling strategies

3. **Data Model**: specs/001-todo-app/data-model.md
   - Detailed Task entity with fields, validation rules, and state transitions
   - Task collection structure and operations

4. **Quickstart Guide**: specs/001-todo-app/quickstart.md
   - Getting started instructions
   - Core operations documentation
   - Error handling information

5. **API Contracts**: specs/001-todo-app/contracts/api-contracts.md
   - Service interface definitions
   - Function signatures and specifications

6. **Agent Context Updated**: CLAUDE.md updated with project-specific information

## Constitution Compliance Verified:

✓ All implementation will be generated by Claude Code
✓ Clean code guidelines with modular architecture
✓ In-memory data only (no external storage)
✓ Progressive evolution approach
✓ Technology stack compliance (Python standard library only)
✓ Required project structure (main.py, models.py, services.py)

The implementation plan is now complete and ready for the next phase: creating the implementation tasks with /sp.tasks.

## Outcome

- ✅ Impact: Complete implementation plan with all required artifacts
- 🧪 Tests: none
- 📁 Files: specs/001-todo-app/plan.md, specs/001-todo-app/research.md, specs/001-todo-app/data-model.md, specs/001-todo-app/quickstart.md, specs/001-todo-app/contracts/api-contracts.md, CLAUDE.md (updated)
- 🔁 Next prompts: Ready for /sp.tasks to create implementation tasks
- 🧠 Reflection: Plan is comprehensive and follows all constitution requirements

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed with /sp.tasks to create implementation tasks