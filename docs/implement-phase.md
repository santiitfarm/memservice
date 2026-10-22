# Memservice - Implementation phases (single file)

How to use: open a **new Claude Code session at the repo root**, paste the whole PROMPT block of one phase, read the final report, check it in the browser, commit, then move to the next phase. Run phases strictly in order. Put the repo under git first (`git init`, commit) so any phase can be rolled back.

| Phase | What it delivers | Status |
|---|---|:---:|
| Part 0 | Project context (shared ground truth, read by every prompt) | ✅ Active |
| 1 | Username removed, email login, forgot/reset password (dashboard + storefront), fix broken pages | ✅ Complete |
| 2 | Design tokens, working dark/light theme in both apps, UI kit, dashboard shell, profile menu + logout | ✅ Complete |
| 3 | CMS models/API, **Delivery areas and charges**, Integration Hub backend | ✅ Complete |
| 3.5 | **Commerce hardening** (gaps G1-G15, G19): pricing, order numbers, money, slug catalog, reviews, appointments, returns, guest tracking, coupons, variants, wishlist, bilingual, privacy | ✅ Complete |
| 4 | Every dashboard page, live home analytics, CMS screens, **Delivery management screen**, Integration Hub UI, profile | ✅ Complete |
| 5 | Every storefront page/section premium and CMS/API driven, dynamic checkout, route crawler | ✅ Complete |
| 6 / 14 | Final QA, security review, go-live checklist, production documentation | ✅ Complete |
| 7 / 13 | **Operations readiness** (gaps G16-G20): Playwright E2E, CI, logging + Sentry, health checks, session revocation, durable rate limits, security headers, credential rotation, backups | ✅ Complete |

**System Status: 100% Implemented, Verified, and Ready for Production Go-Live.**

---

# Part 0 - Project context

> Every phase prompt starts by telling the assistant to read this Part 0 fully.
> Keep it accurate: if a phase changes ports, auth, routes or env, update this Part 0 in the same change.

### 0.1 What this project is
Memservice: a Bangladesh healthcare e-commerce store (medicines, health products, doctor
consultation). pnpm monorepo, three Next.js apps and a MongoDB.

| App | Path | Port | Stack | Role |
|---|---|---|---|---|
| Storefront | `apps/web` | 3000 | Next 15.1, React 19, Tailwind 3, next-auth v5 beta | public site, customer accounts |
| REST API | `apps/api` | 3001 | Next 15.1 route handlers, Mongoose 8, jose, Resend | all business logic + DB access |
| Admin dashboard | `apps/admin` | 3002 | Next 14.2, React 18, RTK Query, Tailwind 3 (`darkMode: "class"`) | staff dashboard |
| MongoDB | docker service `mongo` | 27017 | Mongo 7, single-node replica set `rs0` | the order API uses transactions |

Root: `package.json`, `pnpm-workspace.yaml`, `docker-compose.yml`, `.env` (git-ignored), `.env.example`,
`scripts/` (`seed.mjs`, `health.mjs`, `pull-atlas.mjs`, `_env.mjs`), `docs/`.

### 0.2 Commands
```
pnpm install            # one lockfile at the root (pnpm 11, allowBuilds in pnpm-workspace.yaml)
pnpm dev                # db:up + web + api + admin in parallel
pnpm dev:web | dev:api | dev:admin
pnpm db:up | db:down | db:logs
pnpm db:seed            # idempotent: dashboard users + sample catalog
pnpm health             # tooling, env, Mongo replica set, ports   (NOT `pnpm doctor`: that is a pnpm builtin)
pnpm build              # api -> admin -> web
pnpm lint
```
Windows + Git Bash. Chrome is at `C:\Program Files\Google\Chrome\Application\chrome.exe` (use
`--headless=new --screenshot=... --window-size=...` for visual checks).

### 0.3 Environment (single root `.env`)
Each app's `next.config.*` loads the **root** `.env` via `@next/env` `loadEnvConfig(root, dev, console, true)`.
The `forceReload=true` argument is required (Next already loaded the app dir once). Never create per-app `.env` files.
Keys: `NEXT_PUBLIC_URL`, `NEXT_PUBLIC_APP_URL_FRONTEND`, `NEXT_PUBLIC_ADMIN_URL`, `API_URL` (server-side),
`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL_DEV`, `NEXT_PUBLIC_APP_URL_PRODUCTION`, `MONGODB_CONNECTION_STRING`,
`MONGO_URI`, `ENVIRONMENT`, `ATLAS_MONGODB_URI`, `CORS_ALLOWED_ORIGINS`, `COOKIE_DOMAIN`, `AUTH_SECRET`,
`AUTH_TRUST_HOST`, `AUTH_GOOGLE_ID/SECRET`, `CLOUDINARY_*`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`,
`EMAIL_ADMIN_TO`, `BKASH_*`, `PAYERREFERENCE`. Any new key must be added to **both** `.env` and `.env.example`
and to `scripts/health.mjs` if required.
`NEXT_PUBLIC_*` values are inlined at build time.

### 0.4 Authentication and authorization (as implemented)
- **Roles** (rank): `super-admin` 3 > `admin` 2 > `manager` 1 > `user` 0 (no dashboard access).
  Helpers: `apps/admin/lib/roles.js`, `apps/api/lib/auth.js` (`ROLE_RANK`, `rankOf`).
- **Dashboard login:** NextAuth credentials in `apps/admin/auth.js`. On success it also writes the signed
  JWT cookie `memservice_auth` (`apps/admin/lib/session.js`, HS256, `AUTH_SECRET`, 1 day, payload `{ user: { id, email, name, role } }`,
  optional `COOKIE_DOMAIN`). Only `status: "active"` users with rank >= 1 may log in.
- **API (`apps/api/middleware.js`)**: CORS allow-list from `CORS_ALLOWED_ORIGINS` (credentials on); rejects
  state-changing requests from unknown origins; a rule table makes staff-only routes require the cookie and a minimum rank.
  Admin browser code calls the API with `credentials: "include"` (RTK `fetchBaseQuery` in `apps/admin/store/api/apiSlice.js`).
- **Customers:** `POST /api/customerProfile/login` returns `{ user, token }` (JWT, audience `customer`). The storefront's
  NextAuth (`apps/web/auth.js`) keeps it in `session.accessToken`; client calls send `Authorization: Bearer`.
  `authorizeCustomerAccess` in `apps/api/lib/customer.js` lets staff act on anyone and a customer only on themselves.
  Password hashes are never returned (`SAFE_CUSTOMER_FIELDS`).
- Rate limiting: `apps/api/lib/rateLimit.js` (in-memory) on login/register/forgot/reset/newsletter.

### 0.5 API surface (apps/api/app/api)
Public: `GET category, shop(/[id]), product/(best-seller|brand|new-arrival|offer|trending|slider), banner, slider, doctors(/[id]), doccat, relatedproducts`;
`POST order, customerProfile (register), customerProfile/login|forgot|reset, newsletter, product/review, pgw/bkash/create`; `GET pgw/bkash/callback`; `GET order/[id]`.
Staff (cookie): `adminproduct*`, `product` (GET list + writes), `category|slider|banner|doctors|doccat|product/brand` writes,
`cloudinary`, `sendmail`, `order` (GET list), `order/[id]` (PUT), `customerProfile/[id]` DELETE.
Admin+ (rank 2): `/api/user` (GET/POST). Customer-or-staff: `customerProfile` GET/PUT, `customerProfile/[id]` GET/PUT.
Models live in `apps/api/app/models/*` (`apps/admin/app/models/*` is a partial copy used only by admin auth).
Mailer: `apps/api/lib/mailer.js` (`sendMail`, Resend, never throws). Orders: `apps/api/lib/orders.js` (`cancelOrder`). bKash: `apps/api/lib/bkash.js`.
Next route files may only export HTTP handlers; put helpers in `lib/`.

### 0.6 Storefront facts (apps/web)
- Root layout has `export const dynamic = "force-dynamic"` (data is live; `pnpm build` does not need the API).
- Routes: `/`, `/shop`, `/product/[slug]`, `/cart`, `/checkout`, `/visit/checkout`, `/complete-order`, `/wishlist`, `/offer`, `/trending`, `/best-seller`,
  `/consultation`, `/consultation/[deptName]`, `/consultation/doctor`, `/doctors/[doctorId]`, `/account`, `/account/login`, `/account/register`,
  `/account/orders/[orderId]`, `/about-us`, `/faq`, `/privacy-policy`, `/refund-and-return-policy`, `/terms-and-conditions`, plus `error.js`, `loading.js`, `not-found.js`.
- Brand tokens (tailwind.config.js): `sky-blue #15a9e3`, `accent-orange rgb(237,86,33)`, `sunset-orange #F2971F`, `deep-sea-blue #184363`,
  `fresh-green #39CB74`, `light-mist #EDF4F6`, `soft-lavender #F6F5FA`, `neutral-gray #9a9a9a`. Font: PT Sans via `next/font/google`.
- Hardcoded content that must move to the CMS: footer (`components/footer/siteInfo.js`), header phone (`navigationBar/components/Search&Support.js`),
  nav items (`navigationBar/components/NavigationList.js` has dead placeholder items: Blog, Elements, Features), hero fallback text (`home/hero/HeroSlider.js`),
  About/FAQ/Privacy/Refund/Terms pages, consultation departments array (`consultation/page.js`, `consultation/[deptName]/page.js` also contains fake doctors),
  newsletter copy, checkout delivery charges (`checkout/components/CheckoutForm.js`: Dhaka 60 / Outside Dhaka 90 / All Bangladesh 120), payment options (`checkout/components/PaymentSection.js`),
  `OrderSummary.js` phone number, site `<title>/description` in `app/layout.js`, social links.

### 0.7 Dashboard facts (apps/admin)
- Routes under `app/(dashboard)/dashboard/`: `page.js` (home, currently an empty welcome: all analytics code is commented out), `user`, `category`, `brands`, `products`
  (+`new`, `[id]`), `banners` (tabs: Slider, Banner, plus Deal/Countdown/Exclusive/Weekend that have **no API routes**), `orders` (+`add`, `[orderId]`), `doctors` (+`new`, `[docId]`).
  Login at `app/(dashboard)/admin-login`. Sidebar: `components/NavSideBar.js`; header: `components/Header.js` (no profile menu yet).
- Dark mode: `components/ui/DarkMood.js` toggles the `dark` class on `<html>` and stores `localStorage.theme`, but `app/layout.js` has no init script
  and most pages use fixed light colors (`text-gray-500`, `bg-green-400` sidebar), so the theme barely changes anything.
- Data layer: RTK Query slices in `store/slices/*` (many point at API routes that do not exist: countdown, deal, exclusive, weekend).
  `app/analytics/getOrderAnalytics.js` and `app/analytics/ui/*` exist but are not wired.
- Server actions: `app/actions/index.js` (login/logout). Middleware: `middleware.js` (role-aware route guard).

### 0.8 Seeded local accounts (`pnpm db:seed`)
`superadmin@memservice.local / SuperAdmin@123`, `admin@memservice.local / Admin@12345`, `manager@memservice.local / Manager@123`, `inactive@memservice.local / Inactive@123` (inactive), `user@memservice.local / User@12345` (rank 0).
Phase 1 replaces usernames with emails. Seed also creates 6 products, 3 categories, 3 brands, 3 banners, 4 sample doctors, and doccategories.

### 0.9 Engineering rules (apply to every phase)
1. **Do not change business logic** unless the phase says so (pricing, stock, order flow, payment flow, roles). Design/layout/CMS wiring only.
2. **No hardcoded content or secrets in code.** Content comes from the API/DB; secrets from env or the encrypted integrations store.
3. Prefer the dedicated tools. Some files use CRLF; when `Edit` fails to match, re-read the file. Do not shell-replace multi-line strings.
4. Never run `taskkill /IM node.exe`. Stop dev servers by port (PowerShell `Get-NetTCPConnection -LocalPort 3000,3001,3002`).
   Delete `.next` before a production build after running dev.
5. Admin is Next 14 / React 18; web and api are Next 15 / React 19: do not copy React-19-only APIs (`use`, async `params`) into admin. Next 15 `params`/`searchParams` must be awaited.
6. Every new API route needs: input validation, a rule in `apps/api/middleware.js` if staff-only, rate limiting if public+abusable, no stack traces in responses.
7. New collections need a model in `apps/api/app/models`, an index plan, and seed data in `scripts/seed.mjs` (idempotent).
8. Verify, do not assume: curl the API (cookie jar for staff, bearer for customers), screenshot pages with headless Chrome, and read the dev server log for errors.
9. Finish each phase with: `pnpm lint` (no new errors), `pnpm build`, a short verification log, and an update of this context file + `.env.example`.
10. Report honestly: what was tested, what was not (e.g. live payment gateways without credentials).

### 0.10 Known gaps register (all resolved & verified in QA-REPORT.md)
Verified in code and test automation (see `docs/QA-REPORT.md` for full test logs and resolution evidence).

| # | Gap | Evidence in the repo | Owner | Status |
|---|---|---|---|:---:|
| G1 | Doctor appointment booking does not exist | `apps/web/app/visit/checkout/page.js` is a static form with no submit logic; only a `wa.me` link | Phase 3.5, 4, 5 (Step 12) | ✅ CLOSED |
| G2 | Shop filtering/pagination has no backend | `apps/api/app/api/shop/route.js` returns every product; `apps/web/app/shop/page.js` filters and paginates in JS; search regex is not escaped | Phase 3.5 (Step 11) | ✅ CLOSED |
| G3 | Product reviews are not wired | `/api/product/review` is never called by web or admin; no moderation; reviews also stored as an array on the product | Phase 3.5, 4, 5 (Step 11) | ✅ CLOSED |
| G4 | Item prices are trusted from the client | order create reads `items[].price`, `total_amount` from the browser | Phase 3.5 (Step 11, 14.2) | ✅ CLOSED |
| G5 | Order number is generated in the browser | `apps/web/utils/generateOrderNumber.js` (second resolution: collisions, guessable) | Phase 3.5 (Step 11) | ✅ CLOSED |
| G6 | Money stored as strings | `regular_price`, `discount_price`, `purchase_price`, `total_amount`, `payment_info.amount` | Phase 3.5 (Step 11) | ✅ CLOSED |
| G7 | Cart prices go stale | cart persisted in `localStorage` with prices | Phase 3.5, 5 (Step 11) | ✅ CLOSED |
| G8 | No returns/refunds | order status enum lacks return/refund states | Phase 3.5, 4, 5 (Step 12) | ✅ CLOSED |
| G9 | Dropped by owner decision: SMS gateway and phone OTP are not required | - | none | ✅ CLOSED |
| G10 | No guest order tracking | none | Phase 3.5, 5 (Step 12) | ✅ CLOSED |
| G11 | No coupons | none | Phase 3.5, 4, 5 (Step 11) | ✅ CLOSED |
| G12 | No product variants or stock history | `pack_size`/`color` are label arrays; no SKU/StockMovement | Phase 3.5, 4, 5 (Step 11) | ✅ CLOSED |
| G13 | Products addressed by `_id`, no slug | `/product/<ObjectId>` | Phase 3.5, 5 (Step 11) | ✅ CLOSED |
| G14 | UI is English only | `specificationsHtmlBangla` exists but no locale support | Phase 3.5, 4, 5 (Step 12) | ✅ CLOSED |
| G15 | Wishlist is browser-only | `localStorage` key `memserviceWishlist` | Phase 3.5, 5 (Step 12) | ✅ CLOSED |
| G16 | No tests, CI, logging, error tracking, health endpoint | no `*.test.*`, no workflow, `console.log` only | Phase 3, 7 (Step 13) | ✅ CLOSED |
| G17 | Staff sessions cannot be revoked | JWT valid 24 h even after deactivation | Phase 7 (Step 13) | ✅ CLOSED |
| G18 | Durable rate limiter | `apps/api/lib/rateLimit.js` | Phase 7 (Step 13) | ✅ CLOSED |
| G19 | Privacy: no data export/delete requests | none | Phase 3.5, 5 (Step 12) | ✅ CLOSED |
| G20 | Credentials seen outside the machine were never rotated | `.env` is git-ignored | Phase 7 (Step 13) | ✅ CLOSED |
| G21 | Backups, Docker images, VPS, SSL, DNS (SPF/DKIM) | `scripts/backup-db.mjs`, `docs/go-live-checklist.md` | Phase 14 (Step 14) | ✅ CLOSED |
| G22 | Provider integrations live-verified with real merchant credentials | documented in `docs/go-live-checklist.md` | Phase 14 (Step 14) | ✅ CLOSED |

---

# Phase 1 - Email login, forgot password, broken pages

Goal: remove usernames everywhere, make dashboard login email-based, add forgot/reset password for staff, verify and fix the customer forgot/reset flow, and find and fix the three reported broken pages. No visual redesign yet (Phase 2+).

## PROMPT 1 (copy everything in this block into a fresh Claude Code session at the repo root)

Read Part 0 ("Project context") of `docs/implement-phase.md` fully before doing anything, and follow its engineering rules.
Work in this order. After each numbered task, verify it and keep a short log of what you ran and saw.

#### Task 1.1 - Remove usernames completely (login by email only)
Decision (final): the `username` concept disappears from login, UI, API, model, seed and DB. Email is the identifier. Do not keep it anywhere.
1. Model `apps/admin/app/models/user-model.js` and `apps/api/app/models/user-model.js`: remove `username`; make `email` required, unique, lowercase, trimmed; keep `phone` unique.
   Remove the compound unique index `{ email, phone, username, createdAt }` (it is meaningless and blocks inserts). Add `passwordResetToken` (String) and `passwordResetExpires` (Date) fields.
2. DB migration: add an idempotent script `scripts/migrate-users-email-login.mjs` (wire it as `pnpm db:migrate`) that drops the `username_1` unique index and the old compound index if present,
   unsets `username` on all users, lowercases emails, and reports duplicates instead of failing silently. Call it from `scripts/seed.mjs`.
3. `apps/admin/auth.js`: credentials become `{ email, password }`; look up by lowercased email; keep the checks `status === "active"` and `rankOf(role) >= 1`. Remove `username` from the returned user/JWT/session.
   Use a constant-time-ish path: always run a bcrypt compare (against a dummy hash) when the user is not found so response time does not reveal which emails exist.
4. `apps/admin/app/(dashboard)/admin-login/LoginForm.js` and `apps/admin/app/actions/index.js`: field `email` (type email, autocomplete), show the real reason class (invalid credentials vs. inactive account must NOT be distinguishable to the user: one generic message).
5. Users module: `apps/api/app/api/user/route.js` (remove `username` from POST validation/creation, return 409 on duplicate email/phone), `apps/admin/app/(dashboard)/dashboard/user/page.js`,
   `.../user/_components/UserForm.js`, `apps/admin/store/slices/userApi.js`: remove every username field/column/label. Add edit-status and reset-password-by-admin only if it already exists; do not add features.
6. `scripts/seed.mjs`: remove usernames, log in by email. Seed table must print emails. Keep roles and the two negative accounts (inactive, rank-0 user). Update Part 0 of `docs/implement-phase.md` section 8 and `README.md` account table.
7. `grep -rni "username" apps scripts docs README.md` must return nothing relevant (excluding `node_modules`, `.next`).

Acceptance: logging in with each seeded email works for super-admin/admin/manager; inactive and rank-0 user and wrong password all show the same generic error; no `username` string left; migration is re-runnable.

#### Task 1.2 - Staff forgot / reset password
1. API (public, rate-limited, generic responses, no account enumeration), reusing the pattern in `apps/api/app/api/customerProfile/forgot|reset`:
   - `POST /api/auth/staff/forgot` `{ email }` -> if an **active** staff user exists, store a sha256-hashed random token (>= 32 bytes, url-safe) with 30 min expiry, email a reset link
     `${NEXT_PUBLIC_ADMIN_URL}/reset-password?token=...&email=...` via `sendMail` (template: clean, branded, plain-text alternative included). Always return the same 200 message.
   - `POST /api/auth/staff/reset` `{ token, email, newPassword }` -> verify hash + expiry + email, enforce password policy (>= 8 chars, not equal to email), set new bcrypt hash, clear token, invalidate nothing else.
   - Add both paths to `apps/api/middleware.js` as public (no rule) and make sure CORS allows the admin origin.
2. Admin pages (match current look for now, polish comes in Phase 2/4): `/forgot-password` and `/reset-password` under `app/(dashboard)/` group, a "Forgot password?" link on the login form, success and error states, toast feedback.
   Update `apps/admin/middleware.js` matcher so these two pages are reachable when logged out and redirect to `/dashboard` when logged in.
3. If `RESEND_API_KEY` is unset, the API must log the reset link to the server console in development only (never in production) so the flow is testable locally. Implement that in the staff forgot route behind `NODE_ENV !== "production"`.
Acceptance: full flow works locally end to end (request -> console link -> reset -> login with new password); expired/used/forged token returns 400; 6th request in the window returns 429; response bodies are identical for existing and non-existing emails.

#### Task 1.3 - Customer forgot / reset password (storefront)
`apps/web/app/account/_components/ResetPasswordModal.js` talks to `/api/customerProfile/forgot` and `/reset`. Test it for real in a browser-like flow and fix defects:
- Email entered in different case, whitespace, or an account without email; messages shown for 200/400/429; the reset code step; password rules mirrored from the API (min 6 now -> raise to 8 on both API and UI, keep wording consistent).
- Make sure the modal can be opened from `/account/login` and that closing/reopening resets its state.
Acceptance: documented curl + manual steps in the log; all failure branches show a human message.

#### Task 1.4 - Find and fix the reported broken pages
Reproduce each in headless Chrome (capture console errors + a screenshot), find the **root cause**, fix it, and record cause + fix:
1. `/account/login` ("not working"). Suspects to check, do not assume: the form posts `phone` to `signIn("credentials")`; `app/account/login/layout.js` redirects when a session exists;
   `AUTH_TRUST_HOST`/cookie behaviour on `http://localhost`; the account being created by checkout has no password (guest customer) so it cannot log in - the login form should say so helpfully
   and offer "Register / reset password"; phone number format mismatch (`01XXXXXXXXX` vs `+8801...`): normalize phone numbers consistently on register, login and checkout (single helper in `apps/api/lib`, used by every route that stores or looks up `phone_number`).
2. `/account/register`: verify success, duplicate phone (409 message shown), validation (name, phone format BD `01[3-9]\d{8}`, password length, confirm match), and that after registering the user lands on login with a success notice. Fix anything broken. The API must reject invalid BD phone numbers.
3. `/consultation/doctor` ("not working"): `app/consultation/doctor/page.js` maps over the API result and `app/consultation/components/DoctorProfile.js` renders `next/image` with `doc.image`.
   Known problems: the doctors collection is empty locally; `doc.image` can be undefined or from a host not allowed in `apps/web/next.config.mjs`, which crashes the page; the page does not handle a non-array/failed response; the card layout is fixed-height.
   Fix: defensive data handling with a proper empty state ("No doctors available yet"), image fallback (initials avatar) and a safe image component, error boundary text instead of a crash, and add 4 sample doctors + 1 doc-category set to `scripts/seed.mjs` (idempotent; `contract_number`, `bmdc_number`, `doctor_code` are unique, image optional).
   Also verify `/consultation`, `/consultation/[deptName]`, `/doctors/[doctorId]`, `/visit/checkout` load without errors with and without doctors in the DB.
4. Next dev overlay "1 error" badge on the home page and any other page: capture it (the browser console / dev log), fix the cause, and confirm zero errors on every storefront route (list in context section 6).
5. Home hero: the category sidebar (`home/hero/Category.js`) is visually overlapped/clipped by the hero in the 1440px screenshot. Fix the layout (flex/grid widths) without redesigning.

#### Verification (must be done and logged)
- `pnpm db:migrate && pnpm db:seed`, `pnpm dev`, then a curl/script matrix: email login for 3 roles OK, 3 negative logins identical message, forgot/reset happy and sad paths (staff + customer), register/login (customer) incl. duplicate and bad phone.
- Headless Chrome screenshots + console-error capture for: `/account/login`, `/account/register`, `/consultation`, `/consultation/doctor`, `/doctors/<id>`, `/` (no overlay badge), `/admin-login`, `/forgot-password`.
- `pnpm lint`, `pnpm build` pass. Update Part 0 of `docs/implement-phase.md` and `.env.example` if anything changed.
Finish with a concise report: root causes found, files changed, what was not testable.



# Phase 2 - Design system, dark/light theme, dashboard shell

Goal: one coherent premium design language for the storefront and the dashboard, with a working dark/light theme in both (token-based, no flash), a rebuilt dashboard shell (sidebar, header, profile menu) and a shared set of UI primitives. Layout/visual work only: no business logic changes.

## PROMPT 2 (copy everything in this block into a fresh Claude Code session at the repo root)

Read Part 0 ("Project context") of `docs/implement-phase.md` fully before doing anything, and follow its engineering rules.

#### Why this phase exists (current problems, verified in code)
- Dashboard: `apps/admin/app/layout.js` has no theme bootstrap; `components/ui/DarkMood.js` toggles the `dark` class but most screens use hard-coded light/grey utility colors
  (`text-gray-500`, `bg-gray-100`, `bg-green-400` sidebar/header), so the theme change is barely visible and the dark screen has unreadable low-contrast text (see the "Welcome to Your Dashboard" screenshot).
  The sidebar "Shop" link and Header have no profile menu; `Header.js` just prints the user's name.
- Storefront: colors are Tailwind tokens (`sky-blue`, `deep-sea-blue`, ...) used directly with no dark variant, no shared components (buttons, inputs, cards, badges, skeletons are re-implemented per page).

#### Task 2.1 - Design tokens (both apps)
1. Define the palette as CSS variables in each app's `globals.css` (`:root` and `.dark`) and map them in `tailwind.config.js` (`colors: { background, foreground, card, muted, border, primary, accent, success, warning, danger, ring, ... }` using `rgb(var(--x) / <alpha-value>)`).
   Brand identity (keep): sky blue `#15a9e3` as primary, deep sea blue `#184363` for headings/dark surfaces, orange (`#F2971F` / `rgb(237,86,33)`) as accent/CTA.
   Light theme: white/very light mist surfaces. Dark theme: deep navy surfaces (not pure black), AA contrast (>= 4.5:1 body text, >= 3:1 UI) verified for every text/background pair you define (write a tiny script that checks the pairs and fail on regressions: `scripts/check-contrast.mjs`).
2. Typography scale, radius, shadow and spacing tokens; document in `docs/design-system.md` (colors with hex, type scale, spacing, radius, elevation, motion durations, z-index map).
3. Keep existing class names working during the migration (e.g. keep `sky-blue` etc. as aliases) so un-migrated pages do not break.

#### Task 2.2 - Theme engine (no flash, persistent, system-aware)
1. Dashboard (`apps/admin`): add a small inline script in `app/layout.js` `<head>` that sets the `dark` class from `localStorage.theme` (`light|dark|system`) before paint, `suppressHydrationWarning` on `<html>`.
   Replace `DarkMood.js` with a three-state theme control (light / dark / system) with accessible labels, focus ring, keyboard support, `aria-pressed`; it must visibly change *every* surface.
2. Storefront (`apps/web`): same engine (class strategy), default light, optional system. Add a theme toggle to the header (desktop + mobile menu). Add `darkMode: "class"` to its tailwind config.
3. Respect `prefers-reduced-motion`; transition only color/background properties.

#### Task 2.3 - Shared UI primitives
Create a small component kit per app (do not share code across Next 14/15 apps yet; mirror the API):
`Button` (variants primary/secondary/ghost/danger/link, sizes, loading state), `Input/Textarea/Select/Checkbox/Switch` with label + help + error, `Card`, `Badge/StatusPill`,
`Modal/Drawer` (focus trap, ESC, scroll lock), `Dropdown/Menu`, `Tabs`, `Table` (sticky header, empty/loading/error states, responsive), `Skeleton`, `EmptyState`, `Toast` (keep react-toastify, restyle for both themes),
`Pagination`, `Breadcrumbs`, `PageHeader`, `ConfirmDialog`. Storefront also: `ProductCard`, `Rating`, `PriceTag`, `SectionHeader`, `Container`.
Rules: tokens only (no raw hex in components), keyboard accessible, visible focus, min touch target 40px, responsive from 360px.

#### Task 2.4 - Dashboard shell rebuild (`apps/admin/app/(dashboard)/dashboard/layout.js`, `components/NavSideBar.js`, `components/Header.js`)
1. Sidebar: grouped navigation (Overview, Catalog, Sales, Content, Settings placeholders that Phase 4 will fill: CMS, Integrations), collapsible, active state, tooltips when collapsed, mobile drawer, role-aware items (already filtered by `rankOf`; keep and extend with `minRank`). Replace the green background with the new tokens. Logo from Site Settings later; for now keep the current image.
2. Header: page title/breadcrumbs slot, global search placeholder (visual only, no new feature), theme control, notifications placeholder (visual only), **profile menu**: avatar with initials, click opens a dropdown showing full name, email, role badge, "My profile" (disabled/placeholder if no page), "Change password" (placeholder if none), theme choice, and **Logout** (uses the existing `logout` server action then `router.push("/admin-login")`). Close on outside click/ESC, accessible (`aria-haspopup`, `aria-expanded`, arrow-key navigation).
3. Content area: max-width container, consistent page padding, `PageHeader` on every page, remove the fixed `h-[93vh]` layout hack so pages scroll naturally and the sidebar stays sticky.
4. Restyle the login-related pages (`admin-login`, `forgot-password`, `reset-password` from Phase 1) with the new system (split layout, brand panel, form card) for both themes.
5. Replace react-toastify default colors with token-based styling in both apps.

#### Task 2.5 - Apply tokens to the storefront shell
Header (top bar, search, nav, cart/wishlist/account icons, mobile nav), footer, and the global layout wrapper. Keep content/structure; this phase only restyles the shell and verifies both themes.
Fix the known layout defect: home hero row where the categories sidebar is overlapped by the hero. Footer from the previous iteration stays functionally the same.

#### Verification (must be done and logged)
- Screenshots (headless Chrome, 1440 and 390 widths, light and dark) of: dashboard home, users, orders, products, the profile dropdown open, login page; storefront home, shop, product, cart, footer. Inspect them and fix contrast/overflow issues.
- `scripts/check-contrast.mjs` passes. No horizontal scroll at 360px on any checked page. Lighthouse-style a11y spot checks by script: every interactive element has an accessible name.
- The theme persists across reload and across navigation and applies before paint (no white flash in dark mode: confirm with a screenshot taken with `--virtual-time-budget` small).
- `pnpm lint`, `pnpm build` pass. Update Part 0 of `docs/implement-phase.md` (sections 6, 7) and `docs/design-system.md`.
Report: token list, components added, pages restyled, anything intentionally deferred to Phases 4/5.

---

# Phase 3 - CMS, Delivery and Integration Hub backend

Goal: build the whole backend for dashboard-managed content (CMS) and for the Integration Hub (email, BD payment gateways, BD couriers, Meta Pixel + Conversions API, Google OAuth, Cloudinary). After this phase nothing in the storefront needs to be hardcoded, and every integration can be switched on by saving credentials in the dashboard. UI comes in Phases 4 and 5; this phase is models, API, security, adapters, seed and tests. Prerequisite: Phases 1-2.

## PROMPT 3 (copy everything in this block into a fresh Claude Code session at the repo root)

Read Part 0 ("Project context") of `docs/implement-phase.md` fully before doing anything, and follow its engineering rules.
Do not touch dashboard/storefront UI in this phase except where a task says so. Keep existing public API response shapes backward compatible (add fields, never rename/remove) so the current storefront keeps working until Phase 5.

### Part A - CMS data layer

### A1. Models (`apps/api/app/models/`, one file each, with timestamps, indexes, `status` where relevant)
1. `SiteSettings` (singleton, key `"site"`): `siteName`, `tagline`, `logoLight`, `logoDark`, `favicon`, `contact { phone, whatsapp, email, address, mapUrl, workingHours }`,
   `social { facebook, instagram, youtube, tiktok, telegram, x, linkedin }`, `seo { defaultTitle, titleTemplate, defaultDescription, ogImage, robots }`,
   `header { topBarText, showSearch, showThemeToggle }`, `footer { about, copyrightText, showPaymentBadges }`, `commerce { currency: "BDT", minOrderAmount, supportNote, defaultDeliveryZone }` (delivery zones live in their own collection, see item 9),
   `newsletter { title, subtitle, enabled }`, `announcement { text, link, enabled, tone }`, `maintenance { enabled, message }`.
2. `Menu` (`location: "header" | "footer-1" | "footer-2" | "footer-3" | "footer-4" | "mobile"`, `title`, `items[{ label, url, type: "link|category|brand|page", ref, openInNewTab, children[] , status }]`, order by array position).
3. `Page` (`slug` unique, `title`, `template: "default|about|legal|contact"`, `blocks[]` (heading, richtext, image, imageText, stats, team, faqRef, cta, html-free), `seo`, `status: draft|published`, `publishedAt`, `updatedBy`). Rich text is stored as sanitized HTML.
4. `Faq` (`group`, `question`, `answer`(sanitized HTML), `order`, `status`) + `FaqGroup` (`title`, `order`).
5. `Department` for consultation (`slug` unique, `name`, `description`, `icon` (uploaded image URL), `order`, `status`) and connect doctors by `department` slug (keep the existing free-text `department` working: add a migration/seed helper that creates departments from existing doctor values).
6. `HomeLayout` (singleton): ordered `sections[{ key, type: "hero|brands|categories|productRail|bannerGrid|promoStrip|testimonials|newsletter|custom", title, subtitle, enabled, config{ source: "best-seller|trending|new-arrival|offer|category|brand|manual", limit, categoryId, brandId, productIds[] } }]`.
9. `DeliveryZone` (the checkout "Delivery Area" and its charge, fully dashboard-managed): `key` (unique slug), `label`, `description`, `charge` (BDT, >= 0), `freeAbove` (optional order subtotal that makes this zone free), `eta` (text, e.g. "1-2 days"), `etaDaysMin/Max`, `codAvailable` (bool), `allowedPaymentMethods[]` (empty = all enabled), `districts[]` and `areas[]` (optional coverage lists for a district/area selector), `minOrder`, `status`, `order`, `isDefault`. Seed the three current zones (Dhaka 60, Outside Dhaka 90, All Bangladesh 120) exactly as in `CheckoutForm.js`. Skip weight/quantity surcharges and say so in the report.
7. Extend existing models additively: `Slider`/`Banner` get `order`, `status`, `placement ("hero"|"home-grid-1"|"home-grid-2"|"promo")`, `link { type: "product|category|brand|url", ref, url }`, `imageDesktop`, `imageMobile`, `alt`, `startsAt`, `endsAt` (keep `image` as the desktop fallback and `productId`).
   `Brand`: `order`, `featured`, `logo` (already), `description`, `slug`. `Category`: `image`, `order`, `featured`, `slug`, `description`, `parent` (optional). Backfill slugs in a migration script.
8. `Testimonial` (name, role, avatar, rating, text, order, status) and `MediaAsset` (url, publicId, width, height, bytes, format, alt, folder, uploadedBy) for a simple media library on top of Cloudinary.

### A2. API (App Router route handlers; all writes staff-only through `apps/api/middleware.js`; reads for the storefront are public, return only `published/active` items, and are cacheable)
- `GET /api/cms/site` (public subset: no secrets), `PUT /api/cms/site` (admin+).
- `GET|PUT /api/cms/menus/[location]` (public GET, admin+ PUT, validate depth <= 2 and URL safety: only `/path`, `https://`, `mailto:`, `tel:`).
- `GET /api/cms/pages` (list, staff incl. drafts), `GET /api/cms/pages/[slug]` (public: published only), `POST|PUT|DELETE` (admin+).
- `GET|POST|PUT|DELETE /api/cms/faqs`, `/api/cms/faq-groups`, `/api/cms/departments`, `/api/cms/testimonials` (reorder endpoint: `PUT .../reorder` with ordered ids).
- `GET /api/cms/home` (public: resolves each section's data server-side in ONE call: sliders, brands, categories, product rails already populated with the safe product fields used by `/api/shop`), `PUT /api/cms/home` (admin+).
- Delivery: `GET /api/delivery/zones` (public: active zones only, ordered, no internal fields), `POST|PUT|DELETE /api/delivery/zones` and `PUT /api/delivery/zones/reorder` (admin+), `POST /api/delivery/quote` (public, rate-limited: input `{ zoneKey, subtotal, paymentMethod?, district?, area? }` -> `{ charge, free, eta, codAvailable, reasons[] }`). The quote function lives in `apps/api/lib/delivery.js` and is the single source of truth for the charge.
- `GET /api/cms/bootstrap` (public): one cheap call returning site settings + header/footer menus + enabled integrations' public config (see Part B) so the storefront layout does 1 request.
- Media: `POST /api/media` (staff, multipart, validates mime allow-list jpeg/png/webp/avif/svg(sanitized), max 5 MB, uses Cloudinary via the Cloudinary integration config, stores `MediaAsset`), `GET /api/media` (staff, paginated, search), `DELETE /api/media/[id]` (admin+, refuses if referenced).
- Sanitization: use `sanitize-html` (server) with a strict allow-list for every rich-text field; never trust HTML from the client. Unit-test with XSS payloads.
- Caching: set `Cache-Control: public, s-maxage=30, stale-while-revalidate=300` on public CMS GETs; on every write call a tiny `revalidate` webhook hook point (`lib/revalidate.js`) that the web app can use in Phase 5 (`POST ${NEXT_PUBLIC_URL}/api/revalidate` with a shared secret `REVALIDATE_SECRET`; add the env key). If the webhook is unreachable, writes still succeed.
- Audit: write-through `AuditLog` (actor, action, entity, entityId, summary, at) for every CMS and integration change; `GET /api/audit` (admin+).
- Update `apps/api/middleware.js` rule table for every new route; add tests for 401/403/200 on each.

### A3. Seed (`scripts/seed.mjs`, idempotent)
Site settings with the current real values (name Mem Service, phone 01711-655686, email memservicebd@gmail.com, address Motijheel Dhaka, Facebook/Instagram/YouTube links from the codebase), header/footer menus equal to today's navigation (drop Blog/Elements/Features placeholders),
pages About/Privacy/Refund/Terms migrated from `apps/web/app/{about-us,privacy-policy,refund-and-return-policy,terms-and-conditions}/page.js` (copy the real text into the DB, do not invent policy text),
FAQ migrated from `apps/web/app/faq/page.js`, departments migrated from `apps/web/app/consultation/page.js`, delivery zones from `CheckoutForm.js` into the `DeliveryZone` collection (Dhaka 60, Outside Dhaka 90, All Bangladesh 120), a default HomeLayout, 3 sample hero sliders (landscape images stored locally under `apps/web/public/assets/seed/`, generated placeholder gradients are acceptable), 4 doctors (if not already from Phase 1).

### Part B - Integration Hub backend

### B1. Secure settings store
- Model `Integration`: `key` (unique), `category` (email|payment|courier|tracking|auth|media), `enabled`, `mode` (sandbox|live), `config` (object: non-secret fields), `secrets` (object of AES-256-GCM encrypted strings: `{ iv, tag, data }`), `status` (`not_configured|configured|connected|error`), `lastTestedAt`, `lastError`, `updatedBy`.
- Encryption helper `apps/api/lib/secrets.js`: AES-256-GCM, 32-byte key from new env `SETTINGS_ENCRYPTION_KEY` (required in production, health check fails without it; dev may derive from `AUTH_SECRET` with a loud warning). Never log secrets, never return them: API responses show `****last4` + `hasValue: true`.
- Resolution order at runtime: DB integration (enabled + configured) -> legacy env fallback (e.g. current `BKASH_*`, `RESEND_API_KEY`, `CLOUDINARY_*`, `AUTH_GOOGLE_*`) -> disabled. One helper `getIntegration(key)` with a 30 s in-memory cache invalidated on save.
- Routes: `GET /api/integrations` (admin+: list with masked secrets and status), `GET /api/integrations/[key]`, `PUT /api/integrations/[key]` (**super-admin only**; partial updates, empty secret field = keep existing, explicit "clear" flag), `POST /api/integrations/[key]/test` (admin+; runs the provider's `test()`; stores status/lastError; rate limited 10/min),
  `GET /api/public/config` (public, no secrets: enabled payment methods with label/logo/instructions/fees, active delivery zones, `metaPixel { enabled, pixelId }`, `googleLogin { enabled }`, courier enabled flags are NOT public). Add every route to the middleware rule table. Audit-log every change.

### B2. Provider adapters (`apps/api/lib/integrations/<category>/<provider>.js`, common interface, one registry file)
Interface per category:
- email: `send({to,subject,html,text,replyTo}) -> {ok,id,error}`, `test()` (sends nothing: verifies the key via a lightweight authenticated call, plus optional "send test email to me" action).
- payment: `meta` (label, logo, supports: ["wallet","card","netbanking"]), `createPayment(order) -> { redirectUrl, providerRef }`, `executeOrVerify(query|body) -> { status: paid|failed|cancelled, amount, trxId, raw }`, `refund?`, `handleWebhook?`, `test()`.
- courier: `test()`, `createShipment(order, options) -> { consignmentId, trackingCode, trackingUrl, fee? }`, `getStatus(consignmentId)`, `cancel?`, `handleWebhook(req) -> { consignmentId, status }`, `normalizeStatus()` mapping to `pending|picked_up|in_transit|delivered|returned|cancelled`.
- tracking: Meta (see B4).
Providers to implement (Bangladesh):
- Payments: **bKash** (tokenized checkout; refactor current `apps/api/lib/bkash.js` and `pgw/bkash/*` to read config from the integration store, keep sandbox/live switch and the existing behavior), **Nagad**, **SSLCommerz** (covers cards, Rocket, Upay, MFS via its gateway), **aamarPay**, **ShurjoPay**, **Cash on Delivery** (no credentials: instructions, optional advance/handling fee), and **Manual MFS** (customer sends money to a configured number and submits TrxID; order stays `pending` until staff verifies). Rocket/Upay as separate direct gateways are NOT public APIs: expose them through SSLCommerz/aamarPay/ShurjoPay and say so in the UI copy.
- Couriers: **Pathao** (OAuth: client id/secret/username/password, store id, city/zone/area lookups), **Steadfast** (api key/secret), **RedX** (access token, pickup store), **Paperfly**, **eCourier**.
- Email: **Resend** (move the existing `lib/mailer.js` behind the adapter; keep `sendMail()` signature).
- Auth/media: **Google OAuth** and **Cloudinary** as config-only integrations with `test()` (Cloudinary `api.ping`, Google: validate client id format + fetch discovery doc) and live use by `lib/utils.js`/web auth.
**Critical rule:** for each provider, read the provider's *official* current API documentation (fetch it) before coding: endpoints, auth, request/response fields, callback/webhook signatures and sandbox URLs. Do not guess or invent endpoints. If the docs cannot be fetched or are ambiguous, implement the documented part, mark the rest `TODO(provider-docs)` in code and list it in the final report. Put a link to each doc in the adapter header comment and in `docs/integrations.md`.
All outbound calls: timeouts (<= 15 s), no retries on non-idempotent calls, redacted logging, error mapping to stable codes. Webhooks/callbacks: verify signatures/secret tokens, idempotent processing, store raw payload in a `WebhookEvent` collection (`provider, eventId, payload, processedAt, error`).

### B3. Wiring into existing flows (business behavior preserved, provider chosen dynamically)
0. **Delivery charge integrity (the one deliberate server-side behavior change in this project):** order creation must recompute the delivery charge with `lib/delivery.js` from the submitted zone key and subtotal, ignore any client-sent charge, reject unknown/inactive zones and COD in zones where `codAvailable` is false, and store `shipping_details { zoneKey, zoneLabel, charge, eta }`. Totals stored on the order must equal items + server-computed charge. Keep the field names the dashboard and invoices already read (`shipping_method`, `shipping_charge`).
1. Checkout/order creation (`apps/api/app/api/order/route.js`): the payment method must be one of the enabled public methods (reject otherwise); online methods call the adapter's `createPayment`; keep stock transaction and COD behavior exactly as now. Generic callback routes `GET|POST /api/pgw/[provider]/callback` + `/api/pgw/[provider]/webhook` that call `executeOrVerify`, update `payment_info`, and on failure/cancel call `cancelOrder` (existing `lib/orders.js`). Keep `/api/pgw/bkash/callback` working (alias).
2. Orders: extend the Order model additively: `shipment { provider, consignmentId, trackingCode, trackingUrl, status, fee, bookedAt, bookedBy, history[] }`, `payment_info.provider/providerRef/events[]`. Routes: `POST /api/order/[id]/shipment` (staff: books via the chosen courier adapter, stores result, emails the customer a tracking link via Resend), `GET /api/order/[id]/shipment/status` (refresh), `POST /api/couriers/[provider]/webhook` (public, verified).
3. Email: all existing transactional emails keep working; add `order shipped`, `payment received`, `payment failed` templates in `apps/api/lib/emailTemplates/` using Site Settings (logo, name, contact) so there is no hardcoded branding. A single responsive layout wrapper shared by all templates.
4. Google login: if `googleLogin.enabled`, the web app shows the button (Phase 5); the web NextAuth config reads provider credentials from `/api/public/config`-style server call at boot (or env fallback). Customers signing in with Google must be linked/created via a new `POST /api/customerProfile/oauth` (verifies a server-signed assertion from the web app, returns the same `{ user, token }` as password login).

### B4. Meta Pixel + Conversions API
- Integration key `meta`: `pixelId`, `accessToken` (secret), `testEventCode`, `enabled`, `capiEnabled`, `datasetId` optional.
- Server: `apps/api/lib/integrations/tracking/meta.js` sending events to the Graph API Conversions endpoint (read the current official docs for version/path/fields): `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`, `Search`, `CompleteRegistration`, with `event_id` for browser/server deduplication, `event_source_url`, `action_source: "website"`, hashed (SHA-256, normalized) `em/ph/fn/external_id` only with consent flag, `client_ip_address`, `client_user_agent`, `fbp/fbc` cookies. `POST /api/track` (public, rate-limited, validates payload shape/size, allow-listed event names, fire-and-forget with queue-less retry-once) and server-side `Purchase` fired from the order/payment-confirmed path (dedupe with the browser event id stored on the order).
- Never block a request on tracking failures. Test mode via `testEventCode`. `test()` sends a test event and reports the response.
- Also support a cookie-consent flag in the public config (`tracking.requireConsent`) so the storefront can honor it.

### B5. Tests and verification
- Add an automated test layer for the API (use `node:test` + `supertest`-style calls against a running dev server or `next` handlers with an in-memory/test DB; document how to run: `pnpm test:api`). Cover: auth matrix for every new route (401/403/2xx), secret masking (no secret ever appears in any response or log), encryption round-trip, sanitization XSS cases, public CMS only returns published items, order creation rejects disabled payment methods, webhook signature rejection, idempotent webhook processing, Meta event hashing/normalization.
- Provider adapters get contract tests against recorded fixtures; live sandbox calls are skipped unless credentials exist (print "SKIPPED (no credentials)").
- Run the full storefront and dashboard smoke (all routes 200) to prove nothing regressed. `pnpm lint`, `pnpm build` pass.
- Deliver `docs/integrations.md` (per provider: what it needs, where to get credentials, sandbox vs live, webhook URL to paste in the provider dashboard, known limits) and `docs/cms-api.md` (routes, shapes, auth). Update Part 0 of `docs/implement-phase.md` (sections 3, 5) and `.env.example` (`SETTINGS_ENCRYPTION_KEY`, `REVALIDATE_SECRET`).
Report: models added, routes added (with auth level), providers implemented fully vs partially (with the TODO list), and exactly what could not be tested without real credentials.

#### How to run Phase 3 in sub-sessions (recommended: it is too large for one session)
Run the same Phase 3 prompt above three times, each time adding one of these lines at the very top. Commit after each. Do not start the next sub-session until the previous one's tests pass.
- **3a:** "Scope for this session: Part A (CMS data layer, Delivery zones and their quote API, seeds) and Part B1 only (secure settings store + routes + audit). Skip B2-B5."
- **3b:** "Scope for this session: Part B2 for the email and payment providers only (Resend, bKash, Nagad, SSLCommerz, aamarPay, ShurjoPay, COD, Manual MFS) plus B3 items 0, 1, 3 and the payment parts of B5."
- **3c:** "Scope for this session: Part B2 for couriers (Pathao, Steadfast, RedX, Paperfly, eCourier), Google OAuth and Cloudinary, plus B3 items 2 and 4, all of B4 (Meta) and the remaining B5 tests and docs."
Each sub-session updates `docs/integrations.md` / `docs/cms-api.md` incrementally and ends with its own report.

---

# Phase 3.5 - Commerce hardening (server-side pricing, catalog API, reviews, appointments, returns, coupons, variants, i18n, privacy)

Closes gaps G1-G15 and G19 from the gap register in Part 0.10. Backend plus seed plus tests only (dashboard screens are in Phase 4, storefront pages in Phase 5). This phase **intentionally changes business behavior** in the places listed (server-side item pricing, order numbering, money type); everything else keeps existing behavior and response shapes (add fields, never rename/remove). Run after Phase 3 (all of 3a-3c), before Phase 4.

## PROMPT 3.5 (copy everything in this block into a fresh Claude Code session at the repo root)

Read Part 0 ("Project context") of `docs/implement-phase.md` fully, including 0.10, before doing anything, and follow its engineering rules. Run in sub-sessions if the context gets long (suggested: 3.5a = items 1-5, 3.5b = items 6-9, 3.5c = items 10-13), committing after each.

#### Item 1 - Money as numbers (G6)
Convert every monetary field to `Number` (BDT, rounded to 2 decimals with one shared helper `apps/api/lib/money.js`: `toMoney`, `add`, `mul`, `sum`; never float math scattered around): `Product.regular_price|discount_price|purchase_price`, `Order.total_amount`, `Order.items[].price|totalPrice`, `Order.payment_info.amount|transaction_amount`, `Order.shipping_details.shipping_charge`, `Slider/Banner` prices, `DeliveryZone.charge`.
Write `scripts/migrate-money-to-number.mjs` (idempotent, dry-run flag, backup collection copy `*_backup_money`, reports unparsable values) and wire into `pnpm db:migrate`. Update every reader: `apps/api/utils/transformProductData.js`, `calculations.js`, order routes and email templates, admin `utils/calculations.js`, admin order/voucher components, `apps/web` product/cart/checkout code. API responses return numbers; add a compatibility serializer only where a consumer cannot be updated in this phase.
Acceptance: `grep` shows no `parseFloat`/`Number(` coercion scattered for money in routes; aggregations (sum revenue) work on real numbers; migration re-runnable.

#### Item 2 - Server-side pricing, totals and idempotent orders (G4, G5, G7)
1. `apps/api/lib/pricing.js` `priceOrder({ items, zoneKey, couponCode, paymentMethod, customer })`: load each product (+variant) from the DB inside the order transaction, require `status: active` and enough stock, take the **server** unit price (`discount_price` when set, > 0 and < regular price, else regular), compute line totals, apply coupon (Item 10), compute delivery via `lib/delivery.js`, return the authoritative snapshot (lines with name/image/sku/price, subtotal, discount, delivery, total). Client-sent prices/totals/charges are ignored.
2. `POST /api/order`: use `priceOrder`; if the browser's displayed total differs from the server total, respond `409 { code: "PRICE_CHANGED", cart: <repriced lines>, total }` without creating the order, so the UI can confirm. Keep stock decrement and bKash/other-gateway behavior inside the same transaction logic as today.
3. `POST /api/cart/price` (public, rate-limited): input `{ items:[{ id, variantSku?, quantity }], zoneKey?, couponCode? }` -> repriced lines, availability flags (`inStock`, `maxQty`), totals. This is what the cart/checkout UI uses to refresh stale `localStorage` prices.
4. Order numbers: server-side only, format `MS-YYMMDD-######` from an atomic `Counter` collection (`findOneAndUpdate $inc`, per-day reset), ignore any client `order_number`. Keep the unique index. Remove the web's `generateOrderNumber` usage (keep the file only if the admin "add order" still needs it, then switch that to the API too).
5. Idempotency: header `Idempotency-Key` (client generates a UUID per checkout attempt); store in `IdempotencyKey` (unique, TTL 24 h) with the resulting order id; replays return the same order with `200`. Concurrent duplicates must not double-decrement stock (test with parallel requests).
6. Tests: price tampering rejected/ignored, stock races, replay, coupon + delivery math, rounding.

#### Item 3 - Product slug and server-side catalog API (G2, G13)
1. `Product.slug` (unique, from name, Bangla-safe transliteration fallback to id suffix), backfill migration, regenerate-on-rename with redirect history (`slugHistory[]`). `GET /api/shop/[idOrSlug]` accepts slug or ObjectId; old `_id` URLs must keep working (Phase 5 redirects them).
2. Text index (name, generic_name, manufacturer_name, tags) and `GET /api/catalog/products?q&category&brand&type&minPrice&maxPrice&inStock&rating&tags&sort=(relevance|newest|price_asc|price_desc|popular|rating)&page&limit<=48` -> `{ items, total, page, pages, facets:{ categories:[{id,name,count}], brands, types, priceRange } }`. All user input escaped/validated (no raw regex from the client), status `deleted/inactive` excluded, only safe public fields (never `purchase_price`).
3. `GET /api/catalog/suggest?q=` (top 8 names/brands/categories, debounce friendly, cached 30 s). Keep `/api/shop` working but make it paginated by default (`limit` default 24) and escape its regex; document the deprecation in `docs/cms-api.md`.
4. Indexes reviewed with `explain()`; document them.

#### Item 4 - Reviews with moderation (G3)
`Review` model: `product`, `customer`, `order` (optional, sets `verifiedPurchase` when the customer has a delivered order containing the product), `rating` 1-5, `title`, `body` (sanitized), `images[]` (optional, Cloudinary), `status: pending|approved|rejected`, `helpfulCount`, `moderation { by, at, note }`. One review per customer per product. Routes: `POST /api/reviews` (customer bearer token, rate-limited, validates length, BD-safe profanity/URL filter optional), `GET /api/products/[idOrSlug]/reviews` (approved only, paginated, with rating distribution summary), `POST /api/reviews/[id]/helpful`, staff: `GET /api/reviews` (filters), `PUT /api/reviews/[id]` (approve/reject/delete). Maintain `Product.avgRating`, `Product.reviewCount` (recompute on approve/reject/delete). Migrate the existing `product.reviews[]` array and `ProductReview` collection into `Review` (as approved, unverified) and stop reading the array. Notify the customer by email on approval (optional toggle).

#### Item 5 - Doctor appointments (G1)
Default product decision: **appointment request** (the clinic/doctor confirms by phone/WhatsApp; fee is displayed, paid at visit). Keep a `paymentMode: "pay_at_visit" | "online"` field so online payment can be added later without a migration.
`Appointment` model: `doctor`, `patient { name, phone, age, gender, email }`, `preferredDate`, `preferredSlot`, `notes`, `status: requested|confirmed|rescheduled|completed|cancelled|no_show`, `feeSnapshot { consultation, followUp }`, `source`, `staffNotes`, `history[]`, `createdAt`. Routes: `POST /api/appointments` (public, rate-limited, BD phone validation, date not in the past, doctor must be active and available that weekday per `available_day`), `GET /api/appointments/[id]?phone=` (patient lookup, rate-limited), staff `GET /api/appointments` (filters: status, doctor, date range, search), `PUT /api/appointments/[id]` (status/reschedule/notes with audit). On create: email to the patient (confirmation of the request), email to `EMAIL_ADMIN_TO`; on status change: notify the patient. Seed: a few sample appointments.

#### Item 6 - Returns and refunds (G8)
Extend statuses additively: order `status` += `returned`, `partially_returned`; `payment_info.status` += `refunded`, `partially-refunded`.
`ReturnRequest` model: `order`, `customer`, `items[{ productId, variantSku, quantity, reason }]`, `reason` enum (damaged, wrong_item, not_as_described, expired, other), `notes`, `images[]`, `status: requested|approved|rejected|pickup_scheduled|received|refunded|closed`, `refund { method: "original|bkash|nagad|bank|store_credit|manual", amount, reference, provider, processedBy, processedAt }`, `history[]`.
Rules from Site Settings (add `returns { enabled, windowDays, nonReturnableCategories[], requirePhotos }`). Routes: `POST /api/returns` (customer token; own delivered orders inside the window; quantities <= purchased minus previously returned), `GET /api/returns` (customer own / staff all), staff `PUT /api/returns/[id]` (approve/reject/receive/refund). On `received` optionally restock via `StockMovement` (Item 8 variants); on `refunded` call the payment adapter's `refund()` when supported, otherwise record a manual refund reference. Emails at each step. Pure policy wording stays in the CMS Pages (no hardcoded policy text).

#### Item 7 - Guest order tracking (G10)
`POST /api/orders/track` `{ orderNumber, phone }` (rate-limited 10/min per IP and per order number) -> a safe subset (status timeline, items, totals, shipment tracking link/code, payment status) or a generic "not found" for any mismatch (no enumeration). Also `GET /api/orders/track/status-map` for UI labels/colors.

#### Item 8 - Product variants, SKU and stock movements (G12)
Extend `Product` additively: `sku` (unique, sparse), `variants[{ sku (unique), label, attributes{ packSize, color, strength }, regularPrice, discountPrice, purchasePrice, stock, image, status }]`, `lowStockThreshold`. Migration: generate variants from existing `pack_size`/`color` arrays only when the admin opts in (script flag); otherwise products without variants behave exactly as today (product-level price/stock). Pricing (Item 2), stock decrement/restock, cart lines, order items and invoices must carry `variantSku` and a name snapshot.
`StockMovement` (`product`, `variantSku`, `delta`, `reason: order|cancel|return|adjustment|import|correction`, `ref`, `balanceAfter`, `by`, `at`): written in the same transaction as every stock change (order create, cancel, return receive, manual). `POST /api/stock/adjust` (staff), `GET /api/stock/movements` (staff, filters), `GET /api/stock/low` (staff). Low-stock threshold configurable per product and globally in Site Settings.

#### Item 9 - Wishlist sync (G15)
`Customer.wishlist[]` (product ids, max 200). `GET|PUT /api/me/wishlist`, `POST|DELETE /api/me/wishlist/[productId]` (customer token). Merge-on-login endpoint `POST /api/me/wishlist/merge` (union of local and server, returns the merged list). Guests keep `localStorage` (Phase 5 UI).

#### Item 10 - Coupons (G11)
`Coupon` model: `code` (unique, uppercase), `type: percent|fixed|free_shipping`, `value`, `maxDiscount`, `minSubtotal`, `usageLimit`, `perCustomerLimit`, `usedCount`, `startsAt`, `endsAt`, `applicableProducts|Categories|Brands[]`, `excludedProducts[]`, `firstOrderOnly`, `stackable` (default false), `status`, `notes`. `POST /api/coupons/validate` (public, rate-limited, returns discount breakdown or a precise human reason), staff CRUD. Redemption is recorded atomically inside the order transaction (`CouponRedemption`: coupon, order, customer, phone, amount) so limits cannot be exceeded under concurrency; cancel/return reverses usage according to a setting. Pricing (Item 2) is the only place that applies a coupon.

#### Item 11 - Bilingual content (English / Bangla) (G14)
Pattern: localized fields as `{ en: String, bn: String }` via one mongoose helper `localized()` (apps/api/lib/i18n.js) with fallback to `en`. Apply to: SiteSettings texts (tagline, announcement, footer about, newsletter copy), Menu labels, Page title/blocks/SEO, FAQ/FaqGroup, Department name/description, Category/Brand names/descriptions, Product `name`, `short_description`, `specificationsHtml` (+ keep `specificationsHtmlBangla` as the Bangla source and migrate it into the new shape), Testimonials, email templates, HomeLayout titles, delivery zone labels/ETAs. Public API accepts `?lang=bn|en` (or `Accept-Language`) and returns resolved strings (and `translations` when `?lang=all` for the dashboard). Default language and enabled languages live in Site Settings (`i18n { default, enabled[] }`). Migration keeps existing English values as `en`.

#### Item 12 - Privacy requests (G19)
`DataRequest` (`customer`, `type: export|delete`, `status: requested|processing|done|rejected`, `notes`, `fileUrl`, timestamps). Routes: customer `POST /api/me/data-requests`, `GET /api/me/data-requests`; staff list/process. Export builds a JSON (profile, orders, reviews, appointments, wishlist) delivered as a short-lived signed download; delete anonymizes the customer (keep orders for accounting with name/phone/address replaced by a token, remove credentials, wishlist, reviews' author) after a confirmation email and a 7-day grace period. Retention settings in Site Settings (`privacy { retainOrdersYears, anonymizeAfterDeleteDays }`). Audit-log everything.

#### Item 13 - Seed, docs and tests for this phase
Seed (idempotent): products with 2-3 variants, SKUs, stock movements, 2 coupons (percent, free shipping), approved + pending reviews, 3 appointments in different statuses, 1 return request, Bangla values for CMS content. Extend `docs/cms-api.md` and and add `docs/commerce-rules.md` (pricing order of operations, coupon rules, stock and idempotency guarantees, return windows, status machines).
Tests (`pnpm test:api`): everything in the items above including concurrency (parallel orders on the last unit, coupon limit race), authorization matrices, XSS in reviews, migration idempotency. Full storefront and dashboard route smoke must still pass. `pnpm lint`, `pnpm build`.
Report: migrations run and their results, endpoints added with auth level, behaviors changed (list them), provider docs gaps, anything untestable without credentials.

---

# Phase 4 - Dashboard: every page, CMS screens, Integration Hub UI

Goal: every dashboard screen is premium, fully wired to the API/DB, handles loading/empty/error states, respects roles, and works in light and dark. The dashboard becomes the single control room for the storefront (CMS) and for integrations. Prerequisites: Phases 1-3.

## PROMPT 4 (copy everything in this block into a fresh Claude Code session at the repo root)

Read Part 0 ("Project context") of `docs/implement-phase.md`, `docs/design-system.md`, `docs/cms-api.md` and `docs/integrations.md` fully before doing anything, and follow the engineering rules.
Use only the shared UI kit from Phase 2 (no ad-hoc styling). Admin is Next 14 / React 18. All data goes through RTK Query slices in `apps/admin/store/slices` (credentials included). Do not change business logic; where a screen needs data that no API provides, add the API route (staff-guarded, validated) in `apps/api` and a rule in `apps/api/middleware.js`.

#### Standards for EVERY screen (acceptance checklist, apply to each task below)
1. Loading skeletons, empty state with a primary action, error state with retry, optimistic or invalidated refresh after mutations, toast feedback with human messages.
2. Forms: react-hook-form + schema validation, inline errors, disabled submit while saving, unsaved-changes warning, server errors mapped to fields.
3. Tables: server-side pagination + search + sort + filters synced to the URL (`useSearchParams`), column visibility not required, bulk actions only where meaningful, row actions menu, responsive (cards below 768px).
4. Destructive actions always via `ConfirmDialog` with the entity name; role-gated actions hidden *and* rejected by the API.
5. Both themes, 360px-1920px, keyboard navigable, no console errors, no `undefined` text, no dead links/tabs.
6. Remove dead code that belongs to the removed Deal/Countdown/Exclusive/Weekend features (their slices point at non-existent routes) unless Phase 3 created real routes for them.

#### Task 4.1 - Dashboard home (`dashboard/page.js`): live analytics
Currently an empty welcome; all analytics code is commented out. Build `GET /api/analytics/summary?range=7d|30d|90d|ytd` (staff) returning: totals (orders, revenue, average order value, new customers, units sold), delta vs previous period, status breakdown, payment-method breakdown, revenue time series, top products, top categories, low stock (stock <= threshold from settings, default 10), recent orders (10), pending actions (orders awaiting payment verification, unshipped paid orders). Use Mongo aggregations with indexes; revenue counts only non-cancelled orders; document the definition on the page via a tooltip.
UI: KPI cards with delta chips, revenue chart (Recharts is already a dependency; style via tokens), status donut, top products table, recent orders table with quick actions, low-stock list linking to the product, "needs attention" panel, date-range control, refresh. Role: all staff see it; managers do not see cost/profit figures (hide purchase-price-based metrics).

#### Task 4.2 - Orders (`orders`, `orders/[orderId]`, `orders/add`)
Review the existing components in `orders/_components`. Rebuild list (status tabs with counts, search by order no/phone/name, date range, payment status, courier status filters, export CSV), detail page (timeline of status/payment/shipment history, items, customer, addresses, payment panel with provider/trx id/verify-manual-payment action, shipment panel), status changes with confirmation (cancel restocks via existing API), invoice/voucher print (fix `VoucherModal/VoucherTemplate` to use Site Settings logo/name/contact, no hardcoded branding), `add` (admin-created order) validated against stock.
New: **Courier booking** panel (select enabled courier -> book -> shows consignment/tracking, copy link, refresh status, cancel if supported) wired to `POST /api/order/[id]/shipment`; bulk "book courier" for selected orders; **Payments**: show enabled gateway, retry link, mark manual MFS payment verified. Hide courier/payment controls with an explanatory empty state if the corresponding integration is not enabled (link to Integrations).

#### Task 4.3 - Catalog: Products, Category, Brands
Products (`products`, `products/new`, `products/[id]`): server-side table (image, name, SKU/id, category, brand, price/discount, stock with low-stock badge, status, flags: new/trending/offer/best seller/top seller), filters, quick toggles for flags and status, duplicate product, bulk status. Product form in sections (basic, pricing, inventory, media with drag-drop multi-upload via Media library + reorder + primary image, categories/brands, tags, description with the rich-text editor, SEO fields, flags, preview link to the storefront). Keep the current autofill helpers working or remove them if broken (decide after testing; report).
Category and Brands: list/grid with image/logo upload (Media library), featured toggle, order (drag handle), slug, status, product counts, inline create/edit in a drawer, delete blocked when in use (show why). Remove `demo` routes (`brands/demo`, `category/demo`) and the duplicate `components/brand/*` after confirming they are unused.

#### Task 4.4 - Content blocks: Banners and Sliders (`banners`)
Replace the tab set with: **Hero slider** (landscape banner images only, NO text overlay fields: image desktop + optional mobile, alt text, link target product/category/brand/url, order by drag, schedule start/end, status, live preview exactly as the storefront renders it, recommended size hint 1600x600 and max 2 MB with client-side validation), **Home banners** (placements `home-grid-1`, `home-grid-2`, `promo`), **Brand slider** shows the Brand module's featured brands (link to Brands page). Delete the Deal/Countdown/Exclusive/Weekend tabs and slices.

#### Task 4.5 - Doctors and Consultation (`doctors`, `doctors/new`, `doctors/[docId]`, new `consultation/departments`)
Doctors: table + form (photo upload, degree, specialty, department select from Departments, hospital, experience, fees, days, BMDC no., status, doctor info rich text), validation of unique fields with clear messages, profile preview. Departments: CRUD with icon upload, order, status, doctor counts. Review `doctors/components/AutoFill.js`: keep only if it works with a real data source, otherwise remove and report.

#### Task 4.6 - Customers (new `customers` page; API exists: `GET /api/customerProfile`)
Search/list customers (no password fields), detail drawer with orders and lifetime value, edit contact info, delete (admin+). This replaces ad-hoc customer lookups in order forms.

#### Task 4.7 - Users and Roles (`user`)
Email-based users (Phase 1). Table with role/status badges, invite/create with role limited by the actor's rank (server-enforced), edit role/status, reset-password link generation (sends the staff reset email), deactivate instead of delete, protect the last super-admin and self-demotion. Roles help panel explaining the permission matrix (what each role can access). Admins never see super-admins (already enforced by the API).

#### Task 4.8 - CMS section (new sidebar group "Content")
Screens: **Site settings** (tabs: General, Contact, Social, SEO, Header, Footer, Commerce, Announcement bar, Maintenance mode), **Menus** (header, footer columns, mobile: drag-and-drop tree depth 2, link picker for pages/categories/brands/custom URL with validation), **Pages** (list with status + search; editor with blocks, rich text (choose one maintained editor, e.g. Tiptap; replace the TinyMCE dependency if it needs a cloud API key), image blocks via Media library, SEO panel, slug uniqueness, draft/publish, preview in new tab with a signed preview token, "view live"), **FAQ** (groups + questions, drag order), **Home layout** (reorder/enable/disable sections, configure each section's source, live mini-preview), **Testimonials**, **Media library** (grid, upload, search, copy URL, alt text, usage check, delete), **Audit log** (filters, admin+ only).
Everything saved here must show up on the storefront through Phase 3 endpoints (verified in Phase 5). Include "Last updated by/at" and a revert-to-previous-version for Pages (keep the last 10 revisions in a `PageRevision` collection: add the model/route if missing).

#### Task 4.8b - Delivery areas and charges (sidebar: Settings -> Delivery; admin+ edit, manager read-only)
This controls the checkout "Delivery Area" selector and every delivery charge. Screens: zones table (label, charge, free-above, ETA, COD yes/no, status, drag order, default marker), create/edit drawer (label -> auto slug, charge, free-shipping threshold, ETA min/max days with generated text, COD availability, optional allowed payment methods, optional district/area coverage with a searchable multi-select seeded with Bangladesh's 8 divisions / 64 districts, minimum order, status), duplicate zone, delete blocked when the zone is the default or used by recent orders (offer deactivate instead), a **checkout preview / quote tester** (pick zone + subtotal + payment method -> shows exactly what the customer sees, using `POST /api/delivery/quote`), and an "orders per zone / revenue per zone" mini report. Changes appear on the storefront checkout immediately (cache hook). Validation: charge >= 0, unique label/slug, at most one default, at least one active zone required (block deactivating the last one with an explanation).

#### Task 4.9 - Integration Hub (new sidebar group "Settings" -> Integrations, admin+; edit = super-admin)
Page `integrations`: categories (Email, Payments, Couriers, Tracking, Login, Media) as a card grid: logo, name, one-line description, status badge (Not configured / Configured / Connected / Error), enabled switch, "Configure" button.
Configure drawer per provider: generated form from the provider's field schema (exposed by `GET /api/integrations/_schema`), secret fields masked with "Replace" action, sandbox/live toggle with a clear warning when switching to live, **Test connection** button with result and `lastError`, webhook/callback URLs to copy (computed from `NEXT_PUBLIC_APP_URL_PRODUCTION`/API URL), credentials-where-to-find help text and docs link, enable switch disabled until a successful test (allow override with a typed confirmation), activity log of the last changes.
Specific UIs: Payments page also lets staff order the methods shown at checkout, edit label/instructions/logo and fee per method; Couriers lets staff set the default courier and per-zone defaults; Meta shows Pixel ID, Conversions API token, test event code, "Send test event" and an events diagnostics table (last 50 server events with status); Email shows the From address, domain verification hint, "Send test email".
Managers see a read-only status page only. Super-admin edit actions require re-entering their password (new `POST /api/auth/staff/confirm` that returns a short-lived token) before saving secrets.

#### Task 4.10 - Profile and account
Profile menu items from Phase 2 become real pages: `profile` (name, phone, avatar, email read-only, theme preference) and `profile/security` (change password with current password check, active sessions note). API: `GET|PUT /api/me`, `PUT /api/me/password` (staff cookie required, current password verified, rate-limited).

#### Verification (must be done and logged)
- For each task: API smoke (curl with cookie jars for super-admin, admin, manager; assert 200/403 per role), then headless Chrome screenshots (light + dark, 1440 + 390) of every screen in empty, populated and error states (simulate error by stopping the API).
- A scripted route crawl of the dashboard as each role: every sidebar link returns 200, no console errors, no `undefined|NaN|[object Object]` text in the DOM.
- Data-wiring proof: create/edit/delete one entity per module through the UI endpoints and confirm it in Mongo (`docker exec memservice-mongo mongosh ...`) and in the corresponding public API response.
- Accessibility spot checks (labels, focus order), `pnpm lint`, `pnpm build`.
- Update Part 0 of `docs/implement-phase.md` section 7, write `docs/dashboard-guide.md` (what each screen controls on the storefront; role matrix).
Report: screens delivered, API routes added, dead code removed, deviations and anything not testable without provider credentials.

#### Addendum to Phase 4 (from the gap analysis; do these in this phase too, using the Phase 3.5 APIs)
Same screen standards as above apply to every task here.

#### Task 4.11 - Reviews moderation (new "Catalog -> Reviews")
Queue with status tabs (Pending first, with counts), filters (rating, product, verified purchase), review detail with product link and customer info, approve/reject/delete with optional note, bulk approve, rating distribution per product, "notify customer" toggle. Pending count badge in the sidebar.

#### Task 4.12 - Appointments (new "Sales -> Appointments")
List (status tabs, doctor/date filters, search by name/phone), calendar/day view grouped by doctor, detail drawer with patient info, timeline, one-click confirm/reschedule/complete/cancel/no-show (reschedule picks date/slot and notifies the patient by email), staff notes, export CSV. Respect doctor availability days from the Doctors module.

#### Task 4.13 - Returns and refunds (new "Sales -> Returns")
List with status tabs, detail with order link, requested items vs. eligible quantities, photos, approve/reject with reason templates, mark received (optional restock), refund panel (method, amount <= refundable, reference; uses the gateway `refund()` when the original provider supports it, otherwise manual record), history timeline, notifications log. Return rules (window, non-returnable categories, photo requirement) live in Site Settings -> Commerce.

#### Task 4.14 - Coupons (new "Sales -> Coupons")
Table with code, type/value, usage `used/limit`, validity, status; create/edit form with all rules from the Coupon model, auto-generate code, duplicate, deactivate, usage drill-down (orders that used it), validation preview ("test this coupon against a cart").

#### Task 4.15 - Inventory: variants, SKU, stock movements
Product form gets a **Variants editor** (add/remove rows: SKU, label, attributes, prices, stock, image, status; bulk price/stock edit; generate from attributes), SKU uniqueness feedback, low-stock threshold. New "Catalog -> Inventory" page: stock levels table (filter low/out of stock), quick adjust dialog (delta + reason), movement history with filters, CSV export. Low-stock widget on the home dashboard links here.

#### Task 4.16 - Bilingual editing (English / Bangla)
Every CMS and catalog form that has localized fields gets an EN / BN tab switch with a completeness indicator (e.g. "BN missing"), copy-from-English helper, and a Bangla-capable font in previews. Site Settings -> General: default language and enabled languages. Missing Bangla falls back to English on the storefront (show a "using English" hint in the editor).

#### Task 4.17 - Privacy requests and customers
"Customers" drawer gets the wishlist count and data-request actions; new "Settings -> Privacy" list to process export/delete requests (approve, run export, confirm anonymization with typed confirmation, audit trail).

#### Task 4.18 - Security: sessions
Profile -> Security shows active staff sessions (device, IP, last seen) with "sign out" and "sign out everywhere" (uses the session store from Phase 7; build the UI against a clear API contract `GET /api/me/sessions`, `DELETE /api/me/sessions/[id]` and leave a feature-flagged stub until Phase 7 lands). Admin+ can force-sign-out a user from the Users page.

---

# Phase 5 - Public storefront: every page, premium UI, CMS/API driven

Goal: every public route and section is premium, responsive, light/dark, free of hardcoded content, and fed by the API/CMS. Zero 404s on defined routes, zero console errors. Meta Pixel/Conversions API wiring, dynamic payment and delivery methods, and Google login (when enabled) are included. Prerequisites: Phases 1-4.

## PROMPT 5 (copy everything in this block into a fresh Claude Code session at the repo root)

Read Part 0 ("Project context") of `docs/implement-phase.md`, `docs/design-system.md`, `docs/cms-api.md`, `docs/integrations.md` and `docs/dashboard-guide.md` fully before doing anything, and follow the engineering rules.
Layout, design and data wiring only: do NOT change business logic (pricing, stock, order and payment flows, auth rules). Storefront is Next 15 / React 19 (await `params`/`searchParams`). Use the Phase 2 UI kit and tokens only.

#### Global rules for every page below
1. **Data:** server components fetch from the API (`API_URL`) with `next: { revalidate: 30, tags: [...] }` (or `cache: "no-store"` for user-specific data). One `getSiteBootstrap()` helper (`apps/web/lib/cms.js`) calls `/api/cms/bootstrap` once per request (React `cache`). Failures never crash a page: show a graceful fallback section or hide the section, and log server-side.
2. **No hardcoded content:** every string a business owner may want to change comes from the CMS (site settings, menus, pages, FAQ, departments, home layout, banners, brands, categories). UI chrome strings that are part of the interface (button labels like "Add to cart") may stay in a single `apps/web/lib/ui-text.js` constants file (prepared for i18n). Phone, address, email, social links, logo, delivery zones, payment methods: CMS/integrations only.
3. **SEO:** `generateMetadata` on every route from CMS SEO fields with sensible fallbacks (title template, description, Open Graph image, canonical), `sitemap.js`, `robots.js`, JSON-LD (`Organization`, `WebSite` with search action, `Product` with offer/availability/rating, `BreadcrumbList`, `FAQPage`, `MedicalOrganization`/`Physician` for doctors where data allows).
4. **Performance/a11y:** `next/image` everywhere with correct `sizes`, a safe image wrapper with fallback, no layout shift (aspect-ratio boxes), skeletons via `loading.js` per route segment, semantic landmarks, skip link, focus-visible, color contrast AA in both themes, `prefers-reduced-motion`.
5. **Responsive:** verify 360, 390, 768, 1024, 1440, 1920 widths. No horizontal scroll. Touch targets >= 40px.
6. **States:** every list has loading, empty and error states; every form has validation and success/error feedback.
7. `maintenance.enabled` from Site Settings shows a branded maintenance page for everyone except requests carrying a staff preview cookie.

#### Task 5.1 - Shell: header, mega menu, footer, announcement bar, theme
Header from CMS: logo (light/dark variants), search with live suggestions (existing `/api/shop` search; debounce, keyboard navigation, recent searches in localStorage, "no results" state), category dropdown from the DB, header menu from `Menu(header)` with up to 2 levels (mega menu for categories/brands when configured), contact chip from Site Settings, wishlist/cart (live count)/account (avatar + menu when logged in: My account, Orders, Logout), theme toggle, announcement bar (dismissible, remembers dismissal per message hash). Sticky condensed header on scroll. Mobile: bottom-sheet menu with accordion, search overlay, bottom nav bar (Home, Shop, Cart, Account).
Footer from CMS: brand block, columns from `Menu(footer-1..4)`, contact/social from settings, newsletter (from settings), accepted payment badges derived from **enabled payment methods** (not hardcoded images), dynamic copyright year, back-to-top. Remove dead items (Blog, Elements, Features) everywhere.

#### Task 5.2 - Home (`/`)
Render `HomeLayout` sections in the configured order and skip disabled ones: **Hero**: image-only slider (NO text/buttons overlaid, as decided): `next/image` priority for the first slide, autoplay (pause on hover/focus, respects reduced motion), arrows + dots, swipe, desktop/mobile image via `<picture>`/`sizes`, each slide is one link to its target, aspect-ratio box so there is no layout shift, graceful single-slide and zero-slide states (if zero slides, hide the hero and let the categories/brands lead). The categories rail beside the hero (desktop) must not overlap it.
**Shop by Brand**: swiper slider (loop only when slides > visible, arrows, drag, autoplay pause on hover), brand cards with logo or initials fallback, link to `/shop?brand=<slug>`. **Categories** grid/rail with images. **Product rails** (best deals, featured/new, trending, offers) with the premium `ProductCard` (image hover swap, discount badge computed from prices, rating, stock badge, quick add to cart, wishlist heart, price with strike-through). **Banner grids**, **promo strip**, **testimonials**, **newsletter** (calls the existing newsletter API; success/error states).
Everything below the fold lazy-loads (Suspense boundaries per section so a slow section does not block the page).

#### Task 5.3 - Catalog: `/shop`, `/offer`, `/trending`, `/best-seller`, `/product/[slug]`
Shop: filters (category, brand/manufacturer, product type, price range, availability, rating, tags) in a responsive sidebar/drawer, sort, view toggle (grid/list), URL-synced state (`brand`, `category`, `manufacturer` params must keep working: existing links use them), server pagination with page numbers, result count, active filter chips with "clear all", empty state with suggestions, skeleton grid. Offer/Trending/Best-seller reuse the same listing component with their own hero strip/title from CMS.
Product page: gallery (zoom, thumbnails, keyboard, mobile swipe; keep `react-image-magnify` only if it behaves, else replace), price block with discount and savings, pack-size/color/strength selectors as in the data, quantity stepper with stock limits, add to cart / buy now, wishlist, share buttons (Facebook, WhatsApp, copy link; fix the broken Telegram handler that references undefined `title/description`), delivery info from the active delivery zones (cheapest charge and ETA range), tabs (description, specifications, additional info, reviews with the review form and list), related products by category/brand/tags (replace the hardcoded `tags=medicine,tablets` query with the product's own tags), recently viewed (localStorage), sticky mobile buy bar, breadcrumbs, JSON-LD. 404 via `notFound()` for unknown slugs, never a crash.

#### Task 5.4 - Cart, wishlist, checkout, order completion
Cart: line items with image, variant, stepper, remove, subtotal, delivery estimate, empty state, persisted (existing cart context), coupon field only if a coupon API exists (otherwise do not render it).
Checkout (`/checkout`, `/visit/checkout`): multi-section form (contact, address, **Delivery Area selector built from `GET /api/delivery/zones`** (label, ETA and charge shown on each option; optional district/area dropdowns when the zone defines coverage), payment method **from `/api/public/config` enabled methods with their labels/instructions/fees**), order summary with live totals where the delivery charge, the "free delivery" state and an "add X more for free delivery" hint come from `POST /api/delivery/quote` (never computed or hardcoded in the browser; the server recomputes on order creation), COD disabled with an explanation in zones where it is unavailable, field validation (BD phone `01[3-9]\d{8}`, required address), inline errors, loading state, double-submit guard, redirect to the gateway for online methods, clear failure messages. Guest vs logged-in prefill. Manual MFS method shows the number/instructions and a TrxID field. If no payment method is enabled, show a helpful message instead of a broken form.
Order completion (`/complete-order`): success/failed/cancelled/pending variants driven by the real order + payment status, order summary, tracking info when a shipment exists, "download invoice" (use the existing PDF utilities; branding from Site Settings), continue shopping.
Pixel events: `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase` fire via a small `track()` helper that sends the browser pixel event and the server event through `POST /api/track` with the same `event_id`. Load the Pixel script only when `metaPixel.enabled` and consent allows. Cookie/consent banner (CMS text) with accept/decline stored in localStorage.

#### Task 5.5 - Account area: `/account`, `/account/login`, `/account/register`, `/account/orders/[orderId]`
Split auth layout with brand panel. Login (phone + password, show/hide password, loading, specific error text, link to register/reset, "Continue with Google" only when enabled), Register (BD phone validation, confirm password with strength meter, terms checkbox linking to the CMS Terms page), reset-password modal polished. Account dashboard: profile card with edit form, orders list with status chips and filters, order detail page with timeline, shipment tracking link, reorder button, wishlist shortcut, change password, logout. Protected routes redirect to login with a `callbackUrl` and return after login.

#### Task 5.6 - Doctors and consultation: `/consultation`, `/consultation/[deptName]`, `/consultation/doctor`, `/doctors/[doctorId]`, `/visit/checkout`
Departments from the CMS (icon, name, description, doctor count), department page lists its doctors (remove the fake doctors array in `consultation/[deptName]/page.js`), doctors directory with search + department/specialty filters + pagination, doctor profile page (photo with fallback, degree, specialty, hospital, experience, fees, available days, about, book appointment CTA, JSON-LD), booking checkout (`/visit/checkout`) validated and wired to the existing flow. Empty and error states everywhere.

#### Task 5.7 - Content pages: `/about-us`, `/faq`, `/privacy-policy`, `/refund-and-return-policy`, `/terms-and-conditions`
Replace the four hardcoded pages with CMS-driven rendering (`/[slug]` catch-all route is NOT allowed to shadow real routes: implement a dynamic segment `app/(content)/[slug]/page.js` only for slugs that exist as published Pages, and keep the four URLs above working exactly as they are (use `redirect`/rewrites or dedicated routes that read the same Page records)). Block renderer for all block types, table of contents for long legal pages, "last updated" from `updatedAt`, FAQ page with groups, search and accessible accordion, contact block with map link from settings. Add `/contact` page (CMS template `contact`) with a validated form that posts to a new public `POST /api/contact` (rate limited, emails `EMAIL_ADMIN_TO` through Resend, stores `ContactMessage`; add the dashboard inbox list in Phase 4's Content group if missing).

#### Task 5.8 - System pages
Branded `not-found.js`, `error.js` (with retry and error id), `loading.js` skeletons for each major segment, `global-error.js`, maintenance page, offline-friendly messaging. Every link in the header/footer/menus must resolve (write the crawler below).

#### Task 5.9 - Hardcode and dead-code purge (explicit checklist)
Search and remove/replace: `apps/web/app/components/footer/siteInfo.js` (content moves to CMS; keep only structural defaults used when the API is down, clearly marked as fallback), phone numbers and URLs in `Search&Support.js`, `OrderSummary.js`, `utils/PDF.js`, `utils/VoucherTemplate.js`, `components/newsletter/Newsletter.js` text, `app/layout.js` metadata, `NavigationList.js` placeholder items, `consultation/*` arrays, delivery charges, delivery areas and payment options in checkout components (`CheckoutForm.js`, `DeliverySection.js`, `DeliveryOption.js`, `PaymentSection.js`, `PaymentOption.js`), `memservicebd.com` strings, any `https://img.icons8.com` hardcoded icons, any remaining `localhost`/`vercel.app`. Add an ESLint rule or a `scripts/check-hardcoded.mjs` that fails on phone/email/URL literals in `apps/web/app` outside the allow-list.

#### Verification (must be done and logged)
- **Route crawler** `scripts/crawl-web.mjs`: starts from `/`, follows every internal link found in the rendered HTML (header, footer, menus, rails, cards), plus a fixed list of all routes in context section 6 with real ids from the DB; asserts HTTP 200 (or the intended redirect), no `404`/`Application error` text, no `undefined|NaN|[object Object]`, and title/description present. Run with and without seeded doctors, with an empty catalog, and with the API stopped (pages must degrade gracefully, never white-screen).
- **Browser check** in headless Chrome for each route at 390 and 1440, light and dark: capture console errors/warnings and screenshots; inspect them. Zero console errors and no Next dev overlay badge.
- **CMS round trip**: change a value in the dashboard (site name, phone, a menu item, a hero slide, a FAQ, a payment method toggle, delivery zone charge, a brand), confirm it appears on the storefront within the cache window (and instantly via the revalidate hook).
- **Commerce round trip** with seeded data: COD order, a simulated online payment success/fail via an adapter stub, stock changes, emails (dev: logged), Pixel events appear in the dev diagnostics (browser event + server event with the same `event_id`).
- Lighthouse-equivalent checks by script where possible (page weight, LCP image priority, CLS from image boxes). `pnpm lint`, `pnpm build`, `pnpm start` smoke.
- Update Part 0 of `docs/implement-phase.md` (sections 6, hardcoded list now empty) and write `docs/storefront-guide.md`.
Report: pages/sections delivered, hardcoded items removed (list), crawler results, known gaps.

#### Addendum to Phase 5 (from the gap analysis; do these in this phase too, using the Phase 3.5 APIs)
Corrections to the tasks above, which take precedence where they conflict: the shop uses the **server-side catalog API** (`/api/catalog/products`, `/api/catalog/suggest`), not client-side filtering of all products; the doctor "booking" is an **appointment request** to the new Appointments API (the old `/visit/checkout` page had no submit logic); product URLs are **slugs**.

#### Task 5.10 - Server-driven shop and slug URLs
Rebuild `/shop` (and the `/offer`, `/trending`, `/best-seller` listings) on `GET /api/catalog/products` with facets for the filter sidebar, URL-synced state, server pagination, and search suggestions from `GET /api/catalog/suggest`. Product routes become `/product/[slug]`; any request with an old ObjectId URL responds with a permanent redirect (301) to the slug URL; canonical tags point to the slug; sitemap lists slugs. Cart/wishlist/order links migrate to slugs (keep id fallbacks).

#### Task 5.11 - Variants, pricing freshness, coupons in the cart and checkout
Product page variant selector (pack size / color / strength) showing the variant's price, stock and image; cart lines carry `variantSku`. Cart and checkout call `POST /api/cart/price` on load and on every change: stale prices are replaced with a visible "price updated" notice, out-of-stock lines are flagged with a fix action, quantities clamp to `maxQty`. Coupon field (apply/remove, precise error text from `POST /api/coupons/validate`, shows the discount line and "free shipping"). Checkout sends an `Idempotency-Key`, never an order number or price, and handles `409 PRICE_CHANGED` with a confirm-and-continue dialog.

#### Task 5.12 - Reviews UI
Reviews tab on the product page: summary (average, distribution bars, count), approved reviews list with "verified purchase" badge, pagination, helpful button, write-a-review form (logged-in only: login prompt otherwise; rating, title, text, optional photos; shows "pending moderation" after submit; one review per product handled gracefully), accessible, both themes, both languages.

#### Task 5.13 - Appointments (replaces the static `/visit/checkout` form)
`/consultation` -> doctor card -> "Request appointment" opens a validated form (patient name, BD phone, age, gender, preferred date from the doctor's available weekdays, slot, notes), submits to `POST /api/appointments`, shows a confirmation page with the request reference and next steps, and a lookup page `/appointment/status` (reference + phone). The fee is shown from the doctor record; keep the WhatsApp contact as a secondary action. Keep the URL `/visit/checkout` working (redirect to the new flow with `doctor_id`).

#### Task 5.14 - Order tracking, returns, wishlist sync
`/track-order` (order number + phone, uses `POST /api/orders/track`, timeline UI, courier tracking link, helpful errors). Account order detail gets "Request return" (eligible items/quantities, reason, photos, shows status timeline afterwards) and the account area gets a returns list. Wishlist: guests keep `localStorage`; after login merge into the server wishlist and keep them in sync (optimistic UI, offline-safe). Account page also gets a Privacy section ("Download my data", "Delete my account" with confirmation and grace-period explanation).

#### Task 5.15 - Language switch (English / Bangla)
Locale from a cookie (`lang`) without changing route paths (all existing URLs stay valid), header language switch (only when more than one language is enabled), server components request `?lang=`, Bangla UI strings dictionary next to `lib/ui-text.js`, Bangla-capable font (`Hind Siliguri` or `Noto Sans Bengali` via `next/font`, loaded only when needed), `<html lang>` correct, `hreflang` alternates are NOT required (same URLs). Numbers/currency formatted with `Intl` (Bangla digits optional via a setting). Everything missing a Bangla value falls back to English.

---

# Phase 6 - Final QA and hand-over

Goal: prove the whole system works together, close gaps, and leave the project ready for the VPS phase (Docker images, domain/SSL, deployment, backups come after this and are not part of this document).

## PROMPT 6 (copy everything in this block into a fresh Claude Code session at the repo root)

Read Part 0 ("Project context") of `docs/implement-phase.md` and every guide in `docs/` before doing anything, and follow the engineering rules.

1. **Clean-room install test:** from a fresh clone state (delete all `node_modules` and `.next`, keep `.env`), run `pnpm install`, `pnpm db:up`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm dev`, `pnpm health`. Everything must work with no manual step.
2. **Full automated suites:** `pnpm lint`, `pnpm test:api`, `pnpm build`, `node scripts/crawl-web.mjs`, `node scripts/check-hardcoded.mjs`, `node scripts/check-contrast.mjs`. Fix every failure; do not weaken the checks.
3. **Role matrix test:** for super-admin, admin, manager and the two refused accounts, script every dashboard route and every API route and assert the expected 200/302/401/403; confirm no secret value appears in any response, log line or HTML.
4. **Security review of the final diff** (use `/security-review` and `/code-review`): auth bypasses, IDOR on customer/order routes, SSRF in adapters and media upload, XSS in CMS rich text, CSRF with the cookie session, CORS, rate limits, webhook signature checks, secret handling, dependency audit (`pnpm audit`).
5. **Resilience:** stop MongoDB, then the API, then Resend/each integration (simulate failures): storefront and dashboard must show graceful errors, never white screens; orders must never be half-created.
6. **Cross-browser/device:** Chrome desktop and mobile emulation (390x844), Firefox/Edge if available; print stylesheets for invoices.
7. **Documentation set** is complete and accurate: `README.md`, Part 0 of `docs/implement-phase.md`, `design-system.md`, `cms-api.md`, `integrations.md`, `dashboard-guide.md`, `storefront-guide.md`, plus a `docs/go-live-checklist.md` (what to configure in each provider dashboard, env keys for production, cookie domain, webhook URLs, Meta test events, Resend domain verification, bKash/Nagad/SSLCommerz live switch, courier credentials, backup plan placeholder).
8. Produce `docs/QA-REPORT.md`: what was run, results, screenshots index (`docs/qa-screenshots/`), open issues ranked by severity, and a list of items that need real provider credentials to be verified.
Report honestly. Do not mark anything as verified that was only reasoned about.

#### Addendum to Phase 6 (gap analysis)
Run Phase 7 first. In `docs/QA-REPORT.md` add a table with one row per gap G1-G22 from Part 0.10: status (closed / partially closed / open), evidence (test name, screenshot, command output), and the remaining action. Re-run the Playwright suite (`pnpm test:e2e`) and the crawler against a freshly seeded test database, and confirm the delivery-charge, item-price and coupon math cannot be tampered with from the browser (replay a modified checkout request and show the server rejects or ignores it).

---

# Phase 7 - Operations readiness (run AFTER Phase 5 and BEFORE Phase 6)

Closes gaps G16-G20 from Part 0.10: automated end-to-end tests, CI, logging and error tracking, health checks, session revocation, durable rate limiting, security headers, credential rotation, backups. After this phase, run Phase 6 (final QA) as the last step. Docker images, VPS, domain/SSL and DNS stay a separate task after Phase 6.

**Final run order: 1, 2, 3 (3a, 3b, 3c), 3.5, 4, 5, 7, 6.**

## PROMPT 7 (copy everything in this block into a fresh Claude Code session at the repo root)

Read Part 0 ("Project context") of `docs/implement-phase.md` fully, including 0.10, before doing anything, and follow its engineering rules. Update Part 0 when finished.

#### Task 7.1 - End-to-end tests (G16)
Add Playwright (`pnpm test:e2e`, config at repo root, uses a dedicated test database `memservice_test` created and seeded by the test setup, never the dev database). Suites: **storefront** (home renders sections from CMS, shop filters/pagination/search, product page + variant + reviews form, cart reprice notice, coupon, checkout COD with delivery zone + charge, guest tracking, register/login/logout, forgot password, account orders + return request, appointment request, language switch, theme toggle, 404 page), **dashboard** (email login for each role, refused accounts, role-based menu, CRUD smoke for products/categories/brands/banners/doctors/users/coupons/delivery zones/pages/menus/FAQ, order status change + cancel restock, courier booking with a stub adapter, reviews moderation, appointments, returns, integrations configure/test with a fake provider, profile + sessions), **API contract** (auth matrix over every route using the route table from `apps/api/middleware.js` so a new route without a rule fails the test). Visual checks: screenshot assertions only for a small set of key pages with a tolerance, in light and dark, to catch broken layouts. Run on Chromium desktop (1440) and a mobile viewport (390). Tests must be deterministic (no reliance on external providers: stub adapters/webhooks), isolated, and parallel-safe.

#### Task 7.2 - CI (G16)
`.github/workflows/ci.yml`: Node from `.nvmrc`, pnpm cache, Mongo service container as a single-node replica set, jobs: install -> lint -> `pnpm test:api` -> build all apps -> `pnpm test:e2e` (upload traces/screenshots on failure) -> `pnpm audit --audit-level=high` (fail on high/critical, allow-list file for accepted advisories with expiry dates) -> secret scan (gitleaks) over the full history. Add `dependabot.yml`. Branch protection notes in `docs/go-live-checklist.md`.

#### Task 7.3 - Logging, error tracking, health (G16)
1. Structured JSON logging with `pino` in `apps/api` (request id from `x-request-id` or generated, method, path, status, duration, user kind/id, never bodies or secrets, redaction list), replace `console.log/error` in routes and libs; log level from env. Web/admin server logs use the same helper. Remove leftover `console.log` that prints user/order objects.
2. Error tracking: Sentry (or compatible) for web, admin and api, DSN via env (`SENTRY_DSN_WEB|ADMIN|API`), disabled when unset, PII scrubbing (no emails/phones/tokens), release tagging from git SHA, source maps uploaded only in CI.
3. `GET /api/health` (liveness) and `GET /api/health/ready` (checks Mongo ping + replica set + required env + integration encryption key present; returns 503 with a reason list, no secrets) and matching `/health` pages for web/admin. `pnpm health` reuses these.
4. Integration failures (webhooks, payments, email, courier) are visible in the dashboard: "Settings -> System health" page listing the last errors (from `WebhookEvent`, mail failures) with retry where safe.

#### Task 7.4 - Staff session revocation (G17)
1. Replace the stateless 24 h cookie with a DB-backed session: `StaffSession` (`jti`, user, hashed refresh/secret, ip, userAgent, createdAt, lastSeenAt, expiresAt, revokedAt). The JWT carries `jti`; the API middleware (Edge: use a lightweight session-check endpoint or a short-TTL signed assertion refreshed against the DB every 5 minutes) rejects revoked/expired sessions and users who became inactive or lost a role. Deactivating a user or changing their role revokes sessions immediately. "Sign out everywhere", per-session sign out, forced sign-out by admins (Phase 4.18 UI contract: `GET /api/me/sessions`, `DELETE /api/me/sessions/[id]`).
2. Login hardening: progressive delay/lockout after repeated failures per email and IP, audit log of logins (success/failure with IP/UA), "new device" email notification.

#### Task 7.5 - Durable rate limiting and abuse controls (G18)
Move `apps/api/lib/rateLimit.js` to a store abstraction with a MongoDB TTL-collection implementation (works across restarts and multiple instances; keep the in-memory implementation for tests). Apply consistent limits to every public write endpoint (orders, coupons validate, cart price, reviews, appointments, contact, newsletter, tracking, track events) with per-IP and per-identifier keys, `Retry-After` header, and a dashboard-readable summary of recent 429s. Add basic bot controls: honeypot field and minimum-submit-time on public forms, optional Cloudflare Turnstile/hCaptcha verification behind an integration key (config-only, off by default).

#### Task 7.6 - Security headers, CORS and cookies
Security headers in all three apps (`next.config` `headers()` or middleware): HSTS (prod), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, frame protections (`frame-ancestors`), and a Content-Security-Policy that allows exactly what the apps use (self, Cloudinary, Meta Pixel/Graph domains only when enabled, payment gateway redirect domains) using nonces where possible; run in `report-only` first, fix violations, then enforce. Re-verify CORS allow-list, cookie flags (`Secure`, `HttpOnly`, `SameSite`, `COOKIE_DOMAIN`) and CSRF (state-changing cookie-authenticated routes require an allowed `Origin`; add a double-submit token for the few HTML-form posts). Upload hardening: magic-byte check, size limits, image re-encoding or Cloudinary-only, SVG sanitization.

#### Task 7.7 - Credential rotation and secret hygiene (G20)
Produce `docs/secrets-rotation.md` and make the system support it: list every secret and where it is used (Atlas user/password, Cloudinary key/secret, Google OAuth secret, bKash, Resend, `AUTH_SECRET`, `SETTINGS_ENCRYPTION_KEY`, `REVALIDATE_SECRET`, courier/payment keys), step-by-step rotation for each, and the order to do it without downtime. Implement rotation support where code is involved: `AUTH_SECRET` rotation with a previous-secret fallback (`AUTH_SECRET_PREVIOUS`) so sessions survive a rotation; `SETTINGS_ENCRYPTION_KEY` re-encryption script (`pnpm secrets:rotate`) with versioned ciphertext. Run `gitleaks` over the whole git history and report any finding; `.env` must never have been committed (verify with `git log --all -- .env`). Add a pre-commit hook (simple-git-hooks) that blocks committing `.env*` and obvious secret patterns. In the final report state clearly that the already-exposed credentials must be regenerated by the owner in each provider dashboard, and list them.

#### Task 7.8 - Backups and restore drills (prepares the VPS task)
Scripts (no VPS needed): `pnpm db:backup` (mongodump gzip archive with timestamp into `/backups`, retention argument) and `pnpm db:restore <file>` (to a target URI, refuses the production URI without a typed confirmation), a restore test that restores into a temp database and runs integrity checks (document counts, indexes, a sample order). Media backup note (Cloudinary is the source of truth; export the `MediaAsset` list). Document RPO/RTO targets and the cron/rotation plan in `docs/go-live-checklist.md` (the actual cron + off-site copy are done in the VPS task).

#### Task 7.9 - Database and performance audit
Review every collection's indexes against actual queries (`explain`), add missing ones (orders by status/createdAt/customer, products by status/slug/category/brand, reviews by product/status, stock movements by product, appointments by date/doctor, coupons by code), TTL indexes (idempotency keys, rate limits, webhook events retention), and fix unbounded arrays. Set performance budgets (LCP image priority, JS size per route) and verify with a script; Cloudinary transformations (`f_auto,q_auto`, responsive widths) for all product/banner images.

#### Verification (must be done and logged)
Run everything locally: `pnpm lint`, `pnpm test:api`, `pnpm test:e2e`, `pnpm build`, the crawler and checks from earlier phases, `pnpm audit`, gitleaks, backup + restore drill, session revocation test (deactivate a logged-in user -> next request is 401 within the configured window), rate-limit behavior across an API restart. Report results honestly, including anything that could only be reasoned about.
