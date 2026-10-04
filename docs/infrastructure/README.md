# Debo Production Infrastructure Architecture

Debo is designed for high reliability, predictable operational expenditure, and rigorous zero-trust network isolation. Rather than deploying all services to an expensive monolithic cloud or scattering them across dozens of ephemeral serverless micro-lambdas, Debo deploys workloads to the optimal infrastructure tier.

---

## 1. Multi-Tier Infrastructure Topology

```text
                                [ User Traffic & External Agents ]
                                                │
                                                ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                                Cloudflare Edge (Security & DNS)                               │
│  - DNS Anycast (debo.life, app.debo.life, mcp.debo.life, docs.debo.life)                     │
│  - WAF, DDoS Layer 7 Mitigation, TLS 1.3 Termination, Bot Management                          │
│  - Cloudflare R2: Immutable Object Store (Zero Egress Fees)                                   │
│  - Cloudflare Tunnel: Secure private reverse proxy to backend compute                         │
└──────────────┬────────────────────────────────┬───────────────────────────────┬───────────────┘
               │                                │                               │
               ▼                                ▼                               ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐ ┌─────────────────────────────┐
│          Vercel Edge         │ │      Cloudflare Tunnel       │ │         Cloudflare R2       │
│  - debo-web (Next.js 15)     │ │        (Zero-Trust)          │ │  - Raw immutable user files │
│  - React Server Components   │ └──────────────┬───────────────┘ │  - Pre-signed signed URLs   │
│  - API Route Handlers        │                │                 └─────────────────────────────┘
└──────────────┬───────────────┘                ▼
               │                  ┌─────────────────────────────┐
               │                  │   Dedicated Compute VPS     │
               │                  │  (Hetzner / Docker Compose) │
               │                  │  - debo-mcp (Node.js/Bun)   │
               │                  │  - debo-worker (Node.js)    │
               │                  │  - debo-document-worker     │
               │                  │    (Python 3.11 + Docling)  │
               │                  └─────────────┬───────────────┘
               │                                │
               └───────────────┬────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                    Managed Platform Services                  │
│  - Neon: Serverless PostgreSQL (Business Truth & Branching)   │
│  - Trigger.dev: Durable Background Task Orchestration         │
│  - Supermemory: Semantic & Episodic Vector Context Engine     │
│  - Composio: Managed OAuth & External Tool Action Gateways    │
└───────────────────────────────────────────────────────────────┘
```

---

## 2. Infrastructure Documents Index

- **[VPS Hardening & Capacity Profiles](file:///home/kunalkashyap8024/sop/debo/docs/infrastructure/vps.md)** — OS, CPU, RAM, Docker Compose, non-root, backups, capacity tiers.
- **[Domain & DNS Architecture](file:///home/kunalkashyap8024/sop/debo/docs/infrastructure/domains-dns.md)** — Hostname routing, origins, TLS, public vs. internal status.
- **[Cloudflare & Zero-Trust Tunnel](file:///home/kunalkashyap8024/sop/debo/docs/infrastructure/cloudflare.md)** — Ingress routing, R2 bucket configurations, Cloudflare Access.
- **[Docker Deployment Policy](file:///home/kunalkashyap8024/sop/debo/docs/infrastructure/docker.md)** — When to use Docker and container hygiene rules.
