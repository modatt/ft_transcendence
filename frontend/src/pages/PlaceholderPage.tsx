import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useDocumentTitle } from '../lib/useDocumentTitle'

/** Stand-in for routes that later tasks will build, so links never lead to a dead end. */
export function PlaceholderPage({ messageKey = 'page.comingSoon' }: { messageKey?: string }) {
  const { t } = useTranslation()
  useDocumentTitle(t(messageKey))
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <h1 className="text-lg font-medium text-text">{t(messageKey)}</h1>
      <Link to="/login" className="text-primary hover:underline">
        {t('page.backToSignIn')}
      </Link>
    </div>
  )
}
