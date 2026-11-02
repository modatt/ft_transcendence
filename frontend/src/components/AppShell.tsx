import { Link, Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'

const CURRENT_YEAR = new Date().getFullYear()

export function AppShell() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-dvh flex-col bg-page text-text">
      <a
        href="#main"
        className="sr-only rounded-md bg-card px-4 py-2 text-text focus:not-sr-only focus:absolute focus:inset-s-4 focus:top-4 focus:z-10"
      >
        {t('nav.skipToContent')}
      </a>

      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-primary">{t('app.name')}</span>
            <span className="text-xs text-muted">{t('app.tagline')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="flex flex-1 flex-col focus:outline-none">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4 text-sm text-muted">
          <p>{t('footer.copyright', { year: CURRENT_YEAR })}</p>
          <nav className="flex gap-4">
            <Link to="/privacy" className="hover:text-text hover:underline">
              {t('footer.privacy')}
            </Link>
            <Link to="/terms" className="hover:text-text hover:underline">
              {t('footer.terms')}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
