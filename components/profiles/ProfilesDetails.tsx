"use client";

import {
  getMyAdminProfileAction,
  signoutAction,
  type AdminAccount,
  type AdminRole,
} from "@/app/actions/auth";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { toast } from "react-hot-toast";
import {
  BiCalendar,
  BiEnvelope,
  BiIdCard,
  BiLogOut,
  BiRefresh,
  BiShieldQuarter,
} from "react-icons/bi";

const ROLE_LABEL: Record<AdminRole, string> = {
  customer: "Customer",
  superadmin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
};

const ROLE_BADGE: Record<AdminRole, string> = {
  customer: "bg-gray-100 text-gray-700",
  superadmin: "bg-purple-50 text-purple-700",
  admin: "bg-blue-50 text-blue-700",
  manager: "bg-gray-100 text-gray-700",
};

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 break-all">{value}</p>
      </div>
    </div>
  );
}

const ProfilesDetails = () => {
  const [admin, setAdmin] = useState<AdminAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getMyAdminProfileAction();
    if (res.ok && res.data) {
      setAdmin(res.data);
    } else {
      setError(res.error || "Failed to load profile");
      toast.error(res.error || "Failed to load profile");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signoutAction();
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse rounded border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-100" />
            <div className="space-y-2">
              <div className="h-5 w-40 rounded bg-gray-100" />
              <div className="h-4 w-56 rounded bg-gray-100" />
            </div>
          </div>
        </div>
        <div className="animate-pulse rounded border border-gray-200 bg-white p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 rounded bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (!admin) {
    return (
      <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
        <div className="rounded border border-gray-200 bg-white py-20 text-center">
          <p className="text-sm text-gray-500">
            {error || "Could not load your profile."}
          </p>
          <button
            onClick={fetchProfile}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <BiRefresh size={16} /> Try again
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${admin.firstName} ${admin.lastName}`.trim();

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-black text-xl font-bold text-white">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{fullName}</h1>
              <p className="text-sm text-gray-500">{admin.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${ROLE_BADGE[admin.role]}`}
            >
              {ROLE_LABEL[admin.role]}
            </span>
          </div>
        </div>
      </div>

      {/* Account details */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Account Details
          </h2>
          <button
            onClick={fetchProfile}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <BiRefresh size={14} /> Refresh
          </button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <InfoRow
            icon={<BiEnvelope size={16} />}
            label="Email"
            value={admin.email || "—"}
          />
          <InfoRow
            icon={<BiShieldQuarter size={16} />}
            label="Role"
            value={ROLE_LABEL[admin.role]}
          />
          <InfoRow icon={<BiIdCard size={16} />} label="Admin ID" value={admin.id} />
          <InfoRow
            icon={<BiCalendar size={16} />}
            label="Member Since"
            value={new Date(admin.createdAt).toLocaleString()}
          />
          <InfoRow
            icon={<BiCalendar size={16} />}
            label="Last Updated"
            value={new Date(admin.updatedAt).toLocaleString()}
          />
        </div>
      </div>

      {/* Session */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Session</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Sign out of your admin account on this device.
            </p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <BiLogOut size={16} />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilesDetails;
