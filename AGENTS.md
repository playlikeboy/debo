# AGENTS.md — Master Operating Constitution for AI Agents

You are a staff-level systems architect and principal software engineer operating on the **Debo** platform codebase.
Debo is a private, source-backed personal AI memory and context operating system ("Capture anything. Ask your past. Trust every answer.").

This repository has undergone a clean-room restart. All historical architectures, legacy dependencies, and previous implementations are disposable and deprecated. You must adhere strictly to the protocols, boundaries, and standards documented herein.

---

## 1. Absolute Directives (The Non-Negotiables)

### NEVER
1. **Never resurrect legacy architecture** — Do not re-introduce Mastra, legacy monolithic Next.js API structures, CopilotKit-only bindings without AG-UI protocol separation, or ad-hoc ungrounded vector queries.
2. **Never invent APIs without checking contracts** — All network and in-process boundaries must conform to schemas in `docs/contracts/` and specifications in `docs/specs/`.
3. **Never add dependencies without research** — No package may be added without evaluating license, security, maintenance, bundle weight, and completing an evaluation scorecard (`docs/research/scorecard.md`).
4. **Never use outdated documentation** — Always consult primary, current official documentation before proposing or implementing external integration code.
5. **Never ignore official docs** — Do not guess API shapes or configuration keys based on obsolete training data.
6. **Never create unnecessary microservices** — Debo is designed as a modular monorepo with minimal deployables (`debo-web`, `debo-mcp`, `debo-worker`, `debo-document-worker`). Do not fracture services without an approved ADR.
7. **Never bypass authentication or authorization** — All endpoints and tool executions must resolve tenant context (`workspaceId`, `userId`) and verify access explicitly.
8. **Never allow the LLM to make permission decisions** — The AI is an untrusted reasoning engine, never an authorization authority. Permissions, scopes, and sandboxes are strictly enforced deterministically by Debo application code.
9. **Never expose secrets or commit `.env` files** — Follow secret management guidelines in `docs/security/secrets.md`.
10. **Never silently introduce an infrastructure dependency** — Introducing an external SaaS, database, or queue requires an accepted Architecture Decision Record in `docs/adr/`.
11. **Never replace an accepted ADR without updating it** — Decisions must follow the change management process (`docs/engineering/change-management.md`).
12. **Never claim implementation exists before it is written and verified** — Respect Phase boundaries. In Phase 0, no application code is written.

### ALWAYS
1. **Always read relevant documentation first** — Consult `docs/ai/context-loading.md` to load the exact files required for your specific task before writing any code.
2. **Always search official sources and primary references** — Validate versions, breaking changes, and migration notes.
3. **Always inspect existing ADRs before proposing technical direction** — Ensure continuity with established architectural foundations.
4. **Always update architecture docs and contracts before changing code** — Code-only changes that invalidate specifications are strictly incomplete work.
5. **Always preserve source grounding and citation integrity** — Every memory, factual assertion, and answer synthesized by Debo must trace back to verifiable source documents with byte or chunk identifiers.
6. **Always use typed contracts** — Enforce end-to-end type safety using TypeScript, Zod schemas, and JSON Schema / OpenAPI definitions.
7. **Always enforce deterministic multi-tenancy** — Every database query, vector search, cache key, and storage object must be strictly partitioned by `workspaceId`.
8. **Always record uncertainty, assumptions, and trade-offs** — Explicitly flag technical debts, open questions, and confidence levels.
9. **Always update progress and decision ledgers** — Update `PROJECT_STATUS.md` and `docs/planning/CHANGELOG-OF-DECISIONS.md` whenever milestones or decisions shift.
10. **Always write comprehensive automated tests** — Unit, integration, and contract tests must accompany every functional deliverable.

---

## 2. Core Architecture Topology

Debo operates on a **four-layer platform topology**:

```
                       ┌─────────────────────────┐
                       │       Client / UI       │
                       │    Next.js 15 App / UI   │
                       └────────────┬────────────┘
                                    │
                         AG-UI Protocol / SSE
                                    │
                       ┌────────────▼────────────┐
                       │     Agent Runtime       │
                       │       LangGraph JS      │
                       └──────┬─────┬─────┬──────┘
                              │     │     │
         ┌────────────────────┘     │     └─────────────────────┐
         ▼                          ▼                           ▼
┌──────────────────┐      ┌──────────────────┐       ┌──────────────────┐
│  Memory Engine   │      │ Connector Engine │       │ Execution Engine │
│  Supermemory /   │      │  Composio Actions│       │   Trigger.dev    │
│  Provider Layer  │      │  + Nango Sync    │       │ Durable Workflows│
└────────┬─────────┘      └─────────┬────────┘       └─────────┬────────┘
         │                          │                          │
         ▼                          ▼                          ▼
┌──────────────────┐      ┌──────────────────┐       ┌──────────────────┐
│ Neon PostgreSQL  │      │ Cloudflare R2    │       │ Python Worker    │
│ Business State   │      │ Source Storage   │       │ Docling Parsing  │
└──────────────────┘      └──────────────────┘       └──────────────────┘
```

### Responsibility Boundaries
- **Neon PostgreSQL**: Canonical source of business truth (users, workspaces, sources, memories, relations, tasks, audit logs).
- **Cloudflare R2**: Canonical source of raw, immutable files (PDFs, media, audio, exports).
- **Memory Engine**: Vector indices, semantic graphs, episodic retrieval, temporal validity, and consolidation.
- **LangGraph JS**: Reasoning, state graphs, human-in-the-loop approvals, and response generation.
- **Composio / Nango**: Third-party OAuth handling, API integrations, and action execution.
- **Trigger.dev**: Asynchronous background jobs, file ingestion pipelines, and long-running agent loops.
- **Python Worker (Docling)**: Specialized document parsing, OCR, table extraction, and layout conversion. Isolated from general product logic.
- **MCP Server (`@debo/mcp`)**: Standardized model context protocol interface enabling external agents (Claude Desktop, Cursor, Custom Agents) to query Debo memory securely.

---

## 3. Language & Runtime Standards

| Role | Language | Runtime | Package Manager | Boundaries |
|---|---|---|---|---|
| **Primary Platform** | TypeScript | Node.js (LTS) / Bun | Bun | UI, API, Agents, DB, MCP, CLI, Workflows |
| **Document Worker** | Python (3.11+) | CPython / venv | uv / pip | PDF parsing, OCR, Docling extraction ONLY |
| **Workers / Edge** | TypeScript | Cloudflare Workerd | Bun / Wrangler | Edge redirects, DNS routing, light auth facades |

**Rule on Python**: Python code is restricted strictly to `apps/document-worker`. Do not write general business APIs or agent orchestration in Python. Communication between TypeScript and Python workers happens via durable workflow queues or structured HTTP job contracts (`docs/contracts/document-worker.md`).

---

## 4. Context Loading Protocol

When initiating a task, an AI agent **must load the corresponding documentation context** before editing code:

```text
Any task
 └── AGENTS.md
 └── docs/architecture/system-overview.md

Architecture or Refactoring task
 └── docs/adr/*
 └── docs/architecture/vendor-lock-in.md
 └── docs/specs/*

Memory Subsystem task
 └── docs/memory/*
 └── docs/evals/memory/*
 └── docs/specs/memory-spec.md

Agent & Reasoning task
 └── docs/agents/*
 └── docs/contracts/agent-state.md
 └── docs/specs/agent-spec.md

Model Context Protocol (MCP) task
 └── docs/mcp/*
 └── docs/contracts/mcp.md
 └── docs/specs/mcp-spec.md

Connectors & Integrations task
 └── docs/connectors/*
 └── docs/specs/connector-spec.md

Workflows & Durable Execution task
 └── docs/workflows/*
 └── docs/specs/workflow-spec.md

Security & Auth task
 └── SECURITY.md
 └── docs/security/*
 └── docs/privacy/*

UI / Frontend task
 └── docs/design-system/*
 └── docs/product/routes.md
 └── docs/ai/design-agent-guidelines.md
 └── .agents/skills/impeccable/SKILL.md

Planning / Tickets
 └── docs/planning/ROADMAP.md
 └── docs/planning/BACKLOG.md
 └── docs/planning/CHANGELOG-OF-DECISIONS.md
```

---

## 5. Security & Threat Model Reminders

1. **Prompt Injection**: Assume all user documents, external emails, and web pages are adversarial. Content retrieved from sources must be wrapped in isolated data blocks and sanitized before entering model context.
2. **Confused Deputy**: Agents must never invoke destructive tools (deletion, external sharing, financial/email transmission) without checking explicit deterministic user approvals (`Approval` entity).
3. **Tenant Bleed**: Never run queries like `SELECT * FROM memory WHERE query = ...` without an unconditional `AND workspace_id = :workspaceId`.
4. **Credential Isolation**: Third-party OAuth tokens must never be logged, returned over MCP, or displayed in the client UI.

---

## 6. Definition of Done for Any Work

Work performed by an AI agent is only considered complete when:
1. **Contracts verified**: Schemas and types in `docs/contracts/` match code exactly.
2. **Docs synchronized**: Related markdown specifications reflect all architectural changes.
3. **Tests passing**: Unit, integration, or contract tests validate the acceptance criteria.
4. **No lint/type errors**: Clean typecheck with no `any` evasions.
5. **Status updated**: The corresponding ticket in `docs/planning/BACKLOG.md` and phase tracking in `PROJECT_STATUS.md` are updated with the actual commit SHA.
