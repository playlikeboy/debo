# Graphiti

## Problem solved
Dynamic, temporally-aware knowledge graph engine designed for agent memory, translating unstructured conversations into structured entity-relationship graphs.

## Why considered
Graphiti (developed by Zep) focuses specifically on episodic and entity memory representation with multi-hop graph retrieval, addressing the limitation of naive RAG vector search.

## Official repository
`https://github.com/getzep/graphiti`

## Official documentation
`https://help.getzep.com` / `https://github.com/getzep/graphiti`

## Current version/date checked
v0.2.x+ / Checked October 2026

## License
Apache 2.0.

## Deployment models
Self-hosted Python service with Neo4j or Memgraph backend; Docker container.

## TypeScript support
API client available via HTTP; core library is native Python.

## Python support
First-class native Python package.

## MCP support
Experimental community adapters available.

## Agent framework support
LangChain, LangGraph, and AutoGen integration guides provided.

## Workflow support
Async batch ingestion via task workers.

## Self-hosting
Requires Neo4j or FalkorDB/Memgraph instance alongside Python runtime.

## Docker
Official Docker Compose provided with Neo4j.

## Authentication
Token / API key header enforcement.

## Multi-tenancy
Entity sub-graphs partitioned by user or group ID.

## Security
Standard network and DB security controls; graph traversal bounded by tenant node filters.

## Observability
Logs Cypher queries and graph extraction timings.

## Strengths
- Exceptional multi-hop relationship resolution ("Who is Alice's manager's wife?").
- Explicit edge attributes for relationship validity timeframes.
- Prevents hallucinated connections via structured entity deduplication.

## Weaknesses
- Heavy infrastructure burden: requires operating and scaling a dedicated graph database (Neo4j).
- Slower ingestion latency due to multi-pass LLM extraction for nodes and edges.
- Lacks native first-class TypeScript SDK.

## Alternatives considered
Supermemory, Mem0, Neo4j native, PostgreSQL recursive CTEs.

## Benchmark evidence
Multi-hop QA benchmarks outperform flat vector RAG by 35-45% on relational inquiries.

## Cost considerations
Running Neo4j + Python worker requires minimum 4GB RAM VPS (~$24/mo) plus LLM token costs for graph extraction.

## Exit strategy
Standard Cypher / GraphML / JSON exports allow straightforward migration.

## Recommendation
**Evaluate for Future Graph Enhancements (Phase 4+)**, but avoid introducing Neo4j in Phase 1-3. Model core entities and relations directly in Neon PostgreSQL (`MemoryRelation` entity).

## Confidence
Medium-High (4.0 / 5.0)

## Sources
- Official repository: https://github.com/getzep/graphiti
- Zep Documentation: https://help.getzep.com
