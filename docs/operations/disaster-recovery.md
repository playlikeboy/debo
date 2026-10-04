# Disaster Recovery & Backup Runbook

This document defines recovery time objectives, recovery point objectives, automated backup schedules, and full system reconstruction procedures.

---

## 1. Recovery Objectives (RTO & RPO)

| Subsystem | Target RTO (Max Downtime) | Target RPO (Max Data Loss Window) | Disaster Scenario |
|---|---|---|---|
| **Primary Database (Neon DB)** | $\le 15\text{ minutes}$ | $\le 5\text{ minutes}$ | Accidental table drop, data corruption. |
| **Object Storage (Cloudflare R2)** | $\le 30\text{ minutes}$ | $0\text{ minutes}$ (Zero Loss) | Storage zone outage, accidental bucket deletion. |
| **Memory Vector Graph** | $\le 2\text{ hours}$ | Derived from DB (Zero Loss) | Supermemory cluster failure. |
| **Compute VPS Instances** | $\le 30\text{ minutes}$ | Stateless (Zero Loss) | VPS hardware failure or host hypervisor crash. |
| **Web UI (Vercel)** | $\le 5\text{ minutes}$ | Stateless (Zero Loss) | Vercel region degradation. |

---

## 2. Backup Architecture & Policies

### 1. Neon PostgreSQL Point-in-Time Recovery (PITR)
- **Continuous WAL Archiving**: Neon automatically retains Write-Ahead Logs (WAL) enabling point-in-time restore to any second in the past 7 days (or 30 days on enterprise).
- **Daily Logical Backups**: An automated Trigger.dev cron task executes `pg_dump` daily at 02:00 UTC, encrypts the dump with GPG, and uploads it to an isolated backup bucket in Cloudflare R2.

### 2. Cloudflare R2 Object Versioning & Lifecycle Rules
- **Bucket Versioning**: Enabled on production buckets. Deleted or overwritten source files create non-current versions retained for 30 days before permanent expiration.
- **Cross-Region Replication**: Critical source documents are replicated to a secondary R2 jurisdiction for catastrophic cloud resilience.

### 3. Memory Graph Recovery Runbook
Because Neon PostgreSQL retains all canonical memory facts, chunks, and source relationships, vector databases are treated as stateless caches:
- In the event of a vector store failure, execute:
  ```bash
  bun run memory:rebuild-index --workspace=all
  ```
- The recovery runner streams chunks from PostgreSQL in batches of 500, recalculates embeddings, and repopulates the vector index without user data loss.

### 4. VPS Reconstruction from Scratch
A destroyed VPS compute node can be completely reconstructed within 15 minutes using infrastructure scripts:
1. Provision fresh Ubuntu 24.04 instance on Hetzner Cloud.
2. Run bootstrap script: `curl -fsSL https://raw.githubusercontent.com/SH20RAJ/debo/main/infrastructure/scripts/vps-bootstrap.sh | bash`.
3. Inject production credentials from Doppler/vault into `.env.production`.
4. Run `docker compose -f infrastructure/docker/compose.production.yaml up -d`.
5. Connect Cloudflare Tunnel (`cloudflared tunnel run debo-vps-tunnel`).
