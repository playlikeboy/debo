# Application Event Model & Catalog

Debo's asynchronous subsystems communicate via an explicit, typed event model. This document defines the event naming conventions, producers, consumers, and idempotency guarantees.

---

## 1. Event Envelope Specification

All events dispatched across Trigger.dev workflows conform to the standard envelope:

```typescript
export interface DeboEvent<T = Record<string, unknown>> {
  eventId: string; // evt_<ulid>
  name: string; // e.g. 'source.created'
  workspaceId: string;
  userId?: string;
  timestamp: string; // ISO 8601
  idempotencyKey: string;
  payload: T;
}
```

---

## 2. Event Catalog

### Ingestion & Documents
- **`source.created`**:
  - *Producer*: Web upload route / Mobile app.
  - *Consumer*: Trigger.dev ingestion dispatcher.
  - *Payload*: `{ sourceId, storageKey, mimeType, byteSize }`.
  - *Idempotency*: Keyed on `sourceId`. Retries: Exponential backoff (max 5).
- **`source.updated`**:
  - *Producer*: User edits title or tags.
  - *Consumer*: Search index updater.
- **`source.deleted`**:
  - *Producer*: User deletion request.
  - *Consumer*: Cleanup task (R2 purge, vector forget, chunk invalidation).
- **`document.uploaded`**:
  - *Producer*: Raw file confirmed stored in Cloudflare R2.
  - *Consumer*: Docling dispatch task.
- **`document.processed`**:
  - *Producer*: `apps/document-worker` (Docling).
  - *Consumer*: Chunking & Embedding task in `@debo/memory`.
  - *Payload*: `{ documentId, pageCount, markdownKey, boundingBoxesKey }`.

### Memory Subsystem
- **`memory.created`**:
  - *Producer*: Agent extraction node or direct user note.
  - *Consumer*: Vector indexer (Supermemory) & entity resolver.
- **`memory.updated`**:
  - *Producer*: User correction or newer contradicting source.
  - *Consumer*: Memory graph updater (applies `SUPERSEDED` state).
- **`memory.deleted`**:
  - *Producer*: `debo_forget_memory` tool or source deletion.
  - *Consumer*: Vector index purge handler.

### Connectors & Actions
- **`connector.connected`**:
  - *Producer*: OAuth completion callback from Composio/Nango.
  - *Consumer*: Initial sync job.
- **`connector.disconnected`**:
  - *Producer*: User clicks Disconnect.
  - *Consumer*: Token revocation & cleanup task.
- **`connector.sync.requested`**:
  - *Producer*: User triggers manual sync or scheduled cron fires.
  - *Consumer*: Sync runner task.
- **`connector.sync.completed`**:
  - *Producer*: Sync runner finishes.
  - *Consumer*: Timeline updater & audit logger.

### Agents & Execution
- **`agent.started`**:
  - *Producer*: LangGraph runtime initialization.
  - *Consumer*: UI streaming channel & LangSmith tracer.
- **`agent.completed`**:
  - *Producer*: Graph reaches `END` node.
  - *Consumer*: Conversation thread updater.
- **`agent.failed`**:
  - *Producer*: Unhandled node error or timeout.
  - *Consumer*: Error notifier & Sentry reporter.

### Approvals
- **`approval.requested`**:
  - *Producer*: Agent triggers `interrupt()` on Tier 2/3 action.
  - *Consumer*: AG-UI confirmation card emitter.
- **`approval.approved`**:
  - *Producer*: User clicks "Approve" with valid signature.
  - *Consumer*: LangGraph resumption task.
- **`approval.rejected`**:
  - *Producer*: User clicks "Reject".
  - *Consumer*: LangGraph cancellation node.

### Workflows
- **`workflow.started`**:
  - *Producer*: Trigger.dev worker starts task execution.
  - *Consumer*: UI status indicator.
- **`workflow.completed`**:
  - *Producer*: Task finishes all steps successfully.
  - *Consumer*: Notification dispatcher.
- **`workflow.failed`**:
  - *Producer*: Task exhausts all retries.
  - *Consumer*: Operational alert system.
