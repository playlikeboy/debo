# Status
accepted

# Context
Debo must support personal individuals, collaborative teams, and future enterprise organizations without re-architecting its data storage. An individual may maintain personal private memories (journals, health, private finances) while collaborating with family, business partners, or project teams on shared project context, sources, and tasks.

# Decision
We establish a **Workspace-Centric Tenancy Hierarchy**:
```text
User (Global Identity)
 └── WorkspaceMembership (Role: Owner, Admin, Member, Viewer)
      └── Workspace (Boundary of Tenant Isolation)
           ├── Sources & Documents (Immutable raw files in R2)
           ├── Memories & MemoryRelations (Vector and graph indices)
           ├── Projects, People & Decisions (Structured context)
           ├── Tasks & Workflows (Execution state)
           ├── Connections (Composio / Nango integrations)
           └── Agents & AgentRuns (State checkpoints & logs)
```
- A `User` can own or belong to multiple `Workspaces` (e.g. `Personal`, `Family`, `Acme Corp`).
- The `Workspace` is the **strict, non-negotiable cryptographic and relational boundary of isolation**.
- No memory, source, connector, or agent run can exist without being bound to exactly one `workspace_id`.
- Cross-workspace memory sharing must be an explicit, user-initiated copy or linking operation; automatic cross-workspace bleeding is strictly prevented.

# Alternatives
1. **User-Only Partitioning**: Fails to support collaboration, team memory sharing, or multi-seat organizations.
2. **Organization -> Workspace Multi-Tier Partitioning**: Introduces premature complexity for early-stage personal context software. Workspaces can easily be grouped under organizations in a future phase.

# Why
The Workspace model is the industry-proven standard (Notion, Linear, Slack). It provides clean personal use out of the box (single default personal workspace) while natively supporting seamless team collaboration and strict security auditing.

# Consequences
- **Positive**: Clean database foreign keys; straightforward multi-tenant security queries (`WHERE workspace_id = :id`); simple permission checks via `WorkspaceMembership`.
- **Negative**: All API calls and MCP sessions must resolve an active `workspaceId`.

# Migration / Exit Strategy
Data export formats are partitioned by `workspaceId`, allowing full tenant data export and deletion compliant with GDPR/CCPA.

# Evidence
- Domain entity specifications: `docs/data-model/entities.md` and `docs/data-model/tenancy.md`.
