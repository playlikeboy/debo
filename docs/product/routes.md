# Debo Application Route & Page Specifications

This document separates **MVP**, **post-MVP**, **experimental**, and **admin** routes. Only MVP routes are implementation-required for the first product slice.

## 1. MVP — Core Verification Loop

### Public
- `/` — product landing page.
- `/login` — authentication entry.
- `/signup` — account creation.

### Authenticated
- `/app` — personal/workspace home with recent sources, tasks, and quick capture.
- `/app/ask` — source-grounded memory query and answer experience.
- `/app/library` — uploaded source list, processing state, and source viewer entry.
- `/app/journal` — daily text capture.
- `/app/timeline` — chronological view of captured context.
- `/app/settings/profile` — identity/profile settings.
- `/app/settings/security` — session/security settings.
- `/app/settings/privacy` — export, retention, and deletion controls.

MVP screens must define loading, empty, error, mobile, keyboard, and permission states before implementation.

## 2. Post-MVP — Planned Product Expansion

- `/app/brain` — memory graph and relationship exploration.
- `/app/media` — audio/image capture library.
- `/app/people` — relationship directory and context.
- `/app/projects` — project context and progress.
- `/app/decisions` — decision history.
- `/app/tasks` — extracted tasks and follow-ups.
- `/app/inbox` — unprocessed captures.
- `/app/connectors` — connector connections and sync status.
- `/app/workflows` — workflow execution history.
- `/app/settings/connectors` — connection management.
- `/app/settings/memory` — provider/re-index controls.
- `/app/settings/billing` — subscription/billing.

These routes are product backlog, not Phase 1 acceptance criteria.

## 3. Experimental / Later

- `/app/agents` — configurable agent personas.
- `/app/vault` — higher-assurance record handling.
- Additional agentic workspaces require a concrete use case and security model.

## 4. Admin

- `/admin` — internal system health, telemetry, and operational controls.
- Admin access is separate from normal workspace membership.

## 5. Route Design Rules

Every route must have authentication/authorization requirements, data dependencies and source-of-truth ownership, loading/empty/error/denied states, responsive behavior, and audit/observability implications for external or destructive actions.

Avoid creating routes merely because a backend capability exists; routes should correspond to a validated product workflow.
