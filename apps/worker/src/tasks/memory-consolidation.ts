import { MemoryService } from '@debo/memory';
import { TaskContext, WorkflowTask } from '@debo/workflows';

export interface MemoryConsolidationInput {
  targetTag?: string;
}

export interface MemoryConsolidationOutput {
  workspaceId: string;
  processedCount: number;
  consolidatedCount: number;
}

export function createMemoryConsolidationTask(
  memoryService: MemoryService,
): WorkflowTask<MemoryConsolidationInput, MemoryConsolidationOutput> {
  return {
    id: 'memory.consolidate',
    retryPolicy: {
      maxAttempts: 2,
      initialIntervalMs: 500,
      backoffFactor: 2,
      maxIntervalMs: 2000,
    },
    run: async (
      ctx: TaskContext,
      input: MemoryConsolidationInput,
    ): Promise<MemoryConsolidationOutput> => {
      // Step 1: Scan recent memories
      const memories = await ctx.runStep('scan_memories', async () => {
        const search = await memoryService.search(
          { workspaceId: ctx.workspaceId, userId: ctx.userId ?? 'system', role: 'member' },
          {
            query: input.targetTag ?? 'context update',
            limit: 20,
          },
        );
        return search;
      });

      // Step 2: Consolidate
      const consolidated = await ctx.runStep('consolidate_memories', async () => {
        // Group or summarize memories
        return memories.length;
      });

      return {
        workspaceId: ctx.workspaceId,
        processedCount: memories.length,
        consolidatedCount: consolidated,
      };
    },
  };
}
