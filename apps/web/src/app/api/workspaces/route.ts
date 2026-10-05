import { NextResponse } from 'next/server';
import { getWorkspaceService, resolveTenantContext } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const tenantCtx = await resolveTenantContext(request);
    const service = getWorkspaceService();

    if (!service) {
      return NextResponse.json({
        workspaces: [
          {
            workspace: {
              id: tenantCtx.workspaceId,
              name: 'Personal Workspace',
              slug: 'personal',
              ownerId: tenantCtx.userId,
              plan: 'free',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            role: tenantCtx.role,
          },
        ],
      });
    }

    const workspaces = await service.getUserWorkspaces(tenantCtx.userId);
    return NextResponse.json({ workspaces });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const tenantCtx = await resolveTenantContext(request);
    const service = getWorkspaceService();

    const body = await request.json();
    const { name = 'New Workspace', plan = 'free' } = body;

    if (!service) {
      const mockId = `wsp_${Date.now()}`;
      return NextResponse.json({
        id: mockId,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        ownerId: tenantCtx.userId,
        plan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { status: 201 });
    }

    const created = await service.createWorkspace(tenantCtx.userId, name, plan);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create workspace';
    const status = (error as any).status || 400;
    return NextResponse.json({ error: message }, { status });
  }
}
