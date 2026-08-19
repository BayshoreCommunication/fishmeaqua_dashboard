"use client";

import {
  MyProfile,
  Staff,
  StaffRole,
  createStaffAction,
  deleteStaffAction,
  getMyProfileAction,
  listStaffAction,
  updateStaffAction,
} from "@/app/actions/staff";
import Pagination from "@/components/shared/Pagination";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  BiPencil,
  BiPlus,
  BiShieldQuarter,
  BiTrash,
  BiUser,
  BiX,
} from "react-icons/bi";

const PAGE_SIZE = 10;

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10";
const labelClass =
  "text-xs font-semibold uppercase tracking-wider text-gray-500";

const ROLE_CREATE_ORDER: StaffRole[] = ["manager", "admin", "superadmin"];

function roleBadgeClass(role: StaffRole) {
  if (role === "superadmin") return "bg-purple-50 text-purple-700";
  if (role === "admin") return "bg-blue-50 text-blue-700";
  return "bg-gray-100 text-gray-700";
}

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: StaffRole;
};

const emptyForm = (defaultRole: StaffRole): FormState => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  role: defaultRole,
});

const RolesPermissionsView = () => {
  const [me, setMe] = useState<MyProfile | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm("manager"));
  const [submitting, setSubmitting] = useState(false);

  const assignableRoles = useMemo<StaffRole[]>(() => {
    if (!me) return [];
    if (me.role === "superadmin") return ROLE_CREATE_ORDER;
    if (me.role === "admin") return ["manager"];
    return [];
  }, [me]);

  const load = useCallback(async () => {
    setLoading(true);
    const [meRes, staffRes] = await Promise.all([
      getMyProfileAction(),
      listStaffAction(),
    ]);

    if (meRes.ok && meRes.data) setMe(meRes.data);

    if (staffRes.ok && staffRes.data) {
      setStaff(staffRes.data);
      setPermissionError(null);
    } else {
      setPermissionError(
        staffRes.error || "You don't have permission to manage staff accounts.",
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // The signed-in account manages others here — its own row belongs in
  // General settings, not this list.
  const otherStaff = useMemo(
    () => staff.filter((s) => s._id !== me?._id),
    [staff, me],
  );

  const totalPages = Math.max(1, Math.ceil(otherStaff.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedStaff = useMemo(
    () => otherStaff.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [otherStaff, currentPage],
  );

  const openCreateModal = () => {
    setEditingStaff(null);
    setForm(emptyForm(assignableRoles[0] || "manager"));
    setShowModal(true);
  };

  const openEditModal = (member: Staff) => {
    setEditingStaff(member);
    setForm({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email || "",
      phone: member.phone || "",
      password: "",
      role: member.role,
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingStaff) {
        const res = await updateStaffAction(editingStaff._id, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email || undefined,
          phone: form.phone || undefined,
          role: form.role,
        });
        if (res.ok) {
          toast.success("Staff member updated");
          closeModal();
          load();
        } else {
          toast.error(res.fieldErrors?.join(" ") || res.error || "Failed to update staff member");
        }
      } else {
        if (!form.email && !form.phone) {
          toast.error("Provide an email or phone number");
          setSubmitting(false);
          return;
        }
        const res = await createStaffAction({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email || undefined,
          phone: form.phone || undefined,
          password: form.password,
          role: form.role,
        });
        if (res.ok) {
          toast.success("Staff member created");
          closeModal();
          load();
        } else {
          toast.error(res.fieldErrors?.join(" ") || res.error || "Failed to create staff member");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (member: Staff) => {
    if (
      !confirm(
        `Remove "${member.firstName} ${member.lastName}"? This cannot be undone.`,
      )
    )
      return;

    const res = await deleteStaffAction(member._id);
    if (res.ok) {
      setStaff((prev) => prev.filter((s) => s._id !== member._id));
      toast.success("Staff member removed");
    } else {
      toast.error(res.error || "Failed to remove staff member");
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Roles &amp; Permissions
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage who can access this dashboard and what they can do
            </p>
          </div>
          {assignableRoles.length > 0 && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/90 transition-colors"
            >
              <BiPlus size={18} />
              Add Staff
            </button>
          )}
        </div>

        {!loading && assignableRoles.length === 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <BiShieldQuarter size={18} />
            {permissionError ||
              "Only an admin or super admin can manage staff accounts."}
          </div>
        )}

        {!loading && me?.role === "admin" && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <BiShieldQuarter size={18} />
            As an admin, you can create and manage manager accounts only.
          </div>
        )}
      </div>

      {/* Staff table */}
      {assignableRoles.length > 0 && (
        <div className="rounded border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role
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
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <div className="h-4 w-32 bg-gray-100 animate-pulse rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-40 bg-gray-100 animate-pulse rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-20 bg-gray-100 animate-pulse rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gray-100 animate-pulse rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-12 bg-gray-100 animate-pulse rounded ml-auto"></div>
                        </td>
                      </tr>
                    ))
                  : paginatedStaff.map((member) => {
                      const canManage = assignableRoles.includes(member.role);
                      return (
                        <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">
                              {member.email || member.phone || "—"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${roleBadgeClass(member.role)}`}
                            >
                              {member.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(member.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {canManage ? (
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  onClick={() => openEditModal(member)}
                                  className="text-gray-500 hover:text-gray-900 transition-colors p-1"
                                  title="Edit staff member"
                                >
                                  <BiPencil size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(member)}
                                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                                  title="Remove staff member"
                                >
                                  <BiTrash size={18} />
                                </button>
                              </div>
                            ) : (
                              <span
                                className="text-xs text-gray-400"
                                title="You don't have permission to manage this role"
                              >
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

          {!loading && otherStaff.length === 0 && (
            <div className="text-center py-20 bg-white">
              <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <BiUser size={32} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No staff accounts yet
              </h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Staff accounts you create will appear here.
              </p>
            </div>
          )}

          {!loading && otherStaff.length > 0 && totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Create / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingStaff ? "Edit Staff Member" : "Add Staff Member"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <BiX size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={labelClass}>First Name</label>
                  <input
                    required
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Last Name</label>
                  <input
                    required
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className={inputClass}
                  placeholder="Email or phone is required"
                />
              </div>

              {!editingStaff && (
                <div className="space-y-1.5">
                  <label className={labelClass}>Password</label>
                  <input
                    required
                    type="password"
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className={labelClass}>Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as StaffRole }))}
                  className={inputClass}
                >
                  {assignableRoles.map((role) => (
                    <option key={role} value={role} className="capitalize">
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-60"
                >
                  {submitting ? "Saving…" : editingStaff ? "Save Changes" : "Create Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissionsView;
