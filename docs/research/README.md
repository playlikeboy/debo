# Technology Research & Evaluation System

Debo enforces a strict, empirical **Research-Before-Architecture** protocol. We never select a technology merely because it is trending, popular, or because an LLM default suggests it. Every technology introduced into the platform must be thoroughly vetted against primary documentation, official specifications, benchmarks, and security audits.

---

## 1. Primary Evidence Hierarchy

When investigating libraries, runtimes, protocols, or infrastructure platforms, information must be sourced in the following order of precedence:

1. **Official Source Code Repository** (GitHub/GitLab primary trees, release tags, commit histories)
2. **Official Documentation & API References** (Publisher docs, developer portals)
3. **Official Technical Specifications** (RFCs, W3C, Model Context Protocol specifications)
4. **Official Release Notes & Changelogs**
5. **Official Package Registry Metadata** (npm, PyPI, Docker Hub)
6. **Reputable, Reproducible Benchmarks** (Independent peer-reviewed or verifiable reproducible evals)
7. **Technical Discussions & Issue Trackers** (Direct maintainer discussions, open bug reports, security advisories)
8. **Community Content & Third-Party Analyses** (Never used alone to justify an architectural decision)

---

## 2. Mandatory Evaluation Vectors

Every technology under evaluation must be analyzed across the following 20 core dimensions:

1. **Problem Solved**: Exact operational or functional domain addressed.
2. **Why Considered**: Direct applicability to Debo's personal memory and context requirements.
3. **Official Repository**: Verified repository URL and maintainer identity.
4. **Official Documentation**: Verified canonical documentation URL.
5. **Current Version / Evidence Date**: Current release number and verification date.
6. **License Compatibility**: Permissive (MIT, Apache 2.0, BSD) vs copyleft / source-available (SSPL, BSL, AGPL).
7. **Deployment Models**: Serverless, Docker container, managed cloud, or bare-metal VPS.
8. **TypeScript Support**: First-class native types, generated types, or community typings.
9. **Python Support**: Python SDK or inter-process bridge if applicable.
10. **MCP Support**: Compatibility with Model Context Protocol standards.
11. **Agent Framework Compatibility**: Interoperability with LangGraph, LangChain, or custom state machines.
12. **Workflow Support**: Compatibility with event-driven durable execution (Trigger.dev / Inngest).
13. **Self-Hosting Feasibility**: Complete open-source self-hostability without artificial enterprise feature gates.
14. **Docker Support**: Official lightweight images and Compose patterns.
15. **Authentication & Multi-Tenancy**: Built-in support for workspace-level data isolation.
16. **Security & Threat Profile**: Known CVEs, vulnerability disclosure policy, and safe default configs.
17. **Observability**: OpenTelemetry tracing, structured logging, and metrics hooks.
18. **Strengths & Weaknesses**: Explicit trade-offs and operational failure modes.
19. **Cost Implications**: Free tier limits, compute unit pricing, egress costs, and scaling inflection points.
20. **Exit Strategy**: Data export formats, open standards, and fallback replacement paths.

---

## 3. Weighted Scoring Criteria (Debo Formula)

When selecting between competing technologies, evaluations are scored 1 to 5 across seven weighted categories:

$$\text{Score} = (0.40 \times \text{Fit}) + (0.15 \times \text{Maturity}) + (0.10 \times \text{Ecosystem}) + (0.10 \times \text{Security}) + (0.10 \times \text{DX}) + (0.05 \times \text{Self-Host}) + (0.05 \times \text{Cost}) + (0.05 \times \text{Exit})$$

For the comparative matrix across all researched candidates, consult [`scorecard.md`](file:///home/kunalkashyap8024/sop/debo/docs/research/scorecard.md).

---

## 4. Evaluated Technologies Index

- **Memory Engines**:
  - [`supermemory.md`](file:///home/kunalkashyap8024/sop/debo/docs/research/supermemory.md) (Recommended Primary)
  - [`mem0.md`](file:///home/kunalkashyap8024/sop/debo/docs/research/mem0.md) (Candidate Alternative)
  - [`graphiti.md`](file:///home/kunalkashyap8024/sop/debo/docs/research/graphiti.md) (Knowledge Graph Analysis)
  - [`hindsight.md`](file:///home/kunalkashyap8024/sop/debo/docs/research/hindsight.md) (Bi-temporal Memory Engine)
- **Agent Orchestration**:
  - [`langgraph.md`](file:///home/kunalkashyap8024/sop/debo/docs/research/langgraph.md) (Recommended Primary)
- **Action & Data Connectors**:
  - [`composio.md`](file:///home/kunalkashyap8024/sop/debo/docs/research/composio.md) (Recommended Action Engine)
- **Durable Workflows**:
  - [`trigger-dev.md`](file:///home/kunalkashyap8024/sop/debo/docs/research/trigger-dev.md) (Recommended Primary)
  - [`inngest.md`](file:///home/kunalkashyap8024/sop/debo/docs/research/inngest.md) (Alternative Evaluated)
- **Document Processing**:
  - [`docling.md`](file:///home/kunalkashyap8024/sop/debo/docs/research/docling.md) (Recommended Document Worker)
- **Browser Automation**:
  - [`stagehand.md`](file:///home/kunalkashyap8024/sop/debo/docs/research/stagehand.md) (Recommended Browser Fallback)
- **Agentic UI**:
  - [`copilotkit.md`](file:///home/kunalkashyap8024/sop/debo/docs/research/copilotkit.md) (Evaluated & Deprecated)
  - [`assistant-ui.md`](file:///home/kunalkashyap8024/sop/debo/docs/research/assistant-ui.md) (Evaluated Component Kit)
  - [`ag-ui.md`](file:///home/kunalkashyap8024/sop/debo/docs/research/ag-ui.md) (Recommended Protocol Layer)
- **Protocols & LLMs**:
  - [`mcp-sdk.md`](file:///home/kunalkashyap8024/sop/debo/docs/research/mcp-sdk.md) (Official Model Context Protocol SDK)
  - [`llm-providers.md`](file:///home/kunalkashyap8024/sop/debo/docs/research/llm-providers.md) (NVIDIA NIM, Anthropic, OpenAI, DeepSeek)
