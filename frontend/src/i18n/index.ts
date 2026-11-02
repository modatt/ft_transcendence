import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import ar from './locales/ar.json'
import en from './locales/en.json'
import fr from './locales/fr.json'

export const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['code']

// Keep <html lang> and <html dir> in sync so Arabic mirrors to RTL (NFR-21).
function applyDocumentLanguage(lng: string) {
  const base = lng.split('-')[0]
  const language = LANGUAGES.find((l) => l.code === base) ?? LANGUAGES[0]
  document.documentElement.lang = language.code
  document.documentElement.dir = language.dir
}

i18n.on('languageChanged', applyDocumentLanguage)

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      fr: { translation: fr },
    },
    supportedLngs: LANGUAGES.map((l) => l.code),
    fallbackLng: 'en',
    load: 'languageOnly',
    // Resources are bundled, so there is nothing to wait for.
    initAsync: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'lang',
      caches: ['localStorage'],
    },
  })

export default i18n
