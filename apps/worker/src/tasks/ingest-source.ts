import { MemoryService } from '@debo/memory';
import { TaskContext, WorkflowTask } from '@debo/workflows';

export interface IngestSourceInput {
  sourceId: string;
  storageKey: string;
  mimeType: string;
  byteSize: number;
  initialContent?: string;
}

export interface IngestSourceOutput {
  sourceId: string;
  indexedMemoryIds: string[];
  status: 'INDEXED' | 'QUEUED_FOR_PARSING';
}

export function createIngestSourceTask(
  memoryService: MemoryService,
): WorkflowTask<IngestSourceInput, IngestSourceOutput> {
  return {
    id: 'ingest.source',
    retryPolicy: {
      maxAttempts: 3,
      initialIntervalMs: 100,
      backoffFactor: 2,
      maxIntervalMs: 1000,
    },
    run: async (ctx: TaskContext, input: IngestSourceInput): Promise<IngestSourceOutput> => {
      // Step 1: Validate metadata
      await ctx.runStep('validate_metadata', async () => {
        if (!input.sourceId || !input.storageKey) {
          throw new Error('Missing required sourceId or storageKey');
        }
        return { valid: true };
      });

      // Compensation: In case indexing or downstream operations fail, purge any generated memories
      const createdMemoryIds: string[] = [];
      ctx.registerCompensation(async () => {
        for (const memId of createdMemoryIds) {
          await memoryService.forget(
            { workspaceId: ctx.workspaceId, userId: ctx.userId ?? 'system', role: 'member' },
            memId,
          );
        }
      });

      // Step 2: Index content if provided directly (e.g. note, markdown, snippet)
      if (input.initialContent) {
        const memoryResult = await ctx.runStep('index_direct_content', async () => {
          const res = await memoryService.remember(
            { workspaceId: ctx.workspaceId, userId: ctx.userId ?? 'system', role: 'member' },
            {
              content: input.initialContent!,
              sourceId: input.sourceId,
              metadata: { tags: ['source_ingest', input.mimeType] },
            },
          );
          return res;
        });

        createdMemoryIds.push(memoryResult.id);

        return {
          sourceId: input.sourceId,
          indexedMemoryIds: createdMemoryIds,
          status: 'INDEXED',
        };
      }

      // Step 3: For binary documents without pre-extracted text, flag for document processing
      return {
        sourceId: input.sourceId,
        indexedMemoryIds: [],
        status: 'QUEUED_FOR_PARSING',
      };
    },
  };
}
