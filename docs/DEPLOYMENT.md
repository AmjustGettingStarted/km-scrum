# Production Deployment & Infrastructure Runbook

This guide details the step-by-step procedure for deploying **`km-scrum`** to production using **Vercel**, **Neon PostgreSQL**, and **Cloudflare R2**.

---

## 1. Prerequisites & Required Accounts
- **Vercel**: Next.js deployment platform.
- **Neon**: Serverless PostgreSQL database.
- **Cloudflare**: R2 Object Storage for private file uploads.

---

## 2. Infrastructure Setup

### 2.1 Neon PostgreSQL Setup
1. Log in to [Neon Console](https://console.neon.tech).
2. Create a new project: `km-scrum-prod`.
3. In Project Settings, ensure connection pooling is enabled.
4. Copy the connection string (with pooled endpoint):
   ```
   DATABASE_URL="postgresql://neondb_owner:[PASSWORD]@[POOLED_ENDPOINT].neon.tech/neondb?sslmode=require"
   ```
5. Apply database schema migrations:
   ```bash
   npx prisma migrate deploy
   ```
6. Seed the initial Manager account:
   ```bash
   npx ts-node prisma/seed.ts
   ```
   *(Initial credentials: `admin` / `Admin@123456`. You will be forced to set a new password on first login).*

---

### 2.2 Cloudflare R2 Configuration
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Navigate to **R2** &gt; **Create Bucket**.
3. Bucket name: `km-scrum-attachments`.
4. Ensure public access is **disabled** (Bucket must be private).
5. Configure **CORS Policy** to allow direct browser `PUT` uploads:
   ```json
   [
     {
       "AllowedOrigins": [
         "https://your-production-app.vercel.app",
         "http://localhost:3000"
       ],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
6. Generate API Tokens:
   - Go to **Manage R2 API Tokens** &gt; **Create API Token**.
   - Permissions: **Object Read & Write**.
   - Note down:
     - `R2_ACCOUNT_ID`
     - `R2_ACCESS_KEY_ID`
     - `R2_SECRET_ACCESS_KEY`
     - `R2_BUCKET_NAME`

---

## 3. Vercel Deployment

### 3.1 Project Import & Build Settings
1. Push repository to GitHub or GitLab.
2. In Vercel, click **Add New...** &gt; **Project** and import the repository.
3. Framework Preset: **Next.js**.
4. Build Command: `next build`.
5. Install Command: `npm install`.

### 3.2 Environment Variables in Vercel
Configure the following in **Settings &gt; Environment Variables**:

| Variable Name | Description | Example |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL pooled URL | `postgresql://...neon.tech/neondb?sslmode=require` |
| `SESSION_SECRET` | 32+ char high-entropy secret | `openssl rand -base64 32` output |
| `R2_ACCOUNT_ID` | Cloudflare Account ID | `a1b2c3d4e5f6...` |
| `R2_ACCESS_KEY_ID` | R2 Access Key | `2c8f...` |
| `R2_SECRET_ACCESS_KEY` | R2 Secret Key | `9a1e...` |
| `R2_BUCKET_NAME` | Bucket name | `km-scrum-attachments` |
| `NEXT_PUBLIC_APP_URL` | Production URL | `https://km-scrum.vercel.app` |

---

## 4. Post-Deployment Verification Checklist

1. [ ] **Health Endpoint Check**:
   - `GET https://your-app.vercel.app/api/health` returns `{ "status": "ok", "database": "connected" }`.
2. [ ] **Initial Login & Password Change**:
   - Navigate to `/login`.
   - Log in with `admin` and default temporary password.
   - Verify forceful redirect to `/change-password`.
   - Update password and confirm session persists to `/dashboard`.
3. [ ] **Manager User Creation**:
   - Navigate to `/manager/users`.
   - Create a test `SCRUM_MASTER` and `DEVELOPER` user.
4. [ ] **Task CRUD & Drag-and-Drop Verification**:
   - As Scrum Master, create a task assigned to Developer.
   - Move task from `To Do` to `In Progress`; verify mandatory explanation dialog displays and requires input before saving.
5. [ ] **Cloudflare R2 Direct Upload Check**:
   - Open task detail view `/tasks/[id]`.
   - Upload a test screenshot or APK build; verify progress bar reaches 100% and file appears in attachment list.
   - Click "Download" to verify signed 5-minute redirect works.
6. [ ] **Audit Trail Inspection**:
   - Navigate to `/activity-logs`.
   - Verify that all status changes, task creation, and file uploads generated immutable log entries with timestamps, actors, and reasons.
