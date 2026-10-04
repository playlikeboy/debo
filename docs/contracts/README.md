# Debo System Contracts & Boundary Schemas

This directory contains versioned interface definitions, network schemas, and serialization contracts connecting Debo's distributed subsystems.

---

## 1. Boundary Design Rules

1. **Explicit Type Contracts**: No inter-service or cross-package communication may rely on untyped `any` or loose dictionaries. All boundaries must have a defined TypeScript interface or JSON Schema.
2. **Schema Versioning**: Network contracts include an explicit `version` field (e.g. `v1`).
3. **Runtime Validation**: Input payloads across network boundaries (HTTP API, MCP, Worker queues) must be parsed through Zod schemas before being processed by application logic.

---

## 2. Contracts Index

- **[HTTP API Contract](file:///home/kunalkashyap8024/sop/debo/docs/contracts/http-api.md)** — REST and streaming endpoints connecting `apps/web` client to Next.js route handlers.
- **[Model Context Protocol Contract](file:///home/kunalkashyap8024/sop/debo/docs/contracts/mcp.md)** — Official MCP tool and resource schemas.
- **[Memory Provider Contract](file:///home/kunalkashyap8024/sop/debo/docs/contracts/memory-provider.md)** — Interface for Supermemory and alternative vector stores.
- **[Connector Provider Contract](file:///home/kunalkashyap8024/sop/debo/docs/contracts/connector-provider.md)** — Interface for Composio and Nango action execution.
- **[Document Worker Contract (TS ↔ Python)](file:///home/kunalkashyap8024/sop/debo/docs/contracts/document-worker.md)** — Serialization contract between TypeScript ingestion queues and the Python Docling worker.
- **[Agent State Contract](file:///home/kunalkashyap8024/sop/debo/docs/contracts/agent-state.md)** — LangGraph state schemas and reducer signatures.
