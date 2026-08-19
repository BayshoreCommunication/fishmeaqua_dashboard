import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    _id?: string;
    email?: string;
    companyName?: string;
    companyType?: string;
    website?: string;
    avatar?: string;
    accessToken?: string;
    has_paid_subscription?: boolean;
    googleId?: string;
    role?: string;
    // "admin" when authenticated via the admin-credentials provider
    // (super_admin/admin/manager), "company" for the org-user provider.
    userType?: "admin" | "company";
    subscription?: {
      plan: string;
      isActive: boolean;
      stripeCustomerId?: string;
      endDate?: Date;
      startDate?: Date;
    };
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    email?: string;
    companyName?: string;
    companyType?: string;
    website?: string;
    avatar?: string;
    accessToken?: string;
    has_paid_subscription?: boolean;
    googleId?: string;
    role?: string;
    userType?: "admin" | "company";
    subscription?: {
      plan: string;
      isActive: boolean;
      stripeCustomerId?: string;
      endDate?: Date;
      startDate?: Date;
    };
  }
}
