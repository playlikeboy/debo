import { NextResponse } from 'next/server';
import { getJournalRepository } from '@/lib/db';
import { getMemoryService } from '@/lib/memory';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || 'wsp_default';
    const userId = searchParams.get('userId') || 'usr_primary';

    const repo = getJournalRepository();
    const entries = await repo.listEntries({ workspaceId, userId, role: 'member' });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Failed to list journal entries:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId = 'wsp_default', userId = 'usr_primary', title, contentJson, contentText, tags } = body;

    if (!title && !contentText) {
      return NextResponse.json({ error: 'Title or content is required' }, { status: 400 });
    }

    const repo = getJournalRepository();
    const entry = await repo.createEntry(
      { workspaceId, userId, role: 'member' },
      {
        title: title || 'Untitled Entry',
        contentJson: contentJson || [],
        contentText: contentText || '',
        tags: tags || [],
      },
    );

    // Grounded memory indexing: index the entry into the workspace memory graph
    if (contentText && contentText.trim()) {
      const memoryService = getMemoryService();
      await memoryService.remember(
        { workspaceId, userId, role: 'member' },
        {
          content: `Journal entry titled "${entry.title}": ${contentText}`,
          metadata: {
            source: 'journal',
            journalId: entry.id,
            title: entry.title,
            tags: entry.tags,
          },
        },
      );
    }

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Failed to create journal entry:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
