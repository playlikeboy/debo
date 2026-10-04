# Debo Engineering Agent Registry

This registry formally specifies the roles, missions, scopes, allowed paths, forbidden paths, required docs, and handoff protocols for all autonomous and human engineering agents working on Debo.

---

## 1. Governance Rules for Agents

1. **Strict Path Bounding**: Agents must only modify files inside their `allowed_paths`. Any change outside their boundary requires explicit orchestrator approval.
2. **Deterministic Security**: Agents may never weaken tenant isolation (`workspace_id`), bypass permission checks, or invent permissions.
3. **No Unverified Claims**: Never declare a task completed, tested, or verified without actual test logs, compilation evidence, and commit SHAs.
4. **Handoff Compliance**: Every agent run must conclude with a standardized handoff report adhering to Section 74 of the Build Master Prompt.

---

## 2. Agent Roster

### 1. Foundation Agent
- **Mission**: Manage monorepo build tools, Bun workspaces, Turborepo pipelines, TypeScript configurations, linting, formatting, and CI workflows.
- **Allowed Paths**: `package.json`, `turbo.json`, `tsconfig.base.json`, `biome.json`, `.github/workflows/*`, `packages/config/*`, `packages/types/*`.
- **Forbidden Paths**: Domain packages (`packages/db`, `packages/memory`), apps business code (`apps/web`, `apps/mcp`).
- **Required Docs**: `AGENTS.md`, `docs/engineering/dependencies.md`, `docs/specs/deployment-spec.md`.
- **Verification Commands**: `bun install`, `bun run build`, `bun run typecheck`, `bun test`.

### 2. Database Agent
- **Mission**: Maintain the Neon PostgreSQL relational model in Drizzle ORM, foreign-key cascades, indexes, migrations, and repository access layers.
- **Allowed Paths**: `packages/db/*`, `packages/types/src/entities/*`.
- **Forbidden Paths**: UI components (`packages/ui`, `apps/web`), external connectors.
- **Required Docs**: `docs/data-model/entities.md`, `docs/data-model/tenancy.md`, `docs/adr/ADR-0009-database.md`.
- **Verification Commands**: `bun run db:generate`, `bun test packages/db`.

### 3. Auth & Security Agent
- **Mission**: Enforce deterministic identity resolution, workspace membership verification, Non-LLM Authority invariant, RBAC/ABAC guards, and secret safety.
- **Allowed Paths**: `packages/auth/*`, `packages/permissions/*`, `docs/security/*`.
- **Forbidden Paths**: Direct UI styling, memory extraction logic.
- **Required Docs**: `AGENTS.md`, `SECURITY.md`, `docs/security/threat-model.md`, `docs/specs/security-spec.md`.
- **Verification Commands**: `bun test packages/auth packages/permissions`.

### 4. Storage Agent
- **Mission**: Manage Cloudflare R2 object storage abstractions, streaming uploads, mime validation, and time-limited AWS SigV4 presigned URLs.
- **Allowed Paths**: `packages/storage/*`.
- **Forbidden Paths**: Direct database mutations, agent graphs.
- **Required Docs**: `docs/specs/storage-spec.md`, `docs/infrastructure/cloudflare.md`.
- **Verification Commands**: `bun test packages/storage`.

### 5. Memory Agent
- **Mission**: Author the `MemoryProvider` contract, Supermemory SDK integration, semantic recall, temporal metadata filtering, and degraded fallback logic.
- **Allowed Paths**: `packages/memory/*`.
- **Forbidden Paths**: Raw R2 blob manipulation, external third-party OAuth handling.
- **Required Docs**: `docs/memory/*`, `docs/contracts/memory-provider.md`, `docs/adr/ADR-0003-memory-engine.md`.
- **Verification Commands**: `bun test packages/memory`.

### 6. Provenance & Citations Agent
- **Mission**: Enforce source grounding, character span offsets, PDF bounding boxes, audio timecodes, and strict anti-hallucination quote verifiers.
- **Allowed Paths**: `packages/citations/*`, `docs/evals/memory/*`.
- **Forbidden Paths**: Database migrations, frontend page routes.
- **Required Docs**: `docs/memory/source-grounding.md`, `docs/evals/memory/benchmark-suite.md`.
- **Verification Commands**: `bun test packages/citations`.

### 7. LangGraph Agent
- **Mission**: Compile cyclic state graphs, deterministic checkpointing, token streaming, tool call execution pipelines, and human approval interrupts.
- **Allowed Paths**: `packages/agent/*`, `docs/agents/*`.
- **Forbidden Paths**: UI presentation rendering, direct SQL mutations.
- **Required Docs**: `docs/agents/orchestration.md`, `docs/contracts/agent-state.md`, `docs/adr/ADR-0004-agent-runtime.md`.
- **Verification Commands**: `bun test packages/agent`.

### 8. Workflows Agent
- **Mission**: Build Trigger.dev v3 background task pipelines, durable retries, cron schedules, event triggers, and idempotency guards.
- **Allowed Paths**: `packages/workflows/*`, `apps/worker/*`.
- **Forbidden Paths**: Interactive client UI, MCP endpoints.
- **Required Docs**: `docs/workflows/event-model.md`, `docs/specs/workflow-spec.md`, `docs/adr/ADR-0005-workflow-runtime.md`.
- **Verification Commands**: `bun test apps/worker`.

### 9. Document Worker Agent
- **Mission**: Maintain the Python Docling FastAPI microservice for high-fidelity OCR, layout analysis, table extraction, and PDF bounding boxes.
- **Allowed Paths**: `apps/document-worker/*`.
- **Forbidden Paths**: TypeScript monorepo packages, frontend components.
- **Required Docs**: `docs/contracts/document-worker.md`, `docs/adr/ADR-0011-document-processing.md`.
- **Verification Commands**: `pytest apps/document-worker/tests`.

### 10. MCP Gateway Agent
- **Mission**: Expose official Model Context Protocol tools, resources, and prompts over Streamable HTTP and stdio at `mcp.debo.life`.
- **Allowed Paths**: `packages/mcp/*`, `apps/mcp/*`.
- **Forbidden Paths**: Frontend application UI, direct database migrations.
- **Required Docs**: `docs/mcp/*`, `docs/contracts/mcp.md`, `docs/adr/ADR-0007-mcp.md`.
- **Verification Commands**: `bun test apps/mcp`.

### 11. Connectors Agent
- **Mission**: Integrate Composio for external agent actions and Nango for continuous OAuth sync, protecting external credentials in AES-256-GCM vaults.
- **Allowed Paths**: `packages/connectors/*`.
- **Forbidden Paths**: Direct model reasoning, client page routes.
- **Required Docs**: `docs/connectors/*`, `docs/contracts/connector-provider.md`, `docs/adr/ADR-0008-connectors.md`.
- **Verification Commands**: `bun test packages/connectors`.

### 12. Frontend & Agentic UI Agent
- **Mission**: Build Next.js App Router application (`apps/web`) with AG-UI streaming protocol, calm editorial Radix/Tailwind components adhering to `pbakaus/impeccable`.
- **Allowed Paths**: `packages/ui/*`, `apps/web/*`.
- **Forbidden Paths**: Database migration scripts, Python worker code.
- **Required Docs**: `docs/product/routes.md`, `docs/specs/ui-spec.md`, `docs/design-system/tokens.md`.
- **Verification Commands**: `bun test apps/web`, `bun run build --filter=web`.

### 13. Quality & E2E Verification Agent
- **Mission**: Execute full-system integration tests, memory evaluation benchmarks, regression fixtures, load tests, and security penetration checks.
- **Allowed Paths**: `tests/*`, `docs/evals/*`.
- **Forbidden Paths**: Production application logic modification without review.
- **Required Docs**: `docs/planning/DEFINITION-OF-DONE.md`, `docs/evals/memory/benchmark-suite.md`.
- **Verification Commands**: `bun test`, `bun run test:e2e`.
