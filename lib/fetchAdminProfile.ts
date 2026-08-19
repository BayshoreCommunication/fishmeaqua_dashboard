const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bayshorecommunication.com";

export interface AdminProfile {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: "customer" | "manager" | "admin" | "superadmin";
}

// GET /api/v1/users/me 401s if the JWT is invalid/expired or the account no
// longer exists (see backend's `protect` middleware) — a null return here
// means "no longer a valid session," same signal as fetchUserProfile
// returning null for a deactivated company account.
export async function fetchAdminProfile(token: string): Promise<AdminProfile | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/users/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const body = await res.json();
    return (body?.data ?? null) as AdminProfile | null;
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    return null;
  }
}
