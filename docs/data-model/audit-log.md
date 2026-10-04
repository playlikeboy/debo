# Immutable Audit Event Model

Security, compliance, and user trust require that every significant action in Debo—whether performed by a human user, an autonomous agent, or an external tool via MCP—produces an immutable, tamper-evident audit record.

---

## 1. Audit Event Schema

The `AuditLog` entity is defined as an append-only PostgreSQL table in `@debo/db`:

```typescript
export interface AuditEvent {
  id: string; // aud_<ulid>
  workspaceId: string;
  userId?: string;
  actorType: 'user' | 'agent' | 'mcp_client' | 'system' | 'connector_webhook';
  actorId: string; // User ID, Agent ID, or API Key ID
  action: string; // e.g. 'source.delete', 'memory.update', 'tool.execute', 'auth.login'
  resourceType: 'source' | 'document' | 'memory' | 'connection' | 'workspace' | 'approval';
  resourceId?: string;
  toolName?: string;
  toolArguments?: Record<string, unknown>; // Sanitized (no secrets/passwords)
  executionResult: 'success' | 'failure' | 'denied' | 'pending_approval';
  errorMessage?: string;
  ipAddress?: string; // Anonymized or hashed where legally required (GDPR)
  userAgent?: string;
  requestId: string;
  traceId?: string;
  timestamp: Date;
}
```

---

## 2. Invariants & Security Controls

1. **Append-Only Immutability**:
   - The `AuditLog` table has no `UPDATE` or `DELETE` grants for standard application connections.
   - Application database roles can only execute `INSERT` and `SELECT` queries on `AuditLog`.
2. **Secret Redaction**:
   - Before writing to `toolArguments`, arguments are scrubbed through a credential masking filter to ensure OAuth tokens, passwords, and private API keys are never written to audit tables.
3. **Retention Policy**:
   - Personal Workspace: Minimum 90-day retention; optional export to JSONL.
   - Team / Enterprise Workspace: Minimum 365-day immutable retention; streaming export to S3/CloudWatch available.
   - Erasure: When a workspace is deleted, audit logs are retained for 30 days in cold storage for security forensics, then cryptographically shredded.
