# 🏥 ClinicPilot: The No-Show Killer for Modern Clinics

[![Production Status](https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge)](https://clinicpilot.in)
[![Next.js 16](https://img.shields.io/badge/Framework-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![WhatsApp Automation](https://img.shields.io/badge/Automation-WhatsApp-25D366?style=for-the-badge&logo=whatsapp)](https://developers.facebook.com/docs/whatsapp/cloud-api)

### **Stop Losing Revenue to Empty Chairs.**
ClinicPilot is a premium, full-stack patient engagement platform designed to eliminate no-shows using native WhatsApp automation, seamless 1-click rescheduling, and actionable intelligence. Built for the high-velocity Indian healthcare market.

---

## 🚀 The Value Proposition

| Feature | The Status Quo (Practo/Eka) | **ClinicPilot Advantage** |
| :--- | :--- | :--- |
| **Engagement** | Ignored SMS reminders | **98% Open-rate WhatsApp automation** |
| **Rescheduling** | Manual calls/Reception friction | **Frictionless 1-click patient self-service** |
| **Analytics** | Static lists of names | **Real-time "Revenue Saved" tracking** |
| **Cost** | ₹1,500 - ₹2,500 / month | **Starting at ₹749 / month** |

---

## ✨ Core Features

### 📱 Native WhatsApp Automation
Direct integration with the **Meta Cloud API**. Automatically send booking confirmations, 24-hour reminders, and 2-hour "last call" messages. No third-party BSP markups.

### 📅 Dynamic Slot Engine
A sophisticated availability calculator that respects doctor working hours, existing appointments, and consultation buffers across multiple practitioners.

### 🔄 1-Click Reschedule Engine
Patients receive a secure, unique link to move their appointment without calling the clinic. Our system handles the slot conflict validation in real-time.

### 📊 Precision Dashboard
Track today's schedule, monitor WhatsApp delivery statuses, and see exactly how much revenue was recovered from prevented no-shows.

---

## 🛡️ Production Hardening (Audit Resolved)
*Current Status: **Stable & Secure*** | *Commit Hash: `32dd306`*

Following a comprehensive 31-point security and architectural audit, ClinicPilot is now fully hardened for production:
- **🔒 PII Compliance (DPDP Act 2023):** Mandatory phone hashing (HMAC-SHA256) for all audit logs using `PII_SALT`.
- **🛡️ State-of-the-art Security:** Strict CSRF validation, Row-Level Security (RLS) on all tables, and Upstash Redis rate limiting.
- **⚡ Performance Optimized:** Next.js 16 App Router with partial unique indexes for booking idempotency.
- **🔗 Secure Tokens:** Cryptographically secure 48-hour expiring reschedule tokens with one-time-use invalidation.

---

## 🛠️ Technical Architecture

### **The Stack**
- **Core:** Next.js 16 (App Router + Turbopack)
- **Database:** Supabase (Postgres + pg_cron)
- **Real-time:** Supabase Edge Functions (Deno Runtime)
- **Styling:** Tailwind CSS 4 + shadcn/ui + Framer Motion
- **Payments:** Razorpay (UPI AutoPay + Webhooks)
- **Cache/RL:** Upstash Redis

### **Directory Structure**
```text
src/
├── app/                  # Next.js Pages & API (Public/Admin separation)
├── components/           # High-conversion UI components
├── lib/                  # Hardened services (Auth, Plan, PII, CSRF)
└── middleware.js         # Security & Rate-limiting gatekeeper
supabase/
├── migrations/           # Versioned schema & security policies
└── functions/            # Serverless reminder engine
```

---

## 🏁 Getting Started

### **1. Prerequisites**
- Node.js ≥ 20
- Supabase Project (Postgres + Auth enabled)
- Meta WhatsApp Business Account

### **2. Installation**
```bash
git clone https://github.com/Inayat-0007/clinicpilot.git
cd clinicpilot
npm install
```

### **3. Environment Setup**
Copy `.env.example` to `.env.local` and configure:
- `PII_SALT`: Unique salt for phone hashing.
- `WHATSAPP_ACCESS_TOKEN`: Meta Cloud API token.
- `RAZORPAY_WEBHOOK_SECRET`: For subscription verification.

### **4. Database Initialization**
Apply the migrations in `supabase/migrations/` sequentially to set up the RLS policies and pg_cron jobs.

---

## 📜 Compliance & Security
ClinicPilot is built with a **Security-First** mindset:
- **Tenant Isolation:** RLS ensures no clinic can ever access another's data.
- **Audit Trails:** All sensitive actions are logged with hashed PII for compliance.
- **Webhook Integrity:** All incoming webhooks (Razorpay/Meta) are verified with SHA-256 HMAC signatures.

---

## 📄 License
Proprietary — © 2026 ClinicPilot Technologies. All rights reserved.

> **Interested in a Demo?** Contact [Inayat](mailto:support@clinicpilot.in) for a walkthrough of the most efficient clinic engine in India.
