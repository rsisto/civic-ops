# AGENTS.md — HIVE

> **Universal entry point for all AI agents.**
> Part of HIVE (Harkos Intelligent Virtual Engine) — AI-Native Software Factory framework.
> Read by Claude, Cursor, Codex, Gemini, Copilot — any AI that reads project context.
> Tool-agnostic. Stack-agnostic. Language-agnostic.

---

## 0. Mandatory Reading Order

Before any action, read these files in order:

1. **This file** — universal rules and command map
2. **`.hive/AGENTS.local.md`** — project configuration (ticket tool, stack, commands, statuses)
3. **Your role file** — `.hive/.agents/<role>.md` ← extends this file; does NOT redefine its rules
4. **Core standards** — `.hive/standards/core.mdc`
5. **Area standards** — `.hive/standards/<area>.mdc` (only for the area you're working in)
6. **Sprint context** — `.hive/specs/SPEC.md`

**Authority hierarchy — when the same rule appears in multiple files, the higher file wins:**
```
AGENTS.md  >  core.mdc  >  <area>.mdc  >  <role>.md
```
`AGENTS.local.md` is **configuration**, not rules — it is always authoritative for what it configures
(ticket tool, status names, verify_commands, VCS, autonomy level). It never overrides behavioral rules.

If a rule in a role file or command file contradicts this file or `core.mdc`, this file wins.

**`AGENTS.local.md` is the source of truth for:**
- Which ticket tool to use (Jira, Linear, GitHub Issues, etc.)
- Which MCP name to call
- Which status names exist on the board
- Which commands to run for tests, lint, typecheck
- Which package manager and VCS platform
- Autonomy level and circuit breaker thresholds

Never assume a tool, command, or status name. Always read it from `AGENTS.local.md`.

---

## 1. Non-Negotiable Rules

| Rule | Detail |
|---|---|
| **English only** | Code, comments, docs, commits, tickets — no exceptions |
| **Baby steps** | One task at a time. Stop and surface blockers. Never skip ahead. |
| **TDD first** | Failing test before implementation. Every time. |
| **No assumptions** | Ambiguous requirement → ask, don't invent |
| **Type safety** | Fully typed where the language supports it |
| **No silent failures** | Every error caught, logged with context, surfaced to caller |
| **SOLID** | Single responsibility, Open/closed, Liskov, Interface segregation, DI |
| **DDD boundaries** | Services never reach into other domain's data directly |
| **Feedback loop** | After user feedback → propose rule update, await approval, then apply |
| **Living docs** | After every commit → check which docs need updating (`/update-docs`) |

---

## 2. How Agents Use AGENTS.local.md

### Reading ticket tool config

```
# From AGENTS.local.md:
ticket_provider.tool        → which MCP to call (or "none")
ticket_provider.mcp_name    → exact MCP name in Claude integrations
ticket_provider.statuses.*  → exact status names on the board
ticket_provider.board_url   → link for SPEC.md and PRs
```

### Reading verify commands

```
# From AGENTS.local.md:
verify_commands.test        → run before every commit
verify_commands.typecheck   → run before every commit (skip if null)
verify_commands.lint        → run before every commit (skip if null)
verify_commands.coverage    → run when checking quality gate (skip if null)
```

### Reading VCS config

```
vcs.pr_tool          → "gh" | "glab" | null (manual PR)
vcs.branch_pattern   → how to name branches
vcs.default_base_branch → base for new feature branches
```

### Reading autonomy config

```
autonomy.level                        → "supervised" | "balanced" | "autonomous"
autonomy.circuit_breaker.max_test_retries   → stop after N consecutive test failures
autonomy.circuit_breaker.max_new_files      → checkpoint if creating more than N files
autonomy.circuit_breaker.max_tokens_per_ticket → stop if token budget exceeded
```

**Autonomy level behavior — full Git workflow:**

| Action | `supervised` | `balanced` | `autonomous` |
|---|---|---|---|
| **Create ticket branch** | Pause — confirm branch name and base branch | Automatic | Automatic |
| **Commit + push** | Pause — show diff and message, wait for approval | Automatic | Automatic |
| **Create PR** | Pause — show title and body draft, wait for approval | Automatic | Automatic |
| **Merge PR** | ✗ Human merges manually | ✗ Human merges manually | ✓ Auto-merge when CI green (requires `auto_merge_pr: true`) |
| **Delete branch** | ✗ Human deletes manually | ✗ Human deletes manually | ✓ Automatic after merge |
| **Return to base branch** | ✗ Human manages | ✗ Human manages | ✓ Automatic after cleanup |
| **Plan approval** | Pause & present | Log to `.hive/changes/` & continue | Log & continue |
| **Ambiguous decisions** | Pause & ask | Pause & ask | Best judgment, log decision |
| **Ticket → Done** | Per `ticket_transitions.mode` | Per `ticket_transitions.mode` | Always exactly 1 transition: → Done after merge, regardless of configured mode (skip if `mcp_name` is `"none"`) |

Commit messages and PR descriptions are written in the language defined by `language.communication` in `AGENTS.local.md`.

**Circuit breakers apply at ALL levels** — even `autonomous` stops when:
- A test fails `max_test_retries` times consecutively
- More than `max_new_files` new files need to be created
- Token usage exceeds `max_tokens_per_ticket`

### Reading ticket transition config

```
ticket_provider.ticket_transitions.mode        → "minimal" | "standard" | "verbose"
ticket_provider.ticket_transitions.auto_merge_pr → true | false
```

**Transition behavior by mode:**

| Mode | Transitions | When | Token cost |
|---|---|---|---|
| `minimal` (default) | 1 | Ticket → Done on PR merge | Lowest |
| `standard` | 2 | → In Progress on start + → Done on merge | Low |
| `verbose` | 3+ | → In Progress on start + → In Review on PR open + → Done on merge | Normal |

If `auto_merge_pr: true` and autonomy is `autonomous`: PR is merged automatically when all CI checks pass.

### Reading autonomous mode requirements

```
autonomy.level = "autonomous"  → audit log is MANDATORY
```

In `autonomous` mode, the agent MUST log every significant action to `.hive/events.jsonl`:
- Every file created or modified
- Every test run (pass/fail)
- Every commit and push
- Every decision made without human approval

```jsonl
{"ts":"<ISO>","cmd":"<pipeline>","ticket":"<id>","stage":"<name>","event":"action","detail":"<description>","tokens":<n>}
```

---

## 3. Agent Roles

| Agent | File | Commands |
|---|---|---|
| **Analyst** | `.hive/.agents/analyst.md` | `/enrich`, `/sync` |
| **Architect** | `.hive/.agents/architect.md` | `/plan-be`, `/plan-fe` |
| **Coder** | `.hive/.agents/coder.md` | `/dev-be`, `/dev-fe`, `/commit` |
| **Tester** | `.hive/.agents/tester.md` | `/tdd` |
| **Reviewer** | `.hive/.agents/reviewer.md` | `/review` |
| **Product Strategist** | `.hive/.agents/product-strategist.md` | `/strategy` |
| **Explainer** | `.hive/.agents/explainer.md` | `/explain` |
| **Orchestrator** | `.hive/.agents/orchestrator.md` | `/ship`, `/kickoff`, `/sprint-setup` |
| **DevOps** | `.hive/.agents/devops.md` | `/ci`, `/deploy-config` |

---

## 4. Slash Commands

```
/intake                     → Product Strategist: capture client requirements
/strategy <idea>            → Product Strategist: analyze idea, define users + value prop
/kickoff                    → All agents: full project setup wizard (strategy → PRD → arch → tickets)
/sprint-setup [sprint]      → Analyst: create/validate sprint tickets + SPEC.md
/enrich   <ticket>          → Analyst: enrich ticket with full technical detail
/plan-be  <ticket>          → Architect: backend implementation plan
/plan-fe  <ticket> [design] → Architect: frontend implementation plan
/tdd      <ticket>          → Tester: write failing tests from acceptance criteria
/dev-be   <ticket>          → Coder: implement backend (TDD green phase)
/dev-fe   <ticket> [design] → Coder: implement frontend
/ship     <ticket> [--dry-run] → All agents: full ticket pipeline (enrich → plan → tdd → dev → commit)
/commit   [ticket|--dry-run]   → Coder: stage, commit, push, create PR
/review   [pr|branch]       → Reviewer: review against standards
/sync                       → Analyst: regenerate SPEC.md from ticket board
/update-docs               → Review and update all docs after code changes
/assess                    → Architect: analyze legacy codebase structure and patterns
/ci       [--generate]     → DevOps: generate CI/CD pipeline from config
/explain  <topic>           → Explainer: teach concept with mental model + quiz
/meta     <prompt>          → Improve a prompt using prompt engineering best practices
```

Full spec for each: `.hive/.commands/`

---

## 5. MCP Integration (configured per project in AGENTS.local.md)

Agents check `AGENTS.local.md` for which MCPs are configured before calling any tool.

| Purpose | Common MCPs | Used by |
|---|---|---|
| Tickets | Atlassian, Linear, GitHub | /enrich /plan /commit /sync /review |
| Design | Figma | /dev-fe /plan-fe |
| Library docs | Context7 | /plan /dev-be /dev-fe /tdd |
| Code hosting | GitHub, GitLab | /commit /review |
| Browser testing | Browser/Chrome | /tdd /review |
If a configured MCP is unavailable → follow the fallback behavior defined in `AGENTS.local.md`.

---

## 6. Definition of Done

A task is DONE only when all applicable items pass (skip items marked `null` in config):

- [ ] Failing test written before implementation (TDD)
- [ ] All acceptance criteria from the ticket pass
- [ ] Unit tests pass (`verify_commands.test`)
- [ ] Integration / E2E tests pass (if applicable)
- [ ] Type check passes (`verify_commands.typecheck`, skip if null)
- [ ] Linter passes (`verify_commands.lint`, skip if null)
- [ ] No debug artifacts in production paths
- [ ] No hardcoded values — all via environment variables
- [ ] PR created with ticket reference, CI green
- [ ] Ticket moved to `statuses.in_review` on the board
- [ ] Technical docs updated (`/update-docs` run)

---

## Token Budget — Context Loading Rules

**Load only what the current task requires.**

This table is the single source of truth for context loading. Command files do not redefine it.

| Task | Load | Skip |
|---|---|---|
| `/kickoff` or `/strategy` | functional context doc | all standards, all agents |
| `/enrich` | `analyst.md` + ticket | standards, other agents |
| `/plan-be` | `architect.md` + `core.mdc` + `backend.mdc` | frontend.mdc, other agents |
| `/plan-fe` | `architect.md` + `core.mdc` + `frontend.mdc` | backend.mdc, other agents |
| `/tdd` | `tester.md` + plan file + test standard | other agents, other standards |
| `/dev-be` | `coder.md` + test files + `backend.mdc` | frontend.mdc, other agents |
| `/dev-fe` | `coder.md` + test files + `frontend.mdc` | backend.mdc, other agents |
| `/review` | `reviewer.md` + both standards + diff | agents, spec files |

**Rules:**
- Never load all agents at once — load only the agent for the current command
- Never load all standards — load only the standard for the current area
- `SPEC.md` is a compact sprint summary — use it instead of querying Jira for context
- `.hive/changes/{ticket}_backend.md` is the authoritative plan — read it, don't regenerate
- If a file was read in a previous step of the same session, it is already in context — do not reload

**Approximate sizes (tokens):** `AGENTS.md` ~3.5K · `AGENTS.local.md` ~5K · each agent ~1.5K · `core.mdc` ~3.5K · each stack standard ~2K.
For models with ≤ 16K context: load `AGENTS.md` + `AGENTS.local.md` + one agent file + one standard only.
For models with ≥ 32K context: full stage loading as defined above is safe.


---

## 7. Feedback Loop (mandatory)

After any user correction, feedback, or new information:

1. Identify which rule or standard should be updated
2. Quote the specific section to change
3. Propose exact new wording
4. State: *"Awaiting your approval before modifying any rule file."*
5. Only after explicit approval → apply the change and confirm

Never modify rule files without approval.
