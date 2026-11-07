import { apiPost } from '../../lib/api'
import type { LoginInput, MfaInput } from './schemas'

export type Role = 'customer' | 'guardian' | 'staff' | 'finance' | 'program_manager' | 'admin'

export type AuthUser = {
  id: number
  email: string
  role: Role
  locale: 'ar' | 'en' | 'fr'
}

// The backend answers a correct password with mfa_required when the user has 2FA on (FR-07).
export type LoginResponse = { mfa_required: true } | { mfa_required?: false; user: AuthUser }

export function login(input: LoginInput) {
  return apiPost<LoginResponse>('/auth/login', input)
}

export function verifyMfa(input: MfaInput) {
  return apiPost<{ user: AuthUser }>('/auth/mfa/verify', input)
}
