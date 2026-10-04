# Changelog of Architectural Decisions

This ledger records all formal architectural decisions, status transitions, and structural milestones chronologically.

---

## 2026-10-04 — Phase 0 Clean-Room Baseline Established (`f724e9e32223ea31961142c0df044b4022084031`)

### Clean-Room Reset Executed
- **Action**: Complete removal of legacy application code, obsolete configurations, and deprecated frameworks (Mastra, CopilotKit-only bindings, unstructured API routes).
- **Audit**: Verified working tree clean of legacy implementation code; repository baseline established.

### Architecture Decision Records Formally Accepted
- **ADR-0001 (Repository Strategy)**: Accepted Bun Workspaces + Turborepo monorepo architecture.
- **ADR-0002 (Language Strategy)**: Accepted TypeScript as primary platform language; Python isolated to `apps/document-worker`.
- **ADR-0003 (Memory Engine)**: Accepted Supermemory core wrapped behind `MemoryProvider` contract.
- **ADR-0004 (Agent Runtime)**: Accepted LangGraph JS as compiled cyclic state graph engine.
- **ADR-0005 (Workflow Runtime)**: Accepted Trigger.dev v3 for durable execution and background pipelines.
- **ADR-0006 (Agent UI)**: Accepted AG-UI protocol with custom calm editorial Radix/Tailwind components.
- **ADR-0007 (MCP)**: Accepted official Model Context Protocol TypeScript SDK at `mcp.debo.life`.
- **ADR-0008 (Connectors)**: Accepted Composio for agent actions and Nango for data sync.
- **ADR-0009 (Database)**: Accepted Neon Serverless PostgreSQL with Drizzle ORM.
- **ADR-0010 (Storage)**: Accepted Cloudflare R2 for zero-egress immutable object storage.
- **ADR-0011 (Document Processing)**: Accepted Docling for high-fidelity OCR, table extraction, and bounding boxes.
- **ADR-0012 (Deployment)**: Accepted hybrid deployment (Vercel Web + Cloudflare Edge + VPS Workers).
- **ADR-0013 (Observability)**: Accepted OpenTelemetry + LangSmith + Sentry.
- **ADR-0014 (Security)**: Accepted Deterministic Zero-Trust RBAC/ABAC with Non-LLM Authority invariant.
- **ADR-0015 (Multi-Tenancy)**: Accepted User -> Workspace -> Membership tenant hierarchy.

### Documentation & Skills Baseline
- Installed foundational agent skills: `impeccable` (impeccable design system) and `improve-codebase-architecture`.
- Established master rulebook `AGENTS.md` and normative specifications in `docs/specs/*`.
