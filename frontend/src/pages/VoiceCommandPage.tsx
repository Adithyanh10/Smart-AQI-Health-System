import React, { useState, useRef, useEffect } from 'react'
import { useVoiceCommand } from '../hooks/useVoiceCommand'
import { useAQIPrediction } from '../hooks/useAQIPrediction'
import { useRealtime } from '../hooks/useRealtime'
import { useI18n } from '../hooks/useI18n'

const EXAMPLE_QUERIES = [
  'What is the current AQI?',
  'What is the PM2.5 level?',
  'Is it safe to go outside?',
  'Which pollutant is highest?',
  'Which organs are at risk?',
  'What does the AQI category mean?',
  'Give me health advice',
  'Is it safe for children?',
]

function MicButton({
  status,
  onClick,
  isSupported,
}: {
  status: string
  onClick: () => void
  isSupported: boolean
}) {
  const isListening = status === 'listening'
  const isProcessing = status === 'processing'

  return (
    <button
      onClick={onClick}
      disabled={!isSupported || isProcessing}
      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
      style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        border: 'none',
        cursor: isSupported && !isProcessing ? 'pointer' : 'not-allowed',
        background: isListening
          ? 'linear-gradient(135deg, #ef4444, #dc2626)'
          : isProcessing
          ? 'linear-gradient(135deg, #f59e0b, #d97706)'
          : 'linear-gradient(135deg, #0ea5e9, #a855f7)',
        boxShadow: isListening
          ? '0 0 0 0 rgba(239,68,68,0.4)'
          : '0 8px 32px rgba(14,165,233,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        transition: 'all 0.3s',
        animation: isListening ? 'mic-pulse 1.2s ease-in-out infinite' : 'none',
        flexShrink: 0,
      }}
    >
      {isProcessing ? '⏳' : isListening ? '⏹' : '🎤'}
    </button>
  )
}

function ChatBubble({ role, text, timestamp }: { role: 'user' | 'assistant'; text: string; timestamp: Date }) {
  const isUser = role === 'user'
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 12,
      animation: 'fadeSlideIn 0.3s ease',
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#0ea5e9,#a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, marginRight: 8, alignSelf: 'flex-end',
        }}>🌬️</div>
      )}
      <div style={{ maxWidth: '75%' }}>
        <div style={{
          padding: '12px 16px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser
            ? 'linear-gradient(135deg, rgba(14,165,233,0.25), rgba(168,85,247,0.2))'
            : 'rgba(255,255,255,0.06)',
          border: isUser
            ? '1px solid rgba(14,165,233,0.35)'
            : '1px solid rgba(255,255,255,0.1)',
          color: 'var(--text-primary, #f0f6ff)',
          fontSize: 14,
          lineHeight: 1.6,
        }}>
          {text}
        </div>
        <div style={{
          fontSize: 10,
          color: 'var(--text-muted, #4a6080)',
          marginTop: 4,
          textAlign: isUser ? 'right' : 'left',
          paddingLeft: isUser ? 0 : 4,
          paddingRight: isUser ? 4 : 0,
        }}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(14,165,233,0.2)',
          border: '1px solid rgba(14,165,233,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, marginLeft: 8, alignSelf: 'flex-end',
        }}>👤</div>
      )}
    </div>
  )
}

export function VoiceCommandPage() {
  const { t, language } = useI18n()
  const { result } = useAQIPrediction()
  const { liveData } = useRealtime()
  const [textInput, setTextInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    status,
    transcript,
    messages,
    error,
    isSupported,
    startListening,
    sendTextQuery,
    clearMessages,
    stopSpeaking,
  } = useVoiceCommand({ language, prediction: result, liveData })

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!textInput.trim()) return
    sendTextQuery(textInput.trim())
    setTextInput('')
  }

  const handleExampleClick = (query: string) => {
    sendTextQuery(query)
  }

  const aqi = result?.aqi ?? liveData?.aqi ?? null
  const category = result?.aqi_category ?? liveData?.aqi_category ?? null

  function aqiColor(v: number | null) {
    if (!v) return '#38bdf8'
    if (v <= 50) return '#10b981'
    if (v <= 100) return '#f59e0b'
    if (v <= 150) return '#f97316'
    if (v <= 200) return '#ef4444'
    if (v <= 300) return '#a855f7'
    return '#be123c'
  }
  const color = aqiColor(aqi)

  return (
    <>
      <style>{`
        @keyframes mic-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          70%  { box-shadow: 0 0 0 20px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wave {
          0%, 100% { transform: scaleY(0.4); }
          50%       { transform: scaleY(1); }
        }
        .voice-page-grid {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .voice-page-grid { grid-template-columns: 1fr !important; }
        }
        .vc-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(14,165,233,0.12);
          border-radius: 16px;
          backdrop-filter: blur(16px);
          position: relative;
          overflow: hidden;
        }
        .vc-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(14,165,233,0.3), transparent);
        }
        .example-chip {
          padding: 7px 12px;
          border-radius: 20px;
          background: rgba(14,165,233,0.08);
          border: 1px solid rgba(14,165,233,0.2);
          color: var(--text-secondary, #8ba3c7);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
          line-height: 1.4;
        }
        .example-chip:hover {
          background: rgba(14,165,233,0.18);
          border-color: rgba(14,165,233,0.45);
          color: #38bdf8;
        }
        .wave-bar {
          width: 4px;
          border-radius: 2px;
          background: #0ea5e9;
          animation: wave 0.8s ease-in-out infinite;
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 20px' }}>

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 4, height: 28, borderRadius: 2, background: 'linear-gradient(180deg,#0ea5e9,#a855f7)' }} />
            <h1 style={{
              margin: 0, fontSize: 24, fontWeight: 800,
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg,#f0f6ff,#8ba3c7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {t('voice.title')}
            </h1>
            <span style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 999,
              background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)',
              color: '#c084fc', fontWeight: 700, letterSpacing: '0.06em',
            }}>BETA</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary,#8ba3c7)', paddingLeft: 14 }}>
            {t('voice.subtitle')}
          </p>
        </div>

        <div className="voice-page-grid">

          {/* ── Left Panel: Controls + Status ───────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* AQI Status Card */}
            <div className="vc-card" style={{ padding: 20 }}>
              <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted,#4a6080)' }}>
                Current Air Quality
              </p>
              {aqi !== null ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: `${color}18`,
                    border: `2px solid ${color}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 26, fontWeight: 900, color }}>{aqi.toFixed(0)}</span>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary,#f0f6ff)' }}>{category}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-secondary,#8ba3c7)' }}>Air Quality Index</p>
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted,#4a6080)' }}>
                  No data yet — run a prediction on the Dashboard first.
                </p>
              )}
            </div>

            {/* Mic Control Card */}
            <div className="vc-card" style={{ padding: 24 }}>
              <p style={{ margin: '0 0 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted,#4a6080)' }}>
                Voice Input
              </p>

              {!isSupported ? (
                <div style={{
                  padding: '14px 16px', borderRadius: 10,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                  color: '#fca5a5', fontSize: 13,
                }}>
                  ⚠️ {t('voice.noSupport')}. Use the text input below instead.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  {/* Waveform animation when listening */}
                  <div style={{ height: 32, display: 'flex', alignItems: 'center', gap: 3 }}>
                    {status === 'listening'
                      ? [0.3, 0.6, 1, 0.7, 0.4, 0.8, 0.5, 0.9, 0.3, 0.6].map((delay, i) => (
                          <div key={i} className="wave-bar" style={{
                            height: `${16 + i * 3}px`,
                            animationDelay: `${delay * 0.4}s`,
                          }} />
                        ))
                      : <span style={{ fontSize: 12, color: 'var(--text-muted,#4a6080)' }}>
                          {status === 'processing' ? t('voice.processing') : t('voice.placeholder')}
                        </span>
                    }
                  </div>

                  <MicButton status={status} onClick={startListening} isSupported={isSupported} />

                  {/* Live transcript */}
                  {transcript && status === 'listening' && (
                    <div style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)',
                      color: '#38bdf8', fontSize: 13, fontStyle: 'italic', textAlign: 'center',
                    }}>
                      "{transcript}"
                    </div>
                  )}

                  {error && (
                    <div style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                      color: '#fca5a5', fontSize: 12,
                    }}>
                      {error}
                    </div>
                  )}

                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted,#4a6080)', textAlign: 'center' }}>
                    {status === 'listening' ? '🔴 ' + t('voice.listening') : 'Click mic to start speaking'}
                  </p>
                </div>
              )}
            </div>

            {/* Example Queries */}
            <div className="vc-card" style={{ padding: 20 }}>
              <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted,#4a6080)' }}>
                {t('voice.exampleQueries')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {EXAMPLE_QUERIES.map(q => (
                  <button key={q} className="example-chip" onClick={() => handleExampleClick(q)}>
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Panel: Chat ────────────────────────────────────── */}
          <div className="vc-card" style={{ display: 'flex', flexDirection: 'column', height: 680 }}>

            {/* Chat Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(14,165,233,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'linear-gradient(135deg,rgba(14,165,233,0.2),rgba(168,85,247,0.2))',
                  border: '1px solid rgba(14,165,233,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>🌬️</div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary,#f0f6ff)' }}>AQI Assistant</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#10b981' }}>● Online</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={stopSpeaking}
                  title="Stop speaking"
                  style={{
                    padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-secondary,#8ba3c7)', cursor: 'pointer',
                  }}
                >
                  🔇 Mute
                </button>
                <button
                  onClick={clearMessages}
                  title="Clear conversation"
                  style={{
                    padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-secondary,#8ba3c7)', cursor: 'pointer',
                  }}
                >
                  🗑 Clear
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '20px',
              display: 'flex', flexDirection: 'column',
            }}>
              {messages.length === 0 ? (
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 16,
                  color: 'var(--text-muted,#4a6080)',
                }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'linear-gradient(135deg,rgba(14,165,233,0.1),rgba(168,85,247,0.1))',
                    border: '1px solid rgba(14,165,233,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
                  }}>🌬️</div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: 'var(--text-secondary,#8ba3c7)' }}>
                      {t('voice.askAnything')}
                    </p>
                    <p style={{ margin: 0, fontSize: 12 }}>
                      Use the mic button or type your question below
                    </p>
                  </div>
                </div>
              ) : (
                messages.map(msg => (
                  <ChatBubble key={msg.id} role={msg.role} text={msg.text} timestamp={msg.timestamp} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Text Input */}
            <div style={{
              padding: '14px 16px',
              borderTop: '1px solid rgba(14,165,233,0.12)',
              flexShrink: 0,
            }}>
              <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: 8 }}>
                <input
                  ref={inputRef}
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder="Type your question about air quality..."
                  aria-label="Type your question"
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(14,165,233,0.2)',
                    color: 'var(--text-primary,#f0f6ff)',
                    fontSize: 13, outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(14,165,233,0.5)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(14,165,233,0.2)' }}
                />
                <button
                  type="submit"
                  disabled={!textInput.trim()}
                  style={{
                    padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                    background: textInput.trim()
                      ? 'linear-gradient(135deg,#0ea5e9,#a855f7)'
                      : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(14,165,233,0.3)',
                    color: textInput.trim() ? '#fff' : 'var(--text-muted,#4a6080)',
                    cursor: textInput.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                  }}
                >
                  Send ↑
                </button>
              </form>
              <p style={{ margin: '8px 0 0', fontSize: 10, color: 'var(--text-muted,#4a6080)', textAlign: 'center' }}>
                Responses are based on current AQI data · Supports {isSupported ? 'voice + text' : 'text only'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
