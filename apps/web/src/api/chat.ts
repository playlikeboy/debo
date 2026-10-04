import { createDeboAgentGraph, createInitialAgentState } from '@debo/agent';
import { MemoryService } from '@debo/memory';
import { encodeStreamEvent } from '@debo/ui';

export function createChatStreamHandler(memoryService: MemoryService) {
  const graph = createDeboAgentGraph(memoryService);

  return async function handleChatStream(req: Request): Promise<Response> {
    const workspaceId = req.headers.get('X-Debo-Workspace') || 'ws_default';
    const userId = req.headers.get('X-Debo-User') || 'usr_primary';

    let query = '';
    try {
      const body = (await req.json()) as { query?: string };
      query = body.query || '';
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
    }

    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing query' }), { status: 400 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const initialState = createInitialAgentState({
            workspaceId,
            userId,
            query,
          });

          // Run graph
          const finalState = await graph.invoke(initialState);

          if (finalState.isInterrupted && finalState.pendingApproval) {
            controller.enqueue(
              new TextEncoder().encode(
                encodeStreamEvent({
                  type: 'approval-requested',
                  approvalId: finalState.pendingApproval.approvalId,
                  toolName: finalState.pendingApproval.toolName,
                  riskTier: finalState.pendingApproval.riskTier,
                  parameters: finalState.pendingApproval.parameters,
                }),
              ),
            );
          } else {
            // Stream citations
            for (const c of finalState.citations) {
              controller.enqueue(
                new TextEncoder().encode(
                  encodeStreamEvent({
                    type: 'citation',
                    chunkId: c.chunkId,
                    quote: c.quote,
                    confidence: c.confidence,
                  }),
                ),
              );
            }

            // Stream text
            const text = finalState.finalResponse || '';
            controller.enqueue(
              new TextEncoder().encode(
                encodeStreamEvent({
                  type: 'finish',
                  totalSteps: finalState.stepCount,
                  finalText: text,
                }),
              ),
            );
          }

          controller.close();
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          controller.enqueue(
            new TextEncoder().encode(
              encodeStreamEvent({
                type: 'error',
                message,
              }),
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Debo-Workspace': workspaceId,
      },
    });
  };
}
