import React, { useState } from 'react'
import { getAdvisoryBgColor } from '../../utils/aqi'
import type { AQICategory } from '../../types'

interface AdvisoryBannerProps {
  category: AQICategory
  aqi: number
  onDismiss: () => void
}

const ADVISORY_TEXT: Partial<Record<AQICategory, string>> = {
  'Moderate': 'Air quality is acceptable. Unusually sensitive individuals may experience minor symptoms.',
  'Unhealthy for Sensitive Groups': 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
  'Unhealthy': 'Everyone may begin to experience health effects. Members of sensitive groups may experience more serious effects.',
  'Very Unhealthy': 'Health alert: everyone may experience more serious health effects.',
  'Hazardous': 'Health warning of emergency conditions. The entire population is more likely to be affected.',
}

const SHOW_CATEGORIES: AQICategory[] = [
  'Moderate',
  'Unhealthy for Sensitive Groups',
  'Unhealthy',
  'Very Unhealthy',
  'Hazardous',
]

export function AdvisoryBanner({ category, aqi, onDismiss }: AdvisoryBannerProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!SHOW_CATEGORIES.includes(category)) return null

  const bgColor = getAdvisoryBgColor(category)
  const advisoryText = ADVISORY_TEXT[category] ?? ''

  const handleShare = async () => {
    const text = `AQI Alert: ${aqi} (${category}). ${advisoryText}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  return (
    <div
      role="alert"
      style={{
        background: bgColor,
        color: '#1e293b',
        padding: 'var(--space-3) var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>
          ⚠️ AQI {aqi} — {category}
        </span>
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginLeft: 'auto', alignItems: 'center' }}>
          <button
            onClick={() => setExpanded(prev => !prev)}
            aria-expanded={expanded}
            style={{
              background: 'rgba(0,0,0,0.1)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              padding: '4px 10px',
              fontSize: 'var(--text-sm)',
              color: '#1e293b',
            }}
          >
            {expanded ? 'Hide' : 'Learn More'}
          </button>
          <button
            onClick={handleShare}
            aria-label="Copy advisory to clipboard"
            style={{
              background: 'rgba(0,0,0,0.1)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              padding: '4px 10px',
              fontSize: 'var(--text-sm)',
              color: '#1e293b',
            }}
          >
            {copied ? '✓ Copied' : 'Share Advisory'}
          </button>
          <button
            onClick={onDismiss}
            aria-label="Dismiss advisory"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.1rem',
              color: '#1e293b',
              lineHeight: 1,
              padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>
      </div>
      {expanded && (
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: '#1e293b' }}>
          {advisoryText}
        </p>
      )}
    </div>
  )
}
