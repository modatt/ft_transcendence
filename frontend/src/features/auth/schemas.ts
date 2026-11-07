import { z } from 'zod'

// Messages are i18n keys; the form translates them when it renders.
// The backend validates the same rules again in its DRF serializers.

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'auth.errors.emailRequired')
    .max(254, 'auth.errors.emailInvalid')
    .pipe(z.email('auth.errors.emailInvalid')),
  // Only check presence on login: showing the password policy here would leak it to guessers.
  password: z.string().min(1, 'auth.errors.passwordRequired').max(128, 'auth.errors.passwordTooLong'),
})

export const mfaSchema = z.object({
  // People often type the code as "123 456", so drop spaces first.
  code: z
    .string()
    .transform((value) => value.replace(/\s/g, ''))
    .pipe(z.string().regex(/^\d{6}$/, 'auth.errors.codeInvalid')),
})

export type LoginInput = z.infer<typeof loginSchema>
export type MfaInput = z.infer<typeof mfaSchema>
