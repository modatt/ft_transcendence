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
