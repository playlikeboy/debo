import { NextResponse } from 'next/server';
import { getWorkspaceService, resolveTenantContext } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const tenantCtx = await resolveTenantContext(request);
    const service = getWorkspaceService();
    const { targetWorkspaceId, sessionId } = await request.json();

    if (!targetWorkspaceId) {
      return NextResponse.json({ error: 'targetWorkspaceId is required' }, { status: 400 });
    }

    if (!service || !sessionId) {
      // Standalone/mock fallback
      return NextResponse.json({
        success: true,
        workspaceId: targetWorkspaceId,
        userId: tenantCtx.userId,
      });
    }

    const updated = await service.switchActiveWorkspace(sessionId, tenantCtx.userId, targetWorkspaceId);
    return NextResponse.json({ success: true, context: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to switch workspace';
    const status = (error as any).status || 400;
    return NextResponse.json({ error: message }, { status });
  }
}
