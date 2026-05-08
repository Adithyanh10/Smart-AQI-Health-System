import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useRealtime } from '../hooks/useRealtime'
import { useCityAQI } from '../hooks/useCityAQI'
import { getAQIColor } from '../utils/aqi'
import type { LiveCityData } from '../hooks/useCityAQI'

function aqiColor(aqi: number) {
  if (aqi <= 50)  return '#22c55e'
  if (aqi <= 100) return '#eab308'
  if (aqi <= 150) return '#f97316'
  if (aqi <= 200) return '#ef4444'
  if (aqi <= 300) return '#a855f7'
  return '#991b1b'
}

const AQI_BANDS = [
  { label: 'Good',                          range: '0–50',   color: '#22c55e' },
  { label: 'Moderate',                      range: '51–100', color: '#eab308' },
  { label: 'Unhealthy (Sensitive)',          range: '101–150',color: '#f97316' },
  { label: 'Unhealthy',                     range: '151–200',color: '#ef4444' },
  { label: 'Very Unhealthy',                range: '201–300',color: '#a855f7' },
  { label: 'Hazardous',                     range: '301–500',color: '#991b1b' },
]

const CATEGORIES = [
  'All',
  'Good',
  'Moderate',
  'Unhealthy for Sensitive Groups',
  'Unhealthy',
  'Very Unhealthy',
  'Hazardous',
]

// ─── Progress bar ─────────────────────────────────────────────────────────────
function FetchProgress({ progress, isFetching }: { progress: number; isFetching: boolean }) {
  if (!isFetching && progress === 100) return null
  if (!isFetching && progress === 0) return null
  return (
    <div style={{
      position: 'fixed', top: 58, left: 0, right: 0, zIndex: 200,
      height: 3, background: 'rgba(255,255,255,0.06)',
    }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        background: 'linear-gradient(90deg,#0ea5e9,#a855f7)',
        transition: 'width 0.3s ease',
        borderRadius: '0 2px 2px 0',
      }} />
    </div>
  )
}

export function MapPage() {
  const { liveData, isConnected } = useRealtime()
  const { cities, isFetching, fetchProgress, lastFullUpdate, refetch } = useCityAQI()

  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMap = useRef<unknown>(null)
  const markersRef = useRef<{ city: LiveCityData; marker: unknown; icon: unknown }[]>([])

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [selectedCity, setSelectedCity] = useState<LiveCityData | null>(null)
  const [sortBy, setSortBy] = useState<'aqi' | 'name'>('aqi')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [mapReady, setMapReady] = useState(false)

  // ── Stats ──────────────────────────────────────────────────────────
  const liveCities = cities.filter(c => c.hasLive)
  const avgAQI = cities.length
    ? Math.round(cities.reduce((s, c) => s + c.aqi, 0) / cities.length)
    : 0
  const cleanest     = [...cities].sort((a, b) => a.aqi - b.aqi)[0]
  const mostPolluted = [...cities].sort((a, b) => b.aqi - a.aqi)[0]
  const safeCities   = cities.filter(c => c.aqi <= 100).length

  // ── Filtered + sorted list ─────────────────────────────────────────
  const filteredCities = useMemo(() => {
    let list = cities.filter(c => {
      const q = search.toLowerCase()
      const matchSearch = c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)
      const matchCat = filterCategory === 'All' || c.category === filterCategory
      return matchSearch && matchCat
    })
    list = [...list].sort((a, b) => {
      if (sortBy === 'aqi') return sortDir === 'desc' ? b.aqi - a.aqi : a.aqi - b.aqi
      return sortDir === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)
    })
    return list
  }, [cities, search, filterCategory, sortBy, sortDir])

  // ── Init Leaflet map ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return

    import('leaflet').then(L => {
      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, { center: [22.5, 80.0], zoom: 5 })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      leafletMap.current = map
      setMapReady(true)
    })

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (leafletMap.current) { (leafletMap.current as any).remove(); leafletMap.current = null }
      markersRef.current = []
    }
  }, [])

  // ── Add / update markers whenever city data changes ────────────────
  useEffect(() => {
    if (!mapReady || !leafletMap.current) return

    import('leaflet').then(L => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = leafletMap.current as any

      // Remove old markers
      markersRef.current.forEach(({ marker }) => (marker as any).remove())
      markersRef.current = []

      cities.forEach(city => {
        const color = aqiColor(city.aqi)
        const isLoading = city.loading

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:38px;height:38px;border-radius:50%;
            background:${color};
            border:2.5px solid ${isLoading ? 'rgba(255,255,255,0.4)' : 'white'};
            display:flex;align-items:center;justify-content:center;
            font-size:10px;font-weight:800;color:white;
            box-shadow:0 2px 8px rgba(0,0,0,0.45);
            cursor:pointer;
            opacity:${isLoading ? 0.6 : 1};
            transition:opacity 0.3s;
          ">${isLoading ? '…' : city.aqi}</div>`,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        })

        const liveTag = city.hasLive
          ? `<span style="font-size:10px;color:#22c55e;font-weight:700">● LIVE</span>`
          : `<span style="font-size:10px;color:#94a3b8">baseline</span>`

        const updatedStr = city.lastUpdated
          ? city.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '—'

        const marker = L.marker([city.lat, city.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:180px;font-family:sans-serif;padding:2px">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
                <div>
                  <strong style="font-size:14px">${city.name}</strong><br/>
                  <span style="font-size:11px;color:#666">${city.state}</span>
                </div>
                <div style="
                  width:44px;height:44px;border-radius:50%;
                  background:${color}22;border:2px solid ${color};
                  display:flex;flex-direction:column;align-items:center;justify-content:center;
                  flex-shrink:0;margin-left:8px;
                ">
                  <span style="font-size:13px;font-weight:900;color:${color};line-height:1">${city.aqi}</span>
                  <span style="font-size:8px;color:${color}">AQI</span>
                </div>
              </div>
              <div style="
                padding:4px 8px;border-radius:6px;
                background:${color}22;
                font-size:12px;font-weight:700;color:${color};
                margin-bottom:6px;
              ">${city.category}</div>
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#888">
                <span>${liveTag}</span>
                <span>Updated ${updatedStr}</span>
              </div>
            </div>
          `)

        markersRef.current.push({ city, marker, icon })
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities, mapReady])

  // ── Pan to city ────────────────────────────────────────────────────
  const panToCity = (city: LiveCityData) => {
    setSelectedCity(city)
    if (leafletMap.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = leafletMap.current as any
      map.setView([city.lat, city.lng], 9, { animate: true })
      const entry = markersRef.current.find(m => m.city.name === city.name)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (entry) (entry.marker as any).openPopup()
    }
  }

  const toggleSort = (col: 'aqi' | 'name') => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const lastUpdateStr = lastFullUpdate
    ? lastFullUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  return (
    <>
      <FetchProgress progress={fetchProgress} isFetching={isFetching} />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '24px 16px' }}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 4, height: 26, borderRadius: 2, background: 'linear-gradient(180deg,#0ea5e9,#a855f7)' }} />
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary,#f1f5f9)' }}>
                India AQI Map
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary,#94a3b8)', paddingLeft: 14 }}>
              Live air quality across {cities.length} Indian cities
              {isConnected && <span style={{ marginLeft: 8, color: '#22c55e', fontWeight: 700 }}>● LIVE</span>}
              {liveCities.length > 0 && (
                <span style={{ marginLeft: 8, color: '#38bdf8' }}>
                  {liveCities.length}/{cities.length} cities with live data
                </span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {lastUpdateStr && (
              <span style={{ fontSize: 11, color: 'var(--text-muted,#4a6080)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 999 }}>
                🕐 {lastUpdateStr}
              </span>
            )}
            <button
              onClick={refetch}
              disabled={isFetching}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: isFetching ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#0ea5e9,#a855f7)',
                border: '1px solid rgba(14,165,233,0.3)',
                color: isFetching ? 'var(--text-muted,#4a6080)' : '#fff',
                cursor: isFetching ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {isFetching ? `⏳ ${fetchProgress}%` : '🔄 Refresh All'}
            </button>
          </div>
        </div>

        {/* ── Summary stats ────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Cities Tracked', value: String(cities.length),   color: '#6366f1' },
            { label: 'Live Data',       value: String(liveCities.length), color: '#38bdf8' },
            { label: 'Avg AQI',         value: String(avgAQI),          color: aqiColor(avgAQI) },
            { label: 'Safe (≤100)',      value: String(safeCities),      color: '#22c55e' },
            { label: 'Cleanest',        value: cleanest?.name ?? '—',   sub: cleanest ? `AQI ${cleanest.aqi}` : '', color: '#22c55e' },
            { label: 'Most Polluted',   value: mostPolluted?.name ?? '—', sub: mostPolluted ? `AQI ${mostPolluted.aqi}` : '', color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className="glass-card" style={{ padding: '12px 14px' }}>
              <p style={{ margin: 0, fontSize: 10, color: 'var(--text-secondary,#94a3b8)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
              <p style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 800, color: s.color, lineHeight: 1.2 }}>{s.value}</p>
              {s.sub && <p style={{ margin: '2px 0 0', fontSize: 10, color: 'var(--text-secondary,#94a3b8)' }}>{s.sub}</p>}
            </div>
          ))}
        </div>

        {/* ── Map + sidebar ────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, alignItems: 'start' }}>

          {/* Map */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>
            <div ref={mapRef} style={{ height: 560, width: '100%' }} />
            {/* Legend */}
            <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary,#94a3b8)', marginRight: 4 }}>Legend:</span>
              {AQI_BANDS.map(b => (
                <span key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: b.color, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary,#94a3b8)' }}>{b.label} ({b.range})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Live reading card */}
            {liveData && (
              <div className="glass-card" style={{ padding: 16, borderLeft: `4px solid ${getAQIColor(liveData.aqi_category)}` }}>
                <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary,#94a3b8)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Your Live Reading
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 34, fontWeight: 900, color: getAQIColor(liveData.aqi_category), lineHeight: 1 }}>
                    {liveData.aqi.toFixed(0)}
                  </span>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary,#f1f5f9)' }}>{liveData.aqi_category}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-secondary,#94a3b8)' }}>
                      {new Date(liveData.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5, marginTop: 10 }}>
                  {Object.entries(liveData.pollutants).map(([k, v]) => (
                    <div key={k} style={{ textAlign: 'center', padding: '4px 0', background: 'rgba(255,255,255,0.04)', borderRadius: 6 }}>
                      <p style={{ margin: 0, fontSize: 9, color: 'var(--text-secondary,#94a3b8)' }}>{k}</p>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-primary,#f1f5f9)' }}>{(v as number).toFixed(1)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search + filter */}
            <div className="glass-card" style={{ padding: 14 }}>
              <input
                type="text"
                placeholder="Search city or state…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="glass-input"
                style={{ width: '100%', boxSizing: 'border-box', marginBottom: 8 }}
                aria-label="Search cities"
              />
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--text-primary,#f1f5f9)',
                  fontSize: 13, cursor: 'pointer',
                }}
                aria-label="Filter by AQI category"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {(['aqi', 'name'] as const).map(col => (
                  <button
                    key={col}
                    onClick={() => toggleSort(col)}
                    style={{
                      flex: 1, padding: '5px 0', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      border: sortBy === col ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                      background: sortBy === col ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                      color: sortBy === col ? '#6366f1' : 'var(--text-secondary,#94a3b8)',
                    }}
                  >
                    {col === 'aqi' ? 'AQI' : 'Name'} {sortBy === col ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* City list */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: 12, color: 'var(--text-secondary,#94a3b8)', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                <span>{filteredCities.length} cities</span>
                {isFetching && <span style={{ color: '#38bdf8', fontSize: 11 }}>⏳ Updating…</span>}
              </div>
              <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                {filteredCities.map(city => {
                  const color = aqiColor(city.aqi)
                  const isSelected = selectedCity?.name === city.name
                  return (
                    <button
                      key={`${city.name}-${city.state}`}
                      onClick={() => panToCity(city)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '9px 14px', border: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: isSelected ? 'rgba(99,102,241,0.12)' : 'transparent',
                        cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                      }}
                      onMouseOver={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                      onMouseOut={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary,#f1f5f9)', display: 'flex', alignItems: 'center', gap: 5 }}>
                          {city.name}
                          {city.loading && <span style={{ fontSize: 9, color: '#38bdf8' }}>⏳</span>}
                          {city.hasLive && !city.loading && <span style={{ fontSize: 9, color: '#22c55e' }}>●</span>}
                        </p>
                        <p style={{ margin: '1px 0 0', fontSize: 10, color: 'var(--text-secondary,#94a3b8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {city.state}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 999,
                          background: `${color}22`, border: `1px solid ${color}55`,
                          fontSize: 12, fontWeight: 800, color,
                        }}>
                          {city.aqi}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Selected city detail */}
            {selectedCity && (
              <div className="glass-card" style={{ padding: 16, borderLeft: `4px solid ${aqiColor(selectedCity.aqi)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary,#f1f5f9)' }}>
                      {selectedCity.name}
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary,#94a3b8)' }}>{selectedCity.state}</p>
                  </div>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: `${aqiColor(selectedCity.aqi)}22`,
                    border: `2px solid ${aqiColor(selectedCity.aqi)}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: aqiColor(selectedCity.aqi), lineHeight: 1 }}>{selectedCity.aqi}</span>
                    <span style={{ fontSize: 9, color: aqiColor(selectedCity.aqi) }}>AQI</span>
                  </div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: `${aqiColor(selectedCity.aqi)}18`, fontSize: 12, fontWeight: 700, color: aqiColor(selectedCity.aqi), marginBottom: 10 }}>
                  {selectedCity.category}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary,#94a3b8)' }}>Latitude</span>
                  <span style={{ color: 'var(--text-primary,#f1f5f9)', fontWeight: 600 }}>{selectedCity.lat.toFixed(2)}°N</span>
                  <span style={{ color: 'var(--text-secondary,#94a3b8)' }}>Longitude</span>
                  <span style={{ color: 'var(--text-primary,#f1f5f9)', fontWeight: 600 }}>{selectedCity.lng.toFixed(2)}°E</span>
                  <span style={{ color: 'var(--text-secondary,#94a3b8)' }}>Data source</span>
                  <span style={{ color: selectedCity.hasLive ? '#22c55e' : '#94a3b8', fontWeight: 600 }}>
                    {selectedCity.hasLive ? '● Live' : 'Baseline'}
                  </span>
                  {selectedCity.lastUpdated && (
                    <>
                      <span style={{ color: 'var(--text-secondary,#94a3b8)' }}>Updated</span>
                      <span style={{ color: 'var(--text-primary,#f1f5f9)', fontWeight: 600 }}>
                        {selectedCity.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
