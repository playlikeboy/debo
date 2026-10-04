# Debo Privacy Architecture & Data Governance

Debo is built for users who demand absolute sovereignty over their thoughts, notes, and records. Privacy is not a secondary legal disclaimer; it is a foundational architectural parameter.

---

## 1. What Data Debo Stores and Why

| Data Category | Specific Artifacts | Business Justification | Storage Location | Retention Baseline |
|---|---|---|---|---|
| **Identity & Auth** | Email, hashed password / OAuth ID, display name. | Account provisioning, multi-tenant workspace ownership. | Neon PostgreSQL (`User` table) | Retained until account termination. |
| **Raw Source Files** | Original PDFs, audio recordings, scanned receipts, text notes. | Immutable ground truth; original files for citation verification. | Cloudflare R2 (`workspaces/${id}/sources/`) | User-controlled; soft-delete on demand, permanent delete cascade. |
| **Structured Documents** | Extracted Markdown, tables, paragraph coordinates. | Fast text rendering, coordinate-level citation mapping. | Neon PostgreSQL (`Document` table) | Derived; matches parent source lifecycle. |
| **Memory Graph** | Atomic factual assertions, entity tags, temporal validities. | Fast associative memory recall, personal context answering. | Neon PostgreSQL (`Memory`) + Supermemory Vector Index | Active while valid; marked `SUPERSEDED` when updated. |
| **Audit Logs** | Actor IDs, tool names, timestamps, IP hashes. | Security forensics, tamper detection, compliance. | Neon PostgreSQL (`AuditLog` table) | 90 days (Personal) / 365 days (Team). |

---

## 2. Third-Party Provider Data Exposure

To provide AI intelligence and external integrations, data must occasionally be processed by upstream providers:

1. **LLM Inference Providers (NVIDIA NIM / Anthropic / OpenAI)**:
   - *Data Sent*: Extracted memory chunks and user query prompts necessary to synthesize an answer.
   - *Safeguards*: Debo opts into **Zero Data Retention (ZDR)** agreements where available. Prompts are never used to train frontier foundation models.
2. **Memory Engine Provider (Supermemory)**:
   - *Data Sent*: Text chunks and metadata tags for semantic vector indexing.
   - *Safeguards*: Scoped strictly by workspace ID; zero cross-tenant sharing.
3. **Integration Gateways (Composio / Nango)**:
   - *Data Sent*: Tool invocation arguments (e.g. email recipient and body).
   - *Safeguards*: Scoped to authorized OAuth connections; credentials encrypted at rest.

---

## 3. Privacy Controls & Features

### 1. Private Mode (Ephemeral Interaction)
- Users can toggle **Private Mode** in the Web UI.
- In Private Mode, Ask Debo conversations are ephemeral: queries and responses are not written to long-term memory or conversation history tables.

### 2. Full Tenant Data Export
- At any time, a workspace owner can trigger a **Complete Context Export**:
  - Raw source files downloaded from Cloudflare R2.
  - Relational metadata exported as JSON.
  - Memory facts exported as JSONL.

### 3. Guaranteed Erasure (Right to Be Forgotten)
- Deleting a workspace queues an automated cryptographic purge across Cloudflare R2, Neon PostgreSQL, Supermemory, and Composio.
