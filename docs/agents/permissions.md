# Agent Permissions & Deterministic Authorization

In Debo, **the Large Language Model is an untrusted reasoning engine and never the authority for permissions**. This document specifies the deterministic permission gates enforced by application code before any tool can be executed by an agent.

---

## 1. Action Risk Tiers

Every tool available to Debo agents belongs to an explicit **Risk Tier**:

| Risk Tier | Examples | Execution Policy | Approval Required? |
|---|---|---|---|
| **Tier 0 (Read-Only)** | `search_memory`, `get_source`, `get_timeline`, `list_tasks` | Automated execution within tenant boundary. | No |
| **Tier 1 (Safe Writes)** | `save_memory`, `create_task`, `create_project_note` | Automated execution within workspace; logged to `AuditLog`. | No |
| **Tier 2 (External Mutations)** | `send_email`, `create_calendar_event`, `post_slack_message` | Pauses graph via `interrupt()`; renders interactive confirmation card. | **Yes (User Approval)** |
| **Tier 3 (Destructive Actions)**| `delete_source`, `purge_memory_graph`, `revoke_connection` | Requires elevated re-authentication / explicit signed confirmation. | **Yes (Strict MFA / Confirmation)** |

---

## 2. Enforcement Architecture

```text
[ Agent Proposes Tool Call: `send_email(to, subject, body)` ]
                           │
                           ▼
          ┌──────────────────────────────────┐
          │  Deterministic Permission Guard  │ ── (TypeScript Middleware in @debo/permissions)
          └────────────────┬─────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
 [ Is Tool Tier 2 or 3? ]            [ Has User Approved? ]
         │ YES                               │ NO
         ▼                                   ▼
  [ Graph Interrupt ]                [ Reject Tool Execution ]
  - Create Approval Record           - Return error to agent node
  - Emit AG-UI Prompt Card           - Log attempt to AuditLog
```

1. **Deterministic Interception**: The tool executor intercepts the tool invocation before dispatching to Composio or internal handlers.
2. **Session Context Verification**: Confirms that the caller has active membership in `workspaceId` with `approval.grant` permissions.
3. **Immutability of Parameters**: The user approves the exact JSON parameter payload (`recipient`, `body`, `id`). If the model alters parameters upon resumption, a new approval is required.
