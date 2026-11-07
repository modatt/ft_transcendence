# Frontend

React + Vite + TypeScript, Tailwind CSS (colors from `src/styles/tokens.css`), React Router, React Hook Form + zod, react-i18next (en, ar, fr; Arabic is RTL).

## Commands

```sh
npm install
npm run dev        # http://localhost:5173, proxies /api to http://localhost:8000 (override with VITE_API_PROXY)
npm test           # vitest: unit tests and translation checks
npm run test:e2e   # Playwright + axe in Chrome: accessibility of every page, every language and theme
npm run lint       # oxlint, including all jsx-a11y rules and react/jsx-no-literals
npm run typecheck
npm run build
```

## Docker

```sh
docker compose up -d --build frontend                      # production build on http://localhost:8080
docker compose --profile dev up --build frontend-dev       # dev server with hot reload on http://localhost:5173
docker compose --profile dev down                          # stop both
```

- `Dockerfile` has two targets. `prod` builds the app and serves `dist/` with a non-root nginx on port 8080 (`nginx.conf`: sends every page route to `index.html`, caches hashed assets for a year, returns 404 for `/api`). `dev` runs Vite with the source bind-mounted.
- HTTPS is not handled here. The main nginx (infra) terminates TLS, sends `/api` to Django, and everything else to `http://frontend:8080`. When that exists, remove the published `8080` port.
- If port 5173 is already taken by a local `npm run dev`, use `FRONTEND_DEV_PORT=5174 docker compose --profile dev up frontend-dev`.

## Architecture: MVVM

Each feature folder in `src/features/` is split into three layers:

| Layer | Files | Rule |
| --- | --- | --- |
| Model | `api.ts`, `schemas.ts`, `errors.ts` | Data, server calls and validation rules. No React. |
| ViewModel | `use<Screen>ViewModel.ts` | A hook holding the screen's state and logic. Returns ready-to-show values (translated messages, flags) and actions (`submit`, `toggle...`). No JSX. |
| View | `<Screen>Page.tsx` | Components that only lay out what the ViewModel returns. No `fetch`, no business rules. |

Test ViewModels with `renderHook` (see `useLoginViewModel.test.ts`), and test Views through the page (see `LoginPage.test.tsx`). Shared, feature-free UI goes in `src/components/`.

## Accessibility and internationalization (every page)

Targets: WCAG 2.1 AA (subject IV.2 major; NFR-25 asks for 2.2 AA), English, Arabic and French with full RTL mirroring (IV.2 minors, NFR-21 to NFR-23).

**Checked automatically**

| Check | Where | Catches |
| --- | --- | --- |
| `npm run lint` | `.oxlintrc.json` | All 36 `jsx-a11y` rules (labels, alt text, roles, no `autoFocus`, ...); `react/jsx-no-literals` flags text not passed through `t()` |
| `npm test` | `src/i18n/i18n.test.ts` | Missing or empty translations, mismatched `{{variables}}`, hardcoded `aria-label` / `title` / `placeholder` / `alt` |
| `npm test` | `src/routes.test.ts` | A route missing from `src/paths.ts` (so it would skip the e2e audit) |
| `npm run test:e2e` | `e2e/a11y.spec.ts` | axe (WCAG 2.0 to 2.2 A/AA + best practices, including colour contrast) on every page in `PATHS`, in en/ar/fr and light/dark; no horizontal scroll at 320px; skip link; RTL mirroring; language switcher; theme toggle by keyboard |
| `npm run test:e2e` | `e2e/<feature>.spec.ts` | Per-page states: error states, alerts, focus after each step, keyboard-only use |

**Building a new page**

1. Add its path to `src/paths.ts` and its route to `src/router.tsx`. The e2e audit then covers it in every language and theme.
2. Every visible string, including `aria-label`, `title`, `placeholder` and `alt`, comes from `t()`, with keys in all three `locales/*.json`.
3. Exactly one `<h1>`; headings in order; use `<button>` for actions and `<Link>` for navigation.
4. Every input has a `<label>`; errors use `aria-invalid` and `aria-describedby` (the `TextField` component does this); form-level errors use `FormAlert` (`role="alert"`).
5. When a step or dialog replaces content, move focus to the new content (see `useMfaViewModel`).
6. Use logical Tailwind classes (`ms-`, `me-`, `ps-`, `pe-`, `inset-s-`, `text-start`), never `left`/`right`. Emails, codes and numbers that must stay LTR get `dir="ltr"`.
7. Colours only from tokens; never colour alone to convey meaning (status badges always have text).
8. Add `e2e/<feature>.spec.ts` for the page's states (errors, empty, loading, success) and run axe in each.

**Check by hand before review** (tools can't)

- [ ] Whole page usable with the keyboard only; focus always visible; no focus traps
- [ ] Screen reader pass (Orca on Linux, NVDA on Windows, VoiceOver on macOS) in English and Arabic: headings, labels, errors and alerts are read correctly
- [ ] Browser zoom at 200%: nothing cut off or overlapping
- [ ] Arabic: layout mirrored, icons that imply direction (arrows) flipped, no truncated text
- [ ] French: longer strings still fit buttons and headers

## Layout

- `src/styles/tokens.css`: design tokens copied from `docs/tokens.css`, mapped to Tailwind colors in `src/index.css` (`bg-card`, `text-text`, `text-muted`, `bg-primary`, `text-danger`, ...). Never use hex values in components.
- `src/i18n/`: i18next setup and `locales/{en,ar,fr}.json`. Switching language updates `<html lang dir>`.
- `src/lib/api.ts`: `fetch` wrapper. Sends the session cookie, the `X-CSRFToken` header and `Accept-Language`, and turns DRF errors into `ApiError`.
- `src/features/auth/`: login page with the 2FA step (FR-07): Model (`api.ts`, `schemas.ts`, `errors.ts`), ViewModel (`useLoginViewModel.ts`), View (`LoginPage.tsx`), tests.

## Auth API contract (for the backend, SRS 5.3)

All under `/api/v1`, JSON, session cookie auth with Django CSRF.

| Request | Success | Errors |
| --- | --- | --- |
| `GET /auth/csrf` | sets the `csrftoken` cookie (`ensure_csrf_cookie`) | |
| `POST /auth/login` `{email, password}` | `200 {user: {id, email, role, locale}}`, or `200 {mfa_required: true}` when 2FA is on | `400 {field: [msg]}` or `{non_field_errors: [msg]}`, `401` wrong credentials, `403 {code: "account_locked"}`, `429` throttled |
| `POST /auth/mfa/verify` `{code}` (6 digits) | `200 {user: {...}}` | `400 {code: [msg]}`, `401` wrong code, `429` |

Django should translate field messages using `Accept-Language`; the frontend shows them as-is.
