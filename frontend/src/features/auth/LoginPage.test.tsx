import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import { safeNextPath } from './errors'
import { LoginPage } from './LoginPage'

const fetchMock = vi.fn<typeof fetch>()

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function renderLogin(url = '/login') {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginPage /> },
      { path: '/', element: <p>home page</p> },
      { path: '/jobs', element: <p>jobs page</p> },
    ],
    { initialEntries: [url] },
  )
  render(<RouterProvider router={router} />)
  return userEvent.setup()
}

beforeEach(async () => {
  // A CSRF cookie is already present, so the client goes straight to the POST.
  document.cookie = 'csrftoken=test-token'
  vi.stubGlobal('fetch', fetchMock)
  await i18n.changeLanguage('en')
})

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

describe('LoginPage', () => {
  it('shows required-field errors without calling the server', async () => {
    const user = renderLogin()
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects a malformed email', async () => {
    const user = renderLogin()
    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.type(screen.getByLabelText('Password'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText(/Enter a valid email address/)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows errors in Arabic and switches the page to RTL', async () => {
    await i18n.changeLanguage('ar')
    const user = renderLogin()
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')

    await user.click(screen.getByRole('button', { name: 'تسجيل الدخول' }))
    expect(await screen.findByText('أدخل بريدك الإلكتروني.')).toBeInTheDocument()
  })

  it('shows errors in French', async () => {
    await i18n.changeLanguage('fr')
    const user = renderLogin()
    expect(document.documentElement).toHaveAttribute('dir', 'ltr')

    await user.click(screen.getByRole('button', { name: 'Se connecter' }))
    expect(await screen.findByText('Saisissez votre adresse e-mail.')).toBeInTheDocument()
  })

  it('sends trimmed credentials with the CSRF token and goes to ?next', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { user: { id: 1, email: 'a@b.jo', role: 'customer', locale: 'en' } }))
    const user = renderLogin('/login?next=/jobs')
    await user.type(screen.getByLabelText('Email'), '  maker@example.com ')
    await user.type(screen.getByLabelText('Password'), 'correct horse')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('jobs page')).toBeInTheDocument()
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/auth/login')
    expect(JSON.parse(init?.body as string)).toEqual({ email: 'maker@example.com', password: 'correct horse' })
    expect(new Headers(init?.headers).get('X-CSRFToken')).toBe('test-token')
  })

  it('shows a generic message for wrong credentials', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(401, { detail: 'Invalid credentials.' }))
    const user = renderLogin()
    await user.type(screen.getByLabelText('Email'), 'maker@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('The email or password is incorrect.')
  })

  it('shows server field errors under the matching input', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(400, { email: ['Enter a valid email address.'] }))
    const user = renderLogin()
    await user.type(screen.getByLabelText('Email'), 'maker@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('explains a locked account', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(403, { detail: 'Locked.', code: 'account_locked' }))
    const user = renderLogin()
    await user.type(screen.getByLabelText('Email'), 'maker@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/account is locked/)
  })

  it('reports a network failure', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    const user = renderLogin()
    await user.type(screen.getByLabelText('Email'), 'maker@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/Can't reach the server/)
  })

  it('asks for a 2FA code when the account needs one', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, { mfa_required: true }))
      .mockResolvedValueOnce(jsonResponse(401, { detail: 'Bad code.' }))
      .mockResolvedValueOnce(jsonResponse(200, { user: { id: 1, email: 'a@b.jo', role: 'staff', locale: 'en' } }))
    const user = renderLogin()
    await user.type(screen.getByLabelText('Email'), 'staff@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    const code = await screen.findByLabelText('Verification code')
    await user.type(code, '12345')
    await user.click(screen.getByRole('button', { name: 'Verify' }))
    expect(await screen.findByText('Enter the 6 digits from your authenticator app.')).toBeInTheDocument()

    await user.clear(code)
    await user.type(code, '123 456')
    await user.click(screen.getByRole('button', { name: 'Verify' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/That code didn't work/)

    await user.click(screen.getByRole('button', { name: 'Verify' }))
    expect(await screen.findByText('home page')).toBeInTheDocument()
    expect(JSON.parse(fetchMock.mock.calls[2][1]?.body as string)).toEqual({ code: '123456' })
  })
})

describe('safeNextPath', () => {
  it.each([
    [null, '/'],
    ['/jobs?tab=open', '/jobs?tab=open'],
    ['https://evil.example', '/'],
    ['//evil.example', '/'],
    ['/\\evil.example', '/'],
    ['/login', '/'],
  ])('%s -> %s', (next, expected) => {
    expect(safeNextPath(next)).toBe(expected)
  })
})
