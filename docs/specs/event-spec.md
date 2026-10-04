# Normative Specification: Event Bus & Dispatches

This document is a normative specification using RFC 2119 language.

---

## 1. Event Specification Invariants

1. **Standard Envelope**: All asynchronous system events dispatched across workflows or internal queues MUST conform to the `DeboEvent` envelope schema defined in `docs/workflows/event-model.md`.
2. **Payload Hygiene**: Event payloads MUST NOT contain large binary files, full PDF text dumps, or raw media streams. Payloads MUST pass Cloudflare R2 object keys and entity ULIDs instead.
3. **Idempotency Key Mandatory**: Event producers MUST inject an `idempotencyKey` into every dispatched event. Consumers MUST verify whether an event has already been processed before mutating database records.
4. **Ordering Guarantees**: State mutations on an individual entity (e.g. `source.created`, `source.updated`, `source.deleted`) MUST be processed in causal timestamp order.
