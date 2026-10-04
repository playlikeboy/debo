# Status
accepted

# Context
Debo requires a robust, relational, ACID-compliant database to serve as the canonical source of truth for business data: users, workspaces, membership permissions, sources, metadata catalogs, memory relations, tasks, decisions, audit logs, and approval records. The database must support serverless auto-scaling, instant schema branching for CI/preview environments, and strict type safety.

# Decision
We adopt **Neon Serverless PostgreSQL** as Debo's primary relational database, accessed exclusively through **Drizzle ORM** within `@debo/db`:
- All tables, relations, and enums are defined in TypeScript schema files (`packages/db/src/schema/*`).
- Schema migrations are managed deterministically via `drizzle-kit`.
- Every table includes explicit multi-tenant foreign keys (`workspaceId`) and audit timestamps (`createdAt`, `updatedAt`).

# Alternatives
1. **Prisma ORM**: Evaluated. Prisma's heavyweight binary engine introduces cold-start latency in serverless environments, and its DSL separates schema from pure TypeScript types.
2. **Supabase PostgreSQL**: Excellent alternative, but Neon's instant copy-on-write database branching provides superior preview environment isolation and CI testing workflows.
3. **Pure NoSQL / MongoDB**: Rejected. Debo's domain model involves complex relations (sources, chunks, entities, citations, approvals) requiring relational integrity and foreign keys.

# Why
Neon provides serverless PostgreSQL that scales to zero during inactivity while scaling seamlessly under load. Drizzle ORM provides zero-overhead, SQL-like query builders with complete TypeScript type inference and no binary dependencies.

# Consequences
- **Positive**: Strict relational guarantees; zero cold-start binary penalty; instant database branching per Git feature branch; end-to-end type safety.
- **Negative**: Requires connection pooling (`@neondatabase/serverless`) when connecting from serverless environments with high concurrency.

# Migration / Exit Strategy
Because Drizzle generates standard standard PostgreSQL schemas and SQL queries, migrating away from Neon to self-hosted PostgreSQL (RDS, Supabase, self-hosted VPS PostgreSQL) requires only changing the connection string.

# Evidence
- Neon Serverless Documentation: `https://neon.tech/docs`
- Drizzle ORM Benchmarks: Zero query compilation overhead, lightweight bundle footprint.
