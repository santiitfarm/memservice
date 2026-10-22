# 📚 Memservice CMS & Delivery API Documentation

This document covers the Content Management System (CMS), Delivery Pricing Engine, and Secure Integrations Store APIs implemented in Step 2.

---

## 1. Authentication & Access Matrix

All requests pass through `apps/api/middleware.js`. Role ranks:
- `manager`: Rank 1 (Staff read/write for catalog operations)
- `admin`: Rank 2 (Administrative access, CMS configuration, Delivery zones)
- `super-admin`: Rank 3 (Master administrative access, Integration credentials & API keys)

| Endpoint | Method | Public / Staff | Min Rank | Description |
|---|---|---|---|---|
| `/api/cms/bootstrap` | `GET` | Public | None | Fast initial render payload: site settings + menus + active delivery zones |
| `/api/cms/site` | `GET` | Public | None | Site settings (brand, contacts, header/footer configuration) |
| `/api/cms/site` | `PUT` | Staff | 2 (Admin) | Update singleton site settings |
| `/api/cms/menus` | `GET` | Staff | 1 (Manager) | List all menus for management UI |
| `/api/cms/menus/:location` | `GET` | Public | None | Get menu items by location (`header`, `footer-1`, etc.) |
| `/api/cms/menus/:location` | `PUT` | Staff | 2 (Admin) | Save menu items with URL safety & depth ≤ 2 checks |
| `/api/cms/pages` | `GET` | Staff | 1 (Manager) | List all pages (published and draft) |
| `/api/cms/pages` | `POST` | Staff | 2 (Admin) | Create new CMS page (server sanitizes rich text) |
| `/api/cms/pages/:slug` | `GET` | Public/Staff | None | Public returns published; Staff can inspect draft |
| `/api/cms/pages/:slug` | `PUT` | Staff | 2 (Admin) | Update page content and SEO |
| `/api/cms/pages/:slug` | `DELETE` | Staff | 2 (Admin) | Delete page |
| `/api/cms/home` | `GET` | Public | None | Resolves sliders, categories, brands, banners, and layout in 1 query |
| `/api/cms/home` | `PUT` | Staff | 2 (Admin) | Update home layout section order and configs |
| `/api/cms/faqs` | `GET` | Public | None | List active FAQs (or `?all=true` for staff) |
| `/api/cms/faqs` | `POST` | Staff | 2 (Admin) | Create FAQ |
| `/api/cms/faqs/:id` | `PUT/DELETE` | Staff | 2 (Admin) | Update or remove FAQ |
| `/api/cms/faq-groups` | `GET` | Public | None | List FAQ categories/groups |
| `/api/cms/faq-groups` | `POST` | Staff | 2 (Admin) | Create FAQ group |
| `/api/cms/faq-groups/:id` | `PUT/DELETE` | Staff | 2 (Admin) | Update or remove FAQ group |
| `/api/cms/departments` | `GET` | Public | None | List active consultation departments |
| `/api/cms/departments` | `POST` | Staff | 2 (Admin) | Create consultation department |
| `/api/cms/departments/:id` | `PUT/DELETE` | Staff | 2 (Admin) | Update or remove department |
| `/api/cms/testimonials` | `GET` | Public | None | List patient testimonials |
| `/api/cms/testimonials` | `POST` | Staff | 2 (Admin) | Create testimonial |
| `/api/cms/testimonials/:id` | `PUT/DELETE` | Staff | 2 (Admin) | Update or remove testimonial |
| `/api/delivery/zones` | `GET` | Public | None | List active delivery zones (`?all=true` for staff) |
| `/api/delivery/zones` | `POST` | Staff | 2 (Admin) | Create delivery zone |
| `/api/delivery/zones/:id` | `PUT/DELETE` | Staff | 2 (Admin) | Update or remove delivery zone |
| `/api/delivery/quote` | `POST` | Public | None | Single source of truth calculation for delivery charge & free shipping |
| `/api/integrations` | `GET` | Staff | 2 (Admin) | List integrations with masked secrets |
| `/api/integrations` | `POST` | Staff | 3 (Super-Admin) | Register new integration with encrypted secrets |
| `/api/integrations/:key` | `GET` | Staff | 2 (Admin) | Get integration with masked secrets |
| `/api/integrations/:key` | `PUT` | Staff | 3 (Super-Admin) | Update secrets (AES-256-GCM) and mode |
| `/api/public/config` | `GET` | Public | None | Exposes safe runtime flags (enabled payments, delivery zones, pixel) |

---

## 2. Delivery Pricing & Quote Engine (`/api/delivery/quote`)

Single source of truth for all delivery calculations.

### Request Body
```json
{
  "zoneKey": "dhaka-inside",
  "subtotal": 2400,
  "paymentMethod": "cod",
  "district": "Dhaka",
  "area": "Mirpur"
}
```

### Response
```json
{
  "success": true,
  "quote": {
    "zoneKey": "dhaka-inside",
    "zoneLabel": "Inside Dhaka City",
    "charge": 0,
    "free": true,
    "eta": "24-48 Hours",
    "etaDaysMin": 1,
    "etaDaysMax": 2,
    "codAvailable": true,
    "allowedPaymentMethods": ["cod", "bkash", "nagad", "sslcommerz"],
    "reasons": ["Free delivery promotion applied for order over ৳2,000"]
  }
}
```

---

## 3. Security & Data Protection Architecture

1. **AES-256-GCM Encryption (`apps/api/lib/secrets.js`)**:
   - Uses Node.js native crypto with a 96-bit random IV and 128-bit authentication tag.
   - Secrets (`apiKey`, `appSecret`, `merchantKey`, etc.) are encrypted before saving to MongoDB and never returned plaintext via API.
   - Admin view displays masked representations: `****last4` with `hasValue: true`.

2. **Server-Side HTML Sanitization (`apps/api/lib/sanitize.js`)**:
   - Uses `sanitize-html` with an allow-list of safe semantic HTML tags and attributes.
   - Prevents XSS injection on all rich text fields (`Page.content`, `Faq.answer`, descriptions).
   - Enforces `rel="noopener noreferrer"` on external link targets.

3. **Audit Logging (`apps/api/lib/audit.js`)**:
   - Tracks administrative actions (`actor`, `action`, `entity`, `entityId`, `summary`, `ip`).
   - Immutable audit trail stored in `auditlogs` collection.

4. **Cache Invalidation (`apps/api/lib/revalidate.js`)**:
   - Webhook trigger calling `${STOREFRONT_URL}/api/revalidate` with `REVALIDATE_SECRET` on any CMS state update.
