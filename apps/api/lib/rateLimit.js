import { NextResponse } from "next/server";

// Fixed-window, in-memory limiter. Good enough for a single VPS instance;
// swap for Redis if the API is ever scaled horizontally.
const hits = new Map();

export function clientIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Returns a 429 response when the limit is exceeded, otherwise null. */
export function rateLimit(request, name, { limit = 10, windowMs = 60_000 } = {}) {
  const key = `${name}:${clientIp(request)}`;
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    return null;
  }
  entry.count += 1;
  if (entry.count > limit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) } }
    );
  }
  return null;
}
