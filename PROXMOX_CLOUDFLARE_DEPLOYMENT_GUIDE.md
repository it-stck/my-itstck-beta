# ItStack Production Deployment Guide (my.itstck.com)
### Proxmox VE LXC Container + Cloudflare Tunnel (HTTPS)

This documentation provides an end-to-end, production-ready deployment guide for self-hosting **ItStack (`my.itstck.com`)** inside an Ubuntu LXC container on **Proxmox Virtual Environment (PVE)** and exposing it securely to the public internet via **Cloudflare Tunnel** with zero open router ports.

---

## 1. Proxmox LXC Sizing & Resource Sizing

Because ItStack utilizes a zero-dependency static HTML compiler and a lightweight Express backend, it has an extremely low resource footprint while delivering sub-15ms response times.

| Resource | Minimum Required | Recommended for Production | Notes |
| :--- | :--- | :--- | :--- |
| **vCPU Cores** | 1 Core | **2 Cores** | Handles concurrent SSG compiling & edge proxying smoothly |
| **RAM** | 512 MB | **1024 MB (1 GB)** | Ample memory for Node.js 22 LTS + Express + in-memory store |
| **Swap** | 512 MB | **512 MB** | Buffer for peak compilation bursts |
| **Disk Space** | 8 GB | **15 GB – 20 GB** | Root filesystem on NVMe / SSD ZFS pool |
| **OS Template** | Ubuntu 24.04 / 26.04 | **Ubuntu 24.04 / 26.04 LTS** | Standard LTS template available in `pveam update` |
| **Container Type** | Unprivileged | **Unprivileged (`unprivileged: 1`)** | Maximum security isolation from Proxmox host |
| **Features** | `nesting=1` | **`nesting=1` enabled** | Mandatory if you choose to run Docker inside LXC |

---

## 2. Step 1: Create the Ubuntu LXC in Proxmox

### Option A: Via Proxmox Web GUI
1. Log in to Proxmox VE (`https://<proxmox-ip>:8006`).
2. Click **Create CT** (top right).
3. **General**:
   - Hostname: `itstack-saas`
   - Unprivileged Container: **Checked**
   - Password: Set a secure root password or upload your SSH key.
4. **Template**: Select `ubuntu-24.04-standard` or `ubuntu-26.04-standard`.
5. **Disks**: Set size to `20 GB` on your primary storage (e.g. `local-lvm` or `local-zfs`).
6. **CPU**: Set Cores to `2`.
7. **Memory**: Memory `1024 MB`, Swap `512 MB`.
8. **Network**: Bridge `vmbr0`, IPv4 DHCP or Static IP (e.g. `192.168.1.50/24`, Gateway: `192.168.1.1`).
9. **Options**: Under CT Options, ensure **Nesting** is set to `1` (Enabled).
10. Click **Finish** and start the container.

### Option B: Via Proxmox Shell (CLI)
You can create the container in one command from the Proxmox host shell:
```bash
pct create 200 local:vztmpl/ubuntu-24.04-standard_24.04-1_amd64.tar.zst \
  --hostname itstack-saas \
  --cores 2 \
  --memory 1024 \
  --swap 512 \
  --rootfs local-lvm:20 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp,firewall=1 \
  --features nesting=1 \
  --unprivileged 1 \
  --start 1
```

---

## 3. Step 2: Deploy the Application Inside the LXC

Log into your container via SSH or the Proxmox Console:
```bash
ssh root@<ct-ip>
# or from Proxmox host:
pct enter 200
```

### Approach 1: Native Systemd (Fastest & Lightest)
1. **Clone or transfer project files**:
   ```bash
   mkdir -p /opt/itstack
   cd /opt/itstack
   # Copy the project files here
   ```

2. **Run the automated setup script**:
   ```bash
   chmod +x /opt/itstack/setup-proxmox-lxc.sh
   /opt/itstack/setup-proxmox-lxc.sh
   ```

3. **Verify the service**:
   ```bash
   systemctl status itstack
   curl http://127.0.0.1:3000/api/profiles
   ```

### Approach 2: Docker & Docker Compose
If you prefer running inside Docker:
```bash
apt update && apt install -y docker.io docker-compose
systemctl enable --now docker
cd /opt/itstack
docker-compose up -d --build
docker ps
```

---

## 4. Step 3: Cloudflare Tunnel Configuration (`cloudflared`)

Cloudflare Tunnel creates an encrypted outbound-only connection from your Proxmox LXC to Cloudflare's global edge network. **You do not need to open any ports (80 or 443) on your home/office router.**

### 1. Install `cloudflared` inside the LXC container:
```bash
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | tee /etc/apt/keyrings/cloudflare-main.gpg >/dev/null
echo 'deb [signed-by=/etc/apt/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared noble main' | tee /etc/apt/sources.list.d/cloudflared.list
apt update && apt install -y cloudflared
```

### 2. Authenticate with your Cloudflare Account:
```bash
cloudflared tunnel login
```
*This provides a URL. Open it in your browser and authorize your domain (e.g. `itstck.com`).*

### 3. Create the Tunnel:
```bash
cloudflared tunnel create itstack-prod
```
*Note down the Tunnel ID returned (e.g., `4a5b6c7d-8e9f-0123-4567-89abcdef0123`).*

### 4. Create the Configuration File:
Create `/etc/cloudflared/config.yml`:
```yaml
tunnel: 4a5b6c7d-8e9f-0123-4567-89abcdef0123
credentials-file: /etc/cloudflared/4a5b6c7d-8e9f-0123-4567-89abcdef0123.json

ingress:
  # Main SaaS domain
  - hostname: my.itstck.com
    service: http://localhost:3000
    originRequest:
      connectTimeout: 30s
      httpHostHeader: my.itstck.com

  # Catch-all
  - service: http_status:404
```

Copy the credentials file generated during `tunnel create` to `/etc/cloudflared/`:
```bash
cp ~/.cloudflared/*.json /etc/cloudflared/
```

### 5. Route your DNS in Cloudflare:
```bash
cloudflared tunnel route dns itstack-prod my.itstck.com
```

### 6. Install and Start Cloudflare Tunnel as a System Service:
```bash
cloudflared service install
systemctl daemon-reload
systemctl enable --now cloudflared
systemctl status cloudflared
```

Within seconds, **`https://my.itstck.com`** is live across the globe with automated SSL/TLS certificates and Cloudflare DDoS protection!

---

## 5. Security & Proxmox Backup Best Practices

### 1. Enable UFW Firewall on the LXC
Since Cloudflare connects via outbound tunnel, you can block all inbound traffic except your local LAN subnet:
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow from 192.168.1.0/24 to any port 22 proto tcp
ufw enable
```

### 2. Automated Backups in Proxmox
1. In Proxmox VE, navigate to **Datacenter -> Backup -> Add**.
2. Select your storage (e.g. `local` or external PBS).
3. Select Container ID (`200`).
4. Set Schedule: Daily at `03:00`.
5. Mode: **Snapshot** (Zero downtime).
6. Retention: Keep 7 daily backups.

Your user profiles, customized themes, and static bundles are securely persisted in `/opt/itstack/data/itstck-store.json`.
