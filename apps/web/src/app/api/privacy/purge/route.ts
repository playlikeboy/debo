import { NextResponse } from 'next/server';
import { resolveTenantContext } from '@/lib/auth';
import { getJournalRepository } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const tenantCtx = await resolveTenantContext(request, { requiredRole: 'owner' });
    const repo = getJournalRepository();
    const entries = await repo.listEntries(tenantCtx);

    let deletedCount = 0;
    for (const entry of entries) {
      const deleted = await repo.deleteEntry(tenantCtx, entry.id);
      if (deleted) deletedCount++;
    }

    return NextResponse.json({
      success: true,
      workspaceId: tenantCtx.workspaceId,
      deletedEntries: deletedCount,
      purgedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Purge failed';
    const status = (error as any).status || 400;
    return NextResponse.json({ error: message }, { status });
  }
}
