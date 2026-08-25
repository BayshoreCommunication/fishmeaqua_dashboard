"use client";

import { getCustomerAction, type Customer } from "@/app/actions/customer";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  BiArrowBack,
  BiBriefcase,
  BiCalendar,
  BiCheckCircle,
  BiEnvelope,
  BiMap,
  BiPackage,
  BiPencil,
  BiPhone,
  BiUser,
  BiWallet,
  BiXCircle,
} from "react-icons/bi";

const currency = (value: number) =>
  `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const CustomerDetails = () => {
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      const response = await getCustomerAction(params.id);
      if (!response.ok || !response.data) {
        setError(response.error || "Could not find this customer.");
      } else {
        setCustomer(response.data);
      }
      setLoading(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-80 rounded border border-gray-200 bg-white py-28 text-center text-sm text-gray-500">
        Loading customer details…
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="rounded border border-gray-200 bg-white py-20 text-center">
        <BiUser className="mx-auto text-gray-300" size={38} />
        <h1 className="mt-4 text-lg font-semibold text-gray-900">Customer unavailable</h1>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <Link href="/customers" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">
          <BiArrowBack /> Back to customers
        </Link>
      </div>
    );
  }

  const fullName = `${customer.firstName} ${customer.lastName}`;
  const initials = `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase();
  const address = customer.address;

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-gray-50">
      <section className="rounded border border-gray-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary-dark">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${customer.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {customer.isActive ? <BiCheckCircle /> : <BiXCircle />}
                  {customer.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">Customer account overview</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/customers" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <BiArrowBack size={17} /> Back
            </Link>
            <Link href={`/customers/edit?id=${customer._id}`} className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90">
              <BiPencil size={17} /> Edit customer
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard icon={<BiPackage />} label="Total orders" value={customer.totalOrders.toLocaleString("en-BD")} tone="blue" />
        <StatCard icon={<BiWallet />} label="Total paid spending" value={currency(customer.totalSpent)} tone="purple" />
        <StatCard icon={<BiCalendar />} label="Customer since" value={formatDate(customer.createdAt)} tone="green" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <InfoCard title="Contact information" icon={<BiUser />}>
          <Detail icon={<BiUser />} label="Full name" value={fullName} />
          <Detail icon={<BiBriefcase />} label="Company" value={customer.companyName} />
          <Detail icon={<BiEnvelope />} label="Email address" value={customer.email} />
          <Detail icon={<BiPhone />} label="Phone number" value={customer.phone} />
        </InfoCard>

        <InfoCard title="Billing address" icon={<BiMap />}>
          <Detail label="Division" value={address?.division} />
          <Detail label="District / city corporation" value={address?.district} />
          <Detail label="Thana / area" value={address?.upazila} />
          <Detail label="Post office" value={address?.postOffice} />
          <Detail label="Post code" value={address?.postCode} />
          <Detail label="Street address" value={address?.area} />
          <Detail label="Delivery zone" value={address?.zone} />
        </InfoCard>
      </div>

      <section className="rounded border border-gray-200 bg-white p-5">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700"><BiCheckCircle size={19} /></span>
          <div><h2 className="text-sm font-semibold text-gray-900">Account details</h2><p className="text-xs text-gray-500">Customer access and record information</p></div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Detail label="Account status" value={customer.isActive ? "Active — access allowed" : "Inactive — access blocked"} />
          <Detail label="Last updated" value={formatDate(customer.updatedAt)} />
          <Detail label="Customer ID" value={customer._id} />
        </div>
      </section>
    </div>
  );
};

const InfoCard = ({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) => (
  <section className="rounded border border-gray-200 bg-white p-5">
    <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary-dark">{icon}</span>
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
  </section>
);

const Detail = ({ icon, label, value }: { icon?: ReactNode; label: string; value?: string }) => (
  <div className="flex gap-3">
    {icon && <span className="mt-0.5 text-gray-400">{icon}</span>}
    <div className="min-w-0"><p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p><p className="mt-1 break-words text-sm font-medium text-gray-800">{value || "Not provided"}</p></div>
  </div>
);

const StatCard = ({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: "blue" | "purple" | "green" }) => {
  const colors = { blue: "bg-blue-50 text-blue-600", purple: "bg-purple-50 text-purple-600", green: "bg-green-50 text-green-600" };
  return <section className="rounded border border-gray-200 bg-white p-5"><div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg text-xl ${colors[tone]}`}>{icon}</div><p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p><p className="mt-1 text-xl font-bold text-gray-900">{value}</p></section>;
};

export default CustomerDetails;
