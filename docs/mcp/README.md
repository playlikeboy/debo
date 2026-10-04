# Debo Model Context Protocol (MCP) Server Architecture

Debo exposes an MCP server from `apps/mcp/` for external AI clients. The MCP layer is an adapter over Debo's authenticated domain services, not a second business-logic stack.

## 1. Current Protocol Baseline

- **Protocol:** MCP 2026-07-28.
- **TypeScript SDK:** v2.
- **Remote transport:** Streamable HTTP at `https://mcp.debo.life/mcp`.
- **Local transport:** stdio.
- **Legacy HTTP+SSE:** not the primary transport; the current specification deprecates the legacy transport.

Exact SDK package versions are pinned during Phase 1 after revalidating the official migration and serving guides.

## 2. Capability Model

Debo can expose:
- **Tools** for authorized actions and retrieval.
- **Resources** for source-grounded context where appropriate.
- **Prompts** for reusable, bounded workflows.

Capability exposure is filtered by deterministic Debo permissions. The model never decides whether a capability is permitted.

## 3. Authentication, Tenancy & Audit

1. Resolve the presenting credential to an authorized `(userId, workspaceId)` before accessing Debo data.
2. Apply capability scopes and object-level authorization in Debo code.
3. Keep secrets out of tool outputs, logs, and model-visible state.
4. Record tool invocations in the audit model with actor and correlation metadata.
5. Apply rate limits and output-size bounds appropriate to the endpoint.

## 4. Security

Treat retrieved source material as untrusted input because indirect prompt injection can originate in documents, email, websites, or connector data. Tool handlers must validate inputs, scope data, constrain outputs, and avoid confused-deputy behavior.

## 5. Documentation

- [Tools taxonomy](tools-taxonomy.md)
- [Security and threat model](security.md)
- [MCP Apps](mcp-apps.md)
