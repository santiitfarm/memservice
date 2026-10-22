import { NextResponse } from "next/server";
import { getStaff, rankOf, unauthorized, forbidden } from "@/lib/auth";

const WRITE = ["POST", "PUT", "PATCH", "DELETE"];
const ANY = null;

// Staff-only surface. `min` is the minimum role rank (manager=1, admin=2, super-admin=3).
// Customer-owned resources (customerProfile/*) are checked inside their route handlers.
const rules = [
  { re: /^\/api\/user(\/|$)/, methods: ANY, min: 2 },
  { re: /^\/api\/adminproduct(\/|$)/, methods: ANY, min: 1 },
  { re: /^\/api\/cloudinary(\/|$)/, methods: ANY, min: 1 },
  { re: /^\/api\/sendmail(\/|$)/, methods: ANY, min: 1 },
  // Raw product documents include cost price; the storefront uses /api/shop/* instead.
  { re: /^\/api\/product$/, methods: ["GET"], min: 1 },
  { re: /^\/api\/product\/[a-f0-9]{24}$/i, methods: ["GET"], min: 1 },
  { re: /^\/api\/order$/, methods: ["GET"], min: 1 },
  { re: /^\/api\/order\/[^/]+$/, methods: ["PUT", "PATCH", "DELETE"], min: 1 },
  {
    re: /^\/api\/(product|category|slider|banner|doctors|doccat)(\/|$)/,
    methods: WRITE,
    min: 1,
  },
  { re: /^\/api\/customerProfile\/[^/]+$/, methods: ["DELETE"], min: 1 },

  // Secure Integrations Store (Writes = Super Admin [rank 3], Reads = Admin [rank 2])
  { re: /^\/api\/integrations(\/|$)/, methods: WRITE, min: 3 },
  { re: /^\/api\/integrations(\/|$)/, methods: ["GET"], min: 2 },

  // Delivery Zones (Writes = Admin [rank 2], Reads = Public)
  { re: /^\/api\/delivery\/zones(\/|$)/, methods: WRITE, min: 2 },

  // CMS Writes (Admin [rank 2])
  {
    re: /^\/api\/cms\/(site|home|menus|pages|faqs|faq-groups|departments|testimonials)(\/|$)/,
    methods: WRITE,
    min: 2,
  },

  // CMS Internal Staff-Only Listing Reads
  { re: /^\/api\/cms\/pages$/, methods: ["GET"], min: 1 },
  // Staff Reviews & Appointments Management
  { re: /^\/api\/reviews$/, methods: ["GET"], min: 1 },
  { re: /^\/api\/reviews\/[^/]+$/, methods: ["PUT"], min: 1 },
  { re: /^\/api\/appointments$/, methods: ["GET"], min: 1 },
  { re: /^\/api\/appointments\/[^/]+$/, methods: ["PUT"], min: 1 },

  // Staff Stock Management
  { re: /^\/api\/stock(\/|$)/, methods: ANY, min: 1 },

  // Staff Returns Management
  { re: /^\/api\/returns\/[^/]+$/, methods: ["PUT"], min: 1 },

  // Staff Privacy Data Requests Processing
  { re: /^\/api\/me\/data-requests\/[^/]+$/, methods: ["PUT"], min: 1 },
];

function allowedOrigins() {
  return (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, Idempotency-Key, X-Idempotency-Key",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function withCors(response, origin) {
  if (origin) for (const [k, v] of Object.entries(corsHeaders(origin))) response.headers.set(k, v);
  return response;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const requestOrigin = request.headers.get("origin");
  const originAllowed = requestOrigin && allowedOrigins().includes(requestOrigin);
  const origin = originAllowed ? requestOrigin : null;

  if (method === "OPTIONS") {
    return new NextResponse(null, { status: origin ? 204 : 403, headers: origin ? corsHeaders(origin) : {} });
  }

  const isExternalAllowed =
    pathname.startsWith("/api/pgw/") ||
    pathname.startsWith("/api/couriers/") ||
    pathname === "/api/track" ||
    pathname === "/api/cart/price" ||
    pathname === "/api/orders/track" ||
    pathname === "/api/coupons/validate" ||
    pathname === "/api/returns" ||
    pathname.startsWith("/api/me/") ||
    pathname.startsWith("/api/appointments") ||
    pathname.startsWith("/api/reviews");

  // Browser requests from an unknown site must never reach a state-changing handler,
  // except external payment/courier callbacks or public event tracking.
  if (requestOrigin && !originAllowed && WRITE.includes(method) && !isExternalAllowed) {
    return forbidden("Origin not allowed");
  }

  const rule = rules.find((r) => r.re.test(pathname) && (r.methods === ANY || r.methods.includes(method)));
  if (rule) {
    const staff = await getStaff(request);
    if (!staff) return withCors(unauthorized(), origin);
    if (rankOf(staff.role) < rule.min) return withCors(forbidden(), origin);
  }

  return withCors(NextResponse.next(), origin);
}

export const config = { matcher: "/api/:path*" };
