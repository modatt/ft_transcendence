# Frontend

React + Vite + TypeScript, Tailwind CSS (colors from `src/styles/tokens.css`), React Router, React Hook Form + zod, react-i18next (en, ar, fr; Arabic is RTL).

## Commands

```sh
npm install
npm run dev        # http://localhost:5173, proxies /api to http://localhost:8000 (override with VITE_API_PROXY)
npm test           # vitest
npm run lint       # oxlint
npm run typecheck
npm run build
```

## Layout

- `src/styles/tokens.css`: design tokens copied from `docs/tokens.css`, mapped to Tailwind colors in `src/index.css` (`bg-card`, `text-text`, `text-muted`, `bg-primary`, `text-danger`, ...). Never use hex values in components.
- `src/i18n/`: i18next setup and `locales/{en,ar,fr}.json`. Switching language updates `<html lang dir>`.
- `src/lib/api.ts`: `fetch` wrapper. Sends the session cookie, the `X-CSRFToken` header and `Accept-Language`, and turns DRF errors into `ApiError`.
- `src/features/auth/`: login page with the 2FA step (FR-07), zod schemas, API calls, tests.

## Auth API contract (for the backend, SRS 5.3)

All under `/api/v1`, JSON, session cookie auth with Django CSRF.

| Request | Success | Errors |
| --- | --- | --- |
| `GET /auth/csrf` | sets the `csrftoken` cookie (`ensure_csrf_cookie`) | |
| `POST /auth/login` `{email, password}` | `200 {user: {id, email, role, locale}}`, or `200 {mfa_required: true}` when 2FA is on | `400 {field: [msg]}` or `{non_field_errors: [msg]}`, `401` wrong credentials, `403 {code: "account_locked"}`, `429` throttled |
| `POST /auth/mfa/verify` `{code}` (6 digits) | `200 {user: {...}}` | `400 {code: [msg]}`, `401` wrong code, `429` |

Django should translate field messages using `Accept-Language`; the frontend shows them as-is.
