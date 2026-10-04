import type { Memory, TenantContext } from '@debo/types';
import type {
  MemoryProvider,
  MemorySearchParams,
  MemorySearchResult,
  RememberParams,
  UserProfileContext,
} from './provider';

/**
 * DegradedMemoryProvider
 * In-memory / lexical search fallback when external primary provider (Supermemory) is unavailable.
 * Guarantees zero cross-tenant leakage by strictly indexing under workspaceId.
 */
export class DegradedMemoryProvider implements MemoryProvider {
  public readonly name = 'degraded_fallback';
  private readonly store: Map<string, Memory[]> = new Map();

  private getWorkspaceMemories(workspaceId: string): Memory[] {
    let list = this.store.get(workspaceId);
    if (!list) {
      list = [];
      this.store.set(workspaceId, list);
    }
    return list;
  }

  async remember(context: TenantContext, params: RememberParams): Promise<Memory> {
    const list = this.getWorkspaceMemories(context.workspaceId);
    const newMemory: Memory = {
      id: `mem_fallback_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      workspaceId: context.workspaceId,
      sourceId: params.sourceId,
      type: params.type || 'semantic',
      content: params.content,
      confidence: 0.75, // Degraded confidence
      metadata: { ...params.metadata, provider: 'degraded_fallback' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(newMemory);
    return newMemory;
  }

  async search(context: TenantContext, params: MemorySearchParams): Promise<MemorySearchResult[]> {
    const list = this.getWorkspaceMemories(context.workspaceId);
    const queryTokens = params.query.toLowerCase().split(/\s+/).filter(Boolean);

    const matches = list
      .map(mem => {
        const text = mem.content.toLowerCase();
        let hitCount = 0;
        for (const token of queryTokens) {
          if (text.includes(token)) {
            hitCount++;
          }
        }
        const score = queryTokens.length > 0 ? hitCount / queryTokens.length : 0;
        return { memory: mem, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, params.limit || 10);

    return matches;
  }

  async recall(context: TenantContext, query: string, limit = 5): Promise<Memory[]> {
    const results = await this.search(context, { query, limit });
    return results.map(r => r.memory);
  }

  async profile(context: TenantContext): Promise<UserProfileContext> {
    const list = this.getWorkspaceMemories(context.workspaceId);
    return {
      summary: `Workspace has ${list.length} indexed memory records in degraded mode.`,
      preferences: {},
      activeProjects: [],
      keyPeople: [],
    };
  }

  async forget(context: TenantContext, memoryId: string): Promise<boolean> {
    const list = this.getWorkspaceMemories(context.workspaceId);
    const initialLen = list.length;
    const filtered = list.filter(m => m.id !== memoryId);
    this.store.set(context.workspaceId, filtered);
    return filtered.length < initialLen;
  }

  async update(
    context: TenantContext,
    memoryId: string,
    updates: Partial<RememberParams>,
  ): Promise<Memory> {
    const list = this.getWorkspaceMemories(context.workspaceId);
    const memory = list.find(m => m.id === memoryId);
    if (!memory) {
      throw new Error(`Memory '${memoryId}' not found in workspace '${context.workspaceId}'`);
    }

    if (updates.content !== undefined) memory.content = updates.content;
    if (updates.type !== undefined) memory.type = updates.type;
    if (updates.metadata !== undefined) {
      memory.metadata = { ...memory.metadata, ...updates.metadata };
    }
    memory.updatedAt = new Date().toISOString();
    return memory;
  }
}
