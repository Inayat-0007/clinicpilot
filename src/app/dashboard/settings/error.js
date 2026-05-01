'use client'

export default function SettingsError({ error, reset }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>⚠️ Could not load settings. Please try again.</p>
      <button onClick={reset} style={{
        marginTop: '1rem', padding: '8px 16px', borderRadius: '6px',
        border: '1px solid #ddd', cursor: 'pointer',
      }}>Retry</button>
    </div>
  )
}
