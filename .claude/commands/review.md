# /review — Code Review

**Agent:** Reviewer (read `.hive/.agents/reviewer.md`)
**Usage:** `/review [pr-number | branch-name]`
If no argument → review the current branch diff vs develop.

---

## Process

### 1. Get the diff
- With GitHub MCP: `gh pr diff <pr-number>`
- Without MCP: `git diff develop...HEAD`

### 2. Get the ticket
- Retrieve the linked Jira ticket (from PR title or branch name)
- Atlassian MCP or ask the user if unavailable

### 3. Run the review checklist

#### Correctness
- [ ] Every acceptance criterion from the ticket is addressed
- [ ] Every criterion has at least one test
- [ ] Edge cases handled (null inputs, empty collections, concurrent writes)

#### TDD compliance
- [ ] Test commits predate implementation commits (check git log)
- [ ] No implementation without a corresponding test

#### Architecture (DDD)
- [ ] Code is in the correct layer
- [ ] No business logic in controllers
- [ ] No cross-domain direct data access
- [ ] Aggregate root enforces invariants

#### SOLID
- [ ] Functions ≤ 20 lines
- [ ] Classes have single responsibility
- [ ] Dependencies are on abstractions, not concretions

#### Type safety
- [ ] No `any`
- [ ] No non-null assertions `!` without justification
- [ ] All exported function return types explicit

#### Security
- [ ] All inputs validated before use
- [ ] No secrets or PII in logs
- [ ] Auth verified before data access
- [ ] No string concatenation in queries

#### Test quality
- [ ] Tests use AAA pattern
- [ ] Test names read as specifications
- [ ] No `test.only`, `test.skip`, `xit`, `fit`
- [ ] Coverage ≥ 90% on new backend code

#### Documentation
- [ ] Docs updated alongside code changes
- [ ] `api-spec.yml` updated if API changed
- [ ] `data-model.md` updated if schema changed

### 4. Post findings

Severity levels:
- 🔴 **CRITICAL** — blocks merge: security issue, missing test, DDD violation
- 🟡 **WARNING** — should fix: naming, type safety, SOLID
- 🔵 **SUGGESTION** — optional: style improvement, future consideration

Output format:
```
## Review: [APPROVE | REQUEST_CHANGES | COMMENT]

### 🔴 Critical
- `src/controllers/employee.ts:42` — Business logic in controller.
  Move email uniqueness check to EmployeeService.

### 🟡 Warnings
- `src/services/employee.ts:88` — `any` type on error catch.
  Use `unknown` and narrow.

### 🔵 Suggestions
- Consider extracting email normalization into an Email value object.

### Verdict
REQUEST_CHANGES — 1 critical issue must be resolved before merge.
```

If using GitHub MCP → post review as PR comment.
If not → output to chat.
