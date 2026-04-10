# Strategy — civic-ops
_Generated: 2026-04-10 | Analyst: Product Strategist Agent_

---

## Problem

Political and institutional teams in Uruguay are operationally strong at agenda-setting and communication but consistently weak at execution follow-through. Meetings happen, decisions are made, and commitments are spoken — but tracking, ownership, and accountability collapse almost immediately because everything lives across WhatsApp threads, shared docs, and personal spreadsheets. Responsible parties change, institutional memory evaporates, and leadership has no reliable view of what is happening without manually chasing updates.

The core dysfunction is not a lack of intent but a lack of infrastructure. Teams have no single place to close the loop between "what was decided" and "what actually happened," no way to surface overdue or blocked items at a glance, and no searchable record of past decisions and citizen commitments.

---

## Users & Jobs-to-be-Done

| User | Job to be done | Pain today |
|---|---|---|
| Chief of staff / coordinator | Ensure every commitment from every meeting is assigned, tracked, and closed | Manually follows up via WhatsApp; items fall through the cracks when responsibilities shift |
| Advisor / analyst | Turn meeting notes into structured next steps without duplicating effort | Re-reads notes, extracts items manually, no standardized format |
| Legislator / director (leadership) | Get a reliable weekly picture of what's done, pending, and at risk — without chasing | Either gets no summary or receives manually assembled slide decks |
| Citizen-facing staff | Log, classify, assign, and follow up on constituent requests | Requests arrive via WhatsApp/email, are written on sticky notes or spreadsheets, and are rarely tracked to closure |
| New team member | Understand past decisions and context quickly | No institutional memory — depends on asking colleagues or hunting through chats |

---

## Value Proposition

For political and institutional teams in Uruguay who struggle with execution follow-through, **Civic Ops** is an operational accountability platform that transforms meetings, commitments, and citizen requests into a clear, auditable workflow — unlike spreadsheets and chats which offer no ownership tracking, no structured follow-up, and no searchable institutional memory.

---

## Feature Prioritization (MoSCoW)

### Must Have — MVP core (no value without these)
- **Meeting Registry & Notes Capture**: structured storage with participants, date, topics, and source material — the entry point for all downstream value
- **AI Meeting Summaries**: reduces documentation friction to near-zero; the hook that earns daily habit
- **Commitment Extraction**: AI surfaces owners, due dates, and blockers from meeting text for human review
- **Task & Follow-up Workflow**: visible, assignable items with status and update history — the accountability backbone
- **Dashboard for Execution Visibility**: overdue items, blockers, items due soon, progress by owner — answers "what's at risk right now?"
- **Role-Based Access Control (RBAC)**: permissions by role and tenant — required for political confidentiality
- **Multi-Tenant Workspace Isolation**: each team's data is fully isolated — non-negotiable for trust
- **Audit Trail**: who changed what and when — essential for political accountability contexts

### Should Have — important but not MVP-blocking
- **Initiatives Tracking**: projects/workstreams with status, priority, owners, deadlines — needed for teams managing more than reactive commitments
- **Citizen Requests Tracking**: classify, assign, prioritize, and follow up on constituent requests — high value for legislative and municipal teams
- **Weekly Executive Report**: AI-generated leadership summary of completed work, pending, blockers, risks — closes the reporting loop
- **Semantic Search**: natural-language retrieval across all records — enables institutional memory access at scale

### Could Have — v2 and beyond
- **Audio Transcription Pipeline**: upload recordings → transcript → summary/extraction; removes the friction of note-taking entirely
- **WhatsApp / Email Intake**: incoming messages become tracked requests automatically
- **Territory / Region Tagging**: geographic trend surfacing for constituency-facing teams
- **Notifications & Reminders**: deadline alerts for assigned users
- **Document Repository**: attachments as part of searchable institutional memory
- **Shared Templates**: reusable formats for reports and meeting minutes

### Won't Have — explicitly out of scope for v0.1
- Voter persuasion engine — ethically sensitive, out of scope
- Campaign ad generation — not an execution tool
- Psychographic profiling — not aligned with product purpose
- Fundraising workflows — separate domain
- Full electoral CRM — too broad for v1
- Automated political decision-making — the system assists, it does not decide

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| User resistance to structured data entry | High | High | AI does the heavy lifting — minimize manual fields; auto-extract commitments from free-text notes |
| AI extraction quality (hallucinations, missed items) | Medium | High | Always require human review before commitments are saved; show confidence signals |
| Ambiguous ownership in political environments | High | Medium | Allow multiple owners and "pending assignment" state; escalate unassigned items on dashboard |
| Privacy expectations and data sensitivity | Medium | High | Tenant isolation, RBAC, audit trail as table stakes from day one; Spanish-first + local hosting option |
| Scope creep into CRM / campaign territory | High | Medium | Enforce hard "won't have" list; evaluate each new request against the execution-first mission |
| Dependency on AI providers (cost, reliability) | Low | Medium | Abstract AI layer; design for provider swap; cache summaries to avoid re-generation |
| Low adoption if workflow feels heavy | High | High | Onboard with one team for 2 weeks before v1 launch; cut any feature that doesn't earn its friction |

---

## Recommended Implementation Order

**Sprint 1 — Foundation** *(auth, tenancy, meetings)*
Auth + RBAC + Multi-Tenant isolation, Meeting Registry, Notes Capture
→ *Rationale: nothing works without secure multi-tenant auth; meetings are the primary data source for all downstream features*

**Sprint 2 — Core Value Loop** *(AI + commitments + tasks)*
AI Meeting Summaries, Commitment Extraction, Task & Follow-up Workflow, Audit Trail
→ *Rationale: this is the product's core thesis — AI reduces documentation effort and surfaces accountabilities automatically*

**Sprint 3 — Visibility & Reporting** *(dashboard + reports)*
Dashboard for Execution Visibility, Weekly Executive Report
→ *Rationale: leadership adoption depends on this; without the "at a glance" view, the platform is invisible to decision-makers*

**Sprint 4 — Full Operational Picture** *(requests + initiatives + search)*
Citizen Requests Tracking, Initiatives Tracking, Semantic Search
→ *Rationale: expands from reactive (meetings/commitments) to proactive (initiatives) and historical (search/memory)*

---

## Open Questions for PRD Author

- **AI provider strategy**: OpenAI, Anthropic, or self-hosted? Cost per summary at scale matters for pricing; data residency matters for trust.
- **Commitment extraction trigger**: should AI extraction run automatically on save, or be manually triggered by the user? (Automatic = less friction; manual = more control for sensitive meetings)
- **Dashboard overdue logic**: how are "overdue" vs. "at risk" vs. "blocked" distinguished — by date alone, or does the assigned user set a blocker flag?
- **Data residency**: do Uruguayan political clients have explicit requirements about where data is stored? (Local vs. cloud matters for public sector)
- **Pricing model**: per seat, per tenant (flat), or freemium with usage limits? This affects onboarding strategy and multi-user dynamics.
- **Multi-language scope**: Spanish-first is clear — but is Portuguese needed for v1 if regional expansion is on the roadmap?
- **Migration path**: how do teams import existing commitments from spreadsheets or past meeting notes? Manual entry is a barrier to initial adoption.
- **Transcript vs. notes**: is the input path primarily typed notes, pasted transcript text, or both? This affects the AI prompt design significantly.

## PRD Author Answers

- **AI provider strategy**: Start with **OpenAI** for the MVP using the cheapest reliable text model available, behind a provider adapter so we can swap later. Do **not** self-host in v0.1. Priority is low cost, low ops burden, and fast iteration. We can add Anthropic as a secondary provider later if needed for better extraction quality on sensitive workflows.

- **Commitment extraction trigger**: **Manual by default**, with the option to enable automatic extraction per workspace later. For political and institutional contexts, users should feel in control of when AI processes a meeting. MVP should optimize trust over magic.

- **Dashboard overdue logic**:
  - **Overdue**: due date passed and status is not completed
  - **At risk**: due within the next 7 days, or manually flagged by the owner as at risk
  - **Blocked**: explicit blocker flag set by the assigned user, optionally with blocker note
  Date alone is not enough for blocked status.

- **Data residency**: For v0.1, assume **cloud hosting is acceptable** for early private-sector or political-team pilots, but architecture should be designed so that storage and deployment can later move to a region-specific or single-tenant setup if required. We should not require local hosting in the MVP.

- **Pricing model**: Start with **per tenant flat pricing** for early pilots, with clear limits on users, storage, and AI usage. This makes sales easier for small teams and avoids friction around seat counting. Later we can evolve to flat base + usage tiers.

- **Multi-language scope**: **Spanish only for v0.1**. Portuguese is not needed yet. Keep the architecture i18n-ready, but do not expand product scope now.

- **Migration path**: MVP should support:
  1. **CSV import** for commitments / initiatives / citizen requests
  2. **Paste notes or transcript text** into a meeting form
  Full migration automation is out of scope for v0.1.

- **Transcript vs. notes**: Support **both**, but optimize first for **typed notes and pasted transcript text**. Audio transcription can be post-MVP or a secondary path. The core AI prompt flow should accept unstructured text input regardless of source.