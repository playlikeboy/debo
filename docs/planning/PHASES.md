# Engineering Phases Specification

This document details the goals, dependencies, deliverables, exit criteria, and rollback strategies for each phase of the Debo platform build.

---

## Phase 0: Clean-Room Documentation (Current)
- **Goal**: Establish a complete, verified architectural baseline from first principles.
- **Dependencies**: None.
- **Deliverables**:
  - Legacy code cleanup and verified repository baseline.
  - Complete research evaluations (`docs/research/*`) and scorecard (`docs/research/scorecard.md`).
  - Accepted Architecture Decision Records (`docs/adr/ADR-0001` through `ADR-0015`).
  - Normative specifications (`docs/specs/*`) and contract schemas (`docs/contracts/*`).
  - Master rulebook (`AGENTS.md`), project status (`PROJECT_STATUS.md`), and ticket backlog (`docs/planning/BACKLOG.md`).
- **Exit Criteria**: All architectural documents complete; zero legacy code in working tree; docs check CI passing.
- **Rollback**: Git reset to pre-Phase 0 commit if documentation fails peer review.

---

## Phase 1: Repository Bootstrap & Monorepo Tooling
- **Goal**: Initialize clean monorepo workspace configuration without application code.
- **Dependencies**: Phase 0.
- **Deliverables**:
  - `package.json` with Bun workspaces configuration.
  - `turbo.json` with build, test, lint, and typecheck pipelines.
  - Shared TypeScript configuration package (`packages/config/tsconfig.base.json`).
  - GitHub Actions CI workflow running typecheck and linting on PRs.
- **Exit Criteria**: `bun install` executes cleanly; `bun run typecheck` passes across empty packages.

---

## Phase 2: Identity, Tenancy & Deterministic Auth
- **Goal**: Implement deterministic tenant partitioning and authentication.
- **Dependencies**: Phase 1.
- **Deliverables**:
  - `@debo/db` with Drizzle ORM schemas for `User`, `Workspace`, `WorkspaceMember`, `Permission`, `AuditLog`.
  - Neon PostgreSQL connection pooler integration.
  - `@debo/auth` with Stack Auth session verification.
  - Unit tests verifying multi-tenant query filters.
- **Exit Criteria**: User can register, log in, create a personal workspace, and queries unconditionally enforce `workspace_id`.

---

## Phase 3: Source Ingestion & Object Storage
- **Goal**: Provide authenticated raw file uploads to Cloudflare R2.
- **Dependencies**: Phase 2.
- **Deliverables**:
  - `@debo/storage` client wrapping AWS SDK S3 for Cloudflare R2.
  - Direct pre-signed upload URL generation endpoint.
  - `Source` and `Media` relational records in Neon DB.
- **Exit Criteria**: User can upload a 20MB PDF; file is stored in R2 under `workspaces/${id}/sources/` with a valid DB record.

---

## Phase 4: Memory Subsystem & Evaluation
- **Goal**: Implement the `MemoryProvider` interface and Supermemory vector integration.
- **Dependencies**: Phase 3.
- **Deliverables**:
  - `@debo/memory` implementing `MemoryProvider` contract.
  - Hybrid retrieval pipeline (vector search + BM25 keyword search).
  - Automated eval runner executing `docs/evals/memory/benchmark-suite.md`.
- **Exit Criteria**: Benchmark suite passes with $\ge 95\%$ Recall@5 and $0.00\%$ cross-tenant leakage.

---

## Phase 5: LangGraph Agent Orchestration
- **Goal**: Build stateful agent reasoning and citation validation loops.
- **Dependencies**: Phase 4.
- **Deliverables**:
  - `@debo/agent` compiled LangGraph graph (`AskDebo`).
  - Citation validation node verifying inline markers against retrieved chunks.
  - Drizzle checkpointer persisting state to PostgreSQL.
  - Human approval interrupt node for high-risk actions.
- **Exit Criteria**: Agent answers factual queries with verified citations; unsupported claims are stripped or flagged as uncertain.

---

## Phase 6: Agentic UI & Protocol
- **Goal**: Deliver streaming reasoning and editorial presentation components.
- **Dependencies**: Phase 5.
- **Deliverables**:
  - AG-UI protocol SSE streaming route handler in `apps/web`.
  - Radix UI + Tailwind CSS editorial components in `@debo/ui`.
  - Interactive citation preview drawer in Next.js.
- **Exit Criteria**: Streaming answer renders smoothly without CLS; clicking a citation opens the authentic source preview.

---

## Phase 7: Connectors (Composio / Nango)
- **Goal**: Connect external SaaS tools with safe human-in-the-loop approvals.
- **Dependencies**: Phase 5.
- **Deliverables**:
  - `@debo/connectors` wrapping Composio core.
  - Google Calendar, Gmail, and Slack tool definitions.
  - Approval gate integration pausing graph runs until user confirms.
- **Exit Criteria**: Agent can propose sending an email; graph pauses; user approves in UI; email sends via Composio.

---

## Phase 8: Durable Workflows (Trigger.dev v3)
- **Goal**: Orchestrate asynchronous background ingestion tasks.
- **Dependencies**: Phase 3, Phase 4.
- **Deliverables**:
  - `@debo/workflows` Trigger.dev v3 task setup.
  - Ingestion workflow: file upload -> Docling dispatch -> chunking -> vector indexing.
- **Exit Criteria**: Uploading a PDF triggers background workflow; progress streams in real time to the web UI.

---

## Phase 9: Model Context Protocol (MCP) Server
- **Goal**: Deploy official MCP server for external agents.
- **Dependencies**: Phase 4, Phase 5.
- **Deliverables**:
  - `apps/mcp` running `@modelcontextprotocol/sdk`.
  - 21 standard Debo MCP tools implemented.
  - SHA-256 API key authentication.
- **Exit Criteria**: Claude Desktop connects over SSE at `https://mcp.debo.life/mcp` and searches user memory.

---

## Phase 10: MCP Apps
- **Goal**: Deliver interactive UI frames to external host agent canvases.
- **Dependencies**: Phase 9.
- **Deliverables**:
  - Sandboxed UI frame renderers for decision trees and citations in Claude Desktop.

---

## Phase 11: Portable Agent Skills
- **Goal**: Publish Debo skills to the open agent ecosystem.
- **Dependencies**: Phase 9.
- **Deliverables**:
  - Validation of `skills/` using `npx skills` CLI.
  - Publication to `skills.sh`.

---

## Phase 12: Document Processing Worker (Python + Docling)
- **Goal**: Deep layout parsing and OCR for complex multi-column PDFs.
- **Dependencies**: Phase 3, Phase 8.
- **Deliverables**:
  - `apps/document-worker` Python container running Docling.
  - Bounding-box and table extraction pipeline.
- **Exit Criteria**: 100-page complex PDF with tables parses into structured Markdown with paragraph coordinates.

---

## Phase 13: Browser Automation Fallback (Stagehand)
- **Goal**: Intelligent web browsing fallback for un-integrated services.
- **Dependencies**: Phase 8.
- **Deliverables**:
  - Isolated browser container running Stagehand over headless Playwright.

---

## Phase 14: Security Hardening & Observability
- **Goal**: Production audit, OpenTelemetry distributed tracing, and LangSmith integration.
- **Dependencies**: Phases 1–13.
- **Deliverables**:
  - End-to-end OTel tracing from Web to LangGraph to Neon DB.
  - 10,000-probe cross-tenant security audit.
  - Penetration testing of MCP endpoints.

---

## Phase 15: Closed Beta
- **Goal**: Private deployment to 100 power users for feedback and performance tuning.
- **Dependencies**: Phase 14.

---

## Phase 16: Public Launch
- **Goal**: General availability release at `app.debo.life`.
