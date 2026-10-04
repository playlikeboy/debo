# Normative Specification: Model Context Protocol (MCP)

This document is a normative specification using RFC 2119 language.

---

## 1. Protocol & Transport Compliance

1. **SDK Standard**: The Debo MCP server MUST implement the official `@modelcontextprotocol/sdk` (TypeScript).
2. **Dual Transports**:
   - The server MUST provide a remote HTTP/SSE transport listening at `https://mcp.debo.life/mcp`.
   - The server MUST provide a local stdio transport for local agent execution.
3. **Authentication**: Remote MCP requests MUST include a valid `Authorization: Bearer debo_mcp_<token>` header. Unauthenticated or malformed requests MUST be rejected with HTTP 401.
4. **Scope Verification**: Every MCP tool execution MUST deterministically verify that the presenting API key possesses the required capability scope before dispatching the tool.

---

## 2. Tool Output Sanitization

- Tool outputs containing user documents or memory text MUST be enclosed in `<source_data>...</source_data>` tags to prevent indirect prompt injection.
- Tools MUST NOT return plaintext OAuth credentials, session tokens, or API secrets under any circumstances.
- Tool responses MUST adhere strictly to the JSON schemas defined in `docs/contracts/mcp.md`.
