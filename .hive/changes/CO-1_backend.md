# Implementation Plan — CO-1
_Project bootstrap: project structure, Prisma schema, CI_
_Generated: 2026-04-10 | Branch: feature/CO-1-project-structure_

---

## Scope

Pure infrastructure setup. No business logic. No HTTP routes.

Layers: infrastructure (Prisma, logger), config (TypeScript, ESLint, Jest, Vite), CI

---

## Execution order

### 1. Tests (Stage 3 — written first, fail until Step 2)
- `src/backend/src/infrastructure/__tests__/logger.test.ts`
- `src/backend/src/infrastructure/__tests__/prismaClient.test.ts`

### 2. Root workspace config
- `package.json` — npm workspaces (backend + frontend)
- `.env.example` — all env vars with placeholders

### 3. Backend package
- `src/backend/package.json` — runtime + dev deps
- `src/backend/tsconfig.json` — strict, path aliases
- `src/backend/jest.config.ts` — ts-jest, test pattern
- `src/backend/.eslintrc.js` — TypeScript ESLint rules

### 4. Backend infrastructure
- `src/backend/src/infrastructure/prismaClient.ts` — Prisma singleton
- `src/backend/src/infrastructure/logger.ts` — pino structured logger

### 5. Prisma schema
- `prisma/schema.prisma` — Sprint 1 models: User, Workspace, WorkspaceMember, Meeting, MeetingNote, MeetingSummary

### 6. Frontend package
- `src/frontend/package.json` — React + Vite + Vitest
- `src/frontend/tsconfig.json`
- `src/frontend/vite.config.ts` — includes Vitest config
- `src/frontend/.eslintrc.js`
- `src/frontend/index.html`
- `src/frontend/src/main.tsx` — placeholder entry point
- `src/frontend/src/App.tsx` — placeholder component

### 7. CI
- `.github/workflows/ci.yml` — install → lint → typecheck → test → build

---

## Key decisions

- **npm workspaces** at root: backend = `src/backend`, frontend = `src/frontend`
- **Root npm scripts** delegate to workspaces so `npm test / npm run lint / npm run typecheck` work from root
- **Pino** for structured logging (not Winston — lighter, faster, structured JSON by default)
- **Prisma schema** includes Sprint 1 models only — Commitment + AuditLog added in Sprint 2
- **MeetingSummary.triggeredBy** is a plain String (userId) — no FK enforced until auth exists
- **Meeting.participants + topics** stored as `String[]` (PostgreSQL array)
- **Frontend tests** use Vitest (not Jest) — separate `npm run test` in frontend workspace

---

## Verification
```
npm test           → backend Jest suite passes
npm run typecheck  → zero TS errors in both packages
npm run lint       → zero ESLint warnings in both packages
npm run build      → both packages compile to dist/
```
