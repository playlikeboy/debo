# Agent Memory Access Policy

To prevent unintended context exposure, data poisoning, and unauthorized agent mutations, Debo defines an explicit capability-based memory access policy.

---

## 1. Scope Taxonomy

Agents operating within Debo must be granted explicit scopes:

| Scope Identifier | Capability Granted | Typical Agent Persona | Risk Level |
|---|---|---|---|
| `agent.read.memory` | Read indexed semantic, episodic, and declarative memories. | Ask Debo, Chat, Research | Low |
| `agent.read.sources` | Access raw documents and media files in Cloudflare R2. | Document Summarizer, Research | Low |
| `agent.write.memory` | Ingest new extracted facts or update memory states. | Post-Call Summarizer, Ingestion | Medium |
| `agent.write.tasks` | Create, update, or resolve user tasks and follow-ups. | Task Assistant, Action Planner | Medium |
| `agent.execute.external` | Invoke external SaaS actions via Composio (Slack, Gmail, GitHub).| Action Agent | High (Gated) |
| `agent.execute.destructive`| Permanently delete sources, memories, or integrations. | Admin / Cleanup Agent | Critical (MFA Gated) |

---

## 2. Policy Enforcement Rules

1. **Role Bound Scopes**: Custom or specialized agents created in a workspace cannot possess scopes exceeding the creating member's workspace role.
2. **Context Leakage Prevention**:
   - An agent granted `agent.read.memory` cannot view memories marked `is_private: true` unless the session is explicitly authenticated in the user's Personal Workspace.
3. **Indirect Injection Quarantining**:
   - Memories extracted from untrusted third-party emails or unverified web links are marked `untrusted_source: true`.
   - When an agent processes untrusted memories, `agent.execute.external` and `agent.execute.destructive` capabilities are dynamically suspended for the remainder of that reasoning run to prevent confused deputy exploitation.
