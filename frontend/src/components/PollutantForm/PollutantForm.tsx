import React, { useState } from 'react'
import type { PollutantInput } from '../../types'

interface PollutantFormProps {
  onPredict: () => void
  loading: boolean
  input: Partial<PollutantInput>
  setField: (key: keyof PollutantInput, value: number) => void
  predict: () => Promise<void>
  clearForm: () => void
  error: string | null
}

const FIELDS: { key: keyof PollutantInput; label: string; unit: string }[] = [
  { key: 'PM2.5', label: 'PM2.5', unit: 'µg/m³' },
  { key: 'PM10',  label: 'PM10',  unit: 'µg/m³' },
  { key: 'NO2',   label: 'NO2',   unit: 'µg/m³' },
  { key: 'SO2',   label: 'SO2',   unit: 'µg/m³' },
  { key: 'CO',    label: 'CO',    unit: 'µg/m³' },
  { key: 'O3',    label: 'O3',    unit: 'µg/m³' },
]

function validate(values: Partial<PollutantInput>): Partial<Record<keyof PollutantInput, string>> {
  const errors: Partial<Record<keyof PollutantInput, string>> = {}
  for (const { key } of FIELDS) {
    const val = values[key]
    if (val === undefined || val === null || (val as unknown as string) === '') {
      errors[key] = 'Required'
    } else if (isNaN(Number(val))) {
      errors[key] = 'Must be numeric'
    } else if (Number(val) < 0 || Number(val) > 5000) {
      errors[key] = 'Must be 0–5000'
    }
  }
  return errors
}

export function PollutantForm({ onPredict, loading, input, setField, predict, clearForm, error }: PollutantFormProps) {
  const [touched, setTouched] = useState<Partial<Record<keyof PollutantInput, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)

  const errors = validate(input)
  const hasErrors = Object.keys(errors).length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (hasErrors) return
    await predict()
    onPredict()
  }

  const handleClear = () => {
    clearForm()
    setTouched({})
    setSubmitted(false)
  }

  const showError = (key: keyof PollutantInput) =>
    (touched[key] || submitted) && errors[key]

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Pollutant input form">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 16,
      }}>
        {FIELDS.map(({ key, label, unit }) => (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label
              htmlFor={`pollutant-${key}`}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary, #94a3b8)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>{label}</span>
              <span style={{ fontWeight: 400, opacity: 0.7 }}>{unit}</span>
            </label>
            <input
              id={`pollutant-${key}`}
              type="number"
              min={0}
              max={5000}
              step="any"
              aria-label={`${label} in ${unit}`}
              aria-invalid={!!showError(key)}
              aria-describedby={showError(key) ? `err-${key}` : undefined}
              value={input[key] !== undefined ? String(input[key]) : ''}
              onChange={(e) => {
                const v = e.target.value
                setField(key, v === '' ? ('' as unknown as number) : parseFloat(v))
              }}
              onBlur={() => setTouched(prev => ({ ...prev, [key]: true }))}
              className="glass-input"
              style={{ width: '100%', boxSizing: 'border-box' }}
              placeholder="0"
            />
            {showError(key) && (
              <span
                id={`err-${key}`}
                role="alert"
                style={{ fontSize: 11, color: '#ef4444' }}
              >
                {errors[key]}
              </span>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ flex: 1 }}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span
                style={{
                  display: 'inline-block',
                  width: 14,
                  height: 14,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }}
                aria-hidden="true"
              />
              Predicting…
            </>
          ) : (
            'Predict AQI'
          )}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="btn-secondary"
          aria-label="Clear all fields"
        >
          Clear
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  )
}
