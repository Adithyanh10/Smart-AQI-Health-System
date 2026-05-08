import React from 'react'
import Plot from 'react-plotly.js'

interface CorrelationHeatmapProps {
  matrix: Record<string, Record<string, number>>
}

export function CorrelationHeatmap({ matrix }: CorrelationHeatmapProps) {
  if (!matrix || Object.keys(matrix).length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, color: 'var(--text-secondary,#94a3b8)', fontSize: 14, gap: 8 }}>
        <span>No correlation data available</span>
      </div>
    )
  }

  const labels = Object.keys(matrix)
  const z = labels.map(row => labels.map(col => matrix[row]?.[col] ?? 0))

  return (
    <Plot
      data={[{
        type: 'heatmap',
        z,
        x: labels,
        y: labels,
        colorscale: [
          [0,   '#be123c'],
          [0.25,'#f97316'],
          [0.5, '#1e293b'],
          [0.75,'#0ea5e9'],
          [1,   '#10b981'],
        ],
        zmin: -1,
        zmax: 1,
        text: z.map(row => row.map(v => v.toFixed(2))) as unknown as Plotly.Datum[][],
        texttemplate: '%{text}',
        textfont: { size: 11, color: '#f0f6ff' },
        hovertemplate: '%{y} vs %{x}: %{z:.3f}<extra></extra>',
        showscale: true,
        colorbar: {
          thickness: 12,
          tickfont: { color: '#94a3b8', size: 10 },
          tickvals: [-1, -0.5, 0, 0.5, 1],
          ticktext: ['-1', '-0.5', '0', '0.5', '1'],
        },
      }]}
      layout={{
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { color: '#94a3b8', family: 'var(--font-sans,system-ui)', size: 11 },
        margin: { t: 10, r: 60, b: 60, l: 60 },
        xaxis: { tickangle: -30, gridcolor: 'transparent', color: '#94a3b8' },
        yaxis: { gridcolor: 'transparent', color: '#94a3b8' },
        height: 300,
        autosize: true,
      }}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: '100%' }}
    />
  )
}
