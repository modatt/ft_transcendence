import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { type FieldError, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router'
import type { TFunction } from 'i18next'
import { Button } from '../../components/Button'
import { FormAlert } from '../../components/FormAlert'
import { TextField } from '../../components/TextField'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { login, verifyMfa } from './api'
import { applyServerFieldErrors, formErrorMessage, safeNextPath } from './errors'
import { type LoginInput, loginSchema, type MfaInput, mfaSchema } from './schemas'

// Client errors hold an i18n key; server errors arrive already translated by Django.
function fieldErrorText(error: FieldError | undefined, t: TFunction) {
  if (!error?.message) return undefined
  return error.type === 'server' ? error.message : t(error.message)
}

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials')

  useDocumentTitle(step === 'mfa' ? t('auth.mfa.title') : t('auth.login.title'))

  const goToNext = () => navigate(safeNextPath(searchParams.get('next')), { replace: true })

  return (
    <div className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
        {step === 'credentials' ? (
          <CredentialsForm onSignedIn={goToNext} onMfaRequired={() => setStep('mfa')} />
        ) : (
          <MfaForm onSignedIn={goToNext} onBack={() => setStep('credentials')} />
        )}
      </div>
    </div>
  )
}

function CredentialsForm({ onSignedIn, onMfaRequired }: { onSignedIn: () => void; onMfaRequired: () => void }) {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  // Keep the error itself, not its text, so it re-translates if the language changes.
  const [submitError, setSubmitError] = useState<unknown>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      const result = await login(values)
      if (result.mfa_required) onMfaRequired()
      else onSignedIn()
    } catch (error) {
      if (!applyServerFieldErrors(error, setError, ['email', 'password'])) setSubmitError(error)
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text">{t('auth.login.title')}</h1>
        <p className="text-sm text-muted">{t('auth.login.subtitle')}</p>
      </div>

      {submitError !== null && <FormAlert message={formErrorMessage(submitError, t, 'auth.errors.invalidCredentials')} />}

      <TextField
        id="email"
        type="email"
        label={t('auth.fields.email')}
        autoComplete="email"
        dir="ltr"
        className="rtl:text-right"
        error={fieldErrorText(errors.email, t)}
        {...register('email')}
      />

      <div className="flex flex-col gap-2">
        <TextField
          id="password"
          type={showPassword ? 'text' : 'password'}
          label={t('auth.fields.password')}
          autoComplete="current-password"
          dir="ltr"
          className="rtl:text-right"
          error={fieldErrorText(errors.password, t)}
          endSlot={
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-pressed={showPassword}
              aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
              title={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
              className="rounded-md p-2 text-muted hover:text-text"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
                {showPassword && <path d="M3 3l18 18" />}
              </svg>
            </button>
          }
          {...register('password')}
        />
        <Link to="/forgot-password" className="self-end text-sm text-primary hover:underline">
          {t('auth.login.forgotPassword')}
        </Link>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
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
  const [submitError, setSubmitError] = useState<unknown>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MfaInput>({
    resolver: zodResolver(mfaSchema),
    defaultValues: { code: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await verifyMfa(values)
      onSignedIn()
    } catch (error) {
      if (!applyServerFieldErrors(error, setError, ['code'])) setSubmitError(error)
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text">{t('auth.mfa.title')}</h1>
        <p className="text-sm text-muted">{t('auth.mfa.subtitle')}</p>
      </div>

      {submitError !== null && <FormAlert message={formErrorMessage(submitError, t, 'auth.errors.codeIncorrect')} />}

      <TextField
        id="code"
        label={t('auth.fields.code')}
        autoComplete="one-time-code"
        inputMode="numeric"
        maxLength={7}
        autoFocus
        dir="ltr"
        className="font-mono tracking-widest rtl:text-right"
        error={fieldErrorText(errors.code, t)}
        {...register('code')}
      />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? t('auth.mfa.submitting') : t('auth.mfa.submit')}
      </Button>
      <Button variant="ghost" onClick={onBack} className="w-full">
        {t('auth.mfa.back')}
      </Button>
    </form>
  )
}
