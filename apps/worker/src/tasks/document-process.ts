import { MemoryService } from '@debo/memory';
import { TaskContext, WorkflowTask } from '@debo/workflows';

export interface DocumentProcessInput {
  documentId: string;
  sourceId: string;
  storageKey: string;
  extractedMarkdown?: string;
}

export interface DocumentProcessOutput {
  documentId: string;
  sourceId: string;
  pageCount: number;
  chunksIndexed: number;
  memoryIds: string[];
}

export function createDocumentProcessTask(
  memoryService: MemoryService,
): WorkflowTask<DocumentProcessInput, DocumentProcessOutput> {
  return {
    id: 'document.process',
    retryPolicy: {
      maxAttempts: 3,
      initialIntervalMs: 200,
      backoffFactor: 2,
      maxIntervalMs: 2000,
    },
    run: async (ctx: TaskContext, input: DocumentProcessInput): Promise<DocumentProcessOutput> => {
      // Step 1: Parse and validate markdown content
      const markdown = await ctx.runStep('extract_content', async () => {
        if (input.extractedMarkdown) {
          return input.extractedMarkdown;
        }
        return `Extracted content for document ${input.documentId}`;
      });

      // Split into paragraphs/chunks
      const paragraphs = markdown
        .split('\n\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const memoryIds: string[] = [];
      ctx.registerCompensation(async () => {
        for (const id of memoryIds) {
          await memoryService.forget(
            { workspaceId: ctx.workspaceId, userId: ctx.userId ?? 'system', role: 'member' },
            id,
          );
        }
      });

      // Step 2: Index each chunk
      await ctx.runStep('index_chunks', async () => {
        for (const paragraph of paragraphs) {
          const res = await memoryService.remember(
            { workspaceId: ctx.workspaceId, userId: ctx.userId ?? 'system', role: 'member' },
            {
              content: paragraph,
              sourceId: input.sourceId,
              metadata: { tags: ['document_chunk', input.documentId] },
            },
          );
          memoryIds.push(res.id);
        }
        return { count: memoryIds.length };
      });

      return {
        documentId: input.documentId,
        sourceId: input.sourceId,
        pageCount: 1,
        chunksIndexed: memoryIds.length,
        memoryIds,
      };
    },
  };
}
