import { useCallback, useEffect, useRef, useState } from 'react'
import { getLiveAQI } from '../services/api'
import type { LiveAQIResponse } from '../types'

const SSE_URL = '/api/v1/aqi/stream'
const POLL_URL = '/api/v1/aqi/live'
const POLL_INTERVAL_MS = 30_000
const BACKOFF_STEPS = [5_000, 10_000, 20_000, 60_000]

export function useRealtime() {
  const [liveData, setLiveData] = useState<LiveAQIResponse | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [latencyMs, setLatencyMs] = useState<number | null>(null)

  const esRef = useRef<EventSource | null>(null)
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const backoffIndexRef = useRef(0)
  const usePollRef = useRef(false)

  const clearTimers = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }

  const startPolling = useCallback(() => {
    usePollRef.current = true
    const poll = async () => {
      if (document.visibilityState === 'hidden') {
        pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
        return
      }
      try {
        const start = Date.now()
        const data = await getLiveAQI()
        setLiveData(data)
        setLastUpdated(new Date())
        setLatencyMs(Date.now() - start)
        setIsConnected(true)
        backoffIndexRef.current = 0
      } catch {
        setIsConnected(false)
      }
      pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
    }
    poll()
  }, [])

  const connectSSE = useCallback(() => {
    if (esRef.current) {
      esRef.current.close()
    }

    const es = new EventSource(SSE_URL)
    esRef.current = es

    es.onopen = () => {
      setIsConnected(true)
      backoffIndexRef.current = 0
      usePollRef.current = false
    }

    es.onmessage = (event) => {
      if (document.visibilityState === 'hidden') return
      try {
        const start = Date.now()
        const data = JSON.parse(event.data) as LiveAQIResponse
        setLiveData(data)
        setLastUpdated(new Date())
        setLatencyMs(Date.now() - start)
      } catch {
        // ignore parse errors
      }
    }

    es.onerror = () => {
      es.close()
      esRef.current = null
      setIsConnected(false)

      const delay = BACKOFF_STEPS[Math.min(backoffIndexRef.current, BACKOFF_STEPS.length - 1)]
      backoffIndexRef.current = Math.min(backoffIndexRef.current + 1, BACKOFF_STEPS.length - 1)

      // Fall back to polling after first SSE error
      if (!usePollRef.current) {
        clearTimers()
        setTimeout(() => {
          // Try SSE again after backoff; if it fails again, stay on polling
          if (!usePollRef.current) {
            startPolling()
          }
        }, delay)
      }
    }
  }, [startPolling])

  useEffect(() => {
    connectSSE()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (usePollRef.current) {
          clearTimers()
          startPolling()
        } else if (!esRef.current || esRef.current.readyState === EventSource.CLOSED) {
          connectSSE()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      esRef.current?.close()
      clearTimers()
    }
  }, [connectSSE, startPolling])

  return { liveData, isConnected, lastUpdated, latencyMs }
}
