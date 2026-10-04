# Inngest

## Problem solved
Serverless event-driven queue and durable workflow engine that enables developers to write step functions with automatic retries, sleep delays, concurrency throttling, and fan-out without managing queues.

## Why considered
Inngest is the main alternative to Trigger.dev, offering deep serverless compatibility, zero-infrastructure deployment to Vercel/Next.js routes, and an intuitive `step.run()` model.

## Official repository
`https://github.com/inngest/inngest`

## Official documentation
`https://www.inngest.com/docs`

## Current version/date checked
v3.x / Checked October 2026

## License
Apache 2.0 (SDKs) / BSL / Managed Cloud.

## Deployment models
Managed Inngest Cloud syncing with serverless Next.js HTTP routes; self-hosted Inngest Dev Server / Core.

## TypeScript support
Outstanding first-class TypeScript SDK with automatic event schema validation (Zod).

## Python support
Official Python SDK available (`inngest`).

## MCP support
Compatible via standard tool dispatching.

## Agent framework support
Provides agent workflow primitives (`inngest/agent`).

## Workflow support
Core capability: fan-out, fan-in, batching, debounce, rate limiting, and durable steps.

## Self-hosting
Local dev server is open source; full self-hosting of the production coordination engine has licensing constraints (BSL/enterprise).

## Docker
Official Docker images for local dev server.

## Authentication
Signing keys and event encryption keys.

## Multi-tenancy
Event schemas can include multi-tenant IDs; concurrency keys support per-tenant queuing.

## Security
Strong signature verification on webhook invocations; payload encryption supported.

## Observability
Comprehensive web dashboard with step execution trees and event tracing.

## Strengths
- Operates entirely over standard HTTP/serverless endpoints without persistent worker servers.
- Extremely mature concurrency, throttling, and debouncing primitives.
- First-class TypeScript SDK and event-driven architecture.

## Weaknesses
- Long-running execution relies on dividing tasks into sub-step HTTP round-trips; can run into memory limits on heavy document parsing.
- Self-hosting licensing is less permissive than Trigger.dev's pure Apache 2.0 approach.
- Real-time streaming to frontend clients is less direct than Trigger.dev v3.

## Alternatives considered
Trigger.dev v3 (Primary), Temporal, BullMQ.

## Benchmark evidence
Capable of orchestrating millions of events per day across serverless endpoints.

## Cost considerations
Generous free tier (25,000 steps/mo); paid plans start at $75/mo.

## Exit strategy
Standard event payloads and TypeScript functions can be translated to alternative workflow runtimes.

## Recommendation
**Accepted as Tier-1 Alternative**. Kept as a validated fallback if deployment constraints prevent running Trigger.dev worker infrastructure.

## Confidence
High (4.5 / 5.0)

## Sources
- Official repository: https://github.com/inngest/inngest
- Documentation: https://www.inngest.com/docs
- npm package: `inngest`
