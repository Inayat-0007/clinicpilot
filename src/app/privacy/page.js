import Link from "next/link";
import { Calendar } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | ClinicPilot",
  description: "How ClinicPilot collects, uses, and protects patient data under the DPDP Act 2023.",
};

// FIX #31: Replaced inline style={{ ... }} with Tailwind classes for design consistency
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Calendar className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-900">ClinicPilot</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 mb-10">Last updated: May 1, 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. What We Collect</h2>
          <p className="text-slate-600 leading-relaxed">
            ClinicPilot collects the following personal data when patients book appointments:
            name, phone number, and email address (optional). This data is collected with explicit consent
            at the time of booking.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">2. How We Use It</h2>
          <ul className="list-disc list-inside text-slate-600 leading-relaxed space-y-2">
            <li>To send appointment reminders via WhatsApp or SMS</li>
            <li>To allow 1-click rescheduling of appointments</li>
            <li>To display patient information to authorized clinic staff only</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Data Retention</h2>
          <p className="text-slate-600 leading-relaxed">
            Patient data is retained for 3 years from the date of collection, in compliance with the
            Digital Personal Data Protection Act, 2023. After this period, data is automatically purged.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Your Rights</h2>
          <p className="text-slate-600 leading-relaxed">
            Under the DPDP Act 2023, you have the right to request deletion of your personal data.
            To request deletion, contact your clinic or email us at{" "}
            <a href="mailto:privacy@clinicpilot.in" className="text-blue-600 hover:underline">
              privacy@clinicpilot.in
            </a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Data Security</h2>
          <p className="text-slate-600 leading-relaxed">
            All data is stored in encrypted databases with row-level security policies ensuring
            multi-tenant isolation. Only authorized staff from the specific clinic can access patient records.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Third-Party Services</h2>
          <p className="text-slate-600 leading-relaxed">
            We use Meta (WhatsApp), Twilio (SMS), Supabase (database), and Razorpay (payments).
            Each processes data as necessary for the service and under their own privacy policies.
          </p>
        </section>
      </main>
    </div>
  );
}
