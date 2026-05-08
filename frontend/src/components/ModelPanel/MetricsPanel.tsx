import React from 'react'
import type { ModelMetrics } from '../../types'

interface MetricsPanelProps {
  metrics: ModelMetrics | null
  loading?: boolean
}

interface MetricRowProps {
  label: string
  value: string
}

function MetricRow({ label, value }: MetricRowProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid var(--border-card, rgba(255,255,255,0.08))',
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary, #94a3b8)', fontWeight: 500 }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: 'var(--text-primary, #f1f5f9)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid var(--border-card, rgba(255,255,255,0.08))',
    }}>
      <div style={{ width: 80, height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.08)', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ width: 60, height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.08)', animation: 'shimmer 1.5s infinite' }} />
    </div>
  )
}

export function MetricsPanel({ metrics, loading = false }: MetricsPanelProps) {
  return (
    <div
      className="glass-card"
      style={{ padding: '16px 20px' }}
      aria-label="Model performance metrics"
      aria-busy={loading}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)' }}>
        Model Metrics
      </h3>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text-secondary, #94a3b8)' }}>
        Active model performance
      </p>

      {loading ? (
        <>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </>
      ) : metrics ? (
        <>
          <MetricRow label="MAE" value={metrics.mae.toFixed(4)} />
          <MetricRow label="RMSE" value={metrics.rmse.toFixed(4)} />
          <MetricRow label="R²" value={metrics.r2.toFixed(4)} />
          <MetricRow label="Accuracy" value={`${(metrics.accuracy * 100).toFixed(1)}%`} />
          <MetricRow
            label="CV Mean ± Std"
            value={`${(metrics.cv_mean_accuracy * 100).toFixed(1)}% ± ${(metrics.cv_std_accuracy * 100).toFixed(1)}%`}
          />
        </>
      ) : (
        <p style={{ fontSize: 13, color: 'var(--text-secondary, #94a3b8)', textAlign: 'center', padding: '16px 0' }}>
          No metrics available
        </p>
      )}
    </div>
  )
}
