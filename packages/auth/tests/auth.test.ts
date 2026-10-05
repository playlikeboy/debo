import { describe, expect, it } from 'bun:test';
import {
  assertPlanFeature,
  assertPlanLimit,
  createMcpAuthResolver,
  createSignedToken,
  createTenantContext,
  DeboApiKeyService,
  DeboAuthMiddleware,
  DeboWorkspaceService,
  getPlanQuotas,
  hmacSha256Hex,
  sha256Hex,
  timingSafeEqualStrings,
  verifySignedToken,
} from '../src/index';

describe('@debo/auth engine', () => {
  const TEST_SECRET = 'super-secret-mcp-cryptographic-key-12345';

  it('creates deterministic TenantContext from valid identity', () => {
    const context = createTenantContext({
      userId: 'usr_123',
      email: 'alex@example.com',
      activeWorkspaceId: 'wsp_abc',
      role: 'admin',
    });

    expect(context.workspaceId).toBe('wsp_abc');
    expect(context.userId).toBe('usr_123');
    expect(context.role).toBe('admin');
  });

  it('rejects identity missing required workspace scoping', () => {
    expect(() => {
      createTenantContext({
        userId: 'usr_123',
        email: 'alex@example.com',
        activeWorkspaceId: '',
        role: 'admin',
      });
    }).toThrow('Malformed identity');
  });

  it('hashes string to SHA-256 hex correctly', async () => {
    const hash = await sha256Hex('debo_sec_live_key_999');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('computes HMAC-SHA256 hex signature correctly', async () => {
    const sig1 = await hmacSha256Hex(TEST_SECRET, 'test-message-content');
    const sig2 = await hmacSha256Hex(TEST_SECRET, 'test-message-content');
    const sigDifferent = await hmacSha256Hex(TEST_SECRET, 'different-content');

    expect(sig1).toHaveLength(64);
    expect(sig1).toMatch(/^[0-9a-f]{64}$/);
    expect(sig1).toBe(sig2);
    expect(sig1).not.toBe(sigDifferent);
  });

  it('performs timing-safe string comparison', () => {
    expect(timingSafeEqualStrings('abc', 'abc')).toBe(true);
    expect(timingSafeEqualStrings('abc', 'abd')).toBe(false);
    expect(timingSafeEqualStrings('abc', 'ab')).toBe(false);
  });

  describe('Plan Quotas & Feature Gating', () => {
    it('returns exact documented plan quotas', () => {
      const free = getPlanQuotas('free');
      expect(free.maxWorkspaces).toBe(2);
      expect(free.maxMembersPerWorkspace).toBe(3);
      expect(free.maxApiKeysPerWorkspace).toBe(3);
      expect(free.apiKeyRateLimitRpm).toBe(60);
      expect(free.auditRetentionDays).toBe(90);
      expect(free.features.customConnectors).toBe(false);

      const pro = getPlanQuotas('pro');
      expect(pro.maxWorkspaces).toBe(5);
      expect(pro.maxMembersPerWorkspace).toBe(25);
      expect(pro.maxApiKeysPerWorkspace).toBe(15);
      expect(pro.apiKeyRateLimitRpm).toBe(300);
      expect(pro.auditRetentionDays).toBe(365);
      expect(pro.features.customConnectors).toBe(true);

      const enterprise = getPlanQuotas('enterprise');
      expect(enterprise.maxWorkspaces).toBe(Infinity);
      expect(enterprise.apiKeyRateLimitRpm).toBe(1200);
      expect(enterprise.features.sso).toBe(true);
      expect(enterprise.features.streamingAuditExport).toBe(true);
    });

    it('enforces plan limits correctly', () => {
      expect(() => assertPlanLimit('free', 'apiKeys', 2)).not.toThrow();
      expect(() => assertPlanLimit('free', 'apiKeys', 3)).toThrow(/limit reached for apiKeys/);
      expect(() => assertPlanLimit('free', 'workspaces', 2)).toThrow(/limit reached for workspaces/);
      expect(() => assertPlanLimit('pro', 'apiKeys', 14)).not.toThrow();
      expect(() => assertPlanLimit('pro', 'apiKeys', 15)).toThrow(/limit reached for apiKeys/);
    });

    it('enforces feature gating by plan', () => {
      expect(() => assertPlanFeature('free', 'customConnectors')).toThrow(
        /not available on the 'free' plan/,
      );
      expect(() => assertPlanFeature('pro', 'customConnectors')).not.toThrow();
      expect(() => assertPlanFeature('pro', 'sso')).toThrow(/not available on the 'pro' plan/);
      expect(() => assertPlanFeature('enterprise', 'sso')).not.toThrow();
    });
  });

  describe('DeboApiKeyService with In-Memory Mock DB', () => {
    // In-memory mock database
    const workspacesTable = [{ id: 'wsp_main', name: 'Main', plan: 'free', ownerId: 'usr_alice' }];
    const membersTable = [
      { id: 'wmb_1', workspaceId: 'wsp_main', userId: 'usr_alice', role: 'owner' },
      { id: 'wmb_2', workspaceId: 'wsp_main', userId: 'usr_bob', role: 'member' },
    ];
    const apiKeysTable: any[] = [];

    const mockDb: any = {
      select: (fields?: any) => ({
        from: (table: any) => {
          const tableName =
            (table as any)?.[Symbol.for('drizzle:Name')] ||
            (table as any)?._?.name ||
            String(table);

          return {
            where: () => {
              if (fields && fields.count) {
                return [{ count: apiKeysTable.length }];
              }
              const getItems = () => {
                if (tableName === 'workspaces') return workspacesTable;
                if (tableName === 'workspace_members') return membersTable;
                if (tableName === 'api_keys') return apiKeysTable;
                return [];
              };
              return {
                limit: (n: number) => getItems().slice(0, n),
                orderBy: () => getItems(),
              };
            },
          };
        },
      }),
      insert: () => ({
        values: (val: any) => ({
          returning: async () => {
            apiKeysTable.push({ ...val });
            return [{ ...val }];
          },
        }),
      }),
      delete: () => ({
        where: () => ({
          returning: async () => {
            const popped = apiKeysTable.pop();
            return popped ? [{ id: popped.id }] : [];
          },
        }),
      }),
      update: () => ({
        set: (vals: any) => ({
          where: () => ({
            returning: async () => {
              if (apiKeysTable[0]) {
                Object.assign(apiKeysTable[0], vals);
              }
              return [{ ...apiKeysTable[0] }];
            },
          }),
        }),
      }),
    };

    const apiKeyService = new DeboApiKeyService(mockDb);

    it('creates API key, returns secret once, and stores only SHA-256 hash', async () => {
      const res = await apiKeyService.createApiKey(
        { workspaceId: 'wsp_main', userId: 'usr_alice', role: 'owner' },
        { name: 'CLI Tool Key', scopes: ['memory.read', 'source.upload'] },
      );

      expect(res.secretKey).toMatch(/^debo_live_[0-9a-f]{48}$/);
      expect(res.keyRecord.name).toBe('CLI Tool Key');
      expect(res.keyRecord.workspaceId).toBe('wsp_main');
      expect(res.keyRecord.userId).toBe('usr_alice');
      expect(res.keyRecord.scopes).toEqual(['memory.read', 'source.upload']);
      expect(res.keyRecord.enabled).toBe(true);

      // Verify DB contains hashed key, NOT the plaintext secret
      const stored = apiKeysTable[0];
      expect(stored.key).not.toBe(res.secretKey);
      expect(stored.key).toBe(await sha256Hex(res.secretKey));
    });

    it('lists API keys for workspace without exposing secret keys', async () => {
      const list = await apiKeyService.listApiKeys({
        workspaceId: 'wsp_main',
        userId: 'usr_alice',
        role: 'owner',
      });

      expect(list.length).toBeGreaterThan(0);
      const first = list[0]!;
      expect(first.id).toBeDefined();
      expect(first.start).toContain('debo_live_');
      // @ts-ignore
      expect(first.key).toBeUndefined();
      // @ts-ignore
      expect(first.secretKey).toBeUndefined();
    });

    it('verifies valid API key and returns deterministic TenantContext', async () => {
      const rawSecret = `debo_live_test_valid_key_${Math.random().toString(36).substring(2, 8)}`;
      const keyHash = await sha256Hex(rawSecret);

      apiKeysTable.length = 0;
      apiKeysTable.push({
        id: 'key_1',
        name: 'Test Key',
        key: keyHash,
        referenceId: 'usr_alice',
        workspaceId: 'wsp_main',
        scopes: ['memory.read', 'tools.execute'],
        enabled: true,
        rateLimitEnabled: true,
        rateLimitMax: 100,
        rateLimitTimeWindow: 60000,
        requestCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const verified = await apiKeyService.verifyApiKey(rawSecret, 'memory.read');
      expect(verified.workspaceId).toBe('wsp_main');
      expect(verified.userId).toBe('usr_alice');
      expect(verified.role).toBe('owner');
      expect(verified.scopes).toContain('memory.read');
    });

    it('rejects API key with missing required scope', async () => {
      const rawSecret = `debo_live_scope_test_${Math.random().toString(36).substring(2, 8)}`;
      const keyHash = await sha256Hex(rawSecret);

      apiKeysTable.length = 0;
      apiKeysTable.push({
        id: 'key_scope',
        name: 'Scope Key',
        key: keyHash,
        referenceId: 'usr_bob',
        workspaceId: 'wsp_main',
        scopes: ['memory.read'],
        enabled: true,
        rateLimitEnabled: false,
        requestCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        apiKeyService.verifyApiKey(rawSecret, 'workspace.delete'),
      ).rejects.toThrow(/missing required scope 'workspace\.delete'/);
    });

    it('rejects revoked or expired API keys', async () => {
      const rawSecret = `debo_live_revoked_${Math.random().toString(36).substring(2, 8)}`;
      const keyHash = await sha256Hex(rawSecret);

      apiKeysTable.length = 0;
      apiKeysTable.push({
        id: 'key_rev',
        name: 'Revoked Key',
        key: keyHash,
        referenceId: 'usr_alice',
        workspaceId: 'wsp_main',
        scopes: ['*'],
        enabled: false, // Revoked!
        requestCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(apiKeyService.verifyApiKey(rawSecret)).rejects.toThrow(/revoked/);
    });

    it('enforces API key rate limiting', async () => {
      const rawSecret = `debo_live_ratelimit_${Math.random().toString(36).substring(2, 8)}`;
      const keyHash = await sha256Hex(rawSecret);

      apiKeysTable.length = 0;
      apiKeysTable.push({
        id: 'key_rl',
        name: 'Rate Limit Key',
        key: keyHash,
        referenceId: 'usr_alice',
        workspaceId: 'wsp_main',
        scopes: ['*'],
        enabled: true,
        rateLimitEnabled: true,
        rateLimitMax: 2,
        rateLimitTimeWindow: 60000,
        requestCount: 2, // At limit
        lastRequest: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(apiKeyService.verifyApiKey(rawSecret)).rejects.toThrow(/rate limit exceeded/);
    });

    it('updates API key metadata (rename, update scopes)', async () => {
      apiKeysTable.length = 0;
      const initialKey = {
        id: 'key_to_update',
        name: 'Old Key Name',
        start: 'debo_live_12345...',
        prefix: 'debo_live_',
        key: 'hash_abc',
        referenceId: 'usr_alice',
        workspaceId: 'wsp_main',
        scopes: ['memory.read'],
        enabled: true,
        rateLimitMax: 100,
        rateLimitTimeWindow: 60000,
        requestCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      apiKeysTable.push(initialKey);

      const updated = await apiKeyService.updateApiKey(
        { workspaceId: 'wsp_main', userId: 'usr_alice', role: 'owner' },
        'key_to_update',
        { name: 'Renamed Production Key', scopes: ['memory.read', 'source.upload'] },
      );

      expect(updated.name).toBe('Renamed Production Key');
      expect(updated.scopes).toEqual(['memory.read', 'source.upload']);
    });

    it('rotates API key, revoking old key and returning fresh one-time secret', async () => {
      apiKeysTable.length = 0;
      const keyToRotate = {
        id: 'key_to_rotate',
        name: 'Cursor Key',
        start: 'debo_live_old_sec...',
        prefix: 'debo_live_',
        key: 'old_hash',
        referenceId: 'usr_alice',
        workspaceId: 'wsp_main',
        scopes: ['memory.read', 'tools.execute'],
        enabled: true,
        rateLimitMax: 100,
        rateLimitTimeWindow: 60000,
        requestCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      apiKeysTable.push(keyToRotate);

      const rotated = await apiKeyService.rotateApiKey(
        { workspaceId: 'wsp_main', userId: 'usr_alice', role: 'owner' },
        'key_to_rotate',
      );

      expect(rotated.secretKey).toMatch(/^debo_live_[a-f0-9]{48}$/);
      expect(rotated.keyRecord.name).toBe('Cursor Key');
      expect(rotated.keyRecord.scopes).toEqual(['memory.read', 'tools.execute']);
      // Old key should be deleted/revoked
      expect(apiKeysTable.find(k => k.id === 'key_to_rotate')).toBeUndefined();
    });
  });

  describe('DeboWorkspaceService', () => {
    const wsStore: any[] = [];
    const memberStore: any[] = [];

    const mockDb: any = {
      select: (fields?: any) => ({
        from: (table: any) => ({
          where: () => {
            if (fields && fields.count) return [{ count: wsStore.length }];
            return {
              limit: (n: number) => (table._?.name === 'workspaces' ? wsStore.slice(0, n) : memberStore.slice(0, n)),
            };
          },
          innerJoin: () => ({
            where: () => ({
              orderBy: () =>
                wsStore.map(ws => ({
                  ws,
                  member: { role: 'owner' },
                })),
            }),
          }),
        }),
      }),
      insert: () => ({
        values: (val: any) => ({
          returning: async () => {
            wsStore.push(val);
            return [val];
          },
        }),
      }),
      update: () => ({
        set: () => ({
          where: () => [],
        }),
      }),
    };

    const wsService = new DeboWorkspaceService(mockDb);

    it('creates workspace and binds owner', async () => {
      const ws = await wsService.createWorkspace('usr_test', 'Engineering Team', 'free');
      expect(ws.id).toMatch(/^wsp_/);
      expect(ws.name).toBe('Engineering Team');
      expect(ws.plan).toBe('free');
      expect(ws.ownerId).toBe('usr_test');
    });

    it('lists user workspaces', async () => {
      const list = await wsService.getUserWorkspaces('usr_test');
      expect(list.length).toBeGreaterThan(0);
      expect(list[0]?.workspace.name).toBe('Engineering Team');
      expect(list[0]?.role).toBe('owner');
    });
  });

  describe('DeboAuthMiddleware', () => {
    it('resolves TenantContext from API key header', async () => {
      const rawSecret = 'debo_live_mw_test_key_12345';
      const keyHash = await sha256Hex(rawSecret);

      const mockDb: any = {
        select: () => ({
          from: (table: any) => {
            const tableName =
              (table as any)?.[Symbol.for('drizzle:Name')] ||
              (table as any)?._?.name ||
              String(table);
            return {
              where: () => ({
                limit: () => {
                  if (tableName === 'api_keys') {
                    return [
                      {
                        id: 'key_mw',
                        name: 'MW Key',
                        key: keyHash,
                        referenceId: 'usr_middleware',
                        workspaceId: 'wsp_mw',
                        scopes: ['memory.read'],
                        enabled: true,
                        rateLimitEnabled: false,
                        requestCount: 0,
                      },
                    ];
                  }
                  if (tableName === 'workspace_members') {
                    return [
                      {
                        id: 'wmb_mw',
                        workspaceId: 'wsp_mw',
                        userId: 'usr_middleware',
                        role: 'member',
                      },
                    ];
                  }
                  return [];
                },
              }),
            };
          },
        }),
        update: () => ({
          set: () => ({
            where: () => [],
          }),
        }),
      };

      const mw = new DeboAuthMiddleware(mockDb);

      const req = new Request('http://localhost/api/test', {
        headers: { 'x-api-key': rawSecret },
      });

      const ctx = await mw.resolveTenantContext(req);
      expect(ctx.workspaceId).toBe('wsp_mw');
      expect(ctx.userId).toBe('usr_middleware');
      expect(ctx.role).toBe('member');
    });

    it('rejects unauthenticated requests without key or session', async () => {
      const mockDb: any = {};
      const mw = new DeboAuthMiddleware(mockDb);
      const req = new Request('http://localhost/api/test');

      await expect(mw.resolveTenantContext(req)).rejects.toThrow(
        /Authentication required/,
      );
    });
  });

  describe('Signed HMAC Tokens & Composite MCP Auth', () => {
    it('creates and verifies cryptographically signed tokens', async () => {
      const token = await createSignedToken(
        {
          workspaceId: 'ws_alpha',
          userId: 'usr_charlie',
          role: 'admin',
        },
        TEST_SECRET,
      );

      expect(token.startsWith('debo_tok_')).toBe(true);

      const resolved = await verifySignedToken(token, TEST_SECRET);
      expect(resolved).not.toBeNull();
      expect(resolved?.workspaceId).toBe('ws_alpha');
      expect(resolved?.userId).toBe('usr_charlie');
      expect(resolved?.role).toBe('admin');
    });

    it('rejects forged tokens with tampered payloads', async () => {
      const token = await createSignedToken(
        {
          workspaceId: 'ws_alpha',
          userId: 'usr_charlie',
          role: 'admin',
        },
        TEST_SECRET,
      );

      const [prefixAndPayload, signature] = token.split('.');
      const tamperedPayload = Buffer.from(
        JSON.stringify({ workspaceId: 'ws_hacked', userId: 'usr_charlie', role: 'owner' }),
      ).toString('base64url');

      const forgedToken = `${prefixAndPayload?.split('_')[0]}_tok_${tamperedPayload}.${signature}`;

      const resolved = await verifySignedToken(forgedToken, TEST_SECRET);
      expect(resolved).toBeNull();
    });

    it('MCP resolver strictly rejects forgeable caller-chosen strings', async () => {
      const mcpResolver = createMcpAuthResolver({
        secret: TEST_SECRET,
      });

      // Valid signed token
      const signedTok = await createSignedToken(
        { workspaceId: 'ws_token', userId: 'usr_token', role: 'member' },
        TEST_SECRET,
      );
      const res1 = await mcpResolver(`Bearer ${signedTok}`);
      expect(res1?.workspaceId).toBe('ws_token');

      // Forgeable string MUST BE REJECTED
      const resForge = await mcpResolver('Bearer key_ws100_usr200');
      expect(resForge).toBeNull();

      // Empty or missing header MUST BE REJECTED
      expect(await mcpResolver(null)).toBeNull();
    });
  });
});
