import { useI18nContext } from '../context/I18nContext'

export function useI18n() {
  const { t, language, setLanguage } = useI18nContext()
  return { t, language, setLanguage }
}
