# Debo Engineering Roadmap (Phases 0 — 16)

This document outlines the sequential engineering phases leading from clean-room documentation to public launch.

---

## Roadmap Phases Overview

```text
Phase 0  ── Clean-Room Documentation & Architecture (CURRENT)
   │
Phase 1  ── Monorepo Tooling & Repository Bootstrap
   │
Phase 2  ── Identity, Tenancy & Deterministic Auth
   │
Phase 3  ── Source Ingestion & Cloudflare R2 Storage
   │
Phase 4  ── Memory Engine Integration & Grounding Evals
   │
Phase 5  ── LangGraph Agent Orchestration
   │
Phase 6  ── AG-UI Protocol & Editorial Presentation
   │
Phase 7  ── External Connectors (Composio / Nango)
   │
Phase 8  ── Durable Workflows (Trigger.dev 4.x)
   │
Phase 9  ── Model Context Protocol (MCP) Server
   │
Phase 10 ── MCP Apps & Interactive Host Frames
   │
Phase 11 ── Portable Agent Skills Publishing
   │
Phase 12 ── Document Processing Worker (Python + Docling)
   │
Phase 13 ── Browser Automation Fallback (Stagehand)
   │
Phase 14 ── Security Hardening & Observability (LangSmith / OTel)
   │
Phase 15 ── Beta Release (Closed Community)
   │
Phase 16 ── Public Launch
```

---

## Phase Schedule & Focus

- **Phase 0 — Clean-Room Documentation (Current)**:
  - Deliverable: Comprehensive architecture, research scorecards, ADRs 0001-0015, normative specs, domain data models, and ticket backlog.
  - Zero application code written.
- **Phase 1 — Repository Bootstrap**:
  - Deliverable: Bun workspaces, Turborepo setup, TypeScript project configs, Biome linter, initial GitHub CI.
- **Phase 2 — Identity & Tenancy**:
  - Deliverable: Better Auth integration with Drizzle adapter and @better-auth/api-key plugin, `User`, `Workspace`, and `WorkspaceMember` Drizzle schemas in Neon PostgreSQL.
- **Phase 3 — Source Ingestion**:
  - Deliverable: Cloudflare R2 client in `@debo/storage`, pre-signed URL upload endpoint, and `Source` entity tracking.
- **Phase 4 — Memory Subsystem**:
  - Deliverable: `@debo/memory` provider layer, Supermemory integration, hybrid vector search, and evaluation benchmark runner.
- **Phase 5 — Agent Runtime**:
  - Deliverable: LangGraph compiled state graph (`AskDebo`), citation validation node, checkpointing in PostgreSQL.
- **Phase 6 — Agent UI**:
  - Deliverable: AG-UI streaming protocol handlers in Next.js, editorial component library in `@debo/ui`.
- **Phase 7 — Connectors**:
  - Deliverable: `@debo/connectors`, Composio action integration, Google Calendar and Gmail tools with approval gates.
- **Phase 8 — Durable Workflows**:
  - Deliverable: Trigger.dev 4.x integration, background file ingestion and embedding pipeline.
- **Phase 9 — Model Context Protocol**:
  - Deliverable: `apps/mcp` standalone server, stdio & SSE transports, 21 standard Debo MCP tools.
- **Phase 10 — MCP Apps**:
  - Deliverable: Sandboxed UI resource frames for decision trees and source citations in Claude Desktop.
- **Phase 11 — Skills**:
  - Deliverable: `skills/` validated and published to the open skills directory (`skills.sh`).
- **Phase 12 — Document Worker**:
  - Deliverable: `apps/document-worker` Python container, Docling layout parser, table extraction.
- **Phase 13 — Browser Automation**:
  - Deliverable: Stagehand fallback browser agent running in isolated container.
- **Phase 14 — Security Hardening & Observability**:
  - Deliverable: OpenTelemetry tracing, LangSmith tracing, Sentry integration, 10,000-probe privacy audit.
- **Phase 15 — Closed Beta**:
  - Deliverable: Invitation-only deployment to 100 power users; performance and latency tuning.
- **Phase 16 — Public Launch**:
  - Deliverable: Production deployment at `app.debo.life` and open-source release announcement.
