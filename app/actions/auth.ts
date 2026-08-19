"use server";

import { auth, signIn, signOut } from "@/auth";

const API = `${process.env.NEXT_PUBLIC_API_URL || "https://api.bayshorecommunication.com"}/api/v1`;

// ── Types ─────────────────────────────────────────────────────────────────────

export type ActionResult = { success: boolean; message: string };
export type SigninResult = { ok: boolean; error?: string; redirectTo?: string };

// ── Sign out ──────────────────────────────────────────────────────────────────

export async function signoutAction(): Promise<void> {
  await signOut({ redirectTo: "/sign-in" });
}

// ── Staff auth (manager, admin, superadmin) ────────────────────────────────────
// Goes through the "admin-credentials" provider registered in auth.ts, which
// calls the backend's /api/v1/auth/staff/signin (rejects customer accounts).

export async function adminSigninAction(
  prevState: SigninResult,
  formData: FormData,
): Promise<SigninResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard";

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  try {
    await signIn("admin-credentials", {
      email,
      password,
      redirect: false,
    });
    return { ok: true, redirectTo: callbackUrl };
  } catch (error: any) {
    const msg: string = error?.message || "";
    if (
      msg.includes("CredentialsSignin") ||
      msg.includes("credentials") ||
      error?.type === "CredentialsSignin"
    ) {
      return { ok: false, error: "Invalid email or password." };
    }
    return { ok: false, error: "An error occurred. Please try again." };
  }
}

// ── Own admin profile (any signed-in staff member) ──────────────────────────────
// Full staff CRUD (list/create/update/delete other accounts) lives in
// app/actions/staff.ts, backed by the real /api/v1/users/staff endpoints.

export type AdminRole = "customer" | "manager" | "admin" | "superadmin";

export interface AdminAccount {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
}

interface AdminDataResponse<T = unknown> {
  ok: boolean;
  data?: T | null;
  error?: string;
}

async function getAdminAuthToken() {
  const session = await auth();
  return (session?.user as any)?.accessToken as string | undefined;
}

async function parseAdminError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.message === "string") return body.message;
  } catch {
    // ignore parse failure
  }
  return fallback;
}

export async function getMyAdminProfileAction(): Promise<AdminDataResponse<AdminAccount>> {
  const token = await getAdminAuthToken();
  if (!token) return { ok: false, error: "Not authenticated." };

  try {
    const res = await fetch(`${API}/users/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, error: await parseAdminError(res, "Failed to fetch profile.") };
    }
    const body = await res.json();
    return { ok: true, data: body.data as AdminAccount };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

