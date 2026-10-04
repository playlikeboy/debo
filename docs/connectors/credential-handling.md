# Connector Credential Handling & Ownership Rule

Storing raw third-party OAuth access tokens or refresh tokens directly in arbitrary application tables is a severe security vulnerability. This document establishes Debo's non-negotiable credential management standards.

---

## 1. The Connector Ownership Rule

> **Debo product tables MUST NEVER store raw, unencrypted third-party OAuth tokens, client secrets, or refresh tokens.**
> Third-party credentials must be owned and managed by dedicated integration secret vaults (Composio / Nango) or encrypted via envelope encryption in dedicated, isolated credential stores.

---

## 2. Invariants & Storage Schema

In Debo's Neon database, the `Connection` table stores only non-sensitive operational metadata:

```typescript
export interface ConnectionRecord {
  id: string; // con_<ulid>
  workspaceId: string;
  userId: string;
  connectorSlug: string; // e.g. 'google-calendar', 'github'
  externalAccountId: string; // Opaque ID in Composio/Nango
  status: 'CONNECTED' | 'EXPIRED' | 'REVOKED' | 'ERROR';
  scopesGranted: string[];
  lastSyncedAt?: Date;
  expiresAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 3. Operational Lifecycles

### 1. Token Refresh
- Managed automatically by Composio / Nango background workers before token expiry.
- If a refresh token becomes invalid (e.g. user changes password or revokes access in Google account settings), the integration status transitions to `EXPIRED`.
- Debo detects the status transition and displays a re-authentication prompt in the Web UI.

### 2. Immediate Revocation
- When a user clicks "Disconnect" in Debo Settings:
  1. Debo issues a revocation API call to Composio/Nango to revoke the token with the upstream provider (e.g. Google/Slack).
  2. The `Connection` record is marked `REVOKED`.
  3. The external account link is deleted from the vault.
  4. An audit event is logged in `AuditLog`.

### 3. Isolation by Tenant
- Every connection is strictly bound to `(workspaceId, userId)`. A member in Workspace A cannot execute actions using a connection configured by a user in Workspace B, even within the same organization.
