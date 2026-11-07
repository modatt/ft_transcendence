import i18n from '../i18n'

const API_BASE = '/api/v1'
const CSRF_COOKIE = 'csrftoken'

type ErrorBody = {
  detail?: string
  code?: string
  non_field_errors?: string[]
  [field: string]: unknown
}

/**
 * An API failure, normalised from Django REST Framework's error format:
 * `{ "detail": "...", "code": "..." }` or `{ "field": ["msg"], "non_field_errors": ["msg"] }`.
 * status 0 means the request never reached the server.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly detail?: string
  readonly fieldErrors: Record<string, string[]>
  readonly nonFieldErrors: string[]

  constructor(status: number, body: ErrorBody | null) {
    super(body?.detail ?? `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.code = body?.code
    this.detail = body?.detail
    this.nonFieldErrors = body?.non_field_errors ?? []
    this.fieldErrors = {}
    for (const [field, value] of Object.entries(body ?? {})) {
      if (field === 'non_field_errors') continue
      if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
        this.fieldErrors[field] = value
      }
    }
  }
}

function readCookie(name: string): string | null {
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null
}

// Django only sets the CSRF cookie when a view asks for it, so fetch it once before the first write.
async function ensureCsrfCookie() {
  if (readCookie(CSRF_COOKIE)) return
  await fetch(`${API_BASE}/auth/csrf`, { credentials: 'same-origin' })
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  let response: Response
  try {
    await ensureCsrfCookie()
    response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // Django translates its validation messages using this header.
        'Accept-Language': i18n.resolvedLanguage ?? 'en',
        'X-CSRFToken': readCookie(CSRF_COOKIE) ?? '',
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, null)
  }

  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(response.status, data && typeof data === 'object' ? (data as ErrorBody) : null)
  }
  return data as T
}
