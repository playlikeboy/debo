import { NextResponse } from 'next/server';
import { resolveTenantContext } from '@/lib/auth';
import { getJournalRepository } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const tenantCtx = await resolveTenantContext(request);
    const repo = getJournalRepository();
    const entries = await repo.listEntries(tenantCtx);

    const exportData = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      workspaceId: tenantCtx.workspaceId,
      userId: tenantCtx.userId,
      totalEntries: entries.length,
      entries: entries.map(e => ({
        id: e.id,
        title: e.title,
        contentText: e.contentText,
        contentJson: e.contentJson,
        tags: e.tags,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })),
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="debo-export-${tenantCtx.workspaceId}-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Export failed';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
