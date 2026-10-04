# Inter-Phase & Subsystem Dependency Graph

This document visualizes the hard architectural prerequisites connecting Debo's engineering deliverables. Work on a downstream phase MUST NOT begin until its upstream dependencies have reached verified status.

---

## 1. Phase Dependency Graph

```text
Phase 0: Documentation & Clean-Room Baseline
   │
   ▼
Phase 1: Repository Bootstrap (Bun + Turborepo)
   │
   ▼
Phase 2: Identity & Tenancy (Auth + DB)
   │
   ├─────────────────────────────────────────┐
   ▼                                         ▼
Phase 3: Source Ingestion (R2)             Phase 9: MCP Server
   │                                         │
   ▼                                         ▼
Phase 4: Memory Engine (Supermemory)       Phase 10: MCP Apps
   │                                         │
   ▼                                         ▼
Phase 5: Agent Runtime (LangGraph)         Phase 11: Agent Skills
   │
   ├────────────────────┬────────────────────┐
   ▼                    ▼                    ▼
Phase 6: Agent UI    Phase 7: Connectors   Phase 8: Workflows
(AG-UI + Design)     (Composio Actions)    (Trigger.dev)
                                             │
                                             ├───────────────────┐
                                             ▼                   ▼
                                    Phase 12: Docling   Phase 13: Browser
                                    (Python Worker)     (Stagehand)
                                             │                   │
                                             └─────────┬─────────┘
                                                       │
                                                       ▼
                                            Phase 14: Security & OTel
                                                       │
                                                       ▼
                                            Phase 15: Closed Beta
                                                       │
                                                       ▼
                                            Phase 16: Public Launch
```

---

## 2. Critical Path Invariants

1. **No Code Before Phase 0 Sign-Off**: No application code or dependencies may be committed until the Phase 0 documentation baseline is merged and tagged.
2. **Database Before Memory**: The relational schema in `@debo/db` (Phase 2) must be defined before configuring the `MemoryProvider` (Phase 4), because PostgreSQL is the canonical source of truth for memory foreign keys.
3. **Agent Graph Before UI**: LangGraph state channels and AG-UI event schemas (Phase 5) must be formalized before building presentation components (Phase 6).
