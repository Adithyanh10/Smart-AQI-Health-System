import React from 'react'

export function SkeletonCard({ height = 200 }: { height?: number }) {
  return (
    <div
      className="skeleton"
      style={{ height, width: '100%', borderRadius: 'var(--radius-xl)' }}
      aria-busy="true"
      aria-label="Loading..."
      role="status"
    />
  )
}

export function SkeletonLine({ width = '100%', height = 16 }: { width?: string | number; height?: number }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: 'var(--radius-sm)' }}
      aria-hidden="true"
    />
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          height={14}
        />
      ))}
    </div>
  )
}
