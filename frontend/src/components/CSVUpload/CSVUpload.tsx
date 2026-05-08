import React, { useRef, useState } from 'react'
import { predictCSV } from '../../services/api'
import { downloadCSV } from '../../utils/csv'
import type { BatchPredictionResponse } from '../../types'

interface CSVUploadProps {
  onResults: (results: BatchPredictionResponse) => void
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const REQUIRED_COLUMNS = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3']

export function CSVUpload({ onResults }: CSVUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<BatchPredictionResponse | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    if (!file.name.endsWith('.csv')) return 'Only .csv files are accepted.'
    if (file.size > MAX_FILE_SIZE) return 'File exceeds 50 MB limit.'
    return null
  }

  const validateColumns = async (file: File): Promise<string | null> => {
    const text = await file.slice(0, 1024).text()
    const header = text.split('\n')[0] ?? ''
    const cols = header.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    const missing = REQUIRED_COLUMNS.filter(c => !cols.includes(c))
    if (missing.length > 0) return `Missing required columns: ${missing.join(', ')}`
    return null
  }

  const processFile = async (file: File) => {
    setError(null)
    setResults(null)
    setProgress(0)

    const fileError = validateFile(file)
    if (fileError) { setError(fileError); setProgress(null); return }

    const colError = await validateColumns(file)
    if (colError) { setError(colError); setProgress(null); return }

    setFileName(file.name)

    // Simulate progress during upload
    const interval = setInterval(() => {
      setProgress(prev => (prev !== null && prev < 85 ? prev + 10 : prev))
    }, 200)

    try {
      const data = await predictCSV(file)
      clearInterval(interval)
      setProgress(100)
      setResults(data)
      onResults(data)
    } catch (err: unknown) {
      clearInterval(interval)
      setProgress(null)
      const msg = err instanceof Error ? err.message : 'Upload failed'
      setError(msg)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    // Reset so same file can be re-selected
    e.target.value = ''
  }

  const handleDownload = () => {
    if (!results) return
    const rows = results.predictions.map(r => ({
      row_index: r.row_index,
      'PM2.5': r.input['PM2.5'],
      PM10: r.input.PM10,
      NO2: r.input.NO2,
      SO2: r.input.SO2,
      CO: r.input.CO,
      O3: r.input.O3,
      aqi: r.aqi,
      aqi_category: r.aqi_category,
    }))
    downloadCSV(rows, 'batch_results.csv')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop CSV file here or click to browse"
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
        style={{
          border: `2px dashed ${dragging ? 'var(--color-primary-500, #6366f1)' : 'var(--border-card, rgba(255,255,255,0.15))'}`,
          borderRadius: 'var(--radius-xl, 16px)',
          padding: '32px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'rgba(99,102,241,0.08)' : 'var(--bg-card, rgba(255,255,255,0.04))',
          transition: 'border-color 200ms, background 200ms',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }} aria-hidden="true">📂</div>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary, #f1f5f9)', fontWeight: 600 }}>
          {fileName ? fileName : 'Drop a CSV file here'}
        </p>
        <p style={{ margin: '4px 0 12px', fontSize: 12, color: 'var(--text-secondary, #94a3b8)' }}>
          Requires columns: {REQUIRED_COLUMNS.join(', ')} · Max 50 MB
        </p>
        <button
          type="button"
          className="btn-secondary"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
          style={{ fontSize: 13 }}
        >
          Browse File
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
      </div>

      {/* Progress bar */}
      {progress !== null && (
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Upload progress: ${progress}%`}
          style={{
            height: 6,
            borderRadius: 999,
            background: 'var(--border-card, rgba(255,255,255,0.1))',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--color-primary-500, #6366f1), var(--color-accent-500, #8b5cf6))',
              transition: 'width 200ms ease',
              borderRadius: 999,
            }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <p role="alert" style={{ margin: 0, fontSize: 13, color: '#ef4444' }}>
          ⚠ {error}
        </p>
      )}

      {/* Results summary + download */}
      {results && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          padding: '10px 14px',
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: 'var(--radius-md, 10px)',
          fontSize: 13,
        }}>
          <span style={{ color: '#22c55e', fontWeight: 600 }}>
            ✓ {results.processed_rows} rows processed
            {results.error_rows > 0 && ` · ${results.error_rows} errors`}
          </span>
          <button
            type="button"
            className="btn-primary"
            onClick={handleDownload}
            style={{ fontSize: 12, padding: '6px 14px' }}
          >
            Download Results
          </button>
        </div>
      )}
    </div>
  )
}
