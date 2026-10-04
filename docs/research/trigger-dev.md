# Trigger.dev 4.x

## Problem solved

Durable background execution for TypeScript applications: long-running tasks, retries, scheduling, concurrency controls, real-time run visibility, and durable waits without relying on short-lived web-request execution.

## Why considered

Debo needs durable execution for ingestion, document-processing dispatch, transcription, connector synchronization, memory consolidation, and other jobs that should survive client disconnects, redeploys, and transient failures.

## Current evidence

- **Observed current release:** Trigger.dev **v4.6.4**, from the official changelog checked on 2026-10-04.
- **v4 status:** Trigger.dev v4 reached general availability in August 2025.
- **v3 status:** Trigger.dev v3 is no longer supported in v4.5.4+, so Debo does not target v3.
- **Pricing observed:** Free $0/month with $5 monthly credits; Hobby $10/month with $10 monthly credits; Pro $50/month with $50 monthly credits. Treat pricing as vendor-reported and re-check before purchase decisions.
- **Self-hosting:** Official self-hosted Docker releases exist; exact infrastructure requirements must be verified during Phase 1 before committing to an operating model.

## Deployment model

Debo will use Trigger.dev as the durable execution layer. Exact package and runtime versions are pinned during Phase 1 after an implementation spike.

## TypeScript / runtime fit

Trigger.dev is TypeScript-first. Debo keeps domain workflow contracts separate from provider SDK calls so a future workflow engine migration remains possible.

## Security / tenancy

Debo must not rely on workflow metadata as the sole authorization boundary. Every task receives and verifies Debo tenant context, and secrets remain in the platform's secret-management layer.

## Strengths

- Strong fit for long-running TypeScript workflows.
- v4 includes durable waits and expanded AI-agent support.
- Managed cloud reduces early operational burden.
- Dev-branch workflows help parallel development.

## Weaknesses / risks

- Provider-specific workflow primitives can create coupling.
- Cloud pricing must be modelled against real Debo workloads.
- Self-hosting increases operational responsibility.

## Alternatives considered

- **Inngest:** strong event/function model and credible alternative.
- **Temporal:** highly capable but operationally heavier for Debo's initial deployment.
- **BullMQ / pg-boss:** useful lower-level queue options, but require Debo to own more orchestration semantics.

## Benchmark status

**No Debo-run performance benchmark is claimed here.** Vendor latency, throughput, and concurrency figures remain vendor-reported until reproduced in the Debo environment.

## Recommendation

**Accepted as the primary durable workflow platform**, with exact version pinning and provider-neutral internal workflow contracts completed during implementation.

## Sources

- https://trigger.dev/docs
- https://trigger.dev/pricing
- https://trigger.dev/changelog/trigger-v4-ga
- https://trigger.dev/changelog/v4-5-4
- https://trigger.dev/changelog/v4-6-4
