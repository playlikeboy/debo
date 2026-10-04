# Status
accepted

# Context
Debo consists of diverse computational workloads: low-latency web UI and API routing, high-concurrency external MCP server requests, durable background event orchestration, and compute/memory-heavy Python document OCR. Attempting to deploy everything onto a single VM creates single-point-of-failure fragility, while forcing everything onto edge serverless runtimes crashes into bundle and execution limits.

# Decision
We adopt a **hybrid multi-tier deployment topology**:
1. **Edge & Security Layer (Cloudflare)**:
   - DNS, CDN caching, DDoS protection, WAF, and SSL/TLS termination.
   - Cloudflare R2 for zero-egress object storage.
   - Cloudflare Tunnel for secure, private ingress to VPS worker services without exposing raw public ports.
2. **Web Application & UI (Vercel)**:
   - `apps/web` deployed on Vercel with standard Next.js Node.js runtime.
   - Automatic preview deployments, global CDN edge, and zero server maintenance for the web tier.
3. **External Gateway (MCP Server)**:
   - `apps/mcp` deployed to `mcp.debo.life` on managed container runtime or VPS via Cloudflare Tunnel.
4. **Compute Workers (Dedicated VPS / Container Host)**:
   - `apps/worker` and `apps/document-worker` deployed on dedicated VPS nodes (e.g. Hetzner Cloud) running Docker Compose behind Cloudflare Tunnel.
5. **Managed Databases & Services**:
   - Neon for Serverless PostgreSQL; Trigger.dev for workflow orchestration; Composio for connector actions.

# Alternatives
1. **All-on-One Single VPS**: Rejected for production. High risk of Python OCR jobs starving web UI of RAM and CPU; lacks automated preview deployments.
2. **All-on-Cloudflare Workers**: Rejected. LangChain, LangGraph, and Docling dependencies exceed Cloudflare Worker bundle and CPU limits.

# Why
This hybrid architecture leverages each provider where it excels: Vercel for world-class React/Next.js hosting; Cloudflare for edge security, DNS, and zero-egress storage; and cost-effective VPS instances for memory-intensive background workers.

# Consequences
- **Positive**: Web tier remains blisteringly fast and immune to worker CPU spikes; background workers have dedicated memory for Docling; zero public port exposure via Cloudflare Tunnel.
- **Negative**: Requires managing deployments across Vercel and VPS infrastructure via CI/CD.

# Migration / Exit Strategy
All workloads are packaged as standard Next.js applications or Docker containers. The entire platform can be migrated to Kubernetes (EKS/GKE) or pure bare metal with minimal configuration updates.

# Evidence
- Cloudflare Tunnel Documentation: `https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/`
- Vercel Next.js Deployment Best Practices.
