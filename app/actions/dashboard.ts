"use server";

import { auth } from "@/auth";

const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/v1`;

export type DashboardPeriod =
  | "today"
  | "last-7-days"
  | "last-30-days"
  | "this-month"
  | "last-3-months"
  | "last-6-months"
  | "this-year"
  | "last-year";

export interface DashboardChartPoint {
  key: string;
  label: string;
  orders: number;
  delivered: number;
  revenue: number;
}

export interface DashboardProduct {
  productId: string;
  title: string;
  sku: string;
  image?: string;
  category?: { name?: string };
  sold: number;
  revenue: number;
  stock: number;
}

export interface DashboardOverviewData {
  period: DashboardPeriod;
  range: { start: string; end: string; timezone: string };
  totals: {
    allOrders: number;
    delivered: number;
    pending: number;
    processing: number;
    shipped: number;
    cancelled: number;
    paidOrders: number;
    revenue: number;
    averageOrderValue: number;
    deliverySuccessRate: number;
    cancellationRate: number;
  };
  changes: {
    orders: number;
    delivered: number;
    pending: number;
    cancelled: number;
    revenue: number;
  };
  chart: DashboardChartPoint[];
  bestPerformingPeriod: DashboardChartPoint;
  bestSellingProducts: DashboardProduct[];
}

type DashboardActionResult = {
  ok: boolean;
  data?: DashboardOverviewData;
  error?: string;
};

export async function getDashboardOverviewAction(
  period: DashboardPeriod = "this-year",
): Promise<DashboardActionResult> {
  const session = await auth();
  const token = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  if (!token) return { ok: false, error: "Not authenticated." };

  try {
    const query = new URLSearchParams({ period });
    const response = await fetch(`${API}/dashboard?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const body = await response.json();
    if (!response.ok) {
      return {
        ok: false,
        error: typeof body?.message === "string" ? body.message : "Could not load dashboard data.",
      };
    }
    return { ok: true, data: body.data as DashboardOverviewData };
  } catch {
    return { ok: false, error: "Network error. Could not load dashboard data." };
  }
}
