import React from 'react'
import { usePDF } from '../../hooks/usePDF'
import { useToast } from '../Shared/Toast'
import type { AQICategory } from '../../types'

interface PDFButtonProps {
  aqi: number
  category: AQICategory
  modelId?: string
}

export function PDFButton({ aqi, category, modelId }: PDFButtonProps) {
  const { downloading, downloadReport } = usePDF()
  const { toast } = useToast()

  const handleClick = async () => {
    try {
      await downloadReport(aqi, category, modelId)
    } catch {
      toast.error('Failed to download report. Please try again.', () => handleClick())
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={downloading}
      className="btn-primary"
      aria-label="Download AQI health impact report as PDF"
      aria-busy={downloading}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
    >
      {downloading ? (
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
          Generating…
        </>
      ) : (
        <>
          <span aria-hidden="true">📄</span>
          Download Report
        </>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  )
}
