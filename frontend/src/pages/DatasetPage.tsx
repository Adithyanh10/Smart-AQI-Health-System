import React, { useEffect, useState } from 'react'
import { getDataset, getDatasetStats } from '../services/api'
import type { DatasetRow, DatasetStats } from '../types'
import { CorrelationHeatmap } from '../components/Charts/CorrelationHeatmap'
import { OutlierHighlighter } from '../components/DatasetExplorer/OutlierHighlighter'

const PAGE_SIZE = 25
const COLUMNS: (keyof DatasetRow)[] = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3', 'AQI', 'AQI_Category']

type SortDir = 'asc' | 'desc'

export function DatasetPage() {
  const [rows, setRows] = useState<DatasetRow[]>([])
  const [stats, setStats] = useState<DatasetStats | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [sortCol, setSortCol] = useState<keyof DatasetRow>('AQI')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setStatsLoading(true)
    getDatasetStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false))
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    getDataset(page, PAGE_SIZE)
      .then(res => {
        setRows(res.items)
        setTotal(res.total)
        setTotalPages(res.total_pages)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load dataset'))
      .finally(() => setLoading(false))
  }, [page])

  const handleSort = (col: keyof DatasetRow) => {
    if (col === sortCol) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  const sortedRows = [...rows].sort((a, b) => {
    const av = a[sortCol]
    const bv = b[sortCol]
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDir === 'asc' ? av - bv : bv - av
    }
    return sortDir === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av))
  })

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: 'var(--text-primary, #f1f5f9)' }}>
        Dataset Explorer
      </h1>

      {/* Summary stats */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <div className="glass-card" style={{ padding: '12px 20px', minWidth: 140 }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary, #94a3b8)' }}>Total Rows</p>
          <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: 'var(--text-primary, #f1f5f9)' }}>
            {statsLoading ? '…' : (stats?.total_rows ?? total).toLocaleString()}
          </p>
        </div>
        <div className="glass-card" style={{ padding: '12px 20px', minWidth: 140 }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary, #94a3b8)' }}>Outlier Rows</p>
          <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: '#f97316' }}>
            {statsLoading ? '…' : stats?.outlier_rows ?? '—'}
          </p>
        </div>
        {stats && (
          <div className="glass-card" style={{ padding: '12px 20px', minWidth: 140 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary, #94a3b8)' }}>Outlier %</p>
            <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: '#eab308' }}>
              {stats.outlier_pct.toFixed(1)}%
            </p>
          </div>
        )}
      </div>

      {/* Statistics panel */}
      {stats && (
        <div className="glass-card" style={{ padding: 20, marginBottom: 24, overflowX: 'auto' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)' }}>
            Column Statistics
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Column', 'Mean', 'Median', 'Std', 'Min', 'Max'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 10px', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.columns.map(col => (
                <tr key={col.column} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '6px 10px', fontWeight: 600, color: 'var(--text-primary, #f1f5f9)' }}>{col.column}</td>
                  <td style={{ padding: '6px 10px', color: 'var(--text-secondary, #94a3b8)' }}>{col.mean.toFixed(2)}</td>
                  <td style={{ padding: '6px 10px', color: 'var(--text-secondary, #94a3b8)' }}>{col.median.toFixed(2)}</td>
                  <td style={{ padding: '6px 10px', color: 'var(--text-secondary, #94a3b8)' }}>{col.std.toFixed(2)}</td>
                  <td style={{ padding: '6px 10px', color: 'var(--text-secondary, #94a3b8)' }}>{col.min.toFixed(2)}</td>
                  <td style={{ padding: '6px 10px', color: 'var(--text-secondary, #94a3b8)' }}>{col.max.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Data table */}
      <div className="glass-card" style={{ padding: 20, overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)' }}>
            Dataset Rows
          </h2>
          <span style={{ fontSize: 12, color: 'var(--text-secondary, #94a3b8)' }}>
            Page {page} of {totalPages} · {total.toLocaleString()} rows
          </span>
        </div>

        {error && (
          <p role="alert" style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              {COLUMNS.map(col => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  style={{
                    textAlign: 'left',
                    padding: '8px 10px',
                    color: sortCol === col ? 'var(--text-primary, #f1f5f9)' : 'var(--text-secondary, #94a3b8)',
                    fontWeight: 600,
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                  }}
                  aria-sort={sortCol === col ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  {col} {sortCol === col ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {COLUMNS.map(col => (
                      <td key={col} style={{ padding: '8px 10px' }}>
                        <div style={{ height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.07)', animation: 'shimmer 1.5s infinite' }} />
                      </td>
                    ))}
                  </tr>
                ))
              : sortedRows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {COLUMNS.map(col => (
                      <td key={col} style={{ padding: '7px 10px', color: 'var(--text-secondary, #94a3b8)' }}>
                        {typeof row[col] === 'number' ? (row[col] as number).toFixed(2) : String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))
            }
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button
            className="btn-secondary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            style={{ fontSize: 13, padding: '6px 14px' }}
          >
            ← Prev
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-secondary, #94a3b8)', alignSelf: 'center' }}>
            {page} / {totalPages}
          </span>
          <button
            className="btn-secondary"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            style={{ fontSize: 13, padding: '6px 14px' }}
          >
            Next →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
