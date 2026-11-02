import { describe, expect, it } from 'vitest'
import ar from './locales/ar.json'
import en from './locales/en.json'
import fr from './locales/fr.json'

// English is the reference: every other language must have exactly the same keys.
const locales: Record<string, unknown> = { en, ar, fr }

function flatten(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value }
  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>(
    (all, [key, child]) => ({ ...all, ...flatten(child, prefix ? `${prefix}.${key}` : key) }),
    {},
  )
}

const variables = (text: string) => [...text.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]).sort()

const reference = flatten(en)

describe.each(Object.keys(locales))('%s translations', (code) => {
  const messages = flatten(locales[code])

  it('has the same keys as English', () => {
    expect(Object.keys(messages).sort()).toEqual(Object.keys(reference).sort())
  })

  it('has no empty messages', () => {
    expect(Object.entries(messages).filter(([, text]) => text.trim() === '')).toEqual([])
  })

  it('uses the same {{variables}} as English', () => {
    for (const [key, text] of Object.entries(messages)) {
      expect(variables(text), key).toEqual(variables(reference[key] ?? ''))
    }
  })
})

// The linter (react/jsx-no-literals) catches text between tags; this catches attributes
// that screen readers or tooltips show, like aria-label="Close".
it('has no hardcoded text in user-visible attributes', () => {
  const sources = import.meta.glob(['../**/*.tsx', '!../**/*.test.tsx'], { query: '?raw', import: 'default', eager: true })
  const pattern = /\b(aria-label|aria-description|aria-placeholder|aria-valuetext|title|placeholder|alt)="[^"]*\p{L}[^"]*"/gu
  const found = Object.entries(sources).flatMap(([file, source]) =>
    [...(source as string).matchAll(pattern)].map((match) => `${file}: ${match[0]}`),
  )
  expect(found).toEqual([])
})
