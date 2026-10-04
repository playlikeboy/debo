# Normative Specification: Relational Data Schema

This document is a normative specification using RFC 2119 language.

---

## 1. Database & Schema Invariants

1. **Relational Authority**: Neon Serverless PostgreSQL MUST be the sole canonical source of truth for business data, tenancy, and audit logs.
2. **Type Safety**: All tables, relations, and enums MUST be authored in TypeScript schema files in `@debo/db` using Drizzle ORM.
3. **Primary Key Standard**: All entity primary keys MUST be 26-character Universally Unique Lexicographically Sortable Identifiers (ULIDs) prefixed by entity type (e.g. `usr_`, `wsp_`, `src_`, `mem_`).
4. **Tenant Foreign Key**: Every table representing workspace context MUST contain an indexed, non-nullable foreign key column `workspace_id` referencing `workspaces.id` with `ON DELETE CASCADE`.
5. **Audit Columns**: All tables MUST contain `created_at` (timestamp with timezone, default now) and `updated_at` columns.
