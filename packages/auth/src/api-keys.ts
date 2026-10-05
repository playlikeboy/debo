import {
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  UnauthorizedError,
} from '@debo/types';
import type { TenantContext, TenantRole } from '@debo/types';
import { and, desc, eq, sql } from 'drizzle-orm';
import type { DeboDatabase } from '@debo/db';
import { apiKeys, workspaceMembers, workspaces } from '@debo/db';
import { sha256Hex } from './hash';
import { assertPlanLimit, getPlanQuotas, type PlanType } from './plans';

export interface CreateApiKeyInput {
  name: string;
  scopes?: string[];
  expiresInDays?: number;
}

export interface ApiKeyPublicRecord {
  id: string;
  name: string;
  start: string;
  prefix: string;
  workspaceId: string;
  userId: string;
  scopes: string[];
  enabled: boolean;
  rateLimitMax: number;
  rateLimitTimeWindow: number;
  requestCount: number;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApiKeyResult {
  keyRecord: ApiKeyPublicRecord;
  secretKey: string; // One-time display secret!
}

export class DeboApiKeyService {
  constructor(private readonly db: DeboDatabase) {}

  /**
   * Generates a new API key deterministically bound to (userId, workspaceId).
   * Secret is displayed ONCE and never stored in plaintext.
   */
  async createApiKey(
    ctx: TenantContext,
    input: CreateApiKeyInput,
  ): Promise<CreateApiKeyResult> {
    if (!ctx.workspaceId || !ctx.userId) {
      throw new UnauthorizedError('TenantContext must include workspaceId and userId');
    }

    // Verify workspace membership and get workspace plan
    const [workspace] = await this.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, ctx.workspaceId))
      .limit(1);

    if (!workspace) {
      throw new NotFoundError('Workspace', ctx.workspaceId);
    }

    // Verify user is member of workspace
    const [member] = await this.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, ctx.workspaceId),
          eq(workspaceMembers.userId, ctx.userId),
        ),
      )
      .limit(1);

    if (!member) {
      throw new ForbiddenError(
        `User '${ctx.userId}' is not a member of workspace '${ctx.workspaceId}'`,
      );
    }

    // Enforce plan active API key quotas
    const activeKeys = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(apiKeys)
      .where(and(eq(apiKeys.workspaceId, ctx.workspaceId), eq(apiKeys.enabled, true)));

    const currentCount = Number(activeKeys[0]?.count || 0);
    assertPlanLimit(workspace.plan as PlanType, 'apiKeys', currentCount);

    const quotas = getPlanQuotas(workspace.plan as PlanType);

    // Generate cryptographic secret: debo_live_<32 random hex chars>
    const randomBytes = crypto.getRandomValues(new Uint8Array(24));
    const randomHex = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const secretKey = `debo_live_${randomHex}`;
    const keyHash = await sha256Hex(secretKey);

    const keyId = `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const start = secretKey.substring(0, 16) + '...';
    const scopes = input.scopes && input.scopes.length > 0 ? input.scopes : ['read', 'write'];

    const expiresAt = input.expiresInDays
      ? new Date(Date.now() + input.expiresInDays * 86400000)
      : null;

    const [created] = await this.db
      .insert(apiKeys)
      .values({
        id: keyId,
        name: input.name.trim() || 'API Key',
        start,
        prefix: 'debo_live_',
        key: keyHash,
        keyHash,
        keyPrefix: 'debo_live_',
        referenceId: ctx.userId,
        userId: ctx.userId,
        workspaceId: ctx.workspaceId,
        configId: 'default',
        permissions: JSON.stringify(scopes),
        scopes,
        metadata: JSON.stringify({ workspaceId: ctx.workspaceId, plan: workspace.plan }),
        enabled: true,
        rateLimitEnabled: true,
        rateLimitTimeWindow: 60000, // 1 minute
        rateLimitMax: quotas.apiKeyRateLimitRpm,
        requestCount: 0,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!created) {
      throw new Error('Failed to create API key record');
    }

    const keyRecord: ApiKeyPublicRecord = {
      id: created.id,
      name: created.name,
      start: created.start || start,
      prefix: created.prefix || 'debo_live_',
      workspaceId: created.workspaceId,
      userId: created.referenceId,
      scopes: created.scopes as string[],
      enabled: created.enabled,
      rateLimitMax: created.rateLimitMax,
      rateLimitTimeWindow: created.rateLimitTimeWindow,
      requestCount: created.requestCount,
      lastUsedAt: created.lastUsedAt?.toISOString(),
      expiresAt: created.expiresAt?.toISOString(),
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };

    return { keyRecord, secretKey };
  }

  /**
   * Lists all API keys for a workspace/user without exposing secrets.
   */
  async listApiKeys(ctx: TenantContext): Promise<ApiKeyPublicRecord[]> {
    if (!ctx.workspaceId) {
      throw new UnauthorizedError('workspaceId is required');
    }

    const rows = await this.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.workspaceId, ctx.workspaceId))
      .orderBy(desc(apiKeys.createdAt));

    return rows.map(r => ({
      id: r.id,
      name: r.name,
      start: r.start || 'debo_live_...',
      prefix: r.prefix || 'debo_live_',
      workspaceId: r.workspaceId,
      userId: r.referenceId,
      scopes: r.scopes as string[],
      enabled: r.enabled,
      rateLimitMax: r.rateLimitMax,
      rateLimitTimeWindow: r.rateLimitTimeWindow,
      requestCount: r.requestCount,
      lastUsedAt: r.lastUsedAt?.toISOString(),
      expiresAt: r.expiresAt?.toISOString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  /**
   * Updates an existing API key (e.g. rename or toggle enabled).
   */
  async updateApiKey(
    ctx: TenantContext,
    keyId: string,
    updates: { name?: string; enabled?: boolean; scopes?: string[] },
  ): Promise<ApiKeyPublicRecord> {
    if (!ctx.workspaceId) {
      throw new UnauthorizedError('workspaceId is required');
    }

    const setValues: any = { updatedAt: new Date() };
    if (updates.name !== undefined) setValues.name = updates.name.trim();
    if (updates.enabled !== undefined) setValues.enabled = updates.enabled;
    if (updates.scopes !== undefined) {
      setValues.scopes = updates.scopes;
      setValues.permissions = JSON.stringify(updates.scopes);
    }

    const [updated] = await this.db
      .update(apiKeys)
      .set(setValues)
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.workspaceId, ctx.workspaceId)))
      .returning();

    if (!updated) {
      throw new NotFoundError('ApiKey', keyId);
    }

    return {
      id: updated.id,
      name: updated.name,
      start: updated.start || 'debo_live_...',
      prefix: updated.prefix || 'debo_live_',
      workspaceId: updated.workspaceId,
      userId: updated.referenceId,
      scopes: updated.scopes as string[],
      enabled: updated.enabled,
      rateLimitMax: updated.rateLimitMax,
      rateLimitTimeWindow: updated.rateLimitTimeWindow,
      requestCount: updated.requestCount,
      lastUsedAt: updated.lastUsedAt?.toISOString(),
      expiresAt: updated.expiresAt?.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  /**
   * Rotates/reissues an API key: revokes existing key and creates a fresh secret key.
   */
  async rotateApiKey(
    ctx: TenantContext,
    keyId: string,
    expiresInDays?: number,
  ): Promise<CreateApiKeyResult> {
    if (!ctx.workspaceId) {
      throw new UnauthorizedError('workspaceId is required');
    }

    const [existing] = await this.db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.workspaceId, ctx.workspaceId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundError('ApiKey', keyId);
    }

    // Revoke old key
    await this.revokeApiKey(ctx, keyId);

    // Create new key with same name and scopes
    return this.createApiKey(ctx, {
      name: existing.name,
      scopes: existing.scopes as string[],
      expiresInDays,
    });
  }

  /**
   * Revokes or deletes an API key.
   */
  async revokeApiKey(ctx: TenantContext, keyId: string): Promise<boolean> {
    if (!ctx.workspaceId) {
      throw new UnauthorizedError('workspaceId is required');
    }

    const result = await this.db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.workspaceId, ctx.workspaceId)))
      .returning({ id: apiKeys.id });

    return result.length > 0;
  }

  /**
   * Verifies an incoming API key, checks expiration, rate limits, and workspace membership.
   * Returns authenticated TenantContext.
   */
  async verifyApiKey(
    rawKey: string,
    requiredScope?: string,
  ): Promise<TenantContext & { scopes: string[] }> {
    if (!rawKey || typeof rawKey !== 'string') {
      throw new UnauthorizedError('API key must be a non-empty string');
    }

    const keyHash = await sha256Hex(rawKey);

    const [keyRecord] = await this.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.key, keyHash))
      .limit(1);

    if (!keyRecord) {
      throw new UnauthorizedError('Invalid API key');
    }

    if (!keyRecord.enabled) {
      throw new UnauthorizedError('API key has been revoked');
    }

    if (keyRecord.expiresAt && keyRecord.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedError('API key has expired');
    }

    // Rate limiting check
    const now = new Date();
    const windowStart = new Date(now.getTime() - keyRecord.rateLimitTimeWindow);

    let nextRequestCount = keyRecord.requestCount + 1;
    if (keyRecord.lastRequest && keyRecord.lastRequest < windowStart) {
      nextRequestCount = 1; // Reset counter for new window
    }

    if (keyRecord.rateLimitEnabled && nextRequestCount > keyRecord.rateLimitMax) {
      throw new RateLimitError(
        `API key rate limit exceeded (${keyRecord.rateLimitMax} requests per minute)`,
      );
    }

    // Update request count and lastUsedAt
    await this.db
      .update(apiKeys)
      .set({
        requestCount: nextRequestCount,
        lastRequest: now,
        lastUsedAt: now,
      })
      .where(eq(apiKeys.id, keyRecord.id));

    // Scope verification
    const scopes = (keyRecord.scopes as string[]) || [];
    if (requiredScope && !scopes.includes(requiredScope) && !scopes.includes('*')) {
      throw new ForbiddenError(
        `API key missing required scope '${requiredScope}'. Granted: [${scopes.join(', ')}]`,
      );
    }

    // Verify user is still an active member of the workspace
    const [member] = await this.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, keyRecord.workspaceId),
          eq(workspaceMembers.userId, keyRecord.referenceId),
        ),
      )
      .limit(1);

    if (!member) {
      throw new ForbiddenError(
        `User '${keyRecord.referenceId}' is no longer a member of workspace '${keyRecord.workspaceId}'`,
      );
    }

    return {
      workspaceId: keyRecord.workspaceId,
      userId: keyRecord.referenceId,
      role: member.role as TenantRole,
      scopes,
    };
  }
}
