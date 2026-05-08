import React from 'react'
import { getRiskColor } from '../../utils/aqi'
import type { RiskLevel } from '../../types'

interface SeverityRingProps {
  score: number
  riskLevel: RiskLevel
  size?: number
}

export function SeverityRing({ score, riskLevel, size = 64 }: SeverityRingProps) {
  const clampedScore = Math.max(0, Math.min(100, score))
  const strokeWidth = size * 0.1
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - clampedScore / 100)
  const color = getRiskColor(riskLevel)
  const center = size / 2
  const fontSize = Math.max(10, size * 0.22)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Severity score ${clampedScore} out of 100, risk level ${riskLevel}`}
      style={{ display: 'block' }}
    >
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: 'stroke-dashoffset 600ms ease' }}
      />
      {/* Score label */}
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="var(--font-sans)"
      >
        {clampedScore}
      </text>
    </svg>
  )
}
