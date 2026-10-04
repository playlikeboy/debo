# Debo Data Model & Persistence Architecture

This directory defines the normative relational entity specifications, lifecycle behaviors, multi-tenancy rules, and audit logging models for the Debo platform.

---

## 1. Relational Authority & Data Partitioning

Debo's business state is stored in **Neon Serverless PostgreSQL** and defined using **Drizzle ORM** in `@debo/db`.

### Core Data Principles:
1. **Unconditional Workspace Scoping**: With the exception of global authentication credentials (`User`), every table in Debo contains a mandatory foreign key `workspace_id`.
2. **ULID Identifiers**: All entities use 26-character universally unique, lexicographically sortable identifiers (ULIDs) prefixed by entity type (e.g. `usr_...`, `wsp_...`, `src_...`, `mem_...`).
3. **Soft Delete by Default**: All user-facing context records support `deleted_at` timestamps for safe undo and compliance auditing. Hard deletes are reserved for GDPR/CCPA erasure cascades.
4. **Audit Trail Immutability**: Actions executed by agents, connectors, or users produce append-only rows in the `AuditLog` table.

---

## 2. Entity Specifications Index

- **[Core Entity Specifications](file:///home/kunalkashyap8024/sop/debo/docs/data-model/entities.md)**:
  Detailed schema definitions for all 24 platform entities:
  - Identity & Access: `User`, `Workspace`, `WorkspaceMember`, `Permission`, `Approval`
  - Ingestion & Storage: `Source`, `Document`, `Media`
  - Memory & Context: `Memory`, `MemoryRelation`, `Entity`, `Person`, `Project`, `Decision`, `Citation`
  - Execution & Agents: `Conversation`, `Agent`, `AgentRun`, `ToolCall`, `Task`
  - Connectors & Workflows: `Connection`, `Connector`, `Workflow`, `WorkflowRun`
  - Auditing: `AuditLog`
- **[Tenancy Model & Boundary Isolation](file:///home/kunalkashyap8024/sop/debo/docs/data-model/tenancy.md)**:
  Personal vs. team workspaces, permissions hierarchy, visibility rules.
- **[Immutable Audit Event Model](file:///home/kunalkashyap8024/sop/debo/docs/data-model/audit-log.md)**:
  Zero-trust event logging schema and retention guidelines.
