# Debo System Threat Model (STRIDE Analysis)

This document applies the STRIDE threat modeling methodology to Debo's platform architecture, identifying threat vectors and architectural mitigations.

---

## 1. STRIDE Threat Analysis

### Spoofing Identity
- **Threat**: Attacker creates or spoofs an MCP client session or user token to access another user's personal memories.
- **Mitigation**:
  - Web UI uses cryptographically signed session JWTs via Stack Auth with short expiration windows.
  - MCP Server uses SHA-256 hashed API keys bound irreversibly to a single `(userId, workspaceId)` tuple.
  - Inter-service communication between workers and the document service uses HMAC-SHA256 request signatures.

### Tampering with Data
- **Threat**: Attacker modifies historical memory records, alters citation references, or tampers with audit logs.
- **Mitigation**:
  - `AuditLog` table permissions in Neon PostgreSQL are restricted strictly to `INSERT` and `SELECT`; updates and deletes are revoked at the database grant level.
  - Original raw files in Cloudflare R2 are stored immutably using SHA-256 content hashes in the object key (`fileHash`).

### Repudiation
- **Threat**: A user or agent denies having initiated an external action (e.g. sending an email or deleting a client project).
- **Mitigation**:
  - The `Approval` and `AuditLog` tables capture an immutable cryptographically timestamped record of the approver's user ID, IP address, user agent, and approved parameter payload.

### Information Disclosure (Data Leakage)
- **Threat**: Cross-tenant data bleed occurs during vector search, returning user A's private memories in user B's search results.
- **Mitigation**:
  - The `workspace_id` is an enforced, mandatory metadata filter on all vector queries.
  - Multi-tenant query isolation is continuously verified by automated benchmark tests (`docs/evals/memory/benchmark-suite.md`).
  - Pre-signed URLs for Cloudflare R2 expire in 15 minutes and require valid user session authorization to generate.

### Denial of Service (DoS)
- **Threat**: Attacker floods `mcp.debo.life` or uploads hundreds of 500-page corrupted PDFs to exhaust VPS memory and CPU.
- **Mitigation**:
  - Cloudflare edge enforces rate limits and WAF protections against volumetric attacks.
  - File uploads enforce a maximum payload limit (e.g. 50MB per file).
  - Document worker containers enforce hard CPU and RAM limits (`deploy.resources.limits: memory: 4096M`) to prevent host kernel panics.

### Elevation of Privilege
- **Threat**: An autonomous agent is tricked via indirect prompt injection into granting itself admin privileges or invoking destructive tools.
- **Mitigation**:
  - **Non-LLM Authority Invariant**: The model has zero programmatic authority to escalate its role.
  - Tool invocations pass through deterministic permission guards that check the human user's `WorkspaceMember.role` in PostgreSQL.
