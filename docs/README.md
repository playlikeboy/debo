# Debo Documentation Map & Architectural Navigator

Welcome to the definitive documentation index for the Debo platform. 
Every major architectural decision, interface contract, threat model, and product specification is indexed below.

---

## 1. Navigable Knowledge Index

### Foundational Architecture & Philosophy
- **[System Overview & Boundaries](docs/architecture/system-overview.md)** — Core monorepo topology, deployable targets, and network boundaries.
- **[Vendor Lock-in & Portability Policy](docs/architecture/vendor-lock-in.md)** — Abstraction layers and zero-vendor-capture guarantees.
- **[Specs vs ADRs vs Plans Distinction](docs/architecture/adr-spec-plan-distinction.md)** — Conceptual taxonomy of documentation artifacts.
- **[Master Agent Operating Constitution](AGENTS.md)** — Non-negotiable rules for human and AI coding agents.

### Architecture Decision Records (ADRs)
- **[ADR Index & Lifecycle](docs/adr/README.md)** — Historical context and justifications for all 15 accepted decisions:
  - [ADR-0001: Repository Strategy](docs/adr/ADR-0001-repository-strategy.md) (Bun Workspaces + Turborepo)
  - [ADR-0002: Language Strategy](docs/adr/ADR-0002-language-strategy.md) (TypeScript Primary + Python Worker)
  - [ADR-0003: Memory Engine](docs/adr/ADR-0003-memory-engine.md) (Supermemory Core + `MemoryProvider` Abstraction)
  - [ADR-0004: Agent Runtime](docs/adr/ADR-0004-agent-runtime.md) (LangGraph JS Cyclic Graphs)
  - [ADR-0005: Workflow Runtime](docs/adr/ADR-0005-workflow-runtime.md) (Trigger.dev 4.x Durable Execution)
  - [ADR-0006: Agent UI Layer](docs/adr/ADR-0006-agent-ui.md) (AG-UI Protocol + Editorial Design)
  - [ADR-0007: Model Context Protocol](docs/adr/ADR-0007-mcp.md) (Official TypeScript SDK at `mcp.debo.life`)
  - [ADR-0008: External Connectors](docs/adr/ADR-0008-connectors.md) (Composio Actions + Nango Sync)
  - [ADR-0009: Database](docs/adr/ADR-0009-database.md) (Neon Serverless PostgreSQL + Drizzle ORM)
  - [ADR-0010: Storage](docs/adr/ADR-0010-storage.md) (Cloudflare R2 Immutable Storage)
  - [ADR-0011: Document Processing](docs/adr/ADR-0011-document-processing.md) (Docling Layout & Table Parsing)
  - [ADR-0012: Deployment Topology](docs/adr/ADR-0012-deployment.md) (Vercel Web + Cloudflare Edge + VPS Workers)
  - [ADR-0013: Observability](docs/adr/ADR-0013-observability.md) (OpenTelemetry + LangSmith + Sentry)
  - [ADR-0014: Security Architecture](docs/adr/ADR-0014-security.md) (Deterministic Non-LLM Authority)
  - [ADR-0015: Multi-Tenancy Hierarchy](docs/adr/ADR-0015-multi-tenancy.md) (User -> Workspace -> Membership)
  - [ADR-0016: Identity & Auth Migration](docs/adr/ADR-0016-better-auth-migration.md) (Better Auth + Drizzle Adapter + API Key Plugin)
  - [ADR-0017: Billing Plans & Quotas](docs/adr/ADR-0017-billing-plans-and-quotas.md) (Plan Tiers & Feature Gating)

### Technology Research & Scorecards
- **[Research Methodology & Protocol](docs/research/README.md)** — Primary evidence hierarchy and 20 evaluation vectors.
- **[Comparative Technology Scorecard](docs/research/scorecard.md)** — Evidence-based comparative assessments.
- **Evaluated Candidates**: [Supermemory](docs/research/supermemory.md), [Mem0](docs/research/mem0.md), [Hindsight](docs/research/hindsight.md), [Graphiti](docs/research/graphiti.md), [LangGraph](docs/research/langgraph.md), [Composio](docs/research/composio.md), [Trigger.dev](docs/research/trigger-dev.md), [Inngest](docs/research/inngest.md), [Docling](docs/research/docling.md), [Stagehand](docs/research/stagehand.md), [CopilotKit](docs/research/copilotkit.md), [assistant-ui](docs/research/assistant-ui.md), [AG-UI](docs/research/ag-ui.md), [MCP SDK](docs/research/mcp-sdk.md), [LLM Providers & Routing](docs/research/llm-providers.md).

### Memory Subsystem & Evaluation
- **[Memory Architecture Overview](docs/memory/README.md)** — Semantic, episodic, declarative, and temporal memory graphs.
- **[Source Grounding & Attribution](docs/memory/source-grounding.md)** — Non-negotiable citation invariants and uncertainty markers.
- **[Memory Lifecycle Specification](docs/memory/lifecycle.md)** — State machine: `CAPTURED` -> `ACTIVE` -> `SUPERSEDED` -> `DELETED`.
- **[Provider Abstraction Contract](docs/memory/provider-abstraction.md)** — Core `MemoryProvider` TypeScript interface.
- **[Memory Evaluation Plan](docs/memory/evaluation-plan.md)** — Hypotheses validation and decision matrix.
- **[Memory Benchmark Suite](docs/evals/memory/benchmark-suite.md)** — 7 benchmark tracks and mathematical scoring formulas.
- **[Test Dataset Structure](docs/evals/memory/test-dataset-structure.md)** — JSON schema for synthetic evaluation fixtures.

### Agents, MCP & Skills
- **[Agent Intelligence Overview](docs/agents/README.md)** — LangGraph cyclic graph reasoning and state models.
- **[Graph Orchestration & Checkpointing](docs/agents/orchestration.md)** — Nodes, reducers, and resumption semantics.
- **[Agent Permissions & Approval Gates](docs/agents/permissions.md)** — Deterministic Risk Tiers and human interrupt gates.
- **[Agent Memory Access Policy](docs/agents/memory-policy.md)** — Capability scopes (`agent.read.memory`, `agent.write.tasks`, etc.).
- **[Dynamic Model Routing](docs/agents/model-routing.md)** — Task-to-model cost and latency optimization.
- **[MCP Server Architecture](docs/mcp/README.md)** — Dual transports, discovery, and rate limits.
- **[MCP Tools Taxonomy](docs/mcp/tools-taxonomy.md)** — 21 standard Debo MCP tools design contracts.
- **[MCP Security & Threat Model](docs/mcp/security.md)** — Indirect injection, confused deputy, and SSRF defenses.
- **[MCP Apps & Interactive Canvases](docs/mcp/mcp-apps.md)** — Delivering sandboxed UI frames into host agents.
- **[Portable Skills Architecture](docs/skills/README.md)** — Skills vs. MCP distinction and catalog.
- **[Skill File Specification](docs/skills/specification.md)** — YAML frontmatter format for `SKILL.md`.

### Connectors & Workflows
- **[Connectors Strategy](docs/connectors/strategy.md)** — Composio (Actions) vs. Nango (Sync) vs. Airbyte.
- **[Credential Handling Rule](docs/connectors/credential-handling.md)** — Prohibiting plaintext third-party tokens in Debo tables.
- **[Durable Workflows Overview](docs/workflows/README.md)** — Trigger.dev 4.x background task architecture.
- **[Application Event Catalog](docs/workflows/event-model.md)** — Typed event definitions (`source.*`, `memory.*`, `workflow.*`).

### Data Model & Multi-Tenancy
- **[Data Persistence Overview](docs/data-model/README.md)** — Relational authority and ULID identifier standards.
- **[Domain Entity Specifications](docs/data-model/entities.md)** — Complete schemas for all 24 platform entities.
- **[Tenancy & Isolation Model](docs/data-model/tenancy.md)** — Personal vs. Team workspaces and RBAC matrix.
- **[Immutable Audit Event Model](docs/data-model/audit-log.md)** — Append-only audit logging and retention rules.

### Security, Privacy & Operations
- **[Master Security Policy](SECURITY.md)** — Coordinated vulnerability disclosure and reporting contacts.
- **[Security Architecture Overview](docs/security/README.md)** — Zero-trust access invariants.
- **[System Threat Model (STRIDE)](docs/security/threat-model.md)** — Threat vectors and mitigations.
- **[Secret Management Protocol](docs/security/secrets.md)** — Hygiene rules across Local, CI, Vercel, and VPS tiers.
- **[Privacy Architecture & Governance](docs/privacy/README.md)** — Data retention, export, and provider exposure rules.
- **[Privacy Compliance Status Matrix](docs/privacy/compliance-matrix.md)** — Real status tracking (planned / implemented / verified).
- **[Disaster Recovery & Backup Runbook](docs/operations/disaster-recovery.md)** — RTO/RPO targets and full system reconstruction.
- **[Local Developer Environment](docs/operations/local-dev.md)** — Tooling prerequisites and quickstart commands.

### Infrastructure & Deployment
- **[Infrastructure Architecture Overview](docs/infrastructure/README.md)** — Multi-tier topology.
- **[VPS Hardening & Capacity Profiles](docs/infrastructure/vps.md)** — Compute profiles (Development, Small Prod, Growth).
- **[Domain & DNS Architecture](docs/infrastructure/domains-dns.md)** — Hostname routing, TLS 1.3, and access controls.
- **[Cloudflare & Zero-Trust Tunnel](docs/infrastructure/cloudflare.md)** — Ingress routing, R2 bucket configurations.
- **[Docker & Container Policy](docs/infrastructure/docker.md)** — When and when not to use Docker.

### Product & Design System
- **[Minimum Viable Product (MVP)](docs/product/mvp.md)** — The core verification loop.
- **[Feature Priority Matrix](docs/product/priority.md)** — P0, P1, P2, P3 classification based on user value and risk.
- **[Application Routes Specification](docs/product/routes.md)** — Complete route tree, data needs, and states.
- **[Editorial Design System](docs/design-system/README.md)** — Visual identity and Impeccable Design principles.
- **[Design Tokens & Typography](docs/design-system/tokens.md)** — CSS variables, Albert Sans, JetBrains Mono, breakpoints.
- **[Design Agent Guidelines](docs/ai/design-agent-guidelines.md)** — Eliminating AI slop and UI self-critique checklists.
- **[Context Loading Protocol](docs/ai/context-loading.md)** — Documentation subset map for coding agents.

### Contracts & Testing
- **[System Contracts Index](docs/contracts/README.md)** — Type-safe boundary definitions.
- **[HTTP API Contract](docs/contracts/http-api.md)** — Web client REST and streaming routes.
- **[MCP Contract](docs/contracts/mcp.md)** — JSON schemas for MCP tools.
- **[Memory Provider Contract](docs/contracts/memory-provider.md)** — TypeScript interface for vector backends.
- **[Connector Provider Contract](docs/contracts/connector-provider.md)** — Action connector interface.
- **[Document Worker Contract (TS ↔ Python)](docs/contracts/document-worker.md)** — Job contract for Docling OCR.
- **[Agent State Contract](docs/contracts/agent-state.md)** — LangGraph state annotations and channels.
- **[Testing Strategy & Quality Gates](docs/testing/README.md)** — Multi-layer testing pyramid and blocking gates.
- **[Contract Testing Strategy](docs/testing/contracts.md)** — Schema fuzzing and mock harnesses.

### Engineering Standards & Governance
- **[Error Handling & Resilience](docs/engineering/error-handling.md)** — Typed errors, retries, and compensation.
- **[Change Management Protocol](docs/engineering/change-management.md)** — Proposal to research to ADR to verification.
- **[Dependencies Registry](docs/engineering/dependencies.md)** — Approved dependencies and licensing review.
- **[Open Source & Supply Chain Policy](docs/oss/README.md)** — Permitted licenses and patching guidelines.

### Planning & Tickets
- **[Engineering Roadmap](docs/planning/ROADMAP.md)** — Phases 0 through 16 overview.
- **[Phases & Exit Criteria](docs/planning/PHASES.md)** — Deliverables and rollback strategies.
- **[Dependency Graph](docs/planning/DEPENDENCIES.md)** — Inter-subsystem prerequisite tree.
- **[Definition of Done](docs/planning/DEFINITION-OF-DONE.md)** — Mandatory standards for ticket completion.
- **[Changelog of Decisions](docs/planning/CHANGELOG-OF-DECISIONS.md)** — Immutable ledger of accepted decisions.
- **[Ticket Backlog](docs/planning/BACKLOG.md)** — DEBO-0001 through DEBO-0027 detailed tickets.
- **[Project Status Dashboard](PROJECT_STATUS.md)** — Live phase tracking and milestone ledger.


## Documentation Quality

The Phase 0 documentation reconciliation record is maintained in [documentation-audit.md](audits/documentation-audit.md).
