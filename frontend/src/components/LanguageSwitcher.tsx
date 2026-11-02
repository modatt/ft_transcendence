import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../i18n'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  return (
    <div>
      <label htmlFor="language" className="sr-only">
        {t('nav.language')}
      </label>
      <select
        id="language"
        value={i18n.resolvedLanguage}
        onChange={(event) => void i18n.changeLanguage(event.target.value)}
        className="rounded-md border border-border bg-card px-2 py-1.5 text-sm text-text"
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code} lang={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </div>
  )
}
