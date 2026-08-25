"use client";

import {
  Order,
  OrderAddress,
  OrderStatus,
  PaymentStatus,
  getOrderAction,
  updateOrderAction,
} from "@/app/actions/order";
import { Product, listProductsAction } from "@/app/actions/product";
import {
  getAllDivisions,
  getCityCorporationsByDistrict,
  getDistrictsByDivision,
  getThanasByCityCorporation,
  getUnionsByUpazila,
  getUpazilasByDistrict,
} from "bangladesh-geo-data";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { BiArrowBack, BiPackage, BiPlus, BiTrash } from "react-icons/bi";

const DELIVERY_ZONES = ["Inside Dhaka", "Outside Dhaka"] as const;

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

type OrderLineItem = {
  productId: string;
  title: string;
  sku: string;
  price: number;
  quantity: number;
};

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10";
const labelClass =
  "text-xs font-semibold uppercase tracking-wider text-gray-500";

const currency = (value: number) =>
  `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

const OrderEdit = () => {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(id ? null : "No order selected.");
  const [submitting, setSubmitting] = useState(false);

  const [orderStatus, setOrderStatus] = useState<OrderStatus>("pending");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [notes, setNotes] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [items, setItems] = useState<OrderLineItem[]>([]);

  const [divisionId, setDivisionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [upazilaId, setUpazilaId] = useState("");
  const [postOfficeId, setPostOfficeId] = useState("");
  const [postCode, setPostCode] = useState("");
  const [area, setArea] = useState("");
  const [zone, setZone] = useState("");
  // Dhaka city (zone === "Inside Dhaka") is addressed by City Corporation +
  // Thana rather than Upazila + Post Office — a separate branch of fields.
  const [cityCorpId, setCityCorpId] = useState("");
  const [thanaId, setThanaId] = useState("");

  const divisions = useMemo(() => getAllDivisions(), []);
  const districtOptions = divisionId ? getDistrictsByDivision(divisionId) : [];
  const upazilaOptions = districtId ? getUpazilasByDistrict(districtId) : [];
  const postOfficeOptions = upazilaId ? getUnionsByUpazila(upazilaId) : [];

  const divisionName = divisions.find((d) => d.id === divisionId)?.name || "";
  const districtName =
    districtOptions.find((d) => d.id === districtId)?.name || "";
  const upazilaName =
    upazilaOptions.find((u) => u.id === upazilaId)?.name || "";
  const postOfficeName =
    postOfficeOptions.find((u) => u.id === postOfficeId)?.postOffice || "";

  const isDhakaDivision = divisionName === "Dhaka";
  const dhakaDistrictId = isDhakaDivision
    ? districtOptions.find((d) => d.name === "Dhaka")?.id || ""
    : "";
  const cityCorpOptions = dhakaDistrictId
    ? getCityCorporationsByDistrict(dhakaDistrictId)
    : [];
  const thanaOptions = cityCorpId ? getThanasByCityCorporation(cityCorpId) : [];
  const cityCorpName =
    cityCorpOptions.find((c) => c.id === cityCorpId)?.name || "";
  const thanaName = thanaOptions.find((t) => t.id === thanaId)?.name || "";

  const isInsideDhaka = isDhakaDivision && zone === "Inside Dhaka";
  const effectiveDistrict = isInsideDhaka ? "Dhaka" : districtName;
  const effectiveUpazila = isInsideDhaka ? cityCorpName : upazilaName;
  const effectivePostOffice = isInsideDhaka ? thanaName : postOfficeName;

  const handleDivisionChange = (idValue: string) => {
    setDivisionId(idValue);
    setDistrictId("");
    setUpazilaId("");
    setPostOfficeId("");
    setPostCode("");
    setCityCorpId("");
    setThanaId("");
    const newDivisionName = divisions.find((d) => d.id === idValue)?.name || "";
    setZone(newDivisionName === "Dhaka" ? "" : "Outside Dhaka");
  };

  const handleZoneChange = (value: string) => {
    setZone(value);
    setDistrictId("");
    setUpazilaId("");
    setPostOfficeId("");
    setPostCode("");
    setCityCorpId("");
    setThanaId("");
  };

  const handleDistrictChange = (idValue: string) => {
    setDistrictId(idValue);
    setUpazilaId("");
    setPostOfficeId("");
    setPostCode("");
  };

  const handleUpazilaChange = (idValue: string) => {
    setUpazilaId(idValue);
    setPostOfficeId("");
    setPostCode("");
  };

  const handlePostOfficeChange = (idValue: string) => {
    setPostOfficeId(idValue);
    const selected = postOfficeOptions.find((u) => u.id === idValue);
    setPostCode(selected?.postalCode || "");
  };

  const handleCityCorpChange = (idValue: string) => {
    setCityCorpId(idValue);
    setThanaId("");
  };

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

  // Reverse-lookup the stored name strings back into the package's ids so
  // the cascading selects come up pre-filled to match the existing order.
  const initializeAddress = (address: OrderAddress | undefined) => {
    if (!address?.division) return;

    const div = divisions.find((d) => d.name === address.division);
    if (!div) return;
    setDivisionId(div.id);
    setArea(address.area || "");
    setPostCode(address.postCode || "");

    if (address.zone === "Inside Dhaka" && div.name === "Dhaka") {
      setZone("Inside Dhaka");
      const dhakaDist = getDistrictsByDivision(div.id).find(
        (d) => d.name === "Dhaka",
      );
      if (!dhakaDist) return;
      const cc = getCityCorporationsByDistrict(dhakaDist.id).find(
        (c) => c.name === address.upazila,
      );
      if (!cc) return;
      setCityCorpId(cc.id);
      const thana = getThanasByCityCorporation(cc.id).find(
        (t) => t.name === address.postOffice,
      );
      if (thana) setThanaId(thana.id);
      return;
    }

    setZone(address.zone || (div.name === "Dhaka" ? "" : "Outside Dhaka"));
    const dist = getDistrictsByDivision(div.id).find(
      (d) => d.name === address.district,
    );
    if (!dist) return;
    setDistrictId(dist.id);
    const upz = getUpazilasByDistrict(dist.id).find(
      (u) => u.name === address.upazila,
    );
    if (!upz) return;
    setUpazilaId(upz.id);
    const po = getUnionsByUpazila(upz.id).find(
      (u) => u.postOffice === address.postOffice,
    );
    if (po) setPostOfficeId(po.id);
  };

  useEffect(() => {
    (async () => {
      const res = await listProductsAction({ limit: 100 });
      if (res.ok && res.data) setProducts(res.data.products);
      setLoadingProducts(false);
    })();
  }, []);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      const res = await getOrderAction(id);
      if (res.ok && res.data) {
        setOrder(res.data);
        setOrderStatus(res.data.orderStatus);
        setPaymentStatus(res.data.paymentStatus);
        setNotes(res.data.notes || "");
        setCustomerName(res.data.customerName);
        setCustomerPhone(res.data.customerPhone);
        setCustomerEmail(res.data.customerEmail || "");
        initializeAddress(res.data.shippingAddress);
        setItems(
          res.data.items.map((i) => ({
            productId: i.product,
            title: i.title,
            sku: i.sku,
            price: i.price,
            quantity: i.quantity,
          })),
        );
      } else {
        setError(res.error || "Order not found.");
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );
  const liveTotal =
    subtotal + (order?.deliveryFee || 0) - (order?.discount || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Customer name and phone are required");
      return;
    }

    if (items.length === 0) {
      toast.error("Add at least one item to the order");
      return;
    }

    setSubmitting(true);
    const res = await updateOrderAction(order._id, {
      orderStatus,
      paymentStatus,
      notes: notes || undefined,
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      shippingAddress: {
        division: divisionName || undefined,
        district: effectiveDistrict || undefined,
        upazila: effectiveUpazila || undefined,
        postOffice: effectivePostOffice || undefined,
        postCode: postCode || undefined,
        area: area || undefined,
        zone: (zone || undefined) as "Inside Dhaka" | "Outside Dhaka" | undefined,
      },
      items: items.map((i) => ({ product: i.productId, quantity: i.quantity })),
    });

    if (res.ok) {
      toast.success("Order updated");
      router.push("/orders");
    } else {
      toast.error(res.fieldErrors?.join(" ") || res.error || "Failed to update order");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
        <div className="rounded border border-gray-200 bg-white p-6">
          <div className="h-8 w-48 rounded bg-gray-100 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="h-40 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-56 rounded-lg bg-gray-100 animate-pulse" />
          </div>
          <div className="space-y-4 lg:col-span-1">
            <div className="h-40 rounded-lg bg-gray-100 animate-pulse" />
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

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Order</h1>
            <p className="text-sm text-gray-500 mt-1">
              Update {order.orderNumber}&apos;s details
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
                    value={divisionId}
                    onChange={(e) => handleDivisionChange(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select division</option>
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {isDhakaDivision && (
                  <div className="space-y-1.5">
                    <label className={labelClass}>Delivery Zone</label>
                    <select
                      value={zone}
                      onChange={(e) => handleZoneChange(e.target.value)}
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
                )}

                {isInsideDhaka ? (
                  <>
                    <div className="space-y-1.5">
                      <label className={labelClass}>City Corporation</label>
                      <select
                        value={cityCorpId}
                        onChange={(e) => handleCityCorpChange(e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Select city corporation</option>
                        {cityCorpOptions.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Thana / Area</label>
                      <select
                        value={thanaId}
                        onChange={(e) => setThanaId(e.target.value)}
                        className={inputClass}
                        disabled={!cityCorpId}
                      >
                        <option value="">
                          {cityCorpId
                            ? "Select thana"
                            : "Select a city corporation first"}
                        </option>
                        {thanaOptions.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
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
                  </>
                ) : (
                  divisionId &&
                  (!isDhakaDivision || zone === "Outside Dhaka") && (
                    <>
                      <div className="space-y-1.5">
                        <label className={labelClass}>District</label>
                        <select
                          value={districtId}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                          className={inputClass}
                        >
                          <option value="">Select district</option>
                          {districtOptions.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Upazila</label>
                        <select
                          value={upazilaId}
                          onChange={(e) => handleUpazilaChange(e.target.value)}
                          className={inputClass}
                          disabled={!districtId}
                        >
                          <option value="">
                            {districtId
                              ? "Select upazila"
                              : "Select a district first"}
                          </option>
                          {upazilaOptions.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {upazilaId && (
                        <>
                          <div className="space-y-1.5">
                            <label className={labelClass}>Post Office</label>
                            <select
                              value={postOfficeId}
                              onChange={(e) =>
                                handlePostOfficeChange(e.target.value)
                              }
                              className={inputClass}
                            >
                              <option value="">Select post office</option>
                              {postOfficeOptions.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.postOffice}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className={labelClass}>Post Code</label>
                            <input
                              value={postCode}
                              onChange={(e) => setPostCode(e.target.value)}
                              className={inputClass}
                              placeholder="Auto-filled from post office"
                            />
                          </div>
                        </>
                      )}
                    </>
                  )
                )}

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
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Line Total</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {items.map((item) => (
                        <tr key={item.productId}>
                          <td className="px-4 py-2">
                            <p className="text-sm font-medium text-gray-900">{item.title}</p>
                            <p className="text-xs text-gray-400">{item.sku}</p>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">{currency(item.price)}</td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(item.productId, Number(e.target.value) || 1)
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
                  <p className="mt-2 text-sm text-gray-500">No items added yet</p>
                </div>
              )}
            </div>

            <div className="rounded border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Status
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className={labelClass}>Order Status</label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                    className={`${inputClass} capitalize`}
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
                    value={paymentStatus}
                    onChange={(e) =>
                      setPaymentStatus(e.target.value as PaymentStatus)
                    }
                    className={`${inputClass} capitalize`}
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
                Notes
              </h3>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`${inputClass} resize-none`}
                placeholder="Internal note about this order"
              />
            </div>
          </div>

          {/* Sidebar — read-only order context */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Order Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order #</span>
                  <span className="font-medium text-gray-900">
                    {order.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Items</span>
                  <span className="font-medium text-gray-900">
                    {items.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {currency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="font-medium text-gray-900">
                    {currency(order.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="font-medium text-gray-900">
                    -{currency(order.discount)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-gray-900">
                    {currency(liveTotal)}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-400">
                Delivery fee and discount aren&apos;t editable here.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OrderEdit;
