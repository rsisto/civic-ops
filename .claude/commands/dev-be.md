# /dev-be — Backend Implementation

**Agent:** Coder (read `.hive/.agents/coder.md`)
**Usage:** `/dev-be <ticket-id>`
**Autonomy checkpoints:** See `autonomy.level` in `AGENTS.local.md`

---

## Process

### 1. Read context (mandatory before touching any code)
- `.hive/AGENTS.local.md` — verify_commands, stack, vcs config
- Implementation plan: `.hive/changes/<ticket-id>_backend.md`
- Session context: `hive/sessions/context_<feature>.md` (if exists)
- `.hive/standards/core.mdc`
- `.hive/standards/backend.mdc` — stack-specific patterns and conventions
- Failing tests already committed by `/tdd`

### 2. Verify branch
Read `vcs.branch_pattern` from `.hive/AGENTS.local.md`.
Confirm you are on the correct backend feature branch.
If not → create it before any changes.

### 3. Confirm library APIs via Context7 (before every external call)
```
resolve-library-id('<library>') → query-docs(id, '<method or feature>')
```
Never rely on training-data memory for library API signatures.
This applies to every framework, ORM, validation library, or utility used.

### 4. Implement following the plan
Execute subtasks in the exact order specified in the plan.
After each subtask: run tests, confirm still passing or now passing.

### 5. TDD discipline
- Green phase: write the minimum code to pass the failing test
- Refactor phase: clean up without breaking tests
- Never write code not tested by an existing failing test
- Never modify test files to make them pass — surface the conflict instead

### 6. After implementation
Read `verify_commands` from `.hive/AGENTS.local.md` and run each in order.
Skip any command set to `null`.

```
verify_commands.test        → all tests must pass
verify_commands.typecheck   → zero type errors (skip if null)
verify_commands.lint        → zero warnings (skip if null)
verify_commands.coverage    → coverage threshold met (skip if null)
```

Do not proceed to commit if any command fails.

### 7. Update documentation
Run `/update-docs` before committing:
- Identify which docs changed: data-model, api-spec, backend standards
- Update each affected file in the same commit

### 8. Commit
Follow `/commit` — do not proceed to PR if any check fails.

## Rules
- Implement one subtask at a time — run tests between each
- Never modify test files to make them pass — surface the conflict instead
- Respect domain boundaries — services never reach into another domain's data
- No untyped code — use the type system the stack provides
- All library API signatures confirmed via Context7 before use
- No debug logging in production paths — use the project's logger (defined in backend.md)
- All inputs validated at the boundary before reaching business logic
