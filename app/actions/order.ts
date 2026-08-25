"use server";

import { auth } from "@/auth";

const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/v1`;

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod = "cod" | "bkash" | "nagad" | "card";

export interface OrderAddress {
  division?: string;
  district?: string;
  upazila?: string;
  postOffice?: string;
  postCode?: string;
  area?: string;
  zone?: "Inside Dhaka" | "Outside Dhaka";
}

export interface OrderItem {
  product: string;
  title: string;
  image: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress?: OrderAddress;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResult {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
}

interface OrderDataResponse<T = unknown> {
  ok: boolean;
  data?: T | null;
  error?: string;
  fieldErrors?: string[];
}

async function getAuthToken() {
  const session = await auth();
  return (session?.user as any)?.accessToken as string | undefined;
}

async function parseError(
  res: Response,
  fallback: string,
): Promise<{ message: string; errors?: string[] }> {
  try {
    const body = await res.json();
    return {
      message: typeof body?.message === "string" ? body.message : fallback,
      errors: Array.isArray(body?.errors) ? body.errors : undefined,
    };
  } catch {
    return { message: fallback };
  }
}

// ── List orders (manager/admin/superadmin only) ─────────────────────────────────

export async function listOrdersAction(
  params: ListOrdersParams = {},
): Promise<OrderDataResponse<OrderListResult>> {
  const token = await getAuthToken();
  if (!token) return { ok: false, error: "Not authenticated." };

  try {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.orderStatus) query.set("orderStatus", params.orderStatus);
    if (params.paymentStatus) query.set("paymentStatus", params.paymentStatus);
    if (params.search) query.set("search", params.search);

    const qs = query.toString();
    const res = await fetch(`${API}/orders${qs ? `?${qs}` : ""}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const { message } = await parseError(res, "Failed to fetch orders.");
      return { ok: false, error: message };
    }
    const body = await res.json();
    return { ok: true, data: body.data };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

// ── Get a single order (manager/admin/superadmin only) ──────────────────────────

export async function getOrderAction(
  idOrOrderNumber: string,
): Promise<OrderDataResponse<Order>> {
  const token = await getAuthToken();
  if (!token) return { ok: false, error: "Not authenticated." };

  try {
    const res = await fetch(`${API}/orders/${idOrOrderNumber}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const { message } = await parseError(res, "Failed to fetch order.");
      return { ok: false, error: message };
    }
    const body = await res.json();
    return { ok: true, data: body.data };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

// ── Create order (manager/admin/superadmin only) ─────────────────────────────────

export async function createOrderAction(data: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress?: OrderAddress;
  items: { product: string; quantity: number }[];
  deliveryFee?: number;
  discount?: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}): Promise<OrderDataResponse<Order>> {
  const token = await getAuthToken();
  if (!token) return { ok: false, error: "Not authenticated." };

  try {
    const res = await fetch(`${API}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const { message, errors } = await parseError(res, "Failed to create order.");
      return { ok: false, error: message, fieldErrors: errors };
    }
    const body = await res.json();
    return { ok: true, data: body.data };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

// ── Update an order (status/payment/notes, or customer info + address) ───────────

export async function updateOrderAction(
  id: string,
  data: {
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    notes?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    shippingAddress?: OrderAddress;
    items?: { product: string; quantity: number }[];
  },
): Promise<OrderDataResponse<Order>> {
  const token = await getAuthToken();
  if (!token) return { ok: false, error: "Not authenticated." };

  try {
    const res = await fetch(`${API}/orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const { message, errors } = await parseError(res, "Failed to update order.");
      return { ok: false, error: message, fieldErrors: errors };
    }
    const body = await res.json();
    return { ok: true, data: body.data };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

// ── Delete order (manager/admin/superadmin only) ──────────────────────────────────

export async function deleteOrderAction(id: string): Promise<OrderDataResponse<null>> {
  const token = await getAuthToken();
  if (!token) return { ok: false, error: "Not authenticated." };

  try {
    const res = await fetch(`${API}/orders/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const { message } = await parseError(res, "Failed to delete order.");
      return { ok: false, error: message };
    }
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
