# Domain & DNS Architecture

All Debo hostnames are registered and routed through Cloudflare DNS with universal TLS 1.3 encryption.

---

## 1. Production Hostname Registry

| Hostname | Purpose | Hosting Provider | Origin Target | DNS Record | TLS Mode | Auth Boundary | Caching Policy | Public / Private |
|---|---|---|---|---|---|---|---|---|
| **`debo.life`** | Marketing Landing Page | Cloudflare / Vercel | Vercel CDN Edge | CNAME (Proxied) | Strict (1.3) | Public | Edge Cache (24h) | Public |
| **`www.debo.life`** | Canonical Redirect | Cloudflare | Redirects to `debo.life` | CNAME (Proxied) | Strict (1.3) | Public | Permanent 301 | Public |
| **`app.debo.life`** | Product Web UI & API | Vercel | Vercel Next.js App | CNAME (Proxied) | Strict (1.3) | Session / Better Auth | Dynamic (No-Cache on /api) | Public |
| **`mcp.debo.life`** | External MCP Gateway | Dedicated VPS | Cloudflare Tunnel (`cloudflared`) | CNAME (Proxied) | Strict (1.3) | Bearer API Key | Zero-Cache (Streaming SSE) | Public |
| **`docs.debo.life`** | Developer Documentation | Cloudflare Pages | Git-backed Static Docs | CNAME (Proxied) | Strict (1.3) | Public | Edge Cache (1h) | Public |
| **`status.debo.life`** | System Uptime & Incident Log | Independent Provider (BetterStack/Instatus)| External Status Origin | CNAME (DNS Only)| Strict (1.3) | Public | Edge Cache (1m) | Public |
| **`staging.debo.life`**| Pre-production Testing Environment | Vercel | Vercel Preview Deploy | CNAME (Proxied) | Strict (1.3) | Cloudflare Access (SSO)| Zero-Cache | **Private (Team Only)** |

---

## 2. DNS & Origin Security Rules

1. **Strict SSL/TLS Enforcement**: Cloudflare SSL mode is configured to **Full (Strict)**. All origin servers present valid TLS certificates.
2. **Cloudflare Tunnel for VPS Ingress**: `mcp.debo.life` does not resolve directly to a public VPS IP address. The DNS CNAME points to a Cloudflare Tunnel UUID (`<tunnel-id>.cfargotunnel.com`), completely hiding the origin IP from DDoS scrapers.
3. **Internal Staging Protection**: `staging.debo.life` is protected by **Cloudflare Access (Zero Trust)**, requiring team Google/GitHub email authorization before any HTTP traffic hits the application origin.
