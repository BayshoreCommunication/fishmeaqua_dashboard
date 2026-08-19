"use client";

import { createOrderAction, PaymentMethod } from "@/app/actions/order";
import { Product, listProductsAction } from "@/app/actions/product";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { BiArrowBack, BiPackage, BiPlus, BiTrash } from "react-icons/bi";

const BD_DIVISIONS = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
] as const;

const DELIVERY_ZONES = ["Inside Dhaka", "Outside Dhaka"] as const;

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cod", label: "Cash on Delivery" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "card", label: "Card" },
];

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10";
const labelClass =
  "text-xs font-semibold uppercase tracking-wider text-gray-500";

const currency = (value: number) =>
  `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

type OrderLineItem = {
  productId: string;
  title: string;
  sku: string;
  price: number;
  quantity: number;
};

const OrderAdd = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  const [postOffice, setPostOffice] = useState("");
  const [postCode, setPostCode] = useState("");
  const [area, setArea] = useState("");
  const [zone, setZone] = useState("");

  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [items, setItems] = useState<OrderLineItem[]>([]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    (async () => {
      const res = await listProductsAction({ limit: 100 });
      if (res.ok && res.data) setProducts(res.data.products);
      setLoadingProducts(false);
    })();
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const total = Math.max(
    0,
    subtotal + (Number(deliveryFee) || 0) - (Number(discount) || 0),
  );

  const handleAddItem = () => {
    const product = products.find((p) => p._id === selectedProductId);
    if (!product) {
      toast.error("Select a product to add");
      return;
    }
    if (selectedQuantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id
            ? { ...i, quantity: i.quantity + selectedQuantity }
            : i,
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          title: product.title,
          sku: product.sku,
          price: product.discountPrice ?? product.price,
          quantity: selectedQuantity,
        },
      ];
    });
    setSelectedProductId("");
    setSelectedQuantity(1);
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    );
  };

  const handleRemoveItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Customer name and phone are required");
      return;
    }
    if (items.length === 0) {
      toast.error("Add at least one item to the order");
      return;
    }

    setSubmitting(true);
    const res = await createOrderAction({
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      shippingAddress: {
        division: division || undefined,
        district: district || undefined,
        upazila: upazila || undefined,
        postOffice: postOffice || undefined,
        postCode: postCode || undefined,
        area: area || undefined,
        zone: (zone || undefined) as "Inside Dhaka" | "Outside Dhaka" | undefined,
      },
      items: items.map((i) => ({ product: i.productId, quantity: i.quantity })),
      deliveryFee: Number(deliveryFee) || 0,
      discount: Number(discount) || 0,
      paymentMethod,
      notes: notes || undefined,
    });

    if (res.ok) {
      toast.success("Order created");
      router.push("/orders");
    } else {
      toast.error(res.fieldErrors?.join(" ") || res.error || "Failed to create order");
    }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Order</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create a custom order manually (phone orders, walk-ins, etc.)
            </p>
          </div>
          <Link
            href="/orders"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <BiArrowBack size={18} />
            Back to Orders
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className={labelClass}>
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className={inputClass}
                    placeholder="+8801XXXXXXXXX"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="rounded border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Shipping Address
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className={labelClass}>Division</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select division</option>
                    {BD_DIVISIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Delivery Zone</label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select zone</option>
                    {DELIVERY_ZONES.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>District</label>
                  <input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Upazila</label>
                  <input
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Post Office</label>
                  <input
                    value={postOffice}
                    onChange={(e) => setPostOffice(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Post Code</label>
                  <input
                    value={postCode}
                    onChange={(e) => setPostCode(e.target.value)}
                    className={inputClass}
                    placeholder="4-digit"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className={labelClass}>Area / Street</label>
                  <input
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className={inputClass}
                    placeholder="House, road, sector..."
                  />
                </div>
              </div>
            </div>

            <div className="rounded border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Order Items
              </h3>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1.5">
                  <label className={labelClass}>Product</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className={inputClass}
                    disabled={loadingProducts}
                  >
                    <option value="">
                      {loadingProducts ? "Loading products…" : "Select a product"}
                    </option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title} — {p.sku} ({currency(p.discountPrice ?? p.price)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full space-y-1.5 sm:w-24">
                  <label className={labelClass}>Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(Number(e.target.value) || 1)}
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90 transition-colors sm:w-auto"
                >
                  <BiPlus size={18} />
                  Add
                </button>
              </div>

              {items.length > 0 ? (
                <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
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
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {items.map((item) => (
                        <tr key={item.productId}>
                          <td className="px-4 py-2">
                            <p className="text-sm font-medium text-gray-900">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-400">{item.sku}</p>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {currency(item.price)}
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.productId,
                                  Number(e.target.value) || 1,
                                )
                              }
                              className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-sm"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            {currency(item.price * item.quantity)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.productId)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                              title="Remove item"
                            >
                              <BiTrash size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-8 text-center">
                  <BiPackage size={28} className="text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">
                    No items added yet
                  </p>
                </div>
              )}
            </div>

            <div className="rounded border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Notes
              </h3>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`${inputClass} resize-none`}
                placeholder="Optional note about this order"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Payment
              </h3>
              <div className="space-y-1.5">
                <label className={labelClass}>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className={inputClass}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Charges (BDT ৳)
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>Delivery Fee</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Discount</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="rounded border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{currency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>{currency(Number(deliveryFee) || 0)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span>-{currency(Number(discount) || 0)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>{currency(total)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create Order"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OrderAdd;
