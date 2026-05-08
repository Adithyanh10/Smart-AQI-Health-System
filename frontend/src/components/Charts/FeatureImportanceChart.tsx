import React from 'react'
import Plot from 'react-plotly.js'
import type { FeatureImportanceItem } from '../../types'

interface FeatureImportanceChartProps {
  items: FeatureImportanceItem[]
}

export function FeatureImportanceChart({ items }: FeatureImportanceChartProps) {
  if (items.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 180,
        color: 'var(--text-secondary, #94a3b8)',
        fontSize: 14,
        gap: 8,
      }}>
        <span style={{ fontSize: 28 }}>🔍</span>
        <span>No feature importance data available</span>
      </div>
    )
  }

  const sorted = [...items].sort((a, b) => b.importance - a.importance)

  const trace: Plotly.Data = {
    type: 'bar',
    orientation: 'h',
    y: sorted.map(i => i.feature),
    x: sorted.map(i => i.importance),
    marker: {
      color: sorted.map((_, idx) => {
        const t = idx / Math.max(sorted.length - 1, 1)
        return `hsl(${250 - t * 60}, 70%, 60%)`
      }),
    },
    hovertemplate: '%{y}: %{x:.4f}<extra></extra>',
  }

  const layout: Partial<Plotly.Layout> = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: '#94a3b8', family: 'var(--font-sans, system-ui)', size: 12 },
    margin: { t: 10, r: 20, b: 40, l: 70 },
    height: 220,
    autosize: true,
    xaxis: {
      title: { text: 'Importance' },
      gridcolor: 'rgba(255,255,255,0.06)',
      zerolinecolor: 'rgba(255,255,255,0.1)',
    },
    yaxis: {
      automargin: true,
      gridcolor: 'rgba(255,255,255,0.06)',
    },
  }

  return (
    <Plot
      data={[trace]}
      layout={layout}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: '100%' }}
    />
  )
}
