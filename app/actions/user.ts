"use server";

import { auth } from "@/auth";

export interface UserProfile {
  id: string;
  name?: string;
  companyName?: string;
  companyType?: string;
  website?: string | null;
  avatar?: string | null;
  email?: string;
  role?: string;
}

export interface TrainData {
  history: Array<Record<string, unknown>>;
  score: number;
  last_updated?: string | null;
  update_count: number;
  update_limit: number;
  is_trained: boolean;
  entries_stored: number;
  pages_crawled: number;
  categories: string[];
  namespace?: string | null;
}

export interface UserFull {
  id: string;
  company_name: string;
  company_type: string;
  company_website?: string | null;
  phone_number?: string | null;
  email: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  is_subscribed: boolean;
  has_paid_subscription: boolean;
  subscription_type: string;
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
  vector_store_id?: string | null;
  train_data: TrainData;
  created_at: string;
  updated_at: string;
}

interface UserListPayload {
  users: UserFull[];
  total: number;
  page: number;
  page_size: number;
}

interface UserDataResponse<T = unknown> {
  error?: string;
  ok: boolean;
  data?: T | null;
  statusCode?: number;
}

async function getAuthContext() {
  const session = await auth();
  const token = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;
  const userId = session?.user?.id;

  return {
    apiUrl:
      process.env.NEXT_PUBLIC_API_URL ||
      "https://fishmeaqua-backend.vercel.app",
    token,
    userId,
  };
}

function authHeader(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function parseError(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.detail === "string") return body.detail;
    if (typeof body?.message === "string") return body.message;
    if (typeof body?.error === "string") return body.error;
  } catch {
    // ignore parse failure
  }
  return fallback;
}

export async function getUserData(): Promise<UserDataResponse<UserProfile>> {
  const { apiUrl, token } = await getAuthContext();

  if (!token) {
    return { ok: false, error: "User is not authenticated." };
  }
  if (!apiUrl) {
    return { ok: false, error: "API URL is not configured." };
  }

  try {
    const response = await fetch(`${apiUrl}/api/user`, {
      method: "GET",
      headers: authHeader(token),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        statusCode: response.status,
        error: await parseError(response, "Failed to fetch user profile."),
      };
    }

    const data = await response.json();
    return {
      ok: true,
      statusCode: response.status,
      data: (data?.payload?.user ?? null) as UserProfile | null,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      ok: false,
      error: "An unexpected error occurred. Please try again later.",
      data: null,
    };
  }
}

export async function getCurrentUserDetails(): Promise<
  UserDataResponse<UserFull>
> {
  const { apiUrl, token, userId } = await getAuthContext();

  if (!token || !userId) {
    return { ok: false, error: "User is not authenticated." };
  }
  if (!apiUrl) {
    return { ok: false, error: "API URL is not configured." };
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/users/${userId}`, {
      method: "GET",
      headers: authHeader(token),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        statusCode: response.status,
        error: await parseError(response, "Failed to fetch user details."),
      };
    }

    const data = (await response.json()) as UserFull;
    return {
      ok: true,
      statusCode: response.status,
      data,
    };
  } catch (error) {
    console.error("Error fetching user full details:", error);
    return {
      ok: false,
      error: "An unexpected error occurred. Please try again later.",
      data: null,
    };
  }
}

export async function getUserById(
  id: string,
): Promise<UserDataResponse<UserFull>> {
  const { apiUrl, token } = await getAuthContext();

  if (!token) {
    return { ok: false, error: "User is not authenticated." };
  }
  if (!apiUrl) {
    return { ok: false, error: "API URL is not configured." };
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/users/${id}`, {
      method: "GET",
      headers: authHeader(token),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        statusCode: response.status,
        error: await parseError(response, "Failed to fetch user details."),
      };
    }

    const data = (await response.json()) as UserFull;
    return {
      ok: true,
      statusCode: response.status,
      data,
    };
  } catch (error) {
    console.error("Error fetching user by id:", error);
    return {
      ok: false,
      error: "An unexpected error occurred. Please try again later.",
      data: null,
    };
  }
}

export async function updateUserData(updateData: {
  companyName?: string;
  companyType?: string;
  website?: string;
  avatar?: string;
}): Promise<UserDataResponse<UserProfile>> {
  const { apiUrl, token } = await getAuthContext();

  if (!token) {
    return { ok: false, error: "User is not authenticated." };
  }
  if (!apiUrl) {
    return { ok: false, error: "API URL is not configured." };
  }

  try {
    const response = await fetch(`${apiUrl}/api/user`, {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      return {
        ok: false,
        statusCode: response.status,
        error: await parseError(response, "Failed to update user profile."),
      };
    }

    const data = await response.json();
    return {
      ok: true,
      statusCode: response.status,
      data: (data?.payload?.user ?? null) as UserProfile | null,
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      ok: false,
      error: "An unexpected error occurred. Please try again later.",
      data: null,
    };
  }
}

export async function getAllUserData(
  page: number = 1,
  pageSize: number = 50,
): Promise<UserDataResponse<UserListPayload>> {
  const { apiUrl, token } = await getAuthContext();

  if (!token) {
    return { ok: false, error: "User is not authenticated." };
  }
  if (!apiUrl) {
    return { ok: false, error: "API URL is not configured." };
  }

  try {
    const query = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    }).toString();

    const response = await fetch(`${apiUrl}/api/v1/users?${query}`, {
      method: "GET",
      headers: authHeader(token),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        statusCode: response.status,
        error: await parseError(response, "Failed to fetch user list."),
      };
    }

    const data = (await response.json()) as UserListPayload;
    return {
      ok: true,
      statusCode: response.status,
      data,
    };
  } catch (error) {
    console.error("Error fetching users list:", error);
    return {
      ok: false,
      error: "An unexpected error occurred. Please try again later.",
      data: null,
    };
  }
}

export async function userDeletedById(
  id: string,
): Promise<UserDataResponse<null>> {
  const { apiUrl, token } = await getAuthContext();

  if (!token) {
    return { ok: false, error: "User is not authenticated.", data: null };
  }
  if (!apiUrl) {
    return { ok: false, error: "API URL is not configured.", data: null };
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/users/${id}`, {
      method: "DELETE",
      headers: authHeader(token),
    });

    if (!response.ok) {
      return {
        ok: false,
        statusCode: response.status,
        error: await parseError(response, "Failed to delete user."),
        data: null,
      };
    }

    return {
      ok: true,
      statusCode: response.status,
      data: null,
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      ok: false,
      error: "An unexpected error occurred. Please try again later.",
      data: null,
    };
  }
}

// Existing subscription actions kept as-is for compatibility.
export async function userSubscriptionByIds(
  userId: string,
  search: string = "52",
  page: number = 1,
  limit: number = 5,
  searchOption: string = "all",
): Promise<UserDataResponse> {
  const session = await auth();

  if (
    !session?.user ||
    !(session.user as { accessToken?: string }).accessToken
  ) {
    return { error: "User is not authenticated.", ok: false, data: null };
  }

  try {
    const token = (session.user as { accessToken?: string })
      .accessToken as string;
    const queryParams = new URLSearchParams({
      search,
      page: page.toString(),
      limit: limit.toString(),
      searchOption,
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "https://fishmeaqua-backend.vercel.app"}/api/subscription/${userId}?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        error: await parseError(response, "Failed to fetch subscription data."),
        ok: false,
        data: null,
      };
    }

    const data = await response.json();
    return { ok: true, data: data?.payload || null };
  } catch (error) {
    console.error("Error fetching subscription data:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
      ok: false,
      data: null,
    };
  }
}

export async function userSubscriptionById(
  userId: string,
  search: string = "",
  page: number = 1,
  limit: number = 10000,
): Promise<UserDataResponse> {
  const session = await auth();

  if (
    !session?.user ||
    !(session.user as { accessToken?: string }).accessToken
  ) {
    return { error: "User is not authenticated.", ok: false, data: null };
  }

  try {
    const token = (session.user as { accessToken?: string })
      .accessToken as string;
    const queryParams = new URLSearchParams({
      search,
      page: page.toString(),
      limit: limit.toString(),
    }).toString();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "https://fishmeaqua-backend.vercel.app"}/api/subscription/${userId}?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        error: await parseError(response, "Failed to fetch subscription data."),
        ok: false,
        data: null,
      };
    }

    const data = await response.json();
    return { ok: true, data: data?.payload || null };
  } catch (error) {
    console.error("Error fetching subscription data:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
      ok: false,
      data: null,
    };
  }
}

export async function getUserDataTest(
  headers: HeadersInit,
): Promise<UserDataResponse<UserProfile>> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "https://fishmeaqua-backend.vercel.app"}/api/user`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        ok: false,
        statusCode: response.status,
        error: await parseError(response, "Failed to fetch user profile."),
        data: null,
      };
    }

    const data = await response.json();
    return {
      ok: true,
      statusCode: response.status,
      data: (data?.payload?.user ?? null) as UserProfile | null,
    };
  } catch {
    return {
      ok: false,
      error: "An unexpected error occurred. Please try again later.",
      data: null,
    };
  }
}
