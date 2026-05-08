import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AQIGauge } from '../components/AQIGauge/AQIGauge'
import { OrganCard } from '../components/OrganCard/OrganCard'
import { PollutantForm } from '../components/PollutantForm/PollutantForm'
import { CSVUpload } from '../components/CSVUpload/CSVUpload'
import { PollutantChart } from '../components/Charts/PollutantChart'
import { TrendChart } from '../components/Charts/TrendChart'
import { FeatureImportanceChart } from '../components/Charts/FeatureImportanceChart'
import { MetricsPanel } from '../components/ModelPanel/MetricsPanel'
import { PDFButton } from '../components/PDF/PDFButton'
import { AdvisoryBanner } from '../components/AdvisoryBanner/AdvisoryBanner'
import { EmergencyOverlay } from '../components/AdvisoryBanner/EmergencyOverlay'
import { LiveLocationButton } from '../components/LiveLocation/LiveLocationButton'
import { useAQIPrediction } from '../hooks/useAQIPrediction'
import { useRealtime } from '../hooks/useRealtime'
import { useProfile } from '../hooks/useProfile'
import { getModelMetrics } from '../services/api'
import type { BatchPredictionResponse, ModelMetrics, PollutantInput } from '../types'

const ORGAN_NAMES = ['Lungs', 'Heart', 'Brain', 'Skin', 'Eyes', 'Immune System']

function aqiColor(aqi: number | null) {
  if (!aqi) return '#38bdf8'
  if (aqi <= 50)  return '#10b981'
  if (aqi <= 100) return '#f59e0b'
  if (aqi <= 150) return '#f97316'
  if (aqi <= 200) return '#ef4444'
  if (aqi <= 300) return '#a855f7'
  return '#be123c'
}

function aqiLabel(aqi: number | null) {
  if (!aqi) return '—'
  if (aqi <= 50)  return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Sensitive'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very Unhealthy'
  return 'Hazardous'
}

function SectionTitle({ icon, title, subtitle, action }: {
  icon: string
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: 'linear-gradient(135deg,rgba(14,165,233,0.18),rgba(168,85,247,0.18))',
          border: '1px solid rgba(14,165,233,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0,
        }}>{icon}</div>
        <div>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary,#f0f6ff)' }}>{title}</h2>
          {subtitle && <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted,#4a6080)', marginTop: 1 }}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

function StatCard({ label, value, sub, color: c, icon }: {
  label: string; value: string; sub?: string; color?: string; icon?: string
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 4,
      padding: '14px 18px', borderRadius: 12,
      background: c ? `${c}0d` : 'rgba(255,255,255,0.04)',
      border: `1px solid ${c ? `${c}33` : 'rgba(255,255,255,0.08)'}`,
      flex: 1, minWidth: 100,
      transition: 'border-color 0.2s, background 0.2s',
    }}>
      <span style={{ fontSize: 10, color: 'var(--text-muted,#4a6080)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon && <span>{icon}</span>}{label}
      </span>
      <span style={{ fontSize: 22, fontWeight: 900, color: c ?? 'var(--text-primary,#f0f6ff)', lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ fontSize: 10, color: c ?? 'var(--text-secondary,#8ba3c7)', fontWeight: 600 }}>{sub}</span>}
    </div>
  )
}

function DividerLine() {
  return <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(14,165,233,0.18),transparent)', margin: '4px 0 16px' }} />
}

export function DashboardPage() {
  const { result, loading, predict, input, setField, setAllFields, clearForm, error } = useAQIPrediction()
  const { liveData, isConnected, lastUpdated } = useRealtime()
  const { profile } = useProfile()

  const [advisoryDismissed, setAdvisoryDismissed]   = useState(false)
  const [emergencyDismissed, setEmergencyDismissed] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(() => localStorage.getItem('aqi_auto_refresh') === 'true')
  const [batchResults, setBatchResults] = useState<BatchPredictionResponse | null>(null)
  const [metrics, setMetrics]           = useState<ModelMetrics | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'manual' | 'csv'>('manual')

  useEffect(() => {
    setMetricsLoading(true)
    getModelMetrics().then(setMetrics).catch(() => setMetrics(null)).finally(() => setMetricsLoading(false))
  }, [])

  useEffect(() => { setAdvisoryDismissed(false); setEmergencyDismissed(false) }, [result?.aqi_category])

  const toggleAutoRefresh = () => {
    const next = !autoRefresh
    setAutoRefresh(next)
    localStorage.setItem('aqi_auto_refresh', String(next))
  }

  const handleLocationFetched = useCallback((pollutants: PollutantInput) => {
    setAllFields(pollutants)
    predict()
  }, [setAllFields, predict])

  const displayAQI      = result?.aqi ?? liveData?.aqi ?? null
  const displayCategory = result?.aqi_category ?? liveData?.aqi_category ?? null
  const displayPollutants: PollutantInput | null = result
    ? { 'PM2.5': input['PM2.5'] ?? 0, PM10: input.PM10 ?? 0, NO2: input.NO2 ?? 0, SO2: input.SO2 ?? 0, CO: input.CO ?? 0, O3: input.O3 ?? 0 }
    : liveData?.pollutants ?? null

  const isHazardous  = displayCategory === 'Hazardous'
  const showAdvisory = displayCategory && displayCategory !== 'Good' && !advisoryDismissed && displayAQI !== null
  const color        = aqiColor(displayAQI)

  const lastUpdatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  return (
    <>
      <style>{`
        /* ── Layout ─────────────────────────────────────────────────── */
        .db-main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
          align-items: start;
        }
        .db-charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .db-organs-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .db-stats-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        @media (max-width: 1200px) {
          .db-organs-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 1024px) {
          .db-main-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .db-charts-grid { grid-template-columns: 1fr !important; }
          .db-organs-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .db-organs-grid { grid-template-columns: 1fr !important; }
        }

        /* ── Card ───────────────────────────────────────────────────── */
        .db-card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(14,165,233,0.1);
          border-radius: 16px;
          padding: 20px;
          backdrop-filter: blur(16px);
          position: relative;
          overflow: hidden;
        }
        .db-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(14,165,233,0.25), transparent);
        }

        /* ── Tabs ───────────────────────────────────────────────────── */
        .db-tab {
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.15s;
          background: transparent;
          color: var(--text-muted, #4a6080);
        }
        .db-tab.active {
          background: rgba(14,165,233,0.12);
          border-color: rgba(14,165,233,0.3);
          color: #38bdf8;
        }
        .db-tab:hover:not(.active) {
          background: rgba(255,255,255,0.05);
          color: var(--text-secondary, #8ba3c7);
        }

        /* ── Connection badge ───────────────────────────────────────── */
        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 999px;
          letter-spacing: 0.04em;
        }
        .live-badge.connected {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.3);
          color: #10b981;
        }
        .live-badge.disconnected {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          color: #ef4444;
        }
        @keyframes live-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      {/* ── Overlays ──────────────────────────────────────────────────── */}
      {isHazardous && !emergencyDismissed && displayAQI !== null && (
        <EmergencyOverlay aqi={displayAQI} onDismiss={() => setEmergencyDismissed(true)} />
      )}
      {showAdvisory && displayAQI !== null && (
        <AdvisoryBanner category={displayCategory!} aqi={displayAQI} onDismiss={() => setAdvisoryDismissed(true)} />
      )}

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '24px 20px' }}>

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 4, height: 26, borderRadius: 2, background: 'linear-gradient(180deg,#0ea5e9,#a855f7)', flexShrink: 0 }} />
              <h1 style={{
                margin: 0, fontSize: 22, fontWeight: 800,
                fontFamily: 'var(--font-display)',
                background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                AQI Health Dashboard
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary,#8ba3c7)', paddingLeft: 14 }}>
              {profile?.name ? `Welcome back, ${profile.name} · ` : ''}Real-time air quality &amp; health impact analysis
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {lastUpdatedStr && (
              <span style={{ fontSize: 11, color: 'var(--text-muted,#4a6080)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 999 }}>
                🕐 {lastUpdatedStr}
              </span>
            )}
            <span className={`live-badge ${isConnected ? 'connected' : 'disconnected'}`}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', animation: isConnected ? 'live-pulse 1.5s ease-in-out infinite' : 'none' }} />
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-secondary,#8ba3c7)', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 999 }}>
              <input type="checkbox" checked={autoRefresh} onChange={toggleAutoRefresh} aria-label="Auto-refresh" style={{ accentColor: '#0ea5e9' }} />
              Auto-refresh
            </label>
          </div>
        </div>

        {/* ── Stats Row ───────────────────────────────────────────────── */}
        <div className="db-stats-row">
          <StatCard
            label="Current AQI"
            value={displayAQI?.toFixed(0) ?? '—'}
            sub={displayCategory ?? aqiLabel(displayAQI)}
            color={color}
            icon="💨"
          />
          {result && (
            <>
              <StatCard label="Model" value={result.model_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} sub={result.cached ? '⚡ Cached' : '🔄 Fresh'} color="#38bdf8" icon="🤖" />
              <StatCard label="95% CI" value={`${result.confidence_interval.lower.toFixed(1)}–${result.confidence_interval.upper.toFixed(1)}`} sub="Confidence range" color="#c084fc" icon="📐" />
            </>
          )}
          {metrics && (
            <StatCard label="Accuracy" value={`${(metrics.accuracy * 100).toFixed(1)}%`} sub={`R² ${metrics.r2.toFixed(3)}`} color="#10b981" icon="🎯" />
          )}
          {metrics && (
            <StatCard label="MAE" value={metrics.mae.toFixed(2)} sub={`RMSE ${metrics.rmse.toFixed(2)}`} color="#f59e0b" icon="📊" />
          )}
        </div>

        {/* ── Main Grid: Input + Gauge ─────────────────────────────────── */}
        <div className="db-main-grid">

          {/* Left: Input Panel */}
          <div className="db-card">
            <SectionTitle icon="🧪" title="Pollutant Input" subtitle="Enter values or use live location" />

            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4, border: '1px solid rgba(255,255,255,0.06)' }}>
              <button className={`db-tab${activeTab === 'manual' ? ' active' : ''}`} onClick={() => setActiveTab('manual')} style={{ flex: 1 }}>
                ✏️ Manual Input
              </button>
              <button className={`db-tab${activeTab === 'csv' ? ' active' : ''}`} onClick={() => setActiveTab('csv')} style={{ flex: 1 }}>
                📂 Batch CSV
              </button>
            </div>

            {activeTab === 'manual' ? (
              <>
                <LiveLocationButton onFetched={handleLocationFetched} />
                <DividerLine />
                <PollutantForm onPredict={() => {}} loading={loading} input={input} setField={setField} predict={predict} clearForm={clearForm} error={error} />
              </>
            ) : (
              <CSVUpload onResults={setBatchResults} />
            )}
          </div>

          {/* Right: Gauge */}
          <div className="db-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
            <SectionTitle icon="🎯" title="AQI Gauge" subtitle="Air Quality Index — 0 to 500 scale" />
            <AQIGauge aqi={displayAQI} category={displayCategory} />
            {result && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)', color: '#38bdf8' }}>
                  CI [{result.confidence_interval.lower.toFixed(1)}, {result.confidence_interval.upper.toFixed(1)}]
                </span>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}>
                  {result.model_type.replace(/_/g, ' ')}
                </span>
                {result.cached && (
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}>
                    ⚡ cached
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Organ Health Impact ──────────────────────────────────────── */}
        {(result?.organs || loading) && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(180deg,#0ea5e9,#a855f7)' }} />
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary,#f0f6ff)' }}>
                Organ Health Impact
              </h2>
              {displayCategory && (
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: `${color}18`, border: `1px solid ${color}44`, color }}>
                  {displayCategory}
                </span>
              )}
            </div>
            <div className="db-organs-grid">
              {loading
                ? ORGAN_NAMES.map(name => (
                    <OrganCard key={name} organ={{ organ: name, risk_level: 'Low', severity_score: 0, description: '', prevention_tips: [], precautions: [], action_urgency: 'Monitor', sensitive_group_notes: { children: '', elderly: '', pregnant: '', asthma: '', cardiovascular: '' } }} loading />
                  ))
                : result!.organs.map(organ => <OrganCard key={organ.organ} organ={organ} />)
              }
            </div>
          </div>
        )}

        {/* ── Charts Row 1 ─────────────────────────────────────────────── */}
        <div className="db-charts-grid">
          <div className="db-card">
            <SectionTitle icon="📊" title="Pollutant Levels" subtitle="Current concentration per pollutant (µg/m³)" />
            <PollutantChart pollutants={displayPollutants} />
          </div>
          <div className="db-card">
            <SectionTitle icon="📈" title="AQI Trend" subtitle="Batch prediction results over time" />
            <TrendChart predictions={batchResults?.predictions ?? []} />
          </div>
        </div>

        {/* ── Charts Row 2 ─────────────────────────────────────────────── */}
        <div className="db-charts-grid">
          <div className="db-card">
            <SectionTitle icon="🔬" title="Feature Importance" subtitle="Which pollutants drive the prediction most" />
            <FeatureImportanceChart items={result?.feature_importance ?? []} />
          </div>
          <div className="db-card" style={{ padding: 0 }}>
            <MetricsPanel metrics={metrics} loading={metricsLoading} />
          </div>
        </div>

        {/* ── PDF Export ───────────────────────────────────────────────── */}
        {result && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted,#4a6080)' }}>
                Download a full health impact report for this prediction
              </p>
              <PDFButton aqi={result.aqi} category={result.aqi_category} modelId={result.model_id} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
