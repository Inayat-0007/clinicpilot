# 🏥 ClinicPilot: The No-Show Killer for Modern Clinics

[![Production Status](https://img.shields.io/badge/Status-Production--Live-success?style=for-the-badge)](https://clinicpilot-psi.vercel.app)
[![CI/CD Status](https://img.shields.io/badge/CI%2FCD-Passing-brightgreen?style=for-the-badge&logo=githubactions)](https://github.com/Inayat-0007/clinicpilot/actions)
[![Next.js 16](https://img.shields.io/badge/Framework-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployment-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

### **Stop Losing Revenue to Empty Chairs.**
ClinicPilot is a premium, full-stack patient engagement platform designed to eliminate no-shows using native WhatsApp automation, seamless 1-click rescheduling, and actionable intelligence. Built for the high-velocity Indian healthcare market.

**Live Deployment:** [clinicpilot-psi.vercel.app](https://clinicpilot-psi.vercel.app)

---

## 🚀 The Value Proposition

| Feature | The Status Quo | **ClinicPilot Advantage** |
| :--- | :--- | :--- |
| **Engagement** | Ignored SMS reminders | **98% Open-rate WhatsApp automation** |
| **Rescheduling** | Manual calls & Reception friction | **Frictionless 1-click patient self-service** |
| **Analytics** | Static lists of names | **Real-time "Revenue Saved" tracking via Recharts** |
| **Infrastructure** | Manual updates, downtime | **Automated CI/CD with Zero-Downtime Deploys** |

---

## ✨ Core Features (100% Code Complete)

### 📱 Native WhatsApp Automation Engine
Direct integration with the **Meta Cloud API**. Automatically sends booking confirmations, 24-hour reminders, and 2-hour "last call" messages. Powered by Supabase Edge Functions and scheduled via PostgreSQL `pg_cron`.

### 📅 Dynamic Slot Engine & Idempotency
A sophisticated availability calculator that respects doctor working hours, existing appointments, and consultation buffers. Protected by strict **PostgreSQL Unique Indexes** to guarantee booking idempotency (zero double-bookings).

### 🔄 1-Click Reschedule Engine
Patients receive a secure, cryptographically hashed unique link to move their appointment without calling the clinic. The system validates slot conflicts in real-time.

### 📊 Precision Analytics Dashboard
Interactive visualizations built with **Recharts**. Track today's schedule, monitor WhatsApp delivery statuses, and see exact revenue metrics based on prevented no-shows.

### ⚙️ Complete Clinic Management
Manage subscriptions (Razorpay integration), customize clinic branding (Logo & Colors), invite staff members with specific Role-Based Access Control (RBAC), and toggle communication channels (SMS/WhatsApp).

---

## 🛡️ Production Hardening & CI/CD Pipeline

ClinicPilot employs a rigorous, enterprise-grade deployment pipeline ensuring zero regressions in production.

### **Automated GitHub Actions CI/CD**
Every push to the `main` branch triggers our automated quality gates:
1. **Quality Gate:** Strict TypeScript compilation (`tsc --noEmit`), ESLint validation, and highly critical npm vulnerability audits.
2. **Secret Scanning:** Deep repository scans using TruffleHog to ensure zero credential leaks.
3. **Database Migrations:** Automated execution of Supabase CLI linked deployments (`supabase db push --include-all`) applying idempotent schema updates to the production database via the Management API.
4. **Vercel Edge Deployment:** Automatic building, optimization, and zero-downtime deployment handled natively by Vercel's GitHub integration.

### **Security Architecture**
- **PII Compliance (DPDP Act 2023):** Mandatory phone hashing (HMAC-SHA256) for audit logs using `PII_SALT`.
- **Tenant Isolation:** Strict PostgreSQL Row-Level Security (RLS) ensures clinics can only query their own patient data.
- **RPC Grants:** Secured backend database functions accessible only to authenticated clinic roles.

---

## 🛠️ Technical Stack

- **Frontend Core:** Next.js 16 (App Router + Turbopack)
- **UI Architecture:** Tailwind CSS 4 + shadcn/ui + Framer Motion + Lucide Icons + Recharts
- **Database:** Supabase (PostgreSQL 15 + pg_cron + pg_net)
- **Real-time & Background:** Supabase Edge Functions (Deno)
- **Payments:** Razorpay (Webhooks & API)
- **Deployment:** Vercel (Edge Network)

---

## 🏁 Getting Started

### **1. Prerequisites**
- Node.js ≥ 20
- Supabase Project (Postgres + Auth enabled)
- Meta WhatsApp Business Account
- Vercel Account

### **2. Installation**
```bash
git clone https://github.com/Inayat-0007/clinicpilot.git
cd clinicpilot
npm install
```

### **3. Environment Setup**
Copy `.env.example` to `.env.local` and configure your keys. 
*Note: Production deployments require `PII_SALT`, `NEXT_PUBLIC_SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`.*

### **4. Database Initialization**
To apply the database schema locally:
```bash
supabase link --project-ref <your-project-id>
supabase db push
```

---

## 📜 License
Proprietary — © 2026 ClinicPilot Technologies. All rights reserved.

> **Interested in a Demo?** Check out our live production build at [clinicpilot-psi.vercel.app](https://clinicpilot-psi.vercel.app) or contact [inayatinayat552000@gmail.com](mailto:inayatinayat552000@gmail.com).
