# Changelog

All notable changes to the Debo platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-10-04

### Added
- **Monorepo Foundation**: Turborepo, Bun workspaces, shared TypeScript configuration, and `@debo/types` error/result primitives (`DEBO-0001`, `DEBO-0002`).
- **Database & Schemas**: Neon PostgreSQL client and Drizzle ORM relational schema with deterministic `workspaceId` foreign keys and initial migration (`DEBO-0003`).
- **Identity & Authority**: `@debo/auth` deterministic tenant context engine and `@debo/permissions` Non-LLM Authority engine enforcing RBAC and Risk Tier gates (`DEBO-0004`).
- **Object Storage**: Cloudflare R2 storage service (`@debo/storage`) with AWS SigV4 pre-signed URL generation and path traversal sanitization (`DEBO-0005`).
- **Memory & Citations**: Provider-agnostic `MemoryService` with Supermemory adapter and degraded fallback mode (`@debo/memory`), paired with character-offset exact span verification (`@debo/citations`) (`DEBO-0006`, `DEBO-0007`).
- **Agent Runtime**: LangGraph JS StateGraph pipeline (`plan` -> `retrieve` -> `reason` -> `validate` -> `respond`) with checkpointer time-travel and human approval interrupts (`DEBO-0012`).
- **Model Context Protocol**: Official MCP 2026-07-28 server on port 8080 (`apps/mcp`, `@debo/mcp`) with streamable HTTP transport, prompt injection defenses, and rate limiting (`DEBO-0008`).
- **Durable Workflows**: Task execution pipeline with step memoization, exponential backoff, compensation rollback, and HTTP background worker on port 8787 (`DEBO-0009`).
- **External Connectors**: Composio action runner and Nango sync adapter with AES-256-GCM credential encryption and tenant isolation (`DEBO-0011`).
- **UI & Web Application**: Calm editorial Warm Paper design system (`@debo/ui`), AG-UI streaming protocol, and full MVP web application (`apps/web`) on port 3000 (`DEBO-0013`).
- **Document Worker**: Isolated Python 3.12 FastAPI microservice (`apps/document-worker`) with layout parsing, table extraction, and pixel-level bounding boxes (`DEBO-0010`).
- **End-to-End Verification & Benchmark**: Automated E2E integration test suite and 7-track memory evaluation benchmark (`tests/e2e/`) with 100% negative assertion on tenant boundary leakage (`DEBO-0014`).
- **Edge Ingress**: Host Cloudflare Tunnel reconfiguration routing `debo.life` domains (`app.debo.life`, `mcp.debo.life`, `worker.debo.life`, `docs.debo.life`) with legacy domains revoked.
