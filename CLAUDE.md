# CLAUDE.md

Debo is in **Phase 0: documentation and architecture bootstrap**.

## Required context
1. Read `AGENTS.md`.
2. Follow `docs/ai/context-loading.md`.
3. Check relevant ADRs, specs, contracts, and research before changing architecture.

## Phase 0 boundary
Do not create product code, API routes, migrations, or deployment changes. Work on documentation, research, ADRs, contracts, planning, and evaluations only.

## Current baselines
- TypeScript primary; Python only for document processing.
- LangGraph JS for agent orchestration.
- Trigger.dev 4.x for durable workflows.
- Supermemory behind `MemoryProvider`.
- Neon PostgreSQL + Drizzle for canonical business state.
- Cloudflare R2 for raw source storage.
- MCP 2026-07-28 + official TypeScript SDK v2.
- AG-UI 1.0 as the agent↔UI protocol boundary.

Exact package versions are pinned during Phase 1 after fresh verification. When a baseline changes, update research and the relevant ADR first.
