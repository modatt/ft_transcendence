import { expect, test } from '@playwright/test'
import { PATHS } from '../src/paths'
import { expectNoAxeViolations, expectNoHorizontalScroll, LANGUAGES, openPage, THEMES } from './support'

// Every page in PATHS, in every language and theme. New pages are picked up automatically.
for (const [name, path] of Object.entries(PATHS)) {
  test.describe(`${name} page`, () => {
    for (const language of LANGUAGES) {
      for (const theme of THEMES) {
        test(`meets WCAG AA in ${language.code}, ${theme} theme`, async ({ page }) => {
          await openPage(page, path, language, theme)
          await expectNoAxeViolations(page)
        })
      }

      test(`reflows at 320px without horizontal scrolling in ${language.code}`, async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 640 })
        await openPage(page, path, language, 'light')
        await expectNoHorizontalScroll(page)
      })
    }
  })
}

test.describe('app shell', () => {
  test('skip link is the first Tab stop and moves focus to the main content', async ({ page }) => {
    await openPage(page, PATHS.login, LANGUAGES[0], 'light')
    await page.keyboard.press('Tab')
    const skipLink = page.getByRole('link', { name: 'Skip to main content' })
    await expect(skipLink).toBeFocused()
    await expect(skipLink).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.locator('main')).toBeFocused()
  })

  test('mirrors the layout in Arabic, not only the text direction', async ({ page }) => {
    for (const language of [LANGUAGES[0], LANGUAGES[1]]) {
      await openPage(page, PATHS.login, language, 'light')
      const brand = await page.getByRole('banner').getByRole('link').first().boundingBox()
      const switcher = await page.getByRole('combobox').boundingBox()
      expect(brand && switcher).toBeTruthy()
      // The brand sits at the start edge: left in English, right in Arabic.
      if (language.dir === 'ltr') expect(brand!.x).toBeLessThan(switcher!.x)
      else expect(brand!.x).toBeGreaterThan(switcher!.x)
    }
  })

  test('language switcher changes the language and direction without reloading', async ({ page }) => {
    await openPage(page, PATHS.login, LANGUAGES[0], 'light')
    await page.getByRole('combobox', { name: 'Language' }).selectOption('ar')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('تسجيل الدخول')
    await expect(page).toHaveTitle(/تسجيل الدخول/)
  })

  test('theme toggle works from the keyboard and announces the next action', async ({ page }) => {
    await openPage(page, PATHS.login, LANGUAGES[0], 'light')
    const toggle = page.getByRole('button', { name: 'Switch to dark theme' })
    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeFocused()
  })
})
