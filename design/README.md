# FabLab UI mockups

The approved design for every page. Build each React page to match its screenshot: same layout, same copy, same components. The HTML files are static mockups (open them in a browser); `screens/app.css` is the reference styling they share.

- `screenshots/*.png`: what each page must look like. They are not in git (8 MB of images, ignored in `.gitignore`); ask the team for the folder and put it here, or open the matching `screens/*.html` in Chrome at the same width instead. Desktop screens are 1440 px wide; `*Phone` and the `MachineQR*` screens are 390 px; `*Tablet` screens are 820 px. The phone and tablet screens use the same HTML as the desktop page: the layout change comes only from the media queries at the end of `screens/app.css`.
- `screens/*.html` + `screens/app.css`: the markup and CSS behind each screenshot. Reuse the class names as component names (`topbar`, `side`, `card`, `kpi`, `badge b-success`, `seg`, `tablebox`, `notice n-warning`, `board`/`col`/`jobcard`, `steps`).
- `tokens.json` and `../docs/tokens.css`: the design tokens. The app imports `tokens.css`; never copy hex values out of the mockups.
- `machine-illustrations/*.svg`: original drawings for each machine type (FDM printer, enclosed printer, resin printer, laser cutter, CNC router, vinyl cutter, robotic arm). Show the machine's uploaded photo (`Machine.photo`); fall back to its type's illustration until one is uploaded.
- `logo.svg`: the FabLab mark. Inline it in the top bar next to the name "FabLab" (Arabic: مختبر التصنيع).

Mockup data (names, amounts, jobs) is demo data; use it for `make seed` (SRS section 14).

## Pages and routes

Same list as SRS section 10.2.

| Area | Route | Page | Mockup | Screenshot |
| --- | --- | --- | --- | --- |
| Public | `/` | Home | `screens/Main.html` | `screenshots/Main.png` |
| Public | `/machines` | Machines and prices | `screens/Machines.html` | `screenshots/Machines.png` |
| Public | `/m/:token` | Machine page after scanning the QR, signed in (phone) | `screens/MachineQR.html` | `screenshots/MachineQR.png` |
| Public | `/m/:token` | Machine page after scanning the QR, signed out (phone) | `screens/MachineQRPublic.html` | `screenshots/MachineQRPublic.png` |
| Public | `/login` | Log in, then 2FA code | `screens/Login.html` | `screenshots/Login.png` |
| Public | `/signup` | Sign up | `screens/Signup.html` | `screenshots/Signup.png` |
| Public | `/verify-email, /forgot-password, /reset-password/:token` | Verify email, forgot and reset password | `screens/ForgotPassword.html` | `screenshots/ForgotPassword.png` |
| Public | `/privacy` | Privacy Policy | `screens/Legal.html` | `screenshots/Legal.png` |
| Public | `/terms` | Terms of Service | `screens/Terms.html` | `screenshots/Terms.png` |
| Public | `* (404), 403, 500` | Error pages | `screens/ErrorPages.html` | `screenshots/ErrorPages.png` |
| Customer | `/dashboard` | Dashboard | `screens/Dashboard.html` | `screenshots/Dashboard.png` |
| Customer | `/dashboard (lang=ar)` | Dashboard in Arabic, RTL reference | `screens/DashboardAR.html` | `screenshots/DashboardAR.png` |
| Customer | `/dashboard (theme=dark)` | Dashboard in dark mode, theme reference | `screens/DashboardDark.html` | `screenshots/DashboardDark.png` |
| Customer | `/jobs/new` | New job: 3D preview, fit check, quote | `screens/NewJob.html` | `screenshots/NewJob.png` |
| Customer | `/jobs` | My jobs | `screens/MyJobs.html` | `screenshots/MyJobs.png` |
| Customer | `/jobs/:ref` | Job detail and status | `screens/JobDetail.html` | `screenshots/JobDetail.png` |
| Customer | `/invoices` | Invoices and receipts | `screens/Invoices.html` | `screenshots/Invoices.png` |
| Customer | `/notifications` | Notifications | `screens/Notifications.html` | `screenshots/Notifications.png` |
| Customer | `/organizations` | My organizations | `screens/CustomerOrgs.html` | `screenshots/CustomerOrgs.png` |
| Customer | `/profile` | Profile, language, theme, privacy | `screens/Profile.html` | `screenshots/Profile.png` |
| Customer | `/profile/2fa` | Turn on 2FA | `screens/Setup2FA.html` | `screenshots/Setup2FA.png` |
| Guardian | `/guardian/:childId` | Consent and child's jobs | `screens/Guardian.html` | `screenshots/Guardian.png` |
| Program manager | `/programs/:id` | Approvals, budget, members | `screens/ProgramManager.html` | `screenshots/ProgramManager.png` |
| Staff | `/staff/queue` | Live queue board | `screens/StaffQueue.html` | `screenshots/StaffQueue.png` |
| Staff | `/staff/walk-in` | Walk-in counter | `screens/WalkIn.html` | `screenshots/WalkIn.png` |
| Staff | `/staff/jobs` | All jobs | `screens/JobsList.html` | `screenshots/JobsList.png` |
| Staff | `/staff/jobs/:ref/review` | Review and approve | `screens/ReviewJob.html` | `screenshots/ReviewJob.png` |
| Staff | `/staff/jobs/:ref/complete` | Complete job: actual usage | `screens/CompleteJob.html` | `screenshots/CompleteJob.png` |
| Staff | `/staff/payments` | Record payment and cash-up | `screens/RecordPayment.html` | `screenshots/RecordPayment.png` |
| Staff | `/staff/customers` | Customers | `screens/StaffCustomers.html` | `screenshots/StaffCustomers.png` |
| Staff | `/staff/licenses` | Licenses | `screens/Licenses.html` | `screenshots/Licenses.png` |
| Staff | `/m/:token (staff view)` | Machine quick actions after scanning (phone) | `screens/MachineQRStaff.html` | `screenshots/MachineQRStaff.png` |
| Finance | `/finance/invoices` | Invoices and credit notes | `screens/FinanceInvoices.html` | `screenshots/FinanceInvoices.png` |
| Finance | `/finance/reports` | Reports | `screens/FinanceReports.html` | `screenshots/FinanceReports.png` |
| Admin | `/admin/analytics` | Analytics dashboard | `screens/AdminAnalytics.html` | `screenshots/AdminAnalytics.png` |
| Admin | `/admin/machines` | Machines and QR stickers | `screens/AdminMachines.html` | `screenshots/AdminMachines.png` |
| Admin | `/admin/materials` | Materials and stock | `screens/AdminMaterials.html` | `screenshots/AdminMaterials.png` |
| Admin | `/admin/prices` | Prices and discounts | `screens/AdminPrices.html` | `screenshots/AdminPrices.png` |
| Admin | `/admin/users` | Users and roles | `screens/AdminUsers.html` | `screenshots/AdminUsers.png` |
| Admin | `/admin/organizations` | Organizations and programs | `screens/AdminOrgs.html` | `screenshots/AdminOrgs.png` |
| Admin | `/admin/audit` | Audit log | `screens/AdminAudit.html` | `screenshots/AdminAudit.png` |
| Admin | `/admin/settings` | Settings | `screens/AdminSettings.html` | `screenshots/AdminSettings.png` |
| Print | `/admin/machines/:id/qr.pdf` | QR sticker (A6, bilingual, PDF) | `screens/QRLabel.html` | `screenshots/QRLabel.png` |
| Phone | `/dashboard` | Dashboard on a phone | `screens/DashboardPhone.html` | `screenshots/DashboardPhone.png` |
| Phone | `/dashboard` | Phone with the side menu open as a drawer | `screens/DashboardPhoneMenu.html` | `screenshots/DashboardPhoneMenu.png` |
| Phone | `/jobs/new` | New job on a phone (quote under the form) | `screens/NewJobPhone.html` | `screenshots/NewJobPhone.png` |
| Phone | `/jobs/:ref` | Job detail on a phone (status first) | `screens/JobDetailPhone.html` | `screenshots/JobDetailPhone.png` |
| Phone | `/invoices` | Invoices on a phone (table as cards) | `screens/InvoicesPhone.html` | `screenshots/InvoicesPhone.png` |
| Phone | `/staff/queue` | Queue board on a phone (scrolls sideways) | `screens/StaffQueuePhone.html` | `screenshots/StaffQueuePhone.png` |
| Tablet | `/dashboard` | Dashboard on a tablet | `screens/DashboardTablet.html` | `screenshots/DashboardTablet.png` |
| Tablet | `/jobs/new` | New job on a tablet | `screens/NewJobTablet.html` | `screenshots/NewJobTablet.png` |

## Rules the mockups follow

- Top bar is navy (`bg-nav`) with white text; the yellow `accent` is the call to action there ("Create account"), the active language and the avatar.
- Royal blue `primary` for buttons, links, active menu item. One primary button per page, or one per card when each card has its own action.
- Purple badges = "In progress" / programs. Red only for errors, overdue and destructive actions.
- Every badge has a text label; every table column has a header (visually hidden "Actions" for button columns); references, amounts and dates never wrap.
- Amounts use Roboto Mono with 3 decimals (JOD).
- Status names are the SRS job states only. "Ready for pickup" is a notice, not a status.
- Student prices: public price plus a "Student discount 20%" line, everywhere.
- Below 1024 px the side menu is a drawer behind the menu button; below 640 px tables become stacked cards (`data-label` on each cell), side panels move under the content and the queue board scrolls sideways.
- Font sizes only from the `--text-*` scale in tokens.css. US spelling.
- `DashboardAR` shows how every page looks in Arabic (mirrored, Noto Kufi Arabic). `DashboardDark` shows dark mode. Every page must work in both.
