# Production Secrets Rotation Guide

This document defines standard operating procedures (SOP) for rotating production secrets and API credentials for **Mem Service** with zero customer downtime.

---

## 1. General Principles & Constraints

1. **Zero-Downtime Guarantee**: Never revoke old credentials before new credentials have been deployed and verified across all application instances.
2. **Environment Variable Precedence**: Database-backed integration secrets (configured in the Admin Dashboard Integration Hub) take precedence over static `.env` fallback values.
3. **Canary Verification**: Always run health checks (`GET /api/health/ready`) and automated smoke tests before decomissioning previous keys.
4. **Audit Trail**: Every credential change in the Admin Dashboard is automatically recorded in the `AuditLog` collection with actor, timestamp, and masked diff.

---

## 2. MongoDB Credentials Rotation

### Scenario
Rotating database user credentials on MongoDB Atlas or self-hosted replica set (`rs0`).

### Procedure
1. **Create New MongoDB User**:
   - In MongoDB Atlas (or via mongo shell): Create user `memservice_app_v2` with `readWrite` access to `memservice` database.
   - Generate a cryptographically secure 32+ character password.
2. **Verify Connectivity in Staging**:
   - Test connecting with `mongosh "mongodb+srv://memservice_app_v2:<PASSWORD>@cluster.mongodb.net/memservice_test"`.
3. **Deploy Updated Connection String**:
   - Update production environment secret `MONGODB_CONNECTION_STRING` / `MONGO_URI`.
   - Trigger a rolling deployment of `apps/api`.
4. **Verify Readiness**:
   - Call `GET https://api.memservicebd.com/api/health/ready`.
   - Confirm `{ "status": "ready", "database": { "connected": true, "ping": "ok", "replicaSet": { "ok": true } } }`.
5. **Decommission Old User**:
   - Monitor database connections for 15 minutes.
   - Once connections to the old user drop to 0, delete the old database user.

---

## 3. bKash Gateway Credentials Rotation

### Scenario
Rotating `BKASH_APP_KEY`, `BKASH_APP_SECRET`, `BKASH_USERNAME`, `BKASH_PASSWORD`.

### Procedure
1. **Generate New Credentials**:
   - Log into the bKash Merchant Portal / Developer Dashboard.
   - Generate a secondary app secret / credential set for the tokenized checkout API.
2. **Update Integration Hub in Admin Dashboard**:
   - Navigate to `/dashboard/integrations` (requires `super-admin` role).
   - Enter new `App Key`, `App Secret`, `Username`, and `Password`.
   - Click **Test Connection** to execute a sandbox/live token grant (`/tokenized/checkout/token/grant`).
3. **Save & Commit Changes**:
   - Click **Save Integration**. The secret is automatically encrypted at rest using AES-256-GCM.
4. **Verify Live Payment Flow**:
   - Create a test order and verify callback webhook signature.
5. **Revoke Old Key**:
   - Revoke previous credentials in the bKash Merchant Portal.

---

## 4. Cloudinary Media Storage Rotation

### Scenario
Rotating `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`.

### Procedure
1. **Create Secondary Key**:
   - Cloudinary Console -> Settings -> Security -> Access Keys.
   - Generate a new secondary Access Key pair.
2. **Deploy Configuration**:
   - Update `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in environment variables.
   - Trigger rolling deployment of `apps/api` and `apps/admin`.
3. **Verification**:
   - In Admin Dashboard, upload a product image or banner.
   - Confirm image serves properly from `res.cloudinary.com`.
4. **Revoke Previous Key**:
   - In Cloudinary Console, disable and delete the old Access Key.

---

## 5. Resend Transactional Email Rotation

### Scenario
Rotating `RESEND_API_KEY`.

### Procedure
1. **Generate New API Key**:
   - Resend Dashboard -> API Keys -> Create API Key with `Sending access` (or full access for the verified domain).
2. **Update Environment**:
   - Set `RESEND_API_KEY` in production environment configuration.
3. **Test Email Dispatch**:
   - Run a test trigger (e.g. newsletter subscribe or order confirmation).
   - Check Resend delivery logs for 200 OK delivery.
4. **Delete Old Key**:
   - In Resend dashboard, delete the deprecated API key.

---

## 6. `SETTINGS_ENCRYPTION_KEY` Rotation (Zero-Downtime Dual-Key Migration)

### Scenario
Rotating the master AES-256-GCM encryption key used to protect integration secrets stored in MongoDB.

### Architecture
The encryption utility (`apps/api/lib/secrets.js`) supports dual-key decryption:
- Primary key: `SETTINGS_ENCRYPTION_KEY`
- Fallback key: `SETTINGS_ENCRYPTION_KEY_FALLBACK` (used if primary key fails)

### Step-by-Step Migration:
1. **Generate New 32-Byte Hex Key**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. **Configure Dual Keys in Environment**:
   - Set `SETTINGS_ENCRYPTION_KEY` = `<NEW_KEY>`
   - Set `SETTINGS_ENCRYPTION_KEY_FALLBACK` = `<OLD_KEY>`
3. **Deploy Applications**:
   - Deploy `apps/api` with both keys configured.
4. **Run Re-encryption Script**:
   - Run the migration script to re-encrypt all stored integration documents:
     ```bash
     pnpm db:re-encrypt-secrets
     ```
   - The script reads each integration, decrypts using fallback key, re-encrypts using primary key, and saves.
5. **Verify**:
   - Test `GET /api/integrations` in Admin Dashboard. Ensure all credentials decrypt cleanly.
6. **Retire Fallback Key**:
   - Remove `SETTINGS_ENCRYPTION_KEY_FALLBACK` from environment and redeploy.

---

## 7. Emergency Revocation Checklist

If any secret is accidentally leaked:
1. **Immediate Revocation**: Revoke the leaked secret immediately in the provider dashboard.
2. **Rotate Dependent Keys**: Rotate `AUTH_SECRET` to invalidate all active staff sessions (`StaffSession.updateMany({}, { revokedAt: new Date() })`).
3. **Audit Log Inspection**: Inspect MongoDB `auditlogs` collection for any unauthorized admin changes during the exposure window:
   ```bash
   mongosh "mongodb://localhost:27017/memservice" --eval "db.auditlogs.find().sort({ createdAt: -1 }).limit(20)"
   ```
4. **Notify Team**: File security incident report and document lessons learned.
