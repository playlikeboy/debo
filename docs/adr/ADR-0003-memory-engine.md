# ADR-0003 — Memory Engine

## Status
accepted — pending implementation benchmark validation

## Context
Debo needs a provider-neutral memory boundary for personal facts, episodic context, temporal state, retrieval, and source attribution. The selected provider must not become the canonical owner of Debo product state.

## Decision
1. Define `MemoryProvider` in `docs/contracts/memory-provider.md`.
2. Use **Supermemory** as the initial memory provider.
3. Keep **Neon PostgreSQL** as the canonical owner of Debo business state and provenance metadata.
4. Keep **Cloudflare R2** as the canonical owner of original/raw binary sources.
5. Treat provider indices, embeddings, and provider-specific retrieval/consolidation state as derived state that can be rebuilt where the contract permits.
6. Treat provider outage fallback as **degraded retrieval**, not an equivalent replacement.

## Alternatives
- **Mem0:** evaluated alternative.
- **Hindsight:** bi-temporal model influenced Debo's schema thinking; not selected as the provider.
- **Graphiti:** future escape hatch if multi-hop graph requirements justify additional infrastructure.
- **Bespoke pgvector stack:** rejected for the initial build because it would duplicate significant memory-engine responsibilities before measured need is established.

## Why
Supermemory is currently the best-fit initial provider assessment for Debo. The provider-neutral boundary keeps the rest of the product independent of provider-specific APIs and semantics.

## Consequences
- **Positive:** faster initial delivery and access to mature retrieval capabilities.
- **Negative:** adapter maintenance, provider-specific capability gaps, vendor availability risk, and required regression evaluation across provider upgrades.

## Exit strategy
Because Debo owns canonical records and raw sources, a replacement provider can be introduced by implementing the same `MemoryProvider` contract and rebuilding derived state from Debo-owned data.

## Evidence
- [Technology scorecard](../research/scorecard.md) — engineering assessment.
- [Supermemory research](../research/supermemory.md) — provider evidence and notes.
- [Memory evaluation plan](../memory/evaluation-plan.md) — verification gates.
