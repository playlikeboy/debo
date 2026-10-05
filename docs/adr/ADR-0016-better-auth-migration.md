# ADR-0016: Migration from Stack Auth to Better Auth with API Key Plugin

## Status
Accepted (Supersedes previous Stack Auth references in architecture documents)

## Context
Debo requires a sovereign, production-grade authentication, identity, and tenancy architecture. Previously, preliminary design notes referenced Stack Auth as an authentication mechanism. However, audit against Debo's core invariants revealed:
1. **Tenancy Sovereignty**: Debo's domain model relies on Neon PostgreSQL and Drizzle as canonical truth for `User` → `Workspace` → `WorkspaceMember`. External auth solutions that attempt to own organization or tenancy models introduce dual sources of truth and split-brain risks.
2. **First-Party Drizzle Integration**: Better Auth provides native, open-source Drizzle ORM adapters that store all user accounts, sessions, verifications, and API keys directly in Debo's own PostgreSQL database (`users`, `user_sessions`, `accounts`, `verifications`, `api_keys`).
3. **Cryptographically Secure API Keys**: Model Context Protocol (MCP) clients, Cursor IDE, Claude Desktop, and background workers require scoped, unforgeable API keys. Better Auth's official `@better-auth/api-key` plugin enables deterministic key hashing (SHA-256), rate limiting, scope verification, and one-time plaintext generation (`debo_live_...`).
4. **Zero Vendor Lock-in**: Better Auth is fully self-hosted within the Next.js runtime without external dependency on proprietary SaaS auth services.

## Decision
1. **Adopt Better Auth**: Migrate `@debo/auth` to `better-auth@^1.7.7` using `better-auth/adapters/drizzle`.
2. **Adopt Official API Key Plugin**: Integrate `@better-auth/api-key@^1.7.7` for managing workspace API keys.
3. **Preserve Debo Relational Tenancy**: Better Auth manages credentials and session tokens, but Debo's `workspaces` and `workspace_members` tables remain the sole canonical authority for multi-tenancy and authorization. Session records store `active_workspace_id`.
4. **Deterministic Auth Middleware**: Implement `DeboAuthMiddleware` to resolve `TenantContext` strictly from verified API keys or session cookies. Prohibit caller-chosen identity fields (e.g. `workspaceId` in query/headers).
5. **Fail-Closed MCP Resolution**: MCP servers verify keys via timing-safe SHA-256 comparison and HMAC-SHA256 signatures, rejecting forgeable `key_<workspace>_<user>` strings.

## Consequences
- **Positive**: Complete database sovereignty in Neon PostgreSQL; native TypeScript types; unforgeable API keys with rate-limiting and granular scopes; elimination of third-party SaaS auth downtime.
- **Negative**: Requires maintaining authentication database migrations and security headers (CSRF, cookies, rate limits) directly in the Debo repository.

## Evidence
- Automated test suite: `packages/auth/tests/auth.test.ts` (23 tests passing).
- MCP security test suite: `apps/mcp/tests/mcp.test.ts` (13 tests passing).
- Database schema validation: `packages/db/tests/schema.test.ts`.
