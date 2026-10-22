# Production Go-Live & VPS Deployment Checklist

This document provides a comprehensive operational guide for deploying **Mem Service** to a production VPS (Ubuntu 22.04/24.04 LTS), configuring domains and SSL certificates, setting up production Docker services, and onboarding live merchant credentials.

---

## 1. System Architecture Overview

The Mem Service production architecture runs as a unified monorepo on a Linux VPS:
- **Storefront Web App** (`apps/web`): Port `3000` (Next.js 15.1, React 19) -> `memservicebd.com` / `www.memservicebd.com`
- **REST & GraphQL API** (`apps/api`): Port `3001` (Next.js 15.1 API Engine) -> `api.memservicebd.com`
- **Admin Management Portal** (`apps/admin`): Port `3002` (Next.js 14.2) -> `admin.memservicebd.com`
- **Database**: Port `27017` (MongoDB 7.0 Single-Node Replica Set `rs0` for multi-document ACID transactions)
- **Reverse Proxy**: Nginx 1.24+ with TLS 1.3, HTTP/2, Let's Encrypt SSL, and gzip compression

```
                  Internet (Cloudflare / Users)
                               │
               ┌───────────────┼───────────────┐
               ▼               ▼               ▼
        memservicebd.com  api.memservicebd.com  admin.memservicebd.com
               │               │               │
        ┌──────┴───────────────┴───────────────┴──────┐
        │        Nginx Reverse Proxy (:80 / :443)    │
        └──────┬───────────────┬───────────────┬──────┘
               ▼               ▼               ▼
          Web (:3000)     API (:3001)    Admin (:3002)
               │               │               │
               └───────────────┼───────────────┘
                               ▼
                    MongoDB Replica Set (:27017)
```

---

## 2. Production Environment Configuration (`.env.production`)

Create `/opt/memservice/.env` with strict permissions (`chmod 600 /opt/memservice/.env`):

```env
# =============================================================
# Mem Service Production Environment Configuration
# =============================================================

# ---- App URLs & Domains ----
NEXT_PUBLIC_URL=https://memservicebd.com
NEXT_PUBLIC_APP_URL_FRONTEND=https://memservicebd.com
NEXT_PUBLIC_ADMIN_URL=https://admin.memservicebd.com
API_URL=https://api.memservicebd.com
NEXT_PUBLIC_API_URL=https://api.memservicebd.com
NEXT_PUBLIC_APP_URL_DEV=https://api.memservicebd.com
NEXT_PUBLIC_APP_URL_PRODUCTION=https://api.memservicebd.com

# ---- Database (MongoDB Replica Set) ----
MONGODB_CONNECTION_STRING=mongodb://memservice_admin:STRONG_DB_PASS@127.0.0.1:27017/memservice?replicaSet=rs0&authSource=admin&directConnection=true
MONGO_URI=mongodb://memservice_admin:STRONG_DB_PASS@127.0.0.1:27017/memservice?replicaSet=rs0&authSource=admin&directConnection=true
ENVIRONMENT=production
NODE_ENV=production

# ---- Security & Cross-Domain Cookies ----
# Comma-separated list of browser origins permitted to exchange credentials
CORS_ALLOWED_ORIGINS=https://memservicebd.com,https://www.memservicebd.com,https://admin.memservicebd.com
# Parent cookie domain so admin and api share session credentials securely
COOKIE_DOMAIN=.memservicebd.com
# Master 32-byte hex key for encrypting provider credentials at rest
SETTINGS_ENCRYPTION_KEY=GENERATE_64_CHAR_HEX_KEY_HERE
# Optional fallback key during zero-downtime key rotation
SETTINGS_ENCRYPTION_KEY_FALLBACK=

# ---- Auth Secret (JWT Signing) ----
AUTH_SECRET=GENERATE_STRONG_RANDOM_AUTH_SECRET_HERE
AUTH_TRUST_HOST=true
AUTH_GOOGLE_ID=YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=YOUR_GOOGLE_OAUTH_CLIENT_SECRET

# ---- Cloudinary (Media Assets) ----
CLOUDINARY_CLOUD_NAME=memservice-prod
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_SECRET

# ---- Transactional Email (Resend) ----
RESEND_API_KEY=re_YOUR_LIVE_RESEND_KEY
EMAIL_FROM="Mem Service BD <orders@memservicebd.com>"
EMAIL_REPLY_TO=support@memservicebd.com
EMAIL_ADMIN_TO=management@memservicebd.com

# ---- Error Tracking (Sentry - Optional) ----
SENTRY_DSN=https://your-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

---

## 3. Production Docker Compose Configuration

Create `/opt/memservice/docker-compose.prod.yml`:

```yaml
version: "3.8"

services:
  mongo:
    image: mongo:7.0
    container_name: memservice-mongo
    restart: always
    command: ["--replSet", "rs0", "--bind_ip_all"]
    ports:
      - "127.0.0.1:27017:27017"
    volumes:
      - /opt/memservice/data/mongo:/data/db
    healthcheck:
      test:
        - CMD
        - mongosh
        - --quiet
        - --eval
        - "try { rs.status().myState === 1 ? quit(0) : quit(1) } catch (e) { rs.initiate({_id:'rs0',members:[{_id:0,host:'127.0.0.1:27017'}]}); quit(1) }"
      interval: 10s
      timeout: 10s
      retries: 15
      start_period: 15s

  # Application processes managed via PM2 or Systemd natively on host
```

---

## 4. Host PM2 Process Management

Install PM2 globally on the host to manage the Next.js processes:

```bash
npm install -g pm2
```

Create `/opt/memservice/ecosystem.config.cjs`:

```javascript
module.exports = {
  apps: [
    {
      name: "memservice-api",
      cwd: "/opt/memservice/apps/api",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
    {
      name: "memservice-web",
      cwd: "/opt/memservice/apps/web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "memservice-admin",
      cwd: "/opt/memservice/apps/admin",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3002",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3002,
      },
    },
  ],
};
```

---

## 5. Nginx Reverse Proxy & SSL Configuration

Create `/etc/nginx/sites-available/memservice.conf`:

```nginx
# -------------------------------------------------------------
# Upstream clusters
# -------------------------------------------------------------
upstream web_upstream {
    server 127.0.0.1:3000;
    keepalive 64;
}

upstream api_upstream {
    server 127.0.0.1:3001;
    keepalive 64;
}

upstream admin_upstream {
    server 127.0.0.1:3002;
    keepalive 32;
}

# -------------------------------------------------------------
# 1. Storefront Web App: memservicebd.com
# -------------------------------------------------------------
server {
    listen 80;
    listen [::]:80;
    server_name memservicebd.com www.memservicebd.com;
    return 301 https://memservicebd.com$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.memservicebd.com;
    ssl_certificate /etc/letsencrypt/live/memservicebd.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/memservicebd.com/privkey.pem;
    return 301 https://memservicebd.com$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name memservicebd.com;

    ssl_certificate /etc/letsencrypt/live/memservicebd.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/memservicebd.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 20M;

    location / {
        proxy_pass http://web_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# -------------------------------------------------------------
# 2. REST API: api.memservicebd.com
# -------------------------------------------------------------
server {
    listen 80;
    listen [::]:80;
    server_name api.memservicebd.com;
    return 301 https://api.memservicebd.com$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.memservicebd.com;

    ssl_certificate /etc/letsencrypt/live/memservicebd.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/memservicebd.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 30M;

    location / {
        proxy_pass http://api_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# -------------------------------------------------------------
# 3. Admin Management Portal: admin.memservicebd.com
# -------------------------------------------------------------
server {
    listen 80;
    listen [::]:80;
    server_name admin.memservicebd.com;
    return 301 https://admin.memservicebd.com$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.memservicebd.com;

    ssl_certificate /etc/letsencrypt/live/memservicebd.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/memservicebd.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 30M;

    location / {
        proxy_pass http://admin_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable configuration and generate SSL:

```bash
sudo ln -s /etc/nginx/sites-available/memservice.conf /etc/nginx/sites-enabled/
sudo certbot --nginx -d memservicebd.com -d www.memservicebd.com -d api.memservicebd.com -d admin.memservicebd.com
sudo nginx -t && sudo systemctl reload nginx
```

---

## 6. Merchant Provider Onboarding Guide (Sandbox to Live)

All third-party credentials can be configured directly in the **Admin Dashboard Integration Hub** (`/dashboard/integrations`), which encrypts credentials with AES-256-GCM.

### 6.1 bKash Payment Gateway
1. **Merchant Portal**: Log into https://merchant.bkash.com.
2. **Collect Credentials**: App Key, App Secret, Username, Password.
3. **Admin Dashboard**: Go to `/dashboard/integrations` -> bKash.
4. **Configuration**:
   - `Base URL`: `https://tokenized.pay.bka.sh/v1.2.0-beta` (Production)
   - Fill in App Key, App Secret, Username, Password.
5. **Test Connection**: Click **Test Connection**. A live token grant is executed.
6. **Activate**: Toggle status to **Enabled** and save.

### 6.2 Nagad Payment Gateway
1. **Merchant Portal**: Access Nagad Merchant Portal.
2. **Collect Credentials**: Merchant ID, Merchant Public Key, Merchant Private Key (PGP).
3. **Admin Dashboard**: Go to `/dashboard/integrations` -> Nagad.
4. **Configuration**:
   - `Base URL`: `https://api.mynagad.com/api/dfs` (Production)
   - Fill Merchant ID and Private Key.
5. **Test Connection**: Click **Test Connection** to verify signature generation.
6. **Activate**: Save integration.

### 6.3 SSLCommerz
1. **Merchant Portal**: Log into https://merchant.sslcommerz.com.
2. **Collect Credentials**: Store ID, Store Password.
3. **Admin Dashboard**: Go to `/dashboard/integrations` -> SSLCommerz.
4. **Configuration**:
   - Toggle `Sandbox Mode` to **OFF**.
   - Fill Store ID and Store Password.
5. **Activate**: Save integration.

### 6.4 Courier Delivery (Pathao / Steadfast)
1. **Pathao Merchant Portal**: https://merchant.pathao.com -> Developer API.
2. **Collect Credentials**: Client ID, Client Secret, Username, Password, Store ID.
3. **Steadfast Merchant Portal**: https://steadfast.com.bd -> API Keys (`Api-Key`, `Secret-Key`).
4. **Admin Dashboard**: Go to `/dashboard/integrations` -> Couriers.
5. **Test & Save**: Run live quote test, save integration.

### 6.5 Resend (Transactional Email)
1. **Resend Dashboard**: https://resend.com/domains -> Add `memservicebd.com`.
2. **DNS Setup**: Add MX, TXT (SPF), and CNAME (DKIM) records in domain DNS registrar.
3. **Verify Domain**: Once verified in Resend, generate production API key (`re_...`).
4. **Server Environment**: Set `RESEND_API_KEY` in `/opt/memservice/.env`.

---

## 7. Automated Backups & System Maintenance

Add root crontab entry for automated daily backups and log rotation:

```bash
# Daily database backup at 3:00 AM UTC with retention
0 3 * * * cd /opt/memservice && pnpm db:backup >> /var/log/memservice-backup.log 2>&1
# Prune backups older than 30 days
0 4 * * * find /opt/memservice/backups -name "*.gz" -mtime +30 -delete
```

Health monitoring ping:
```bash
curl -f https://api.memservicebd.com/api/health/ready || echo "API UNHEALTHY" | mail -s "Alert: MemService Down" sysadmin@memservicebd.com
```
