import type { TenantContext } from '@debo/types';
import { verifySignedToken } from './tokens';
import { createHashedApiKeyResolver, type ApiKeyRecord } from './api-keys';

export interface McpAuthResolverOptions {
  secret?: string;
  apiKeys?: ApiKeyRecord[];
  lookupKeyHash?: (hash: string) => Promise<ApiKeyRecord | null>;
  customResolver?: (authHeader: string | null) => Promise<TenantContext | null>;
}

/**
 * Creates a production-grade, cryptographically unforgeable MCP authentication resolver.
 * Rejects unsigned, unhashed, or structurally forgeable bearer tokens.
 */
export function createMcpAuthResolver(options: McpAuthResolverOptions) {
  const apiKeyResolver =
    options.apiKeys || options.lookupKeyHash
      ? createHashedApiKeyResolver({ keys: options.apiKeys, lookupKeyHash: options.lookupKeyHash })
      : null;

  return async (authHeader: string | null): Promise<TenantContext | null> => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const rawToken = authHeader.slice(7).trim();
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

    // 2. If API key lookup is configured, verify SHA-256 key hash
    if (apiKeyResolver) {
      const apiKeyResult = await apiKeyResolver(authHeader);
      if (apiKeyResult) {
        return apiKeyResult;
      }
    }

    // 3. Delegate to custom resolver if provided
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
