import { ForbiddenError, UnauthorizedError } from '@debo/types';
import type { TenantContext, TenantRole } from '@debo/types';
import { and, eq } from 'drizzle-orm';
import type { DeboDatabase } from '@debo/db';
import { userSessions, workspaceMembers } from '@debo/db';
import { DeboApiKeyService } from './api-keys';

export interface ResolveAuthOptions {
  requiredScope?: string;
  requiredRole?: TenantRole;
}

export class DeboAuthMiddleware {
  private readonly apiKeyService: DeboApiKeyService;

  constructor(private readonly db: DeboDatabase) {
    this.apiKeyService = new DeboApiKeyService(db);
  }

  /**
   * Deterministically resolves TenantContext from either:
   * 1. API key ('x-api-key' or 'Authorization: Bearer debo_live_...')
   * 2. Session cookie
   *
   * PREVENTS caller-controlled forgeable parameters (e.g. query params or headers like 'x-workspace-id').
   */
  async resolveTenantContext(
    req: Request,
    options: ResolveAuthOptions = {},
  ): Promise<TenantContext> {
    const authHeader = req.headers.get('Authorization') || '';
    const apiKeyHeader = req.headers.get('x-api-key') || '';

    let rawKey = '';
    if (apiKeyHeader) {
      rawKey = apiKeyHeader.trim();
    } else if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      // Check if it's an API key format or session token
      if (token.startsWith('debo_live_')) {
        rawKey = token;
      }
    }

    // 1. Authenticate via API Key
    if (rawKey) {
      const verified = await this.apiKeyService.verifyApiKey(rawKey, options.requiredScope);

      // Validate required role if specified
      if (options.requiredRole && !this.hasMinimumRole(verified.role, options.requiredRole)) {
        throw new ForbiddenError(
          `Insufficient role: required '${options.requiredRole}', granted '${verified.role}'`,
        );
      }

      return {
        workspaceId: verified.workspaceId,
        userId: verified.userId,
        role: verified.role,
      };
    }

    // 2. Authenticate via Session Token
    const cookieHeader = req.headers.get('cookie') || '';
    let sessionToken = '';

    // Extract Better Auth session token or Bearer token
    if (authHeader.startsWith('Bearer ')) {
      sessionToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    } else if (cookieHeader) {
      const match = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
      if (match && match[1]) {
        sessionToken = decodeURIComponent(match[1]);
      }
    }

    if (!sessionToken) {
      throw new UnauthorizedError('Authentication required: provide a valid API key or session');
    }

    // Look up session in DB
    const [sess] = await this.db
      .select()
      .from(userSessions)
      .where(eq(userSessions.token, sessionToken))
      .limit(1);

    if (!sess) {
      throw new UnauthorizedError('Invalid or expired session');
    }

    if (sess.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedError('Session has expired');
    }

    if (!sess.activeWorkspaceId) {
      throw new ForbiddenError('Session has no active workspace selected');
    }

    // Verify user is an active member of the active workspace
    const [member] = await this.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, sess.activeWorkspaceId),
          eq(workspaceMembers.userId, sess.userId),
        ),
      )
      .limit(1);

    if (!member) {
      throw new ForbiddenError(
        `User '${sess.userId}' is not a member of active workspace '${sess.activeWorkspaceId}'`,
      );
    }

    const role = member.role as TenantRole;

    if (options.requiredRole && !this.hasMinimumRole(role, options.requiredRole)) {
      throw new ForbiddenError(
        `Insufficient role: required '${options.requiredRole}', granted '${role}'`,
      );
    }

    return {
      workspaceId: sess.activeWorkspaceId,
      userId: sess.userId,
      role,
    };
  }

  private hasMinimumRole(actual: TenantRole, required: TenantRole): boolean {
    const hierarchy: Record<TenantRole, number> = {
      guest: 0,
      member: 1,
      admin: 2,
      owner: 3,
    };
    return (hierarchy[actual] ?? 0) >= (hierarchy[required] ?? 0);
  }
}
