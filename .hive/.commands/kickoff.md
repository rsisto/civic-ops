# /kickoff — Project Initialization Wizard

**Agent:** Orchestrator (read `.hive/.agents/orchestrator.md`)
**Usage:** `/kickoff`
**Autonomy checkpoints:** Governed by `autonomy.level` in `AGENTS.local.md`

Runs the full project initialization sequence with guided human checkpoints.
Replaces running `/strategy`, writing PRD, writing ARCHITECTURE, and creating tickets separately.

**Time:** ~30-45 minutes for a medium project (vs 3-4 hours manually)

---

## Mandatory reading before starting

1. `.hive/AGENTS.local.md` — project identity, ticket tool, board URL
2. `.hive/specs/data-model.md` — if it exists (use as architecture input)
3. Any uploaded functional context document

---

## Sequence

### Phase 1 — Strategy (automated)

Read all available context documents. Produce:

```markdown
## HIVE Kickoff — Strategy Output

### Problem
[one paragraph]

### Users & Jobs-to-be-Done
| User | Job | Pain today |
|---|---|---|
| ... | ... | ... |

### Value proposition
[one sentence]

### Feature prioritization (MoSCoW)
**Must Have (MVP):**
- [feature]: [measurable outcome]

**Should Have:**
- [feature]: [reason]

**Could Have (v2):**
- [feature]: [reason]

**Won't Have:**
- [feature]: [reason]

### Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| ... | ... | ... |

### Recommended Sprint order
Sprint 1: [epics] — [rationale]
...
```

---

### ⏸ CHECKPOINT 1 — Human validates strategy

Present the strategy output and ask:

```
Does this strategy accurately reflect the project?
Specific questions to answer:
1. Is the MVP scope correct? Anything to add or remove?
2. Is the sprint order feasible for your team?
3. Any business rules or constraints not captured?

Reply with corrections or type "approved" to continue.
```

**Do not proceed until human approves.**

---

### Phase 2 — PRD generation (automated after approval)

Generate `.hive/specs/PRD.md` from the approved strategy.

Format:
```markdown
# PRD — {project name} v0.1
_Last updated: {date} | Owner: {tech_lead}_

## Problem
## Goal (one measurable outcome)
## Users

## Features

### Must-Have (MVP)
- [ ] **{feature}**: Given {context} When {action} Then {measurable outcome}
  - Acceptance criteria 1
  - Acceptance criteria 2

### Should Have
### Could Have (v2)
### Won't Have
```

Save to: `.hive/specs/PRD.md`

---

### ⏸ CHECKPOINT 2 — Human validates PRD

```
PRD.md has been generated. Please review:
1. Are the acceptance criteria testable and measurable?
2. Any missing features in Must-Have?
3. Any Must-Have that should actually be v2?

Reply with corrections or type "approved" to continue.
```

**Do not proceed until human approves.**

---

### Phase 3 — Architecture generation (automated after approval)

Read: approved PRD + data-model.md (if exists) + AGENTS.local.md (stack)

Generate `.hive/specs/ARCHITECTURE.md`:

```markdown
# Architecture — {project name}
_Last updated: {date}_

## Stack
[from STACK.md]

## Bounded Contexts
| Context | Responsibility | Key entities |
|---|---|---|

## Module Structure
[folder tree with responsibility annotations]

## Key Architectural Decisions
[ADR entries for significant decisions]

## Data Flow
[diagram as ASCII or description]

## External Dependencies
| Dependency | Purpose | Integration method |
|---|---|---|

## Constraints
[things that cannot change — documented explicitly]
```

Save to: `.hive/specs/ARCHITECTURE.md`

---

### ⏸ CHECKPOINT 3 — Human validates Architecture

```
ARCHITECTURE.md has been generated. Critical review points:
1. Do the bounded contexts match your mental model of the system?
2. Are the module responsibilities clear and non-overlapping?
3. Any external dependency missing?
4. Any constraint not documented?

Reply with corrections or type "approved" to continue.
```

**Do not proceed until human approves.**

---

### Phase 4 — Epic and ticket creation (automated after approval)

Read: approved PRD + ARCHITECTURE + AGENTS.local.md (ticket tool, board URL)

**4a. Generate ticket list**

Create a structured ticket list ordered by technical dependency:
- Epic 1: Auth & foundational infrastructure (always first)
- Epic 2: Configuration and admin
- Epic 3: Core domain entities
- ...

For each ticket:
- Title: `[Verb] [Entity] [context]` in English
- Description: acceptance criteria from PRD + technical scope
- Epic link
- Estimated size: S/M/L/XL based on complexity

**4b. Create in ticket tool**

Read `ticket_provider.tool` and `ticket_provider.mcp_name` from `AGENTS.local.md`.

If MCP available → create all epics and tickets via MCP.
If not → output the ticket list in `.hive/specs/tickets-to-create.md` with paste format.

**4c. Sync SPEC.md**

After tickets are created, run the `/sync` process to generate `.hive/specs/SPEC.md`.

---

### ⏸ CHECKPOINT 4 — Final confirmation

```
Kickoff complete. Summary:
- PRD.md: ✓ saved to .hive/specs/PRD.md
- ARCHITECTURE.md: ✓ saved to .hive/specs/ARCHITECTURE.md
- Tickets created: {N} tickets in {M} epics
- SPEC.md: ✓ generated from sprint 1

Next step: run /enrich {TICKET-ID} on the first ticket of Sprint 1.
Recommended starting ticket: {first ticket of Epic 1}

Type the ticket ID to start, or "done" to finish kickoff.
```

---

## Token optimization notes

- Each phase loads only the context needed for that phase
- Strategy phase: functional context only
- PRD phase: strategy output + functional context
- Architecture phase: PRD + data model + stack
- Tickets phase: PRD + architecture (no standards needed)
- Total context per phase: ~3-5 files, not all 13

## Quality guarantees

- Human approves at 3 checkpoints before any ticket is created
- No tickets created from unapproved PRD
- No architecture generated from unapproved strategy
- Each checkpoint is a hard stop — not a suggestion
