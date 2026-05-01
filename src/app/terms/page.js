export const metadata = {
  title: "Terms of Service | ClinicPilot",
  description: "Terms of service for using ClinicPilot.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 shadow-sm rounded-xl border border-slate-100">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-500 mb-8">Last updated: May 1, 2026</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800">1. Agreement to Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              By accessing or using ClinicPilot, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800">2. Use License</h2>
            <p className="text-slate-600 leading-relaxed">
              Permission is granted to temporarily download one copy of the materials (information or software) on ClinicPilot for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800">3. Disclaimer</h2>
            <p className="text-slate-600 leading-relaxed">
              The materials on ClinicPilot are provided on an &apos;as is&apos; basis. ClinicPilot makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800">4. Limitations</h2>
            <p className="text-slate-600 leading-relaxed">
              In no event shall ClinicPilot or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ClinicPilot, even if ClinicPilot or a ClinicPilot authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-slate-800">5. Governing Law</h2>
            <p className="text-slate-600 leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
