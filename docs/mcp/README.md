# Debo Model Context Protocol (MCP) Server Architecture

Debo provides an official **Model Context Protocol (MCP)** server (`apps/mcp/`) that exposes personal memory, source documents, contextual entities, and actions to external AI clients (Claude Desktop, Cursor, Zed, standalone autonomous agents).

---

## 1. Protocol Architecture & Transports

Debo implements the official `@modelcontextprotocol/sdk` (TypeScript) across dual transports:

```text
[ External AI Client ] (Claude Desktop / Cursor)
           │
           ├────────────────────────┬────────────────────────┐
           ▼                        ▼                        ▼
    Remote Transport         Local Transport          MCP Apps View
  (HTTP / SSE via Cloudflare)   (Local Stdio)       (Interactive Canvas)
  https://mcp.debo.life/mcp
           │
           ▼
┌──────────────────────────────────────┐
│        Debo MCP Server Layer         │
│  - API Key Auth & Workspace Scoping  │
│  - Deterministic Tool Gatekeeper     │
│  - Rate Limiter & Audit Logger       │
└──────────────────┬───────────────────┘
                   │
         ┌─────────┼─────────┐
         ▼         ▼         ▼
     [ Tools ] [Resources] [Prompts]
```

### Supported Transports:
1. **Remote SSE / HTTP Transport**: Hosted at `https://mcp.debo.life/mcp` (configurable). Authenticated via `Authorization: Bearer debo_mcp_...`. Designed for cloud agents and mobile clients.
2. **Local Stdio Transport**: Packaged as a local CLI runner (`debo mcp run`) for local Claude Desktop or Cursor configurations accessing local or remote Debo accounts.

---

## 2. Capability Discovery & Handshake

During client initialization, Debo advertises its server capabilities:
- **`tools`**: Dynamic tool catalog scoped to the API key's authorized permissions.
- **`resources`**: URI-based memory and document streaming (e.g. `debo://workspaces/{id}/sources/{id}`).
- **`prompts`**: Pre-configured synthesis prompts for personal briefing, daily planning, and decision analysis.

---

## 3. Authentication, Multi-Tenancy & Rate Limiting

1. **Deterministic Tenant Resolution**:
   - Every MCP API key is prefixed `debo_mcp_` and hashed with SHA-256 before storage in PostgreSQL.
   - The key resolves to exactly one `(userId, workspaceId)` pair and an associated set of capability scopes.
2. **Rate Limiting**:
   - Remote SSE endpoints enforce token-bucket rate limits per API key (default: 60 requests/minute) to prevent denial-of-service and runaway loops by external agents.
3. **Audit Logging**:
   - Every MCP tool call is recorded in `AuditLog` with `actorType: 'mcp_client'`.

---

## 4. MCP Documentation Index

- **[Tools Taxonomy Specification](file:///home/kunalkashyap8024/sop/debo/docs/mcp/tools-taxonomy.md)** — Complete catalog of all 21 standard Debo MCP tools.
- **[MCP Security & Threat Model](file:///home/kunalkashyap8024/sop/debo/docs/mcp/security.md)** — Comprehensive defense against indirect injection, confused deputy, and data leakage.
- **[MCP Apps & Interactive UI](file:///home/kunalkashyap8024/sop/debo/docs/mcp/mcp-apps.md)** — Delivering interactive UI frames into external agent canvases.
