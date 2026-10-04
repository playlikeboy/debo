# Status
accepted

# Context
Debo aims to be the ubiquitous memory and context operating system for a user's entire digital life. Confining Debo context strictly to a single browser tab prevents users from leveraging their personal memory inside their favorite coding IDEs (Cursor, VS Code, Zed), desktop assistants (Claude Desktop), and autonomous agent frameworks.

# Decision
We build and deploy an official **Model Context Protocol (MCP) Server** using the official Anthropic `@modelcontextprotocol/sdk` (TypeScript):
- Packaged as a dedicated service in `apps/mcp/` sharing domain logic from `@debo/mcp`, `@debo/memory`, and `@debo/db`.
- Supports dual transports: **Server-Sent Events (SSE) / HTTP** for remote agent clients (target endpoint: `https://mcp.debo.life/mcp`), and **stdio** for local desktop environments.
- Enforces strict deterministic authentication (API keys hashed with SHA-256) and non-LLM permission checks on all tools and resources.

# Alternatives
1. **Proprietary REST / GraphQL API Only**: Evaluated. Requires every third-party tool to build and maintain a custom Debo plugin; fails to leverage the massive emerging MCP ecosystem.
2. **OpenAI Custom GPT Actions Only**: Proprietary to OpenAI; incompatible with Claude, Cursor, and local offline models.

# Why
MCP is the open, industry-standard interface for agent-to-tool and agent-to-context connectivity. Building an official MCP server positions Debo as the universal memory backbone for all external agent runtimes.

# Consequences
- **Positive**: Immediate integration with Claude Desktop, Cursor, and MCP-compatible agents; users can query their personal past directly from their IDE.
- **Negative**: Exposing memory to external LLMs expands the attack surface for indirect prompt injection; requires strict sanitization, output bounds, and rate limiting (`docs/mcp/security.md`).

# Migration / Exit Strategy
MCP tools wrap core functions from `@debo/memory` and `@debo/connectors`. If the protocol standard evolves, updating the adapter layer in `apps/mcp/` preserves all underlying business logic.

# Evidence
- Model Context Protocol Specification: `https://modelcontextprotocol.io`
- Reference SDK: `@modelcontextprotocol/sdk` (TypeScript)
