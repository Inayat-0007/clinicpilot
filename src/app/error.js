'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    logger.error('[DashboardError]', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '400px', padding: '2rem',
      textAlign: 'center', gap: '1rem',
    }}>
      <div style={{ fontSize: '2rem' }}>⚠️</div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>Something went wrong</h2>
      <p style={{ color: '#666', maxWidth: '400px', lineHeight: 1.6 }}>
        The dashboard encountered an error. Your data is safe.
        {error.digest && (
          <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '12px', fontFamily: 'monospace' }}>
            Error code: {error.digest}
          </span>
        )}
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={reset} style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#fff' }}>
          Try again
        </button>
        <button onClick={() => window.location.href = '/dashboard'} style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#000', color: '#fff', cursor: 'pointer' }}>
          Go to dashboard
        </button>
      </div>
    </div>
  );
}
