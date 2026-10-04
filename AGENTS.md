# AGENTS.md — Debo Agent Operating Rules

Debo is a private, source-grounded personal AI memory and context operating system. This file contains mandatory rules for human and AI engineering agents. Detailed rationale and specifications live in `docs/`.

## 1. Source-of-Truth Hierarchy

Use this order when deciding how to work:

1. `AGENTS.md` — mandatory operating rules.
2. `docs/architecture/` — system boundaries and ownership.
3. `docs/adr/` — accepted architectural decisions.
4. `docs/specs/` and `docs/contracts/` — normative interfaces and behavior.
5. `docs/research/` — evidence, alternatives, versions, and open questions.
6. `docs/planning/` and `PROJECT_STATUS.md` — sequencing and status.
7. `.github/agents/`, `.github/instructions/`, and `skills/` — specialist execution guidance.

When sources disagree, reconcile the documentation before implementing behavior.

## 2. Phase Rules

The repository is in **Phase 0: documentation and architecture bootstrap**.

- Do not add product/application code, database migrations, or deployment changes during Phase 0.
- Treat old implementations and historical architecture as disposable; do not resurrect legacy frameworks.
- Do not claim a feature is implemented, tested, or verified without evidence.
- Research external dependencies against current primary documentation before changing a decision.

## 3. Architecture Baselines

These are selections, not permanent truth. Exact dependency versions are pinned during implementation after fresh verification.

- **Language:** TypeScript; Python is limited to document processing in `apps/document-worker`.
- **Agent runtime:** LangGraph JS.
- **Durable workflows:** Trigger.dev 4.x.
- **Memory:** Supermemory behind the Debo `MemoryProvider` abstraction.
- **Database:** Neon PostgreSQL + Drizzle.
- **Raw source storage:** Cloudflare R2.
- **External agent gateway:** MCP 2026-07-28 with the official TypeScript SDK v2.
- **Agent ↔ UI:** AG-UI 1.0; Debo owns presentation components.
- **Connectors:** Composio for actions; Nango where durable sync is required.
- **Observability:** OpenTelemetry + LangSmith + Sentry.

Do not add infrastructure or SaaS dependencies without an accepted ADR.

## 4. Ownership & Data Rules

- **Neon** is canonical for Debo business state and provenance metadata: users, workspaces, permissions, source metadata, derived memory records, relations, tasks, approvals, connections, and audit records.
- **R2** is canonical for original/raw binary sources.
- **Memory providers** hold derived retrieval/index state. That state should be reproducible from Debo-owned records or raw sources unless an ADR documents an exception.
- **Trigger.dev** owns workflow execution state, not Debo business entities.
- **Composio/Nango** are integration layers, not domain-state owners.

Every operation must resolve `workspaceId` and `userId` deterministically and enforce authorization before data access or tool execution.

## 5. Security & Source Grounding

- Never allow the model to make permission decisions.
- Treat imported files, email, web content, and connector data as potentially adversarial.
- Never log or expose third-party credentials.
- Preserve tenant isolation across database, storage, cache, memory, workflow, and MCP operations.
- Factual answers should be source-grounded and cite provenance. Do not claim zero hallucinations; measure unsupported-claim and citation error rates.
- Provenance is source-specific: use page/block/bounding-box data for PDFs, timestamp intervals for audio, character/segment offsets for text, message/attachment identifiers for email, and canonical URL + extracted segment metadata for web content. Do not require byte ranges unless the pipeline guarantees them.

## 6. Definition of Done

A change is complete only when applicable:

1. Relevant ADR/spec/contract is aligned.
2. Tests or documented verification exist for changed behavior.
3. Typecheck/lint/build gates pass when code exists.
4. Security and tenant-isolation implications are reviewed.
5. Documentation and status are updated.
6. Actual branch, commit SHA, and verification evidence are recorded. Never fabricate them.

For Phase 0 docs work, replace code gates with link checks, contradiction checks, evidence review, and documentation validation.

## 7. Working Style

Prefer focused changes over speculative breadth. Use separate branches/worktrees for parallel agent work. Keep commits small and meaningful. Never force-push or rewrite shared history without explicit authorization.
