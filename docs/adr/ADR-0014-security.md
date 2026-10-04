# Status
accepted

# Context
Debo stores deeply private personal data: journals, voice recordings, tax documents, private emails, and calendar schedules. AI systems introduce novel, severe threat vectors: prompt injection, indirect prompt injection from parsed documents, confused deputy attacks where agents execute malicious actions on behalf of attackers, and unauthorized cross-tenant data leakage.

# Decision
We establish a **Zero-Trust, Deterministic Security Architecture**:
1. **Non-LLM Authority Invariant**: The Large Language Model is an untrusted reasoning engine and **never** the authority for permissions. All access controls, tenant scoping, and authorization checks are enforced deterministically by Debo application code prior to data retrieval or action execution.
2. **Deterministic Multi-Tenancy**: Every SQL query, vector search, storage path, and cache entry must unconditionally enforce `workspace_id = :workspaceId`.
3. **Indirect Prompt Injection Defense**: Ingested content (web pages, PDFs, emails, transcripts) is strictly sanitized and wrapped in unambiguous XML data delimiters (`<source_data>...</source_data>`) to prevent model instruction hijacking.
4. **Human-in-the-Loop for Destructive Actions**: Destructive operations (permanent file deletion, sending emails, financial transactions, external data mutations) require explicit, signed user approval in the `Approval` log before execution.
5. **Secret Hygiene**: Third-party OAuth tokens are encrypted at rest with envelope encryption and never logged or exposed over MCP.

# Alternatives
1. **System Prompt-based Security**: Relying on instructions like *"Do not access other users' data"* or *"Ask the user before deleting"* in the system prompt. **Rejected as completely unsafe** due to known prompt injection and jailbreak vulnerabilities.
2. **Post-execution Auditing Only**: Allowing agents to execute actions and reviewing them after the fact. Unacceptable for destructive operations.

# Why
Deterministic controls in application code are provable and mathematically bounded, whereas LLM behavioral alignment is inherently probabilistic. High-assurance security requires non-bypassable code boundaries.

# Consequences
- **Positive**: Complete defense against cross-tenant data bleed; immune to prompt-injection-driven privilege escalation; full audit trail for regulatory compliance.
- **Negative**: Requires writing explicit authorization guards on every endpoint, MCP tool, and database query.

# Migration / Exit Strategy
Security rules are formalized in normative specifications (`docs/specs/security-spec.md`) and verified by automated contract tests (`docs/testing/`).

# Evidence
- OWASP Top 10 for Large Language Model Applications (Prompt Injection, Insecure Output Handling).
- Debo Threat Model: `docs/security/threat-model.md`.
