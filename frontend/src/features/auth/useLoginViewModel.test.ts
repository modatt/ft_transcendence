import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import { useCredentialsViewModel } from './useLoginViewModel'

// The ViewModel is tested on its own, without rendering the login page.

const fetchMock = vi.fn<typeof fetch>()

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

async function fillAndSubmit(vm: { current: ReturnType<typeof useCredentialsViewModel> }) {
  await act(async () => {
    await vm.current.fields.email.onChange({ target: { name: 'email', value: 'maker@example.com' } })
    await vm.current.fields.password.onChange({ target: { name: 'password', value: 'secret' } })
  })
  await act(() => vm.current.submit())
}

beforeEach(async () => {
  document.cookie = 'csrftoken=test-token'
  vi.stubGlobal('fetch', fetchMock)
  await i18n.changeLanguage('en')
})

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

describe('useCredentialsViewModel', () => {
  it('moves to the 2FA step when the server asks for a code', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { mfa_required: true }))
    const onSignedIn = vi.fn()
    const onMfaRequired = vi.fn()
    const { result } = renderHook(() => useCredentialsViewModel({ onSignedIn, onMfaRequired }))

    await fillAndSubmit(result)

    expect(onMfaRequired).toHaveBeenCalledOnce()
    expect(onSignedIn).not.toHaveBeenCalled()
  })

  it('exposes a translated form error and re-translates it on language change', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(401, { detail: 'Invalid credentials.' }))
    const { result } = renderHook(() => useCredentialsViewModel({ onSignedIn: vi.fn(), onMfaRequired: vi.fn() }))

    await fillAndSubmit(result)
    expect(result.current.formError).toBe('The email or password is incorrect.')

    await act(() => i18n.changeLanguage('fr'))
    expect(result.current.formError).toBe("L'adresse e-mail ou le mot de passe est incorrect.")
  })

  it('does not call the server when the form is invalid', async () => {
    const { result } = renderHook(() => useCredentialsViewModel({ onSignedIn: vi.fn(), onMfaRequired: vi.fn() }))

    await act(() => result.current.submit())

    expect(result.current.errors.email).toBe('Enter your email address.')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
