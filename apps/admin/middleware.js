import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { canAccess, rankOf } from "@/lib/roles";

const SESSION_COOKIE = "memservice_auth";
const LOGIN_PATH = "/admin-login";

async function getSessionUser(req) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.AUTH_SECRET),
      { algorithms: ["HS256"] }
    );
    return payload.user ?? null;
  } catch {
    return null;
  }
}

export default async function middleware(req) {
  const path = req.nextUrl.pathname;
  const user = await getSessionUser(req);
  const isStaff = rankOf(user?.role) >= 1;

  if (path.startsWith("/dashboard")) {
    if (!isStaff) {
      const res = NextResponse.redirect(new URL(LOGIN_PATH, req.nextUrl));
      if (user) res.cookies.delete(SESSION_COOKIE); // stale / insufficient session
      return res;
    }
    if (!canAccess(user.role, path)) {
      return NextResponse.redirect(new URL("/dashboard?denied=1", req.nextUrl));
    }
  }

  if (path.startsWith(LOGIN_PATH) && isStaff) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if ((path.startsWith("/forgot-password") || path.startsWith("/reset-password")) && isStaff) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin-login", "/forgot-password", "/reset-password"],
};
