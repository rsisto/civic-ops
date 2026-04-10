# /dev-fe — Frontend Implementation

**Agent:** Coder (read `.hive/.agents/coder.md`)
**Usage:** `/dev-fe <ticket-id> [design-url]`
**Autonomy checkpoints:** See `autonomy.level` in `AGENTS.local.md`

---

## Process

### 1. Read context (mandatory before any code)
- `.hive/AGENTS.local.md` — verify_commands, design_tool, stack, vcs config
- Implementation plan: `.hive/changes/<ticket-id>_frontend.md`
- Session context: `hive/sessions/context_<feature>.md` (if exists)
- `.hive/standards/core.mdc`
- `.hive/standards/frontend.mdc` — stack-specific patterns, UI library, test runner
- Failing tests already committed by `/tdd`

### 2. Verify branch
Read `vcs.branch_pattern` from `.hive/AGENTS.local.md`.
Confirm you are on the correct frontend feature branch.
If not → create it before any changes.

### 3. Confirm library APIs via Context7 (before every external call)
```
resolve-library-id('<library>') → query-docs(id, '<hook, component, or method>')
```
Before using any UI component, form helper, router hook, or HTTP client —
confirm the current API. Never rely on training-data memory for signatures.

### 4. Read design specs (if design URL provided)
Read `design_tool.mcp_name` from `.hive/AGENTS.local.md`.
If MCP is available:
```
get_design_context(designUrl) → component tree, props, variants, states, tokens
get_screenshot(designUrl)     → visual reference for layout matching
```
If unavailable → follow `fallbacks.design_unavailable` from AGENTS.local.md.
Implement all variants and states shown in the design. Note deviations if necessary.

### 5. Implement following the plan
- Service / API layer first (all HTTP calls)
- Then components — smallest units first, composed components after
- Then routing changes if new pages are needed
- Run tests after each component — confirm passing

### 6. Component quality checklist (per component)
Read `.hive/standards/frontend.mdc` for the project's specific UI library and patterns.
Apply these universal rules regardless of stack:

- [ ] All three states handled: loading, error, success
- [ ] Empty state handled (no data case)
- [ ] Use the project's UI component library — do not write raw HTML equivalents
- [ ] Accessibility: labels and roles on all interactive elements
- [ ] No HTTP calls directly in components — use the service layer
- [ ] All props typed using the project's type system
- [ ] No anonymous default exports

### 7. After implementation
Read `verify_commands` from `.hive/AGENTS.local.md` and run each in order.
Skip any command set to `null`.

```
verify_commands.test        → unit tests must pass
verify_commands.typecheck   → zero type errors (skip if null)
verify_commands.lint        → zero warnings (skip if null)
```

Also run E2E tests if the stack has them configured in `frontend.md`.

### 8. Feedback loop (when user corrects something)
1. Understand the correction
2. Identify which standard or rule it relates to
3. If the standard needs updating → propose the change with exact wording
4. State: "Awaiting approval before modifying any rule file"
5. After approval → update the standard

## Rules
- Do not introduce new dependencies without: (a) strict necessity, (b) written justification
- Always check the project's UI library (defined in `frontend.md`) before writing custom components
- Tests step is always first after branch creation — never skip it
- No debug logging in committed code
- English only in all code, comments, and error messages
