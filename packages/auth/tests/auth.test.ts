import { describe, expect, it } from 'bun:test';
import {
  createHashedApiKeyResolver,
  createMcpAuthResolver,
  createSignedToken,
  createTenantContext,
  hmacSha256Hex,
  sha256Hex,
  timingSafeEqualStrings,
  verifyApiKeyHash,
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

  it('verifies API key hash correctly', async () => {
    const rawKey = 'debo_key_test_12345';
    const expectedHash = await sha256Hex(rawKey);

    const match = await verifyApiKeyHash(rawKey, expectedHash);
    expect(match).toBe(true);

    const badMatch = await verifyApiKeyHash('wrong_key', expectedHash);
    expect(badMatch).toBe(false);
  });

  describe('Signed HMAC Tokens (Unforgeable Bearer Authentication)', () => {
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
      // Tamper with payload by changing base64 to target a different workspace
      const tamperedPayload = Buffer.from(
        JSON.stringify({ workspaceId: 'ws_hacked', userId: 'usr_charlie', role: 'owner' }),
      ).toString('base64url');

      const forgedToken = `${prefixAndPayload?.split('_')[0]}_tok_${tamperedPayload}.${signature}`;

      const resolved = await verifySignedToken(forgedToken, TEST_SECRET);
      expect(resolved).toBeNull();
    });

    it('rejects tokens signed with an incorrect secret', async () => {
      const token = await createSignedToken(
        {
          workspaceId: 'ws_alpha',
          userId: 'usr_charlie',
          role: 'admin',
        },
        'wrong-secret-signature',
      );

      const resolved = await verifySignedToken(token, TEST_SECRET);
      expect(resolved).toBeNull();
    });

    it('rejects expired signed tokens', async () => {
      const expiredToken = await createSignedToken(
        {
          workspaceId: 'ws_alpha',
          userId: 'usr_charlie',
          role: 'member',
          exp: Date.now() - 10000, // expired 10 seconds ago
        },
        TEST_SECRET,
      );

      const resolved = await verifySignedToken(expiredToken, TEST_SECRET);
      expect(resolved).toBeNull();
    });

    it('rejects non-token strings and malformed tokens', async () => {
      expect(await verifySignedToken('key_ws100_usr200', TEST_SECRET)).toBeNull();
      expect(await verifySignedToken('Bearer key_ws100_usr200', TEST_SECRET)).toBeNull();
      expect(await verifySignedToken('debo_tok_invalid', TEST_SECRET)).toBeNull();
    });
  });

  describe('Hashed API Key Resolver', () => {
    it('verifies registered API keys by SHA-256 hash', async () => {
      const rawKey = 'debo_live_abc123secret999';
      const keyHash = await sha256Hex(rawKey);

      const resolver = createHashedApiKeyResolver({
        keys: [
          {
            keyHash,
            workspaceId: 'ws_corp',
            userId: 'usr_bot',
            role: 'member',
          },
        ],
      });

      const validContext = await resolver(`Bearer ${rawKey}`);
      expect(validContext).not.toBeNull();
      expect(validContext?.workspaceId).toBe('ws_corp');
      expect(validContext?.userId).toBe('usr_bot');

      const invalidContext = await resolver('Bearer debo_live_wrong_secret');
      expect(invalidContext).toBeNull();
    });

    it('rejects expired API keys', async () => {
      const rawKey = 'debo_live_expired_key';
      const keyHash = await sha256Hex(rawKey);

      const resolver = createHashedApiKeyResolver({
        keys: [
          {
            keyHash,
            workspaceId: 'ws_corp',
            userId: 'usr_bot',
            expiresAt: new Date(Date.now() - 60000), // expired 1 minute ago
          },
        ],
      });

      const res = await resolver(`Bearer ${rawKey}`);
      expect(res).toBeNull();
    });
  });

  describe('Composite MCP Auth Resolver', () => {
    it('resolves signed tokens and hashed keys, but strictly rejects forgeable caller-chosen strings', async () => {
      const rawKey = 'debo_live_production_key_456';
      const keyHash = await sha256Hex(rawKey);

      const mcpResolver = createMcpAuthResolver({
        secret: TEST_SECRET,
        apiKeys: [
          {
            keyHash,
            workspaceId: 'ws_corp',
            userId: 'usr_admin',
            role: 'owner',
          },
        ],
      });

      // 1. Signed token
      const signedTok = await createSignedToken(
        { workspaceId: 'ws_token', userId: 'usr_token', role: 'member' },
        TEST_SECRET,
      );
      const res1 = await mcpResolver(`Bearer ${signedTok}`);
      expect(res1?.workspaceId).toBe('ws_token');

      // 2. Hashed API key
      const res2 = await mcpResolver(`Bearer ${rawKey}`);
      expect(res2?.workspaceId).toBe('ws_corp');

      // 3. Forgeable token: MUST BE REJECTED
      const resForge = await mcpResolver('Bearer key_ws100_usr200');
      expect(resForge).toBeNull();

      // 4. Missing header: MUST BE REJECTED
      const resEmpty = await mcpResolver(null);
      expect(resEmpty).toBeNull();
    });
  });
});
