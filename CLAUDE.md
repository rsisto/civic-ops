# CLAUDE.md

> This file is read by **Claude Code** (CLI) on every session startup.
> It provides Claude Code-specific configuration on top of `AGENTS.md`.
> For the full agent protocol, read `AGENTS.md` first.

---

## Claude Code Setup

### Slash commands

All HIVE commands are available in `.claude/commands/` — type `/` to see them.

| Command | What it does | Interactive? |
|---|---|---|
| `/kickoff` | Full project init: strategy → PRD → architecture → tickets | Yes — 3 checkpoints |
| `/ship <ticket>` | Full pipeline: enrich → plan → tdd → implement → commit | Yes — 2 checkpoints |
| `/sprint-setup` | Create sprint tickets + generate SPEC.md | Yes — 1 checkpoint |
| `/intake` | Client onboarding: gather requirements, context, constraints | Yes |
| `/strategy` | Product strategy analysis and roadmap definition | Yes |
| `/assess <path>` | Analyse a legacy codebase and produce migration plan | No |
| `/enrich <ticket>` | Enrich ticket with Given/When/Then | Yes |
| `/plan-be <ticket>` | Backend DDD implementation plan | No |
| `/plan-fe <ticket>` | Frontend component plan | No |
| `/tdd <ticket>` | Write failing tests before implementation (red phase) | No |
| `/dev-be <ticket>` | Implement backend (TDD green phase) | No |
| `/dev-fe <ticket>` | Implement frontend | No |
| `/commit <ticket>` | Stage, commit, push, PR | Yes — confirms before push |
| `/review` | Review PR: DDD, SOLID, security, coverage | No |
| `/update-docs` | Keep docs in sync after implementation changes | No |
| `/sync` | Regenerate SPEC.md from Jira | No |
| `/ci` | Generate or update CI/CD pipeline config | No |
| `/explain <topic>` | Teach a concept, pattern, or piece of code | No |
| `/meta` | Improve or debug a HIVE prompt/command | No |

### MCP servers

Configure in `~/.claude/config.json`:

```json
{
  "mcpServers": {
    "atlassian": { "url": "https://mcp.atlassian.com/v1/mcp" },
    "context7":  { "url": "https://mcp.context7.com/mcp" },
    "figma":     { "url": "https://mcp.figma.com/mcp" }
  }
}
```

### Context loading strategy (token-efficient)

Claude Code reads files on demand. Follow this order strictly:

1. **Always first**: `AGENTS.md` (universal rules), then `.hive/AGENTS.local.md` (project config)
2. **Per command**: only the agent for the current task (`.hive/.agents/<role>.md`)
3. **Per area**: only the relevant standard (`backend.mdc` OR `frontend.mdc`, never both)
4. **Sprint context**: `.hive/specs/SPEC.md` (compact summary — preferred over querying Jira)
5. **Implementation plan**: `.hive/changes/{ticket}_backend.md` (read it, don't regenerate)

**Never** load all agents and all standards at session start.

### Memory and long sessions

- Core memory file: `.hive/AGENTS.local.md` — re-read at start of each session
- After 30-40 interactions: run `/compact` to summarize context before degradation
- For new sessions on the same ticket: re-read `.hive/changes/{ticket}_backend.md`

### Parallel agents (Claude Code Max)

For independent tickets, Claude Code Max supports parallel agents.
Recommended split: one agent per epic, not one agent per ticket.
