# IT Stack — Developer Portfolio Platform

> Deploy a stunning developer portfolio at `my.itstck.com/username` in minutes.

Built with **Next.js 15**, **Auth.js v5**, **Prisma 5 + PostgreSQL**, **Tailwind CSS**, and a beautiful markdown editor with 8 themes.

---

## ✨ Features

- 🔐 **OAuth login** — GitHub, Google, Microsoft
- 📝 **Markdown editor** — @uiw/react-md-editor with live preview
- 🎨 **8 themes** — Light, Dark, Ocean, Terminal, Minimal, Glass, Sunset, Forest
- 🖋️ **5 fonts** — Inter, Poppins, Lora, JetBrains Mono, Fira Code
- 🎯 **13 section types** — Experience, Skills, Projects, Education, and more
- 🔀 **Drag-and-drop** sections with @dnd-kit
- ⚡ **ISR** — profiles rebuild automatically every 60s
- 🌐 **SEO** — OG tags, JSON-LD, canonical URLs
- 🐳 **Docker** — one-command deployment

---

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone https://github.com/yourname/itstck.git
cd itstck
npm install
```

### 2. Fix dynamic route folders

> ⚠️ Git cannot store folder names with brackets. Run this after cloning:

```bash
bash scripts/setup-auth-route.sh
mv src/app/api/sections/id src/app/api/sections/[id]
mv src/app/[username] src/app/[username]   # already correct if cloned normally
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#environment-variables) below).

### 4. Set up the database

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Run development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AUTH_SECRET` | Random 32+ char secret — `openssl rand -base64 32` | ✅ |
| `AUTH_GITHUB_ID` | GitHub OAuth App Client ID | ✅ |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App Client Secret | ✅ |
| `AUTH_GOOGLE_ID` | Google OAuth 2.0 Client ID | ✅ |
| `AUTH_GOOGLE_SECRET` | Google OAuth 2.0 Client Secret | ✅ |
| `AUTH_MICROSOFT_ENTRA_ID` | Microsoft Entra App Client ID | optional |
| `AUTH_MICROSOFT_ENTRA_SECRET` | Microsoft Entra App Secret | optional |
| `AUTH_MICROSOFT_ENTRA_TENANT_ID` | Microsoft Tenant ID | optional |
| `DATABASE_URL` | PostgreSQL connection string (pooled) | ✅ |
| `DIRECT_URL` | PostgreSQL direct connection (for migrations) | ✅ |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | ✅ |
| `R2_ACCOUNT_ID` | Cloudflare R2 Account ID | optional |
| `R2_BUCKET_NAME` | R2 Bucket name | optional |
| `R2_ACCESS_KEY_ID` | R2 API Token | optional |
| `R2_SECRET_ACCESS_KEY` | R2 API Secret | optional |
| `R2_PUBLIC_URL` | R2 public bucket URL | optional |
| `RESEND_API_KEY` | Resend API key (for email) | optional |

---

## 🔧 OAuth Setup

### GitHub

1. Go to [GitHub → Settings → Developer Settings → OAuth Apps](https://github.com/settings/applications/new)
2. Set **Authorization callback URL**: `https://my.itstck.com/api/auth/callback/github`

### Google

1. Go to [Google Cloud Console → APIs → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create **OAuth 2.0 Client ID** → Web application
3. Add **Authorized redirect URI**: `https://my.itstck.com/api/auth/callback/google`

### Microsoft Entra

1. Go to [Azure Portal → App registrations](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps)
2. Add redirect URI: `https://my.itstck.com/api/auth/callback/microsoft-entra-id`

---

## 🐳 Docker Deployment

### Prerequisites

- Docker & Docker Compose
- SSL certificate (Let's Encrypt recommended)
- Domain pointing to your server

### Deploy

```bash
# 1. Set up SSL certificates
mkdir -p ssl
# Copy fullchain.pem and privkey.pem into ./ssl/

# 2. Configure environment
cp .env.example .env
# Edit .env with production values

# 3. Build and start
docker-compose up -d --build

# 4. Run migrations
docker-compose exec app npx prisma migrate deploy

# 5. Seed database (optional)
docker-compose exec app npx prisma db seed
```

### SSL with Let's Encrypt

```bash
apt install certbot
certbot certonly --standalone -d my.itstck.com
cp /etc/letsencrypt/live/my.itstck.com/fullchain.pem ./ssl/
cp /etc/letsencrypt/live/my.itstck.com/privkey.pem ./ssl/
```

### Auto-renew SSL

```bash
# Add to crontab
0 12 * * * certbot renew --quiet && cp /etc/letsencrypt/live/my.itstck.com/*.pem /path/to/itstck/ssl/ && docker-compose exec nginx nginx -s reload
```

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, onboarding
│   ├── (dashboard)/         # Editor, dashboard, settings
│   ├── [username]/          # Public profile pages (ISR)
│   ├── explore/             # Browse profiles
│   └── api/                 # API routes
│       ├── auth/[...nextauth]/
│       ├── profile/
│       ├── sections/
│       │   └── [id]/
│       ├── username/
│       ├── users/
│       ├── onboarding/complete/
│       └── upload/
├── components/
│   ├── editor/              # EditorLayout, SectionManager, MarkdownEditor, ThemeSelector
│   ├── profile/             # ProfilePage, ProfileHeader, ProfileSection
│   ├── layout/              # Navbar, Footer
│   └── ui/                  # Primitive components
├── hooks/
│   └── use-toast.ts
├── lib/
│   ├── auth.ts              # NextAuth config
│   ├── db.ts                # Prisma singleton
│   ├── themes.ts            # Theme & font configs
│   ├── utils.ts             # Helpers
│   └── validations.ts       # Zod schemas
└── types/
    └── index.ts
```

---

## 📦 Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Auth | Auth.js v5 (NextAuth) |
| Database | PostgreSQL via Prisma 5 |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Editor | @uiw/react-md-editor |
| Markdown | react-markdown + remark-gfm |
| DnD | @dnd-kit |
| Images | Next/Image + sharp |
| Storage | Cloudflare R2 (optional) |
| Email | Resend (optional) |
| Deployment | Docker + Nginx |

---

## 🛠️ Development

```bash
# Start dev server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Prisma Studio (DB GUI)
npx prisma studio

# Reset database
npx prisma migrate reset
```

---

## 📄 License

MIT — use it, modify it, ship it.
