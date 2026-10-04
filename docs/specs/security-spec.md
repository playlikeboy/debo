# Normative Specification: Security Architecture

This document is a normative specification using RFC 2119 language.

---

## 1. Authorization & Tenant Isolation

1. **Non-LLM Authority Invariant**: The Large Language Model MUST NOT be the authority for permissions. All access controls, tenant scoping, and authorization checks MUST be enforced deterministically by Debo application code.
2. **Tenant Scoping**: Every database query, vector search, storage lookup, and cache access MUST unconditionally filter on `workspace_id`.
3. **Role Enforcement**: Every request to a protected route or tool MUST verify that the authenticated user possesses the required role capability (`owner`, `admin`, `member`, `viewer`).

---

## 2. Input Sanitization & Threat Defense

- Ingested files, emails, and web clips MUST be stripped of malicious control characters and wrapped in XML data delimiters before being presented to model contexts.
- Pre-signed object storage URLs MUST NOT exceed a 15-minute expiration window.
- Outbound network requests from worker nodes MUST block private IP address ranges (RFC 1918) to prevent SSRF vulnerabilities.
- Destructive operations (permanent file deletion, memory purging, workspace destruction) MUST require explicit user confirmation.
