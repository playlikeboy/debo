# Debo — Private AI Memory & Context Operating System

[![Phase](https://img.shields.io/badge/Phase_0-Clean--Room_Documentation-blue.svg)](file:///home/kunalkashyap8024/sop/debo/PROJECT_STATUS.md)
[![Architecture Status](https://img.shields.io/badge/Architecture-Design_Baseline-success.svg)](file:///home/kunalkashyap8024/sop/debo/docs/architecture/system-overview.md)
[![Implementation Status](https://img.shields.io/badge/Implementation-Not_Started-orange.svg)](file:///home/kunalkashyap8024/sop/debo/PROJECT_STATUS.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](file:///home/kunalkashyap8024/sop/debo/LICENSE)

> **"Capture anything. Ask your past. Trust every answer."**

---

## 1. What is Debo?

Debo is an open-source, private personal memory and context operating system. It ingests voice memos, daily journals, research documents, PDFs, calendar events, communications, and connected tools into a structured, temporal memory graph. 

Whenever you query Debo, it retrieves relevant facts, synthesizes answers through a deterministic agent graph, and **provides source-grounded citations that resolve to provenance metadata for the original source data**.

Debo also serves as an external context layer for external AI agents (Claude Desktop, Cursor, local LLMs) via the standardized **Model Context Protocol (MCP)**.

---

## 2. Why Debo Exists

Most current AI assistants suffer from three fundamental architectural flaws:
1. **Context amnesia**: Every conversation resets to zero, or relies on noisy, ungrounded chat history buffers.
2. **Hallucination without verification**: Models make plausible factual assertions without citing exact sentences or timestamps from your actual life and documents.
3. **Vendor lock-in & privacy loss**: Your private thoughts, financial records, and correspondence are siloed in proprietary closed-cloud platforms.

Debo solves these challenges by combining:
- **Immutable raw storage** (Cloudflare R2)
- **High-fidelity document understanding** (Docling OCR & layout parsing)
- **Temporal & semantic memory graphs** (Supermemory / Provider Abstraction)
- **Auditable agent reasoning** (LangGraph JS)
- **Universal agent accessibility** (Model Context Protocol)

---

## 3. Architecture Topology

```text
                                  DEBO

                           ┌───────────────┐
                           │    Web App    │
                           │ Next.js 15 UI │
                           └───────┬───────┘
                                   │
                             AG-UI Protocol
                                   │
                                   ↓
                         LangGraph Agent Runtime
                                   │
                      ┌────────────┼─────────────┐
                      ↓            ↓             ↓
                 Supermemory    Composio      Debo Tools
                    Memory       Actions     (Permissions,
                      │            │          Citations)
                      │            └── External APIs
                      ↓
               Debo Source-of-Truth
             ┌─────────────────────┐
             │ Neon DB (Metadata)  │
             │ Cloudflare R2 (Raw) │
             └─────────────────────┘

                          Trigger.dev
                       Durable Workflows
                               │
                        ┌──────┴──────┐
                        ↓             ↓
                     TS Worker    Python Worker
                                      │
                                   Docling

                       External AI Clients
                               │
                               ↓
                        Debo MCP Server
                        (mcp.debo.life)
                               │
                      ┌────────┼─────────┐
                      ↓        ↓         ↓
                    Tools   Resources  Prompts
                               │
                            MCP Apps
```

---

## 4. Planned Monorepo Structure

Debo uses Bun Workspaces and Turborepo with minimal network services:

```text
debo/
├── apps/
│   ├── web/               # Next.js product dashboard & user interface
│   ├── mcp/               # Standalone MCP server (mcp.debo.life)
│   ├── worker/            # TypeScript background job & ingestion processor
│   ├── document-worker/   # Python worker for Docling PDF/OCR processing
│   └── docs/              # Public developer documentation (docs.debo.life)
│
├── packages/
│   ├── agent/             # LangGraph state graphs, nodes, and tool routing
│   ├── ai/                # LLM client abstractions, embeddings, and token utilities
│   ├── memory/            # MemoryProvider interface & vector/graph adapters
│   ├── connectors/        # Composio actions and Nango sync adapters
│   ├── workflows/         # Trigger.dev durable task definitions
│   ├── mcp/               # MCP tools, resources, and prompt definitions
│   ├── permissions/       # Deterministic RBAC/ABAC and human-in-the-loop policies
│   ├── citations/         # Grounding validator and citation resolution engine
│   ├── db/                # Neon PostgreSQL connection and Drizzle schema
│   ├── storage/           # Cloudflare R2 S3-compatible client
│   ├── auth/              # Stack Auth / Session verification utilities
│   ├── types/             # Shared TypeScript domain types and Zod schemas
│   ├── ui/                # Calm editorial component library (Radix + Tailwind)
│   └── config/            # Shared environment, linting, and build configs
│
├── docs/                  # Full system architecture, ADRs, and specs
├── skills/                # Portable Agent Skills (SKILL.md)
└── infrastructure/        # Cloudflare, Docker, and deployment configurations
```

---

## 5. Technology Strategy

Debo relies on rigorous technical evaluation rather than popularity:

| Domain | Technology | Rationale |
|---|---|---|
| **Language** | TypeScript (Primary) | Full end-to-end type safety across UI, API, Agents, DB, and MCP. |
| **Parsing Worker** | Python 3.11 + Docling | State-of-the-art document layout, OCR, and table extraction isolated from web tier. |
| **Agent Runtime** | LangGraph JS | Deterministic graph orchestration, state checkpointing, and human approvals. |
| **Memory Engine** | Supermemory (with Provider Abstraction) | Hybrid semantic/temporal memory with zero vendor lock-in. |
| **Action Connectors** | Composio | Managed OAuth and execution for 1000+ external SaaS tools. |
| **Durable Workflows**| Trigger.dev v3 | Code-first serverless durable tasks with real-time streaming and local dev support. |
| **Database** | Neon PostgreSQL | Serverless PostgreSQL with instant branching and Drizzle ORM. |
| **Object Store** | Cloudflare R2 | Zero-egress fee S3-compatible storage for raw source files. |
| **External Agent API**| Model Context Protocol (MCP) | Universal protocol supported by Claude, Cursor, and emerging agents. |

---

## 6. Documentation Navigator

All architectural decisions, technical specifications, and research evaluations are documented under [`docs/`](file:///home/kunalkashyap8024/sop/debo/docs/README.md):

- **[System Architecture](file:///home/kunalkashyap8024/sop/debo/docs/architecture/system-overview.md)** — Core components, communication patterns, and boundaries.
- **[Architecture Decision Records (ADRs)](file:///home/kunalkashyap8024/sop/debo/docs/adr/README.md)** — Historical context and justifications for all 15 foundational decisions.
- **[Technology Research & Scorecards](file:///home/kunalkashyap8024/sop/debo/docs/research/scorecard.md)** — Evidence-based technology assessments of candidate technologies.
- **[Memory Engine & Evals](file:///home/kunalkashyap8024/sop/debo/docs/memory/README.md)** — Memory lifecycle, source-grounding rules, and retrieval benchmarks.
- **[MCP Server Specification](file:///home/kunalkashyap8024/sop/debo/docs/mcp/README.md)** — Tool taxonomy, modern Streamable HTTP/stdio transports, and injection defenses.
- **[Data Model & Tenancy](file:///home/kunalkashyap8024/sop/debo/docs/data-model/README.md)** — Complete domain entities, lifecycle states, and tenant scoping.
- **[Security & Threat Model](file:///home/kunalkashyap8024/sop/debo/SECURITY.md)** — Zero-trust access invariants, non-LLM permission authority, and secret hygiene.
- **[Product Roadmap & Backlog](file:///home/kunalkashyap8024/sop/debo/docs/planning/ROADMAP.md)** — 16-phase implementation plan and detailed DEBO tickets.

---

## 7. Current Project Status

Debo is currently executing **Phase 0 (Clean-Room Documentation & Architecture Bootstrap)**. 
- **Legacy code**: Successfully deleted and archived.
- **Product implementation**: Not yet started.
- **Verification**: The documentation baseline is being reconciled before functional code is merged in Phase 1.

Track live progress in [PROJECT_STATUS.md](file:///home/kunalkashyap8024/sop/debo/PROJECT_STATUS.md).

---

## 8. Contributing & Governance

Contributions to Debo follow our strict architectural review process. All PRs must align with established ADRs and pass documentation validation:
- Review [AGENTS.md](file:///home/kunalkashyap8024/sop/debo/AGENTS.md) for coding agent guidelines.
- Review [CONTRIBUTING.md](file:///home/kunalkashyap8024/sop/debo/CONTRIBUTING.md) for branch and PR workflows.
- Review [CODE_OF_CONDUCT.md](file:///home/kunalkashyap8024/sop/debo/CODE_OF_CONDUCT.md) for community standards.

---

## 9. License

Debo is licensed under the [MIT License](file:///home/kunalkashyap8024/sop/debo/LICENSE).
Copyright (c) 2026 Debo Contributors.


> **Documentation status:** research and architecture pages distinguish official evidence, vendor claims, repo observations, independent benchmarks, and future Debo-measured results. See `docs/audits/documentation-audit.md`.
