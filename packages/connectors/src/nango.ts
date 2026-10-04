import type { TenantContext } from '@debo/types';
import { SyncConnector, SyncRecordsResult } from './types';

export interface NangoClientConfig {
  secretKey?: string;
  host?: string;
}

export class NangoConnector implements SyncConnector {
  public readonly slug: string;
  public readonly displayName: string;
  public readonly config: NangoClientConfig;

  public get clientConfig(): NangoClientConfig {
    return this.config;
  }

  constructor(slug: string, displayName: string, config: NangoClientConfig = {}) {
    this.slug = slug;
    this.displayName = displayName;
    this.config = config;
  }

  async sync(
    context: TenantContext,
    connectionId: string,
    model: string,
    cursor?: string,
  ): Promise<SyncRecordsResult> {
    // Return typed sync result batch
    return {
      recordsFetched: 5,
      hasMore: false,
      nextCursor: undefined,
      data: [
        {
          id: `rec_${this.slug}_1`,
          connectionId,
          workspaceId: context.workspaceId,
          model,
          syncedAt: new Date().toISOString(),
          cursor,
        },
      ],
    };
  }
}
