# Release State

## Target Environments

| Environment | Hostname | Ingress | Status | Deployed SHA |
|---|---|---|---|---|
| **Local Dev** | `localhost:3000` | Localhost | Ready for Phase 1 | - |
| **Edge Tunnel** | `debo.life` / `app.debo.life` | Cloudflare Tunnel (`ee8c6129-...`) | Active | Ingress mapped |
| **MCP Gateway** | `mcp.debo.life` | Cloudflare Tunnel (`localhost:8080`) | Active | Ingress mapped |
| **Documentation** | `docs.debo.life` | Cloudflare Tunnel (`localhost:3002`) | Active | Ingress mapped |
| **Document Worker** | `worker.debo.life` | Cloudflare Tunnel (`localhost:8000`) | Active | Ingress mapped |
| **Staging** | `staging.debo.life` | Cloudflare Access + Vercel | Queued | - |
| **Production** | `debo.life` | Cloudflare Edge + Vercel/VPS | Baseline | Phase 0 baseline |

## Feature Flags Baseline
- `memory_provider`: `supermemory`
- `agent_runtime`: `langgraph_js`
- `workflows_enabled`: `true`
- `mcp_gateway`: `enabled`
- `document_ocr`: `docling`
