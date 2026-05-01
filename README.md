# ClinicPilot

> **Automated patient no-show prevention for Indian clinics.**
> WhatsApp reminders · 1-click rescheduling · real-time analytics

[![CI](https://github.com/YOUR_USERNAME/clinicpilot/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/clinicpilot/actions)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E)](https://supabase.com)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#license)

---

## Overview

ClinicPilot is a multi-tenant SaaS platform that automates appointment
reminders via **WhatsApp** (with SMS fallback) and provides patients a
**1-click reschedule** link — reducing no-shows by up to 40%.

**Key differentiators** from competitors (Practo, Eka.Care):

| Feature               | Practo  | Eka.Care | ClinicPilot |
| --------------------- | ------- | -------- | ----------- |
| Native WhatsApp       | ❌       | ⚠️       | ✅           |
| 1-Click Reschedule    | ❌       | ❌        | ✅           |
| No-Show Analytics     | ❌       | ❌        | ✅           |
| Starting Price        | ₹2,500  | ₹1,416   | **₹749**    |

---

## Tech Stack

| Layer         | Technology                            |
| ------------- | ------------------------------------- |
| Framework     | Next.js 16 (App Router, Turbopack)    |
| Database      | Supabase (PostgreSQL + RLS)           |
| Auth          | Supabase Auth (SSR cookie-based)      |
| UI            | Tailwind CSS 4 + shadcn/ui + Radix    |
| Animations    | Framer Motion                         |
| WhatsApp      | Meta Cloud API (direct, no BSP)       |
| SMS Fallback  | Twilio                                |
| Payments      | Razorpay Subscriptions (UPI AutoPay)  |
| Hosting       | Vercel (Edge)                         |
| CI/CD         | GitHub Actions → Vercel               |
| Scheduling    | pg_cron + Supabase Edge Functions     |

---

## Project Structure

```
clinicpilot/
├── .env.local                        # Environment variables (secrets)
├── .env.example                      # Template for env vars (safe to commit)
├── .github/workflows/ci.yml         # CI/CD pipeline
├── next.config.mjs                   # Next.js config + security headers
├── package.json                      # Dependencies & scripts
│
├── docs/                             # Project documentation
│   ├── ARCHITECTURE.md               # System design & data flow
│   ├── DEPLOYMENT.md                 # Vercel deployment guide
│   └── CONTRIBUTING.md               # Code standards & PR process
│
├── public/                           # Static assets
│   └── favicon.ico
│
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.js                 # Root layout (fonts, metadata, Toaster)
│   │   ├── page.js                   # Landing page (/)
│   │   ├── login/page.js             # Authentication
│   │   ├── register/page.js          # Clinic onboarding
│   │   ├── privacy/page.js           # DPDP Act privacy policy
│   │   ├── error.js                  # App-level error boundary
│   │   ├── global-error.js           # Root error boundary
│   │   │
│   │   ├── dashboard/                # Auth-protected admin area
│   │   │   ├── layout.js             # Sidebar navigation shell
│   │   │   ├── page.js               # Live metrics & today's schedule
│   │   │   ├── patients/page.js      # Patient directory & search
│   │   │   ├── settings/page.js      # Clinic profile, hours, templates
│   │   │   └── error.js              # Dashboard error boundary
│   │   │
│   │   ├── book/[slug]/page.js       # Public patient booking wizard
│   │   ├── reschedule/[token]/page.js # 1-click reschedule (from WhatsApp)
│   │   │
│   │   └── api/                      # Backend API routes
│   │       ├── health/route.js       # Health check (CI/CD probe)
│   │       ├── appointments/route.js # Admin booking (auth-protected)
│   │       ├── public/               # Unauthenticated patient endpoints
│   │       │   ├── book/route.js
│   │       │   └── reschedule/route.js
│   │       ├── whatsapp/send/route.js # Meta Cloud API sender
│   │       ├── payment/
│   │       │   ├── create-subscription/route.js
│   │       │   └── webhook/route.js  # Razorpay webhook (HMAC verified)
│   │       └── webhooks/
│   │           ├── razorpay/route.js
│   │           ├── whatsapp/route.js # Meta webhook (SHA-256 verified)
│   │           └── twilio/route.js
│   │
│   ├── components/ui/                # shadcn/ui primitives
│   │
│   ├── lib/                          # Shared utilities & services
│   │   ├── supabase/
│   │   │   ├── client.js             # Browser client (public, RLS)
│   │   │   ├── server.js             # SSR client (cookie-based, RLS)
│   │   │   └── admin.js              # Service-role client (bypasses RLS)
│   │   ├── csrf.js                   # CSRF origin validation
│   │   ├── env.js                    # Build-time env validation
│   │   ├── logger.js                 # Structured JSON logging
│   │   ├── pii.js                    # PII hashing (DPDP Act)
│   │   ├── plan.js                   # Subscription plan enforcement
│   │   ├── ratelimit.js              # Upstash Redis rate limiters
│   │   ├── retry.js                  # Exponential backoff utility
│   │   ├── tokens.js                 # Secure token generation
│   │   ├── utils.js                  # Tailwind cn() merge
│   │   └── validation.js             # Zod schemas
│   │
│   └── middleware.js                 # Rate limiting + auth guard
│
└── supabase/
    ├── config.toml                   # Supabase local config
    ├── migrations/                   # Ordered SQL migrations
    │   ├── 001_initial_schema.sql
    │   ├── 002_pg_cron.sql
    │   ├── 003_token_expiry.sql
    │   ├── 004_rls_policies.sql
    │   ├── 005_idempotency.sql
    │   ├── 006_pii_handling.sql
    │   ├── 007_soft_deletes.sql
    │   └── 008_performance_indexes.sql
    └── functions/
        └── send-reminders/index.ts   # Edge Function: reminder engine
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- A [Supabase](https://supabase.com) project (free tier)
- A [Vercel](https://vercel.com) account (free tier)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/clinicpilot.git
cd clinicpilot
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Fill in your actual credentials — see .env.example for docs
```

### 3. Initialize Database

Open your Supabase project → **SQL Editor** → paste and run each file
in `supabase/migrations/` in order (001 → 008).

### 4. Run Locally

```bash
npm run dev
# → http://localhost:3000
```

### 5. Deploy

```bash
# Push to GitHub, then import in Vercel.
# See docs/DEPLOYMENT.md for full guide.
```

---

## Scripts

| Command           | Description                           |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start development server (Turbopack)  |
| `npm run build`   | Production build                      |
| `npm run start`   | Start production server               |
| `npm run lint`    | Run ESLint                            |

---

## Security

- **Row-Level Security**: All 8 tables enforce tenant isolation at DB level
- **Webhook Verification**: HMAC-SHA256 for Razorpay, Meta, Twilio
- **CSRF Protection**: Origin/Referer validation on state-changing routes
- **Rate Limiting**: Upstash Redis on booking, auth, and API endpoints
- **Security Headers**: HSTS, X-Frame-Options, nosniff, Referrer-Policy
- **DPDP Act Compliance**: Patient consent tracking, PII hashing

---

## License

Proprietary — © 2026 ClinicPilot Technologies. All rights reserved.
