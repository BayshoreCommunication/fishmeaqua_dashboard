"use client";

import {
  getCustomerAction,
  updateCustomerAction,
  type Customer,
  type CustomerStatus,
} from "@/app/actions/customer";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { BiArrowBack } from "react-icons/bi";
import { BD_DIVISIONS, DELIVERY_ZONES } from "./mockData";

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10";
const labelClass =
  "text-xs font-semibold uppercase tracking-wider text-gray-500";

const CustomerEdit = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [existing, setExisting] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [status, setStatus] = useState<CustomerStatus>("active");

  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  const [postOffice, setPostOffice] = useState("");
  const [postCode, setPostCode] = useState("");
  const [area, setArea] = useState("");
  const [zone, setZone] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      const response = await getCustomerAction(id);
      if (!response.ok || !response.data) {
        setLoadError(response.error || "Could not find this customer.");
        setLoading(false);
        return;
      }
      const customer = response.data;
      setExisting(customer);
      setFirstName(customer.firstName);
      setLastName(customer.lastName);
      setEmail(customer.email || "");
      setPhone(customer.phone || "");
      setCompanyName(customer.companyName || "");
      setStatus(customer.isActive ? "active" : "inactive");
      setDivision(customer.address?.division || "");
      setDistrict(customer.address?.district || "");
      setUpazila(customer.address?.upazila || "");
      setPostOffice(customer.address?.postOffice || "");
      setPostCode(customer.address?.postCode || "");
      setArea(customer.address?.area || "");
      setZone(customer.address?.zone || "");
      setLoading(false);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }
    if (!email.trim() && !phone.trim()) {
      toast.error("Provide an email or phone number");
      return;
    }

    if (!id) return;
    setSubmitting(true);
    const response = await updateCustomerAction(id, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      companyName: companyName.trim(),
      isActive: status === "active",
      address: {
        division: division || undefined,
        district: district.trim() || undefined,
        upazila: upazila.trim() || undefined,
        postOffice: postOffice.trim() || undefined,
        postCode: postCode.trim() || undefined,
        area: area.trim() || undefined,
        zone: (zone || undefined) as "Inside Dhaka" | "Outside Dhaka" | undefined,
      },
    });
    setSubmitting(false);
    if (!response.ok) {
      toast.error(response.fieldErrors?.[0] || response.error || "Failed to update customer");
      return;
    }
    toast.success("Customer updated");
    router.push("/customers");
  };

  if (loading) {
    return <div className="rounded border border-gray-200 bg-white py-24 text-center text-sm text-gray-500">Loading customer…</div>;
  }

  if (!existing) {
    return (
      <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
        <div className="rounded border border-gray-200 bg-white py-20 text-center">
          <p className="text-sm text-gray-500">
            {loadError || (id ? "Could not find this customer." : "No customer selected.")}
          </p>
          <Link
            href="/customers"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <BiArrowBack size={16} /> Back to Customers
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
            <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
            <p className="text-sm text-gray-500 mt-1">
              Update {existing.firstName} {existing.lastName}&apos;s details
            </p>
          </div>
          <Link
            href="/customers"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <BiArrowBack size={18} />
            Back to Customers
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
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Phone</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                    placeholder="+8801XXXXXXXXX"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className={labelClass}>Company Name</label>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={inputClass}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            <div className="rounded border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Address
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Status
              </h3>
              <div className="space-y-1.5">
                <label className={labelClass}>Account Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                  className={inputClass}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="rounded border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Order History
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Orders</span>
                  <span className="font-medium text-gray-900">
                    {existing.totalOrders}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Spent</span>
                  <span className="font-medium text-gray-900">
                    ৳{existing.totalSpent.toLocaleString("en-BD")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Joined</span>
                  <span className="font-medium text-gray-900">
                    {new Date(existing.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
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

export default CustomerEdit;
