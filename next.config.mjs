/** @type {import('next').NextConfig} */
import './src/env.js';

const isDev = process.env.NODE_ENV === 'development';

// Production CSP: strict, no eval(). React never uses eval() in production.
// Dev CSP: includes 'unsafe-eval' because React needs it for dev-mode debugging
// (callstack reconstruction, error overlays, hot-reload).
const cspValue = isDev
  ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://graph.facebook.com https://checkout.razorpay.com ws://localhost:* http://localhost:*; frame-src https://checkout.razorpay.com; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com;"
  : "default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://graph.facebook.com https://checkout.razorpay.com; frame-src https://checkout.razorpay.com; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com;";

const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Content-Security-Policy', value: cspValue },
        ]
      }
    ]
  },
};

export default nextConfig;
