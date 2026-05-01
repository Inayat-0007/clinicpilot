export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Privacy Policy</h1>
      <p style={{ color: '#666', marginBottom: '1rem' }}>Last updated: May 1, 2026</p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>1. What We Collect</h2>
        <p style={{ lineHeight: 1.7, color: '#333' }}>
          ClinicPilot collects the following personal data when patients book appointments:
          name, phone number, and email address (optional). This data is collected with explicit consent
          at the time of booking.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>2. How We Use It</h2>
        <ul style={{ lineHeight: 2, paddingLeft: '1.5rem', color: '#333' }}>
          <li>To send appointment reminders via WhatsApp or SMS</li>
          <li>To allow 1-click rescheduling of appointments</li>
          <li>To display patient information to authorized clinic staff only</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>3. Data Retention</h2>
        <p style={{ lineHeight: 1.7, color: '#333' }}>
          Patient data is retained for 3 years from the date of collection, in compliance with the
          Digital Personal Data Protection Act, 2023. After this period, data is automatically purged.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>4. Your Rights</h2>
        <p style={{ lineHeight: 1.7, color: '#333' }}>
          Under the DPDP Act 2023, you have the right to request deletion of your personal data.
          To request deletion, contact your clinic or email us at{' '}
          <a href="mailto:privacy@clinicpilot.in" style={{ color: '#2563eb' }}>privacy@clinicpilot.in</a>.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>5. Data Security</h2>
        <p style={{ lineHeight: 1.7, color: '#333' }}>
          All data is stored in encrypted databases with row-level security policies ensuring
          multi-tenant isolation. Only authorized staff from the specific clinic can access patient records.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>6. Third-Party Services</h2>
        <p style={{ lineHeight: 1.7, color: '#333' }}>
          We use Meta (WhatsApp), Twilio (SMS), Supabase (database), and Razorpay (payments).
          Each processes data as necessary for the service and under their own privacy policies.
        </p>
      </section>
    </div>
  )
}
