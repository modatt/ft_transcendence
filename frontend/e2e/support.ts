import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

export const LANGUAGES = [
  { code: 'en', dir: 'ltr' },
  { code: 'ar', dir: 'rtl' },
  { code: 'fr', dir: 'ltr' },
] as const

export const THEMES = ['light', 'dark'] as const

export type Language = (typeof LANGUAGES)[number]
export type Theme = (typeof THEMES)[number]

// WCAG 2.0, 2.1 and 2.2 at levels A and AA (subject IV.2, NFR-25), plus axe best practices
// such as "one h1 per page" and "all content inside landmarks".
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']

/** Open a page with the language and theme already chosen, as a returning visitor would. */
export async function openPage(page: Page, path: string, language: Language, theme: Theme) {
  await page.addInitScript(
    ([lang, chosenTheme]) => {
      localStorage.setItem('lang', lang)
      localStorage.setItem('theme', chosenTheme)
    },
    [language.code, theme] as const,
  )
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('lang', language.code)
  await expect(page.locator('html')).toHaveAttribute('dir', language.dir)
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
}

/** Fail with a readable list of every axe violation on the page as it is right now. */
export async function expectNoAxeViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()
  const report = violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes.map((n) => n.target.join(' ')).join('\n    ')}`,
  )
  expect(report).toEqual([])
}

/** WCAG 1.4.10 Reflow: no horizontal scrolling at 320 CSS px (the same as 400% zoom on a laptop). */
export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
}
