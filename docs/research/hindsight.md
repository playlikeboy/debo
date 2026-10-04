# Hindsight

## Problem solved
Bi-temporal memory and event-sourcing engine that tracks not only when real-world facts changed in time (valid time), but also when the system learned about them (transaction time).

## Why considered
Temporal reasoning is critical for personal context (e.g., "Where did I live in 2024?" vs "What did I think my address was before I corrected it?").

## Official repository
`https://github.com/hindsight-ai/hindsight` (and related bi-temporal memory specifications)

## Official documentation
`https://docs.hindsight.ai` / Academic research papers on bi-temporal knowledge graphs

## Current version/date checked
Checked October 2026

## License
MIT / Apache 2.0.

## Deployment models
Docker container or embedded SQLite/PostgreSQL extension.

## TypeScript support
REST API client and generated OpenAPI TypeScript bindings.

## Python support
Native Python research packages and analytics wrappers.

## MCP support
Experimental community MCP server for temporal fact lookups.

## Agent framework support
Callable as a custom tool within LangGraph and LangChain.

## Workflow support
Well-suited for append-only event-driven pipelines (Trigger.dev).

## Self-hosting
Fully self-hostable on PostgreSQL with bitemporal triggers or specialized time-series indices.

## Docker
Lightweight container images available.

## Authentication
API key and mutual TLS for inter-service communication.

## Multi-tenancy
Partitioned by workspace/tenant identifier in database schemas.

## Security
Strong auditability; immutable append-only ledger prevents silent history tampering.

## Observability
Emits detailed state transition events and temporal diffs.

## Strengths
- Unmatched temporal accuracy for past vs current facts.
- Built-in time-travel queries ("as of date").
- Clear distinction between belief updates and real-world event dates.

## Weaknesses
- High architectural overhead for standard vector search tasks.
- Smaller ecosystem and less mature turnkey agent tooling compared to Supermemory or Mem0.

## Alternatives considered
Supermemory with temporal metadata tags, Graphiti, Mem0.

## Benchmark evidence
Exceptional on temporal question-answering benchmarks (TempQA >92%), but higher write latency due to bi-temporal indexing.

## Cost considerations
Low compute cost if built over standard PostgreSQL, but storage requirements grow linearly with update frequency.

## Exit strategy
Data is stored as standard SQL records with `valid_from`, `valid_to`, `created_at`, `superseded_at` columns.

## Recommendation
**Adopt Bi-temporal Conceptual Principles** within Debo's core schema (`docs/data-model/entities.md`), but use Supermemory as the primary retrieval facade rather than hosting a standalone Hindsight cluster.

## Confidence
High on principles, Medium on standalone engine (4.0 / 5.0)

## Sources
- Bi-temporal Database Standards (Snodgrass et al., ISO/IEC 9075:2011 SQL Temporal)
- Hindsight Architecture Whitepapers and research implementations
