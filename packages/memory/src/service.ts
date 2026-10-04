import type { Memory, TenantContext } from '@debo/types';
import { DegradedMemoryProvider } from './fallback';
import type {
  MemoryProvider,
  MemorySearchParams,
  MemorySearchResult,
  RememberParams,
  UserProfileContext,
} from './provider';

export class MemoryService implements MemoryProvider {
  public readonly name: string;
  private readonly primary: MemoryProvider;
  private readonly fallback: DegradedMemoryProvider;
  private isDegraded = false;

  constructor(primary?: MemoryProvider) {
    this.fallback = new DegradedMemoryProvider();
    this.primary = primary || this.fallback;
    this.name = this.primary.name;
    if (this.primary === this.fallback) {
      this.isDegraded = true;
    }
  }

  get isInDegradedMode(): boolean {
    return this.isDegraded;
  }

  async remember(context: TenantContext, params: RememberParams): Promise<Memory> {
    try {
      return await this.primary.remember(context, params);
    } catch (err) {
      this.isDegraded = true;
      return await this.fallback.remember(context, params);
    }
  }

  async search(context: TenantContext, params: MemorySearchParams): Promise<MemorySearchResult[]> {
    try {
      return await this.primary.search(context, params);
    } catch (err) {
      this.isDegraded = true;
      return await this.fallback.search(context, params);
    }
  }

  async recall(context: TenantContext, query: string, limit?: number): Promise<Memory[]> {
    try {
      return await this.primary.recall(context, query, limit);
    } catch (err) {
      this.isDegraded = true;
      return await this.fallback.recall(context, query, limit);
    }
  }

  async profile(context: TenantContext): Promise<UserProfileContext> {
    try {
      return await this.primary.profile(context);
    } catch (err) {
      this.isDegraded = true;
      return await this.fallback.profile(context);
    }
  }

  async forget(context: TenantContext, memoryId: string): Promise<boolean> {
    try {
      return await this.primary.forget(context, memoryId);
    } catch (err) {
      this.isDegraded = true;
      return await this.fallback.forget(context, memoryId);
    }
  }

  async update(
    context: TenantContext,
    memoryId: string,
    updates: Partial<RememberParams>,
  ): Promise<Memory> {
    try {
      return await this.primary.update(context, memoryId, updates);
    } catch (err) {
      this.isDegraded = true;
      return await this.fallback.update(context, memoryId, updates);
    }
  }
}
