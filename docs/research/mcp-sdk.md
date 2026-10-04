# Model Context Protocol (MCP) TypeScript SDK

## Problem solved

The official TypeScript SDK implements MCP servers and clients and tracks the current protocol revisions.

## Current baseline — checked 2026-10-04

- **MCP specification:** 2026-07-28.
- **SDK line:** v2 stable.
- **Server package:** `@modelcontextprotocol/server`.
- **Client package:** `@modelcontextprotocol/client`.
- **Remote transport:** Streamable HTTP.
- **Local transport:** stdio.
- **Legacy HTTP+SSE:** deprecated by the 2026-07-28 specification.

## Debo fit

Debo uses MCP as its external agent/context boundary. `apps/mcp/` remains a dedicated adapter over Debo domain services so authentication, tenant isolation, audit policy, and business state do not depend on the protocol implementation.

## Versioning rule

Pin exact SDK package versions during Phase 1 after an implementation spike. Re-check migration notes before upgrading protocol eras or SDK major versions.

## Benchmark status

No Debo-run protocol latency or throughput benchmark is claimed here. Any performance number must name its source and measurement environment.

## Sources

- https://github.com/modelcontextprotocol/typescript-sdk
- https://modelcontextprotocol.io
- https://ts.sdk.modelcontextprotocol.io/v2/
- https://blog.modelcontextprotocol.io/posts/2026-07-28/
