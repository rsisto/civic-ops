# Tickets to Create — civic-ops
_Generated: 2026-04-10 | Board: CO | Tool: Jira_
_Create via Atlassian MCP once authenticated, or paste directly into the board._

> Sprint 1 tickets include full acceptance criteria.
> Sprint 2-4 tickets are summary-level — run `/enrich CO-{id}` when the sprint starts.

---

## Epics

| Epic | Title | Sprint |
|---|---|---|
| CO-EPIC-1 | Identity & Access | 1 |
| CO-EPIC-2 | Meeting Intelligence | 1-2 |
| CO-EPIC-3 | Execution Engine | 2 |
| CO-EPIC-4 | Visibility & Reporting | 3 |
| CO-EPIC-5 | Operations | 4 |
| CO-EPIC-6 | Search & Memory | 4 |

---

## Sprint 1 — Foundation

### CO-1 · Initialize project structure, Prisma schema, and CI baseline
**Epic:** CO-EPIC-1 | **Size:** S | **Type:** Task

**Description:**
Bootstrap the full monorepo with backend (Express + TypeScript + Prisma) and frontend (React + Vite + TypeScript). Define the complete Sprint 1 Prisma schema and set up a basic CI pipeline.

**Acceptance Criteria:**

```
Given the repo is cloned and dependencies are installed,
When `npm run build` is run from the root,
Then both backend and frontend compile with zero TypeScript errors.

Given the Prisma schema is defined with User, Workspace, WorkspaceMember,
Meeting, MeetingNote, and MeetingSummary models,
When `npx prisma migrate dev` is run against a local PostgreSQL instance,
Then all tables are created with correct columns, types, and foreign keys.

Given code is pushed to any branch,
When the GitHub Actions CI pipeline runs,
Then lint, typecheck, and tests all pass before the build step.
```

**Technical Scope:**
- Folder structure: `backend/src/{domain,application,infrastructure,presentation}/`, `frontend/src/`, `prisma/`
- Schema models: User, Workspace, WorkspaceMember (Role enum), Meeting, MeetingNote, MeetingSummary
- CI: `.github/workflows/ci.yml` — steps: lint → typecheck → test → build
- Config: ESLint + Prettier + `tsconfig.json` strict mode for both packages
- Out of scope: business logic, auth, any API endpoint

---

### CO-2 · Implement user sign-up and login with JWT
**Epic:** CO-EPIC-1 | **Size:** L | **Type:** Story

**Description:**
Implement the authentication layer: sign-up (creates user + first workspace), login (returns access + refresh tokens), token refresh, and the JWT middleware used by all subsequent routes.

**Acceptance Criteria:**

```
Given a valid email and password,
When POST /api/v1/auth/signup is called,
Then a User and Workspace are created, and access token (15min TTL)
and refresh token (7d TTL) are returned with 201.

Given an email that already exists,
When POST /api/v1/auth/signup is called,
Then 409 Conflict is returned with { error: "Email already registered", code: "EMAIL_EXISTS" }.

Given valid credentials,
When POST /api/v1/auth/login is called,
Then access and refresh tokens are returned with 200.

Given invalid credentials,
When POST /api/v1/auth/login is called,
Then 401 is returned with no user information leaked.

Given a valid refresh token,
When POST /api/v1/auth/refresh is called,
Then a new access token is returned with 200.

Given an expired or invalid refresh token,
When POST /api/v1/auth/refresh is called,
Then 401 is returned.

Given a request with a valid JWT in the Authorization header,
When auth.middleware processes it,
Then req.user is populated with { userId, workspaceId, role }.

Given a request with no or invalid JWT,
When auth.middleware processes it,
Then 401 is returned before the controller is reached.
```

**Technical Scope:**
- `domain/identity/User.ts`, `Workspace.ts`
- `application/identity/AuthService.ts` — signup, login, refresh
- `infrastructure/auth/JwtService.ts` — sign, verify (access + refresh)
- `infrastructure/auth/PasswordService.ts` — bcrypt hash + compare
- `infrastructure/db/repositories/UserRepository.ts`, `WorkspaceRepository.ts`
- `presentation/middleware/auth.middleware.ts`
- `presentation/controllers/auth.controller.ts`
- `presentation/routes/auth.routes.ts`
- `presentation/dto/auth.dto.ts` — Zod schemas for signup and login bodies
- Out of scope: workspace switching, invite flow, RBAC

---

### CO-3 · Implement multi-tenant workspace isolation
**Epic:** CO-EPIC-1 | **Size:** M | **Type:** Story

**Description:**
Implement tenant context middleware that scopes every request to the user's workspace. Add workspace member management endpoints (invite, list, update role).

**Acceptance Criteria:**

```
Given an authenticated request with a valid JWT,
When tenant.middleware runs,
Then req.tenantContext = { workspaceId } is attached before any controller runs.

Given workspace A and workspace B each have meetings,
When a user of workspace A calls GET /api/v1/meetings,
Then only workspace A meetings are returned — workspace B data is not visible.

Given an ADMIN user,
When POST /api/v1/workspaces/members is called with { email },
Then a WorkspaceMember is created (VIEWER role by default) and 201 is returned.

Given the invited email does not exist as a User,
When POST /api/v1/workspaces/members is called,
Then 404 is returned with { error: "User not found", code: "USER_NOT_FOUND" }.

Given a non-ADMIN user,
When POST /api/v1/workspaces/members is called,
Then 403 is returned.

Given an ADMIN user,
When PATCH /api/v1/workspaces/members/:userId is called with { role: "COORDINATOR" },
Then the WorkspaceMember role is updated and 200 is returned.
```

**Technical Scope:**
- `domain/identity/WorkspaceMember.ts`, `TenantContext.ts`
- `application/identity/WorkspaceService.ts` — invite, listMembers, updateRole
- `infrastructure/db/repositories/WorkspaceRepository.ts`
- `presentation/middleware/tenant.middleware.ts` — extracts workspaceId from JWT
- `presentation/controllers/workspace.controller.ts`
- `presentation/routes/workspace.routes.ts`
- Out of scope: workspace creation (done at signup), workspace switching UI

---

### CO-4 · Implement RBAC — role model and authorization middleware
**Epic:** CO-EPIC-1 | **Size:** M | **Type:** Story

**Description:**
Implement role-based access control with a reusable `requireRole()` middleware factory. Apply role guards to all existing routes. Roles: ADMIN > COORDINATOR > ADVISOR > VIEWER.

**Permissions matrix:**
| Action | ADMIN | COORDINATOR | ADVISOR | VIEWER |
|---|---|---|---|---|
| Invite members | ✓ | | | |
| Create/edit meetings | ✓ | ✓ | ✓ | |
| Add notes | ✓ | ✓ | ✓ | |
| Trigger AI summary/extraction | ✓ | ✓ | | |
| Create/assign commitments | ✓ | ✓ | | |
| View all resources | ✓ | ✓ | ✓ | ✓ |

**Acceptance Criteria:**

```
Given requireRole(Role.COORDINATOR) is applied to POST /meetings,
When a VIEWER calls POST /meetings,
Then 403 is returned with { error: "Insufficient permissions", code: "FORBIDDEN" }.

Given requireRole(Role.ADVISOR) is applied to POST /meetings,
When an ADVISOR calls POST /meetings,
Then the request proceeds to the controller.

Given requireRole(Role.ADMIN) is applied to POST /workspaces/members,
When a COORDINATOR calls that endpoint,
Then 403 is returned.

Given an ADMIN calls any endpoint,
When rbac.middleware evaluates the role,
Then no rejection occurs.
```

**Technical Scope:**
- `domain/identity/Role.ts` — enum + permission map constant
- `presentation/middleware/rbac.middleware.ts` — `requireRole(...Role[])` factory
- Apply guards to: all auth.routes, workspace.routes, meeting.routes (when created)
- Out of scope: dynamic permissions, custom role creation

---

### CO-5 · Implement Meeting Registry API — create, list, view
**Epic:** CO-EPIC-2 | **Size:** M | **Type:** Story

**Description:**
Implement the three core Meeting endpoints. All queries are tenant-scoped via `TenantContext`.

**Acceptance Criteria:**

```
Given an authenticated ADVISOR or above,
When POST /api/v1/meetings is called with { title, date, participants[], topics[] },
Then a Meeting is created scoped to the current workspace and returned with 201.

Given title or date is missing,
When POST /api/v1/meetings is called,
Then 400 is returned with field-level validation errors (Zod).

Given meetings exist in the current workspace,
When GET /api/v1/meetings is called,
Then only the current workspace's meetings are returned, sorted by date desc,
with pagination meta: { total, page, limit }.

Given ?page=2&limit=10 query params,
When GET /api/v1/meetings is called,
Then the correct page slice is returned.

Given a valid meetingId in the current workspace,
When GET /api/v1/meetings/:id is called,
Then the meeting is returned with its notes and summaries arrays.

Given a meetingId from another workspace,
When GET /api/v1/meetings/:id is called,
Then 404 is returned (no cross-tenant existence leakage).
```

**Technical Scope:**
- `domain/meeting/Meeting.ts`
- `application/meeting/MeetingService.ts` — create, list (paginated), getById
- `infrastructure/db/repositories/MeetingRepository.ts`
- `presentation/controllers/meeting.controller.ts`
- `presentation/routes/meeting.routes.ts`
- `presentation/dto/meeting.dto.ts`
- Out of scope: notes, summaries, extraction (separate tickets)

---

### CO-6 · Implement Meeting Notes Capture API
**Epic:** CO-EPIC-2 | **Size:** M | **Type:** Story

**Description:**
Add note creation and listing endpoints to meetings. Notes accept unstructured text (typed notes or pasted transcript — no distinction at storage level).

**Acceptance Criteria:**

```
Given an authenticated ADVISOR or above,
When POST /api/v1/meetings/:id/notes is called with { content: string },
Then a MeetingNote is created and returned with 201.

Given content is empty or missing,
When POST /api/v1/meetings/:id/notes is called,
Then 400 is returned.

Given a meetingId from another workspace,
When POST /api/v1/meetings/:id/notes is called,
Then 404 is returned (tenant isolation — do not reveal that the meeting exists).

Given notes exist for a meeting,
When GET /api/v1/meetings/:id/notes is called,
Then all notes for that meeting are returned, sorted by createdAt desc.

Given a VIEWER,
When GET /api/v1/meetings/:id/notes is called,
Then 200 is returned — VIEWERs can read notes.

Given a VIEWER,
When POST /api/v1/meetings/:id/notes is called,
Then 403 is returned — VIEWERs cannot add notes.
```

**Technical Scope:**
- `domain/meeting/MeetingNote.ts`
- `application/meeting/NoteService.ts` — addNote, listNotes
- `infrastructure/db/repositories/MeetingRepository.ts` (extend with note methods)
- `presentation/controllers/meeting.controller.ts` (extend)
- `presentation/dto/note.dto.ts`
- Out of scope: AI processing of notes (separate ticket)

---

### CO-7 · Build React app shell — routing, layout, and auth pages
**Epic:** CO-EPIC-1 | **Size:** M | **Type:** Story

**Description:**
Bootstrap the React frontend: app layout, routing, protected routes, login/register pages, auth state, API client, and i18n layer.

**Acceptance Criteria:**

```
Given an unauthenticated user,
When they navigate to any protected route (e.g. /meetings),
Then they are redirected to /login.

Given valid credentials are submitted on the login form,
When the API responds with 200,
Then tokens are stored securely and the user is redirected to /dashboard.

Given the user is authenticated,
When they navigate to /login,
Then they are redirected to /dashboard.

Given a network error occurs during login,
When the form is submitted,
Then an error message is shown in Spanish ("Error al iniciar sesión. Intente nuevamente.").

Given the app layout renders,
When the sidebar is visible,
Then it shows navigation links: Reuniones, Compromisos, Dashboard.

Given the i18n layer is active,
When any UI string is rendered,
Then it comes from es.json — no hardcoded strings in JSX.
```

**Technical Scope:**
- `frontend/src/main.tsx`, `App.tsx`
- `frontend/src/routes/index.tsx` — React Router v6, `<ProtectedRoute />`
- `frontend/src/pages/auth/Login.tsx`, `Register.tsx`
- `frontend/src/components/Layout.tsx`, `Sidebar.tsx`, `ProtectedRoute.tsx`
- `frontend/src/store/auth.ts` — zustand store: accessToken, user, workspaceId
- `frontend/src/services/api.ts` — fetch wrapper with Authorization header injection + token refresh
- `frontend/src/i18n/es.json` — all UI strings
- Out of scope: workspace switching UI, user settings pages

---

### CO-8 · Build Meeting list and creation UI
**Epic:** CO-EPIC-2 | **Size:** M | **Type:** Story

**Description:**
Meeting list page with pagination and an empty state, plus a create meeting form with client-side validation.

**Acceptance Criteria:**

```
Given the user is on /meetings,
When the page loads,
Then meetings are listed sorted by date desc, showing title, date, and participant count.

Given no meetings exist,
When /meetings loads,
Then an empty state is shown with a "Nueva reunión" call-to-action button.

Given the create form is submitted with title and date,
When the API call succeeds,
Then the user is navigated to the new meeting's detail page.

Given the create form is submitted with missing required fields,
When validation runs client-side,
Then field-level error messages appear in Spanish without calling the API.

Given more than 20 meetings exist,
When the user reaches the bottom of the list or clicks "siguiente",
Then the next page is loaded.
```

**Technical Scope:**
- `frontend/src/pages/meetings/MeetingList.tsx`
- `frontend/src/pages/meetings/CreateMeeting.tsx`
- `frontend/src/hooks/useMeetings.ts` — React Query with pagination
- `frontend/src/services/meetings.service.ts`
- Out of scope: meeting detail (CO-9)

---

### CO-9 · Build Meeting detail page and notes capture UI
**Epic:** CO-EPIC-2 | **Size:** M | **Type:** Story

**Description:**
Meeting detail page showing meeting metadata, notes capture textarea, and saved notes history. Placeholder sections for AI Summary and Commitments (implemented in Sprint 2).

**Acceptance Criteria:**

```
Given a valid meeting ID,
When the user navigates to /meetings/:id,
Then meeting title, date, participants, topics, and existing notes are displayed.

Given the notes textarea has content and the user clicks "Guardar notas",
When the API call succeeds,
Then the new note appears at the top of the notes history and the textarea is cleared.

Given the textarea is empty,
When "Guardar notas" is clicked,
Then the button is disabled and no API call is made.

Given the API call fails,
When the user submits notes,
Then a Spanish error toast is shown and the textarea content is preserved.

Given the user has VIEWER role,
When they visit /meetings/:id,
Then the notes textarea and save button are hidden, but existing notes are visible.
```

**Technical Scope:**
- `frontend/src/pages/meetings/MeetingDetail.tsx`
- `frontend/src/hooks/useMeeting.ts`, `useNotes.ts` — React Query
- `frontend/src/services/meetings.service.ts` (extend)
- Placeholder `<AiSummaryPanel />` and `<CommitmentsPanel />` components (empty, Sprint 2)
- Out of scope: AI summary trigger, commitment extraction (Sprint 2)

---

## Sprint 2 — Core Value Loop
_Run `/enrich CO-{id}` on each ticket when Sprint 2 starts._

| ID | Title | Epic | Size |
|---|---|---|---|
| CO-10 | Implement AI Meeting Summary — manual trigger | CO-EPIC-2 | M |
| CO-11 | Implement AI Commitment Extraction — returns candidates, not persisted | CO-EPIC-2 | M |
| CO-12 | Implement Commitment creation and confirmation flow | CO-EPIC-3 | M |
| CO-13 | Implement Task workflow — status management, assignment, blocker flag | CO-EPIC-3 | M |
| CO-14 | Implement Audit Trail for commitment changes | CO-EPIC-3 | S |
| CO-15 | Build AI Summary UI — trigger button and summary display | CO-EPIC-2 | M |
| CO-16 | Build Commitment extraction review and confirmation UI | CO-EPIC-2 | M |
| CO-17 | Build Commitment list and detail UI with status management | CO-EPIC-3 | M |

**CO-10 summary:** `POST /meetings/:id/summaries` triggers `AiGateway.summarize()` with concatenated note content. Stores `MeetingSummary` with `triggeredBy`. COORDINATOR+ only. Returns 400 if no notes exist. Returns 503 (with no partial save) if AI provider fails.

**CO-11 summary:** `POST /meetings/:id/extract-commitments` triggers `AiGateway.extractCommitments()`. Returns array of `{ title, owner?, dueDate?, description? }` candidates — NOT persisted. User must confirm each candidate separately via CO-12. COORDINATOR+ only.

**CO-12 summary:** `POST /api/v1/commitments` — create a commitment from a confirmed extraction candidate or standalone. Fields: title, meetingId (optional), ownerId (optional — null = unassigned), dueDate (optional). Status defaults to PENDING. `GET /commitments` — list with filters: status, ownerId, meetingId. `GET /commitments/:id` — detail.

**CO-13 summary:** `PATCH /api/v1/commitments/:id` — update status, owner, dueDate, blockerFlag, blockerNote. OVERDUE and AT_RISK are computed at query time (dueDate < now = OVERDUE; dueDate within 7 days or isAtRisk flag = AT_RISK). blockerFlag = true overrides other computed statuses → BLOCKED. Every PATCH triggers a `CommitmentUpdate` audit record.

**CO-14 summary:** Every mutation in CommitmentService writes a `CommitmentUpdate` row (field, oldValue, newValue, changedById). Significant actions write an `AuditLog` entry. `GET /commitments/:id/history` returns CommitmentUpdate list sorted by createdAt desc. AuditLog table is append-only (no DELETE permission for app DB role).

**CO-15 summary:** "Generar resumen" button on MeetingDetail page. Loading state while AI processes. Renders structured summary (topics, decisions, next steps) once complete. Error toast if AI call fails. Only visible to COORDINATOR+.

**CO-16 summary:** "Extraer compromisos" button triggers extraction. Shows a review panel with extracted candidates as cards. Each card: title, suggested owner, suggested due date — all editable. "Confirmar" saves each individually via CO-12. "Descartar" removes the candidate from the UI without saving.

**CO-17 summary:** `/commitments` list page with status filter chips (Todos, En progreso, Vencidos, Bloqueados, Completados). Commitment detail page with status badge, owner, due date, blocker note, and update history. Inline status update for COORDINATOR+.

---

## Sprint 3 — Visibility & Reporting
_Run `/enrich CO-{id}` on each ticket when Sprint 3 starts._

| ID | Title | Epic | Size |
|---|---|---|---|
| CO-18 | Implement Dashboard aggregation query — overdue, at-risk, blocked, by owner | CO-EPIC-4 | M |
| CO-19 | Implement Weekly Executive Report generation | CO-EPIC-4 | M |
| CO-20 | Build Dashboard UI | CO-EPIC-4 | L |
| CO-21 | Build Weekly Report generation and view UI | CO-EPIC-4 | M |

**CO-18 summary:** `GET /api/v1/dashboard` — returns aggregate counts: overdue, at-risk, blocked, pending-unassigned. Also returns top 10 commitments by urgency (sorted: blocked > overdue > at-risk > due-soonest). Filtered by workspaceId. Computes OVERDUE/AT_RISK at query time.

**CO-19 summary:** `POST /api/v1/reports/weekly` — calls `AiGateway.generateWeeklyReport(data)` with completed, pending, blocked, and overdue commitment snapshots for the last 7 days. Returns a leadership-ready Markdown summary. Stored as `WeeklyReport` record. `GET /api/v1/reports/weekly` — list past reports.

**CO-20 summary:** `/dashboard` page. Summary cards: overdue (red), blocked (orange), at-risk (yellow), completed this week (green). Table of urgent commitments: title, owner, due date, status badge. Filter by owner. Refreshes every 5 minutes via React Query.

**CO-21 summary:** "Generar informe semanal" button. Loading state. Renders the AI-generated report in Markdown. Print/export to PDF button. Past reports list with date.

---

## Sprint 4 — Full Operational Picture
_Run `/enrich CO-{id}` on each ticket when Sprint 4 starts._

| ID | Title | Epic | Size |
|---|---|---|---|
| CO-22 | Implement Citizen Requests — CRUD, classification, assignment, workflow | CO-EPIC-5 | M |
| CO-23 | Implement Initiatives Tracking — CRUD, status, linked commitments | CO-EPIC-5 | M |
| CO-24 | Implement Semantic Search — full-text search across all entities | CO-EPIC-6 | L |
| CO-25 | Build Citizen Requests UI | CO-EPIC-5 | M |
| CO-26 | Build Initiatives UI | CO-EPIC-5 | M |
| CO-27 | Build Semantic Search UI | CO-EPIC-6 | M |
| CO-28 | Implement CSV import — commitments, initiatives, citizen requests | CO-EPIC-5 | M |

**CO-22 summary:** CitizenRequest entity: title, description, requester name, channel (walk-in/phone/email/WhatsApp), status (OPEN/IN_PROGRESS/RESOLVED/CLOSED), priority (LOW/MEDIUM/HIGH/URGENT), assigneeId, territory tag. Full CRUD. List with filters: status, priority, assignee.

**CO-23 summary:** Initiative entity: title, description, status (PLANNING/ACTIVE/ON_HOLD/COMPLETED), priority, ownerId, dueDate, relatedCommitments[]. Full CRUD. List with status filter. Detail shows linked commitments.

**CO-24 summary:** `GET /api/v1/search?q=&types[]=` — searches across meetings (title, notes content), commitments (title, description), citizen requests (title, description), initiatives (title). PostgreSQL full-text search with `tsvector` in v0.1 (vector embeddings post-MVP). Returns top 20 results with entity type and excerpt.

**CO-25 summary:** `/requests` list with status/priority filter chips. Create request form. Detail page with status management and assignment.

**CO-26 summary:** `/initiatives` list with status filter. Create initiative form with linked commitments selector. Detail page.

**CO-27 summary:** Global search bar in the sidebar header. Results panel grouped by entity type (Reuniones, Compromisos, Solicitudes, Iniciativas). Clicking a result navigates to the detail page.

**CO-28 summary:** `POST /api/v1/import/csv` with `type` (commitments|initiatives|citizen-requests) and CSV file upload. Server-side parsing, validation, dry-run mode that returns validation errors without saving, and confirmed import. Max 500 rows per import.
