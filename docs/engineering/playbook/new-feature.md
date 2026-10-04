# Playbook: Implementing a New Feature

This playbook guides engineering agents through implementing a vertical feature slice in Debo.

---

## Step 1: Pre-Implementation Checks
1. Identify the task ID from `docs/planning/TASKS.yaml`.
2. Check dependencies in `docs/planning/dependency-graph.md`. Do not start if upstream tasks are not verified.
3. Review relevant normative specifications in `docs/specs/` and ADRs in `docs/adr/`.
4. Create an isolated git branch or worktree: `agent/<specialization>/<task-id>`.

## Step 2: Implementation Sequence (Vertical Slice)
1. **Types & Primitives**: Define domain interfaces and schema shapes in `@debo/types`.
2. **Database & Persistence**: Update Drizzle schema in `@debo/db`, generate migration, and write repository queries with explicit `workspace_id` scoping.
3. **Domain Service**: Write business logic and permission enforcement in domain package. Ensure the Non-LLM Authority invariant is strictly observed.
4. **API / Transport Layer**: Expose endpoint in `apps/web/app/api/...` with Zod validation, typed response envelope, and request correlation IDs.
5. **UI / Presentation**: If user-facing, build calm editorial component in `packages/ui` or `apps/web` conforming to `pbakaus/impeccable` design rules.

## Step 3: Verification & Testing
1. Write focused unit tests.
2. Run typecheck: `bun run typecheck`.
3. Run linter: `bun run lint`.
4. Run tests: `bun test <path>`.

## Step 4: Documentation & State Handoff
1. Update `docs/planning/TASKS.yaml` status to `review` or `verified`.
2. Append handoff report to `docs/engineering/agent-state/handoffs.md`.
3. Record commit in `docs/engineering/commit-ledger.md`.
4. Commit using conventional format: `feat(<scope>): <description>`.
5. Push to GitHub and submit PR.
