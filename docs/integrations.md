# 🔌 Memservice Integrations Hub Documentation

Complete technical specification and developer manual for all external payment gateways, courier delivery partners, authentication providers, media storage, and tracking systems in **Memservice**.

---

## 📑 Table of Contents
1. [Architecture & Resolver](#architecture--resolver)
2. [Payment Gateways](#payment-gateways)
   - [bKash (Tokenized Checkout)](#1-bkash-tokenized-checkout)
   - [Nagad](#2-nagad-pgw)
   - [SSLCommerz](#3-sslcommerz)
   - [aamarPay](#4-aamarpay)
   - [ShurjoPay](#5-shurjopay)
   - [Cash on Delivery (COD)](#6-cash-on-delivery-cod)
   - [Manual MFS](#7-manual-mfs)
3. [Courier & Logistics Services](#courier--logistics-services)
   - [Steadfast Courier](#1-steadfast-courier)
   - [Pathao Courier](#2-pathao-courier)
   - [RedX Delivery](#3-redx-delivery)
   - [Paperfly Logistics](#4-paperfly-logistics)
   - [eCourier](#5-ecourier)
4. [Media & Cloud Storage](#media--cloud-storage)
   - [Cloudinary](#cloudinary-media)
5. [Authentication](#authentication)
   - [Google OAuth](#google-oauth)
6. [Transactional Email Engine](#transactional-email-engine)
   - [Resend Email](#resend-email)
7. [Analytics & Conversion Tracking](#analytics--conversion-tracking)
   - [Meta Pixel & Conversions API (CAPI)](#meta-conversions-api-capi)

---

## Architecture & Resolver

All external third-party services in Memservice are resolved dynamically through `apps/api/lib/integrations/resolver.js` with:
1. **In-Memory Cache (30s TTL)**: Rapid resolution with automatic cache invalidation upon staff configuration updates.
2. **Encrypted Database Store**: Credentials and sensitive API keys are encrypted at rest with AES-256-GCM.
3. **Environment Fallback**: Graceful fallback to `.env` variables if database configuration is absent.
4. **Credential Redaction**: Sensitive secrets are masked before exposure to frontend consumers or administrative API responses.

---

## Payment Gateways

### 1. bKash (Tokenized Checkout)
- **Key**: `bkash`
- **Category**: `payment`
- **Supported Mode**: `sandbox`, `live`
- **Endpoints**:
  - Sandbox: `https://tokenized.sandbox.bka.sh/v2.0.0-beta`
  - Live: `https://tokenized.pay.bka.sh/v2.0.0-beta`
- **Required Configuration**:
  - `baseUrl`: Gateway base endpoint
  - `displayName`: "bKash"
- **Required Secrets**:
  - `appKey`: Merchant App Key
  - `appSecret`: Merchant App Secret
  - `username`: API Username
  - `password`: API Password
- **Callback & Webhook**:
  - Callback: `GET /api/pgw/bkash/callback`
  - Legacy Callback Alias: `GET /api/pgw/bkash/callback`
  - Webhook: `POST /api/pgw/bkash/webhook`

### 2. Nagad (PGW)
- **Key**: `nagad`
- **Category**: `payment`
- **Supported Mode**: `sandbox`, `live`
- **Endpoints**:
  - Sandbox: `http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs`
  - Live: `https://api.mynagad.com/api/dfs`
- **Required Configuration**:
  - `merchantId`: Nagad Merchant Account ID
  - `baseUrl`: Gateway base endpoint
- **Required Secrets**:
  - `publicKey`: Nagad PGW Public Key
  - `privateKey`: Merchant RSA Private Key (PEM format)
- **Callback & Webhook**:
  - Callback: `GET|POST /api/pgw/nagad/callback`
  - Webhook: `POST /api/pgw/nagad/webhook`

### 3. SSLCommerz
- **Key**: `sslcommerz`
- **Category**: `payment`
- **Supported Mode**: `sandbox`, `live`
- **Endpoints**:
  - Sandbox: `https://sandbox.sslcommerz.com/gwprocess/v4/api.php`
  - Live: `https://securepay.sslcommerz.com/gwprocess/v4/api.php`
- **Required Configuration**:
  - `storeId`: SSLCommerz Store ID
- **Required Secrets**:
  - `storePassword`: SSLCommerz Store Password
- **Callback & Webhook**:
  - Callback: `POST /api/pgw/sslcommerz/callback`
  - IPN Webhook: `POST /api/pgw/sslcommerz/webhook`

### 4. aamarPay
- **Key**: `aamarpay`
- **Category**: `payment`
- **Supported Mode**: `sandbox`, `live`
- **Endpoints**:
  - Sandbox: `https://sandbox.aamarpay.com/jsonpost.php`
  - Live: `https://secure.aamarpay.com/jsonpost.php`
- **Required Configuration**:
  - `storeId`: aamarPay Store ID
- **Required Secrets**:
  - `signatureKey`: aamarPay API Signature Key
- **Callback & Webhook**:
  - Callback: `POST /api/pgw/aamarpay/callback`
  - Webhook: `POST /api/pgw/aamarpay/webhook`

### 5. ShurjoPay
- **Key**: `shurjopay`
- **Category**: `payment`
- **Supported Mode**: `sandbox`, `live`
- **Endpoints**:
  - Sandbox: `https://sandbox.shurjopayment.com/api`
  - Live: `https://engine.shurjopayment.com/api`
- **Required Configuration**:
  - `username`: ShurjoPay Merchant Username
  - `prefix`: Order Invoice Prefix (e.g., `NOK`)
- **Required Secrets**:
  - `password`: ShurjoPay Password
- **Callback & Webhook**:
  - Callback: `GET|POST /api/pgw/shurjopay/callback`
  - Webhook: `POST /api/pgw/shurjopay/webhook`

### 6. Cash on Delivery (COD)
- **Key**: `cod`
- **Category**: `payment`
- **Supported Mode**: `live`
- **Functionality**: Local zero-credential adapter. Validates zone COD eligibility on order creation.
- **Order State**: Immediate success redirect with `payment_info.status = 'unpaid'` pending delivery collection.

### 7. Manual MFS
- **Key**: `manual_mfs`
- **Category**: `payment`
- **Supported Mode**: `live`
- **Functionality**: Manual bKash, Nagad, and Rocket send-money gateway.
- **Config**:
  - `bkashNumber`: Merchant/Personal bKash number
  - `nagadNumber`: Merchant/Personal Nagad number
  - `rocketNumber`: Merchant/Personal Rocket number
  - `instructions`: Customer payment instructions displayed at checkout

---

## Courier & Logistics Services

### 1. Steadfast Courier
- **Key**: `steadfast`
- **Endpoints**:
  - API Base: `https://portal.steadfast.com.bd/api/v1`
  - Create Order: `POST /create_order`
  - Tracking: `GET /status_by_cid/{consignment_id}`
  - Check Balance: `GET /get_balance`
- **Required Secrets**:
  - `apiKey`: Steadfast Api-Key
  - `secretKey`: Steadfast Secret-Key
- **Tracking URL**: `https://steadfast.com.bd/t/{code}`
- **Webhook Endpoint**: `POST /api/couriers/steadfast/webhook`

### 2. Pathao Courier
- **Key**: `pathao`
- **Endpoints**:
  - Sandbox: `https://courier-api-sandbox.pathao.net`
  - Live: `https://api-hermes.pathao.com`
  - Token Grant: `POST /aladdin/api/v1/issue-token`
  - Create Order: `POST /aladdin/api/v1/orders`
  - Tracking: `GET /aladdin/api/v1/orders/{consignment_id}/info`
- **Required Configuration**:
  - `clientId`: Pathao OAuth Client ID
  - `username`: Merchant Email
  - `storeId`: Default Store ID
- **Required Secrets**:
  - `clientSecret`: Pathao OAuth Client Secret
  - `password`: Merchant Password
- **Tracking URL**: `https://pathao.com/courier-tracking/?consignment_id={code}`
- **Webhook Endpoint**: `POST /api/couriers/pathao/webhook`

### 3. RedX Delivery
- **Key**: `redx`
- **Endpoints**:
  - Sandbox/Live Base: `https://openapi.redx.com.bd/v1.0.0-beta`
  - Create Parcel: `POST /parcels`
  - Tracking: `GET /parcels/info/{tracking_id}`
- **Required Secrets**:
  - `accessToken`: RedX Bearer Access Token
- **Tracking URL**: `https://redx.com.bd/track-parcel/?trackingId={code}`
- **Webhook Endpoint**: `POST /api/couriers/redx/webhook`

### 4. Paperfly Logistics
- **Key**: `paperfly`
- **Endpoints**:
  - Base: `https://api.paperfly.com.bd`
  - Create Order: `POST /OrderPlacement`
  - Tracking: `POST /Tracking`
- **Required Configuration**:
  - `username`: Merchant Username
- **Required Secrets**:
  - `password`: Merchant Password
  - `paperflyKey`: Paperfly API Key
- **Tracking URL**: `https://paperfly.com.bd/tracking.php?track_code={code}`
- **Webhook Endpoint**: `POST /api/couriers/paperfly/webhook`

### 5. eCourier
- **Key**: `ecourier`
- **Endpoints**:
  - Base: `https://backoffice.ecourier.com.bd/api`
  - Create Order: `POST /order-place`
  - Tracking: `POST /track`
- **Required Configuration**:
  - `userId`: eCourier User ID
- **Required Secrets**:
  - `apiKey`: eCourier API-KEY
  - `apiSecret`: eCourier API-SECRET
- **Tracking URL**: `https://ecourier.com.bd/track?ecr={code}`
- **Webhook Endpoint**: `POST /api/couriers/ecourier/webhook`

---

## Media & Cloud Storage

### Cloudinary Media
- **Key**: `cloudinary`
- **Category**: `media`
- **Endpoints**:
  - Upload API: `POST /api/media` (multipart form, 5MB max, JPEG/PNG/WebP/AVIF/SVG)
  - Asset List: `GET /api/media` (paginated staff access)
- **Required Configuration**:
  - `cloudName`: Cloudinary Cloud Name
- **Required Secrets**:
  - `apiKey`: Cloudinary API Key
  - `apiSecret`: Cloudinary API Secret
- **Ping / Test**: Validated via `cloudinary.api.ping()`

---

## Authentication

### Google OAuth
- **Key**: `google_oauth`
- **Category**: `auth`
- **Endpoints**:
  - Storefront Assertion: `POST /api/customerProfile/oauth`
  - Google Tokeninfo: `https://oauth2.googleapis.com/tokeninfo`
- **Required Configuration**:
  - `clientId`: Google Web Client ID
- **Required Secrets**:
  - `clientSecret`: Google Client Secret
- **Functionality**: Verifies Google tokens, provisions passwordless customer profiles, and generates standard HS256 JWT tokens with 7-day validity.

---

## Transactional Email Engine

### Resend Email
- **Key**: `resend`
- **Category**: `email`
- **Endpoints**:
  - Send Email: `POST https://api.resend.com/emails`
- **Required Configuration**:
  - `from`: Verified Sender (e.g., `Mem Service <onboarding@resend.dev>`)
  - `replyTo`: Reply-to email (e.g., `support@memservice.com`)
- **Required Secrets**:
  - `apiKey`: Resend API Key (`re_...`)
- **Branded Email Templates**:
  - `orderConfirmation`: Complete order summary, delivery zone, ETA, payment details
  - `orderShipped`: Courier name, consignment ID, live tracking URL
  - `paymentReceived`: Payment receipt with transaction ID and amount
  - `paymentFailed`: Payment failure warning and retry link
  - `staffPasswordReset` & `customerPasswordReset`: Responsive password reset links

---

## Analytics & Conversion Tracking

### Meta Conversions API (CAPI)
- **Key**: `meta_capi`
- **Category**: `tracking`
- **Endpoints**:
  - Meta Graph API: `https://graph.facebook.com/v19.0/{PIXEL_ID}/events`
  - Public Storefront Event API: `POST /api/track` (rate-limited)
- **Required Configuration**:
  - `pixelId`: Meta Pixel ID
  - `testEventCode`: Optional Meta Events Manager Test Event Code
- **Required Secrets**:
  - `accessToken`: Meta Conversions API System User Access Token
- **Supported Standard Events**:
  `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`, `Search`, `CompleteRegistration`
- **Privacy Compliance**:
  - Automatically hashes customer PII (Email, Phone with 880 prefix, First Name) using SHA-256 before transmission.
  - Automatically captures `client_ip_address`, `client_user_agent`, `_fbp`, and `_fbc` cookies for browser/server deduplication.
  - Auto-fires server-side `Purchase` events upon confirmed payment execution.

---

## Verification & Testing API

Staff administrators can verify third-party credentials at any time without initiating real financial or logistics transactions:
```http
POST /api/integrations/:key/test
Authorization: Bearer <staff_session_or_cookie>
```
Supported keys:
- Payment: `bkash`, `nagad`, `sslcommerz`, `aamarpay`, `shurjopay`, `cod`, `manual_mfs`
- Couriers: `steadfast`, `pathao`, `redx`, `paperfly`, `ecourier`
- Services: `resend`, `cloudinary`, `google_oauth`, `meta_capi`
