# Debo Memory Evaluation Framework

To maintain the highest level of user trust and accuracy, Debo implements an automated, reproducible memory evaluation framework. We do not rely on subjective vibes; every candidate memory engine, prompt modification, and embedding model must pass quantifiable regression benchmarks.

---

## 1. Evaluation Architecture

```text
[ Synthetic & Anonymized Test Datasets ]
                   │
                   ▼
┌──────────────────────────────────────┐
│        Automated Eval Runner         │ ── (Triggered on PR & Release)
└──────────────────┬───────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌──────────────────┐ ┌──────────────────┐
│ Retrieval Bench  │ │ Grounding Bench  │ ── (Exact Fact, Multi-Hop, Paraphrase)
└──────────────────┘ └──────────────────┘
         │                   │
         ▼                   ▼
┌──────────────────┐ ┌──────────────────┐
│  Temporal Bench  │ │  Privacy Bench   │ ── (State Changes, Tenant Bleed)
└──────────────────┘ └──────────────────┘
                   │
                   ▼
       [ Standard Metrics Output ]
 (Recall@K, nDCG, MRR, Citation Acc, Latency)
```

---

## 2. Directory Index

1. **[Benchmark Suite Specification](file:///home/kunalkashyap8024/sop/debo/docs/evals/memory/benchmark-suite.md)**:
   - Full definition of the 7 core evaluation tracks: Retrieval, Temporal, Relational, Contradictions, Grounding, Privacy Isolation, and Multimodal parsing.
2. **[Test Dataset Structure](file:///home/kunalkashyap8024/sop/debo/docs/evals/memory/test-dataset-structure.md)**:
   - Canonical JSON schema for synthetic memory evaluation corpora, ground truth assertions, and citation coordinate maps.

---

## 3. Standard Pass/Fail Thresholds for Release

| Benchmark Track | Key Metric | Target Minimum | Blocking Gate |
|---|---|---|---|
| Exact Fact Retrieval | Recall@5 | $\ge 95\%$ | Yes |
| Semantic Paraphrase | nDCG@10 | $\ge 0.88$ | Yes |
| Temporal Validity | Temporal Accuracy | $\ge 92\%$ | Yes |
| Contradiction Resolution | Latest Valid State Recall | $\ge 98\%$ | Yes |
| Source Grounding | Citation Correctness | $\ge 98\%$ | Yes |
| Tenant Privacy | Cross-Tenant Leakage | **0.00%** | **CRITICAL P0** |
| Retrieval Latency | P95 Latency | $\le 250\text{ms}$ | Warning |
