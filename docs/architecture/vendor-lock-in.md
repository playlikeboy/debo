# Vendor Lock-in & Portability Policy

Debo is built on the fundamental principle that user context, personal memories, and application code must never be held hostage by a third-party platform. We maintain strict abstraction boundaries, open data formats, and documented migration procedures for every major external dependency.

---

## 1. Vendor Portability Matrix

| Subsystem | Primary Provider | Abstraction Layer | Vendor-Specific Logic | Data Export Format | Fallback / Replacement Provider | Migration Complexity |
|---|---|---|---|---|---|---|
| **Memory Engine** | Supermemory | `@debo/memory` (`MemoryProvider` interface) | Underlying vector index, proprietary decay/ranking scoring. | Standard JSON (chunks, embeddings, citations, metadata). | Mem0, Qdrant + pgvector, self-hosted SQLite vector. | **Low**: Canonical records reside in PostgreSQL; re-indexing takes minutes. |
| **Action Connectors** | Composio | `@debo/connectors` | Composio cloud routing, proprietary trigger listeners. | Connection metadata in DB; tokens managed in Composio. | Nango, native API client SDKs. | **Medium**: Requires swapping tool calling adapters; zero data loss. |
| **Durable Workflows** | Trigger.dev v3 | `@debo/workflows` | Trigger task declaration wrapper (`task({ ... })`). | Task execution logs and state payloads in PostgreSQL. | Inngest, BullMQ + Redis, Hatchet. | **Low**: Job functions are vanilla async TypeScript functions. |
| **Primary Database** | Neon PostgreSQL | `@debo/db` (Drizzle ORM) | Neon serverless branching API. | Standard SQL dump (`pg_dump`), standard relational tables. | Supabase, AWS RDS, self-hosted PostgreSQL VPS. | **Very Low**: Standard PostgreSQL dialect with zero proprietary extensions. |
| **Raw Storage** | Cloudflare R2 | `@debo/storage` | Cloudflare account credentials. | Standard S3 objects (byte-for-byte original files). | AWS S3, Google Cloud Storage, MinIO (self-hosted). | **Zero**: Uses standard AWS S3 SDK v3 protocol. |
| **LLM Inference** | NVIDIA NIM / Anthropic | `@debo/ai` | Proprietary endpoint URLs and API keys. | Prompts and responses logged to LangSmith / DB. | OpenAI, DeepSeek, vLLM / Ollama (self-hosted). | **Very Low**: Standard LangChain `ChatModel` abstraction. |
| **Observability** | LangSmith / OpenTelemetry | `@debo/config` | LangSmith project tags and dashboard URL. | OpenTelemetry Protocol (OTLP) trace spans. | Grafana Tempo, Honeycomb, Datadog. | **Zero**: OpenTelemetry is an open vendor-neutral standard. |
| **Authentication** | Stack Auth | `@debo/auth` | Stack Auth client SDK and server verification. | User identity rows synced to `User` table in Neon DB. | Auth.js, Clerk, self-hosted Supabase Auth, Lucia. | **Medium**: User identities are mirrored in Neon DB, easing credential migration. |

---

## 2. In-Depth Subsystem Portability Protocols

### A. Memory Engine Portability
- **The Abstraction**: All memory operations pass through the `MemoryProvider` contract (`docs/contracts/memory-provider.md`):
  ```typescript
  export interface MemoryProvider {
    remember(params: RememberParams): Promise<MemoryRecord>;
    search(params: SearchParams): Promise<SearchResult[]>;
    recall(params: RecallParams): Promise<RecallResult>;
    forget(params: ForgetParams): Promise<void>;
    update(params: UpdateParams): Promise<MemoryRecord>;
  }
  ```
- **Portability Guarantee**: Neon PostgreSQL stores every memory fact, timestamp, and source document relationship. If Supermemory is sunset or alters pricing, a replacement provider (e.g. pgvector or Mem0) can be swapped in without modifying any LangGraph agent nodes. A Trigger.dev migration job replays all memories from PostgreSQL into the new vector index.

### B. Action Connectors Portability
- **The Abstraction**: Agents never import `@composio/core` directly into their reasoning nodes. Instead, agents request actions through `@debo/connectors`:
  ```typescript
  export interface ActionConnector {
    name: string;
    execute(action: string, params: Record<string, unknown>): Promise<ActionResult>;
  }
  ```
- **Portability Guarantee**: Because credentials and tools are accessed through this contract, individual connectors (e.g., Google Calendar) can be migrated from Composio to native Google API clients or Nango seamlessly.

### C. Workflow Engine Portability
- **The Abstraction**: Workflow payloads and step logics are organized as pure async functions in `@debo/workflows`.
- **Portability Guarantee**: Trigger.dev tasks wrap business functions. Migrating from Trigger.dev to Inngest or BullMQ involves changing only the workflow orchestrator wrapper without rewriting the document parsing, chunking, or memory consolidation algorithms.

### D. LLM Model Portability
- **The Abstraction**: `@debo/ai` routes model requests using standard LangChain `ChatModel` instances.
- **Portability Guarantee**: Changing models from NVIDIA NIM to DeepSeek or Anthropic requires only toggling the `model` identifier string in the environment configuration. No prompts or structured output schemas require rewriting.
