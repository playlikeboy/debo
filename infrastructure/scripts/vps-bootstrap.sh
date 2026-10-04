#!/usr/bin/env bash
# Debo Compute Node Bootstrap Script
# Target OS: Ubuntu 24.04 LTS (Minimal)

set -euo pipefail

echo "==> [Debo] Initializing production compute node bootstrap..."

# 1. Update system packages
apt-get update && apt-get upgrade -y
apt-get install -y ufw curl git htop jq ca-certificates gnupg lsb-release

# 2. Configure UFW Firewall (Zero Ingress Public Invariant)
echo "==> [Debo] Configuring firewall rules..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH Access'
ufw --force enable

# 3. Install Docker Engine & Compose
echo "==> [Debo] Installing Docker Engine..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. Create dedicated non-root debo deploy user
if ! id -u debo-deploy > /dev/null 2>&1; then
    echo "==> [Debo] Creating non-root system user: debo-deploy"
    useradd -m -s /bin/bash debo-deploy
    usermod -aG docker debo-deploy
fi

# 5. Setup workspace directories
mkdir -p /opt/debo/logs /opt/debo/data
chown -R debo-deploy:debo-deploy /opt/debo

echo "==> [Debo] Compute node bootstrap completed successfully."
echo "==> Next steps: Inject .env.production and launch compose.production.yaml"
