# MCP Apps & Interactive UI Delivery

As AI host environments (Claude Desktop, Cursor, and emerging agent operating systems) evolve, agents need to present more than just static text blocks. **MCP Apps** allow Debo's MCP server to deliver secure, interactive UI frames directly into external host canvases.

---

## 1. The Interaction Taxonomy

To avoid architectural confusion, Debo clearly delineates five distinct UI paradigms:

```text
┌─────────────────────────────────┬────────────────────────────────────────────────────────┐
│ UI Paradigm                     │ Definition & Responsibility in Debo                    │
├─────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1. Normal Chat UI               │ Standard textual conversational bubbles (Input/Output).│
│ 2. Application-Native Agent UI  │ Debo Web (`apps/web`): Bespoke Radix/Tailwind editorial│
│                                 │ dashboard with full DOM access and native components.  │
│ 3. Protocol-Level Interaction   │ AG-UI Protocol: Decoupled JSON streaming events for     │
│                                 │ tool confirmation cards, approval gates, and plan state│
│ 4. Declarative UI               │ Schema-driven components (JSON Schema / Zod) rendered  │
│                                 │ dynamically without running arbitrary client scripts.  │
│ 5. MCP-Delivered UI (MCP Apps)  │ Sandboxed interactive micro-views delivered over MCP   │
│                                 │ into third-party host environments (Claude Desktop).   │
└─────────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 2. MCP Apps Architecture

When an external host queries Debo via MCP, Debo can return a structured UI resource:

```text
External Host (Claude Desktop)
          │
          ▼
Calls Tool: `debo_get_decision_context`
          │
          ▼
Debo MCP Server Returns:
  - Text summary & structured data
  - URI Resource: `ui://debo/decisions/{id}/canvas`
          │
          ▼
External Host Renders Sandboxed iFrame:
  - Visual Decision Tree
  - Interactive Citation Highlight Viewer
  - User Approval Buttons
```

### Security Invariants for MCP Apps
1. **Isolated Sandboxing**: MCP App frames are rendered with strict `sandbox="allow-scripts allow-forms"` attributes, forbidding access to the host window's cookies, local storage, or parent DOM.
2. **Zero Ingestion of Host Scripts**: All scripts within the MCP App are served from Debo's verified origins (`*.debo.life`).
3. **Stateless Renderers**: UI frames fetch required data through signed, short-lived tokens to ensure the viewing session cannot exceed the active user's permissions.
