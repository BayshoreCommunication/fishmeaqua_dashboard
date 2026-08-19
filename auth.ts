import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bayshorecommunication.com";

export const { auth, signIn, signOut, handlers } = NextAuth({
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
            console.error("Admin sign-in failed with status:", res.status, errorText);
            return null;
          }

          const body = await res.json();
          const user = body?.data?.user;
          const token = body?.data?.token;

          if (!token || !user?._id) {
            console.error("Admin sign-in response missing required fields:", body);
            return null;
          }

          return {
            id: user._id,
            email: user.email ?? null,
            name: `${user.firstName} ${user.lastName}`.trim(),
            accessToken: token,
            role: user.role,
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
        token.accessToken = (user as any).accessToken;
        token.role = (user as any).role;
        token.companyName = (user as any).companyName;
        token.has_paid_subscription = (user as any).has_paid_subscription ?? false;
        token.subscription_type = (user as any).subscription_type ?? "free";
        token.userType = "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).role = token.role;
        (session.user as any).companyName = token.companyName;
        (session.user as any).has_paid_subscription = token.has_paid_subscription;
        (session.user as any).subscription_type = token.subscription_type;
        (session.user as any).userType = token.userType;
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
    // NOTE: longer than the backend's JWT_EXPIRES_IN (7d by default), so a
    // NextAuth session can outlive the embedded accessToken — API calls made
    // with a stale token will 401 without the session itself expiring.
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
