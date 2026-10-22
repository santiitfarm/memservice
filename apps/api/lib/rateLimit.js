import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import RateLimitBucket from "@/app/models/RateLimitBucket";
import logger from "@/lib/logger";

// In-memory fallback if MongoDB connection fails
const memoryHits = new Map();

export function clientIp(request) {
  return (
    request.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers?.get("x-real-ip") ||
    "127.0.0.1"
  );
}

function memoryRateLimit(key, limit, windowMs) {
  const now = Date.now();
  const entry = memoryHits.get(key);
  if (!entry || entry.resetAt <= now) {
    memoryHits.set(key, { count: 1, resetAt: now + windowMs });
    if (memoryHits.size > 5000) {
      for (const [k, v] of memoryHits) {
        if (v.resetAt <= now) memoryHits.delete(k);
      }
    }
    return null;
  }
  entry.count += 1;
  if (entry.count > limit) {
    const retrySec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return NextResponse.json(
      { error: "Too many requests. Please try again later.", retryAfter: retrySec },
      { status: 429, headers: { "Retry-After": String(retrySec) } }
    );
  }
  return null;
}

/**
 * Durable MongoDB TTL-backed rate limiter with Retry-After header.
 * Returns a 429 response when limit is exceeded, otherwise null.
 */
export async function rateLimit(request, name, { limit = 10, windowMs = 60_000 } = {}) {
  const ip = clientIp(request);
  const key = `${name}:${ip}`;
  const now = new Date();
  const windowEnd = new Date(Date.now() + windowMs);

  try {
    await connectMongo();

    // Check existing bucket
    const doc = await RateLimitBucket.findOne({ key });
    let count = 1;
    let resetAt = windowEnd;

    if (doc && doc.expiresAt > now) {
      const updated = await RateLimitBucket.findByIdAndUpdate(
        doc._id,
        { $inc: { count: 1 } },
        { new: true }
      );
      count = updated?.count ?? doc.count + 1;
      resetAt = updated?.resetAt ?? doc.resetAt;
    } else {
      const updated = await RateLimitBucket.findOneAndUpdate(
        { key },
        {
          $set: {
            count: 1,
            resetAt: windowEnd,
            expiresAt: windowEnd,
          },
        },
        { upsert: true, new: true }
      );
      count = updated?.count ?? 1;
      resetAt = updated?.resetAt ?? windowEnd;
    }

    if (count > limit) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((new Date(resetAt).getTime() - Date.now()) / 1000)
      );
      logger.warn({
        msg: "Rate limit exceeded",
        key,
        count,
        limit,
        retryAfterSeconds,
      });

      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
          },
        }
      );
    }

    return null;
  } catch (error) {
    logger.warn({ msg: "MongoDB rate limiter error, falling back to in-memory", error: error.message });
    return memoryRateLimit(key, limit, windowMs);
  }
}
