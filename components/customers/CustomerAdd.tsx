"use client";

import {
  createCustomerAction,
  type CustomerStatus,
} from "@/app/actions/customer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { BiArrowBack } from "react-icons/bi";
import { BD_DIVISIONS, DELIVERY_ZONES } from "./mockData";

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10";
const labelClass =
  "text-xs font-semibold uppercase tracking-wider text-gray-500";

const CustomerAdd = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<CustomerStatus>("active");

  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  const [postOffice, setPostOffice] = useState("");
  const [postCode, setPostCode] = useState("");
  const [area, setArea] = useState("");
  const [zone, setZone] = useState("");

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

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    const response = await createCustomerAction({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      companyName: companyName.trim() || undefined,
      password,
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
      toast.error(response.fieldErrors?.[0] || response.error || "Failed to create customer");
      return;
    }
    toast.success("Customer created");
    router.push("/customers");
  };

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Customer</h1>
            <p className="text-sm text-gray-500 mt-1">
              Add a new customer to your records
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
                <div className="space-y-1.5 sm:col-span-2">
                  <label className={labelClass}>
                    Temporary Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-gray-400">
                    Share this securely with the customer so they can sign in.
                  </p>
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create Customer"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CustomerAdd;
