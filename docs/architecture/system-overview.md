# Debo System Overview & Operational Boundaries

Debo is designed as a **modular monorepo with a minimal number of deployable services**. We intentionally avoid microservice fragmentation. Most domain logic resides in versioned, shared TypeScript packages running within a compact set of operational runtimes.

---

## 1. Monorepo Deployables & Service Ownership

Debo defines exactly **five application targets**:

```text
apps/
├── web/               # Target: debo-web (Next.js 15 UI, SSR, API routes)
├── mcp/               # Target: debo-mcp (Standalone MCP Server over SSE/HTTP)
├── worker/            # Target: debo-worker (TypeScript background ingestion worker)
├── document-worker/   # Target: debo-document-worker (Python + Docling OCR service)
└── docs/              # Target: debo-docs (Documentation static portal)
```

### Deployable Matrix

| Service | Runtime | Deployment Target | Scale Driver | Responsibilities |
|---|---|---|---|---|
| `debo-web` | Node.js (LTS) | Vercel | User traffic, page requests | User interface, SSR, authentication sessions, synchronous query APIs, real-time AG-UI streaming. |
| `debo-mcp` | Node.js / Bun | VPS / Container via Cloudflare Tunnel | Agent queries from Claude/Cursor | Serving Model Context Protocol over SSE/HTTP (`mcp.debo.life`). Exposes tools, resources, and context. |
| `debo-worker` | Node.js / Bun | Dedicated VPS (Docker) / Trigger.dev | Asynchronous queue volume | File chunking, embedding generation, Supermemory ingestion, connector polling, scheduled maintenance. |
| `debo-document-worker` | Python 3.11 | Dedicated VPS (Docker) | Upload volume of complex PDFs | Running Docling PyTorch models for deep OCR, table layout extraction, and reading order preservation. |
| `debo-docs` | Static / Edge | Cloudflare Pages / Vercel | Public documentation | Public guides, API references, ADRs, developer docs. |

---

## 2. Shared Packages Architecture

Shared domain logic lives in `@debo/*` packages:

```text
packages/
├── agent/             # LangGraph state graphs, nodes, edge conditional routers, schemas
├── ai/                # Unified LLM provider router, embedding clients, tokenizer utilities
├── memory/            # MemoryProvider interface, Supermemory adapter, fallback adapters
├── connectors/        # Composio tool bindings, Nango sync handlers, token rotation helpers
├── workflows/         # Trigger.dev durable task definitions and step orchestrations
├── mcp/               # MCP tools, resources, and prompt definitions
├── permissions/       # Deterministic RBAC/ABAC validators, approval logic
├── citations/         # Grounding engine, citation validator, visual coordinate mapper
├── db/                # Drizzle ORM schema, migrations, Neon database client
├── storage/           # S3 client wrapper for Cloudflare R2, pre-signed URL generator
├── auth/              # Stack Auth / Session verification middleware
├── types/             # Canonical TypeScript domain entities, DTOs, Zod schemas
├── ui/                # Radix UI + Tailwind CSS editorial design components
└── config/            # Shared environment parsing, tsconfig bases, eslint configs
```

---

## 3. Package vs. Network Service Boundaries

A critical failure mode in modern software engineering is prematurely splitting code into network microservices. Debo enforces strict rules on when code becomes an independent network service:

### Keep It as an Internal Package (`packages/*`) When:
- Code shares the same execution lifecycle as the caller.
- Communication latency must be zero (in-process function call).
- Types are shared directly via TypeScript references.
- Transactional database guarantees (ACID) are required across operations.
- The work does not require specialized hardware, isolated language runtimes, or distinct scaling triggers.

### Create an Independent Network Service (`apps/*`) ONLY When:
1. **Heterogeneous Runtime Requirements**: Docling requires Python 3.11, PyTorch, and heavy C++ vision libraries that cannot and should not run in the TypeScript web process (`debo-document-worker`).
2. **Distinct Scaling & Resource Isolation**: Heavy PDF processing can spike CPU to 100% and consume 4GB RAM. If run inside `debo-web`, this would degrade web response times for interactive users. Isolating it to worker instances guarantees failure isolation.
3. **Distinct Protocol Lifecycles**: MCP clients maintain persistent, long-lived Server-Sent Events (SSE) connections with unique authentication and rate-limiting profiles distinct from standard browser sessions (`debo-mcp`).
4. **Different Deployment Cadence & Network Boundaries**: Background workers execute behind private VPC networks via Cloudflare Tunnel without public ingress exposure.

**When NOT to create a microservice**: Never create separate microservices for "Authentication", "User Management", "Memory API", or "Connector Service". These must remain modular packages (`@debo/auth`, `@debo/memory`, `@debo/connectors`) invoked directly in-process by the host service.

---

## 4. Data Ownership & Source of Truth

No external vendor or satellite service may become an implicit canonical owner of Debo entities:

```text
┌──────────────────────────────────────────────────────────────┐
│                    Neon PostgreSQL (ACID)                    │
│   Canonical Truth for:                                       │
│   - Users, Workspaces, Memberships, Permissions              │
│   - Source Metadata, Documents, Pages, Paragraphs            │
│   - Memories, MemoryRelations, Entities                      │
│   - Decisions, Tasks, Projects, People                       │
│   - AuditLogs, Approvals, Connections                        │
└──────────────────────────────┬───────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌──────────────────────────────┐      ┌──────────────────────────────┐
│     Cloudflare R2 (Raw)      │      │   Memory Engine / Vector     │
│   Canonical Storage for:     │      │   Acceleration Engine:       │
│   - Raw PDFs & Documents     │      │   - Derived semantic indices │
│   - Original Audio / Voice   │      │   - Fast vector similarity   │
│   - Source images & exports  │      │   - Temporal decay ranks     │
└──────────────────────────────┘      └──────────────────────────────┘
```

1. **Neon PostgreSQL** owns business truth. If the memory engine or vector store is wiped or corrupted, the system can completely reconstruct it by replaying records from PostgreSQL.
2. **Cloudflare R2** owns raw binary truth. If processed document chunks are deleted, they can be re-extracted from original files in R2.
3. **Supermemory / Vector Stores** are derived retrieval structures. They never hold unique business state that does not exist in PostgreSQL or R2.
4. **Composio / Nango** are execution and integration layers. They do not own Debo product state.

---

## 5. Synchronous vs. Asynchronous Communication

```text
[User / Browser] ──── HTTP / SSE ───► [ debo-web ] ── Direct in-process ──► [ LangGraph / Agent ]
                                            │                                      │
                                    Dispatches Event                          Retrieves (sync)
                                            │                                      │
                                            ▼                                      ▼
                                    [ Trigger.dev ]                         [ Memory Engine ]
                                     (Durable Queue)
                                      │           │
                          Async Job   │           │   Async Job
                                      ▼           ▼
                              [ debo-worker ]   [ debo-document-worker ]
                                (TS Embed)            (Docling OCR)
```

- **Synchronous (< 2 seconds)**:
  - User navigation, page rendering, session resolution.
  - Ask Debo query synthesis (streamed via AG-UI SSE protocol).
  - Fast memory lookups and vector searches.
- **Asynchronous (Durable Workflows via Trigger.dev)**:
  - Ingesting uploaded files from R2.
  - Document parsing, OCR, and layout analysis (Docling).
  - Audio transcription and speaker diarization.
  - Third-party connector synchronization (emails, calendar, Notion).
  - Background memory consolidation and entity relationship extraction.

---

## 6. Failure Isolation & Circuit Breakers

1. **Worker Starvation Protection**: If `debo-document-worker` encounters an out-of-memory error on a malformed PDF, the failure is caught by Trigger.dev. The job is marked failed, quarantined, and recorded in the audit log. `debo-web` and `debo-mcp` experience zero downtime.
2. **LLM Provider Outage**: `@debo/ai` implements an automated circuit breaker. If NVIDIA NIM or Anthropic API endpoints return 5xx errors or exceed timeout thresholds, queries automatically failover to secondary providers (DeepSeek / OpenAI).
3. **Memory Engine Unavailability**: If the external memory provider experiences latency degradation, the `MemoryProvider` contract falls back to direct keyword/metadata search against PostgreSQL full-text indices.
