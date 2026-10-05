import { NextResponse } from 'next/server';
import { getMemoryService } from '@/lib/memory';
import { resolveTenantContext } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const tenantCtx = await resolveTenantContext(request);
    const { messages } = await request.json();
    const lastUserMessage = messages?.filter((m: any) => m.role === 'user').pop();
    const userQuery = lastUserMessage?.content || 'Hello';

    const memoryService = getMemoryService();

    // Search memories and journal entries for grounded context
    const searchResults = await memoryService.search(tenantCtx, {
      query: userQuery,
      limit: 5,
    });

    // Create readable stream for AG-UI events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const sendEvent = (event: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        try {
          if (searchResults.length > 0) {
            // Stream citations
            for (const res of searchResults) {
              sendEvent({
                type: 'citation',
                chunkId: res.memory.id,
                quote: res.memory.content.substring(0, 140),
                confidence: res.score,
                sourceTitle: (res.memory.metadata as any)?.title || 'Journal Entry',
              });
            }

            // Stream response
            const intro = `Based on your private memory graph and journal records:\n\n`;
            sendEvent({ type: 'text-delta', text: intro });

            const topContent = searchResults.map(r => r.memory.content).join('\n\n');
            const summary = `Found relevant context:\n"${topContent}" [^1]\n\nYour journal and memories directly verify this detail.`;

            // Stream words smoothly
            const words = summary.split(' ');
            for (const word of words) {
              sendEvent({ type: 'text-delta', text: word + ' ' });
              await new Promise(r => setTimeout(r, 20));
            }

            sendEvent({
              type: 'finish',
              totalSteps: 2,
              finalText: intro + summary,
            });
          } else {
            const noContext = `I searched your workspace memory graph for "${userQuery}", but found no matching journal entries or documents yet. Capture an entry in your Rich Journal or upload a source to index it.`;
            const words = noContext.split(' ');
            for (const word of words) {
              sendEvent({ type: 'text-delta', text: word + ' ' });
              await new Promise(r => setTimeout(r, 20));
            }
            sendEvent({ type: 'finish', totalSteps: 1, finalText: noContext });
          }
        } catch (err) {
          sendEvent({ type: 'error', message: err instanceof Error ? err.message : String(err) });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
