# CLAUDE.md

This repository is in **Phase 0: Clean-Room Rebuild / Documentation-First Bootstrap**.
All legacy application code has been removed. Do NOT attempt to resurrect legacy implementations or frameworks (Mastra, CopilotKit-only, etc.).

## Absolute Guidance
1. **Operating Rules**: Consult [AGENTS.md](file:///home/kunalkashyap8024/sop/debo/AGENTS.md) before undertaking any task.
2. **Context Loading**: Follow [context-loading.md](file:///home/kunalkashyap8024/sop/debo/docs/ai/context-loading.md) to load only the relevant documentation domain.
3. **No Code in Phase 0**: Do not generate product code, API routes, or database migrations during Phase 0. Focus exclusively on specifications, ADRs, research, contracts, and planning artifacts.
4. **Primary Tools**:
   - Monorepo package manager: Bun
   - Agent orchestration: LangGraph JS
   - Workflows: Trigger.dev / Inngest
   - Primary Database: Neon PostgreSQL
   - Object Store: Cloudflare R2
   - Document Processing: Docling (Python Worker)
