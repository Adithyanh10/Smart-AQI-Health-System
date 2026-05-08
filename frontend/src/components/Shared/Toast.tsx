import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
  onRetry?: () => void
}

interface ToastAPI {
  success: (msg: string) => void
  error: (msg: string, onRetry?: () => void) => void
  warning: (msg: string) => void
  info: (msg: string) => void
}

interface ToastContextValue {
  toast: ToastAPI
}

const ToastContext = createContext<ToastContextValue | null>(null)

const VARIANT_CONFIG: Record<ToastVariant, { bg: string; border: string; icon: string }> = {
  success: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', icon: '✓' },
  error:   { bg: 'rgba(239, 68, 68, 0.12)',  border: 'rgba(239, 68, 68, 0.3)',  icon: '✕' },
  warning: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', icon: '!' },
  info:    { bg: 'rgba(59, 130, 246, 0.12)',  border: 'rgba(59, 130, 246, 0.3)',  icon: 'i' },
}

const VARIANT_TEXT: Record<ToastVariant, string> = {
  success: 'var(--color-primary-400, #34d399)',
  error:   '#f87171',
  warning: 'var(--color-accent-400, #fbbf24)',
  info:    'var(--color-blue-400, #60a5fa)',
}

function ToastItemComponent({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const config = VARIANT_CONFIG[item.variant]
  const textColor = VARIANT_TEXT[item.variant]

  useEffect(() => {
    const duration = item.variant === 'error' ? 5000 : 3500
    timerRef.current = setTimeout(() => onDismiss(item.id), duration)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [item.id, item.variant, onDismiss])

  return (
    <div
      role="alert"
      style={{
        background: 'var(--bg-secondary)',
        border: `1px solid ${config.border}`,
        borderLeft: `3px solid ${textColor}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: '280px',
        maxWidth: '420px',
        fontSize: 'var(--text-sm)',
        animation: 'slide-in-right 0.25s var(--ease-out) both',
      }}
    >
      {/* Icon */}
      <span style={{
        width: 22, height: 22,
        borderRadius: '50%',
        background: config.bg,
        border: `1px solid ${config.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 800,
        color: textColor,
        flexShrink: 0,
      }}>
        {config.icon}
      </span>

      {/* Message */}
      <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.4 }}>
        {item.message}
      </span>

      {/* Retry */}
      {item.onRetry && (
        <button
          onClick={item.onRetry}
          style={{
            background: config.bg,
            border: `1px solid ${config.border}`,
            borderRadius: 'var(--radius-sm)',
            color: textColor,
            cursor: 'pointer',
            padding: '3px 10px',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          Retry
        </button>
      )}

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
          padding: '0 2px',
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.15s',
          flexShrink: 0,
        }}
        onMouseOver={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
        onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
      >
        ×
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const add = useCallback((variant: ToastVariant, message: string, onRetry?: () => void) => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, variant, onRetry }])
  }, [])

  const toast: ToastAPI = {
    success: (msg) => add('success', msg),
    error: (msg, onRetry) => add('error', msg, onRetry),
    warning: (msg) => add('warning', msg),
    info: (msg) => add('info', msg),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        style={{
          position: 'fixed',
          bottom: 'var(--space-6, 24px)',
          right: 'var(--space-6, 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2, 8px)',
          zIndex: 9999,
        }}
      >
        {toasts.map(item => (
          <ToastItemComponent key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
