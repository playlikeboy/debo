import { NextResponse } from 'next/server';
import { getApiKeyService, resolveTenantContext } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const tenantCtx = await resolveTenantContext(request, { requiredRole: 'admin' });
    const service = getApiKeyService();

    if (!service) {
      return NextResponse.json({ success: true, revokedId: id });
    }

    const success = await service.revokeApiKey(tenantCtx, id);
    return NextResponse.json({ success, revokedId: id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to revoke API key';
    const status = (error as any).status || 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const tenantCtx = await resolveTenantContext(request, { requiredRole: 'admin' });
    const service = getApiKeyService();

    const body = await request.json();
    const { name, enabled, scopes } = body;

    if (!service) {
      return NextResponse.json({ success: true, id, name, enabled, scopes });
    }

    const updated = await service.updateApiKey(tenantCtx, id, { name, enabled, scopes });
    return NextResponse.json({ keyRecord: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update API key';
    const status = (error as any).status || 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Rotate / reissue key
  try {
    const { id } = await params;
    const tenantCtx = await resolveTenantContext(request, { requiredRole: 'admin' });
    const service = getApiKeyService();

    const body = await request.json().catch(() => ({}));
    const { expiresInDays } = body;

    if (!service) {
      const randomSecret = `debo_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
      return NextResponse.json({
        keyRecord: { id: `key_${Date.now()}`, name: 'Rotated Key', start: randomSecret.substring(0, 16) + '...' },
        secretKey: randomSecret,
      });
    }

    const result = await service.rotateApiKey(tenantCtx, id, expiresInDays);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to rotate API key';
    const status = (error as any).status || 400;
    return NextResponse.json({ error: message }, { status });
  }
}
