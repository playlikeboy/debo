import { MemoryService } from '@debo/memory';
import { buildSourceStorageKey, R2StorageService } from '@debo/storage';
import type { TenantContext } from '@debo/types';
import { McpToolCallResult, McpToolDefinition } from './protocol';

export function wrapUntrustedSource(content: string): string {
  return `<untrusted_source_data>\n${content.trim()}\n</untrusted_source_data>`;
}

export const DEBO_MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'debo_search_memory',
    description:
      'Performs hybrid semantic and keyword search across indexed memories in the active Debo workspace.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query or concept to recall.' },
        limit: { type: 'integer', description: 'Max memories to return (default: 10, max: 25).' },
        timeframe_start: { type: 'string', description: 'ISO 8601 start date.' },
        timeframe_end: { type: 'string', description: 'ISO 8601 end date.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'debo_recall',
    description:
      'Contextual associative recall for active agent reasoning, retrieving relevant facts and summaries.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Active task or conversation context prompt.' },
        limit: { type: 'integer', description: 'Max items (default: 5).' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'debo_get_memory',
    description: 'Retrieves a single memory record by its unique ID.',
    inputSchema: {
      type: 'object',
      properties: {
        memory_id: { type: 'string', description: 'ULID identifier (mem_...).' },
      },
      required: ['memory_id'],
    },
  },
  {
    name: 'debo_save_memory',
    description: "Ingests a new atomic fact into the user's private memory graph.",
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Factual assertion to remember.' },
        source_id: { type: 'string', description: 'Optional associated source ID.' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Optional tags.' },
      },
      required: ['content'],
    },
  },
  {
    name: 'debo_forget_memory',
    description: 'Permanently purges a memory record from the active and historical graph.',
    inputSchema: {
      type: 'object',
      properties: {
        memory_id: { type: 'string', description: 'Target memory to purge.' },
      },
      required: ['memory_id'],
    },
  },
  {
    name: 'debo_get_source',
    description:
      'Retrieves source container metadata and a temporary pre-signed preview URL for an original document.',
    inputSchema: {
      type: 'object',
      properties: {
        source_id: {
          type: 'string',
          description: 'The unique ULID of the source container (src_...).',
        },
        filename: { type: 'string', description: 'Optional original filename.' },
      },
      required: ['source_id'],
    },
  },
];

export class ToolDispatcher {
  constructor(
    private readonly memoryService: MemoryService,
    private readonly storageService?: R2StorageService,
  ) {}

  async dispatch(
    context: TenantContext,
    toolName: string,
    args: Record<string, unknown> = {},
  ): Promise<McpToolCallResult> {
    switch (toolName) {
      case 'debo_search_memory': {
        const query = String(args.query || '');
        const limit = typeof args.limit === 'number' ? Math.min(args.limit, 25) : 10;
        const results = await this.memoryService.search(context, { query, limit });

        const formatted = results.map(r => ({
          id: r.memory.id,
          content: r.memory.content,
          score: r.score,
          sourceId: r.memory.sourceId,
        }));

        return {
          content: [
            {
              type: 'text',
              text: wrapUntrustedSource(JSON.stringify(formatted, null, 2)),
            },
          ],
        };
      }

      case 'debo_recall': {
        const prompt = String(args.prompt || '');
        const limit = typeof args.limit === 'number' ? args.limit : 5;
        const memories = await this.memoryService.recall(context, prompt, limit);

        const formatted = memories.map(m => ({
          id: m.id,
          content: m.content,
          sourceId: m.sourceId,
        }));

        return {
          content: [
            {
              type: 'text',
              text: wrapUntrustedSource(JSON.stringify(formatted, null, 2)),
            },
          ],
        };
      }

      case 'debo_save_memory': {
        const content = String(args.content || '');
        const sourceId = args.source_id ? String(args.source_id) : undefined;
        const tags = Array.isArray(args.tags) ? (args.tags as string[]) : undefined;

        const memory = await this.memoryService.remember(context, {
          content,
          sourceId,
          metadata: tags ? { tags } : undefined,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ status: 'saved', memoryId: memory.id }),
            },
          ],
        };
      }

      case 'debo_forget_memory': {
        const memoryId = String(args.memory_id || '');
        const deleted = await this.memoryService.forget(context, memoryId);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ status: deleted ? 'forgotten' : 'not_found', memoryId }),
            },
          ],
        };
      }

      case 'debo_get_source': {
        const sourceId = String(args.source_id || '');
        const filename = String(args.filename || 'document.bin');

        let downloadUrl = 'https://mock-storage.debo.internal/preview';
        if (this.storageService) {
          const key = buildSourceStorageKey(context.workspaceId, sourceId, filename);
          downloadUrl = await this.storageService.getSignedDownloadUrl(key, 3600);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                sourceId,
                workspaceId: context.workspaceId,
                previewUrl: downloadUrl,
                expiresInSeconds: 3600,
              }),
            },
          ],
        };
      }

      default:
        return {
          isError: true,
          content: [{ type: 'text', text: `Unknown tool: ${toolName}` }],
        };
    }
  }
}
