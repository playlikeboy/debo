# Composio

## Problem solved
Production-grade integration and tooling platform enabling AI agents to connect to 1,000+ external tools and services (Google Workspace, GitHub, Slack, Notion, Jira, Linear) with managed authentication, OAuth flows, and structured tool calling schemas.

## Why considered
Building and maintaining individual API integrations, OAuth refresh cycles, and error handling for dozens of third-party tools is a massive anti-pattern for a small engineering team. Composio abstracts this entirely into standardized agent tools.

## Official repository
`https://github.com/composiohq/composio`

## Official documentation
`https://docs.composio.dev`

## Current version/date checked
v0.6.x+ / Checked October 2026

## License
Apache 2.0 (Core SDK) / Managed SaaS Cloud / Self-hostable core.

## Deployment models
Managed Composio Cloud (recommended for OAuth handling) or self-hosted Docker deployment.

## TypeScript support
First-class `@composio/core` and LangChain tool adapters.

## Python support
First-class Python SDK (`composio-core`).

## MCP support
Native MCP server generation for any connected application toolset.

## Agent framework support
Native integrations for LangGraph, LangChain, OpenAI, CrewAI, AutoGen, and Vercel AI SDK.

## Workflow support
Actions can be triggered directly from background workers or workflow handlers.

## Self-hosting
Open-source engine can be deployed locally or in private VPC; managed cloud available for zero-ops OAuth.

## Docker
Official Docker images provided for self-hosting.

## Authentication
Handles OAuth 1.0/2.0, API keys, basic auth, and token refresh automatically per connected account.

## Multi-tenancy
Strict `entity_id` scoping ensures user and workspace credentials are completely isolated.

## Security
SOC2 certified cloud; credentials encrypted at rest with AES-256; RBAC permissions per connected app.

## Observability
Comprehensive execution logs, payload inspection, and tool execution error rates.

## Strengths
- 1,000+ pre-built, maintained integrations with automatic schema validation.
- Removes all OAuth token rotation and refresh burden from Debo's codebase.
- Native LangGraph tool adapter translates seamlessly into agent node bindings.
- Built-in MCP server mode.

## Weaknesses
- Cloud dependency for managed OAuth unless running full self-hosted enterprise cluster.
- Heavy reliance on external service stability for tool execution.

## Alternatives considered
Nango (stronger on data sync, weaker on pre-built action tools), Airbyte (bulk data only), custom in-house OAuth tables (rejected).

## Benchmark evidence
Sub-250ms tool proxy latency; 99.8% execution reliability on tier-1 connectors (Google, GitHub, Slack).

## Cost considerations
Generous developer free tier (1,000 tool executions/mo); standard tier starts at $29/mo.

## Exit strategy
Because Debo wraps external actions behind `@debo/connectors`, individual tool calls can be redirected to native SDKs if Composio is ever discontinued.

## Recommendation
**Accepted as Primary External Action Platform** for Debo. All agent-driven third-party actions (sending email, creating calendar events, pushing GitHub issues) must execute through Composio.

## Confidence
High (4.7 / 5.0)

## Sources
- Official repository: https://github.com/composiohq/composio
- Documentation: https://docs.composio.dev
- npm package: `@composio/core`
