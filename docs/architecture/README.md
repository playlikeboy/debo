# Debo System Architecture

This directory defines the high-level system architecture, operational boundaries, vendor lock-in mitigations, and architectural philosophies governing Debo.

---

## Architecture Documents Index

1. **[System Overview & Boundaries](file:///home/kunalkashyap8024/sop/debo/docs/architecture/system-overview.md)**
   - Monorepo structure, deployable applications, shared internal packages, network boundaries, synchronous vs asynchronous flows, and failure isolation.
2. **[Vendor Lock-in & Portability Policy](file:///home/kunalkashyap8024/sop/debo/docs/architecture/vendor-lock-in.md)**
   - Strict abstraction layers, migration strategies, and fallback paths for Memory, Workflows, Database, Connectors, LLM inference, and Storage.
3. **[Architecture vs Specification vs Plan](file:///home/kunalkashyap8024/sop/debo/docs/architecture/adr-spec-plan-distinction.md)**
   - Formal separation between ADRs (Why), Specifications (What), Plans (How/When), Tickets (Units of Work), and Status Ledgers (What Is Verified).

---

## Core Architectural Invariants

1. **Minimal Deployables**: Debo is not a sprawling microservice architecture. It operates with 4 core services (`debo-web`, `debo-mcp`, `debo-worker`, `debo-document-worker`).
2. **Single Source of Business Truth**: Neon PostgreSQL is the sole canonical authority for business state, users, workspaces, permissions, and audit logs.
3. **Immutable Source Preservation**: Raw files are preserved unaltered in Cloudflare R2; vector and memory graphs are derived acceleration structures.
4. **Deterministic Security**: The Large Language Model is an untrusted reasoning engine, never an authority for permissions or security decisions.
5. **Zero Hallucination Tolerance**: Every assertion rendered to users or emitted over MCP must be verifiable through source citations pointing back to immutable records.
