# Open decisions

Places where the docs, the team files and the code disagree. Each one needs a team decision; record the answer here, then update the losing source so only one version remains.

Default rule until decided: `docs/SRS.md` and `docs/ERD.md` win.

Files under `team/` and `_archive/` are the team's working files; they are kept outside the repo (ask the team for them).

| # | Topic | Conflict | Proposed answer | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| D-01 | Database schema | `docs/ERD.md` (28 tables, single lab) vs the database team's versions in `team/database/`: v0 (18-table sheet), v1 (SaaS sheet), v2 (reviewed), and **v3 (2026-11-05/06, 30 tables, multi-tenant)**. The `backend_infrastructure` branch builds v3 on Django's default User. Depends on D-25. | Custom User model in migration 0001. Build from `docs/ERD.md`, adding the v3 ideas in D-26 by PR. Archive v0 to v3 as history. | Maryam, Joud | Open |
| D-02 | Module list | `docs/SRS.md` section 7 (18 points: 3D preview, notifications, file upload, i18n, RTL, 2FA…) vs `team/project-scope.xlsx` Modules sheet (adds SSR, custom design system, public API, OAuth, data export, health check; leaves several SRS modules unmarked). Check both against `subject/en.subject-v21.2.pdf`. | Pick one list, then write it in SRS section 7 and the README. | Whole team | Open |
| D-03 | Machines and materials | SRS 3.2 / 14 seed: Prusa XL, Ultimaker S5, Form 4B, Trotec Speedy 400, ShopBot, Roland GS-24. `team/machines-and-materials.xlsx`: Epilog Fusion Pro 36, UltiMaker S5, Formlabs Form 3+, ShopBot PRSalpha, Roland GS-24, OtherMill Pro (PCB). | Confirm the real list with the lab, then update SRS 3.2 and section 14. | Product Owner | Open |
| D-04 | Branding in code | `repo/frontend` still uses the old Makerspace/CPF tokens (`src/styles/tokens.css`), the app name "The Makerspace" and "CPF" in the locales and `index.html`, and `makerspace_*` container names (also in the `backend_infrastructure` branch). | Replace with `docs/tokens.css` and the FabLab name (CLAUDE.md, Frontend conventions). | Tuqa | Resolved 2026-11-04 (PR #3) |
| D-05 | Sign-up route | Code: `/register`. SRS 10.2 and `design/README.md`: `/signup`. | Use `/signup`. | Tuqa | Resolved 2026-11-04 (PR #3) |
| D-06 | Secrets | `backend_infrastructure` branch uses Docker secrets files in `backend/.secrets/`; CLAUDE.md and the subject call for a git-ignored `.env` plus `.env.example`. | Use `.env` + `.env.example` (Docker secrets can read from it if wanted). | Razan | Open |
| D-07 | Compose location | `frontend/docker-compose.yml` and `backend/docker-compose.yml` are separate; the subject needs one command for the whole stack. | One root `docker-compose.yml` + `Makefile` (`make up`). | Tech Lead | Open |
| D-08 | Django version | `requirements.txt` allows `Django>=5.1,<6.0`; CLAUDE.md fixes Django 5.2 LTS. | Pin `Django>=5.2,<5.3`. | Razan | Open |

## Design (from the UI review of `design/`, 2026-11-03)

The revised docs and design pack (2026-11-04) answers most of these. Checked against the new mockups, `CLAUDE.md`, SRS section 8 and NFR-26; the previous version is in `_archive/fablab-pack-2026-11-03/`.

| # | Topic | Conflict | Answer | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| D-09 | Job status names | One job showed as Completed, Ready for pickup and Invoiced on different screens. | SRS job states everywhere; "Ready for pickup" is a notice only. Board column and badges now say Invoiced. | Tuqa + backend | Resolved 2026-11-04 |
| D-10 | Phone and tablet layouts | Only the QR pages had phone mockups. | NFR-26: drawer menu below 1024 px, stacked table cards below 640 px, side panels under content, board scrolls sideways. 8 new mockups (DashboardPhone, DashboardPhoneMenu, DashboardTablet, NewJobPhone, NewJobTablet, JobDetailPhone, InvoicesPhone, StaffQueuePhone). | Tuqa | Resolved 2026-11-04 |
| D-11 | Student discount display | QR page showed discounted unit prices; quotes showed a discount line. | Public price plus a "Student discount 20%" line everywhere (SRS 2, SRS 8, MachineQR). | Tuqa + PO | Resolved 2026-11-04 |
| D-12 | Editable estimates | Customer could type the estimates that set the price. | Read-only, computed from the model; staff enter actuals. | Tuqa | Resolved 2026-11-04 |
| D-13 | New job stepper | Four steps shown on one page. | Stepper removed. | Tuqa | Resolved 2026-11-04 |
| D-14 | Arabic menu | "Organizations" missing in Arabic. | Added (المؤسسات). | Tuqa | Resolved 2026-11-04 |
| D-15 | Theme toggle | Only in the dark Dashboard top bar. | In every top bar (SRS 8 lists the top bar contents). | Tuqa | Resolved 2026-11-04 |
| D-16 | Reference formats | Short, long and truncated refs mixed; Arabic refs wrapped. | Long form in subtitles, notices, emails and PDFs; short form only in lists, tables and cards; invoice numbers always full; `<bdi dir="ltr">` in Arabic. | Tuqa | Resolved 2026-11-04 |
| D-17 | Type scale | 15 font sizes, no tokens. | `--text-xs` to `--text-hero` in `tokens.css` (12 to 72 px, 12 px minimum); mockups now use only these sizes. | Tuqa | Resolved 2026-11-04 |
| D-18 | Primary button rule | One primary per screen vs one per card on the board. | One per page, or one per card when each card has its own action. | Tuqa | Resolved 2026-11-04 |
| D-19 | Analytics chart | No value labels or legend. | Value on each bar and a legend (Full week, This week so far, Values in JOD). | Tuqa | Resolved 2026-11-04 |
| D-20 | Small form details | Login error under one field; six separate OTP inputs; mixed signed-in state on the QR page. | Form-level error above the fields; OTP accepts paste and autofill (`one-time-code`); separate MachineQRPublic (signed out) mockup. | Tuqa | Resolved 2026-11-04 |
| D-21 | Spelling | British and US spelling mixed. | US English in all copy (CLAUDE.md, SRS 8); docs and mockups converted. | Whole team | Resolved 2026-11-04 |
| D-22 | Accessibility checks | Dark badges looked low-contrast; bell icon cropped; language buttons unnamed. | Bell icon and theme button fixed in the mockups. Contrast and screen-reader names still need an axe run on the built pages. | Tuqa | Check when built |

## Changes in the 2026-11-04 pack that need a look

| # | Topic | What changed | Action | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| D-23 | Machine photos | ERD adds `Machine.photo` rules (JPG/PNG/WebP, 5 MB, resized) and `photo_alt_ar/en/fr`; FR-15 shows a type illustration from `design/machine-illustrations/` until a photo is uploaded. | Backend: add the fields to the Machine model. Frontend: photo with fallback illustration on /machines, /m/:token and the admin list. | Backend + Tuqa | Open |
| D-24 | Canceled spelling | Job status enum value changed from `cancelled` to `canceled` (ERD). | Use `canceled` in models, API and i18n keys from the first migration. | Backend | Open |

## Database design version 3 (team folder, 2026-11-06)

`team/database/v3/` describes a "FabLab Booking Platform" sold to labs worldwide. Its change log lists "new business information" behind each change; where that information came from is the first question for the team.

| # | Topic | Conflict | Proposed answer | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| D-25 | Product scope | SRS: one FabLab in Amman; staff run jobs and enter actual usage; "Organization" is a customer's company, team or program (graded module, FR-82). v3: multi-tenant SaaS with `Plan` and `Subscription`, "Organization" is the lab, customer groups are `ClientOrganization`, machines get an IP and API and receive jobs from the app, per-lab currency and tax, roles platform admin / org admin / manager / vice manager / engineer / student / customer / org customer, independent use from age 16. | Keep the SRS scope: single lab, no plans, no machine control. If the lab itself asked for any v3 change, update the SRS first by PR and re-plan. | Whole team | Open |
| D-26 | Ideas from v3 worth adopting | Useful in any scope and missing from `docs/ERD.md`. | Add to the ERD by PR: `MachineNotifyRequest` ("notify me when free" on the QR page); `EmailLog` (FR-70 delivery log); `Payment.receipt_number`, cheque method, voided state instead of delete; `Invoice.emailed_at`; `LabSettings` student discount %, license validity, quote validity; license number on `License`; v3 `Views_Reports` list as the analytics checklist; v3 Amman demo data as the starting point for `make seed`. Roles stay Django groups and permissions, no custom tables. | Joud (ERD PR), Maryam (review) | Open |

## Changes made on 2026-11-06

| # | Topic | Change | Where | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| D-27 | Certification renamed to License | "Certification" becomes **License** everywhere: the ERD table, `requires_license`, license number, routes `/staff/licenses` and `/me/licenses`, the Licenses page and mockup (`design/screens/Licenses.html`), and all copy ("licensed" instead of "certified"; Arabic الرخص). Matches the name the backend branch and database v3 already use. The PNG screenshots still show the old word until they're regenerated. | SRS, ERD, CLAUDE.md, design | Tuqa | Done |
| D-28 | Ideas from Fabman | Learned from Fabman (fabman.io), the makerspace software the SRS cites: **FR-97** documents on machines, customers and licenses (new `Document` table, 28 tables now); **FR-98** filter jobs by machine and date ("who used the CNC yesterday?"); **FR-99** admin setup checklist on first sign-in; **webhooks** added to the bonus Public API module. Skipped: Fabman's hardware (NFC, per-minute metering, auto-shutoff), online payments and multi-location plans, which the SRS rules out. | SRS 3.11 and 7, ERD | Tuqa | Done; team to confirm |
