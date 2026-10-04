# Status
accepted

# Context
Debo is a private AI memory and context operating system. The memory engine is our most mission-critical subsystem. It must store, index, link, deduplicate, and retrieve personal facts, episodic memories, and documents with exact source attribution. We must avoid coupling Debo permanently to any single vendor or proprietary SaaS.

# Decision
1. We design a formal, vendor-neutral **`MemoryProvider` interface** in `@debo/memory` (`docs/contracts/memory-provider.md`) covering `remember`, `recall`, `search`, `profile`, `forget`, and `update`.
2. We select **Supermemory** as our primary provider implementation based on our empirical scorecard (score 4.64/5.0).
3. We establish **Neon PostgreSQL** as the immutable business owner of memory records, metadata, and citation linkages, using Supermemory as an acceleration and retrieval engine.

# Alternatives
1. **Mem0**: Evaluated (score 4.10/5.0). Good user fact extraction, but TypeScript SDK is secondary to Python, and citation provenance is less granular.
2. **Graphiti / Neo4j**: Evaluated (score 4.01/5.0). Excellent multi-hop relational capabilities, but introduces significant operational complexity (Neo4j cluster) too early.
3. **Bespoke pgvector from scratch**: Evaluated. Requires building custom consolidation, decay algorithms, and contradiction engines from scratch, slowing product velocity.

# Why
Supermemory provides the optimal balance of native source grounding, TypeScript-first SDK, fast retrieval benchmarks (<120ms), and self-hosting flexibility. Wrapping it behind Debo's `MemoryProvider` ensures Debo remains resilient against future vendor shifts.

# Consequences
- **Positive**: Debo launches with state-of-the-art semantic memory, auto-categorization, and source grounding.
- **Negative**: Requires maintaining adapter code and running comprehensive regression evals (`docs/evals/memory/`) when upgrading provider releases.

# Migration / Exit Strategy
Because Neon PostgreSQL retains all canonical memory records and raw source pointers in Cloudflare R2, any memory provider can be fully rebuilt or swapped by re-indexing PostgreSQL records into a replacement adapter.

# Evidence
- Empirical comparison matrix: `docs/research/scorecard.md`.
- Deep dive: `docs/research/supermemory.md`.
