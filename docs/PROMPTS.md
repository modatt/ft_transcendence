# Prompts for Claude Code

How to use this pack:

1. `CLAUDE.md`, `docs/` (with this file) and `design/` are already in the repo root.
2. Open the repo in Claude Code. It reads `CLAUDE.md` automatically, and that file points it at the SRS, the ERD, the tokens and the mockups.
3. Paste the prompts below **one at a time, in order**, on a new branch for each. Review and merge each one before starting the next.

Each prompt ends with "stop and show me" on purpose, so you check the work before Claude Code moves on.

---

## 0. Plan first (no code)

```
Read CLAUDE.md, docs/SRS.md, docs/ERD.md and design/README.md. Don't write code yet.
Give me: (1) the repo layout you'll create, (2) the Django apps and which ERD tables go in each,
(3) the React route tree from SRS section 10.2, (4) anything in the docs that contradicts itself
or is unclear. Then stop and wait.
```

## 1. Skeleton that starts with one command (SRS §15 tasks 1–3)

```
Create the project skeleton from CLAUDE.md: docker-compose.yml with nginx (self-signed HTTPS),
backend (Django 5.2 + DRF), worker (Celery), frontend (React + Vite + TypeScript), postgres 16, redis.
Add the Makefile (up, down, seed, test, lint), .env.example and a README skeleton.
Start the Django project with the custom accounts.User model in the very first migration
(fields from docs/ERD.md) and GET /api/health. `make up` must serve https://localhost with no
browser console errors. Stop and show me how to run it.
```

## 2. Design tokens and the app shell (SRS §15 task 6)

```
Set up Tailwind in the frontend using docs/tokens.css as CSS variables (light and dark via
data-theme on <html>). Build the shared layout from design/screens/app.css: the navy top bar
(logo from design/logo.svg + "FabLab"), the side menu, page header, card, KPI tile, badge, button,
segmented control, table, notice and footer with Privacy and Terms links. Match
design/screenshots/Dashboard.png and DashboardDark.png, and the phone and tablet versions
(DashboardPhone, DashboardPhoneMenu, DashboardTablet): drawer menu below 1024 px, stacked table
cards below 640 px. No hex values in components.
Stop and show me a screenshot of the shell in light and dark.
```

## 3. Languages and RTL (SRS §15 task 7)

```
Add react-i18next with ar, en and fr. Arabic switches dir="rtl" and the Noto Kufi Arabic font;
use only logical CSS (ms-/me-/ps-/pe-). The language buttons in the top bar switch it and save it
to the profile. Match design/screenshots/DashboardAR.png. Every string goes through i18n.
```

## 4. Accounts, roles and permissions (SRS §15 tasks 4, 5, 8; FR-01 to FR-10)

```
Build sign up, verify email, log in, log out, forgot and reset password, and 2FA (django-otp),
with session cookies and validation on both sides (zod + DRF serializers). Add the six roles
from CLAUDE.md with Django permissions, and route guards so each role sees only its routes.
Match design/screenshots Login, Signup, ForgotPassword, Setup2FA and ErrorPages. Add tests.
```

## 5. Models and seed data (SRS §15 task 9, §14)

```
Create every model in docs/ERD.md (all 28 tables), with the money rules from CLAUDE.md.
Register them in the Django admin. Write `make seed` with the demo data in SRS section 14
and the names, machines and amounts shown in the mockups. Stop and show me the migration list.
```

## 6. Catalog and public pages (FR-11 to FR-18, FR-90 to FR-93)

```
Build the machine and material catalog API and the public pages: Home, Machines and prices,
and the QR machine page at /m/:token (public, customer and staff views). Generate the QR
sticker PDF from the admin. Match Main, Machines, MachineQR, MachineQRStaff and QRLabel.
```

## 7. New job, 3D preview and quote (FR-23 to FR-27, FR-84 to FR-88)

```
Build /jobs/new: file upload with type and size checks, the React Three Fiber preview with the
build-plate fit check, trimesh volume and grams estimate on the backend, and the live quote
from the pricing rules in SRS 3.5. Match design/screenshots/NewJob.png.
```

## 8. Job workflow and the staff screens (FR-42 to FR-51)

```
Implement the job state machine as one service function (allowed transitions,
JobStatusHistory, notifications). Build the staff pages: queue board (live over Channels),
walk-in counter, all jobs, review, complete job. Match StaffQueue, WalkIn, JobsList, ReviewJob,
CompleteJob. Add tests for every transition.
```

## 9. Invoices, payments and credit notes (FR-52 to FR-64)

```
Build gap-free invoice numbers (select_for_update), immutable invoices, credit notes, bilingual
PDF (WeasyPrint), in-person payments with allocations, and the end-of-shift cash-up. Pages:
customer Invoices, staff RecordPayment, finance FinanceInvoices. Add concurrency tests.
```

## 10. Customer area, notifications and organizations (FR-65 to FR-71, FR-82, FR-83)

```
Build Dashboard, My jobs, Job detail, Notifications (live + email), Profile and My organizations.
Match their screenshots.
```

## 11. Programs, guardians, finance and admin (remaining FRs)

```
Build the program manager page, the guardian page, finance reports, and all admin pages
(analytics, machines, materials, prices, users, organizations, audit log, settings).
Match their screenshots. Analytics hides groups smaller than 5.
```

## 12. Legal pages and final checks (SRS §12, §13)

```
Add the Privacy Policy and Terms pages in all three languages from SRS section 12 (keep the
[confirm] items visible). Then run the Definition of done in SRS section 13 on the whole app:
axe with zero violations, no console errors, both themes, Arabic RTL, `make up` from a clean
clone. List anything that fails.
```

---

### Tips

- If Claude Code drifts from a design, say: "Open design/screenshots/<Page>.png and match it exactly."
- If a decision isn't in the docs, ask it to stop and ask you instead of guessing.
- Cite the FR number in every commit (CLAUDE.md asks for this), so each person can explain their part at evaluation.
