# Debo Memory Subsystem Architecture

Debo models personal context as source-grounded, time-aware memory. The architecture deliberately separates **Debo-owned canonical state** from **provider-owned derived retrieval state**.

## 1. Memory Domains

- **Episodic:** events and experiences situated in time.
- **Semantic:** concepts, topics, associations, and knowledge.
- **Declarative:** explicit facts and preferences.
- **Temporal:** validity over real-world time plus when Debo learned or recorded information.

These are conceptual domains; they do not imply four separate databases or four custom engines.

## 2. Ownership Boundaries

| Layer | Responsibility | Source of truth |
|---|---|---|
| Neon PostgreSQL | users, workspaces, source metadata, memory records, relations, provenance, lifecycle, audit records | **Canonical Debo state** |
| Cloudflare R2 | original uploaded/raw files and media | **Canonical raw bytes** |
| Memory provider | embeddings, derived indices, provider retrieval structures, provider-specific consolidation | **Derived retrieval state** |
| LangGraph | reasoning and answer synthesis | **Execution state, not product truth** |

A provider outage must not make canonical Debo data unrecoverable.

## 3. Retrieval Strategy

The first implementation should use provider capabilities through `MemoryProvider` rather than rebuilding a second memory engine inside Debo.

- Provider-supported dense/sparse retrieval remains provider-owned.
- Debo-owned filtering remains explicit for workspace, source lifecycle, permissions, and temporal constraints.
- Optional Debo-side reranking or lexical fallback is introduced only when evaluation proves the provider path is insufficient.
- Any PostgreSQL-only fallback is **degraded retrieval**, not an equivalent replacement.

Do not introduce BM25 + custom cross-encoder + custom entity-resolution + custom contradiction logic simultaneously with the selected provider unless a measured gap justifies it.

## 4. Lifecycle & Contradictions

Canonical lifecycle state and provenance live in Debo-owned records; provider indices may be rebuilt.

Contradictory observations should be retained with temporal validity and supersession metadata rather than silently overwriting historical state.

## 5. Source Grounding

A factual answer is grounded only when the cited evidence resolves to a canonical source record.

Provenance is source-specific:

- **PDF/document:** page, block/paragraph, bounding box when available.
- **Audio:** start/end timestamp and transcript segment.
- **Text/note:** character range or stable segment identifier.
- **Email:** message identifier plus stable body segment/attachment reference.
- **Web content:** canonical URL plus extracted segment and retrieval timestamp.

Do not promise byte-range precision unless the ingestion pipeline guarantees it.

## 6. Provider Abstraction

All provider access flows through `MemoryProvider`. The adapter may expose capabilities, limits, and degraded-mode signals so application code can make explicit decisions.

The abstraction is about portability; it does not pretend all providers implement identical semantics.

## 7. Evaluation

Accuracy, latency, contradiction handling, tenant isolation, and citation correctness become empirical only after running the Debo benchmark suites in `docs/evals/`.

See [provider-abstraction.md](provider-abstraction.md), [source-grounding.md](source-grounding.md), [lifecycle.md](lifecycle.md), and [evaluation-plan.md](evaluation-plan.md).
