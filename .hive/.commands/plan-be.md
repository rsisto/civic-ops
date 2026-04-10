# /plan-be — Backend Implementation Plan

**Agent:** Architect (read `.hive/.agents/architect.md`)
**Usage:** `/plan-be <ticket-id>`

---

## Process

### 1. Read context
- Enriched Jira ticket (Atlassian MCP or local file if no MCP)
- `.hive/specs/ARCHITECTURE.md`
- `.hive/specs/api-spec.yml`
- `.hive/specs/data-model.md`
- `.hive/standards/core.mdc`
- `.hive/standards/backend.mdc`
- Stack-specific DDD standards

Verify library versions via Context7 MCP before specifying them in the plan.

### 2. Apply DDD layer order (strict — never invert)
```
Domain        → Entities, Value Objects, Aggregates, Domain Events, Domain Services
Application   → Use Cases, Services (orchestration, no business logic)
Infrastructure → Repository implementations, DB adapters, external clients
Presentation  → Controllers (thin), Routes (RESTful)
```

### 3. Produce the plan

**Output file:** `.hive/changes/<ticket-id>_backend.md`

---

## Plan Template

```markdown
# Backend Implementation Plan: <TICKET-ID> <Feature Name>

## Overview
{Brief description + DDD/clean architecture principles applied}

## Architecture Context
- Layers involved: {Domain | Application | Infrastructure | Presentation}
- Bounded context: {which domain owns this}
- Aggregate root: {entry point for state changes}
- Domain events emitted: {none | EventName}

## Implementation Steps

### Step 0: Create feature branch
- Branch: `feature/<ticket-id>-<short-description>-backend`
- Base: latest `develop`
- Commands:
  ```bash
  git checkout develop && git pull origin develop
  git checkout -b feature/<ticket-id>-<description>-backend
  ```

### Step 1: Write failing tests (TDD — do this FIRST)
- File: `backend/src/tests/<module>/<feature>.test.ts`
- Test cases to cover: {list one per acceptance criterion}
- Run to confirm they fail: `npm test -- --testPathPattern=<feature>`

### Step N: <Layer — Action>
- **File:** `backend/src/<layer>/<file>.ts`
- **Action:** {what to implement}
- **Function signature:** `functionName(param: Type): ReturnType`
- **Implementation steps:**
  1. {step}
  2. {step}
- **Dependencies:** {imports needed}
- **Notes:** {invariants, validation rules, error cases}

{Repeat for each layer in domain → application → infrastructure → presentation order}

### Step N+1: Run and verify tests
- All new tests pass: `npm test`
- Coverage threshold met: `npm run test:coverage`
- Linting: `npm run lint`
- Type check: `npm run typecheck`

### Step N+2: Update documentation
- Follow `/update-docs` process
- Identify and update: data-model.md, api-spec.yml, backend-standards.md (as needed)

## Implementation Order
1. Step 0 — branch
2. Step 1 — failing tests
3. {ordered steps}
4. Step N+1 — verify
5. Step N+2 — docs

## Testing Checklist
- [ ] Unit tests: domain logic, service methods
- [ ] Integration tests: API endpoints (happy path + error cases)
- [ ] Coverage ≥ 90% on new code
- [ ] No `test.only` or `test.skip` committed

## Error Response Format
```json
{ "error": "HUMAN_READABLE_CODE", "message": "User-facing message" }
```
HTTP mapping: 400 validation, 401 auth, 403 forbidden, 404 not found, 409 conflict, 500 server

## Dependencies
- {library@version — confirmed via Context7}

## Notes
- {Business rules, edge cases, non-obvious decisions}

## Implementation Verification
- [ ] Code follows DDD layer separation
- [ ] SOLID principles applied
- [ ] All acceptance criteria covered by tests
- [ ] Documentation updated
- [ ] TypeScript strict — zero errors
- [ ] Linter — zero warnings
```

## Rules
- Never specify a library version without confirming via Context7 MCP
- If a new aggregate or bounded context is needed → write an ADR before the plan
- Plan subtasks in strict domain → application → infrastructure → presentation order
- Tests step is always Step 1 — never moved later
- Docs step is always the last step
