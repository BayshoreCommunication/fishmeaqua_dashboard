"use client";

import {
  getDashboardOverviewAction,
  type DashboardOverviewData,
  type DashboardPeriod,
  type DashboardProduct,
} from "@/app/actions/dashboard";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BiCheckCircle,
  BiChevronRight,
  BiDollarCircle,
  BiPackage,
  BiRefresh,
  BiReceipt,
  BiTimeFive,
  BiXCircle,
} from "react-icons/bi";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const currency = (value: number) => `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

const periodOptions: Array<{ value: DashboardPeriod; label: string; description: string }> = [
  { value: "today", label: "Today", description: "Hourly performance for today" },
  { value: "last-7-days", label: "Last 7 days", description: "Daily performance over the last 7 days" },
  { value: "last-30-days", label: "Last 30 days", description: "Daily performance over the last 30 days" },
  { value: "this-month", label: "This month", description: "Daily performance for the current month" },
  { value: "last-3-months", label: "Last 3 months", description: "Monthly performance over the last 3 months" },
  { value: "last-6-months", label: "Last 6 months", description: "Monthly performance over the last 6 months" },
  { value: "this-year", label: "This year", description: "Monthly sales performance for the current year" },
  { value: "last-year", label: "Last year", description: "Monthly sales performance for last year" },
];

const DashboardDetailsView = () => {
  const [period, setPeriod] = useState<DashboardPeriod>("this-year");
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    const response = await getDashboardOverviewAction(period);
    if (response.ok && response.data) setData(response.data);
    else {
      setData(null);
      setError(response.error || "Could not load dashboard data.");
    }
    setLoading(false);
  }, [period]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadDashboard(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadDashboard]);

  const selectedPeriod = periodOptions.find((option) => option.value === period)!;

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-gray-50">
      <header className="rounded border border-gray-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1><p className="mt-1 text-sm text-gray-500">Track orders, revenue, and product performance at a glance</p></div>
          <div className="flex items-center gap-2">
            <select value={period} onChange={(event) => setPeriod(event.target.value as DashboardPeriod)} disabled={loading} className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60">
              {periodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <button type="button" onClick={() => void loadDashboard()} disabled={loading} aria-label="Refresh dashboard" className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"><BiRefresh className={loading ? "animate-spin" : ""} size={18} /></button>
          </div>
        </div>
      </header>

      {loading ? <DashboardSkeleton /> : error || !data ? <DashboardError message={error} retry={loadDashboard} /> : <DashboardContent data={data} description={selectedPeriod.description} />}
    </div>
  );
};

const DashboardContent = ({ data, description }: { data: DashboardOverviewData; description: string }) => {
  const { totals, changes } = data;
  const stats = [
    { title: "All Orders", value: totals.allOrders.toLocaleString("en-BD"), change: changes.orders, icon: <BiReceipt />, color: "bg-primary/10 text-primary-dark" },
    { title: "Delivered", value: totals.delivered.toLocaleString("en-BD"), change: changes.delivered, icon: <BiCheckCircle />, color: "bg-green-50 text-green-600" },
    { title: "Pending", value: totals.pending.toLocaleString("en-BD"), change: changes.pending, icon: <BiTimeFive />, color: "bg-amber-50 text-amber-600" },
    { title: "Cancelled", value: totals.cancelled.toLocaleString("en-BD"), change: changes.cancelled, icon: <BiXCircle />, color: "bg-red-50 text-red-600" },
    { title: "Total Revenue", value: currency(totals.revenue), change: changes.revenue, icon: <BiDollarCircle />, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <>
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <article key={stat.title} className="rounded border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
            <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-gray-600">{stat.title}</p><span className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl ${stat.color}`}>{stat.icon}</span></div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900">{stat.value}</p>
            <p className={`mt-2 text-xs font-medium ${stat.change > 0 ? "text-green-600" : stat.change < 0 ? "text-red-500" : "text-gray-400"}`}>{changeLabel(stat.change)}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
        <article className="min-w-0 rounded border border-gray-200 bg-white p-5 sm:p-6">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div><h2 className="text-base font-bold text-gray-900">Order &amp; Revenue Overview</h2><p className="mt-1 text-xs text-gray-500">{description}</p></div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500"><LegendDot color="bg-primary" label="Revenue" /><LegendDot color="bg-blue-500" label="Orders" /><LegendDot color="bg-green-500" label="Delivered" /></div>
          </div>
          {data.chart.length ? (
            <div className="h-[390px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart key={data.period} data={data.chart} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00a889" stopOpacity={0.22} /><stop offset="95%" stopColor="#00a889" stopOpacity={0.01} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={18} tick={{ fill: "#9ca3af", fontSize: 11 }} dy={10} />
                  <YAxis yAxisId="revenue" axisLine={false} tickLine={false} width={58} tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(value) => `৳${Number(value) / 1000}k`} />
                  <YAxis yAxisId="orders" orientation="right" axisLine={false} tickLine={false} width={35} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area yAxisId="revenue" type="monotone" dataKey="revenue" name="Revenue" stroke="#00a889" strokeWidth={2.5} fill="url(#revenueFill)" activeDot={{ r: 5 }} />
                  <Line yAxisId="orders" type="monotone" dataKey="orders" name="Orders" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line yAxisId="orders" type="monotone" dataKey="delivered" name="Delivered" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 4" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyChart />}
          <div className="mt-5 grid grid-cols-1 gap-3 border-t border-gray-100 pt-5 sm:grid-cols-3">
            <MiniMetric label="Average order value" value={currency(totals.averageOrderValue)} />
            <MiniMetric label="Best performing period" value={data.bestPerformingPeriod.label || "No data"} />
            <MiniMetric label="Delivery success" value={`${totals.deliverySuccessRate}%`} />
          </div>
        </article>
        <BestSellingProducts products={data.bestSellingProducts} />
      </section>
    </>
  );
};

const BestSellingProducts = ({ products }: { products: DashboardProduct[] }) => (
  <article className="overflow-hidden rounded border border-gray-200 bg-white">
    <div className="flex items-center justify-between border-b border-gray-200 px-5 py-5"><div><h2 className="text-base font-bold text-gray-900">Best Selling Products</h2><p className="mt-1 text-xs text-gray-500">Ranked by units sold</p></div><Link href="/products" className="inline-flex items-center gap-1 text-xs font-semibold text-primary-dark hover:text-primary">View all <BiChevronRight /></Link></div>
    {products.length ? <div className="divide-y divide-gray-100">{products.map((product, index) => <div key={String(product.productId)} className="flex items-center gap-3 px-5 py-4 transition hover:bg-gray-50"><span className="w-5 shrink-0 text-center text-xs font-bold text-gray-400">{index + 1}</span>{product.image ? <span className="h-11 w-11 shrink-0 rounded-lg bg-gray-100 bg-cover bg-center" style={{ backgroundImage: `url("${product.image}")` }} /> : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xl text-primary-dark"><BiPackage /></span>}<div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-gray-800">{product.title}</p><p className="mt-1 truncate text-[11px] text-gray-400">{product.category?.name || product.sku} · {product.stock} in stock</p></div><div className="shrink-0 text-right"><p className="text-sm font-bold text-gray-900">{product.sold}</p><p className="text-[10px] text-gray-400">sold</p></div></div>)}</div> : <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center"><BiPackage className="text-gray-300" size={36} /><p className="mt-3 text-sm font-semibold text-gray-700">No product sales</p><p className="mt-1 text-xs text-gray-400">No non-cancelled orders in this period.</p></div>}
    <div className="border-t border-gray-100 bg-gray-50 px-5 py-4"><div className="flex items-center justify-between text-xs"><span className="text-gray-500">Top products revenue</span><span className="font-bold text-gray-900">{currency(products.reduce((sum, product) => sum + product.revenue, 0))}</span></div></div>
  </article>
);

const DashboardSkeleton = () => <div className="space-y-6" aria-label="Loading dashboard" aria-busy="true"><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="animate-pulse rounded border border-gray-200 bg-white p-5"><div className="flex justify-between"><span className="h-4 w-20 rounded bg-gray-200" /><span className="h-10 w-10 rounded-lg bg-gray-200" /></div><span className="mt-4 block h-7 w-24 rounded bg-gray-200" /><span className="mt-3 block h-3 w-32 rounded bg-gray-200" /></div>)}</div><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]"><div className="animate-pulse rounded border border-gray-200 bg-white p-6"><span className="block h-4 w-48 rounded bg-gray-200" /><span className="mt-3 block h-3 w-64 rounded bg-gray-200" /><div className="mt-8 flex h-[390px] items-end gap-3">{Array.from({ length: 12 }).map((_, index) => <span key={index} className="flex-1 rounded-t bg-gray-200" style={{ height: `${25 + ((index * 19) % 65)}%` }} />)}</div></div><div className="overflow-hidden rounded border border-gray-200 bg-white"><div className="border-b border-gray-200 p-5"><span className="block h-4 w-40 rounded bg-gray-200" /></div>{Array.from({ length: 5 }).map((_, index) => <div key={index} className="flex animate-pulse items-center gap-3 border-b border-gray-100 p-4"><span className="h-11 w-11 rounded-lg bg-gray-200" /><div className="flex-1"><span className="block h-3.5 w-3/4 rounded bg-gray-200" /><span className="mt-2 block h-3 w-1/2 rounded bg-gray-200" /></div></div>)}</div></div></div>;

const DashboardError = ({ message, retry }: { message: string; retry: () => Promise<void> }) => <div className="rounded border border-red-100 bg-white py-20 text-center"><BiXCircle className="mx-auto text-red-300" size={42} /><h2 className="mt-4 font-semibold text-gray-900">Dashboard unavailable</h2><p className="mx-auto mt-1 max-w-md text-sm text-gray-500">{message}</p><button type="button" onClick={() => void retry()} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"><BiRefresh /> Try again</button></div>;
const EmptyChart = () => <div className="flex h-[390px] flex-col items-center justify-center rounded-lg bg-gray-50 text-gray-400"><BiReceipt size={36} /><p className="mt-3 text-sm">No orders in this period</p></div>;
const LegendDot = ({ color, label }: { color: string; label: string }) => <span className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${color}`} />{label}</span>;
const MiniMetric = ({ label, value }: { label: string; value: string }) => <div className="rounded-lg bg-gray-50 px-4 py-3"><p className="text-[11px] text-gray-500">{label}</p><p className="mt-1 text-sm font-bold text-gray-900">{value}</p></div>;
const changeLabel = (value: number) => value === 0 ? "No change vs previous period" : `${value > 0 ? "+" : ""}${value}% vs previous period`;

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return <div className="min-w-44 rounded-xl border border-gray-200 bg-white p-3 shadow-xl"><p className="mb-2 text-xs font-bold text-gray-900">{label}</p><div className="space-y-1.5">{payload.map((item) => <div key={item.name} className="flex items-center justify-between gap-5 text-xs"><span className="flex items-center gap-2 text-gray-500"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span><span className="font-semibold text-gray-800">{item.name === "Revenue" ? currency(item.value || 0) : item.value}</span></div>)}</div></div>;
};

export default DashboardDetailsView;
