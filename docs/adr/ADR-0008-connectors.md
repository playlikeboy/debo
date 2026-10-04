# Status
accepted

# Context
To serve as a true personal context operating system, Debo must interact with external tools: read emails (Gmail, Outlook), sync documents (Notion, Google Drive), query developer activity (GitHub, Linear), and execute actions on external platforms. Implementing individual OAuth integrations, maintaining API versions, and handling token refreshes for hundreds of services in-house is an anti-pattern that diverts engineering focus from core memory intelligence.

# Decision
1. We adopt **Composio** as Debo's primary integration and action platform for executing external tool calls.
2. We pair it with **Nango** as a dedicated continuous bi-directional synchronization engine where continuous data ingestion is required.
3. We enforce the **Connector Ownership Rule**: third-party OAuth access tokens and refresh tokens must never be stored directly in arbitrary plaintext product tables in Debo.

# Alternatives
1. **Building Custom In-House Connectors**: Evaluated. Maintaining OAuth apps, API version churn, rate limit backoffs, and token refresh loops across 50+ integrations would consume the majority of team bandwidth.
2. **Airbyte**: Excellent for bulk data warehouse movement, but too heavy for interactive, agent-triggered tool execution (e.g. "Draft an email" or "Create a calendar event").

# Why
Composio provides managed OAuth handling, automated token rotation, SOC2-compliant credential storage, and pre-built LangChain/LangGraph tool definitions for 1,000+ popular applications, enabling Debo agents to take safe real-world actions immediately.

# Consequences
- **Positive**: Zero OAuth maintenance burden; immediate access to rich tool ecosystems; strict tenant credential isolation.
- **Negative**: Adds an external platform dependency for action execution; requires internet egress from agent workers to Composio API gateways.

# Migration / Exit Strategy
All connector interactions are mediated through `@debo/connectors`. If Composio is ever discontinued, the interface can swap individual connector providers to native SDKs or Nango without altering LangGraph agent nodes.

# Evidence
- Composio Integration Docs: `https://docs.composio.dev`
- Scorecard ranking: 4.54 / 5.0 in `docs/research/scorecard.md`.
