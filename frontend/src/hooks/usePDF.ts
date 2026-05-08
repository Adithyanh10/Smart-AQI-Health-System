import { useCallback, useState } from 'react'
import { downloadPDF } from '../services/api'
import { exportComparisonPDF, generateFilename } from '../utils/pdf'
import type { AQICategory } from '../types'

export function usePDF() {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const downloadReport = useCallback(
    async (aqi: number, category: AQICategory, modelId?: string) => {
      setDownloading(true)
      setError(null)
      try {
        const blob = await downloadPDF(aqi, category, modelId)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = generateFilename('AQI_Report')
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to download report'
        setError(msg)
      } finally {
        setDownloading(false)
      }
    },
    []
  )

  const exportComparison = useCallback(async (elementId: string) => {
    setDownloading(true)
    setError(null)
    try {
      await exportComparisonPDF(elementId)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to export comparison'
      setError(msg)
    } finally {
      setDownloading(false)
    }
  }, [])

  return { downloading, error, downloadReport, exportComparison }
}
