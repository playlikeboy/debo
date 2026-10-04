# VPS Infrastructure & Compute Node Specification

This document defines the operational requirements, security hardening, container orchestrations, and capacity profiles for Debo compute worker instances.

---

## 1. Capacity Profiles

Debo compute nodes do not require hyper-expensive enterprise servers. We establish three reproducible capacity profiles:

| Profile | Target Environment | vCPU | RAM | NVMe SSD | Provider Recommendation | Est. Cost | Workloads Hosted |
|---|---|---|---|---|---|---|---|
| **Development / Local** | Local Dev / CI | 4 Cores | 8 GB | 50 GB | Local Machine / Docker Desktop | $0 | Docker Compose (Local DB, Mock Storage, Dev Workers) |
| **Small Production** | Phase 1 to Phase 15 | 4 Cores | 8 GB | 80 GB | Hetzner Cloud (CPX31) | ~$15/mo | `debo-mcp`, `debo-worker`, `debo-document-worker` |
| **Growth Production** | Public Launch (Phase 16) | 8 Cores | 16 GB | 160 GB | Hetzner Cloud (CPX41) / AWS EC2 | ~$32/mo | High-concurrency Docling OCR, distributed Trigger workers |

---

## 2. Operating System & Security Hardening

1. **Base OS**: Ubuntu 24.04 LTS (Minimal) or Debian 12.
2. **User Privilege Model**:
   - Direct `root` SSH login is strictly disabled (`PermitRootLogin no`).
   - Deployment runs under a non-root system user (`debo-deploy`).
   - Sudo requires key-protected authorization.
3. **SSH Hardening**:
   - Ed25519 key authentication only (`PasswordAuthentication no`).
   - SSH listening port set to non-default port or protected via Cloudflare Tunnel SSH access.
4. **Firewall (UFW / iptables)**:
   - **Default Policy**: Deny all incoming traffic (`ufw default deny incoming`).
   - **Allowed Ports**: Only SSH (if not behind Tunnel) and Cloudflare Tunnel outbound connections.
   - **Zero Public Ingress**: No application ports (e.g. 3000, 8000, 8080) are exposed to the public internet. All ingress flows exclusively through Cloudflare Tunnel (`cloudflared`).

---

## 3. Container Orchestration & Resource Bounds

Compute nodes run multi-container applications via Docker Compose (`infrastructure/docker/compose.production.yaml`):

```yaml
services:
  document-worker:
    image: debo/document-worker:latest
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '3.0'
          memory: 4096M
        reservations:
          cpus: '1.0'
          memory: 1024M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/healthz"]
      interval: 30s
      timeout: 5s
      retries: 3
    networks:
      - debo-internal

  mcp-server:
    image: debo/mcp:latest
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2048M
    networks:
      - debo-internal
```

### Operational Hygiene:
- **Disk Usage & Log Rotation**: Docker container logs are restricted to max 50MB with 3 rotations (`json-file` with `max-size: "50m"`, `max-file: "3"`).
- **Automated Security Patching**: `unattended-upgrades` enabled for critical Linux kernel and OpenSSL CVEs.
- **Health Checks & Restarts**: All containers declare `/healthz` endpoints. Unhealthy containers are restarted automatically (`restart: unless-stopped`).
- **Zero-Downtime Rollback**: CI/CD uses blue/green image tagging; if health checks fail post-deployment, the prior release container is re-activated immediately.
