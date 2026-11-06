# FabLab Machine Usage & Billing System — Software Requirements Specification

Nov 1, 2026 · @Tuqa Saeed

## 1. Summary and context

Build a trilingual (Arabic, English, French) web system where every machine job at the FabLab moves from **estimate → staff-confirmed actual usage → immutable invoice → recorded payment**, at a single lab site in Amman, with staff notified at each step. There is no online payment: customers pay in person and staff record the payment in the system. The invoice model stays ready for Jordan's JoFotara e-invoicing.

### 1.1 Target lab

The FabLab is a public digital fabrication lab in Amman. Facts that shape this spec:

| Fact | Implication for the system |
| --- | --- |
| This system is for one site in Amman (the main facility). More sites may open later | Single site now; records keep a site field so other sites can be added later without rework |
| Open Saturday–Thursday, 9 AM–5 PM, no appointment needed | Walk-in counter flow is the primary flow; per-site opening calendar |
| Open to the public, free expert guidance, discounted student rates | Customer categories and price lists; guidance itself is not billed |
| Wide equipment range (3D printing, resin, large-format pellet/clay, laser, CNC milling/router/lathe, PCB, KUKA arm, scanners, vacuum forming, sewing, vinyl, UV printer, casting, biomaterials, design stations) | Machine types with configurable job fields and pricing units, not a print-only form |
| Programs: Fab Academy, Fabricademy, the lab's own academy courses, masterclasses, school programs (age 9+), SME and industry projects | Sponsored/program billing, training records, guardian consent for minors, project quotations |
| Funded partly by sponsors and donors | Impact reporting for donors; tax and JoFotara status must be confirmed with the lab's finance team |

### 1.2 Problem

Staff help customers run jobs and track by hand who used which machine, how much material and time, and who has paid. This causes revenue leakage, disputes about cost, and staff overload at the counter.

### 1.3 Scope

- **In (4-week build):** accounts and profiles, machine and material catalog, job submission (online and walk-in), pricing, quotes, invoices and credit notes, in-person payment recording, sponsored program billing, training records, staff notifications, job workflow, reports and impact metrics, admin configuration, audit log, QR codes on machines, material stock levels, Arabic, English and French with RTL, light and dark themes.
- **Later:** other lab sites, bookings, wallet, slicer-based estimates, JoFotara submission, WhatsApp, automatic reordering, maintenance scheduling, smart-plug metering, hardware access control (section 6).

### 1.4 Assumptions

- **A-1:** Payment is always collected in person (cash, card POS, or a bank/CliQ transfer to the lab's account); the system only records it. Online payment is out of scope.
- **A-2:** Currency is JOD stored with 3 decimals (fils). Sales tax (16%) is configurable and may be 0% if the lab is exempt.
- **A-3:** Staff can override any computed value with a mandatory reason; every override is audited.
- **A-4:** Policies still to be agreed (approval rules, failed-job charging, payment terms) are admin settings, not hard-coded.

## 2. Roles and customer categories

Access is permission-based (roles map to permissions), so new roles can be added without code changes. Staff roles carry a site scope so more sites can be added later.

| Role | Who | Key permissions |
| --- | --- | --- |
| Guest | Unauthenticated visitor | View public catalog, hours and price list; register |
| Customer | Maker, student, startup, company | Manage profile; submit jobs; view quotes, invoices, payments, licenses; download PDFs |
| Guardian | Parent of a minor customer | Give consent; view the minor's jobs and invoices |
| Staff (fabrication specialist) | Lab operator | Job queue; approve/reject; start/complete; record actuals; issue invoices; record payments; create walk-in customers; record training sign-offs |
| Finance | Cashier / accountant | Record payments, issue credit notes, cash-up, financial reports; cannot change prices |
| Program manager | Owner of a program budget (e.g. Fab Academy cohort) | Enroll participants; view and approve usage charged to the program; program reports |
| Admin | Lab manager | Everything, plus sites, machines, materials, pricing, users, roles, settings, audit log |

### Customer categories (each maps to a price list)

| Category | Verification | Billing |
| --- | --- | --- |
| Public | Email + mobile | Standard price list |
| Student | University email or student ID upload, staff-verified | Public price list; a 20% student discount is added as its own line on quotes and invoices |
| School (minor, under 18) | Guardian contact + consent | Public price list with the student discount line; restricted machines |
| SME / Startup | Company name, optional tax number | SME price list |
| Industry | Company details, tax number | Quotation-based projects |
| Program participant | Enrolled by a program manager | Charged to the program budget, fully or partly |
| Internal | Staff-created | Internal price list, tracked for reporting |

## 3. Functional requirements

Priority: **M** = built in the 4-week window; **S** = Should (after submission); **C** = Could; Later = cut from the 4 weeks, built after submission. FR-82 to FR-89 were added to match the ft\_transcendence modules exactly.

### 3.1 Accounts and profiles

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-01 | Self-registration with full name (Arabic and/or English), email, mobile (default +962), password, preferred language, and optional gender (Female, Male, Prefer not to say). Gender is never required, never printed on invoices, and used only in aggregated analytics. | M |
| FR-02 | Email verification before first job; mobile OTP verification. | M / S |
| FR-03 | Capture customer category (section 2); students upload proof pending staff verification. | M |
| FR-04 | Company customers have billing name, tax number and address printed on invoices. | M |
| FR-05 | Staff create a walk-in profile at the counter with name + mobile only, then send an invite to complete it. | M |
| FR-06 | Under-18 accounts require a guardian contact and recorded guardian consent before any job. | M |
| FR-07 | Password reset, lockout after repeated failures, TOTP 2FA available to every user (enable and disable in profile, backup codes), and mandatory for Staff, Finance and Admin. | M |
| FR-08 | Customers edit profile, notification preferences and consents, and request data export or deletion (invoices retained as law requires). | M |
| FR-09 | Consent to privacy notice and terms recorded with version and timestamp. | M |
| FR-10 | Admin deactivates (never deletes) users; financial history is kept. | M |
| FR-82 | Customers create organizations (company, university team, program), edit and delete them, and add or remove members by email. Organization admins see the organization's jobs and invoices. | M |
| FR-83 | Members can leave an organization. Removing a member keeps their past jobs and invoices with the organization. | M |
| FR-94 | Guardians have their own page per child: give or withdraw consent, approve each job before it is queued (optional setting), and see the child's jobs and invoices. Under-18s cannot use high-risk machines. | M |

### 3.2 Sites, machines and materials

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-11 | Admin manages the lab profile: name (AR/EN), address (Amman), opening calendar (default Sat–Thu 09:00–17:00) and holidays. A site table exists so more sites can be added later. | M |
| FR-12 | Admin manages machine types with a configurable job-field schema and pricing unit per type (see table below). | M |
| FR-13 | Admin manages machines: type, name, model, photo, work area, compatible materials, rates, setup fee, minimum charge, rounding, risk level. | M |
| FR-14 | Machine status: Available, In use, Reserved, Maintenance, Out of service, Retired; each change logged with reason and expected return date. | M |
| FR-15 | Public catalog shows each machine with its photo (or a type illustration until one is uploaded), live status and indicative prices. Photos have a description for screen readers in AR, EN and FR. | M |
| FR-16 | Each machine has a printed QR sticker linking to its own page at /m/\<token> (details in FR-90 to FR-93). | M |
| FR-17 | Admin manages materials: name, category, color, unit (g, kg, ml, cm², sheet, m, piece), unit price per price list, density, compatible types, "customer-supplied allowed". | M |
| FR-18 | Customer-supplied material is not charged; an optional handling fee applies. | M |
| FR-90 | Scanning a machine's QR opens a mobile-first page that anyone can see without logging in: name, type, photo, build area, live status (updated over WebSockets), when it is free next, queue length, prices for the viewer's category, materials in stock, and safety and license notes. | M |
| FR-91 | Signed-in customers can start a job with this machine pre-filled, or report a problem (text and optional photo) that notifies on-duty staff. Logged-out visitors are sent to log in and then returned to the machine page. | M |
| FR-92 | Staff who scan see quick actions instead: the running job (complete, fail, pause), the next jobs in the queue, change machine status with a note, log maintenance, and open problem reports. | M |
| FR-93 | Admins print a bilingual A6 sticker per machine (QR, name, short link, machine ID) and can reset the link: a new random token is issued and old stickers stop working. Scans are counted per machine for analytics. | M |

**Machine types and pricing units at the FabLab** (exact models to confirm with staff):

| Machine type | Examples listed for the lab | Job fields | Pricing unit |
| --- | --- | --- | --- |
| 3D printer, FDM | Ultimaker 3 / S5, Prusa XL | Material, color, grams, print time, quantity | Per gram + per hour |
| 3D printer, resin (SLA) | Formlabs Form 3BL / Form 4B | Resin type, ml, print time | Per ml + per hour + tank/consumable fee |
| 3D printer, large-format | DeltaWasp 3MT (pellet), WASP clay extruder | Material, kg, print time | Per kg + per hour |
| Laser cutter / engraver | Trotec Speedy 400 | Material, thickness, sheets, cut/engrave minutes | Per minute + sheet price |
| CNC milling / router / lathe | ShopBot, Roland SRM-20, lathe | Stock material and size, machine time, tooling | Per hour + stock + tool wear fee |
| PCB station | Roland SRM-20, electronics bench | Board size, layers, components | Per board + per hour |
| Vinyl cutter | Roland CAMM-1 GS-24 | Vinyl type, length or area | Per meter or cm² |
| UV printer | — | Print area, substrate | Per cm² |
| 3D scanner | Artec Space Spider, Sense | Session length, post-processing | Per session or hour |
| Vacuum forming, sewing, casting, biomaterials | — | Time, material | Per hour + material |
| KUKA robotic arm | KUKA | Project description | Quotation only, staff-operated |
| Design stations, workbenches | — | Time | Per hour or free |

### 3.3 Training and licenses

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-19 | Admin defines a training requirement per machine type (course, optional quiz, staff sign-off, validity period). | Later |
| FR-20 | Staff record a license for a customer; it shows on the profile with expiry. | M |
| FR-21 | High-risk types (laser, CNC, KUKA) cannot be self-operated without a valid license; staff can still run the job for the customer ("operator-run"). | M |
| FR-22 | Lab academy course completions issue licenses automatically when linked. | S |

### 3.4 Jobs

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-23 | A customer, or staff on their behalf, creates a job by choosing a machine (or machine type) and filling the type's fields. | M |
| FR-24 | Each job is either **self-service** (licensed customer operates) or **operator-run** (staff operate, optional operator-time fee). | M |
| FR-25 | Upload design files (STL, 3MF, OBJ, G-code, SVG, DXF, PDF, AI, Gerber), up to 100 MB each by default, stored with checksum and malware scan. | M |
| FR-26 | An instant quote with line-item breakdown is shown before submission, labeled as an estimate. | M |
| FR-27 | The customer accepts job terms (failed-job policy, pickup deadline) before submitting. | M |
| FR-28 | Each job gets a reference such as JOB-AMM-2026-000123 (site code included). | M |
| FR-29 | **Walk-in counter screen:** staff create a job for a new or existing customer in 60 seconds or less, with defaults pre-filled. | M |
| FR-30 | Estimated grams and print time are computed from uploaded STL/3MF with a server-side slicer per printer family (PrusaSlicer, CuraEngine); customers cannot lower them, staff can override. | S |
| FR-31 | A **project** groups several jobs (industry, SME, Fab Academy final project), with one quotation, optional deposit and staged invoices. | Later |
| FR-84 | In-browser 3D preview of STL, 3MF and OBJ files (rotate, zoom, pan) on the job form and the staff job page. | M |
| FR-85 | The preview shows the model's size (W × D × H mm) and warns when it does not fit the chosen machine's build volume, listing machines that fit. | M |
| FR-86 | Instant estimate from the model: volume × material density × infill factor gives approximate grams, which pre-fill the quote. Staff confirm actual usage later. | M |
| FR-87 | A thumbnail of the model is saved with the job and shown on the staff queue board. | M |
| FR-88 | File uploads show a progress bar, accept only allowed types and sizes (checked in the browser and on the server), preview images, PDFs and 3D files, and let the owner delete a file before the job starts. | M |

### 3.5 Pricing

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-32 | Job total = material (quantity × unit price) + machine time (billable minutes × rate) + setup fee + operator time + extras + consumable wear, then minimum charge, discount and tax. | M |
| FR-33 | Billable time uses a configurable rounding step (e.g. next 5 or 15 minutes) and minimum time per machine. | M |
| FR-34 | Prices belong to a price list (per customer category) with an effective date; each job keeps a snapshot of the prices used. | M |
| FR-35 | Discounts per category, per customer or by promo code; only the single largest discount applies unless admin enables stacking. | M |
| FR-36 | Tax (default 16%) configurable per line type, with exempt lines and a global "not tax-registered" mode. | M |
| FR-37 | Money stored as exact decimals with 3 places; line-level rounding, half-up by default. | M |
| FR-38 | Quotes and invoices use the same versioned pricing engine; each line stores its inputs. | M |
| FR-39 | Failed-job policy chosen by staff when marking a failure (e.g. 100% material if design error, 0% if machine fault). | M |
| FR-40 | **Sponsored billing:** a job can be charged fully or partly to a program budget; the customer's invoice shows the sponsored amount and their share. | M |
| FR-41 | Program budgets have an allowance per participant and per program; usage beyond it needs program-manager approval or is billed to the participant. | M |

Example (illustrative prices, not proposed rates): PLA 0.040 JOD/g, FDM time 0.500 JOD/h, setup 0.500 JOD, student discount 20%, tax 16%. 45 g = 1.800; 3 h 20 min rounded to 3.5 h = 1.750; setup 0.500; subtotal 4.050; discount −0.810; taxable 3.240; tax 0.518; **total 3.758 JOD**.

### 3.6 Job workflow

States: Draft → Submitted → (Under review) → Approved → Queued → In progress → Completed → Invoiced → Closed, with exits Rejected, Canceled, Failed and On hold.

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-42 | Only valid transitions are allowed; each records actor, time and comment. | M |
| FR-43 | Admin sets per machine type whether approval is needed (e.g. CNC and KUKA always; FDM under 100 g auto-approve). | M |
| FR-44 | Staff reject with a reason; the customer edits and resubmits. | M |
| FR-45 | Staff start a job (assign a machine, set it In use) and complete it by entering **actuals**: material used, actual time, extras. | M |
| FR-46 | If actuals differ from the estimate by more than ±20% (configurable), a staff comment is required and the customer is notified of the new amount. | M |
| FR-47 | Failed jobs need a failure category and the policy choice; a retry creates a linked child job. | M |
| FR-48 | Customers cancel before In progress; afterwards only staff can. | M |
| FR-49 | Staff queue board: columns by state, filter by machine, age indicators. | M |
| FR-50 | "Ready for pickup" notice on completion; reminder after a configurable number of days if not collected or paid. | M |

### 3.7 Invoices

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-51 | Completing a job creates a draft invoice from actuals; staff review and issue it, or it auto-issues if configured. | M |
| FR-52 | Issued invoices cannot be edited; corrections and cancellations use a credit note that references the original. | M |
| FR-53 | Gap-free sequential numbers per series (e.g. INV-AMM-2026-00045), plus a UUID. | M |
| FR-54 | One invoice can cover several jobs (e.g. a company's monthly statement, a project stage). | S |
| FR-55 | Bilingual PDF invoice: lab details, customer, lines, sponsored amount, tax breakdown, totals, payment status, QR link to the online invoice. | M |
| FR-56 | Customers view and download invoices and receipts; invoices are emailed on issue. | M |
| FR-57 | The invoice stores JoFotara fields (UUID, counter, type code, submission status, returned QR and number, submitted XML) even before submission is enabled. | Later |

### 3.8 Payments

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-58 | Staff/Finance record a payment against one or more invoices: amount, method (Cash, Card POS, Bank/CliQ transfer, Wallet credit, Program budget, Other), reference, date, staff member. | M |
| FR-59 | Invoice status is derived: Unpaid, Partially paid, Paid, Overpaid (creates customer credit), Void. | M |
| FR-60 | A receipt PDF is generated for each payment. | M |
| FR-61 | Invoices become overdue after configurable terms (default 7 days) and appear on a dashboard. | M |
| FR-62 | Refunds are negative payments linked to a credit note. | M |
| FR-63 | Optional block on new jobs for customers above an overdue threshold, with staff override. | S |
| FR-64 | End-of-shift cash-up: payments by method and staff member, for cash-drawer reconciliation. | M |

### 3.9 Notifications

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-65 | Every create, update and delete on jobs, files, invoices, payments, machines and organizations notifies the people it affects. Key events: job submitted (to on-duty staff), approved/rejected, started, completed/ready, invoice issued, payment received, overdue reminder, machine status change, license expiring. | M |
| FR-66 | Channels: in-app (live) and email in MVP; WhatsApp and SMS later. | M / S |
| FR-67 | Staff notices route by machine type; unacknowledged new jobs escalate to the admin after a set time. | S |
| FR-68 | Admin edits templates per language with variables (name, job ref, amount, link). | M |
| FR-69 | Users manage channel preferences; transactional notices cannot be fully disabled. | M |
| FR-70 | Every attempt is logged (queued, sent, delivered, failed) and retried with back-off. | M |

### 3.10 Reports and impact

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-71 | Customers see their jobs, files, invoices, payments, licenses and balance. | M |
| FR-72 | Staff/Admin dashboard: jobs by status, today's revenue and collections, receivables aging (0–7, 8–30, 31–60, 60+ days), machines in use. | M |
| FR-73 | Reports by date, machine, type, material, category, staff: revenue, collections, machine hours, material use, failure rate, top customers, discounts. | M |
| FR-74 | Program reports: usage and cost per program and participant against budget. | M |
| FR-75 | **Impact reports** for donors: unique makers served, new vs returning, age band, governorate, category, program; gender (from the optional profile field, with consent). Any breakdown with fewer than 5 people is hidden so no one can be identified. | M |
| FR-76 | All reports export to CSV/Excel. | M |
| FR-89 | The analytics dashboard updates live over WebSockets when jobs, invoices or payments change, has date-range and category filters, and exports to PDF and CSV. | M |

### 3.11 Administration and audit

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-77 | Admin manages lab profile (logo, legal name, tax number, invoice footer, bank/CliQ alias). | M |
| FR-78 | Admin manages price lists, categories, discounts, tax, rounding, payment terms, failed-job policy, programs and budgets. | M |
| FR-79 | Admin manages users, roles, permissions and site scopes, and views login history. | M |
| FR-80 | Feature flags turn modules on per installation (bookings, wallet, JoFotara, WhatsApp). | S |
| FR-81 | Append-only audit entry for every change to financial or configuration data, every state transition, override, login and permission change: actor, role, time (UTC), IP, entity, before/after values. | M |
| FR-95 | Friendly error pages in all three languages: 404 (not found), 403 (wrong role, with a way back) and 500 (with a reference code for staff). No stack traces or raw errors are ever shown. | M |
| FR-96 | Light and dark themes on every page, switchable from the header and the profile; the choice is remembered per user. | M |

### 3.12 Key user stories

**US-1 Walk-in 3D print.** As a staff member, I want to register a walk-in student and log their print in under a minute, so the counter queue keeps moving.

- Given a new visitor, when staff enter name, mobile and category Student, pick "Prusa XL #1", PLA, 45 g, 3 h 20 min, then a quote shows with material, time, setup, discount, tax and total.
- The job enters Submitted and the customer gets an SMS/email link to complete their profile.

**US-2 Collect payment.** As a cashier, I want to find unpaid invoices by name, mobile or invoice number and record a payment in a few clicks.

- Recording 2.000 JOD cash on a 3.758 JOD invoice sets it to Partially paid with 1.758 left.
- A receipt is generated and the payment appears in the cash-up under the cashier.

**US-3 Fab Academy participant.** As a program manager, I want participants' jobs charged to the program budget, so students don't pay at the counter.

- A participant's laser job is invoiced with the full amount sponsored and 0.000 JOD due.
- Once the participant's allowance is used up, the next job asks for program-manager approval.

## 4. Non-functional requirements

### 4.1 Security

| ID | Requirement |
| --- | --- |
| NFR-01 | Meet OWASP ASVS 5.0 Level 2; SAST and dependency/image scanning in CI. |
| NFR-02 | TLS 1.2+ with HSTS; secure, HttpOnly, SameSite cookies; CSRF protection. |
| NFR-03 | Passwords hashed with Argon2id or bcrypt (cost 12+); rate limits on login, OTP and reset. |
| NFR-04 | Server-side authorization on every endpoint and every object (customers see only their own jobs, files, invoices; guardians only their minor's). |
| NFR-05 | Uploads: type allow-list, size limit, ClamAV scan, private object storage, short-lived signed URLs. |
| NFR-06 | Secrets (database, SMTP, WhatsApp, JoFotara keys) in a secret store, never in code or the database. |
| NFR-07 | Encryption at rest for disks; column encryption for any national ID collected. |

### 4.2 Privacy and compliance (Jordan)

| ID | Requirement |
| --- | --- |
| NFR-08 | Comply with Personal Data Protection Law No. 24 of 2023: consent, purpose limits, access/correction/deletion requests, breach procedure, processing register. |
| NFR-09 | Guardian consent and data minimization for under-18 users; no marketing to minors. |
| NFR-10 | Prefer hosting in Jordan, or document the safeguards for hosting abroad. |
| NFR-11 | Keep invoices and payments for the legal retention period (configurable, default 10 years); anonymize other personal data on deletion requests. |
| NFR-12 | Invoice data maps to JoFotara (UBL 2.1, credit notes, returned QR) so e-invoicing can be switched on without schema changes. |

### 4.3 Performance and capacity

| ID | Requirement |
| --- | --- |
| NFR-13 | p95 under 500 ms for reads and 1 s for writes at 50 concurrent users; quote calculation under 200 ms. |
| NFR-14 | Slicer estimates run in the background and return within 2 minutes for a 50 MB STL. |
| NFR-15 | Designed for 5,000 customers, 60 machines, 200,000 jobs and 1 TB of files over 5 years on one application node. |

### 4.4 Availability, backup and recovery

| ID | Requirement |
| --- | --- |
| NFR-16 | 99.5% availability during opening hours (Sat–Thu 09:00–17:00); maintenance outside them. |
| NFR-17 | Nightly PostgreSQL backup plus continuous WAL archiving; recovery point 15 minutes, recovery time 4 hours. |
| NFR-18 | Encrypted off-site backups kept 30 daily and 12 monthly; restore tested every quarter. |
| NFR-19 | Versioned file storage; design files deleted 180 days after job closure unless the customer keeps them. |
| NFR-20 | If the internet drops, the counter can still log jobs and payments and sync later (offline-capable PWA queue). |

### 4.5 Usability, language and accessibility

| ID | Requirement |
| --- | --- |
| NFR-21 | Full Arabic, English and French UI with a language switcher on every page; Arabic mirrors to right-to-left. |
| NFR-22 | All strings externalized (ICU MessageFormat); machines, materials and templates have AR, EN and FR fields. |
| NFR-23 | Gregorian dates in Asia/Amman time; Western or Eastern Arabic digits by preference; JOD shown with 3 decimals. |
| NFR-24 | PDFs render Arabic correctly (shaping, bidi, embedded Arabic font); mixed AR/EN invoices covered by tests. |
| NFR-25 | WCAG 2.2 AA: keyboard use, visible focus, 4.5:1 contrast, labeled inputs, screen-reader tested in both languages. |
| NFR-26 | Every page works from 360 px phones to desktop. Below 1024 px the side menu becomes a drawer opened from the top bar; below 640 px tables become stacked cards (each value labeled), wide side panels move under the main content, and the queue board scrolls sideways one column at a time. Customer pages are designed phone-first; staff counter screens are built for tablet and desktop. |

### 4.6 Maintainability and operations

| ID | Requirement |
| --- | --- |
| NFR-27 | Pricing engine unit tests at 90%+ branch coverage; integration tests with pytest-django on real PostgreSQL; end-to-end tests of US-1 to US-3 in both languages. |
| NFR-28 | Versioned Django migrations; no manual schema changes. |
| NFR-29 | Structured JSON logs with correlation IDs; metrics and alerts on errors, queue backlog, failed notifications and failed backups. |
| NFR-30 | OpenAPI 3 spec generated and published for all endpoints. |
| NFR-31 | Stateless app tier and a database-backed job queue, so a second instance or a second site can be added without redesign. |

## 5. Architecture, stack, data model and API

Use a **modular monolith**: one Django backend serving a REST API and WebSockets, a React single-page frontend, and Nginx in front with HTTPS. Each module is a Django app; apps talk through signals and Celery tasks. Django was chosen for speed: its admin, auth, ORM, migrations and translations are built in, which matters with a one-month deadline.

Modules: Identity & RBAC · Catalog (machines, materials, price lists) · Training · Jobs & Projects (workflow) · Pricing engine · Programs (sponsored budgets) · Billing (invoices, credit notes, PDF) · Payments · Notifications · Files (+ slicer worker) · Reporting & Impact · Audit.

### 5.1 Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Frontend | React + Vite + TypeScript, React Router, Tailwind CSS | Counts as the frontend framework |
| Forms and validation | React Hook Form + zod | Client checks; Django validates again |
| Languages | react-i18next (Arabic, English, French) with RTL | Three languages + RTL modules |
| 3D preview | React Three Fiber + drei, three.js STL/3MF loaders | Custom module |
| Charts | Recharts | Analytics dashboard |
| Backend | Python 3.12, Django 5.2 LTS, Django REST Framework | Django admin for staff configuration |
| Real-time | Django Channels + Redis | Queue board, live job status, notifications |
| Background jobs | Celery + Redis | PDFs, emails, reminders |
| Auth | Django auth (salted hashes), django-otp for 2FA | Session cookies over HTTPS |
| Mesh analysis | trimesh | Volume, bounding box, fit check |
| PDF invoices | WeasyPrint | Correct Arabic shaping and RTL |
| API docs | drf-spectacular (OpenAPI) |  |
| Audit log | django-auditlog | Before/after values |
| Database | PostgreSQL 16 | `DecimalField(14, 3)` for JOD |
| Files | Docker volume (or MinIO), private, signed download links |  |
| Deployment | Docker Compose: nginx, frontend, backend, worker, postgres, redis | One command (`make`), self-signed HTTPS locally, `.env` + `.env.example` |

Invoice numbering and payment allocation run inside database transactions with row locks (`select_for_update`), so simultaneous staff actions cannot corrupt data.

### 5.2 Data model (main entities)

| Entity | Key fields | Relations |
| --- | --- | --- |
| user\_account | email, mobile, password\_hash, status, locale, digit\_style, mfa | roles; one customer\_profile |
| role, permission | code, names | many-to-many |
| customer\_profile | names AR/EN, category, date of birth, gender (optional), university, student\_id, verified\_at, company, tax\_number | category; guardian (optional) |
| guardian\_link | minor, guardian name/mobile/email, consent\_at | customer\_profile |
| customer\_category | code, price\_list | customers |
| site | name, address, timezone, opening calendar, invoice series | machines, staff, jobs (one row today) |
| machine\_type | code, names, job\_field\_schema (JSONB), pricing\_unit, approval\_rule, risk\_level, training\_required | machines, licenses |
| machine | site, type, names, model, status, work\_area, qr\_token, rates, setup\_fee, min\_charge, rounding | materials (compatible) |
| machine\_status\_log | machine, from, to, reason, expected\_return, actor | machine |
| material | names, category, color, unit, density, customer\_supplied\_allowed | price\_list\_item |
| price\_list / price\_list\_item | effective dates; target, unit, unit\_price, tax\_rate | category |
| tax\_rate, discount\_rule | rate / scope, value, validity, stackable | price lines |
| training\_course / license | course, machine\_type, validity / customer, signed\_by, issued\_at, expires\_at | customer, machine\_type |
| program / program\_enrollment | name, budget, per-participant allowance, manager / participant, used amount | jobs, invoices |
| project | customer, title, quotation, deposit, status | jobs, invoices |
| job | ref, site, customer, project, program, machine\_type, machine, mode (self/operator), status, fields (JSONB), estimates, actuals, failure info, parent\_job | files, status history, lines |
| job\_file | object\_key, name, size, sha256, scan\_status, slicer\_estimate | job |
| job\_status\_history | from, to, actor, comment, time | job |
| quote / quote\_line | engine\_version, inputs, totals | job |
| invoice | number, series, uuid, customer, dates, subtotal, discount, sponsored\_amount, tax, total, paid, status, type (invoice / credit note), original\_invoice, JoFotara fields | lines, jobs, payments |
| invoice\_line | job, description AR/EN, qty, unit, unit\_price, discount, sponsored, tax, total, pricing\_inputs | invoice |
| payment / payment\_allocation | amount, method, reference, received\_at, received\_by / invoice, amount | invoices |
| notification / notification\_attempt | recipient, channel, template, payload, status | user |
| outbox\_event | type, payload, published\_at | events |
| audit\_log | actor, role, action, entity, before/after (JSONB), ip, time | append-only |
| consent\_record | user, document, version, accepted\_at | user |

Integrity rules:

- Money is `NUMERIC(14,3)`, never floating point.
- Invoice numbers come from a per-series counter row locked `FOR UPDATE` in the invoice transaction, so they are gap-free.
- A database trigger blocks changes to money fields on any invoice that is no longer a draft.
- Bookings (later) use a PostgreSQL exclusion constraint on machine + time range, so double-booking is impossible.

### 5.3 API outline (REST, JSON, /api/v1)

| Area | Endpoints | Roles |
| --- | --- | --- |
| Auth | POST /auth/register, /auth/login, /auth/logout, /auth/password/forgot, /auth/mfa/verify | Public |
| Profile | GET/PATCH /me; GET /me/jobs, /me/invoices, /me/balance, /me/licenses; POST /me/data-export | Customer |
| Catalog | GET /machines, /machines/{id}, /materials, /price-lists/current, /hours | Public |
| Catalog admin | POST/PATCH /admin/machines, /admin/materials, /admin/price-lists; PATCH /machines/{id}/status | Admin (status: Staff) |
| Training | GET/POST /licenses; GET /machine-types/{id}/requirements | Staff |
| Files | POST /files/upload-url; POST /jobs/{id}/files; GET /files/{id}/download-url | Owner, Staff |
| Quotes | POST /quotes/preview | Customer, Staff |
| Jobs | POST /jobs; GET /jobs/{id}; POST /jobs/{id}/submit, /approve, /reject, /start, /complete, /fail, /cancel; GET /staff/jobs | By transition |
| Projects | POST /projects; POST /projects/{id}/quotation, /accept | Staff, Customer |
| Programs | POST /programs; POST /programs/{id}/enrollments; POST /programs/{id}/approvals | Program manager, Admin |
| Invoices | POST /invoices; POST /invoices/{id}/issue, /credit-notes; GET /invoices/{id}/pdf | Staff, Finance |
| Payments | POST /payments (with allocations); GET /payments; GET /payments/{id}/receipt | Staff, Finance |
| Notifications | GET /me/notifications; POST /me/notifications/{id}/read; GET /stream (SSE) | Signed-in users |
| Reports | GET /reports/revenue, /receivables-aging, /machine-usage, /materials, /programs, /impact, /cash-up (CSV via Accept header) | Admin, Finance |
| Admin | /admin/users, /admin/roles, /admin/settings, /admin/templates, /admin/audit-log | Admin |
| Machine QR | GET /m/{token} (frontend route); GET /machines/by-qr/{token}; POST /machines/{id}/problem-reports; GET /admin/machines/{id}/qr.pdf; POST /admin/machines/{id}/qr/reset | Public (view), Customer (report), Admin (print, reset) |

Conventions: idempotency keys on payments and invoice issuing; optimistic locking on updates; RFC 9457 error format; cursor pagination; every state change is an explicit action endpoint, never a free-form status edit.

## 6. Improvements, roadmap and open questions

The base idea (profiles, machines, job entry, invoice, staff notice) becomes much stronger with the additions below. Mature fab lab tools such as [Fabman](https://fabman.io/product) and [Fab-Manager](https://www.fab-manager.com/features) already offer most of them.

### 6.1 Suggested improvements

| # | Improvement | Why it matters here | Priority | Phase |
| --- | --- | --- | --- | --- |
| I-1 | Staff-confirmed actuals, immutable invoices, credit notes | Ends disputes about guessed usage; the pattern JoFotara requires | Must | 1 |
| I-2 | Fast walk-in counter screen | No appointments at the FabLab, so the counter is the bottleneck | Must | 1 |
| I-3 | Training and license gating | Laser, CNC and KUKA are high-risk; the Academy already trains people | Must | 1 |
| I-4 | Sponsored program billing | Fab Academy, Fabricademy and school programs shouldn't pay at the counter | Must | 1 |
| I-5 | Impact reporting | A foundation needs youth-reached figures for donors, not only revenue | Must | 1 |
| I-6 | QR code on every machine | Scan to start a job or report a fault | Should | 2 |
| I-7 | Automatic print estimates from STL/3MF (PrusaSlicer, CuraEngine) | Removes guessing on the many FDM printers | Should | 2 |
| I-8 | Booking calendar for high-demand machines, with a hold window and no-show rule | Large-format printers, laser and KUKA have long jobs | Should | 2 |
| I-9 | Queue with estimated start times | Customers know when to come back | Should | 2 |
| I-10 | Prepaid wallet / credits | Cuts unpaid balances; credits used before charging money | Should | 2 |
| I-11 | WhatsApp notifications (approved templates) | Customers are mobile-first; Meta charges per message, so keep it optional | Should | 2 |
| I-12 | Material inventory and reorder alerts | Filament, resin and sheet stock driven by actuals | Should | 2 |
| I-13 | Monthly statements and payment reminders | With payment only at the counter, clear statements and reminders are the main way to collect unpaid balances | Should | 3 |
| I-14 | JoFotara e-invoice submission | Mandatory for in-scope sellers since 1 April 2025; scope for the lab to confirm | Should (Must if in scope) | 3 |
| I-15 | Maintenance scheduling by hours or job count | Planned downtime, notices to affected customers | Should | 3 |
| I-16 | Smart-plug metering (e.g. Shelly) on an isolated network | Measured machine-on time instead of estimates | Could | 3 |
| I-17 | Memberships with included credits | Regular makers and startups | Could | 3 |
| I-18 | Other lab sites, university SSO, hardware access control | Scale once the first site is stable | Could | 4 |

Phase 1 items are built in the four weeks; phases 2–4 come after submission.

### 6.2 Four-week plan

The project must ship in one month with a team of 4–5 (ft\_transcendence). Weeks 1–3 build features; week 4 adds none. Arabic PDFs and WebSocket edge cases are the likeliest overruns, so start them early.

(Diagram on the shared SRS doc: roadmap · 5 phases, 4 gates)

Each gate is checked at the end of its week; anything unfinished by the end of week 3 moves to Later.

### 6.3 Open questions for the lab team

- [ ] How are payments taken today (cash, POS, CliQ), and who reconciles them?
- [ ] Do program participants (Fab Academy, schools) pay, or does a sponsor cover their usage? What allowance per person?
- [ ] Is the lab (or the organization that runs it) registered for sales tax, and must it issue invoices through JoFotara?
- [ ] Current machine list and models, and which machines need staff approval or a license.
- [ ] Current prices per machine and material, by customer category.
- [ ] Failed-job policy: who pays for material when a print fails?
- [ ] Payment terms and pickup deadline for completed jobs.
- [ ] Which impact figures donors currently ask for.
- [ ] Hosting: the lab's own servers, a Jordanian provider, or cloud abroad?

## 7. ft\_transcendence modules and subject rules

The plan targets **18 points**, 4 above the required 14, in case a module is not validated at evaluation.

| Module | Type | Points | How it shows up in the FabLab system |
| --- | --- | --- | --- |
| Frontend + backend frameworks | Major | 2 | React + Django |
| Real-time features (WebSockets) | Major | 2 | Live staff queue board, job status, machine availability |
| Advanced permissions | Major | 2 | Admin, Staff, Finance, Program manager and Customer views and actions |
| Organization system | Major | 2 | Customers create teams and companies, invite and remove members, leave; programs with budgets and a program manager |
| Advanced analytics dashboard | Major | 2 | Revenue, machine hours, receivables, users by age band, gender and category; filters and CSV/PDF export |
| Module of choice: 3D model preview and print estimation | Major | 2 | STL/3MF viewer, dimensions, fit check, volume → grams → instant quote |
| ORM | Minor | 1 | Django ORM |
| Notification system | Minor | 1 | Every create, update and delete on jobs, invoices and payments |
| File upload and management | Minor | 1 | Design files: validation, preview, progress, delete |
| Multiple languages (3) | Minor | 1 | Arabic, English, French |
| RTL support | Minor | 1 | Full Arabic mirroring |
| 2FA | Minor | 1 | Available to every user; required for staff, finance and admins |
| **Total** |  | **18** |  |

Bonus candidates (maximum 5 points): Public API with API keys and rate limits (Major), GDPR features (Minor), OAuth with 42 or Google (Minor).

### Subject rules checklist

- [ ] One command starts everything in Docker
- [ ] HTTPS for every connection from outside the backend
- [ ] Works in the latest Chrome with no console warnings or errors
- [ ] Real Privacy Policy and Terms of Service pages, linked in the footer
- [ ] Multiple users at once with no race conditions
- [ ] Every form validated on frontend and backend
- [ ] `.env` ignored by Git, `.env.example` committed
- [ ] Commits from every team member with clear messages
- [ ] README in English with all required sections, modules, points and individual contributions

## 8. Design system and brand

The frontend uses a navy, royal blue, purple and yellow palette, built into a full token set with light and dark themes. Everything below is in the [FabLab design system](https://claude.ai/artifact/FCF6pz41dUcptyi6NenahR) (tokens, contrast checks, logo rules).

| Color | Hex | Role in the app |
| --- | --- | --- |
| Navy | #020381 | Top bar background and page headings |
| Royal blue | #2E4BB4 | Primary: buttons, links, active navigation, selected rows |
| Periwinkle | #4A68D8 | Focus ring, charts |
| Purple | #7F32D9 | Brand status tone (In progress, programs) |
| Yellow | #F8D749 | Accent: call to action on the navy bar, active language, avatars; always with dark text |
| Red | #A00023 | Danger only: errors, overdue amounts, destructive actions |
| Ink | #15171D | Text, plus a cool gray scale tinted toward the navy |

Rules for every screen:

- Components use semantic tokens (`bg-card`, `text`, `primary`, `bg-nav`, `danger`), never raw hex values; that is what makes dark mode work.
- The top bar is navy (`bg-nav`) with white text and holds the menu button (below 1024 px), logo, language switch, theme switch, notifications and avatar. One primary (royal blue) button per page, or one per card where each card has its own action (queue board cards). Red is never decoration.
- Yellow is a fill, never text on a light background, and never has white text on it (1.4:1); ink on yellow is 12.6:1.
- Every status badge has a text label, never color alone. Tones: neutral (Draft, Canceled, Closed, Void), info/cyan (Submitted, Approved, Queued, Partially paid), warning/yellow (Under review, On hold, Unpaid), brand/purple (In progress), success/green (Completed, Invoiced, Paid), danger/red (Rejected, Failed, Overdue).
- Status names are exactly the job states in section 3.6 (Draft, Submitted, Under review, Approved, Queued, In progress, Completed, Invoiced, Closed, Rejected, Canceled, Failed, On hold) on badges, board columns, timelines and notifications. "Ready for pickup" is the notice sent on completion (FR-50), never a status.
- References: the long form (JOB-AMM-2026-000123) in page subtitles, notices, emails and PDFs; the short form (000123) only inside job lists, tables and cards. Invoice and credit-note numbers always use the full form (INV-AMM-2026-00045). In Arabic, references and amounts are wrapped in `<bdi dir="ltr">` and never wrap.
- Student prices are shown one way everywhere: the public price, then a "Student discount 20%" line (quotes, invoices, machine pages).
- Estimated material and time on the New job page are calculated from the model and read-only; staff enter actual amounts when completing the job.
- Type scale: 12, 14, 16, 20, 24, 28, 32, 40, 48 px (plus 72 px for error codes), as `--text-*` tokens. 12 px is the minimum.
- Copy uses US English spelling.
- All 31 text pairs meet WCAG AA (4.5:1, or 3:1 for borders and focus rings) in both themes.
- Fonts: Roboto (Latin) and Noto Kufi Arabic, both free on Google Fonts; JOD amounts and job references use Roboto Mono with tabular figures.
- Logo: a simple original mark (a navy hexagon on a yellow rounded tile) next to the name FabLab (مختبر التصنيع in Arabic). It works on the navy bar and on light pages. The final logo is still to be confirmed with the lab.

## 9. Team roles

The subject requires these roles to be assigned and documented in the README. Fill in names, then copy this table into the README.

| Role | Name | Responsibilities | Main modules |
| --- | --- | --- | --- |
| Product Owner | — | Lab contact, backlog, open questions, accepts finished work | Analytics dashboard, Organization system |
| Project Manager | — | Weekly planning, tracking, blockers, meetings | Notifications, Multiple languages |
| Tech Lead | — | Architecture, Docker/Nginx/HTTPS, code reviews, permissions | Frameworks, Advanced permissions, 2FA |
| Developer (backend) | — | Jobs, pricing, invoices, payments, WebSockets | Real-time, ORM |
| Developer (frontend) | Tuqa Saeed | Design system, React screens, i18n/RTL, 3D preview | 3D preview and estimation, RTL, File upload |

Everyone contributes to the mandatory part and must be able to explain their own code at evaluation.

## 10. Website flow

The site has one public front and one sign-in, then an area per role: customer, guardian, staff, finance, program manager and admin. The site map below shows the three main areas; section 10.2 lists every page. Admins can also open the staff area.

(Diagram on the shared SRS doc: site map · public pages, sign-in, three role areas)

Routes are guarded by role on both the frontend and the backend (section 3, FR-79).

(Diagram on the shared SRS doc: job flow · customer, system, staff)

A failed print follows the same path from "Enter actual material, time": staff mark it failed, pick the failed-job policy, and a retry is created as a new linked job (FR-47). Every arrow that crosses into another lane also sends a live notification (section 3.9).

### 10.1 Machine QR codes

Each sticker encodes a short link such as `https://<site>/m/prusa-xl-1`, which opens in the phone's normal camera with no app. The token is random and stored on the machine (`Machine.qr_token`, unique), never the database ID, so links can be reset without renumbering machines.

- **Backend:** generate the QR with the `segno` Python library (SVG for the screen, PDF for the A6 sticker through WeasyPrint). A `ProblemReport` table (machine, reporter, text, photo, status, created\_at) stores reports; a `scan_count` field or a small `QrScan` table counts scans.
- **Frontend:** a public `/m/:token` route rendered mobile-first, which subscribes to the machine's WebSocket channel for live status and switches to the staff view when the user is staff.
- **Security:** the page shows only public machine data; actions still check the user's role on the server. Reports are rate-limited per user.
- **Design:** the sticker and both phone screens are on the UI canvas, in the "QR code on every machine" row.

### 10.2 Every page in the site

Every page the site needs is listed below. Each one is drawn on the [UI canvas](https://claude.ai/artifact/F7uPrMmzJWFHaMUvKgTQuH), works in Arabic (right-to-left), English and French, and in light and dark mode. Routes are the React Router paths; every page under /staff, /finance and /admin also checks the role on the server.

| Area | Route | Page | Main requirements |
| --- | --- | --- | --- |
| Public | / | Home | FR-15 |
| Public | /machines | Machines and prices | FR-15 |
| Public | /m/:token | Machine page from the QR sticker (signed-out and signed-in views) | FR-90, FR-91 |
| Public | /login | Log in, then 2FA code | FR-07 |
| Public | /signup | Sign up | FR-01, FR-03, FR-09 |
| Public | /verify-email, /forgot-password, /reset-password/:token | Verify email, forgot and reset password | FR-02, FR-07 |
| Public | /privacy | Privacy Policy | Section 12 |
| Public | /terms | Terms of Service | Section 12 |
| Public | any unknown route; 403; 500 | Error pages | FR-95 |
| Customer | /dashboard | Dashboard | FR-71 |
| Customer | /jobs/new | New job: 3D preview, fit check, quote | FR-23 to FR-27, FR-84 to FR-88 |
| Customer | /jobs | My jobs | FR-71 |
| Customer | /jobs/:ref | Job detail and status | FR-42, FR-46 |
| Customer | /invoices | Invoices and receipts | FR-55, FR-56 |
| Customer | /notifications | Notifications | FR-65, FR-69 |
| Customer | /organizations | My organizations | FR-82, FR-83 |
| Customer | /profile | Profile, language, theme, privacy | FR-08, FR-96 |
| Customer | /profile/2fa | Turn on 2FA | FR-07 |
| Guardian | /guardian/:childId | Consent and child's jobs | FR-06, FR-94 |
| Program manager | /programs/:id | Approvals, budget, members | FR-40, FR-41, FR-74 |
| Staff | /staff/queue | Live queue board | FR-49 |
| Staff | /staff/walk-in | Walk-in counter | FR-05, FR-29 |
| Staff | /staff/jobs | All jobs | FR-42 |
| Staff | /staff/jobs/:ref/review | Review and approve | FR-43, FR-44 |
| Staff | /staff/jobs/:ref/complete | Complete job: actual usage | FR-45 to FR-47, FR-51 |
| Staff | /staff/payments | Record payment and cash-up | FR-58 to FR-64 |
| Staff | /staff/customers | Customers | FR-71 |
| Staff | /staff/licenses | Licenses | FR-20, FR-21 |
| Staff | /m/:token (staff view) | Machine quick actions after scanning | FR-92 |
| Finance | /finance/invoices | Invoices and credit notes | FR-52, FR-62 |
| Finance | /finance/reports | Reports | FR-73, FR-76 |
| Admin | /admin/analytics | Analytics dashboard | FR-72, FR-75, FR-89 |
| Admin | /admin/machines | Machines and QR stickers | FR-12 to FR-16, FR-93 |
| Admin | /admin/materials | Materials and stock | FR-17, FR-18 |
| Admin | /admin/prices | Prices and discounts | FR-32 to FR-39 |
| Admin | /admin/users | Users and roles | FR-10, FR-79 |
| Admin | /admin/organizations | Organizations and programs | FR-41, FR-82 |
| Admin | /admin/audit | Audit log | FR-81 |
| Admin | /admin/settings | Settings | FR-11, FR-68, FR-77, FR-80 |
| Print | /admin/machines/:id/qr.pdf | QR sticker (A6, bilingual) | FR-93 |

Finance also uses /staff/payments and /staff/customers. The Django admin site stays available to the tech lead for debugging only, never as a user-facing page.

## 11. Database schema (ERD)

The database has 27 tables (19 core plus 8 added for the screens, listed below) in four groups: people and organizations, machines and prices, jobs, and billing. Job is the hub. It points to a customer and a machine, and each invoice line points back to one job.

(Diagram: see docs/ERD.md for the full schema as text.)

Rules the schema enforces:

- Money is `decimal(14,3)` (JOD with fils), never float.
- Invoice numbers are unique and gap-free, assigned in a locked transaction. Issued invoices are never edited; a credit note is a new Invoice row with `type = credit` and `original_id` set.
- One payment can cover several invoices (and one invoice several payments) through PaymentAllocation.
- Membership gives the organization system its many-to-many link between users and organizations; programs are organizations with `kind = program` and a budget.
- Django creates `id` primary keys and the MachineMaterial table automatically (a ManyToManyField on Machine).

The diagram shows the 19 core tables. The screens and later requirements add 8 more, listed with all fields in `docs/ERD.md`: **GuardianLink** (FR-06, FR-94), **ConsentRecord** (FR-09), **MachineStatusLog** (FR-14), **ProblemReport** (FR-91), **Discount** (FR-35), **ProgramApproval** (FR-41), **StaffNote** (customer notes on the staff page) and **LabSettings** (FR-11, FR-77). Machine also gains `qr_token`, `scan_count`, `build_x/y/z_mm`, `min_charge` and `requires_license`; Material gains `stock_qty` and `reorder_level`.

## 12. Privacy Policy and Terms of Service

Both pages are mandatory and checked at evaluation: linked in the footer of every page, in all three languages, with real content. Each page must cover the points below; the PO drafts them in week 1 and the lab confirms the policies marked (confirm).

### Privacy Policy

- **Who we are:** the FabLab in Amman, and a contact email for privacy requests (confirm).
- **What we collect:** account details (name, email, mobile), optional gender and date of birth, student proof, design files, job, invoice and payment records, and security logs.
- **Why:** to run jobs, bill and collect payment, keep machines safe, and report anonymous totals to funders. Analytics only use grouped data, never groups under 5 people.
- **Legal basis:** your consent and the service you ask for, under Jordan's Personal Data Protection Law No. 24 of 2023.
- **Who sees it:** lab staff and admins only; never sold or shared for marketing.
- **How long:** design files deleted 180 days after a job closes; invoices and payments kept as tax law requires (confirm the period); other data anonymized when you delete your account.
- **Your rights:** see, correct, export and delete your data from your profile page.
- **Minors:** under-18 accounts need a parent or guardian's consent.
- **Cookies:** only a session cookie and your language choice; no tracking or advertising cookies.
- **Security:** HTTPS everywhere, hashed passwords, optional 2FA (required for staff).
- **Changes:** the date of the last update, and notice to users when it changes.

### Terms of Service

- **Accounts:** who can register, one account per person, keep your password safe.
- **Using machines:** safety rules, a license before using high-risk machines, and staff may refuse or stop a job.
- **Your files:** you keep ownership of your designs and confirm you have the right to make them; no weapons or illegal items.
- **Prices:** quotes are estimates; the invoice uses the actual material and time recorded by staff.
- **Failed jobs:** who pays for material when a job fails (confirm the policy).
- **Payment:** in person at the counter within 7 days (confirm); unpaid balances can block new jobs.
- **Pickup:** finished items must be collected within a set time (confirm), or may be disposed of.
- **Liability, suspension and changes:** limits of responsibility, when accounts can be suspended, and how the terms change.

## 13. Ways of working

The subject checks commits from every member and asks each of you to explain your own work, so the workflow keeps contributions visible.

| Topic | Agreement |
| --- | --- |
| Repository | One repo: `frontend/`, `backend/`, `infra/`, `docker-compose.yml`, `Makefile`, `.env.example`, `README.md` |
| Branches | `main` is protected. Work on `feat/<area>-<topic>` or `fix/<area>-<topic>`; open a pull request with at least one review |
| Merging | Merge commits, not squash, so every person's commits stay in the history |
| Commit messages | Conventional style: `feat(jobs): add quote preview`, `fix(auth): handle expired session` |
| Task board | GitHub Issues + a Projects board (Backlog, This week, In progress, Review, Done), one label per module |
| Meetings | 15-minute check-in on Google Meet three times a week; planning at the start of each week; a demo of what works at the end |
| AI use | Note what AI helped with, per feature; the README needs it. Never merge code you can't explain |

**Definition of done** for any task:

- [ ] Works in the latest Chrome with no console warnings or errors
- [ ] Inputs validated on both frontend and backend
- [ ] Text translated in Arabic, English and French, and the page checked in RTL
- [ ] Backend logic has tests; pricing and invoice code always does
- [ ] Reviewed and merged; still starts with one command
- [ ] README or module notes updated

## 14. Seed and demo data

A `make seed` command loads realistic data so everyone develops against the same state and the evaluation demo has something to show. All values are placeholders until the lab answers the open questions in 6.3.

| Data | What to seed |
| --- | --- |
| Users | 1 admin, 2 staff, 1 finance; customers: public, student, company member, and a minor with a guardian. Test passwords live only in the seed file |
| Organizations | One company with 3 members; one Fab Academy program with a budget |
| Machines | The models from 3.2 (Prusa XL, Ultimaker S5, Form 4B, Trotec Speedy 400, ShopBot, Roland GS-24), one marked Maintenance |
| Materials | PLA, PETG, standard resin, acrylic 3 mm, plywood 3 mm, vinyl |
| Prices | Placeholder prices per category, clearly labeled, to be replaced with the lab's |
| Jobs and money | About 30 jobs across every status, with invoices that are paid, partly paid, unpaid and overdue, so dashboards and analytics have data |

## 15. Week 1 tasks

These are the first issues to open. The custom User model must be in the very first migration; Django cannot switch to it later without resetting the database.

| # | Task | Role | Done when |
| --- | --- | --- | --- |
| 1 | Repo layout, `.env.example`, README skeleton with the required first line | PM | Everyone can clone and run it |
| 2 | Docker Compose: Nginx (self-signed HTTPS), backend, frontend, PostgreSQL, Redis; `make up` | Tech Lead | One command starts everything over HTTPS |
| 3 | Django project, app skeletons, custom User model, DRF, first migration | Backend | `/api/health` answers over HTTPS |
| 4 | Sign up, log in, log out with session cookies and server validation | Backend | Auth works from the browser |
| 5 | Roles and permissions: Customer, Guardian, Staff, Finance, Program manager, Admin | Tech Lead | Each role sees only its own routes |
| 6 | React + Vite + TypeScript + Tailwind, router, design-system tokens | Frontend | App shell shows in light and dark mode |
| 7 | i18n (Arabic, English, French), RTL switch, header and footer with Privacy and Terms links | Frontend | Switching language mirrors the layout |
| 8 | Login and sign-up pages with client and server validation | Frontend | Errors show in all three languages |
| 9 | Core models from the ERD (section 11) and `make seed` | Backend | Seed data loads in the admin site |
| 10 | GitHub Projects board, labels, issue template; roles written in the README | PO + PM | Every module has an owner |
| 11 | First drafts of the Privacy Policy and Terms of Service | PO | Drafts sent to the lab to confirm |

### Sources

- [Fabman product overview](https://fabman.io/product) and [pricing](https://fabman.io/pricing)
- [Fab-Manager features](https://www.fab-manager.com/features)
- [Odoo – Jordan fiscal localization (JoFotara)](https://www.odoo.com/documentation/19.0/applications/finance/fiscal_localizations/jordan.html)
- [Jordan PDPL No. 24 of 2023 overview](https://www.clym.io/regulations/law-no-24-of-2023-jordan)
- [Talley et al., makerspace management software study, IJAMM 2025](https://ijamm.pubpub.org/pub/fv545me8)
