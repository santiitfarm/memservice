import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

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

export async function createSession(user) {
  const expires = new Date(Date.now() + SESSION_TTL_MS);
  const session = await encrypt({ user });
  (await cookies()).set(SESSION_COOKIE, session, cookieOptions(expires));
}

export async function deleteSession() {
  const store = await cookies();
  const domain = process.env.COOKIE_DOMAIN;
  store.set(SESSION_COOKIE, "", {
    ...cookieOptions(new Date(0)),
    maxAge: 0,
    ...(domain ? { domain } : {}),
  });
}
