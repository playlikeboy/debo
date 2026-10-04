# Playbook: Database Migration & Schema Changes

This playbook guides engineering agents through creating safe, backward-compatible relational database migrations for Neon PostgreSQL.

---

## Invariants
1. **Workspace Scoping**: Every table (except `users` and global system tables) MUST have a `workspace_id` column with a foreign key to `workspaces(id)` on delete cascade.
2. **Deterministic IDs**: Primary keys must be prefixed NanoIDs (e.g. `src_`, `mem_`, `chn_`).
3. **No Destructive Drops**: Never drop columns or tables in production without a two-phase deprecation cycle.
4. **Audit Columns**: Every table must include `created_at` and `updated_at` timestamps with UTC timezone.

## Execution Steps
1. Modify table definitions in `packages/db/src/schema/*.ts`.
2. Generate migration SQL: `bun run --filter=@debo/db db:generate`.
3. Inspect generated SQL in `packages/db/drizzle/*.sql` to confirm zero unintended table recreation or data loss.
4. Run integration tests against local PostgreSQL container: `bun test packages/db`.
5. Update `docs/data-model/entities.md` if entity fields changed.
