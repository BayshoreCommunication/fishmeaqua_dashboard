import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "./auth";

const STAFF_ROLES = new Set(["manager", "admin", "superadmin"]);

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

  if (
    EXCLUDED_PATHS.some((path) => pathname.startsWith(path)) ||
    /\/[^/]+\.[a-z0-9]+$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  try {
    const session = await auth();
    const sessionUser = session?.user as
      | {
          accessToken?: string;
          role?: string;
          userType?: "admin" | "company";
        }
      | undefined;
    const token = sessionUser?.accessToken;
    const isStaffSession =
      sessionUser?.userType === "admin" &&
      typeof sessionUser.role === "string" &&
      STAFF_ROLES.has(sessionUser.role);

    // Auth.js validates this signed dashboard-only session locally. Protected
    // backend actions validate the JWT and account status again before data is
    // returned, avoiding a blocking API round trip on every page navigation.
    const isActiveSession = Boolean(isStaffSession && token);

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

    // Dashboard pages are staff-only. Customer sessions and missing, expired,
    // or deactivated staff sessions all return to the staff sign-in page.
    if (!isActiveSession && pathname !== "/sign-in") {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  } catch (error) {
    // A thrown error here (e.g. a corrupted/expired session cookie) would
    // otherwise crash every single page request with "Internal Server
    // Error" — fall back to treating the visitor as unauthenticated
    // instead of taking the whole site down.
    console.error("💥 [Proxy] Unexpected error:", error);
    if (pathname !== "/sign-in") {
      const signInUrl = new URL("/sign-in", request.url);
      if (pathname !== "/") {
        signInUrl.searchParams.set("callbackUrl", pathname);
      }
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|assets/).*)"],
};

export default proxy;
