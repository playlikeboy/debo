# Architecture Decision Records (ADRs)

This directory contains the immutable, numbered Architecture Decision Records governing the Debo platform.
Every major architectural, structural, or infrastructure commitment must be recorded here following our empirical research process.

---

## 1. ADR Lifecycle & Statuses

- **`proposed`**: Under active research, discussion, and stakeholder review.
- **`accepted`**: Approved and adopted as the normative architectural direction for Debo.
- **`superseded`**: Replaced by a newer decision record (must link to the superseding ADR).
- **`rejected`**: Evaluated but rejected based on empirical constraints or scorecard failure.

---

## 2. Decision Index

| Number | Title | Status | Primary Technology / Pattern |
|---|---|---|---|
| [ADR-0001](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0001-repository-strategy.md) | Repository Strategy | `accepted` | Monorepo (Bun Workspaces + Turborepo) |
| [ADR-0002](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0002-language-strategy.md) | Language Strategy | `accepted` | TypeScript Primary + Python Document Worker |
| [ADR-0003](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0003-memory-engine.md) | Memory Engine | `accepted` | Supermemory Core + `MemoryProvider` Abstraction |
| [ADR-0004](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0004-agent-runtime.md) | Agent Runtime | `accepted` | LangGraph JS (Cyclic State Graphs) |
| [ADR-0005](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0005-workflow-runtime.md) | Workflow Runtime | `accepted` | Trigger.dev 4.x (Durable Execution) |
| [ADR-0006](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0006-agent-ui.md) | Agentic UI Layer | `accepted` | AG-UI Protocol + Editorial Component System |
| [ADR-0007](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0007-mcp.md) | Model Context Protocol | `accepted` | Official `@modelcontextprotocol/sdk` (TypeScript) |
| [ADR-0008](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0008-connectors.md) | External Connectors | `accepted` | Composio Actions + Nango Data Sync |
| [ADR-0009](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0009-database.md) | Primary Database | `accepted` | Neon Serverless PostgreSQL + Drizzle ORM |
| [ADR-0010](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0010-storage.md) | Immutable Object Storage | `accepted` | Cloudflare R2 (S3-compatible, Zero Egress) |
| [ADR-0011](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0011-document-processing.md) | Document Processing | `accepted` | Docling Layout & Table Parsing (Python Worker) |
| [ADR-0012](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0012-deployment.md) | Deployment Topology | `accepted` | Hybrid (Vercel Web + Cloudflare Edge + VPS Workers) |
| [ADR-0013](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0013-observability.md) | Observability & Tracing | `accepted` | OpenTelemetry + LangSmith + Sentry |
| [ADR-0014](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0014-security.md) | Security & Permissions | `accepted` | Deterministic Zero-Trust RBAC/ABAC (Non-LLM Authority)|
| [ADR-0015](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0015-multi-tenancy.md) | Multi-Tenancy Hierarchy | `accepted` | User -> Workspace -> Membership Hierarchy |
| [ADR-0016](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0016-better-auth-migration.md) | Identity & Auth Migration | `accepted` | Better Auth + Drizzle Adapter + API Key Plugin |
| [ADR-0017](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0017-billing-plans-and-quotas.md) | Billing Plans & Quotas | `accepted` | Plan Tiers (Free, Pro, Enterprise) & Feature Gating |
