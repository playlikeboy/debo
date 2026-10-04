# Connector Strategy: Composio vs Nango vs Airbyte

Integrating with third-party software requires distinguishing between **active tool execution** (agents triggering actions) and **passive data synchronization** (ingesting content into memory).

---

## 1. Comparative Analysis

| Feature | Composio | Nango | Airbyte | Pipedream |
|---|---|---|---|---|
| **Primary Domain** | Agent Actions & Tools | Continuous Data Sync | Bulk Data Movement | Workflow Automation |
| **Tool Execution for Agents** | Native (LangGraph / OpenAI) | Requires custom wrappers | Infeasible for real-time | Webhook / Code steps |
| **OAuth Lifecycle & Token Refresh** | Automated | Automated | Manual / Connector-bound | Automated |
| **Real-time Webhooks** | Supported | Supported | Batch / Schedule focused | Supported |
| **MCP Generation** | Native | Community | No | No |
| **Self-Hosting Options** | Available | Open Source | Open Source | Cloud-only |
| **Multi-Tenancy Partitioning** | `entity_id` scoping | `connection_id` scoping | Workspace scoping | Workspace scoping |

---

## 2. When to Use Which Platform

### 1. Use Composio For:
- **Agent Actions**: Creating calendar invites, drafting responses in Gmail, creating issues in GitHub/Linear, querying Slack messages on demand.
- **Dynamic Tool Binding**: Passing standardized LangChain tool definitions into LangGraph agent nodes.

### 2. Use Nango For:
- **Continuous Passive Ingestion**: Running background sync tasks that watch a user's Notion workspace or Google Drive folder, fetching updated documents and queuing them for Docling parsing.
- **Bi-directional Contacts/Calendar Sync**: Keeping Debo's `Person` and `Event` tables synchronized with external CRMs.

### 3. Use Airbyte For:
- **Enterprise Bulk Archive Ingestion**: One-time initial migration of 100,000 corporate emails or multi-gigabyte document repositories into Cloudflare R2 during enterprise onboarding.

---

## 3. Webhooks vs. Polling Protocol

1. **Webhook Priority**: For services that support robust webhook events (GitHub, Slack, Google Push Notifications), Debo registers webhook endpoints via Composio/Nango.
2. **Delta Polling Fallback**: For services without reliable webhooks, Trigger.dev schedules cron tasks (`*/15 * * * *`) that poll integration endpoints using incremental timestamps (`since_timestamp`).
