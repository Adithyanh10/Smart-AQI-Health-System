import React, { useEffect, useRef } from 'react'

interface EmergencyOverlayProps {
  aqi: number
  onDismiss: () => void
}

export function EmergencyOverlay({ aqi, onDismiss }: EmergencyOverlayProps) {
  const dismissBtnRef = useRef<HTMLButtonElement>(null)

  // Focus the dismiss button on mount for keyboard accessibility
  useEffect(() => {
    dismissBtnRef.current?.focus()
  }, [])

  // Trap Escape key to dismiss
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onDismiss])

  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      aria-modal="true"
      aria-labelledby="emergency-heading"
      aria-describedby="emergency-desc"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(69, 10, 10, 0.97)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-6)',
        padding: 'var(--space-8)',
        textAlign: 'center',
      }}
    >
      {/* Warning icon */}
      <span
        aria-hidden="true"
        style={{ fontSize: '5rem', lineHeight: 1 }}
      >
        ⚠️
      </span>

      {/* AQI value */}
      <div
        style={{
          fontSize: '6rem',
          fontWeight: 900,
          color: '#fca5a5',
          lineHeight: 1,
        }}
        aria-label={`AQI value ${aqi}`}
      >
        {aqi}
      </div>

      {/* Heading */}
      <h1
        id="emergency-heading"
        style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: 800,
          color: '#fef2f2',
          margin: 0,
          letterSpacing: '0.05em',
        }}
      >
        HAZARDOUS AIR QUALITY
      </h1>

      {/* Description */}
      <p
        id="emergency-desc"
        style={{
          fontSize: 'var(--text-lg)',
          color: '#fecaca',
          maxWidth: '480px',
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        Health warning of emergency conditions. The entire population is more likely to be affected.
        Avoid all outdoor activities and stay indoors with windows closed.
      </p>

      {/* Dismiss button */}
      <button
        ref={dismissBtnRef}
        onClick={onDismiss}
        style={{
          background: '#fef2f2',
          color: '#7f1d1d',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3) var(--space-8)',
          fontSize: 'var(--text-lg)',
          fontWeight: 700,
          cursor: 'pointer',
          marginTop: 'var(--space-4)',
          transition: 'opacity var(--transition-base)',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        I Understand the Risk
      </button>
    </div>
  )
}
