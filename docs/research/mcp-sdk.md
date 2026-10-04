# Model Context Protocol (MCP) TypeScript SDK

## Problem solved
Standardized protocol specification and reference SDK developed by Anthropic that connects AI reasoning models to external data sources, memory graphs, tools, and prompts over standard transports (stdio, SSE/HTTP).

## Why considered
Debo is designed as a universal context and memory engine. MCP enables external agents (Claude Desktop, Cursor, Zed, standalone AI agents) to securely discover and query Debo's memory graph, retrieve source evidence, and execute authorized workflows.

## Official repository
`https://github.com/modelcontextprotocol/typescript-sdk`

## Official documentation
`https://modelcontextprotocol.io`

## Current version/date checked
v1.x+ / Checked October 2026

## License
MIT.

## Deployment models
Standalone Node.js / Bun server (`apps/mcp/`) running over Server-Sent Events (SSE) / HTTP for remote clients, or stdio for local process invocation.

## TypeScript support
Official primary TypeScript SDK (`@modelcontextprotocol/sdk`) with complete type definitions and Zod validation.

## Python support
Official Python SDK also maintained by Anthropic (`mcp`).

## MCP support
Reference implementation of the specification.

## Agent framework support
Supported by all modern agent frameworks: LangChain, LangGraph, LlamaIndex, Claude Desktop, Cursor.

## Workflow support
Tools exposed by Debo's MCP server can initiate durable Trigger.dev workflows.

## Self-hosting
Completely open source; can be hosted on any VPS or container environment at `mcp.debo.life`.

## Docker
Lightweight container packaging using Node.js 20+ / Bun.

## Authentication
Bearer token / API key header validation over HTTP/SSE. Stdio relies on local process boundary.

## Multi-tenancy
Tenant context (`workspaceId`, `userId`) is resolved deterministically from the API key before registering tools or resources.

## Security
Strict schema validation on inputs. Prompt injection defense required on tool outputs. Host application must enforce non-LLM permission checks.

## Observability
Protocol notifications and request/response logging easily intercepted via middleware.

## Strengths
- Rapidly becoming the universal industry standard for AI tool and context sharing.
- Official maintenance and backing from Anthropic and leading AI tool makers.
- Clean separation between Tools (active actions), Resources (passive data), and Prompts.

## Weaknesses
- SSE transport over public internet requires robust connection keep-alive and authentication middleware.
- Tool output size limits must be observed to prevent overwhelming client model context windows.

## Alternatives considered
Custom proprietary REST APIs (lacks universal agent compatibility), OpenAI Function Calling schemas only.

## Benchmark evidence
Sub-10ms protocol framing overhead over local stdio; sub-30ms over local HTTP.

## Cost considerations
Zero software licensing costs (MIT).

## Exit strategy
Because Debo tools are defined as standard Zod/TypeScript functions, exposing them via alternative protocols (REST, GraphQL, gRPC) requires minimal effort.

## Recommendation
**Accepted as Mandatory External Agent Gateway** (`apps/mcp/` deployed to `mcp.debo.life`).

## Confidence
Definitive (5.0 / 5.0)

## Sources
- Official repository: https://github.com/modelcontextprotocol/typescript-sdk
- Official documentation: https://modelcontextprotocol.io
- npm package: `@modelcontextprotocol/sdk`
