'use client'

export default function DashboardError({ error, reset }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
        ⚠️ Could not load this section. Check your connection and try again.
      </p>
      <button onClick={reset} style={{
        marginTop: '1rem', padding: '8px 16px', borderRadius: '6px',
        border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#fff',
      }}>Retry</button>
    </div>
  )
}
