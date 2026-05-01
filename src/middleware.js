import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // Get real client IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? '127.0.0.1'

  // ── RATE LIMITING (only in production — skip in dev) ──────────────────────
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      const { bookingRatelimit, rescheduleRatelimit, authRatelimit, whatsappLimiter, adminLimiter } = await import('@/lib/ratelimit')

      if (pathname.startsWith('/api/public/book') || pathname.startsWith('/book/')) {
        const { success, reset, remaining } = await bookingRatelimit.limit(ip)
        if (!success) {
          return NextResponse.json(
            { error: 'Too many requests. Please wait a few minutes and try again.' },
            {
              status: 429,
              headers: {
                'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
                'X-RateLimit-Remaining': remaining.toString(),
              }
            }
          )
        }
      }

      if (pathname.startsWith('/api/public/reschedule') || pathname.startsWith('/reschedule/')) {
        const { success } = await rescheduleRatelimit.limit(ip)
        if (!success) {
          return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
        }
      }

      if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
        const { success } = await authRatelimit.limit(ip)
        if (!success) {
          return NextResponse.json(
            { error: 'Too many login attempts. Try again in 15 minutes.' },
            { status: 429 }
          )
        }
      }

      if (pathname.startsWith('/api/whatsapp/send')) {
        const { success } = await whatsappLimiter.limit(ip)
        if (!success) {
          return NextResponse.json({ error: 'Too many messages sent. Try again later.' }, { status: 429 })
        }
      }

      if (pathname.startsWith('/api/appointments')) {
        const { success } = await adminLimiter.limit(ip)
        if (!success) {
          return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
        }
      }
    } catch (e) {
      // If Redis is down, let the request through — fail open
      console.warn('[Middleware] Rate limiter unavailable:', e.message)
    }
  }

  // ── AUTH GUARD — protect dashboard routes ─────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    let supabaseResponse = NextResponse.next({ request: req })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) => {
            const secureOptions = {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict'
            };
            supabaseResponse.cookies.set(name, value, secureOptions)
          })
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return supabaseResponse
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/public/:path*',
    '/api/whatsapp/:path*',
    '/api/appointments/:path*',
    '/book/:path*',
    '/reschedule/:path*',
    '/login',
    '/register',
  ]
}
