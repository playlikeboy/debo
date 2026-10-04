import { describe, expect, it } from 'bun:test';
import {
  createTenantContext,
  sha256Hex,
  timingSafeEqualStrings,
  verifyApiKeyHash,
} from '../src/index';

describe('@debo/auth engine', () => {
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
});
