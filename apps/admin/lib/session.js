import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import connectMongo from "@/services/mongo";
import StaffSession from "@/app/models/StaffSession";

// Cookie shared with the API (apps/api/lib/auth.js verifies it with the same AUTH_SECRET).
export const SESSION_COOKIE = "memservice_auth";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

const encodedKey = () => new TextEncoder().encode(process.env.AUTH_SECRET);

function cookieOptions(expires) {
  return {
    httpOnly: true,
    // Browsers treat http://localhost as a secure context, so this also works in dev.
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
    path: "/",
    // Set to the parent domain (e.g. .example.com) so admin.* and api.* share the cookie.
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  };
}

export async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + SESSION_TTL_MS) / 1000))
    .sign(encodedKey());
}

export async function decrypt(session) {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey(), {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(user, meta = {}) {
  const expires = new Date(Date.now() + SESSION_TTL_MS);
  const jti = crypto.randomUUID();

  let ip = meta?.ip;
  let userAgent = meta?.userAgent;
  if (!ip || !userAgent) {
    try {
      const h = await headers();
      ip = ip || h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "127.0.0.1";
      userAgent = userAgent || h.get("user-agent") || "Admin Dashboard";
    } catch {
      ip = ip || "127.0.0.1";
      userAgent = userAgent || "Admin Dashboard";
    }
  }

  try {
    await connectMongo();
    await StaffSession.create({
      jti,
      user: user.id,
      ip,
      userAgent,
      createdAt: new Date(),
      lastSeenAt: new Date(),
    });
  } catch (err) {
    console.error("Failed to persist StaffSession:", err);
  }

  const session = await encrypt({ user, jti });
  (await cookies()).set(SESSION_COOKIE, session, cookieOptions(expires));
  return { jti };
}

export async function deleteSession() {
  const store = await cookies();
  const existingCookie = store.get(SESSION_COOKIE)?.value;
  if (existingCookie) {
    try {
      const payload = await decrypt(existingCookie);
      if (payload?.jti) {
        await connectMongo();
        await StaffSession.updateOne(
          { jti: payload.jti },
          { $set: { revokedAt: new Date() } }
        );
      }
    } catch (err) {
      console.error("Failed to revoke session on logout:", err);
    }
  }

  const domain = process.env.COOKIE_DOMAIN;
  store.set(SESSION_COOKIE, "", {
    ...cookieOptions(new Date(0)),
    maxAge: 0,
    ...(domain ? { domain } : {}),
  });
}
