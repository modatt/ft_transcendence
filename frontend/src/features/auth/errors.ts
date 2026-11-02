import type { TFunction } from 'i18next'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from '../../lib/api'

/**
 * Turn a failed auth request into one message for the form.
 * `rejectedKey` is the message for "the server said no" (wrong password, wrong code),
 * kept generic so it never reveals whether an email has an account.
 */
export function formErrorMessage(error: unknown, t: TFunction, rejectedKey: string): string {
  if (!(error instanceof ApiError)) return t('auth.errors.generic')
  if (error.status === 0) return t('auth.errors.network')
  if (error.code === 'account_locked') return t('auth.errors.locked')
  if (error.status === 429) return t('auth.errors.tooManyAttempts')
  if (error.status === 401 || error.code === 'invalid_credentials') return t(rejectedKey)
  // Django already translated these through Accept-Language.
  return error.nonFieldErrors[0] ?? error.detail ?? t('auth.errors.generic')
}

/**
 * Show DRF field errors (400 responses) under their inputs.
 * Returns false when there was nothing field-specific, so the caller shows a form-level alert instead.
 */
export function applyServerFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: Path<T>[],
): boolean {
  if (!(error instanceof ApiError) || error.status !== 400) return false
  let applied = false
  for (const field of fields) {
    const message = error.fieldErrors[field]?.[0]
    if (!message) continue
    setError(field, { type: 'server', message }, { shouldFocus: !applied })
    applied = true
  }
  return applied && error.nonFieldErrors.length === 0
}

/** Only follow `?next=` to a path on this site, never to another origin. */
export function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/'
  if (next.startsWith('/login')) return '/'
  return next
}
