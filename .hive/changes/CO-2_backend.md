# Implementation Plan — CO-2
_Tenant-aware auth: sign-up, login, refresh, JWT middleware_
_Generated: 2026-04-13 | Branch: feature/CO-2-auth-jwt_

---

## Scope

Backend only. No frontend. 19 new files.

Layers: domain → application → infrastructure → presentation → entry point

---

## Execution order (DDD: outer → inner → outer)

### 1. Domain
- `domain/identity/Role.ts` — enum (ADMIN | COORDINATOR | ADVISOR | VIEWER)
- `domain/identity/errors.ts` — EmailAlreadyExistsError, InvalidCredentialsError, InvalidTokenError
- `domain/identity/User.ts` — entity
- `domain/identity/Workspace.ts` — entity + static generateSlug()
- `domain/identity/repositories/IUserRepository.ts` — interface
- `domain/identity/repositories/IWorkspaceRepository.ts` — interface + WorkspaceMembership type

### 2. Application
- `application/identity/dto.ts` — SignupInput, LoginInput, AuthResult, MeResult
- `application/identity/AuthService.ts` — signup, login, refresh, getMe

### 3. Infrastructure
- `infrastructure/auth/JwtService.ts` — signPair, signAccess, verifyAccess, verifyRefresh
- `infrastructure/auth/PasswordService.ts` — hash, compare
- `infrastructure/db/repositories/PrismaUserRepository.ts`
- `infrastructure/db/repositories/PrismaWorkspaceRepository.ts`

### 4. Presentation
- `presentation/dto/auth.dto.ts` — Zod schemas: signupSchema, loginSchema, refreshSchema
- `presentation/middleware/validateBody.ts` — Zod validation middleware factory
- `presentation/middleware/errorHandler.ts` — global Express error handler
- `presentation/middleware/auth.middleware.ts` — JWT bearer guard
- `presentation/controllers/auth.controller.ts`
- `presentation/routes/auth.routes.ts`

### 5. Entry point
- `index.ts` — Express app + DI composition + conditional server start

---

## Key decisions

- **Stateless refresh tokens** — signed and verified by signature only, not stored in DB
- **JWT payload**: `{ sub: userId, workspaceId, role, type: 'access'|'refresh' }`
- **Slug uniqueness**: try base slug, append 6-char random suffix on collision (no retry loop — sufficient for MVP)
- **Primary workspace for login**: first WorkspaceMember record by createdAt (user's own workspace on signup)
- **Role in domain layer**: define Role enum in domain to avoid app layer importing from @prisma/client
- **Zod in presentation layer only**: domain and application layers use plain TypeScript types
- **`req.user` extension**: declared via module augmentation in `auth.middleware.ts`

---

## Tests to write (Stage 3 — written first, all fail until Stage 4)

1. `domain/identity/__tests__/User.test.ts` — entity getters
2. `domain/identity/__tests__/Workspace.test.ts` — entity + generateSlug
3. `application/identity/__tests__/AuthService.test.ts` — signup, login, refresh, getMe (mocked deps)
4. `infrastructure/auth/__tests__/JwtService.test.ts` — sign/verify + type guards
5. `infrastructure/auth/__tests__/PasswordService.test.ts` — hash/compare
6. `presentation/middleware/__tests__/auth.middleware.test.ts` — bearer guard
7. `presentation/controllers/__tests__/auth.controller.test.ts` — HTTP 201/200/401

---

## Verification
```
npm test           → all tests pass (target: ~30 tests)
npm run typecheck  → zero TS errors
npm run lint       → zero warnings
```
