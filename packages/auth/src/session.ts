import { UnauthorizedError, type TenantContext } from '@debo/types';
import { sha256Hex, timingSafeEqualStrings } from './hash';

export interface AuthenticatedIdentity {
  userId: string;
  email: string;
  activeWorkspaceId: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
}

export function createTenantContext(identity: AuthenticatedIdentity): TenantContext {
  if (!identity.userId || !identity.activeWorkspaceId) {
    throw new UnauthorizedError('Malformed identity: missing userId or activeWorkspaceId');
  }

  return {
    workspaceId: identity.activeWorkspaceId,
    userId: identity.userId,
    role: identity.role,
  };
}

export async function verifyApiKeyHash(
  providedRawKey: string,
  storedKeyHash: string,
): Promise<boolean> {
  const computedHash = await sha256Hex(providedRawKey);
  return timingSafeEqualStrings(computedHash, storedKeyHash);
}
