import type { Memory, TenantContext } from '@debo/types';

export interface RememberParams {
  content: string;
  sourceId?: string;
  type?: Memory['type'];
  metadata?: Record<string, unknown>;
  validFrom?: string;
  validUntil?: string;
}

export interface MemorySearchParams {
  query: string;
  limit?: number;
  types?: Memory['type'][];
  sourceId?: string;
  minConfidence?: number;
}

export interface MemorySearchResult {
  memory: Memory;
  score: number;
  snippet?: string;
}

export interface UserProfileContext {
  summary: string;
  preferences: Record<string, unknown>;
  activeProjects: string[];
  keyPeople: string[];
}

export interface MemoryProvider {
  readonly name: string;

  remember(context: TenantContext, params: RememberParams): Promise<Memory>;

  search(context: TenantContext, params: MemorySearchParams): Promise<MemorySearchResult[]>;

  recall(context: TenantContext, query: string, limit?: number): Promise<Memory[]>;

  profile(context: TenantContext): Promise<UserProfileContext>;

  forget(context: TenantContext, memoryId: string): Promise<boolean>;

  update(
    context: TenantContext,
    memoryId: string,
    updates: Partial<RememberParams>,
  ): Promise<Memory>;
}
