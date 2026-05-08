import React, { useState } from 'react'
import { PollutantForm } from '../components/PollutantForm/PollutantForm'
import { useAQIPrediction } from '../hooks/useAQIPrediction'
import { usePDF } from '../hooks/usePDF'
import { getRiskColor } from '../utils/aqi'
import type { PollutantInput, PredictionResponse } from '../types'

const POLLUTANT_KEYS = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3'] as const

interface ScenarioPanelProps {
  label: string
  result: PredictionResponse | null
  loading: boolean
  input: Partial<PollutantInput>
  setField: (key: keyof PollutantInput, value: number) => void
  predict: () => Promise<void>
  clearForm: () => void
  error: string | null
}

function ScenarioPanel({ label, result, loading, input, setField, predict, clearForm, error }: ScenarioPanelProps) {
  return (
    <div className="glass-card" style={{ padding: 20, flex: 1, minWidth: 0 }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)' }}>
        {label}
      </h2>
      <PollutantForm
        onPredict={() => {}}
        loading={loading}
        input={input}
        setField={setField}
        predict={predict}
        clearForm={clearForm}
        error={error}
      />
      {result && (
        <div style={{
          marginTop: 16,
          padding: '12px 14px',
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 10,
        }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary, #f1f5f9)' }}>
            AQI: {result.aqi.toFixed(1)}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary, #94a3b8)' }}>
            {result.aqi_category}
          </p>
        </div>
      )}
    </div>
  )
}

// Separate hook instances for A and B
function useScenario() {
  const hook = useAQIPrediction()
  return hook
}

export function ComparePage() {
  const scenarioA = useScenario()
  const scenarioB = useScenario()
  const { downloading, exportComparison } = usePDF()

  const resultA = scenarioA.result
  const resultB = scenarioB.result

  const pctChange = (resultA && resultB)
    ? ((resultB.aqi - resultA.aqi) / resultA.aqi) * 100
    : null

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: 'var(--text-primary, #f1f5f9)' }}>
        Scenario Comparison
      </h1>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--text-secondary, #94a3b8)' }}>
        Enter two sets of pollutant values to compare their AQI and health impact side by side.
      </p>

      {/* Two scenario panels */}
      <div id="compare-export" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}>
        <ScenarioPanel
          label="Scenario A"
          result={resultA}
          loading={scenarioA.loading}
          input={scenarioA.input}
          setField={scenarioA.setField}
          predict={scenarioA.predict}
          clearForm={scenarioA.clearForm}
          error={scenarioA.error}
        />
        <ScenarioPanel
          label="Scenario B"
          result={resultB}
          loading={scenarioB.loading}
          input={scenarioB.input}
          setField={scenarioB.setField}
          predict={scenarioB.predict}
          clearForm={scenarioB.clearForm}
          error={scenarioB.error}
        />
      </div>

      {/* Percentage change */}
      {pctChange !== null && (
        <div style={{
          textAlign: 'center',
          marginBottom: 24,
          padding: '16px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <span style={{
            fontSize: 28,
            fontWeight: 800,
            color: pctChange > 0 ? '#ef4444' : pctChange < 0 ? '#22c55e' : '#94a3b8',
          }}>
            {pctChange > 0 ? '+' : ''}{pctChange.toFixed(1)}%
          </span>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary, #94a3b8)' }}>
            AQI change from Scenario A to B
          </p>
        </div>
      )}

      {/* Comparison table */}
      {resultA && resultB && (
        <>
          <div className="glass-card" style={{ padding: 20, marginBottom: 24, overflowX: 'auto' }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)' }}>
              Pollutant Comparison
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Pollutant', 'Scenario A', 'Scenario B', 'Diff', '% Change'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {POLLUTANT_KEYS.map(key => {
                  const a = resultA.feature_importance.find(f => f.feature === key)?.importance ?? (resultA as any)[key] ?? 0
                  const valA = resultA.feature_importance.find(f => f.feature === key)?.importance ?? 0
                  const valB = resultB.feature_importance.find(f => f.feature === key)?.importance ?? 0
                  const diff = valB - valA
                  const pct = valA !== 0 ? ((diff / valA) * 100).toFixed(1) : '—'
                  return (
                    <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-primary, #f1f5f9)' }}>{key}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-secondary, #94a3b8)' }}>{valA.toFixed(4)}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-secondary, #94a3b8)' }}>{valB.toFixed(4)}</td>
                      <td style={{ padding: '8px 12px', color: diff > 0 ? '#ef4444' : diff < 0 ? '#22c55e' : '#94a3b8' }}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(4)}
                      </td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-secondary, #94a3b8)' }}>
                        {pct !== '—' ? `${Number(pct) > 0 ? '+' : ''}${pct}%` : pct}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Organ risk comparison */}
          <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)' }}>
              Organ Risk Comparison
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {resultA.organs.map(organA => {
                const organB = resultB.organs.find(o => o.organ === organA.organ)
                if (!organB) return null
                const colorA = getRiskColor(organA.risk_level)
                const colorB = getRiskColor(organB.risk_level)
                return (
                  <div key={organA.organ} style={{
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 14, color: 'var(--text-primary, #f1f5f9)' }}>
                      {organA.organ}
                    </p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 999, background: colorA + '22', color: colorA, border: `1px solid ${colorA}44`, fontWeight: 700 }}>
                        A: {organA.risk_level}
                      </span>
                      <span style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: 12 }}>→</span>
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 999, background: colorB + '22', color: colorB, border: `1px solid ${colorB}44`, fontWeight: 700 }}>
                        B: {organB.risk_level}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Export PDF */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => exportComparison('compare-export')}
              disabled={downloading}
              className="btn-primary"
              aria-busy={downloading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              {downloading ? 'Exporting…' : '📄 Export PDF'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
