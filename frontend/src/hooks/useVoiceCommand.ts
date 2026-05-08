/**
 * useVoiceCommand
 *
 * Uses the Web Speech API (SpeechRecognition) to capture voice input,
 * then generates a contextual response based on current AQI data.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PredictionResponse, LiveAQIResponse } from '../types'
import type { Language } from '../context/I18nContext'

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'answered' | 'error'

export interface VoiceMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
}

// Map our language codes to BCP-47 tags for SpeechRecognition
const LANG_TO_BCP47: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  bn: 'bn-IN',
  gu: 'gu-IN',
  mr: 'mr-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  ur: 'ur-IN',
}

// ─── Response Generator ───────────────────────────────────────────────────────

function generateResponse(
  query: string,
  prediction: PredictionResponse | null,
  liveData: LiveAQIResponse | null
): string {
  const q = query.toLowerCase()
  const aqi = prediction?.aqi ?? liveData?.aqi ?? null
  const category = prediction?.aqi_category ?? liveData?.aqi_category ?? null
  const pollutants = prediction
    ? { 'PM2.5': 0, PM10: 0, NO2: 0, SO2: 0, CO: 0, O3: 0 }
    : liveData?.pollutants ?? null

  if (aqi === null) {
    return "I don't have any air quality data yet. Please run a prediction or wait for live data to load."
  }

  // AQI value queries
  if (q.includes('aqi') && (q.includes('current') || q.includes('what') || q.includes('value') || q.includes('level') || q.includes('number'))) {
    return `The current AQI is ${aqi.toFixed(0)}, which is classified as "${category}". ${getCategoryAdvice(category)}`
  }

  // PM2.5 queries
  if (q.includes('pm2.5') || q.includes('pm 2.5') || q.includes('fine particles') || q.includes('fine dust')) {
    const val = pollutants?.['PM2.5']
    if (val !== null && val !== undefined) {
      return `The current PM2.5 level is ${val} µg/m³. ${val > 35 ? 'This exceeds the safe limit of 35 µg/m³. Sensitive individuals should avoid prolonged outdoor exposure.' : 'This is within acceptable limits.'}`
    }
    return `PM2.5 data is not available right now. The overall AQI is ${aqi.toFixed(0)} (${category}).`
  }

  // PM10 queries
  if (q.includes('pm10') || q.includes('pm 10') || q.includes('coarse particles')) {
    const val = pollutants?.['PM10']
    if (val !== null && val !== undefined) {
      return `The current PM10 level is ${val} µg/m³. ${val > 150 ? 'This is above the safe threshold. Consider wearing a mask outdoors.' : 'This is within acceptable limits.'}`
    }
    return `PM10 data is not available. The overall AQI is ${aqi.toFixed(0)} (${category}).`
  }

  // NO2 queries
  if (q.includes('no2') || q.includes('nitrogen dioxide') || q.includes('nitrogen')) {
    const val = pollutants?.['NO2']
    if (val !== null && val !== undefined) {
      return `Nitrogen dioxide (NO2) is at ${val} µg/m³. ${val > 100 ? 'Elevated NO2 can irritate airways. People with asthma should be cautious.' : 'NO2 levels are within safe range.'}`
    }
    return `NO2 data is not available. The overall AQI is ${aqi.toFixed(0)} (${category}).`
  }

  // SO2 queries
  if (q.includes('so2') || q.includes('sulfur') || q.includes('sulphur')) {
    const val = pollutants?.['SO2']
    if (val !== null && val !== undefined) {
      return `Sulfur dioxide (SO2) is at ${val} µg/m³. ${val > 75 ? 'High SO2 can cause respiratory issues. Limit outdoor activities.' : 'SO2 levels are acceptable.'}`
    }
    return `SO2 data is not available. The overall AQI is ${aqi.toFixed(0)} (${category}).`
  }

  // CO queries
  if (q.includes(' co ') || q.includes('carbon monoxide') || q.includes('co level')) {
    const val = pollutants?.['CO']
    if (val !== null && val !== undefined) {
      return `Carbon monoxide (CO) is at ${val} µg/m³. ${val > 10 ? 'Elevated CO levels can cause headaches and dizziness. Ensure good ventilation.' : 'CO levels are within safe limits.'}`
    }
    return `CO data is not available. The overall AQI is ${aqi.toFixed(0)} (${category}).`
  }

  // O3 / Ozone queries
  if (q.includes('o3') || q.includes('ozone')) {
    const val = pollutants?.['O3']
    if (val !== null && val !== undefined) {
      return `Ozone (O3) is at ${val} µg/m³. ${val > 100 ? 'High ozone levels can cause chest pain and coughing. Avoid strenuous outdoor activities.' : 'Ozone levels are within acceptable range.'}`
    }
    return `Ozone data is not available. The overall AQI is ${aqi.toFixed(0)} (${category}).`
  }

  // Safety / outdoor queries
  if (q.includes('safe') || q.includes('outside') || q.includes('outdoor') || q.includes('go out') || q.includes('exercise')) {
    return getOutdoorSafetyAdvice(aqi, category)
  }

  // Health advice
  if (q.includes('health') || q.includes('advice') || q.includes('precaution') || q.includes('protect') || q.includes('mask')) {
    return getHealthAdvice(aqi, category)
  }

  // Organ risk queries
  if (q.includes('organ') || q.includes('lung') || q.includes('heart') || q.includes('brain') || q.includes('skin') || q.includes('eye')) {
    return getOrganRiskInfo(aqi, category, q)
  }

  // Worst pollutant
  if (q.includes('worst') || q.includes('highest') || q.includes('most') || q.includes('dangerous pollutant') || q.includes('main pollutant')) {
    if (pollutants) {
      const entries = Object.entries(pollutants) as [string, number][]
      const worst = entries.reduce((a, b) => (b[1] > a[1] ? b : a))
      return `The highest pollutant right now is ${worst[0]} at ${worst[1]} µg/m³. This is the primary contributor to the current AQI of ${aqi.toFixed(0)}.`
    }
    return `The current AQI is ${aqi.toFixed(0)} (${category}). Run a prediction to see individual pollutant levels.`
  }

  // Category meaning
  if (q.includes('category') || q.includes('mean') || q.includes('what does') || q.includes('explain')) {
    return `The current category is "${category}". ${getCategoryExplanation(category)}`
  }

  // Children / elderly / sensitive groups
  if (q.includes('child') || q.includes('kid') || q.includes('elderly') || q.includes('senior') || q.includes('pregnant') || q.includes('asthma')) {
    return getSensitiveGroupAdvice(aqi, category, q)
  }

  // Trend / forecast
  if (q.includes('trend') || q.includes('forecast') || q.includes('tomorrow') || q.includes('improve') || q.includes('getting better') || q.includes('getting worse')) {
    return `I can only report current conditions. The AQI is currently ${aqi.toFixed(0)} (${category}). For forecasts, please check a dedicated weather service. ${getCategoryAdvice(category)}`
  }

  // Comparison
  if (q.includes('compare') || q.includes('yesterday') || q.includes('last week') || q.includes('history')) {
    return `I don't have historical data in this view. The current AQI is ${aqi.toFixed(0)} (${category}). Use the Compare page to analyze different AQI scenarios.`
  }

  // General pollution query
  if (q.includes('pollution') || q.includes('pollut') || q.includes('air quality') || q.includes('air')) {
    return `Current air quality: AQI ${aqi.toFixed(0)}, classified as "${category}". ${getCategoryAdvice(category)} ${getHealthAdvice(aqi, category)}`
  }

  // Fallback
  return `The current AQI is ${aqi.toFixed(0)} (${category}). ${getCategoryAdvice(category)} You can ask me about specific pollutants like PM2.5, PM10, NO2, SO2, CO, or O3, or ask for health advice.`
}

function getCategoryAdvice(category: string | null): string {
  switch (category) {
    case 'Good': return 'Air quality is satisfactory and poses little or no risk.'
    case 'Moderate': return 'Air quality is acceptable. Unusually sensitive people should consider limiting prolonged outdoor exertion.'
    case 'Unhealthy for Sensitive Groups': return 'Sensitive groups (children, elderly, people with respiratory conditions) should limit prolonged outdoor exertion.'
    case 'Unhealthy': return 'Everyone may begin to experience health effects. Sensitive groups should avoid prolonged outdoor exertion.'
    case 'Very Unhealthy': return 'Health alert — everyone may experience serious health effects. Avoid outdoor activities.'
    case 'Hazardous': return '⚠️ Emergency conditions! Everyone should avoid all outdoor activities. Stay indoors with windows closed.'
    default: return ''
  }
}

function getCategoryExplanation(category: string | null): string {
  switch (category) {
    case 'Good': return 'AQI 0–50. Air quality is considered satisfactory, and air pollution poses little or no risk to health.'
    case 'Moderate': return 'AQI 51–100. Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.'
    case 'Unhealthy for Sensitive Groups': return 'AQI 101–150. Members of sensitive groups may experience health effects. The general public is less likely to be affected.'
    case 'Unhealthy': return 'AQI 151–200. Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.'
    case 'Very Unhealthy': return 'AQI 201–300. Health alert: The risk of health effects is increased for everyone.'
    case 'Hazardous': return 'AQI 301–500. Health warning of emergency conditions: everyone is more likely to be affected.'
    default: return 'No data available.'
  }
}

function getOutdoorSafetyAdvice(aqi: number, category: string | null): string {
  if (aqi <= 50) return 'Yes, it is safe to go outside! Air quality is good. Enjoy outdoor activities freely.'
  if (aqi <= 100) return 'Generally safe to go outside. Unusually sensitive individuals may want to limit prolonged outdoor exertion.'
  if (aqi <= 150) return 'Sensitive groups (children, elderly, people with asthma or heart disease) should limit prolonged outdoor exertion. Others can go outside with caution.'
  if (aqi <= 200) return 'Not recommended for sensitive groups. Everyone should reduce prolonged or heavy outdoor exertion. Consider wearing an N95 mask.'
  if (aqi <= 300) return 'Avoid outdoor activities. Everyone may experience health effects. Stay indoors and keep windows closed.'
  return '⚠️ Do NOT go outside. Hazardous air quality. Stay indoors, keep windows and doors closed, and use an air purifier if available.'
}

function getHealthAdvice(aqi: number, category: string | null): string {
  if (aqi <= 50) return 'No special precautions needed. Enjoy the fresh air!'
  if (aqi <= 100) return 'Sensitive individuals should consider wearing a mask outdoors. Stay hydrated.'
  if (aqi <= 150) return 'Wear an N95 mask outdoors. Keep windows closed. Use air purifiers indoors. Avoid burning candles or incense.'
  if (aqi <= 200) return 'Wear an N95 mask. Stay indoors as much as possible. Avoid strenuous outdoor exercise. Keep medications handy if you have respiratory conditions.'
  if (aqi <= 300) return 'Stay indoors. Seal gaps in windows and doors. Run air purifiers on high. Seek medical attention if you experience breathing difficulty.'
  return '⚠️ Emergency health precautions: Stay indoors, seal all openings, use N95 masks even indoors if air purifier is unavailable. Call emergency services if experiencing severe symptoms.'
}

function getOrganRiskInfo(aqi: number, category: string | null, query: string): string {
  const base = `At AQI ${aqi.toFixed(0)} (${category}), `
  if (query.includes('lung')) {
    if (aqi <= 50) return base + 'lungs are at low risk. Normal breathing is unaffected.'
    if (aqi <= 150) return base + 'lungs may experience mild irritation. People with asthma or COPD should be cautious.'
    return base + 'lungs are at significant risk. Particulate matter can penetrate deep into lung tissue, causing inflammation and reduced lung function.'
  }
  if (query.includes('heart')) {
    if (aqi <= 100) return base + 'heart risk is low. Air pollution at this level has minimal cardiovascular impact.'
    return base + 'the heart is at elevated risk. Fine particles can enter the bloodstream and increase the risk of heart attack and stroke.'
  }
  if (query.includes('brain')) {
    if (aqi <= 100) return base + 'brain risk is minimal.'
    return base + 'the brain may be affected. Long-term exposure to high pollution levels is linked to cognitive decline and neurological issues.'
  }
  if (query.includes('eye')) {
    if (aqi <= 100) return base + 'eye irritation is unlikely.'
    return base + 'eyes may experience irritation, redness, and watering due to particulate matter and ozone.'
  }
  if (query.includes('skin')) {
    if (aqi <= 100) return base + 'skin risk is low.'
    return base + 'skin may experience oxidative stress from pollutants, potentially worsening conditions like eczema and acne.'
  }
  // General organ risk
  if (aqi <= 50) return 'All organs are at low risk. Air quality is good.'
  if (aqi <= 100) return 'Organs are generally safe. Sensitive individuals may experience mild effects on lungs and eyes.'
  if (aqi <= 150) return 'Lungs and eyes are at moderate risk. People with pre-existing conditions should take precautions.'
  if (aqi <= 200) return 'Lungs, heart, and eyes are at high risk. Everyone should limit exposure.'
  return 'All major organs — lungs, heart, brain, skin, and eyes — are at severe risk. Minimize all exposure immediately.'
}

function getSensitiveGroupAdvice(aqi: number, category: string | null, query: string): string {
  const group = query.includes('child') || query.includes('kid') ? 'children'
    : query.includes('elderly') || query.includes('senior') ? 'elderly individuals'
    : query.includes('pregnant') ? 'pregnant women'
    : query.includes('asthma') ? 'people with asthma'
    : 'sensitive individuals'

  if (aqi <= 50) return `${group.charAt(0).toUpperCase() + group.slice(1)} can safely go outside. Air quality is good.`
  if (aqi <= 100) return `${group.charAt(0).toUpperCase() + group.slice(1)} should monitor symptoms. Consider limiting prolonged outdoor activities.`
  if (aqi <= 150) return `${group.charAt(0).toUpperCase() + group.slice(1)} should avoid prolonged outdoor exertion. Keep rescue medications handy.`
  if (aqi <= 200) return `${group.charAt(0).toUpperCase() + group.slice(1)} should stay indoors. Avoid all outdoor activities. Consult a doctor if symptoms worsen.`
  return `⚠️ ${group.charAt(0).toUpperCase() + group.slice(1)} are at very high risk. Stay indoors, use air purifiers, and seek medical attention if needed.`
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseVoiceCommandOptions {
  language: Language
  prediction: PredictionResponse | null
  liveData: LiveAQIResponse | null
}

export function useVoiceCommand({ language, prediction, liveData }: UseVoiceCommandOptions) {
  const [status, setStatus] = useState<VoiceStatus>('idle')
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState<VoiceMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
    }
  }, [])

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = LANG_TO_BCP47[language]
    utterance.rate = 0.95
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
  }, [language])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setStatus('idle')
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSupported(false)
      setError('Voice recognition is not supported in your browser. Try Chrome or Edge.')
      return
    }

    if (status === 'listening') {
      stopListening()
      return
    }

    setError(null)
    setTranscript('')

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = LANG_TO_BCP47[language]
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onstart = () => setStatus('listening')

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1]
      const text = result[0].transcript
      setTranscript(text)
    }

    recognition.onend = () => {
      setStatus('processing')
      const finalTranscript = recognitionRef.current
        ? transcript
        : ''

      if (!finalTranscript.trim()) {
        setStatus('idle')
        return
      }

      // Add user message
      const userMsg: VoiceMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: finalTranscript,
        timestamp: new Date(),
      }

      // Generate response
      const responseText = generateResponse(finalTranscript, prediction, liveData)
      const assistantMsg: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: responseText,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, userMsg, assistantMsg])
      setStatus('answered')
      speak(responseText)
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.')
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone permission.')
      } else {
        setError(`Voice recognition error: ${event.error}`)
      }
      setStatus('error')
    }

    recognition.start()
  }, [language, status, transcript, prediction, liveData, speak, stopListening])

  const sendTextQuery = useCallback((query: string) => {
    if (!query.trim()) return
    setStatus('processing')

    const userMsg: VoiceMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
      timestamp: new Date(),
    }

    const responseText = generateResponse(query, prediction, liveData)
    const assistantMsg: VoiceMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: responseText,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setStatus('answered')
    speak(responseText)
  }, [prediction, liveData, speak])

  const clearMessages = useCallback(() => {
    setMessages([])
    setStatus('idle')
    setTranscript('')
    setError(null)
    window.speechSynthesis?.cancel()
  }, [])

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel()
  }, [])

  return {
    status,
    transcript,
    messages,
    error,
    isSupported,
    startListening,
    stopListening,
    sendTextQuery,
    clearMessages,
    stopSpeaking,
  }
}
