import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useI18n } from '../../hooks/useI18n'
import { useProfile } from '../../hooks/useProfile'
import { useLiveLocation } from '../../hooks/useLiveLocation'
import { LANGUAGES } from '../../context/I18nContext'

// -- SVG icon components (no emoji — avoids encoding issues) ------------------

const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const IconVoice = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
)
const IconCompare = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="3" x2="12" y2="21"/>
    <polyline points="17 8 12 3 7 8"/><polyline points="7 16 12 21 17 16"/>
  </svg>
)
const IconTravel = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
  </svg>
)
const IconMap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
    <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
)
const IconProfile = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)
const IconGlobe = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)
const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
)
const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)
const IconWind = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
  </svg>
)
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

// -- Nav link definitions ------------------------------------------------------
const NAV_LINKS = [
  { to: '/',        label: 'nav.dashboard', end: true,  Icon: IconDashboard, desc: 'Air quality overview' },
  { to: '/voice',   label: 'nav.voice',     end: false, Icon: IconVoice,     desc: 'Voice-powered queries' },
  { to: '/compare', label: 'nav.compare',   end: false, Icon: IconCompare,   desc: 'Compare AQI scenarios' },
  { to: '/travel',  label: 'nav.travel',    end: false, Icon: IconTravel,    desc: 'Travel safety advisor' },
  { to: '/map',     label: 'nav.map',       end: false, Icon: IconMap,       desc: 'India AQI map' },
  { to: '/profile', label: 'nav.profile',   end: false, Icon: IconProfile,   desc: 'Your profile & history' },
]// -- LiveIndicator -------------------------------------------------------------
function LiveIndicator({ isConnected }: { isConnected: boolean }) {
  if (!isConnected) return null
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse-ring 1.5s ease-in-out infinite', boxShadow: '0 0 6px #10b981' }} />
      <span style={{ color: '#10b981' }}>LIVE</span>
    </span>
  )
}

// -- ThemeToggle ---------------------------------------------------------------
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary,#8ba3c7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
      onMouseOver={e => { e.currentTarget.style.background = 'rgba(14,165,233,0.15)'; e.currentTarget.style.borderColor = 'rgba(14,165,233,0.4)' }}
      onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
    >
      {theme === 'dark' ? <IconSun /> : <IconMoon />}
    </button>
  )
}

// -- LanguageSwitcher ----------------------------------------------------------
function LanguageSwitcher() {
  const { language, setLanguage } = useI18n()
  const [open, setOpen] = React.useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const currentLang = LANGUAGES.find(l => l.code === language)
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} aria-label="Change language"
        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary,#8ba3c7)', cursor: 'pointer', fontSize: 11, fontWeight: 600, transition: 'all 0.15s' }}
        onMouseOver={e => { e.currentTarget.style.background = 'rgba(14,165,233,0.12)'; e.currentTarget.style.borderColor = 'rgba(14,165,233,0.3)' }}
        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
      >
        <IconGlobe /> {currentLang?.nativeLabel ?? 'EN'}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 38, right: 0, width: 200, background: 'rgba(10,13,31,0.97)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: 12, boxShadow: '0 16px 48px rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', zIndex: 300, maxHeight: 320, overflowY: 'auto' }}>
          {LANGUAGES.map(lang => (
            <button key={lang.code} onClick={() => { setLanguage(lang.code); setOpen(false) }}
              style={{ width: '100%', padding: '10px 14px', background: language === lang.code ? 'rgba(14,165,233,0.12)' : 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', color: language === lang.code ? '#38bdf8' : 'var(--text-secondary,#8ba3c7)', cursor: 'pointer', fontSize: 12, fontWeight: language === lang.code ? 700 : 500, textAlign: 'left', transition: 'all 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onMouseOver={e => { if (language !== lang.code) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseOut={e => { if (language !== lang.code) e.currentTarget.style.background = 'transparent' }}
            >
              <span>{lang.nativeLabel}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted,#4a6080)' }}>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// -- MobileQRButton ------------------------------------------------------------
// Fetches the best available URL (tunnel > LAN > localhost) from the backend,
// then shows a full-screen QR modal centered on the viewport via a React portal.
function MobileInstallButton() {
  const [open, setOpen] = useState(false)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [mode, setMode] = useState<'tunnel' | 'lan' | 'localhost' | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNetworkInfo = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/network/info')
      if (!res.ok) throw new Error('Backend unreachable')
      const data = await res.json()
      setQrUrl(data.qr_url)
      setMode(data.mode)
    } catch {
      setError('Could not detect network info. Make sure the backend is running.')
      setQrUrl(null)
      setMode(null)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setOpen(true)
    if (!qrUrl) fetchNetworkInfo()
  }

  const handleClose = () => setOpen(false)

  const copyUrl = () => {
    if (!qrUrl) return
    navigator.clipboard.writeText(qrUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open])

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Lazy-load QRCodeSVG only when needed
  const [QRCodeSVG, setQRCodeSVG] = useState<React.ComponentType<Record<string, unknown>> | null>(null)
  useEffect(() => {
    if (open && !QRCodeSVG) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      import('qrcode.react').then((m: any) => setQRCodeSVG(() => m.QRCodeSVG))
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        aria-label="Open on phone via QR code"
        title="Use on mobile"
        style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s', flexShrink: 0,
          color: 'var(--text-secondary,#8ba3c7)',
        }}
        onMouseOver={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.15)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.45)'; e.currentTarget.style.color = '#34d399' }}
        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-secondary,#8ba3c7)' }}
      >
        <IconPhone />
      </button>

      {/* Full-screen QR modal — rendered via portal so it escapes navbar stacking context */}
      {open && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={handleClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 9000,
              background: 'rgba(0,0,0,0.78)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          />

          {/* Modal — perfectly centered on viewport */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Open on mobile"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9001,
              width: 'min(460px, 94vw)',
              maxHeight: '92vh',
              overflowY: 'auto',
              background: 'rgba(4,12,7,0.98)',
              border: '1px solid rgba(16,185,129,0.35)',
              borderRadius: 22,
              boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(52,211,153,0.1) inset',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              animation: 'qr-modal-in 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            {/* Top accent bar */}
            <div style={{ height: 3, background: 'linear-gradient(90deg,#10b981,#f59e0b,#10b981)', borderRadius: '22px 22px 0 0' }} />

            {/* Header */}
            <div style={{ padding: '20px 22px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(16,185,129,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#10b981,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}>
                  <IconPhone />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#e8fdf4', letterSpacing: '-0.01em' }}>Open on Your Phone</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#7ab89a' }}>Same Wi-Fi &middot; Instant access</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close"
                style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#7ab89a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = '#fca5a5' }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#7ab89a' }}
              >
                <IconX />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '22px 24px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>

              {/* Mode badge */}
              {mode && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', background: mode === 'tunnel' ? 'rgba(245,158,11,0.15)' : mode === 'lan' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.07)', border: mode === 'tunnel' ? '1px solid rgba(245,158,11,0.4)' : mode === 'lan' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.12)', color: mode === 'tunnel' ? '#fbbf24' : mode === 'lan' ? '#34d399' : '#7ab89a' }}>
                    {mode === 'tunnel' ? 'Internet Tunnel (any Wi-Fi)' : mode === 'lan' ? 'Local Network (same Wi-Fi)' : 'Localhost only'}
                  </span>
                </div>
              )}

              {/* QR Code */}
              <div style={{ padding: 18, borderRadius: 18, background: '#ffffff', boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 4px rgba(16,185,129,0.25)', border: '3px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 240, height: 240 }}>
                {loading && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#555' }}>
                    <div style={{ width: 32, height: 32, border: '3px solid rgba(16,185,129,0.2)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'qr-spin 0.8s linear infinite' }} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Detecting...</span>
                  </div>
                )}
                {!loading && qrUrl && QRCodeSVG && (
                  <QRCodeSVG value={qrUrl} size={204} bgColor="#ffffff" fgColor="#071a0e" level="M" />
                )}
                {!loading && !qrUrl && !error && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: '#999' }}>
                    <div style={{ width: 32, height: 32, border: '3px solid #ddd', borderTopColor: '#10b981', borderRadius: '50%', animation: 'qr-spin 0.8s linear infinite' }} />
                    <span style={{ fontSize: 12 }}>Generating...</span>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', width: '100%' }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#fca5a5', lineHeight: 1.5 }}>{error}</p>
                </div>
              )}

              {/* URL row */}
              {qrUrl && (
                <div style={{ width: '100%' }}>
                  <p style={{ margin: '0 0 7px', fontSize: 10, fontWeight: 700, color: '#3d6b52', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                    {mode === 'tunnel' ? 'Public Tunnel URL' : 'LAN Address'}
                  </p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ flex: 1, padding: '10px 13px', borderRadius: 9, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.22)', fontSize: 12, fontWeight: 700, color: '#34d399', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                      {qrUrl}
                    </div>
                    <button onClick={copyUrl} style={{ padding: '10px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700, background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)', border: copied ? '1px solid rgba(16,185,129,0.45)' : '1px solid rgba(255,255,255,0.12)', color: copied ? '#34d399' : '#7ab89a', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button onClick={fetchNetworkInfo} title="Refresh" style={{ padding: '10px 11px', borderRadius: 9, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#7ab89a', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <IconRefresh />
                    </button>
                  </div>
                </div>
              )}

              {/* Different Wi-Fi setup guide */}
              <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.1)', borderBottom: '1px solid rgba(245,158,11,0.15)' }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>Different Wi-Fi? Use ngrok (free)</p>
                </div>
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { n: '1', cmd: 'winget install ngrok', label: 'Install ngrok (one time)' },
                    { n: '2', cmd: 'ngrok config add-authtoken YOUR_TOKEN', label: 'Add your free token from ngrok.com' },
                    { n: '3', cmd: 'ngrok http 5173', label: 'Run in a new terminal — get public URL' },
                    { n: '4', cmd: '$env:TUNNEL_URL="https://xxxx.ngrok-free.app"', label: 'Set env var, restart backend' },
                  ].map(item => (
                    <div key={item.n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(245,158,11,0.25)', border: '1px solid rgba(245,158,11,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fbbf24', flexShrink: 0, marginTop: 2 }}>{item.n}</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: '0 0 2px', fontSize: 10, color: '#7ab89a' }}>{item.label}</p>
                        <code style={{ fontSize: 10, color: '#34d399', background: 'rgba(16,185,129,0.08)', padding: '2px 6px', borderRadius: 4, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.cmd}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <style>{`
            @keyframes qr-spin { to { transform: rotate(360deg); } }
            @keyframes qr-modal-in {
              from { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }
              to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
          `}</style>
        </>,
        document.body
      )}
    </>
  )
}

// -- LocationWidget ------------------------------------------------------------
function LocationWidget() {
  const { status, data, error, fetchLocation } = useLiveLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const isLoading = status === 'locating' || status === 'fetching'
  const hasData = status === 'success' && data
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => { if (!hasData) fetchLocation(); setOpen(o => !o) }} aria-label="Location info"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: hasData ? '0 12px' : '0', width: hasData ? 'auto' : 34, borderRadius: hasData ? 20 : '50%', background: hasData ? 'rgba(16,185,129,0.12)' : isLoading ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.06)', border: hasData ? '1px solid rgba(16,185,129,0.35)' : isLoading ? '1px solid rgba(14,165,233,0.4)' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, position: 'relative', justifyContent: 'center', maxWidth: 200, overflow: 'hidden', whiteSpace: 'nowrap', color: hasData ? '#10b981' : 'var(--text-secondary,#8ba3c7)' }}
      >
        {isLoading
          ? <span style={{ width: 13, height: 13, border: '2px solid rgba(14,165,233,0.3)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
          : <IconPin />
        }
        {hasData && data && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#10b981', overflow: 'hidden' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 90 }}>{data.city}</span>
            {data.state && <><span style={{ color: 'rgba(16,185,129,0.4)', fontSize: 10 }}>&middot;</span><span style={{ fontSize: 11, color: 'rgba(16,185,129,0.75)', flexShrink: 0 }}>{data.state}</span></>}
          </span>
        )}
        {hasData && <span style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, borderRadius: '50%', background: '#10b981', border: '1.5px solid rgba(5,7,20,0.9)', boxShadow: '0 0 4px #10b981' }} />}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 42, right: 0, width: 260, background: 'rgba(10,13,31,0.97)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', zIndex: 300, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid rgba(14,165,233,0.12)', background: 'linear-gradient(135deg,rgba(14,165,233,0.08),rgba(168,85,247,0.06))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 5 }}><IconPin /> Live Location</span>
            <button onClick={() => fetchLocation()} title="Refresh" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted,#4a6080)', padding: 0, display: 'flex', alignItems: 'center' }}><IconRefresh /></button>
          </div>
          <div style={{ padding: '14px 16px' }}>
            {isLoading && <div style={{ textAlign: 'center', padding: '12px 0', color: '#38bdf8', fontSize: 13 }}><span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(56,189,248,0.3)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginRight: 8, verticalAlign: 'middle' }} />{status === 'locating' ? 'Getting your location...' : 'Fetching air quality...'}</div>}
            {status === 'error' && error && <p style={{ margin: 0, fontSize: 12, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 10px', borderRadius: 8 }}>{error}</p>}
            {hasData && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 800, color: 'var(--text-primary,#f0f6ff)' }}>{data!.city}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary,#8ba3c7)' }}>{[data!.state, data!.country].filter(Boolean).join(', ')}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[{ label: 'Latitude', value: `${data!.lat.toFixed(4)}N` }, { label: 'Longitude', value: `${data!.lng.toFixed(4)}E` }].map(item => (
                    <div key={item.label} style={{ padding: '8px 10px', background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 8 }}>
                      <p style={{ margin: '0 0 2px', fontSize: 10, color: 'var(--text-muted,#4a6080)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#38bdf8' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <p style={{ margin: '0 0 6px', fontSize: 10, color: 'var(--text-muted,#4a6080)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live Pollutants (ug/m3)</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5 }}>
                    {(Object.entries(data!.pollutants) as [string, number][]).map(([key, val]) => (
                      <div key={key} style={{ textAlign: 'center', padding: '5px 4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6 }}>
                        <p style={{ margin: 0, fontSize: 9, color: 'var(--text-muted,#4a6080)' }}>{key}</p>
                        <p style={{ margin: '1px 0 0', fontSize: 12, fontWeight: 700, color: 'var(--text-primary,#f0f6ff)' }}>{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted,#4a6080)', textAlign: 'right' }}>Updated {data!.fetchedAt.toLocaleTimeString()}</p>
              </>
            )}
            {status === 'idle' && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--text-secondary,#8ba3c7)' }}>Click to fetch your live location and air quality data.</p>
                <button onClick={() => fetchLocation()} style={{ padding: '7px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg,#0ea5e9,#a855f7)', border: 'none', color: '#fff', cursor: 'pointer' }}>Get My Location</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// -- SidebarDrawer -------------------------------------------------------------
function SidebarDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n()
  const location = useLocation()
  const { profile } = useProfile()
  const initials = profile?.name
    ? profile.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : null

  useEffect(() => { onClose() }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <div onClick={onClose} aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'var(--bg-overlay)', backdropFilter: 'blur(8px)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity 0.25s ease' }} />
      <aside aria-label="Navigation menu" role="navigation" style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 280, zIndex: 500, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-card)', backdropFilter: 'blur(24px)', transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#0ea5e9,#a855f7,#10b981)', flexShrink: 0 }} />

        {/* Header */}
        <div style={{ padding: '16px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#0ea5e9,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 14px rgba(14,165,233,0.4)', color: '#fff' }}>
              <IconWind />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, background: 'linear-gradient(135deg,#38bdf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AQI Health</span>
          </NavLink>
          <button onClick={onClose} aria-label="Close menu" style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary,#8ba3c7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconX />
          </button>
        </div>

        {/* Profile card */}
        <NavLink to="/profile" style={{ textDecoration: 'none', margin: '14px 16px 4px', display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.15)', transition: 'background 0.15s' }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(14,165,233,0.13)' }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(14,165,233,0.07)' }}
          >
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#0ea5e9,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, flexShrink: 0, boxShadow: '0 0 10px rgba(14,165,233,0.35)' }}>
              {initials ?? <IconProfile />}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary,#f0f6ff)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.name ?? 'My Profile'}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted,#4a6080)' }}>{profile?.city ?? 'View profile'}</p>
            </div>
            <div style={{ marginLeft: 'auto', color: 'var(--text-muted,#4a6080)', flexShrink: 0 }}><IconChevronRight /></div>
          </div>
        </NavLink>

        <p style={{ margin: '16px 20px 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted,#4a6080)' }}>Navigation</p>

        {/* Nav links */}
        <nav style={{ padding: '0 10px', flex: 1 }}>
          {NAV_LINKS.map(link => (
            <NavLink key={link.to} to={link.to} end={link.end}
              style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10, marginBottom: 3, textDecoration: 'none', background: isActive ? 'rgba(14,165,233,0.12)' : 'transparent', border: isActive ? '1px solid rgba(14,165,233,0.25)' : '1px solid transparent', transition: 'all 0.15s' })}
              onMouseOver={e => { const el = e.currentTarget as HTMLElement; if (el.style.background === 'transparent') el.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseOut={e => { const el = e.currentTarget as HTMLElement; if (!el.getAttribute('aria-current')) el.style.background = 'transparent' }}
            >
              {({ isActive }) => (
                <>
                  <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? 'rgba(14,165,233,0.18)' : 'rgba(255,255,255,0.05)', border: isActive ? '1px solid rgba(14,165,233,0.3)' : '1px solid rgba(255,255,255,0.07)', color: isActive ? '#38bdf8' : 'var(--text-secondary,#8ba3c7)' }}>
                    <link.Icon />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? '#38bdf8' : 'var(--text-primary,#f0f6ff)', lineHeight: 1.2 }}>{t(link.label)}</p>
                    <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted,#4a6080)', marginTop: 1 }}>{link.desc}</p>
                  </div>
                  {isActive && <div style={{ marginLeft: 'auto', width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(180deg,#0ea5e9,#a855f7)', flexShrink: 0 }} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '14px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <p style={{ margin: '0 0 2px', fontSize: 10, color: 'var(--text-muted,#4a6080)', textAlign: 'center' }}>AQI Health System v1.0</p>
          <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted,#4a6080)', textAlign: 'center' }}>Data: Open-Meteo &middot; ML: scikit-learn</p>
        </div>
      </aside>
    </>
  )
}

// -- Main NavBar export --------------------------------------------------------
export function NavBar({ isConnected = false }: { isConnected?: boolean }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { t } = useI18n()
  const location = useLocation()
  const match = NAV_LINKS.find(l => l.end ? location.pathname === l.to : location.pathname.startsWith(l.to))
  const pageTitle = match ? t(match.label) : ''

  return (
    <>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.4)} }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Hamburger button */
        .hbtn {
          width: 36px; height: 36px;
          border-radius: var(--radius-lg, 12px);
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          cursor: pointer;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 4px; transition: all 0.2s;
          flex-shrink: 0; padding: 0;
          color: var(--text-secondary);
        }
        .hbtn:hover {
          background: var(--bg-card-hover);
          border-color: var(--border-accent);
          color: var(--text-primary);
        }
        .hline {
          width: 16px; height: 1.5px;
          border-radius: 1px;
          background: currentColor;
          transition: all 0.2s;
          display: block;
        }

        /* Navbar desktop nav links */
        .nav-link-desktop {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px;
          border-radius: var(--radius-lg, 10px);
          font-size: 13px; font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.15s;
          border: 1px solid transparent;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .nav-link-desktop:hover {
          background: var(--bg-card);
          color: var(--text-primary);
          text-decoration: none;
          border-color: var(--border-subtle);
        }
        .nav-link-desktop.active {
          background: var(--bg-card);
          color: var(--color-primary-400);
          border-color: var(--border-accent);
          font-weight: 600;
        }
        [data-theme="light"] .nav-link-desktop.active {
          color: var(--color-primary-600);
        }

        /* Sidebar nav links */
        .sidebar-nav-link {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-lg, 10px);
          margin-bottom: 2px;
          text-decoration: none;
          border: 1px solid transparent;
          transition: all 0.15s;
          color: var(--text-secondary);
        }
        .sidebar-nav-link:hover {
          background: var(--bg-card);
          color: var(--text-primary);
          text-decoration: none;
        }
        .sidebar-nav-link.active {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.2);
          color: var(--color-primary-400);
        }
        [data-theme="light"] .sidebar-nav-link.active {
          background: rgba(20, 184, 166, 0.08);
          border-color: rgba(20, 184, 166, 0.2);
          color: var(--color-primary-600);
        }

        /* Navbar container */
        .navbar-root {
          position: sticky; top: 0; z-index: 200;
          background: rgba(9, 9, 11, 0.85);
          border-bottom: 1px solid var(--border-subtle);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: background var(--transition-theme), border-color var(--transition-theme);
        }
        [data-theme="light"] .navbar-root {
          background: rgba(255, 255, 255, 0.88);
          border-bottom-color: var(--border-card);
        }
        .navbar-accent-bar {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, var(--color-primary-500) 30%, var(--color-accent-500) 70%, transparent 100%);
          opacity: 0.6;
        }
        .navbar-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 20px;
          height: 56px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Sidebar */
        .sidebar-root {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: 272px; z-index: 500;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-card);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          display: flex; flex-direction: column;
          overflow-y: auto;
          transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
        }
        [data-theme="light"] .sidebar-root {
          background: var(--bg-primary);
          box-shadow: 4px 0 24px rgba(15,23,42,0.08);
        }

        /* Dropdown */
        .lang-dropdown {
          position: absolute; top: 44px; right: 0;
          width: 200px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-xl, 16px);
          box-shadow: var(--shadow-xl);
          backdrop-filter: blur(20px);
          z-index: 300;
          max-height: 320px;
          overflow-y: auto;
          padding: 4px;
        }
        [data-theme="light"] .lang-dropdown {
          background: var(--bg-primary);
        }
        .lang-option {
          width: 100%; padding: 9px 12px;
          background: transparent;
          border: none; border-radius: var(--radius-md, 8px);
          color: var(--text-secondary);
          cursor: pointer; font-size: 13px; font-weight: 500;
          text-align: left; transition: all 0.12s;
          display: flex; justify-content: space-between; align-items: center;
          font-family: inherit;
        }
        .lang-option:hover { background: var(--bg-card); color: var(--text-primary); }
        .lang-option.selected {
          background: rgba(16, 185, 129, 0.08);
          color: var(--color-primary-400);
          font-weight: 600;
        }
        [data-theme="light"] .lang-option.selected {
          color: var(--color-primary-600);
        }

        /* Hide desktop nav on mobile */
        @media (max-width: 768px) {
          .navbar-desktop-links { display: none !important; }
        }
        @media (min-width: 769px) {
          .navbar-hamburger { display: none !important; }
        }
      `}</style>

      <SidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <nav aria-label="Main navigation" className="navbar-root">
        <div className="navbar-accent-bar" />
        <div className="navbar-inner">

          {/* Hamburger */}
          <button className="hbtn" onClick={() => setDrawerOpen(true)} aria-label="Open navigation menu" aria-expanded={drawerOpen}>
            <span className="hline" />
            <span className="hline" style={{ width: 13 }} />
            <span className="hline" />
          </button>

          {/* Logo */}
          <NavLink to="/" aria-label="AQI Health home" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,var(--color-primary-500),var(--color-accent-500))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <IconWind />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, background: 'linear-gradient(135deg,#38bdf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', whiteSpace: 'nowrap' }}>
              AQI Health
            </span>
          </NavLink>

          {/* Page title */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            {match && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary,#8ba3c7)', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
                <span style={{ color: 'var(--text-muted,#4a6080)', display: 'flex' }}><match.Icon /></span>
                {pageTitle}
              </span>
            )}
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <LiveIndicator isConnected={isConnected} />
            <LocationWidget />
            <ThemeToggle />
            <LanguageSwitcher />
            <MobileInstallButton />
          </div>
        </div>
      </nav>
    </>
  )
}
