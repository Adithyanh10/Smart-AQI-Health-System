import React, { useState } from 'react'
import type { ModelVersion } from '../../types'
import { activateModel } from '../../services/api'

interface ModelComparisonTableProps {
  models: ModelVersion[]
  onActivated?: (id: string) => void
}

const METRIC_COLS = [
  { key: 'mae',              label: 'MAE',      lower: true,  fmt: (v: number) => v.toFixed(2) },
  { key: 'rmse',             label: 'RMSE',     lower: true,  fmt: (v: number) => v.toFixed(2) },
  { key: 'r2',               label: 'R²',       lower: false, fmt: (v: number) => v.toFixed(3) },
  { key: 'accuracy',         label: 'Accuracy', lower: false, fmt: (v: number) => `${(v * 100).toFixed(1)}%` },
  { key: 'cv_mean_accuracy', label: 'CV Mean',  lower: false, fmt: (v: number) => `${(v * 100).toFixed(1)}%` },
]

function bestValue(models: ModelVersion[], key: string, lower: boolean): number {
  const vals = models.map(m => (m.metrics as Record<string, number>)[key])
  return lower ? Math.min(...vals) : Math.max(...vals)
}

export function ModelComparisonTable({ models, onActivated }: ModelComparisonTableProps) {
  const [activating, setActivating] = useState<string | null>(null)

  if (!models.length) {
    return <p style={{ color: 'var(--text-muted,#4a6080)', fontSize: 13, textAlign: 'center', padding: 20 }}>No models trained yet.</p>
  }

  const handleActivate = async (id: string) => {
    setActivating(id)
    try {
      await activateModel(id)
      onActivated?.(id)
    } finally {
      setActivating(null)
    }
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted,#4a6080)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>Model</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted,#4a6080)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Type</th>
            {METRIC_COLS.map(c => (
              <th key={c.key} style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-muted,#4a6080)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{c.label}</th>
            ))}
            <th style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-muted,#4a6080)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {models.map(m => (
            <tr key={m.model_id}
              style={{ background: m.is_active ? 'rgba(16,185,129,0.06)' : 'transparent', transition: 'background 0.15s' }}
              onMouseOver={e => { if (!m.is_active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}
              onMouseOut={e => { if (!m.is_active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <td style={{ padding: '9px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted,#4a6080)', fontFamily: 'monospace', fontSize: 10 }}>
                {m.model_id.slice(0, 8)}...
              </td>
              <td style={{ padding: '9px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-primary,#f0f6ff)', fontWeight: 600 }}>
                {m.model_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </td>
              {METRIC_COLS.map(c => {
                const val = (m.metrics as Record<string, number>)[c.key]
                const best = bestValue(models, c.key, c.lower)
                const isBest = Math.abs(val - best) < 0.0001
                return (
                  <td key={c.key} style={{ padding: '9px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'right', color: isBest ? '#34d399' : 'var(--text-secondary,#8ba3c7)', fontWeight: isBest ? 700 : 400 }}>
                    {c.fmt(val)}
                    {isBest && <span style={{ marginLeft: 4, fontSize: 9, color: '#34d399' }}>best</span>}
                  </td>
                )
              })}
              <td style={{ padding: '9px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                {m.is_active ? (
                  <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', color: '#34d399' }}>Active</span>
                ) : (
                  <button
                    onClick={() => handleActivate(m.model_id)}
                    disabled={activating === m.model_id}
                    style={{ padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.18)' }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)' }}
                  >
                    {activating === m.model_id ? 'Activating...' : 'Activate'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
