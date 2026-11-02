import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { type FieldError, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'
import type { TFunction } from 'i18next'
import { login, verifyMfa } from './api'
import { applyServerFieldErrors, formErrorMessage, safeNextPath } from './errors'
import { type LoginInput, loginSchema, type MfaInput, mfaSchema } from './schemas'

// ViewModels for the login screen (MVVM): they hold the state and logic, and hand the
// View ready-to-show values. The View (LoginPage.tsx) only lays them out.

// Client errors hold an i18n key; server errors arrive already translated by Django.
function fieldErrorText(error: FieldError | undefined, t: TFunction) {
  if (!error?.message) return undefined
  return error.type === 'server' ? error.message : t(error.message)
}

/** Which step of the login is showing, and where to go after a successful sign-in. */
export function useLoginViewModel() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials')

  return {
    step,
    title: step === 'mfa' ? t('auth.mfa.title') : t('auth.login.title'),
    onSignedIn: () => navigate(safeNextPath(searchParams.get('next')), { replace: true }),
    onMfaRequired: () => setStep('mfa'),
    backToCredentials: () => setStep('credentials'),
  }
}

type CredentialsCallbacks = { onSignedIn: () => void; onMfaRequired: () => void }

export function useCredentialsViewModel({ onSignedIn, onMfaRequired }: CredentialsCallbacks) {
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

  const submit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      const result = await login(values)
      if (result.mfa_required) onMfaRequired()
      else onSignedIn()
    } catch (error) {
      if (!applyServerFieldErrors(error, setError, ['email', 'password'])) setSubmitError(error)
    }
  })

  return {
    fields: { email: register('email'), password: register('password') },
    errors: { email: fieldErrorText(errors.email, t), password: fieldErrorText(errors.password, t) },
    formError: submitError === null ? null : formErrorMessage(submitError, t, 'auth.errors.invalidCredentials'),
    isSubmitting,
    showPassword,
    toggleShowPassword: () => setShowPassword((shown) => !shown),
    submit,
  }
}

export function useMfaViewModel({ onSignedIn }: { onSignedIn: () => void }) {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<unknown>(null)
  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<MfaInput>({
    resolver: zodResolver(mfaSchema),
    defaultValues: { code: '' },
  })

  // The step replaces the password form, so move focus to the code field; otherwise
  // keyboard and screen-reader users are left on an element that no longer exists.
  useEffect(() => {
    setFocus('code')
  }, [setFocus])

  const submit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await verifyMfa(values)
      onSignedIn()
    } catch (error) {
      if (!applyServerFieldErrors(error, setError, ['code'])) setSubmitError(error)
    }
  })

  return {
    fields: { code: register('code') },
    errors: { code: fieldErrorText(errors.code, t) },
    formError: submitError === null ? null : formErrorMessage(submitError, t, 'auth.errors.codeIncorrect'),
    isSubmitting,
    submit,
  }
}
