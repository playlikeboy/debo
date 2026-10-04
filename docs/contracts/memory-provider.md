# Memory Provider Contract Specification

This document defines the normative TypeScript interface and data transfer objects for `@debo/memory`.

---

## 1. Complete Interface Definition

```typescript
export interface MemoryProvider {
  name: string;
  version: string;

  remember(params: RememberParams): Promise<MemoryRecord>;
  search(params: SearchParams): Promise<SearchResult[]>;
  recall(params: RecallParams): Promise<RecallResult>;
  profile(params: ProfileParams): Promise<UserProfileMemory>;
  update(params: UpdateMemoryParams): Promise<MemoryRecord>;
  forget(params: ForgetParams): Promise<void>;
  healthCheck(): Promise<{ isHealthy: boolean; latencyMs: number }>;
}

export interface MemoryRecord {
  memoryId: string; // mem_<ulid>
  workspaceId: string;
  sourceId: string;
  documentId?: string;
  chunkId: string;
  content: string;
  category: 'episodic' | 'semantic' | 'declarative' | 'procedural';
  validFrom: Date;
  validTo?: Date;
  isSuperseded: boolean;
  supersededById?: string;
  confidenceScore: number; // 0.0 to 1.0
  metadata: Record<string, unknown>;
  createdAt: Date;
}
```
