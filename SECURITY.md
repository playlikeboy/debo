# Security Policy

Debo is a private AI memory and context operating system designed around uncompromising user privacy, verifiable source grounding, and deterministic access controls. Because Debo handles deeply personal memories, documents, and credentials, security is a core pillar of our engineering discipline.

---

## 1. Reporting a Vulnerability

If you discover a security vulnerability within Debo, please do **not** open a public GitHub issue. Instead, report it directly to our security team:

- **Email**: security@debo.life
- **Response Target**: Initial triage within 24 hours; formal status update within 72 hours.
- **Coordinated Disclosure**: We adhere to a 90-day coordinated disclosure timeline, providing fixes prior to public disclosure.

When reporting, please provide:
1. A description of the vulnerability and its potential impact.
2. Step-by-step reproduction steps or a minimal proof-of-concept (PoC).
3. The affected component (`debo-web`, `debo-mcp`, `debo-worker`, `debo-document-worker`, or package).
4. Any potential mitigations you have identified.

---

## 2. Core Security Invariants

### 1. Deterministic Authorization (Non-LLM Authority)
The Large Language Model is an untrusted reasoning component and **must never be the authority for permissions**. All access checks (multi-tenancy boundaries, role-based access, tool authorization, source retrieval, and destructive action approval) are performed by deterministic application code in Debo before any query or tool execution occurs.

### 2. Multi-Tenant Isolation
All persistent records in Neon PostgreSQL, Cloudflare R2, and vector/memory stores are strictly partitioned by `workspace_id`. Cross-workspace data leakage is treated as a P0 critical security defect.

### 3. Untrusted Ingestion & Indirect Prompt Injection Defense
All ingested content (web pages, PDFs, emails, voice transcripts, third-party connector events) is treated as potentially adversarial. Ingested text is sanitized and wrapped in strict data delimiters (`<source_data>...</source_data>`) to mitigate indirect prompt injection attacks before being exposed to model contexts.

### 4. Human-in-the-Loop for Destructive Actions
Agents cannot independently execute destructive operations (permanent deletion, bulk data export, modifying external systems via connectors, public sharing) without explicit, auditable user approval recorded in the `Approval` log.

### 5. Credential & Secret Hygiene
- Third-party OAuth tokens and API keys are stored with envelope encryption and never logged or exposed to the frontend.
- API keys for Debo MCP access use cryptographically secure random tokens hashed with SHA-256 before database storage.
- No production secrets or `.env` files are permitted in version control.

---

## 3. Supported Versions

| Component | Status | Supported Versions |
|---|---|---|
| Platform Architecture | Active / Design | Current Baseline (`main`) |
| Debo Web / API | Phase 0 (Specification) | Not yet released |
| Debo MCP Server | Phase 0 (Specification) | Not yet released |
| Background Workers | Phase 0 (Specification) | Not yet released |

---

## 4. Threat Model Documentation

For detailed analysis of our threat vectors, mitigation strategies, and zero-trust data flows, refer to:
- [`docs/security/README.md`](file:///home/kunalkashyap8024/sop/debo/docs/security/README.md)
- [`docs/security/threat-model.md`](file:///home/kunalkashyap8024/sop/debo/docs/security/threat-model.md)
- [`docs/security/secrets.md`](file:///home/kunalkashyap8024/sop/debo/docs/security/secrets.md)
- [`docs/mcp/security.md`](file:///home/kunalkashyap8024/sop/debo/docs/mcp/security.md)
