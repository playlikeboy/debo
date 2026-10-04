# Trigger.dev v3

## Problem solved
Developer-first durable execution and background job framework for TypeScript, supporting long-running tasks, infinite timeouts, real-time log and state streaming, automatic retries, and scheduled crons with zero infrastructure management.

## Why considered
Debo performs complex, long-running asynchronous tasks: document ingestion, PDF OCR layout extraction, audio transcription chunking, vector embedding, and periodic memory consolidation. Serverless Next.js API routes time out after 15-60 seconds and cannot support these workloads reliably.

## Official repository
`https://github.com/triggerdotdev/trigger.dev`

## Official documentation
`https://trigger.dev/docs`

## Current version/date checked
v3.x / Checked October 2026

## License
Apache 2.0.

## Deployment models
Trigger.dev Cloud (managed execution) or self-hosted Docker / Kubernetes cluster.

## TypeScript support
Native, TypeScript-first design. Full end-to-end type safety between task definitions and client callers.

## Python support
Task runner supports polyglot execution; Python scripts can be spawned or called via container tasks.

## MCP support
Trigger.dev tasks can expose or consume MCP tool calls cleanly.

## Agent framework support
Ideal for hosting long-running LangGraph runs that require durable checkpointing across network boundaries.

## Workflow support
Core domain: durable step execution, concurrency controls, rate limits, and failure compensation.

## Self-hosting
Complete self-hosting guide using Docker Compose, PostgreSQL, and Redis.

## Docker
Official Docker images and self-hosted templates maintained by the core team.

## Authentication
Project API keys with environment separation (development, staging, production).

## Multi-tenancy
Supports task metadata tagging (`workspaceId`, `userId`) and queue concurrency limits per tenant.

## Security
Encrypted payloads, isolated task execution sandboxes, and secure secret injection.

## Observability
World-class developer UI showing real-time console output, execution spans, retries, and duration breakdowns.

## Strengths
- Code-first TypeScript syntax (write ordinary async functions; Trigger makes them durable).
- Real-time streaming output to the web UI via SDK subscriptions.
- Exceptional local development CLI (`trigger.dev dev`) that tunnels tasks seamlessly.
- Handles long-running multi-minute workloads without Lambda/Vercel timeout limits.

## Weaknesses
- Self-hosting v3 requires operating several backend services (PostgreSQL, Redis, ClickHouse for logs).
- Cloud pricing transitions to compute-second billing for heavy long-running workers.

## Alternatives considered
Inngest (very strong, step-function model), Temporal (extreme operational overhead for a small team), BullMQ (no native durable step semantics).

## Benchmark evidence
Sub-50ms trigger dispatch latency; handles thousands of concurrent background jobs with automatic backpressure.

## Cost considerations
Free tier provides 50,000 runs/month; Pro tier starts at $50/mo. Self-hosting cost depends on VPS sizing (~$20-40/mo).

## Exit strategy
Because task definitions are standard TypeScript functions, tasks can be refactored to standard worker queues (BullMQ/PgBoss) with minimal logic rewrites.

## Recommendation
**Accepted as Primary Durable Workflow Runtime** for Debo. All document ingestion, memory indexing, and background worker jobs must run via Trigger.dev v3.

## Confidence
Very High (4.8 / 5.0)

## Sources
- Official repository: https://github.com/triggerdotdev/trigger.dev
- Documentation: https://trigger.dev/docs
- npm package: `@trigger.dev/sdk`
