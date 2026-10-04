# Model Context Protocol (MCP) Contract Specification

This document defines the formal JSON Schema contracts for Debo's Model Context Protocol (MCP) server endpoints.

---

## 1. Remote Endpoint
- **Target URL**: `https://mcp.debo.life/mcp`
- **Transport**: HTTP POST / Server-Sent Events (SSE)
- **Headers Required**:
  - `Authorization: Bearer debo_mcp_<token>`
  - `Content-Type: application/json`

---

## 2. Standard Tool Schemas (JSON Schema)

### `debo_search_memory`
```json
{
  "name": "debo_search_memory",
  "description": "Performs hybrid semantic and keyword search across indexed memories in the active Debo workspace.",
  "parameters": {
    "type": "object",
    "required": ["query"],
    "properties": {
      "query": {
        "type": "string",
        "description": "The search query or concept to recall."
      },
      "limit": {
        "type": "integer",
        "description": "Maximum number of memory items to return (default: 10, max: 25).",
        "default": 10
      },
      "timeframe_start": {
        "type": "string",
        "format": "date-time",
        "description": "Optional ISO 8601 timestamp filtering for memories valid after this date."
      },
      "timeframe_end": {
        "type": "string",
        "format": "date-time",
        "description": "Optional ISO 8601 timestamp filtering for memories valid before this date."
      }
    }
  }
}
```

### `debo_get_source`
```json
{
  "name": "debo_get_source",
  "description": "Retrieves source container metadata and a temporary pre-signed preview URL for an original document.",
  "parameters": {
    "type": "object",
    "required": ["source_id"],
    "properties": {
      "source_id": {
        "type": "string",
        "description": "The unique ULID of the source container (src_...)."
      }
    }
  }
}
```
