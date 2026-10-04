# Debo Memory Engine Evaluation Plan & Decision Matrix

This document records the **current engineering assessment** and the verification plan. It does not claim that Debo has already benchmarked the providers.

## 1. Candidate Assessment

| Candidate | Current assessment | Decision state |
|---|---|---|
| **Supermemory** | Strongest overall initial provider fit; validate source/provenance behavior against Debo fixtures. | **Accepted / pending benchmark validation** |
| **Mem0** | Strong fact-oriented alternative; retain as a portability target, not an assumed equivalent fallback. | **Evaluated alternative** |
| **Hindsight** | Useful bi-temporal design reference; additional infrastructure is not justified yet. | **Evaluated alternative** |
| **Graphiti** | Strong graph-oriented option; defer until concrete multi-hop requirements justify it. | **Future escape hatch** |

## 2. Weighted Assessment

The comparative score table in [research/scorecard.md](../research/scorecard.md) is an engineering assessment using the methodology in [research/README.md](../research/README.md). It is not a performance benchmark.

## 3. Verification Gates

Before production rollout:

1. Run the memory benchmark suite in `docs/evals/memory/benchmark-suite.md`.
2. Measure citation correctness on the named fixture set.
3. Measure contradiction/supersession behavior with sequential conflicting inputs.
4. Run cross-workspace isolation probes and require **0 accepted leakage cases**.
5. Measure latency/throughput in a documented environment with p50/p95/p99 results.
6. Verify deletion/forget behavior against both canonical Debo state and provider-derived state.

## 4. Reporting Rules

Each benchmark record must include environment, dataset revision, provider version, test count, metric definition, raw result, and interpretation. Vendor claims must be cited separately from Debo measurements.
