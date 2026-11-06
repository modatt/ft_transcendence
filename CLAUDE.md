# FabLab — machine usage and billing (ft_transcendence)

Web app for a single-site FabLab (fabrication lab) in Amman. Customers submit fabrication jobs (3D printing, laser, CNC, vinyl…), see an instant quote, staff confirm actual usage, the system issues an immutable invoice, and staff record the in-person payment. There is NO online payment.

This is a 42 ft_transcendence project: a team of 4–5, a one-month deadline, graded by modules. Every team member must be able to explain the code they commit.

## Read these first

- `docs/SRS.md`: full requirements (FR-01 to FR-96, NFR-01 to NFR-31), roles, job workflow, modules, week plan. Cite the FR ID in commits and PRs.
- `docs/SRS.md` section 10.2: **every page and its route**. Build pages from that list; don't invent new routes without adding them there.
- `docs/ERD.md`: the database schema (28 tables). Models must match it; change the ERD in a PR before changing models.
- `docs/tokens.css`: design tokens (navy, royal blue, purple and yellow palette; light and dark).
- `design/README.md`: the UI mockup for every page, including phone and tablet versions (`design/screenshots/*.png`, `design/screens/*.html`), mapped to its route. Match their layout and copy exactly; look at the screenshot before building a page. Screenshots are not in git: if `design/screenshots/` is missing, open the page's `design/screens/*.html` instead.
- `docs/DECISIONS.md`: open conflicts between the docs, the team files and the code. Check it before building anything it lists.
- `docs/PROMPTS.md`: the step-by-step build prompts, in order.

## Roles

customer, guardian, staff, finance, program_manager, admin. One `role` field on User plus Django permissions per role. Organization admins and program managers are `Membership.role` values, not user roles.

## Stack (do not swap without asking)

- **Frontend:** React + Vite + TypeScript, React Router, Tailwind CSS (colors from `tokens.css` variables), React Hook Form + zod, react-i18next (ar, en, fr; Arabic is RTL), React Three Fiber + drei for 3D previews, Recharts.
- **Backend:** Python 3.12, Django 5.2 LTS, Django REST Framework, Django Channels + Redis (WebSockets), Celery + Redis, django-otp (2FA), trimesh, WeasyPrint, drf-spectacular, django-auditlog.
- **Data:** PostgreSQL 16 via the Django ORM.
- **Infra:** Docker Compose (nginx, frontend, backend, worker, postgres, redis). Nginx terminates HTTPS (self-signed locally). One command starts everything: `make up`.

## Layout

```
frontend/   React app
backend/    Django project (one app per domain: accounts, orgs, catalog, jobs, billing, notifications, analytics)
infra/      nginx config, certs script
docs/       SRS, ERD, tokens
design/     UI mockups, logo, machine illustrations (reference only, not served; screenshots/ kept out of git)
docker-compose.yml  Makefile  .env.example  README.md
```

## Rules that cost points if broken

- Everything must start with one command, and every external connection must be HTTPS.
- No warnings or errors in the Chrome console.
- Validate every form on BOTH the frontend (zod) and the backend (DRF serializers).
- Secrets only in `.env` (git-ignored); keep `.env.example` up to date.
- Privacy Policy and Terms of Service pages with real content, linked in the footer (SRS section 12).
- Multiple users at once with no race conditions.

## Domain rules

- Money: `DecimalField(max_digits=14, decimal_places=3)` in JOD. Never floats, in Python or TypeScript (send amounts as strings).
- Invoice numbers are gap-free: allocate inside `transaction.atomic()` with `select_for_update()`.
- Issued invoices are immutable; corrections are credit notes.
- Job status changes go through one service function that checks allowed transitions, writes JobStatusHistory, and sends notifications.
- Use the custom User model (`accounts.User`) from the very first migration.
- Machine QR links use `Machine.qr_token` (random), never the database id: `/m/<qr_token>`.
- Under-18 users need an active `GuardianLink` consent before submitting a job.

## Frontend conventions

- Brand: the product name is **FabLab** (Arabic: مختبر التصنيع). Use only this name and the FabLab logo mark; no other organization names or logos in code, copy or seed data.
- Use semantic tokens (`bg-card`, `text`, `primary`, `bg-nav`, `danger`…), never hex values. Navy top bar (`bg-nav`), royal blue `primary`, yellow `accent` with ink text only (never white on yellow, never yellow text on light). Red means danger only.
- Every user-visible string goes through i18n (en, ar, fr). Use logical CSS (`ms-`, `me-`, `ps-`, `pe-` in Tailwind), never left/right.
- Status badges always show a text label, not only a color. Status names are exactly the SRS job states (section 3.6) everywhere: badges, board columns, timelines, notifications. "Ready for pickup" is a notice, never a status.
- References: long form `JOB-AMM-2026-000123` in subtitles, notices, emails, PDFs; short form `000123` only inside job lists/tables/cards. Invoice numbers are always full (`INV-AMM-2026-00045`). In Arabic wrap references and amounts in `<bdi dir="ltr">`.
- Student pricing is shown one way: public price, then a "Student discount 20%" line.
- Estimates on New job are calculated from the model and read-only.
- One primary button per page, or one per card when each card has its own action.
- Responsive: below 1024 px the side menu is a drawer (menu button in the top bar); below 640 px tables become stacked cards using `data-label`, side panels move under the content, the queue board scrolls sideways. Phone and tablet mockups are in `design/`.
- Type sizes only from the `--text-*` scale in tokens.css (12 px minimum). US English spelling in all copy.
- Accessibility: run axe in tests; zero violations. Every table column has a header (use a visually hidden "Actions" label for button columns), heading levels never skip, click targets are at least 24 px, references, amounts and dates never wrap.
- Theme: set `data-theme="light|dark"` on `<html>`; every component must look right in both.
- Error pages (404, 403, 500) are real routes with translated text; never show a stack trace.

## Commands

- `make up` / `make down`: start or stop the stack
- `make seed`: load demo data (SRS section 14)
- `make test`: backend (pytest-django) and frontend tests
- `make lint`: ruff + eslint

## Working agreements

- Branches: `feat/<area>-<topic>`, `fix/<area>-<topic>`. PRs need one review. Merge commits, not squash.
- Commits: conventional style, e.g. `feat(jobs): add quote preview (FR-26)`.
- Before saying a task is done, check the Definition of done in SRS section 13.
- Explain non-obvious code in the PR description so the author can defend it at evaluation.
