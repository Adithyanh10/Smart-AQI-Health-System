/**
 * useLiveLocation
 *
 * Uses the browser Geolocation API to get the user's coordinates, then
 * calls the backend proxy /api/v1/aqi/location which:
 *   1. Fetches real-time air quality from Open-Meteo (free, no API key)
 *   2. Reverse-geocodes via Nominatim server-side (avoids CORS/User-Agent issues)
 *
 * The backend returns pollutants + city + state + country in one response.
 */

import { useState, useCallback } from 'react'
import type { PollutantInput } from '../types'

export interface LiveLocationData {
  lat: number
  lng: number
  city: string
  state: string
  country: string
  pollutants: PollutantInput
  fetchedAt: Date
}

export type LocationStatus =
  | 'idle'
  | 'locating'
  | 'fetching'
  | 'success'
  | 'error'

interface UseLiveLocationReturn {
  status: LocationStatus
  data: LiveLocationData | null
  error: string | null
  fetchLocation: () => void
}

export function useLiveLocation(): UseLiveLocationReturn {
  const [status, setStatus] = useState<LocationStatus>('idle')
  const [data, setData]     = useState<LiveLocationData | null>(null)
  const [error, setError]   = useState<string | null>(null)

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      setStatus('error')
      return
    }

    setStatus('locating')
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setStatus('fetching')

        try {
          // Single backend call — returns pollutants + city + state + country
          const res = await window.fetch(
            `/api/v1/aqi/location?lat=${lat.toFixed(6)}&lng=${lng.toFixed(6)}`
          )

          if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            throw new Error(body?.detail ?? `Server error ${res.status}`)
          }

          const json = await res.json()

          const pollutants: PollutantInput = {
            'PM2.5': json['PM2.5'] ?? 0,
            'PM10':  json['PM10']  ?? 0,
            'NO2':   json['NO2']   ?? 0,
            'SO2':   json['SO2']   ?? 0,
            'CO':    json['CO']    ?? 0,
            'O3':    json['O3']    ?? 0,
          }

          setData({
            lat, lng,
            city:    json.city    ?? 'Unknown',
            state:   json.state   ?? '',
            country: json.country ?? '',
            pollutants,
            fetchedAt: new Date(),
          })
          setStatus('success')
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch air quality data.')
          setStatus('error')
        }
      },
      (geoErr) => {
        const messages: Record<number, string> = {
          1: 'Location access denied. Please allow location permission in your browser settings.',
          2: 'Location unavailable. Please check your device GPS and try again.',
          3: 'Location request timed out. Please try again.',
        }
        setError(messages[geoErr.code] ?? 'Failed to get your location.')
        setStatus('error')
      },
      { timeout: 15000, maximumAge: 60000, enableHighAccuracy: false }
    )
  }, [])

  return { status, data, error, fetchLocation }
}
