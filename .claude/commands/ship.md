# /ship — Ticket Implementation Pipeline

**Agent:** Orchestrator (read `.hive/.agents/orchestrator.md`)
**Usage:** `/ship <ticket-id>`
**Autonomy checkpoints:** Governed by `autonomy.level` in `AGENTS.local.md`

Runs the full implementation pipeline for a single ticket.
Replaces running `/enrich → /plan-be → /plan-fe → /tdd → /dev-be → /dev-fe → /update-docs → /commit` separately.

**Prerequisite:** ticket must exist in the board and `.hive/specs/SPEC.md` must be current.

---

## Mandatory reading before starting

1. `.hive/AGENTS.local.md` — all config
2. `.hive/specs/SPEC.md` — sprint context
3. `.hive/specs/ARCHITECTURE.md` — system structure
4. `.hive/specs/data-model.md` — data model

---

## Pipeline

### Stage 1 — Enrich (Analyst)

Read the ticket from the board via MCP (or fallback).
Apply `/enrich` process: Given/When/Then, endpoints, files, validation rules, out-of-scope.
Write enriched content back to ticket.
Do NOT move ticket status yet — wait until implementation starts.

Output summary:
```
Ticket: {ID} — {title}
Size: S/M/L/XL
Layers affected: domain / application / infrastructure / presentation / frontend
Estimated steps: {N}
```

---

### ⏸ CHECKPOINT — Human reviews enriched ticket

**Applies when:** `autonomy.level` is `supervised`
**Skipped when:** `autonomy.level` is `balanced` or `autonomous` (log to `.hive/changes/` and continue)

```
Ticket {ID} has been enriched. Review the acceptance criteria:
[show Given/When/Then criteria]

Are these criteria correct and complete?
Reply with corrections or type "approved" to continue.
```

**Do not proceed until human approves (if checkpoint applies).**

---

### Stage 2 — Plan + Start (Architect)

Transition ticket to `statuses.in_progress` via MCP — signals work has started.


Load: `.hive/standards/core.mdc` + relevant area standards (backend/frontend/both)

Run `/plan-be` and/or `/plan-fe` based on layers affected.
Save plans to:
- `.hive/changes/{ticket-id}_backend.md`
- `.hive/changes/{ticket-id}_frontend.md`

Verify library versions via Context7 before finalizing plan.

Output summary:
```
Backend plan: {N} subtasks, {layers}
Frontend plan: {N} subtasks, {components}
Estimated tests to write: {N}
```

---

### Stage 3 — Tests (Tester)

Load: `.hive/changes/{ticket-id}_backend.md` + relevant test standards

Run `/tdd` process: write failing tests for all acceptance criteria.
Tests are committed to the **feature branch** (same branch as implementation — never a separate branch).

Confirm tests fail for the right reason (not syntax errors):
```
Tests written: {N}
All failing: ✓ (confirmed — implementation does not exist yet)
Committed to: feature/{ticket-id}-{description}
```

---

### Stage 4 — Implement (Coder)

Load: failing tests + implementation plan + relevant standards

Run `/dev-be` and/or `/dev-fe`.
Execute subtasks in DDD layer order.
After each subtask: run `verify_commands.test` — confirm passing.

Progress tracking:
```
[ ] Step 1: {description} — {status}
[ ] Step 2: {description} — {status}
...
```

Stop immediately if a test fails unexpectedly — surface the conflict, do not modify the test.

---

### ⏸ CHECKPOINT — Human reviews implementation

**Applies when:** `autonomy.level` is `supervised` or `balanced`
**Skipped when:** `autonomy.level` is `autonomous` (auto-commit if all checks pass)

```
Implementation complete. All tests passing.
Verification results:
  tests:     ✓ {N}/{N} passing
  typecheck: ✓ / ✗ {errors}
  lint:      ✓ / ✗ {warnings}
  coverage:  {%}

Changed files:
{list of files modified}

Review the changes. Reply with corrections or type "approved" to commit.
```

**Do not commit until human approves (if checkpoint applies).**

---

### Stage 5 — Docs + Commit (Coder)

Run `/update-docs`: identify and update affected docs.
Run `/commit`: stage, commit, push, create PR.

Final output:
```
✓ Docs updated: {list}
✓ Committed: {commit message}
✓ PR created: {URL}
✓ Ticket moved to: {statuses.in_review}

Next: run /ship {next-ticket-id} or /review to review this PR.
```

---

## Abort conditions

Stop the pipeline and ask the human if:
- Acceptance criteria are ambiguous after enrichment
- A test fails for an unexpected reason (not missing implementation)
- A library API cannot be confirmed via Context7
- A DDD boundary violation would be required to implement the ticket
- The implementation requires touching more than 15 files

<!-- Context loading strategy per stage is defined in AGENTS.md "Token Budget" section. -->
