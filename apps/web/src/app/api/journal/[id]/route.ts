import { NextResponse } from 'next/server';
import { getJournalRepository } from '@/lib/db';
import { getMemoryService } from '@/lib/memory';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || 'wsp_default';
    const userId = searchParams.get('userId') || 'usr_primary';

    const repo = getJournalRepository();
    const entry = await repo.getEntry({ workspaceId, userId, role: 'member' }, id);

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Failed to get journal entry:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { workspaceId = 'wsp_default', userId = 'usr_primary', title, contentJson, contentText, tags } = body;

    const repo = getJournalRepository();
    const updated = await repo.updateEntry(
      { workspaceId, userId, role: 'member' },
      id,
      {
        title,
        contentJson,
        contentText,
        tags,
      },
    );

    // Update memory indexing
    if (contentText && contentText.trim()) {
      const memoryService = getMemoryService();
      await memoryService.remember(
        { workspaceId, userId, role: 'member' },
        {
          content: `Journal entry titled "${updated.title}": ${contentText}`,
          metadata: {
            source: 'journal',
            journalId: updated.id,
            title: updated.title,
            tags: updated.tags,
          },
        },
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update journal entry:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || 'wsp_default';
    const userId = searchParams.get('userId') || 'usr_primary';

    const repo = getJournalRepository();
    const success = await repo.deleteEntry({ workspaceId, userId, role: 'member' }, id);

    if (!success) {
      return NextResponse.json({ error: 'Entry not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Failed to delete journal entry:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
