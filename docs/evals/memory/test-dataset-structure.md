# Memory Test Dataset Structure Specification

All benchmark corpora used in the automated memory evaluation suite are stored as versioned JSON fixtures. This document defines the canonical schema for evaluation datasets.

---

## 1. Evaluation Corpus Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "DeboMemoryEvaluationCorpus",
  "type": "object",
  "required": ["corpusId", "version", "workspaces", "queries"],
  "properties": {
    "corpusId": { "type": "string" },
    "version": { "type": "string" },
    "description": { "type": "string" },
    "workspaces": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["workspaceId", "sources"],
        "properties": {
          "workspaceId": { "type": "string" },
          "tenantName": { "type": "string" },
          "sources": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["sourceId", "type", "title", "timestamp", "chunks"],
              "properties": {
                "sourceId": { "type": "string" },
                "type": { "enum": ["pdf", "audio", "email", "note", "connector"] },
                "title": { "type": "string" },
                "timestamp": { "type": "string", "format": "date-time" },
                "chunks": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": ["chunkId", "content"],
                    "properties": {
                      "chunkId": { "type": "string" },
                      "content": { "type": "string" },
                      "pageNumber": { "type": "integer" },
                      "metadata": { "type": "object" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "queries": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "queryId",
          "queryText",
          "workspaceId",
          "track",
          "expectedAnswer",
          "groundTruthChunkIds"
        ],
        "properties": {
          "queryId": { "type": "string" },
          "queryText": { "type": "string" },
          "workspaceId": { "type": "string" },
          "track": {
            "enum": [
              "exact_fact",
              "semantic_recall",
              "paraphrase",
              "multi_hop",
              "temporal_latest",
              "temporal_historical",
              "contradiction",
              "privacy_isolation",
              "multimodal_table"
            ]
          },
          "expectedAnswer": { "type": "string" },
          "groundTruthChunkIds": {
            "type": "array",
            "items": { "type": "string" }
          },
          "forbiddenChunkIds": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Chunk IDs from other tenants or superseded facts that MUST NOT appear"
          },
          "temporalAnchor": { "type": "string", "format": "date-time" }
        }
      }
    }
  }
}
```

---

## 2. Directory Conventions

Evaluation fixture files are stored under:
```text
docs/evals/memory/fixtures/
├── synthetic-standard-1k.json     # 1,000 synthetic memory chunks for fast local test runs
├── temporal-drift-corpus.json    # Facts with explicit time-decay and revision chains
├── privacy-bleed-corpus.json     # Multi-tenant collision tests across 5 workspaces
└── complex-pdf-layout-corpus.json# Multi-column documents with extracted table ground truth
```
*(Fixture data files are managed in Phase 4 during memory engine integration).*
