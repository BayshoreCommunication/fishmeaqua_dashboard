"use client";

import {
  deleteCustomerAction,
  listCustomersAction,
  updateCustomerAction,
  type Customer,
  type CustomerListData,
  type CustomerStatus,
} from "@/app/actions/customer";
import Pagination from "@/components/shared/Pagination";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  BiCheckCircle,
  BiLoaderAlt,
  BiPencil,
  BiPlus,
  BiSearch,
  BiShow,
  BiTrash,
  BiUser,
  BiWallet,
  BiXCircle,
} from "react-icons/bi";

const PAGE_SIZE = 10;
const emptySummary: CustomerListData["summary"] = {
  total: 0,
  active: 0,
  inactive: 0,
  totalRevenue: 0,
};

const currency = (value: number) =>
  `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

const initials = (customer: Customer) =>
  `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase();

const CustomerStatsSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="animate-pulse rounded border border-gray-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-10 w-10 rounded-lg bg-gray-200" />
          <span className="h-4 w-28 rounded bg-gray-200" />
        </div>
        <span className="block h-8 w-24 rounded bg-gray-200" />
        <span className="mt-2 block h-3 w-36 rounded bg-gray-100" />
      </div>
    ))}
  </div>
);

const CustomerTableSkeleton = () => (
  <div className="overflow-x-auto" role="status" aria-label="Loading customers" aria-busy="true">
    <table className="w-full min-w-[1050px]">
      <thead className="border-b border-gray-200 bg-gray-50">
        <tr>
          {["Customer", "Contact", "Location", "Orders", "Total spent", "Status", "Joined", "Action"].map((heading) => (
            <th key={heading} className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 ${heading === "Action" ? "text-right" : ""}`}>
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {Array.from({ length: 6 }).map((_, row) => (
          <tr key={row} className="animate-pulse">
            <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="h-9 w-9 rounded-full bg-gray-200" /><div className="space-y-2"><span className="block h-3.5 w-28 rounded bg-gray-200" /><span className="block h-3 w-20 rounded bg-gray-100" /></div></div></td>
            <td className="px-5 py-4"><div className="space-y-2"><span className="block h-3.5 w-36 rounded bg-gray-200" /><span className="block h-3 w-24 rounded bg-gray-100" /></div></td>
            <td className="px-5 py-4"><div className="space-y-2"><span className="block h-3.5 w-24 rounded bg-gray-200" /><span className="block h-3 w-20 rounded bg-gray-100" /></div></td>
            <td className="px-5 py-4"><span className="block h-4 w-8 rounded bg-gray-200" /></td>
            <td className="px-5 py-4"><span className="block h-4 w-20 rounded bg-gray-200" /></td>
            <td className="px-5 py-4"><span className="block h-7 w-20 rounded-full bg-gray-200" /></td>
            <td className="px-5 py-4"><span className="block h-4 w-24 rounded bg-gray-200" /></td>
            <td className="px-5 py-4"><div className="ml-auto flex w-fit gap-3"><span className="h-5 w-5 rounded bg-gray-200" /><span className="h-5 w-5 rounded bg-gray-200" /><span className="h-5 w-5 rounded bg-gray-200" /></div></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CustomersList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [summary, setSummary] = useState(emptySummary);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<"all" | CustomerStatus>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const response = await listCustomersAction({
      page,
      limit: PAGE_SIZE,
      status,
      search: debouncedSearch || undefined,
    });
    if (response.ok && response.data) {
      setCustomers(response.data.customers);
      setSummary(response.data.summary);
      setTotalPages(response.data.pagination.totalPages);
    } else {
      setCustomers([]);
      toast.error(response.error || "Failed to load customers");
    }
    setLoading(false);
  }, [debouncedSearch, page, status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchCustomers(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchCustomers]);

  const changeStatus = async (customer: Customer, nextStatus: CustomerStatus) => {
    setUpdatingId(customer._id);
    const response = await updateCustomerAction(customer._id, {
      isActive: nextStatus === "active",
    });
    if (response.ok) {
      toast.success(`Customer marked ${nextStatus}`);
      await fetchCustomers();
    } else {
      toast.error(response.error || "Failed to update customer status");
    }
    setUpdatingId(null);
  };

  const removeCustomer = async (customer: Customer) => {
    if (!confirm(`Delete customer "${customer.firstName} ${customer.lastName}"? This cannot be undone.`)) return;
    setUpdatingId(customer._id);
    const response = await deleteCustomerAction(customer._id);
    if (response.ok) {
      toast.success("Customer deleted");
      await fetchCustomers();
    } else {
      toast.error(response.error || "Failed to delete customer");
    }
    setUpdatingId(null);
  };

  const stats = [
    { title: "Total Customers", value: summary.total, subtitle: "All registered customers", icon: <BiUser size={20} />, color: "bg-primary/10", iconColor: "text-primary-dark" },
    { title: "Active", value: summary.active, subtitle: "Can access their account", icon: <BiCheckCircle size={20} />, color: "bg-green-50", iconColor: "text-green-600" },
    { title: "Inactive", value: summary.inactive, subtitle: "Account access blocked", icon: <BiXCircle size={20} />, color: "bg-red-50", iconColor: "text-red-600" },
    { title: "Total Revenue", value: currency(summary.totalRevenue), subtitle: "Paid customer orders", icon: <BiWallet size={20} />, color: "bg-purple-50", iconColor: "text-purple-600" },
  ];

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-gray-50">
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="mt-1 text-sm text-gray-500">View and manage registered customer accounts</p>
          </div>
          <Link href="/customers/add" className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/90">
            <BiPlus size={18} /> Add Customer
          </Link>
        </div>
      </div>

      {loading ? <CustomerStatsSkeleton /> : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="rounded border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <span className={stat.iconColor}>{stat.icon}</span>
              </div>
              <h2 className="text-sm font-medium text-gray-700">{stat.title}</h2>
            </div>
            <p className="mb-1 text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.subtitle}</p>
          </div>
        ))}
      </div>}

      <section className="overflow-hidden rounded border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <BiSearch className="absolute left-3 top-3 text-gray-400" size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, phone or company" className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </div>
          <select value={status} onChange={(event) => { setStatus(event.target.value as "all" | CustomerStatus); setPage(1); }} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10">
            <option value="all">All customers</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <CustomerTableSkeleton />
        ) : customers.length === 0 ? (
          <div className="py-20 text-center"><BiUser size={32} className="mx-auto text-gray-300" /><h3 className="mt-4 text-lg font-medium text-gray-900">No customers found</h3><p className="mt-1 text-sm text-gray-500">Try changing your search or status filter.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="border-b border-gray-200 bg-gray-50"><tr>{["Customer", "Contact", "Location", "Orders", "Total spent", "Status", "Joined", "Action"].map((heading) => <th key={heading} className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 ${heading === "Action" ? "text-right" : ""}`}>{heading}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => {
                  const customerStatus: CustomerStatus = customer.isActive ? "active" : "inactive";
                  const isUpdating = updatingId === customer._id;
                  return (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary-dark">{initials(customer)}</span><div><p className="max-w-44 truncate text-sm font-medium text-gray-900">{customer.firstName} {customer.lastName}</p>{customer.companyName && <p className="max-w-44 truncate text-xs text-gray-400">{customer.companyName}</p>}</div></div></td>
                      <td className="px-5 py-4"><p className="max-w-48 truncate text-sm text-gray-700">{customer.email || "—"}</p><p className="text-xs text-gray-400">{customer.phone || "—"}</p></td>
                      <td className="px-5 py-4"><p className="text-sm text-gray-700">{customer.address?.district || customer.address?.division || "—"}</p><p className="text-xs text-gray-400">{customer.address?.zone || ""}</p></td>
                      <td className="px-5 py-4 text-sm text-gray-700">{customer.totalOrders}</td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">{currency(customer.totalSpent)}</td>
                      <td className="px-5 py-4"><div className="relative w-fit"><select value={customerStatus} disabled={isUpdating} onChange={(event) => void changeStatus(customer, event.target.value as CustomerStatus)} className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-xs font-medium capitalize outline-none focus:ring-2 focus:ring-primary/20 ${customer.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}><option value="active">Active</option><option value="inactive">Inactive</option></select>{isUpdating && <BiLoaderAlt className="absolute -right-5 top-1.5 animate-spin text-gray-400" />}</div></td>
                      <td className="px-5 py-4 text-sm text-gray-500">{new Date(customer.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-3"><Link href={`/customers/${customer._id}`} className="p-1 text-gray-500 hover:text-primary-dark" title="View customer"><BiShow size={19} /></Link><Link href={`/customers/edit?id=${customer._id}`} className="p-1 text-gray-500 hover:text-gray-900" title="Edit customer"><BiPencil size={18} /></Link><button type="button" disabled={isUpdating} onClick={() => void removeCustomer(customer)} className="p-1 text-red-500 hover:text-red-700 disabled:opacity-40" title="Delete customer"><BiTrash size={18} /></button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && customers.length > 0 && totalPages > 1 && <div className="border-t border-gray-200 px-5 py-4"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>}
      </section>
    </div>
  );
};

export default CustomersList;
