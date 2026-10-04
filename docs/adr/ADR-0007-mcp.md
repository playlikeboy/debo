# ADR-0007 — Model Context Protocol

## Status
accepted — protocol/SDK version pinning required in implementation

## Context
Debo must expose personal memory, source evidence, and authorized actions to external AI clients through an open protocol.

## Decision
1. Build `apps/mcp/` as the dedicated Debo MCP server.
2. Target the **MCP 2026-07-28** protocol baseline.
3. Use the official **MCP TypeScript SDK v2**, with `@modelcontextprotocol/server` for servers and `@modelcontextprotocol/client` only where Debo acts as a client.
4. Use **Streamable HTTP** for the remote endpoint and **stdio** for local process integration.
5. Do not make legacy HTTP+SSE the primary remote transport; the 2026-07-28 specification formally deprecates it.
6. Enforce Debo authentication, workspace resolution, capability checks, output bounds, and audit logging independently of model reasoning.

## Why
MCP is the external agent/context boundary. Keeping it in a dedicated adapter preserves Debo core domain and memory layers if the protocol or SDK changes.

## Consequences
- **Positive:** broad interoperability with MCP-compatible clients.
- **Negative:** protocol evolution and external-agent attack surfaces require compatibility and security testing.

## Exit strategy
MCP-specific code remains in `apps/mcp/` and `@debo/mcp`; domain contracts remain transport-neutral.

## Evidence
- https://modelcontextprotocol.io
- https://github.com/modelcontextprotocol/typescript-sdk
- `docs/research/mcp-sdk.md`
