# Debo Connectors Architecture

Debo interfaces with the user's external digital ecosystem (Google Workspace, Slack, Notion, GitHub, Linear, Outlook) without burdening the core engineering team with building and maintaining hundreds of proprietary OAuth integrations.

---

## 1. Platform Taxonomy

Debo implements a three-way architectural split:

```text
┌─────────────────────────────────┬─────────────────────────────────┬─────────────────────────────────┐
│            COMPOSIO             │              NANGO              │             AIRBYTE             │
│        (Action Engine)          │       (Data Sync Engine)        │       (Bulk Warehouse ETL)      │
├─────────────────────────────────┼─────────────────────────────────┼─────────────────────────────────┤
│ Agent tool execution:           │ Continuous bi-directional       │ High-volume batch data          │
│ - Send email via Gmail          │ sync:                           │ replication:                    │
│ - Post Slack channel message    │ - Ingest new Notion pages       │ - Bulk database migration       │
│ - Create GitHub issue           │ - Pull Google Drive folder updates│ - Historical email archive dump│
└─────────────────────────────────┴─────────────────────────────────┴─────────────────────────────────┘
```

---

## 2. Connectors Documentation Index

- **[Integration Strategy & Evaluation](file:///home/kunalkashyap8024/sop/debo/docs/connectors/strategy.md)** — Decision rationale, tool discovery, polling vs. webhooks.
- **[Credential Handling & Ownership Rules](file:///home/kunalkashyap8024/sop/debo/docs/connectors/credential-handling.md)** — Non-negotiable token isolation rules, secret storage, and rotation.
