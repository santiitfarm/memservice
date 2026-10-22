// Shared auth helpers (Edge + Node safe: only depends on `jose`).
//
// Two kinds of callers are recognised:
//   - staff:    the admin app issues a signed `memservice_auth` cookie ({ user: { id, role, ... } })
//   - customer: the storefront sends `Authorization: Bearer <token>` issued by POST /api/customerProfile/login
import { jwtVerify, SignJWT } from "jose";
import { NextResponse } from "next/server";

export const STAFF_COOKIE = "memservice_auth";
export const CUSTOMER_AUDIENCE = "customer";
export const CUSTOMER_TOKEN_TTL = "7d";

// Higher rank = more privileges. `user` has no dashboard access.
export const ROLE_RANK = { "super-admin": 3, admin: 2, manager: 1, user: 0 };
export const rankOf = (role) => ROLE_RANK[role] ?? 0;

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

async function verify(token, options) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
      ...options,
    });
    return payload;
  } catch {
    return null;
  }
}

/** Returns `{ id, email, name, role }` for a valid staff session cookie, otherwise null. */
export async function getStaff(request) {
  const payload = await verify(request.cookies.get(STAFF_COOKIE)?.value);
  const user = payload?.user;
  if (!user?.id || rankOf(user.role) < 1) return null;
  return user;
}

/** Returns `{ id, phone }` for a valid customer bearer token, otherwise null. */
export async function getCustomer(request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const payload = await verify(token, { audience: CUSTOMER_AUDIENCE });
  if (!payload?.sub) return null;
  return { id: payload.sub, phone: payload.phone, email: payload.email };
}

export async function signCustomerToken(customer) {
  return new SignJWT({
    phone: customer.phone_number || "",
    email: customer.email || "",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(customer._id))
    .setAudience(CUSTOMER_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(CUSTOMER_TOKEN_TTL)
    .sign(secretKey());
}

export const unauthorized = (message = "Authentication required") =>
  NextResponse.json({ error: message }, { status: 401 });

export const forbidden = (message = "You do not have permission to do this") =>
  NextResponse.json({ error: message }, { status: 403 });
