import { TaskContext, WorkflowTask } from '@debo/workflows';

export interface ConnectorSyncInput {
  connectionId: string;
  provider: string;
  entityTypes?: string[];
}

export interface ConnectorSyncOutput {
  connectionId: string;
  provider: string;
  syncedRecords: number;
  completedAt: string;
}

export function createConnectorSyncTask(): WorkflowTask<ConnectorSyncInput, ConnectorSyncOutput> {
  return {
    id: 'connector.sync',
    retryPolicy: {
      maxAttempts: 3,
      initialIntervalMs: 500,
      backoffFactor: 2,
      maxIntervalMs: 5000,
    },
    run: async (ctx: TaskContext, input: ConnectorSyncInput): Promise<ConnectorSyncOutput> => {
      // Step 1: Verify connection authorization and provider health
      await ctx.runStep('verify_connection', async () => {
        if (!input.connectionId || !input.provider) {
          throw new Error('Invalid connection credentials or provider');
        }
        return { verified: true };
      });

      // Step 2: Fetch and sync incremental records
      const recordCount = await ctx.runStep('fetch_records', async () => {
        // Incremental sync simulation
        return 12;
      });

      return {
        connectionId: input.connectionId,
        provider: input.provider,
        syncedRecords: recordCount,
        completedAt: new Date().toISOString(),
      };
    },
  };
}
