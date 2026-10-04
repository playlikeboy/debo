# Debo Tenancy & Workspace Isolation Model

Debo enforces a strict, hierarchical multi-tenant architecture designed to support individual users with absolute privacy, while providing seamless collaboration for teams and organizations.

---

## 1. Tenancy Hierarchy

```text
┌────────────────────────────────────────────────────────┐
│                   Global User Identity                 │
│                      (auth.users)                      │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│      Personal Workspace      │ │        Team Workspace        │
│   (Private, non-shareable)   │ │  (Shared sources & context)  │
└──────────────┬───────────────┘ └──────────────┬───────────────┘
               │                                │
    ┌──────────┴──────────┐          ┌──────────┴──────────┐
    ▼                     ▼          ▼                     ▼
Personal Sources    Private Memory  Team Projects       Shared Tools
(Journals, Health)  (Private facts) (Meeting Notes)     (GitHub, Slack)
```

---

## 2. Workspace Types & Isolation Boundaries

### A. Personal Workspace (The Private Sandbox)
- Every user is automatically provisioned one **Personal Workspace** upon signup.
- Strictly single-member (`role: 'owner'`). No other users can be invited to a personal workspace.
- Used for deeply confidential context: personal journals, therapy notes, health records, tax returns, personal banking, private voice memos.
- **Cross-workspace protection**: Personal workspace memories are never surfaced or searchable within team workspaces unless the user explicitly executes a *"Copy to Team"* action.

### B. Team Workspace (Collaborative Context)
- Provisioned for companies, project teams, research labs, or families.
- Multi-member with role-based access control (`Owner`, `Admin`, `Member`, `Viewer`).
- Sources uploaded to a team workspace (product specs, customer calls, meeting transcripts) are processed into a **Shared Memory Graph**.

---

## 3. Role-Based Permissions Matrix

| Permission Capability | Viewer | Member | Admin | Owner |
|---|---|---|---|---|
| Read Memories & Sources (`memory.read`) | Yes | Yes | Yes | Yes |
| Query Ask Debo Agent (`agent.query`) | Yes | Yes | Yes | Yes |
| Upload & Ingest Sources (`source.upload`) | No | Yes | Yes | Yes |
| Create / Edit Notes (`notes.write`) | No | Yes | Yes | Yes |
| Execute Standard Tools (`tools.execute`) | No | Yes | Yes | Yes |
| Authorize Destructive Actions (`approval.grant`) | No | No | Yes | Yes |
| Connect Integrations / OAuth (`connector.manage`) | No | No | Yes | Yes |
| Invite / Manage Members (`members.manage`) | No | No | Yes | Yes |
| Delete Workspace / Data Purge (`workspace.delete`) | No | No | No | Yes |

---

## 4. Query Enforcement Invariants

Every data access layer in Debo (SQL, vector, cache, storage) enforces the following invariants:
1. **Explicit Parameter Injection**: All Drizzle ORM queries must include:
   ```typescript
   and(eq(table.workspaceId, ctx.workspaceId), isNull(table.deletedAt))
   ```
2. **Pre-signed URL Scoping**: Cloudflare R2 pre-signed URLs verify that the requested object path begins with `workspaces/${ctx.workspaceId}/`.
3. **MCP API Key Mapping**: Every API key used for MCP access is cryptographically bound to a single `(userId, workspaceId)` tuple. An MCP client cannot switch workspaces without presenting a distinct workspace-scoped key.
