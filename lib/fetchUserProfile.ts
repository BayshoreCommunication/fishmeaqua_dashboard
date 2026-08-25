import type { UserFull } from "@/app/actions/user";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://fishmeaqua-backend.vercel.app";

// GET /api/user returns the caller's own company account and already filters
// is_active=true server-side, so a null return here means "no longer a
// valid, active company account" (deactivated, deleted, etc).
export async function fetchUserProfile(
  token: string,
): Promise<UserFull | null> {
  try {
    const res = await fetch(`${API_URL}/api/user`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return null;

    return (await res.json()) as UserFull;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}
