# Debo Application Route & Page Specifications

This document defines the normative product route tree, data dependencies, access permissions, UI states, and responsive behaviors for `apps/web`.

---

## 1. Marketing & Authentication Routes

### `/` (Landing Page)
- **Purpose**: Public showcase of Debo's vision, architecture, and value proposition.
- **User**: Unauthenticated visitors & search engine bots.
- **Permission**: Public.
- **SEO**: Strict server-rendered metadata, OpenGraph tags, semantic HTML.
- **Mobile/Desktop**: Fully responsive editorial layout with fluid typography.

### `/login` & `/signup`
- **Purpose**: User authentication via Stack Auth (magic link, Google OAuth, password).
- **User**: Unauthenticated users.
- **Permission**: Public (redirects to `/app` if already authenticated).
- **Security**: CSRF token validation; rate-limited brute-force protection.

---

## 2. Core Dashboard Routes (`/app/*`)

### `/app` & `/app/home`
- **Purpose**: Daily personal context dashboard: active projects, upcoming decisions, recent sources, and quick capture bar.
- **User**: Authenticated workspace member.
- **Permission**: `member` or above.
- **Data Required**: Recent 5 sources, pending tasks, recent decisions, unread context alerts.
- **Empty State**: Welcoming onboarding checklist encouraging first file upload or note capture.
- **Agent Interactions**: Quick Ask Debo input bar at top of page.

### `/app/ask`
- **Purpose**: Deep conversational memory retrieval and synthesis interface.
- **Data Required**: Active conversation thread, retrieved citation chunks, agent plan state.
- **Actions**: Ask question, click citation pill to open source viewer, approve/reject suggested action.
- **States**: Skeleton thread loading; streaming token state with real-time citation markers; retryable error toast on provider failure.
- **Mobile**: Full-screen conversation viewport with bottom floating input.

### `/app/brain`
- **Purpose**: Visual and topical map of the workspace memory graph (clusters, topics, entity ties).
- **Data Required**: Memory nodes, tags, cross-entity relationships from `MemoryRelation`.
- **Actions**: Filter by tag, search memory cluster, inspect superseding history.

### `/app/timeline`
- **Purpose**: Chronological stream of life events, meetings, notes, and uploaded records.
- **Data Required**: Episodic events sorted by `valid_from` or `created_at`.
- **Actions**: Date picker jump, filter by source type (audio, PDF, email).

### `/app/library`
- **Purpose**: File repository displaying all uploaded PDFs, documents, books, and archives.
- **Data Required**: `Source` table records, processing status badges, file sizes.
- **Actions**: Drag-and-drop file upload, view parsed markdown, delete source (triggers cascade purge).

### `/app/media`
- **Purpose**: Dedicated gallery for voice recordings, audio memos, and images.
- **Data Required**: `Media` records with waveform data and audio preview links.
- **Actions**: In-browser audio player with interactive transcript synchronization.

### `/app/journal`
- **Purpose**: Distraction-free daily reflective journaling tool.
- **Data Required**: Markdown daily entries keyed by date.
- **Actions**: Auto-saving rich text editor; background Trigger.dev extraction into memory.

### `/app/people`
- **Purpose**: Personal relationship directory (contacts, meeting history, shared context).
- **Data Required**: `Person` entities and linked meeting notes.

### `/app/projects` & `/app/decisions`
- **Purpose**: Tracked initiatives and the formal architectural / personal decision ledger.
- **Data Required**: `Project` records, linked `Decision` logs with alternatives considered.

### `/app/tasks` & `/app/inbox`
- **Purpose**: Extracted action items, follow-ups, and raw unprocessed captures.
- **Data Required**: `Task` records sorted by status and priority.

### `/app/connectors`
- **Purpose**: Third-party integration hub (Google Workspace, Slack, Notion, GitHub).
- **Permission**: `admin` or `owner`.
- **Actions**: Connect OAuth via Composio, trigger sync, view sync status.

### `/app/workflows`
- **Purpose**: Trigger.dev background pipeline monitor and run logs.
- **Permission**: `admin` or `owner`.

### `/app/agents`
- **Purpose**: Configuration for specialized agent personas and custom prompts.

### `/app/vault`
- **Purpose**: Encrypted archive for high-security personal records (contracts, tax docs, credentials).
- **Security**: Optional secondary password or biometric re-authentication.

---

## 3. Settings Routes (`/app/settings/*`)

- `/app/settings/profile`: Display name, email, avatar.
- `/app/settings/security`: Session management, MFA setup, active MCP API keys.
- `/app/settings/privacy`: Data export (ZIP), private mode toggle, complete account deletion.
- `/app/settings/connectors`: OAuth connection statuses, token revocations.
- `/app/settings/memory`: Memory engine selection, vector re-indexing trigger, forgetting rules.
- `/app/settings/billing`: Subscription tier, payment methods (Stripe integration).

---

## 4. Admin Portal (`/admin`)
- **Purpose**: System-wide telemetry, health check statuses, and queue depths.
- **Permission**: System Super-Admin only.
