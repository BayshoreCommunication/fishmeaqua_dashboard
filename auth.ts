import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://fishmeaqua-backend.vercel.app";
const AUTH_SECRET =
  process.env.DASHBOARD_AUTH_SECRET ??
  (process.env.AUTH_SECRET
    ? `dashboard:${process.env.AUTH_SECRET}`
    : undefined);

const STAFF_ROLES = new Set(["manager", "admin", "superadmin"]);

export const { auth, signIn, signOut, handlers } = NextAuth({
  secret: AUTH_SECRET,
  // Keep dashboard authentication completely separate from the customer
  // website, even when both apps run on localhost with the same AUTH_SECRET.
  cookies: {
    sessionToken: {
      name: "fishme-dashboard.session-token",
    },
    callbackUrl: {
      name: "fishme-dashboard.callback-url",
    },
    csrfToken: {
      name: "fishme-dashboard.csrf-token",
    },
    pkceCodeVerifier: {
      name: "fishme-dashboard.pkce.code-verifier",
    },
    state: {
      name: "fishme-dashboard.state",
    },
    nonce: {
      name: "fishme-dashboard.nonce",
    },
    webauthnChallenge: {
      name: "fishme-dashboard.challenge",
    },
  },
  providers: [
    // Staff sign-in (manager / admin / superadmin only) — hits the backend's
    // /api/v1/auth/staff/signin, which rejects customer accounts with 403
    // even on valid credentials.
    Credentials({
      id: "admin-credentials",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${BACKEND_URL}/api/v1/auth/staff/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: credentials.email,
              password: credentials.password,
            }),
            cache: "no-store",
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error(
              "Admin sign-in failed with status:",
              res.status,
              errorText,
            );
            return null;
          }

          const body = await res.json();
          const user = body?.data?.user;
          const token = body?.data?.token;
          const role = typeof user?.role === "string" ? user.role : "";

          if (!token || !user?._id || !STAFF_ROLES.has(role)) {
            console.error(
              "Staff sign-in response is missing fields or has a forbidden role:",
              body,
            );
            return null;
          }

          return {
            id: user._id,
            email: user.email ?? null,
            name: `${user.firstName} ${user.lastName}`.trim(),
            accessToken: token,
            role,
          };
        } catch (error) {
          console.error("Admin authorize function crashed:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.companyName = user.companyName;
        token.has_paid_subscription = user.has_paid_subscription ?? false;
        token.subscription_type = user.subscription_type ?? "free";
        token.userType = "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.accessToken = token.accessToken;
        session.user.role = token.role;
        session.user.companyName = token.companyName;
        session.user.has_paid_subscription = token.has_paid_subscription;
        session.user.subscription_type = token.subscription_type;
        session.user.userType = token.userType;
      }
      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },

  session: {
    strategy: "jwt",
    // Keep the Auth.js session aligned with the backend access-token lifetime.
    maxAge: 7 * 24 * 60 * 60,
  },
});
