#!/usr/bin/env bash
# ==============================================================================
# ItStack SaaS — Automated Deployment Script for Ubuntu & Debian 13
# ==============================================================================
set -e

echo "========================================================================"
echo "           ITSTACK SAAS — PRODUCTION DEPLOYMENT ENGINE                  "
echo "========================================================================"

# 1. Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_NAME=$NAME
    OS_VER=$VERSION_ID
    echo ">>> [1/6] Detected Operating System: $OS_NAME ($OS_VER)"
else
    echo ">>> [1/6] Operating System file not detected, assuming Linux."
fi

# 2. Check & Install Docker & Docker Compose if missing
echo ">>> [2/6] Checking Docker and Docker Compose availability..."
if ! command -v docker &> /dev/null; then
    echo ">>> Docker not found. Installing official Docker Engine..."
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg lsb-release
    install -m 0755 -d /etc/apt/keyrings
    
    # Add Docker GPG key
    if [[ "$ID" == "debian" ]]; then
        curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    else
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    fi
    
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable --now docker
    echo ">>> Docker successfully installed and enabled."
else
    echo ">>> Docker is already installed: $(docker --version)"
fi

# 3. Prepare Environment Variables (.env)
echo ">>> [3/6] Verifying environment configuration (.env)..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f .env ]; then
    echo ">>> Creating .env file from .env.example..."
    cp .env.example .env
    # Generate random 32-byte session secret
    RAND_SECRET=$(openssl rand -hex 16 2>/dev/null || cat /proc/sys/kernel/random/uuid | tr -d '-')
    sed -i "s/itstack_prod_secret_replace_with_random_32_characters/$RAND_SECRET/" .env
    echo ">>> Generated secure random SESSION_SECRET."
fi

# 4. Check GitHub OAuth Credentials
if grep -q "GITHUB_CLIENT_ID=\"\"" .env || grep -q "GITHUB_CLIENT_ID=" .env && [ -z "$(grep '^GITHUB_CLIENT_ID=' .env | cut -d= -f2-)" ]; then
    echo "------------------------------------------------------------------------"
    echo " [!] NOTICE: GITHUB_CLIENT_ID is currently blank in your .env file."
    echo "     You can add your GitHub OAuth credentials anytime in .env"
    echo "     and run: docker compose up -d"
    echo "------------------------------------------------------------------------"
fi

# 5. Build and Deploy Docker Containers
echo ">>> [4/6] Building and starting ItStack containers (Web & Database)..."
# Determine if docker compose or docker-compose is available
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo ">>> Installing docker-compose-plugin..."
    apt-get update -y && apt-get install -y docker-compose-plugin
    COMPOSE_CMD="docker compose"
fi

$COMPOSE_CMD down --remove-orphans || true
$COMPOSE_CMD build --no-cache
$COMPOSE_CMD up -d

# 6. Verify Service Health
echo ">>> [5/6] Waiting for services to become healthy..."
MAX_RETRIES=20
COUNT=0
HEALTHY=false

while [ $COUNT -lt $MAX_RETRIES ]; do
    sleep 3
    COUNT=$((COUNT + 1))
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/profiles || echo "000")
    if [ "$STATUS" = "200" ]; then
        HEALTHY=true
        break
    fi
    echo "    Waiting for ItStack SaaS engine... (attempt $COUNT/$MAX_RETRIES, status: $STATUS)"
done

# 7. Print Access Information
HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "YOUR_VPS_IP")

echo ""
echo "========================================================================"
if [ "$HEALTHY" = true ]; then
    echo "   >>> SUCCESS: ITSTACK SAAS IS RUNNING AND FULLY OPERATIONAL! <<<     "
else
    echo "   >>> CONTAINERS STARTED (verifying background startup) <<<           "
fi
echo "========================================================================"
echo ""
echo " 🌐 Accessible on host IP:"
echo "    http://${HOST_IP}:3000"
echo "    http://localhost:3000"
echo ""
echo " 📦 Running Services:"
$COMPOSE_CMD ps
echo ""
echo " 🔑 GitHub OAuth 2.0 Configuration:"
echo "    1. Open: https://github.com/settings/developers -> New OAuth App"
echo "    2. Set Homepage URL:             http://${HOST_IP}:3000"
echo "    3. Set Authorization callback:   http://${HOST_IP}:3000"
echo "    4. Paste GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET into .env"
echo "    5. Run: docker compose up -d"
echo ""
echo " 📋 Logs:"
echo "    View logs anytime: docker compose logs -f"
echo "========================================================================"
