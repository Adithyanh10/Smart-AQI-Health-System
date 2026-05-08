import { useCallback, useState } from 'react'
import { predictAQI } from '../services/api'
import type { PollutantInput, PredictionResponse } from '../types'
import { useProfile } from './useProfile'

export function useAQIPrediction() {
  const [input, setInput] = useState<Partial<PollutantInput>>({})
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addToHistory } = useProfile()

  const setField = useCallback((key: keyof PollutantInput, value: number) => {
    setInput(prev => ({ ...prev, [key]: value }))
  }, [])

  const setAllFields = useCallback((values: PollutantInput) => {
    setInput(values)
  }, [])

  const predict = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await predictAQI(input as PollutantInput)
      setResult(response)
      addToHistory({
        input: input as PollutantInput,
        aqi: response.aqi,
        aqi_category: response.aqi_category,
        timestamp: response.timestamp,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Prediction failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [input, addToHistory])

  const clearForm = useCallback(() => {
    setInput({})
    setResult(null)
    setError(null)
  }, [])

  return { input, result, loading, error, setField, setAllFields, predict, clearForm }
}
