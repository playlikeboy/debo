# Secret Management & Hygiene Specification

Compromised secrets represent an existential threat to personal context systems. Debo enforces zero tolerance for credential mismanagement across all development and production environments.

---

## 1. Absolute Prohibitions (Zero Leakage Rule)

Secrets, private keys, API tokens, and database connection strings **MUST NEVER** appear in:
1. Version control (Git commits, PR diffs, commit messages).
2. Dockerfiles or Docker image layers.
3. Application console logs, debug statements, or exception stack traces.
4. Test fixtures, mock datasets, or automated test files.
5. Screenshots, product documentation, or demonstration videos.

---

## 2. Environment-Specific Secret Management

| Environment | Secret Store Mechanism | Injection Method | Access Boundary |
|---|---|---|---|
| **Local Development** | `.env.local` (Strictly gitignored) | Bun environment auto-loading | Local developer machine only |
| **CI / GitHub Actions** | GitHub Repository Encrypted Secrets | Injected into workflow steps via `secrets.*` | CI pipeline runners only |
| **Web Tier (Vercel)** | Vercel Environment Variables | Encrypted at rest; injected at build/runtime per environment (`Preview`, `Production`) | Next.js server runtime only |
| **Edge / Storage (Cloudflare)** | Cloudflare Secrets (`wrangler secret`) | Encrypted edge environment variables | Cloudflare Worker / Tunnel runtime |
| **Compute VPS Nodes** | Encrypted Vault / Secret Manager (Doppler / 1Password CLI) or isolated `.env.production` with `chmod 600` | Injected into Docker Compose runtime via root-owned environment files | Non-root `debo-deploy` user only |

---

## 3. Secret Rotation & Compromise Response

1. **Automated Secret Scanning**: Pre-commit hooks (`gitleaks`) and GitHub Secret Scanning scan all commits to prevent accidental pushes.
2. **Immediate Revocation Protocol**: If an API key or database credential is suspected of compromise:
   - Rotate the credential immediately in the upstream provider (Neon, Cloudflare, OpenAI, Anthropic).
   - Update the secret in Vercel / GitHub Secrets / VPS Vault.
   - Trigger zero-downtime redeployment.
   - Inspect `AuditLog` for any unauthorized access occurring within the exposure window.
