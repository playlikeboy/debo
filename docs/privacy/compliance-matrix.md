# Privacy Commitments & Implementation Status Matrix

In accordance with our core engineering rules, Debo **never documents unsupported privacy promises as if they are already implemented**. Every capability is explicitly tracked through three verified states:
- `planned`: Architecturally specified in Phase 0; awaiting implementation.
- `implemented`: Functional code merged into `main`.
- `verified`: Formally verified by automated security and privacy regression tests.

---

## 1. Compliance & Privacy Status Matrix

| Privacy Capability | Description | Target Phase | Current Status | Verification Criteria |
|---|---|---|---|---|
| **Deterministic Workspace Partitioning** | Hard `workspaceId` foreign keys on all data tables. | Phase 2 | `planned` | 10,000 synthetic cross-tenant query probes yield 0 leaks. |
| **Ephemeral Private Mode** | Disables memory and conversation logging on demand. | Phase 2 | `planned` | Automated test confirms 0 DB rows written during private session. |
| **Zero-Egress Immutable Storage** | Cloudflare R2 bucket with private ACLs and pre-signed URLs. | Phase 3 | `planned` | Direct unauthenticated HTTP GET to bucket returns 403 Forbidden. |
| **Cascade Source Deletion** | Deleting source purges R2 object and vector representations. | Phase 4 | `planned` | Verify vector index contains 0 records for deleted source ID. |
| **LLM Zero Data Retention (ZDR)** | Contractual opt-out of model training with providers. | Phase 5 | `planned` | Provider API enterprise agreements signed and verified. |
| **Full Data Export (GDPR Art. 20)** | Complete ZIP export of R2 files + JSON metadata. | Phase 14 | `planned` | Roundtrip export-import test validates 100% byte fidelity. |
| **Right to Be Forgotten (GDPR Art. 17)** | Permanent multi-system purge upon account closure. | Phase 14 | `planned` | Audit script confirms 0 residual records across DB, R2, vectors. |
| **Encrypted Token Isolation** | Envelope encryption for third-party connector tokens. | Phase 7 | `planned` | DB snapshot inspection verifies 0 plaintext tokens. |
| **Anonymized IP Logging** | Truncating IP addresses before writing to `AuditLog`. | Phase 2 | `planned` | Unit test validates last octet / subnet masking. |
