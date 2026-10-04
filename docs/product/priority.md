# Feature Priority Matrix

Debo prioritizes features based on empirical user value, strategic differentiation, implementation effort, and architectural dependency, rather than aesthetic excitement.

---

## 1. Priority Tiers

| Priority Tier | Definition | Inclusion Policy |
|---|---|---|
| **P0 (Launch Critical)** | Foundational capabilities required to deliver the core MVP loop. | Mandatory for initial functional release. |
| **P1 (Important)** | Core differentiators that elevate Debo from a generic note-taker to a life context OS. | Targeted for Phase 3-8. |
| **P2 (Useful)** | High-value enhancements that expand breadth and automation. | Targeted for Phase 9-13. |
| **P3 (Future / Experimental)**| Speculative or specialized capabilities. | Backlog candidates for post-launch. |

---

## 2. Capability Matrix

| Feature / Subsystem | Priority | User Value | Strategic Value | Effort | Risk | Rationale |
|---|---|---|---|---|---|---|
| **Clean-Room Documentation & Specs** | **P0** | High | Maximum | Low | Low | Prevents architectural drift and ungrounded coding. |
| **Source-Grounded Answering & Citations** | **P0** | Maximum | Maximum | Medium | Medium | Debo's core promise is trust; without citations, it's just another hallucinating LLM. |
| **PDF & Document Ingestion (Docling)** | **P0** | Maximum | High | Medium | Medium | Users have existing documents; manual re-typing is non-viable. |
| **Official Model Context Protocol (MCP)**| **P0** | High | Maximum | Low | Low | Establishes Debo as the universal context layer for external IDEs and agents. |
| **Personal Workspace Isolation** | **P0** | Maximum | Maximum | Low | Low | Privacy invariant; non-negotiable. |
| **Episodic Timeline View (`/app/timeline`)**| **P1** | High | High | Medium | Low | Unique visual differentiation showing life events over time. |
| **Audio Voice Note Ingestion** | **P1** | High | High | Medium | Low | Voice is the highest-bandwidth personal capture modality. |
| **Composio Actions (Calendar/Email)** | **P1** | High | High | Medium | Medium | Transforms Debo from passive search to active personal assistant. |
| **Decisions & Tasks Ledger** | **P1** | Medium | High | Low | Low | High personal utility; captures "why" decisions were made. |
| **Human-in-the-Loop Approval UI** | **P1** | Maximum | Maximum | Low | Low | Safety prerequisite for executing real-world actions. |
| **MCP Apps Interactive UI Delivery** | **P2** | Medium | High | Medium | Medium | Renders rich decision trees and cards inside Claude Desktop. |
| **Stagehand Browser Automation Fallback**| **P2** | Medium | Medium | High | High | Solves long-tail missing APIs when connectors fail. |
| **Team Workspace Collaboration** | **P2** | Medium | High | High | Medium | Multi-seat accounts and shared team memory graphs. |
| **Live Voice Phone Calls (WebRTC)** | **P3** | Medium | Medium | High | High | High operational complexity and bandwidth costs. |
| **Smart Home / IoT Ingestion** | **P3** | Low | Low | High | Medium | Niche audience; deferred to community skills. |
