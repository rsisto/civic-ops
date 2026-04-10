# PRD — civic-ops v0.2
_Last updated: 2026-04-10 | Owner: RS | Source: /strategy → approved_

---

## Problem

Political and institutional teams in Uruguay are operationally strong at agenda-setting and communication but consistently weak at execution follow-through. Meetings, commitments, citizen requests, and internal initiatives are tracked manually across WhatsApp threads, shared docs, and personal spreadsheets — creating poor follow-up, low accountability, and loss of institutional memory. Critical items fall through the cracks when responsibilities shift, and leadership has no reliable view of what is at risk without manually chasing updates.

## Goal

Build a political operations platform that transforms meetings, commitments, requests, and initiatives into a clear, auditable execution workflow for teams in Uruguay.

## Value Proposition

For political and institutional teams in Uruguay who struggle with execution follow-through, **Civic Ops** is an operational accountability platform that transforms meetings, commitments, and citizen requests into a clear, auditable workflow — unlike spreadsheets and chats which offer no ownership tracking, no structured follow-up, and no searchable institutional memory.

---

## Target Users

| User | Job to be done | Pain today |
|---|---|---|
| Chief of staff / coordinator | Ensure every commitment from every meeting is assigned, tracked, and closed | Manually follows up via WhatsApp; items fall through when responsibilities shift |
| Advisor / analyst | Turn meeting notes into structured next steps without duplicating effort | Re-reads notes, extracts items manually, no standardized format |
| Legislator / director (leadership) | Get a reliable weekly picture of what's done, pending, and at risk | Either gets no summary or receives manually assembled slide decks |
| Citizen-facing staff | Log, classify, assign, and follow up on constituent requests | Requests arrive via WhatsApp/email, are written on sticky notes, rarely tracked to closure |
| New team member | Understand past decisions and context quickly | No institutional memory — depends on asking colleagues or hunting through chats |

**Primary segments:** Legislative office teams (senators, deputies, advisors, chiefs of staff), municipal and local government teams, political sector coordination teams, institutional advisory teams, small public-facing teams that need follow-up and reporting discipline.

---

## Features

### Must Have — MVP (core loop; no product value without these)

- [ ] **Meeting Registry and Notes Capture**: Given a team member has a meeting, when they create or upload meeting notes, then the meeting is stored with participants, date, topics, and source material.
- [ ] **AI Meeting Summaries**: Given a meeting has notes or transcript text, when the user requests a summary, then the system generates a concise structured summary with key topics, decisions, and next steps.
- [ ] **Commitment Extraction**: Given a meeting summary or note set, when AI processing runs, then the system extracts commitments, proposed owners, due dates, and possible blockers for user review and confirmation.
- [ ] **Task and Follow-up Workflow**: Given a commitment or request exists, when a responsible person is assigned, then the item enters a visible workflow with status, due date, and update history.
- [ ] **Dashboard for Execution Visibility**: Given there are active commitments and tasks, when a user opens the dashboard, then they see overdue items, blockers, items due soon, and progress by owner or team.
- [ ] **Audit Trail**: Given a record is created, edited, reassigned, or completed, when the action is saved, then the system logs who changed what and when.
- [ ] **Role-Based Access Control (RBAC)**: Given different team roles exist, when users access the platform, then permissions are restricted by role and tenant.
- [ ] **Multi-Tenant Workspace Isolation**: Given multiple political or institutional teams use the system, when data is stored and queried, then each tenant's information remains isolated.

### Should Have — important but not MVP-blocking

- [ ] **Initiatives Tracking**: Given a team is managing projects, policies, or workstreams, when users create or update initiatives, then they can track status, priority, owners, deadlines, and related commitments.
- [ ] **Citizen Requests Tracking**: Given a team receives requests from citizens, organizations, or territory contacts, when users log those requests, then they can classify, assign, prioritize, and follow up on them.
- [ ] **Weekly Executive Report**: Given a reporting period has ended, when the user generates a weekly report, then the system produces a leadership-ready summary of completed work, pending items, blockers, and risks.
- [ ] **Semantic Search**: Given the organization has meetings, commitments, requests, and initiatives stored, when a user searches in natural language, then the system retrieves relevant records and related context.

### Could Have — v2 and beyond

- [ ] **Audio Transcription Pipeline**: Given users upload audio recordings, when processing completes, then the system generates transcript text for summaries and extraction.
- [ ] **WhatsApp / Email Intake**: Given a team receives requests via messaging or email, when integrations are enabled, then incoming messages can become tracked requests automatically.
- [ ] **Territory / Region Tagging**: Given requests come from different neighborhoods or departments, when users classify them, then the system can surface trends by geography.
- [ ] **Shared Templates for Reports and Minutes**: Given teams repeat the same formats, when they create a report or note, then they can start from reusable templates.
- [ ] **Notifications and Reminders**: Given items are due or blocked, when deadlines approach, then the system notifies assigned users.
- [ ] **Document Repository**: Given supporting files exist, when users attach documents, then those files become part of the searchable institutional memory.

### Won't Have

- Voter persuasion engine — ethically sensitive, out of scope for v0.1
- Campaign ad generation — not part of the execution-first strategy
- Psychographic profiling — not aligned with the product purpose
- Fundraising workflows — separate domain
- Public social media publishing tools — not required for MVP
- Full electoral CRM — too broad for v1
- Automated political decision-making — the system assists execution, it does not replace leadership judgment

---

## Recommended Implementation Order

| Sprint | Epics | Rationale |
|---|---|---|
| 1 | Auth + RBAC + Multi-Tenant + Meeting Registry + Notes Capture | Foundation — nothing works without secure tenancy; meetings are the primary data source |
| 2 | AI Summaries + Commitment Extraction + Task Workflow + Audit Trail | Core value loop — AI reduces documentation friction and surfaces accountability automatically |
| 3 | Dashboard + Weekly Executive Report | Leadership adoption — without the at-a-glance view the platform is invisible to decision-makers |
| 4 | Citizen Requests + Initiatives + Semantic Search | Full operational picture — expands from reactive (meetings) to proactive (initiatives) and historical (search) |

---

## Success Criteria

- Teams can register meetings, commitments, and requests in a single workspace
- Leadership can review weekly status without manually chasing updates
- Users can identify overdue and blocked items in under 2 minutes
- AI summaries reduce the time needed to document meetings
- No critical information is lost when responsibilities move between team members

---

## Non-Functional Requirements

- Spanish-first user experience
- Clean, simple interface for non-technical users
- Secure authentication and tenant isolation
- Full auditability for key operational changes
- Search performance good enough for daily operational use
- Architecture ready for future integrations and AI workflows

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| User resistance to structured data entry | High | High | AI does the heavy lifting — minimize manual fields; auto-extract from free-text notes |
| AI extraction quality (hallucinations, missed items) | Medium | High | Always require human review before commitments are saved; show confidence signals |
| Ambiguous ownership in political environments | High | Medium | Allow multiple owners and "pending assignment" state; surface unassigned items on dashboard |
| Privacy expectations and data sensitivity | Medium | High | Tenant isolation, RBAC, and audit trail as table stakes from day one |
| Scope creep into CRM / campaign territory | High | Medium | Enforce hard "won't have" list; evaluate each request against the execution-first mission |
| Low adoption if workflow feels heavy | High | High | Onboard with one pilot team for 2 weeks before v1 launch; cut any feature that doesn't earn its friction |

---

## Open Questions (pre-sprint decisions needed)

- **AI provider strategy**: OpenAI, Anthropic, or self-hosted? Cost per summary at scale matters for pricing; data residency matters for political client trust.
- **Commitment extraction trigger**: auto-on-save vs. user-triggered? (Automatic = less friction; manual = more control for sensitive meetings)
- **Dashboard overdue logic**: "overdue" vs. "at risk" vs. "blocked" — by date alone, or does the assigned user set a blocker flag?
- **Data residency**: do Uruguayan political clients have explicit requirements about where data is stored?
- **Pricing model**: per seat, per tenant (flat), or freemium with usage limits?
- **Multi-language scope**: Spanish-first is clear — Portuguese needed for v1 if regional expansion is on roadmap?
- **Migration path**: how do teams import existing commitments from spreadsheets or past meeting notes?
- **Input path**: primarily typed notes, pasted transcript text, or both? Affects AI prompt design significantly.

---

## Assumptions

- Initial customers are small to mid-sized Uruguayan political or institutional teams
- The main early pain is execution and follow-up, not campaigning
- Users will accept AI assistance if outputs remain reviewable and auditable
- MVP adoption depends on simplicity more than feature breadth
