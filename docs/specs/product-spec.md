# Normative Specification: Product Requirements

This document is a normative specification using RFC 2119 language.

---

## 1. Product Invariants

1. **Source Grounding**: The Debo system MUST NOT present an unverified factual claim as certain truth. Every factual claim generated in response to user queries MUST include an inline citation linking to an authentic source chunk ID.
2. **Context Ownership**: The system MUST store raw user files in their original immutable format in object storage. Processed text chunks MUST retain exact paragraph and bounding-box coordinates.
3. **External Agent Interoperability**: The platform MUST provide a Model Context Protocol (MCP) interface enabling authenticated external AI clients to discover, query, and cite stored personal memories.
4. **Non-LLM Authority**: The Large Language Model MUST NOT be the authority for permissions, user access boundaries, or data isolation.

---

## 2. User Journey Specifications

### Capture & Ingestion
- When a user uploads a PDF or text note, the system MUST store the raw file in Cloudflare R2 before acknowledging upload completion.
- The system MUST initiate an asynchronous parsing job within 500ms of file upload.
- If document parsing fails, the system MUST notify the user with a typed error code and retain the raw file for manual retry.

### Retrieval & Ask Debo
- When a user submits a query to `/api/chat/ask`, the system MUST retrieve candidate memory chunks strictly partitioned by the user's active `workspaceId`.
- The system MUST stream intermediate reasoning steps and citation markers to the user interface using the AG-UI protocol.
- Clicking any citation in the UI MUST open a source preview highlighting the exact quoted sentence.

### Action Execution
- When an agent proposes executing a Tier 2 action (external communication or mutation), the system MUST suspend execution and render an interactive confirmation card.
- The action MUST NOT execute until the user explicitly grants approval.
