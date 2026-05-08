import React, { useState } from 'react'
import { getRiskColor } from '../../utils/aqi'
import { SeverityRing } from '../Shared/SeverityRing'
import type { OrganImpact } from '../../types'

interface RiskBadgeProps {
  risk: string
  color: string
}

function RiskBadge({ risk, color }: RiskBadgeProps) {
  return (
    <span
      className="badge"
      style={{
        background: color + '22',
        color,
        border: `1px solid ${color}55`,
        fontSize: 11,
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 999,
      }}
    >
      {risk}
    </span>
  )
}

interface OrganCardProps {
  organ: OrganImpact
  loading?: boolean
}

export function OrganCard({ organ, loading = false }: OrganCardProps) {
  const [expanded, setExpanded] = useState(false)
  const color = getRiskColor(organ.risk_level)
  const iconName = organ.organ.toLowerCase().replace(/\s+/g, '_')

  if (loading) {
    return (
      <div
        className="skeleton"
        aria-busy="true"
        aria-label="Loading organ data..."
        style={{
          borderRadius: 'var(--radius-xl)',
          height: 200,
        }}
      />
    )
  }

  return (
    <>
      <style>{`
        .organ-card {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-left: 3px solid ${color};
          border-radius: var(--radius-xl);
          backdrop-filter: blur(var(--backdrop-blur));
          -webkit-backdrop-filter: blur(var(--backdrop-blur));
          transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
          overflow: hidden;
          box-shadow: var(--shadow-card);
        }
        .organ-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-card-hover);
          border-color: ${color}55;
        }
        .organ-card__expand-content {
          overflow: hidden;
          max-height: 0;
          transition: max-height var(--transition-expand, 400ms) ease;
        }
        .organ-card__expand-content--open {
          max-height: 600px;
        }
        .organ-card__expand-btn {
          width: 100%;
          background: var(--bg-elevated);
          border: none;
          border-top: 1px solid var(--border-subtle);
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px 16px;
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          font-family: var(--font-sans);
          display: flex;
          align-items: center;
          justify-content: space-between;
          letter-spacing: var(--tracking-wider);
          text-transform: uppercase;
          transition: background var(--transition-fast), color var(--transition-fast);
        }
        .organ-card__expand-btn:hover {
          background: var(--bg-card-hover);
          color: var(--text-secondary);
        }
      `}</style>

      <article
        className="organ-card"
        aria-label={`${organ.organ} health impact`}
      >
        {/* Header */}
        <div style={{ padding: '16px 16px 12px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <img
            src={`/static/organ_icons/${iconName}.svg`}
            alt={organ.organ}
            width={40}
            height={40}
            style={{ flexShrink: 0, borderRadius: 8 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h3 style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--text-primary, #f1f5f9)',
              }}>
                {organ.organ}
              </h3>
              <RiskBadge risk={organ.risk_level} color={color} />
            </div>
            <p style={{
              margin: '6px 0 0',
              fontSize: 13,
              color: 'var(--text-secondary, #94a3b8)',
              lineHeight: 1.5,
            }}>
              {organ.description}
            </p>
          </div>
          <SeverityRing score={organ.severity_score} riskLevel={organ.risk_level} size={52} />
        </div>

        {/* Expand button */}
        <button
          onClick={() => setExpanded(prev => !prev)}
          aria-expanded={expanded}
          aria-controls={`organ-detail-${iconName}`}
          className="organ-card__expand-btn"
        >
          <span>{expanded ? 'Hide Details' : 'Show Details'}</span>
          <span style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 300ms ease' }}>
            ▾
          </span>
        </button>

        {/* Expandable detail */}
        <div
          id={`organ-detail-${iconName}`}
          className={`organ-card__expand-content${expanded ? ' organ-card__expand-content--open' : ''}`}
        >
          <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Action urgency */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: color + '22',
              border: `1px solid ${color}44`,
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: 700,
              color,
              alignSelf: 'flex-start',
            }}>
              ⚠ {organ.action_urgency}
            </div>

            {/* Prevention tips */}
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Prevention Tips
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {organ.prevention_tips.map((tip, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.5 }}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* Precautions */}
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Precautions
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {organ.precautions.map((p, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.5 }}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </article>
    </>
  )
}
