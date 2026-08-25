"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/v1`;

export type ReviewStatus = "pending" | "approved" | "rejected";
export type ReviewFilterStatus = "all" | ReviewStatus;

export interface ReviewAttachment {
  url: string;
  name: string;
  type: "image" | "pdf";
}

export interface ReviewCustomer {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface ReviewProduct {
  _id: string;
  title: string;
  slug: string;
  sku: string;
  featureImage?: string;
}

export interface ReviewOrder {
  _id: string;
  orderNumber: string;
}

export interface ReviewModerator {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Review {
  _id: string;
  order: ReviewOrder | null;
  product: ReviewProduct | null;
  customer: ReviewCustomer | null;
  rating: number;
  comment: string;
  attachments: ReviewAttachment[];
  status: ReviewStatus;
  moderationNote?: string;
  moderatedBy?: ReviewModerator;
  moderatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewListResult {
  reviews: Review[];
  summary: {
    total: number;
    statusCounts: Record<ReviewStatus, number>;
    averageRating: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

interface ReviewActionResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  fieldErrors?: string[];
}

async function getAuthToken() {
  const session = await auth();
  return (session?.user as { accessToken?: string } | undefined)?.accessToken;
}

async function parseError(
  response: Response,
  fallback: string,
): Promise<{ message: string; errors?: string[] }> {
  try {
    const body = await response.json();
    return {
      message: typeof body?.message === "string" ? body.message : fallback,
      errors: Array.isArray(body?.errors) ? body.errors : undefined,
    };
  } catch {
    return { message: fallback };
  }
}

export async function listReviewsAction(params: {
  status?: ReviewFilterStatus;
  page?: number;
  limit?: number;
} = {}): Promise<ReviewActionResponse<ReviewListResult>> {
  const token = await getAuthToken();
  if (!token) return { ok: false, error: "Not authenticated." };

  try {
    const query = new URLSearchParams();
    query.set("status", params.status ?? "all");
    query.set("page", String(params.page ?? 1));
    query.set("limit", String(params.limit ?? 10));

    const response = await fetch(`${API}/reviews/moderation?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) {
      const { message } = await parseError(response, "Failed to fetch reviews.");
      return { ok: false, error: message };
    }

    const body = await response.json();
    return { ok: true, data: body.data };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

export async function moderateReviewAction(
  id: string,
  input: { status: "approved" | "rejected"; moderationNote?: string },
): Promise<ReviewActionResponse<Review>> {
  const token = await getAuthToken();
  if (!token) return { ok: false, error: "Not authenticated." };

  try {
    const response = await fetch(`${API}/reviews/${id}/moderate`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const { message, errors } = await parseError(
        response,
        `Failed to ${input.status === "approved" ? "approve" : "reject"} review.`,
      );
      return { ok: false, error: message, fieldErrors: errors };
    }

    const body = await response.json();
    revalidatePath("/reviews");
    return { ok: true, data: body.data };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
