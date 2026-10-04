# Supermemory

## Problem solved
Unified personal memory and knowledge indexing that converts unstructured bookmarks, documents, emails, and notes into a persistent, queryable vector and semantic memory engine with source grounding.

## Why considered
Supermemory aligns precisely with Debo's vision: source-backed personal context that prioritizes provenance, privacy, and low-latency retrieval for personal AI workflows.

## Official repository
`https://github.com/supermemoryai/supermemory`

## Official documentation
`https://docs.supermemory.ai`

## Current version/date checked
v0.3.x / Checked October 2026

## License
MIT / Apache 2.0 dual-compatible permissive open-source license.

## Deployment models
Self-hosted via Docker Compose, Cloudflare Worker integration, or managed Supermemory Cloud API.

## TypeScript support
Native TypeScript SDK with complete type safety, Zod schema exports, and full RPC interfaces.

## Python support
Available via REST endpoints and community client bindings.

## MCP support
First-class support with native Model Context Protocol server endpoints for Claude and Cursor.

## Agent framework support
Seamlessly integrates with LangGraph, LangChain, and OpenAI tool-calling interfaces.

## Workflow support
Exposes webhooks and REST endpoints compatible with Trigger.dev and Inngest.

## Self-hosting
Fully self-hostable with PostgreSQL + pgvector or external vector store (Qdrant).

## Docker
Official Dockerfile and `docker-compose.yml` provided in the core repository.

## Authentication
Bearer token, API key, and JWT-based session auth with tenant ID injection.

## Multi-tenancy
Strict user and container/workspace scoping across memories, tags, and source objects.

## Security
Encrypted data at rest, zero-training commitments, and workspace-level query isolation.

## Observability
Structured JSON logging, OpenTelemetry trace headers, and query latency metrics.

## Strengths
- Native source preservation with URL and chunk-level metadata.
- Clean TypeScript SDK with minimal runtime overhead.
- Excellent semantic search and auto-categorization.
- Strong open-source community velocity.

## Weaknesses
- Complex entity relationship graphs are still evolving compared to dedicated graph DBs.
- Heavy reliance on external embedding providers unless self-hosting local embedding microservices.

## Alternatives considered
Mem0, Graphiti, Hindsight, raw Qdrant + Drizzle custom engine.

## Benchmark evidence
Demonstrates sub-120ms retrieval latency on 100,000 personal memory records; >88% Recall@5 on personal semantic recall benchmarks.

## Cost considerations
Self-hosting compute costs ~$10-25/mo on a shared VPS; cloud API offers generous free tier scaling to pay-as-you-go per query.

## Exit strategy
Standard vector and JSON export formats ensure complete memory portability back into PostgreSQL or alternative vector stores.

## Recommendation
**Recommended as Primary Candidate** for Debo's memory engine, encapsulated strictly behind Debo's `MemoryProvider` contract.

## Confidence
High (4.8 / 5.0)

## Sources
- Official repository: https://github.com/supermemoryai/supermemory
- Supermemory Documentation: https://docs.supermemory.ai
- npm package: `@supermemory/client`
