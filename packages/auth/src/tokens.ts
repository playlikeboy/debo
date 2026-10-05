import type { TenantContext, TenantRole } from '@debo/types';
import { hmacSha256Hex, timingSafeEqualStrings } from './hash';

export interface SignedTokenPayload {
  workspaceId: string;
  userId: string;
  role: TenantRole;
  exp?: number;
  iat?: number;
}

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Creates a cryptographically unforgeable signed token using HMAC-SHA256.
 * Format: debo_tok_<base64Url(payload)>.<signatureHex>
 */
export async function createSignedToken(
  payload: SignedTokenPayload,
  secret: string
): Promise<string> {
  if (!payload.workspaceId || !payload.userId) {
    throw new Error('SignedTokenPayload requires non-empty workspaceId and userId');
  }
  const body = JSON.stringify({
    ...payload,
    iat: payload.iat ?? Date.now(),
  });
  const encodedPayload = base64UrlEncode(body);
  const signature = await hmacSha256Hex(secret, encodedPayload);
  return `debo_tok_${encodedPayload}.${signature}`;
}

/**
 * Verifies a cryptographically signed token.
 * Rejects forged signatures, expired tokens, or malformed payloads using timing-safe comparisons.
 */
export async function verifySignedToken(
  tokenOrHeader: string,
  secret: string
): Promise<TenantContext | null> {
  const rawToken = tokenOrHeader.startsWith('Bearer ')
    ? tokenOrHeader.slice(7).trim()
    : tokenOrHeader.trim();

  if (!rawToken.startsWith('debo_tok_')) {
    return null;
  }

  const withoutPrefix = rawToken.slice('debo_tok_'.length);
  const dotIndex = withoutPrefix.indexOf('.');
  if (dotIndex === -1) {
    return null;
  }

  const encodedPayload = withoutPrefix.slice(0, dotIndex);
  const signature = withoutPrefix.slice(dotIndex + 1);

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSig = await hmacSha256Hex(secret, encodedPayload);
  if (!timingSafeEqualStrings(signature, expectedSig)) {
    return null;
  }

  try {
    const jsonStr = base64UrlDecode(encodedPayload);
    const decoded = JSON.parse(jsonStr) as Partial<SignedTokenPayload>;

    if (
      typeof decoded.workspaceId !== 'string' ||
      !decoded.workspaceId ||
      typeof decoded.userId !== 'string' ||
      !decoded.userId
    ) {
      return null;
    }

    if (typeof decoded.exp === 'number' && decoded.exp < Date.now()) {
      return null;
    }

    const validRoles: TenantRole[] = ['owner', 'admin', 'member', 'guest'];
    const role: TenantRole = validRoles.includes(decoded.role as TenantRole)
      ? (decoded.role as TenantRole)
      : 'member';

    return {
      workspaceId: decoded.workspaceId,
      userId: decoded.userId,
      role,
    };
  } catch {
    return null;
  }
}
