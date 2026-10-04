# Document Worker Contract (TypeScript ↔ Python)

This document defines the serialization format, HTTP job contract, and data exchange between TypeScript background tasks (`@debo/workflows`) and the Python Docling worker (`apps/document-worker`).

---

## 1. Job Invocation Topology

```text
[ Trigger.dev Task (TS) ]
           │
           ▼ HTTP POST /jobs/parse (Internal Docker Network)
[ Document Worker (Python 3.11 + Docling) ]
  - Downloads raw PDF from Cloudflare R2 via Pre-signed URL
  - Runs Docling OCR & Layout Pipeline
  - Extracts Markdown, Table structures, Bounding Box coordinates
  - Uploads structured JSON to R2
           │
           ▼
[ Returns HTTP 200 with Extraction Manifest ]
           │
           ▼
[ Ingestion Continues in TypeScript ]
```

---

## 2. Job Request Schema (JSON)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "DocumentParseJobRequest",
  "type": "object",
  "required": ["jobId", "workspaceId", "sourceId", "rawFileUrl", "storageKey"],
  "properties": {
    "jobId": { "type": "string" },
    "workspaceId": { "type": "string" },
    "sourceId": { "type": "string" },
    "rawFileUrl": {
      "type": "string",
      "format": "uri",
      "description": "Short-lived pre-signed R2 download URL."
    },
    "storageKey": { "type": "string" },
    "options": {
      "type": "object",
      "properties": {
        "enableOcr": { "type": "boolean", "default": true },
        "extractTables": { "type": "boolean", "default": true },
        "generateBoundingBoxes": { "type": "boolean", "default": true }
      }
    }
  }
}
```

---

## 3. Job Response Schema (JSON)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "DocumentParseJobResponse",
  "type": "object",
  "required": [
    "jobId",
    "status",
    "pageCount",
    "markdownOutputUrl",
    "structuredChunksOutputUrl"
  ],
  "properties": {
    "jobId": { "type": "string" },
    "status": { "enum": ["COMPLETED", "FAILED"] },
    "pageCount": { "type": "integer" },
    "processingDurationMs": { "type": "integer" },
    "markdownOutputUrl": {
      "type": "string",
      "description": "R2 URL to full parsed markdown document."
    },
    "structuredChunksOutputUrl": {
      "type": "string",
      "description": "R2 URL to JSON array of paragraphs with page numbers and bounding boxes."
    },
    "errorMessage": { "type": "string" }
  }
}
```

---

## 4. Operational Bounds & Security

1. **Job Timeout**: 300 seconds maximum per document. Documents exceeding 300s are aborted and marked `PROCESSING_TIMEOUT`.
2. **Memory Bounds**: Worker container is capped at 4096MB RAM. If memory exceeds 90%, the worker gracefully rejects new jobs until current jobs complete.
3. **Network Isolation**: The Python worker has zero public ingress. It communicates strictly over the private Docker bridge network (`debo-internal`) with `debo-worker`.
