# /plan-fe — Frontend Implementation Plan

**Agent:** Architect (read `.hive/.agents/architect.md`)
**Usage:** `/plan-fe <ticket-id> [figma-url]`

---

## Process

### 1. Read context
- Enriched Jira ticket (Atlassian MCP)
- Figma design (Figma MCP if URL provided) — extract component tree, variants, tokens
- `.hive/standards/frontend.mdc`
- `.hive/standards/core.mdc`
- `.hive/specs/api-spec.yml` — for service layer methods

Verify library versions via Context7 MCP.

### 2. Figma analysis (if URL provided)
Extract from Figma:
- Component tree: atoms → molecules → organisms → page
- Variants and states (default, hover, loading, error, empty)
- Design tokens used (colors, spacing, typography)
- Responsive breakpoints
- Accessibility requirements (aria labels, keyboard nav)

### 3. Produce the plan

**Output file:** `.hive/changes/<ticket-id>_frontend.md`

---

## Plan Template

```markdown
# Frontend Implementation Plan: <TICKET-ID> <Feature Name>

## Overview
{Feature description + component-based architecture principles applied}

## Architecture Context
- Components involved: {list}
- Services to create/modify: {list in src/services/}
- Routing changes: {none | new routes}
- State management: {local useState | global store}
- Figma reference: {URL if provided}

## Implementation Steps

### Step 0: Create feature branch
- Branch: `feature/<ticket-id>-<short-description>-frontend`
- Base: latest `develop`
- Commands:
  ```bash
  git checkout develop && git pull origin develop
  git checkout -b feature/<ticket-id>-<description>-frontend
  ```
- Note: Never work on the same branch as backend (separate concerns)

### Step 1: Write failing tests (TDD — do this FIRST)
- Component tests: `src/components/<Component>.test.tsx`
- E2E tests: `cypress/e2e/<feature>.cy.ts`
- Test cases per acceptance criterion: {list}
- Run to confirm failure: `npm test`

### Step N: Update/create service layer
- **File:** `src/services/<feature>Service.ts`
- **Action:** Add API communication functions
- **Function signatures:** {list async functions}
- **Endpoints consumed:** {from api-spec.yml}

### Step N: Create component(s)
- **File:** `src/components/<ComponentName>.tsx`
- **Component signature:** `<ComponentName props: PropsType />`
- **Props interface:** {TypeScript type definition}
- **States to handle:** loading | error | empty | success
- **Bootstrap components used:** {list}
- **Accessibility:** {aria-label, keyboard nav requirements}
- **Figma variants to implement:** {list}

### Step N: Update routing (if applicable)
- **File:** `src/App.tsx` or router config
- **New routes:** {path → component mapping}

### Step N+1: Run and verify
- Unit tests: `npm test`
- E2E: `npm run cypress:run`
- Type check: `npm run typecheck`
- Lint: `npm run lint`

### Step N+2: Update documentation
- Follow `/update-docs` process
- Update: `api-spec.yml` (if new endpoints consumed), `frontend-standards.md` (if new patterns)

## Implementation Order
1. Step 0 — branch
2. Step 1 — failing tests
3. Service layer
4. Components (atoms first, then composed)
5. Routing
6. Step N+1 — verify
7. Step N+2 — docs

## Testing Checklist
- [ ] Component renders with all variants
- [ ] Loading state displayed correctly
- [ ] Error state shows user-friendly message
- [ ] E2E covers the full user flow from acceptance criteria
- [ ] Cypress tests use `findByRole`/`findByLabelText` (never `.class` selectors)

## UI/UX Considerations
- Bootstrap components to use: {list}
- Responsive breakpoints: {list}
- Accessibility: {aria requirements}
- Loading feedback: {Spinner or skeleton}

## Error Handling
- API error → display Alert component with user-friendly message
- Validation error → inline Form.Control.Feedback
- Network error → retry option where appropriate

## Dependencies
- {library@version — confirmed via Context7}

## Notes
- {Business rules, edge cases, design decisions}

## Implementation Verification
- [ ] TypeScript strict — zero errors
- [ ] Linting — zero warnings
- [ ] All test types pass
- [ ] Figma design matched (if applicable)
- [ ] English only throughout
- [ ] Documentation updated
```

## Rules
- Branch must end in `-frontend` — never work on shared ticket branch
- Tests step is always first after branch creation
- Docs step is always last
- Never introduce new dependencies without justification
- If Figma MCP is available → always extract design context before writing the plan
