# AI Coding Agent Context Loading Protocol

To prevent context exhaustion and ensure that autonomous AI agents operate with precise, authoritative rules, agents **must load only the specific documentation subset** relevant to their active ticket.

---

## 1. Context Loading Matrix

| Task Category | Mandatory Files to Load First |
|---|---|
| **Any Coding or Spec Task** | 1. [`AGENTS.md`](file:///home/kunalkashyap8024/sop/debo/AGENTS.md)<br>2. [`PROJECT_STATUS.md`](file:///home/kunalkashyap8024/sop/debo/PROJECT_STATUS.md) |
| **Architecture or Framework Change** | 1. [`docs/architecture/system-overview.md`](file:///home/kunalkashyap8024/sop/debo/docs/architecture/system-overview.md)<br>2. [`docs/architecture/vendor-lock-in.md`](file:///home/kunalkashyap8024/sop/debo/docs/architecture/vendor-lock-in.md)<br>3. Relevant ADR in [`docs/adr/`](file:///home/kunalkashyap8024/sop/debo/docs/adr/README.md) |
| **Memory Engine & Retrieval Task** | 1. [`docs/memory/README.md`](file:///home/kunalkashyap8024/sop/debo/docs/memory/README.md)<br>2. [`docs/memory/source-grounding.md`](file:///home/kunalkashyap8024/sop/debo/docs/memory/source-grounding.md)<br>3. [`docs/contracts/memory-provider.md`](file:///home/kunalkashyap8024/sop/debo/docs/contracts/memory-provider.md)<br>4. [`docs/specs/memory-spec.md`](file:///home/kunalkashyap8024/sop/debo/docs/specs/memory-spec.md) |
| **Agent Reasoning & LangGraph Task** | 1. [`docs/agents/orchestration.md`](file:///home/kunalkashyap8024/sop/debo/docs/agents/orchestration.md)<br>2. [`docs/agents/permissions.md`](file:///home/kunalkashyap8024/sop/debo/docs/agents/permissions.md)<br>3. [`docs/contracts/agent-state.md`](file:///home/kunalkashyap8024/sop/debo/docs/contracts/agent-state.md)<br>4. [`docs/specs/agent-spec.md`](file:///home/kunalkashyap8024/sop/debo/docs/specs/agent-spec.md) |
| **Model Context Protocol (MCP) Task** | 1. [`docs/mcp/README.md`](file:///home/kunalkashyap8024/sop/debo/docs/mcp/README.md)<br>2. [`docs/mcp/tools-taxonomy.md`](file:///home/kunalkashyap8024/sop/debo/docs/mcp/tools-taxonomy.md)<br>3. [`docs/mcp/security.md`](file:///home/kunalkashyap8024/sop/debo/docs/mcp/security.md)<br>4. [`docs/specs/mcp-spec.md`](file:///home/kunalkashyap8024/sop/debo/docs/specs/mcp-spec.md) |
| **Connector & Integration Task** | 1. [`docs/connectors/strategy.md`](file:///home/kunalkashyap8024/sop/debo/docs/connectors/strategy.md)<br>2. [`docs/connectors/credential-handling.md`](file:///home/kunalkashyap8024/sop/debo/docs/connectors/credential-handling.md)<br>3. [`docs/specs/connector-spec.md`](file:///home/kunalkashyap8024/sop/debo/docs/specs/connector-spec.md) |
| **Durable Workflow & Background Task**| 1. [`docs/workflows/README.md`](file:///home/kunalkashyap8024/sop/debo/docs/workflows/README.md)<br>2. [`docs/workflows/event-model.md`](file:///home/kunalkashyap8024/sop/debo/docs/workflows/event-model.md)<br>3. [`docs/specs/workflow-spec.md`](file:///home/kunalkashyap8024/sop/debo/docs/specs/workflow-spec.md) |
| **Database & Schema Task** | 1. [`docs/data-model/README.md`](file:///home/kunalkashyap8024/sop/debo/docs/data-model/README.md)<br>2. [`docs/data-model/entities.md`](file:///home/kunalkashyap8024/sop/debo/docs/data-model/entities.md)<br>3. [`docs/data-model/tenancy.md`](file:///home/kunalkashyap8024/sop/debo/docs/data-model/tenancy.md)<br>4. [`docs/specs/data-spec.md`](file:///home/kunalkashyap8024/sop/debo/docs/specs/data-spec.md) |
| **UI / Frontend Page Task** | 1. [`docs/product/routes.md`](file:///home/kunalkashyap8024/sop/debo/docs/product/routes.md)<br>2. [`docs/design-system/tokens.md`](file:///home/kunalkashyap8024/sop/debo/docs/design-system/tokens.md)<br>3. [`docs/ai/design-agent-guidelines.md`](file:///home/kunalkashyap8024/sop/debo/docs/ai/design-agent-guidelines.md)<br>4. [`.agents/skills/impeccable/SKILL.md`](file:///home/kunalkashyap8024/sop/debo/.agents/skills/impeccable/SKILL.md) |
| **Security & Privacy Audit Task** | 1. [`SECURITY.md`](file:///home/kunalkashyap8024/sop/debo/SECURITY.md)<br>2. [`docs/security/threat-model.md`](file:///home/kunalkashyap8024/sop/debo/docs/security/threat-model.md)<br>3. [`docs/security/secrets.md`](file:///home/kunalkashyap8024/sop/debo/docs/security/secrets.md)<br>4. [`docs/privacy/README.md`](file:///home/kunalkashyap8024/sop/debo/docs/privacy/README.md) |
| **Document Processing (Python) Task** | 1. [`docs/research/docling.md`](file:///home/kunalkashyap8024/sop/debo/docs/research/docling.md)<br>2. [`docs/contracts/document-worker.md`](file:///home/kunalkashyap8024/sop/debo/docs/contracts/document-worker.md) |

---

## 2. Invalidation & Maintenance Rule

If a pull request alters an API shape, database column, or architectural boundary, the authoring agent **MUST update the corresponding documentation files listed above within the same pull request**. Code changes that invalidate documentation without updating it will be blocked in CI.
