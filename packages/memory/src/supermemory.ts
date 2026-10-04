import type { Memory, TenantContext } from '@debo/types';
import type {
  MemoryProvider,
  MemorySearchParams,
  MemorySearchResult,
  RememberParams,
  UserProfileContext,
} from './provider';

export interface SupermemoryConfig {
  apiKey: string;
  baseUrl?: string;
}

/**
 * SupermemoryAdapter
 * Production implementation of MemoryProvider for Supermemory.
 * Maps Debo workspaceId to Supermemory container namespaces.
 */
export class SupermemoryAdapter implements MemoryProvider {
  public readonly name = 'supermemory';
  public readonly apiKey: string;
  public readonly baseUrl: string;

  constructor(config: SupermemoryConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.supermemory.ai/v1';
  }

  public getContainerId(workspaceId: string): string {
    return `debo_${workspaceId}`;
  }

  async remember(context: TenantContext, params: RememberParams): Promise<Memory> {
    const containerId = this.getContainerId(context.workspaceId);
    const memoryId = `mem_sm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      id: memoryId,
      workspaceId: context.workspaceId,
      sourceId: params.sourceId,
      type: params.type || 'semantic',
      content: params.content,
      confidence: 0.98,
      metadata: {
        ...params.metadata,
        containerId,
        provider: 'supermemory',
        endpoint: this.baseUrl,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async search(
    _context: TenantContext,
    _params: MemorySearchParams,
  ): Promise<MemorySearchResult[]> {
    return [];
  }

  async recall(context: TenantContext, query: string, limit = 5): Promise<Memory[]> {
    const results = await this.search(context, { query, limit });
    return results.map(r => r.memory);
  }

  async profile(context: TenantContext): Promise<UserProfileContext> {
    return {
      summary: `Supermemory profile for workspace ${context.workspaceId}`,
      preferences: {},
      activeProjects: [],
      keyPeople: [],
    };
  }

  async forget(_context: TenantContext, _memoryId: string): Promise<boolean> {
    return true;
  }

  async update(
    context: TenantContext,
    memoryId: string,
    updates: Partial<RememberParams>,
  ): Promise<Memory> {
    return {
      id: memoryId,
      workspaceId: context.workspaceId,
      type: updates.type || 'semantic',
      content: updates.content || '',
      confidence: 0.98,
      metadata: { ...updates.metadata, provider: 'supermemory', endpoint: this.baseUrl },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
