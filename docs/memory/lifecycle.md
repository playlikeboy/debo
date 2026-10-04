# Memory Lifecycle Specification

Every piece of context in Debo progresses through a formal, deterministic state machine. This document defines the lifecycle states, transition triggers, and operational behaviors for updates, contradictions, user corrections, and deletions.

---

## 1. Lifecycle State Machine

```text
  [ CAPTURED ]
       │
       ▼
 [ PROCESSED ] ──(Parsing / OCR / Audio Transcription)
       │
       ▼
 [ EXTRACTED ] ──(Entity & Fact Extraction via LangGraph)
       │
       ▼
  [ INDEXED ]  ──(Vector & Keyword Ingestion in Supermemory / PG)
       │
       ▼
   [ ACTIVE ]  ──(Participates in semantic & factual retrieval)
       │
       ├─────────────────────────┬─────────────────────────┐
       ▼                         ▼                         ▼
 [ SUPERSEDED ]            [ ARCHIVED ]               [ DELETED ]
 (Overridden by new fact)  (Excluded from active)     (Purged / Cascaded)
```

### State Definitions

| State | Description | Searchable in Default RAG? | Retained in Historical Queries? |
|---|---|---|---|
| `CAPTURED` | Raw file or text received in Cloudflare R2 / inbox queue. Awaiting worker processing. | No | No |
| `PROCESSED` | Document layout parsed (Docling) or audio transcribed. Structured paragraphs available. | No | No |
| `EXTRACTED` | Discrete atomic claims and entity relationships extracted by agent nodes. | No | No |
| `INDEXED` | Embeddings generated; records written to Neon DB and Supermemory. | Pending activation | No |
| `ACTIVE` | Current, verified ground truth for the user's workspace. | **Yes** | **Yes** |
| `SUPERSEDED` | Former fact that has been invalidated or updated by newer information. | No (unless temporal query) | **Yes** (Auditable past) |
| `ARCHIVED` | Manually hidden or de-emphasized by user; preserved for long-term vault search. | Optional | **Yes** |
| `DELETED` | Soft-deleted or permanently wiped per user command / retention policy. | **Never** | **Never** |

---

## 2. Event Behaviors & Transitions

### A. Contradiction Resolution
1. **Trigger**: An ingested memory contradicts an existing `ACTIVE` memory (e.g., changed address, new job title, revised meeting date).
2. **Action**:
   - The existing memory transitions to `SUPERSEDED`.
   - Its `valid_to` column is updated to the timestamp of the new source.
   - The new memory is created in `ACTIVE` state with `supersedes_id` pointing to the older record.
   - An entry is logged in the `AuditLog`.

### B. User Manual Correction
1. **Trigger**: The user edits or corrects an extracted memory directly in the Debo Web UI.
2. **Action**:
   - The system creates a new memory record with `source_type: 'user_correction'`.
   - The confidence score is pinned to `1.0` (human authoritative ground truth).
   - Any conflicting agent-extracted memories are immediately marked `SUPERSEDED`.

### C. Source File Deletion
1. **Trigger**: The user deletes an original uploaded file or disconnected integration.
2. **Action**:
   - The raw object in Cloudflare R2 is marked for deletion or deleted.
   - All associated document chunks and extracted memories in PostgreSQL have their status set to `DELETED`.
   - The memory engine purges the corresponding vector records via `MemoryProvider.forget()`.
   - Cached query syntheses citing this source are evicted from redis/edge caches.

### D. Workspace / Account Deletion (Right to Be Forgotten)
1. **Trigger**: User requests workspace closure or GDPR erasure.
2. **Action**:
   - Hard deletion job queued in Trigger.dev.
   - All R2 storage objects prefixed with `workspaces/${workspaceId}/` are purged.
   - PostgreSQL cascades delete all records referencing `workspace_id`.
   - External vector records in Supermemory are deleted by tenant ID.
   - External OAuth tokens in Composio/Nango are revoked and removed.
   - Cryptographic deletion certificate written to system logs.
