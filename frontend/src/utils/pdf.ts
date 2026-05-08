import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Generate a filename with timestamp suffix.
 * Format: PREFIX_YYYYMMDD_HHMMSS.pdf
 */
export function generateFilename(prefix: string): string {
  const now = new Date()
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')

  const year = now.getFullYear()
  const month = pad(now.getMonth() + 1)
  const day = pad(now.getDate())
  const hours = pad(now.getHours())
  const minutes = pad(now.getMinutes())
  const seconds = pad(now.getSeconds())

  const datePart = `${year}${month}${day}`
  const timePart = `${hours}${minutes}${seconds}`
  const upperPrefix = prefix.toUpperCase().replace(/\s+/g, '_')

  return `${upperPrefix}_${datePart}_${timePart}.pdf`
}

/**
 * Export a DOM element as a PDF using jsPDF + html2canvas.
 * Renders at 2x scale for crisp output on A4 portrait.
 */
export async function exportComparisonPDF(elementId: string): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found.`)
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: null,
  })

  const imgData = canvas.toDataURL('image/png')

  // A4 portrait dimensions in mm
  const A4_WIDTH_MM = 210
  const A4_HEIGHT_MM = 297

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const imgWidthMM = A4_WIDTH_MM
  const imgHeightMM = (canvas.height * A4_WIDTH_MM) / canvas.width

  let yOffset = 0
  let remainingHeight = imgHeightMM

  // Handle multi-page content
  while (remainingHeight > 0) {
    if (yOffset > 0) {
      pdf.addPage()
    }

    const pageHeight = Math.min(remainingHeight, A4_HEIGHT_MM)
    const sourceY = (yOffset / imgHeightMM) * canvas.height
    const sourceHeight = (pageHeight / imgHeightMM) * canvas.height

    // Create a temporary canvas for this page slice
    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = canvas.width
    pageCanvas.height = sourceHeight
    const ctx = pageCanvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight)
    }

    const pageImgData = pageCanvas.toDataURL('image/png')
    pdf.addImage(pageImgData, 'PNG', 0, 0, imgWidthMM, pageHeight)

    yOffset += A4_HEIGHT_MM
    remainingHeight -= A4_HEIGHT_MM
  }

  const filename = generateFilename('Comparison_Report')
  pdf.save(filename)
}
