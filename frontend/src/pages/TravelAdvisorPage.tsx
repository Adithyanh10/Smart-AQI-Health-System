import React, { useState, useMemo } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TourType {
  id: string; label: string; emoji: string; maxSafeAQI: number; warning: string
}

interface Place {
  name: string
  state: string
  baseAQI: number          // current/baseline AQI
  tourTypes: string[]      // which tour types this place suits
  description: string      // what makes it special
  altitude?: string        // optional altitude info
}

// ─── Tour Types ───────────────────────────────────────────────────────────────

const TOUR_TYPES: TourType[] = [
  { id: 'trekking',   label: 'Trekking / Adventure', emoji: '🏔️', maxSafeAQI: 50,  warning: 'Heavy breathing outdoors — AQI must be low.' },
  { id: 'honeymoon',  label: 'Honeymoon / Romantic',  emoji: '💑', maxSafeAQI: 100, warning: 'Moderate AQI acceptable for leisure.' },
  { id: 'family',     label: 'Family Tour',            emoji: '👨‍👩‍👧‍👦', maxSafeAQI: 50,  warning: 'Children & elderly are sensitive.' },
  { id: 'pilgrimage', label: 'Pilgrimage / Religious', emoji: '🛕', maxSafeAQI: 100, warning: 'Long outdoor walks — avoid high AQI.' },
  { id: 'beach',      label: 'Beach / Coastal',        emoji: '🏖️', maxSafeAQI: 100, warning: 'Coastal air is usually cleaner.' },
  { id: 'wildlife',   label: 'Wildlife / Safari',      emoji: '🐯', maxSafeAQI: 50,  warning: 'Forest air is clean — avoid industrial zones.' },
  { id: 'heritage',   label: 'Heritage / Cultural',    emoji: '🏛️', maxSafeAQI: 150, warning: 'Indoor activities reduce exposure.' },
  { id: 'business',   label: 'Business Trip',          emoji: '💼', maxSafeAQI: 200, warning: 'Mostly indoor — commuting affected.' },
]

// ─── Places Database ──────────────────────────────────────────────────────────
// Real places across Indian states with tour-type tags and realistic AQI

const PLACES: Place[] = [
  // Karnataka
  { name: 'Coorg (Madikeri)', state: 'Karnataka', baseAQI: 22, tourTypes: ['trekking','honeymoon','family','wildlife'], description: 'Coffee plantations, misty hills, Abbey Falls', altitude: '1,525 m' },
  { name: 'Chikmagalur', state: 'Karnataka', baseAQI: 25, tourTypes: ['trekking','honeymoon','wildlife'], description: 'Mullayanagiri peak, coffee estates, Baba Budangiri', altitude: '1,090 m' },
  { name: 'Kudremukh', state: 'Karnataka', baseAQI: 18, tourTypes: ['trekking','wildlife'], description: 'National park, shola forests, highest peak in Western Ghats', altitude: '1,894 m' },
  { name: 'Agumbe', state: 'Karnataka', baseAQI: 20, tourTypes: ['trekking','wildlife'], description: 'Rainforest, king cobra habitat, Onake Abbi Falls' },
  { name: 'Sakleshpur', state: 'Karnataka', baseAQI: 24, tourTypes: ['trekking','honeymoon'], description: 'Manjarabad Fort, tea estates, Bisle Ghat trek', altitude: '949 m' },
  { name: 'Hampi', state: 'Karnataka', baseAQI: 45, tourTypes: ['heritage','family','honeymoon'], description: 'UNESCO World Heritage ruins, Virupaksha Temple, boulder landscapes' },
  { name: 'Mysuru', state: 'Karnataka', baseAQI: 52, tourTypes: ['heritage','family','honeymoon'], description: 'Mysore Palace, Chamundi Hills, Brindavan Gardens' },
  { name: 'Kabini', state: 'Karnataka', baseAQI: 20, tourTypes: ['wildlife','honeymoon'], description: 'Nagarhole National Park, elephant herds, backwater safari' },
  { name: 'Dandeli', state: 'Karnataka', baseAQI: 22, tourTypes: ['trekking','wildlife'], description: 'White-water rafting, Syntheri Rocks, Kavala Caves' },
  { name: 'Gokarna', state: 'Karnataka', baseAQI: 30, tourTypes: ['beach','pilgrimage','honeymoon'], description: 'Om Beach, Mahabaleshwar Temple, pristine coastline' },

  // Himachal Pradesh
  { name: 'Manali', state: 'Himachal Pradesh', baseAQI: 22, tourTypes: ['trekking','honeymoon','family'], description: 'Rohtang Pass, Solang Valley, Hadimba Temple', altitude: '2,050 m' },
  { name: 'Spiti Valley', state: 'Himachal Pradesh', baseAQI: 12, tourTypes: ['trekking','wildlife'], description: 'Key Monastery, Chandratal Lake, high-altitude desert', altitude: '3,800 m' },
  { name: 'Triund', state: 'Himachal Pradesh', baseAQI: 18, tourTypes: ['trekking'], description: 'One-day trek from Dharamshala, panoramic Dhauladhar views', altitude: '2,828 m' },
  { name: 'Kheerganga', state: 'Himachal Pradesh', baseAQI: 15, tourTypes: ['trekking'], description: 'Hot springs at the top, Parvati Valley trek', altitude: '2,950 m' },
  { name: 'Dharamshala', state: 'Himachal Pradesh', baseAQI: 25, tourTypes: ['trekking','heritage','family'], description: 'Dalai Lama residence, Tibetan culture, McLeod Ganj', altitude: '1,457 m' },
  { name: 'Shimla', state: 'Himachal Pradesh', baseAQI: 28, tourTypes: ['family','honeymoon','heritage'], description: 'Mall Road, Jakhu Temple, toy train, colonial architecture', altitude: '2,206 m' },
  { name: 'Kasol', state: 'Himachal Pradesh', baseAQI: 16, tourTypes: ['trekking'], description: 'Parvati Valley, Kheerganga base, backpacker paradise', altitude: '1,580 m' },

  // Uttarakhand
  { name: 'Valley of Flowers', state: 'Uttarakhand', baseAQI: 14, tourTypes: ['trekking','wildlife'], description: 'UNESCO site, 500+ flower species, Hemkund Sahib nearby', altitude: '3,658 m' },
  { name: 'Roopkund', state: 'Uttarakhand', baseAQI: 12, tourTypes: ['trekking'], description: 'Skeleton lake trek, Trishul peak views', altitude: '5,029 m' },
  { name: 'Kedarkantha', state: 'Uttarakhand', baseAQI: 16, tourTypes: ['trekking'], description: 'Winter snow trek, 360° Himalayan panorama', altitude: '3,810 m' },
  { name: 'Rishikesh', state: 'Uttarakhand', baseAQI: 45, tourTypes: ['trekking','pilgrimage','family'], description: 'Yoga capital, Ganga Aarti, white-water rafting, Laxman Jhula' },
  { name: 'Nainital', state: 'Uttarakhand', baseAQI: 32, tourTypes: ['family','honeymoon'], description: 'Naini Lake, Snow View Point, boat rides', altitude: '2,084 m' },
  { name: 'Auli', state: 'Uttarakhand', baseAQI: 18, tourTypes: ['trekking','honeymoon'], description: 'Skiing destination, Gorson Bugyal meadows, Nanda Devi views', altitude: '2,519 m' },
  { name: 'Chopta', state: 'Uttarakhand', baseAQI: 14, tourTypes: ['trekking'], description: 'Mini Switzerland of India, Tungnath temple trek', altitude: '2,680 m' },

  // Kerala
  { name: 'Munnar', state: 'Kerala', baseAQI: 18, tourTypes: ['trekking','honeymoon','family'], description: 'Tea plantations, Anamudi peak, Eravikulam National Park', altitude: '1,600 m' },
  { name: 'Wayanad', state: 'Kerala', baseAQI: 22, tourTypes: ['trekking','wildlife','family'], description: 'Chembra Peak, Edakkal Caves, Banasura Sagar Dam' },
  { name: 'Alleppey', state: 'Kerala', baseAQI: 40, tourTypes: ['beach','honeymoon','family'], description: 'Backwater houseboats, Vembanad Lake, Nehru Trophy Boat Race' },
  { name: 'Thekkady', state: 'Kerala', baseAQI: 20, tourTypes: ['wildlife','family'], description: 'Periyar Tiger Reserve, spice plantations, bamboo rafting' },
  { name: 'Varkala', state: 'Kerala', baseAQI: 35, tourTypes: ['beach','honeymoon'], description: 'Cliff beach, Papanasam Beach, Janardanaswami Temple' },
  { name: 'Kochi', state: 'Kerala', baseAQI: 42, tourTypes: ['heritage','family','honeymoon'], description: 'Fort Kochi, Chinese fishing nets, Mattancherry Palace' },

  // Rajasthan
  { name: 'Jaisalmer', state: 'Rajasthan', baseAQI: 88, tourTypes: ['heritage','honeymoon','family'], description: 'Golden Fort, Sam Sand Dunes, camel safari' },
  { name: 'Udaipur', state: 'Rajasthan', baseAQI: 88, tourTypes: ['heritage','honeymoon'], description: 'City of Lakes, Lake Palace, Sajjangarh Fort' },
  { name: 'Pushkar', state: 'Rajasthan', baseAQI: 95, tourTypes: ['pilgrimage','heritage'], description: 'Brahma Temple, Pushkar Lake, camel fair' },
  { name: 'Ranthambore', state: 'Rajasthan', baseAQI: 55, tourTypes: ['wildlife'], description: 'Tiger reserve, Ranthambore Fort, leopards and sloth bears' },
  { name: 'Mount Abu', state: 'Rajasthan', baseAQI: 42, tourTypes: ['family','honeymoon','trekking'], description: 'Only hill station in Rajasthan, Dilwara Temples, Nakki Lake', altitude: '1,220 m' },

  // Goa
  { name: 'North Goa', state: 'Goa', baseAQI: 35, tourTypes: ['beach','honeymoon','family'], description: 'Baga, Calangute, Anjuna beaches, nightlife, water sports' },
  { name: 'South Goa', state: 'Goa', baseAQI: 30, tourTypes: ['beach','honeymoon'], description: 'Palolem, Agonda, Colva — quieter, pristine beaches' },
  { name: 'Old Goa', state: 'Goa', baseAQI: 38, tourTypes: ['heritage','pilgrimage'], description: 'Basilica of Bom Jesus, Se Cathedral, UNESCO heritage churches' },

  // Tamil Nadu
  { name: 'Ooty', state: 'Tamil Nadu', baseAQI: 28, tourTypes: ['family','honeymoon','trekking'], description: 'Nilgiri Hills, Botanical Garden, toy train, Doddabetta peak', altitude: '2,240 m' },
  { name: 'Kodaikanal', state: 'Tamil Nadu', baseAQI: 22, tourTypes: ['honeymoon','trekking','family'], description: 'Coaker\'s Walk, Pillar Rocks, Kodai Lake, Dolphin\'s Nose', altitude: '2,133 m' },
  { name: 'Yercaud', state: 'Tamil Nadu', baseAQI: 30, tourTypes: ['family','trekking'], description: 'Shevaroy Hills, coffee estates, Yercaud Lake', altitude: '1,515 m' },
  { name: 'Mahabalipuram', state: 'Tamil Nadu', baseAQI: 48, tourTypes: ['heritage','beach','family'], description: 'Shore Temple, Pancha Rathas, UNESCO World Heritage site' },

  // Sikkim / Northeast
  { name: 'Gangtok', state: 'Sikkim', baseAQI: 20, tourTypes: ['family','honeymoon','trekking'], description: 'Rumtek Monastery, Tsomgo Lake, Nathula Pass', altitude: '1,650 m' },
  { name: 'Dzongri Trek', state: 'Sikkim', baseAQI: 12, tourTypes: ['trekking'], description: 'Kanchenjunga views, rhododendron forests, high-altitude meadows', altitude: '4,020 m' },
  { name: 'Darjeeling', state: 'West Bengal', baseAQI: 26, tourTypes: ['family','honeymoon','trekking'], description: 'Tiger Hill sunrise, tea gardens, toy train, Batasia Loop', altitude: '2,042 m' },
  { name: 'Shillong', state: 'Meghalaya', baseAQI: 24, tourTypes: ['family','trekking'], description: 'Living root bridges, Elephant Falls, Ward\'s Lake', altitude: '1,496 m' },
  { name: 'Cherrapunji', state: 'Meghalaya', baseAQI: 18, tourTypes: ['trekking','family'], description: 'Wettest place on Earth, Nohkalikai Falls, double-decker root bridges' },

  // Andhra / Telangana
  { name: 'Araku Valley', state: 'Andhra Pradesh', baseAQI: 28, tourTypes: ['trekking','family'], description: 'Coffee plantations, Borra Caves, tribal culture', altitude: '900 m' },
  { name: 'Horsley Hills', state: 'Andhra Pradesh', baseAQI: 32, tourTypes: ['family','trekking'], description: 'Eucalyptus forests, Mallamma Temple, cool climate', altitude: '1,265 m' },

  // Maharashtra
  { name: 'Lonavala', state: 'Maharashtra', baseAQI: 55, tourTypes: ['family','trekking'], description: 'Bhushi Dam, Karla Caves, Rajmachi Fort, monsoon waterfalls' },
  { name: 'Mahabaleshwar', state: 'Maharashtra', baseAQI: 38, tourTypes: ['family','honeymoon'], description: 'Strawberry farms, Venna Lake, Arthur\'s Seat viewpoint', altitude: '1,372 m' },
  { name: 'Matheran', state: 'Maharashtra', baseAQI: 30, tourTypes: ['family','trekking'], description: 'No-vehicle hill station, Charlotte Lake, Panorama Point', altitude: '803 m' },
  { name: 'Tadoba', state: 'Maharashtra', baseAQI: 35, tourTypes: ['wildlife'], description: 'Tiger reserve, leopards, sloth bears, gaur' },

  // Jammu & Kashmir / Ladakh
  { name: 'Leh', state: 'Ladakh', baseAQI: 15, tourTypes: ['trekking','heritage','honeymoon'], description: 'Pangong Lake, Nubra Valley, Thiksey Monastery', altitude: '3,524 m' },
  { name: 'Markha Valley Trek', state: 'Ladakh', baseAQI: 10, tourTypes: ['trekking'], description: 'Remote Himalayan trek, Hemis National Park, snow leopard habitat', altitude: '5,200 m' },
  { name: 'Gulmarg', state: 'J&K', baseAQI: 20, tourTypes: ['trekking','honeymoon','family'], description: 'Gondola ride, skiing, Alpather Lake, Apharwat Peak', altitude: '2,650 m' },
  { name: 'Pahalgam', state: 'J&K', baseAQI: 22, tourTypes: ['trekking','honeymoon'], description: 'Betaab Valley, Aru Valley, Amarnath base camp', altitude: '2,130 m' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function aqiColor(aqi: number) {
  if (aqi <= 50)  return '#10b981'
  if (aqi <= 100) return '#f59e0b'
  if (aqi <= 150) return '#f97316'
  if (aqi <= 200) return '#ef4444'
  if (aqi <= 300) return '#a855f7'
  return '#be123c'
}

function aqiCategory(aqi: number) {
  if (aqi <= 50)  return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very Unhealthy'
  return 'Hazardous'
}

/** Simulate day-by-day AQI forecast using a seeded random walk */
function forecastAQI(baseAQI: number, days: number, seed: number): number[] {
  const result: number[] = []
  let current = baseAQI
  // Simple seeded LCG for deterministic output
  let s = seed
  const rand = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
  for (let i = 0; i < days; i++) {
    const delta = (rand() - 0.48) * 12   // ±6 drift per day
    current = Math.max(5, Math.min(500, current + delta))
    result.push(Math.round(current))
  }
  return result
}

function verdict(aqi: number, maxSafe: number) {
  if (aqi <= maxSafe)        return { label: '✅ Safe',    color: '#10b981' }
  if (aqi <= maxSafe * 1.5)  return { label: '⚠️ Caution', color: '#f59e0b' }
  return                            { label: '🚫 Risky',   color: '#ef4444' }
}

const INDIAN_STATES = [...new Set(PLACES.map(p => p.state))].sort()

// ─── Component ────────────────────────────────────────────────────────────────

export function TravelAdvisorPage() {
  const [tourType, setTourType]         = useState<TourType | null>(null)
  const [days, setDays]                 = useState(3)
  const [selectedState, setSelectedState] = useState('')
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([])
  const [calculated, setCalculated]     = useState(false)

  // Places filtered by state + tour type
  const availablePlaces = useMemo(() => {
    if (!selectedState) return []
    return PLACES.filter(p =>
      p.state === selectedState &&
      (!tourType || p.tourTypes.includes(tourType.id))
    )
  }, [selectedState, tourType])

  const togglePlace = (name: string) => {
    setCalculated(false)
    setSelectedPlaces(prev =>
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    )
  }

  // When state changes, clear selected places
  const handleStateChange = (s: string) => {
    setSelectedState(s)
    setSelectedPlaces([])
    setCalculated(false)
  }

  // Results with forecast
  const results = useMemo(() => {
    if (!tourType || selectedPlaces.length === 0) return []
    return selectedPlaces.map((name, idx) => {
      const place = PLACES.find(p => p.name === name)!
      const forecast = forecastAQI(place.baseAQI, days, place.name.charCodeAt(0) * 31 + idx * 17)
      const avgAQI   = Math.round(forecast.reduce((a, b) => a + b, 0) / forecast.length)
      const maxAQI   = Math.max(...forecast)
      const v        = verdict(avgAQI, tourType.maxSafeAQI)
      return { place, forecast, avgAQI, maxAQI, verdict: v }
    })
  }, [tourType, selectedPlaces, days])

  const safeCount   = results.filter(r => r.verdict.label.startsWith('✅')).length
  const overallAvg  = results.length
    ? Math.round(results.reduce((s, r) => s + r.avgAQI, 0) / results.length)
    : 0

  const canCalculate = tourType !== null && selectedPlaces.length > 0

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <style>{`
        .step-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(14,165,233,0.15); border-radius: 16px; padding: 24px; margin-bottom: 18px; }
        .step-num  { display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#0ea5e9,#a855f7);color:#fff;font-size:12px;font-weight:800;margin-right:10px;flex-shrink:0; }
        .place-btn { padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);cursor:pointer;text-align:left;transition:all 0.15s;width:100%; }
        .place-btn:hover { border-color:rgba(14,165,233,0.4);background:rgba(14,165,233,0.06); }
        .place-btn.selected { border:2px solid #0ea5e9;background:rgba(14,165,233,0.1); }
        .forecast-bar { height:6px;border-radius:3px;transition:width 0.3s; }
        .tour-btn { padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);cursor:pointer;text-align:left;transition:all 0.15s; }
        .tour-btn:hover { border-color:rgba(14,165,233,0.3);background:rgba(14,165,233,0.05); }
        .tour-btn.active { border:2px solid #0ea5e9;background:rgba(14,165,233,0.12); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, background: 'linear-gradient(135deg,#38bdf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          ✈️ Travel AQI Advisor
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary,#8ba3c7)' }}>
          Discover real places, get day-by-day AQI forecast, and know if your trip is safe.
        </p>
      </div>

      {/* Step 1 — Tour Type */}
      <div className="step-card">
        <h2 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary,#f0f6ff)', display: 'flex', alignItems: 'center' }}>
          <span className="step-num">1</span> What kind of trip?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10 }}>
          {TOUR_TYPES.map(t => (
            <button key={t.id} type="button"
              className={`tour-btn${tourType?.id === t.id ? ' active' : ''}`}
              onClick={() => { setTourType(t); setCalculated(false) }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{t.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary,#f0f6ff)' }}>{t.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary,#8ba3c7)', marginTop: 2 }}>Safe AQI ≤ {t.maxSafeAQI}</div>
            </button>
          ))}
        </div>
        {tourType && (
          <div style={{ marginTop: 12, padding: '8px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, fontSize: 12, color: '#f59e0b' }}>
            ⚠️ {tourType.warning}
          </div>
        )}
      </div>

      {/* Step 2 — Duration */}
      <div className="step-card">
        <h2 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary,#f0f6ff)', display: 'flex', alignItems: 'center' }}>
          <span className="step-num">2</span> How many days?
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <input type="range" min={1} max={14} value={days}
            onChange={e => { setDays(Number(e.target.value)); setCalculated(false) }}
            style={{ flex: 1, accentColor: '#0ea5e9' }} aria-label="Number of days" />
          <div style={{ minWidth: 90, textAlign: 'center', padding: '8px 16px', background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 10, fontSize: 20, fontWeight: 800, color: '#38bdf8' }}>
            {days}d
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted,#4a6080)', marginTop: 4 }}>
          <span>1 day</span><span>14 days</span>
        </div>
      </div>

      {/* Step 3 — State */}
      <div className="step-card">
        <h2 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary,#f0f6ff)', display: 'flex', alignItems: 'center' }}>
          <span className="step-num">3</span> Select a state
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {INDIAN_STATES.map(s => (
            <button key={s} type="button"
              onClick={() => handleStateChange(s)}
              style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: selectedState === s ? '2px solid #0ea5e9' : '1px solid rgba(255,255,255,0.1)',
                background: selectedState === s ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.04)',
                color: selectedState === s ? '#38bdf8' : 'var(--text-secondary,#8ba3c7)',
                transition: 'all 0.15s',
              }}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Step 4 — Places */}
      {selectedState && (
        <div className="step-card">
          <h2 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary,#f0f6ff)', display: 'flex', alignItems: 'center' }}>
            <span className="step-num">4</span>
            {tourType
              ? `${tourType.emoji} ${tourType.label} places in ${selectedState}`
              : `Places in ${selectedState}`}
          </h2>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--text-secondary,#8ba3c7)' }}>
            {availablePlaces.length} places found · {selectedPlaces.length} selected
          </p>

          {availablePlaces.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted,#4a6080)', fontSize: 13 }}>
              No places match this tour type in {selectedState}. Try a different tour type or state.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10 }}>
              {availablePlaces.map(place => {
                const sel = selectedPlaces.includes(place.name)
                const color = aqiColor(place.baseAQI)
                return (
                  <button key={place.name} type="button"
                    className={`place-btn${sel ? ' selected' : ''}`}
                    onClick={() => togglePlace(place.name)}
                    aria-pressed={sel}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary,#f0f6ff)' }}>
                        {sel ? '✓ ' : ''}{place.name}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, color, background: `${color}20`, border: `1px solid ${color}44`, padding: '1px 7px', borderRadius: 999, flexShrink: 0, marginLeft: 6 }}>
                        {place.baseAQI}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary,#8ba3c7)', marginBottom: 4, lineHeight: 1.4 }}>
                      {place.description}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {place.altitude && (
                        <span style={{ fontSize: 10, color: '#38bdf8', background: 'rgba(14,165,233,0.1)', padding: '1px 6px', borderRadius: 4 }}>
                          ⛰️ {place.altitude}
                        </span>
                      )}
                      <span style={{ fontSize: 10, color, background: `${color}15`, padding: '1px 6px', borderRadius: 4 }}>
                        {aqiCategory(place.baseAQI)}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Calculate */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <button type="button" disabled={!canCalculate}
          onClick={() => setCalculated(true)}
          className="btn-primary"
          style={{ fontSize: 15, padding: '13px 40px', opacity: canCalculate ? 1 : 0.4 }}>
          🔍 Predict AQI & Check Safety
        </button>
      </div>

      {/* Results */}
      {calculated && results.length > 0 && (
        <>
          {/* Summary bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Trip Type',     value: `${tourType!.emoji} ${tourType!.label}`, color: '#38bdf8' },
              { label: 'Duration',      value: `${days} days`,                          color: '#a855f7' },
              { label: 'Places',        value: results.length,                          color: '#38bdf8' },
              { label: 'Safe Places',   value: `${safeCount}/${results.length}`,        color: '#10b981' },
              { label: 'Avg Trip AQI',  value: overallAvg,                              color: aqiColor(overallAvg) },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 14, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${s.color},transparent)` }} />
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary,#8ba3c7)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                <p style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 800, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Per-place result cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {results.map(({ place, forecast, avgAQI, maxAQI, verdict: v }) => {
              const color = aqiColor(avgAQI)
              return (
                <div key={place.name} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${v.color}44`,
                  borderLeft: `4px solid ${v.color}`,
                  borderRadius: 16, padding: 20,
                }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--text-primary,#f0f6ff)' }}>{place.name}</h3>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary,#8ba3c7)' }}>{place.state} {place.altitude ? `· ${place.altitude}` : ''}</p>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary,#8ba3c7)' }}>{place.description}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                      {/* Current AQI */}
                      <div style={{ textAlign: 'center', padding: '8px 14px', background: `${aqiColor(place.baseAQI)}18`, border: `1px solid ${aqiColor(place.baseAQI)}44`, borderRadius: 10 }}>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary,#8ba3c7)', marginBottom: 2 }}>Current</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: aqiColor(place.baseAQI), lineHeight: 1 }}>{place.baseAQI}</div>
                        <div style={{ fontSize: 9, color: aqiColor(place.baseAQI) }}>AQI</div>
                      </div>
                      {/* Avg forecast AQI */}
                      <div style={{ textAlign: 'center', padding: '8px 14px', background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 10 }}>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary,#8ba3c7)', marginBottom: 2 }}>{days}d Avg</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{avgAQI}</div>
                        <div style={{ fontSize: 9, color }}>AQI</div>
                      </div>
                    </div>
                  </div>

                  {/* Verdict */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: `${v.color}15`, border: `1px solid ${v.color}33`, borderRadius: 8, marginBottom: 16 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: v.color }}>{v.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary,#8ba3c7)' }}>
                      {v.label.startsWith('✅') ? 'Safe for your trip type' : v.label.startsWith('⚠️') ? 'Wear N95 mask, limit outdoor time' : 'Consider postponing or changing destination'}
                    </span>
                  </div>

                  {/* Day-by-day forecast */}
                  <div>
                    <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary,#8ba3c7)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Day-by-Day AQI Forecast
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {forecast.map((aqi, i) => {
                        const c = aqiColor(aqi)
                        const today = new Date()
                        today.setDate(today.getDate() + i)
                        const label = today.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
                        return (
                          <div key={i} style={{
                            flex: '1 1 80px', minWidth: 72, maxWidth: 100,
                            background: `${c}12`, border: `1px solid ${c}33`,
                            borderRadius: 10, padding: '8px 6px', textAlign: 'center',
                          }}>
                            <div style={{ fontSize: 9, color: 'var(--text-muted,#4a6080)', marginBottom: 4, lineHeight: 1.2 }}>{label}</div>
                            <div style={{ fontSize: 18, fontWeight: 900, color: c, lineHeight: 1 }}>{aqi}</div>
                            <div style={{ fontSize: 9, color: c, marginTop: 2 }}>{aqiCategory(aqi).split(' ')[0]}</div>
                            {/* Mini bar */}
                            <div style={{ marginTop: 5, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
                              <div style={{ height: '100%', borderRadius: 2, background: c, width: `${Math.min(100, (aqi / 300) * 100)}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                      {[
                        { label: 'Average AQI', value: avgAQI, color: aqiColor(avgAQI) },
                        { label: 'Peak AQI',    value: maxAQI, color: aqiColor(maxAQI) },
                        { label: 'Category',    value: aqiCategory(avgAQI), color: aqiColor(avgAQI) },
                        { label: 'Safe Threshold', value: tourType!.maxSafeAQI, color: '#10b981' },
                      ].map(s => (
                        <div key={s.label} style={{ fontSize: 12 }}>
                          <span style={{ color: 'var(--text-muted,#4a6080)' }}>{s.label}: </span>
                          <span style={{ fontWeight: 700, color: s.color }}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Overall recommendation */}
          <div style={{ marginTop: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 16, padding: 20 }}>
            <h2 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary,#f0f6ff)' }}>
              🧭 Overall Trip Recommendation
            </h2>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: aqiColor(overallAvg) }}>{overallAvg}</div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: aqiColor(overallAvg) }}>
                  Average AQI across all {days} days · {results.length} places
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary,#8ba3c7)' }}>
                  {safeCount === results.length
                    ? `✅ All ${results.length} places are safe for your ${tourType!.label} trip. Have a great journey!`
                    : safeCount === 0
                    ? `🚫 None of the selected places meet the AQI threshold for ${tourType!.label}. Consider different destinations or a different season.`
                    : `⚠️ ${safeCount} of ${results.length} places are safe. Prioritise safe places and carry an N95 mask for the rest.`}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
