import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import { FormAlert } from '../../components/FormAlert'
import { TextField } from '../../components/TextField'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useCredentialsViewModel, useLoginViewModel, useMfaViewModel } from './useLoginViewModel'

// View (MVVM): layout only. State and logic live in useLoginViewModel.ts.

export function LoginPage() {
  const vm = useLoginViewModel()
  useDocumentTitle(vm.title)

  return (
    <div className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
        {vm.step === 'credentials' ? (
          <CredentialsForm onSignedIn={vm.onSignedIn} onMfaRequired={vm.onMfaRequired} />
        ) : (
          <MfaForm onSignedIn={vm.onSignedIn} onBack={vm.backToCredentials} />
        )}
      </div>
    </div>
  )
}

function CredentialsForm({ onSignedIn, onMfaRequired }: { onSignedIn: () => void; onMfaRequired: () => void }) {
  const { t } = useTranslation()
  const vm = useCredentialsViewModel({ onSignedIn, onMfaRequired })
  const passwordToggleLabel = vm.showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')

  return (
    <form onSubmit={vm.submit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text">{t('auth.login.title')}</h1>
        <p className="text-sm text-muted">{t('auth.login.subtitle')}</p>
      </div>

      {vm.formError && <FormAlert message={vm.formError} />}

      <TextField
        id="email"
        type="email"
        label={t('auth.fields.email')}
        autoComplete="email"
        dir="ltr"
        className="rtl:text-right"
        error={vm.errors.email}
        {...vm.fields.email}
      />

      <div className="flex flex-col gap-2">
        <TextField
          id="password"
          type={vm.showPassword ? 'text' : 'password'}
          label={t('auth.fields.password')}
          autoComplete="current-password"
          dir="ltr"
          className="rtl:text-right"
          error={vm.errors.password}
          endSlot={
            <button
              type="button"
              onClick={vm.toggleShowPassword}
              aria-pressed={vm.showPassword}
              aria-label={passwordToggleLabel}
              title={passwordToggleLabel}
              className="rounded-md p-2 text-muted hover:text-text"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
                {vm.showPassword && <path d="M3 3l18 18" />}
              </svg>
            </button>
          }
          {...vm.fields.password}
        />
        <Link to="/forgot-password" className="self-end text-sm text-primary hover:underline">
          {t('auth.login.forgotPassword')}
        </Link>
      </div>

      <Button type="submit" disabled={vm.isSubmitting} className="w-full">
        {vm.isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
      </Button>

      <p className="text-center text-sm text-muted">
        {t('auth.login.noAccount')}{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          {t('auth.login.register')}
        </Link>
      </p>
    </form>
  )
}

function MfaForm({ onSignedIn, onBack }: { onSignedIn: () => void; onBack: () => void }) {
  const { t } = useTranslation()
  const vm = useMfaViewModel({ onSignedIn })

  return (
    <form onSubmit={vm.submit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text">{t('auth.mfa.title')}</h1>
        <p className="text-sm text-muted">{t('auth.mfa.subtitle')}</p>
      </div>

      {vm.formError && <FormAlert message={vm.formError} />}

      <TextField
        id="code"
        label={t('auth.fields.code')}
        autoComplete="one-time-code"
        inputMode="numeric"
        maxLength={7}
        autoFocus
        dir="ltr"
        className="font-mono tracking-widest rtl:text-right"
        error={vm.errors.code}
        {...vm.fields.code}
      />

      <Button type="submit" disabled={vm.isSubmitting} className="w-full">
        {vm.isSubmitting ? t('auth.mfa.submitting') : t('auth.mfa.submit')}
      </Button>
      <Button variant="ghost" onClick={onBack} className="w-full">
        {t('auth.mfa.back')}
      </Button>
    </form>
  )
}
