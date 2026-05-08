import React, { useState } from 'react'
import Plot from 'react-plotly.js'
import type { PollutantInput } from '../../types'

interface PollutantChartProps {
  pollutants: PollutantInput | null
}

type ChartType = 'bar' | 'radar' | 'hbar'

const POLLUTANTS: { key: keyof PollutantInput; label: string; unit: string; color: string }[] = [
  { key: 'PM2.5', label: 'PM2.5', unit: 'µg/m³', color: '#6366f1' },
  { key: 'PM10',  label: 'PM10',  unit: 'µg/m³', color: '#8b5cf6' },
  { key: 'NO2',   label: 'NO2',   unit: 'µg/m³', color: '#f97316' },
  { key: 'SO2',   label: 'SO2',   unit: 'µg/m³', color: '#eab308' },
  { key: 'CO',    label: 'CO',    unit: 'µg/m³', color: '#ef4444' },
  { key: 'O3',    label: 'O3',    unit: 'µg/m³', color: '#22c55e' },
]

const LAYOUT_BASE: Partial<Plotly.Layout> = {
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  font: { color: '#94a3b8', family: 'var(--font-sans, system-ui)', size: 12 },
  margin: { t: 20, r: 20, b: 50, l: 50 },
  showlegend: false,
  xaxis: { gridcolor: 'rgba(255,255,255,0.06)', zerolinecolor: 'rgba(255,255,255,0.1)' },
  yaxis: { gridcolor: 'rgba(255,255,255,0.06)', zerolinecolor: 'rgba(255,255,255,0.1)' },
}

export function PollutantChart({ pollutants }: PollutantChartProps) {
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [fullscreen, setFullscreen] = useState(false)

  if (!pollutants) {
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
        <span style={{ fontSize: 32 }}>📊</span>
        <span>Submit pollutant values to see the chart</span>
      </div>
    )
  }

  const labels = POLLUTANTS.map(p => p.label)
  const values = POLLUTANTS.map(p => pollutants[p.key])
  const colors = POLLUTANTS.map(p => p.color)
  const hoverText = POLLUTANTS.map(p => `${p.label}: ${pollutants[p.key]} ${p.unit}`)

  let traces: Plotly.Data[] = []

  if (chartType === 'bar') {
    traces = [{
      type: 'bar',
      x: labels,
      y: values,
      marker: { color: colors },
      hovertext: hoverText,
      hoverinfo: 'text',
      text: values.map(v => String(v)),
      textposition: 'outside',
    }]
  } else if (chartType === 'hbar') {
    traces = [{
      type: 'bar',
      orientation: 'h',
      y: labels,
      x: values,
      marker: { color: colors },
      hovertext: hoverText,
      hoverinfo: 'text',
    }]
  } else {
    // radar
    traces = [{
      type: 'scatterpolar',
      r: [...values, values[0]],
      theta: [...labels, labels[0]],
      fill: 'toself',
      fillcolor: 'rgba(99,102,241,0.2)',
      line: { color: '#6366f1', width: 2 },
      hovertext: [...hoverText, hoverText[0]],
      hoverinfo: 'text',
    }]
  }

  const layout: Partial<Plotly.Layout> = {
    ...LAYOUT_BASE,
    ...(chartType === 'radar' ? {
      polar: {
        bgcolor: 'transparent',
        radialaxis: { gridcolor: 'rgba(255,255,255,0.1)', color: '#94a3b8' },
        angularaxis: { gridcolor: 'rgba(255,255,255,0.1)', color: '#94a3b8' },
      },
      margin: { t: 30, r: 30, b: 30, l: 30 },
    } : {}),
    ...(chartType === 'hbar' ? {
      xaxis: { ...LAYOUT_BASE.xaxis, title: { text: 'µg/m³' } },
      yaxis: { ...LAYOUT_BASE.yaxis, automargin: true },
      margin: { t: 20, r: 20, b: 50, l: 60 },
    } : {}),
  }

  const chart = (
    <Plot
      data={traces}
      layout={{ ...layout, height: fullscreen ? 500 : 260, autosize: true }}
      config={{ displayModeBar: fullscreen, responsive: true, scrollZoom: fullscreen }}
      style={{ width: '100%' }}
      onDoubleClick={() => setFullscreen(true)}
    />
  )

  return (
    <div>
      {/* Type switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {(['bar', 'radar', 'hbar'] as ChartType[]).map(t => (
          <button
            key={t}
            onClick={() => setChartType(t)}
            className={chartType === t ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 12, padding: '4px 12px' }}
            aria-pressed={chartType === t}
          >
            {t === 'bar' ? 'Bar' : t === 'radar' ? 'Radar' : 'Horizontal'}
          </button>
        ))}
      </div>

      {chart}

      {/* Fullscreen modal */}
      {fullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pollutant chart fullscreen"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 9000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setFullscreen(false)}
        >
          <div
            style={{ width: '100%', maxWidth: 900, background: 'var(--bg-card, #1e293b)', borderRadius: 16, padding: 24 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button className="btn-secondary" onClick={() => setFullscreen(false)} style={{ fontSize: 12 }}>
                ✕ Close
              </button>
            </div>
            <Plot
              data={traces}
              layout={{ ...layout, height: 480, autosize: true }}
              config={{ displayModeBar: true, responsive: true, scrollZoom: true }}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
