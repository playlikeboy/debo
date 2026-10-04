# Source Grounding & Attribution Specification

Debo's core foundational motto is: **"Capture anything. Ask your past. Trust every answer."**
Trust requires verifiable provenance. This document defines the rules for source attribution, citation integrity, and uncertainty representation across Debo.

---

## 1. Absolute Grounding Invariants

### 1. Mandatory Source Identity
Every memory chunk, entity claim, and extracted relationship stored in Debo **must** retain a persistent foreign key link to its origin:
- `source_id`: The root capture container (e.g. `doc_123`, `audio_456`, `email_789`).
- `document_id`: The structured document record in PostgreSQL.
- `chunk_id`: The specific text segment, table cell, or audio segment.
- `location_metadata`: Source-specific provenance such as page/block/bounding box, character or segment offsets, message/attachment identifiers, timestamps, or canonical URL + extracted segment metadata.
- **Rule**: Any memory created without verifiable source provenance is marked `UNGROUNDED` and excluded from factual query synthesis.

### 2. Evidence-Backed Answer Generation
When the Ask Debo agent generates a response:
- Every factual assertion **must** include an inline citation tag: `[^chunk_id]`.
- The agent graph's `validate_citations` node parses all citation markers, checks that the cited chunk ID was actually retrieved in the context window, and validates that the assertion logically entails from the cited text.
- If a claim cannot be verified against the retrieved context, the node automatically rewrites the answer to explicitly note uncertainty or removes the claim.

### 3. Confidence vs. Truth
- High LLM generation confidence must never be treated as factual truth.
- A statement is considered grounded within Debo only when the cited evidence resolves to a primary source record owned by Debo. Multiple sources may be required when the claim depends on conflicting observations.

### 4. Temporal Distinction (Past vs. Present)
- When a user asks a question, Debo must distinguish between *current belief* and *historical record*.
- If information has been superseded (e.g., old address, previous project scope, past medical dosage), the response must explicitly state:
  > *"According to your records from May 2024, your address was X [^1]. However, this was updated in August 2025 to Y [^2]."*

### 5. Source Deletion & Cascade Invalidation
- When a user deletes a source file from Cloudflare R2:
  - All derived chunks in PostgreSQL are soft-deleted or marked `PURGED`.
  - All derived vector representations in the memory engine are purged via `MemoryProvider.forget()`.
  - Any future queries querying that subject will no longer cite or utilize the deleted source.

### 6. Explicit Uncertainty Marking
- When retrieved sources provide partial or ambiguous information:
  - Debo **must** format the response with explicit uncertainty markers:
    - *"I found partial information in your notes from Oct 3 [^1], but the final contract amount is not specified."*
  - The model is strictly forbidden from extrapolating or filling in missing facts with plausible generic assumptions.

---

## 2. Citation Schema & UI Rendering Contract

Citations returned by Debo APIs must conform to the following JSON structure:

```typescript
export interface Citation {
  citationId: string;
  chunkId: string;
  sourceId: string;
  sourceTitle: string;
  sourceType: 'pdf' | 'audio' | 'email' | 'web' | 'note' | 'connector';
  pageNumber?: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  audioTimestamp?: {
    startSeconds: number;
    endSeconds: number;
  };
  exactQuote: string;
  previewUrl: string; // Short-lived signed R2 URL
}
```

When a user hovers or clicks a citation in the UI, Debo renders a preview card displaying the `exactQuote`, the `sourceTitle`, and a direct action to view the highlighted document inside the Source Viewer.
