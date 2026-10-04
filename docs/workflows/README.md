# Debo Durable Workflows Architecture

Debo relies on **Trigger.dev v3** (`@debo/workflows`) to execute long-running, asynchronous, and failure-tolerant business processes.

---

## 1. Durable Execution Topology

```text
Event Emitted (e.g. `source.created`)
                 │
                 ▼
     ┌──────────────────────┐
     │ Trigger.dev Engine   │
     └──────────┬───────────┘
                │
       ┌────────┴────────┐
       ▼                 ▼
[ Ingestion Task ] [ Sync Task ]
(Parse, Chunk, Embed) (Nango / Composio)
       │                 │
       ▼                 ▼
[ Python Worker ] [ Supermemory ]
 (Docling OCR)     (Vector Index)
```

### Key Workflow Capabilities:
1. **Infinite Execution Duration**: Eliminates serverless timeout constraints for multi-hour file ingestions.
2. **Durable Steps**: If Step 3 of a 5-step workflow fails (e.g. temporary vector database rate limit), Trigger.dev retries Step 3 without repeating Steps 1 and 2.
3. **Real-time Client Subscriptions**: The web client (`apps/web`) subscribes to workflow task progress via Trigger.dev SDK streaming channels.

---

## 2. Directory Index

- **[Application Event Model](file:///home/kunalkashyap8024/sop/debo/docs/workflows/event-model.md)**:
  Full catalog of all platform events, payload schemas, producers, consumers, and idempotency guarantees.
