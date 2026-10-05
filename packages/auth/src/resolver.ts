import type { TenantContext } from '@debo/types';
import type { DeboDatabase } from '@debo/db';
import { DeboApiKeyService } from './api-keys';
import { sha256Hex, timingSafeEqualStrings } from './hash';
import { verifySignedToken } from './tokens';

export interface McpAuthApiKeyRecord {
  keyHash: string;
  workspaceId: string;
  userId: string;
  role?: string;
}

export interface McpAuthResolverOptions {
  secret?: string;
  db?: DeboDatabase;
  apiKeyService?: DeboApiKeyService;
  apiKeys?: McpAuthApiKeyRecord[];
  lookupKeyHash?: (hash: string) => Promise<TenantContext | null>;
  customResolver?: (authHeader: string | null) => Promise<TenantContext | null>;
}

/**
 * Creates a production-grade, cryptographically unforgeable MCP authentication resolver.
 * Strictly verifies Better Auth API keys (debo_live_...) and HMAC signed tokens (debo_tok_...).
 * Rejects unsigned, unhashed, or structurally forgeable bearer tokens (e.g. key_<ws>_<user>).
 */
export function createMcpAuthResolver(options: McpAuthResolverOptions) {
  const apiKeyService = options.apiKeyService || (options.db ? new DeboApiKeyService(options.db) : null);

  return async (authHeader: string | null): Promise<TenantContext | null> => {
    if (!authHeader) {
      return null;
    }

    let rawToken = '';
    if (authHeader.startsWith('Bearer ')) {
      rawToken = authHeader.slice(7).trim();
    } else {
      rawToken = authHeader.trim();
    }

    if (!rawToken) {
      return null;
    }

    // 1. If token is a signed token (debo_tok_...) and secret is configured, verify HMAC signature
    if (options.secret && rawToken.startsWith('debo_tok_')) {
      const signedResult = await verifySignedToken(rawToken, options.secret);
      if (signedResult) {
        return signedResult;
      }
    }

    // 2. If token is a Debo Better Auth API key (debo_live_...) and apiKeyService is available
    if (apiKeyService && rawToken.startsWith('debo_live_')) {
      try {
        const verified = await apiKeyService.verifyApiKey(rawToken);
        return {
          workspaceId: verified.workspaceId,
          userId: verified.userId,
          role: verified.role,
        };
      } catch {
        return null;
      }
    }

    // 3. If apiKeys array is provided in options
    if (options.apiKeys && options.apiKeys.length > 0) {
      const hash = await sha256Hex(rawToken);
      const match = options.apiKeys.find((k) => timingSafeEqualStrings(k.keyHash, hash));
      if (match) {
        return {
          workspaceId: match.workspaceId,
          userId: match.userId,
          role: (match.role as any) || 'member',
        };
      }
    }

    // 4. If lookupKeyHash callback is provided (e.g. for testing or external stores)
    if (options.lookupKeyHash) {
      const hash = await sha256Hex(rawToken);
      const res = await options.lookupKeyHash(hash);
      if (res) {
        return res;
      }
    }

    // 5. Delegate to custom resolver if provided
    if (options.customResolver) {
      const customResult = await options.customResolver(authHeader);
      if (customResult) {
        return customResult;
      }
    }

    // Strictly fail closed. Never trust caller-supplied unverified identity tokens.
    return null;
  };
}
