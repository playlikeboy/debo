# Normative Specification: Model Context Protocol (MCP)

This document is normative. The Debo MCP server MUST conform to the pinned MCP specification and SDK version used by the implementation.

## 1. Protocol & Transport

1. **Protocol baseline:** MCP 2026-07-28 unless a later version is explicitly accepted by ADR.
2. **SDK:** official MCP TypeScript SDK v2.
3. **Remote transport:** Streamable HTTP at `https://mcp.debo.life/mcp`.
4. **Local transport:** stdio.
5. **Legacy HTTP+SSE:** MUST NOT be Debo's primary remote transport.
6. **Authentication:** remote requests MUST satisfy Debo's configured authentication mechanism before tool/resource dispatch.
7. **Authorization:** every tool/resource operation MUST resolve tenant context and verify required capabilities deterministically.
8. **Protocol compliance:** wire behavior MUST follow the pinned official spec/SDK rather than hand-written approximations.

## 2. Tool Output Security

- Tool outputs containing user source material MUST be clearly delimited as untrusted source data before entering model context.
- Tools MUST NOT return OAuth credentials, session tokens, API secrets, or other credential material.
- Tool responses MUST conform to `docs/contracts/mcp.md`.
