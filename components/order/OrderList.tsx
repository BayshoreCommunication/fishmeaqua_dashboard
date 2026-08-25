"use client";

import {
  Order,
  OrderStatus,
  PaymentStatus,
  deleteOrderAction,
  listOrdersAction,
  updateOrderAction,
} from "@/app/actions/order";
import Pagination from "@/components/shared/Pagination";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  BiCheckCircle,
  BiPackage,
  BiPencil,
  BiPlus,
  BiReceipt,
  BiShow,
  BiSolidTruck,
  BiTimeFive,
  BiTrash,
} from "react-icons/bi";

const PAGE_SIZE = 10;

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const currency = (value: number) =>
  `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

function orderStatusBadgeClass(status: OrderStatus) {
  switch (status) {
    case "delivered":
      return "bg-green-50 text-green-700";
    case "shipped":
      return "bg-purple-50 text-purple-700";
    case "processing":
      return "bg-blue-50 text-blue-700";
    case "cancelled":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function paymentStatusBadgeClass(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return "bg-green-50 text-green-700";
    case "failed":
      return "bg-red-50 text-red-700";
    case "refunded":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const res = await listOrdersAction();
    if (res.ok && res.data) {
      setOrders(res.data.orders);
    } else {
      toast.error(res.error || "Failed to load orders");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedOrders = useMemo(
    () => orders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [orders, currentPage],
  );

  // Statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === "pending").length;
  const processingOrders = orders.filter(
    (o) => o.orderStatus === "processing" || o.orderStatus === "shipped",
  ).length;
  const deliveredOrders = orders.filter((o) => o.orderStatus === "delivered").length;

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders,
      subtitle: "All-time orders",
      icon: <BiReceipt size={20} />,
      color: "bg-primary/10",
      iconColor: "text-primary-dark",
    },
    {
      title: "Pending",
      value: pendingOrders,
      subtitle: "Awaiting processing",
      icon: <BiTimeFive size={20} />,
      color: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Processing",
      value: processingOrders,
      subtitle: "Being prepared or shipped",
      icon: <BiSolidTruck size={20} />,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Delivered",
      value: deliveredOrders,
      subtitle: "Completed orders",
      icon: <BiCheckCircle size={20} />,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
  ];

  const handleStatusChange = async (order: Order, orderStatus: OrderStatus) => {
    setUpdatingId(order._id);
    const res = await updateOrderAction(order._id, { orderStatus });
    if (res.ok && res.data) {
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? { ...o, orderStatus } : o)),
      );
      toast.success("Order status updated");
    } else {
      toast.error(res.error || "Failed to update order status");
    }
    setUpdatingId(null);
  };

  const handleDelete = async (order: Order) => {
    if (!confirm(`Delete order "${order.orderNumber}"? This cannot be undone.`))
      return;

    const res = await deleteOrderAction(order._id);
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o._id !== order._id));
      toast.success("Order deleted");
    } else {
      toast.error(res.error || "Failed to delete order");
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track and manage customer orders
            </p>
          </div>
          <Link
            href="/orders/add"
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/90 transition-colors"
          >
            <BiPlus size={18} />
            Add Order
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
              {loading ? (
                <span className="block h-8 w-16 bg-gray-100 animate-pulse rounded"></span>
              ) : (
                stat.value
              )}
            </p>
            <p className="text-xs text-gray-500">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="h-4 w-24 bg-gray-100 animate-pulse rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-32 bg-gray-100 animate-pulse rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-10 bg-gray-100 animate-pulse rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-16 bg-gray-100 animate-pulse rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-16 bg-gray-100 animate-pulse rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-20 bg-gray-100 animate-pulse rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-20 bg-gray-100 animate-pulse rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-12 bg-gray-100 animate-pulse rounded ml-auto"></div>
                      </td>
                    </tr>
                  ))
                : paginatedOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
                            {order.customerName}
                          </p>
                          <p className="text-xs text-gray-400 truncate max-w-[160px]">
                            {order.customerPhone}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <BiPackage size={16} className="text-gray-400" />
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {currency(order.total)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${paymentStatusBadgeClass(order.paymentStatus)}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.orderStatus}
                          disabled={updatingId === order._id}
                          onChange={(e) =>
                            handleStatusChange(order, e.target.value as OrderStatus)
                          }
                          className={`rounded-full border-0 px-3 py-1 text-xs font-medium capitalize focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 ${orderStatusBadgeClass(order.orderStatus)}`}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status} className="capitalize">
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/orders/${order._id}`}
                            className="text-gray-500 hover:text-gray-900 transition-colors p-1"
                            title="View order"
                          >
                            <BiShow size={18} />
                          </Link>
                          <Link
                            href={`/orders/edit/${order._id}`}
                            className="text-gray-500 hover:text-gray-900 transition-colors p-1"
                            title="Edit order"
                          >
                            <BiPencil size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(order)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                            title="Delete order"
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
        {!loading && orders.length === 0 && (
          <div className="text-center py-20 bg-white">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <BiReceipt size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No orders yet
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Orders placed by customers will appear here.
            </p>
          </div>
        )}

        {!loading && orders.length > 0 && totalPages > 1 && (
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

export default OrderList;
