# Normative Specification: External Connectors

This document is a normative specification using RFC 2119 language.

---

## 1. Credential Ownership & Storage

1. **Zero Raw Token Storage**: Debo product database tables MUST NOT store unencrypted third-party OAuth access tokens or refresh tokens.
2. **Managed Secrets**: All third-party OAuth tokens MUST be managed within dedicated secret vaults (Composio / Nango) or encrypted via AES-256 envelope encryption.
3. **Tenant Binding**: Every `Connection` record in Debo MUST be bound to exactly one `(workspace_id, user_id)` pair. Cross-tenant access to another member's connection is strictly PROHIBITED.

---

## 2. Action Execution Safeguards

- When an agent invokes a tool that interacts with an external service, the connector package MUST verify that the connection status is `CONNECTED`.
- External mutations (sending emails, modifying calendars, pushing code commits) MUST require explicit user authorization recorded in the `Approval` ledger prior to dispatch.
- If an upstream API returns an authentication error (HTTP 401/403), the connection status MUST transition to `EXPIRED`, and the user MUST be prompted to re-authenticate.
