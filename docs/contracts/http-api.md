# HTTP API Contract Specification

This document defines the primary REST and streaming route handlers implemented in `apps/web/src/app/api/*`.

---

## 1. Authentication & Session Resolution
All `/api/*` endpoints (except `/api/auth/*` and public health checks) require an active Better Auth session cookie or unforgeable API key (`debo_live_...` via `x-api-key` or `Authorization: Bearer`). Identity resolution is strictly deterministic via `DeboAuthMiddleware`:
- `ctx.userId: string`
- `ctx.workspaceId: string`
- `ctx.role: 'owner' | 'admin' | 'member' | 'guest'`

---

## 2. Core Endpoints

### `POST /api/chat/ask` (Ask Debo Streaming)
- **Description**: Streams model thoughts, memory retrieval events, citation markers, and synthesized tokens.
- **Request Body**:
  ```json
  {
    "conversationId": "cnv_01J...",
    "query": "Where did I put the car insurance policy?",
    "stream": true
  }
  ```
- **Response**: Server-Sent Events (SSE) adhering to the AG-UI protocol:
  - `event: intent_classified` -> `{ "intent": "answer" }`
  - `event: memory_retrieved` -> `{ "count": 4, "topChunkId": "chk_..." }`
  - `event: token` -> `{ "delta": "Your insurance policy..." }`
  - `event: citation` -> `{ "citationId": "cit_...", "chunkId": "chk_..." }`
  - `event: done` -> `{ "isComplete": true }`

### `POST /api/sources/upload` (Direct R2 Upload)
- **Description**: Generates an authenticated, pre-signed AWS S3/R2 PUT URL for direct browser-to-bucket upload.
- **Request Body**:
  ```json
  {
    "fileName": "q3_financial_report.pdf",
    "mimeType": "application/pdf",
    "byteSize": 1428570
  }
  ```
- **Response**:
  ```json
  {
    "sourceId": "src_01J...",
    "uploadUrl": "https://r2.debo.life/workspaces/...?...&X-Amz-Signature=...",
    "storageKey": "workspaces/wsp_123/sources/src_456/file.pdf",
    "expiresAt": "2026-10-04T12:15:00Z"
  }
  ```

### `POST /api/sources/{sourceId}/process`
- **Description**: Notifies Debo that the raw file has been uploaded to R2, initiating the Trigger.dev parsing pipeline.
- **Response**: `202 Accepted` with `{ "jobId": "wfr_01J..." }`.
