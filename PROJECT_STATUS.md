# Debo Project Status Dashboard

## Current Phase
**Production Build / Post-Phase-16 Hardening — implementation baseline exists, but production readiness is blocked by audit findings**

## Overall Progress
- **Architecture & Specifications**: 100% verified baseline across 15 ADRs, 13 normative specs, and 7 contracts.
- **Implementation baseline**: Core platform, 12 monorepo packages, and 4 applications are present across the recorded 16 phases.
- **Verification evidence**: 98 tests are recorded as passing (91 TypeScript, 7 Python), 16 packages are recorded as typecheck-clean, and a 1,000+ probe multi-tenant fuzzing audit is recorded. These results do **not** by themselves establish production readiness for the current MCP and memory runtime paths.

## Phase Ledger & Milestones

| Phase | Description | Status | Commit SHA | Verified Date |
|---|---|---|---|---|
| **Phase 0** | Clean-Room Documentation Bootstrap | [x] Completed | `f724e9e` | 2026-10-04 |
| **Phase 1** | Repository Bootstrap & Monorepo Tooling | [x] Completed | `c5c5219` | 2026-10-04 |
| **Phase 2** | Identity, Tenancy & Deterministic Auth | [x] Completed | `a6dfe7a` | 2026-10-04 |
| **Phase 3** | Source Ingestion & PostgreSQL Schemas | [x] Completed | `51702e8`, `24dde91` | 2026-10-04 |
| **Phase 4** | Memory Engine & Exact Citations | [!] Audit reopened | `eac8420` | 2026-10-05 |
| **Phase 5** | LangGraph Agent Runtime Orchestration | [x] Baseline present | `2c94c1c` | 2026-10-04 |
| **Phase 6** | Agentic UI & Web Application | [x] Baseline present | `35bd209` | 2026-10-04 |
| **Phase 7** | External Connectors Layer | [x] Baseline present | `904ac23` | 2026-10-04 |
| **Phase 8** | Durable Workflows Engine | [!] Version/docs audit required | `ceade25` | 2026-10-05 |
| **Phase 9** | Official MCP Server | [!] Audit reopened | `5e27126` | 2026-10-05 |
| **Phase 10** | MCP Apps Visual Frame Renderers | [x] Baseline present | `2665e90` | 2026-10-05 |
| **Phase 11** | Portable Agent Skills | [x] Baseline present | `14e8b2b` | 2026-10-05 |
| **Phase 12** | Document Worker Service | [x] Baseline present | `99bb3e1` | 2026-10-04 |
| **Phase 13** | Browser Automation Fallback | [x] Baseline present | `290b50c` | 2026-10-05 |
| **Phase 14** | Security Hardening & Observability | [!] Audit evidence retained; runtime blockers remain | `2a97214` | 2026-10-05 |
| **Phase 15** | Closed Beta Ingress & Edge Gateway Deployment | [x] Baseline present | `50527cdf` | 2026-10-05 |
| **Phase 16** | Public Launch Readiness & End-to-End Verification | [!] Readiness claim reopened by audit | `17c62e3` | 2026-10-05 |

## P0 Production-Readiness Blockers

Tracked in GitHub issue **#42**: `P0 audit: MCP production path uses forgeable auth and degraded/stub memory`.

1. **MCP authentication is not safe by default.** `packages/mcp/src/server.ts` accepts structurally forgeable `Bearer key_<workspaceId>_<userId>` tokens when `authResolver` is absent. A production endpoint must use a real cryptographically verified identity resolver and fail closed otherwise.
2. **MCP hardcodes degraded memory.** `apps/mcp/src/index.ts` constructs `DegradedMemoryProvider` unconditionally, so the production MCP process does not select the advertised Supermemory implementation.
3. **Supermemory adapter is incomplete.** `packages/memory/src/supermemory.ts` currently synthesizes local responses; search returns an empty result set and the implementation does not perform real authenticated provider operations.
4. **Engineering state is stale.** Historical `AGENTS.md`, orchestrator state, and task records contained Phase 0/1 and Trigger.dev v3 references inconsistent with the current build state. `AGENTS.md` and orchestrator state were reconciled during this audit; task-registry cleanup remains part of the next batch.

## Infrastructure & Edge Ingress Mapping (`debo.life`)

All host daemon ingress is configured via Cloudflare Custom Domains on Cloudflare Edge Worker (`apps/gateway`) and backed by Cloudflare Tunnels with active TLS terminating at the Cloudflare edge:

| Domain / Subdomain | Protocol | Target / Edge Provider | Port / Status | Description |
|---|---|---|---|---|
| `debo.life` | HTTPS / HTTP/2 | Cloudflare Edge / OpenNext | 200 OK (recorded) | Public product landing page |
| `docs.debo.life` | HTTPS / HTTP/1.1 | Cloudflare Edge Worker | 200 OK (recorded) | Platform Architecture, Warm Paper Documentation & Specs |
| `web.debo.life` | HTTPS / HTTP/2 | Cloudflare Edge Worker | 200 OK (recorded) | Clean-Room Rebuild Web Application |
| `worker.debo.life` | HTTPS / JSON | Cloudflare Edge + VPS | 200 OK (recorded) | Debo Durable Workflow Engine & Event Ingestion |
| `mcp.debo.life` | MCP 2026-07-28 | Cloudflare Edge + VPS | 200 OK (recorded) | Official MCP Streamable HTTP endpoint; security readiness is under audit |
| `docworker.debo.life` | HTTPS / JSON | Cloudflare Edge + VPS | 200 OK (recorded) | Specialized Python Docling Document Worker |
| `app.debo.life` | HTTPS / HTTP/2 | Vercel (Legacy CNAME) | 307 → /handler/sign-in | Legacy deployment; migration cleanup remains documented |

## Quality & Security Gates

1. **Deterministic Tenant Isolation**: a 1,000+ randomized probe audit is recorded, but MCP authentication must still be fixed before this can be treated as a production gate.
2. **Non-LLM Authority**: permission decisions must remain outside the model and be enforced by deterministic authorization.
3. **Exact Grounding**: citations must be validated against canonical source evidence.
4. **Prompt Injection Defense**: imported/retrieved content remains untrusted data.
5. **Credential Protection**: third-party credentials must remain encrypted and outside prompts/logs.
6. **OpenTelemetry**: tracing is part of the baseline, but readiness requires runtime verification of critical paths.

## Last Updated
- **Date**: 2026-10-05
- **Latest implementation commit audited**: `17c62e3581702199f6d7bb518317173fda39a2ba`
- **Audit commits**: `37f63c34127ec546b42587c347b00918e5fb8d05`, `32cfea78ad6a8fb131cda2a4050f22b1dd96af0a`
- **Recorded baseline verification command**: `bun test && bun run test:python && bun run typecheck`
- **Recorded baseline result**: 98 tests passing, 16 packages typecheck clean.
- **Current readiness**: **BLOCKED — see GitHub issue #42.**
