# Memory Provider Abstraction Contract

Debo decouples its high-level agent reasoning from specific vector or memory storage implementations. All interactions with Supermemory, Mem0, or fallback vector databases pass through the strict, type-safe `MemoryProvider` contract in `@debo/memory`.

---

## 1. The Core TypeScript Interface

```typescript
export interface MemoryProvider {
  /**
   * Ingests a structured memory chunk or extracted fact into the memory graph.
   */
  remember(params: RememberParams): Promise<MemoryRecord>;

  /**
   * Performs hybrid semantic and keyword search across memories within tenant scope.
   */
  search(params: SearchParams): Promise<SearchResult[]>;

  /**
   * Retrieves synthesized contextual memories relevant to an ongoing conversation or task.
   */
  recall(params: RecallParams): Promise<RecallResult>;

  /**
   * Retrieves or updates the distilled declarative user profile/preferences.
   */
  profile(params: ProfileParams): Promise<UserProfileMemory>;

  /**
   * Updates an existing memory fact, establishing a superseding relationship.
   */
  update(params: UpdateMemoryParams): Promise<MemoryRecord>;

  /**
   * Permanently purges a memory item or all memories associated with a deleted source.
   */
  forget(params: ForgetParams): Promise<void>;
}
```

---

## 2. Core Parameter & Return Types

```typescript
export interface RememberParams {
  workspaceId: string;
  userId: string;
  sourceId: string;
  documentId?: string;
  chunkId: string;
  content: string;
  category: 'episodic' | 'semantic' | 'declarative' | 'procedural';
  validFrom?: Date;
  validTo?: Date;
  metadata: Record<string, unknown>;
  tags?: string[];
}

export interface SearchParams {
  workspaceId: string;
  userId: string;
  query: string;
  limit?: number; // Default: 10
  minRelevance?: number; // 0.0 - 1.0 (Default: 0.70)
  categories?: ('episodic' | 'semantic' | 'declarative')[];
  timeframe?: {
    start?: Date;
    end?: Date;
  };
  filterTags?: string[];
}

export interface SearchResult {
  memoryId: string;
  chunkId: string;
  sourceId: string;
  content: string;
  score: number; // Normalized hybrid score
  validFrom?: Date;
  validTo?: Date;
  isSuperseded: boolean;
  metadata: Record<string, unknown>;
}

export interface RecallParams {
  workspaceId: string;
  userId: string;
  prompt: string;
  activeContext?: string[];
  maxTokens?: number;
}

export interface RecallResult {
  memories: SearchResult[];
  profileContext: Record<string, string>;
  suggestedFollowups?: string[];
}

export interface ForgetParams {
  workspaceId: string;
  memoryId?: string;
  sourceId?: string; // If set, purges all chunks derived from this source
}
```

---

## 3. Guarantees & Non-Functional Requirements

### 1. Deterministic Tenant Isolation
Every method requires `workspaceId` as an explicit parameter. The underlying adapter must inject `workspaceId` as a hard filter in all vector queries and database lookups. Any query lacking `workspaceId` throws an unhandled `SecurityException`.

### 2. Consistency Model
- **Read-Your-Writes**: Writes to Neon PostgreSQL are immediate (ACID).
- **Eventual Consistency in Vector Index**: Ingestion into Supermemory vector indexing completes asynchronously via Trigger.dev. Search results are consistent within $< 500\text{ms}$ of extraction.

### 3. Fallback Behavior
If the primary memory provider (Supermemory) returns a 5xx error or exceeds a 1500ms timeout threshold, the provider automatically falls back to:
1. Local PostgreSQL full-text search (`tsvector` with BM25 ranking).
2. Cached declarative profile memories in Redis/memory.
3. Emitting a warning log to LangSmith indicating degraded search precision.

### 4. Provider Migration Protocol
Because Neon PostgreSQL retains all canonical records, migrating from Supermemory to an alternative (e.g. self-hosted Qdrant or Mem0) is executed via a simple batch command:
```bash
# In Phase 4+:
bun run memory:reindex --provider=qdrant --workspace=all
```
The migration script streams all active memory rows from PostgreSQL into the target provider with zero loss of source grounding or temporal timestamps.
