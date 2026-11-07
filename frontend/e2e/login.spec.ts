import { expect, test } from '@playwright/test'
import { PATHS } from '../src/paths'
import { expectNoAxeViolations, LANGUAGES, openPage, THEMES } from './support'

const MESSAGES = {
  en: { email: 'Email', password: 'Password', submit: 'Sign in', emailRequired: 'Enter your email address.' },
  ar: { email: 'البريد الإلكتروني', password: 'كلمة المرور', submit: 'تسجيل الدخول', emailRequired: 'أدخل بريدك الإلكتروني.' },
  fr: { email: 'Adresse e-mail', password: 'Mot de passe', submit: 'Se connecter', emailRequired: 'Saisissez votre adresse e-mail.' },
}

for (const language of LANGUAGES) {
  const m = MESSAGES[language.code]

  for (const theme of THEMES) {
    test(`error state meets WCAG AA in ${language.code}, ${theme} theme`, async ({ page }) => {
      await openPage(page, PATHS.login, language, theme)
      await page.getByRole('button', { name: m.submit }).click()
      await expect(page.getByText(m.emailRequired)).toBeVisible()
      await expectNoAxeViolations(page)
    })
  }

  test(`can be filled and submitted with the keyboard only in ${language.code}`, async ({ page }) => {
    await openPage(page, PATHS.login, language, 'light')
    const email = page.getByLabel(m.email)
    await email.focus()
    await page.keyboard.press('Enter')

    // Invalid fields are announced: focus goes to the first one, which points to its message.
    await expect(email).toBeFocused()
    await expect(email).toHaveAttribute('aria-invalid', 'true')
    await expect(email).toHaveAccessibleDescription(m.emailRequired)

    await page.keyboard.type('maker@example.com')
    await page.keyboard.press('Tab')
    await expect(page.getByLabel(m.password, { exact: true })).toBeFocused()
  })
}

test('show-password button reports its state to screen readers', async ({ page }) => {
  await openPage(page, PATHS.login, LANGUAGES[0], 'light')
  const toggle = page.getByRole('button', { name: 'Show password' })
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await toggle.click()
  await expect(page.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text')
})

test('server errors are announced in an alert', async ({ page }) => {
  await page.route('**/api/v1/auth/**', (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({ status: 204, headers: { 'Set-Cookie': 'csrftoken=e2e; Path=/' } })
      : route.fulfill({ status: 401, json: { detail: 'Invalid credentials.' } }),
  )
  await openPage(page, PATHS.login, LANGUAGES[0], 'light')
  await page.getByLabel('Email').fill('maker@example.com')
  await page.getByLabel('Password', { exact: true }).fill('wrong')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('alert')).toHaveText('The email or password is incorrect.')
  await expectNoAxeViolations(page)
})

test('2FA step moves focus to the code field', async ({ page }) => {
  await page.route('**/api/v1/auth/**', (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({ status: 204, headers: { 'Set-Cookie': 'csrftoken=e2e; Path=/' } })
      : route.fulfill({ status: 200, json: { mfa_required: true } }),
  )
  await openPage(page, PATHS.login, LANGUAGES[0], 'light')
  await page.getByLabel('Email').fill('staff@example.com')
  await page.getByLabel('Password', { exact: true }).fill('secret')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByLabel('Verification code')).toBeFocused()
  await expectNoAxeViolations(page)
})
