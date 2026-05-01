# Architecture

> System design overview for ClinicPilot.

---

## Data Flow

```
Patient → /book/[slug] → POST /api/public/book → Supabase (appointments + patients)
                                                        ↓
                                                   pg_cron (60s)
                                                        ↓
                                               Edge Function: send-reminders
                                                   ↙           ↘
                                          WhatsApp API      Twilio SMS
                                          (Meta Cloud)      (Fallback)
                                                   ↘           ↙
                                             Patient receives reminder
                                                        ↓
                                            /reschedule/[token] → 1-click
```

## Multi-Tenancy Model

Every table includes a `clinic_id` foreign key. Row-Level Security (RLS)
policies enforce that:

- Clinic A **cannot** read or write Clinic B's data.
- Helper functions `auth.get_my_clinic_id()` and `auth.get_my_role()`
  resolve the current user's tenant context from the `staff` table.

## Client Architecture (3 Supabase Clients)

| Client     | File               | Key Used       | RLS    | Where Used                |
| ---------- | ------------------ | -------------- | ------ | ------------------------- |
| Browser    | `supabase/client`  | `anon`         | ✅ Yes | Client Components         |
| SSR Server | `supabase/server`  | `anon` + cookie| ✅ Yes | Server Components, RSC    |
| Admin      | `supabase/admin`   | `service_role` | ❌ No  | Webhooks, cron, edge fns  |

## Security Layers

1. **Middleware** — Rate limiting + auth guard (Upstash Redis)
2. **CSRF** — Origin/Referer validation on mutations
3. **Webhook HMAC** — SHA-256 signature verification
4. **RLS** — Database-level tenant isolation
5. **Headers** — HSTS, X-Frame-Options, nosniff
6. **PII** — Phone numbers hashed before logging (DPDP Act)
