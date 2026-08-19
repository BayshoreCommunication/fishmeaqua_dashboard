import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "./auth";
import { fetchUserProfile } from "./lib/fetchUserProfile";
import { fetchAdminProfile } from "./lib/fetchAdminProfile";

// Static assets + NextAuth's own session/csrf/callback plumbing — never gated,
// or sign-in itself breaks.
const EXCLUDED_PATHS = [
  "/_next/",
  "/favicon.ico",
  "/opengraph-image.png",
  "/assets/",
  "/api/auth/",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (EXCLUDED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  try {
    const session = await auth();
    const sessionUser = session?.user as
      | { accessToken?: string; userType?: "admin" | "company" }
      | undefined;
    const token = sessionUser?.accessToken;
    const isAdminSession = sessionUser?.userType === "admin";

    // A session is only "live" if its backend account is still active.
    // /api/user (company) and /api/v1/admin/me (staff) both filter
    // is_active=true server-side, so a null result means the account is
    // gone/deactivated — treated the same as not signed in.
    let isActiveSession = false;
    if (sessionUser && token) {
      const profile = isAdminSession
        ? await fetchAdminProfile(token)
        : await fetchUserProfile(token);
      isActiveSession = Boolean(profile);
    }

    // Root path: route based on auth state only.
    if (pathname === "/") {
      return NextResponse.redirect(
        new URL(isActiveSession ? "/dashboard" : "/sign-in", request.url),
      );
    }

    // Already signed in — don't show the sign-in page again.
    if (isActiveSession && pathname === "/sign-in") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Everything else is open, signed in or not.
    return NextResponse.next();
  } catch (error) {
    // A thrown error here (e.g. a corrupted/expired session cookie) would
    // otherwise crash every single page request with "Internal Server
    // Error" — fall back to treating the visitor as unauthenticated
    // instead of taking the whole site down.
    console.error("💥 [Proxy] Unexpected error:", error);
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|assets/).*)"],
};

export default proxy;
