import type { AQICategory, RiskLevel } from '../types'

// ─── AQI Boundaries ──────────────────────────────────────────────────────────

export const AQI_BOUNDARIES = {
  GOOD: { min: 0, max: 50 },
  MODERATE: { min: 51, max: 100 },
  UNHEALTHY_SENSITIVE: { min: 101, max: 150 },
  UNHEALTHY: { min: 151, max: 200 },
  VERY_UNHEALTHY: { min: 201, max: 300 },
  HAZARDOUS: { min: 301, max: 500 },
} as const

// ─── AQI Categories Array ────────────────────────────────────────────────────

export const AQI_CATEGORIES: AQICategory[] = [
  'Good',
  'Moderate',
  'Unhealthy for Sensitive Groups',
  'Unhealthy',
  'Very Unhealthy',
  'Hazardous',
]

// ─── Classify AQI ────────────────────────────────────────────────────────────

export function classifyAQI(aqi: number): AQICategory {
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very Unhealthy'
  return 'Hazardous'
}

// ─── AQI Color ───────────────────────────────────────────────────────────────

export function getAQIColor(category: AQICategory): string {
  switch (category) {
    case 'Good':
      return '#22c55e'
    case 'Moderate':
      return '#eab308'
    case 'Unhealthy for Sensitive Groups':
      return '#f97316'
    case 'Unhealthy':
      return '#ef4444'
    case 'Very Unhealthy':
      return '#a855f7'
    case 'Hazardous':
      return '#7f1d1d'
    default:
      return '#94a3b8'
  }
}

// ─── Risk Color ──────────────────────────────────────────────────────────────

export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case 'Low':
      return '#22c55e'
    case 'Moderate':
      return '#eab308'
    case 'High':
      return '#f97316'
    case 'Very High':
      return '#ef4444'
    case 'Severe':
      return '#7f1d1d'
    default:
      return '#94a3b8'
  }
}

// ─── Advisory Background Color ───────────────────────────────────────────────

export function getAdvisoryBgColor(category: AQICategory): string {
  switch (category) {
    case 'Good':
      return 'transparent'
    case 'Moderate':
      return '#fef08a'
    case 'Unhealthy for Sensitive Groups':
      return '#fed7aa'
    case 'Unhealthy':
      return '#fecaca'
    case 'Very Unhealthy':
      return '#e9d5ff'
    case 'Hazardous':
      return '#fecdd3'
    default:
      return 'transparent'
  }
}

// ─── AQI Gradient ────────────────────────────────────────────────────────────

export function getAQIGradient(category: AQICategory): string {
  switch (category) {
    case 'Good':
      return 'linear-gradient(135deg, #16a34a, #22c55e)'
    case 'Moderate':
      return 'linear-gradient(135deg, #ca8a04, #eab308)'
    case 'Unhealthy for Sensitive Groups':
      return 'linear-gradient(135deg, #ea580c, #f97316)'
    case 'Unhealthy':
      return 'linear-gradient(135deg, #dc2626, #ef4444)'
    case 'Very Unhealthy':
      return 'linear-gradient(135deg, #9333ea, #a855f7)'
    case 'Hazardous':
      return 'linear-gradient(135deg, #450a0a, #7f1d1d)'
    default:
      return 'linear-gradient(135deg, #475569, #94a3b8)'
  }
}
