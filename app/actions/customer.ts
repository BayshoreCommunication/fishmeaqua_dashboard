"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/v1/customers`;

export type CustomerStatus = "active" | "inactive";

export interface CustomerAddress {
  division?: string;
  district?: string;
  upazila?: string;
  postOffice?: string;
  postCode?: string;
  area?: string;
  zone?: "Inside Dhaka" | "Outside Dhaka";
}

export interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  address?: CustomerAddress;
  isActive: boolean;
  role: "customer";
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListData {
  customers: Customer[];
  summary: {
    total: number;
    active: number;
    inactive: number;
    totalRevenue: number;
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

export interface CustomerInput {
  firstName: string;
  lastName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  password?: string;
  address?: CustomerAddress;
  isActive: boolean;
}

interface CustomerActionResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  fieldErrors?: string[];
}

async function token() {
  const session = await auth();
  return (session?.user as { accessToken?: string } | undefined)?.accessToken;
}

async function parseError(response: Response, fallback: string) {
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

export async function listCustomersAction(params: {
  page?: number;
  limit?: number;
  status?: "all" | CustomerStatus;
  search?: string;
} = {}): Promise<CustomerActionResult<CustomerListData>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: "Not authenticated." };

  try {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 10),
      status: params.status ?? "all",
    });
    if (params.search?.trim()) query.set("search", params.search.trim());
    const response = await fetch(`${API}?${query}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) {
      const { message } = await parseError(response, "Failed to fetch customers.");
      return { ok: false, error: message };
    }
    const body = await response.json();
    return { ok: true, data: body.data };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

export async function getCustomerAction(
  id: string,
): Promise<CustomerActionResult<Customer>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: "Not authenticated." };
  try {
    const response = await fetch(`${API}/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) {
      const { message } = await parseError(response, "Failed to fetch customer.");
      return { ok: false, error: message };
    }
    const body = await response.json();
    return { ok: true, data: body.data };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

export async function createCustomerAction(
  input: CustomerInput & { password: string },
): Promise<CustomerActionResult<Customer>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: "Not authenticated." };
  try {
    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const { message, errors } = await parseError(response, "Failed to create customer.");
      return { ok: false, error: message, fieldErrors: errors };
    }
    const body = await response.json();
    revalidatePath("/customers");
    return { ok: true, data: body.data };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

export async function updateCustomerAction(
  id: string,
  input: Partial<CustomerInput>,
): Promise<CustomerActionResult<Customer>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: "Not authenticated." };
  try {
    const response = await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const { message, errors } = await parseError(response, "Failed to update customer.");
      return { ok: false, error: message, fieldErrors: errors };
    }
    const body = await response.json();
    revalidatePath("/customers");
    return { ok: true, data: body.data };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

export async function deleteCustomerAction(
  id: string,
): Promise<CustomerActionResult<null>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: "Not authenticated." };
  try {
    const response = await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      const { message } = await parseError(response, "Failed to delete customer.");
      return { ok: false, error: message };
    }
    revalidatePath("/customers");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
