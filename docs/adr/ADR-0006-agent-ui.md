# Status
accepted

# Context
Debo's frontend user interface requires real-time streaming of model reasoning, plan progression, interactive tool execution confirmation cards, and source citations. Previously, tightly coupled widgets (such as CopilotKit) created styling rigidity, vendor lock-in, and fragile abstractions that compromised Debo's calm editorial design principles.

# Decision
1. We adopt the **AG-UI (Agent-User Interaction) open protocol** as the decoupling layer between backend agent graph executions and frontend presentation clients.
2. We build Debo's user-facing components using **custom Radix UI + Tailwind CSS primitives** adhering to Debo's calm editorial design system, leveraging `@assistant-ui/react` primitives for headless thread and message rendering where appropriate.
3. We explicitly reject and deprecate CopilotKit.

# Alternatives
1. **CopilotKit**: Rejected. Creates severe visual and architectural lock-in, breaking changes, and blends transport logic with UI rendering.
2. **Proprietary Custom Protocol**: Evaluated. Building custom ad-hoc WebSockets or SSE parsers from scratch increases frontend maintenance burden and prevents clean multi-client support.

# Why
The AG-UI protocol establishes a clean protocol contract: the backend emits standard streaming events (`node_start`, `plan_update`, `tool_call_confirmation_required`, `token_delta`, `citation_emitted`), and frontend components subscribe and render those states using Debo's bespoke editorial design language.

# Consequences
- **Positive**: Complete aesthetic freedom; zero third-party widget lock-in; same agent protocol stream can feed the web app, desktop overlays, or external MCP Apps.
- **Negative**: Requires writing custom card components for tool confirmation and plan approval rather than using off-the-shelf turnkey chat popups.

# Migration / Exit Strategy
Because the protocol is open JSON over SSE, both backend graph emitters and frontend React components can evolve independently without breaking API compatibility.

# Evidence
- AG-UI Protocol Specification: `docs/research/ag-ui.md`.
- assistant-ui Headless Primitives: `docs/research/assistant-ui.md`.
