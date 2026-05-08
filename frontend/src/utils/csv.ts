/**
 * Parse CSV text into an array of row objects.
 * Handles quoted fields and comma-separated values.
 */
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length < 2) return []

  const headers = splitCSVLine(lines[0])
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i])
    if (values.length === 0) continue
    const row: Record<string, string> = {}
    headers.forEach((header, idx) => {
      row[header.trim()] = (values[idx] ?? '').trim()
    })
    rows.push(row)
  }

  return rows
}

/**
 * Split a single CSV line respecting quoted fields.
 */
function splitCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

/**
 * Format a single row object as a CSV line.
 */
export function formatCSVRow(row: Record<string, string | number>): string {
  return Object.values(row)
    .map((value) => {
      const str = String(value)
      // Quote fields that contain commas, quotes, or newlines
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    })
    .join(',')
}

/**
 * Trigger a browser download of CSV data.
 */
export function downloadCSV(rows: Record<string, unknown>[], filename: string): void {
  if (rows.length === 0) return

  const headers = Object.keys(rows[0])
  const headerLine = headers.join(',')
  const dataLines = rows.map((row) =>
    formatCSVRow(row as Record<string, string | number>)
  )
  const csvContent = [headerLine, ...dataLines].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
