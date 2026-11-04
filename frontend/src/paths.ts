// Every page's URL. The accessibility tests (e2e/a11y.spec.ts) visit each one in every
// language and theme, so a page added here is audited automatically.
export const PATHS = {
  home: '/',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  privacy: '/privacy',
  terms: '/terms',
} as const
