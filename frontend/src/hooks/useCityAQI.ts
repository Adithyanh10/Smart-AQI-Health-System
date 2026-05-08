/**
 * useCityAQI
 *
 * Fetches live AQI for every city in the list by calling the backend's
 * /api/v1/aqi/location endpoint (which uses Open-Meteo + Nominatim).
 *
 * Strategy:
 *  - Cities are fetched in small concurrent batches to avoid hammering the API.
 *  - Results are stored per-city and merged with the static baseline data.
 *  - The whole set refreshes every REFRESH_INTERVAL_MS.
 *  - Individual city failures fall back to the baseline AQI silently.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { AQICategory } from '../types'
import { CITIES, type CityBase } from '../data/cities'

export interface LiveCityData extends CityBase {
  aqi: number
  category: AQICategory
  /** true while this city's live data is being fetched */
  loading: boolean
  /** true once at least one live fetch succeeded */
  hasLive: boolean
  lastUpdated: Date | null
}

const BATCH_SIZE = 5          // concurrent requests per batch
const BATCH_DELAY_MS = 400    // ms between batches (rate-limit friendly)
const REFRESH_INTERVAL_MS = 5 * 60 * 1000  // full refresh every 5 min

function aqiToCategory(aqi: number): AQICategory {
  if (aqi <= 50)  return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very Unhealthy'
  return 'Hazardous'
}

function baselineCategory(city: CityBase): AQICategory {
  return aqiToCategory(city.baseAqi)
}

/** Build initial state from baseline data */
function buildInitial(): Map<string, LiveCityData> {
  const map = new Map<string, LiveCityData>()
  for (const city of CITIES) {
    map.set(city.name, {
      ...city,
      aqi: city.baseAqi,
      category: baselineCategory(city),
      loading: false,
      hasLive: false,
      lastUpdated: null,
    })
  }
  return map
}

async function fetchCityAQI(city: CityBase): Promise<{ aqi: number; category: AQICategory } | null> {
  try {
    const res = await fetch(
      `/api/v1/aqi/location?lat=${city.lat.toFixed(6)}&lng=${city.lng.toFixed(6)}`
    )
    if (!res.ok) return null
    const json = await res.json()

    // The endpoint returns pollutants; we need to call /predict to get AQI
    // But to avoid a second round-trip, we compute a simple AQI estimate
    // from PM2.5 (the dominant pollutant for Indian cities).
    // If the backend returns an `aqi` field directly, use that.
    if (typeof json.aqi === 'number') {
      return { aqi: json.aqi, category: aqiToCategory(json.aqi) }
    }

    // Fallback: estimate from PM2.5 using US EPA breakpoints
    const pm25 = json['PM2.5'] ?? json.pm25 ?? null
    if (pm25 !== null) {
      const aqi = pm25ToAQI(pm25)
      return { aqi, category: aqiToCategory(aqi) }
    }

    return null
  } catch {
    return null
  }
}

/** US EPA PM2.5 → AQI linear interpolation */
function pm25ToAQI(pm25: number): number {
  const breakpoints: [number, number, number, number][] = [
    // [C_lo, C_hi, I_lo, I_hi]
    [0,     12.0,   0,   50],
    [12.1,  35.4,  51,  100],
    [35.5,  55.4, 101,  150],
    [55.5, 150.4, 151,  200],
    [150.5, 250.4, 201, 300],
    [250.5, 350.4, 301, 400],
    [350.5, 500.4, 401, 500],
  ]
  const c = Math.max(0, Math.min(500.4, pm25))
  for (const [cLo, cHi, iLo, iHi] of breakpoints) {
    if (c >= cLo && c <= cHi) {
      return Math.round(((iHi - iLo) / (cHi - cLo)) * (c - cLo) + iLo)
    }
  }
  return 500
}

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

export function useCityAQI() {
  const [cityMap, setCityMap] = useState<Map<string, LiveCityData>>(buildInitial)
  const [fetchProgress, setFetchProgress] = useState(0)   // 0–100
  const [isFetching, setIsFetching] = useState(false)
  const [lastFullUpdate, setLastFullUpdate] = useState<Date | null>(null)
  const abortRef = useRef(false)

  const fetchAll = useCallback(async () => {
    abortRef.current = false
    setIsFetching(true)
    setFetchProgress(0)

    const cities = [...CITIES]
    let done = 0

    // Mark all as loading
    setCityMap(prev => {
      const next = new Map(prev)
      for (const city of cities) {
        const existing = next.get(city.name)!
        next.set(city.name, { ...existing, loading: true })
      }
      return next
    })

    // Process in batches
    for (let i = 0; i < cities.length; i += BATCH_SIZE) {
      if (abortRef.current) break

      const batch = cities.slice(i, i + BATCH_SIZE)
      const results = await Promise.allSettled(
        batch.map(city => fetchCityAQI(city))
      )

      setCityMap(prev => {
        const next = new Map(prev)
        batch.forEach((city, idx) => {
          const existing = next.get(city.name)!
          const result = results[idx]
          if (result.status === 'fulfilled' && result.value) {
            next.set(city.name, {
              ...existing,
              aqi: result.value.aqi,
              category: result.value.category,
              loading: false,
              hasLive: true,
              lastUpdated: new Date(),
            })
          } else {
            // Keep existing (baseline or last live) but mark not loading
            next.set(city.name, { ...existing, loading: false })
          }
        })
        return next
      })

      done += batch.length
      setFetchProgress(Math.round((done / cities.length) * 100))

      if (i + BATCH_SIZE < cities.length) {
        await sleep(BATCH_DELAY_MS)
      }
    }

    setIsFetching(false)
    setLastFullUpdate(new Date())
  }, [])

  // Initial fetch + periodic refresh
  useEffect(() => {
    fetchAll()
    const timer = setInterval(fetchAll, REFRESH_INTERVAL_MS)
    return () => {
      abortRef.current = true
      clearInterval(timer)
    }
  }, [fetchAll])

  // Derived array sorted by AQI desc
  const cities = Array.from(cityMap.values())

  return { cities, cityMap, isFetching, fetchProgress, lastFullUpdate, refetch: fetchAll }
}
