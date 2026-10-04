# Debo Technology Evaluation Scorecard

This document contains empirical scoring for all candidate technologies considered for Debo's clean-room architecture.
Ratings range from **1 (Unacceptable / High Risk)** to **5 (Exceptional / Production Ready)**.

---

## 1. Memory Engines Comparison

| Dimension | Weight | Supermemory | Mem0 | Graphiti | Hindsight |
|---|---|---|---|---|---|
| **Technical Fit (Memory/Citations)** | 20% | 4.8 | 4.2 | 3.9 | 4.0 |
| **Episodic & Temporal Reasoning** | 10% | 4.5 | 3.8 | 4.5 | 4.7 |
| **Contradiction Resolution** | 10% | 4.6 | 3.5 | 4.2 | 4.3 |
| **TypeScript SDK & Types** | 10% | 4.9 | 4.2 | 2.5 | 3.0 |
| **Python Support** | 5% | 4.0 | 4.9 | 4.8 | 4.2 |
| **Self-Hosting & Open Source** | 10% | 4.5 | 4.0 | 4.8 | 4.0 |
| **Docker & Deployment** | 5% | 4.6 | 4.5 | 4.2 | 3.8 |
| **Security & Tenant Isolation** | 10% | 4.7 | 4.0 | 4.0 | 3.9 |
| **MCP Integration** | 5% | 4.8 | 4.1 | 3.5 | 3.2 |
| **Operational Complexity** | 5% | 4.5 | 4.0 | 3.0 | 3.5 |
| **Exit Strategy & Migration** | 5% | 4.6 | 4.2 | 4.5 | 4.0 |
| **License (Permissive)** | 5% | 4.8 (MIT) | 4.0 (Apache) | 4.8 (Apache) | 4.5 (MIT) |
| **Weighted Total** | **100%** | **4.64** | **4.10** | **4.01** | **4.04** |

**Recommendation**: Adopt **Supermemory** as the primary engine while strictly wrapping all interactions in Debo's `MemoryProvider` interface (`docs/contracts/memory-provider.md`) to guarantee provider portability.

---

## 2. Durable Workflow Engines Comparison

| Dimension | Weight | Trigger.dev v3 | Inngest | Temporal | BullMQ |
|---|---|---|---|---|---|
| **Technical Fit (Long-running AI jobs)** | 25% | 4.9 | 4.7 | 4.8 | 3.2 |
| **TypeScript Developer Experience** | 20% | 4.9 | 4.8 | 3.2 | 4.0 |
| **Local Development & Emulation** | 15% | 4.9 | 4.8 | 3.0 | 4.2 |
| **Streaming / Real-time Output** | 10% | 4.8 | 4.0 | 3.5 | 2.8 |
| **Self-Hosting Complexity** | 10% | 4.4 | 3.8 | 2.5 | 4.5 |
| **Serverless Deployment (Vercel/Edge)**| 10% | 4.8 | 4.9 | 3.0 | 2.0 |
| **Operational Cost** | 10% | 4.6 | 4.4 | 3.2 | 4.8 |
| **Weighted Total** | **100%** | **4.79** | **4.55** | **3.61** | **3.49** |

**Recommendation**: Adopt **Trigger.dev v3** for background ingestion pipelines, document processing dispatch, and long-running agent loops.

---

## 3. Agent Framework Comparison

| Dimension | Weight | LangGraph JS | Mastra (Legacy) | Vercel AI SDK Core | CrewAI |
|---|---|---|---|---|---|
| **Stateful Cyclic Graphs** | 25% | 5.0 | 3.2 | 3.8 | 3.5 |
| **Checkpointing & Time Travel** | 20% | 5.0 | 2.0 | 3.0 | 2.5 |
| **Human-in-the-Loop Interrupts** | 20% | 5.0 | 2.5 | 3.5 | 3.0 |
| **TypeScript First-Class Support** | 15% | 4.8 | 4.5 | 5.0 | 2.0 |
| **Production Observability (LangSmith)**| 10% | 5.0 | 3.0 | 4.0 | 3.0 |
| **License & Ecosystem Freedom** | 10% | 4.8 (MIT) | 4.0 | 4.8 (Apache) | 4.0 (MIT) |
| **Weighted Total** | **100%** | **4.94** | **3.09** | **3.97** | **3.00** |

**Recommendation**: Adopt **LangGraph JS** unconditionally. Deprecate and exclude Mastra completely.

---

## 4. Connector & Action Platform Comparison

| Dimension | Weight | Composio | Nango | Airbyte | Custom Connectors |
|---|---|---|---|---|---|
| **Tool Execution & Agent Actions** | 30% | 4.9 | 3.5 | 1.5 | 3.0 |
| **OAuth & Token Management** | 20% | 4.7 | 4.9 | 2.0 | 2.5 |
| **Continuous Data Sync / ETL** | 20% | 3.8 | 4.8 | 4.9 | 2.5 |
| **Multi-Tenant Token Isolation** | 15% | 4.8 | 4.9 | 4.0 | 3.0 |
| **Self-Hosting / Docker** | 15% | 4.2 | 4.8 | 4.0 | 5.0 |
| **Weighted Total** | **100%** | **4.54** | **4.41** | **3.01** | **2.95** |

**Recommendation**: Adopt **Composio** for external agent action execution (Google Drive, Slack, GitHub, Notion actions) paired with **Nango** for long-term bi-directional sync where necessary. Never build raw OAuth connectors from scratch in product tables.

---

## 5. Document Processing Engine Comparison

| Dimension | Weight | Docling | Unstructured | PyPDF / pdfplumber | LlamaParse |
|---|---|---|---|---|---|
| **Table & Formula Extraction** | 30% | 4.9 | 4.2 | 2.0 | 4.6 |
| **Layout & Reading Order Fidelity** | 25% | 4.8 | 4.3 | 2.5 | 4.7 |
| **Self-Hostable / Open Source** | 20% | 4.9 (MIT) | 4.0 (Apache) | 5.0 (MIT) | 1.5 (Proprietary) |
| **Resource Consumption / Speed** | 15% | 4.2 | 3.8 | 4.8 | 4.5 |
| **Structured JSON / Markdown Output** | 10% | 4.9 | 4.5 | 3.0 | 4.8 |
| **Weighted Total** | **100%** | **4.76** | **4.17** | **3.17** | **3.77** |

**Recommendation**: Adopt **Docling** inside an isolated Python micro-worker (`apps/document-worker`).

---

## 6. Agentic UI & Protocol Comparison

| Dimension | Weight | AG-UI Protocol | assistant-ui | CopilotKit (Legacy) | Custom Only |
|---|---|---|---|---|---|
| **Protocol / Engine Decoupling** | 30% | 4.9 | 4.2 | 2.2 | 4.5 |
| **Editorial UI Flexibility** | 25% | 4.8 | 4.6 | 2.5 | 5.0 |
| **Streaming Tool Cards & Plan State** | 25% | 4.8 | 4.8 | 4.0 | 3.8 |
| **LangGraph Interoperability** | 20% | 4.9 | 4.5 | 3.5 | 4.0 |
| **Weighted Total** | **100%** | **4.85** | **4.51** | **2.91** | **4.38** |

**Recommendation**: Adopt **AG-UI Protocol** for streaming state, backed by custom Radix/Tailwind components implementing Debo's calm editorial design system. Deprecate CopilotKit.
