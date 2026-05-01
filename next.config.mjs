/** @type {import('next').NextConfig} */
import './src/env.js';

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
          // FIX #12: Removed 'unsafe-eval' — it allowed eval(), setTimeout(string), new Function()
          // which are classic XSS vectors and negate significant CSP protection.
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://graph.facebook.com https://checkout.razorpay.com; frame-src https://checkout.razorpay.com; font-src 'self' https://fonts.gstatic.com;" },
        ]
      }
    ]
  },
};

export default nextConfig;
