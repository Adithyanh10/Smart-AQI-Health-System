import React, { useRef, useEffect } from 'react'
import { useLiveLocation } from '../../hooks/useLiveLocation'
import type { PollutantInput } from '../../types'

interface Props {
  onFetched: (pollutants: PollutantInput) => void
}

export function LiveLocationButton({ onFetched }: Props) {
  const { status, data, error, fetchLocation } = useLiveLocation()

  // Track whether we already called onFetched for the current data object
  // so we never fire more than once per successful fetch.
  const firedRef = useRef<object | null>(null)

  useEffect(() => {
    if (status === 'success' && data && firedRef.current !== data) {
      firedRef.current = data
      onFetched(data.pollutants)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, data])   // intentionally omit onFetched — it's stable via useCallback in parent

  const isLoading = status === 'locating' || status === 'fetching'

  const statusLabel: Record<typeof status, string> = {
    idle:     '📍 Use My Location',
    locating: '🔍 Getting location…',
    fetching: '🌐 Fetching AQI…',
    success:  '✅ Location loaded',
    error:    '📍 Try Again',
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => fetchLocation()}
        disabled={isLoading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '9px 18px', borderRadius: 10,
          border: status === 'success'
            ? '1px solid rgba(16,185,129,0.4)'
            : status === 'error'
            ? '1px solid rgba(239,68,68,0.4)'
            : '1px solid rgba(14,165,233,0.4)',
          background: status === 'success'
            ? 'rgba(16,185,129,0.1)'
            : status === 'error'
            ? 'rgba(239,68,68,0.08)'
            : 'rgba(14,165,233,0.1)',
          color: status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : '#38bdf8',
          fontSize: 13, fontWeight: 600,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
          transition: 'all 0.2s', width: '100%', justifyContent: 'center',
        }}
        aria-busy={isLoading}
        aria-label="Fetch AQI from your current location"
      >
        {isLoading && (
          <span style={{
            width: 13, height: 13,
            border: '2px solid rgba(56,189,248,0.3)', borderTopColor: '#38bdf8',
            borderRadius: '50%', animation: 'spin 0.7s linear infinite',
            display: 'inline-block', flexShrink: 0,
          }} aria-hidden="true" />
        )}
        {statusLabel[status]}
      </button>

      {status === 'success' && data && (
        <div style={{
          marginTop: 8, padding: '8px 12px',
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 8, fontSize: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: '#10b981' }}>
              📍 {data.city}{data.state ? `, ${data.state}` : ''}{data.country ? `, ${data.country}` : ''}
            </span>
            <span style={{ color: 'var(--text-muted,#4a6080)', fontSize: 11 }}>
              {data.fetchedAt.toLocaleTimeString()}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4 }}>
            {(Object.entries(data.pollutants) as [string, number][]).map(([key, val]) => (
              <div key={key} style={{ textAlign: 'center', padding: '3px 0', background: 'rgba(255,255,255,0.04)', borderRadius: 4 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted,#4a6080)' }}>{key}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary,#f0f6ff)' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'error' && error && (
        <p role="alert" style={{ margin: '6px 0 0', fontSize: 12, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 10px', borderRadius: 6 }}>
          {error}
        </p>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
