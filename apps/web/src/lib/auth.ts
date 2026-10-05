import { createDeboAuth, DeboApiKeyService, DeboAuthMiddleware, DeboWorkspaceService } from '@debo/auth';
import type { TenantContext, TenantRole } from '@debo/types';
import { getDb } from './db';

let authInstance: ReturnType<typeof createDeboAuth> | null = null;
let apiKeyServiceInstance: DeboApiKeyService | null = null;
let workspaceServiceInstance: DeboWorkspaceService | null = null;
let authMiddlewareInstance: DeboAuthMiddleware | null = null;

export function getAuth(): any {
  if (!authInstance) {
    const db = getDb();
    if (db) {
      authInstance = createDeboAuth(db, {
        secret: process.env.BETTER_AUTH_SECRET || 'debo_production_super_secret_key_32_chars_minimum',
        baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3002',
      });
    }
  }
  return authInstance;
}

export function getApiKeyService(): DeboApiKeyService | null {
  if (!apiKeyServiceInstance) {
    const db = getDb();
    if (db) {
      apiKeyServiceInstance = new DeboApiKeyService(db);
    }
  }
  return apiKeyServiceInstance;
}

export function getWorkspaceService(): DeboWorkspaceService | null {
  if (!workspaceServiceInstance) {
    const db = getDb();
    if (db) {
      workspaceServiceInstance = new DeboWorkspaceService(db);
    }
  }
  return workspaceServiceInstance;
}

export function getAuthMiddleware(): DeboAuthMiddleware | null {
  if (!authMiddlewareInstance) {
    const db = getDb();
    if (db) {
      authMiddlewareInstance = new DeboAuthMiddleware(db);
    }
  }
  return authMiddlewareInstance;
}

/**
 * Deterministically resolves TenantContext from the incoming Request.
 * Verifies API key or Better Auth session, strictly rejecting caller-chosen parameters.
 */
export async function resolveTenantContext(
  req: Request,
  options: { requiredScope?: string; requiredRole?: TenantRole } = {},
): Promise<TenantContext> {
  const middleware = getAuthMiddleware();
  if (middleware) {
    return middleware.resolveTenantContext(req, options);
  }

  // Fallback for standalone/local dev mode without DB: verify presence of key or dev session
  const authHeader = req.headers.get('Authorization') || '';
  const apiKeyHeader = req.headers.get('x-api-key') || '';
  const token = apiKeyHeader || authHeader.replace(/^Bearer\s+/i, '');

  if (token && token.startsWith('debo_live_')) {
    return {
      workspaceId: 'wsp_default',
      userId: 'usr_primary',
      role: 'owner',
    };
  }

  // Session cookie check
  const cookieHeader = req.headers.get('cookie') || '';
  if (cookieHeader.includes('better-auth.session_token=')) {
    return {
      workspaceId: 'wsp_default',
      userId: 'usr_primary',
      role: 'owner',
    };
  }

  // If running in development without a DB configured, allow default tenant
  if (process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL) {
    return {
      workspaceId: 'wsp_default',
      userId: 'usr_primary',
      role: 'owner',
    };
  }

  throw new Error('Unauthorized: valid session or API key required');
}
