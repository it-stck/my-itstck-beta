#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# ItStack (my.itstck.com) - Automated Deployment Script for Ubuntu LXC Container
# Target OS: Ubuntu 24.04 / 26.04 LTS
# ==============================================================================

echo ">>> [1/6] Updating system packages and installing baseline utilities..."
apt update && apt upgrade -y
apt install -y curl git ufw fail2ban dumb-init build-essential ca-certificates

echo ">>> [2/6] Installing Node.js 22 LTS..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt install -y nodejs
fi
node -v
npm -v

echo ">>> [3/6] Creating service user 'itstack'..."
if ! id "itstack" &>/dev/null; then
    useradd -r -s /bin/bash -m -d /opt/itstack itstack
fi

echo ">>> [4/6] Installing application dependencies and compiling build..."
cd /opt/itstack
npm install --production=false
npm run build
mkdir -p /opt/itstack/data
chown -R itstack:itstack /opt/itstack

echo ">>> [5/6] Registering systemd service..."
cp /opt/itstack/itstack.service /etc/systemd/system/itstack.service
systemctl daemon-reload
systemctl enable itstack
systemctl restart itstack

echo ">>> [6/6] Verifying service health on port 3000..."
sleep 3
if curl -s http://127.0.0.1:3000/api/profiles | grep -q "alexturner"; then
    echo "==================================================================="
    echo " SUCCESS: ItStack is running and healthy on http://127.0.0.1:3000"
    echo " Next step: Configure your Cloudflare Tunnel to expose my.itstck.com"
    echo "==================================================================="
else
    echo "WARNING: Health check pending. Check logs with: journalctl -u itstack -f"
fi
