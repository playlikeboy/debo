# Mem0

## Problem solved
Adaptive, multi-layer memory architecture for AI agents and LLM applications that extracts, updates, and deduplicates user facts across sessions.

## Why considered
Mem0 is a widely recognized agent memory library with multi-layer memory capabilities (User, Session, Agent) and automated entity extraction.

## Official repository
`https://github.com/mem0ai/mem0`

## Official documentation
`https://docs.mem0.ai`

## Current version/date checked
v0.1.x / v1.x / Checked October 2026

## License
Apache 2.0.

## Deployment models
Python library, Node.js library wrapper, self-hosted Docker server, or Mem0 Platform (SaaS).

## TypeScript support
Community/TypeScript bindings exist (`mem0ai` on npm), but Python is the primary first-class citizen with faster feature parity.

## Python support
First-class native Python package with comprehensive documentation.

## MCP support
Third-party community MCP server available.

## Agent framework support
Native integrations with LangChain, CrewAI, AutoGen, and LlamaIndex.

## Workflow support
Async batch updates supported via standard REST / Python workers.

## Self-hosting
Fully open-source core with local Qdrant, Chroma, or pgvector backends.

## Docker
Official Docker Compose definitions for self-hosted instances.

## Authentication
API Key authentication for SaaS; local self-hosted instance requires proxy or custom token validation.

## Multi-tenancy
Supports `user_id`, `agent_id`, and `run_id` namespaces, though workspace-level hierarchical tenant boundaries require application-level wrapping.

## Security
Standard encryption; open-source core allows air-gapped on-premise deployment.

## Observability
Basic logging; SaaS provides query usage and dashboard analytics.

## Strengths
- Automated fact deduplication and contradiction updates.
- Fast setup for simple user profile extraction.
- Broad community recognition and extensive Python tutorials.

## Weaknesses
- TypeScript SDK lags behind the Python implementation in feature releases and type depth.
- Citation tracking to exact raw file offsets is weaker than Supermemory's native source grounding.
- Heavy focus on SaaS monetization in recent releases.

## Alternatives considered
Supermemory, Graphiti, Hindsight.

## Benchmark evidence
Reported ~85% accuracy on standard conversational memory benchmarks; slightly slower latency when running LLM-assisted graph extraction.

## Cost considerations
Self-hosted: resource footprint of vector DB + embedding models. Cloud SaaS: tiered subscription starting at $19/mo.

## Exit strategy
Memories are stored in standard vector databases and can be exported as JSON records.

## Recommendation
**Alternative / Fallback Candidate**. Strong reference implementation for memory consolidation logic, but secondary to Supermemory due to TypeScript priority and source grounding depth.

## Confidence
Medium-High (4.1 / 5.0)

## Sources
- Official repository: https://github.com/mem0ai/mem0
- Official documentation: https://docs.mem0.ai
- PyPI package: `mem0ai`
