/**
 * @file Root Layout
 * @description Global layout for ClinicPilot. Sets up fonts, metadata,
 *              the Sonner toast provider, and the base HTML structure.
 */

import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// ── Fonts ───────────────────────────────────────────────────────
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// ── SEO Metadata ────────────────────────────────────────────────
export const viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = {
  title: {
    default: "ClinicPilot — No-Show Prevention for Clinics",
    template: "%s | ClinicPilot",
  },
  description:
    "Cut patient no-shows by 40% with automated WhatsApp reminders and 1-click rescheduling. Built for modern Indian clinics. Starting at ₹749/mo.",
  keywords: [
    "clinic management",
    "whatsapp reminders",
    "patient no-show",
    "appointment scheduling",
    "india",
    "healthcare saas",
  ],
  authors: [{ name: "ClinicPilot Technologies" }],
  openGraph: {
    title: "ClinicPilot — No-Show Prevention for Clinics",
    description:
      "Automated WhatsApp reminders + 1-click rescheduling at half the price of Practo.",
    type: "website",
    locale: "en_IN",
    siteName: "ClinicPilot",
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ClinicPilot",
  },
};

// ── Layout Component ────────────────────────────────────────────
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
