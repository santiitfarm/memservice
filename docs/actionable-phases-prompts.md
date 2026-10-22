# Memservice - Sequential Implementation Prompts Guide (1 to 14)

> **ডকুমেন্ট ওভারভিউ:**  
> এই ফাইলটিতে আপনার Memservice প্রজেক্টের অবশিষ্ট সকল কাজকে সহজ ও ক্রমানুসারে **১ থেকে ১৪ (Step 1 to Step 14)** পর্যন্ত সিরিয়াল নম্বর দিয়ে সাজানো হয়েছে। যাতে আপনি সহজেই "Step 1 রান করো", "Step 2 রান করো" এভাবে একটার পর একটা প্রম্পট দিতে পারেন।

---

## 📌 কীভাবে ব্যবহার করবেন:
- প্রতিটি স্টেপ একে অপরের উপর নির্ভরশীল। তাই সরাসরি **Step 1 থেকে শুরু করে Step 14 পর্যন্ত** ক্রমানুসারে রান করুন।
- আপনি চাইলে শুধু প্রম্পট ব্লকটি কপি করতে পারেন অথবা সরাসরি বলতে পারেন: **"Step 1 শুরু করো"**।

---

## 🚦 প্রজেক্ট এক্সিকিউশন রোডম্যাপ (১ থেকে ১৪)

| ক্রম | স্টেপ ও মডিউলের নাম | স্ট্যাটাস | মূল ডেলিভারেবলসমূহ |
|:---:|---|:---:|---|
| - | **Completed Phase** | ✅ Done | ইমেইল লগইন, স্টাফ ও কাস্টমার পাসওয়ার্ড রিসেট, ব্রোকেন পেজ ফিক্স। |
| **1** | **Step 1: Design System & Shell** | ⏳ **Next Up** | সেন্ট্রাল CSS টোকেন, ডার্ক/লাইট মোড ইঞ্জিন, UI Kit, ড্যাশবোর্ড শেল। |
| **2** | **Step 2: CMS & Delivery Zones** | ⏳ Pending | সাইট সেটিংস, মেনু, পেজ, FAQ, ডেলিভারি জোন মডেল ও সার্ভার কোট ইঞ্জিন। |
| **3** | **Step 3: Payments & Email Backend** | ⏳ Pending | বিকাশ, নগদ, SSLCommerz, ম্যানুয়াল MFS (TrxID) ও Resend ইমেইল টেমপ্লেট। |
| **4** | **Step 4: Couriers, OAuth & Meta CAPI** | ⏳ Pending | পাঠাও, স্টিডফাস্ট, রেডএক্স, গুগল লগইন, ক্লাউডিনারি ও মেটা CAPI ট্র্যাকিং। |
| **5** | **Step 5: Money & Server Pricing** | ⏳ Pending | টাকার অংক নাম্বার মাইগ্রেশন, সার্ভার-সাইড প্রাইসিং, অটো অর্ডার নাম্বার, আইডেমপোটেন্সি। |
| **6** | **Step 6: Slugs, Reviews & Doctors API** | ⏳ Pending | প্রোডাক্ট স্লাগ, সার্ভার ক্যাটালগ সার্চ, রিভিউ মডারেশন, ডক্টর অ্যাপয়েন্টমেন্ট API। |
| **7** | **Step 7: Returns, Coupons & Variants** | ⏳ Pending | রিটার্ন রিকুয়েস্ট, গেস্ট ট্র্যাকিং, কুপন ইঞ্জিন, ভ্যারিয়েন্ট ও ইনভেন্টরি, বাংলা-ইংরেজি ভাষা। |
| **8** | **Step 8: Dashboard Core & Catalog UI** | ⏳ Pending | লাইভ অ্যানালিটিক্স চার্ট, অর্ডার ও কুরিয়ার বুকিং, প্রোডাক্ট ও স্টক ম্যানেজমেন্ট। |
| **9** | **Step 9: Dashboard CMS & Settings UI** | ⏳ Pending | ডেলিভারি জোন স্ক্রিন, ইন্টিগ্রেশন হাব, CMS পেজ, কুপন ও অ্যাপয়েন্টমেন্ট UI। |
| **10** | **Step 10: Storefront Shell & Home** | ⏳ Pending | ডার্ক মোড হেডার/ফুটার, ইমেজ ব্যানার স্লাইডার, ব্র‍্যান্ড স্লাইডার, ডায়নামিক হোম। |
| **11** | **Step 11: Storefront Shop & Checkout** | ⏳ Pending | সার্ভার শপ, স্লাগ পেজ, ডায়নামিক ডেলিভারি চার্জ সহ চেকআউট ও পেমেন্ট। |
| **12** | **Step 12: Storefront Services & Purge** | ⏳ Pending | ডক্টর বুকিং পেজ, অর্ডার ট্র্যাকিং, অ্যাকাউন্ট পোর্টাল, হার্ডকোড রিমুভ ও ক্রলার। |
| **13** | **Step 13: Operations Readiness** | ⏳ Pending | Playwright E2E টেস্ট, GitHub Actions CI, স্ট্রাকচার্ড লগিং, সেশন রিভোকেশন, ব্যাকআপ। |
| **14** | **Step 14: Final QA & Go-Live** | ⏳ Pending | ফুল সিস্টেম স্মোক টেস্ট, সিকিউরিটি রিভিউ ও VPS প্রোডাকশন ডিপ্লয়মেন্ট প্রস্তুতি। |

---

# 🚀 Step 1: Design System, Dark/Light Theme & Dashboard Shell

### 🎯 লক্ষ্য:
স্টোরফ্রন্ট এবং অ্যাডমিন ড্যাশবোর্ডের জন্য সেন্ট্রাল ডিজাইন টোকেন, জিরো-ফ্লিকার ডার্ক/লাইট মোড ইঞ্জিন, রিইউজেবল UI Kit তৈরি করা এবং ড্যাশবোর্ড শেল পুনর্গঠন করা।

```markdown
=== BEGIN PROMPT: STEP 1 ===
Task: Implement Step 1 - Unified Design System, Zero-Flash Dark/Light Theme Engine, Shared UI Kit Primitives, and Dashboard Shell Rebuild for Memservice.

Engineering Constraints:
1. Do NOT change any business logic, authentication logic, or API response structures.
2. apps/admin is Next.js 14.2 / React 18; apps/web is Next.js 15.1 / React 19. Do NOT use React 19 specific hooks (like `use`) in apps/admin.
3. Preserve brand colors: Sky Blue (#15a9e3) as primary, Deep Sea Blue (#184363) as dark/heading surface, Accent Orange (#F2971F / rgb(237,86,33)) as accent/CTA.
4. Keep backward compatibility with existing Tailwind color utility names (e.g. `sky-blue`, `deep-sea-blue`) so un-migrated components do not break.

Work in this strict order:
Part 1.1 - CSS Design Tokens:
- In `apps/admin/app/globals.css` and `apps/web/app/globals.css`, define HSL/RGB CSS variables under `:root` and `.dark` for: `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `destructive-foreground`, `border`, `input`, `ring`.
- Configure `tailwind.config.js` in both apps to map these variables using `rgb(var(--color-name) / <alpha-value>)` or HSL. Enable `darkMode: "class"` in both apps.
- Create `docs/design-system.md` documenting typography scale, spacing, border-radius, shadows, elevation and color tokens with hex values.
- Create `scripts/check-contrast.mjs` verifying that all text/background token pairs meet WCAG AA contrast ratio (>= 4.5:1 for normal text).

Part 1.2 - Zero-Flash Persistent Theme Engine:
- In `apps/admin/app/layout.js`, add an inline pre-paint `<script>` in `<head>` that reads `localStorage.theme` (`light` | `dark` | `system`), checks `window.matchMedia('(prefers-color-scheme: dark)')`, and toggles the `dark` class on `document.documentElement` before first paint. Add `suppressHydrationWarning` to `<html>`.
- Rebuild `apps/admin/components/ui/DarkMood.js` into an accessible 3-state Theme Selector (Light, Dark, System) with keyboard navigation and `aria-pressed`.
- In `apps/web/app/layout.js`, add the identical theme pre-paint engine and place an accessible theme toggle inside the storefront header.

Part 1.3 - Shared UI Kit Primitives:
Create a focused set of reusable, token-styled UI components in `apps/admin/components/ui/` and `apps/web/components/ui/`:
- `Button.jsx` (variants: primary, secondary, ghost, outline, destructive; sizes: sm, md, lg; loading spinner state; accessible focus ring).
- `Input.jsx`, `Textarea.jsx`, `Select.jsx`, `Checkbox.jsx`, `Switch.jsx` (with label, helper text, and error state).
- `Card.jsx` (CardHeader, CardTitle, CardContent, CardFooter).
- `Badge.jsx` (success, warning, destructive, info, outline variants).
- `Modal.jsx` (focus trap, ESC to close, backdrop blur, scroll lock, accessible ARIA roles).
- `Table.jsx` (responsive wrapper, sticky header option, empty and loading states).
- `Skeleton.jsx` (subtle pulse animation for loading states).
- `EmptyState.jsx` (icon, title, description, primary action button).
- `ConfirmDialog.jsx` (destructive action confirmation modal).
- Restyle `react-toastify` in both apps using design tokens for light and dark modes.

Part 1.4 - Dashboard Shell Rebuild:
- In `apps/admin/app/(dashboard)/dashboard/layout.js`: Remove the fixed `h-[93vh]` layout hack to allow natural scrolling.
- In `apps/admin/components/NavSideBar.js`: Rebuild sidebar with clean navigation groups (Overview, Catalog, Sales, Content, Settings). Replace hardcoded green background with token-based `bg-card` and `border-border`. Support collapsible state, active route indicator, mobile drawer, and role rank filtering (`minRank`).
- In `apps/admin/components/Header.js`: Add breadcrumbs slot, theme selector, and a full **Profile Menu Dropdown** (shows user avatar with initials, full name, email, role badge, "My Profile" link, theme toggle, and working **Logout** button connected to the logout server action).
- Restyle `admin-login`, `forgot-password`, and `reset-password` pages with token-based split-card styling for both themes.

Part 1.5 - Storefront Shell Verification:
- Update `apps/web/app/components/navigationBar/` (Header) and Footer layout wrappers to adopt token classes (`bg-background`, `text-foreground`, `border-border`).
- Fix the hero/categories overlap issue in `apps/web/app/components/home/hero/Category.js` and `Hero.js` using flex/grid widths without redesigning content.

Verification & Delivery:
- Run `node scripts/check-contrast.mjs` and confirm all pairs pass AA.
- Run `pnpm lint` and `pnpm build` across all apps.
- Ensure dev server runs cleanly with zero console errors.
- Commit all changes with message: `feat(step-1): unified design tokens, dark-light theme engine, ui kit and dashboard shell`.
=== END PROMPT: STEP 1 ===
```

---

# 🚀 Step 2: CMS Data Layer, Delivery Zones & Settings Store

### 🎯 লক্ষ্য:
স্টোরফ্রন্টের কনটেন্ট ম্যানেজমেন্ট ব্যাকএন্ড (`SiteSettings`, `Menu`, `Page`, `Faq`, `HomeLayout`, `Department`), ডেলিভারি জোন ও কোট ইঞ্জিন (`DeliveryZone`) এবং এনক্রিপ্টেড সেটিংস স্টোর তৈরি করা।

```markdown
=== BEGIN PROMPT: STEP 2 ===
Task: Implement Step 2 - CMS Data Layer, Delivery Zones & Quote API, and Encrypted Settings Store Backend.

Engineering Constraints:
1. Writes are staff/admin only via `apps/api/middleware.js`. Public reads must return only active/published items and be cacheable.
2. Rich text fields MUST be sanitized on the server using `sanitize-html` with a strict allow-list before saving to DB.
3. Keep backward compatibility with existing public API response structures.

Work in this strict order:
Part 2.1 - CMS Models (`apps/api/app/models/`):
- `SiteSettings.js` (Singleton, key "site"): `siteName`, `tagline`, `logoLight`, `logoDark`, `favicon`, `contact { phone, whatsapp, email, address, mapUrl, workingHours }`, `social { facebook, instagram, youtube, tiktok, x, linkedin }`, `seo { defaultTitle, titleTemplate, defaultDescription, ogImage }`, `header { topBarText, showSearch, showThemeToggle }`, `footer { about, copyrightText, showPaymentBadges }`, `announcement { text, link, enabled }`, `maintenance { enabled, message }`.
- `Menu.js`: `location` (header | footer-1 | footer-2 | footer-3 | footer-4 | mobile), `title`, `items[{ label, url, type, ref, openInNewTab, status }]`.
- `Page.js`: `slug` (unique), `title`, `template` (default | about | legal | contact), `blocks[]`, `seo`, `status` (draft | published), `publishedAt`, `updatedBy`.
- `Faq.js` & `FaqGroup.js`: FAQ items with questions, sanitized answers, group references, order, and status.
- `Department.js`: For doctor consultations with `slug` (unique), `name`, `description`, `icon`, `order`, `status`.
- `HomeLayout.js` (Singleton): Ordered `sections[{ key, type, title, subtitle, enabled, config }]`.
- `Testimonial.js` & `MediaAsset.js`: For client testimonials and media library metadata.
- Extend existing `Slider.js` & `Banner.js` additively with `order`, `status`, `placement`, `imageDesktop`, `imageMobile`, `alt`.
- Extend `Category.js` and `Brand.js` with `slug`, `order`, `featured`, `description`.

Part 2.2 - Delivery Zones & Pricing Engine:
- Create `apps/api/app/models/DeliveryZone.js`: `key` (unique slug), `label`, `description`, `charge` (Number, >= 0), `freeAbove` (optional Number threshold), `eta` (String), `etaDaysMin`, `etaDaysMax`, `codAvailable` (Boolean, default true), `allowedPaymentMethods[]`, `districts[]`, `areas[]`, `minOrder`, `status`, `order`, `isDefault`.
- Create `apps/api/lib/delivery.js`: Function `calculateDeliveryQuote({ zoneKey, subtotal, paymentMethod, district, area })` that returns `{ charge, free, eta, codAvailable, reasons[] }`. This must be the SINGLE source of truth for delivery pricing.
- Create `apps/api/app/api/delivery/zones/route.js`: Public `GET` (active zones, ordered), Staff `POST/PUT/DELETE`.
- Create `apps/api/app/api/delivery/quote/route.js`: Public, rate-limited `POST` using `calculateDeliveryQuote`.

Part 2.3 - CMS Route Handlers:
- `GET /api/cms/site` (public, excludes sensitive fields), `PUT /api/cms/site` (admin+).
- `GET /api/cms/menus/[location]` (public), `PUT /api/cms/menus/[location]` (admin+, validate depth <= 2 and URL safety).
- `GET /api/cms/pages` (staff), `GET /api/cms/pages/[slug]` (public: published only), `POST|PUT|DELETE /api/cms/pages` (admin+).
- `GET|POST|PUT|DELETE` for `/api/cms/faqs`, `/api/cms/faq-groups`, `/api/cms/departments`, `/api/cms/testimonials`.
- `GET /api/cms/home` (public: resolves sliders, brands, categories, rails in ONE query), `PUT /api/cms/home` (admin+).
- `GET /api/cms/bootstrap` (public): single call returning site settings + menus + active delivery zones for web initial render.
- In `apps/api/lib/revalidate.js`, implement cache tag/path revalidation webhook caller (`POST ${NEXT_PUBLIC_URL}/api/revalidate`) using `REVALIDATE_SECRET`.

Part 2.4 - Secure Settings Store & Audit Log:
- Create `apps/api/app/models/Integration.js`: `key` (unique), `category` (email | payment | courier | tracking | auth | media), `enabled` (Boolean), `mode` (sandbox | live), `config` (Object, plain fields), `secrets` (Object of AES-256-GCM encrypted strings `{ iv, tag, data }`), `status`, `lastTestedAt`, `lastError`, `updatedBy`.
- Create `apps/api/app/models/AuditLog.js` and helper `logAudit(actor, action, entity, entityId, summary)`.
- Create `apps/api/lib/secrets.js`: Helper for AES-256-GCM encryption/decryption using `SETTINGS_ENCRYPTION_KEY` (fallback to `AUTH_SECRET` in development). Add masking helper so API returns `****last4` and `hasValue: true`.
- Create `apps/api/app/api/integrations/route.js` and `apps/api/app/api/integrations/[key]/route.js` (Super-admin only for updates, never return raw secrets).
- Create `GET /api/public/config` returning only safe integration flags (enabled payment methods, delivery zones, Google login enabled, Meta Pixel ID).

Part 2.5 - Seed Script & Documentation:
- In `scripts/seed.mjs`, add idempotent seeds for: `SiteSettings` with real company info (Mem Service, Motijheel, 01711-655686), header/footer `Menu`, migrated content from web legal pages into `Page`, sample `Faq`, `DeliveryZone` (Dhaka 60, Outside Dhaka 90, All Bangladesh 120), default `HomeLayout`, and departments.
- Document all routes in `docs/cms-api.md`. Update `apps/api/middleware.js` with access rules for every new route.

Verification & Delivery:
- Run `pnpm db:seed` and ensure all CMS entities are populated.
- Test `GET /api/cms/bootstrap` and `POST /api/delivery/quote`.
- Run `pnpm lint` and `pnpm build`.
- Commit all changes with message: `feat(step-2): cms models, delivery zones quote engine, and secure settings store`.
=== END PROMPT: STEP 2 ===
```

---

# 🚀 Step 3: Payment Integrations Backend & Resend Email

### 🎯 লক্ষ্য:
বাংলাদেশের প্রধান প্রধান পেমেন্ট গেটওয়ে (bKash tokenized, Nagad, SSLCommerz, aamarPay, ShurjoPay, COD, Manual MFS) এর ব্যাকএন্ড অ্যাডাপ্টার এবং Resend ট্রানজ্যাকশনাল ইমেইল টেমপ্লেট সম্পন্ন করা।

```markdown
=== BEGIN PROMPT: STEP 3 ===
Task: Implement Step 3 - Bangladesh Payment Provider Adapters, Dynamic Payment Verification, and Transactional Email Engine.

Engineering Constraints:
1. Read current official Bangladesh payment gateway API specs for: bKash (tokenized checkout), Nagad, SSLCommerz, aamarPay, ShurjoPay, COD, and Manual MFS.
2. In-memory integration resolver `getIntegration(key)` with 30s cache: DB settings take precedence -> fallback to `.env` keys.
3. NEVER log customer payment secrets or return raw gateway credentials to client.
4. Outbound HTTP requests must have a 15-second timeout and handle network failures gracefully.

Work in this strict order:
Part 3.1 - Integration Resolver & Provider Registry:
- Create `apps/api/lib/integrations/resolver.js` exporting `getIntegration(key)` with in-memory caching and cache invalidation on save.
- Create `apps/api/lib/integrations/payments/index.js` exporting a unified registry and common interface: `{ meta, createPayment(order), executeOrVerify(req), refund(order, amount), test() }`.

Part 3.2 - Bangladesh Payment Adapters (`apps/api/lib/integrations/payments/`):
- `bkash.js`: Refactor existing bKash implementation to read credentials from the integration store (app key, app secret, username, password, base URL). Implement token grant, create payment, execute payment, and query payment.
- `nagad.js`: Implement Nagad merchant payment API (public key, private key, merchant ID, sandbox/live endpoints).
- `sslcommerz.js`: Implement SSLCommerz session API (store ID, store password, IPN validation, session create, query status). Handles Cards, Bank, MFS (Rocket, Upay).
- `aamarpay.js`: Implement aamarPay gateway integration (store ID, signature key, sandbox/live).
- `shurjopay.js`: Implement ShurjoPay tokenized checkout API.
- `cod.js`: Cash on Delivery adapter (no credentials, returns immediate success state, checks zone COD availability).
- `manual-mfs.js`: Manual bKash/Nagad/Rocket send-money adapter (holds order in `pending` payment status until staff verifies submitted TrxID).
- Implement `test()` on each adapter to verify credentials without processing real transactions.

Part 3.3 - Dynamic Payment Routes & Callbacks:
- Generic callback/webhook handlers: `GET|POST /api/pgw/[provider]/callback` and `POST /api/pgw/[provider]/webhook`.
- Verify webhook signatures and store incoming raw payloads in a `WebhookEvent` model (`provider, eventId, payload, processedAt, status`). Ensure idempotent processing.
- Keep `/api/pgw/bkash/callback` as an alias for backward compatibility.
- On payment success: update `order.payment_info.status = 'paid'`, set transaction details, decrement stock transactionally, trigger confirmation email.
- On payment failure/cancellation: mark payment failed, cancel order transactionally, restock items if reserved.

Part 3.4 - Order Creation Delivery & Payment Enforcement:
- Update `apps/api/app/api/order/route.js`:
  1. Recompute delivery charge on the server using `apps/api/lib/delivery.js` from `shipping_details.zoneKey` and subtotal. Reject client-sent charges.
  2. Reject unknown or inactive delivery zones.
  3. Validate that the chosen `payment_method` is currently enabled in `getIntegration(provider)`.
  4. If COD is chosen, verify `codAvailable` is true for the selected zone; reject otherwise.
  5. Store complete `shipping_details { zoneKey, zoneLabel, charge, eta }` on the Order.

Part 3.5 - Resend Transactional Email Engine (`apps/api/lib/emailTemplates/`):
- Refactor `apps/api/lib/mailer.js` behind the email adapter interface.
- Create branded HTML & plain-text responsive email templates:
  - `orderConfirmation.js` (order items, totals, delivery zone & ETA, payment info).
  - `orderShipped.js` (consignment ID, courier name, tracking link).
  - `paymentReceived.js` and `paymentFailed.js`.
  - `staffPasswordReset.js` and `customerPasswordReset.js`.
- All templates must dynamically pull company logo, name, phone, and address from `SiteSettings`.

Verification & Delivery:
- Test payment adapter validation with simulated mock credentials.
- Test order creation rejecting tampered delivery charges and disabled payment gateways.
- Run `pnpm lint` and `pnpm build`.
- Commit all changes with message: `feat(step-3): bangladesh payment gateway adapters and dynamic email engine`.
=== END PROMPT: STEP 3 ===
```

---

# 🚀 Step 4: Courier Integrations, OAuth, Media & Meta CAPI

### 🎯 লক্ষ্য:
বাংলাদেশের কুরিয়ার সার্ভিসসমূহ (Pathao, Steadfast, RedX, Paperfly, eCourier), Google OAuth, Cloudinary মিডিয়া লাইব্রেরি এবং Meta Conversions API (CAPI) সার্ভার ট্র্যাকিং সম্পন্ন করা।

```markdown
=== BEGIN PROMPT: STEP 4 ===
Task: Implement Step 4 - Bangladesh Courier Adapters, Google Auth/Cloudinary Integrations, and Meta Conversions API (CAPI).

Engineering Constraints:
1. Outbound API calls to courier gateways must have timeouts (<= 15s) and redacted logs.
2. Store tracking and consignment details on `order.shipment` schema.
3. Meta Conversions API must hash PII (SHA-256) and never crash order flows on tracking errors.

Work in this strict order:
Part 4.1 - Courier Adapters (`apps/api/lib/integrations/couriers/`):
Create common courier interface `{ test(), createShipment(order, options), getStatus(consignmentId), cancel(consignmentId), handleWebhook(req) }`:
- `pathao.js`: Pathao Courier API (client ID, client secret, username, password, store ID; city, zone, area lookups; shipment booking).
- `steadfast.js`: Steadfast Courier API (API key, secret key; create order endpoint, check status, check balance).
- `redx.js`: RedX Courier API (access token; create parcel, track parcel).
- `paperfly.js` and `ecourier.js`: Paperfly and eCourier merchant shipment adapters.
- Normalize courier status to standard enum: `pending | picked_up | in_transit | delivered | returned | cancelled`.

Part 4.2 - Courier Booking Endpoints:
- Extend `Order` model additively: `shipment { provider, consignmentId, trackingCode, trackingUrl, status, fee, bookedAt, bookedBy, history[] }`.
- Create `POST /api/order/[id]/shipment`: Staff-only route. Books consignment through the chosen courier adapter, stores tracking info, and sends `orderShipped` email to customer via Resend.
- Create `GET /api/order/[id]/shipment/status`: Refreshes live shipment status from the courier API.
- Create `POST /api/couriers/[provider]/webhook`: Public verified webhook receiver updating order status upon delivery or return.

Part 4.3 - Google OAuth & Cloudinary Config Integrations:
- `google-auth.js`: Verification adapter for Google OAuth client ID and discovery document.
- `apps/api/app/api/customerProfile/oauth/route.js`: Handles Google authentication assertion from the storefront, auto-creates customer profile without password, and issues JWT tokens.
- `cloudinary.js`: Cloudinary adapter with `test()` using `api.ping()`. Create `POST /api/media` (staff multipart upload, mime check jpeg/png/webp/avif/svg, max 5MB, saves `MediaAsset` document) and `GET /api/media`.

Part 4.4 - Meta Pixel + Conversions API (CAPI):
- Create `apps/api/lib/integrations/tracking/meta.js`: Sends events to Meta Graph Conversions API endpoint with `event_id` for browser/server deduplication.
- Supports events: `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`, `Search`, `CompleteRegistration`.
- Hash customer data (email, phone, first name) using normalized SHA-256. Include `client_ip_address`, `client_user_agent`, `fbp`, and `fbc` cookies.
- Create `POST /api/track`: Public rate-limited endpoint for storefront tracking.
- Automatically fire server-side `Purchase` event when order payment is confirmed.

Part 4.5 - Documentation:
- Create `docs/integrations.md`: Complete documentation for every payment, courier, tracking, and media provider detailing required credentials, sandbox URLs, and webhook endpoints.

Verification & Delivery:
- Test courier booking stub and shipment tracking status endpoint.
- Verify `GET /api/public/config` returns enabled courier and tracking metadata.
- Run `pnpm lint` and `pnpm build`.
- Commit all changes with message: `feat(step-4): bangladesh courier integrations, google oauth and meta capi`.
=== END PROMPT: STEP 4 ===
```

---

# 🚀 Step 5: Commerce Hardening — Money, Pricing & Orders

### 🎯 লক্ষ্য:
টাকার অংক স্ট্রিং থেকে নাম্বারে রূপান্তর করা, সার্ভার-সাইড প্রাইসিং ইঞ্জিন (`pricing.js`) তৈরি করা, ক্লায়েন্ট প্রাইস টেম্পারিং রোধ করা, সার্ভার-সাইড অর্ডার নাম্বার কাউন্টার (`MS-YYMMDD-######`) এবং চেকআউট আইডেমপোটেন্সি বাস্তবায়ন করা।

```markdown
=== BEGIN PROMPT: STEP 5 ===
Task: Implement Step 5 - Money as Numbers Migration, Server-Side Pricing Integrity, Server Order Numbers, and Idempotency.

Engineering Constraints:
1. NEVER trust client-sent prices, totals, or discount calculations.
2. Money math must use 2-decimal rounding with a central helper; do NOT scatter `parseFloat` or raw float operations.
3. Order creation must be transactional and thread-safe against concurrent double-spending or stock races.

Work in this strict order:
Part 5.1 - Money as Numbers:
- Create `apps/api/lib/money.js`: `toMoney(val)`, `add(a, b)`, `sub(a, b)`, `mul(a, b)`, `sum(array)`. All rounding to 2 decimal places using `Math.round((val + Number.EPSILON) * 100) / 100`.
- Update Mongoose models to use `Number` for all price/money fields: `Product` (`regular_price`, `discount_price`, `purchase_price`), `Order` (`total_amount`, `items[].price`, `items[].totalPrice`, `shipping_details.shipping_charge`, `payment_info.amount`), `DeliveryZone.charge`.
- Create `scripts/migrate-money-to-number.mjs` (idempotent, supports `--dry-run`, backs up original values, converts string numbers to real `Number`). Add script command `pnpm db:migrate-money`.
- Update readers across API (`transformProductData.js`), Admin (`calculations.js`), and Web (`cart/checkout` calculations) to handle numbers natively.

Part 5.2 - Server-Side Authoritative Pricing Engine:
- Create `apps/api/lib/pricing.js` exporting `priceOrder({ items, zoneKey, couponCode, paymentMethod, customer })`:
  1. Look up every product in DB inside transaction; verify `status: 'active'` and sufficient stock.
  2. Take the authoritative server unit price (`discount_price` when set and valid, else `regular_price`).
  3. Calculate subtotal and line items.
  4. Compute delivery charge via `apps/api/lib/delivery.js`.
  5. Return authoritative snapshot `{ items, subtotal, discount, deliveryCharge, totalAmount }`.
- Create `POST /api/cart/price`: Public rate-limited endpoint. Accepts cart items `[{ id, variantSku, quantity }]`, returns repriced lines, `inStock` flags, `maxQty`, and totals. (Used by storefront cart/checkout to refresh stale localStorage).
- Update `POST /api/order`: Run `priceOrder`. If the client-provided total differs from server-calculated total by more than 1 BDT, respond with `409 Conflict` `{ code: "PRICE_CHANGED", cart: <repricedItems>, total: <serverTotal> }` without creating the order.

Part 5.3 - Atomic Server Order Number Generator:
- Create `apps/api/app/models/Counter.js` with atomic `findOneAndUpdate({ _id: key }, { $inc: { seq: 1 } }, { upsert: true, new: true })`.
- Format order numbers as `MS-YYMMDD-######` (e.g. `MS-261022-000142`) resetting sequence daily or monotonically.
- Remove all client-side order number generation from `apps/web/utils/generateOrderNumber.js`. The server generates and owns the order number.

Part 5.4 - Checkout Idempotency & Concurrency:
- Create `apps/api/app/models/IdempotencyKey.js`: `key` (UUID String, unique index), `orderId`, `responseBody`, `createdAt` with 24-hour TTL index.
- In `POST /api/order`: Read `Idempotency-Key` header. If a completed order exists for this key, return the existing order record with `200 OK` without re-executing stock decrements or re-charging.
- Use MongoDB transactions (`session.withTransaction`) to decrement product inventory safely. If stock is insufficient, abort transaction and return `400 OUT_OF_STOCK`.

Verification & Delivery:
- Run `pnpm db:migrate-money` and verify product prices are numbers in MongoDB.
- Test tampered order payload (submitting 1 BDT for a 500 BDT item) and verify server returns 409 PRICE_CHANGED.
- Run `pnpm lint` and `pnpm build`.
- Commit all changes with message: `feat(step-5): money as numbers, authoritative server pricing, order numbers and idempotency`.
=== END PROMPT: STEP 5 ===
```

---

# 🚀 Step 6: Catalog Slugs, Reviews & Doctor Appointments

### 🎯 লক্ষ্য:
প্রোডাক্টের জন্য এসইও ফ্রেন্ডলি স্লাগ (`Product.slug`) তৈরি করা, সার্ভার-সাইড ক্যাটালগ সার্চ ও ফিল্টারিং API (`/api/catalog/products`), রিভিউ মডারেশন সিস্টেম এবং ডক্টর অ্যাপয়েন্টমেন্ট রিকুয়েস্ট ব্যাকএন্ড বাস্তবায়ন করা।

```markdown
=== BEGIN PROMPT: STEP 6 ===
Task: Implement Step 6 - Product Slugs, Server-Side Catalog API, Product Reviews with Moderation, and Doctor Appointments API.

Engineering Constraints:
1. Product URLs must support slugs (`/product/[slug]`). Old ObjectId URLs must be supported with 301 permanent redirects.
2. Escape all regex user input in product search to prevent ReDoS attacks.
3. Reviews must be moderated before appearing publicly; calculate verified purchase status.

Work in this strict order:
Part 6.1 - Product Slugs & Backward Compatibility:
- Add `slug` (unique, lowercase, slugified name with transliteration fallback) and `slugHistory[]` to `apps/api/app/models/product-model.js`.
- Write migration script `scripts/migrate-product-slugs.mjs` to generate unique slugs for all existing products.
- In `GET /api/shop/[id]`: Support querying by either MongoDB `_id` or `slug`. If queried by `_id`, include `slug` in response so web can 301 redirect.

Part 6.2 - Server-Side Catalog API:
- Create compound text indexes in `product-model.js` on `name`, `generic_name`, `manufacturer_name`, `tags`, and `slug`.
- Create `apps/api/app/api/catalog/products/route.js`:
  - Accepts query parameters: `q`, `category`, `brand`, `minPrice`, `maxPrice`, `inStock`, `rating`, `tags`, `sort` (relevance | newest | price_asc | price_desc | popular), `page`, `limit` (default 24, max 48).
  - Escapes all search strings. Excludes `deleted` and `inactive` products.
  - Returns `{ items, total, page, pages, facets: { categories, brands, priceRange } }`.
  - Excludes sensitive fields (`purchase_price`).
- Create `apps/api/app/api/catalog/suggest/route.js`: Returns top 8 autocomplete suggestions for products, categories, and brands with 30s cache.

Part 6.3 - Product Reviews with Moderation:
- Create `apps/api/app/models/Review.js`: `product` (Ref Product), `customer` (Ref CustomerProfile), `order` (optional Ref Order), `verifiedPurchase` (Boolean), `rating` (Number, 1-5), `title`, `body` (sanitized), `images[]`, `status` (pending | approved | rejected), `helpfulCount`, `moderation { by, at, note }`.
- Compound unique index: `{ product: 1, customer: 1 }` (one review per product per customer).
- Routes:
  - `POST /api/reviews`: Customer bearer auth, rate-limited. Checks if customer purchased this product on a delivered order to set `verifiedPurchase: true`. Status defaults to `pending`.
  - `GET /api/products/[idOrSlug]/reviews`: Public, returns only `approved` reviews, paginated, with rating distribution summary (1-5 star counts and average).
  - `POST /api/reviews/[id]/helpful`: Increments helpful count.
  - Staff: `GET /api/reviews` (filtered by status) and `PUT /api/reviews/[id]` (approve, reject, delete). Recomputes `Product.avgRating` and `reviewCount`.

Part 6.4 - Doctor Appointments Booking API:
- Create `apps/api/app/models/Appointment.js`: `doctor` (Ref Doctor), `patient { name, phone, age, gender, email }`, `preferredDate` (Date), `preferredSlot` (String), `notes`, `status` (requested | confirmed | rescheduled | completed | cancelled | no_show), `feeSnapshot { consultation, followUp }`, `source`, `staffNotes`, `history[]`.
- Routes:
  - `POST /api/appointments`: Public, rate-limited, BD phone validation (`apps/api/lib/phone.js`), verifies date is not in past, verifies doctor is active and available on that day of week. Sends confirmation email to patient and admin.
  - `GET /api/appointments/[id]?phone=`: Patient lookup endpoint for appointment status.
  - Staff: `GET /api/appointments` (filters: doctor, status, date range) and `PUT /api/appointments/[id]` (update status, reschedule, add notes).

Verification & Delivery:
- Run `pnpm db:migrate-product-slugs` and verify slugs are generated.
- Test `GET /api/catalog/products?q=paracetamol` returns faceted JSON.
- Test appointment creation endpoint with valid BD phone.
- Run `pnpm lint` and `pnpm build`.
- Commit all changes with message: `feat(step-6): product slugs, server catalog api, reviews moderation and doctor appointments`.
=== END PROMPT: STEP 6 ===
```

---

# 🚀 Step 7: Returns, Coupons, Variants & Bilingual Content

### 🎯 লক্ষ্য:
কাস্টমার রিটার্ন ও রিফান্ড রিকুয়েস্ট (`ReturnRequest`), গেস্ট অর্ডার ট্র্যাকিং (`/track-order`), ডিসকাউন্ট কুপন সিস্টেম (`Coupon`), প্রোডাক্ট ভ্যারিয়েন্ট ও ইনভেন্টরি স্টক ট্র্যাকিং (`StockMovement`), উইশলিস্ট ডাটাবেস সিঙ্ক, বাংলা-ইংরেজি ভাষা এবং প্রাইভেসি রিকুয়েস্ট সম্পন্ন করা।

```markdown
=== BEGIN PROMPT: STEP 7 ===
Task: Implement Step 7 - Returns & Refunds, Guest Tracking, Coupons Engine, Product Variants, Stock Movements, Wishlist Sync, and Bilingual Support.

Engineering Constraints:
1. Coupon redemption must be atomic inside the checkout transaction to prevent race conditions.
2. Stock adjustments must write through `StockMovement` audit logs.
3. Bilingual support must fall back gracefully to English if Bangla is missing.

Work in this strict order:
Part 7.1 - Customer Returns & Refunds API:
- Extend Order status enum with `returned` and `partially_returned`; payment status with `refunded` and `partially-refunded`.
- Create `apps/api/app/models/ReturnRequest.js`: `order`, `customer`, `items[{ productId, variantSku, quantity, reason }]`, `reason` (damaged | wrong_item | not_as_described | expired | other), `notes`, `images[]`, `status` (requested | approved | rejected | received | refunded | closed), `refund { method, amount, reference, processedBy, processedAt }`, `history[]`.
- Routes: `POST /api/returns` (customer token; delivered orders within return window), `GET /api/returns` (customer own / staff all), staff `PUT /api/returns/[id]` (approve, reject, receive, refund). If received, optional restock via StockMovement.

Part 7.2 - Guest Order Tracking Endpoint:
- Create `POST /api/orders/track`: Public rate-limited (10/min per IP). Accepts `{ orderNumber, phone }`.
- Returns sanitized order timeline, items, totals, delivery status, courier tracking link/code. Returns generic 404 for any mismatch without revealing whether the order exists.
- Create `GET /api/orders/track/status-map` returning status labels and colors.

Part 7.3 - Coupons Engine:
- Create `apps/api/app/models/Coupon.js`: `code` (unique, uppercase), `type` (percent | fixed | free_shipping), `value` (Number), `maxDiscount`, `minSubtotal`, `usageLimit`, `perCustomerLimit`, `usedCount`, `startsAt`, `endsAt`, `applicableCategories[]`, `applicableBrands[]`, `excludedProducts[]`, `status` (active | inactive).
- Create `apps/api/app/models/CouponRedemption.js` recording `{ coupon, order, customer, phone, discountAmount, redeemedAt }`.
- Create `POST /api/coupons/validate`: Public rate-limited endpoint. Tests coupon against cart items and subtotal; returns discount breakdown or human error reason.
- Wire coupon calculation inside `apps/api/lib/pricing.js` and record redemption inside `POST /api/order` transaction.

Part 7.4 - Product Variants & Stock Movement History:
- Extend `Product` model additively: `sku` (sparse unique), `variants[{ sku, label, attributes { packSize, color, strength }, regularPrice, discountPrice, stock, image, status }]`, `lowStockThreshold`.
- Create `apps/api/app/models/StockMovement.js`: `product`, `variantSku`, `delta` (Number), `reason` (order | cancel | return | adjustment | restock), `reference`, `balanceAfter`, `by`, `at`.
- In order creation and cancellation: create corresponding `StockMovement` records transactionally.
- Create staff routes: `POST /api/stock/adjust`, `GET /api/stock/movements`, and `GET /api/stock/low`.

Part 7.5 - Wishlist DB Sync & Customer Privacy Requests:
- Add `wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]` to `CustomerProfile`.
- Create `GET|PUT /api/me/wishlist` and `POST /api/me/wishlist/merge` (merges guest localStorage wishlist into DB on login).
- Create `apps/api/app/models/DataRequest.js`: `customer`, `type` (export | delete), `status`, `downloadUrl`, `createdAt`.
- Create customer endpoints `POST /api/me/data-requests` and staff processing endpoints.

Part 7.6 - Bilingual Content Support:
- Create `apps/api/lib/i18n.js`: Localized field helper returning `{ en, bn }`.
- Add Bangla fields to CMS models (`SiteSettings`, `Page`, `Category`, `Brand`, `Product.specificationsHtmlBangla`).
- API routes accept `?lang=bn|en` query parameter and return resolved strings with fallback to English.

Verification & Delivery:
- Test coupon validation endpoint with a sample seeded coupon.
- Test guest order tracking with a seeded order number and phone.
- Run `pnpm lint` and `pnpm build`.
- Commit all changes with message: `feat(step-7): returns, coupons engine, product variants, stock movements and bilingual support`.
=== END PROMPT: STEP 7 ===
```

---

# 🚀 Step 8: Admin Dashboard Core & Catalog UI

### 🎯 লক্ষ্য:
অ্যাডমিন ড্যাশবোর্ডের হোমপেজে লাইভ অ্যানালিটিক্স চার্ট ও লো-স্টক অ্যালার্ট সক্রিয় করা, অর্ডার ম্যানেজমেন্টে এক-ক্লিকে কুরিয়ার বুকিং ও ম্যানুয়াল পেমেন্ট ভেরিফিকেশন প্যানেল তৈরি করা এবং ক্যাটালগ (প্রোডাক্ট, ভ্যারিয়েন্ট, ইনভেন্টরি স্টক অ্যাডজাস্টমেন্ট) পূর্ণাঙ্গ করা।

```markdown
=== BEGIN PROMPT: STEP 8 ===
Task: Implement Step 8 - Admin Dashboard Live Analytics, Orders with Courier Booking, Catalog with Variants, and Inventory Management.

Engineering Constraints:
1. Admin app is Next.js 14.2 / React 18. Use RTK Query slices in `apps/admin/store/slices/`.
2. Use the Step 1 UI Kit and design tokens exclusively. No ad-hoc styling.
3. Every screen must handle Loading skeletons, Empty states, and Error states with retry.

Work in this strict order:
Part 8.1 - Live Dashboard Analytics (`apps/admin/app/(dashboard)/dashboard/page.js`):
- Create `apps/api/app/api/analytics/summary/route.js`: Returns totals (orders, revenue, AOV, new customers, units sold), percentage delta vs previous period, status breakdown, revenue time series chart data, top products, low stock items, and recent 10 orders.
- Rebuild `dashboard/page.js`:
  - KPI Cards (Total Revenue, Total Orders, Active Customers, Low Stock Alert) with delta badges.
  - Revenue Area/Bar Chart using Recharts with design tokens.
  - Order Status Donut Chart.
  - Low-stock inventory table with quick links to restock.
  - Recent orders table with status badges and quick view drawer.
  - Date range filter (Last 7 days, 30 days, 90 days, Year to date).

Part 8.2 - Orders & Courier Booking Management (`apps/admin/app/(dashboard)/dashboard/orders/`):
- Order List: Server-side pagination, status filter tabs (All, Pending, Confirmed, Shipped, Delivered, Cancelled, Returned), search by order number/phone/customer name, CSV export.
- Order Details Page (`orders/[orderId]`):
  - Customer info, delivery zone, and shipping address.
  - Itemized products list with unit prices and totals.
  - **Courier Booking Panel:** Select active courier (Pathao, Steadfast, RedX), click "Book Courier", generates consignment ID & tracking URL, copy tracking link, refresh courier status.
  - **Payment Verification Panel:** For Manual MFS, displays submitted TrxID, sender phone, and one-click "Verify & Mark as Paid" button.
  - Order cancellation modal with automatic restock action.
  - Printable Invoice / Voucher Modal powered by `SiteSettings` branding.

Part 8.3 - Catalog: Products, Categories, Brands (`apps/admin/app/(dashboard)/dashboard/products/`, `category/`, `brands/`):
- Products List: Server table with thumbnail, title, category, brand, price, variant count, stock badge, and status toggle.
- Product Form (`products/new`, `products/[id]`):
  - Basic details, SEO title/description, Bangla translation tab.
  - Media uploader with Cloudinary drag-and-drop and primary image selection.
  - **Variants Editor:** Add/remove variants (SKU, pack size, color, regular price, discount price, stock count).
  - Rich text description editor.
- Categories & Brands: Data table, image/logo upload, featured toggle, drag reorder handle, slug preview. Delete protection if products exist.

Part 8.4 - Inventory & Stock Movements (`apps/admin/app/(dashboard)/dashboard/inventory/`):
- New Inventory screen listing all products and variant SKUs.
- Filter by "Low Stock" and "Out of Stock".
- Quick Stock Adjustment Dialog (enter delta +/- number, select reason: restock/adjustment/damaged, optional note).
- Stock movement history audit log drawer.

Verification & Delivery:
- Test dashboard analytics rendering live MongoDB data.
- Test courier booking panel on a sample order.
- Verify both light and dark themes on all created screens.
- Run `pnpm lint` and `pnpm build`.
- Commit all changes with message: `feat(step-8): dashboard analytics, orders courier booking, catalog variants and inventory`.
=== END PROMPT: STEP 8 ===
```

---

# 🚀 Step 9: Admin Dashboard CMS & Integration Hub UI

### 🎯 লক্ষ্য:
ড্যাশবোর্ডে ডেলিভারি জোন ও রেট কন্ট্রোল স্ক্রিন তৈরি করা, ইন্টিগ্রেশন হাব UI (পেমেন্ট গেটওয়ে, কুরিয়ার ও ইমেইল ক্রেডেনশিয়াল সেটআপ), CMS পেজ ও মেনু বিল্ডার, রিভিউ মডারেশন কিউ এবং কুপন ম্যানেজমেন্ট স্ক্রিন সম্পন্ন করা।

```markdown
=== BEGIN PROMPT: STEP 9 ===
Task: Implement Step 9 - Admin Dashboard Delivery Zones UI, Integration Hub UI, CMS Content Builders, Reviews Moderation, and Coupons.

Engineering Constraints:
1. Super-admin role required to update sensitive integration secrets. Masked values must be shown (`****last4`).
2. Provide a "Test Connection" button on integration forms with clear feedback.
3. Every CMS update must trigger instant preview and cache invalidation.

Work in this strict order:
Part 9.1 - Delivery Zones Management (`apps/admin/app/(dashboard)/dashboard/delivery/`):
- Data table of delivery zones (label, charge BDT, free-shipping threshold, ETA, COD status, active toggle, default marker).
- Add/Edit Zone Drawer: Zone label, slug, delivery charge (BDT), free shipping threshold, ETA days, COD toggle, allowed payment methods, district/area coverage picker.
- **Delivery Quote Tester:** Interactive calculator inside dashboard (select zone + enter subtotal + select payment method -> displays exact customer quote using `POST /api/delivery/quote`).

Part 9.2 - Integration Hub UI (`apps/admin/app/(dashboard)/dashboard/integrations/`):
- Integration Hub Grid: Cards grouped by category (Payments, Couriers, Email, Tracking, Media).
- Status pill per card (Not Configured, Configured, Connected, Error) and enabled toggle.
- Configuration Drawer per provider:
  - Form generated from provider schema with help text on where to find credentials.
  - Secret fields masked with "Replace" button.
  - Sandbox / Live mode switch with safety alert.
  - Webhook & Callback URLs with one-click copy buttons.
  - **"Test Connection" button:** Calls `POST /api/integrations/[key]/test` and displays live connection result.
- Payments tab: Drag to reorder checkout payment methods, customize customer display label and instructions.

Part 9.3 - CMS Screens (Sidebar Group "Content"):
- `dashboard/cms/settings`: Tabs for General, Contact, Social Links, SEO, Announcement Bar, Maintenance Mode.
- `dashboard/cms/menus`: Tree builder for Header, Footer columns, and Mobile menus with drag-and-drop reordering.
- `dashboard/cms/pages`: Page builder with title, slug, template picker, block editor, rich-text editor, and SEO settings.
- `dashboard/cms/faqs`: FAQ groups and question-answer management with drag reorder.
- `dashboard/cms/home-layout`: Enable/disable and reorder homepage sections.
- `dashboard/cms/media`: Cloudinary media library grid with drag-and-drop upload, search, copy URL, and delete.

Part 9.4 - Reviews Moderation, Appointments & Coupons UI:
- `dashboard/reviews`: Moderation queue with Pending, Approved, and Rejected tabs. View customer review text, rating, verified purchase badge, and one-click Approve / Reject actions.
- `dashboard/appointments`: Doctor appointments list and day-calendar view. Filter by doctor and date. Actions to Confirm, Reschedule, or Cancel appointment.
- `dashboard/coupons`: Coupons table, Add/Edit Coupon form (code, type, value, expiry date, usage limit, minimum order).

Part 9.5 - Profile & Security:
- `dashboard/profile`: Staff name, phone, email (read-only), avatar upload, and theme preference.
- `dashboard/profile/security`: Change password form with current password verification.

Verification & Delivery:
- Test saving delivery zones and verify in quote calculator.
- Test opening Integration Hub drawer and mask behavior.
- Test approving a review in the reviews queue.
- Run `pnpm lint` and `pnpm build`.
- Commit all changes with message: `feat(step-9): dashboard delivery zones, integration hub ui, cms builders, reviews and coupons`.
=== END PROMPT: STEP 9 ===
```

---

# 🚀 Step 10: Storefront Shell & Dynamic CMS Homepage

### 🎯 লক্ষ্য:
স্টোরফ্রন্টের হেডার ও ফুটার সম্পূর্ণ CMS ও API ড্রাইভেন করা, ডার্ক মোড টগল যুক্ত করা, ব্যানার স্লাইডারকে প্রিমিয়াম ইমেজ-অনলি স্লাইডারে রূপান্তর করা, ব্র্যান্ড স্লাইডার এবং হোমপেজের সকল সেকশন ডাটাবেস ড্রাইভেন করা।

```markdown
=== BEGIN PROMPT: STEP 10 ===
Task: Implement Step 10 - Storefront Shell with CMS Bootstrap, Dark Mode, Pure Image Hero Slider, and Dynamic Home Layout.

Engineering Constraints:
1. Storefront is Next.js 15.1 / React 19. Await `params` and `searchParams`.
2. Zero hardcoded content: Logo, contact phone, social links, menus, and footer copy MUST come from CMS bootstrap (`/api/cms/bootstrap`).
3. Hero slider must contain ONLY banner images (no overlaid text or buttons) with zero layout shift.

Work in this strict order:
Part 10.1 - CMS Bootstrap & Storefront Shell:
- Create `apps/web/lib/cms.js` with cached helper `getSiteBootstrap()` fetching `/api/cms/bootstrap` (returns site settings, header/footer menus, active delivery zones, and enabled payment methods).
- Rebuild Header (`apps/web/app/components/navigationBar/`):
  - Dynamic logo (light and dark mode versions from settings).
  - Search input with debounced autocomplete suggestions calling `/api/catalog/suggest`.
  - Dynamic navigation menu rendered from `Menu(header)`. Remove dead items (Blog, Elements, Features).
  - Support & contact chip displaying real phone number from `SiteSettings.contact.phone`.
  - Accessible Dark/Light theme toggle button in header and mobile drawer.
  - Cart and wishlist live count badges.
  - Customer account dropdown (Profile, Orders, Logout).
- Rebuild Footer (`apps/web/app/components/footer/`):
  - About copy from settings, dynamic menu columns from `Menu(footer-1..4)`, dynamic social links, accepted payment badges based on enabled gateways, and dynamic copyright year. Purge `siteInfo.js` hardcoded content.

Part 10.2 - Pure Image Hero Slider & Layout:
- In `apps/web/app/components/home/hero/`:
  - Rebuild `HeroSlider.js`: Image-only slider with aspect-ratio box (no layout shift). `next/image` with `priority` on first slide.
  - Remove all text overlays, headers, and action buttons from slides.
  - Each slide links to its configured product/category/URL.
  - Autoplay with pause on hover, touch swipe support, and arrow/dot controls.
  - Fix desktop category rail layout to prevent any visual overlap with hero banner.

Part 10.3 - Dynamic Home Sections (`apps/web/app/page.js`):
- Fetch `GET /api/cms/home` to render configured sections in their exact order:
  - **Shop by Brand:** Swiper slider of featured brand logos with links to `/shop?brand=<slug>`.
  - **Categories Grid:** Dynamic category tiles with images.
  - **Product Rails:** Best Deals, Trending, Featured, and Offers rails using premium `ProductCard` (hover image swap, discount badge, rating, wishlist heart, add to cart button).
  - **Banner Grids:** Dynamic home banners (`home-grid-1`, `home-grid-2`).
  - **Testimonials:** Verified customer reviews slider.
  - **Newsletter:** Subscribe form wired to `POST /api/newsletter` with toast feedback.
- Add Suspense boundaries with skeleton loaders for below-the-fold sections.

Verification & Delivery:
- Verify storefront header and footer in both Light and Dark modes.
- Test search suggestions dropdown in header.
- Verify zero console errors and no layout shifts on mobile and desktop.
- Run `pnpm lint` and `pnpm build`.
- Commit all changes with message: `feat(step-10): storefront cms shell, dark mode, image hero slider and dynamic home layout`.
=== END PROMPT: STEP 10 ===
```

---

# 🚀 Step 11: Storefront Catalog & Dynamic Checkout

### 🎯 লক্ষ্য:
সার্ভার-সাইড শপ পেজ (`/shop`), এসইও ফ্রেন্ডলি প্রোডাক্ট পেজ (`/product/[slug]`) ভ্যারিয়েন্ট ও রিভিউ সহ এবং ডায়নামিক চেকআউট (লাইভ ডেলিভারি জোন কোট ও গেটওয়ে পেমেন্ট) বাস্তবায়ন করা।

```markdown
=== BEGIN PROMPT: STEP 11 ===
Task: Implement Step 11 - Server-Driven Shop, SEO Slug Product Pages with Variants & Reviews, and Dynamic Checkout with Delivery Quotes.

Engineering Constraints:
1. Checkout MUST fetch live delivery zones and calculate delivery quote via `POST /api/delivery/quote`. NEVER hardcode delivery charges in client.
2. Checkout sends `Idempotency-Key` header and handles `409 PRICE_CHANGED` by prompting customer to accept updated prices.
3. Support product URLs by slug (`/product/[slug]`); redirect old ObjectId URLs with 301.

Work in this strict order:
Part 11.1 - Server-Driven Shop (`apps/web/app/shop/page.js`):
- Rebuild `/shop` to fetch from `GET /api/catalog/products`:
  - Responsive filter sidebar: Categories, Brands, Price range slider, In-stock toggle, Rating filter.
  - Sort dropdown: Relevance, Newest, Price (Low to High), Price (High to Low).
  - URL-synced search params (`?category=...&brand=...&sort=...&page=...`).
  - Server-side pagination with active page numbers and total count.
  - Empty state with clear filters button.
- Rebuild `/offer`, `/trending`, `/best-seller` using the same listing component.

Part 11.2 - SEO Slug Product Page (`apps/web/app/product/[slug]/page.js`):
- Dynamic route `/product/[slug]`:
  - If requested with an ObjectId, fetch product and redirect with `redirect(/product/${product.slug}, 'permanent')`.
  - Image gallery with zoom and mobile swipe.
  - Authoritative price display with savings calculation.
  - **Variant Selector:** Pack size, color, and strength chips updating live price, stock status, and image.
  - Quantity stepper with stock limits.
  - Add to Cart and Buy Now actions (cart items store `variantSku`).
  - Delivery estimate box displaying cheapest active zone charge and ETA.
  - Product tabs: Description, Specifications, and **Customer Reviews tab** (rating distribution, approved reviews list, and review submit form for verified buyers).
  - JSON-LD structured metadata (`Product` schema with price and ratings).

Part 11.3 - Dynamic Cart & Re-pricing:
- In `apps/web/app/cart/`:
  - On cart load and item quantity change, call `POST /api/cart/price` to refresh prices from the server.
  - If any price changed, display prominent notice ("Price updated to reflect current catalog").
  - Out of stock items flagged with remove action.
  - Coupon code input field with "Apply" button connected to `POST /api/coupons/validate`. Displays applied discount and free delivery if applicable.

Part 11.4 - Dynamic Checkout & Order Placement (`apps/web/app/checkout/page.js`):
- Delivery Area Selector: Renders dynamic options from `GET /api/delivery/zones` (displays label, charge BDT, and ETA). Shows district/area coverage dropdowns when zone specifies coverage.
- Call `POST /api/delivery/quote` on zone selection or subtotal change to display authoritative delivery charge and "Add X more for free delivery" indicator.
- Payment Methods: Render dynamically from `/api/public/config`.
  - If COD is selected, disable with alert if zone does not allow COD.
  - If Manual MFS is selected, display configured payment number, instructions, and TrxID input field.
- Submit Order:
  - Generates UUID `Idempotency-Key` header.
  - Calls `POST /api/order`.
  - Handles `409 PRICE_CHANGED` by showing price change confirmation dialog.
  - On online payment: redirects to gateway payment URL.
  - On COD / success: redirects to `/complete-order?orderId=...`.

Verification & Delivery:
- Test navigating to a product via slug and switching variants.
- Test changing delivery zones in checkout and verify live quote calculation.
- Run `pnpm lint` and `pnpm build`.
- Commit all changes with message: `feat(step-11): server-driven shop, slug product pages with variants and dynamic checkout`.
=== END PROMPT: STEP 11 ===
```

---

# 🚀 Step 12: Storefront Services, Hardcode Purge & Crawler

### 🎯 লক্ষ্য:
ডক্টর কনসাল্টেশন বুকিং ফ্লো (`/consultation`), গেস্ট অর্ডার ট্র্যাকিং (`/track-order`), কাস্টমার অ্যাকাউন্ট পোর্টাল (অর্ডার হিস্ট্রি, রিটার্ন রিকুয়েস্ট, উইশলিস্ট সিঙ্ক), বাংলা/ইংরেজি ভাষা পরিবর্তন এবং সম্পূর্ণ কোডবেস থেকে সব হার্ডকোড কনটেন্ট মুছে ক্রলার স্ক্রিপ্ট রান করা।

```markdown
=== BEGIN PROMPT: STEP 12 ===
Task: Implement Step 12 - Doctor Appointment Booking Flow, Guest Order Tracking, Customer Account Portal, Bilingual Toggle, and Hardcode Purge with Route Crawler.

Engineering Constraints:
1. Replace static `/visit/checkout` dummy form with real appointment booking flow connected to `/api/appointments`.
2. Purge every hardcoded phone, email, and dummy URL from storefront code.
3. Create `scripts/crawl-web.mjs` verifying that all storefront routes return HTTP 200 with zero console errors.

Work in this strict order:
Part 12.1 - Doctor Consultation Directory & Appointment Request:
- `/consultation`: Dynamic department grid from CMS `Department` collection.
- `/consultation/[deptName]` and `/consultation/doctor`: Real doctor directory with department filter and search.
- Doctor Card & Profile (`/doctors/[doctorId]`): Doctor info, qualification, fees, available days, and "Request Appointment" CTA.
- Rebuild `/visit/checkout` (and `/appointment/book`): Validated appointment request form (patient name, BD phone, age, gender, preferred date based on doctor availability, slot, notes). Submits to `POST /api/appointments`, redirects to confirmation page with reference code.
- Create `/appointment/status`: Lookup page by appointment reference and phone.

Part 12.2 - Guest Order Tracking (`apps/web/app/track-order/page.js`):
- New page `/track-order`: Input fields for Order Number (`MS-...`) and Phone number.
- Calls `POST /api/orders/track`.
- Displays visual order timeline (Placed, Confirmed, Shipped, Delivered), item list, payment status, and courier tracking link.

Part 12.3 - Customer Account Portal (`apps/web/app/account/`):
- Account Dashboard: Profile edit, default shipping address.
- Orders List & Details (`account/orders/[orderId]`): Order timeline, live shipment tracking link, and printable invoice.
- **Request Return Button:** On delivered orders within return window, opens return request modal (select items, quantity, reason, upload photo).
- Wishlist: On login, automatically merge guest `localStorage` wishlist into server via `POST /api/me/wishlist/merge`.
- Privacy Section: "Download My Data" and "Delete Account" requests.

Part 12.4 - Bilingual Support (English / Bangla):
- Create `apps/web/lib/ui-text.js` with dictionary of UI strings for English and Bangla.
- Header language toggle (EN / BN) that stores choice in a cookie (`lang`).
- Format prices and numbers using `Intl.NumberFormat('bn-BD')` when Bangla is active.
- Load Bangla font (`Noto Sans Bengali` or `Hind Siliguri`) only when Bangla is selected.

Part 12.5 - Hardcode Purge & Route Crawler:
- Inspect and remove all hardcoded strings:
  - Phone numbers (01711-655686 etc.) must come from `SiteSettings`.
  - Static policy texts in About, FAQ, Privacy, Terms, and Refund pages replaced with CMS-rendered Page blocks (`app/(content)/[slug]/page.js`).
  - Delivery charge literals (60, 90, 120) purged from all web components.
- Create `scripts/crawl-web.mjs`: Script that crawls all internal storefront URLs, verifying HTTP 200, no 404s, no `undefined|NaN|[object Object]` text, and correct `<title>` tags. Add script command `pnpm crawl:web`.

Verification & Delivery:
- Run `node scripts/crawl-web.mjs` and confirm all routes pass.
- Test appointment booking submission.
- Run `pnpm lint` and `pnpm build`.
- Commit all changes with message: `feat(step-12): doctor booking flow, guest tracking, account portal, bilingual switch and hardcode purge`.
=== END PROMPT: STEP 12 ===
```

---

# 🚀 Step 13: Operations Readiness (DevOps, Testing & Security)

### 🎯 লক্ষ্য:
Playwright এন্ড-টু-এন্ড (E2E) টেস্ট স্যুট তৈরি করা, GitHub Actions CI ওয়ার্কফ্লো, Pino স্ট্রাকচার্ড লগিং, সেন্ট্রি এরর ট্র্যাকিং, ডাটাবেস-ব্যাকড সেশন রিভোকেশন (`StaffSession`), মোঙ্গোডিবি TTL রেট লিমিটিং, সিকিউরিটি হেডার এবং অটোমেটেড ডাটাবেস ব্যাকআপ/রিস্টোর স্ক্রিপ্ট বাস্তবায়ন করা।

```markdown
=== BEGIN PROMPT: STEP 13 ===
Task: Implement Step 13 - Operations Readiness: Automated E2E Tests, CI Pipeline, Structured Logging, Session Revocation, Durable Rate Limiting, and Backup Drills.

Engineering Constraints:
1. Run Step 13 before Step 14 (Final QA).
2. Tests must use a dedicated test database (`memservice_test`) and mock external payment/courier APIs so runs are deterministic.
3. NEVER commit real production secrets or `.env` files to git.

Work in this strict order:
Part 13.1 - End-to-End Automated Tests:
- Install Playwright and create `playwright.config.js` at root. Add script `pnpm test:e2e`.
- Write automated test suites:
  - `tests/storefront.spec.js`: Home sections render, search and filter catalog, add product with variant to cart, coupon application, checkout COD order with delivery zone, guest order tracking.
  - `tests/dashboard.spec.js`: Email login for roles, CRUD operations on products/categories/delivery zones, order status changes, courier booking stub.
  - `tests/api-auth.spec.js`: Auth matrix verifying 401/403/200 on all staff routes.

Part 13.2 - GitHub Actions CI Pipeline:
- Create `.github/workflows/ci.yml`:
  - Triggers on push and pull request to `main`.
  - Jobs: Setup Node.js -> pnpm install -> MongoDB service container (replica set `rs0`) -> `pnpm lint` -> `pnpm test:api` -> `pnpm build` -> `pnpm test:e2e` -> `pnpm audit --audit-level=high`.
- Add `.github/dependabot.yml` for automated dependency updates.

Part 13.3 - Structured Logging & Health Endpoints:
- Replace `console.log` in `apps/api` with structured JSON logging using `pino`. Automatically redact passwords, tokens, and payment secrets.
- Add Sentry error tracking wrappers for `apps/web`, `apps/admin`, and `apps/api` (enabled when `SENTRY_DSN` is present).
- Create `GET /api/health/ready`: Checks MongoDB ping, replica set status, and required environment variables; returns 200 OK or 503 Service Unavailable.

Part 13.4 - Database-Backed Staff Session Revocation:
- Create `apps/api/app/models/StaffSession.js`: `jti` (unique UUID), `user`, `ip`, `userAgent`, `createdAt`, `lastSeenAt`, `revokedAt`.
- JWT tokens issued to staff carry `jti`. `apps/api/middleware.js` validates that session is not revoked.
- When an admin user is deactivated or role changed, immediately revoke all active sessions.
- In Admin profile, implement "Sign out everywhere" and active sessions list.

Part 13.5 - MongoDB TTL Durable Rate Limiter:
- Move `apps/api/lib/rateLimit.js` from in-memory to MongoDB TTL collection (`RateLimitBucket`).
- Ensures rate limiting persists across API server restarts and works in multi-instance clusters.
- Return `Retry-After` header when limit is exceeded (HTTP 429).

Part 13.6 - Security Headers & Credential Hygiene:
- Add security headers to `next.config.mjs` in all apps: HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and Content-Security-Policy (CSP).
- Create `docs/secrets-rotation.md`: Step-by-step guide for rotating MongoDB, bKash, Cloudinary, Resend, and `SETTINGS_ENCRYPTION_KEY` credentials without downtime.
- Add pre-commit hook preventing committing `.env*` or secret patterns.

Part 13.7 - Automated Database Backup & Restore:
- Create `scripts/backup-db.mjs` (`pnpm db:backup`): Generates compressed `mongodump` archive with timestamp into `backups/`.
- Create `scripts/restore-db.mjs` (`pnpm db:restore <file>`): Restores archive to target URI with safety confirmation.

Verification & Delivery:
- Run `pnpm test:api` and `pnpm test:e2e`.
- Run `pnpm db:backup` and verify backup archive is created.
- Run `pnpm lint` and `pnpm build`.
- Commit all changes with message: `feat(step-13): operations readiness, e2e tests, ci pipeline, session revocation and durable rate limiting`.
=== END PROMPT: STEP 13 ===
```

---

# 🚀 Step 14: Final QA, Security Review & Go-Live Checklist

### 🎯 লক্ষ্য:
সম্পূর্ণ সিস্টেমের এন্ড-টু-এন্ড কোয়ালিটি নিশ্চিত করা, সিকিউরিটি অডিট ও রেজিলিয়েন্স টেস্ট সম্পন্ন করা এবং প্রোডাকশন VPS ডিপ্লয়মেন্ট গাইডলাইন প্রস্তুত করা।

```markdown
=== BEGIN PROMPT: STEP 14 ===
Task: Implement Step 14 - Final QA, Security Review, Resilience Verification, and Production Go-Live Checklist.

Engineering Constraints:
1. Every automated check must pass without errors or warnings.
2. Report results honestly: explicitly document any feature that requires real merchant credentials for live validation.

Work in this strict order:
Part 14.1 - Clean-Room Installation & Build Verification:
- Run full clean build:
  1. `pnpm install`
  2. `pnpm db:up`
  3. `pnpm db:migrate`
  4. `pnpm db:seed`
  5. `pnpm health`
  6. `pnpm lint`
  7. `pnpm build`
  8. `pnpm test:api`
  9. `pnpm test:e2e`
  10. `pnpm crawl:web`
- Confirm all commands exit with code 0.

Part 14.2 - Security & Resilience Verification:
- Review API routes for IDOR, auth bypass, CSRF, and SQL/NoSQL injection vulnerabilities.
- Confirm price tampering test: modifying checkout payload prices is rejected by server.
- Test failure resilience: simulate MongoDB disconnect and API stoppage; verify storefront and dashboard show graceful error states instead of white-screen crashes.

Part 14.3 - Production Go-Live Documentation:
- Create `docs/go-live-checklist.md`:
  - Production environment variables list (`.env.production`).
  - Domain, SSL (Let's Encrypt / Cloudflare), and Nginx reverse proxy configuration for web (3000), api (3001), admin (3002).
  - Production Docker Compose configuration.
  - Merchant onboarding guide: how to switch bKash, Nagad, SSLCommerz, Pathao, and Resend from sandbox to live.
- Create `docs/QA-REPORT.md`: Matrix of gaps G1-G22 with status (all marked CLOSED), test evidence, and final handover notes.

Part 14.4 - Final Clean Commit:
- Update `README.md` and Part 0 of `docs/implement-phase.md` to reflect the 100% completed system.
- Commit all changes with message: `chore(step-14): final qa verification, security audit and production go-live documentation`.
=== END PROMPT: STEP 14 ===
```

---

## 💡 পরবর্তী পদক্ষেপ (Next Action):
এখন আপনি শুধু বলবেন: **"Step 1 শুরু করো"**, এবং আমি সরাসরি **Step 1** এর কাজ শুরু করে দেব!
