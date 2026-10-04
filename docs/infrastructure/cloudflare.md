# Cloudflare Edge, Storage & Tunnel Architecture

Cloudflare serves as Debo's edge security perimeter, DNS provider, immutable object store (R2), and zero-trust tunneling mesh.

---

## 1. Cloudflare Role Invariant

> **Do not force heavy application workloads onto Cloudflare Workers.**
> LangGraph, Docling, and complex LangChain orchestrators exceed Cloudflare Worker bundle limits (1MB/5MB) and CPU execution budgets. Workers are used strictly for edge routing, redirects, and light authentication facades. Full application logic resides in `debo-web` (Node runtime on Vercel) and compute workers (VPS/Docker).

---

## 2. Cloudflare Tunnel Topology

Debo uses **Cloudflare Tunnel (`cloudflared`)** to connect public internet requests securely to private backend VPS containers without opening inbound firewall ports:

```text
[ External MCP Client ]
          │
          ▼ HTTPS
[ mcp.debo.life ] (Cloudflare Edge Network)
          │
          ▼ Encrypted Outbound-Initiated Tunnel
[ cloudflared Daemon on VPS ]
          │
          ▼ Internal Docker Network (localhost:8080)
[ debo-mcp Container ]
```

### Ingress Benefits:
- **Zero Open Inbound Ports**: VPS firewall (`ufw`) blocks all inbound TCP/UDP traffic on ports 80 and 443. The VPS only makes outbound HTTPS connections to Cloudflare edge nodes.
- **DDoS Immunity**: Cloudflare's global anycast network absorbs L3/L4 and L7 volumetric DDoS attacks before they reach compute instances.
- **Zero Public IP Exposure**: Origin server IP addresses remain completely unlisted in public DNS records.

---

## 3. Cloudflare R2 (Immutable Source Storage)

- **Bucket Policy**: Private by default; public read access is permanently disabled.
- **Egress Economics**: $0.00 / GB egress fee allows continuous, high-volume document and audio streaming to processing workers without runaway bandwidth costs.
- **Signed URL Authorization**: Web clients and background workers access source files exclusively through time-limited (15-minute) AWS Signature Version 4 pre-signed URLs generated deterministically by `@debo/storage`.
- **CORS Configuration**: Restricts browser pre-flight requests strictly to `https://app.debo.life`.
