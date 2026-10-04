# Docker & Container Policy

Docker is a powerful isolation mechanism, but containerizing every component blindly adds unnecessary complexity. Debo establishes an explicit, pragmatic container policy.

---

## 1. When to Use Docker

### ALWAYS Use Docker For:
1. **Python Workloads with Heavy Native Dependencies (`apps/document-worker`)**:
   - Docling requires PyTorch, OCR libraries, C++ vision drivers, and HuggingFace models. Running this in a Docker container ensures 100% reproducible execution across developer laptops, CI, and VPS hosts.
2. **Browser Automation Workloads (Stagehand / Playwright)**:
   - Headless Chromium requires specific Linux shared libraries (`libnss3`, `libasound2`, font packages) that pollute host OS environments. Sandboxing browsers in containers prevents host system drift.
3. **Local Development Service Emulation**:
   - Running local PostgreSQL, Qdrant, or mock storage during offline development via `infrastructure/docker/compose.yaml`.
4. **Isolated VPS Services**:
   - Running `apps/mcp` and `apps/worker` on production VPS compute nodes with strict memory and CPU resource caps (`deploy.resources.limits`).

---

## 2. When NOT to Use Docker

### NEVER Use Docker For:
1. **Web UI Deployment (`apps/web`)**:
   - Vercel already provides zero-config build optimization, edge routing, and serverless compute for Next.js. Running Next.js in a Docker container on Vercel or a self-managed VPS adds operational maintenance without tangible benefits.
2. **Standard Shared Monorepo Packages (`packages/*`)**:
   - Internal packages are compiled directly by TypeScript and linked via Bun workspaces in-process. Containerizing internal libraries is an anti-pattern.
3. **Managed SaaS Database & Workflow Tiers**:
   - Neon PostgreSQL, Trigger.dev Cloud, and Cloudflare R2 are managed serverless platforms. Do not containerize managed cloud services in production.

---

## 3. Container Images & Naming Conventions

- `debo/document-worker`: Python 3.11 slim image with pre-downloaded Docling layout models.
- `debo/mcp-server`: Node.js 20+ Alpine image running `@debo/mcp`.
- `debo/worker`: Node.js 20+ image executing Trigger.dev worker loops.
