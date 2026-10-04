# Debo Engineering Ticket Backlog

This document contains the canonical engineering ticket backlog covering foundational implementation phases. Every ticket follows our normative Definition of Done (`docs/planning/DEFINITION-OF-DONE.md`).

---

# DEBO-0001 — Monorepo Root & Workspace Setup

Status: [ ]
Priority: P0

## Goal
Initialize clean Bun monorepo workspace configuration with Turborepo task pipeline.

## Context
Debo requires structured workspaces for `apps/*` and `packages/*` with shared scripts and topological pipeline caching.

## Dependencies
None (Phase 1 bootstrap).

## Acceptance Criteria
- `package.json` defines workspaces for `apps/*` and `packages/*`.
- `turbo.json` configures `build`, `test`, `lint`, and `typecheck` tasks with output caching.
- `bun install` completes without warnings or errors.

## Security
No external third-party dependencies with copyleft or non-permissive licenses.

## Tests
- Verify `bun run build` runs topological pipeline.
- Verify cached runs complete in $< 100\text{ms}$.

## Documentation
Update `PROJECT_STATUS.md` with commit hash.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0002 — Base TypeScript Configuration & Biome Linting

Status: [ ]
Priority: P0

## Goal
Establish strict, shared TypeScript configurations and Biome linting rules.

## Context
To prevent `any` evasions and maintain strict type safety, all packages must inherit from a common base tsconfig.

## Dependencies
DEBO-0001.

## Acceptance Criteria
- `packages/config/tsconfig.base.json` created with `strict: true`, `noImplicitAny: true`, `exactOptionalPropertyTypes: true`.
- `biome.json` configured for unified formatting and linting.
- Root script `bun run typecheck` checks all workspaces in parallel.

## Security
Zero runtime security impact; static analysis enforcement.

## Tests
- Run `bun run typecheck` across all empty workspace stubs.

## Documentation
`docs/engineering/dependencies.md` updated.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0003 — Neon DB Connection & Drizzle ORM Setup

Status: [ ]
Priority: P0

## Goal
Create `@debo/db` package with Drizzle ORM client connecting to Neon Serverless PostgreSQL.

## Context
Neon PostgreSQL is the canonical source of truth for business data and tenancy.

## Dependencies
DEBO-0001, DEBO-0002.

## Acceptance Criteria
- Drizzle client initialized using `@neondatabase/serverless` connection pooler.
- `drizzle.config.ts` configured for migrations directory.
- Environment variable `DATABASE_URL` validated using Zod.

## Security
SSL mode required; connection credentials injected via secure environment variables.

## Tests
- Connection smoke test against live or Testcontainers PostgreSQL instance.

## Documentation
`docs/contracts/` references updated.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0004 — Core Tenancy Schemas (User, Workspace, Member)

Status: [ ]
Priority: P0

## Goal
Define relational Drizzle schemas for `User`, `Workspace`, `WorkspaceMember`, `Permission`, and `AuditLog`.

## Context
Implements the multi-tenant data hierarchy specified in `docs/data-model/entities.md` and `docs/data-model/tenancy.md`.

## Dependencies
DEBO-0003.

## Acceptance Criteria
- Drizzle schema files created with ULID primary keys.
- Foreign key constraints enforce `workspace_id` referencing `workspaces.id` with `ON DELETE CASCADE`.
- Audit timestamps (`createdAt`, `updatedAt`) present on all tables.
- Migration generated via `drizzle-kit generate`.

## Security
Unconditional non-null `workspace_id` enforced on all workspace-scoped tables.

## Tests
- Schema unit tests verifying foreign key cascades and unique constraints.

## Documentation
`docs/data-model/entities.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0005 — Authentication Middleware & Session Verification

Status: [ ]
Priority: P0

## Goal
Implement `@debo/auth` session verification resolving `(userId, workspaceId, role)` context.

## Context
All API route handlers and server actions require verified tenant identity before executing business logic.

## Dependencies
DEBO-0004.

## Acceptance Criteria
- Session token parsed from cookie / authorization header.
- Helper `resolveSession(req)` returns typed `SessionContext`.
- Unauthenticated requests throw `AuthenticationError`.

## Security
Non-LLM authorization authority; CSRF token validation on mutating endpoints.

## Tests
- Unit tests for valid, expired, and forged JWT tokens.

## Documentation
`docs/security/README.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0006 — Cloudflare R2 Client & Pre-Signed URL Generator

Status: [ ]
Priority: P0

## Goal
Create `@debo/storage` package providing S3-compatible pre-signed upload and download URLs for Cloudflare R2.

## Context
User files (PDFs, audio) are stored immutably in R2 with zero egress bandwidth fees.

## Dependencies
DEBO-0001, DEBO-0002.

## Acceptance Criteria
- S3 client initialized using AWS SDK v3 with Cloudflare R2 endpoint.
- `createPresignedUploadUrl(workspaceId, sourceId, fileName)` returns 15-minute PUT URL.
- `createPresignedDownloadUrl(workspaceId, sourceId, storageKey)` returns 15-minute GET URL.
- Storage key strictly follows namespace `workspaces/${workspaceId}/sources/${sourceId}/...`.

## Security
Zero public bucket access; pre-signed URLs time-limited to 900 seconds.

## Tests
- Unit test for key generation and signature structure.

## Documentation
`docs/specs/storage-spec.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0007 — Source & Media Relational Ingestion Tables

Status: [ ]
Priority: P0

## Goal
Define Drizzle schemas for `Source`, `Document`, and `Media` in `@debo/db`.

## Context
Provides tracking for file uploads, processing statuses (`PENDING`, `PROCESSING`, `INDEXED`, `FAILED`), and layout structures.

## Dependencies
DEBO-0004, DEBO-0006.

## Acceptance Criteria
- Tables created matching specifications in `docs/data-model/entities.md`.
- Status enum values strictly enforced.
- Migration generated and applied cleanly.

## Security
`workspace_id` foreign key index on all tables.

## Tests
- CRUD integration test on `Source` and `Document` records.

## Documentation
`docs/data-model/entities.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0008 — Memory Provider Interface & Types

Status: [ ]
Priority: P0

## Goal
Define the vendor-neutral `MemoryProvider` TypeScript interface in `@debo/memory`.

## Context
Decouples Debo's agent reasoning from specific vector databases per ADR-0003 and `docs/contracts/memory-provider.md`.

## Dependencies
DEBO-0001, DEBO-0002.

## Acceptance Criteria
- Interface defines `remember`, `search`, `recall`, `profile`, `update`, `forget`.
- Zod schemas validate all input parameters and return types.
- Mock implementation `MockMemoryProvider` created for local unit testing.

## Security
`workspaceId` is a non-optional parameter on every method.

## Tests
- Type checking tests verifying adapter contract conformance.

## Documentation
`docs/contracts/memory-provider.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0009 — Supermemory Client Adapter Integration

Status: [ ]
Priority: P0

## Goal
Implement `SupermemoryAdapter` in `@debo/memory` connecting to the Supermemory API/engine.

## Context
Executes vector indexing, semantic search, and metadata filtering using our primary memory platform.

## Dependencies
DEBO-0008.

## Acceptance Criteria
- Adapter implements `MemoryProvider` completely.
- `remember()` writes chunks with source IDs and tags.
- `search()` returns normalized similarity scores and source foreign keys.
- Error handling maps 429/500 errors to typed `ProviderTimeoutError` / `RateLimitError`.

## Security
Tenant isolation: `workspace_id` passed in all request metadata filters.

## Tests
- Integration tests against mock or staging Supermemory endpoint.

## Documentation
`docs/research/supermemory.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0010 — Hybrid Search & BM25 Keyword Retrieval

Status: [ ]
Priority: P0

## Goal
Combine Supermemory dense vector retrieval with PostgreSQL BM25 full-text keyword search in `@debo/memory`.

## Context
Guarantees exact-match recall for acronyms, phone numbers, and code identifiers alongside semantic conceptual search.

## Dependencies
DEBO-0004, DEBO-0009.

## Acceptance Criteria
- PostgreSQL `tsvector` generated for all memory content chunks.
- Reciprocal Rank Fusion (RRF) algorithm merges vector and keyword result lists.
- Query latency $< 200\text{ms}$ on 50,000 memory records.

## Security
PostgreSQL query parameterized to prevent SQL injection.

## Tests
- Unit test for RRF ranking logic on synthetic conflicting scores.

## Documentation
`docs/memory/README.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0011 — Automated Memory Benchmark Test Harness

Status: [ ]
Priority: P0

## Goal
Build the automated test harness executing the 7 benchmark tracks in `docs/evals/memory/benchmark-suite.md`.

## Context
Ensures continuous empirical evaluation of retrieval accuracy, temporal reasoning, and tenant privacy.

## Dependencies
DEBO-0010.

## Acceptance Criteria
- Script `bun run eval:memory` executes queries against fixture datasets.
- Calculates Recall@5, nDCG@10, and Citation Accuracy.
- Emits structured JSON summary and fails CI if thresholds are breached.

## Security
Includes 10,000 synthetic cross-tenant query probes (0.00% leakage threshold).

## Tests
- Self-test of evaluation runner on intentional failure fixtures.

## Documentation
`docs/evals/memory/benchmark-suite.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0012 — LangGraph Agent Graph Compilation (AskDebo)

Status: [ ]
Priority: P0

## Goal
Compile the stateful `AskDebo` reasoning graph in `@debo/agent` using LangGraph JS.

## Context
Powers intent classification, context building, answer generation, and action proposals per ADR-0004.

## Dependencies
DEBO-0008, DEBO-0010.

## Acceptance Criteria
- State channels defined via Zod annotations matching `docs/contracts/agent-state.md`.
- Graph nodes: `classify_intent`, `retrieve_memory`, `generate_answer`, `validate_citations`.
- Supports real-time streaming of tokens and node transitions.

## Security
Recursion limit capped at 25 steps; model prompts isolated from untrusted input strings.

## Tests
- Unit tests executing graph nodes with mock LLM responses.

## Documentation
`docs/agents/orchestration.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0013 — Deterministic Citation Validation Node

Status: [ ]
Priority: P0

## Goal
Implement the `validate_citations` node in `@debo/agent`.

## Context
Enforces Debo's zero-hallucination tolerance by verifying that every generated citation marker points to authentic evidence.

## Dependencies
DEBO-0012.

## Acceptance Criteria
- Parses all `[^chunkId]` references in the generated text.
- Strips citations to chunk IDs not present in the retrieved context.
- Generates typed `Citation` records with exact quote snippets and R2 preview URLs.

## Security
Prevents forged citation injections.

## Tests
- Unit tests verifying stripping of hallucinated chunk IDs and preservation of authentic citations.

## Documentation
`docs/memory/source-grounding.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0014 — Drizzle Checkpointer for Agent State

Status: [ ]
Priority: P0

## Goal
Implement a PostgreSQL state checkpointer for LangGraph using Drizzle ORM in `@debo/agent`.

## Context
Enables time-travel debugging, graph resumption after human approvals, and fault tolerance across worker restarts.

## Dependencies
DEBO-0004, DEBO-0012.

## Acceptance Criteria
- Checkpointer implements LangGraph `BaseCheckpointSaver`.
- Writes state snapshots to `agent_runs` and checkpoint tables.
- Supports `getTuple` and `put` operations.

## Security
Checkpoints partitioned by `thread_id` and `workspace_id`.

## Tests
- Checkpoint write and restore roundtrip test.

## Documentation
`docs/agents/orchestration.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0015 — AG-UI Streaming Protocol Route Handler

Status: [ ]
Priority: P0

## Goal
Implement the Server-Sent Events (SSE) streaming API handler `/api/chat/ask` in `apps/web`.

## Context
Transfers real-time tokens, citations, and approval requests from LangGraph to the frontend per ADR-0006.

## Dependencies
DEBO-0005, DEBO-0012.

## Acceptance Criteria
- Route streams standard AG-UI events (`intent_classified`, `token`, `citation`, `approval_required`).
- Handles client abort signals cleanly by terminating downstream LLM requests.
- Closes stream with `event: done`.

## Security
Session authentication validated before stream initiation.

## Tests
- Route handler integration test asserting SSE event sequence.

## Documentation
`docs/contracts/http-api.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0016 — Editorial Design Tokens & Radix UI Components

Status: [ ]
Priority: P0

## Goal
Build the calm editorial component library in `@debo/ui`.

## Context
Implements Debo's visual identity using Radix UI primitives and Tailwind CSS tokens, eliminating AI slop.

## Dependencies
DEBO-0001, DEBO-0002.

## Acceptance Criteria
- Tailwind configuration includes tokens from `docs/design-system/tokens.md`.
- Components created: `Button`, `Card`, `Dialog`, `Input`, `Drawer`, `CitationBadge`.
- Zero cumulative layout shift (CLS) during streaming text rendering.

## Security
All text inputs sanitized against XSS.

## Tests
- Component accessibility tests (axe-core / testing-library).

## Documentation
`docs/design-system/README.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0017 — Interactive Citation Preview Drawer

Status: [ ]
Priority: P0

## Goal
Build the citation drawer component in `apps/web`.

## Context
Clicking a citation marker in a response must open the source document at the exact highlighted sentence.

## Dependencies
DEBO-0013, DEBO-0016.

## Acceptance Criteria
- Drawer slides in smoothly from the right viewport boundary upon citation click.
- Displays source title, timestamp, exact quote, and bounding-box coordinates on PDF.
- Action button opens full raw document in Source Viewer.

## Security
PDF preview URL uses time-limited signed URL.

## Tests
- Playwright component test for citation click interaction.

## Documentation
`docs/specs/ui-spec.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0018 — Composio Core Integration & Action Gateway

Status: [ ]
Priority: P1

## Goal
Build `@debo/connectors` package integrating Composio action execution.

## Context
Allows agents to execute real-world tool calls (Google Calendar, Gmail, GitHub) per ADR-0008.

## Dependencies
DEBO-0004.

## Acceptance Criteria
- Wraps `@composio/core` with typed `ActionConnector` interface.
- Maps Composio tools into LangGraph tool schemas.
- Enforces Connector Ownership Rule: zero raw tokens stored in Debo DB.

## Security
Tool invocation verifies active connection status and tenant ownership.

## Tests
- Mock tool execution test for Google Calendar event creation.

## Documentation
`docs/connectors/strategy.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0019 — Human-in-the-Loop Approval Interruption Node

Status: [ ]
Priority: P1

## Goal
Implement approval gating in LangGraph for Tier 2 and Tier 3 actions.

## Context
Guarantees that agents cannot execute external mutations or destructive deletions without human consent.

## Dependencies
DEBO-0014, DEBO-0018.

## Acceptance Criteria
- Action proposal creates an `Approval` record with `PENDING` status.
- Graph pauses using `interrupt()`.
- API endpoint `POST /api/approvals/{id}/resolve` resumes graph with user decision.

## Security
Approval token cryptographically signed; expires in 24 hours.

## Tests
- Integration test: verify graph pauses and resumes only upon approval grant.

## Documentation
`docs/agents/permissions.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0020 — Trigger.dev v3 Project Setup & Task Runner

Status: [ ]
Priority: P0

## Goal
Configure `@debo/workflows` with Trigger.dev v3 client and local dev tunneling.

## Context
Provides durable execution for long-running ingestion jobs per ADR-0005.

## Dependencies
DEBO-0001, DEBO-0002.

## Acceptance Criteria
- `trigger.config.ts` initialized in `@debo/workflows`.
- Local dev runner `bun run dev:workflows` tunnels tasks successfully.
- Base task definition with retry policies and exponential backoff.

## Security
Trigger API keys injected via encrypted secret store.

## Tests
- Smoke test executing a dummy durable task.

## Documentation
`docs/workflows/README.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0021 — Background Document Ingestion Pipeline Task

Status: [ ]
Priority: P0

## Goal
Author the `ingestSourceTask` in `@debo/workflows`.

## Context
Orchestrates file download from R2, dispatch to Docling, chunking, and memory indexing.

## Dependencies
DEBO-0006, DEBO-0007, DEBO-0009, DEBO-0020.

## Acceptance Criteria
- Triggered by `source.created` event.
- Dispatches to Docling worker; receives parsed markdown and coordinates.
- Chunks text into semantic paragraphs and generates vector embeddings.
- Updates `Source.status` to `INDEXED`.

## Security
Fails gracefully on malformed files with compensation cleanup.

## Tests
- Pipeline test on a sample 5-page PDF document.

## Documentation
`docs/contracts/document-worker.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0022 — Official MCP Server Implementation (`apps/mcp`)

Status: [ ]
Priority: P0

## Goal
Build and deploy standalone MCP Server in `apps/mcp` using `@modelcontextprotocol/sdk`.

## Context
Exposes Debo memory to Claude Desktop and Cursor over stdio and SSE per ADR-0007.

## Dependencies
DEBO-0004, DEBO-0008.

## Acceptance Criteria
- Server supports SSE transport at `/mcp` and local stdio transport.
- Authenticates API key via SHA-256 hash lookup in Neon DB.
- Implements tools handshake and capability discovery.

## Security
Rate limited to 60 req/min; tenant scoped to API key's workspace.

## Tests
- Protocol test connecting via MCP Inspector.

## Documentation
`docs/mcp/README.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0023 — Standard Memory & Source MCP Tools

Status: [ ]
Priority: P0

## Goal
Implement the 21 standard tools in `apps/mcp` matching `docs/mcp/tools-taxonomy.md`.

## Context
Provides full read, recall, search, task creation, and decision logging tools over MCP.

## Dependencies
DEBO-0022.

## Acceptance Criteria
- Tools: `debo_search_memory`, `debo_recall`, `debo_get_source`, `debo_create_task`, etc.
- All tools validate parameters with Zod.
- Outputs enclosed in `<source_data>` tags to prevent indirect prompt injection.

## Security
Non-LLM authority: permission scopes checked before tool dispatch.

## Tests
- Unit test for each tool handler asserting schema compliance.

## Documentation
`docs/mcp/tools-taxonomy.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0024 — MCP Apps Sandboxed Decision Canvas

Status: [ ]
Priority: P2

## Goal
Deliver interactive UI frames for decisions and citations into external host agent canvases.

## Context
Implements MCP Apps specification in `docs/mcp/mcp-apps.md`.

## Dependencies
DEBO-0022.

## Acceptance Criteria
- Exposes `ui://debo/decisions/{id}/canvas` resource.
- Renders sandboxed HTML/CSS decision tree with citation highlights.
- Zero external script dependencies.

## Security
Strict iframe sandboxing without access to parent DOM.

## Tests
- Render test in simulated MCP App container.

## Documentation
`docs/mcp/mcp-apps.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0025 — Python Document Worker Container (Docling OCR)

Status: [ ]
Priority: P0

## Goal
Build `apps/document-worker` container running Python 3.11 and Docling.

## Context
Extracts clean Markdown, table structures, and bounding boxes from complex PDFs per ADR-0011.

## Dependencies
DEBO-0001.

## Acceptance Criteria
- FastAPI / HTTP service exposing `POST /jobs/parse`.
- Downloads raw PDF from pre-signed R2 URL.
- Runs Docling conversion pipeline; returns layout manifest.
- Dockerfile builds cleanly on CPU and CUDA base images.

## Security
Zero public ingress; communicates exclusively over private Docker network with worker.

## Tests
- Parsing benchmark test on sample financial PDF with complex tables.

## Documentation
`docs/contracts/document-worker.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0026 — OpenTelemetry Distributed Tracing & LangSmith Setup

Status: [ ]
Priority: P1

## Goal
Configure unified distributed tracing across Web, LangGraph, and PostgreSQL.

## Context
Provides observability into token costs, agent reasoning trees, and retrieval latency per ADR-0013.

## Dependencies
DEBO-0005, DEBO-0012.

## Acceptance Criteria
- OpenTelemetry SDK instruments HTTP requests and Drizzle DB queries.
- LangSmith tracing captures all LangGraph runs and model prompt templates.
- Canonical correlation IDs (`traceId`, `requestId`, `workspaceId`) propagated across all logs.

## Security
No customer memory text or secrets serialized into unencrypted external trace spans.

## Tests
- Trace emission verification test.

## Documentation
`docs/architecture/system-overview.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD

---

# DEBO-0027 — Multi-Tenant Security & 10,000-Probe Audit Suite

Status: [ ]
Priority: P0

## Goal
Build the security verification test suite executing 10,000 synthetic cross-tenant query probes.

## Context
Verifies that multi-tenant isolation is mathematically airtight before public launch.

## Dependencies
DEBO-0004, DEBO-0010, DEBO-0022.

## Acceptance Criteria
- Test script provisions 5 distinct workspaces with overlapping mock memories.
- Generates 10,000 aggressive search probes attempting cross-tenant exfiltration.
- **Zero records leaked (0.00% leakage rate)**; any leak fails test immediately.

## Security
P0 blocking test gate for all production releases.

## Tests
- Automated execution in CI.

## Documentation
`docs/security/threat-model.md` verified.

## Implementation Commit
TBD

## Verification Commit
TBD
