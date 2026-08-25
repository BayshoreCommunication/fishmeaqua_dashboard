"use client";

import {
  Order,
  OrderStatus,
  PaymentStatus,
  deleteOrderAction,
  getOrderAction,
  updateOrderAction,
} from "@/app/actions/order";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { BiArrowBack, BiBox, BiTrash } from "react-icons/bi";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

const PAYMENT_METHOD_LABELS: Record<Order["paymentMethod"], string> = {
  cod: "Cash on Delivery",
  bkash: "bKash",
  nagad: "Nagad",
  card: "Card",
};

const labelClass =
  "text-xs font-semibold uppercase tracking-wider text-gray-500";
const selectClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10";

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

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const OrderDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(id ? null : "No order selected.");
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      const res = await getOrderAction(id);
      if (res.ok && res.data) {
        setOrder(res.data);
      } else {
        setError(res.error || "Order not found.");
      }
      setLoading(false);
    })();
  }, [id]);

  const handleStatusChange = async (orderStatus: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    const res = await updateOrderAction(order._id, { orderStatus });
    if (res.ok && res.data) {
      setOrder(res.data);
      toast.success("Order status updated");
    } else {
      toast.error(res.error || "Failed to update order status");
    }
    setUpdating(false);
  };

  const handlePaymentStatusChange = async (paymentStatus: PaymentStatus) => {
    if (!order) return;
    setUpdating(true);
    const res = await updateOrderAction(order._id, { paymentStatus });
    if (res.ok && res.data) {
      setOrder(res.data);
      toast.success("Payment status updated");
    } else {
      toast.error(res.error || "Failed to update payment status");
    }
    setUpdating(false);
  };

  const handleDelete = async () => {
    if (!order) return;
    if (!confirm(`Delete order "${order.orderNumber}"? This cannot be undone.`))
      return;

    setDeleting(true);
    const res = await deleteOrderAction(order._id);
    if (res.ok) {
      toast.success("Order deleted");
      router.push("/orders");
    } else {
      toast.error(res.error || "Failed to delete order");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
        <div className="rounded border border-gray-200 bg-white p-6">
          <div className="h-8 w-48 rounded bg-gray-100 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
          <div className="space-y-4 lg:col-span-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
        <div className="rounded border border-gray-200 bg-white py-20 text-center">
          <p className="text-sm text-gray-500">
            {error || "Could not load this order."}
          </p>
          <Link
            href="/orders"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <BiArrowBack size={16} /> Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const address = order.shippingAddress;
  const hasAddress =
    address &&
    (address.division ||
      address.district ||
      address.upazila ||
      address.postOffice ||
      address.postCode ||
      address.area ||
      address.zone);

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {order.orderNumber}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <BiArrowBack size={18} />
              Back to Orders
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              <BiTrash size={18} />
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Order Items
            </h3>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                      Price
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                      Qty
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                      Line Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {order.items.map((item, i) => (
                    <tr key={`${item.product}-${i}`}>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2.5">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              width={36}
                              height={36}
                              className="h-9 w-9 shrink-0 rounded-lg border border-gray-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                              <BiBox size={16} />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-400">{item.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {currency(item.price)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        {currency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {hasAddress && (
            <div className="rounded border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Shipping Address
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {address?.division && (
                  <div>
                    <p className={labelClass}>Division</p>
                    <p className="mt-0.5 text-sm text-gray-900">{address.division}</p>
                  </div>
                )}
                {address?.district && (
                  <div>
                    <p className={labelClass}>District</p>
                    <p className="mt-0.5 text-sm text-gray-900">{address.district}</p>
                  </div>
                )}
                {address?.upazila && (
                  <div>
                    <p className={labelClass}>Upazila / City Corp</p>
                    <p className="mt-0.5 text-sm text-gray-900">{address.upazila}</p>
                  </div>
                )}
                {address?.postOffice && (
                  <div>
                    <p className={labelClass}>Post Office / Thana</p>
                    <p className="mt-0.5 text-sm text-gray-900">
                      {address.postOffice}
                    </p>
                  </div>
                )}
                {address?.postCode && (
                  <div>
                    <p className={labelClass}>Post Code</p>
                    <p className="mt-0.5 text-sm text-gray-900">{address.postCode}</p>
                  </div>
                )}
                {address?.zone && (
                  <div>
                    <p className={labelClass}>Delivery Zone</p>
                    <p className="mt-0.5 text-sm text-gray-900">{address.zone}</p>
                  </div>
                )}
                {address?.area && (
                  <div className="col-span-2 sm:col-span-3">
                    <p className={labelClass}>Area / Street</p>
                    <p className="mt-0.5 text-sm text-gray-900">{address.area}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {order.notes && (
            <div className="rounded border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Notes
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Status
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Order Status</label>
                <select
                  value={order.orderStatus}
                  disabled={updating}
                  onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                  className={`${selectClass} capitalize ${orderStatusBadgeClass(order.orderStatus)}`}
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status} className="capitalize">
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Payment Status</label>
                <select
                  value={order.paymentStatus}
                  disabled={updating}
                  onChange={(e) =>
                    handlePaymentStatusChange(e.target.value as PaymentStatus)
                  }
                  className={`${selectClass} capitalize ${paymentStatusBadgeClass(order.paymentStatus)}`}
                >
                  {PAYMENT_STATUSES.map((status) => (
                    <option key={status} value={status} className="capitalize">
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Customer
            </h3>
            <div className="space-y-3">
              <div>
                <p className={labelClass}>Name</p>
                <p className="mt-0.5 text-sm text-gray-900">{order.customerName}</p>
              </div>
              <div>
                <p className={labelClass}>Phone</p>
                <p className="mt-0.5 text-sm text-gray-900">{order.customerPhone}</p>
              </div>
              {order.customerEmail && (
                <div>
                  <p className={labelClass}>Email</p>
                  <p className="mt-0.5 text-sm text-gray-900">
                    {order.customerEmail}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Payment &amp; Charges (BDT ৳)
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                </span>
              </div>
              <div className="space-y-2 border-t border-gray-100 pt-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{currency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>{currency(order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span>-{currency(order.discount)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>{currency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Timestamps
            </h3>
            <div className="space-y-3">
              <div>
                <p className={labelClass}>Created</p>
                <p className="mt-0.5 text-sm text-gray-900">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div>
                <p className={labelClass}>Last Updated</p>
                <p className="mt-0.5 text-sm text-gray-900">
                  {formatDate(order.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
