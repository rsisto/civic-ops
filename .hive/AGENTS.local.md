# AGENTS.local.md — civic-ops
# hive_version: v1.1.0  ← update when syncing standards from a new HIVE release
_Created: 2026-04-10 | Stack: node-react-prisma_

---

## Project Identity

```yaml
name: "civic-ops"
tech_lead: "RS"
stack: "node-react-prisma"
```

---

## Ticket Provider

```yaml
ticket_provider:
  tool: "jira"
  mcp_name: "Atlassian"
  board_url: "https://kreitech-team.atlassian.net/jira/software/projects/CO/boards/67"
  id_format: "CO-{number}"

  # Edit these to match the EXACT status names in your board
  statuses:
    backlog:     "TODO: Backlog"
    to_refine:   "TODO: To Refine"
    refined:     "TODO: Ready"
    in_progress: "TODO: In Progress"
    in_review:   "TODO: In Review"
    done:        "TODO: Done"
    blocked:     "TODO: Blocked"

  auto_transition_after_enrich: true
```

---

## Build & Verification Commands

```yaml
verify_commands:
  test:      "npm test"
  typecheck: "npm run typecheck"
  lint:      "npm run lint"
  coverage:  "npm run test:coverage"
  build:     "npm run build"
```

---

## Package Manager

```yaml
package_manager:
  tool:        "npm"
  install_cmd: "npm install"
  add_dep_cmd: "npm install <pkg>"
```

---

## Version Control

```yaml
vcs:
  platform:             "github"
  mcp_name:             "GitHub"
  default_base_branch:  "develop"
  branch_pattern:       "feature/\{ticket-id\}-\{description\}"
  pr_tool:              "gh"
  ai_trailer:           true
```

---

## Design Tool

```yaml
design_tool:
  tool:     "none"     # figma | zeplin | none
  mcp_name: "none"     # Figma | none
```

---

## Fallbacks

```yaml
fallbacks:
  ticket_unavailable: "ask"
  design_unavailable: "ask"
  ticket_paste_format: |
    Please paste the ticket content:
    ---
    ID: <ticket-id>
    Title: <title>
    Description: <full description>
    Acceptance Criteria:
    - <criterion 1>
    - <criterion 2>
    Current Status: <status>
    ---
```

---

## Project-Specific Rules

<!-- Add project overrides here as the project evolves -->
