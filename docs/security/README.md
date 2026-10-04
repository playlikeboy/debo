# Debo Security Architecture

Debo is engineered to meet the highest standards of data security, tenant isolation, and cryptographic integrity. Because Debo serves as a personal memory vault, any compromise of user data represents a catastrophic failure of our core value proposition.

---

## 1. Security Architecture Tenets

1. **Non-LLM Authorization Authority**: Permissions are deterministically evaluated by TypeScript middleware in application code. The model never decides access rights.
2. **Zero-Trust Multi-Tenancy**: Unconditional `workspace_id` filtering at the database, storage, and cache layers.
3. **Defense-in-Depth Against Prompt Injections**: Both direct user prompts and indirect document inputs are sanitized and isolated in unambiguous XML data delimiters.
4. **Envelope Encryption & Secret Segregation**: Third-party OAuth tokens and customer secrets are encrypted using AES-256-GCM with distinct data encryption keys (DEKs).
5. **Human-in-the-Loop Safeguards**: High-risk actions (sending emails, modifying calendars, deleting files) cannot execute without explicit user approval.

---

## 2. Security Documentation Index

- **[Comprehensive Threat Model](file:///home/kunalkashyap8024/sop/debo/docs/security/threat-model.md)** — Attack vectors, threat actors, STRIDE analysis, and mitigations.
- **[Secret Management Protocol](file:///home/kunalkashyap8024/sop/debo/docs/security/secrets.md)** — Standards for managing environment variables across Local, CI, Vercel, Cloudflare, and VPS tiers.
- **[MCP Security & Protocol Defense](file:///home/kunalkashyap8024/sop/debo/docs/mcp/security.md)** — Safeguards for external agent connections.
- **[Master Security Policy](file:///home/kunalkashyap8024/sop/debo/SECURITY.md)** — Vulnerability reporting and coordinated disclosure guidelines.
