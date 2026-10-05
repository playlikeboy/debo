# Debo Domain Entity Specifications

This document defines the normative relational specifications for all core entities in the Debo platform.

---

## 1. Identity & Tenancy Entities

### User
- **Purpose**: Global user identity authenticated via Better Auth (email/password or credentials).
- **Identifier**: `usr_<ulid>` (Primary Key)
- **Ownership**: The user owns their global account record.
- **Tenant Scope**: Global (can belong to multiple workspaces).
- **Lifecycle**: `ACTIVE` -> `SUSPENDED` -> `DELETED`.
- **Soft/Hard Delete**: Soft-delete via `deleted_at`; hard-delete purges across all workspaces after 30-day grace period.
- **Indexes**: Unique index on `email`, index on `created_at`.
- **Relationships**: `1:N` with `WorkspaceMember`, `1:N` with `ApiKey`, `1:N` with `AuditLog`.
- **Security**: Password hashes managed by Better Auth with scrypt/bcrypt; email verified flag required.
- **Retention**: Retained until account termination request.

### ApiKey
- **Purpose**: Scoped, unforgeable API keys for MCP clients (Claude Desktop, Cursor), external agents, and background workers.
- **Identifier**: `key_<ulid>` (Primary Key)
- **Ownership**: Scoped strictly to `workspace_id` and owned by `reference_id` (`users.id`).
- **Tenant Scope**: Unconditional `workspace_id`.
- **Security**: Plaintext secret (`debo_live_...`) is displayed only once upon creation; only SHA-256 hash is persisted. Timing-safe comparison. Rate-limited and scoped (`memory.read`, `tools.execute`, `*`).
- **Lifecycle**: `ACTIVE` -> `REVOKED` | `EXPIRED`.

### Workspace
- **Purpose**: The foundational boundary of tenant isolation for data, memory, and permissions.
- **Identifier**: `wsp_<ulid>` (Primary Key)
- **Ownership**: Owned by the creating user (`owner_id`).
- **Tenant Scope**: Root boundary (all child records reference `workspace_id`).
- **Lifecycle**: `PROVISIONING` -> `ACTIVE` -> `SUSPENDED` -> `DELETED`.
- **Soft/Hard Delete**: Soft-delete marks workspace inaccessible; hard-delete cascades to all sources, memories, and files in R2.
- **Indexes**: Unique index on `slug`, index on `owner_id`.
- **Relationships**: `1:N` with all workspace child entities (`Source`, `Memory`, `Member`, etc.).
- **Security**: Complete isolation barrier; cross-workspace queries strictly rejected.
- **Retention**: Retained for the life of the subscription.

### WorkspaceMember
- **Purpose**: Associates a `User` with a `Workspace` and assigns a role.
- **Identifier**: `wmb_<ulid>` (Primary Key)
- **Ownership**: Owned by `Workspace`.
- **Tenant Scope**: Scoped to `workspace_id`.
- **Lifecycle**: `INVITED` -> `ACTIVE` -> `REVOKED`.
- **Soft/Hard Delete**: Soft-delete revokes access immediately.
- **Indexes**: Unique compound index on `(workspace_id, user_id)`.
- **Relationships**: `N:1` with `Workspace`, `N:1` with `User`.
- **Security**: Role enum: `owner`, `admin`, `member`, `viewer`.
- **Retention**: Immutable audit history preserved in `AuditLog`.

### Permission
- **Purpose**: Fine-grained capability assignment (e.g. `memory.read`, `agent.execute`, `source.upload`).
- **Identifier**: `prm_<ulid>` (Primary Key)
- **Ownership**: System-defined enum or workspace role mapping.
- **Tenant Scope**: Scoped to `workspace_id`.
- **Indexes**: Compound index on `(workspace_id, role, action)`.
- **Security**: Deterministically enforced by middleware before tool or route execution.

### Approval
- **Purpose**: Explicit, auditable human-in-the-loop authorization record for high-risk agent actions.
- **Identifier**: `app_<ulid>` (Primary Key)
- **Ownership**: Scoped to `workspace_id` and assigned to `approver_user_id`.
- **Tenant Scope**: Strictly partitioned by `workspace_id`.
- **Lifecycle**: `PENDING` -> `APPROVED` | `REJECTED` | `EXPIRED`.
- **Indexes**: Index on `(workspace_id, status)`, index on `agent_run_id`.
- **Relationships**: `N:1` with `AgentRun`, `N:1` with `ToolCall`.
- **Security**: Signed approval token; expires in 24 hours if unconfirmed.

---

## 2. Ingestion & Storage Entities

### Source
- **Purpose**: The root capture container representing an uploaded file, web clip, voice memo, or sync job.
- **Identifier**: `src_<ulid>` (Primary Key)
- **Ownership**: Scoped to `workspace_id` and created by `user_id`.
- **Tenant Scope**: Unconditional `workspace_id`.
- **Lifecycle**: `PENDING` -> `PROCESSING` -> `INDEXED` -> `FAILED` -> `DELETED`.
- **Soft/Hard Delete**: Soft-delete hides from search; hard-delete purges file from Cloudflare R2 and triggers `MemoryProvider.forget()`.
- **Indexes**: Index on `(workspace_id, status)`, index on `(workspace_id, source_type)`.
- **Relationships**: `1:N` with `Document`, `1:N` with `Media`.

### Document
- **Purpose**: Structured representation of parsed text, sections, and reading order (Docling output).
- **Identifier**: `doc_<ulid>` (Primary Key)
- **Ownership**: Child of `Source`.
- **Tenant Scope**: Scoped to `workspace_id`.
- **Lifecycle**: Mirrors parent `Source`.
- **Indexes**: Index on `source_id`, index on `workspace_id`.
- **Relationships**: `N:1` with `Source`, `1:N` with `Memory` (chunks).

### Media
- **Purpose**: Audio recordings, video snippets, or images attached to notes or sources in R2.
- **Identifier**: `med_<ulid>` (Primary Key)
- **Ownership**: Scoped to `workspace_id`.
- **Tenant Scope**: Scoped to `workspace_id`.
- **Lifecycle**: Stored immutably; deleted when parent `Source` is deleted.
- **Relationships**: `N:1` with `Source`.

---

## 3. Memory & Context Entities

### Memory
- **Purpose**: An atomic extracted fact, episodic event, or indexed text chunk.
- **Identifier**: `mem_<ulid>` (Primary Key)
- **Ownership**: Scoped to `workspace_id`.
- **Tenant Scope**: Unconditional `workspace_id`.
- **Lifecycle**: `CAPTURED` -> `INDEXED` -> `ACTIVE` -> `SUPERSEDED` -> `ARCHIVED` -> `DELETED`.
- **Soft/Hard Delete**: Soft-delete updates status; hard-delete removes from vector store.
- **Indexes**: Index on `(workspace_id, status)`, index on `(workspace_id, valid_from, valid_to)`, index on `chunk_id`.
- **Relationships**: `N:1` with `Document`, `1:N` with `MemoryRelation`, `1:N` with `Citation`.

### MemoryRelation
- **Purpose**: Directed relationship edge linking two memories or entities (e.g. `Person` WORKS_AT `Company`).
- **Identifier**: `mrl_<ulid>` (Primary Key)
- **Ownership**: Scoped to `workspace_id`.
- **Indexes**: Compound index on `(workspace_id, source_memory_id, target_memory_id)`.
- **Relationships**: References two `Memory` or `Entity` records.

### Entity
- **Purpose**: Canonical named entity resolved from context (Person, Organization, Tool, Concept).
- **Identifier**: `ent_<ulid>` (Primary Key)
- **Ownership**: Scoped to `workspace_id`.
- **Indexes**: Index on `(workspace_id, type, canonical_name)`.

### Person
- **Purpose**: Enriched profile of an individual in the user's life (contact details, relationship, history).
- **Identifier**: `per_<ulid>` (Primary Key)
- **Ownership**: Scoped to `workspace_id`.
- **Relationships**: Sub-type of `Entity`, linked to `Memory` records.

### Project
- **Purpose**: A tracked initiative, goal, or client engagement with context and active tasks.
- **Identifier**: `prj_<ulid>` (Primary Key)
- **Ownership**: Scoped to `workspace_id`.
- **Relationships**: `1:N` with `Task`, `1:N` with `Decision`.

### Decision
- **Purpose**: An explicit architectural, personal, or business decision with rationale and date.
- **Identifier**: `dec_<ulid>` (Primary Key)
- **Ownership**: Scoped to `workspace_id`.
- **Relationships**: `N:1` with `Project`, `1:N` with `Citation`.

### Citation
- **Purpose**: Grounding provenance record linking an agent claim to an exact source chunk and coordinate.
- **Identifier**: `cit_<ulid>` (Primary Key)
- **Ownership**: Scoped to `workspace_id`.
- **Indexes**: Index on `(workspace_id, chunk_id)`.

---

## 4. Execution & Workflow Entities

### Conversation
- **Purpose**: A user chat session or thread containing messages, citations, and agent runs.
- **Identifier**: `cnv_<ulid>` (Primary Key)
- **Ownership**: Scoped to `workspace_id` and `user_id`.
- **Relationships**: `1:N` with `AgentRun`.

### Agent
- **Purpose**: Definition and configuration of an agent persona (e.g. `Ask Debo`, `Researcher`, `Summarizer`).
- **Identifier**: `agt_<ulid>` (Primary Key)
- **Ownership**: System default or workspace custom agent.

### AgentRun
- **Purpose**: A stateful execution instance of a LangGraph graph.
- **Identifier**: `run_<ulid>` (Primary Key)
- **Relationships**: `1:N` with `ToolCall`, `N:1` with `Conversation`.

### ToolCall
- **Purpose**: Record of an individual tool invocation attempted by an agent, with arguments and result.
- **Identifier**: `tcl_<ulid>` (Primary Key)
- **Relationships**: `N:1` with `AgentRun`, `1:1` with `Approval` if gated.

### Task
- **Purpose**: An actionable todo or follow-up extracted by an agent or created by a user.
- **Identifier**: `tsk_<ulid>` (Primary Key)
- **Lifecycle**: `TODO` -> `IN_PROGRESS` -> `COMPLETED` -> `CANCELLED`.

### Connection
- **Purpose**: An authorized third-party integration instance (e.g. "User's Google Account" via Composio).
- **Identifier**: `con_<ulid>` (Primary Key)
- **Security**: Tokens managed externally; stores connection state and external account ID.

### Connector
- **Purpose**: Definition of a supported integration service (e.g. `google-calendar`, `slack`, `github`).
- **Identifier**: `cnt_<ulid>` (Primary Key)

### Workflow
- **Purpose**: A registered Trigger.dev workflow pipeline definition.
- **Identifier**: `wfl_<ulid>` (Primary Key)

### WorkflowRun
- **Purpose**: Execution instance of a background workflow with logs, duration, and status.
- **Identifier**: `wfr_<ulid>` (Primary Key)

### AuditLog
- **Purpose**: Immutable, append-only security log capturing all actor actions and tool executions.
- **Identifier**: `aud_<ulid>` (Primary Key)
- **Tenant Scope**: Partitioned by `workspace_id`.
- **Retention**: Immutable 365-day minimum retention.
