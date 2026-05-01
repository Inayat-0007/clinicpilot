'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif',
          padding: '2rem', textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            ClinicPilot is temporarily unavailable
          </h1>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            We are working to restore service. Your data is safe.
          </p>
          <button
            onClick={reset}
            style={{ padding: '10px 24px', borderRadius: '6px', cursor: 'pointer' }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
