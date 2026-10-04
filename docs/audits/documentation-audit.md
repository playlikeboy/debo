# Documentation Audit & Reconciliation — 2026-10-04

## Scope

Phase 0 documentation was reviewed for architecture consistency, research evidence quality, ownership boundaries, protocol/version accuracy, route scope, and repository portability.

## Findings resolved

| Finding | Resolution |
|---|---|
| Research used empirical language for unexecuted/vendor-reported scores | Reclassified scorecards as engineering assessments and added explicit evidence classes |
| Seven-category formula actually contained eight weighted terms | Corrected methodology |
| Supermemory vs Neon memory ownership was ambiguous | Neon/R2 canonical state vs provider-derived state is now explicit |
| Memory architecture risked rebuilding provider features | Provider-owned retrieval is separated from optional Debo-owned filtering/fallback |
| Provider fallback sounded equivalent | Explicitly documented as degraded retrieval |
| Byte-range provenance was promised across source types | Replaced with source-specific provenance metadata |
| “Zero hallucination” was stated as an absolute | Replaced with source-grounded design invariant and measurable evals |
| AG-UI / assistant-ui / CopilotKit roles were blurred | AG-UI = protocol; assistant-ui = optional primitives; CopilotKit = not required |
| MCP docs used legacy HTTP+SSE as primary transport | Updated to MCP 2026-07-28, SDK v2, Streamable HTTP, and stdio |
| Trigger.dev baseline was v3 | Updated to Trigger.dev 4.x; v3 is not a target |
| Route spec made every page implementation-normative | Split into MVP, Post-MVP, Experimental, and Admin |
| AGENTS/CLAUDE duplicated architecture detail | Reduced to concise operating guidance |
| GitHub docs contained machine-local `file://` links | Core documentation links were converted to repository-relative paths |
| “Immutable” was applied to mutable relational state | Ownership language now uses canonical, derived, raw, versioned, and append-only where appropriate |
| Phase status implied runtime verification | Status now separates documentation reconciliation from implementation/benchmark verification |

## Evidence policy

Material technology claims should be labelled as official evidence, repository observation, independent benchmark, Debo benchmark, engineering assessment, or unverified hypothesis. Vendor claims must not be presented as Debo measurements.

## Remaining work

Phase 1 must pin exact package versions, build integration spikes, and run Debo-owned benchmarks before latency, citation accuracy, or throughput numbers are promoted to empirical results.
