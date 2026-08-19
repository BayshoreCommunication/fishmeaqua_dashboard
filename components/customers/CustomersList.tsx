"use client";

import Pagination from "@/components/shared/Pagination";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  BiCheckCircle,
  BiPencil,
  BiPlus,
  BiTrash,
  BiUser,
  BiWallet,
  BiXCircle,
} from "react-icons/bi";
import { Customer, CustomerStatus, MOCK_CUSTOMERS } from "./mockData";

const PAGE_SIZE = 10;

const CUSTOMER_STATUSES: CustomerStatus[] = ["active", "inactive"];

const currency = (value: number) =>
  `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

function statusBadgeClass(status: CustomerStatus) {
  return status === "active"
    ? "bg-green-50 text-green-700"
    : "bg-red-50 text-red-700";
}

function initials(customer: Customer) {
  return `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase();
}

const CustomersList = () => {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(customers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedCustomers = useMemo(
    () => customers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [customers, currentPage],
  );

  // Statistics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "active").length;
  const inactiveCustomers = customers.filter((c) => c.status === "inactive").length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  const stats = [
    {
      title: "Total Customers",
      value: totalCustomers,
      subtitle: "All registered customers",
      icon: <BiUser size={20} />,
      color: "bg-primary/10",
      iconColor: "text-primary-dark",
    },
    {
      title: "Active",
      value: activeCustomers,
      subtitle: "Currently active accounts",
      icon: <BiCheckCircle size={20} />,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Inactive",
      value: inactiveCustomers,
      subtitle: "Dormant accounts",
      icon: <BiXCircle size={20} />,
      color: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      title: "Total Revenue",
      value: currency(totalRevenue),
      subtitle: "Lifetime, all customers",
      icon: <BiWallet size={20} />,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  const handleStatusChange = (customer: Customer, status: CustomerStatus) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customer.id ? { ...c, status } : c)),
    );
  };

  const handleDelete = (customer: Customer) => {
    if (
      !confirm(
        `Delete customer "${customer.firstName} ${customer.lastName}"? This cannot be undone.`,
      )
    )
      return;
    setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
    toast.success("Customer deleted");
  };

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage your customer base
            </p>
          </div>
          <Link
            href="/customers/add"
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/90 transition-colors"
          >
            <BiPlus size={18} />
            Add Customer
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded border border-gray-200 bg-white p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}
              >
                <span className={stat.iconColor}>{stat.icon}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-700">
                {stat.title}
              </h3>
            </div>
            <p className="mb-1 text-3xl font-bold text-gray-900">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Customers Table */}
      <div className="rounded border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary-dark">
                        {initials(customer)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
                          {customer.firstName} {customer.lastName}
                        </p>
                        {customer.companyName && (
                          <p className="text-xs text-gray-400 truncate max-w-[160px]">
                            {customer.companyName}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-700 truncate max-w-[160px]">
                      {customer.email}
                    </p>
                    <p className="text-xs text-gray-400">{customer.phone}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {customer.district || "—"}
                    </div>
                    <p className="text-xs text-gray-400">{customer.zone || ""}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {customer.totalOrders}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {currency(customer.totalSpent)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={customer.status}
                      onChange={(e) =>
                        handleStatusChange(
                          customer,
                          e.target.value as CustomerStatus,
                        )
                      }
                      className={`rounded-full border-0 px-3 py-1 text-xs font-medium capitalize focus:outline-none focus:ring-2 focus:ring-primary/20 ${statusBadgeClass(customer.status)}`}
                    >
                      {CUSTOMER_STATUSES.map((status) => (
                        <option key={status} value={status} className="capitalize">
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(customer.joinedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/customers/edit?id=${customer.id}`}
                        className="text-gray-500 hover:text-gray-900 transition-colors p-1"
                        title="Edit customer"
                      >
                        <BiPencil size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(customer)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Delete customer"
                      >
                        <BiTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {customers.length === 0 && (
          <div className="text-center py-20 bg-white">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <BiUser size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No customers yet
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Customers who sign up or place orders will appear here.
            </p>
          </div>
        )}

        {customers.length > 0 && totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersList;
