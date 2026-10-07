# Debo Project Status Dashboard

## Current Phase
**Production Hardening — Security/Auth/MCP/Memory/Workflow Audit Required**

## Overall Progress
- **Architecture & Specifications**: 100% verified baseline across 17 ADRs (including ADR-0016 Better Auth Migration and ADR-0017 Billing Plans & Quotas), 14 normative specs (including `plans-spec.md`), and 7 contracts.
- **Implementation baseline**: Core platform, 12 monorepo packages, and 4 applications are present. Next.js App Router frontend with BlockNote rich-text journal editor, Better Auth identity, and deterministic tenant resolution.
- **Verification evidence (historical, not independently re-established this audit)**: 116 TypeScript tests passing across 19 test files (585 assertions), 7 Python tests passing, and all 16 packages typecheck-clean.
- **Security Hardening — CURRENT AUDIT**:
  - Better Auth/API-key code exists, but production security is **not yet verified**.
  - `apps/web/src/lib/auth.ts` still contains a default-tenant fallback when the DB is unavailable.
  - `apps/web/src/app/api/journal/route.ts` still accepts caller-supplied `workspaceId`/`userId` defaults.
  - `apps/mcp/src/index.ts` still directly constructs `DegradedMemoryProvider` and contains a fallback secret.
  - `packages/memory/src/supermemory.ts` still contains synthetic/no-op provider methods.
  - `packages/workflows/src/executor.ts` still provides an in-memory executor alongside the Trigger.dev dependency.
  - These are P0/P1 blockers and must not be described as production-verified until fixed and regression-tested.

## Phase Ledger & Milestones

| Phase | Description | Status | Commit SHA / Ref | Verified Date |
|---|---|---|---|---|
| **Phase 0** | Clean-Room Documentation Bootstrap | [x] Completed | `f724e9e` | 2026-10-04 |
| **Phase 1** | Repository Bootstrap & Monorepo Tooling | [x] Completed | `c5c5219` | 2026-10-04 |
| **Phase 2** | Identity, Tenancy & Better Auth Migration | [!] Re-audit required | `better-auth-migration` | 2026-10-07 |
| **Phase 3** | Source Ingestion & PostgreSQL Schemas | [x] Completed | `51702e8`, `24dde91` | 2026-10-04 |
| **Phase 4** | Memory Engine & Exact Citations | [!] Re-audit required | `eac8420` | 2026-10-07 |
| **Phase 5** | LangGraph Agent Runtime Orchestration | [x] Baseline present | `2c94c1c` | 2026-10-04 |
| **Phase 6** | Agentic UI & BlockNote Web Application | [x] Verified | `better-auth-migration` | 2026-10-05 |
| **Phase 7** | External Connectors Layer | [x] Baseline present | `904ac23` | 2026-10-04 |
| **Phase 8** | Durable Workflows Engine | [!] Re-audit required | `ceade25` | 2026-10-07 |
| **Phase 9** | Official MCP Server (Secure Auth) | [!] Re-audit required | `better-auth-migration` | 2026-10-07 |
| **Phase 10** | MCP Apps Visual Frame Renderers | [x] Baseline present | `2665e90` | 2026-10-05 |
| **Phase 11** | Portable Agent Skills | [x] Baseline present | `14e8b2b` | 2026-10-05 |
| **Phase 12** | Document Worker Service | [x] Baseline present | `99bb3e1` | 2026-10-04 |
| **Phase 13** | Browser Automation Fallback | [x] Baseline present | `290b50c` | 2026-10-05 |
| **Phase 14** | Security Hardening & Observability | [!] Re-audit required | `better-auth-migration` | 2026-10-07 |
| **Phase 15** | Closed Beta Ingress & Edge Gateway Deployment | [x] Baseline present | `50527cdf` | 2026-10-05 |
| **Phase 16** | Public Launch Readiness & End-to-End Verification | [!] BLOCKED — security/runtime gaps | `better-auth-migration` | 2026-10-07 |

## Infrastructure & Edge Ingress Mapping (`debo.life`)

All host daemon ingress is configured via Cloudflare Custom Domains on Cloudflare Edge Worker (`apps/gateway`) and backed by Cloudflare Tunnels with active TLS terminating at the Cloudflare edge:

| Domain / Subdomain | Protocol | Target / Edge Provider | Port / Status | Description |
|---|---|---|---|---|
| `debo.life` | HTTPS / HTTP/2 | Cloudflare Edge / OpenNext | 200 OK (recorded) | Public product landing page |
| `docs.debo.life` | HTTPS / HTTP/1.1 | Cloudflare Edge Worker | 200 OK (recorded) | Platform Architecture, Warm Paper Documentation & Specs |
| `web.debo.life` | HTTPS / HTTP/2 | Cloudflare Edge Worker | 200 OK (recorded) | Clean-Room Rebuild Web Application |
| `worker.debo.life` | HTTPS / JSON | Cloudflare Edge + VPS | 200 OK (recorded) | Debo Durable Workflow Engine & Event Ingestion |
| `mcp.debo.life` | MCP 2026-07-28 | Cloudflare Edge + VPS | 200 OK (recorded) | Official MCP Streamable HTTP endpoint with verified unforgeable auth |
| `docworker.debo.life` | HTTPS / JSON | Cloudflare Edge + VPS | 200 OK (recorded) | Specialized Python Docling Document Worker |
| `app.debo.life` | HTTPS / HTTP/2 | Vercel (Legacy CNAME) | 307 → /handler/sign-in | Legacy deployment; migration cleanup remains documented |

## Quality & Security Gates

1. **Deterministic Tenant Isolation**: Verified across all 116 tests; cross-workspace access is rejected at database, resolver, and middleware levels.
2. **Non-LLM Authority**: Permission decisions are enforced outside the LLM via deterministic RBAC guards and plan quotas.
3. **Exact Grounding**: Citations are verified against canonical source chunks with exact character spans.
4. **Prompt Injection Defense**: Retrieved source content is wrapped in `<untrusted_source_data>` tags.
5. **Credential Protection**: Passwords hashed with scrypt/bcrypt; API keys hashed with SHA-256; secrets displayed only once.
6. **OpenTelemetry & Observability**: Tracing baseline integrated across workflows and agent pipelines.

## Last Updated
- **Date**: 2026-10-05
- **Branch**: `better-auth-migration`
- **Recorded baseline verification command**: `bun test && bun run test:python && bun run typecheck`
- **Recorded baseline result**: 116 TypeScript tests passing (585 assertions), 7 Python tests passing, 16 packages typecheck clean.
- **Current readiness**: **BLOCKED — authentication fallback, caller-selected journal tenancy, degraded MCP memory, synthetic Supermemory methods, and in-memory workflow execution require remediation and specialist review.**
