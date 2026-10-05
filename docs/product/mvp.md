# Debo Minimum Viable Product (MVP) Definition

To prevent scope creep and endless roadmaps, this document strictly defines the **Minimum Coherent Debo Product**. 

---

## 1. The Core MVP Verification Loop

The MVP exists to prove one fundamental architectural loop:

```text
[ Capture Memory / Note ]
           │
           ▼
[ Store Raw Source in R2 ]
           │
           ▼
[ Process Layout & Extract Chunks ]
           │
           ▼
[ Index into Vector / Relational Graph ]
           │
           ▼
[ Ask Debo Query ]
           │
           ▼
[ Synthesize Grounded Answer with Source Citation ]
           │
           ▼
[ External Agent Accesses Memory via Debo MCP ]
```

**Rule**: Any feature that does not directly support or validate this loop is strictly deferred to Phase 2 or beyond.

---

## 2. In-Scope for MVP

1. **Clean Ingestion**:
   - Upload text notes, Markdown files, and single/multi-page PDFs into Cloudflare R2.
   - Parse PDF text and tables via Docling.
   - Chunk and index into Supermemory / Neon PostgreSQL.
2. **Source-Grounded Retrieval**:
   - Ask Debo conversational search interface in Next.js.
   - Answers synthesized with verified inline citations `[^1]`.
   - Clicking a citation opens the Source Viewer highlighting the exact sentence and bounding box.
3. **Identity & Tenant Isolation**:
   - Better Auth login with personal private workspace partitioning.
4. **Basic MCP Server**:
   - Standard stdio and SSE transport implementing `debo_search_memory` and `debo_get_source`.
   - Claude Desktop and Cursor can search the user's Debo memory.

---

## 3. Explicitly Out-of-Scope for MVP (Deferred to Later Phases)

- Live voice phone calls / WebRTC live voice streaming (Deferred to Phase 15).
- 1,000+ connectors (MVP supports Google Drive and manual uploads only).
- Multi-seat organization billing and SAML SSO.
- Complex multi-agent canvas workflows.
- Native iOS / Android binary apps.
