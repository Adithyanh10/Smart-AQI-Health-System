import React, { createContext, useCallback, useContext, useState } from 'react'
import en from '../i18n/en.json'
import hi from '../i18n/hi.json'
import ta from '../i18n/ta.json'
import te from '../i18n/te.json'
import kn from '../i18n/kn.json'
import ml from '../i18n/ml.json'
import bn from '../i18n/bn.json'
import gu from '../i18n/gu.json'
import mr from '../i18n/mr.json'
import pa from '../i18n/pa.json'
import or from '../i18n/or.json'
import ur from '../i18n/ur.json'

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'bn' | 'gu' | 'mr' | 'pa' | 'or' | 'ur'

export interface LanguageMeta {
  code: Language
  label: string
  nativeLabel: string
  dir?: 'ltr' | 'rtl'
}

export const LANGUAGES: LanguageMeta[] = [
  { code: 'en', label: 'English',    nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi',      nativeLabel: 'हिन्दी' },
  { code: 'ta', label: 'Tamil',      nativeLabel: 'தமிழ்' },
  { code: 'te', label: 'Telugu',     nativeLabel: 'తెలుగు' },
  { code: 'kn', label: 'Kannada',    nativeLabel: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam',  nativeLabel: 'മലയാളം' },
  { code: 'bn', label: 'Bengali',    nativeLabel: 'বাংলা' },
  { code: 'gu', label: 'Gujarati',   nativeLabel: 'ગુજરાતી' },
  { code: 'mr', label: 'Marathi',    nativeLabel: 'मराठी' },
  { code: 'pa', label: 'Punjabi',    nativeLabel: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'Odia',       nativeLabel: 'ଓଡ଼ିଆ' },
  { code: 'ur', label: 'Urdu',       nativeLabel: 'اردو', dir: 'rtl' },
]

type Translations = Record<string, unknown>

const TRANSLATIONS: Record<Language, Translations> = {
  en, hi, ta, te, kn, ml, bn, gu, mr, pa, or, ur,
}

interface I18nContextValue {
  language: Language
  t: (key: string) => string
  setLanguage: (lang: Language) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

function resolveDotNotation(obj: Translations, key: string): string {
  const parts = key.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return key
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : key
}

const VALID_LANGS = new Set<string>(LANGUAGES.map(l => l.code))

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('aqi_language')
    return stored && VALID_LANGS.has(stored) ? (stored as Language) : 'en'
  })

  const setLanguage = (lang: Language) => {
    localStorage.setItem('aqi_language', lang)
    setLanguageState(lang)
    // Update document direction for RTL languages
    const meta = LANGUAGES.find(l => l.code === lang)
    document.documentElement.dir = meta?.dir ?? 'ltr'
  }

  const t = useCallback(
    (key: string): string => {
      const result = resolveDotNotation(TRANSLATIONS[language], key)
      // Fall back to English if key not found in current language
      if (result === key && language !== 'en') {
        return resolveDotNotation(TRANSLATIONS['en'], key)
      }
      return result
    },
    [language]
  )

  return (
    <I18nContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18nContext(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18nContext must be used within I18nProvider')
  return ctx
}
