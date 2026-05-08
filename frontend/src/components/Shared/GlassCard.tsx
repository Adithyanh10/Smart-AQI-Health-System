import React from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  'aria-label'?: string
  onClick?: () => void
}

export function GlassCard({ children, className = '', 'aria-label': ariaLabel, onClick }: GlassCardProps) {
  return (
    <div
      className={`glass-card ${className}`.trim()}
      aria-label={ariaLabel}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
    >
      {children}
    </div>
  )
}
