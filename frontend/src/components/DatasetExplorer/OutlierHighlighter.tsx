import React from 'react'
import type { ColumnStats } from '../../types'

interface OutlierHighlighterProps {
  columns: ColumnStats[]
  totalRows: number
}

function severityColor(pct: number): string {
  if (pct < 2)  return '#10b981'
  if (pct < 5)  return '#f59e0b'
  if (pct < 10) return '#f97316'
  return '#ef4444'
}

export function OutlierHighlighter({ columns, totalRows }: OutlierHighlighterProps) {
  const withOutliers = columns.filter(c => c.outlier_count > 0).sort((a, b) => b.outlier_count - a.outlier_count)

  if (!withOutliers.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <span style={{ fontSize: 18 }}>✓</span>
        <p style={{ margin: 0, fontSize: 13, color: '#34d399', fontWeight: 600 }}>No outliers detected across all columns.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted,#4a6080)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Outliers detected (IQR x1.5 rule)
      </p>
      {withOutliers.map(col => {
        const pct = (col.outlier_count / totalRows) * 100
        const color = severityColor(pct)
        const barWidth = Math.min(100, pct * 5)
        return (
          <div key={col.column} style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}22` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary,#f0f6ff)' }}>{col.column}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color, padding: '2px 8px', borderRadius: 999, background: `${color}18`, border: `1px solid ${color}44` }}>
                {col.outlier_count} rows ({pct.toFixed(1)}%)
              </span>
            </div>
            {/* Bar */}
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${barWidth}%`, background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 10, color: 'var(--text-muted,#4a6080)' }}>
              <span>Min: {col.min.toFixed(2)}</span>
              <span>P25: {col.p25.toFixed(2)}</span>
              <span>Median: {col.median.toFixed(2)}</span>
              <span>P75: {col.p75.toFixed(2)}</span>
              <span>Max: {col.max.toFixed(2)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
