# Playbook: Registering an Agent Tool

This playbook defines how to create and register an AI tool for LangGraph JS and MCP.

---

## 1. Tool Specification Template
Every tool definition must explicitly declare:
- **`name`**: Snake_case identifier (e.g. `recall_memories`, `create_journal_entry`).
- **`description`**: Clear, unambiguous purpose for model selection.
- **`riskClass`**: One of `READ`, `LOW_WRITE`, `EXTERNAL_WRITE`, `DESTRUCTIVE`.
- **`schema`**: Zod schema for input parameters.
- **`requiresApproval`**: Boolean flag. If `true`, LangGraph graph execution halts at an interrupt node pending human approval.

## 2. Invariants
- The tool handler must take `TenantContext` (`workspaceId`, `userId`) as an injected parameter that is NOT controllable by the model.
- Tool outputs must be bounded (e.g., maximum 20 chunks or 4000 tokens) to prevent prompt denial of service.
- All write or destructive operations must produce an immutable audit log entry.
