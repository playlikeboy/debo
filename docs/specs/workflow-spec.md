# Normative Specification: Durable Workflows

This document is a normative specification using RFC 2119 language.

---

## 1. Durable Execution Requirements

1. **Workflow Framework**: All asynchronous, long-running, or retryable background operations MUST be implemented as durable tasks in Trigger.dev v3.
2. **Idempotency**: All workflow tasks MUST accept an `idempotencyKey` and enforce idempotent step execution to ensure safe retries.
3. **Step Atomicity**: Workflows MUST be structured into discrete steps. Heavy external operations (e.g. Docling parsing, vector embedding, database bulk upsert) MUST execute as separate steps to prevent duplicate work during recovery.
4. **Failure Compensation**: If a non-retryable error occurs mid-workflow, the workflow MUST execute compensation logic to clean up partially written storage objects or database records.

---

## 2. Event Sourcing Invariants

- Workflow triggers MUST conform to the `DeboEvent` envelope schema defined in `docs/workflows/event-model.md`.
- Workflow events MUST be logged in the database or Trigger.dev run ledger with correlation tracking (`workflowRunId`, `traceId`).

## 3. Provider Boundary

Debo workflow contracts MUST remain provider-neutral at the domain level. Trigger.dev-specific APIs belong in the workflow adapter/implementation layer so a future migration does not require rewriting business entities or event schemas.
