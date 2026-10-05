import { NextResponse } from 'next/server';
import { getApiKeyService, resolveTenantContext } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const tenantCtx = await resolveTenantContext(request);
    const service = getApiKeyService();

    if (!service) {
      return NextResponse.json({
        keys: [
          {
            id: 'mock_key_1',
            name: 'Local Dev Key',
            start: 'debo_live_abc123...',
            prefix: 'debo_live_',
            workspaceId: tenantCtx.workspaceId,
            userId: tenantCtx.userId,
            scopes: ['memory.read', 'source.upload', 'tools.execute'],
            enabled: true,
            rateLimitMax: 100,
            rateLimitTimeWindow: 60000,
            requestCount: 12,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      });
    }

    const keys = await service.listApiKeys(tenantCtx);
    return NextResponse.json({ keys });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const tenantCtx = await resolveTenantContext(request, { requiredRole: 'member' });
    const service = getApiKeyService();

    const body = await request.json();
    const { name = 'New API Key', scopes = ['memory.read', 'tools.execute'], expiresInDays } = body;

    if (!service) {
      // Mock generation for local standalone development
      const randomSecret = `debo_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
      return NextResponse.json({
        keyRecord: {
          id: `key_${Date.now()}`,
          name,
          start: randomSecret.substring(0, 16) + '...',
          prefix: 'debo_live_',
          workspaceId: tenantCtx.workspaceId,
          userId: tenantCtx.userId,
          scopes,
          enabled: true,
          rateLimitMax: 100,
          rateLimitTimeWindow: 60000,
          requestCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        secretKey: randomSecret,
      }, { status: 201 });
    }

    const result = await service.createApiKey(tenantCtx, {
      name,
      scopes,
      expiresInDays: expiresInDays ? Number(expiresInDays) : undefined,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create API key';
    const status = (error as any).status || 400;
    return NextResponse.json({ error: message }, { status });
  }
}
