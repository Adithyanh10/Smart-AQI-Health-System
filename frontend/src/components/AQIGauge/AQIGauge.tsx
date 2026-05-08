import React from 'react'
import { getAQIColor } from '../../utils/aqi'
import type { AQICategory } from '../../types'

interface AQIGaugeProps {
  aqi: number | null
  category: AQICategory | null
}

// Gauge arc geometry — left half of a wider canvas
const START_ANGLE = 210
const SWEEP = 240
const CX = 150        // shifted left to leave room for legend
const CY = 155
const RADIUS = 115
const STROKE_WIDTH = 16

// Legend starts at x=290, full SVG width=500
const LEG_X = 292
const LEG_Y_START = 30
const LEG_ROW_H = 34

function polarToXY(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

function arcPath(startDeg: number, endDeg: number, r: number) {
  const s = polarToXY(startDeg, r)
  const e = polarToXY(endDeg, r)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
}

const ZONES: { min: number; max: number; color: string; label: AQICategory }[] = [
  { min: 0,   max: 50,  color: '#22c55e', label: 'Good' },
  { min: 50,  max: 100, color: '#eab308', label: 'Moderate' },
  { min: 100, max: 150, color: '#f97316', label: 'Unhealthy for Sensitive Groups' },
  { min: 150, max: 200, color: '#ef4444', label: 'Unhealthy' },
  { min: 200, max: 300, color: '#a855f7', label: 'Very Unhealthy' },
  { min: 300, max: 500, color: '#7f1d1d', label: 'Hazardous' },
]

// Wrap long labels at ~18 chars per line
function wrapLabel(label: string): string[] {
  const words = label.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if ((current + ' ' + word).trim().length > 18 && current) {
      lines.push(current.trim())
      current = word
    } else {
      current = (current + ' ' + word).trim()
    }
  }
  if (current) lines.push(current)
  return lines
}

function aqiToAngle(aqi: number): number {
  const clamped = Math.max(0, Math.min(500, aqi))
  return START_ANGLE + (clamped / 500) * SWEEP
}

export function AQIGauge({ aqi, category }: AQIGaugeProps) {
  const needleAngle = aqi != null ? aqiToAngle(aqi) : START_ANGLE
  const isPulsing   = aqi != null && aqi > 200
  const color       = category ? getAQIColor(category) : '#94a3b8'
  const displayAQI  = aqi != null ? Math.round(aqi) : '--'
  const displayCategory = category ?? 'No Data'

  const tip       = polarToXY(needleAngle, RADIUS - STROKE_WIDTH - 4)
  const baseLeft  = polarToXY(needleAngle - 90, 8)
  const baseRight = polarToXY(needleAngle + 90, 8)

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 4px ${color}); }
          50%       { filter: drop-shadow(0 0 14px ${color}); }
        }
        .aqi-value-text { transition: fill 800ms ease; }
        ${isPulsing ? `.aqi-pulse { animation: pulse-glow 1.5s ease-in-out infinite; }` : ''}
      `}</style>

      {/* Single SVG: gauge on left, legend column on right */}
      <svg
        viewBox="0 0 500 220"
        role="img"
        aria-label={`AQI gauge showing ${displayAQI}, category: ${displayCategory}`}
        style={{ width: '100%', display: 'block' }}
      >
        {/* ── Gauge arcs ─────────────────────────────────────── */}
        {/* Track background */}
        <path
          d={arcPath(START_ANGLE, START_ANGLE + SWEEP, RADIUS)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE_WIDTH + 2}
          strokeLinecap="butt"
        />

        {/* Coloured zone arcs */}
        {ZONES.map((zone) => {
          const startDeg = START_ANGLE + (zone.min / 500) * SWEEP
          const endDeg   = START_ANGLE + (zone.max / 500) * SWEEP
          return (
            <path
              key={zone.label}
              d={arcPath(startDeg, endDeg, RADIUS)}
              fill="none"
              stroke={zone.color}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="butt"
              opacity={0.88}
            />
          )
        })}

        {/* ── Needle ─────────────────────────────────────────── */}
        <g className={isPulsing ? 'aqi-pulse' : ''}>
          <polygon
            points={`${tip.x},${tip.y} ${baseLeft.x},${baseLeft.y} ${CX},${CY} ${baseRight.x},${baseRight.y}`}
            fill={color}
            style={{ transition: 'all 800ms cubic-bezier(0.34,1.56,0.64,1)' }}
          />
          <circle cx={CX} cy={CY} r={10} fill={color} />
        </g>

        {/* ── AQI value & category ───────────────────────────── */}
        <text
          x={CX} y={CY + 32}
          textAnchor="middle"
          className={`aqi-value-text${isPulsing ? ' aqi-pulse' : ''}`}
          fill={color}
          fontSize="46"
          fontWeight="800"
          fontFamily="var(--font-sans, system-ui)"
        >
          {displayAQI}
        </text>
        <text
          x={CX} y={CY + 54}
          textAnchor="middle"
          fill="var(--text-secondary, #94a3b8)"
          fontSize="12"
          fontWeight="500"
          fontFamily="var(--font-sans, system-ui)"
        >
          {displayCategory}
        </text>

        {/* ── Scale tick labels ──────────────────────────────── */}
        {[0, 100, 200, 300, 400, 500].map((val) => {
          const pos = polarToXY(aqiToAngle(val), RADIUS + 18)
          return (
            <text
              key={val}
              x={pos.x} y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="rgba(148,163,184,0.7)"
              fontSize="9"
              fontFamily="var(--font-sans, system-ui)"
            >
              {val}
            </text>
          )
        })}

        {/* ── Divider between gauge and legend ──────────────── */}
        <line
          x1="282" y1="10" x2="282" y2="210"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
        />

        {/* ── Legend column ──────────────────────────────────── */}
        {ZONES.map((zone, i) => {
          const isActive = category === zone.label
          const y = LEG_Y_START + i * LEG_ROW_H
          const lines = wrapLabel(zone.label)

          return (
            <g key={zone.label}>
              {/* Active highlight pill */}
              {isActive && (
                <rect
                  x={LEG_X - 4}
                  y={y - 2}
                  width={208}
                  height={LEG_ROW_H - 4}
                  rx={6}
                  fill={`${zone.color}22`}
                  stroke={`${zone.color}55`}
                  strokeWidth={1}
                />
              )}

              {/* Colour swatch */}
              <rect
                x={LEG_X}
                y={y + (LEG_ROW_H - 4) / 2 - 5}
                width={10}
                height={10}
                rx={3}
                fill={zone.color}
              />

              {/* Label text (wrapped) */}
              {lines.map((line, li) => (
                <text
                  key={li}
                  x={LEG_X + 16}
                  y={y + (lines.length === 1 ? (LEG_ROW_H - 4) / 2 + 4 : li === 0 ? (LEG_ROW_H - 4) / 2 - 2 : (LEG_ROW_H - 4) / 2 + 10)}
                  fill={isActive ? zone.color : 'var(--text-secondary, #94a3b8)'}
                  fontSize={isActive ? '11.5' : '11'}
                  fontWeight={isActive ? '700' : '500'}
                  fontFamily="var(--font-sans, system-ui)"
                >
                  {line}
                </text>
              ))}

              {/* AQI range */}
              <text
                x={LEG_X + 16}
                y={y + LEG_ROW_H - 7}
                fill="rgba(100,116,139,0.9)"
                fontSize="9"
                fontFamily="var(--font-sans, system-ui)"
              >
                {zone.min}–{zone.max === 500 ? '500+' : zone.max}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
