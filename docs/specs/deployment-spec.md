# Normative Specification: Deployment & Hosting Topology

This document is a normative specification using RFC 2119 language.

---

## 1. Deployment Invariants

1. **Deployable Boundaries**: The production platform MUST deploy exactly five application targets (`apps/web`, `apps/mcp`, `apps/worker`, `apps/document-worker`, `apps/docs`). Uncontrolled microservice fracturing is strictly PROHIBITED.
2. **Web Tier Target**: `apps/web` MUST be deployed on Vercel utilizing the standard Next.js Node.js runtime. Deploying `apps/web` as a Cloudflare Worker is strictly PROHIBITED due to bundle and CPU limits.
3. **Edge Ingress**: All public HTTP traffic MUST ingress through Cloudflare edge nodes with TLS 1.3 encryption and automated DDoS mitigation.
4. **Compute Node Ingress**: Compute worker nodes on dedicated VPS hosts MUST NOT expose public HTTP/TCP listening ports. Ingress to VPS containers MUST route exclusively through private Cloudflare Tunnels (`cloudflared`).
5. **Zero Secret Hardcoding**: Docker images, build artifacts, and client bundles MUST NOT contain hardcoded secrets, private keys, or API tokens.
