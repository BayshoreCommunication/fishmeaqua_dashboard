"use client";

import type { AdminAccount } from "@/app/actions/auth";
import { BiCalendar, BiEnvelope, BiShield, BiUser } from "react-icons/bi";

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString();
}

function roleBadgeClass(role: AdminAccount["role"]) {
  if (role === "superadmin") return "bg-purple-100 text-purple-700";
  if (role === "manager") return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-700";
}

const StaffProfileView = ({ admin }: { admin: AdminAccount }) => {
  const fullName = `${admin.firstName} ${admin.lastName}`.trim();

  const stats = [
    {
      title: "Role",
      value: admin.role,
      icon: <BiShield size={20} />,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
      capitalize: true,
    },
    {
      title: "Member Since",
      value: new Date(admin.createdAt).toLocaleDateString(),
      icon: <BiCalendar size={20} />,
      color: "bg-orange-50",
      iconColor: "text-orange-500",
    },
  ];

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.title}
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
            <p
              className={`text-2xl font-bold text-gray-900 ${stat.capitalize ? "capitalize" : ""}`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Account Details */}
      <div className="rounded border border-gray-200 bg-white overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex items-center gap-2">
          <BiUser size={16} className="text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
            Account Details
          </h2>
        </div>

        <div className="p-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Name
            </p>
            <div className="text-sm font-medium text-gray-900">
              {fullName}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Email
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <BiEnvelope size={15} className="text-gray-400" />
              {admin.email || "—"}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Role
            </p>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${roleBadgeClass(admin.role)}`}
            >
              {admin.role}
            </span>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Account Created
            </p>
            <div className="text-sm font-medium text-gray-900">
              {formatDate(admin.createdAt)}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Last Updated
            </p>
            <div className="text-sm font-medium text-gray-900">
              {formatDate(admin.updatedAt)}
            </div>
          </div>
        </div>

        {admin.role !== "superadmin" && (
          <div className="border-t border-gray-100 px-6 py-4 text-xs text-gray-500">
            To change your password or details, ask a super admin to update
            your account from Settings.
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffProfileView;
