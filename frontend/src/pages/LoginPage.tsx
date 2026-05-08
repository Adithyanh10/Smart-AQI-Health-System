import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'

const DEMO_EMAIL    = 'demo@aqi.com'
const DEMO_PASSWORD = 'demo1234'

// ── SVG icons (no emoji) ──────────────────────────────────────────────────────
const IconWind = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
  </svg>
)
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const IconQR = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <line x1="14" y1="14" x2="14" y2="14"/><line x1="17" y1="14" x2="17" y2="14"/>
    <line x1="20" y1="14" x2="20" y2="14"/><line x1="14" y1="17" x2="14" y2="17"/>
    <line x1="17" y1="17" x2="17" y2="17"/><line x1="20" y1="17" x2="20" y2="17"/>
    <line x1="14" y1="20" x2="14" y2="20"/><line x1="17" y1="20" x2="17" y2="20"/>
    <line x1="20" y1="20" x2="20" y2="20"/>
  </svg>
)
const IconLogin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
)
const IconPhone = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
)
const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)

// ── QR Code tab ───────────────────────────────────────────────────────────────
function QRLoginTab() {
  const [appUrl, setAppUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Build the full URL — works on LAN if --host is used, otherwise localhost
    const url = window.location.origin
    setAppUrl(url)
  }, [])

  const copyUrl = () => {
    navigator.clipboard.writeText(appUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '8px 0' }}>
      {/* Instruction */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary,#e8fdf4)' }}>
          Open on your phone
        </p>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary,#7ab89a)', lineHeight: 1.5 }}>
          Scan this QR code with your phone camera to open the same interface on mobile
        </p>
      </div>

      {/* QR Code */}
      <div style={{
        padding: 16, borderRadius: 16,
        background: '#ffffff',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        border: '3px solid var(--color-primary-500,#10b981)',
      }}>
        {appUrl ? (
          <QRCodeSVG
            value={appUrl}
            size={180}
            bgColor="#ffffff"
            fgColor="#0c1a0e"
            level="M"
            includeMargin={false}
          />
        ) : (
          <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            <span style={{ fontSize: 12 }}>Generating...</span>
          </div>
        )}
      </div>

      {/* Phone icon hint */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div style={{ color: 'var(--color-primary-400,#34d399)', opacity: 0.7 }}>
          <IconPhone />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--text-primary,#e8fdf4)' }}>Same session, any device</p>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary,#7ab89a)' }}>Works on iOS, Android, tablet</p>
        </div>
      </div>

      {/* URL display + copy */}
      <div style={{ width: '100%' }}>
        <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted,#3d6b52)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>App URL</p>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 12, color: 'var(--text-secondary,#7ab89a)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {appUrl || 'Loading...'}
          </div>
          <button
            onClick={copyUrl}
            style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)', border: copied ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.12)', color: copied ? '#34d399' : 'var(--text-secondary,#7ab89a)', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Note about LAN */}
      <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', width: '100%' }}>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--color-accent-400,#fbbf24)', lineHeight: 1.5 }}>
          <strong>Tip:</strong> For phone access on the same Wi-Fi, restart the frontend with{' '}
          <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: 4, fontSize: 10 }}>npm run dev -- --host</code>{' '}
          and use your computer's local IP address.
        </p>
      </div>

      {/* Refresh button */}
      <button
        onClick={() => setAppUrl(window.location.origin)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted,#3d6b52)', cursor: 'pointer', transition: 'all 0.15s' }}
        onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; e.currentTarget.style.color = 'var(--color-primary-400,#34d399)' }}
        onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-muted,#3d6b52)' }}
      >
        <IconRefresh /> Refresh QR
      </button>
    </div>
  )
}

// ── Main LoginPage ────────────────────────────────────────────────────────────
export function LoginPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'login' | 'qr'>('login')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [emailTouched, setEmailTouched] = useState(false)
  const [pwTouched, setPwTouched]       = useState(false)

  const emailError = emailTouched && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ? (!email ? 'Email is required' : 'Enter a valid email') : null
  const pwError = pwTouched && !password ? 'Password is required' : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailTouched(true); setPwTouched(true)
    if (emailError || pwError || !email || !password) return
    setLoading(true); setError(null)
    await new Promise(r => setTimeout(r, 700))
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      localStorage.setItem('aqi_session', 'true')
      navigate('/')
    } else {
      setError('Invalid credentials. Use the demo credentials below.')
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @keyframes bgFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-30px) scale(1.05)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

        .lp-page {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          background: var(--bg-primary, #030d07);
          position: relative; overflow: hidden;
        }
        .lp-orb {
          position: absolute; border-radius: 50%;
          filter: blur(90px); pointer-events: none;
        }
        .lp-card {
          width: 100%; max-width: 440px;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 24px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          padding: 40px 36px;
          box-shadow: var(--shadow-2xl);
          position: relative; z-index: 1;
          animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) both;
        }
        @media (max-width: 480px) { .lp-card { padding: 28px 20px; } }

        .lp-tab {
          flex: 1; padding: 9px 0;
          border: none; border-radius: 8px;
          font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          font-family: inherit;
        }
        .lp-tab.active {
          background: linear-gradient(135deg, var(--color-primary-500,#10b981), var(--color-accent-500,#f59e0b));
          color: #fff;
          box-shadow: 0 4px 16px rgba(16,185,129,0.35);
        }
        .lp-tab:not(.active) {
          background: transparent;
          color: var(--text-muted, #3d6b52);
        }
        .lp-tab:not(.active):hover {
          background: var(--bg-input);
          color: var(--text-secondary, #7ab89a);
        }

        .lp-input {
          width: 100%; box-sizing: border-box;
          background: var(--bg-input);
          border: 1px solid var(--border-card);
          border-radius: 10px;
          color: var(--text-primary, #e8fdf4);
          font-size: 14px; padding: 11px 14px;
          outline: none; transition: all 0.2s;
          font-family: inherit;
        }
        .lp-input:focus {
          border-color: var(--color-primary-500, #10b981);
          background: rgba(16,185,129,0.07);
          box-shadow: 0 0 0 3px rgba(16,185,129,0.15);
        }
        .lp-input--error { border-color: #ef4444 !important; }
        .lp-input::placeholder { color: var(--text-muted, #3d6b52); }

        .lp-btn {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, var(--color-primary-500,#10b981) 0%, var(--color-accent-500,#f59e0b) 100%);
          border: none; border-radius: 10px;
          color: #fff; font-size: 15px; font-weight: 700;
          cursor: pointer; font-family: 'Space Grotesk', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 24px rgba(16,185,129,0.4);
          letter-spacing: 0.01em;
          position: relative; overflow: hidden;
        }
        .lp-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
        }
        .lp-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(16,185,129,0.55);
        }
        .lp-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        [data-theme="light"] .lp-page { background: var(--bg-primary, #fdf8f0); }
        [data-theme="light"] .lp-card {
          background: var(--bg-primary);
          border-color: var(--border-card);
          box-shadow: var(--shadow-xl);
        }
        [data-theme="light"] .lp-input {
          background: rgba(255,255,255,0.7);
          border-color: rgba(15,118,110,0.2);
          color: #1c1917;
        }
        [data-theme="light"] .lp-input:focus {
          border-color: #0f766e;
          background: rgba(15,118,110,0.05);
          box-shadow: 0 0 0 3px rgba(15,118,110,0.12);
        }
        [data-theme="light"] .lp-input::placeholder { color: #78716c; }
      `}</style>

      <div className="lp-page">
        {/* Background orbs — themed */}
        <div className="lp-orb" style={{ width: 500, height: 500, background: 'rgba(16,185,129,0.1)', top: -150, left: -150, animation: 'bgFloat 8s ease-in-out infinite' }} />
        <div className="lp-orb" style={{ width: 400, height: 400, background: 'rgba(245,158,11,0.08)', bottom: -100, right: -100, animation: 'bgFloat 10s ease-in-out infinite reverse' }} />
        <div className="lp-orb" style={{ width: 200, height: 200, background: 'rgba(45,212,191,0.06)', top: '40%', right: '20%', animation: 'bgFloat 6s ease-in-out infinite' }} />

        <div className="lp-card">

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, margin: '0 auto 12px', background: 'linear-gradient(135deg, var(--color-primary-500,#10b981), var(--color-accent-500,#f59e0b))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 28px rgba(16,185,129,0.4)', color: '#fff' }}>
              <IconWind />
            </div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', background: 'linear-gradient(135deg, var(--color-primary-400,#34d399), var(--color-accent-400,#fbbf24))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              AQI Health
            </h1>
            <p style={{ margin: '5px 0 0', fontSize: 13, color: 'var(--text-secondary,#7ab89a)' }}>
              Smart Air Quality Intelligence
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, border: '1px solid rgba(255,255,255,0.07)' }}>
            <button className={`lp-tab${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')}>
              <IconLogin /> Sign In
            </button>
            <button className={`lp-tab${tab === 'qr' ? ' active' : ''}`} onClick={() => setTab('qr')}>
              <IconQR /> Use on Mobile
            </button>
          </div>

          {/* ── Login form ── */}
          {tab === 'login' && (
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="lp-email" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted,#3d6b52)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Email Address
                </label>
                <input
                  id="lp-email" type="email" autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="you@example.com"
                  aria-invalid={!!emailError}
                  className={`lp-input${emailError ? ' lp-input--error' : ''}`}
                />
                {emailError && <span role="alert" style={{ fontSize: 12, color: '#ef4444', marginTop: 4, display: 'block' }}>{emailError}</span>}
              </div>

              <div style={{ marginBottom: 26 }}>
                <label htmlFor="lp-password" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted,#3d6b52)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="lp-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onBlur={() => setPwTouched(true)}
                    placeholder="••••••••"
                    aria-invalid={!!pwError}
                    className={`lp-input${pwError ? ' lp-input--error' : ''}`}
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted,#3d6b52)', padding: 0, display: 'flex', alignItems: 'center' }}>
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {pwError && <span role="alert" style={{ fontSize: 12, color: '#ef4444', marginTop: 4, display: 'block' }}>{pwError}</span>}
              </div>

              {error && (
                <p role="alert" style={{ margin: '0 0 16px', fontSize: 13, color: '#fb7185', textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="lp-btn" aria-busy={loading}>
                {loading ? (
                  <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} aria-hidden="true" /> Signing in...</>
                ) : (
                  <><IconLogin /> Sign In</>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <button type="button" onClick={() => alert('Password reset not available in demo.')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary-400,#34d399)', cursor: 'pointer', fontSize: 13 }}>
                  Forgot Password?
                </button>
              </div>

              {/* Demo hint */}
              <div style={{ marginTop: 22, padding: '12px 16px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, fontSize: 12, color: 'var(--color-primary-400,#34d399)', textAlign: 'center' }}>
                <span style={{ fontWeight: 700 }}>Demo</span> &nbsp;&middot;&nbsp; {DEMO_EMAIL} &nbsp;/&nbsp; {DEMO_PASSWORD}
              </div>
            </form>
          )}

          {/* ── QR tab ── */}
          {tab === 'qr' && <QRLoginTab />}
        </div>
      </div>
    </>
  )
}
