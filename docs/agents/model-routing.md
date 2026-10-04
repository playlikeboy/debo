# Dynamic Model Routing Architecture

Debo avoids the anti-pattern of funneling every operational request to a single expensive frontier model. This document defines the future routing policy designed in `@debo/ai`.

---

## 1. Task-to-Model Routing Matrix

```text
Incoming Task Request
          │
          ▼
┌──────────────────┐
│  Router Policy   │
└─────────┬────────┘
          │
          ├─────────────────────────────────────────────────┐
          │                                                 │
          ▼                                                 ▼
┌──────────────────────┐                         ┌──────────────────────┐
│  High-Throughput     │                         │  Deep Reasoning      │
│  Fast Tasks          │                         │  Frontier Tasks      │
│  (NVIDIA Llama 3.3   │                         │  (Claude 3.5 Sonnet  │
│   8B / Nemotron)     │                         │   / Nemotron 70B)    │
└──────────────────────┘                         └──────────────────────┘
  - Intent classification                          - Complex multi-hop synthesis
  - Keyword extraction                             - Source citation validation
  - Conversation title naming                      - Contradiction resolution
  - Vector search query rewrite                    - Code & JSON plan generation
```

---

## 2. Policy-Based Router Rules

1. **Memory Ingestion Pass**:
   - Primary: Optimized extraction model (e.g. DeepSeek V3 or Nemotron 70B via NVIDIA NIM) for cost-efficient entity extraction.
2. **Interactive User Synthesis**:
   - Primary: Claude 3.5 Sonnet / Nemotron 70B for strict adherence to inline citation grounding markers (`[^chunkId]`).
3. **Automated Failover Circuit**:
   - If Provider A responds with HTTP 429 (Rate Limit) or 503 (Unavailable), the router falls back to Provider B within 500ms without surfacing an error to the user.
4. **Budget & Cost Caps**:
   - Workspaces can configure monthly token spend limits. If a workspace reaches 90% of its budget, non-critical background jobs automatically downgrade to lower-cost tiers.
