# Architecture — civic-ops
_Last updated: 2026-04-10 | Stack: node-react-prisma_

---

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Runtime | Node.js + TypeScript | Strict mode enabled |
| API framework | Express | REST, JSON |
| ORM | Prisma | PostgreSQL dialect |
| Database | PostgreSQL | One DB, tenant-scoped via workspaceId |
| Frontend | React + TypeScript + Vite | SPA |
| Auth | JWT (jsonwebtoken) + bcrypt | Access + refresh token pair |
| AI provider | OpenAI (gpt-4o-mini for MVP) | Behind provider adapter — swappable |
| Package manager | npm | |
| Testing | Jest (backend) + Vitest + Testing Library (frontend) | |

---

## Bounded Contexts

| Context | Responsibility | Key entities |
|---|---|---|
| **Identity & Access** | Authentication, users, workspaces (tenants), roles, permissions | User, Workspace, WorkspaceMember, Role |
| **Meeting Intelligence** | Meeting registry, notes capture, AI summaries, commitment extraction | Meeting, MeetingNote, MeetingSummary |
| **Execution** | Commitments, task workflow, assignment, status, audit trail | Commitment, CommitmentUpdate, AuditLog |
| **Operations** | Initiatives and citizen requests (Sprint 4 — Should Have) | Initiative, CitizenRequest |
| **AI Gateway** | Provider-agnostic abstraction for all AI calls | AiGateway (interface), OpenAiProvider |
| **Reporting** | Dashboard aggregations, weekly reports, semantic search (Sprint 3-4) | ReportSnapshot, SearchIndex |

---

## Module Structure

```
civic-ops/
├── backend/
│   └── src/
│       ├── domain/                         # Pure business logic — no frameworks, no DB
│       │   ├── identity/
│       │   │   ├── User.ts                 # Entity: id, email, name, passwordHash
│       │   │   ├── Workspace.ts            # Aggregate root for tenant
│       │   │   ├── WorkspaceMember.ts      # Join: user ↔ workspace + role
│       │   │   └── Role.ts                 # Enum: ADMIN | COORDINATOR | ADVISOR | VIEWER
│       │   ├── meeting/
│       │   │   ├── Meeting.ts              # Entity: title, date, participants[], topics[]
│       │   │   ├── MeetingNote.ts          # Entity: raw text (typed or pasted transcript)
│       │   │   └── MeetingSummary.ts       # Entity: AI-generated summary, stored after user trigger
│       │   ├── commitment/
│       │   │   ├── Commitment.ts           # Entity: title, owner, dueDate, status, blockerFlag
│       │   │   ├── CommitmentStatus.ts     # Enum: PENDING | IN_PROGRESS | OVERDUE | AT_RISK | BLOCKED | DONE
│       │   │   └── CommitmentUpdate.ts     # Audit entry for commitment state changes
│       │   └── shared/
│       │       ├── AuditLog.ts             # Append-only audit entry
│       │       └── TenantContext.ts        # Value object: workspaceId injected per request
│       │
│       ├── application/                    # Use cases — orchestrates domain + infra
│       │   ├── identity/
│       │   │   ├── AuthService.ts          # signup, login, refreshToken
│       │   │   └── WorkspaceService.ts     # create workspace, invite member, update role
│       │   ├── meeting/
│       │   │   ├── MeetingService.ts       # createMeeting, listMeetings, getMeeting
│       │   │   ├── NoteService.ts          # addNote, listNotes
│       │   │   ├── SummaryService.ts       # triggerSummary → AiGateway → store result
│       │   │   └── ExtractionService.ts    # triggerExtraction → AiGateway → return candidates
│       │   └── commitment/
│       │       └── CommitmentService.ts    # create, assign, updateStatus, list, dashboard query
│       │
│       ├── infrastructure/                 # Adapters — DB, AI, auth, HTTP
│       │   ├── ai/
│       │   │   ├── AiGateway.ts            # Interface: summarize(text), extractCommitments(text)
│       │   │   └── OpenAiProvider.ts       # OpenAI implementation of AiGateway
│       │   ├── db/
│       │   │   ├── prisma.ts               # Prisma client singleton
│       │   │   └── repositories/
│       │   │       ├── UserRepository.ts
│       │   │       ├── WorkspaceRepository.ts
│       │   │       ├── MeetingRepository.ts
│       │   │       └── CommitmentRepository.ts
│       │   └── auth/
│       │       ├── JwtService.ts           # sign, verify, refresh
│       │       └── PasswordService.ts      # hash, compare (bcrypt)
│       │
│       └── presentation/                   # HTTP layer — routes, controllers, DTOs
│           ├── middleware/
│           │   ├── auth.middleware.ts       # Verifies JWT, attaches user to req
│           │   ├── tenant.middleware.ts     # Extracts workspaceId from JWT, attaches TenantContext
│           │   └── rbac.middleware.ts       # Role guard factory: requireRole(Role.ADMIN)
│           ├── controllers/
│           │   ├── auth.controller.ts
│           │   ├── workspace.controller.ts
│           │   ├── meeting.controller.ts
│           │   └── commitment.controller.ts
│           ├── routes/
│           │   ├── auth.routes.ts
│           │   ├── workspace.routes.ts
│           │   ├── meeting.routes.ts
│           │   └── commitment.routes.ts
│           └── dto/                        # Input validation schemas (Zod)
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── auth/                       # Login, Register
│       │   ├── meetings/                   # List, Create, Detail
│       │   ├── commitments/                # List, Detail, Dashboard
│       │   └── dashboard/                  # Execution visibility
│       ├── components/                     # Shared UI components
│       ├── services/                       # API client functions (fetch wrappers)
│       ├── hooks/                          # React Query hooks per domain
│       ├── store/                          # Auth state (zustand or context)
│       └── i18n/
│           └── es.json                     # Spanish locale (only locale in v0.1)
│
├── prisma/
│   ├── schema.prisma                       # Single source of truth for DB schema
│   └── migrations/
│
└── .hive/                                  # HIVE agent config (not shipped to production)
```

---

## Prisma Schema — Core Models

```prisma
model User {
  id            String            @id @default(cuid())
  email         String            @unique
  name          String
  passwordHash  String
  createdAt     DateTime          @default(now())
  memberships   WorkspaceMember[]
  auditLogs     AuditLog[]
}

model Workspace {
  id          String            @id @default(cuid())
  name        String
  slug        String            @unique
  createdAt   DateTime          @default(now())
  members     WorkspaceMember[]
  meetings    Meeting[]
  commitments Commitment[]
}

model WorkspaceMember {
  id          String    @id @default(cuid())
  workspaceId String
  userId      String
  role        Role      @default(VIEWER)
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  user        User      @relation(fields: [userId], references: [id])
  @@unique([workspaceId, userId])
}

enum Role {
  ADMIN
  COORDINATOR
  ADVISOR
  VIEWER
}

model Meeting {
  id           String        @id @default(cuid())
  workspaceId  String
  title        String
  date         DateTime
  participants String[]      // Names or user IDs
  topics       String[]
  createdAt    DateTime      @default(now())
  workspace    Workspace     @relation(fields: [workspaceId], references: [id])
  notes        MeetingNote[]
  summaries    MeetingSummary[]
  commitments  Commitment[]
}

model MeetingNote {
  id        String   @id @default(cuid())
  meetingId String
  content   String   // Raw text — typed notes or pasted transcript
  createdAt DateTime @default(now())
  meeting   Meeting  @relation(fields: [meetingId], references: [id])
}

model MeetingSummary {
  id          String   @id @default(cuid())
  meetingId   String
  content     String   // AI-generated structured summary
  triggeredBy String   // userId who triggered the summary
  createdAt   DateTime @default(now())
  meeting     Meeting  @relation(fields: [meetingId], references: [id])
}

model Commitment {
  id          String           @id @default(cuid())
  workspaceId String
  meetingId   String?          // null if created standalone
  title       String
  description String?
  ownerId     String?          // userId — nullable (pending assignment)
  dueDate     DateTime?
  status      CommitmentStatus @default(PENDING)
  blockerFlag Boolean          @default(false)
  blockerNote String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  workspace   Workspace        @relation(fields: [workspaceId], references: [id])
  meeting     Meeting?         @relation(fields: [meetingId], references: [id])
  updates     CommitmentUpdate[]
}

enum CommitmentStatus {
  PENDING
  IN_PROGRESS
  AT_RISK       // Due within 7 days or manually flagged
  BLOCKED       // Explicit blocker flag set
  OVERDUE       // Due date passed, not completed
  DONE
}

model CommitmentUpdate {
  id           String     @id @default(cuid())
  commitmentId String
  changedById  String
  field        String     // Which field changed
  oldValue     String?
  newValue     String?
  createdAt    DateTime   @default(now())
  commitment   Commitment @relation(fields: [commitmentId], references: [id])
}

model AuditLog {
  id          String   @id @default(cuid())
  workspaceId String
  userId      String
  action      String   // CREATE | UPDATE | DELETE | ASSIGN | COMPLETE
  entity      String   // Meeting | Commitment | etc.
  entityId    String
  detail      Json?
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}
```

---

## Key Architectural Decisions

### ADR-1: Provider adapter for AI
**Decision:** All AI calls go through an `AiGateway` interface. `OpenAiProvider` is the only implementation in v0.1.
**Reason:** Strategy decision — start with OpenAI (gpt-4o-mini) for low cost, but swap must be possible without touching application layer.
**Consequence:** Application services depend on `AiGateway`, never on `OpenAiProvider` directly.

### ADR-2: Tenant isolation via middleware, not row-level security
**Decision:** A `tenant.middleware.ts` extracts `workspaceId` from the JWT and injects it as `TenantContext` on every request. All repository methods receive `workspaceId` as a mandatory parameter.
**Reason:** Simpler than Postgres RLS for the MVP; enforceable at the application layer via TypeScript.
**Consequence:** Every repository method signature includes `workspaceId`. Missing it is a compile error.

### ADR-3: Manual AI trigger — never automatic
**Decision:** AI summarization and commitment extraction are only invoked when the user explicitly clicks "Generate Summary" or "Extract Commitments." No background processing.
**Reason:** Strategy decision — political clients need to feel in control. Trust over magic in v0.1.
**Consequence:** No job queues or background workers needed in Sprint 1-2. Simplifies infrastructure significantly.

### ADR-4: i18n layer from day 1, Spanish locale only
**Decision:** All user-facing strings in the frontend go through a translation key. Only `es.json` is shipped in v0.1.
**Reason:** Strategy decision — Spanish-first market, but architecture must support Portuguese or English later without a rewrite.
**Consequence:** No hardcoded strings in React components. Small overhead in Sprint 1, high payoff later.

### ADR-5: Audit trail via CommitmentUpdate + AuditLog — not Prisma middleware
**Decision:** Explicit audit writes in application service methods, not a transparent Prisma middleware.
**Reason:** Prisma middleware intercepts all writes including seeding and migrations, creating noise. Explicit writes make the audit intent visible in code and testable.
**Consequence:** Every mutation in `CommitmentService` and `MeetingService` must include an audit write. Enforced via code review.

### ADR-6: Overdue/At Risk computed — not stored
**Decision:** `OVERDUE` and `AT_RISK` statuses are computed at query time (dueDate vs. now()), not stored as persisted status values.
**Reason:** Stored computed status gets stale — a commitment becomes overdue at midnight with no trigger to update it.
**Consequence:** Dashboard query computes these at read time. `CommitmentStatus` enum still includes them for API response typing.

---

## Data Flow

```
User
 │
 ▼
[auth.middleware] ──validates JWT──► TenantContext (workspaceId injected)
 │
 ▼
[rbac.middleware] ──checks role──► 403 if unauthorized
 │
 ▼
[Controller] ──parses DTO (Zod)──► 400 if invalid
 │
 ▼
[Application Service]
 │
 ├── reads/writes via Repository ──► Prisma ──► PostgreSQL
 │
 └── (AI path, manual trigger only):
      └── AiGateway.summarize(text) ──► OpenAiProvider ──► OpenAI API
                                         └──► stored as MeetingSummary
```

---

## API Conventions

| Convention | Rule |
|---|---|
| Base path | `/api/v1` |
| Auth header | `Authorization: Bearer <token>` |
| Tenant scoping | `workspaceId` from JWT, not from URL |
| Error shape | `{ error: string, code: string, details?: any }` |
| Success shape | `{ data: T }` or `{ data: T[], meta: { total, page, limit } }` |
| Date format | ISO 8601 UTC strings |
| Locale | All response strings in Spanish (labels from i18n, not hardcoded) |

---

## External Dependencies

| Dependency | Purpose | Integration |
|---|---|---|
| PostgreSQL | Primary data store | Prisma ORM |
| OpenAI API | Meeting summarization + commitment extraction | HTTP via openai SDK, behind AiGateway adapter |
| jsonwebtoken | JWT sign/verify | Direct use in JwtService |
| bcrypt | Password hashing | Direct use in PasswordService |
| Zod | Request validation (DTOs) | Used in controllers before service calls |
| React Query | Frontend server state, caching, loading states | Wraps all API service calls |

---

## Constraints

- **All database queries MUST include `workspaceId`** — no cross-tenant data leakage is acceptable
- **No AI call without explicit user action** — no background jobs, no automatic triggers in v0.1
- **Audit log is append-only** — no updates or deletes on `AuditLog` or `CommitmentUpdate` rows
- **Spanish locale only in v0.1** — all strings go through i18n but only `es.json` ships
- **No file uploads in Sprint 1-2** — notes are text-only; audio transcription is post-MVP
- **CSV import scope** — limited to commitments, initiatives, and citizen requests; not meetings
