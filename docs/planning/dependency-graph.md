# Debo Implementation Dependency Graph

This document details the topological dependency graph across all system modules, packages, and services. Work cannot advance to a downstream layer until upstream contracts and baseline implementations are verified.

```mermaid
graph TD
    classDef foundation fill:#1e293b,stroke:#475569,stroke-width:2px,color:#f8fafc;
    classDef platform fill:#0f766e,stroke:#14b8a6,stroke-width:2px,color:#f0fdfa;
    classDef memory fill:#4338ca,stroke:#6366f1,stroke-width:2px,color:#e0e7ff;
    classDef agent fill:#7e22ce,stroke:#a855f7,stroke-width:2px,color:#faf5ff;
    classDef surface fill:#b45309,stroke:#f59e0b,stroke-width:2px,color:#fef3c7;

    F1["DEBO-0001: Monorepo Foundation & Tooling"]:::foundation
    F2["DEBO-0002: Domain Types & Error Envelopes"]:::foundation
    
    P1["DEBO-0003: Neon DB Schema & Drizzle ORM"]:::platform
    P2["DEBO-0004: Identity, Tenancy & Non-LLM Auth"]:::platform
    P3["DEBO-0005: R2 Storage & Presigned URLs"]:::platform
    
    M1["DEBO-0006: MemoryProvider & Supermemory"]:::memory
    M2["DEBO-0007: Source Grounding & Citations"]:::memory
    
    W1["DEBO-0009: Durable Workflows (Trigger.dev)"]:::platform
    W2["DEBO-0010: Document Worker (Docling FastAPI)"]:::platform
    W3["DEBO-0011: Connectors (Composio / Nango)"]:::platform
    
    A1["DEBO-0012: LangGraph JS Agent Runtime"]:::agent
    
    S1["DEBO-0008: Official MCP Server (apps/mcp)"]:::surface
    S2["DEBO-0013: Agentic UI & Web App (apps/web)"]:::surface
    S3["DEBO-0014: E2E Verification & Hardening"]:::surface

    F1 --> F2
    F2 --> P1
    F2 --> P2
    P1 --> P2
    P2 --> P3
    P1 --> M1
    F2 --> M1
    P3 --> M2
    M1 --> M2
    P3 --> W2
    P1 --> W1
    M1 --> W1
    P2 --> W3
    M1 --> A1
    M2 --> A1
    P2 --> A1
    A1 --> S1
    M1 --> S1
    A1 --> S2
    P2 --> S2
    S1 --> S3
    S2 --> S3
```

---

## Topological Execution Waves

### Wave 1: Repository Foundation (Phase 1)
- **`DEBO-0001`**: Monorepo scaffolding, Bun workspaces, Turborepo, shared tsconfig, Biome linting.
- **`DEBO-0002`**: Domain primitives, error types, result envelopes, zero-dependency contract types.

### Wave 2: Persistence & Authorization (Phase 2 & 3)
- **`DEBO-0003`**: PostgreSQL Drizzle schema, 24 normalized entities, tenant foreign keys, migration generator.
- **`DEBO-0004`**: Deterministic auth resolver, session verification, workspace context, Non-LLM Authority invariant.
- **`DEBO-0005`**: Cloudflare R2 object storage client, SigV4 presigned upload/download URLs.

### Wave 3: Memory Subsystem & Provenance (Phase 4)
- **`DEBO-0006`**: `MemoryProvider` contract, Supermemory SDK adapter, semantic recall, fallback degraded mode.
- **`DEBO-0007`**: Source grounding verifier, character span validation, bounding box mapping, anti-hallucination guard.

### Wave 4: Processing Workers & Connectors (Phase 7, 8, 12)
- **`DEBO-0009`**: Trigger.dev v3 background task pipelines, retries, cron schedules.
- **`DEBO-0010`**: Python Docling worker, layout OCR, table extraction, HTTP service.
- **`DEBO-0011`**: Composio tool actions, Nango continuous OAuth sync, encrypted credentials vault.

### Wave 5: Agent Intelligence Core (Phase 5)
- **`DEBO-0012`**: LangGraph JS cyclic state graph engine, tool permission pipeline, human approval interrupts.

### Wave 6: Presentation & External Gateways (Phase 6, 9)
- **`DEBO-0008`**: Official MCP server (`apps/mcp`), Streamable HTTP & stdio transports, tool taxonomy.
- **`DEBO-0013`**: Next.js App Router web application (`apps/web`), AG-UI streaming protocol, calm editorial Radix/Tailwind components.

### Wave 7: Verification & Hardening (Phase 16)
- **`DEBO-0014`**: Full-system E2E test suite, memory evaluation benchmarks, security penetration checks, Cloudflare Tunnel verification.
