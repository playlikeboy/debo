# Local Developer Environment & Tooling Guide

Debo is designed to provide a productive, friction-free local development experience. Developers do not need to install dozens of cloud services just to contribute to the UI or write agent logic.

---

## 1. Tooling Tiers

| Tool | Category | Requirement Level | Purpose |
|---|---|---|---|
| **Git** | Core | **Mandatory** | Source control and version management. |
| **Bun (v1.1+)** | Runtime & PM | **Mandatory** | Monorepo package manager, script runner, and local testing runtime. |
| **Node.js (v20+ LTS)** | Runtime | Optional / Fallback | Alternative runtime if running tools requiring specific V8 native modules. |
| **Python (3.11+)** | Runtime | Dev-Only (Docling Work) | Required only if developing directly on `apps/document-worker`. |
| **Docker & Compose** | Containerization | Optional (Recommended) | Local emulation of PostgreSQL, Qdrant, and Docling worker. |
| **Wrangler CLI** | Cloudflare Edge | Dev-Only (Cloudflare Work)| Required only if testing Cloudflare Worker bindings locally. |
| **Vercel CLI** | Web Deployment | Optional | Required only if simulating Vercel preview environments locally. |

---

## 2. Quickstart Setup (Minimal Web & Agent Flow)

You can run the web dashboard and LangGraph agent without running local Docker containers:

```bash
# 1. Clone the repository
git clone https://github.com/SH20RAJ/debo.git
cd debo

# 2. Install workspace dependencies
bun install

# 3. Configure local environment
cp .env.example .env.local

# 4. Start local development server (Web + Agent)
bun run dev:web
```

---

## 3. Full Local Stack with Docker (Optional)

If working on offline document ingestion or background tasks:

```bash
# Start local PostgreSQL, vector store, and mock storage
docker compose -f infrastructure/docker/compose.yaml up -d

# Push database schema to local PostgreSQL
bun run db:push

# Start Trigger.dev local tunneling engine
npx trigger.dev@latest dev
```
