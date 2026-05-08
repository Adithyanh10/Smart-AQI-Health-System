import React, { createContext, useCallback, useContext, useState } from 'react'
import type { PredictionHistoryEntry, UserProfile } from '../types'

const MAX_HISTORY = 50

interface ProfileContextValue {
  profile: UserProfile | null
  setProfile: (profile: UserProfile | null) => void
  history: PredictionHistoryEntry[]
  addToHistory: (entry: Omit<PredictionHistoryEntry, 'id'>) => void
  clearHistory: () => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem('aqi_profile')
    return raw ? (JSON.parse(raw) as UserProfile) : null
  } catch {
    return null
  }
}

function loadHistory(): PredictionHistoryEntry[] {
  try {
    const raw = localStorage.getItem('aqi_history')
    return raw ? (JSON.parse(raw) as PredictionHistoryEntry[]) : []
  } catch {
    return []
  }
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(loadProfile)
  const [history, setHistory] = useState<PredictionHistoryEntry[]>(loadHistory)

  const setProfile = useCallback((p: UserProfile | null) => {
    setProfileState(p)
    if (p) {
      localStorage.setItem('aqi_profile', JSON.stringify(p))
    } else {
      localStorage.removeItem('aqi_profile')
    }
  }, [])

  const addToHistory = useCallback((entry: Omit<PredictionHistoryEntry, 'id'>) => {
    const newEntry: PredictionHistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
    }
    setHistory(prev => {
      const updated = [newEntry, ...prev].slice(0, MAX_HISTORY)
      localStorage.setItem('aqi_history', JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem('aqi_history')
  }, [])

  return (
    <ProfileContext.Provider value={{ profile, setProfile, history, addToHistory, clearHistory }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfileContext(): ProfileContextValue {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfileContext must be used within ProfileProvider')
  return ctx
}
