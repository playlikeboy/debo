import type { TenantContext, TenantRole } from '@debo/types';
import { sha256Hex, timingSafeEqualStrings } from './hash';

export interface ApiKeyRecord {
  keyHash: string;
  workspaceId: string;
  userId: string;
  role?: TenantRole;
  expiresAt?: Date | string | number | null;
  scopes?: string[];
}

export interface HashedApiKeyResolverOptions {
  keys?: ApiKeyRecord[];
  lookupKeyHash?: (hash: string) => Promise<ApiKeyRecord | null>;
}

/**
 * Creates an auth resolver that verifies raw bearer API keys against stored SHA-256 hashes
 * using timing-safe comparisons and expiration checks.
 */
export function createHashedApiKeyResolver(options: HashedApiKeyResolverOptions) {
  return async (authHeader: string | null): Promise<TenantContext | null> => {
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const rawKey = authHeader.slice(7).trim();
    if (!rawKey) {
      return null;
    }

    const keyHash = await sha256Hex(rawKey);

    let matched: ApiKeyRecord | null = null;

    if (options.lookupKeyHash) {
      matched = await options.lookupKeyHash(keyHash);
    } else if (options.keys) {
      for (const k of options.keys) {
        if (timingSafeEqualStrings(k.keyHash, keyHash)) {
          matched = k;
          break;
        }
      }
    }

    if (!matched) {
      return null;
    }

    if (matched.expiresAt) {
      const expTime = new Date(matched.expiresAt).getTime();
      if (!isNaN(expTime) && expTime < Date.now()) {
        return null;
      }
    }

    return {
      workspaceId: matched.workspaceId,
      userId: matched.userId,
      role: matched.role ?? 'member',
    };
  };
}
