# ItStack Production Deployment Guide (my.itstck.com)
### Proxmox VE LXC Container + Docker PostgreSQL + Cloudflare Tunnel (HTTPS)

This documentation provides a comprehensive, production-grade guide for self-hosting **ItStack (`my.itstck.com`)** inside an Ubuntu LXC container on **Proxmox Virtual Environment (PVE)**, backed by a dedicated **PostgreSQL container**, and exposed securely to the internet via **Cloudflare Tunnel** with zero open inbound ports on your home or office router.

---

## 1. Proxmox LXC Resource Allocation (Sizing)

Because ItStack uses an optimized Node.js / Express engine with a compiled static bundle, its baseline memory consumption is minimal while handling concurrent visitor traffic and static HTML compilation smoothly.

| Resource | Minimum Required | Recommended for Production | Notes |
| :--- | :--- | :--- | :--- |
| **vCPU Cores** | 1 Core | **2 Cores** | Handles concurrent SSG compiling, database queries & edge proxying smoothly |
| **RAM** | 1024 MB (1 GB) | **2048 MB (2 GB)** | 1.2 GB for Node.js app + 512 MB for PostgreSQL container + OS buffers |
| **Swap** | 512 MB | **1024 MB (1 GB)** | Prevents OOM kills during high compilation activity |
| **Disk Space** | 10 GB | **20 GB – 30 GB** | Root filesystem on NVMe / SSD ZFS pool (stores Docker images & Postgres data) |
| **OS Template** | Ubuntu 24.04 LTS | **Ubuntu 24.04 or 26.04 LTS** | Standard LTS template available via Proxmox storage `pveam update` |
| **Container Type** | Unprivileged | **Unprivileged (`unprivileged: 1`)** | Maximum security isolation from the Proxmox host |
| **Features** | `nesting=1` | **`nesting=1` enabled** | **Mandatory** for running Docker & PostgreSQL inside LXC |

---

## 2. Step 1: Create the Ubuntu LXC in Proxmox

### Option A: Via Proxmox Web GUI
1. Log in to Proxmox VE (`https://<proxmox-ip>:8006`).
2. Click **Create CT** (top right corner).
3. **General**:
   - Hostname: `itstack-saas`
   - Unprivileged Container: **Checked** (Yes)
   - Password: Set a secure root password or upload your public SSH key.
4. **Template**: Select `ubuntu-24.04-standard` or `ubuntu-26.04-standard`.
5. **Disks**: Set Disk Size to `20 GB` on your primary storage pool (e.g. `local-zfs` or `local-lvm`).
6. **CPU**: Set Cores to `2`.
7. **Memory**: Memory `2048 MB`, Swap `1024 MB`.
8. **Network**: Bridge `vmbr0`, IPv4 DHCP or Static IP (e.g. `192.168.1.50/24`, Gateway: `192.168.1.1`).
9. **Options**: After creation, go to the container's **Options -> Features -> Edit**, check **Nesting** (`nesting=1`).
10. Click **Start** to boot the container.

### Option B: Via Proxmox Host Shell (One Command)
Run from the Proxmox VE host CLI:
```bash
pct create 200 local:vztmpl/ubuntu-24.04-standard_24.04-1_amd64.tar.zst \
  --hostname itstack-saas \
  --cores 2 \
  --memory 2048 \
  --swap 1024 \
  --rootfs local-lvm:20 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp,firewall=1 \
  --features nesting=1 \
  --unprivileged 1 \
  --start 1
```

---

## 3. Step 2: Configure GitHub OAuth 2.0 App

ItStack enforces **1 GitHub Account = 1 Verified Portfolio Profile**. Users authenticate via GitHub, which populates their verified handle, avatar, bio, and establishes cryptographically signed sessions.

1. Go to **GitHub Developer Settings**: [https://github.com/settings/developers](https://github.com/settings/developers).
2. Click **OAuth Apps** -> **New OAuth App**.
3. Fill in the parameters:
   - **Application name**: `ItStack`
   - **Homepage URL**: `https://my.itstck.com`
   - **Application description**: `Developer Curriculum & Portfolio SaaS`
   - **Authorization callback URL**: `https://my.itstck.com`
4. Click **Register application**.
5. Copy your **Client ID** (e.g. `Iv1.abcdef1234567890`).
6. Generate and copy a **Client Secret** (keep this confidential).

---

## 4. Step 3: Deploy Application & PostgreSQL via Docker Compose

Log into your LXC container:
```bash
ssh root@<ct-ip>
# Or from Proxmox host: pct enter 200
```

### 1. Install Docker & Docker Compose:
```bash
apt update && apt upgrade -y
apt install -y curl git ufw fail2ban ca-certificates gnupg

# Install Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin docker-compose
systemctl enable --now docker
```

### 2. Clone / Copy ItStack Repository:
```bash
mkdir -p /opt/itstack
cd /opt/itstack
# Copy your ItStack files to /opt/itstack
```

### 3. Create `.env` file:
```bash
cat << 'EOF' > /opt/itstack/.env
APP_URL=https://my.itstck.com
PORT=3000
NODE_ENV=production

# PostgreSQL Database Connection
DATABASE_URL=postgres://itstack:itstack_secure_password@db:5432/itstack_db

# GitHub OAuth Credentials
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Cryptographic Session Secret
SESSION_SECRET=itstack_prod_secret_replace_with_openssl_rand_hex_32
EOF
```
*Generate a secure random session secret with `openssl rand -hex 32`.*

### 4. Launch Application & Database:
```bash
cd /opt/itstack
docker compose up -d --build
```

Verify both services are healthy:
```bash
docker compose ps
curl -s http://127.0.0.1:3000/api/profiles
```
*Both `itstack-saas` and `itstack-db` will be up and running.*

---

## 5. Step 4: Expose Securely via Cloudflare Tunnel (`cloudflared`)

Cloudflare Tunnel creates an encrypted, outbound-only connection to Cloudflare's edge network. **Zero router ports (80 or 443) need to be forwarded.**

### 1. Install `cloudflared` inside the LXC container:
```bash
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | tee /etc/apt/keyrings/cloudflare-main.gpg >/dev/null
echo 'deb [signed-by=/etc/apt/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared noble main' | tee /etc/apt/sources.list.d/cloudflared.list
apt update && apt install -y cloudflared
```

### 2. Authenticate Cloudflare Account:
```bash
cloudflared tunnel login
```
*Open the printed URL in your browser and authorize your domain (e.g. `itstck.com`).*

### 3. Create the Tunnel:
```bash
cloudflared tunnel create itstack-prod
```
*Note the returned Tunnel UUID (e.g., `4a5b6c7d-8e9f-0123-4567-89abcdef0123`).*

### 4. Configure Tunnel Ingress:
Create `/etc/cloudflared/config.yml`:
```yaml
tunnel: 4a5b6c7d-8e9f-0123-4567-89abcdef0123
credentials-file: /etc/cloudflared/4a5b6c7d-8e9f-0123-4567-89abcdef0123.json

ingress:
  # Main ItStack SaaS
  - hostname: my.itstck.com
    service: http://127.0.0.1:3000
    originRequest:
      connectTimeout: 30s
      httpHostHeader: my.itstck.com

  # Catch-all
  - service: http_status:404
```

Copy the credentials file to `/etc/cloudflared/`:
```bash
cp ~/.cloudflared/*.json /etc/cloudflared/
```

### 5. Create Cloudflare DNS Record:
```bash
cloudflared tunnel route dns itstack-prod my.itstck.com
```

### 6. Install as a System Service:
```bash
cloudflared service install
systemctl daemon-reload
systemctl enable --now cloudflared
systemctl status cloudflared
```

Your SaaS is now live at **`https://my.itstck.com`** with:
- Automated HTTPS SSL/TLS encryption
- Cloudflare DDoS protection
- Direct routing to `/@username` and `/u/username`
- Zero exposed router ports

---

## 6. Step 5: Production Maintenance, Security & Backups

### 1. LXC Local Firewall (UFW)
Since Cloudflare connects via an outbound tunnel, you can block all inbound internet traffic while keeping local SSH accessible:
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow from 192.168.1.0/24 to any port 22 proto tcp
ufw enable
```

### 2. Database Backup (PostgreSQL)
To run an automated nightly SQL backup of all users and profiles:
```bash
cat << 'EOF' > /usr/local/bin/backup-itstack-db.sh
#!/bin/bash
BACKUP_DIR="/opt/itstack/backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
docker exec itstack-db pg_dump -U itstack itstack_db | gzip > "$BACKUP_DIR/itstack_$TIMESTAMP.sql.gz"
# Keep only last 14 days of backups
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +14 -delete
EOF

chmod +x /usr/local/bin/backup-itstack-db.sh
```
Add to crontab (`crontab -e`):
```cron
0 2 * * * /usr/local/bin/backup-itstack-db.sh
```

### 3. Proxmox VE Automated Snapshot Backups
1. In Proxmox VE Web GUI, go to **Datacenter -> Backup -> Add**.
2. Select your backup storage (`local` or Proxmox Backup Server `PBS`).
3. Select Container ID (`200`).
4. Set Schedule: Daily at `03:30`.
5. Mode: **Snapshot** (Zero downtime).
6. Retention: Keep 7 daily, 4 weekly backups.
