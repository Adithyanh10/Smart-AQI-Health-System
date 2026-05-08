import React from 'react'
import Plot from 'react-plotly.js'
import type { BatchPredictionRow } from '../../types'

interface TrendChartProps {
  predictions: BatchPredictionRow[]
}

const MAX_POINTS = 100

function downsample(rows: BatchPredictionRow[], max: number): BatchPredictionRow[] {
  if (rows.length <= max) return rows
  const step = rows.length / max
  return Array.from({ length: max }, (_, i) => rows[Math.round(i * step)])
}

export function TrendChart({ predictions }: TrendChartProps) {
  if (predictions.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 220,
        color: 'var(--text-secondary, #94a3b8)',
        fontSize: 14,
        gap: 8,
      }}>
        <span style={{ fontSize: 32 }}>📈</span>
        <span>Upload a CSV file to see the AQI trend</span>
      </div>
    )
  }

  const downsampled = downsample(predictions, MAX_POINTS)
  const wasDownsampled = predictions.length > MAX_POINTS

  const trace: Plotly.Data = {
    type: 'scatter',
    mode: 'lines+markers',
    x: downsampled.map(r => r.row_index),
    y: downsampled.map(r => r.aqi),
    line: { color: '#6366f1', width: 2 },
    marker: { color: '#8b5cf6', size: 5 },
    hovertemplate: 'Row %{x}<br>AQI: %{y:.1f}<extra></extra>',
  }

  const layout: Partial<Plotly.Layout> = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: '#94a3b8', family: 'var(--font-sans, system-ui)', size: 12 },
    margin: { t: 20, r: 20, b: 50, l: 55 },
    height: 260,
    autosize: true,
    xaxis: {
      title: { text: 'Row Index' },
      gridcolor: 'rgba(255,255,255,0.06)',
      zerolinecolor: 'rgba(255,255,255,0.1)',
    },
    yaxis: {
      title: { text: 'AQI' },
      gridcolor: 'rgba(255,255,255,0.06)',
      zerolinecolor: 'rgba(255,255,255,0.1)',
    },
  }

  return (
    <div>
      {wasDownsampled && (
        <p style={{
          margin: '0 0 8px',
          fontSize: 12,
          color: '#eab308',
          background: 'rgba(234,179,8,0.1)',
          border: '1px solid rgba(234,179,8,0.25)',
          borderRadius: 6,
          padding: '4px 10px',
          display: 'inline-block',
        }}>
          ⚠ Showing {MAX_POINTS} of {predictions.length} rows (downsampled)
        </p>
      )}
      <Plot
        data={[trace]}
        layout={layout}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%' }}
      />
    </div>
  )
}
