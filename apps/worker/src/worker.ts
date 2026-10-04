import { DegradedMemoryProvider, MemoryService } from '@debo/memory';
import { DeboEvent, DeboEventSchema, SourceCreatedPayload, TaskExecutor } from '@debo/workflows';
import { createConnectorSyncTask } from './tasks/connector-sync';
import { createDocumentProcessTask, DocumentProcessInput } from './tasks/document-process';
import { createIngestSourceTask, IngestSourceInput } from './tasks/ingest-source';
import { createMemoryConsolidationTask } from './tasks/memory-consolidation';

export class DeboWorker {
  public readonly executor: TaskExecutor;
  public readonly memoryService: MemoryService;

  constructor(memoryService?: MemoryService) {
    this.memoryService = memoryService ?? new MemoryService(new DegradedMemoryProvider());
    this.executor = new TaskExecutor();

    // Register all core tasks
    this.executor.registerTask(createIngestSourceTask(this.memoryService));
    this.executor.registerTask(createDocumentProcessTask(this.memoryService));
    this.executor.registerTask(createMemoryConsolidationTask(this.memoryService));
    this.executor.registerTask(createConnectorSyncTask());
  }

  async handleEvent(event: DeboEvent): Promise<unknown> {
    const parse = DeboEventSchema.safeParse(event);
    if (!parse.success) {
      throw new Error(`Invalid DeboEvent: ${parse.error.message}`);
    }

    switch (event.name) {
      case 'source.created': {
        const payload = event.payload as unknown as SourceCreatedPayload & {
          initialContent?: string;
        };
        return await this.executor.execute<IngestSourceInput, unknown>({
          taskId: 'ingest.source',
          workspaceId: event.workspaceId,
          userId: event.userId,
          idempotencyKey: event.idempotencyKey,
          input: {
            sourceId: payload.sourceId,
            storageKey: payload.storageKey,
            mimeType: payload.mimeType,
            byteSize: payload.byteSize,
            initialContent: payload.initialContent,
          },
        });
      }

      case 'document.processed': {
        const payload = event.payload as unknown as DocumentProcessInput;
        return await this.executor.execute<DocumentProcessInput, unknown>({
          taskId: 'document.process',
          workspaceId: event.workspaceId,
          userId: event.userId,
          idempotencyKey: event.idempotencyKey,
          input: payload,
        });
      }

      case 'connector.sync.requested': {
        const payload = event.payload as unknown as { connectionId: string; provider: string };
        return await this.executor.execute({
          taskId: 'connector.sync',
          workspaceId: event.workspaceId,
          userId: event.userId,
          idempotencyKey: event.idempotencyKey,
          input: payload,
        });
      }

      default:
        throw new Error(`Unhandled event name: ${event.name}`);
    }
  }

  fetchHandler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);

    if (req.method === 'GET' && url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          service: 'debo-worker',
          version: '0.1.0',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    if (req.method === 'POST' && url.pathname === '/events') {
      try {
        const body = (await req.json()) as DeboEvent;
        const result = await this.handleEvent(body);
        return new Response(JSON.stringify({ status: 'ok', result }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return new Response(JSON.stringify({ error: message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (req.method === 'GET' && url.pathname.startsWith('/runs/')) {
      const idempotencyKey = url.pathname.replace('/runs/', '');
      const record = this.executor.getRunRecord(idempotencyKey);
      if (!record) {
        return new Response(JSON.stringify({ error: 'Run not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify(record), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}
