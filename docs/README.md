# Debo Documentation Map & Architectural Navigator

Welcome to the definitive documentation index for the Debo platform. 
Every major architectural decision, interface contract, threat model, and product specification is indexed below.

---

## 1. Navigable Knowledge Index

### Foundational Architecture & Philosophy
- **[System Overview & Boundaries](file:///home/kunalkashyap8024/sop/debo/docs/architecture/system-overview.md)** — Core monorepo topology, deployable targets, and network boundaries.
- **[Vendor Lock-in & Portability Policy](file:///home/kunalkashyap8024/sop/debo/docs/architecture/vendor-lock-in.md)** — Abstraction layers and zero-vendor-capture guarantees.
- **[Specs vs ADRs vs Plans Distinction](file:///home/kunalkashyap8024/sop/debo/docs/architecture/adr-spec-plan-distinction.md)** — Conceptual taxonomy of documentation artifacts.
- **[Master Agent Operating Constitution](file:///home/kunalkashyap8024/sop/debo/AGENTS.md)** — Non-negotiable rules for human and AI coding agents.

### Architecture Decision Records (ADRs)
- **[ADR Index & Lifecycle](file:///home/kunalkashyap8024/sop/debo/docs/adr/README.md)** — Historical context and justifications for all 15 accepted decisions:
  - [ADR-0001: Repository Strategy](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0001-repository-strategy.md) (Bun Workspaces + Turborepo)
  - [ADR-0002: Language Strategy](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0002-language-strategy.md) (TypeScript Primary + Python Worker)
  - [ADR-0003: Memory Engine](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0003-memory-engine.md) (Supermemory Core + `MemoryProvider` Abstraction)
  - [ADR-0004: Agent Runtime](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0004-agent-runtime.md) (LangGraph JS Cyclic Graphs)
  - [ADR-0005: Workflow Runtime](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0005-workflow-runtime.md) (Trigger.dev v3 Durable Execution)
  - [ADR-0006: Agent UI Layer](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0006-agent-ui.md) (AG-UI Protocol + Editorial Design)
  - [ADR-0007: Model Context Protocol](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0007-mcp.md) (Official TypeScript SDK at `mcp.debo.life`)
  - [ADR-0008: External Connectors](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0008-connectors.md) (Composio Actions + Nango Sync)
  - [ADR-0009: Database](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0009-database.md) (Neon Serverless PostgreSQL + Drizzle ORM)
  - [ADR-0010: Storage](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0010-storage.md) (Cloudflare R2 Immutable Storage)
  - [ADR-0011: Document Processing](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0011-document-processing.md) (Docling Layout & Table Parsing)
  - [ADR-0012: Deployment Topology](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0012-deployment.md) (Vercel Web + Cloudflare Edge + VPS Workers)
  - [ADR-0013: Observability](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0013-observability.md) (OpenTelemetry + LangSmith + Sentry)
  - [ADR-0014: Security Architecture](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0014-security.md) (Deterministic Non-LLM Authority)
  - [ADR-0015: Multi-Tenancy Hierarchy](file:///home/kunalkashyap8024/sop/debo/docs/adr/ADR-0015-multi-tenancy.md) (User -> Workspace -> Membership)

### Technology Research & Scorecards
- **[Research Methodology & Protocol](file:///home/kunalkashyap8024/sop/debo/docs/research/README.md)** — Primary evidence hierarchy and 20 evaluation vectors.
- **[Comparative Technology Scorecard](file:///home/kunalkashyap8024/sop/debo/docs/research/scorecard.md)** — Empirical 17-vector weighted ratings.
- **Evaluated Candidates**: [Supermemory](file:///home/kunalkashyap8024/sop/debo/docs/research/supermemory.md), [Mem0](file:///home/kunalkashyap8024/sop/debo/docs/research/mem0.md), [Hindsight](file:///home/kunalkashyap8024/sop/debo/docs/research/hindsight.md), [Graphiti](file:///home/kunalkashyap8024/sop/debo/docs/research/graphiti.md), [LangGraph](file:///home/kunalkashyap8024/sop/debo/docs/research/langgraph.md), [Composio](file:///home/kunalkashyap8024/sop/debo/docs/research/composio.md), [Trigger.dev](file:///home/kunalkashyap8024/sop/debo/docs/research/trigger-dev.md), [Inngest](file:///home/kunalkashyap8024/sop/debo/docs/research/inngest.md), [Docling](file:///home/kunalkashyap8024/sop/debo/docs/research/docling.md), [Stagehand](file:///home/kunalkashyap8024/sop/debo/docs/research/stagehand.md), [CopilotKit](file:///home/kunalkashyap8024/sop/debo/docs/research/copilotkit.md), [assistant-ui](file:///home/kunalkashyap8024/sop/debo/docs/research/assistant-ui.md), [AG-UI](file:///home/kunalkashyap8024/sop/debo/docs/research/ag-ui.md), [MCP SDK](file:///home/kunalkashyap8024/sop/debo/docs/research/mcp-sdk.md), [LLM Providers & Routing](file:///home/kunalkashyap8024/sop/debo/docs/research/llm-providers.md).

### Memory Subsystem & Evaluation
- **[Memory Architecture Overview](file:///home/kunalkashyap8024/sop/debo/docs/memory/README.md)** — Semantic, episodic, declarative, and temporal memory graphs.
- **[Source Grounding & Attribution](file:///home/kunalkashyap8024/sop/debo/docs/memory/source-grounding.md)** — Non-negotiable citation invariants and uncertainty markers.
- **[Memory Lifecycle Specification](file:///home/kunalkashyap8024/sop/debo/docs/memory/lifecycle.md)** — State machine: `CAPTURED` -> `ACTIVE` -> `SUPERSEDED` -> `DELETED`.
- **[Provider Abstraction Contract](file:///home/kunalkashyap8024/sop/debo/docs/memory/provider-abstraction.md)** — Core `MemoryProvider` TypeScript interface.
- **[Memory Evaluation Plan](file:///home/kunalkashyap8024/sop/debo/docs/memory/evaluation-plan.md)** — Hypotheses validation and decision matrix.
- **[Memory Benchmark Suite](file:///home/kunalkashyap8024/sop/debo/docs/evals/memory/benchmark-suite.md)** — 7 benchmark tracks and mathematical scoring formulas.
- **[Test Dataset Structure](file:///home/kunalkashyap8024/sop/debo/docs/evals/memory/test-dataset-structure.md)** — JSON schema for synthetic evaluation fixtures.

### Agents, MCP & Skills
- **[Agent Intelligence Overview](file:///home/kunalkashyap8024/sop/debo/docs/agents/README.md)** — LangGraph cyclic graph reasoning and state models.
- **[Graph Orchestration & Checkpointing](file:///home/kunalkashyap8024/sop/debo/docs/agents/orchestration.md)** — Nodes, reducers, and resumption semantics.
- **[Agent Permissions & Approval Gates](file:///home/kunalkashyap8024/sop/debo/docs/agents/permissions.md)** — Deterministic Risk Tiers and human interrupt gates.
- **[Agent Memory Access Policy](file:///home/kunalkashyap8024/sop/debo/docs/agents/memory-policy.md)** — Capability scopes (`agent.read.memory`, `agent.write.tasks`, etc.).
- **[Dynamic Model Routing](file:///home/kunalkashyap8024/sop/debo/docs/agents/model-routing.md)** — Task-to-model cost and latency optimization.
- **[MCP Server Architecture](file:///home/kunalkashyap8024/sop/debo/docs/mcp/README.md)** — Dual transports, discovery, and rate limits.
- **[MCP Tools Taxonomy](file:///home/kunalkashyap8024/sop/debo/docs/mcp/tools-taxonomy.md)** — 21 standard Debo MCP tools design contracts.
- **[MCP Security & Threat Model](file:///home/kunalkashyap8024/sop/debo/docs/mcp/security.md)** — Indirect injection, confused deputy, and SSRF defenses.
- **[MCP Apps & Interactive Canvases](file:///home/kunalkashyap8024/sop/debo/docs/mcp/mcp-apps.md)** — Delivering sandboxed UI frames into host agents.
- **[Portable Skills Architecture](file:///home/kunalkashyap8024/sop/debo/docs/skills/README.md)** — Skills vs. MCP distinction and catalog.
- **[Skill File Specification](file:///home/kunalkashyap8024/sop/debo/docs/skills/specification.md)** — YAML frontmatter format for `SKILL.md`.

### Connectors & Workflows
- **[Connectors Strategy](file:///home/kunalkashyap8024/sop/debo/docs/connectors/strategy.md)** — Composio (Actions) vs. Nango (Sync) vs. Airbyte.
- **[Credential Handling Rule](file:///home/kunalkashyap8024/sop/debo/docs/connectors/credential-handling.md)** — Prohibiting plaintext third-party tokens in Debo tables.
- **[Durable Workflows Overview](file:///home/kunalkashyap8024/sop/debo/docs/workflows/README.md)** — Trigger.dev v3 background task architecture.
- **[Application Event Catalog](file:///home/kunalkashyap8024/sop/debo/docs/workflows/event-model.md)** — Typed event definitions (`source.*`, `memory.*`, `workflow.*`).

### Data Model & Multi-Tenancy
- **[Data Persistence Overview](file:///home/kunalkashyap8024/sop/debo/docs/data-model/README.md)** — Relational authority and ULID identifier standards.
- **[Domain Entity Specifications](file:///home/kunalkashyap8024/sop/debo/docs/data-model/entities.md)** — Complete schemas for all 24 platform entities.
- **[Tenancy & Isolation Model](file:///home/kunalkashyap8024/sop/debo/docs/data-model/tenancy.md)** — Personal vs. Team workspaces and RBAC matrix.
- **[Immutable Audit Event Model](file:///home/kunalkashyap8024/sop/debo/docs/data-model/audit-log.md)** — Append-only audit logging and retention rules.

### Security, Privacy & Operations
- **[Master Security Policy](file:///home/kunalkashyap8024/sop/debo/SECURITY.md)** — Coordinated vulnerability disclosure and reporting contacts.
- **[Security Architecture Overview](file:///home/kunalkashyap8024/sop/debo/docs/security/README.md)** — Zero-trust access invariants.
- **[System Threat Model (STRIDE)](file:///home/kunalkashyap8024/sop/debo/docs/security/threat-model.md)** — Threat vectors and mitigations.
- **[Secret Management Protocol](file:///home/kunalkashyap8024/sop/debo/docs/security/secrets.md)** — Hygiene rules across Local, CI, Vercel, and VPS tiers.
- **[Privacy Architecture & Governance](file:///home/kunalkashyap8024/sop/debo/docs/privacy/README.md)** — Data retention, export, and provider exposure rules.
- **[Privacy Compliance Status Matrix](file:///home/kunalkashyap8024/sop/debo/docs/privacy/compliance-matrix.md)** — Real status tracking (planned / implemented / verified).
- **[Disaster Recovery & Backup Runbook](file:///home/kunalkashyap8024/sop/debo/docs/operations/disaster-recovery.md)** — RTO/RPO targets and full system reconstruction.
- **[Local Developer Environment](file:///home/kunalkashyap8024/sop/debo/docs/operations/local-dev.md)** — Tooling prerequisites and quickstart commands.

### Infrastructure & Deployment
- **[Infrastructure Architecture Overview](file:///home/kunalkashyap8024/sop/debo/docs/infrastructure/README.md)** — Multi-tier topology.
- **[VPS Hardening & Capacity Profiles](file:///home/kunalkashyap8024/sop/debo/docs/infrastructure/vps.md)** — Compute profiles (Development, Small Prod, Growth).
- **[Domain & DNS Architecture](file:///home/kunalkashyap8024/sop/debo/docs/infrastructure/domains-dns.md)** — Hostname routing, TLS 1.3, and access controls.
- **[Cloudflare & Zero-Trust Tunnel](file:///home/kunalkashyap8024/sop/debo/docs/infrastructure/cloudflare.md)** — Ingress routing, R2 bucket configurations.
- **[Docker & Container Policy](file:///home/kunalkashyap8024/sop/debo/docs/infrastructure/docker.md)** — When and when not to use Docker.

### Product & Design System
- **[Minimum Viable Product (MVP)](file:///home/kunalkashyap8024/sop/debo/docs/product/mvp.md)** — The core verification loop.
- **[Feature Priority Matrix](file:///home/kunalkashyap8024/sop/debo/docs/product/priority.md)** — P0, P1, P2, P3 classification based on user value and risk.
- **[Application Routes Specification](file:///home/kunalkashyap8024/sop/debo/docs/product/routes.md)** — Complete route tree, data needs, and states.
- **[Editorial Design System](file:///home/kunalkashyap8024/sop/debo/docs/design-system/README.md)** — Visual identity and Impeccable Design principles.
- **[Design Tokens & Typography](file:///home/kunalkashyap8024/sop/debo/docs/design-system/tokens.md)** — CSS variables, Albert Sans, JetBrains Mono, breakpoints.
- **[Design Agent Guidelines](file:///home/kunalkashyap8024/sop/debo/docs/ai/design-agent-guidelines.md)** — Eliminating AI slop and UI self-critique checklists.
- **[Context Loading Protocol](file:///home/kunalkashyap8024/sop/debo/docs/ai/context-loading.md)** — Documentation subset map for coding agents.

### Contracts & Testing
- **[System Contracts Index](file:///home/kunalkashyap8024/sop/debo/docs/contracts/README.md)** — Type-safe boundary definitions.
- **[HTTP API Contract](file:///home/kunalkashyap8024/sop/debo/docs/contracts/http-api.md)** — Web client REST and streaming routes.
- **[MCP Contract](file:///home/kunalkashyap8024/sop/debo/docs/contracts/mcp.md)** — JSON schemas for MCP tools.
- **[Memory Provider Contract](file:///home/kunalkashyap8024/sop/debo/docs/contracts/memory-provider.md)** — TypeScript interface for vector backends.
- **[Connector Provider Contract](file:///home/kunalkashyap8024/sop/debo/docs/contracts/connector-provider.md)** — Action connector interface.
- **[Document Worker Contract (TS ↔ Python)](file:///home/kunalkashyap8024/sop/debo/docs/contracts/document-worker.md)** — Job contract for Docling OCR.
- **[Agent State Contract](file:///home/kunalkashyap8024/sop/debo/docs/contracts/agent-state.md)** — LangGraph state annotations and channels.
- **[Testing Strategy & Quality Gates](file:///home/kunalkashyap8024/sop/debo/docs/testing/README.md)** — Multi-layer testing pyramid and blocking gates.
- **[Contract Testing Strategy](file:///home/kunalkashyap8024/sop/debo/docs/testing/contracts.md)** — Schema fuzzing and mock harnesses.

### Engineering Standards & Governance
- **[Error Handling & Resilience](file:///home/kunalkashyap8024/sop/debo/docs/engineering/error-handling.md)** — Typed errors, retries, and compensation.
- **[Change Management Protocol](file:///home/kunalkashyap8024/sop/debo/docs/engineering/change-management.md)** — Proposal to research to ADR to verification.
- **[Dependencies Registry](file:///home/kunalkashyap8024/sop/debo/docs/engineering/dependencies.md)** — Approved dependencies and licensing review.
- **[Open Source & Supply Chain Policy](file:///home/kunalkashyap8024/sop/debo/docs/oss/README.md)** — Permitted licenses and patching guidelines.

### Planning & Tickets
- **[Engineering Roadmap](file:///home/kunalkashyap8024/sop/debo/docs/planning/ROADMAP.md)** — Phases 0 through 16 overview.
- **[Phases & Exit Criteria](file:///home/kunalkashyap8024/sop/debo/docs/planning/PHASES.md)** — Deliverables and rollback strategies.
- **[Dependency Graph](file:///home/kunalkashyap8024/sop/debo/docs/planning/DEPENDENCIES.md)** — Inter-subsystem prerequisite tree.
- **[Definition of Done](file:///home/kunalkashyap8024/sop/debo/docs/planning/DEFINITION-OF-DONE.md)** — Mandatory standards for ticket completion.
- **[Changelog of Decisions](file:///home/kunalkashyap8024/sop/debo/docs/planning/CHANGELOG-OF-DECISIONS.md)** — Immutable ledger of accepted decisions.
- **[Ticket Backlog](file:///home/kunalkashyap8024/sop/debo/docs/planning/BACKLOG.md)** — DEBO-0001 through DEBO-0027 detailed tickets.
- **[Project Status Dashboard](file:///home/kunalkashyap8024/sop/debo/PROJECT_STATUS.md)** — Live phase tracking and milestone ledger.
