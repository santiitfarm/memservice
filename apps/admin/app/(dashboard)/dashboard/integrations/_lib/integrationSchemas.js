export const INTEGRATION_SCHEMAS = {
  // PAYMENTS
  bkash: {
    name: "bKash Tokenized Checkout",
    category: "payment",
    description: "Bangladesh's leading mobile financial service for direct tokenized payment and automated refunds.",
    docsUrl: "https://developer.bka.sh",
    secrets: [
      { key: "appKey", label: "App Key", required: true },
      { key: "appSecret", label: "App Secret", required: true },
      { key: "username", label: "Merchant Username", required: true },
      { key: "password", label: "Merchant Password", required: true },
    ],
    config: [
      { key: "displayName", label: "Checkout Display Name", default: "bKash Online Payment" },
      { key: "baseUrl", label: "API Base URL", default: "https://tokenized.sandbox.bka.sh/v2.0.0-beta" },
    ],
    webhookUrl: "/api/pgw/bkash/callback",
  },
  nagad: {
    name: "Nagad Direct PGW",
    category: "payment",
    description: "Post office digital financial service with RSA-signed remote payment gateway.",
    docsUrl: "https://developer.mynagad.com",
    secrets: [
      { key: "publicKey", label: "Nagad Public Key", multiline: true, required: true },
      { key: "privateKey", label: "Merchant Private Key", multiline: true, required: true },
    ],
    config: [
      { key: "merchantId", label: "Merchant ID", required: true },
      { key: "displayName", label: "Checkout Display Name", default: "Nagad Online Payment" },
      { key: "baseUrl", label: "API Base URL", default: "http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs" },
    ],
    webhookUrl: "/api/pgw/nagad/callback",
  },
  sslcommerz: {
    name: "SSLCommerz Hosted Gateway",
    category: "payment",
    description: "Accept all Bangladeshi Visa, MasterCard, UnionPay, and MFS wallets in one gateway.",
    docsUrl: "https://developer.sslcommerz.com",
    secrets: [
      { key: "storePassword", label: "Store Password", required: true },
    ],
    config: [
      { key: "storeId", label: "Store ID", required: true },
      { key: "displayName", label: "Checkout Display Name", default: "Credit/Debit Card & Mobile Banking (SSLCommerz)" },
    ],
    webhookUrl: "/api/pgw/sslcommerz/ipn",
  },
  aamarpay: {
    name: "aamarPay Gateway",
    category: "payment",
    description: "Instant mobile payment collection and card gateway for local ecommerce.",
    docsUrl: "https://aamarpay.com/developer",
    secrets: [
      { key: "signatureKey", label: "Signature Key", required: true },
    ],
    config: [
      { key: "storeId", label: "Store ID", required: true },
      { key: "displayName", label: "Checkout Display Name", default: "aamarPay Checkout" },
    ],
    webhookUrl: "/api/pgw/aamarpay/callback",
  },
  shurjopay: {
    name: "shurjoPay Gateway",
    category: "payment",
    description: "Bangladesh Bank licensed payment systems operator supporting card & MFS.",
    docsUrl: "https://shurjopay.com.bd",
    secrets: [
      { key: "password", label: "Merchant Password", required: true },
    ],
    config: [
      { key: "username", label: "Username", required: true },
      { key: "prefix", label: "Order Prefix", default: "MEM" },
      { key: "displayName", label: "Checkout Display Name", default: "shurjoPay" },
    ],
    webhookUrl: "/api/pgw/shurjopay/callback",
  },
  cod: {
    name: "Cash on Delivery (COD)",
    category: "payment",
    description: "Allow customers to pay physical cash upon order handover by courier.",
    secrets: [],
    config: [
      { key: "displayName", label: "Display Title", default: "Cash on Delivery" },
      { key: "instructions", label: "Customer Instructions", multiline: true, default: "Pay in cash when you receive the medicine package at your doorstep." },
      { key: "surcharge", label: "COD Surcharge (৳ BDT)", default: "0" },
    ],
  },
  manual_mfs: {
    name: "Manual MFS (Send Money / Merchant Pay)",
    category: "payment",
    description: "Allow direct mobile transfer (bKash/Nagad/Rocket) with manual TrxID verification in admin.",
    secrets: [],
    config: [
      { key: "displayName", label: "Display Title", default: "Manual bKash / Nagad / Rocket" },
      { key: "bkashNumber", label: "bKash Number (Personal/Merchant)", default: "01700000000" },
      { key: "nagadNumber", label: "Nagad Number", default: "01800000000" },
      { key: "instructions", label: "Instructions for Customer", multiline: true, default: "Send money to our number and provide the Transaction ID (TrxID) and sender phone number below." },
    ],
  },

  // COURIERS
  steadfast: {
    name: "Steadfast Courier",
    category: "courier",
    description: "Automated next-day logistics network with real-time tracking across 64 districts.",
    docsUrl: "https://steadfast.com.bd/developer",
    secrets: [
      { key: "apiKey", label: "API Key", required: true },
      { key: "secretKey", label: "Secret Key", required: true },
    ],
    config: [
      { key: "baseUrl", label: "API Base URL", default: "https://portal.steadfast.com.bd/api/v1" },
    ],
    webhookUrl: "/api/couriers/steadfast/webhook",
  },
  pathao: {
    name: "Pathao Courier",
    category: "courier",
    description: "Fast express parcel delivery with on-demand courier pickup and return handling.",
    docsUrl: "https://courier.pathao.com",
    secrets: [
      { key: "clientSecret", label: "OAuth Client Secret", required: true },
      { key: "password", label: "Account Password", required: true },
    ],
    config: [
      { key: "clientId", label: "OAuth Client ID", required: true },
      { key: "username", label: "Account Email / Username", required: true },
      { key: "storeId", label: "Pathao Store ID", required: true },
      { key: "baseUrl", label: "Base URL", default: "https://api-hermes.pathao.com" },
    ],
    webhookUrl: "/api/couriers/pathao/webhook",
  },
  redx: {
    name: "RedX Delivery",
    category: "courier",
    description: "Nationwide parcel delivery service with doorstep delivery and return pickup.",
    docsUrl: "https://redx.com.bd",
    secrets: [
      { key: "apiToken", label: "API Token", required: true },
    ],
    config: [
      { key: "baseUrl", label: "API Base URL", default: "https://openapi.redx.com.bd/v1.0.0-sandbox" },
    ],
    webhookUrl: "/api/couriers/redx/webhook",
  },
  paperfly: {
    name: "Paperfly Logistics",
    category: "courier",
    description: "Smart logistics and doorstep delivery for ecommerce businesses in Bangladesh.",
    docsUrl: "https://paperfly.com.bd",
    secrets: [
      { key: "password", label: "Password", required: true },
      { key: "key", label: "API Key", required: true },
    ],
    config: [
      { key: "username", label: "Username", required: true },
    ],
    webhookUrl: "/api/couriers/paperfly/webhook",
  },
  ecourier: {
    name: "eCourier",
    category: "courier",
    description: "Tech-enabled delivery and tracking platform across Bangladesh.",
    docsUrl: "https://ecourier.com.bd",
    secrets: [
      { key: "secret", label: "API Secret", required: true },
      { key: "apiKey", label: "API Key", required: true },
    ],
    config: [
      { key: "userId", label: "User ID", required: true },
    ],
    webhookUrl: "/api/couriers/ecourier/webhook",
  },

  // EMAIL
  resend: {
    name: "Resend Email Engine",
    category: "email",
    description: "Transactional email delivery for order receipts, password resets, and alerts.",
    docsUrl: "https://resend.com/docs",
    secrets: [
      { key: "apiKey", label: "Resend API Key (re_...)", required: true },
    ],
    config: [
      { key: "fromEmail", label: "Sender Email", default: "orders@memservice.com" },
      { key: "fromName", label: "Sender Name", default: "Memservice Pharmacy" },
    ],
  },

  // TRACKING
  meta_capi: {
    name: "Meta Conversions API (CAPI)",
    category: "tracking",
    description: "Server-side pixel tracking for PageView, ViewContent, AddToCart, and Purchase events.",
    docsUrl: "https://developers.facebook.com/docs/marketing-api/conversions-api",
    secrets: [
      { key: "accessToken", label: "System User Access Token", multiline: true, required: true },
    ],
    config: [
      { key: "pixelId", label: "Dataset / Pixel ID", required: true },
      { key: "testEventCode", label: "Test Event Code (Optional for sandbox testing)", default: "" },
    ],
  },

  // MEDIA
  cloudinary: {
    name: "Cloudinary Media Cloud",
    category: "media",
    description: "High-performance CDN image optimization, auto-format WebP/AVIF, and media library.",
    docsUrl: "https://cloudinary.com/documentation",
    secrets: [
      { key: "apiSecret", label: "API Secret", required: true },
    ],
    config: [
      { key: "cloudName", label: "Cloud Name", required: true },
      { key: "apiKey", label: "API Key", required: true },
      { key: "uploadPreset", label: "Upload Preset", default: "memservice_unsigned" },
    ],
  },

  // AUTH
  google_oauth: {
    name: "Google OAuth 2.0",
    category: "auth",
    description: "One-click social login and customer registration with verified Google accounts.",
    docsUrl: "https://console.cloud.google.com",
    secrets: [
      { key: "clientSecret", label: "OAuth Client Secret", required: true },
    ],
    config: [
      { key: "clientId", label: "OAuth Client ID", required: true },
    ],
    webhookUrl: "/api/auth/callback/google",
  },
};
