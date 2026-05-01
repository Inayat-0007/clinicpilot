# Deployment Guide

> Step-by-step instructions to deploy ClinicPilot to production.

---

## Prerequisites

- A GitHub account
- A [Vercel](https://vercel.com) account (free tier)
- A [Supabase](https://supabase.com) project (free tier)
- All API credentials ready (see `.env.example`)

---

## Step 1: Initialize Database

1. Open your Supabase project → **SQL Editor**
2. Paste and run each migration file in order:
   ```
   supabase/migrations/20260501000000_initial_schema.sql
   supabase/migrations/20260501041041_setup_pg_cron.sql
   supabase/migrations/20260502000000_token_expiry.sql
   supabase/migrations/20260502000001_rls_policies.sql
   supabase/migrations/20260502000002_idempotency_index.sql
   supabase/migrations/20260502000003_pii_handling.sql
   supabase/migrations/20260502000004_soft_deletes.sql
   supabase/migrations/20260502000005_performance_indexes.sql
   ```
3. Copy your **Project URL** and **anon key** from Settings → API.

## Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial ClinicPilot release"
git remote add origin https://github.com/YOUR_USERNAME/clinicpilot.git
git push -u origin main
```

## Step 3: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import** → Select your `clinicpilot` repository
3. Framework: **Next.js** (auto-detected)
4. Add all environment variables from `.env.local`
5. Click **Deploy**

## Step 4: Configure Webhooks

After deployment, configure callback URLs in each service:

| Service   | Webhook URL                                          |
| --------- | ---------------------------------------------------- |
| Razorpay  | `https://your-app.vercel.app/api/webhooks/razorpay`  |
| Meta      | `https://your-app.vercel.app/api/webhooks/whatsapp`  |
| Twilio    | `https://your-app.vercel.app/api/webhooks/twilio`    |

## Step 5: Verify

```bash
curl https://your-app.vercel.app/api/health
# Expected: {"status":"ok","checks":{"db":true},"ts":"..."}
```

---

## CI/CD (Automatic)

The GitHub Actions pipeline (`.github/workflows/ci.yml`) will:
1. Run `npm run lint` on every push
2. Run `npm run build` to verify compilation
3. Auto-deploy to Vercel on `main` branch pushes
