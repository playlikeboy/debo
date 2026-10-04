# Status
accepted

# Context
Background processing in Debo involves asynchronous, potentially multi-minute tasks: parsing 100-page PDF documents via Docling, transcribing hours of audio files, syncing thousands of emails or Notion pages via connectors, and periodic memory consolidation. Running these workloads inside Next.js serverless route handlers causes timeouts, lost tasks, and severe memory exhaustion. We need a durable execution engine.

# Decision
We adopt **Trigger.dev v3** as Debo's primary durable execution and background task engine, organized within `@debo/workflows`.
Tasks are defined as code-first TypeScript background jobs with automatic retries, concurrency limits, real-time streaming, and arbitrary execution duration.

# Alternatives
1. **Inngest**: Evaluated as the top runner-up (Score 4.55/5.0). Excellent HTTP step function engine, but Trigger.dev v3 provides superior local tunneling, real-time client streaming, and more straightforward long-running compute execution.
2. **Temporal**: Enterprise-grade durable execution, but the operational complexity of deploying and managing Temporal Server, Elasticsearch, and Cassandra/PostgreSQL is prohibitive for Debo's current stage.
3. **BullMQ / Redis**: Requires operating persistent Redis clusters and manually managing lock timeouts, retries, and checkpointing logic.

# Why
Trigger.dev v3 combines code-first TypeScript simplicity with serverless longevity. A task can run for 30 minutes without timeout issues, stream status logs back to the frontend in real-time, and run locally with a single CLI command (`npx trigger.dev@latest dev`).

# Consequences
- **Positive**: Zero risk of serverless route timeouts; tasks can be retried automatically from failure points; end-to-end type safety between task invocation and task definitions.
- **Negative**: Adds a development service dependency; requires operating Trigger.dev cloud or self-hosted backend.

# Migration / Exit Strategy
Trigger tasks are modular functions wrapped in `task({ id, run: async (payload) => ... })`. The business logic inside `run` is standard TypeScript and can be easily re-targeted to Inngest or BullMQ if needed.

# Evidence
- Trigger.dev v3 Documentation: `https://trigger.dev/docs`
- Detailed evaluation: `docs/research/trigger-dev.md` and `docs/research/scorecard.md`.
